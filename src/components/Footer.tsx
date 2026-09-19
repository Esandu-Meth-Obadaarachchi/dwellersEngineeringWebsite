import { company, services } from '../data/company'
import { Crest } from './Crest'
import './Footer.css'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <div className="footer__brand">
          <Crest className="footer__crest" />
          <p className="footer__name">
            Dwellers <span>Engineering</span>
          </p>
          <p className="footer__tagline tech">{company.tagline}</p>
        </div>

        <div className="footer__col">
          <p className="tech footer__head">Services</p>
          <ul>
            {services.map((s) => (
              <li key={s.code}>
                <a href="#services">{s.name}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <p className="tech footer__head">Office</p>
          <address>
            {company.address.line1}
            <br />
            {company.address.line2}
            <br />
            {company.address.country}
          </address>
          <ul>
            <li>
              <a href={`tel:${company.phoneHref}`}>{company.phone}</a>
            </li>
            <li>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </li>
            <li>
              <a href={`https://${company.website}`} target="_blank" rel="noreferrer noopener">
                {company.website}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell footer__base tech">
        <span>
          © {year} {company.legalName}
        </span>
        <span aria-hidden="true" className="footer__base-rule" />
        <span>Angoda · Sri Lanka</span>
      </div>
    </footer>
  )
}
