import { useEffect, useRef } from 'react'
import { company } from '../data/company'
import { Crest } from './Crest'
import './Hero.css'

/**
 * The opening frame.
 *
 * The thesis is the company's own name, set at plot scale and measured
 * like an elevation — dimension strings run along it, because that is
 * what this company does to everything it builds. The crest sits in
 * the margin where a drawing stamp would be.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null)

  // A very small parallax on the backdrop — enough to give the type
  // depth, far too little to cost a frame.
  useEffect(() => {
    const el = root.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const y = window.scrollY
        if (y > window.innerHeight * 1.2) return
        el.style.setProperty('--shift', String(y * 0.22))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <header className="hero" ref={root}>
      <div className="hero__backdrop" aria-hidden="true">
        <picture>
          <source
            type="image/webp"
            sizes="100vw"
            srcSet="/assets/img/hero-720.webp 720w, /assets/img/hero-1040.webp 1040w, /assets/img/hero-1405.webp 1405w"
          />
          <img
            src="/assets/img/hero.jpg"
            alt=""
            width={1405}
            height={2123}
            decoding="async"
          />
        </picture>
      </div>

      <div className="hero__inner shell">
        <div className="hero__stamp">
          <Crest className="hero__crest" />
          <span className="tech">Est. Angoda · Sri Lanka</span>
        </div>

        <h1 className="hero__title">
          <span className="hero__line" style={{ '--i': 0 } as React.CSSProperties}>
            Dwellers
          </span>
          <span className="hero__line" style={{ '--i': 1 } as React.CSSProperties}>
            Engineering
          </span>
        </h1>

        {/* The tagline, dimensioned like a drawing note. */}
        <div className="hero__dim dim">
          <span className="dim__line" />
          <span className="dim__value">{company.tagline}</span>
          <span className="dim__line" />
        </div>

        <div className="hero__foot">
          <p className="hero__blurb">
            Civil and structural engineering, building construction and project
            management — delivered end to end, from the first survey peg to
            handover.
          </p>

          <a className="hero__cta" href="#contact">
            <span>Start a project</span>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M4 12h15m0 0-6-6m6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
          </a>
        </div>
      </div>

      <div className="hero__ticker" aria-hidden="true">
        <div className="hero__ticker-track tech">
          {Array.from({ length: 2 }, (_, k) => (
            <span key={k}>
              Civil &amp; Structural — Building Construction — Design Coordination —
              Project Management — Interior Fit-Out — Infrastructure —
              Engineering Consultancy —{' '}
            </span>
          ))}
        </div>
      </div>
    </header>
  )
}
