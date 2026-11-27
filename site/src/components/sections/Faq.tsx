import { useEffect, useRef, type MouseEvent } from 'react'
import { m } from 'motion/react'
import { Plus } from 'lucide-react'
import { FAQ } from '@/lib/faq'
import { EASE, WordsReveal } from '@/components/ui/words-reveal'

const DURATION = 420
const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)'

/**
 * Native <details>: works without JavaScript, keyboard and screen readers included.
 * With JavaScript, opening and closing slide smoothly (height + fade) and only
 * one answer stays open at a time.
 */
export function Faq() {
  const listRef = useRef<HTMLDivElement>(null)
  const running = useRef(new WeakMap<HTMLElement, Animation>())

  // The `name` group closes siblings instantly, which would cut their close
  // animation short. Once JS runs we handle "one open at a time" ourselves.
  useEffect(() => {
    listRef.current?.querySelectorAll('details').forEach((d) => d.removeAttribute('name'))
  }, [])

  function animate(details: HTMLDetailsElement, open: boolean) {
    const body = details.querySelector<HTMLElement>('.faq-body')
    if (!body) return
    details.dataset.expanded = open ? 'true' : 'false'

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    running.current.get(body)?.cancel()
    if (reduced) {
      details.open = open
      return
    }

    const from = details.open ? body.getBoundingClientRect().height : 0
    details.open = true
    const to = open ? body.scrollHeight : 0
    const anim = body.animate(
      [
        { height: `${from}px`, opacity: open ? 0 : 1 },
        { height: `${to}px`, opacity: open ? 1 : 0 },
      ],
      { duration: DURATION, easing: EASING },
    )
    running.current.set(body, anim)
    anim.onfinish = () => {
      running.current.delete(body)
      if (!open) details.open = false
    }
  }

  function onToggleClick(e: MouseEvent<HTMLElement>) {
    e.preventDefault()
    const details = e.currentTarget.parentElement as HTMLDetailsElement
    const opening = details.dataset.expanded !== 'true'
    if (opening) {
      listRef.current?.querySelectorAll<HTMLDetailsElement>('details[data-expanded="true"]').forEach((d) => {
        if (d !== details) animate(d, false)
      })
    }
    animate(details, opening)
  }

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="mx-auto grid max-w-[90rem] scroll-mt-20 grid-cols-1 gap-10 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12 lg:gap-14 lg:px-12"
    >
      <div className="lg:col-span-5">
        <WordsReveal id="faq-title" text="Questions, answered." accentFrom={1} className="text-[clamp(2.25rem,6vw,3.5rem)] uppercase lg:text-[min(3.5rem,3.6vw)]" />
      </div>
      <div ref={listRef} className="lg:col-span-7">
        {FAQ.map((item, i) => (
          <m.details
            key={item.q}
            name="faq"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -8% 0px' }}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.05 }}
            className="faq group border-b border-groove first:border-t"
          >
            <summary
              onClick={onToggleClick}
              className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden"
            >
              <span className="plate text-lg font-semibold text-bone transition-colors group-hover:text-acid sm:text-xl">{item.q}</span>
              <span className="faq-icon grid size-9 shrink-0 place-items-center rounded-full border border-groove bg-night text-bone transition-[transform,background-color,color,border-color] duration-300 ease-out-expo">
                <Plus className="size-4" strokeWidth={2.25} aria-hidden />
              </span>
            </summary>
            <div className="faq-body overflow-hidden">
              <p className="plate max-w-[62ch] pb-6 text-[1.0625rem] leading-relaxed text-dust">{item.a}</p>
            </div>
          </m.details>
        ))}
      </div>
    </section>
  )
}
