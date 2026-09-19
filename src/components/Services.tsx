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
    </Section>
  )
}

/**
 * The method, as a numbered sequence — the one place on this page
 * where numbering is genuinely ordinal, because the stages happen in
 * this order and no other. These are the same six stages the 3D build
 * sequence steps through.
 */
export function Method() {
  return (
    <Section
      id="method"
      title="How a project runs"
      note="Six stages · concept to post-completion"
    >
      <ol className="process__list">
        {process.map((p, i) => (
          <Reveal as="li" key={p.step} delay={i * 70} className="process__step">
            <span className="process__no tech">{String(i + 1).padStart(2, '0')}</span>
            <span className="process__label">{p.step}</span>
          </Reveal>
        ))}
      </ol>

      <Reveal className="process__note">
        <div className="dim">
          <span className="dim__line" />
          <span className="dim__value">
            Watch these six stages build, above
          </span>
          <span className="dim__line" />
        </div>
      </Reveal>
    </Section>
  )
}
