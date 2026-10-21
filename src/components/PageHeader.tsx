import { Link } from 'react-router'
import type { Page } from '../data/site'
import './PageHeader.css'

/**
 * The cover of an inner sheet.
 *
 * Just the breadcrumb, so the first section starts straight under the
 * bar. The page name in it is still the page's h1, for screen readers
 * and search. On narrow screens the sheet's gridlines follow as jump
 * links, because a phone has no margin for the rail.
 */
export function PageHeader({ page }: { page: Page }) {
  return (
    <header className="page-head hatch-fade">
      <div className="shell">
        <div className="page-head__crumb tech">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="page-head__no" aria-hidden="true">{page.sheet}</span>
          <h1 id="page-title" tabIndex={-1}>
            {page.title}
          </h1>
        </div>

        {page.sections.length > 1 && (
          <nav className="page-head__jump" aria-label="On this page">
            <p className="tech">On this sheet</p>
            <ul>
              {page.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>
                    <span className="bubble">{s.grid}</span>
                    <span>{s.nav}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}
