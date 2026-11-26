import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, m as Motion } from 'motion/react'
import { buildTimeline, type TimelineMarker } from '../lib/exampleSets'
import { useReducedMotion } from '@/lib/use-reduced-motion'

const SWEEP_MS = 13000
const HOLD_MS = 3200
const STRIKE_MS = 450
const DROP_MS = 1500

const C = {
  played: '#c8ff2e',
  unplayed: '#3a3e33',
  tick: '#5c6253',
  head: '#eceee4',
}

type Row = { m: TimelineMarker; struck: boolean }

/* deterministic pseudo-random 0–1 */
function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
function smooth(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export function SignalDeck({ waveClass = '', listClass = '' }: { waveClass?: string; listClass?: string }) {
  const reduced = useReducedMotion()
  const { spans, markers } = useMemo(buildTimeline, [])
  const finalRows = useMemo<Row[]>(
    () => markers.filter((m) => m.kind === 'keep').map((m) => ({ m, struck: false })),
    [markers],
  )

  const wrapRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [counts, setCounts] = useState({ kept: 0, removed: 0 })

  // Reduced motion: show the finished list straight away (after hydration)
  useEffect(() => {
    if (!reduced) return
    setRows(finalRows)
    setCounts({ kept: finalRows.length, removed: markers.length - finalRows.length })
  }, [reduced, finalRows, markers])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0
    let H = 0
    let amps: number[] = []
    const STEP = 4

    const layout = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = r.width
      H = r.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.floor(W / STEP)
      amps = Array.from({ length: count }, (_, i) => {
        const x = (i + 0.5) / count
        const span = spans.find((s) => x >= s.start && x <= s.end)
        if (!span) return 0
        const inSet = markers.filter((m) => m.pos <= x && m.pos >= span.start - 0.001)
        const cur = inSet[inSet.length - 1]
        const next = markers.find((m) => m.pos > x && m.pos <= span.end)
        const segStart = cur ? cur.pos : span.start
        const segEnd = next ? next.pos : span.end
        const p = (x - segStart) / Math.max(0.0001, segEnd - segStart)
        const energy = 0.62 + 0.38 * hash((cur?.id ?? 0) + 9)
        const env = (0.28 + 0.72 * smooth(0, 0.22, p)) * (1 - 0.55 * smooth(0.82, 1, p))
        const grain = 0.55 + 0.45 * hash(i)
        const edge = smooth(span.start, span.start + 0.012, x) * (1 - smooth(span.end - 0.012, span.end, x))
        return Math.max(0.04, env * energy * grain * edge)
      })
    }

    const draw = (progress: number, now: number) => {
      ctx.clearRect(0, 0, W, H)
      const mid = H / 2
      const maxH = H / 2 - 10
      const head = progress * W
      const beat = reduced ? 0 : Math.pow(Math.max(0, Math.sin((now / 1000) * Math.PI * 2 * 2.07)), 6)
      for (let i = 0; i < amps.length; i++) {
        const x = i * STEP + 1
        let a = amps[i]
        if (a === 0) continue
        const behind = head - x
        if (behind > 0 && behind < 90 && progress < 1) a *= 1 + 0.22 * beat * (1 - behind / 90)
        const h = Math.max(1.5, a * maxH)
        ctx.fillStyle = x <= head ? C.played : C.unplayed
        ctx.fillRect(x, mid - h, 2, h * 2)
      }
      // track ticks along the top edge
      for (const m of markers) {
        const x = Math.round(m.pos * W) + 0.5
        ctx.fillStyle = m.pos * W <= head ? C.played : C.tick
        ctx.fillRect(x - 0.5, 0, 1, 7)
      }
      canvas.dataset.ready = '1'
      if (progress > 0 && progress < 1) {
        ctx.fillStyle = C.head
        ctx.fillRect(Math.round(head), 0, 1.5, H)
      }
    }

    layout()

    if (reduced) {
      draw(1, 0)
      const ro = new ResizeObserver(() => {
        layout()
        draw(1, 0)
      })
      ro.observe(canvas)
      return () => ro.disconnect()
    }

    let raf = 0
    let visible = false
    let started = false
    let cycleStart = 0
    let pausedAt = 0
    let nextHit = 0
    const timers = new Set<number>()
    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => {
        timers.delete(t)
        fn()
      }, ms)
      timers.add(t)
    }

    const reset = () => {
      timers.forEach(clearTimeout)
      timers.clear()
      nextHit = 0
      setRows([])
      setCounts({ kept: 0, removed: 0 })
    }

    const hit = (m: TimelineMarker) => {
      setRows((r) => [...r, { m, struck: false }])
      if (m.kind === 'keep') {
        setCounts((c) => ({ ...c, kept: c.kept + 1 }))
        return
      }
      later(() => {
        setRows((r) => r.map((row) => (row.m.id === m.id ? { ...row, struck: true } : row)))
        setCounts((c) => ({ ...c, removed: c.removed + 1 }))
      }, STRIKE_MS)
      later(() => setRows((r) => r.filter((row) => row.m.id !== m.id)), DROP_MS)
    }

    const frame = (now: number) => {
      const t = now - cycleStart
      const progress = Math.min(1, t / SWEEP_MS)
      while (nextHit < markers.length && markers[nextHit].pos <= progress) {
        hit(markers[nextHit])
        nextHit++
      }
      if (t > SWEEP_MS + HOLD_MS) {
        cycleStart = now
        reset()
      }
      draw(progress, now)
      if (visible) raf = requestAnimationFrame(frame)
    }

    const io = new IntersectionObserver(([e]) => {
      const was = visible
      visible = e.isIntersecting
      if (visible && !was) {
        if (!started) {
          started = true
          cycleStart = performance.now()
        } else {
          cycleStart += performance.now() - pausedAt
        }
        raf = requestAnimationFrame(frame)
      } else if (!visible && was) {
        pausedAt = performance.now()
        cancelAnimationFrame(raf)
      }
    })
    io.observe(wrap)

    const ro = new ResizeObserver(() => layout())
    ro.observe(canvas)

    draw(0, 0)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      timers.forEach(clearTimeout)
    }
  }, [markers, spans, reduced])

  return (
    <>
      {/* waveform */}
      <figure ref={wrapRef} className={`relative m-0 pb-6 ${waveClass}`} aria-label="Example: three DJ sets being scanned for tracks">
        <div className="relative">
          <canvas ref={canvasRef} className="sk-canvas block h-[64px] w-full sm:h-[96px] lg:h-[112px]" aria-hidden />
          <div className="pointer-events-none absolute inset-x-0 -bottom-6 font-mono text-[0.6875rem] text-dust" aria-hidden>
            {spans.map((s) => (
              <span key={s.label} className="absolute" style={{ left: `${s.start * 100}%` }}>
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </figure>

      {/* result list */}
      <div className={`border-t border-groove pt-4 ${listClass}`}>
        <div className="mb-2 flex items-baseline justify-between gap-4">
          <p className="font-mono text-[0.6875rem] tracking-[0.06em] text-dust uppercase">Your list</p>
          <p className="font-mono text-[0.6875rem] tracking-[0.06em] text-dust tabular-nums uppercase">
            <span className="text-bone">{String(counts.kept).padStart(2, '0')}</span> tracks ·{' '}
            <span className="text-bone">{String(counts.removed).padStart(2, '0')}</span> IDs & repeats out
          </p>
        </div>
        <ol
          className="relative flex h-[232px] flex-col justify-end overflow-hidden sm:h-[300px] [mask-image:linear-gradient(to_bottom,transparent,black_28%)]"
          aria-label="Example track list"
        >
          {/* skeleton rows until JavaScript starts the animation */}
          {[0, 1, 2, 3].map((k) => (
            <li key={`sk-${k}`} aria-hidden className="sk-only grid shrink-0 grid-cols-[2.25rem_1fr_auto] items-center gap-3 border-b border-groove/70 py-3.5">
              <span className="sk h-2.5 w-5" />
              <span className="sk h-3" style={{ width: `${70 - k * 9}%` }} />
              <span className="sk h-2.5 w-12" />
            </li>
          ))}
          <AnimatePresence initial={false}>
            {rows.map(({ m, struck }) => {
              const filtered = m.kind !== 'keep'
              const n = rows.filter((r) => r.m.kind === 'keep' && r.m.id <= m.id).length
              return (
                <Motion.li
                  key={m.id}
                  layout={!reduced}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: struck ? 0.55 : 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.35 } }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="grid shrink-0 grid-cols-[2.25rem_1fr_auto] items-center gap-3 overflow-hidden border-b border-groove/70 py-2.5 sm:py-3"
                >
                  <span className="font-mono text-xs text-dust tabular-nums">
                    {filtered ? '—' : String(n).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 truncate text-[0.95rem] sm:text-base">
                    <span className="relative">
                    <span className="font-semibold text-bone">{m.artist}</span>
                    <span className="text-dust"> – {m.title}</span>
                    {filtered && (
                      <span
                        aria-hidden
                        className="absolute top-1/2 left-0 h-[2px] w-full origin-left bg-acid transition-transform duration-300 ease-out"
                        style={{ transform: `scaleX(${struck ? 1 : 0})` }}
                      />
                    )}
                    </span>
                  </span>
                  <span className={`font-mono text-[0.6875rem] tabular-nums ${filtered ? 'text-acid' : 'text-dust'}`}>
                    {filtered ? (m.kind === 'id' ? 'ID · out' : 'Repeat · out') : `${m.stamp}`}
                  </span>
                </Motion.li>
              )
            })}
          </AnimatePresence>
        </ol>
      </div>
    </>
  )
}
