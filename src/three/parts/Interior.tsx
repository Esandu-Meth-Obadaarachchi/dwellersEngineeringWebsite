import { M } from '../materials'
import { Assembly } from '../Assembly'
import { boxGeo } from '../geometry'
import { PHASE } from '../schedule'
import { GROUND, FIRST, PAVILION, LEVEL_Y, SLAB_T, PAVILION_ROOF_Y, WALL_T, rectW, rectD, rectCX, rectCZ } from '../villa'

/**
 * What you see through the glass.
 *
 * A house with dark, empty rooms behind full-height glazing reads as a
 * model, not a home. A few pieces are enough to fix that: floors,
 * partitions, a living room, a dining table, beds upstairs and ceiling
 * lights that come on at handover. Everything here is simple boxes and
 * sits well inside the envelope, so it costs little and never clips.
 */
export function Interior() {
  const g = LEVEL_Y[0]
  const f = LEVEL_Y[1]
  const r = LEVEL_Y[2]

  return (
    <Assembly window={PHASE.interior} mode="fade" merge>
      {/* --- Floors --------------------------------------------- */}
      <Floor y={g} rect={GROUND} />
      <Floor y={f} rect={FIRST} />
      <Floor y={r} rect={PAVILION} />

      {/* --- Ground floor: living, dining, kitchen --------------- */}
      <Partition x0={GROUND.x0} x1={-6.5} z={-3.5} y={g} />
      <Sofa x={-10} z={-1.6} y={g} />
      <mesh position={[-10, g + 0.01, -0.4]} geometry={boxGeo(4, 0.02, 2.8)} material={M.fabricDark} />
      <mesh position={[-10, g + 0.2, -0.3]} geometry={boxGeo(1.4, 0.4, 0.8)} material={M.timber} />
      <Dining x={-2.6} z={-1.3} y={g} />
      <mesh position={[-2.6, g + 0.46, -5.6]} geometry={boxGeo(3.4, 0.92, 1)} material={M.render} />
      <mesh position={[-2.6, g + 0.94, -5.6]} geometry={boxGeo(3.5, 0.04, 1.1)} material={M.fabricDark} />

      {/* --- First floor: three bedrooms behind the sliders ------ */}
      <Partition x0={FIRST.x0} x1={FIRST.x1} z={-4} y={f} />
      <Partition x0={-8} x1={-8} z0={-4} z1={FIRST.z1} y={f} />
      <Partition x0={-3} x1={-3} z0={-4} z1={FIRST.z1} y={f} />
      <Bed x={-10.5} y={f} />
      <Bed x={-5.5} y={f} />
      <Bed x={-0.5} y={f} />

      {/* --- Pavilion: a lounge on the roof ---------------------- */}
      <Sofa x={-10} z={-5.4} y={r} />

      {/* --- Ceiling lights: a grid of downlights per room ------- */}
      <Downlights rect={GROUND} y={f - SLAB_T} />
      <Downlights rect={FIRST} y={r - SLAB_T} />
      <Downlights rect={PAVILION} y={PAVILION_ROOF_Y - 0.26} />
    </Assembly>
  )
}

function Floor({ y, rect }: { y: number; rect: typeof GROUND }) {
  const inset = WALL_T / 2
  return (
    <mesh
      position={[rectCX(rect), y + 0.01, rectCZ(rect)]}
      geometry={boxGeo(rectW(rect) - inset * 2, 0.02, rectD(rect) - inset * 2)}
      material={M.interiorFloor}
    />
  )
}

/** A full-height internal wall, along x (at z) or along z (at x0 = x1). */
function Partition({ x0, x1, z, z0, z1, y }: { x0: number; x1: number; z?: number; z0?: number; z1?: number; y: number }) {
  const h = 3.2 - 0.02
  if (z !== undefined) {
    return <mesh position={[(x0 + x1) / 2, y + h / 2, z]} geometry={boxGeo(x1 - x0, h, 0.12)} material={M.render} />
  }
  const a = z0 ?? 0
  const b = z1 ?? 0
  return <mesh position={[x0, y + h / 2, (a + b) / 2]} geometry={boxGeo(0.12, h, b - a)} material={M.render} />
}

/** An L-shaped sofa, facing the garden. */
function Sofa({ x, z, y }: { x: number; z: number; y: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.22, 0]} geometry={boxGeo(3.2, 0.44, 0.95)} material={M.fabric} />
      <mesh position={[0, 0.55, -0.38]} geometry={boxGeo(3.2, 0.5, 0.2)} material={M.fabric} />
      <mesh position={[1.25, 0.22, 0.9]} geometry={boxGeo(0.95, 0.44, 1.2)} material={M.fabric} />
    </group>
  )
}

function Dining({ x, z, y }: { x: number; z: number; y: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position-y={0.74} geometry={boxGeo(2.6, 0.05, 1)} material={M.timber} />
      {[-1.1, 1.1].map((sx) => (
        <mesh key={sx} position={[sx, 0.37, 0]} geometry={boxGeo(0.08, 0.72, 0.8)} material={M.darkSteel} />
      ))}
      {[-0.8, 0, 0.8].flatMap((cx) =>
        [-0.75, 0.75].map((cz) => (
          <group key={`${cx}${cz}`} position={[cx, 0, cz]}>
            <mesh position-y={0.45} geometry={boxGeo(0.45, 0.06, 0.45)} material={M.fabricDark} />
            <mesh position={[0, 0.72, cz > 0 ? 0.2 : -0.2]} geometry={boxGeo(0.45, 0.5, 0.05)} material={M.fabricDark} />
          </group>
        )),
      )}
      {/* Three pendants over the table. */}
      {[-0.8, 0, 0.8].map((px) => (
        <mesh key={px} position={[px, 2.2, 0]} geometry={boxGeo(0.28, 0.16, 0.28)} material={M.lamp} />
      ))}
    </group>
  )
}

/** A bed with headboard, against the corridor wall, facing the view. */
function Bed({ x, y }: { x: number; y: number }) {
  return (
    <group position={[x, y, -2.6]}>
      <mesh position-y={0.2} geometry={boxGeo(1.9, 0.4, 2.1)} material={M.timber} />
      <mesh position-y={0.5} geometry={boxGeo(1.8, 0.22, 2)} material={M.fabric} />
      <mesh position={[0, 0.9, -1.1]} geometry={boxGeo(2.2, 1.1, 0.1)} material={M.fabricDark} />
    </group>
  )
}

function Downlights({ rect, y }: { rect: typeof GROUND; y: number }) {
  const nx = Math.max(2, Math.round(rectW(rect) / 3))
  const nz = Math.max(2, Math.round(rectD(rect) / 3))
  return (
    <group>
      {Array.from({ length: nx * nz }, (_, i) => {
        const ix = i % nx
        const iz = Math.floor(i / nx)
        return (
          <mesh
            key={i}
            position={[
              rect.x0 + ((ix + 0.5) * rectW(rect)) / nx,
              y - 0.015,
              rect.z0 + ((iz + 0.5) * rectD(rect)) / nz,
            ]}
            geometry={boxGeo(0.18, 0.02, 0.18)}
            material={M.lamp}
          />
        )
      })}
    </group>
  )
}
