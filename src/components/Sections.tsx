import type { ReactNode } from 'react'
import { Reveal } from './Reveal'
import { sections } from '../data/company'

type SectionId = (typeof sections)[number]['id']

/** Looks up a section's grid reference and sheet number from the
 *  register, so the numbering can never drift from the nav. */
function meta(id: SectionId) {
  const found = sections.find((s) => s.id === id)
  if (!found) throw new Error(`Unknown section: ${id}`)
  return found
}

export type SectionProps = {
  id: SectionId
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
  const { sheet, grid } = meta(id)

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
