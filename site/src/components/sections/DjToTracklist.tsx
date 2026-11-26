import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m, useInView } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { EASE } from '@/components/ui/words-reveal'

/**
 * The Underset story in one loop:
 *   a DJ plays out → their sets pile up month after month → an arrow from every
 *   month merges into one → a single clean tracklist fills in (IDs and repeats
 *   struck out). Illustrative: names and months are made up.
 */

const MONTHS = [
  { label: 'JUN', sets: 2 },
  { label: 'JUL', sets: 3 },
  { label: 'AUG', sets: 2 },
  { label: 'SEP', sets: 3 },
]

type Row = { artist: string; title: string; month: string; kind: 'keep' | 'id' | 'dupe' }
const ROWS: Row[] = [
  { artist: 'Mira Kessel', title: 'Low Orbit', month: 'JUN', kind: 'keep' },
  { artist: 'Oscuro & Vane', title: 'Night Shift', month: 'JUL', kind: 'keep' },
  { artist: 'ID', title: 'ID', month: 'JUL', kind: 'id' },
  { artist: 'Kaelo', title: 'Undertow', month: 'AUG', kind: 'keep' },
  { artist: 'Mira Kessel', title: 'Low Orbit', month: 'AUG', kind: 'dupe' },
  { artist: 'Seren Moto', title: 'Glasshouse', month: 'SEP', kind: 'keep' },
]

/* Timeline, in steps. 1–4: months fill, 5: arrows draw, 6+: rows (one per step,
   filtered rows get struck one step later and leave the step after). */
const MONTH_STEP = (i: number) => 1 + i
const ARROW_STEP = 5
const ROW_STEP = (i: number) => 6 + i
const LAST = ROW_STEP(ROWS.length - 1) + 2
const DURATIONS = [700, 420, 420, 420, 420, 1100, ...Array(LAST - 5).fill(460), 2800]

function useStory(active: boolean, reduced: boolean) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (reduced) {
      setStep(LAST)
      return
    }
    if (!active) return
    const t = window.setTimeout(() => setStep((s) => (s >= LAST ? 0 : s + 1)), DURATIONS[step] ?? 460)
    return () => window.clearTimeout(t)
  }, [active, reduced, step])
  return step
}

/* ───────── The DJ ───────── */
function Dj() {
  return (
    <svg viewBox="0 0 240 212" className="h-auto w-full max-w-[240px] lg:max-w-[300px]" aria-hidden>
      {/* sound rings rising from the decks (half hidden behind the booth) */}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx="120" cy="134" r="40" className="dj-ring" style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
      {/* body */}
      <path d="M68 134 C68 102 90 90 120 90 C150 90 172 102 172 134 Z" fill="#3b4034" />
      <rect x="112" y="74" width="16" height="18" rx="4" fill="#3b4034" />
      {/* left arm up, holding a headphone cup to the ear */}
      <path d="M80 106 C66 92 78 70 94 63" stroke="#3b4034" strokeWidth="12" strokeLinecap="round" fill="none" />
      {/* head nodding on the beat */}
      <g className="dj-nod">
        <circle cx="120" cy="56" r="19" fill="#545b4b" />
        <path d="M99 57 A21 21 0 0 1 141 57" stroke="#c8ff2e" strokeWidth="4" fill="none" strokeLinecap="round" />
        <rect x="93" y="50" width="9" height="15" rx="3.5" fill="#c8ff2e" />
        <rect x="138" y="50" width="9" height="15" rx="3.5" fill="#c8ff2e" />
      </g>
      {/* right arm on the deck, nudging the record */}
      <g className="dj-scratch">
        <path d="M160 106 C174 118 178 134 172 150" stroke="#3b4034" strokeWidth="12" strokeLinecap="round" fill="none" />
        <circle cx="171" cy="153" r="7" fill="#545b4b" />
      </g>
      {/* booth */}
      <rect x="18" y="134" width="204" height="74" rx="10" fill="#121410" stroke="#2a2e25" />
      <line x1="30" y1="136" x2="210" y2="136" stroke="#c8ff2e" strokeOpacity="0.35" />
      {/* decks */}
      {[66, 174].map((cx) => (
        <g key={cx} className="dj-platter" style={{ transformOrigin: `${cx}px 172px` }}>
          <circle cx={cx} cy="172" r="27" fill="#1a1d17" stroke="#3a3e33" />
          <circle cx={cx} cy="172" r="21" fill="none" stroke="#24271f" />
          <circle cx={cx} cy="172" r="15" fill="none" stroke="#24271f" />
          <circle cx={cx} cy="172" r="8" fill="#c8ff2e" />
          <line x1={cx} y1="164" x2={cx} y2="147" stroke="#6b7262" strokeWidth="2" strokeLinecap="round" />
          <circle cx={cx} cy="172" r="1.8" fill="#0b0c0a" />
        </g>
      ))}
      {/* mixer with moving faders */}
      <rect x="104" y="150" width="32" height="46" rx="5" fill="#1a1d17" stroke="#2a2e25" />
      {[112, 120, 128].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="158" x2={x} y2="188" stroke="#2a2e25" strokeWidth="2" />
          <rect x={x - 3} y="166" width="6" height="6" rx="1.5" fill="#eceee4" className="dj-fader" style={{ animationDelay: `${i * 0.16}s` }} />
        </g>
      ))}
    </svg>
  )
}

/* ───────── Months → arrows (two orientations) ───────── */
function SetTile({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <g className={`story-tile ${on ? 'is-on' : ''}`} style={{ transformOrigin: `${x + 11}px ${y + 7}px` }}>
      <rect x={x} y={y} width="22" height="14" rx="3.5" fill="#1a1d17" stroke="#3a3e33" />
      {[4, 7, 10, 13, 16].map((dx, k) => (
        <line key={dx} x1={x + dx + 1} x2={x + dx + 1} y1={y + 7 - [2, 4, 3, 5, 2][k]} y2={y + 7 + [2, 4, 3, 5, 2][k]} stroke="#c8ff2e" strokeWidth="1.4" strokeLinecap="round" />
      ))}
    </g>
  )
}

function Arrowhead({ x, y, dir, on }: { x: number; y: number; dir: 'right' | 'down'; on: boolean }) {
  const pts = dir === 'right' ? `${x - 9},${y - 6} ${x + 1},${y} ${x - 9},${y + 6}` : `${x - 6},${y - 9} ${x},${y + 1} ${x + 6},${y - 9}`
  return <polygon points={pts} fill="#c8ff2e" className={`story-fade ${on ? 'is-on' : ''}`} style={{ transitionDelay: on ? '0.75s' : '0s' }} />
}

function FlowRight({ step }: { step: number }) {
  const ys = [34, 88, 142, 196]
  const merge = { x: 214, y: 115 }
  const drawn = step >= ARROW_STEP
  return (
    <svg viewBox="0 0 270 230" className="h-auto w-full" aria-hidden>
      {MONTHS.map((mo, i) => {
        const y = ys[i]
        const lit = step >= MONTH_STEP(i)
        const d = `M134 ${y} C176 ${y} 182 ${merge.y} ${merge.x} ${merge.y}`
        return (
          <g key={mo.label}>
            <text x="4" y={y + 4} className={`story-month ${lit ? 'is-on' : ''}`}>{mo.label}</text>
            {Array.from({ length: mo.sets }, (_, k) => (
              <SetTile key={k} x={42 + k * 28} y={y - 7} on={lit} />
            ))}
            <path d={d} pathLength={1} className={`story-arrow ${drawn ? 'is-on' : ''}`} style={{ transitionDelay: drawn ? `${i * 0.12}s` : '0s' }} />
            <path d={d} pathLength={1} className={`story-flow ${drawn ? 'is-on' : ''}`} style={{ animationDelay: `${i * 0.2}s` }} />
          </g>
        )
      })}
      <path d={`M${merge.x} ${merge.y} L262 ${merge.y}`} pathLength={1} className={`story-arrow story-shaft ${drawn ? 'is-on' : ''}`} style={{ transitionDelay: drawn ? '0.5s' : '0s' }} />
      <Arrowhead x={266} y={merge.y} dir="right" on={drawn} />
    </svg>
  )
}

function FlowDown({ step }: { step: number }) {
  const xs = [42, 122, 202, 282]
  const merge = { x: 162, y: 150 }
  const drawn = step >= ARROW_STEP
  return (
    <svg viewBox="0 0 324 196" className="h-auto w-full" aria-hidden>
      {MONTHS.map((mo, i) => {
        const x = xs[i]
        const lit = step >= MONTH_STEP(i)
        const d = `M${x} 92 C${x} 124 ${merge.x} 120 ${merge.x} ${merge.y}`
        return (
          <g key={mo.label}>
            <text x={x} y="14" textAnchor="middle" className={`story-month ${lit ? 'is-on' : ''}`}>{mo.label}</text>
            {Array.from({ length: mo.sets }, (_, k) => (
              <SetTile key={k} x={x - 11} y={24 + k * 20} on={lit} />
            ))}
            <path d={d} pathLength={1} className={`story-arrow ${drawn ? 'is-on' : ''}`} style={{ transitionDelay: drawn ? `${i * 0.12}s` : '0s' }} />
            <path d={d} pathLength={1} className={`story-flow ${drawn ? 'is-on' : ''}`} style={{ animationDelay: `${i * 0.2}s` }} />
          </g>
        )
      })}
      <path d={`M${merge.x} ${merge.y} L${merge.x} 186`} pathLength={1} className={`story-arrow story-shaft ${drawn ? 'is-on' : ''}`} style={{ transitionDelay: drawn ? '0.5s' : '0s' }} />
      <Arrowhead x={merge.x} y={190} dir="down" on={drawn} />
    </svg>
  )
}

/* ───────── The tracklist ───────── */
function Tracklist({ step }: { step: number }) {
  const visible = ROWS.map((r, i) => ({ r, i })).filter(({ r, i }) => {
    if (step < ROW_STEP(i)) return false
    return r.kind === 'keep' || step < ROW_STEP(i) + 2
  })
  const kept = ROWS.filter((r, i) => r.kind === 'keep' && step >= ROW_STEP(i)).length
  return (
    <div className="w-full rounded-2xl border border-groove bg-night p-4 sm:p-5">
      <div className="mb-2 flex items-baseline justify-between font-mono text-[0.6875rem] tracking-[0.06em] text-dust uppercase">
        <span>Tracklist</span>
        <span className="tabular-nums">
          <span className="text-bone">{String(kept).padStart(2, '0')}</span> tracks
        </span>
      </div>
      <ol className="flex min-h-[176px] flex-col">
        <AnimatePresence initial={false}>
          {visible.map(({ r, i }) => {
            const filtered = r.kind !== 'keep'
            const struck = filtered && step >= ROW_STEP(i) + 1
            const n = ROWS.slice(0, i + 1).filter((x) => x.kind === 'keep').length
            return (
              <m.li
                key={i}
                layout
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: struck ? 0.5 : 1, x: 0 }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.3 } }}
                transition={{ duration: 0.45, ease: EASE }}
                className="grid grid-cols-[1.6rem_minmax(0,1fr)_auto] items-center gap-2 overflow-hidden border-b border-groove/70 py-2 text-[0.9rem]"
              >
                <span className="font-mono text-[0.6875rem] text-dust tabular-nums">{filtered ? '—' : String(n).padStart(2, '0')}</span>
                <span className="relative min-w-0 truncate">
                  <span className="font-semibold text-bone">{r.artist}</span>
                  <span className="text-dust"> – {r.title}</span>
                  {filtered && (
                    <span
                      aria-hidden
                      className="absolute top-1/2 left-0 h-[2px] w-full origin-left bg-acid transition-transform duration-300"
                      style={{ transform: `scaleX(${struck ? 1 : 0})` }}
                    />
                  )}
                </span>
                <span className={`font-mono text-[0.625rem] tracking-[0.06em] ${filtered && struck ? 'text-acid' : 'text-dust'}`}>
                  {filtered && struck ? (r.kind === 'id' ? 'ID · OUT' : 'REPEAT · OUT') : r.month}
                </span>
              </m.li>
            )
          })}
        </AnimatePresence>
      </ol>
    </div>
  )
}

function Caption({ children }: { children: string }) {
  return <p className="mb-4 font-mono text-[0.6875rem] tracking-[0.06em] text-dust uppercase">{children}</p>
}

export function DjToTracklist() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '0px 0px -15% 0px' })
  const reduced = useReducedMotion()
  const step = useStory(inView, reduced)

  return (
    <div
      ref={ref}
      role="img"
      aria-label="A DJ plays sets over several months; Underset gathers the tracks from all of them into one clean tracklist, without IDs or repeats."
      className="grid grid-cols-1 gap-8 rounded-[24px] border border-groove bg-[#101210] p-5 sm:p-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-6 lg:p-10"
    >
      {/* captions share one top line; each visual is centred in the space below */}
      <div className="flex flex-col items-center lg:items-start">
        <Caption>Your DJ, playing out</Caption>
        <div className="flex w-full flex-1 items-center justify-center lg:justify-start">
          <Dj />
        </div>
      </div>
      <div className="flex flex-col">
        <Caption>Sets from every month</Caption>
        <div className="flex flex-1 items-center">
          <div className="hidden w-full lg:block">
            <FlowRight step={step} />
          </div>
          <div className="w-full lg:hidden">
            <FlowDown step={step} />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <Caption>One clean tracklist</Caption>
        <div className="flex flex-1 items-center">
          <Tracklist step={step} />
        </div>
      </div>
    </div>
  )
}
