import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Section } from './Sections'
import { Reveal } from './Reveal'
import { Arrow } from './Arrow'
import { projects } from '../data/projects'
import './Projects.css'

/**
 * The portfolio grid.
 *
 * Everything comes from src/data/projects.ts. The category filter only
 * appears once there is more than one category to choose between.
 */
export function Portfolio() {
  const categories = useMemo(
    () => [...new Set(projects.map((p) => p.category))],
    [],
  )
  const [filter, setFilter] = useState<string | null>(null)
  const shown = filter ? projects.filter((p) => p.category === filter) : projects

  return (
    <Section
      id="portfolio"
      title="Selected work"
      note={`Portfolio · ${String(projects.length).padStart(2, '0')} projects`}
    >
      {projects.length === 0 ? (
        <Reveal className="portfolio-empty hatch">
          <p className="tech tech--gold">In preparation</p>
          <p>
            The project portfolio is being prepared. For references and
            completed work, speak to the office directly.
          </p>
          <div className="btn-row">
            <Link className="btn btn--solid" to="/contact">
              <span>Ask for references</span>
              <Arrow />
            </Link>
          </div>
        </Reveal>
      ) : (
        <>
          {categories.length > 1 && (
            <div className="portfolio-filter" role="group" aria-label="Filter by discipline">
              <button type="button" aria-pressed={filter === null} onClick={() => setFilter(null)}>
                All
              </button>
              {categories.map((c) => (
                <button key={c} type="button" aria-pressed={filter === c} onClick={() => setFilter(c)}>
                  {c}
                </button>
              ))}
            </div>
          )}

          <ul className="portfolio">
            {shown.map((p, i) => (
              <Reveal as="li" key={p.slug} delay={(i % 3) * 80} className="project">
                {p.cover && (
                  <picture className="project__cover">
                    <source srcSet={`${p.cover}.webp`} type="image/webp" />
                    <img
                      src={`${p.cover}.jpg`}
                      alt=""
                      width={1200}
                      height={900}
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                )}
                <div className="project__body">
                  <p className="tech project__meta">
                    <span>{p.location}</span>
                    <span aria-hidden="true">·</span>
                    <span>{p.year}</span>
                  </p>
                  <h3 className="project__title">{p.title}</h3>
                  <p className="tech tech--gold">{p.category}</p>
                  <p className="project__summary">{p.summary}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </>
      )}
    </Section>
  )
}
