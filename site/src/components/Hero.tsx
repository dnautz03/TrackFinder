import { DOWNLOAD_URL, REPO_URL } from '../lib/links'
import { GhostCta, PrimaryCta } from './Buttons'
import { SendToComputer } from './SendToComputer'
import { SignalDeck } from './SignalDeck'

export function Hero() {
  return (
    <section
      id="top"
      className="hero-grid relative mx-auto max-w-[90rem] gap-x-14 px-5 pt-24 pb-16 sm:px-8 sm:pt-32 lg:px-12 lg:pt-36 lg:pb-24"
    >
      <h1 className="hero-head type-display text-[clamp(2.9rem,11.6vw,6rem)] uppercase lg:text-[min(6rem,8vw)]">
        <span className="line-mask">
          <span className="line-rise">Less digging.</span>
        </span>
        <span className="line-mask">
          <span className="line-rise text-acid sm:pl-[0.9em]" style={{ animationDelay: '90ms' }}>
            More mixing.
          </span>
        </span>
      </h1>

      <div className="hero-copy">
        <p
          className="fade-up mt-8 max-w-[34ch] text-[1.0625rem] leading-relaxed text-dust sm:mt-9 sm:text-[1.25rem]"
          style={{ animationDelay: '220ms' }}
        >
          Discover the tracks your favourite DJs play. Explore their sets, find new music and build your next selection.
        </p>

        <div className="fade-up mt-7 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center" style={{ animationDelay: '300ms' }}>
          <PrimaryCta href={DOWNLOAD_URL}>Get TrackFinder — Free</PrimaryCta>
          <GhostCta href={REPO_URL}>View on GitHub</GhostCta>
        </div>

        <div className="fade-up mt-5 flex flex-col gap-2 sm:mt-6" style={{ animationDelay: '380ms' }}>
          <p className="font-mono text-xs tracking-[0.04em] text-dust uppercase">Free to use · Windows &amp; macOS</p>
          <div className="hidden max-sm:pointer-coarse:block">
            <SendToComputer />
          </div>
        </div>
      </div>

      <SignalDeck
        waveClass="hero-wave fade-up mt-8 lg:mt-0 [animation-delay:200ms]"
        listClass="hero-list fade-up mt-12 lg:mt-10 [animation-delay:420ms]"
      />
    </section>
  )
}
