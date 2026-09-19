import { Section } from './Sections'
import { Reveal } from './Reveal'
import { company } from '../data/company'
import './Contact.css'

const lines = [
  {
    label: 'Telephone',
    value: company.phone,
    href: `tel:${company.phoneHref}`,
  },
  {
    label: 'Email',
    value: company.email,
    href: `mailto:${company.email}`,
  },
  {
    label: 'Web',
    value: company.website,
    href: `https://${company.website}`,
  },
] as const

export function Contact() {
  return (
    <Section id="contact" title="Start a project" note="Enquiries · Angoda">
      <div className="contact">
        <div className="contact__lines">
          {lines.map((l, i) => (
            <Reveal key={l.label} delay={i * 90}>
              <a
                className="contact__line"
                href={l.href}
                {...(l.label === 'Web'
                  ? { target: '_blank', rel: 'noreferrer noopener' }
                  : {})}
              >
                <span className="tech contact__label">{l.label}</span>
                <span className="contact__value">{l.value}</span>
                <span className="contact__rule" aria-hidden="true" />
              </a>
            </Reveal>
          ))}

          <Reveal delay={270}>
            <address className="contact__address">
              <span className="tech contact__label">Registered office</span>
              <span className="contact__value">
                {company.address.line1}
                <br />
                {company.address.line2}
                <br />
                {company.address.country}
              </span>
            </address>
          </Reveal>
        </div>

        <Reveal className="contact__panel">
          <div className="contact__panel-inner">
            <p className="contact__pitch">
              Tell us the site, the brief and the programme. We will come back
              with a scope, a drawing list and a price.
            </p>
            <a className="contact__cta" href={`mailto:${company.email}`}>
              <span>Email the office</span>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  d="M4 12h15m0 0-6-6m6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            </a>
            <p className="tech contact__hours">
              {company.legalName} · Engineering &amp; Construction
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
