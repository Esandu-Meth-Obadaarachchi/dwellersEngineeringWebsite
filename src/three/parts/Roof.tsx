import { useMemo } from 'react'
import { M } from '../materials'
import { Assembly } from '../Assembly'
import { boxGeo, blobGeo } from '../geometry'
import { PHASE } from '../schedule'
import {
  SLABS, LEVEL_Y, PAVILION, PAVILION_ROOF_Y, PERGOLA, FIRST, STONE_WALL,
  rectW, rectD, rectCX, rectCZ, type Rect,
} from '../villa'

type Rail = { x0: number; z0: number; x1: number; z1: number; y: number }

const RAIL_H = 1.1

/**
 * Everything above the slabs: the roof terrace and the balcony.
 *
 * Hardwood decking under the pergola, paving by the pavilion and gravel
 * on the pavilion roof; frameless glass balustrades on every open edge;
 * a teak pergola on slim steel posts; and planters, so the roof reads as
 * a place to sit rather than a lid.
 */
export function Roof() {
  const [first, roof, cap] = SLABS
  const r = LEVEL_Y[2]

  const deck: Rect = { x0: PAVILION.x1, x1: roof.x1 - 0.15, z0: roof.z0 + 0.15, z1: roof.z1 - 0.15 }
  const paving: Rect = { x0: roof.x0 + 0.15, x1: PAVILION.x1, z0: PAVILION.z1, z1: roof.z1 - 0.15 }

  const rails = useMemo<Rail[]>(() => {
    const e = 0.12
    const f = LEVEL_Y[1]
    return [
      // Roof terrace: every edge the pavilion does not close.
      { x0: roof.x0 + e, z0: roof.z1 - e, x1: roof.x1 - e, z1: roof.z1 - e, y: r },
      { x0: roof.x1 - e, z0: roof.z0 + e, x1: roof.x1 - e, z1: roof.z1 - e, y: r },
      { x0: PAVILION.x1, z0: roof.z0 + e, x1: roof.x1 - e, z1: roof.z0 + e, y: r },
      { x0: roof.x0 + e, z0: PAVILION.z1, x1: roof.x0 + e, z1: roof.z1 - e, y: r },
      // First-floor balcony, south and east.
      { x0: first.x0 + 0.1, z0: first.z1 - e, x1: first.x1 - e, z1: first.z1 - e, y: f },
      { x0: first.x1 - e, z0: FIRST.z1, x1: first.x1 - e, z1: first.z1 - e, y: f },
      // The side terrace beside the stone wall.
      { x0: STONE_WALL.x1 + 0.05, z0: first.z0 + e, x1: FIRST.x0, z1: first.z0 + e, y: f },
    ]
  }, [first, roof, r])

  return (
    <group>
      {/* --- Surfaces ----------------------------------------- */}
      <Assembly window={PHASE.roof} length={0.4} mode="fade" merge>
        <Surface rect={deck} y={r} material={M.deck} t={0.06} />
        <Surface rect={paving} y={r} material={M.paving} t={0.05} />
        <Surface rect={{ x0: cap.x0 + 0.2, x1: cap.x1 - 0.2, z0: cap.z0 + 0.2, z1: cap.z1 - 0.2 }} y={PAVILION_ROOF_Y} material={M.gravel} t={0.05} />
        {/* Balcony: decked, like the terrace above it. */}
        <Surface rect={{ x0: FIRST.x0, x1: first.x1 - 0.1, z0: FIRST.z1, z1: first.z1 - 0.1 }} y={LEVEL_Y[1]} material={M.deck} t={0.05} />
      </Assembly>

      {/* --- Balustrades -------------------------------------- */}
      <Assembly window={PHASE.roof} offset={0.3} length={0.4} mode="fade" merge>
        {rails.map((rl, i) => (
          <Balustrade key={i} {...rl} />
        ))}
      </Assembly>

      {/* --- Pergola ------------------------------------------ */}
      <Assembly window={PHASE.roof} offset={0.45} length={0.45} mode="crane" drop={2.5} merge>
        <Pergola />
      </Assembly>

      {/* --- Planters and furniture --------------------------- */}
      <Assembly window={PHASE.roof} offset={0.7} length={0.3} mode="fade" merge>
        <Planters />
        <Loungers x={-1.2} z={2.4} y={r + 0.06} n={2} />
      </Assembly>
    </group>
  )
}

function Surface({ rect, y, material, t }: { rect: Rect; y: number; material: typeof M.deck; t: number }) {
  return (
    <mesh position={[rectCX(rect), y + t / 2, rectCZ(rect)]} geometry={boxGeo(rectW(rect), t, rectD(rect))} material={material} />
  )
}

/** Frameless glass on a shoe channel, with a slim steel cap. */
function Balustrade({ x0, z0, x1, z1, y }: Rail) {
  const len = Math.hypot(x1 - x0, z1 - z0)
  const along = Math.abs(x1 - x0) > Math.abs(z1 - z0)
  const cx = (x0 + x1) / 2
  const cz = (z0 + z1) / 2
  const size = (h: number, t: number): [number, number, number] => (along ? [len, h, t] : [t, h, len])

  return (
    <group position={[cx, y, cz]}>
      <mesh position-y={0.06} geometry={boxGeo(...size(0.12, 0.08))} material={M.darkSteel} />
      <mesh position-y={RAIL_H / 2 + 0.06} geometry={boxGeo(...size(RAIL_H, 0.02))} material={M.railGlass} />
      <mesh position-y={RAIL_H + 0.08} geometry={boxGeo(...size(0.04, 0.05))} material={M.darkSteel} />
    </group>
  )
}

/** Teak pergola: two beams on four posts, rafters at 450 mm. */
function Pergola() {
  const p = PERGOLA
  const h = p.y - LEVEL_Y[2]
  const rafters = useMemo(() => {
    const n = Math.floor(rectW(p) / 0.45)
    return Array.from({ length: n + 1 }, (_, i) => p.x0 + 0.1 + i * ((rectW(p) - 0.2) / n))
  }, [p])

  const posts: [number, number][] = [
    [p.x1 - 0.15, p.z0 + 0.15],
    [p.x1 - 0.15, p.z1 - 0.15],
    [p.x0 + 0.15, p.z1 - 0.15],
  ]

  return (
    <group>
      {posts.map(([x, z], i) => (
        <mesh key={i} position={[x, LEVEL_Y[2] + h / 2, z]} geometry={boxGeo(0.14, h, 0.14)} material={M.darkSteel} />
      ))}
      {[p.z0 + 0.15, p.z1 - 0.15].map((z) => (
        <mesh key={z} position={[rectCX(p), p.y + 0.15, z]} geometry={boxGeo(rectW(p), 0.3, 0.12)} material={M.timber} />
      ))}
      {rafters.map((x) => (
        <mesh key={x} position={[x, p.y + 0.42, rectCZ(p)]} geometry={boxGeo(0.07, 0.22, rectD(p) + 0.3)} material={M.timber} />
      ))}
    </group>
  )
}

/** Long render planters along the terrace edge, planted. */
function Planters() {
  const r = LEVEL_Y[2]
  const blob = useMemo(() => blobGeo(11, 1, 0.3), [])
  const boxes = [
    { x: -3, z: -7.6, w: 7, d: 0.6 },
    { x: 2.2, z: -3, w: 0.6, d: 5 },
  ]
  return (
    <group>
      {boxes.map((b, i) => {
        const along = b.w > b.d
        const n = Math.round((along ? b.w : b.d) / 0.7)
        return (
          <group key={i} position={[b.x, r, b.z]}>
            <mesh position-y={0.3} geometry={boxGeo(b.w, 0.6, b.d)} material={M.render} />
            {Array.from({ length: n }, (_, k) => {
              const t = (k + 0.5) / n - 0.5
              const s = 0.34 + ((k * 7) % 3) * 0.06
              return (
                <mesh
                  key={k}
                  geometry={blob}
                  position={[along ? t * b.w : 0, 0.62 + s * 0.5, along ? 0 : t * b.d]}
                  scale={[s, s * 1.1, s]}
                  material={k % 3 ? M.shrub : M.foliageLit}
                />
              )
            })}
          </group>
        )
      })}
    </group>
  )
}

/** Sun loungers: a teak frame and a pale cushion, raised at the back. */
export function Loungers({ x, z, y, n, gap = 1.1, rotation = 0 }: { x: number; z: number; y: number; n: number; gap?: number; rotation?: number }) {
  return (
    <group position={[x, y, z]} rotation-y={rotation}>
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position-x={(i - (n - 1) / 2) * gap}>
          <mesh position-y={0.17} geometry={boxGeo(0.7, 0.08, 1.95)} material={M.timber} />
          <mesh position-y={0.26} geometry={boxGeo(0.64, 0.1, 1.3)} position-z={0.3} material={M.fabric} />
          <mesh position={[0, 0.48, -0.62]} rotation-x={-0.95} geometry={boxGeo(0.64, 0.1, 0.72)} material={M.fabric} />
          {[-0.28, 0.28].map((sx) =>
            [-0.85, 0.85].map((sz) => (
              <mesh key={`${sx}${sz}`} position={[sx, 0.07, sz]} geometry={boxGeo(0.05, 0.14, 0.05)} material={M.timber} />
            )),
          )}
        </group>
      ))}
    </group>
  )
}
