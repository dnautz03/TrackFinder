import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { ArrowDown } from 'lucide-react'

/**
 * Opening scene. A long set waveform scrolls past a fixed centre playhead,
 * the way it does on a DJ deck. Page scroll drives it; native scrolling only,
 * the section is simply tall and its content is sticky.
 */

const CAPTIONS = ['Your favourite DJ.', 'Hundreds of sets.', 'One search.']
const SET_MINUTES = 94
const STEP = 4

const C = { played: '#c8ff2e', unplayed: '#3a3e33', near: '#5a6150', head: '#eceee4' }

function hash(n: number) {
  const x = Math.sin(n * 91.7 + 47.3) * 43758.5453
  return x - Math.floor(x)
}
function smooth(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
function clock(min: number) {
  const s = Math.floor(min * 60)
  return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/** A long "set": tracks of varying length, each with intro, build, drop and outro. */
function buildSet(bars: number) {
  const amps = new Float32Array(bars)
  const cuts: number[] = []
  let i = 0
  let track = 0
  while (i < bars) {
    const len = Math.round(70 + hash(track + 3) * 70)
    cuts.push(i)
    const energy = 0.6 + 0.4 * hash(track + 11)
    for (let k = 0; k < len && i < bars; k++, i++) {
      const p = k / len
      const env =
        (0.22 + 0.78 * smooth(0, 0.18, p)) * // intro
        (1 - 0.45 * smooth(0.42, 0.48, p) * (1 - smooth(0.5, 0.6, p))) * // breakdown
        (1 - 0.6 * smooth(0.86, 1, p)) // outro
      const kick = k % 4 === 0 ? 1 : 0.78 + 0.22 * hash(i * 3.1)
      amps[i] = Math.max(0.05, env * energy * kick * (0.6 + 0.4 * hash(i)))
    }
    track++
  }
  return { amps, cuts }
}

export function IntroScroll() {
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)
  const [caption, setCaption] = useState(reduced ? 2 : 0)
  const [cue, setCue] = useState(true)

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!section || !canvas || !ctx) return

    let W = 0
    let H = 0
    let set = buildSet(1)
    let lastCaption = -1
    let lastCue = true

    const layout = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = r.width
      H = r.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      set = buildSet(Math.ceil((W * 3.2) / STEP))
    }

    const progress = () => {
      if (reduced) return 0.5
      const r = section.getBoundingClientRect()
      const run = r.height - window.innerHeight
      return run <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / run))
    }

    const draw = (p: number, now: number) => {
      const L = set.amps.length * STEP
      const pos = p * L // playhead position along the set
      const centre = W / 2
      const mid = H / 2
      const maxH = H / 2 - 4
      const beat = reduced ? 0 : Math.pow(Math.max(0, Math.sin((now / 1000) * Math.PI * 2 * 2.07)), 6)
      ctx.clearRect(0, 0, W, H)

      const first = Math.max(0, Math.floor((pos - centre) / STEP) - 1)
      const last = Math.min(set.amps.length, Math.ceil((pos + centre) / STEP) + 1)
      for (let i = first; i < last; i++) {
        const x = centre + i * STEP - pos
        const d = x - centre
        let a = set.amps[i]
        if (d < 0 && d > -120) a *= 1 + 0.2 * beat * (1 + d / 120)
        const h = Math.max(1.5, a * maxH)
        ctx.fillStyle = d <= 0 ? C.played : d < 140 ? C.near : C.unplayed
        ctx.fillRect(x, mid - h, 2, h * 2)
      }
      // track cue points
      for (const c of set.cuts) {
        const x = centre + c * STEP - pos
        if (x < -2 || x > W + 2) continue
        ctx.fillStyle = x <= centre ? C.played : C.near
        ctx.fillRect(x, 0, 1, 8)
        ctx.fillRect(x, H - 8, 1, 8)
      }
      // fixed playhead
      ctx.fillStyle = C.head
      ctx.fillRect(Math.round(centre) - 1, 0, 2, H)
      ctx.beginPath()
      ctx.moveTo(centre - 6, 0)
      ctx.lineTo(centre + 6, 0)
      ctx.lineTo(centre, 7)
      ctx.fill()

      if (timeRef.current) timeRef.current.textContent = clock(p * SET_MINUTES)
      const cap = Math.min(2, Math.floor(p * 3.2))
      if (cap !== lastCaption && !reduced) {
        lastCaption = cap
        setCaption(cap)
      }
      const showCue = p < 0.04
      if (showCue !== lastCue) {
        lastCue = showCue
        setCue(showCue)
      }
    }

    layout()
    const ro = new ResizeObserver(() => {
      layout()
      draw(progress(), performance.now())
    })
    ro.observe(canvas)

    if (reduced) {
      draw(0.5, 0)
      return () => ro.disconnect()
    }

    let raf = 0
    let running = false
    const frame = (now: number) => {
      draw(progress(), now)
      if (running) raf = requestAnimationFrame(frame)
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true
        raf = requestAnimationFrame(frame)
      } else if (!e.isIntersecting && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    })
    io.observe(section)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    }
  }, [reduced])

  return (
    <section
      id="top"
      ref={sectionRef}
      aria-label="Intro"
      className={reduced ? 'relative' : 'relative h-[210svh] sm:h-[230svh]'}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12">
          <p className="relative h-[1.1em] type-display text-[clamp(1.9rem,6.4vw,4.25rem)]" aria-live="off">
            {CAPTIONS.map((c, i) => (
              <span
                key={c}
                className="absolute inset-x-0 top-0 transition-[opacity,transform] duration-500 ease-out-expo"
                style={{
                  opacity: caption === i ? 1 : 0,
                  transform: `translateY(${caption === i ? 0 : caption > i ? '-0.35em' : '0.35em'})`,
                  color: i === 2 ? 'var(--color-acid)' : undefined,
                }}
                aria-hidden={caption !== i}
              >
                {c}
              </span>
            ))}
          </p>
        </div>

        <canvas ref={canvasRef} aria-hidden className="mt-8 block h-[30svh] max-h-[280px] min-h-[140px] w-full sm:mt-12" />

        <div className="mx-auto mt-5 flex w-full max-w-[90rem] items-baseline justify-between px-5 font-mono text-[0.6875rem] tracking-[0.06em] text-dust uppercase sm:px-8 lg:px-12">
          <span>
            Deck A · <span ref={timeRef} className="text-bone tabular-nums">0:00:00</span>
          </span>
          <span>124 BPM</span>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center transition-opacity duration-500"
          style={{ opacity: cue && !reduced ? 1 : 0 }}
          aria-hidden
        >
          <span className="flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.08em] text-dust uppercase">
            Scroll to dig <ArrowDown className="size-3.5 animate-bounce text-acid" strokeWidth={2} />
          </span>
        </div>
      </div>
    </section>
  )
}
