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
  site:        [0.00, 0.07],
  excavate:    [0.04, 0.13],
  footings:    [0.11, 0.21],
  groundBeams: [0.19, 0.27],
  columns:     [0.25, 0.37],
  slabs:       [0.35, 0.46],
  walls:       [0.44, 0.60],
  roof:        [0.57, 0.68],
  glazing:     [0.66, 0.74],
  pool:        [0.72, 0.83],
  shed:        [0.81, 0.89],
  landscape:   [0.87, 0.96],
  handover:    [0.93, 1.00],
} satisfies Record<string, Window>

/** Site geometry. All parts derive from these — change one number
 *  and foundation, frame, walls and roof all follow. */
export const PLOT = { w: 30, d: 24 } as const

export const HOUSE = {
  x0: -11.5,
  x1: -1.5,
  z0: -4.5,
  z1: 4.5,
  storeys: 2,
  floorH: 3.15,
  slabT: 0.28,
  colW: 0.52,
} as const

export const HOUSE_W = HOUSE.x1 - HOUSE.x0
export const HOUSE_D = HOUSE.z1 - HOUSE.z0
export const HOUSE_CX = (HOUSE.x0 + HOUSE.x1) / 2
export const HOUSE_CZ = (HOUSE.z0 + HOUSE.z1) / 2
export const ROOF_Y = HOUSE.storeys * HOUSE.floorH

/** Structural grid: three lines each way, so nine columns. */
export const GRID_X = [HOUSE.x0, HOUSE_CX, HOUSE.x1] as const
export const GRID_Z = [HOUSE.z0, HOUSE_CZ, HOUSE.z1] as const

export const POOL = { x0: 2.5, x1: 9.5, z0: -0.5, z1: 4, depth: 1.5 } as const
export const SHED = { x0: 3, x1: 8.5, z0: -7.5, z1: -3, h: 2.9 } as const

/** The six process stages from the company profile, pinned to the
 *  moment in the build where each one is actually happening. */
export type Caption = { at: number; stage: string; title: string; note: string }

export const CAPTIONS: readonly Caption[] = [
  { at: 0.00, stage: '01', title: 'Client Requirement Analysis', note: 'Survey, setting out, site establishment' },
  { at: 0.10, stage: '02', title: 'Concept Development and Planning', note: 'Excavation and pad footings to design level' },
  { at: 0.24, stage: '03', title: 'Design Coordination and Cost Optimization', note: 'Reinforcement cages, column casting' },
  { at: 0.35, stage: '04', title: 'Construction and Implementation', note: 'Suspended slabs, blockwork, roof structure' },
  { at: 0.65, stage: '05', title: 'Quality Control and Safety Management', note: 'Glazing, wet areas, ancillary structures' },
  { at: 0.86, stage: '06', title: 'Project Handover and Post Completion Support', note: 'Landscaping, commissioning, handover' },
] as const

/** Camera keyframes. Lerped and damped, never cut. */
export const CAMERA = [
  { t: 0.00, pos: [30, 10.0, 34], look: [-5, 1.0, 0] },   // the empty plot
  { t: 0.14, pos: [22, 9.0, 26], look: [-6, 1.0, 0] },    // down onto the footings
  { t: 0.30, pos: [6, 11.0, 30], look: [-6, 3.0, 0] },    // along the column grid
  { t: 0.45, pos: [-18, 13.0, 26], look: [-6, 4.0, 0] },  // slabs landing
  { t: 0.60, pos: [-30, 11.0, 12], look: [-6, 4.0, 0] },  // side elevation, blockwork
  { t: 0.70, pos: [-20, 20.0, 26], look: [-6, 4.5, 0] },  // over the roof
  { t: 0.82, pos: [10, 12.0, 26], look: [0, 1.5, 1] },    // across the pool
  { t: 0.90, pos: [22, 11.0, 10], look: [3, 2.0, -3] },   // the shed
  { t: 1.00, pos: [26, 14.0, 32], look: [-3, 2.5, 0] },   // handover
] as const
