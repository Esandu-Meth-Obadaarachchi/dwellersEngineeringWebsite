import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { M } from '../materials'
import { Assembly, readProgress } from '../Assembly'
import { boxGeo, blobGeo, rand } from '../geometry'
import { ease, span, clamp01 } from '../progress'
import { PHASE } from '../schedule'
import {
  PLOT, GATE, DRIVE, TERRACE, DECK, CARPORT, LEVEL_Y, GROUND,
  rectW, rectD, rectCX, rectCZ, type Rect,
} from '../villa'

export type LandscapeBudget = { trees: number; shrubs: number; flowers: number }

/**
 * Boundary, hard landscaping, planting and garden lighting: the last
 * phase, and the one that turns a structure into a property.
 */
export function Landscape({ trees, shrubs, flowers }: LandscapeBudget) {
  return (
    <group>
      <Lawn />
      <Terrace />
      <Drive />
      <Boundary />
      <Trees count={trees} />
      <Palms count={Math.ceil(trees / 2)} />
      <Shrubs count={shrubs} />
      <Flowers count={flowers} />
      <Bollards />
    </group>
  )
}

// --- Ground ---------------------------------------------------------

/** One lawn across the whole plot, cut around the house, the deck and
 *  the drive. ShapeGeometry UVs are in metres, which suits the grass. */
function Lawn() {
  const geo = useMemo(() => {
    // Shape space is (x, -z): the mesh is laid flat by rotating -90° on X.
    const path = (r: Rect, Ctor: typeof THREE.Path | typeof THREE.Shape) =>
      new Ctor([
        new THREE.Vector2(r.x0, -r.z1), new THREE.Vector2(r.x1, -r.z1),
        new THREE.Vector2(r.x1, -r.z0), new THREE.Vector2(r.x0, -r.z0),
      ])
    const i = 0.25
    const shape = path({ x0: PLOT.x0 + i, x1: PLOT.x1 - i, z0: PLOT.z0 + i, z1: PLOT.z1 - i }, THREE.Shape) as THREE.Shape
    shape.holes.push(
      // The lawn runs right up to the walls and under the overhangs.
      path({ x0: TERRACE.x0, x1: GROUND.x1 + 0.05, z0: GROUND.z0 - 0.05, z1: DECK.z0 - 0.1 }, THREE.Path),
      path(DECK, THREE.Path),
      path({ x0: DRIVE.x0 - 0.3, x1: CARPORT.x1 - 0.2, z0: CARPORT.z0 - 0.2, z1: PLOT.z1 - 0.4 }, THREE.Path),
    )
    return new THREE.ShapeGeometry(shape)
  }, [])

  return (
    <Assembly window={PHASE.landscape} offset={0.1} length={0.4} mode="fade">
      <mesh geometry={geo} rotation-x={-Math.PI / 2} position-y={0.012} material={M.lawn} />
    </Assembly>
  )
}

/** The raised terrace under the balcony, and the porch to the front
 *  door, both at floor level with steps down to the deck. */
function Terrace() {
  const top = LEVEL_Y[0] - 0.02
  const porch: Rect = { x0: TERRACE.x0, x1: GROUND.x0, z0: -3, z1: TERRACE.z0 }
  const plinths = [TERRACE, porch]
  const steps = 5
  const rise = top / (steps + 0.2)

  return (
    <Assembly window={PHASE.landscape} length={0.35} merge>
      <group>
        {plinths.map((r, i) => (
          <group key={i}>
            <mesh position={[rectCX(r), (top - 0.04) / 2, rectCZ(r)]} geometry={boxGeo(rectW(r), top - 0.04, rectD(r))} material={M.render} />
            <mesh position={[rectCX(r), top - 0.02, rectCZ(r)]} geometry={boxGeo(rectW(r) + 0.04, 0.04, rectD(r) + 0.04)} material={M.paving} />
          </group>
        ))}
        {/* A broad flight down onto the pool deck. */}
        {Array.from({ length: steps }, (_, i) => {
          const h = top - rise * (i + 1)
          const z = TERRACE.z1 + 0.36 * (i + 0.5)
          return (
            <mesh key={i} position={[-2.5, h / 2, z]} geometry={boxGeo(7, h, 0.36)} material={M.paving} />
          )
        })}
      </group>
    </Assembly>
  )
}

function Drive() {
  const d: Rect = { x0: DRIVE.x0, x1: CARPORT.x1, z0: CARPORT.z0, z1: PLOT.z1 - 0.15 }
  return (
    <Assembly window={PHASE.landscape} offset={0.05} length={0.35} mode="fade" merge>
      <mesh position={[rectCX(d), 0.03, rectCZ(d)]} geometry={boxGeo(rectW(d), 0.06, rectD(d))} material={M.paving} />
      {/* Stepping-stones from the drive round the stone wall to the terrace. */}
      {[[-16.1, 6.4], [-15.4, 5.6], [-14.6, 5.0]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.03, z]} rotation-y={i * 0.5} geometry={boxGeo(0.7, 0.06, 0.5)} material={M.paving} />
      ))}
    </Assembly>
  )
}

// --- Boundary -------------------------------------------------------

function Boundary() {
  const T = 0.22
  const runs: { x0: number; x1: number; z0: number; z1: number; h: number }[] = [
    { x0: PLOT.x0, x1: PLOT.x1, z0: PLOT.z0, z1: PLOT.z0, h: 2.0 },
    { x0: PLOT.x0, x1: PLOT.x0, z0: PLOT.z0, z1: PLOT.z1, h: 2.0 },
    { x0: PLOT.x1, x1: PLOT.x1, z0: PLOT.z0, z1: PLOT.z1, h: 1.6 },
    // The street side is kept low, and broken for the gate.
    { x0: PLOT.x0, x1: GATE.x0, z0: PLOT.z1, z1: PLOT.z1, h: 1.2 },
    { x0: GATE.x1, x1: PLOT.x1, z0: PLOT.z1, z1: PLOT.z1, h: 1.2 },
  ]

  return (
    <group>
      <Assembly window={PHASE.landscape} length={0.35} merge>
        {runs.map((r, i) => {
          const w = Math.max(T, r.x1 - r.x0 + T)
          const d = Math.max(T, r.z1 - r.z0 + T)
          return (
            <group key={i}>
              <mesh position={[(r.x0 + r.x1) / 2, r.h / 2, (r.z0 + r.z1) / 2]} geometry={boxGeo(w, r.h, d)} material={M.render} />
              <mesh position={[(r.x0 + r.x1) / 2, r.h + 0.03, (r.z0 + r.z1) / 2]} geometry={boxGeo(w + 0.08, 0.06, d + 0.08)} material={M.darkSteel} />
            </group>
          )
        })}
        {/* Stone gate piers, matching the blade wall. */}
        {[GATE.x0, GATE.x1].map((x) => (
          <mesh key={x} position={[x, 1.1, PLOT.z1]} geometry={boxGeo(0.6, 2.2, 0.6)} material={M.stone} />
        ))}
      </Assembly>

      {/* A teak slatted sliding gate, run back inside the wall: open. */}
      <Assembly window={PHASE.landscape} offset={0.3} length={0.3} mode="fade" merge>
        <group position={[GATE.x1 + 3.6, 0, PLOT.z1 - 0.4]}>
          {Array.from({ length: 14 }, (_, i) => (
            <mesh key={i} position={[0, 0.2 + i * 0.11, 0]} geometry={boxGeo(6.6, 0.08, 0.05)} material={M.timber} />
          ))}
          <mesh position={[0, 0.85, -0.04]} geometry={boxGeo(6.7, 1.7, 0.02)} material={M.darkSteel} />
        </group>
      </Assembly>
    </group>
  )
}

// --- Planting -------------------------------------------------------

/** Five foliage shapes, shared by every tree and shrub in the garden. */
function useBlobs() {
  return useMemo(() => Array.from({ length: 5 }, (_, i) => blobGeo(101 + i * 17, 2, 0.26)), [])
}

// Kept to the back and the flanks of the plot, so the garden frames
// the house from the camera's side rather than hiding it.
const TREE_SPOTS: [number, number][] = [
  [-24.5, -10], [14.6, -10.4], [-3, -11.2], [8.5, -11], [-24.8, 4],
  [14.6, 13.6], [-18.5, -11], [-12, -11.4], [11.5, -3.5], [-24.6, 12.6],
  [3, -11.6], [15, -1],
]

/** Broad canopy trees: a trunk, two limbs, and a crown of irregular
 *  foliage masses in two tones, lit side lighter. */
function Trees({ count }: { count: number }) {
  const blobs = useBlobs()
  const trees = useMemo(() => {
    const r = rand(7)
    return TREE_SPOTS.slice(0, count).map(([x, z], i) => {
      const h = 2.8 + r() * 1.4
      const spread = 1.9 + r() * 0.8
      // Many small masses over a dome, rather than a few big balls:
      // the broken outline is what reads as leaves.
      const clumps = Array.from({ length: 16 }, (_, k) => {
        const a = k * 2.399 + r()
        const rad = k < 2 ? r() * 0.4 : spread * (0.35 + r() * 0.65)
        const lift = 1 - (rad / spread) ** 2
        return {
          x: Math.cos(a) * rad,
          y: h + 0.6 + lift * 1.3 + r() * 0.5,
          z: Math.sin(a) * rad,
          s: (0.62 + r() * 0.42) * (spread / 2.2),
          geo: Math.floor(r() * blobs.length),
          lit: r() > 0.55,
        }
      })
      return { x, z, h, i, clumps, ry: r() * Math.PI * 2 }
    })
  }, [count, blobs])

  return (
    <group>
      {trees.map((t) => (
        <group key={t.i} position={[t.x, 0, t.z]} rotation-y={t.ry}>
          <Assembly window={PHASE.landscape} offset={0.35 + (t.i / Math.max(1, trees.length)) * 0.4} length={0.3} merge>
            <mesh position-y={t.h / 2} material={M.trunk}>
              <cylinderGeometry args={[0.14, 0.24, t.h, 7]} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.45, t.h + 0.35, 0]} rotation-z={-s * 0.75} material={M.trunk}>
                <cylinderGeometry args={[0.06, 0.11, 1.3, 6]} />
              </mesh>
            ))}
            {t.clumps.map((c, k) => (
              <mesh
                key={k}
                geometry={blobs[c.geo]}
                position={[c.x, c.y, c.z]}
                scale={[c.s, c.s * 0.78, c.s]}
                material={c.lit ? M.foliageLit : M.foliage}
              />
            ))}
          </Assembly>
        </group>
      ))}
    </group>
  )
}

const PALM_SPOTS: [number, number, number][] = [
  [13.6, 3.2, 9.2], [-8.6, 13.6, 8.2], [14.6, 8.8, 7.4], [-14.2, 9, 8.8], [11.4, -7, 7.8], [-19.4, -11.4, 8.4],
]

/**
 * Coconut palms: a leaning, slightly curved trunk and a crown of
 * arching fronds, each frond a real blade with leaflets down both sides
 * rather than a spike.
 */
function Palms({ count }: { count: number }) {
  const frond = useMemo(buildFrond, [])
  const palms = useMemo(() => {
    const r = rand(23)
    return PALM_SPOTS.slice(0, count).map(([x, z, h], i) => {
      const lean = 0.6 + r() * 1.1
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(lean * 0.15, h * 0.35, 0),
        new THREE.Vector3(lean * 0.55, h * 0.7, 0),
        new THREE.Vector3(lean, h, 0),
      ])
      const trunk = new THREE.TubeGeometry(curve, 16, 0.17, 7, false)
      const fronds = Array.from({ length: 14 }, (_, k) => ({
        ry: (k / 14) * Math.PI * 2 + r() * 0.3,
        tilt: -0.1 + (k % 3) * 0.22 + r() * 0.15,
        s: 0.85 + r() * 0.3,
      }))
      return { x, z, h, lean, i, trunk, fronds, ry: r() * Math.PI * 2 }
    })
  }, [count])

  return (
    <group>
      {palms.map((p) => (
        <group key={p.i} position={[p.x, 0, p.z]} rotation-y={p.ry}>
          <Assembly window={PHASE.landscape} offset={0.4 + (p.i / Math.max(1, palms.length)) * 0.4} length={0.3} merge>
            <mesh geometry={p.trunk} material={M.palmTrunk} />
            <group position={[p.lean, p.h, 0]}>
              <mesh material={M.trunk}>
                <sphereGeometry args={[0.28, 8, 6]} />
              </mesh>
              {p.fronds.map((f, k) => (
                <group key={k} rotation-y={f.ry}>
                  <mesh geometry={frond} rotation-z={f.tilt} scale={f.s} material={M.palm} />
                </group>
              ))}
            </group>
          </Assembly>
        </group>
      ))}
    </group>
  )
}

/** One palm frond: a rachis that rises and arches over, with pairs of
 *  drooping leaflets along it. Built once and shared by every palm. */
function buildFrond() {
  const L = 3.4
  const n = 26
  const pos: number[] = []
  const at = (s: number) => new THREE.Vector3(s * L, Math.sin(s * Math.PI * 0.55) * 0.9 - s * s * 1.6, 0)

  for (let i = 1; i < n; i++) {
    const s0 = i / n
    const s1 = (i + 0.7) / n
    const a = at(s0)
    const b = at(Math.min(1, s1))
    const len = 0.85 * Math.sin(Math.PI * Math.min(1, s0 * 1.05)) + 0.12
    for (const side of [-1, 1]) {
      const tip = new THREE.Vector3(a.x + 0.25, a.y - len * 0.55, side * len)
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z, tip.x, tip.y, tip.z)
    }
  }
  // The rachis itself, as a thin ribbon.
  for (let i = 0; i < n; i++) {
    const a = at(i / n)
    const b = at((i + 1) / n)
    const w = 0.05 * (1 - i / n) + 0.01
    pos.push(a.x, a.y, -w, b.x, b.y, -w, b.x, b.y + 0.02, w)
    pos.push(a.x, a.y, -w, b.x, b.y + 0.02, w, a.x, a.y + 0.02, w)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.computeVertexNormals()
  return geo
}

type Spec = { x: number; y: number; z: number; s: number; tint: number; order: number }

/** Instanced planting, one draw call per kind, grown in order. */
function Instanced({
  specs,
  geometry,
  material,
  window: offset,
}: {
  specs: Spec[]
  geometry: THREE.BufferGeometry
  material: THREE.Material
  window: [number, number]
}) {
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const color = useMemo(() => new THREE.Color(), [])
  const settled = useRef(false)
  const tinted = useRef(false)

  useFrame(() => {
    const inst = mesh.current
    if (!inst || specs.length === 0) return

    if (!tinted.current) {
      for (let i = 0; i < specs.length; i++) inst.setColorAt(i, color.setScalar(specs[i].tint))
      if (inst.instanceColor) inst.instanceColor.needsUpdate = true
      tinted.current = true
    }

    const t = ease(span(readProgress(), PHASE.landscape, offset[0], offset[1]))
    const visible = t > 0.002
    if (inst.visible !== visible) inst.visible = visible
    if (!visible) return
    if (t >= 1 && settled.current) return
    settled.current = t >= 1

    for (let i = 0; i < specs.length; i++) {
      const s = specs[i]
      const e = Math.max(0.0001, ease(clamp01((t - s.order * 0.6) / 0.4)))
      dummy.position.set(s.x, s.y * e, s.z)
      dummy.scale.set(s.s * e, s.s * 0.8 * e, s.s * e)
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    }
    inst.instanceMatrix.needsUpdate = true
  })

  if (specs.length === 0) return null
  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, specs.length]}
      frustumCulled={false}
      visible={false}
    />
  )
}

/** Runs of planting, as line segments; plants are spaced along them to
 *  meet the device's budget. */
const BEDS: [number, number, number, number][] = [
  [DECK.x0 + 0.4, DECK.z1 + 0.6, DECK.x1 - 0.4, DECK.z1 + 0.6],
  [PLOT.x1 - 0.7, PLOT.z0 + 0.8, PLOT.x1 - 0.7, PLOT.z1 - 0.8],
  [PLOT.x0 + 0.8, PLOT.z0 + 0.7, PLOT.x1 - 0.8, PLOT.z0 + 0.7],
  [PLOT.x0 + 0.7, PLOT.z0 + 0.8, PLOT.x0 + 0.7, PLOT.z1 - 0.8],
  [TERRACE.x0 + 0.6, TERRACE.z1 + 0.5, DECK.x0 - 0.4, TERRACE.z1 + 0.5],
  [CARPORT.x1 + 0.4, 7.2, CARPORT.x1 + 0.4, PLOT.z1 - 1.0],
]

function alongBeds(count: number, seed: number, build: (x: number, z: number, r: () => number, order: number) => Spec) {
  const r = rand(seed)
  const lens = BEDS.map(([x0, z0, x1, z1]) => Math.hypot(x1 - x0, z1 - z0))
  const total = lens.reduce((a, b) => a + b, 0)
  const step = total / Math.max(1, count)
  const out: Spec[] = []
  BEDS.forEach(([x0, z0, x1, z1], b) => {
    const n = Math.max(1, Math.round(lens[b] / step))
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n
      const jx = (r() - 0.5) * 0.5
      const jz = (r() - 0.5) * 0.5
      out.push(build(x0 + (x1 - x0) * t + jx, z0 + (z1 - z0) * t + jz, r, out.length / Math.max(1, count)))
    }
  })
  return out
}

function Shrubs({ count }: { count: number }) {
  const blobs = useBlobs()
  const specs = useMemo(
    () =>
      alongBeds(count, 41, (x, z, r, order) => {
        const s = 0.55 + r() * 0.4
        return { x, y: s * 0.55, z, s, tint: 0.8 + r() * 0.45, order }
      }),
    [count],
  )
  return <Instanced specs={specs} geometry={blobs[2]} material={M.shrub} window={[0.35, 0.55]} />
}

function Flowers({ count }: { count: number }) {
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), [])
  const specs = useMemo(
    () =>
      alongBeds(count, 59, (x, z, r, order) => {
        const s = 0.09 + r() * 0.07
        // Offset off the shrub line, onto the bed's front edge.
        return { x: x + (r() - 0.5) * 0.9, y: 0.12 + r() * 0.2, z: z + (r() - 0.5) * 0.9, s, tint: 0.75 + r() * 0.4, order }
      }),
    [count],
  )
  return <Instanced specs={specs} geometry={geo} material={M.bloom} window={[0.5, 0.45]} />
}

/** Low garden bollards along the drive and the deck: dark by day, warm
 *  points of light at handover. */
function Bollards() {
  const spots = useMemo(() => {
    const out: [number, number][] = []
    for (let z = CARPORT.z1 + 1.5; z < PLOT.z1 - 1; z += 3.2) {
      out.push([DRIVE.x0 - 0.45, z], [CARPORT.x1 + 0.1, z])
    }
    out.push([DECK.x0 - 0.4, DECK.z0 + 1], [DECK.x0 - 0.4, DECK.z1 - 1], [DECK.x1 + 0.4, DECK.z0 + 1], [DECK.x1 + 0.4, DECK.z1 - 1])
    return out
  }, [])

  return (
    <Assembly window={PHASE.landscape} offset={0.7} length={0.3} merge>
      {spots.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position-y={0.35} geometry={boxGeo(0.12, 0.7, 0.12)} material={M.darkSteel} />
          <mesh position-y={0.62} geometry={boxGeo(0.13, 0.08, 0.13)} material={M.lamp} />
        </group>
      ))}
    </Assembly>
  )
}
