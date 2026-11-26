import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import {
  AnimatePresence,
  m,
  useMotionValue,
  useMotionValueEvent,
  type MotionValue,
} from 'motion/react'
import { bezier, tween } from '@/lib/tween'
import { useReducedMotion } from '@/lib/use-reduced-motion'

const EASE_IN_WAVE = bezier(0.33, 0.05, 0.25, 1)
const EASE_OUT_WAVE = bezier(0.55, 0, 0.3, 1)

/**
 * "Digging → mixing" switch, adapted from Provably's verification toggle.
 * The hero starts in greyscale (digging). Flipping the switch — it sits in
 * place of the "O" in "MORE" — sends a colour wave out from it across the
 * hero (mixing). Click it, press M, or drag the knob to scrub the wave by
 * hand. Left alone, it flips itself on after a moment.
 */

type Ctx = {
  on: boolean
  interacted: boolean
  toggle: () => void
  scrub: (v: number) => void
  release: (on: boolean) => void
  progress: MotionValue<number>
  rootRef: RefObject<HTMLDivElement | null>
  switchRef: RefObject<HTMLButtonElement | null>
  layerRef: RefObject<HTMLDivElement | null>
}

const MixContext = createContext<Ctx | null>(null)

export const useMix = () => {
  const ctx = useContext(MixContext)
  if (!ctx) throw new Error('useMix must be used inside MixProvider')
  return ctx
}

const FEATHER = 110
const EXPAND = 0.9
const CONTRACT = 0.6

export function MixProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  const [on, setOn] = useState(false)
  const [interacted, setInteracted] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const switchRef = useRef<HTMLButtonElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const geo = useRef({ x: 0, y: 0, max: 0 })
  const onRef = useRef(false)
  const anim = useRef<{ stop: () => void } | null>(null)
  const progress = useMotionValue(0)

  // Reduced motion: start in colour, no wave (applied right after hydration)
  useEffect(() => {
    if (!reduced) return
    anim.current?.stop()
    onRef.current = true
    setOn(true)
    progress.set(1)
  }, [reduced, progress])

  // Writes the wave centre and edge into CSS variables; no React render per frame
  const paint = useCallback((v: number) => {
    const layer = layerRef.current
    if (!layer) return
    const { x, y, max } = geo.current
    const r = v * max
    layer.style.setProperty('--wx', `${x}px`)
    layer.style.setProperty('--wy', `${y}px`)
    layer.style.setProperty('--r0', `${Math.max(0, r - FEATHER)}px`)
    layer.style.setProperty('--r1', `${r}px`)
    layer.style.setProperty('--band', `${Math.sin(Math.min(1, v) * Math.PI)}`)
    layer.dataset.state = v >= 1 ? 'clear' : v <= 0 ? 'mono' : 'moving'
  }, [])

  const measure = useCallback(() => {
    const root = rootRef.current
    const sw = switchRef.current
    if (!root || !sw) return
    const rb = root.getBoundingClientRect()
    const b = sw.getBoundingClientRect()
    const x = b.left + b.width / 2 - rb.left
    const y = b.top + b.height / 2 - rb.top
    const far = Math.max(
      Math.hypot(x, y),
      Math.hypot(rb.width - x, y),
      Math.hypot(x, rb.height - y),
      Math.hypot(rb.width - x, rb.height - y),
    )
    geo.current = { x, y, max: far + FEATHER }
    paint(progress.get())
  }, [paint, progress])

  useMotionValueEvent(progress, 'change', paint)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [measure])

  const settle = useCallback(
    (next: boolean) => {
      onRef.current = next
      setOn(next)
      setInteracted(true)
      measure()
      anim.current?.stop()
      if (reduced) {
        progress.set(next ? 1 : 0)
        return
      }
      const distance = Math.abs((next ? 1 : 0) - progress.get())
      anim.current = tween(progress, next ? 1 : 0, {
        duration: (next ? EXPAND : CONTRACT) * Math.max(0.3, distance),
        delay: next && progress.get() === 0 ? 0.1 : 0,
        ease: next ? EASE_IN_WAVE : EASE_OUT_WAVE,
      })
    },
    [measure, progress, reduced],
  )

  const toggle = useCallback(() => settle(!onRef.current), [settle])
  const scrub = useCallback(
    (v: number) => {
      anim.current?.stop()
      setInteracted(true)
      progress.set(Math.min(1, Math.max(0, v)))
    },
    [progress],
  )

  const value = useMemo(
    () => ({ on, interacted, toggle, scrub, release: settle, progress, rootRef, switchRef, layerRef }),
    [on, interacted, toggle, scrub, settle, progress],
  )
  return <MixContext.Provider value={value}>{children}</MixContext.Provider>
}

/** Greyscale layer + lime band riding the wave front. Place it last inside the root. */
export function MixWave() {
  const { layerRef } = useMix()
  const reduced = useReducedMotion()
  return (
    <div ref={layerRef} className="mix-wave" data-state={reduced ? 'clear' : 'mono'} aria-hidden>
      <div className="mix-wave-gray" />
      <div className="mix-wave-band" />
    </div>
  )
}

const TRAVEL = 0.9 // knob travel in em; matches --knob-x when on

export function MixSwitch({ autoplayAfter = 2.2 }: { autoplayAfter?: number }) {
  const { on, interacted, toggle, scrub, release, progress, switchRef } = useMix()
  const reduced = useReducedMotion()
  const drag = useRef<{ x: number; from: number; moved: boolean; id: number } | null>(null)
  const dragEnded = useRef(false)

  // Left alone, it flips itself on once
  useEffect(() => {
    if (interacted || reduced || !autoplayAfter) return
    const t = window.setTimeout(toggle, autoplayAfter * 1000)
    return () => window.clearTimeout(t)
  }, [interacted, reduced, autoplayAfter, toggle])

  // M anywhere on the page flips it, unless typing or using a shortcut
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (e.key.toLowerCase() !== 'm' || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return
      if (t.closest('input, textarea, select, [contenteditable="true"]')) return
      toggle()
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [toggle])

  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return
    drag.current = { x: e.clientX, from: progress.get(), moved: false, id: e.pointerId }
  }
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    const btn = e.currentTarget
    if (!d) return
    const dx = e.clientX - d.x
    if (!d.moved) {
      if (Math.abs(dx) < 5) return
      d.moved = true
      btn.setPointerCapture(d.id)
      btn.dataset.dragging = 'true'
    }
    const travel = TRAVEL * parseFloat(getComputedStyle(btn).fontSize)
    const v = Math.min(1, Math.max(0, d.from + dx / travel))
    btn.style.setProperty('--knob-x', `${v * TRAVEL}em`)
    scrub(v)
  }
  const up = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    const btn = e.currentTarget
    drag.current = null
    if (!d?.moved) return
    dragEnded.current = true
    delete btn.dataset.dragging
    btn.style.removeProperty('--knob-x')
    release(progress.get() > 0.5)
  }
  const click = () => {
    if (dragEnded.current) {
      dragEnded.current = false
      return
    }
    toggle()
  }

  return (
    // The slot is an empty inline-block span, whose baseline is its bottom edge in
    // every browser; an empty <button> has no reliable baseline (Safari/Firefox
    // drop it below the text). The button just fills the slot.
    <span className="mix-slot">
      <button
        ref={switchRef}
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Switch from digging to mixing"
        aria-keyshortcuts="M"
        onClick={click}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className="mix-switch"
      >
        <span className="mix-track" />
        <span className="mix-knob">
          <span className="mix-record" />
        </span>
      </button>
    </span>
  )
}

/**
 * "← Click to mix [M]" pointing at the switch from the right of "MORE".
 * Desktop only; on phones the switch flips itself on a moment after load.
 */
export function MixHint() {
  const { interacted } = useMix()
  const reduced = useReducedMotion()
  return (
    <AnimatePresence>
      {!interacted && !reduced && (
        <m.span
          className="mix-hint"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.9, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          aria-hidden
        >
          <span className="mix-hint-arrow">←</span> Click to mix <kbd className="mix-key">M</kbd>
        </m.span>
      )}
    </AnimatePresence>
  )
}
