import { Link } from 'react-router'
import { Arrow } from '../components/Arrow'
import { pages } from '../data/site'
import './NotFoundPage.css'

export function NotFoundPage() {
  return (
    <section className="not-found">
      <div className="shell">
        <p className="tech tech--gold">Sheet not in set · 404</p>
        <h1 id="page-title" tabIndex={-1}>
          No such sheet
        </h1>
        <p className="not-found__text">
          This page is not in the drawing set. It may have moved, or the link
          may be mistyped.
        </p>
        <div className="btn-row">
          <Link className="btn btn--solid" to="/">
            <span>Back to the home sheet</span>
            <Arrow />
          </Link>
        </div>
        <ul className="not-found__list">
          {pages
            .filter((p) => p.path !== '/')
            .map((p) => (
              <li key={p.path}>
                <Link to={p.path}>
                  <span className="tech">{p.sheet}</span>
                  {p.nav}
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </section>
  )
}
