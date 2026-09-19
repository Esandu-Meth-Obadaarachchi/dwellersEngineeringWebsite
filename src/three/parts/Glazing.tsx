import { useMemo } from 'react'
import { M } from '../materials'
import { Assembly } from '../Assembly'
import { PHASE, HOUSE } from '../schedule'
import { RUNS, WALL_T, openingsFor, openingBox } from '../envelope'

/**
 * Glazing, frames, sills and entrance doors.
 *
 * Each pane is generated from the same opening table the blockwork was
 * laid around, so nothing has to be positioned by hand and nothing can
 * drift out of its hole.
 */
export function Glazing() {
  const units = useMemo(() => {
    const out: {
      key: string
      x: number
      y: number
      z: number
      ry: number
      w: number
      h: number
      nx: number
      nz: number
      door: boolean
      order: number
    }[] = []

    for (let storey = 0; storey < HOUSE.storeys; storey++) {
      for (const run of RUNS) {
        for (const [i, o] of openingsFor(run.key, storey).entries()) {
          const b = openingBox(run, o, storey)
          out.push({
            key: `${run.key}-${storey}-${i}`,
            x: b.x,
            y: b.y,
            z: b.z,
            ry: b.ry,
            w: b.width,
            h: b.height,
            nx: run.nx,
            nz: run.nz,
            door: Boolean(o.door),
            order: 0,
          })
        }
      }
    }

    // Glaze from the ground up, the way scaffold comes down.
    return out.map((u, i) => ({ ...u, order: i / out.length }))
  }, [])

  return (
    <group>
      {units.map((u) => (
        <Assembly
          key={u.key}
          window={PHASE.glazing}
          offset={u.order * 0.5}
          length={0.5}
          mode="fade"
        >
          <group position={[u.x, u.y, u.z]} rotation-y={u.ry}>
            {/* Pane, set just inside the reveal. */}
            <mesh material={M.glass}>
              <boxGeometry args={[u.w * 0.94, u.h * 0.94, 0.04]} />
            </mesh>

            {/* Frame: head, sill and two jambs. */}
            {[
              { p: [0, u.h / 2 - 0.04, 0], s: [u.w, 0.09, WALL_T * 0.9] },
              { p: [0, -u.h / 2 + 0.04, 0], s: [u.w, 0.09, WALL_T * 0.9] },
              { p: [-u.w / 2 + 0.04, 0, 0], s: [0.09, u.h, WALL_T * 0.9] },
              { p: [u.w / 2 - 0.04, 0, 0], s: [0.09, u.h, WALL_T * 0.9] },
            ].map((f, i) => (
              <mesh
                key={i}
                position={f.p as [number, number, number]}
                material={M.darkSteel}
              >
                <boxGeometry args={f.s as [number, number, number]} />
              </mesh>
            ))}

            {/* A transom on the wider openings. */}
            {u.w > 2 && !u.door && (
              <mesh position={[0, u.h * 0.1, 0]} material={M.darkSteel}>
                <boxGeometry args={[u.w, 0.06, WALL_T * 0.85]} />
              </mesh>
            )}

            {/* Projecting sill, outboard of the wall face. */}
            <mesh
              position={[0, -u.h / 2 - 0.06, (u.nz !== 0 ? u.nz : u.nx) * 0.09]}
              material={M.coping}
            >
              <boxGeometry args={[u.w + 0.2, 0.07, WALL_T + 0.2]} />
            </mesh>

            {/* Timber leaf in the entrance door. */}
            {u.door && (
              <mesh position={[0, 0, 0.03]} material={M.timber}>
                <boxGeometry args={[u.w * 0.9, u.h * 0.95, 0.06]} />
              </mesh>
            )}
          </group>
        </Assembly>
      ))}
    </group>
  )
}
