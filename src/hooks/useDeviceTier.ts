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
    if (coarse || cores < 8 || memory < 8) return 'mid'
    return 'high'
  }, [])
}

/** Per-tier budget for the build scene. `shadowMap` is the sun's
 *  shadow resolution; 0 turns shadows off. */
export const tierBudget = {
  low: {
    dpr: [1, 1.25] as [number, number], bricks: 300, trees: 6, shadowMap: 0,
    antialias: false, segments: 8, shrubs: 40, flowers: 60,
  },
  mid: {
    dpr: [1, 1.6] as [number, number], bricks: 600, trees: 9, shadowMap: 1536,
    antialias: true, segments: 12, shrubs: 90, flowers: 140,
  },
  high: {
    dpr: [1, 1.9] as [number, number], bricks: 950, trees: 12, shadowMap: 2048,
    antialias: true, segments: 18, shrubs: 140, flowers: 220,
  },
} as const
