import { useEffect, useState } from 'react'
import { DownloadCta } from './DownloadCta'

/** Placeholder wordmark until the real Underset logo arrives. */
export function Wordmark({ href = '#top' }: { href?: string }) {
  return (
    <a href={href} className="inline-flex items-center gap-2.5" aria-label={href === '#top' ? 'Underset, back to top' : 'Underset home'}>
      <svg viewBox="0 0 20 20" className="size-5 text-acid" aria-hidden fill="currentColor">
        <rect x="1" y="7" width="3" height="6" rx="1" />
        <rect x="6" y="3" width="3" height="14" rx="1" />
        <rect x="11" y="5" width="3" height="10" rx="1" />
        <rect x="16" y="8" width="3" height="4" rx="1" />
      </svg>
      <span className="font-display text-[1.05rem] font-bold tracking-[-0.02em] [font-stretch:115%] uppercase">Underset</span>
    </a>
  )
}

export function Nav() {
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    const on = () => setStuck(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ease-out-expo ${
        stuck ? 'border-b border-groove bg-night/92 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Wordmark />
        <div className="flex items-center">
          <DownloadCta size="sm" />
        </div>
      </nav>
    </header>
  )
}
