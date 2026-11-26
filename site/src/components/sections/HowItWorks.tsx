import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { Search } from 'lucide-react'
import { EASE, WordsReveal } from '@/components/ui/words-reveal'

/* Abstract step illustrations. They show the idea of each step, not the app's
   screens; real screenshots can sit beside them once available. */

function useLoop(active: boolean, ms: number, steps: number) {
  const [i, setI] = useState(0)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (!active || reduced) return
    const t = window.setInterval(() => setI((v) => (v + 1) % steps), ms)
    return () => window.clearInterval(t)
  }, [active, ms, steps, reduced])
  return i
}

const NAMES = ['Your favourite DJ', 'Mira Kessel', 'Kaelo', 'Juno Raas']

function TypeDj({ active }: { active: boolean }) {
  const reduced = useReducedMotion()
  const [text, setText] = useState(reduced ? NAMES[0] : '')
  useEffect(() => {
    if (!active || reduced) return
    let n = 0
    let pos = 0
    let deleting = false
    let t = 0
    const step = () => {
      const word = NAMES[n]
      if (!deleting) {
        pos++
        setText(word.slice(0, pos))
        if (pos === word.length) {
          deleting = true
          t = window.setTimeout(step, 1400)
          return
        }
        t = window.setTimeout(step, 70)
      } else {
        pos--
        setText(word.slice(0, pos))
        if (pos === 0) {
          deleting = false
          n = (n + 1) % NAMES.length
          t = window.setTimeout(step, 300)
          return
        }
        t = window.setTimeout(step, 32)
      }
    }
    t = window.setTimeout(step, 400)
    return () => window.clearTimeout(t)
  }, [active, reduced])

  return (
    <div className="flex h-14 w-full items-center gap-3 rounded-full border border-groove bg-night px-5">
      <Search className="size-4 shrink-0 text-dust" strokeWidth={2} />
      <span className="truncate text-[1.0625rem] text-bone">{text}</span>
      <span className="-ml-2 h-5 w-[2px] shrink-0 animate-pulse bg-acid" />
    </div>
  )
}

const RANGES = [
  { label: 'Weekend', from: 0.78, to: 0.84 },
  { label: 'Month', from: 0.58, to: 0.84 },
  { label: 'Year', from: 0.04, to: 0.84 },
  { label: 'Custom', from: 0.3, to: 0.62 },
]

function RangePick({ active }: { active: boolean }) {
  const i = useLoop(active, 1700, RANGES.length)
  const r = RANGES[i]
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2">
        {RANGES.map((x, k) => (
          <span key={x.label} className="relative rounded-full px-3.5 py-1.5 text-sm">
            {k === i && (
              <motion.span
                layoutId="range-chip"
                className="absolute inset-0 rounded-full bg-acid"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className={`relative transition-colors ${k === i ? 'text-night' : 'text-dust'}`}>{x.label}</span>
          </span>
        ))}
      </div>
      <div className="relative mt-6 h-2 rounded-full bg-groove">
        <motion.div
          className="absolute inset-y-0 rounded-full bg-acid"
          animate={{ left: `${r.from * 100}%`, width: `${(r.to - r.from) * 100}%` }}
          transition={{ type: 'spring', stiffness: 160, damping: 24 }}
        />
        {[r.from, r.to].map((p, k) => (
          <motion.span
            key={k}
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-acid bg-night"
            animate={{ left: `${p * 100}%` }}
            transition={{ type: 'spring', stiffness: 160, damping: 24 }}
          />
        ))}
      </div>
    </div>
  )
}

const FOUND = [
  ['Seren Moto', 'Glasshouse'],
  ['Talen Roux', 'Afterlight'],
  ['Kaelo', 'Undertow'],
]

function Discover({ active }: { active: boolean }) {
  const playing = useLoop(active, 1500, FOUND.length)
  return (
    <ul className="w-full">
      {FOUND.map(([a, t], k) => (
        <li key={a} className="flex items-center gap-3 border-b border-groove py-2.5 last:border-0">
          <span className="w-5 font-mono text-[0.6875rem] text-dust">{String(k + 1).padStart(2, '0')}</span>
          <span className="min-w-0 flex-1 truncate text-[0.95rem]">
            <span className="font-semibold text-bone">{a}</span>
            <span className="text-dust"> – {t}</span>
          </span>
          <span className="flex h-3.5 items-end gap-[2px]" aria-hidden>
            {[0, 1, 2].map((b) => (
              <span
                key={b}
                className={`w-[3px] rounded-sm ${k === playing ? 'eq-bar bg-acid' : 'bg-[#3a3e33]'}`}
                style={{ height: k === playing ? undefined : `${4 + b * 2}px`, animationDelay: `${b * 120}ms` }}
              />
            ))}
          </span>
        </li>
      ))}
    </ul>
  )
}

const STEPS: { n: string; title: string; text: string; art: (active: boolean) => ReactNode }[] = [
  { n: '01', title: 'Pick your DJ.', text: 'Type the name of the artist you want to dig into.', art: (a) => <TypeDj active={a} /> },
  { n: '02', title: 'Choose your time range.', text: 'A quick period, or exact dates with Custom.', art: (a) => <RangePick active={a} /> },
  { n: '03', title: 'Discover your next favourite tracks.', text: 'One clean list of everything they played.', art: (a) => <Discover active={a} /> },
]

function Step({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const ref = useRef<HTMLLIElement>(null)
  const inView = useInView(ref, { margin: '0px 0px -15% 0px' })
  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay: index * 0.12 }}
      className="relative flex flex-col pl-10 lg:pl-0"
    >
      {/* node on the progress line */}
      <span
        aria-hidden
        className={`absolute top-1 left-0 size-[13px] rounded-full border-2 transition-colors duration-500 lg:top-[-31px] ${
          inView ? 'border-acid bg-acid' : 'border-[#3a3e33] bg-night'
        }`}
      />
      <span className="font-mono text-sm text-acid">{step.n}</span>
      <h3 className="type-display mt-3 text-[clamp(1.5rem,3.4vw,2.25rem)] leading-[1.02] uppercase">{step.title}</h3>
      <p className="mt-3 max-w-[32ch] text-dust">{step.text}</p>
      <div className="mt-7 flex min-h-[148px] items-center rounded-[20px] border border-groove bg-deck/50 p-5 sm:p-6" aria-hidden>
        {step.art(inView)}
      </div>
    </motion.li>
  )
}

export function HowItWorks() {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 60%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="mx-auto max-w-[90rem] scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40"
    >
      <WordsReveal
        id="how-title"
        text="From tracklists to your next set."
        accentFrom={4}
        className="max-w-[16ch] text-[clamp(2.25rem,7vw,4.75rem)] uppercase"
      />
      <div className="relative mt-16 lg:mt-24">
        {/* progress line: vertical on phones, horizontal on desktop; fills as you scroll */}
        <div aria-hidden className="absolute top-2 bottom-2 left-[6px] w-px bg-groove lg:top-[-25px] lg:right-0 lg:bottom-auto lg:left-0 lg:h-px lg:w-auto">
          <motion.div className="h-full w-full origin-top bg-acid lg:hidden" style={{ scaleY: fill }} />
          <motion.div className="hidden h-full w-full origin-left bg-acid lg:block" style={{ scaleX: fill }} />
        </div>
        <ol ref={ref} className="grid grid-cols-1 gap-14 lg:grid-cols-3 lg:gap-10">
          {STEPS.map((s, i) => (
            <Step key={s.n} step={s} index={i} />
          ))}
        </ol>
      </div>
    </section>
  )
}
