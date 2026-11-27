/**
 * Rules of the live preview (/try/), ported from the desktop app's engine
 * (app/utils/text.py, app/services/pipeline.py, app/ui/start_page.py, app/ui/common.py).
 * Pure functions, shared by the page and the Worker. Dates are ISO strings (YYYY-MM-DD).
 */

export interface Candidate {
  id: string
  name: string
  country: string | null
  tracklists: number
  tracks: number
}

export interface PreviewSet {
  id: string
  url: string
  title: string
  date: string | null
  ided: number | null
  total: number | null
}

export type Preset = 'last30' | 'summer' | 'year' | 'custom'

// ---------------------------------------------------------------- text
const DASHES = /[‐-―−]/g
const SINGLE_QUOTES = /[‘’‚‛′´`]/g
const DOUBLE_QUOTES = /[“”„″]/g

/** normalize_punct + clean_spaces */
export function tidy(text: string): string {
  return text
    .replace(DASHES, '-')
    .replace(SINGLE_QUOTES, "'")
    .replace(DOUBLE_QUOTES, '"')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Case-, accent-, space- and quote-insensitive form, for comparing names (fold_name). */
export function foldName(text: string): string {
  return tidy(tidy(text).normalize('NFKD').replace(/\p{M}/gu, ''))
    .toLowerCase()
    .replace(/ß/g, 'ss')
}

const WORD = '[\\p{L}\\p{N}\\p{M}_]'
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** The folded name appears in the folded text, not glued to other letters (_name_in). */
export function nameIn(name: string, text: string): boolean {
  const re = new RegExp(`(?<!${WORD})${escapeRe(foldName(name))}(?!${WORD})`, 'u')
  return re.test(foldName(text))
}

/** 'Tiësto b2b Martin Garrix @ Ultra' -> 'Tiësto b2b Martin Garrix'. Titles lead with the DJs. */
export function titlePerformerPart(title: string): string {
  return title.split(/\s+(?:@|-)\s+/)[0]
}

// ---------------------------------------------------------------- artists
/** Exact name matches first, then by how many tracklists the artist has. */
export function rankArtists(candidates: Candidate[], name: string): Candidate[] {
  const wanted = foldName(name)
  return [...candidates].sort(
    (a, b) =>
      Number(foldName(a.name) !== wanted) - Number(foldName(b.name) !== wanted) ||
      b.tracklists - a.tracklists ||
      (a.name < b.name ? -1 : a.name > b.name ? 1 : 0),
  )
}

/** The single exact match, if the name is unambiguous; otherwise null (let the user choose). */
export function pickArtist(candidates: Candidate[], name: string): Candidate | null {
  const wanted = foldName(name)
  const exact = candidates.filter((c) => foldName(c.name) === wanted)
  const withSets = exact.filter((c) => c.tracklists)
  if (withSets.length === 1) return withSets[0]
  const othersWithSets = candidates.some((c) => c.tracklists && !exact.includes(c))
  if (exact.length === 1 && !withSets.length && !othersWithSets) return exact[0]
  return null
}

/** Up to 6 choices: only artists with tracklists, unless none has any. */
export function choices(candidates: Candidate[], name: string): Candidate[] {
  const ranked = rankArtists(candidates, name)
  const withSets = ranked.filter((c) => c.tracklists)
  return (withSets.length ? withSets : ranked).slice(0, 6)
}

// ---------------------------------------------------------------- dates
const pad = (n: number) => String(n).padStart(2, '0')
export const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`

export function todayIso(now = new Date()): string {
  return iso(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + n))
  return iso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate())
}

export function presetRange(key: Exclude<Preset, 'custom'>, today: string): [string, string] {
  const year = Number(today.slice(0, 4))
  if (key === 'last30') return [addDays(today, -30), today]
  if (key === 'summer') {
    const y = today >= iso(year, 6, 1) ? year : year - 1
    const end = iso(y, 8, 31)
    return [iso(y, 6, 1), end < today ? end : today]
  }
  return [iso(year, 1, 1), today]
}

/** The preset whose range equals this one, else 'custom'. */
export function presetFor(start: string, end: string, today: string): Preset {
  for (const key of ['last30', 'summer', 'year'] as const) {
    const [s, e] = presetRange(key, today)
    if (s === start && e === end) return key
  }
  return 'custom'
}

/** Inclusive on both ends. A set with no known date is kept. */
export function inRange(day: string | null, start: string, end: string): boolean {
  return day === null || (day >= start && day <= end)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const parts = (day: string) => day.split('-').map(Number) as [number, number, number]

export function fmtDate(day: string | null): string {
  if (!day) return 'date unknown'
  const [y, m, d] = parts(day)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export function fmtRange(start: string, end: string): string {
  const [ys, ms, ds] = parts(start)
  const [ye, me, de] = parts(end)
  if (ys === ye) return `${ds} ${MONTHS[ms - 1]} – ${de} ${MONTHS[me - 1]} ${ye}`
  return `${fmtDate(start)} – ${fmtDate(end)}`
}

export function dayBox(day: string | null): { day: string; month: string } {
  if (!day) return { day: '–', month: '' }
  const [, m, d] = parts(day)
  return { day: pad(d), month: MONTHS[m - 1].toUpperCase() }
}

/** 'Franky Rizardo - FLOW 682 2026-11-09' -> 'FLOW 682' (artist and trailing date dropped). */
export function shortTitle(title: string | null, artist: string | null): string {
  let t = title || 'Untitled set'
  if (artist && t.toLowerCase().startsWith(artist.toLowerCase() + ' - ')) t = t.slice(artist.length + 3)
  return t.replace(/\s+\d{4}-\d{2}-\d{2}$/, '')
}

// ---------------------------------------------------------------- search
/** Result pages the preview reads at most (30 sets each). The desktop app goes to 20. */
export const MAX_PAGES = 10

/** Same stop rules as search_sets: no results, last page, oldest set before start, page cap. */
export function shouldStop(found: PreviewSet[], current: number, last: number, start: string, page: number): 'done' | 'cap' | null {
  if (!found.length || current >= last) return 'done'
  const dated = found.map((s) => s.date).filter((d): d is string => d !== null)
  if (dated.length && dated.reduce((a, b) => (a < b ? a : b)) < start) return 'done'
  if (page >= MAX_PAGES) return 'cap'
  return null
}

/**
 * From every result page to the sets shown: de-duplicated by set id (the last copy wins,
 * in the first position), dropped when outside the period, and set aside when the DJ's
 * name is not in the performer part of the title (another DJ's set that mentions them).
 */
export function collectSets(all: PreviewSet[], artist: string, start: string, end: string) {
  const byId = new Map<string, PreviewSet>()
  for (const s of all) byId.set(s.id || s.url, s)
  const sets: PreviewSet[] = []
  let skipped = 0
  for (const s of byId.values()) {
    if (!inRange(s.date, start, end)) continue
    if (s.title && !nameIn(artist, titlePerformerPart(s.title))) skipped++
    else sets.push(s)
  }
  return { sets, skipped }
}
