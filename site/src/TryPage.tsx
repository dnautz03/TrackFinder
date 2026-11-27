import { useEffect, useRef, useState, type FormEvent, type ReactNode, type Ref } from 'react'
import { AlertCircle, ArrowLeft, ArrowRight, ArrowUpRight, Check, LoaderCircle, Search } from 'lucide-react'
import { Wordmark } from '@/components/Nav'
import { DownloadCta } from '@/components/DownloadCta'
import { primaryClass } from '@/components/Buttons'
import { Footer } from '@/components/sections/Footer'
import { HOME_URL } from '@/lib/links'
import {
  choices, collectSets, dayBox, fmtDate, fmtRange, pickArtist, presetFor, presetRange, shortTitle, shouldStop, todayIso,
  type Candidate, type Preset, type PreviewSet,
} from '@/lib/preview'

/**
 * /try/ — the live preview. It searches 1001Tracklists (through the site's Worker) for a
 * DJ's sets in a period and shows each set with its date and identified-track count.
 * Track names need each tracklist page, which only the desktop app can read, so the
 * page ends by sending people to the app.
 */

const API = `${HOME_URL}api`

const ERRORS: Record<string, string> = {
  busy: 'A lot of people are searching right now. Try again in a minute.',
  blocked:
    '1001Tracklists is asking for a human check right now, so the preview can’t search. The desktop app lets you answer that check yourself.',
  layout: '1001Tracklists answered with a page we don’t recognise. Try again later.',
  unreachable: 'Could not reach 1001Tracklists. Try again in a minute.',
  bad_request: 'That search didn’t work. Check the artist name and try again.',
}

class ApiFailure extends Error {}

async function api<T>(path: string, signal: AbortSignal): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API}/${path}`, { signal })
  } catch (e) {
    if ((e as DOMException)?.name === 'AbortError') throw e
    throw new ApiFailure(ERRORS.unreachable)
  }
  const body = await res.json().catch(() => ({ error: 'unreachable' }))
  if (!res.ok) throw new ApiFailure(ERRORS[body.error as string] ?? ERRORS.unreachable)
  return body as T
}

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'last30', label: 'Last 30 days' },
  { key: 'summer', label: 'This summer' },
  { key: 'year', label: 'This year' },
  { key: 'custom', label: 'Custom' },
]

type Phase =
  | { kind: 'idle' }
  | { kind: 'looking' }
  | { kind: 'choose'; options: Candidate[] }
  | { kind: 'searching'; page: number; found: number }
  | { kind: 'done'; artist: Candidate; start: string; end: string; sets: PreviewSet[]; skipped: number; capped: boolean }

const n = (x: number) => x.toLocaleString('en-US')
const plural = (x: number, one: string, many = `${one}s`) => `${n(x)} ${x === 1 ? one : many}`

export default function TryPage() {
  // Prerendered with a fixed date; the real one is set right after hydration.
  const [today, setToday] = useState('2026-11-27')
  const [name, setName] = useState('')
  const [artist, setArtist] = useState<Candidate | null>(null)
  const [preset, setPreset] = useState<Preset>('summer')
  const [range, setRange] = useState(() => presetRange('summer', '2026-11-27'))
  const [includeIds, setIncludeIds] = useState(false)
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [error, setError] = useState<string | null>(null)
  const run = useRef<AbortController | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = todayIso()
    setToday(t)
    setRange(presetRange('summer', t))
    return () => run.current?.abort()
  }, [])

  const [start, end] = range
  const busy = phase.kind === 'looking' || phase.kind === 'searching'

  const choosePreset = (key: Preset) => {
    setPreset(key)
    if (key !== 'custom') setRange(presetRange(key, today))
  }
  const setDate = (which: 0 | 1, value: string) => {
    if (!value) return
    const next: [string, string] = which === 0 ? [value, end] : [start, value]
    setRange(next)
    setPreset(presetFor(next[0], next[1], today))
  }

  const search = async (chosen: Candidate | null) => {
    const typed = name.trim()
    setError(null)
    if (!typed && !chosen) return setError('Type an artist name first.')
    if (start > end) return setError('The start date is after the end date.')

    run.current?.abort()
    const ctrl = new AbortController()
    run.current = ctrl
    try {
      let who = chosen
      if (!who) {
        setPhase({ kind: 'looking' })
        const { candidates } = await api<{ candidates: Candidate[] }>(`artists?q=${encodeURIComponent(typed)}`, ctrl.signal)
        who = pickArtist(candidates, typed)
        if (!who) {
          if (!candidates.length) {
            setPhase({ kind: 'idle' })
            return setError(`No artist called “${typed}” on 1001Tracklists.`)
          }
          return setPhase({ kind: 'choose', options: choices(candidates, typed) })
        }
        setArtist(who)
      }

      const all: PreviewSet[] = []
      let capped = false
      for (let page = 1; ; page++) {
        setPhase({ kind: 'searching', page, found: collectSets(all, who.name, start, end).sets.length })
        const res = await api<{ sets: PreviewSet[]; current: number; last: number }>(
          `sets?q=${encodeURIComponent(who.name)}&page=${page}`,
          ctrl.signal,
        )
        all.push(...res.sets)
        const stop = shouldStop(res.sets, res.current, res.last, start, page)
        if (stop) {
          capped = stop === 'cap'
          break
        }
      }
      const { sets, skipped } = collectSets(all, who.name, start, end)
      setPhase({ kind: 'done', artist: who, start, end, sets, skipped, capped })
      requestAnimationFrame(() => resultsRef.current?.focus())
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return
      setPhase({ kind: 'idle' })
      setError(e instanceof ApiFailure ? e.message : ERRORS.unreachable)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!busy) search(artist)
  }

  return (
    <>
      <header className="border-b border-groove bg-night">
        <nav aria-label="Main" className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Wordmark href={HOME_URL} />
          <a href={HOME_URL} className="inline-flex min-h-11 items-center gap-2 font-label text-sm text-dust transition-colors hover:text-bone">
            <ArrowLeft className="size-4" aria-hidden />
            Back to site
          </a>
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <section className="grid grid-cols-1 gap-10 pt-12 pb-16 sm:pt-20 lg:grid-cols-12 lg:gap-14 lg:pt-24">
          <div className="lg:col-span-5">
            <h1 className="type-display text-[clamp(2.4rem,9vw,4.25rem)] uppercase lg:text-[min(4.25rem,4.6vw)]">
              <span className="plate">Which sets did</span>
              <br />
              <span className="plate text-acid">your DJ play?</span>
            </h1>
            <p className="plate mt-6 max-w-[44ch] text-[1.0625rem] leading-relaxed text-dust sm:text-[1.125rem]">
              Pick a DJ and a period. You’ll see every set they played and how many of its tracks are identified.
              The full track list, with Spotify and SoundCloud links, comes with the free app for your computer.
            </p>
          </div>

          <form onSubmit={onSubmit} className="plate rounded-2xl border border-groove p-5 sm:p-7 lg:col-span-7" noValidate>
            <label htmlFor="artist" className="font-label text-[11px] tracking-[0.06em] text-dust uppercase">
              Artist
            </label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-dust" aria-hidden />
              <input
                id="artist"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setArtist(null)
                  setError(null)
                  if (phase.kind === 'choose') setPhase({ kind: 'idle' })
                }}
                autoComplete="off"
                autoCapitalize="words"
                spellCheck={false}
                enterKeyHint="search"
                maxLength={80}
                aria-describedby="artist-status"
                className="h-14 w-full rounded-xl border border-groove bg-deck pr-4 pl-12 text-[1.0625rem] text-bone transition-colors outline-none placeholder:text-dust/60 hover:border-dust focus:border-acid"
                placeholder="e.g. Franky Rizardo"
              />
            </div>
            <div id="artist-status" aria-live="polite" className="min-h-6 pt-2 font-label text-sm">
              {phase.kind === 'looking' && <Status icon="spin">Looking up {name.trim()}…</Status>}
              {artist && phase.kind !== 'looking' && (
                <Status icon="check">
                  {[artist.name, artist.country, artist.tracklists ? `${n(artist.tracklists)} tracklists` : 'found on 1001Tracklists']
                    .filter(Boolean)
                    .join(' · ')}
                </Status>
              )}
              {error && <Status icon="alert">{error}</Status>}
            </div>

            {phase.kind === 'choose' && (
              <div className="mt-2">
                <p className="font-label text-sm text-bone">Several artists match. Which one did you mean?</p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {phase.options.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setArtist(c)
                        setName(c.name)
                        search(c)
                      }}
                      className="rounded-xl border border-groove bg-deck px-4 py-3 text-left transition-colors hover:border-dust"
                    >
                      <span className="block font-semibold text-bone">{c.name}</span>
                      <span className="block font-label text-sm text-dust">
                        {[c.country, c.tracklists ? `${n(c.tracklists)} tracklists` : 'no tracklists'].filter(Boolean).join(' · ')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <fieldset className="mt-6">
              <legend className="font-label text-[11px] tracking-[0.06em] text-dust uppercase">Period</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    aria-pressed={preset === p.key}
                    onClick={() => choosePreset(p.key)}
                    className={`min-h-11 rounded-full border px-4 font-label text-sm transition-colors ${
                      preset === p.key ? 'border-acid bg-acid font-bold text-night' : 'border-groove text-bone hover:border-dust'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <DateField label="From" value={start} min="2005-01-01" max={today} onChange={(v) => setDate(0, v)} />
                <DateField label="To" value={end} min="2005-01-01" max={today} onChange={(v) => setDate(1, v)} />
              </div>
            </fieldset>

            <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-groove px-4 py-3">
              <div>
                <p id="ids-label" className="font-label text-sm text-bone">
                  Include IDs and unreleased
                </p>
                <p className="font-label text-xs text-dust">Count entries marked ID or (Unreleased) too</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={includeIds}
                aria-labelledby="ids-label"
                onClick={() => setIncludeIds((v) => !v)}
                className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${includeIds ? 'border-acid bg-acid' : 'border-groove bg-deck'}`}
              >
                <span
                  className={`absolute top-1/2 size-5 -translate-y-1/2 rounded-full transition-[left,background-color] duration-300 ease-out-expo ${
                    includeIds ? 'left-6 bg-night' : 'left-1 bg-dust'
                  }`}
                />
              </button>
            </div>

            <button type="submit" disabled={busy} className={`mt-6 w-full disabled:opacity-70 ${primaryClass('lg')}`}>
              {busy ? (
                <>
                  <LoaderCircle className="size-5 animate-spin" aria-hidden />
                  {phase.kind === 'looking' ? 'Looking up the artist…' : 'Searching…'}
                </>
              ) : (
                <>
                  Find sets
                  <ArrowRight className="size-5 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5" aria-hidden />
                </>
              )}
            </button>
          </form>
        </section>

        {phase.kind === 'done' && (
          <Results ref={resultsRef} {...phase} includeIds={includeIds} onRetry={() => document.getElementById('artist')?.focus()} />
        )}
      </main>

      <Footer home={HOME_URL} />
    </>
  )
}

function Status({ icon, children }: { icon: 'spin' | 'check' | 'alert'; children: ReactNode }) {
  const cls = 'mt-0.5 size-4 shrink-0'
  return (
    <p className={`flex items-start gap-2 ${icon === 'alert' ? 'text-bone' : 'text-dust'}`}>
      {icon === 'spin' && <LoaderCircle className={`${cls} animate-spin`} aria-hidden />}
      {icon === 'check' && <Check className={`${cls} text-acid`} aria-hidden />}
      {icon === 'alert' && <AlertCircle className={`${cls} text-[#f0717c]`} aria-hidden />}
      <span>{children}</span>
    </p>
  )
}

function DateField(props: { label: string; value: string; min: string; max: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="font-label text-sm text-dust">{props.label}</span>
      <input
        type="date"
        value={props.value}
        min={props.min}
        max={props.max}
        onChange={(e) => props.onChange(e.target.value)}
        className="mt-1 h-12 w-full rounded-xl border border-groove bg-deck px-3 font-label text-sm text-bone [color-scheme:dark] outline-none hover:border-dust focus:border-acid"
      />
    </label>
  )
}

function Results(props: {
  ref: Ref<HTMLDivElement>
  artist: Candidate
  start: string
  end: string
  sets: PreviewSet[]
  skipped: number
  capped: boolean
  includeIds: boolean
  onRetry: () => void
}) {
  const { artist, sets, includeIds } = props
  const tracks = sets.reduce((sum, s) => sum + ((includeIds ? s.total : s.ided) ?? 0), 0)

  return (
    <section ref={props.ref} tabIndex={-1} aria-labelledby="results-title" className="border-t border-groove pt-12 pb-20 outline-none sm:pt-16">
      <p className="plate w-fit font-label text-xs tracking-[0.06em] text-dust uppercase">
        {artist.name} · {fmtRange(props.start, props.end)}
      </p>

      {sets.length === 0 ? (
        <div className="mt-4">
          <h2 id="results-title" className="plate type-display w-fit text-[clamp(1.9rem,6vw,3rem)] uppercase">
            No sets found
          </h2>
          <p className="plate mt-4 max-w-[52ch] text-dust">
            1001Tracklists lists no sets by {artist.name} in this period. Try a longer period.
          </p>
          <button type="button" onClick={props.onRetry} className="mt-6 inline-flex min-h-11 items-center gap-2 text-bone underline decoration-groove underline-offset-4 hover:decoration-acid">
            Try another search
          </button>
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <h2 id="results-title" className="plate type-display w-fit text-[clamp(2.2rem,8vw,4rem)] uppercase">
                {plural(sets.length, 'set')}
              </h2>
              <p className="plate mt-3 w-fit text-[1.25rem] text-bone sm:text-[1.5rem]">
                up to <span className="font-semibold text-acid">{n(tracks)}</span> {includeIds ? 'tracks' : 'identified tracks'}
              </p>
              <p className="plate mt-3 max-w-[52ch] font-label text-sm text-dust">
                {includeIds ? 'IDs included. ' : 'IDs and unreleased left out. '}
                Counted per set, before repeats are merged, so the clean list is shorter.
              </p>
            </div>
            <aside className="lg:col-span-5">
              <div className="plate rounded-2xl border border-groove p-6">
                <p className="font-semibold text-bone">See every track name</p>
                <p className="mt-2 font-label text-sm text-dust">
                  Underset on your computer reads each of these sets and gives you one clean list, without IDs or repeats,
                  with Spotify and SoundCloud links.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <DownloadCta size="sm" />
                </div>
              </div>
            </aside>
          </div>

          <ol className="mt-10 divide-y divide-groove border-y border-groove" aria-label={`Sets by ${artist.name}`}>
            {sets.map((s) => (
              <SetRow key={s.id || s.url} set={s} artist={artist.name} />
            ))}
          </ol>
          <div className="mt-6 space-y-2 font-label text-sm text-dust">
            {props.capped && <p>Stopped after the first 300 sets; pick a shorter period to see older ones.</p>}
            {props.skipped > 0 && (
              <p>
                {plural(props.skipped, 'set')} by other DJs (or only mentioning {artist.name}) {props.skipped === 1 ? 'was' : 'were'} skipped.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  )
}

function SetRow({ set, artist }: { set: PreviewSet; artist: string }) {
  const box = dayBox(set.date)
  const total = set.total ?? 0
  const ided = set.ided ?? 0
  return (
    <li>
      <a
        href={set.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group grid grid-cols-[3.25rem_1fr_auto] items-center gap-4 py-4 transition-colors hover:bg-deck sm:px-3"
        aria-label={`${shortTitle(set.title, artist)}, ${fmtDate(set.date)}, on 1001Tracklists`}
      >
        <span className="flex h-13 flex-col items-center justify-center rounded-lg border border-groove bg-night font-label">
          <span className="text-lg leading-none font-bold text-bone">{box.day}</span>
          <span className="mt-1 text-[10px] tracking-[0.06em] text-dust">{box.month}</span>
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium text-bone">{shortTitle(set.title, artist)}</span>
          {total > 0 ? (
            <span className="mt-1.5 flex items-center gap-3">
              <span className="h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-groove" aria-hidden>
                <span className="block h-full rounded-full bg-acid" style={{ width: `${Math.round((ided / total) * 100)}%` }} />
              </span>
              <span className="shrink-0 font-label text-xs text-dust tabular-nums">
                {ided} of {total} identified
              </span>
            </span>
          ) : (
            <span className="mt-1 block font-label text-xs text-dust">No tracklist yet</span>
          )}
        </span>
        <ArrowUpRight className="size-4 text-dust transition-colors group-hover:text-acid" aria-hidden />
      </a>
    </li>
  )
}
