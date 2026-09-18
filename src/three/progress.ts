import { createContext, useContext, type MutableRefObject } from 'react'
import type { Window } from './schedule'

/**
 * Scroll progress is shared as a ref, not as state. Every part of the
 * scene reads it inside its own render loop, so a full-page scroll
 * animates 3,000 moving pieces without a single React re-render.
 */
export const ProgressContext = createContext<MutableRefObject<number> | null>(null)

export function useProgress(): MutableRefObject<number> {
  const ref = useContext(ProgressContext)
  if (!ref) throw new Error('useProgress must be used inside <ProgressContext.Provider>')
  return ref
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/** Smootherstep — no overshoot, so concrete never springs. */
export const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

/** Back-eased arrival for the few parts that are craned in. */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/** Local 0 → 1 for an element's own window on the build timeline. */
export function span(p: number, [start, end]: Window, offset = 0, length = 1) {
  const s = start + (end - start) * offset
  const e = s + (end - start) * length
  return clamp01((p - s) / Math.max(1e-6, e - s))
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Frame-rate independent damping. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt))
