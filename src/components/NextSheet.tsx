import { Link } from 'react-router'
import { nextPage } from '../data/site'
import { Arrow } from './Arrow'
import './NextSheet.css'

/**
 * The foot of every inner page: a turn to the next sheet in the set,
 * so a reader never reaches a dead end.
 */
export function NextSheet({ from }: { from: string }) {
  const next = nextPage(from)

  return (
    <nav className="next-sheet" aria-label="Next page">
      <Link className="next-sheet__link shell" to={next.path}>
        <span className="tech next-sheet__label">Next sheet · {next.sheet}</span>
        <span className="next-sheet__title">
          {next.nav}
          <Arrow />
        </span>
        <span className="next-sheet__summary">{next.summary}</span>
      </Link>
    </nav>
  )
}
