import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/lib/use-reduced-motion'

/**
 * Letters get heavier as the mouse comes near, adapted from Provably's
 * KineticText. Each letter's width is locked first, so the heavier weight
 * grows inside its own slot and nothing shifts. Off on touch screens and
 * with reduced motion. The parent provides the accessible text.
 */
export function KineticText({ text, rest = 800, peak = 900 }: { text: string; rest?: number; peak?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = ref.current
    if (!root || reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const chars = [...root.querySelectorAll<HTMLSpanElement>('.kt-char')]
    let centres: number[][] = []
    let frame = 0
    let radius = 0

    const lock = () => {
      root.dataset.locked = 'false'
      chars.forEach((c) => (c.style.width = ''))
      const widths = chars.map((c) => c.getBoundingClientRect().width)
      chars.forEach((c, i) => (c.style.width = `${widths[i]}px`))
      root.dataset.locked = 'true'
      radius = parseFloat(getComputedStyle(root).fontSize) * 1.15
    }
    const measure = () => {
      centres = chars.map((c) => {
        const b = c.getBoundingClientRect()
        return [b.left + b.width / 2, b.top + b.height / 2]
      })
    }
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!centres.length) measure()
        chars.forEach((c, i) => {
          const [x, y] = centres[i]
          const d = Math.hypot(e.clientX - x, (e.clientY - y) * 0.6)
          const reach = Math.max(0, 1 - d / radius)
          c.style.fontWeight = `${Math.round(rest + (peak - rest) * reach * reach)}`
        })
      })
    }
    const leave = () => {
      cancelAnimationFrame(frame)
      centres = []
      chars.forEach((c) => (c.style.fontWeight = ''))
    }

    const ro = new ResizeObserver(() => {
      centres = []
      lock()
    })
    document.fonts.ready.then(lock)
    ro.observe(root.parentElement ?? root)
    root.addEventListener('pointerenter', measure)
    root.addEventListener('pointermove', move)
    root.addEventListener('pointerleave', leave)
    const onScroll = () => (centres = [])
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      root.removeEventListener('pointerenter', measure)
      root.removeEventListener('pointermove', move)
      root.removeEventListener('pointerleave', leave)
      window.removeEventListener('scroll', onScroll)
    }
  }, [reduced, rest, peak])

  return (
    <span ref={ref} className="kt" aria-hidden>
      {/* Words never break apart; lines may still wrap between words */}
      {text.split(' ').map((word, w, words) => (
        <span key={`${word}-${w}`}>
          <span className="inline-block whitespace-nowrap">
            {[...word].map((ch, i) => (
              <span key={`${ch}-${i}`} className="kt-char">
                {ch}
              </span>
            ))}
          </span>
          {w < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </span>
  )
}
