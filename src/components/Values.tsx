import { Section } from './Sections'
import { Reveal } from './Reveal'
import { coreValues, sustainability } from '../data/company'
import { Crest } from './Crest'
import './Values.css'

export function Values() {
  return (
    <>
      <Section id="values" title="What we hold to" note="Core values · 05">
        <ul className="values">
          {coreValues.map((v, i) => (
            <Reveal as="li" key={v.name} className="value" delay={i * 80}>
              <span className="value__no tech" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="value__name">{v.name}</h3>
              <p className="value__text">{v.text}</p>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section
        id="sustainability"
        title={sustainability.title}
        note="Environment · Health · Safety"
        className="section--sustain"
      >
        <div className="sustain">
          <div className="sustain__body">
            {sustainability.body.map((p, i) => (
              <Reveal key={i} delay={i * 90}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="sustain__mark">
            {/* The crest, at the scale of a seal on a certificate. */}
            <Crest className="sustain__crest" />
            <span className="tech">Responsible practice</span>
          </Reveal>
        </div>
      </Section>
    </>
  )
}
