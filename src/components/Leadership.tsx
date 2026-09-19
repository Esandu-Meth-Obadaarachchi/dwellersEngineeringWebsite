import { Section } from './Sections'
import { Reveal } from './Reveal'
import {
  directors,
  technicalExpertise,
  directorsMessage,
  teamStatement,
} from '../data/company'
import './Leadership.css'

export function Leadership() {
  return (
    <Section id="leadership" title="Who builds it" note="Directors · Technical">
      {/* --- Executive directors ------------------------------- */}
      <div className="directors">
        {directors.map((d, i) => (
          <Reveal as="article" key={d.name} className="director" delay={i * 120}>
            <div className="director__portrait">
              {d.portrait && (
                <img
                  src={`${d.portrait}.webp`}
                  alt={d.name}
                  width={760}
                  height={969}
                  loading="lazy"
                  decoding="async"
                />
              )}
              <span className="director__index tech" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>

            <div className="director__body">
              <p className="tech tech--gold">{d.role}</p>
              <h3 className="director__name">{d.name}</h3>
              <p className="tech director__title">{d.title}</p>
              <p className="director__bio">{d.bio}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* --- Directors' message -------------------------------- */}
      <Reveal as="blockquote" className="message">
        <p className="tech tech--gold">Directors&rsquo; message</p>
        {directorsMessage.map((p, i) => (
          <p key={i} className="message__text">
            {p}
          </p>
        ))}
      </Reveal>

      {/* --- Technical expertise ------------------------------- */}
      <div className="expertise">
        <Reveal className="expertise__head">
          <h3>Technical expertise</h3>
          <p className="tech">Chartered and specialist appointments</p>
        </Reveal>

        <div className="expertise__grid">
          {technicalExpertise.map((p, i) => (
            <Reveal as="article" key={p.role} className="expert" delay={i * 110}>
              <p className="tech tech--gold">{p.role}</p>
              <h4 className="expert__name">{p.name}</h4>
              <p className="tech expert__qual">{p.title}</p>
              <p className="expert__bio">{p.bio}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* --- The wider team ------------------------------------ */}
      <div className="team">
        <Reveal className="team__figure">
          <picture>
            <source srcSet="/assets/img/team-hands.webp" type="image/webp" />
            <img
              src="/assets/img/team-hands.jpg"
              alt="Project team with hands joined over a table"
              width={1200}
              height={813}
              loading="lazy"
              decoding="async"
            />
          </picture>
        </Reveal>

        <div className="team__body">
          <Reveal>
            <h3>Our greatest asset is our people</h3>
          </Reveal>
          {teamStatement.map((p, i) => (
            <Reveal key={i} delay={i * 80}>
              <p>{p}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}
