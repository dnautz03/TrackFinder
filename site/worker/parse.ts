/**
 * 1001Tracklists search pages, read the same way as the desktop app
 * (app/providers/tracklists1001.py: is_blocked, parse_artist_search, parse_source_page,
 * parse_search_pages). Only search results are read: tracklist pages always ask a
 * server for a human check, and that check is never worked around.
 */
import { parse, type HTMLElement } from 'node-html-parser'
import { tidy, type Candidate, type PreviewSet } from '../src/lib/preview.ts'

export const BASE_URL = 'https://www.1001tracklists.com/'

export class ParseError extends Error {}

/** A human-verification page (Cloudflare Turnstile or the site's own captcha) or a refusal. */
export function isBlocked(status: number, html: string): boolean {
  if ([206, 401, 403, 429].includes(status)) return true
  const lower = html.toLowerCase()
  const hasContent = lower.includes('tlpitem') || lower.includes('sdivtracklists') || lower.includes('id="pagetitle"')
  const challenge =
    lower.includes('turnstile') ||
    lower.includes('challenges.cloudflare.com') ||
    lower.includes('name="captcha"') ||
    lower.includes('real human')
  return challenge && !hasContent
}

/** A real content page (not a check page, not an empty shell). Only these are cached. */
export function looksReal(html: string): boolean {
  return !isBlocked(200, html) && (html.includes('id="pageTitle"') || html.includes('id="csMiddle"'))
}

const ARTIST_HREF = /\/artist\/([^/]+)\//
const TRACKLIST_PATH = /^\/tracklist\/([A-Za-z0-9]+)\//
const ISO_DATE = /\b(\d{4}-\d{2}-\d{2})\b/
const COUNTS = /(all|\d+)\s*\/\s*(\d+)/i
const PAGE_ONCLICK = /page:\s*(\d+)/

const text = (el: HTMLElement | null | undefined) => (el ? tidy(el.text) : '')

function parseCounts(value: string): [number | null, number | null] {
  const m = COUNTS.exec(value)
  if (!m) return [null, null]
  const total = Number(m[2])
  return [m[1].toLowerCase() === 'all' ? total : Number(m[1]), total]
}

/** Artist search result (search_selection=1). */
export function parseArtistSearch(html: string): Candidate[] {
  const middle = parse(html).querySelector('div#csMiddle')
  if (!middle) throw new ParseError('Unexpected artist search layout')
  const found: Candidate[] = []
  for (const item of middle.querySelectorAll('div.oItm')) {
    const link = item.querySelector('.bTitle a[href]')
    const m = link ? ARTIST_HREF.exec(link.getAttribute('href') ?? '') : null
    if (!link || !m) continue
    const counts: Record<'tracks' | 'tracklists', number> = { tracks: 0, tracklists: 0 }
    for (const badge of item.querySelectorAll('span.badge')) {
      const value = text(badge)
      if (!/^\d+$/.test(value)) continue
      const label = tidy(badge.nextSibling?.text ?? '').toLowerCase()
      counts[label.startsWith('tracklist') ? 'tracklists' : 'tracks'] = Number(value)
    }
    found.push({
      id: m[1],
      name: text(link),
      country: item.querySelector('.bTitle img.flag')?.getAttribute('title') ?? null,
      tracklists: counts.tracklists,
      tracks: counts.tracks,
    })
  }
  return found
}

/** (current page, highest page linked) from the search pagination. */
export function parseSearchPages(html: string): [number, number] {
  const pager = parse(html).querySelector('ul.pagination')
  if (!pager) return [1, 1]
  const active = text(pager.querySelector('li.active'))
  const current = /^\d+$/.test(active) ? Number(active) : 1
  const linked = pager
    .querySelectorAll('li')
    .map((li) => PAGE_ONCLICK.exec(li.getAttribute('onclick') ?? ''))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => Number(m[1]))
  return [current, Math.max(current, ...linked)]
}

/** Tracklist search result (search_selection=9): the sets, newest first. */
export function parseSetSearch(html: string): PreviewSet[] {
  const soup = parse(html)
  const container = soup.querySelector('div#sDivTracklists')
  if (!container) {
    if (soup.querySelector('div#csMiddle')) return [] // a search with no results
    throw new ParseError('Unexpected search layout (no tracklist list)')
  }
  const sets: PreviewSet[] = []
  for (const item of container.querySelectorAll('div.oItm')) {
    const link = item.querySelector('.bTitle a[href]')
    if (!link) continue
    const url = new URL(link.getAttribute('href') ?? '', BASE_URL)
    const id = item.getAttribute('data-id') || TRACKLIST_PATH.exec(url.pathname)?.[1] || ''
    const date = ISO_DATE.exec(text(item.querySelector('div[title="tracklist date"]')))?.[1] ?? null
    const [ided, total] = parseCounts(text(item.querySelector('div[title="IDed tracks / total tracks"]')))
    sets.push({ id, url: url.href, title: text(link), date, ided, total })
  }
  return sets
}
