import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { M, BLOCK_RAW, RENDER_FINISH } from '../materials'
import { Assembly, readProgress } from '../Assembly'
import { ease, span } from '../progress'
import { PHASE, PLOT, HOUSE, HOUSE_CZ, POOL } from '../schedule'

const HALF_W = PLOT.w / 2
const HALF_D = PLOT.d / 2

/**
 * Boundary, hard landscaping, planting and external lighting.
 *
 * The last phase, and the one that turns a structure into a property:
 * the wall goes up, the drive is paved, planting goes in, and the
 * lights come on for handover.
 */
export function Landscape({ trees }: { trees: number }) {
  return (
    <group>
      <BoundaryWall />
      <Paving />
      <Planting count={trees} />
      <Lighting />
    </group>
  )
}

/** Perimeter wall with piers, and a gate on the entrance elevation. */
function BoundaryWall() {
  const H = 1.9
  const piers = useMemo(() => {
    const out: { x: number; z: number }[] = []
    const step = 4
    for (let x = -HALF_W; x <= HALF_W + 0.01; x += step) {
      out.push({ x, z: -HALF_D })
      out.push({ x, z: HALF_D })
    }
    for (let z = -HALF_D + step; z < HALF_D - 0.01; z += step) {
      out.push({ x: -HALF_W, z })
      out.push({ x: HALF_W, z })
    }
    return out
  }, [])

  /** The gate opening on the north boundary, opposite the front door. */
  const gateHalf = 2.4
  const gateX = HOUSE.x0 + 2

  return (
    <group>
      {/* Wall panels, broken for the gate */}
      <Assembly window={PHASE.landscape} offset={0} length={0.4} mode="rise">
        <group>
          {/* North, in two lengths either side of the gate */}
          <Panel x0={-HALF_W} x1={gateX - gateHalf} z={-HALF_D} h={H} />
          <Panel x0={gateX + gateHalf} x1={HALF_W} z={-HALF_D} h={H} />
          {/* South */}
          <Panel x0={-HALF_W} x1={HALF_W} z={HALF_D} h={H} />
          {/* East and west */}
          <mesh position={[-HALF_W, H / 2, 0]} material={M.block}>
            <boxGeometry args={[0.22, H, PLOT.d]} />
          </mesh>
          <mesh position={[HALF_W, H / 2, 0]} material={M.block}>
            <boxGeometry args={[0.22, H, PLOT.d]} />
          </mesh>
        </group>
      </Assembly>

      {/* Piers */}
      <Assembly window={PHASE.landscape} offset={0.1} length={0.3} mode="rise">
        <group>
          {piers.map((p, i) => (
            <mesh key={i} position={[p.x, H * 0.56, p.z]} material={M.render}>
              <boxGeometry args={[0.42, H * 1.12, 0.42]} />
            </mesh>
          ))}
        </group>
      </Assembly>

      {/* Gate */}
      <Assembly window={PHASE.landscape} offset={0.42} length={0.28} mode="fade">
        <group position={[gateX, 0, -HALF_D]}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 1.25, H * 0.62, 0]} material={M.render}>
              <boxGeometry args={[0.5, H * 1.24, 0.5]} />
            </mesh>
          ))}
          {/* Vertical bars, reading as a gate rather than a slab. */}
          {Array.from({ length: 13 }, (_, i) => (
            <mesh
              key={i}
              position={[-1.05 + (i * 2.1) / 12, H * 0.5, 0]}
              material={M.steel}
            >
              <boxGeometry args={[0.05, H, 0.05]} />
            </mesh>
          ))}
          {[0.2, 0.86].map((f) => (
            <mesh key={f} position={[0, H * f, 0]} material={M.steel}>
              <boxGeometry args={[2.3, 0.07, 0.07]} />
            </mesh>
          ))}
        </group>
      </Assembly>
    </group>
  )
}

function Panel({ x0, x1, z, h }: { x0: number; x1: number; z: number; h: number }) {
  const w = x1 - x0
  if (w <= 0.05) return null
  return (
    <mesh position={[(x0 + x1) / 2, h / 2, z]} material={M.block}>
      <boxGeometry args={[w, h, 0.22]} />
    </mesh>
  )
}

/** Driveway and terrace, as instanced slabs laid in a grid. */
function Paving() {
  const slabs = useMemo(() => {
    const out: { x: number; z: number; s: number }[] = []
    const size = 1.2

    // Drive: from the gate down to the house.
    for (let z = -HALF_D + 0.8; z < HOUSE.z0 - 0.4; z += size) {
      for (let x = HOUSE.x0 - 0.2; x < HOUSE.x0 + 4.4; x += size) {
        out.push({ x, z, s: size })
      }
    }
    // Terrace between the house and the pool.
    for (let z = POOL.z0 - 1.4; z < POOL.z1 + 1.4; z += size) {
      for (let x = HOUSE.x1 + 0.4; x < POOL.x0 - 0.6; x += size) {
        out.push({ x, z, s: size })
      }
    }
    return out
  }, [])

  const mesh = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const settled = useRef(false)

  useFrame(() => {
    const inst = mesh.current
    if (!inst) return
    const t = ease(span(readProgress(), PHASE.landscape, 0.25, 0.6))
    if (t >= 1 && settled.current) return
    settled.current = t >= 1

    const visible = t > 0.002
    if (inst.visible !== visible) inst.visible = visible
    if (!visible) return

    for (let i = 0; i < slabs.length; i++) {
      const s = slabs[i]
      const local = ease(Math.max(0, Math.min(1, (t - (i / slabs.length) * 0.6) / 0.4)))
      dummy.position.set(s.x, 0.03, s.z)
      dummy.scale.set(s.s * 0.94 * local, 0.06, s.s * 0.94 * local)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    }
    inst.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, slabs.length]}
      material={M.paving}
      frustumCulled={false}
      visible={false}
    >
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  )
}

/** Low-poly planting. Deliberately sparse and very dark, so the scene
 *  stays black and gold rather than turning green. */
function Planting({ count }: { count: number }) {
  const spots = useMemo(() => {
    const candidates = [
      [HOUSE.x0 - 2.6, HOUSE.z1 + 2.2],
      [HOUSE.x1 + 1.4, HOUSE.z0 - 3.2],
      [POOL.x1 + 2.2, POOL.z1 + 1.4],
      [POOL.x1 + 2.6, POOL.z0 - 2.2],
      [HOUSE.x0 - 3.2, HOUSE.z0 - 2.4],
      [-HALF_W + 2.4, HALF_D - 2.6],
      [HALF_W - 2.2, HALF_D - 2.2],
      [-HALF_W + 2.2, -HALF_D + 3.4],
      [HOUSE.x0 + 5.5, HALF_D - 2.4],
      [HALF_W - 2.6, -HALF_D + 4.2],
    ] as const
    return candidates.slice(0, count).map(([x, z], i) => ({
      x,
      z,
      i,
      // Alternating palm and canopy tree keeps the silhouettes varied.
      palm: i % 3 === 0,
      h: 2.6 + ((i * 7) % 5) * 0.35,
    }))
  }, [count])

  return (
    <group>
      {spots.map((s) => (
        <Assembly
          key={s.i}
          window={PHASE.landscape}
          offset={0.4 + (s.i / Math.max(1, spots.length)) * 0.4}
          length={0.3}
          mode="rise"
        >
          <group position={[s.x, 0, s.z]}>
            <mesh position-y={s.h / 2} material={M.trunk}>
              <cylinderGeometry args={[0.1, 0.16, s.h, 6]} />
            </mesh>
            {s.palm ? (
              // Palm: fronds swept out and down from the head, each one
              // tapered so it reads as a leaf in silhouette rather than
              // a spoke.
              Array.from({ length: 8 }, (_, f) => (
                <mesh
                  key={f}
                  position={[
                    Math.sin((f / 8) * Math.PI * 2) * 0.82,
                    s.h - 0.18,
                    Math.cos((f / 8) * Math.PI * 2) * 0.82,
                  ]}
                  rotation={[
                    0,
                    -(f / 8) * Math.PI * 2,
                    f % 2 ? 0.46 : 0.62,
                  ]}
                  material={M.planting}
                >
                  <cylinderGeometry args={[0.02, 0.34, 1.9, 4, 1, false]} />
                </mesh>
              ))
            ) : (
              <mesh position-y={s.h + 0.5} material={M.planting}>
                <icosahedronGeometry args={[1.15, 0]} />
              </mesh>
            )}
          </group>
        </Assembly>
      ))}

      {/* Hedge along the pool terrace */}
      <Assembly window={PHASE.landscape} offset={0.55} length={0.35} mode="rise">
        <mesh position={[POOL.x1 + 1.1, 0.42, HOUSE_CZ]} material={M.planting}>
          <boxGeometry args={[0.7, 0.85, 7]} />
        </mesh>
      </Assembly>
    </group>
  )
}

/** External lighting. Comes on at handover, with the windows. */
function Lighting() {
  const bulbs = useRef<THREE.Group>(null!)
  const bulbMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#FFDE59',
        transparent: true,
        opacity: 0,
      }),
    [],
  )

  const posts = useMemo(
    () => [
      [HOUSE.x0 - 1.4, HOUSE.z0 - 2.4],
      [HOUSE.x0 + 4.6, HOUSE.z0 - 4.6],
      [POOL.x0 - 1.4, POOL.z0 - 1.4],
      [POOL.x1 + 1.2, POOL.z1 + 0.8],
    ] as const,
    [],
  )

  useFrame(() => {
    const p = readProgress()
    const t = ease(span(p, PHASE.handover))

    bulbMat.opacity = t
    // Windows warm up at the same moment.
    M.glass.emissiveIntensity = t * 0.85
    if (bulbs.current) bulbs.current.visible = t > 0.01

    // Finishes: the blockwork is rendered and painted over the last
    // two phases, so the shell visibly becomes a finished house.
    const finish = ease(span(p, PHASE.landscape, 0, 0.8))
    M.block.color.copy(BLOCK_RAW).lerp(RENDER_FINISH, finish)
  })

  return (
    <group>
      <Assembly window={PHASE.landscape} offset={0.6} length={0.3} mode="rise">
        <group>
          {posts.map(([x, z], i) => (
            <mesh key={i} position={[x, 0.55, z]} material={M.darkSteel}>
              <cylinderGeometry args={[0.05, 0.07, 1.1, 6]} />
            </mesh>
          ))}
        </group>
      </Assembly>

      <group ref={bulbs} visible={false}>
        {posts.map(([x, z], i) => (
          <mesh key={i} position={[x, 1.16, z]} material={bulbMat}>
            <sphereGeometry args={[0.11, 8, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
