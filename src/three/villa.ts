/**
 * The villa, as data.
 *
 * A two-storey tropical modern house with a roof terrace: a ground-floor
 * living wing that opens to the garden through full-height sliding
 * glass, a first floor that cantilevers out over it as a deep shading
 * balcony, a roof pavilion under a floating slab, and a stone blade wall
 * that runs the full height of the west end and carries the carport.
 *
 * Every part of the scene reads from here. Structure, blockwork, render,
 * glazing and the ghost outline all follow if a number changes, so the
 * house can be redesigned in this file alone. Units are metres; y is up,
 * the garden (and the camera) are to the south (+z) and east (+x).
 */

export type Rect = { x0: number; x1: number; z0: number; z1: number }

export const rectW = (r: Rect) => r.x1 - r.x0
export const rectD = (r: Rect) => r.z1 - r.z0
export const rectCX = (r: Rect) => (r.x0 + r.x1) / 2
export const rectCZ = (r: Rect) => (r.z0 + r.z1) / 2

// --- Levels ---------------------------------------------------------

/** Footing pad and ground beam depths: the plinth the house sits on. */
export const PAD_H = 0.4
export const BEAM_H = 0.42

/** Top of each floor: ground, first, roof terrace. */
export const FLOOR_H = 3.5
const GROUND_Y = PAD_H + BEAM_H + 0.13
export const LEVEL_Y = [GROUND_Y, GROUND_Y + FLOOR_H, GROUND_Y + 2 * FLOOR_H] as const
export const SLAB_T = 0.3
export const WALL_T = 0.22
/** Clear storey height, floor to slab soffit. */
export const STOREY_CLEAR = FLOOR_H - SLAB_T

/** The roof pavilion is lower than a full storey. */
export const PAVILION_H = 3.2
export const PAVILION_ROOF_Y = LEVEL_Y[2] + PAVILION_H

// --- Footprints -----------------------------------------------------

export const GROUND: Rect = { x0: -13, x1: 1, z0: -8, z1: 1 }
export const FIRST: Rect = { x0: -13, x1: 2, z0: -8, z1: 1.5 }
export const PAVILION: Rect = { x0: -13, x1: -7, z0: -8, z1: -2 }

/** The whole built envelope, for the ghost outline and the camera. */
export const ENVELOPE: Rect = { x0: -15.6, x1: 2.8, z0: -8.8, z1: 4.2 }

// --- Structure ------------------------------------------------------

/** Column grid, shared by ground and first floor. */
export const GRID_X = [-13, -8, -3, 1] as const
export const GRID_Z = [-8, -3.5, 1] as const
export const COL = 0.3

/** The pavilion stands on four columns of its own. */
export const PAVILION_COLS = [
  [PAVILION.x0, PAVILION.z0],
  [PAVILION.x1, PAVILION.z0],
  [PAVILION.x0, PAVILION.z1],
  [PAVILION.x1, PAVILION.z1],
] as const

export type Slab = Rect & { top: number; t: number; level: number }

/** Suspended slabs, in pour order. Each overhangs its walls: south as a
 *  shading balcony, east as a cantilever, west to meet the stone wall. */
export const SLABS: Slab[] = [
  { level: 1, x0: -15.0, x1: 2.6, z0: -8.4, z1: 3.8, top: LEVEL_Y[1], t: SLAB_T },
  { level: 2, x0: -13.4, x1: 2.8, z0: -8.4, z1: 4.2, top: LEVEL_Y[2], t: SLAB_T },
  { level: 3, x0: -13.8, x1: -5.6, z0: -8.8, z1: -0.6, top: PAVILION_ROOF_Y, t: 0.26 },
]

// --- Walls and openings ---------------------------------------------

export type OpeningKind =
  /** Full-height multi-panel sliding glass. */
  | 'slider'
  /** Fixed or casement window with a sill. */
  | 'window'
  /** Solid timber door. */
  | 'door'
  /** The oversized timber pivot door at the entrance. */
  | 'pivot'

export type Opening = {
  /** Start and end along the wall, in metres from its first end. */
  a: number
  b: number
  /** Sill and head, in metres above the floor. */
  sill: number
  head: number
  kind: OpeningKind
}

export type Wall = {
  key: string
  level: number
  /** The wall runs along this axis... */
  axis: 'x' | 'z'
  /** ...at this fixed coordinate on the other axis... */
  at: number
  /** ...from `from` to `to`. */
  from: number
  to: number
  /** Floor level the wall stands on, and its height. */
  y: number
  h: number
  /** Which way the outside face points: +1 or -1 on the cross axis. */
  out: 1 | -1
  openings: Opening[]
}

const g = LEVEL_Y[0]
const f = LEVEL_Y[1]
const r = LEVEL_Y[2]
const H = STOREY_CLEAR
const PH = PAVILION_H - 0.26

const slider = (a: number, b: number, head = H - 0.2): Opening => ({ a, b, sill: 0, head, kind: 'slider' })
const win = (a: number, b: number, sill: number, head: number): Opening => ({ a, b, sill, head, kind: 'window' })

export const WALLS: Wall[] = [
  // --- Ground floor: glass to the garden, solid to the street.
  { key: 'g-s', level: 0, axis: 'x', at: GROUND.z1, from: GROUND.x0, to: GROUND.x1, y: g, h: H, out: 1,
    openings: [slider(0.6, 6.4), slider(7.4, 13.4)] },
  { key: 'g-e', level: 0, axis: 'z', at: GROUND.x1, from: GROUND.z0, to: GROUND.z1, y: g, h: H, out: 1,
    openings: [slider(1.0, 8.2)] },
  { key: 'g-n', level: 0, axis: 'x', at: GROUND.z0, from: GROUND.x0, to: GROUND.x1, y: g, h: H, out: -1,
    openings: [win(2, 5, 1.1, 2.5), win(6.5, 8, 1.1, 2.5), { a: 11, b: 12.2, sill: 0, head: 2.4, kind: 'door' }] },
  { key: 'g-w', level: 0, axis: 'z', at: GROUND.x0, from: GROUND.z0, to: GROUND.z1, y: g, h: H, out: -1,
    openings: [win(1.5, 3.2, 0.3, 2.9), { a: 5.6, b: 7.4, sill: 0, head: 3.0, kind: 'pivot' }] },

  // --- First floor: bedrooms behind sliders onto the balcony.
  { key: 'f-s', level: 1, axis: 'x', at: FIRST.z1, from: FIRST.x0, to: FIRST.x1, y: f, h: H, out: 1,
    openings: [slider(0.8, 6.8), slider(7.8, 14.2)] },
  { key: 'f-e', level: 1, axis: 'z', at: FIRST.x1, from: FIRST.z0, to: FIRST.z1, y: f, h: H, out: 1,
    openings: [win(1, 4, 0.5, 2.8), win(5, 8.5, 0.5, 2.8)] },
  { key: 'f-n', level: 1, axis: 'x', at: FIRST.z0, from: FIRST.x0, to: FIRST.x1, y: f, h: H, out: -1,
    openings: [win(1.5, 3.5, 1, 2.5), win(5, 7, 1, 2.5), win(8.5, 10.5, 1, 2.5), win(12, 14, 1, 2.5)] },
  { key: 'f-w', level: 1, axis: 'z', at: FIRST.x0, from: FIRST.z0, to: FIRST.z1, y: f, h: H, out: -1,
    openings: [win(3, 6.5, 0.9, 2.6)] },

  // --- Roof pavilion: a glass corner onto the terrace.
  { key: 'p-s', level: 2, axis: 'x', at: PAVILION.z1, from: PAVILION.x0, to: PAVILION.x1, y: r, h: PH, out: 1,
    openings: [slider(0.5, 5.5, PH - 0.2)] },
  { key: 'p-e', level: 2, axis: 'z', at: PAVILION.x1, from: PAVILION.z0, to: PAVILION.z1, y: r, h: PH, out: 1,
    openings: [slider(0.6, 5.4, PH - 0.2)] },
  { key: 'p-n', level: 2, axis: 'x', at: PAVILION.z0, from: PAVILION.x0, to: PAVILION.x1, y: r, h: PH, out: -1,
    openings: [] },
  { key: 'p-w', level: 2, axis: 'z', at: PAVILION.x0, from: PAVILION.z0, to: PAVILION.z1, y: r, h: PH, out: -1,
    openings: [] },
]

/** World position of a point `along` a wall, `up` from its floor, pushed
 *  `outward` from its centre line. */
export function wallPoint(w: Wall, along: number, up: number, outward = 0): [number, number, number] {
  const t = w.from + along
  const y = w.y + up
  return w.axis === 'x' ? [t, y, w.at + outward * w.out] : [w.at + outward * w.out, y, t]
}

/** Y rotation that turns a part built along +X to lie along the wall. */
export const wallRotation = (w: Wall) => (w.axis === 'x' ? 0 : -Math.PI / 2)

export const wallLength = (w: Wall) => w.to - w.from

/** The wall's outward direction expressed in its own rotated frame,
 *  for offsetting frames, sills and reveals inside a `wallRotation`
 *  group. Rotating -90° turns local +Z into world -X. */
export const localOut = (w: Wall) => (w.axis === 'x' ? w.out : -w.out)

/**
 * The solid pieces of a wall once its openings are cut: full-height
 * piers between openings, and the spandrels above and below each one.
 * Used for the render coat, so plaster never covers the glass.
 */
export function wallPanels(w: Wall) {
  const out: { a: number; b: number; y0: number; y1: number }[] = []
  const ops = [...w.openings].sort((p, q) => p.a - q.a)
  let cursor = 0
  for (const o of ops) {
    if (o.a > cursor) out.push({ a: cursor, b: o.a, y0: 0, y1: w.h })
    if (o.sill > 0) out.push({ a: o.a, b: o.b, y0: 0, y1: o.sill })
    if (o.head < w.h) out.push({ a: o.a, b: o.b, y0: o.head, y1: w.h })
    cursor = o.b
  }
  if (cursor < wallLength(w)) out.push({ a: cursor, b: wallLength(w), y0: 0, y1: w.h })
  return out
}

// --- Features -------------------------------------------------------

/** The stone blade wall at the west end, full height and beyond. */
export const STONE_WALL = { x0: -15.6, x1: -15.0, z0: -9.4, z1: 4.4, y0: 0, y1: LEVEL_Y[2] + 1.3 }

/** Vertical timber fins screening the first floor's east glazing. */
export const LOUVRES = { x: FIRST.x1 + 0.35, z0: -7.6, z1: 1.1, y0: LEVEL_Y[1], y1: LEVEL_Y[2] - SLAB_T, fin: 0.06, depth: 0.22, pitch: 0.24 }

/** Timber pergola over the open part of the roof terrace. */
export const PERGOLA: Rect & { y: number } = { x0: -7, x1: 2.4, z0: -8, z1: 2.4, y: LEVEL_Y[2] + 3.0 }

/** The carport: a thin slab cantilevered off the stone wall onto three
 *  slim steel posts. */
export const CARPORT: Rect & { top: number; t: number } = { x0: -23.2, x1: -15.6, z0: -7.6, z1: 2.2, top: 3.3, t: 0.24 }

/** The pool and its deck, south-east of the house. */
export const POOL: Rect & { depth: number } = { x0: -4, x1: 9, z0: 6.2, z1: 10.6, depth: 1.5 }
export const DECK: Rect = { x0: -6.5, x1: 12.4, z0: 4.4, z1: 12.4 }

/** Covered terrace under the balcony, paved. */
export const TERRACE: Rect = { x0: -15, x1: 2.6, z0: GROUND.z1, z1: 4.4 }

/** The plot, its boundary, the gate and the drive. */
export const PLOT: Rect = { x0: -27, x1: 17, z0: -13, z1: 16 }
export const GATE = { x0: -23, x1: -16.4 }
export const DRIVE: Rect = { x0: GATE.x0, x1: GATE.x1, z0: CARPORT.z0, z1: PLOT.z1 }
