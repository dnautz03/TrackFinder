import { useRef, type ReactNode, type PointerEvent } from 'react'
import { ArrowUpRight, Search } from 'lucide-react'

/** Desktop-only magnetic pull. Does nothing on touch or with reduced motion. */
export function useMagnet<T extends HTMLElement>(strength = 0.25) {
  const ref = useRef<T>(null)
  const ok = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const onPointerMove = (e: PointerEvent<T>) => {
    const el = ref.current
    if (!el || !ok()) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) * strength
    const y = (e.clientY - r.top - r.height / 2) * strength
    el.style.transform = `translate(${x}px, ${y}px)`
  }
  const onPointerLeave = () => {
    if (ref.current) ref.current.style.transform = ''
  }
  return { ref, onPointerMove, onPointerLeave }
}

export function GithubMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

export function primaryClass(size: 'lg' | 'sm' = 'lg') {
  const pad = size === 'lg' ? 'h-14 px-7 text-[1.0625rem]' : 'h-10 px-4 text-sm'
  return `btn-sweep group inline-flex items-center justify-center gap-2 rounded-full bg-acid font-semibold text-night transition-[transform,background-color] duration-300 ease-out-expo select-none hover:bg-[#d6ff5c] active:scale-[0.97] active:bg-acid-deep ${pad}`
}

export function WindowsMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} fill="currentColor">
      <path d="M0 2.2 6.5 1.3v6.2H0zM7.3 1.2 16 0v7.5H7.3zM0 8.5h6.5v6.2L0 13.8zM7.3 8.5H16V16l-8.7-1.2z" />
    </svg>
  )
}

export function AppleMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} fill="currentColor">
      <path d="M11.18.008C11.152-.023 10.143.02 9.268.97c-.875.95-.74 2.04-.72 2.068s1.247.072 2.03-1.03.632-1.97.602-2m2.718 9.623c-.04-.08-1.906-1.006-1.732-2.784.174-1.779 1.361-2.266 1.38-2.319s-.484-.643-1.02-.943a3 3 0 0 0-1.28-.355c-.088-.002-.394-.077-1.022.095-.414.113-1.347.48-1.604.494-.258.015-1.025-.426-1.85-.543-.528-.102-1.088.107-1.489.268-.4.16-1.16.614-1.693 1.825-.532 1.21-.254 3.128-.054 3.724s.512 1.572 1.044 2.284c.473.803 1.1 1.36 1.362 1.55s1.002.317 1.515.055c.413-.253 1.158-.398 1.452-.387.293.011.872.126 1.464.443.47.162.913.095 1.36-.088.447-.184 1.09-.879 1.843-2.28q.428-.977.324-1.139" />
    </svg>
  )
}

export function PrimaryCta({ href, children, size = 'lg' }: { href: string; children: ReactNode; size?: 'lg' | 'sm' }) {
  const m = useMagnet<HTMLAnchorElement>()
  return (
    <a {...m} href={href} className={primaryClass(size)}>
      {children}
      <ArrowUpRight
        aria-hidden
        className="size-[1.1em] transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        strokeWidth={2.25}
      />
    </a>
  )
}

export function GhostCta({ href, children }: { href: string; children: ReactNode }) {
  const m = useMagnet<HTMLAnchorElement>(0.18)
  return (
    <a
      {...m}
      href={href}
      style={{ ['--sweep' as string]: 'rgb(200 255 46 / 0.16)' }}
      className="btn-sweep inline-flex h-14 items-center justify-center gap-2.5 rounded-full border border-groove bg-night px-6 text-[1.0625rem] font-medium text-bone transition-[transform,border-color,background-color] duration-300 ease-out-expo select-none hover:border-dust hover:bg-deck active:scale-[0.97]"
    >
      <GithubMark className="size-[1.05em]" />
      {children}
    </a>
  )
}

/** "Try here": opens the live preview (/try/). Hairline pill, like GhostCta, so the download stays the one acid button. */
export function TryCta({ href, size = 'lg' }: { href: string; size?: 'lg' | 'sm' }) {
  const m = useMagnet<HTMLAnchorElement>(0.18)
  const pad = size === 'lg' ? 'h-14 px-6 text-[1.0625rem]' : 'h-10 px-3.5 text-sm sm:px-4'
  return (
    <a
      {...m}
      href={href}
      style={{ ['--sweep' as string]: 'rgb(200 255 46 / 0.16)' }}
      className={`btn-sweep group inline-flex shrink-0 items-center justify-center gap-2 rounded-full whitespace-nowrap border border-groove bg-night font-medium text-bone transition-[transform,border-color,background-color] duration-300 ease-out-expo select-none hover:border-dust hover:bg-deck active:scale-[0.97] ${pad}`}
    >
      {/* In the phone nav there is no room for the icon */}
      <Search aria-hidden className={`size-[1.05em] text-acid ${size === 'sm' ? 'hidden sm:block' : ''}`} strokeWidth={2.25} />
      Try here
    </a>
  )
}
