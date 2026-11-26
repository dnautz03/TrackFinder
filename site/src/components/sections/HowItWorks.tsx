import { useEffect, useRef, useState, type ReactNode } from 'react'
import { m, useInView, useScroll } from 'motion/react'
import { Search } from 'lucide-react'
import { EASE, WordsReveal } from '@/components/ui/words-reveal'
import { useReducedMotion } from '@/lib/use-reduced-motion'

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

const NAMES = ['Mira Kessel', 'Kaelo', 'Juno Raas', 'Talen Roux']
type Phase = 'typing' | 'hold' | 'press' | 'done' | 'clear'

/**
 * A search field that types a DJ name letter by letter (each letter eases in),
 * presses "Find tracks", then fades the name away and types the next one.
 */
function TypeDj({ active }: { active: boolean }) {
  const reduced = useReducedMotion()
  const [n, setN] = useState(0)
  const [count, setCount] = useState(0)
  const [phase, setPhase] = useState<Phase>('typing')

  useEffect(() => {
    if (reduced) {
      setCount(NAMES[0].length)
      setPhase('done')
      return
    }
    if (!active) return
    const name = NAMES[n]
    const wait = (ms: number, fn: () => void) => {
      const t = window.setTimeout(fn, ms)
      return () => window.clearTimeout(t)
    }
    if (phase === 'typing') {
      if (count < name.length) return wait(count === 0 ? 450 : 95, () => setCount((c) => c + 1))
      return wait(450, () => setPhase('press'))
    }
    if (phase === 'press') return wait(420, () => setPhase('done'))
    if (phase === 'done') return wait(1500, () => setPhase('clear'))
    if (phase === 'clear')
      return wait(380, () => {
        setN((v) => (v + 1) % NAMES.length)
        setCount(0)
        setPhase('typing')
      })
  }, [active, reduced, n, count, phase])

  const name = NAMES[n]
  const empty = count === 0
  return (
    <div className="flex h-14 w-full items-center gap-2 rounded-full border border-groove bg-night pr-1.5 pl-5">
      <Search className="size-4 shrink-0 text-dust" strokeWidth={2} />
      <span className="relative flex min-w-0 flex-1 items-center overflow-hidden pl-1 text-[1.0625rem]">
        {empty && <span className="absolute left-[9px] text-[#5c6253]">Search a DJ…</span>}
        <span
          className={`flex items-center whitespace-pre text-bone transition-[opacity,transform,filter] duration-300 ease-out-expo ${
            phase === 'clear' ? '-translate-y-2 opacity-0 blur-[3px]' : ''
          }`}
        >
          {[...name.slice(0, count)].map((ch, i) => (
            <span key={`${n}-${i}`} className="type-char">
              {ch}
            </span>
          ))}
          <span className={`type-caret ml-[2px] h-5 w-[2px] bg-acid ${phase === 'typing' ? 'is-typing' : ''}`} />
        </span>
      </span>
      <span
        className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-[background-color,color,scale] duration-200 ${
          phase === 'press' ? 'scale-95 bg-acid text-night' : phase === 'done' ? 'bg-acid text-night' : 'bg-deck text-dust'
        }`}
      >
        Find tracks
      </span>
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
              <m.span
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
        <m.div
          className="absolute inset-y-0 rounded-full bg-acid"
          animate={{ left: `${r.from * 100}%`, width: `${(r.to - r.from) * 100}%` }}
          transition={{ type: 'spring', stiffness: 160, damping: 24 }}
        />
        {[r.from, r.to].map((p, k) => (
          <m.span
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

const STEPS: { title: string; text: string; art: (active: boolean) => ReactNode }[] = [
  { title: 'Pick your DJ.', text: 'Type the name of the artist you want to dig into.', art: (a) => <TypeDj active={a} /> },
  { title: 'Choose your time range.', text: 'A quick period, or exact dates with Custom.', art: (a) => <RangePick active={a} /> },
  { title: 'Discover your next favourite tracks.', text: 'One clean list of everything they played.', art: (a) => <Discover active={a} /> },
]

function Step({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const ref = useRef<HTMLLIElement>(null)
  const inView = useInView(ref, { margin: '0px 0px -15% 0px' })
  return (
    <m.li
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
        className={`absolute top-2.5 left-0 size-[13px] rounded-full border-2 transition-colors duration-500 lg:top-[-31px] ${
          inView ? 'border-acid bg-acid' : 'border-[#3a3e33] bg-night'
        }`}
      />
      <h3 className="type-display text-[clamp(1.5rem,3.4vw,2.25rem)] leading-[1.02] uppercase">
        <span className="plate">{step.title}</span>
      </h3>
      <p className="plate mt-3 w-fit max-w-[32ch] text-dust">{step.text}</p>
      <div className="mt-7 flex min-h-[148px] items-center rounded-[20px] border border-groove bg-[#101210] p-5 sm:p-6" aria-hidden>
        {step.art(inView)}
      </div>
    </m.li>
  )
}

export function HowItWorks() {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 60%'] })
  const fill = scrollYProgress

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
          <m.div className="h-full w-full origin-top bg-acid lg:hidden" style={{ scaleY: fill }} />
          <m.div className="hidden h-full w-full origin-left bg-acid lg:block" style={{ scaleX: fill }} />
        </div>
        <ol ref={ref} className="grid grid-cols-1 gap-14 lg:grid-cols-3 lg:gap-10">
          {STEPS.map((s, i) => (
            <Step key={s.title} step={s} index={i} />
          ))}
        </ol>
      </div>
    </section>
  )
}
