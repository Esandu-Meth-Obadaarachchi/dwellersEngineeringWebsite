/**
 * The build schedule.
 *
 * Scroll progress (0 → 1) is construction time. Every element in the
 * scene owns a window on this timeline and is responsible for its own
 * arrival, so the sequence reads like a real programme of works:
 * nothing stands before what carries it.
 */

export type Window = readonly [start: number, end: number]

export const PHASE = {
  site:        [0.00, 0.06],
  excavate:    [0.04, 0.11],
  footings:    [0.09, 0.18],
  groundBeams: [0.16, 0.23],
  /** Columns and slabs, level by level — see `frameWindow`. */
  frame:       [0.21, 0.46],
  walls:       [0.44, 0.57],
  stone:       [0.52, 0.60],
  roof:        [0.56, 0.64],
  /** Render and paint go over the blockwork; the frame turns white. */
  finishes:    [0.59, 0.68],
  glazing:     [0.65, 0.74],
  interior:    [0.70, 0.78],
  pool:        [0.73, 0.84],
  carport:     [0.80, 0.87],
  landscape:   [0.85, 0.96],
  handover:    [0.93, 1.00],
} satisfies Record<string, Window>

/**
 * The frame goes up one level at a time: that level's columns, then the
 * slab they carry, then the next level's columns stand on it. Level 2
 * is the roof pavilion.
 */
export function frameWindow(level: number, part: 'columns' | 'slab'): Window {
  const [s, e] = PHASE.frame
  const per = (e - s) / 3
  const base = s + level * per
  return part === 'columns' ? [base, base + per * 0.55] : [base + per * 0.45, base + per]
}

/** The six process stages from the company profile, pinned to the
 *  moment in the build where each one is actually happening. */
export type Caption = { at: number; stage: string; title: string; note: string }

export const CAPTIONS: readonly Caption[] = [
  { at: 0.00, stage: '01', title: 'Client Requirement Analysis', note: 'Survey, setting out, site establishment' },
  { at: 0.10, stage: '02', title: 'Concept Development and Planning', note: 'Excavation and pad footings to design level' },
  { at: 0.21, stage: '03', title: 'Design Coordination and Cost Optimization', note: 'Reinforcement, columns and cantilevered slabs' },
  { at: 0.44, stage: '04', title: 'Construction and Implementation', note: 'Blockwork, stone cladding, render and roof terrace' },
  { at: 0.65, stage: '05', title: 'Quality Control and Safety Management', note: 'Glazing, interiors, pool and carport' },
  { at: 0.86, stage: '06', title: 'Project Handover and Post Completion Support', note: 'Landscaping, commissioning, handover' },
] as const

/** Camera keyframes. Lerped and damped, never cut. */
export const CAMERA = [
  { t: 0.00, pos: [44, 20, 48], look: [-6, 1.0, -1] },     // the empty plot
  { t: 0.13, pos: [30, 14, 30], look: [-6, 0.5, -3] },     // down onto the footings
  { t: 0.28, pos: [10, 16, 36], look: [-6, 3.0, -3] },     // along the column grid
  { t: 0.42, pos: [-30, 19, 30], look: [-6, 5.0, -3] },    // slabs landing
  { t: 0.55, pos: [-42, 13, 12], look: [-8, 4.5, -3] },    // west elevation, stone wall
  { t: 0.64, pos: [-22, 30, 30], look: [-5, 7.0, -2] },    // over the roof terrace
  { t: 0.74, pos: [22, 8, 30], look: [-5, 4.0, 0] },       // the glass, close
  { t: 0.84, pos: [26, 12, 34], look: [2, 1.0, 6] },       // across the pool
  { t: 0.90, pos: [-42, 13, 20], look: [-16, 2.0, -2] },   // the carport, from the side
  { t: 1.00, pos: [36, 17, 44], look: [-5, 3.5, 0] },      // handover
] as const
