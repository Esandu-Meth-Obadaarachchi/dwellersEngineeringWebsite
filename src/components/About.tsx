import { Section } from './Sections'
import { Reveal } from './Reveal'
import { about, visionMission, divisions } from '../data/company'
import './About.css'

export function About() {
  return (
    <Section id="about" title="The company" note="Profile · Rev. A">
      <div className="about">
        <Reveal className="about__lead">
          <p>{about.lead}</p>
        </Reveal>

        <div className="about__body">
          {about.body.map((para, i) => (
            <Reveal key={i} delay={i * 90}>
              <p>{para}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="about__figure">
          <picture>
            <source srcSet="/assets/img/interior-skyline.webp" type="image/webp" />
            <img
              src="/assets/img/interior-skyline.jpg"
              alt="City skyline seen from inside a completed building"
              width={1200}
              height={800}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <figcaption className="tech">
            Concept to commissioning — end-to-end delivery
          </figcaption>
        </Reveal>
      </div>

      {/* Vision and mission, set as two facing pages. */}
      <div className="stances">
        {visionMission.map((v, i) => (
          <Reveal key={v.key} as="article" className="stance" delay={i * 110}>
            <p className="tech tech--gold">{v.label}</p>
            <p className="stance__text">{v.text}</p>
          </Reveal>
        ))}
      </div>

      {/* Divisions: how the work is actually organised. */}
      <div className="divisions">
        {divisions.map((d, i) => (
          <Reveal key={d.label} as="article" className="division" delay={i * 110}>
            <h3>{d.label}</h3>
            {d.body.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
