import { LazyMotion, MotionConfig } from 'motion/react'
import { Hero } from './components/Hero'
import { Features } from './components/sections/Features'
import { FinalCta } from './components/sections/FinalCta'
import { Footer } from './components/sections/Footer'
import { HowItWorks } from './components/sections/HowItWorks'
import { ProblemSolution } from './components/sections/ProblemSolution'
import { SignalGrid } from './components/ui/signal-grid'
import { Nav } from './components/Nav'

const loadFeatures = () => import('./lib/motion-features').then((r) => r.default)

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion strict features={loadFeatures}>
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-acid px-4 py-2 font-semibold text-night focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SignalGrid />
      <Nav />
      <main id="main">
        <Hero />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <FinalCta />
      </main>
      <Footer />
      </LazyMotion>
    </MotionConfig>
  )
}
