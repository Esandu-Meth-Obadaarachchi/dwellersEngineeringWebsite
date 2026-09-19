import { HOUSE, HOUSE_W, HOUSE_D } from './schedule'

/** Shared geometry of the building envelope.
 *  Blockwork and glazing both read from here, so every pane lands in
 *  the hole the blocks were laid around. */

export const WALL_T = 0.24
export const PAD_H = 0.42
export const BEAM_H = 0.46

/** Top of the ground-floor slab: where the first course is laid. */
export const BASE_Y = PAD_H + BEAM_H + 0.12

export type Run = {
  key: string
  len: number
  ry: number
  ox: number
  oz: number
  dx: number
  dz: number
  /** Outward normal, for pushing frames and reveals clear of the wall. */
  nx: number
  nz: number
}

export const RUNS: readonly Run[] = [
  { key: 'north', len: HOUSE_W, ry: 0,           ox: HOUSE.x0, oz: HOUSE.z0, dx: 1, dz: 0, nx: 0,  nz: -1 },
  { key: 'south', len: HOUSE_W, ry: 0,           ox: HOUSE.x0, oz: HOUSE.z1, dx: 1, dz: 0, nx: 0,  nz: 1  },
  { key: 'west',  len: HOUSE_D, ry: Math.PI / 2, ox: HOUSE.x0, oz: HOUSE.z0, dx: 0, dz: 1, nx: -1, nz: 0  },
  { key: 'east',  len: HOUSE_D, ry: Math.PI / 2, ox: HOUSE.x1, oz: HOUSE.z0, dx: 0, dz: 1, nx: 1,  nz: 0  },
]

/** [start, end] along the run and [sill, head] up the storey, all as
 *  fractions. `door` openings run to the floor and get a timber leaf. */
export type Opening = {
  a: number
  b: number
  sill: number
  head: number
  door?: boolean
}

export const OPENINGS: Record<string, Opening[]> = {
  north: [
    { a: 0.12, b: 0.26, sill: 0.0, head: 0.72, door: true },
    { a: 0.42, b: 0.78, sill: 0.28, head: 0.76 },
  ],
  south: [
    { a: 0.18, b: 0.38, sill: 0.3, head: 0.74 },
    { a: 0.58, b: 0.82, sill: 0.3, head: 0.74 },
  ],
  west: [
    { a: 0.22, b: 0.42, sill: 0.3, head: 0.74 },
    { a: 0.62, b: 0.8, sill: 0.3, head: 0.74 },
  ],
  east: [
    { a: 0.2, b: 0.36, sill: 0.3, head: 0.74 },
    { a: 0.56, b: 0.84, sill: 0.3, head: 0.74 },
  ],
}

/** Ground-floor doors become windows upstairs — there is no balcony. */
export function openingsFor(runKey: string, storey: number): Opening[] {
  const base = OPENINGS[runKey] ?? []
  if (storey === 0) return base
  return base.map((o) => (o.door ? { ...o, sill: 0.3, head: 0.74, door: false } : o))
}

/** World placement of one opening. */
export function openingBox(run: Run, o: Opening, storey: number) {
  const a = o.a * run.len
  const b = o.b * run.len
  const width = b - a
  const centreAlong = (a + b) / 2

  const storeyBase = BASE_Y + storey * HOUSE.floorH
  const sillY = storeyBase + o.sill * HOUSE.floorH
  const headY = storeyBase + o.head * HOUSE.floorH

  return {
    width,
    height: headY - sillY,
    x: run.ox + run.dx * centreAlong,
    y: (sillY + headY) / 2,
    z: run.oz + run.dz * centreAlong,
    ry: run.ry,
  }
}
