import { m } from 'motion/react'
import { Check } from 'lucide-react'
import { EASE, WordsReveal } from '@/components/ui/words-reveal'
import { DjToTracklist } from './DjToTracklist'

const BEFORE = ['Endless tracklists.', 'Too many browser tabs.', 'Repeated tracks.', 'Hours of manual digging.']
const AFTER = ['One search.', 'Your chosen date range.', 'Clean track results.', 'More time for music.']
function ListBlock({ title, items, kind }: { title: string; items: string[]; kind: 'before' | 'after' }) {
  return (
    <div>
      <h3 className={`plate mb-4 w-fit font-mono text-xs tracking-[0.06em] uppercase ${kind === 'after' ? 'text-acid' : 'text-dust'}`}>
        {title}
      </h3>
      <ul className="flex flex-col">
        {items.map((item, i) => (
          <m.li
            key={item}
            initial={{ opacity: 0, x: kind === 'before' ? -12 : 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
            className="flex items-center gap-3 border-b border-groove py-3.5 text-[1.0625rem] sm:text-lg"
          >
            {kind === 'before' ? (
              <span className="plate relative text-dust">
                {item}
                {/* acid strike drawn across once the row is in view */}
                <m.span
                  aria-hidden
                  className="absolute top-1/2 left-0 h-[2px] w-full origin-left bg-acid/80"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.5 + i * 0.12 }}
                />
              </span>
            ) : (
              <>
                <m.span
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-acid text-night"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.6 + i * 0.12 }}
                >
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                </m.span>
                <span className="plate text-bone">{item}</span>
              </>
            )}
          </m.li>
        ))}
      </ul>
    </div>
  )
}

export function ProblemSolution() {
  return (
    <section aria-labelledby="problem-title" className="mx-auto max-w-[90rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40">
      <WordsReveal
        id="problem-title"
        text="Your favourite DJ. Hundreds of sets. One search."
        accentFrom={6}
        className="max-w-[18ch] text-[clamp(2.25rem,7vw,4.75rem)] uppercase"
      />
      <div className="mt-14 lg:mt-20">
        <DjToTracklist />
      </div>
      <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:mt-20 lg:gap-14">
        <ListBlock title="Before Underset" items={BEFORE} kind="before" />
        <ListBlock title="With Underset" items={AFTER} kind="after" />
      </div>
    </section>
  )
}
