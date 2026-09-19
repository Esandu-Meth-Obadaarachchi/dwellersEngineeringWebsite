import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { M } from '../materials'
import { Assembly, readProgress } from '../Assembly'
import { ease, span } from '../progress'
import { PHASE, POOL } from '../schedule'

const W = POOL.x1 - POOL.x0
const D = POOL.z1 - POOL.z0
const CX = (POOL.x0 + POOL.x1) / 2
const CZ = (POOL.z0 + POOL.z1) / 2
const SHELL = 0.22

/**
 * The pool: dig, shell, tiling, coping, then water.
 *
 * Filling is the one moment in the sequence that is not assembly, so
 * it gets its own treatment — the surface rises through the tank and
 * its ripple is a vertex displacement on a coarse grid, cheap enough
 * to leave running.
 */
export function Pool({ segments }: { segments: number }) {
  return (
    <group>
      {/* --- Excavation and tank ------------------------------ */}
      <Assembly window={PHASE.pool} offset={0} length={0.3} mode="sink" drop={POOL.depth}>
        <group position={[CX, 0, CZ]}>
          {/* Base slab */}
          <mesh position-y={-POOL.depth} material={M.concrete}>
            <boxGeometry args={[W + SHELL * 2, SHELL, D + SHELL * 2]} />
          </mesh>
          {/* Four tank walls */}
          {[
            { p: [0, -POOL.depth / 2, -D / 2 - SHELL / 2], s: [W + SHELL * 2, POOL.depth, SHELL] },
            { p: [0, -POOL.depth / 2, D / 2 + SHELL / 2], s: [W + SHELL * 2, POOL.depth, SHELL] },
            { p: [-W / 2 - SHELL / 2, -POOL.depth / 2, 0], s: [SHELL, POOL.depth, D] },
            { p: [W / 2 + SHELL / 2, -POOL.depth / 2, 0], s: [SHELL, POOL.depth, D] },
          ].map((w, i) => (
            <mesh key={i} position={w.p as [number, number, number]} material={M.concrete}>
              <boxGeometry args={w.s as [number, number, number]} />
            </mesh>
          ))}
        </group>
      </Assembly>

      {/* --- Tiled lining ------------------------------------- */}
      <Assembly window={PHASE.pool} offset={0.28} length={0.26} mode="fade">
        <group position={[CX, 0, CZ]}>
          <mesh position-y={-POOL.depth + 0.12} material={M.poolTile}>
            <boxGeometry args={[W, 0.03, D]} />
          </mesh>
          {[
            { p: [0, -POOL.depth / 2, -D / 2 + 0.02], s: [W, POOL.depth, 0.03] },
            { p: [0, -POOL.depth / 2, D / 2 - 0.02], s: [W, POOL.depth, 0.03] },
            { p: [-W / 2 + 0.02, -POOL.depth / 2, 0], s: [0.03, POOL.depth, D] },
            { p: [W / 2 - 0.02, -POOL.depth / 2, 0], s: [0.03, POOL.depth, D] },
          ].map((w, i) => (
            <mesh key={i} position={w.p as [number, number, number]} material={M.poolTile}>
              <boxGeometry args={w.s as [number, number, number]} />
            </mesh>
          ))}
        </group>
      </Assembly>

      {/* --- Coping and surround ------------------------------ */}
      <Assembly window={PHASE.pool} offset={0.44} length={0.24} mode="fade">
        <group position={[CX, 0, CZ]}>
          {[
            { p: [0, 0.06, -D / 2 - 0.35], s: [W + 1.4, 0.12, 0.7] },
            { p: [0, 0.06, D / 2 + 0.35], s: [W + 1.4, 0.12, 0.7] },
            { p: [-W / 2 - 0.35, 0.06, 0], s: [0.7, 0.12, D] },
            { p: [W / 2 + 0.35, 0.06, 0], s: [0.7, 0.12, D] },
          ].map((c, i) => (
            <mesh key={i} position={c.p as [number, number, number]} material={M.coping}>
              <boxGeometry args={c.s as [number, number, number]} />
            </mesh>
          ))}
        </group>
      </Assembly>

      {/* --- Water -------------------------------------------- */}
      <Water segments={segments} />

      {/* --- Steps into the shallow end ----------------------- */}
      <Assembly window={PHASE.pool} offset={0.5} length={0.2} mode="fade">
        <group position={[POOL.x0 + 0.9, 0, CZ]}>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[0, -0.3 - i * 0.38, 0]}
              material={M.poolTile}
            >
              <boxGeometry args={[1.5, 0.12, D * 0.42 - i * 0.2]} />
            </mesh>
          ))}
        </group>
      </Assembly>
    </group>
  )
}

/** Water surface: rises as the tank fills, then ripples. */
function Water({ segments }: { segments: number }) {
  const mesh = useRef<THREE.Mesh>(null!)
  const geo = useMemo(() => {
    const seg = Math.max(6, Math.min(24, segments))
    return new THREE.PlaneGeometry(W - 0.06, D - 0.06, seg, seg)
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

    // Surface climbs from the tank floor to 12cm below coping.
    m.position.y = -POOL.depth + 0.15 + fill * (POOL.depth - 0.27)
    M.water.opacity = 0.6 + fill * 0.3

    // Ripple: two crossed sine waves on a coarse grid.
    clock.current += dt
    const t = clock.current
    const pos = geo.attributes.position
    const arr = pos.array as Float32Array
    for (let i = 0; i < arr.length; i += 3) {
      const x = base[i]
      const y = base[i + 1]
      arr[i + 2] =
        Math.sin(x * 1.6 + t * 1.1) * 0.035 + Math.sin(y * 2.1 - t * 0.8) * 0.025
    }
    pos.needsUpdate = true
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
