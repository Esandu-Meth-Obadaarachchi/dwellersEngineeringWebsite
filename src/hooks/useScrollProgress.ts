import { useEffect, useRef, useState } from 'react'

/**
 * Progress of an element through the viewport, 0 → 1.
 *
 * Reads on a rAF tick driven by scroll rather than on every scroll
 * event, and writes into a ref for animation loops that must not
 * re-render. The state value is throttled to whole percent so React
 * work stays off the scroll path.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const progress = useRef(0)
  const [coarse, setCoarse] = useState(0)

  useEffect(() => {
    let frame = 0
    let lastCoarse = -1

    const measure = () => {
      frame = 0
      const el = ref.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      const p = scrollable <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / scrollable))

      progress.current = p

      const step = Math.round(p * 100)
      if (step !== lastCoarse) {
        lastCoarse = step
        setCoarse(step / 100)
      }
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return { ref, progress, coarse }
}
