import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { M } from '../materials'
import { Assembly, readProgress } from '../Assembly'
import { ease, span, clamp01 } from '../progress'
import { PHASE, HOUSE, HOUSE_W, HOUSE_D, HOUSE_CX, HOUSE_CZ } from '../schedule'

const PAD_H = 0.42
const BEAM_H = 0.46
/** Top of the uppermost slab — where the roof sits. */
const PLATE_Y = PAD_H + BEAM_H + HOUSE.storeys * HOUSE.floorH + HOUSE.slabT
const OVERHANG = 0.65
const RISE = 2.0
const HALF_SPAN = HOUSE_D / 2 + OVERHANG
const SLOPE = Math.hypot(HALF_SPAN, RISE)
const PITCH = Math.atan2(RISE, HALF_SPAN)
const ROOF_LEN = HOUSE_W + OVERHANG * 2

/** One timber truss: bottom chord, two rafters, king post and struts. */
function Truss() {
  const member = 0.11
  return (
    <group>
      {/* Bottom chord */}
      <mesh position-y={member / 2} material={M.timber}>
        <boxGeometry args={[member, member, HOUSE_D + OVERHANG * 2]} />
      </mesh>
      {/* Rafters */}
      {[1, -1].map((s) => (
        <mesh
          key={s}
          position={[0, RISE / 2, (s * HALF_SPAN) / 2]}
          rotation-x={s * PITCH}
          material={M.timber}
        >
          <boxGeometry args={[member, member, SLOPE]} />
        </mesh>
      ))}
      {/* King post */}
      <mesh position-y={RISE / 2} material={M.timber}>
        <boxGeometry args={[member * 0.9, RISE, member * 0.9]} />
      </mesh>
      {/* Struts: vertical posts from the chord up to the rafter, which
          at half-span is exactly half the rise. */}
      {[1, -1].map((s) => (
        <mesh
          key={s}
          position={[0, RISE / 4, (s * HALF_SPAN) / 2]}
          material={M.timber}
        >
          <boxGeometry args={[member * 0.8, RISE / 2, member * 0.8]} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Roof structure and covering.
 *
 * Trusses are craned in at spacing, then the tiles course up each
 * slope from eaves to ridge — the order a roof is actually laid,
 * and the reason the wave reads as work rather than as a transition.
 */
export function Roof({ budget }: { budget: number }) {
  const trussCount = 7
  const trusses = useMemo(
    () =>
      Array.from({ length: trussCount }, (_, i) => {
        const x = HOUSE.x0 - OVERHANG + (i * ROOF_LEN) / (trussCount - 1)
        return { x, i }
      }),
    [],
  )

  return (
    <group>
      {/* --- Trusses ------------------------------------------ */}
      {trusses.map(({ x, i }) => (
        <Assembly
          key={i}
          window={PHASE.roof}
          offset={(i / trussCount) * 0.4}
          length={0.34}
          mode="crane"
          drop={5}
        >
          <group position={[x, PLATE_Y, HOUSE_CZ]}>
            <Truss />
          </group>
        </Assembly>
      ))}

      {/* --- Ridge board and eaves fascia ---------------------- */}
      <Assembly window={PHASE.roof} offset={0.34} length={0.2} mode="crane" drop={3}>
        <mesh position={[HOUSE_CX, PLATE_Y + RISE, HOUSE_CZ]} material={M.timber}>
          <boxGeometry args={[ROOF_LEN, 0.16, 0.14]} />
        </mesh>
        {[1, -1].map((s) => (
          <mesh
            key={s}
            position={[HOUSE_CX, PLATE_Y - 0.04, HOUSE_CZ + s * HALF_SPAN]}
            material={M.darkSteel}
          >
            <boxGeometry args={[ROOF_LEN, 0.2, 0.12]} />
          </mesh>
        ))}
      </Assembly>

      {/* --- Tiling ------------------------------------------- */}
      <Tiles budget={budget} />
    </group>
  )
}

type Tile = { x: number; y: number; z: number; rx: number; order: number }

function Tiles({ budget }: { budget: number }) {
  const { tiles, tw, th } = useMemo(() => {
    // Size the tile so both slopes land inside the instance budget.
    const area = ROOF_LEN * SLOPE * 2
    const th0 = Math.min(0.9, Math.max(0.28, Math.sqrt(area / (1.9 * Math.max(40, budget)))))
    const tw0 = th0 * 1.35

    const across = Math.max(4, Math.ceil(ROOF_LEN / tw0))
    const courses = Math.max(3, Math.ceil(SLOPE / th0))
    const twf = ROOF_LEN / across
    const thf = SLOPE / courses

    const out: Tile[] = []
    for (const s of [1, -1] as const) {
      for (let c = 0; c < courses; c++) {
        // Distance up the slope, measured from the eaves. The covering
        // is then offset along the roof normal so it beds on top of the
        // rafters instead of cutting through them.
        const d = (c + 0.5) * thf
        const OFF = 0.17
        const y = PLATE_Y + Math.sin(PITCH) * d + Math.cos(PITCH) * OFF
        const z =
          HOUSE_CZ + s * (HALF_SPAN - Math.cos(PITCH) * d + Math.sin(PITCH) * OFF)
        const bond = c % 2 === 0 ? 0 : twf / 2

        for (let j = 0; j < across; j++) {
          const x = HOUSE.x0 - OVERHANG + bond + (j + 0.5) * twf
          // Bonded courses run half a tile long; let them overhang the
          // verge rather than culling and leaving the gable ragged.
          if (x > HOUSE.x1 + OVERHANG + twf * 0.6) continue
          out.push({
            x,
            y,
            z,
            // Same sense as the rafters they bed on.
            rx: s * PITCH,
            // Eaves first, ridge last — and the two slopes together.
            order: (c + (j / across) * 0.7) / (courses + 1),
          })
        }
      }
    }
    return { tiles: out, tw: twf, th: thf }
  }, [budget])

  const mesh = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const settled = useRef(false)

  useFrame(() => {
    const inst = mesh.current
    if (!inst) return

    const t = ease(span(readProgress(), PHASE.roof, 0.3, 0.7))
    if (t >= 1 && settled.current) return
    settled.current = t >= 1

    if (t <= 0) {
      if (inst.visible) inst.visible = false
      return
    }
    if (!inst.visible) inst.visible = true

    const stagger = 0.75
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i]
      const e = ease(clamp01((t - tile.order * stagger) / (1 - stagger)))

      dummy.position.set(tile.x, tile.y + (1 - e) * 0.5, tile.z)
      dummy.rotation.set(tile.rx, 0, 0)
      dummy.scale.set(tw * 0.97, 0.06, Math.max(0.0001, e) * th * 1.06)
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    }
    inst.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, tiles.length]}
      material={M.tile}
      frustumCulled={false}
      visible={false}
    >
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  )
}
