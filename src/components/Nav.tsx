import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { company } from '../data/company'
import { pages, pageFor } from '../data/site'
import { useActiveSection } from '../hooks/useActiveSection'
import { Crest } from './Crest'
import './Nav.css'

/**
 * Navigation, in three parts.
 *
 * The bar carries the pages: one link per sheet in the drawing set.
 * The gridline rail down the left margin carries the sections of the
 * sheet you are on, lettered A, B, C, with the active gridline filled.
 * On a narrow screen both fold into a single bar and a sheet index,
 * because a margin is not something a phone has.
 */
export function Nav() {
  const { pathname } = useLocation()
  const page = pageFor(pathname)
  const isHome = page?.path === '/'

  const ids = useMemo(() => page?.sections.map((s) => s.id) ?? [], [page])
  const active = useActiveSection(ids)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const panel = useRef<HTMLElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)

  // On the home page the bar only gains its background once the hero
  // is behind it. Every other sheet opens on a plain header, so the bar
  // is solid from the start.
  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        setScrolled(window.scrollY > window.innerHeight * 0.65)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // A new page always arrives with the menu shut.
  useEffect(() => setOpen(false), [pathname])

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

  // Opening the menu moves focus to its first link; closing it hands
  // focus back to the control that opened it.
  const wasOpen = useRef(false)
  useEffect(() => {
    if (open) {
      panel.current?.querySelector('a')?.focus()
    } else if (wasOpen.current) {
      toggle.current?.focus()
    }
    wasOpen.current = open
  }, [open])

  const activeSection = page?.sections.find((s) => s.id === active) ?? page?.sections[0]
  const lifted = !isHome || scrolled
  const barPages = pages.filter((p) => p.path !== '/')

  return (
    <>
      {/* --- Top bar ----------------------------------------- */}
      <header className="nav" data-lifted={lifted || undefined}>
        <Link className="nav__brand" to="/">
          <Crest className="nav__crest" />
          <span className="nav__brand-name">
            Dwellers <span>Engineering</span>
          </span>
        </Link>

        {page && activeSection && (
          <p className="nav__sheet tech" aria-hidden="true">
            <span className="nav__sheet-grid">{activeSection.grid}</span>
            Sheet {activeSection.sheet} — {page.nav} / {activeSection.nav}
          </p>
        )}

        <nav className="nav__links" aria-label="Pages">
          <ul>
            {barPages.map((p) => (
              <li key={p.path}>
                <NavLink
                  to={p.path}
                  className={p.path === '/contact' ? 'nav__link nav__link--cta' : 'nav__link'}
                >
                  <span className="nav__link-no tech" aria-hidden="true">
                    {p.sheet}
                  </span>
                  {p.nav}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <a className="nav__call tech" href={`tel:${company.phoneHref}`}>
          {company.phone}
        </a>

        <button
          className="nav__toggle"
          ref={toggle}
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
      </header>

      {/* --- Gridline rail (wide screens) --------------------- */}
      {page && (
        <nav className="rail" aria-label={`Sections of ${page.nav}`}>
          <p className="rail__sheet tech" aria-hidden="true">
            {page.sheet}
          </p>
          <ul>
            {page.sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  data-active={s.id === active}
                  aria-current={s.id === active ? 'location' : undefined}
                >
                  <span className="bubble" data-active={s.id === active}>
                    {s.grid}
                  </span>
                  <span className="rail__label tech">{s.nav}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* --- Menu (narrow screens) ---------------------------- */}
      <nav
        id="nav-menu"
        className="menu"
        aria-label="Pages"
        ref={panel}
        hidden={!open}
      >
        <ul>
          {pages.map((p, i) => (
            <li key={p.path} style={{ '--i': i } as React.CSSProperties}>
              <NavLink to={p.path} onClick={() => setOpen(false)} end>
                <span className="tech menu__grid">{p.sheet}</span>
                <span className="menu__label">{p.nav}</span>
                <span className="tech menu__sheet">
                  {p.path === page?.path ? 'You are here' : ''}
                </span>
              </NavLink>
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
      </nav>
    </>
  )
}
