import { m } from 'motion/react'
import { Plus } from 'lucide-react'
import { FAQ } from '@/lib/faq'
import { EASE, WordsReveal } from '@/components/ui/words-reveal'

/** Native <details>: works without JavaScript, keyboard and screen readers included. */
export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="mx-auto grid max-w-[90rem] scroll-mt-20 grid-cols-1 gap-10 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12 lg:gap-14 lg:px-12"
    >
      <div className="lg:col-span-5">
        <WordsReveal id="faq-title" text="Questions, answered." accentFrom={1} className="text-[clamp(2.25rem,6vw,3.5rem)] uppercase lg:text-[min(3.5rem,3.6vw)]" />
      </div>
      <div className="lg:col-span-7">
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
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
              <span className="plate text-lg font-semibold text-bone transition-colors group-hover:text-acid sm:text-xl">{item.q}</span>
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-groove bg-night text-bone transition-[transform,background-color,color,border-color] duration-300 ease-out-expo group-open:rotate-45 group-open:border-acid group-open:bg-acid group-open:text-night">
                <Plus className="size-4" strokeWidth={2.25} aria-hidden />
              </span>
            </summary>
            <p className="faq-answer plate max-w-[62ch] pb-6 text-[1.0625rem] leading-relaxed text-dust">{item.a}</p>
          </m.details>
        ))}
      </div>
    </section>
  )
}
