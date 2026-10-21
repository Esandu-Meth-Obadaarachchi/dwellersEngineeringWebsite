import { useMemo } from 'react'
import { M } from '../materials'
import { Assembly } from '../Assembly'
import { boxGeo } from '../geometry'
import { PHASE } from '../schedule'
import { WALLS, WALL_T, wallPoint, wallRotation, localOut } from '../villa'

const F = 0.06 // frame face width
const FD = 0.1 // frame depth

/**
 * Windows and doors, generated from the same opening table the
 * blockwork was laid around and the render was cut to, so nothing is
 * positioned by hand and nothing can drift out of its hole.
 *
 * Sliders are split into panels no wider than a real one (about 2 m)
 * and set on two tracks; windows get a mullion when they are wide and a
 * stone sill outside; the entrance gets an oversized teak pivot door.
 */
export function Glazing() {
  const units = useMemo(() => {
    const all = WALLS.flatMap((w) =>
      w.openings.map((o, i) => ({ w, o, key: `${w.key}-${i}` })),
    )
    // Glaze from the ground up, the way the scaffold comes down.
    return all.map((u, i) => ({ ...u, order: i / all.length }))
  }, [])

  return (
    <group>
      {units.map(({ w, o, key, order }) => {
        const width = o.b - o.a
        const height = o.head - o.sill
        return (
          <group
            key={key}
            position={wallPoint(w, (o.a + o.b) / 2, (o.sill + o.head) / 2)}
            rotation-y={wallRotation(w)}
          >
            <Assembly window={PHASE.glazing} offset={order * 0.6} length={0.4} mode="fade" merge>
              {o.kind === 'slider' && <Slider w={width} h={height} />}
              {o.kind === 'window' && <Window w={width} h={height} out={localOut(w)} />}
              {o.kind === 'door' && <Door w={width} h={height} />}
              {o.kind === 'pivot' && <Pivot w={width} h={height} />}
            </Assembly>
          </group>
        )
      })}
    </group>
  )
}

/** A rectangular frame of four bars, centred on the opening. */
function Frame({ w, h, face = F, depth = FD }: { w: number; h: number; face?: number; depth?: number }) {
  return (
    <group>
      <mesh position-y={h / 2 - face / 2} geometry={boxGeo(w, face, depth)} material={M.alu} />
      <mesh position-y={-h / 2 + face / 2} geometry={boxGeo(w, face, depth)} material={M.alu} />
      <mesh position-x={-w / 2 + face / 2} geometry={boxGeo(face, h, depth)} material={M.alu} />
      <mesh position-x={w / 2 - face / 2} geometry={boxGeo(face, h, depth)} material={M.alu} />
    </group>
  )
}

function Pane({ w, h, z = 0 }: { w: number; h: number; z?: number }) {
  return <mesh position-z={z} geometry={boxGeo(w, h, 0.024)} material={M.glass} />
}

/** Multi-panel sliding glass on two tracks. */
function Slider({ w, h }: { w: number; h: number }) {
  const n = Math.max(2, Math.round(w / 2))
  const pw = (w - F * 2) / n
  return (
    <group>
      <Frame w={w} h={h} depth={WALL_T * 0.9} />
      {Array.from({ length: n }, (_, i) => {
        const x = -w / 2 + F + pw * (i + 0.5)
        // Alternate panels run on the inner and outer track.
        const z = i % 2 ? 0.035 : -0.035
        return (
          <group key={i} position={[x, 0, z]}>
            <Frame w={pw + 0.03} h={h - F * 2} face={0.05} depth={0.05} />
            <Pane w={pw - 0.07} h={h - F * 2 - 0.1} />
          </group>
        )
      })}
    </group>
  )
}

/** A window: frame, glass, a mullion if wide, and a projecting sill. */
function Window({ w, h, out }: { w: number; h: number; out: number }) {
  const split = w > 2.2 ? Math.round(w / 1.4) : 1
  return (
    <group>
      <Frame w={w} h={h} />
      <Pane w={w - F * 2} h={h - F * 2} />
      {Array.from({ length: split - 1 }, (_, i) => (
        <mesh
          key={i}
          position-x={-w / 2 + (w * (i + 1)) / split}
          geometry={boxGeo(0.05, h - F * 2, FD * 0.9)}
          material={M.alu}
        />
      ))}
      <mesh
        position={[0, -h / 2 - 0.03, out * (WALL_T / 2 + 0.03)]}
        geometry={boxGeo(w + 0.16, 0.06, 0.14)}
        material={M.coping}
      />
    </group>
  )
}

/** A plain teak door in an aluminium frame. */
function Door({ w, h }: { w: number; h: number }) {
  return (
    <group>
      <Frame w={w} h={h} />
      <mesh geometry={boxGeo(w - F * 2, h - F, 0.05)} position-y={-F / 2} material={M.timber} />
      <mesh position={[w / 2 - 0.2, 0, 0.05]} geometry={boxGeo(0.03, 0.3, 0.04)} material={M.chrome} />
    </group>
  )
}

/** The entrance: an oversized teak pivot door with a full-height pull. */
function Pivot({ w, h }: { w: number; h: number }) {
  const grooves = 7
  return (
    <group>
      <Frame w={w} h={h} face={0.08} depth={WALL_T * 0.9} />
      <mesh position-y={-0.04} geometry={boxGeo(w - 0.16, h - 0.08, 0.08)} material={M.timber} />
      {/* Routed vertical grooves give the leaf its grain direction. */}
      {Array.from({ length: grooves }, (_, i) => (
        <mesh
          key={i}
          position={[-w / 2 + 0.08 + ((w - 0.16) * (i + 1)) / (grooves + 1), -0.04, 0.042]}
          geometry={boxGeo(0.012, h - 0.12, 0.006)}
          material={M.darkSteel}
        />
      ))}
      <mesh position={[w / 2 - 0.3, 0, 0.1]} geometry={boxGeo(0.04, h * 0.6, 0.04)} material={M.darkSteel} />
    </group>
  )
}
