import { useState } from 'react'
import { Section } from './Sections'
import { Reveal } from './Reveal'
import { services, process } from '../data/company'
import './Services.css'

/**
 * The service list, set as a drawing index.
 *
 * The discipline codes down the left are the structural device here:
 * C for civil, A for architectural, P for project, F for finishes,
 * I for infrastructure, E for engineering — which is how a drawing
 * register is actually numbered, and which tells the reader something
 * the plain list does not.
 */
export function Services() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <Section id="services" title="What we do" note="Drawing index · 07 sheets">
      <div className="services">
        <ol className="services__list">
          {services.map((s, i) => (
            <Reveal
              as="li"
              key={s.code}
              delay={i * 60}
              className="services__item"
            >
              <div
                className="services__row"
                data-active={active === i}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                <span className="services__code tech">{s.code}</span>
                <span className="services__name">{s.name}</span>
                <span className="services__rule" aria-hidden="true" />
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="services__aside">
          <div className="services__aside-inner hatch">
            <p className="tech tech--gold">Scope</p>
            <p>
              Work is taken from concept development and design through
              construction and final delivery, under one contract and one
              point of responsibility.
            </p>
            <div className="dim">
              <span className="dim__line" />
              <span className="dim__value">07 disciplines</span>
              <span className="dim__line" />
            </div>
          </div>
        </Reveal>
      </div>

      {/* The process, as a numbered sequence — the one place on this
          page where numbering is genuinely ordinal. */}
      <div className="process" id="method">
        <Reveal className="process__head">
          <h3>How a project runs</h3>
          <p className="tech">Six stages · concept to post-completion</p>
        </Reveal>

        <ol className="process__list">
          {process.map((p, i) => (
            <Reveal as="li" key={p.step} delay={i * 70} className="process__step">
              <span className="process__no tech">{String(i + 1).padStart(2, '0')}</span>
              <span className="process__label">{p.step}</span>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  )
}
