import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { DOWNLOAD_URL } from '@/lib/links'
import { SignalGrid } from '@/components/ui/signal-grid'
import { EASE, WordsReveal } from '@/components/ui/words-reveal'
import { PrimaryCta } from '../Buttons'
import { SendToComputer } from '../SendToComputer'

/** A record spinning slowly behind the closing call to action. */
function Record() {
  const grooves = Array.from({ length: 26 }, (_, i) => 118 + i * 7)
  return (
    <svg viewBox="0 0 640 640" className="record-spin size-full" aria-hidden>
      <defs>
        <path id="label-ring" d="M320 320m-68 0a68 68 0 1 1 136 0a68 68 0 1 1 -136 0" />
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.07" />
          <stop offset="0.65" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="320" cy="320" r="310" fill="#121410" />
      {grooves.map((r) => (
        <circle key={r} cx="320" cy="320" r={r} fill="none" stroke="#1d2019" strokeWidth="1.2" />
      ))}
      <circle cx="320" cy="320" r="310" fill="url(#sheen)" />
      <circle cx="320" cy="320" r="100" fill="#c8ff2e" />
      <text fill="#0b0c0a" fontSize="12" fontWeight="700" fontFamily="JetBrains Mono Variable, monospace">
        <textPath href="#label-ring" textLength="418" lengthAdjust="spacingAndGlyphs">
          TRACKFINDER · LESS DIGGING · MORE MIXING ·
        </textPath>
      </text>
      <circle cx="320" cy="320" r="7" fill="#0b0c0a" />
    </svg>
  )
}

export function FinalCta() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['12%', '-12%'])

  return (
    <section ref={ref} aria-labelledby="cta-title" className="relative isolate overflow-hidden border-t border-groove">
      <SignalGrid />
      <motion.div
        style={{ y }}
        className="pointer-events-none absolute top-1/2 right-[-38vw] -z-10 size-[110vw] max-h-[760px] max-w-[760px] -translate-y-1/2 opacity-80 sm:right-[-22vw] lg:right-[-8vw] lg:size-[56vw]"
      >
        <Record />
      </motion.div>

      <div className="relative mx-auto max-w-[90rem] px-5 py-28 sm:px-8 sm:py-36 lg:px-12 lg:py-48">
        <WordsReveal
          id="cta-title"
          text="Your next set starts here."
          accentFrom={3}
          className="max-w-[12ch] text-[clamp(2.9rem,10vw,7rem)] uppercase"
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
        >
          <p className="mt-8 max-w-[30ch] text-[1.125rem] leading-relaxed text-dust sm:text-[1.25rem]">
            Spend less time searching and more time discovering music.
          </p>
          <div className="mt-10 flex flex-col items-start gap-4">
            <PrimaryCta href={DOWNLOAD_URL}>Get TrackFinder for free</PrimaryCta>
            <p className="font-mono text-xs tracking-[0.04em] text-dust uppercase">Windows &amp; macOS · Free to use</p>
            <div className="hidden max-sm:pointer-coarse:block">
              <SendToComputer />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
