import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Hairline grid behind the hero, adapted from the Provably grid lines.
 * Lime "signal" segments run down the lines (pure CSS animations), and on
 * desktop the lines nearest the pointer light up. Nothing re-renders per frame.
 */

type Pulse = { key: string; x: number; duration: number; delay: number; tone: string }

// Head colour of each flowing segment
const TONES = ['#c8ff2e', '#c8ff2e', '#d9ff73', 'rgb(236 238 228 / 0.7)']

const random = (seed: number) => {
  const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return v - Math.floor(v)
}

export function SignalGrid({ className }: { className?: string }) {
  const reduced = useReducedMotion()
  const [lines, setLines] = useState<number[]>([])
  const [pulses, setPulses] = useState<Pulse[]>([])
  const gridRef = useRef<HTMLDivElement>(null)
  const glintsRef = useRef<HTMLDivElement>(null)
  const pulsesRef = useRef<HTMLDivElement>(null)
  const geo = useRef({ lines: [] as number[], step: 120 })

  // Place lines and pulses from the real CSS grid step
  useEffect(() => {
    const grid = gridRef.current
    const layer = pulsesRef.current
    if (!grid || !layer) return

    const place = () => {
      const step = parseFloat(getComputedStyle(grid).getPropertyValue('--sg-step')) || 120
      const { width, height } = grid.getBoundingClientRect()
      const centre = width / 2
      const reach = Math.floor(centre / step)
      const xs: number[] = []
      const next: Pulse[] = []
      layer.style.setProperty('--sg-travel', `${height + 200}px`)
      for (let i = -reach; i <= reach; i++) {
        const x = centre + i * step
        if (x < 1 || x > width - 1) continue
        xs.push(x)
        if (random(i + 50) > 0.8) continue
        // Slow, continuous flow: long cycles, no pause between passes, and a
        // negative delay so segments are already mid-flight when the page opens.
        const duration = 14 + random(i + 90) * 12
        const tone = TONES[Math.floor(random(i + 170) * TONES.length)]
        const count = random(i + 210) > 0.5 ? 2 : 1
        for (let k = 0; k < count; k++) {
          next.push({
            key: `${i}-${k}`,
            x,
            duration,
            delay: -(random(i + 130) * duration + (k * duration) / count),
            tone,
          })
        }
      }
      geo.current = { lines: xs, step }
      setLines(xs)
      setPulses(next)
    }

    const ro = new ResizeObserver(place)
    ro.observe(grid)

    // Pulses only run while on screen in a visible tab
    let onScreen = true
    const sync = () => {
      layer.dataset.paused = String(!onScreen || document.hidden)
    }
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting
      sync()
    })
    io.observe(layer)
    document.addEventListener('visibilitychange', sync)
    return () => {
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  // Pointer glint: eases toward the pointer, lights the nearest lines (mouse only)
  useEffect(() => {
    const layer = glintsRef.current
    // the grid wrapper ignores the pointer, so listen on the section it decorates
    const panel = layer?.parentElement?.parentElement
    if (!layer || !panel || reduced) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const s = { tx: 0, ty: 0, x: 0, y: 0, level: 0, target: 0, frame: 0, running: false }

    const tick = () => {
      const { lines: xs, step } = geo.current
      s.x += (s.tx - s.x) * 0.18
      s.y += (s.ty - s.y) * 0.18
      s.level += (s.target - s.level) * 0.12
      layer.style.setProperty('--sg-gy', `${s.y}px`)
      for (let i = 0; i < layer.children.length; i++) {
        const strength = Math.max(0, 1 - Math.abs((xs[i] ?? -9999) - s.x) / (step * 0.85))
        ;(layer.children[i] as HTMLElement).style.opacity = (strength * strength * s.level).toFixed(3)
      }
      if (Math.abs(s.tx - s.x) < 0.5 && Math.abs(s.target - s.level) < 0.01) {
        s.running = false
        return
      }
      s.frame = requestAnimationFrame(tick)
    }
    const run = () => {
      if (s.running) return
      s.running = true
      s.frame = requestAnimationFrame(tick)
    }
    const move = (e: PointerEvent) => {
      if (!fine.matches) return
      const box = panel.getBoundingClientRect()
      s.tx = e.clientX - box.left
      s.ty = e.clientY - box.top
      if (s.level < 0.02) {
        s.x = s.tx
        s.y = s.ty
      }
      s.target = 1
      run()
    }
    const leave = () => {
      s.target = 0
      run()
    }
    panel.addEventListener('pointermove', move, { passive: true })
    panel.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(s.frame)
      panel.removeEventListener('pointermove', move)
      panel.removeEventListener('pointerleave', leave)
    }
  }, [reduced])

  return (
    <div className={cn('pointer-events-none absolute inset-0', className)} aria-hidden>
      <div ref={gridRef} className="sg-grid" />
      <div ref={glintsRef} className="sg-glints">
        {lines.map((x) => (
          <span key={x} className="sg-glint" style={{ left: x }} />
        ))}
      </div>
      <div ref={pulsesRef} className="sg-pulses">
        {!reduced &&
          pulses.map((p) => (
            <span
              key={p.key}
              className="sg-pulse"
              style={
                {
                  left: p.x,
                  '--sg-tone': p.tone,
                  '--sg-duration': `${p.duration.toFixed(2)}s`,
                  '--sg-delay': `${p.delay.toFixed(2)}s`,
                } as CSSProperties
              }
            />
          ))}
      </div>
    </div>
  )
}
