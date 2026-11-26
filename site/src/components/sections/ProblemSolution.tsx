import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { Check } from 'lucide-react'
import { EASE, WordsReveal } from '@/components/ui/words-reveal'

const BEFORE = ['Endless tracklists.', 'Too many browser tabs.', 'Repeated tracks.', 'Hours of manual digging.']
const AFTER = ['One search.', 'Your chosen date range.', 'Clean track results.', 'More time for music.']
const TAB_COUNT = 12

/**
 * A dozen open tracklist tabs collapse into a single TrackFinder tab, then
 * spill back out, on a loop while the section is on screen.
 */
function TabStorm() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '0px 0px -20% 0px' })
  const reduced = useReducedMotion()
  const [one, setOne] = useState(false)

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setOne(true)
      return
    }
    const first = window.setTimeout(() => setOne(true), 900)
    const loop = window.setInterval(() => setOne((v) => !v), 3600)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(loop)
    }
  }, [inView, reduced])

  return (
    <div
      ref={ref}
      className="relative flex min-h-[300px] items-center justify-center rounded-[20px] border border-groove bg-deck/50 p-5 sm:min-h-[360px] sm:p-8"
      aria-hidden
    >
      <motion.div layout className="flex max-w-[30rem] flex-wrap justify-center gap-2 sm:gap-2.5">
        <AnimatePresence mode="popLayout">
          {one ? (
            <motion.div
              key="one"
              layout
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="flex items-center gap-3 rounded-full bg-acid px-6 py-3.5 text-night"
            >
              <svg viewBox="0 0 20 20" className="size-5" fill="currentColor">
                <rect x="1" y="7" width="3" height="6" rx="1" />
                <rect x="6" y="3" width="3" height="14" rx="1" />
                <rect x="11" y="5" width="3" height="10" rx="1" />
                <rect x="16" y="8" width="3" height="4" rx="1" />
              </svg>
              <span className="font-display text-lg font-bold tracking-[-0.02em] [font-stretch:115%]">TrackFinder</span>
            </motion.div>
          ) : (
            Array.from({ length: TAB_COUNT }, (_, i) => (
              <motion.div
                key={`tab-${i}`}
                layout
                initial={{ opacity: 0, y: 10, rotate: (i % 3) - 1 }}
                animate={{ opacity: 1, y: 0, rotate: ((i * 7) % 5) - 2 }}
                exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.28, delay: (TAB_COUNT - i) * 0.02 } }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.04 }}
                className="flex items-center gap-2 rounded-lg border border-groove bg-night px-3 py-2 font-mono text-[0.6875rem] text-dust"
              >
                <span className="size-2 rounded-sm bg-[#3a3e33]" />
                Tracklist {String(i + 1).padStart(2, '0')}
                <span className="ml-1 text-[#5c6253]">×</span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function ListBlock({ title, items, kind }: { title: string; items: string[]; kind: 'before' | 'after' }) {
  return (
    <div>
      <h3 className={`mb-4 font-mono text-xs tracking-[0.06em] uppercase ${kind === 'after' ? 'text-acid' : 'text-dust'}`}>
        {title}
      </h3>
      <ul className="flex flex-col">
        {items.map((item, i) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: kind === 'before' ? -12 : 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
            className="flex items-center gap-3 border-b border-groove py-3.5 text-[1.0625rem] sm:text-lg"
          >
            {kind === 'before' ? (
              <span className="relative text-dust">
                {item}
                {/* acid strike drawn across once the row is in view */}
                <motion.span
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
                <motion.span
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-acid text-night"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.6 + i * 0.12 }}
                >
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                </motion.span>
                <span className="text-bone">{item}</span>
              </>
            )}
          </motion.li>
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
      <div className="mt-14 grid grid-cols-1 gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-6">
          <TabStorm />
        </div>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:col-span-6 lg:grid-cols-1 lg:gap-12">
          <ListBlock title="Before TrackFinder" items={BEFORE} kind="before" />
          <ListBlock title="With TrackFinder" items={AFTER} kind="after" />
        </div>
      </div>
    </section>
  )
}
