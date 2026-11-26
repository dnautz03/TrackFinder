import { DOWNLOAD_URL, REPO_URL } from '@/lib/links'
import { KineticText } from '@/components/ui/kinetic-text'
import { MixHint, MixProvider, MixSwitch, MixWave, useMix } from '@/components/ui/mix-switch'
import { SignalGrid } from '@/components/ui/signal-grid'
import { GhostCta, PrimaryCta } from './Buttons'
import { SendToComputer } from './SendToComputer'
import { SignalDeck } from './SignalDeck'

export function Hero() {
  return (
    <MixProvider>
      <HeroStage />
    </MixProvider>
  )
}

function HeroStage() {
  const { rootRef } = useMix()
  return (
    <div id="top" ref={rootRef} className="mix-root">
      <div className="mix-panel relative overflow-clip">
        <SignalGrid />
        <section className="hero-grid relative mx-auto max-w-[90rem] gap-x-14 px-5 pt-24 pb-16 sm:px-8 sm:pt-32 lg:px-12 lg:pt-36 lg:pb-24">
          <h1 className="hero-head type-display text-[clamp(2.9rem,11.6vw,6rem)] uppercase lg:text-[min(6rem,8vw)]">
            <span className="sr-only">Less digging. More mixing.</span>
            <span className="line-in">
              <KineticText text="Less digging." />
            </span>
            <span className="line-in text-acid sm:pl-[0.9em]" style={{ animationDelay: '90ms' }}>
              <span className="relative whitespace-nowrap">
                <KineticText text="M" />
                <MixSwitch />
                <KineticText text="re" />
                <MixHint />
              </span>{' '}
              <KineticText text="mixing." />
            </span>
          </h1>

          <div className="hero-copy">
            <p
              className="fade-up mt-8 max-w-[34ch] text-[1.0625rem] leading-relaxed text-dust sm:mt-10 sm:text-[1.25rem]"
              style={{ animationDelay: '220ms' }}
            >
              Discover the tracks your favourite DJs play. Explore their sets, find new music and build your next selection.
            </p>

            <div className="fade-up mt-7 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center" style={{ animationDelay: '300ms' }}>
              <PrimaryCta href={DOWNLOAD_URL}>Get TrackFinder — Free</PrimaryCta>
              <GhostCta href={REPO_URL}>View on GitHub</GhostCta>
            </div>

            <div className="fade-up mt-5 hidden max-sm:pointer-coarse:block" style={{ animationDelay: '380ms' }}>
              <SendToComputer />
            </div>
          </div>

          <SignalDeck
            waveClass="hero-wave fade-up mt-8 lg:mt-0 [animation-delay:200ms]"
            listClass="hero-list fade-up mt-12 lg:mt-10 [animation-delay:420ms]"
          />
        </section>
      </div>
      <MixWave />
    </div>
  )
}
