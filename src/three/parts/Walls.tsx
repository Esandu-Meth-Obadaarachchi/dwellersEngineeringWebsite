import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { M } from '../materials'
import { readProgress } from '../Assembly'
import { ease, span, clamp01 } from '../progress'
import { PHASE, HOUSE, HOUSE_W, HOUSE_D } from '../schedule'
import { WALL_T, BASE_Y, RUNS, openingsFor } from '../envelope'

type Block = {
  x: number
  y: number
  z: number
  ry: number
  len: number
  /** 0 → 1 position in the laying order: up the courses, along the run. */
  order: number
}

/**
 * Perimeter blockwork, laid course by course.
 *
 * One `InstancedMesh` carries every block in the building. Block size is
 * derived from the device's instance budget rather than fixed, so a
 * phone lays fewer, larger blocks and still gets real coursing, bond
 * stagger and openings instead of a flat box.
 */
export function Walls({ budget }: { budget: number }) {
  const { blocks, courseH } = useMemo(() => buildBlocks(budget), [budget])

  const mesh = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const settled = useRef(false)

  useFrame(() => {
    const inst = mesh.current
    if (!inst) return

    const t = ease(span(readProgress(), PHASE.walls))

    // Once every block is laid, stop rewriting 700 matrices a frame.
    if (t >= 1 && settled.current) return
    settled.current = t >= 1

    if (t <= 0) {
      if (inst.visible) inst.visible = false
      return
    }
    if (!inst.visible) inst.visible = true

    // Each block gets a short window of its own inside the phase, so
    // the wall rises as a wave rather than appearing all at once.
    const stagger = 0.72

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i]
      const local = clamp01((t - b.order * stagger) / (1 - stagger))
      const e = ease(local)

      dummy.position.set(b.x, b.y - (1 - e) * 0.45, b.z)
      dummy.rotation.set(0, b.ry, 0)
      dummy.scale.set(
        Math.max(0.0001, e) * b.len,
        Math.max(0.0001, e) * courseH * 0.94,
        WALL_T,
      )
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    }
    inst.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, blocks.length]}
      material={M.block}
      frustumCulled={false}
      visible={false}
    >
      {/* Unit cube — every instance is scaled to its own block size. */}
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  )
}

/** Lays out the blocks for all four walls and both storeys. */
function buildBlocks(budget: number) {
  const perimeter = 2 * (HOUSE_W + HOUSE_D)
  const totalH = HOUSE.storeys * HOUSE.floorH

  // Solve for a course height that lands on the instance budget, then
  // keep the classic 2:1 block proportion.
  const courseH = Math.min(
    0.8,
    Math.max(0.2, Math.sqrt((perimeter * totalH) / (2 * Math.max(60, budget)))),
  )
  const blockLen = courseH * 2

  const blocks: Block[] = []
  const coursesPerStorey = Math.max(3, Math.floor(HOUSE.floorH / courseH))
  const totalCourses = coursesPerStorey * HOUSE.storeys

  for (let c = 0; c < totalCourses; c++) {
    const storey = Math.floor(c / coursesPerStorey)
    const courseInStorey = c % coursesPerStorey
    const y = BASE_Y + storey * HOUSE.floorH + (courseInStorey + 0.5) * courseH

    // Running bond: every other course starts half a block along.
    const bond = c % 2 === 0 ? 0 : blockLen / 2

    for (const run of RUNS) {
      const openings = openingsFor(run.key, storey)
      const vFrac = (courseInStorey + 0.5) / coursesPerStorey

      const n = Math.ceil((run.len - bond) / blockLen)
      for (let j = 0; j < n; j++) {
        const along = bond + (j + 0.5) * blockLen
        if (along > run.len) continue
        const hFrac = along / run.len

        // Skip blocks whose whole body sits inside an opening; blocks
        // that only clip the reveal stay, as they would be cut on site.
        const inOpening = openings.some(
          (o) => hFrac > o.a && hFrac < o.b && vFrac > o.sill && vFrac < o.head,
        )
        if (inOpening) continue

        // Corners overlap; nudge the runs so they interlock cleanly.
        const len = Math.min(blockLen, run.len - (along - blockLen / 2)) * 0.96

        blocks.push({
          x: run.ox + run.dx * along,
          y,
          z: run.oz + run.dz * along,
          ry: run.ry,
          len: Math.max(0.05, len),
          // Laying order: up the building first, then along each course.
          order: (c + hFrac * 0.85) / (totalCourses + 1),
        })
      }
    }
  }

  return { blocks, courseH }
}
