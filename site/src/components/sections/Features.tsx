import { m } from 'motion/react'
import { CalendarRange, Disc3, FileText, Headphones, Laptop, ListFilter, type LucideIcon } from 'lucide-react'
import { EASE, WordsReveal } from '@/components/ui/words-reveal'

type Feature = { title: string; text: string; icon: LucideIcon; motion: string; stamp: string }

/* Laid out like a tracklist: cue time, track, note. Each icon has its own hover move. */
const FEATURES: Feature[] = [
  { title: 'Discover tracks', text: 'Find the music your favourite DJs play.', icon: Disc3, motion: 'ic-spin', stamp: '0:00' },
  { title: 'Explore any time period', text: 'From a weekend to an entire year.', icon: CalendarRange, motion: 'ic-pop', stamp: '0:06' },
  { title: 'Less noise, more music', text: 'Filter out IDs and duplicate tracks.', icon: ListFilter, motion: 'ic-squeeze', stamp: '0:12' },
  { title: 'Keep digging', text: 'Jump to Spotify or SoundCloud for tracks linked there.', icon: Headphones, motion: 'ic-bob', stamp: '0:18' },
  { title: 'Make it yours', text: 'Export your selection as a TXT file.', icon: FileText, motion: 'ic-drop', stamp: '0:24' },
  { title: 'Free to use', text: 'Available for Windows and macOS.', icon: Laptop, motion: 'ic-pop', stamp: '0:30' },
]

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="mx-auto max-w-[90rem] scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
        <WordsReveal
          id="features-title"
          text="Built for the diggers."
          accentFrom={3}
          className="text-[clamp(2.25rem,7vw,4.75rem)] uppercase lg:col-span-8"
        />
        <m.p
          className="plate w-fit max-w-[34ch] text-[1.0625rem] leading-relaxed text-dust lg:col-span-4 lg:justify-self-end"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
        >
          Everything you need to go from a DJ&apos;s tracklists to your next selection.
        </m.p>
      </div>

      <ol className="mt-14 border-t border-groove lg:mt-20">
        {FEATURES.map((f, i) => {
          const Icon = f.icon
          return (
            <m.li
              key={f.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.7, ease: EASE, delay: (i % 3) * 0.07 }}
              className="group relative isolate grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-groove py-6 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:gap-x-6 sm:py-8 lg:grid-cols-[5rem_minmax(0,1.15fr)_minmax(0,1fr)_auto] lg:gap-x-10"
            >
              {/* hover fill that sweeps in from the left */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 origin-left scale-x-0 bg-deck transition-transform duration-500 ease-out-expo group-hover:scale-x-100"
              />
              <span className="plate w-fit font-mono text-xs text-dust tabular-nums transition-colors group-hover:text-acid">
                {String(i + 1).padStart(2, '0')}
                <span className="hidden sm:inline"> · {f.stamp}</span>
              </span>
              <h3 className="type-display w-fit text-[clamp(1.45rem,4.6vw,2.75rem)] leading-[1] uppercase transition-[color,translate] duration-300 ease-out-expo group-hover:translate-x-1.5 group-hover:text-acid">
                <span className="plate">{f.title}</span>
              </h3>
              <p className="plate col-start-2 row-start-2 w-fit max-w-[38ch] text-[0.98rem] leading-relaxed text-dust sm:text-[1.0625rem] lg:col-start-3 lg:row-start-1">
                {f.text}
              </p>
              <span className="col-start-3 row-span-2 row-start-1 grid size-12 place-items-center self-center rounded-full border border-groove bg-night text-bone transition-colors duration-300 group-hover:border-acid group-hover:bg-acid group-hover:text-night sm:size-14 lg:col-start-4 lg:row-span-1">
                <Icon className={`size-5 sm:size-6 ${f.motion}`} strokeWidth={1.75} aria-hidden />
              </span>
              {/* acid rule drawn along the bottom on hover */}
              <span
                aria-hidden
                className="absolute bottom-[-1px] left-0 h-px w-full origin-left scale-x-0 bg-acid transition-transform duration-700 ease-out-expo group-hover:scale-x-100"
              />
            </m.li>
          )
        })}
      </ol>
    </section>
  )
}
