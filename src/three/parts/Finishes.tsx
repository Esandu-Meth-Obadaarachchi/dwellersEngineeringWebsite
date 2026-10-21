import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { M, CONCRETE, RENDER } from '../materials'
import { Assembly, readProgress } from '../Assembly'
import { boxGeo, planeGeo } from '../geometry'
import { ease, span } from '../progress'
import { PHASE } from '../schedule'
import {
  WALLS, WALL_T, LEVEL_Y, SLABS, SLAB_T, STONE_WALL, LOUVRES, FIRST, GROUND,
  wallPanels, wallPoint, wallRotation, rectW, rectD, rectCX, rectCZ,
} from '../villa'

/**
 * The finishing trades, which are what make a frame into a house.
 *
 * Render goes over the blockwork wall by wall, from the base up, and the
 * concrete frame is painted the same white, so the finished building
 * reads as one crisp volume rather than a stack of blocks. Then the
 * materials that carry the design: the ledgestone blade wall, the teak
 * fins over the east glazing, and teak-lined soffits under the deep
 * overhangs.
 */
export function Finishes() {
  // The frame — columns and slab edges — takes its paint with the walls.
  useFrame(() => {
    const t = ease(span(readProgress(), PHASE.finishes, 0.2, 0.8))
    M.frame.color.lerpColors(CONCRETE, RENDER, t)
  })

  return (
    <group>
      <Render />
      <StoneWall />
      <Louvres />
      <Soffits />
    </group>
  )
}

/** The render coat: each wall's solid panels, slightly proud of the
 *  blockwork, rising over it from the floor. */
function Render() {
  const walls = useMemo(
    () =>
      WALLS.map((w, i) => ({
        w,
        panels: wallPanels(w),
        order: (w.level * 4 + (i % 4)) / (WALLS.length + 4),
      })),
    [],
  )

  return (
    <group>
      {walls.map(({ w, panels, order }) => (
        <group key={w.key} position={wallPoint(w, 0, 0)} rotation-y={wallRotation(w)}>
          <Assembly window={PHASE.finishes} offset={order * 0.6} length={0.4} merge>
            {panels.map((p, j) => (
              <mesh
                key={j}
                position={[(p.a + p.b) / 2, (p.y0 + p.y1) / 2, 0]}
                geometry={boxGeo(p.b - p.a, p.y1 - p.y0, WALL_T + 0.06)}
                material={M.render}
              />
            ))}
          </Assembly>
        </group>
      ))}
    </group>
  )
}

/** The blade wall: laid in stone from the ground, through both floors,
 *  and up past the roof as a parapet. */
function StoneWall() {
  const s = STONE_WALL
  const h = s.y1 - s.y0
  return (
    <group position={[(s.x0 + s.x1) / 2, s.y0, (s.z0 + s.z1) / 2]}>
      <Assembly window={PHASE.stone} merge>
        <mesh position-y={h / 2} geometry={boxGeo(s.x1 - s.x0, h, s.z1 - s.z0)} material={M.stone} />
        {/* A dark steel capping strip finishes the top edge. */}
        <mesh position-y={h + 0.02} geometry={boxGeo(s.x1 - s.x0 + 0.04, 0.04, s.z1 - s.z0 + 0.04)} material={M.darkSteel} />
      </Assembly>
    </group>
  )
}

/** Vertical teak fins over the first floor's east glazing: shade from
 *  the low morning sun without closing the view. */
function Louvres() {
  const l = LOUVRES
  const h = l.y1 - l.y0
  const fins = useMemo(() => {
    const n = Math.floor((l.z1 - l.z0) / l.pitch)
    return Array.from({ length: n + 1 }, (_, i) => l.z0 + i * l.pitch)
  }, [l])

  return (
    <group position={[l.x, l.y0, 0]}>
      <Assembly window={PHASE.finishes} offset={0.55} length={0.45} merge>
        {fins.map((z, i) => (
          <mesh key={i} position={[0, h / 2, z]} geometry={boxGeo(l.depth, h, l.fin)} material={M.timber} />
        ))}
        {/* Top and bottom rails tie the fins back to the slab edges. */}
        {[0.05, h - 0.05].map((y) => (
          <mesh
            key={y}
            position={[0, y, (l.z0 + l.z1) / 2]}
            geometry={boxGeo(0.08, 0.08, l.z1 - l.z0 + 0.1)}
            material={M.darkSteel}
          />
        ))}
      </Assembly>
    </group>
  )
}

/** Teak-lined soffits under the balcony and the roof overhang, where
 *  anyone standing on the terrace actually looks up. */
function Soffits() {
  const items = useMemo(() => {
    const [first, roof] = SLABS
    return [
      // Under the first-floor balcony: the covered terrace's ceiling.
      { x0: GROUND.x0 - 2, x1: first.x1, z0: GROUND.z1, z1: first.z1, y: LEVEL_Y[1] - SLAB_T - 0.01 },
      // Under the roof overhang: the balcony's ceiling.
      { x0: FIRST.x0, x1: roof.x1, z0: FIRST.z1, z1: roof.z1, y: LEVEL_Y[2] - SLAB_T - 0.01 },
    ]
  }, [])

  return (
    <Assembly window={PHASE.finishes} offset={0.6} length={0.4} mode="fade" merge>
      {items.map((s, i) => (
        <mesh
          key={i}
          position={[rectCX(s), s.y, rectCZ(s)]}
          rotation-x={Math.PI / 2}
          geometry={planeGeo(rectW(s), rectD(s))}
          material={M.timber}
        />
      ))}
    </Assembly>
  )
}
