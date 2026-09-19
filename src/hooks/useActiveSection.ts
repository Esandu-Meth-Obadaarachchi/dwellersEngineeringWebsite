import { useEffect, useState } from 'react'

/**
 * Tracks which registered section owns the middle of the viewport.
 *
 * The middle band is what makes the readout feel right while scrolling,
 * but it cannot be satisfied at the very bottom of the page, where the
 * footer holds the middle and no section intersects. Hitting the bottom
 * therefore pins the last section explicitly, so the sheet number never
 * snaps back to the first one.
 */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (!els.length) return

    let atBottom = false

    const observer = new IntersectionObserver(
      (entries) => {
        if (atBottom) return
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    els.forEach((el) => observer.observe(el))

    let frame = 0
    const checkBottom = () => {
      frame = 0
      const reached =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4
      if (reached === atBottom) return
      atBottom = reached
      if (reached) setActive(ids[ids.length - 1])
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(checkBottom)
    }

    checkBottom()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids])

  return active
}
