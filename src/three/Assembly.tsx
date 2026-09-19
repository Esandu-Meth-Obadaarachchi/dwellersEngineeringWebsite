import { useRef, type MutableRefObject, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ease, easeOutCubic, span, clamp01 } from './progress'
import type { Window } from './schedule'

type Mode =
  /** Grows upward from its own base — cast concrete, blockwork, planting. */
  | 'rise'
  /** Lowers into place from above — craned elements: beams, trusses, slabs. */
  | 'crane'
  /** Cuts downward into the ground — excavation, pool dig. */
  | 'sink'
  /** Appears in place — glazing, finishes, anything not lifted. */
  | 'fade'

export type AssemblyProps = {
  window: Window
  /** Sub-window inside the phase, so parts of one phase can stagger. */
  offset?: number
  length?: number
  mode?: Mode
  /** Travel distance for `crane` and `sink`, in scene units. */
  drop?: number
  children: ReactNode
}

/**
 * Gives one element its arrival on the build timeline.
 *
 * All four modes are driven from the scroll ref inside `useFrame`, so
 * scrubbing the page never re-renders React. Children must be modelled
 * with their base at the group's own origin — `rise` scales about it.
 */
export function Assembly({
  window: win,
  offset = 0,
  length = 1,
  mode = 'rise',
  drop = 6,
  children,
}: AssemblyProps) {
  const group = useRef<THREE.Group>(null!)

  useFrame(() => {
    const g = group.current
    if (!g) return

    const raw = span(progressRef.current, win, offset, length)
    const t = mode === 'crane' ? easeOutCubic(raw) : ease(raw)

    // Hide entirely before the element's window opens: an invisible
    // object is culled before it reaches the GPU.
    const visible = raw > 0.001
    if (g.visible !== visible) g.visible = visible
    if (!visible) return

    switch (mode) {
      case 'rise':
        g.scale.y = Math.max(0.0001, t)
        break
      case 'crane':
        g.position.y = (1 - t) * drop
        break
      case 'sink':
        g.position.y = (1 - t) * drop
        g.scale.y = Math.max(0.0001, t)
        break
      case 'fade':
        g.scale.setScalar(0.94 + 0.06 * t)
        break
    }
  })

  return <group ref={group}>{children}</group>
}

/**
 * The progress ref, hoisted to module scope.
 *
 * React context does not cross into the canvas — react-three-fiber
 * renders with its own reconciler — and reading context per frame for
 * every one of the scene's ~40 assemblies would cost more than it
 * saves anyway. The scroll ref is handed in as a prop instead, and
 * `<ProgressBridge>` republishes it here once per frame, before any
 * other `useFrame` callback runs.
 */
const progressRef = { current: 0 }

export function ProgressBridge({ source }: { source: MutableRefObject<number> }) {
  // Priority -1 guarantees this lands before every part reads it.
  useFrame(() => {
    progressRef.current = source.current
  }, -1)
  return null
}

/** Shared read access for parts that animate more than a transform. */
export const readProgress = () => progressRef.current

/** Opacity ramp on a material, for the parts that dissolve rather
 *  than assemble (setting-out lines handing over to real geometry). */
export function useFadeMaterial(
  material: THREE.Material & { opacity: number },
  inWindow: Window,
  outWindow?: Window,
  max = 1,
) {
  useFrame(() => {
    const p = progressRef.current
    const rise = ease(span(p, inWindow))
    const fall = outWindow ? ease(span(p, outWindow)) : 0
    material.opacity = clamp01(rise * (1 - fall)) * max
    material.visible = material.opacity > 0.004
  })
}
