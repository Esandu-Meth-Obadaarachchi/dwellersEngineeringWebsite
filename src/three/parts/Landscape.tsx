import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { M, BLOCK_RAW, RENDER_FINISH } from '../materials'
import { Assembly, readProgress } from '../Assembly'
import { ease, span, clamp01 } from '../progress'
import { PHASE, PLOT, HOUSE, HOUSE_CZ, POOL } from '../schedule'

const HALF_W = PLOT.w / 2
const HALF_D = PLOT.d / 2

/**
 * Boundary, hard landscaping, planting and external lighting.
 *
 * The last phase, and the one that turns a structure into a property:
 * the wall goes up, the drive is paved, the garden goes in — lawn,
 * a stepping-stone path, foundation and boundary planting, flower
 * beds, potted topiary at the door — and the lights come on for
 * handover.
 */
export function Landscape({
  trees,
  shrubs,
  flowers,
  stones,
}: {
  trees: number
  shrubs: number
  flowers: number
  stones: number
}) {
  return (
    <group>
      <Lawn />
      <BoundaryWall />
      <Paving />
      <GardenPath count={stones} />
      <Planting count={trees} />
      <Shrubbery count={shrubs} />
      <FlowerBeds count={flowers} />
      <EntrancePlanters />
      <Lighting />
    </group>
  )
}

/**
 * Mown lawn.
 *
 * Four patches cover the plot's open ground — front, both sides and
 * the rear — leaving the drive, the terrace, the pool and the shed
 * their own hard surfaces. The gaps between patches read as bare
 * verge rather than a mistake: this is a property newly handed over,
 * not a finished park.
 */
function Lawn() {
  const patches = useMemo(
    () => [
      // Front lawn, east of the driveway.
      { x0: HOUSE.x0 + 5.2, x1: HALF_W - 1.1, z0: -HALF_D + 1.1, z1: HOUSE.z0 - 0.6 },
      // Rear lawn, the full width behind the house.
      { x0: -HALF_W + 1.1, x1: HALF_W - 1.1, z0: HOUSE.z1 + 0.8, z1: HALF_D - 1.1 },
      // East lawn, beyond the pool.
      { x0: POOL.x1 + 1.0, x1: HALF_W - 1.1, z0: POOL.z0 - 2, z1: POOL.z1 + 2 },
      // West side yard, along the house's blind wall.
      { x0: -HALF_W + 1.1, x1: HOUSE.x0 - 0.5, z0: HOUSE.z0 - 0.5, z1: HOUSE.z1 + 0.5 },
    ],
    [],
  )

  return (
    <group>
      {patches.map((p, i) => (
        <Assembly
          key={i}
          window={PHASE.landscape}
          offset={0.1 + i * 0.06}
          length={0.4}
          mode="fade"
        >
          <mesh
            rotation-x={-Math.PI / 2}
            position={[(p.x0 + p.x1) / 2, 0.006, (p.z0 + p.z1) / 2]}
            material={M.lawn}
          >
            <planeGeometry args={[p.x1 - p.x0, p.z1 - p.z0]} />
          </mesh>
        </Assembly>
      ))}
    </group>
  )
}

/** Perimeter wall with piers, coping and a gate on the entrance
 *  elevation. */
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

      {/* Coping: a capping course along every run, the detail that
          actually finishes a boundary wall. */}
      <Assembly window={PHASE.landscape} offset={0.06} length={0.3} mode="fade">
        <group>
          <Coping x0={-HALF_W} x1={gateX - gateHalf} z={-HALF_D} y={H} />
          <Coping x0={gateX + gateHalf} x1={HALF_W} z={-HALF_D} y={H} />
          <Coping x0={-HALF_W} x1={HALF_W} z={HALF_D} y={H} />
          <mesh position={[-HALF_W, H + 0.05, 0]} material={M.coping}>
            <boxGeometry args={[0.32, 0.1, PLOT.d + 0.1]} />
          </mesh>
          <mesh position={[HALF_W, H + 0.05, 0]} material={M.coping}>
            <boxGeometry args={[0.32, 0.1, PLOT.d + 0.1]} />
          </mesh>
        </group>
      </Assembly>

      {/* Piers, each finished with a small pyramid cap. */}
      <Assembly window={PHASE.landscape} offset={0.1} length={0.3} mode="rise">
        <group>
          {piers.map((p, i) => (
            <group key={i} position={[p.x, 0, p.z]}>
              <mesh position-y={H * 0.56} material={M.render}>
                <boxGeometry args={[0.42, H * 1.12, 0.42]} />
              </mesh>
              <mesh position-y={H * 1.12 + 0.16} material={M.coping}>
                <coneGeometry args={[0.34, 0.32, 4]} />
              </mesh>
            </group>
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

function Coping({ x0, x1, z, y }: { x0: number; x1: number; z: number; y: number }) {
  const w = x1 - x0
  if (w <= 0.05) return null
  return (
    <mesh position={[(x0 + x1) / 2, y + 0.05, z]} material={M.coping}>
      <boxGeometry args={[w + 0.1, 0.1, 0.32]} />
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

/** A curving stepping-stone path off the driveway, through the front
 *  lawn — the one piece of hard landscaping that isn't laid to a
 *  grid, so the garden doesn't read as an extension of the drive. */
function GardenPath({ count }: { count: number }) {
  const stones = useMemo(() => {
    const start = new THREE.Vector2(HOUSE.x0 + 5.4, -HALF_D + 1.6)
    const mid = new THREE.Vector2(HOUSE.x0 + 8.5, -HALF_D + 4.5)
    const end = new THREE.Vector2(HOUSE.x0 + 7.5, HOUSE.z0 - 1.4)
    const curve = new THREE.QuadraticBezierCurve(start, mid, end)

    const n = Math.max(4, count)
    return Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n
      const p = curve.getPoint(t)
      // A little side-to-side stagger, the way stepping-stones are
      // actually laid rather than snapped to a centreline.
      const jitter = Math.sin(i * 2.4) * 0.22
      const tangent = curve.getTangent(t)
      return {
        x: p.x - tangent.y * jitter,
        z: p.y + tangent.x * jitter,
        r: 0.32 + (i % 3) * 0.05,
        ry: (i * 0.7) % Math.PI,
        order: i / n,
      }
    })
  }, [count])

  const mesh = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const settled = useRef(false)

  useFrame(() => {
    const inst = mesh.current
    if (!inst) return
    const t = ease(span(readProgress(), PHASE.landscape, 0.15, 0.45))
    if (t >= 1 && settled.current) return
    settled.current = t >= 1

    const visible = t > 0.002
    if (inst.visible !== visible) inst.visible = visible
    if (!visible) return

    for (let i = 0; i < stones.length; i++) {
      const s = stones[i]
      const e = ease(clamp01((t - s.order * 0.7) / 0.3))
      dummy.position.set(s.x, 0.02, s.z)
      dummy.rotation.set(0, s.ry, 0)
      dummy.scale.set(s.r * e, 0.07, s.r * 0.86 * e)
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    }
    inst.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, stones.length]}
      material={M.stone}
      frustumCulled={false}
      visible={false}
    >
      <cylinderGeometry args={[1, 1, 1, 8]} />
    </instancedMesh>
  )
}

/** Low-poly planting. Canopy trees are built from a small cluster of
 *  offset foliage clumps in two tones, so they read as a mass of
 *  leaves rather than a single faceted ball. Deliberately sparse and
 *  dark, so the scene stays black and gold rather than turning green. */
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
      lean: (((i * 37) % 11) - 5) * 0.012,
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
          <group position={[s.x, 0, s.z]} rotation-z={s.lean}>
            {/* Root flare: a short, wider taper where the trunk meets
                grade, rather than a trunk punching straight into it. */}
            {!s.palm && (
              <mesh position-y={0.12} material={M.trunk}>
                <cylinderGeometry args={[0.22, 0.3, 0.24, 7]} />
              </mesh>
            )}
            <mesh position-y={s.h / 2} material={M.trunk}>
              <cylinderGeometry args={[0.1, s.palm ? 0.16 : 0.2, s.h, 6]} />
            </mesh>
            {s.palm ? (
              // Palm crown: each frond is a sweep group (fans it round
              // the trunk) wrapping a droop group (tips it from vertical
              // to a shallow downward arc), with the blade itself
              // translated so its wide base sits at the crown centre and
              // its point trails away — rather than straddling the
              // attachment point, which is what read as an agave spike
              // rather than a palm.
              <group position-y={s.h}>
                {Array.from({ length: 9 }, (_, f) => {
                  const theta = (f / 9) * Math.PI * 2
                  // Two segments per frond: the first rises from the
                  // crown before arching over, the second falls away
                  // beyond it — the shape that actually reads as a
                  // palm frond rather than a straight spike.
                  const rise = Math.PI / 2 - (0.26 + (f % 3) * 0.06)
                  const bend = 1.1 + (f % 2 ? 0.18 : 0)
                  const l1 = 0.55
                  const l2 = 1.2 + (f % 3) * 0.16
                  return (
                    <group key={f} rotation-y={theta}>
                      <group rotation-x={rise}>
                        <mesh position-y={l1 / 2} material={M.planting}>
                          <cylinderGeometry args={[0.05, 0.09, l1, 4, 1, false]} />
                        </mesh>
                        <group position-y={l1} rotation-x={bend}>
                          <mesh position-y={l2 / 2} material={M.planting}>
                            <cylinderGeometry args={[0.012, 0.07, l2, 4, 1, false]} />
                          </mesh>
                        </group>
                      </group>
                    </group>
                  )
                })}
                <mesh material={M.trunk}>
                  <sphereGeometry args={[0.13, 6, 5]} />
                </mesh>
              </group>
            ) : (
              // Canopy: three overlapping clumps in two tones, so the
              // crown reads as foliage mass rather than one faceted
              // ball with a single flat highlight.
              <group position-y={s.h + 0.35}>
                <mesh position={[-0.35, -0.1, 0.15]} scale={0.95} material={M.planting}>
                  <icosahedronGeometry args={[0.85, 0]} />
                </mesh>
                <mesh position={[0.4, 0.05, -0.2]} scale={1.05} material={M.planting}>
                  <icosahedronGeometry args={[0.85, 0]} />
                </mesh>
                <mesh position={[0, 0.3, 0.1]} scale={0.85} material={M.foliageLit}>
                  <icosahedronGeometry args={[0.85, 0]} />
                </mesh>
              </group>
            )}
          </group>
        </Assembly>
      ))}

      {/* Hedge along the pool terrace, built from individual clipped
          shrubs rather than one box, so the top line has a natural,
          slightly uneven silhouette. */}
      <PoolHedge />
    </group>
  )
}

/** The pool-terrace hedge: a row of clipped shrub forms. */
function PoolHedge() {
  const balls = useMemo(() => {
    const n = 9
    const z0 = HOUSE_CZ - 3.2
    return Array.from({ length: n }, (_, i) => ({
      z: z0 + (i * 6.4) / (n - 1),
      h: 0.78 + ((i * 5) % 3) * 0.06,
    }))
  }, [])

  return (
    <Assembly window={PHASE.landscape} offset={0.55} length={0.35} mode="rise">
      <group position={[POOL.x1 + 1.1, 0, HOUSE_CZ]}>
        {balls.map((b, i) => (
          <mesh
            key={i}
            position={[0, b.h / 2, b.z - HOUSE_CZ]}
            scale={[0.62, b.h, 0.62]}
            material={M.shrub}
          >
            <icosahedronGeometry args={[0.85, 1]} />
          </mesh>
        ))}
      </group>
    </Assembly>
  )
}

type ShrubSpec = { x: number; z: number; r: number; h: number; order: number }

/**
 * Foundation and boundary shrubs: instanced clipped-ball planting run
 * along the house's blind wall, the inside of the north boundary and
 * both sides of the drive — the planting that actually anchors a
 * finished building to its garden.
 */
function Shrubbery({ count }: { count: number }) {
  const specs = useMemo(() => {
    const out: ShrubSpec[] = []
    const push = (x: number, z: number, i: number, n: number) => {
      const r = 0.32 + ((i * 7) % 3) * 0.05
      out.push({ x, z, r, h: r * 1.7, order: i / n })
    }

    // Split the budget across three runs, weighted to their length.
    const nWall = Math.round(count * 0.4)
    const nHouse = Math.round(count * 0.35)
    const nDrive = Math.max(0, count - nWall - nHouse)

    const wallZ = -HALF_D + 1.35
    const gateX = HOUSE.x0 + 2
    const spanA = [-HALF_W + 1.6, gateX - 3] as const
    const spanB = [gateX + 3, HALF_W - 1.6] as const
    const wallSpan = spanA[1] - spanA[0] + (spanB[1] - spanB[0])
    for (let i = 0; i < nWall; i++) {
      const along = (i / Math.max(1, nWall - 1)) * wallSpan
      const inA = along <= spanA[1] - spanA[0]
      const x = inA ? spanA[0] + along : spanB[0] + (along - (spanA[1] - spanA[0]))
      push(x, wallZ, i, nWall)
    }

    for (let i = 0; i < nHouse; i++) {
      const z = HOUSE.z0 + 0.6 + (i / Math.max(1, nHouse - 1)) * (HOUSE.z1 - HOUSE.z0 - 1.2)
      push(HOUSE.x0 - 0.75, z, i, nHouse)
    }

    for (let i = 0; i < nDrive; i++) {
      const side = i % 2 === 0 ? -1 : 1
      const z = -HALF_D + 1.4 + Math.floor(i / 2) * 1.6
      if (z > HOUSE.z0 - 1) continue
      push(HOUSE.x0 - 0.2 + side * (side < 0 ? 0.9 : 4.9), z, i, nDrive)
    }

    return out
  }, [count])

  const mesh = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const settled = useRef(false)

  useFrame(() => {
    const inst = mesh.current
    if (!inst) return
    const t = ease(span(readProgress(), PHASE.landscape, 0.35, 0.55))
    if (t >= 1 && settled.current) return
    settled.current = t >= 1

    const visible = t > 0.002
    if (inst.visible !== visible) inst.visible = visible
    if (!visible) return

    for (let i = 0; i < specs.length; i++) {
      const s = specs[i]
      const e = ease(clamp01((t - s.order * 0.6) / 0.4))
      dummy.position.set(s.x, (s.h / 2) * e, s.z)
      dummy.scale.set(s.r, Math.max(0.0001, s.h * e), s.r)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    }
    inst.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, specs.length]}
      material={M.shrub}
      frustumCulled={false}
      visible={false}
    >
      <icosahedronGeometry args={[0.85, 1]} />
    </instancedMesh>
  )
}

/**
 * Flower beds: a scatter of tiny accent blooms along the shrub runs
 * and the garden path. Colour comes from a per-instance tint on one
 * shared material rather than a second draw call, so a hundred-odd
 * flowers cost one instanced mesh.
 */
function FlowerBeds({ count }: { count: number }) {
  const flowerMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.55,
        metalness: 0.04,
        // A faint self-light, so the beds still read as warm blooms
        // in the shade and at dusk rather than dropping to near-black
        // like the foliage around them.
        emissive: new THREE.Color('#4A3A14'),
        emissiveIntensity: 0.5,
      }),
    [],
  )

  const bloom = useMemo(() => new THREE.Color('#E8C766'), [])
  const bone = useMemo(() => new THREE.Color('#DCD6C6'), [])

  const specs = useMemo(() => {
    /** A band runs either along X at a fixed Z (a wall or path edge)
     *  or along Z at a fixed X (a house wall) — never both. */
    type Band =
      | { along: 'x'; x0: number; x1: number; z: number; spread: number }
      | { along: 'z'; x: number; z0: number; z1: number; spread: number }

    const bands: Band[] = [
      // Along the north wall shrub run.
      { along: 'x', x0: -HALF_W + 1.2, x1: HALF_W - 1.2, z: -HALF_D + 1.9, spread: 0.5 },
      // Along the house's west foundation planting.
      { along: 'z', x: HOUSE.x0 - 1.15, z0: HOUSE.z0, z1: HOUSE.z1, spread: 0.35 },
      // Flanking the stepping-stone path.
      { along: 'x', x0: HOUSE.x0 + 4.6, x1: HOUSE.x0 + 8.8, z: HOUSE.z0 - 1.9, spread: 1.6 },
    ]

    const out: { x: number; z: number; s: number; color: THREE.Color; order: number }[] = []
    for (let i = 0; i < count; i++) {
      const band = bands[i % bands.length]
      const t = (i / count) * 3.7
      const jitter = (Math.sin(i * 12.9) * 0.5 + 0.5) * band.spread - band.spread / 2

      const [x, z] =
        band.along === 'x'
          ? [band.x0 + (band.x1 - band.x0) * (t % 1), band.z + jitter]
          : [band.x + jitter, band.z0 + (band.z1 - band.z0) * (t % 1)]

      out.push({
        x,
        z,
        s: 0.08 + ((i * 5) % 3) * 0.028,
        color: i % 4 === 0 ? bone : bloom,
        order: i / count,
      })
    }
    return out
  }, [count, bloom, bone])

  const mesh = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const settled = useRef(false)
  const colored = useRef(false)

  useFrame(() => {
    const inst = mesh.current
    if (!inst) return

    if (!colored.current) {
      for (let i = 0; i < specs.length; i++) inst.setColorAt(i, specs[i].color)
      if (inst.instanceColor) inst.instanceColor.needsUpdate = true
      colored.current = true
    }

    const t = ease(span(readProgress(), PHASE.landscape, 0.5, 0.45))
    if (t >= 1 && settled.current) return
    settled.current = t >= 1

    const visible = t > 0.002
    if (inst.visible !== visible) inst.visible = visible
    if (!visible) return

    for (let i = 0; i < specs.length; i++) {
      const s = specs[i]
      const e = ease(clamp01((t - s.order * 0.7) / 0.3))
      dummy.position.set(s.x, s.s * e, s.z)
      dummy.scale.setScalar(Math.max(0.0001, s.s * e))
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    }
    inst.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, specs.length]}
      material={flowerMat}
      frustumCulled={false}
      visible={false}
    >
      <icosahedronGeometry args={[1, 0]} />
    </instancedMesh>
  )
}

/** Potted topiary flanking the front door — the last domestic touch
 *  before handover. */
function EntrancePlanters() {
  const doorX = HOUSE.x0 + (HOUSE.x1 - HOUSE.x0) * 0.19
  const wallZ = HOUSE.z0

  return (
    <Assembly window={PHASE.landscape} offset={0.66} length={0.3} mode="rise">
      <group>
        {[-1, 1].map((s) => (
          <group key={s} position={[doorX + s * 1.35, 0, wallZ - 0.55]}>
            <mesh position-y={0.24} material={M.terracotta}>
              <cylinderGeometry args={[0.24, 0.18, 0.48, 10]} />
            </mesh>
            <mesh position-y={0.55} material={M.coping}>
              <cylinderGeometry args={[0.26, 0.26, 0.05, 10]} />
            </mesh>
            <mesh position-y={0.95} scale={[0.5, 0.62, 0.5]} material={M.foliageLit}>
              <icosahedronGeometry args={[0.85, 1]} />
            </mesh>
          </group>
        ))}
      </group>
    </Assembly>
  )
}

/** External lighting. Comes on at handover, with the windows. Each
 *  post carries a small lantern head above the bulb, so the fixture
 *  reads as a real light rather than a bare pole. */
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
            <group key={i} position={[x, 0, z]}>
              <mesh position-y={0.04} material={M.coping}>
                <cylinderGeometry args={[0.14, 0.16, 0.08, 8]} />
              </mesh>
              <mesh position-y={0.58} material={M.darkSteel}>
                <cylinderGeometry args={[0.05, 0.07, 1.1, 6]} />
              </mesh>
              <mesh position-y={1.22} material={M.darkSteel}>
                <boxGeometry args={[0.16, 0.14, 0.16]} />
              </mesh>
              <mesh position-y={1.42} material={M.darkSteel}>
                <coneGeometry args={[0.14, 0.14, 4]} />
              </mesh>
            </group>
          ))}
        </group>
      </Assembly>

      <group ref={bulbs} visible={false}>
        {posts.map(([x, z], i) => (
          <mesh key={i} position={[x, 1.22, z]} material={bulbMat}>
            <sphereGeometry args={[0.1, 8, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
