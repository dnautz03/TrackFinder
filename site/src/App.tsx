import { Hero } from './components/Hero'
import { Nav } from './components/Nav'

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-acid px-4 py-2 font-semibold text-night focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
      </main>
    </>
  )
}
