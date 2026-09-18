import { useMemo } from 'react'

export type DeviceTier = 'low' | 'mid' | 'high'

/**
 * Decides how much 3D the device should be asked to do.
 *
 * Old laptops and phones are the constraint here, so the check is
 * deliberately pessimistic: anything with few cores, little memory,
 * a coarse pointer or a narrow viewport drops to a tier where the
 * scene sheds geometry, shadow work and pixel density rather than
 * dropping frames.
 */
export function useDeviceTier(): DeviceTier {
  return useMemo(() => {
    if (typeof window === 'undefined') return 'mid'

    const cores = navigator.hardwareConcurrency ?? 4
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const narrow = window.matchMedia('(max-width: 48rem)').matches
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData

    if (saveData || cores <= 4 || memory <= 4 || (coarse && narrow)) return 'low'
    if (cores <= 8 || memory <= 8 || coarse) return 'mid'
    return 'high'
  }, [])
}

/** Per-tier budget for the build scene. */
export const tierBudget = {
  low:  { dpr: [1, 1.25] as [number, number], bricks: 210, tiles: 120, trees: 4,  antialias: false, segments: 8  },
  mid:  { dpr: [1, 1.6]  as [number, number], bricks: 430, tiles: 260, trees: 7,  antialias: true,  segments: 12 },
  high: { dpr: [1, 1.9]  as [number, number], bricks: 720, tiles: 420, trees: 10, antialias: true,  segments: 18 },
} as const
