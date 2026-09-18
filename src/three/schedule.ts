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
export const CAPTIONS = [
  { at: 0.02, stage: '01', title: 'Client Requirement Analysis', note: 'Survey, setting out, site establishment' },
  { at: 0.16, stage: '02', title: 'Concept Development and Planning', note: 'Excavation and pad footings to design level' },
  { at: 0.31, stage: '03', title: 'Design Coordination and Cost Optimization', note: 'Reinforcement cages, column casting' },
  { at: 0.50, stage: '04', title: 'Construction and Implementation', note: 'Suspended slabs, blockwork, roof structure' },
  { at: 0.75, stage: '05', title: 'Quality Control and Safety Management', note: 'Glazing, wet areas, ancillary structures' },
  { at: 0.95, stage: '06', title: 'Project Handover and Post Completion Support', note: 'Landscaping, commissioning, handover' },
] as const

/** Camera keyframes. Lerped and damped, never cut. */
export const CAMERA = [
  { t: 0.00, pos: [24, 5.5, 22], look: [-4, 0.5, 0] },
  { t: 0.14, pos: [17, 7.5, 19], look: [-6, 1.0, 0] },
  { t: 0.30, pos: [4, 8.5, 23], look: [-6, 2.5, 0] },
  { t: 0.45, pos: [-16, 9.5, 19], look: [-6, 3.5, 0] },
  { t: 0.60, pos: [-22, 7.0, 6], look: [-6, 3.5, 0] },
  { t: 0.70, pos: [-13, 14.0, 18], look: [-6, 4.0, 0] },
  { t: 0.82, pos: [8, 8.0, 17], look: [2, 1.5, 1] },
  { t: 0.90, pos: [16, 7.0, 6], look: [3, 2.0, -3] },
  { t: 1.00, pos: [21, 9.5, 24], look: [-3, 2.5, 0] },
] as const
