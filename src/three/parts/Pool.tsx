import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { M } from '../materials'
import { Assembly, readProgress } from '../Assembly'
import { boxGeo } from '../geometry'
import { ease, span } from '../progress'
import { PHASE } from '../schedule'
import { POOL, DECK, rectW, rectD, rectCX, rectCZ } from '../villa'
import { Loungers } from './Roof'

const W = rectW(POOL)
const D = rectD(POOL)
const CX = rectCX(POOL)
const CZ = rectCZ(POOL)
const SHELL = 0.25
const DECK_T = 0.12

/**
 * The pool: dig, shell, mosaic, coping, deck, then water.
 *
 * Filling is the one moment in the sequence that is not assembly, so it
 * gets its own treatment: the surface rises through the tank and its
 * ripple is a vertex displacement on a coarse grid, cheap enough to
 * leave running.
 */
export function Pool({ segments }: { segments: number }) {
  // The deck is four boards-on-joists rectangles around the pool hole.
  const deck = useMemo(() => {
    const c = 0.45 // coping width
    return [
      { x0: DECK.x0, x1: DECK.x1, z0: DECK.z0, z1: POOL.z0 - c },
      { x0: DECK.x0, x1: DECK.x1, z0: POOL.z1 + c, z1: DECK.z1 },
      { x0: DECK.x0, x1: POOL.x0 - c, z0: POOL.z0 - c, z1: POOL.z1 + c },
      { x0: POOL.x1 + c, x1: DECK.x1, z0: POOL.z0 - c, z1: POOL.z1 + c },
    ]
  }, [])

  type V3 = [number, number, number]
  const walls: { p: V3; s: V3 }[] = [
    { p: [0, -POOL.depth / 2, -D / 2 - SHELL / 2], s: [W + SHELL * 2, POOL.depth, SHELL] },
    { p: [0, -POOL.depth / 2, D / 2 + SHELL / 2], s: [W + SHELL * 2, POOL.depth, SHELL] },
    { p: [-W / 2 - SHELL / 2, -POOL.depth / 2, 0], s: [SHELL, POOL.depth, D] },
    { p: [W / 2 + SHELL / 2, -POOL.depth / 2, 0], s: [SHELL, POOL.depth, D] },
  ]

  return (
    <group>
      {/* --- Excavation and tank ------------------------------ */}
      <Assembly window={PHASE.pool} length={0.3} mode="sink" drop={POOL.depth} merge>
        <group position={[CX, 0, CZ]}>
          <mesh position-y={-POOL.depth} geometry={boxGeo(W + SHELL * 2, SHELL, D + SHELL * 2)} material={M.concrete} />
          {walls.map((w, i) => (
            <mesh key={i} position={w.p} geometry={boxGeo(...w.s)} material={M.concrete} />
          ))}
        </group>
      </Assembly>

      {/* --- Mosaic lining ------------------------------------ */}
      <Assembly window={PHASE.pool} offset={0.28} length={0.26} mode="fade" merge>
        <group position={[CX, 0, CZ]}>
          <mesh position-y={-POOL.depth + 0.14} geometry={boxGeo(W, 0.03, D)} material={M.poolTile} />
          {walls.map((w, i) => {
            const [x, , z] = w.p
            const inX = Math.abs(x) > 0
            return (
              <mesh
                key={i}
                position={[inX ? Math.sign(x) * (W / 2 - 0.015) : 0, -POOL.depth / 2, inX ? 0 : Math.sign(z) * (D / 2 - 0.015)]}
                geometry={inX ? boxGeo(0.03, POOL.depth, D) : boxGeo(W, POOL.depth, 0.03)}
                material={M.poolTile}
              />
            )
          })}
          {/* Steps across the west end, each a block from the floor up. */}
          {[0, 1, 2].map((i) => {
            const top = -0.32 - i * 0.36
            return (
              <mesh
                key={i}
                position={[-W / 2 + 0.2 + i * 0.4, (top - POOL.depth) / 2, 0]}
                geometry={boxGeo(0.4, top + POOL.depth, D - 0.06)}
                material={M.poolTile}
              />
            )
          })}
        </group>
      </Assembly>

      {/* --- Coping ------------------------------------------- */}
      <Assembly window={PHASE.pool} offset={0.44} length={0.24} mode="fade" merge>
        <group position={[CX, 0, CZ]}>
          {[
            { p: [0, -D / 2 - 0.225], s: [W + 0.9, 0.45] },
            { p: [0, D / 2 + 0.225], s: [W + 0.9, 0.45] },
            { p: [-W / 2 - 0.225, 0], s: [0.45, D] },
            { p: [W / 2 + 0.225, 0], s: [0.45, D] },
          ].map((c, i) => (
            <mesh key={i} position={[c.p[0], DECK_T / 2 + 0.01, c.p[1]]} geometry={boxGeo(c.s[0], DECK_T + 0.02, c.s[1])} material={M.coping} />
          ))}
        </group>
      </Assembly>

      {/* --- Deck --------------------------------------------- */}
      <Assembly window={PHASE.pool} offset={0.5} length={0.3} mode="fade" merge>
        {deck.map((d, i) => (
          <mesh key={i} position={[rectCX(d), DECK_T / 2, rectCZ(d)]} geometry={boxGeo(rectW(d), DECK_T, rectD(d))} material={M.deck} />
        ))}
      </Assembly>

      <Water segments={segments} />

      {/* --- Loungers along the east deck --------------------- */}
      <Assembly window={PHASE.pool} offset={0.8} length={0.2} mode="fade" merge>
        <Loungers x={POOL.x1 + 1.9} z={CZ} y={DECK_T} n={3} gap={1.2} rotation={Math.PI / 2} />
      </Assembly>
    </group>
  )
}

/** Water surface: rises as the tank fills, then ripples. */
function Water({ segments }: { segments: number }) {
  const mesh = useRef<THREE.Mesh>(null!)
  const geo = useMemo(() => {
    const seg = Math.max(8, Math.min(32, segments * 2))
    return new THREE.PlaneGeometry(W - 0.04, D - 0.04, seg, Math.round(seg / 2))
  }, [segments])

  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo])
  const clock = useRef(0)

  useFrame((_, dt) => {
    const m = mesh.current
    if (!m) return

    const fill = ease(span(readProgress(), PHASE.pool, 0.55, 0.45))
    const visible = fill > 0.002
    if (m.visible !== visible) m.visible = visible
    if (!visible) return

    // The surface climbs to 10 cm below the coping.
    m.position.y = -POOL.depth + 0.15 + fill * (POOL.depth - 0.25)

    clock.current += dt
    const t = clock.current
    const pos = geo.attributes.position
    const arr = pos.array as Float32Array
    for (let i = 0; i < arr.length; i += 3) {
      const x = base[i]
      const y = base[i + 1]
      arr[i + 2] = Math.sin(x * 1.4 + t * 1.1) * 0.02 + Math.sin(y * 2.3 - t * 0.8) * 0.015
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
  })

  return (
    <mesh
      ref={mesh}
      geometry={geo}
      material={M.water}
      position={[CX, -POOL.depth, CZ]}
      rotation-x={-Math.PI / 2}
      visible={false}
    />
  )
}
