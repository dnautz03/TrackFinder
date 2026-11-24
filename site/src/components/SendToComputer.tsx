import { useState } from 'react'
import { Laptop } from 'lucide-react'

/**
 * Phone visitors can't install a desktop app, so we let them send the link to
 * themselves through the phone's own share sheet. Nothing is collected.
 */
export function SendToComputer() {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = window.location.href.split('#')[0]
    const data = { title: 'TrackFinder', text: 'TrackFinder: find the tracks your favourite DJs play.', url }
    try {
      if (navigator.share) {
        await navigator.share(data)
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2400)
    } catch {
      /* user closed the share sheet */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex min-h-11 items-center gap-2.5 text-left text-[0.95rem] text-dust underline decoration-groove decoration-1 underline-offset-4 transition-colors hover:text-bone hover:decoration-dust"
    >
      <Laptop aria-hidden className="size-4 shrink-0 text-acid" strokeWidth={2} />
      <span aria-live="polite">{copied ? 'Link copied. Open it on your computer.' : 'Send the link to your computer'}</span>
    </button>
  )
}
