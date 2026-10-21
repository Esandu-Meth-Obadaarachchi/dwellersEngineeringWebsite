import { useMemo } from 'react'
import { M } from '../materials'
import { Assembly } from '../Assembly'
import { boxGeo } from '../geometry'
import { PHASE, frameWindow } from '../schedule'
import {
  GRID_X, GRID_Z, COL, PAD_H, BEAM_H, LEVEL_Y, SLABS, SLAB_T, GROUND,
  PAVILION_COLS, PAVILION_ROOF_Y, STONE_WALL, rectW, rectD, rectCX, rectCZ,
} from '../villa'

const PAD = 1.6
const BEAM_W = 0.32

/** A reinforcement cage: four main bars and a run of links. */
function RebarCage({ height, segments }: { height: number; segments: number }) {
  const spread = COL * 0.32
  const links = Math.max(3, Math.round(height / 0.5))
  const radial = Math.max(5, segments >> 1)

  return (
    <group>
      {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, z], i) => (
        <mesh key={i} position={[x * spread, height / 2, z * spread]} material={M.steel}>
          <cylinderGeometry args={[0.022, 0.022, height, radial]} />
        </mesh>
      ))}
      {Array.from({ length: links }, (_, i) => (
        <mesh
          key={i}
          position-y={0.15 + (i * (height - 0.3)) / Math.max(1, links - 1)}
          rotation-x={Math.PI / 2}
          material={M.steel}
        >
          <torusGeometry args={[spread * 1.42, 0.016, 4, radial]} />
        </mesh>
      ))}
    </group>
  )
}

type Column = { x: number; z: number; base: number; h: number; level: number; order: number }

/**
 * Everything that carries load: pad footings, ground beams, the strip
 * footing under the stone wall, reinforcement, columns and the three
 * suspended slabs.
 *
 * The sequence is the real one. Footings are cast, beams span between
 * them, cages are stood and tied, columns are cast around the cages,
 * and only then does a slab arrive on top. Each level's columns stand
 * on the slab below. Nothing floats.
 */
export function Structure({ segments }: { segments: number }) {
  const pads = useMemo(() => {
    const out: { x: number; z: number }[] = []
    for (const x of GRID_X) for (const z of GRID_Z) out.push({ x, z })
    return out
  }, [])

  const beams = useMemo(() => {
    const y = PAD_H + BEAM_H / 2
    const w = GRID_X[GRID_X.length - 1] - GRID_X[0]
    const d = GRID_Z[GRID_Z.length - 1] - GRID_Z[0]
    return [
      ...GRID_Z.map((z) => ({ x: (GRID_X[0] + GRID_X[GRID_X.length - 1]) / 2, y, z, s: [w + BEAM_W, BEAM_H, BEAM_W] })),
      ...GRID_X.map((x) => ({ x, y, z: (GRID_Z[0] + GRID_Z[GRID_Z.length - 1]) / 2, s: [BEAM_W, BEAM_H, d + BEAM_W] })),
    ] as { x: number; y: number; z: number; s: [number, number, number] }[]
  }, [])

  const columns = useMemo(() => {
    const out: Column[] = []
    for (const level of [0, 1]) {
      const base = level === 0 ? PAD_H + BEAM_H : LEVEL_Y[level]
      const top = LEVEL_Y[level + 1] - SLAB_T
      let i = 0
      for (const x of GRID_X) {
        for (const z of GRID_Z) {
          out.push({ x, z, base, h: top - base, level, order: i++ / (GRID_X.length * GRID_Z.length) })
        }
      }
    }
    const pTop = PAVILION_ROOF_Y - SLABS[2].t
    PAVILION_COLS.forEach(([x, z], i) =>
      out.push({ x, z, base: LEVEL_Y[2], h: pTop - LEVEL_Y[2], level: 2, order: i / 4 }),
    )
    return out
  }, [])

  return (
    <group>
      {/* --- Pad footings ------------------------------------- */}
      {pads.map((p, i) => (
        <Assembly key={`pad-${i}`} window={PHASE.footings} offset={(i / pads.length) * 0.45} length={0.55}>
          <mesh position={[p.x, PAD_H / 2, p.z]} geometry={boxGeo(PAD, PAD_H, PAD)} material={M.concrete} />
        </Assembly>
      ))}

      {/* Strip footing under the stone wall. */}
      <Assembly window={PHASE.footings} offset={0.5} length={0.5}>
        <mesh
          position={[(STONE_WALL.x0 + STONE_WALL.x1) / 2, PAD_H / 2, (STONE_WALL.z0 + STONE_WALL.z1) / 2]}
          geometry={boxGeo(1.2, PAD_H, STONE_WALL.z1 - STONE_WALL.z0 + 0.4)}
          material={M.concrete}
        />
      </Assembly>

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
          <mesh position={[b.x, b.y, b.z]} geometry={boxGeo(...b.s)} material={M.concrete} />
        </Assembly>
      ))}

      {/* --- Ground floor slab on grade ----------------------- */}
      <Assembly window={PHASE.groundBeams} offset={0.45} length={0.55} mode="fade">
        <mesh
          position={[rectCX(GROUND), LEVEL_Y[0] - 0.065, rectCZ(GROUND)]}
          geometry={boxGeo(rectW(GROUND) + 0.3, 0.13, rectD(GROUND) + 0.3)}
          material={M.screed}
        />
      </Assembly>

      {/* --- Cages, then columns, level by level --------------- */}
      {columns.map((c, i) => {
        const win = frameWindow(c.level, 'columns')
        return (
          <group key={`col-${i}`} position={[c.x, c.base, c.z]}>
            <Assembly window={win} offset={c.order * 0.4} length={0.35} merge>
              <RebarCage height={c.h * 0.96} segments={segments} />
            </Assembly>
            <Assembly window={win} offset={c.order * 0.4 + 0.25} length={0.35}>
              <mesh position-y={c.h / 2} geometry={boxGeo(COL, c.h, COL)} material={M.frame} />
            </Assembly>
          </group>
        )
      })}

      {/* --- Suspended slabs ---------------------------------- */}
      {SLABS.map((s) => (
        <Assembly key={`slab-${s.level}`} window={frameWindow(s.level - 1, 'slab')} mode="crane" drop={5}>
          <mesh
            position={[rectCX(s), s.top - s.t / 2, rectCZ(s)]}
            geometry={boxGeo(rectW(s), s.t, rectD(s))}
            material={M.frame}
          />
        </Assembly>
      ))}
    </group>
  )
}
