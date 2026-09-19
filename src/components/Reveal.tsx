import { useEffect, useRef, type ElementType, type ReactNode } from 'react'

type RevealProps = {
  as?: ElementType
  /** Stagger in ms, for a run of siblings. */
  delay?: number
  className?: string
  children: ReactNode
}

/**
 * Scroll reveal.
 *
 * A single shared IntersectionObserver flips a data attribute; the
 * animation itself is CSS. That keeps the whole page's reveal cost at
 * one observer and no JavaScript on the scroll path — which matters
 * more than the effect does.
 */
export function Reveal({ as: Tag = 'div', delay = 0, className, children }: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    observe(el)
    return () => unobserve(el)
  }, [])

  return (
    <Tag
      ref={ref}
      className={className ? `reveal ${className}` : 'reveal'}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  )
}

let observer: IntersectionObserver | null = null

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.setAttribute('data-shown', 'true')
        observer?.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  )
  return observer
}

function observe(el: Element) {
  // Without IntersectionObserver the content simply shows, never hides.
  if (typeof IntersectionObserver === 'undefined') {
    el.setAttribute('data-shown', 'true')
    return
  }
  getObserver().observe(el)
}

function unobserve(el: Element) {
  observer?.unobserve(el)
}
