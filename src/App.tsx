import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { BuildSequence } from './components/BuildSequence'
import { About } from './components/About'
import { Services } from './components/Services'
import { Leadership } from './components/Leadership'
import { Values } from './components/Values'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

export function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {/* The drawing frame sits over everything and is inert. */}
      <div className="sheet-frame" aria-hidden="true" />

      <Nav />

      <main id="main">
        <div id="top" />
        <Hero />
        <BuildSequence />
        <About />
        <Services />
        <Leadership />
        <Values />
        <Contact />
      </main>

      <Footer />
    </>
  )
}
