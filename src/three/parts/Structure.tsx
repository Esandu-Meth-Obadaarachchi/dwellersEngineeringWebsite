import { useMemo } from 'react'
import { M } from '../materials'
import { Assembly } from '../Assembly'
import {
  PHASE, HOUSE, GRID_X, GRID_Z, HOUSE_CX, HOUSE_CZ, HOUSE_W, HOUSE_D,
} from '../schedule'

const PAD = { w: 1.5, h: 0.42 }
const BEAM = { w: 0.34, h: 0.46 }

/** A reinforcement cage: four main bars and a run of links.
 *  Built once and reused at every column position. */
function RebarCage({ height, segments }: { height: number; segments: number }) {
  const spread = HOUSE.colW * 0.3
  const bars = useMemo(
    () => [
      [-spread, -spread], [spread, -spread], [spread, spread], [-spread, spread],
    ] as const,
    [spread],
  )
  const links = useMemo(
    () => Array.from({ length: Math.max(3, Math.round(height / 0.55)) }, (_, i) => i),
    [height],
  )

  return (
    <group>
      {bars.map(([x, z], i) => (
        <mesh key={i} position={[x, height / 2, z]} material={M.steel}>
          <cylinderGeometry args={[0.028, 0.028, height, Math.max(5, segments >> 1)]} />
        </mesh>
      ))}
      {links.map((i) => {
        const y = 0.16 + (i * (height - 0.3)) / Math.max(1, links.length - 1)
        return (
          <mesh key={i} position-y={y} rotation-x={Math.PI / 2} material={M.steel}>
            <torusGeometry args={[spread * 1.42, 0.022, 4, Math.max(6, segments >> 1)]} />
          </mesh>
        )
      })}
    </group>
  )
}

/**
 * Everything that carries load: pad footings, ground beams,
 * reinforcement, columns, suspended slabs and the stair.
 *
 * The sequence is the real one. Footings are cast, beams span between
 * them, cages are stood and tied, columns are cast around the cages,
 * and only then does a slab arrive on top. Nothing floats.
 */
export function Structure({ segments }: { segments: number }) {
  const columns = useMemo(() => {
    const out: { x: number; z: number; i: number }[] = []
    let i = 0
    for (const x of GRID_X) for (const z of GRID_Z) out.push({ x, z, i: i++ })
    return out
  }, [])

  /** Ground beams run along both grid directions between columns. */
  const beams = useMemo(() => {
    const out: { pos: [number, number, number]; size: [number, number, number] }[] = []
    for (const z of GRID_Z) {
      out.push({
        pos: [HOUSE_CX, 0, z],
        size: [HOUSE_W, BEAM.h, BEAM.w],
      })
    }
    for (const x of GRID_X) {
      out.push({
        pos: [x, 0, HOUSE_CZ],
        size: [BEAM.w, BEAM.h, HOUSE_D],
      })
    }
    return out
  }, [])

  const storeys = useMemo(
    () => Array.from({ length: HOUSE.storeys }, (_, i) => i),
    [],
  )

  return (
    <group>
      {/* --- Pad footings ------------------------------------- */}
      {columns.map(({ x, z, i }) => (
        <Assembly
          key={`pad-${i}`}
          window={PHASE.footings}
          offset={(i / columns.length) * 0.45}
          length={0.55}
          mode="rise"
        >
          <mesh position={[x, PAD.h / 2, z]} material={M.concrete}>
            <boxGeometry args={[PAD.w, PAD.h, PAD.w]} />
          </mesh>
        </Assembly>
      ))}

      {/* --- Ground beams ------------------------------------- */}
      {beams.map((b, i) => (
        <Assembly
          key={`gb-${i}`}
          window={PHASE.groundBeams}
          offset={(i / beams.length) * 0.5}
          length={0.5}
          mode="crane"
          drop={3}
        >
          <mesh position={[b.pos[0], PAD.h + BEAM.h / 2, b.pos[2]]} material={M.concrete}>
            <boxGeometry args={b.size} />
          </mesh>
        </Assembly>
      ))}

      {/* --- Cages, then columns, storey by storey ------------- */}
      {storeys.map((s) =>
        columns.map(({ x, z, i }) => {
          const base = PAD.h + (s === 0 ? BEAM.h : 0) + s * HOUSE.floorH
          const h = HOUSE.floorH - (s === 0 ? BEAM.h : 0)
          const stagger = ((s * columns.length + i) / (columns.length * HOUSE.storeys)) * 0.5

          return (
            <group key={`col-${s}-${i}`} position={[x, base, z]}>
              {/* Cage goes up first… */}
              <Assembly window={PHASE.columns} offset={stagger} length={0.32} mode="rise">
                <RebarCage height={h * 0.94} segments={segments} />
              </Assembly>
              {/* …and the pour follows it. */}
              <Assembly
                window={PHASE.columns}
                offset={stagger + 0.18}
                length={0.34}
                mode="rise"
              >
                <mesh position-y={h / 2} material={M.concrete}>
                  <boxGeometry args={[HOUSE.colW, h, HOUSE.colW]} />
                </mesh>
              </Assembly>
            </group>
          )
        }),
      )}

      {/* --- Suspended slabs ---------------------------------- */}
      {storeys.map((s) => {
        const y = PAD.h + BEAM.h + (s + 1) * HOUSE.floorH - HOUSE.floorH * 0.02
        return (
          <group key={`slab-${s}`}>
            {/* Edge beams around the perimeter, then the deck. */}
            <Assembly
              window={PHASE.slabs}
              offset={s * 0.34}
              length={0.36}
              mode="crane"
              drop={4.5}
            >
              <mesh position={[HOUSE_CX, y + HOUSE.slabT / 2, HOUSE_CZ]} material={M.concrete}>
                <boxGeometry args={[HOUSE_W + 0.7, HOUSE.slabT, HOUSE_D + 0.7]} />
              </mesh>
            </Assembly>
          </group>
        )
      })}

      {/* --- Ground floor slab on grade ----------------------- */}
      <Assembly window={PHASE.groundBeams} offset={0.45} length={0.55} mode="fade">
        <mesh
          position={[HOUSE_CX, PAD.h + BEAM.h + 0.06, HOUSE_CZ]}
          material={M.screed}
        >
          <boxGeometry args={[HOUSE_W, 0.12, HOUSE_D]} />
        </mesh>
      </Assembly>

      {/* --- Stair: a real flight, not a decorative zigzag ----- */}
      <Assembly window={PHASE.slabs} offset={0.45} length={0.55} mode="rise">
        <Stair />
      </Assembly>
    </group>
  )
}

/** A straight flight from ground to first floor, inside the frame. */
function Stair() {
  const risers = 14
  const rise = HOUSE.floorH / risers
  const going = 0.27
  const base = PAD.h + BEAM.h + 0.12
  const x = HOUSE_CX + 3.1
  const z0 = HOUSE_CZ - (risers * going) / 2

  return (
    <group>
      {Array.from({ length: risers }, (_, i) => (
        <mesh
          key={i}
          position={[x, base + rise * (i + 0.5), z0 + going * (i + 0.5)]}
          material={M.concrete}
        >
          <boxGeometry args={[1.15, rise, going]} />
        </mesh>
      ))}
    </group>
  )
}
