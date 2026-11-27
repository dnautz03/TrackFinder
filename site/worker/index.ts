/**
 * Underset site Worker. Static pages come from ./dist (assets); this script only
 * answers /api/* for the live preview at /try/:
 *
 *   GET /api/artists?q=<name>           -> artist candidates (1001Tracklists artist search)
 *   GET /api/sets?q=<name>&page=<n>     -> one page of that DJ's sets (tracklist search)
 *
 * House rules, the same as the desktop app's:
 * - honest User-Agent, no browser disguise, no proxies;
 * - at most one request to 1001Tracklists every 8 seconds (robots.txt Crawl-delay: 8),
 *   for ALL visitors together: a Durable Object hands out the time slots;
 * - a human check (CAPTCHA / Turnstile / 206) is reported, never worked around;
 * - results are cached for an hour, and only real pages are cached.
 * Tracklist pages are never fetched: from a server they always ask for a human check.
 */
import { DurableObject } from 'cloudflare:workers'
import { tidy, MAX_PAGES } from '../src/lib/preview.ts'
import { BASE_URL, ParseError, isBlocked, looksReal, parseArtistSearch, parseSearchPages, parseSetSearch } from './parse.ts'

interface Env {
  ASSETS: Fetcher
  PACER: DurableObjectNamespace<Pacer>
}

const USER_AGENT = 'Underset/0.2.0 (web preview; +https://underset.dnautz.workers.dev/try/)'
const GAP_MS = 8000 // robots.txt Crawl-delay
const MAX_WAIT_MS = 24000 // more than 3 visitors ahead in the queue: answer "busy" instead of queueing
const CACHE_SECONDS = 3600
const SEARCH_URL = BASE_URL + 'search/result.php'

/** One instance for the whole site: the queue of request slots to 1001Tracklists. */
export class Pacer extends DurableObject {
  private next = 0

  /** Milliseconds to wait before this request may start, or null when the queue is too long. */
  reserve(): number | null {
    const now = Date.now()
    const slot = Math.max(now, this.next)
    if (slot - now > MAX_WAIT_MS) return null
    this.next = slot + GAP_MS
    return slot - now
  }
}

type Failure = 'bad_request' | 'busy' | 'blocked' | 'unreachable' | 'layout'
class ApiError extends Error {
  constructor(readonly code: Failure) {
    super(code)
  }
}
const STATUS: Record<Failure, number> = { bad_request: 400, busy: 429, blocked: 503, unreachable: 502, layout: 502 }

function json(body: unknown, status = 200, cache = false): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache ? `public, max-age=${CACHE_SECONDS}` : 'no-store',
      'x-content-type-options': 'nosniff',
    },
  })
}

/** POST the site's public search form, after waiting for our slot in the shared queue. */
async function search(env: Env, form: Record<string, string>): Promise<string> {
  const wait = await env.PACER.get(env.PACER.idFromName('1001tracklists')).reserve()
  if (wait === null) throw new ApiError('busy')
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  let res: Response
  try {
    res = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(form),
      signal: AbortSignal.timeout(30000),
    })
  } catch {
    throw new ApiError('unreachable')
  }
  const html = await res.text()
  if (isBlocked(res.status, html)) throw new ApiError('blocked')
  if (res.status !== 200) throw new ApiError('unreachable')
  if (!looksReal(html)) throw new ApiError('layout')
  return html
}

async function handle(url: URL, env: Env): Promise<unknown> {
  const q = tidy(url.searchParams.get('q') ?? '')
  if (!q || q.length > 80) throw new ApiError('bad_request')
  if (url.pathname === '/api/artists') {
    return { candidates: parseArtistSearch(await search(env, { main_search: q, search_selection: '1' })) }
  }
  if (url.pathname === '/api/sets') {
    const page = Number(url.searchParams.get('page') ?? '1')
    if (!Number.isInteger(page) || page < 1 || page > MAX_PAGES) throw new ApiError('bad_request')
    const form: Record<string, string> = { main_search: q, search_selection: '9' }
    if (page > 1) form.page = String(page)
    const html = await search(env, form)
    const [current, last] = parseSearchPages(html)
    return { sets: parseSetSearch(html), current, last }
  }
  throw new ApiError('bad_request')
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request)
    if (request.method !== 'GET') return json({ error: 'bad_request' }, 405)
    // Only the site's own pages may use the API (it is not a public proxy).
    const site = request.headers.get('sec-fetch-site')
    if (site && site !== 'same-origin') return json({ error: 'bad_request' }, 403)

    // Cache by route + normalised query, independent of the visitor's URL details.
    const key = new Request(
      `https://cache.underset${url.pathname}?q=${encodeURIComponent(tidy(url.searchParams.get('q') ?? '').toLowerCase())}&page=${url.searchParams.get('page') ?? '1'}`,
    )
    const cache = caches.default
    const hit = await cache.match(key)
    if (hit) return hit

    try {
      const body = await handle(url, env)
      const res = json(body, 200, true)
      ctx.waitUntil(cache.put(key, res.clone()))
      return res
    } catch (e) {
      const code: Failure = e instanceof ApiError ? e.code : e instanceof ParseError ? 'layout' : 'unreachable'
      if (!(e instanceof ApiError)) console.error('api error', e)
      return json({ error: code }, STATUS[code])
    }
  },
} satisfies ExportedHandler<Env>
