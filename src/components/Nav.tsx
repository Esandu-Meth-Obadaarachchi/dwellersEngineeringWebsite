import { useEffect, useMemo, useRef, useState } from 'react'
import { sections, company } from '../data/company'
import { useActiveSection } from '../hooks/useActiveSection'
import { Crest } from './Crest'
import './Nav.css'

/**
 * The gridline navigator.
 *
 * On a wide screen the nav is the column grid running down the left
 * margin: one bubble per sheet, lettered A–H, with the active gridline
 * filled. On a narrow screen it collapses to a single bar and a sheet
 * index, because a margin is not something a phone has.
 */
export function Nav() {
  const ids = useMemo(() => sections.map((s) => s.id), [])
  const active = useActiveSection(ids)
  const [open, setOpen] = useState(false)
  const [lifted, setLifted] = useState(false)
  const panel = useRef<HTMLDivElement>(null)

  // The bar only gains its background once the hero is behind it.
  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        setLifted(window.scrollY > window.innerHeight * 0.65)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Escape closes the menu; focus returns to the toggle.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const activeMeta = sections.find((s) => s.id === active) ?? sections[0]

  return (
    <>
      {/* --- Top bar ----------------------------------------- */}
      <div className="nav" data-lifted={lifted || undefined}>
        <a className="nav__brand" href="#top">
          <Crest className="nav__crest" />
          <span className="nav__brand-name">
            Dwellers <span>Engineering</span>
          </span>
        </a>

        <p className="nav__sheet tech" aria-hidden="true">
          <span className="nav__sheet-grid">{activeMeta.grid}</span>
          Sheet {activeMeta.sheet} — {activeMeta.nav}
        </p>

        <a className="nav__call tech" href={`tel:${company.phoneHref}`}>
          {company.phone}
        </a>

        <button
          className="nav__toggle"
          type="button"
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="nav__toggle-bars" data-open={open} aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>

      {/* --- Gridline rail (wide screens) --------------------- */}
      <nav className="rail" aria-label="Sections">
        <ul>
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} data-active={s.id === active}>
                <span className="bubble" data-active={s.id === active}>
                  {s.grid}
                </span>
                <span className="rail__label tech">{s.nav}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* --- Menu (narrow screens) ---------------------------- */}
      <div
        id="nav-menu"
        className="menu"
        data-open={open}
        ref={panel}
        hidden={!open}
      >
        <ul>
          {sections.map((s, i) => (
            <li key={s.id} style={{ '--i': i } as React.CSSProperties}>
              <a href={`#${s.id}`} onClick={() => setOpen(false)}>
                <span className="tech menu__grid">{s.grid}</span>
                <span className="menu__label">{s.nav}</span>
                <span className="tech menu__sheet">{s.sheet}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="menu__foot">
          <a className="tech" href={`tel:${company.phoneHref}`}>
            {company.phone}
          </a>
          <a className="tech" href={`mailto:${company.email}`}>
            {company.email}
          </a>
        </div>
      </div>
    </>
  )
}
