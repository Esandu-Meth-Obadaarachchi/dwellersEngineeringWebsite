import { useEffect, useRef, useState } from 'react'

/** One-shot or continuous viewport presence, used to gate the canvas. */
export function useInView<T extends HTMLElement>(
  { once = false, margin = '0px' }: { once?: boolean; margin?: string } = {},
) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) observer.disconnect()
      },
      { rootMargin: margin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [once, margin])

  return { ref, inView }
}
