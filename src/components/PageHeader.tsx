import { Link } from 'react-router'
import type { Page } from '../data/site'
import './PageHeader.css'

/**
 * The cover of an inner sheet.
 *
 * Smaller than the home hero, and built the same way: the page name at
 * display scale, its sheet number in the margin, and a summary set as
 * a dimension note. Below it, the sheet's own gridlines as jump links,
 * because a phone has no margin for the rail.
 */
export function PageHeader({ page }: { page: Page }) {
  return (
    <header className="page-head hatch-fade">
      <div className="shell">
        <p className="page-head__crumb tech">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Sheet {page.sheet}</span>
        </p>

        <div className="page-head__title">
          <span className="page-head__no" aria-hidden="true">
            {page.sheet}
          </span>
          <h1 id="page-title" tabIndex={-1}>
            {page.title}
          </h1>
        </div>

        <div className="page-head__dim dim dim--long">
          <span className="dim__line" />
          <span className="dim__value">{page.summary}</span>
          <span className="dim__line" />
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
