import { Link } from 'react-router'
import { Section } from './Sections'
import { Reveal } from './Reveal'
import { Arrow } from './Arrow'
import { about, company, coreValues, directors, process, services } from '../data/company'
import { pages } from '../data/site'
import './Home.css'

/** Counts taken from the data itself, so they can never be wrong. */
const facts = [
  { value: services.length, label: 'Disciplines', to: '/services#services' },
  { value: process.length, label: 'Stage method', to: '/services#method' },
  { value: coreValues.length, label: 'Core values', to: '/company#values' },
  { value: directors.length, label: 'Executive directors', to: '/leadership#directors' },
]

export function Overview() {
  return (
    <Section id="overview" title="The company" note="Profile · In brief">
      <div className="overview">
        <Reveal className="overview__lead">
          <p>{about.lead}</p>
          <div className="btn-row">
            <Link className="btn btn--line" to="/company">
              <span>Read the profile</span>
              <Arrow />
            </Link>
            <Link className="btn btn--quiet" to="/leadership">
              <span>Meet the directors</span>
            </Link>
          </div>
        </Reveal>

        <ul className="facts">
          {facts.map((f, i) => (
            <Reveal as="li" key={f.label} delay={i * 80}>
              <Link className="fact" to={f.to}>
                <span className="fact__value">{String(f.value).padStart(2, '0')}</span>
                <span className="fact__label tech">{f.label}</span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  )
}

/**
 * The drawing set, as a row of large buttons — one per sheet. Each card
 * carries its sheet number and the gridlines it contains, so the home
 * page doubles as the index a real drawing set opens with.
 */
export function SheetIndex() {
  const sheets = pages.filter((p) => p.path !== '/')

  return (
    <Section id="index" title="The drawing set" note={`Sheet index · ${String(sheets.length).padStart(2, '0')} sheets`}>
      <ul className="sheets">
        {sheets.map((p, i) => (
          <Reveal as="li" key={p.path} delay={i * 70}>
            <Link className="sheet-card" to={p.path}>
              <span className="sheet-card__top">
                <span className="tech sheet-card__no">Sheet {p.sheet}</span>
                <span className="sheet-card__grid" aria-hidden="true">
                  {p.sections.map((s) => (
                    <span key={s.id} className="bubble">{s.grid}</span>
                  ))}
                </span>
              </span>
              <span className="sheet-card__title">{p.nav}</span>
              <span className="sheet-card__summary">{p.summary}</span>
              <span className="sheet-card__go tech">
                Open sheet
                <Arrow />
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}

export function Enquire() {
  return (
    <Section id="enquire" title="Have a site and a brief?" note="Enquiries · Angoda" className="section--enquire">
      <Reveal className="enquire">
        <p className="enquire__text">
          Tell us the site, the brief and the programme. We will come back with
          a scope, a drawing list and a price.
        </p>
        <div className="btn-row">
          <Link className="btn btn--solid" to="/contact">
            <span>Start a project</span>
            <Arrow />
          </Link>
          <a className="btn btn--line" href={`tel:${company.phoneHref}`}>
            <span>Call {company.phone}</span>
          </a>
        </div>
      </Reveal>
    </Section>
  )
}
