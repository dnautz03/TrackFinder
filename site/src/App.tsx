import { MotionConfig } from 'motion/react'
import { Hero } from './components/Hero'
import { Features } from './components/sections/Features'
import { FinalCta } from './components/sections/FinalCta'
import { Footer } from './components/sections/Footer'
import { HowItWorks } from './components/sections/HowItWorks'
import { ProblemSolution } from './components/sections/ProblemSolution'
import { Nav } from './components/Nav'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-acid px-4 py-2 font-semibold text-night focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <FinalCta />
      </main>
      <Footer />
    </MotionConfig>
  )
}
