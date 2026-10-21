import type { ReactNode } from 'react'
import { Reveal } from './Reveal'
import { sectionMeta } from '../data/site'

export type SectionProps = {
  /** Must be registered in src/data/site.ts, which owns the numbering. */
  id: string
  title: string
  /** The short note that sits in the title block beside the sheet number. */
  note?: string
  children: ReactNode
  className?: string
}

/**
 * A sheet on the drawing set.
 *
 * Every section opens with a title block carrying its own sheet number,
 * grid reference and revision note — the same stamp that sits in the
 * corner of the company's real drawings.
 */
export function Section({ id, title, note, children, className }: SectionProps) {
  const { sheet, grid } = sectionMeta(id)

  return (
    <section
      id={id}
      className={className ? `section ${className}` : 'section'}
      aria-labelledby={`${id}-title`}
    >
      <div className="shell">
        <Reveal as="header" className="title-block">
          <p className="title-block__no" aria-hidden="true">
            {sheet}
          </p>
          <div className="title-block__body">
            <p className="title-block__eyebrow">
              <span className="bubble" aria-hidden="true">
                {grid}
              </span>
              {note && <span className="tech">{note}</span>}
            </p>
            <h2 id={`${id}-title`}>{title}</h2>
          </div>
        </Reveal>

        {children}
      </div>
    </section>
  )
}
