import { useState } from 'react'
import { ArrowDownToLine, ArrowUpRight, Laptop } from 'lucide-react'
import { guideUrl } from '@/lib/links'
import { AppleMark, WindowsMark, primaryClass, useMagnet } from './Buttons'

/**
 * The main call to action, adapted to the visitor's platform:
 *   Windows / macOS → the install guide, which starts that file's download,
 *   phone/tablet → "Send the link to your computer", anything else → the guide.
 * All four variants are in the markup; an inline script in index.html sets
 * <html data-platform> before first paint and CSS shows the matching one, so
 * nothing flickers or shifts and the prerendered HTML stays valid.
 */
type Size = 'lg' | 'sm'

function useShare() {
  const [state, setState] = useState<'idle' | 'copied' | 'manual'>('idle')
  const url = typeof window === 'undefined' ? '' : window.location.origin + window.location.pathname
  const share = async () => {
    const data = { title: 'Underset', text: 'Underset: find the tracks your favourite DJs play.', url }
    try {
      if (navigator.share) {
        await navigator.share(data)
        return
      }
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return // closed the share sheet
    }
    try {
      await navigator.clipboard.writeText(url)
      setState('copied')
      window.setTimeout(() => setState('idle'), 2600)
    } catch {
      setState('manual') // in-app browsers without share or clipboard: show the link
    }
  }
  return { state, share, url }
}

export function DownloadCta({ size = 'lg' }: { size?: Size }) {
  const win = useMagnet<HTMLAnchorElement>()
  const mac = useMagnet<HTMLAnchorElement>()
  const other = useMagnet<HTMLAnchorElement>()
  const { state, share, url } = useShare()
  const lg = size === 'lg'
  const icon = 'size-[1.15em] shrink-0'
  const arrow = 'size-[1.1em] transition-transform duration-300 ease-out-expo'

  return (
    <>
      <a {...win} href={guideUrl('windows')} className={`cta-v cta-windows ${primaryClass(size)}`}>
        <WindowsMark className={icon} />
        {lg ? 'Download for Windows — Free' : 'Download'}
        <ArrowDownToLine aria-hidden className={`${arrow} group-hover:translate-y-0.5`} strokeWidth={2.25} />
      </a>
      <a {...mac} href={guideUrl('mac')} className={`cta-v cta-mac ${primaryClass(size)}`}>
        <AppleMark className={`${icon} -mt-0.5`} />
        {lg ? 'Download for macOS — Free' : 'Download'}
        <ArrowDownToLine aria-hidden className={`${arrow} group-hover:translate-y-0.5`} strokeWidth={2.25} />
      </a>
      <button type="button" onClick={share} className={`cta-v cta-mobile ${primaryClass(size)}`}>
        <Laptop className={icon} strokeWidth={2} aria-hidden />
        <span aria-live="polite">
          {state === 'copied' ? 'Link copied' : lg ? 'Send the link to your computer' : 'Send link'}
        </span>
      </button>
      <a {...other} href={guideUrl()} className={`cta-v cta-other ${primaryClass(size)}`}>
        {lg ? 'Get Underset — Free' : 'Get Underset'}
        <ArrowUpRight aria-hidden className={`${arrow} group-hover:translate-x-0.5 group-hover:-translate-y-0.5`} strokeWidth={2.25} />
      </a>
      {state === 'manual' && (
        <p className="basis-full text-sm text-dust">
          Copy this link and open it on your computer:{' '}
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="mt-2 block w-full rounded-lg border border-groove bg-deck px-3 py-2 font-mono text-xs text-bone"
          />
        </p>
      )}
    </>
  )
}
