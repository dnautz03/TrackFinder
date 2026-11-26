import type { MotionValue } from 'motion/react'

/** Cubic-bezier easing (same maths as CSS), solved with a few Newton steps. */
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const a = (a1: number, a2: number) => 1 - 3 * a2 + 3 * a1
  const b = (a1: number, a2: number) => 3 * a2 - 6 * a1
  const c = (a1: number) => 3 * a1
  const at = (t: number, a1: number, a2: number) => ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t
  const slope = (t: number, a1: number, a2: number) => 3 * a(a1, a2) * t * t + 2 * b(a1, a2) * t + c(a1)
  return (x: number) => {
    if (x <= 0 || x >= 1) return x
    let t = x
    for (let i = 0; i < 6; i++) {
      const s = slope(t, x1, x2)
      if (s === 0) break
      t -= (at(t, x1, x2) - x) / s
    }
    return at(t, y1, y2)
  }
}

/**
 * Tween a MotionValue with requestAnimationFrame. A tiny stand-in for Motion's
 * `animate()`, so the main bundle doesn't carry the full animation engine.
 */
export function tween(
  value: MotionValue<number>,
  to: number,
  { duration, delay = 0, ease }: { duration: number; delay?: number; ease: (t: number) => number },
) {
  const from = value.get()
  let raf = 0
  let start = 0
  const frame = (now: number) => {
    if (!start) start = now + delay * 1000
    const t = Math.min(1, Math.max(0, (now - start) / (duration * 1000)))
    value.set(from + (to - from) * ease(t))
    if (t < 1) raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)
  return { stop: () => cancelAnimationFrame(raf) }
}
