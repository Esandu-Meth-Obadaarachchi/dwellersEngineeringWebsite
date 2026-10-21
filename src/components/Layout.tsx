import { useEffect, useLayoutEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'
import { pageFor } from '../data/site'
import { company } from '../data/company'
import { Nav } from './Nav'
import { Footer } from './Footer'

/**
 * The frame every page sits in: skip link, nav, footer.
 *
 * It also does the three jobs a browser does for free on a real page
 * load but not on a client-side route change: put the scroll position
 * where the reader expects it, update the document title and meta
 * description, and move focus so a screen reader announces the page.
 */
export function Layout() {
  const { pathname, hash } = useLocation()
  const page = pageFor(pathname)
  const first = useRef(true)

  // Scroll: to the anchor if there is one, otherwise to the top.
  // A layout effect, so the new page never paints at the old position.
  useLayoutEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) {
        el.scrollIntoView()
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  // Title and description.
  useEffect(() => {
    document.title = !page
      ? `Page not found — ${company.name}`
      : page.path !== '/'
        ? `${page.title} — ${company.name}`
        : `${company.name} — ${company.tagline.replace(/\.$/, '')}`

    const meta = document.querySelector('meta[name="description"]')
    if (meta && page) meta.setAttribute('content', page.description)
  }, [page])

  // Focus: after a navigation, not on first load, hand focus to the
  // new page's heading (or to main) so assistive tech reads it.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (hash) return
    const target =
      document.getElementById('page-title') ?? document.getElementById('main')
    target?.focus({ preventScroll: true })
  }, [pathname, hash])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Nav />

      <main id="main" tabIndex={-1} key={pathname} className="page-enter">
        <Outlet />
      </main>

      <Footer />
    </>
  )
}
