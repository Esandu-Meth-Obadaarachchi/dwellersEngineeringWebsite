import { useState, type FormEvent } from 'react'
import { Section } from './Sections'
import { Reveal } from './Reveal'
import { Arrow } from './Arrow'
import { company, services } from '../data/company'
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

/**
 * The enquiry form.
 *
 * There is no server behind the site, so the form composes an email
 * rather than posting anywhere: the visitor's own mail app opens with
 * the brief already written. Nothing is lost if JavaScript fails — the
 * office address is printed beside it.
 */
export function Enquiry() {
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const get = (k: string) => String(data.get(k) ?? '').trim()

    const service = get('service')
    const body = [
      `Name: ${get('name')}`,
      get('phone') ? `Phone: ${get('phone')}` : null,
      `Service: ${service}`,
      get('site') ? `Site location: ${get('site')}` : null,
      '',
      get('brief'),
    ]
      .filter((l) => l !== null)
      .join('\n')

    const subject = `Project enquiry: ${service}`
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <Section id="enquiry" title="Start a project" note="Enquiries · Angoda">
      <div className="contact">
        <Reveal>
          <form className="enquiry" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="f-name" className="tech">Your name</label>
              <input id="f-name" name="name" type="text" autoComplete="name" required />
            </div>

            <div className="field">
              <label htmlFor="f-phone" className="tech">Phone <span>(optional)</span></label>
              <input id="f-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" />
            </div>

            <div className="field">
              <label htmlFor="f-service" className="tech">Service</label>
              <select id="f-service" name="service" required defaultValue="">
                <option value="" disabled>Select a discipline</option>
                {services.map((s) => (
                  <option key={s.code} value={s.name}>{s.name}</option>
                ))}
                <option value="Something else">Something else</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="f-site" className="tech">Site location <span>(optional)</span></label>
              <input id="f-site" name="site" type="text" autoComplete="address-level2" />
            </div>

            <div className="field field--wide">
              <label htmlFor="f-brief" className="tech">The brief</label>
              <textarea id="f-brief" name="brief" rows={5} required />
            </div>

            <div className="field--wide enquiry__foot">
              <button className="btn btn--solid" type="submit">
                <span>Compose email</span>
                <Arrow />
              </button>
              <p className="enquiry__note" role="status">
                {sent
                  ? `Your email app should now be open. If not, write to ${company.email}.`
                  : 'Opens your email app with the brief filled in. Nothing is stored on this site.'}
              </p>
            </div>
          </form>
        </Reveal>

        <Reveal className="contact__panel">
          <div className="contact__panel-inner">
            <p className="contact__pitch">
              Tell us the site, the brief and the programme. We will come back
              with a scope, a drawing list and a price.
            </p>
            <div className="btn-row">
              <a className="btn btn--line" href={`tel:${company.phoneHref}`}>
                <span>Call {company.phone}</span>
              </a>
            </div>
            <p className="tech contact__hours">
              {company.legalName} · Engineering &amp; Construction
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

export function Office() {
  return (
    <Section id="office" title="The office" note="Registered office · Direct lines">
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
    </Section>
  )
}
