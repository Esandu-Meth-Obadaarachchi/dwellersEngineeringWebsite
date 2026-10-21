import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { M } from '../materials'
import { readProgress } from '../Assembly'
import { ease, span, clamp01 } from '../progress'
import { PHASE } from '../schedule'
import { WALLS, WALL_T, wallLength, type Wall } from '../villa'

type Block = { x: number; y: number; z: number; ry: number; len: number; order: number }

/**
 * Blockwork, laid course by course.
 *
 * One `InstancedMesh` carries every block in the building. Block size is
 * derived from the device's instance budget rather than fixed, so a
 * phone lays fewer, larger blocks and still gets real coursing, bond
 * stagger and openings. Once the render coat has gone over it the
 * blockwork is retired entirely: a finished house shows no blocks.
 */
export function Walls({ budget }: { budget: number }) {
  const { blocks, courseH } = useMemo(() => buildBlocks(budget), [budget])

  const mesh = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const settled = useRef(false)

  useFrame(() => {
    const inst = mesh.current
    if (!inst) return

    const p = readProgress()
    const t = ease(span(p, PHASE.walls))

    // Laid nothing yet, or already rendered over: draw nothing.
    const visible = t > 0 && p < PHASE.finishes[1]
    if (inst.visible !== visible) inst.visible = visible
    if (!visible) return

    // Once every block is laid, stop rewriting matrices each frame.
    if (t >= 1 && settled.current) return
    settled.current = t >= 1

    const stagger = 0.72
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i]
      const e = ease(clamp01((t - b.order * stagger) / (1 - stagger)))
      dummy.position.set(b.x, b.y - (1 - e) * 0.4, b.z)
      dummy.rotation.set(0, b.ry, 0)
      dummy.scale.set(Math.max(0.0001, e) * b.len, Math.max(0.0001, e) * courseH * 0.94, WALL_T)
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
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  )
}

function buildBlocks(budget: number) {
  // Solve for a course height that lands on the instance budget, keeping
  // the 2:1 block proportion. Area is taken gross; openings only lower
  // the final count.
  const area = WALLS.reduce((a, w) => a + wallLength(w) * w.h, 0)
  const courseH = Math.min(0.8, Math.max(0.2, Math.sqrt(area / (2 * Math.max(60, budget)))))
  const blockLen = courseH * 2

  const levels = Math.max(...WALLS.map((w) => w.level)) + 1
  const blocks: Block[] = []

  for (const w of WALLS) {
    const courses = Math.max(3, Math.floor(w.h / courseH))
    const ch = w.h / courses
    const len = wallLength(w)

    for (let c = 0; c < courses; c++) {
      const up = (c + 0.5) * ch
      const bond = c % 2 === 0 ? 0 : blockLen / 2
      const n = Math.ceil((len - bond) / blockLen) + 1

      for (let j = 0; j < n; j++) {
        const a = Math.max(0, bond + (j - (bond > 0 ? 1 : 0)) * blockLen)
        const b = Math.min(len, a + blockLen)
        if (b - a < 0.05) continue
        const mid = (a + b) / 2

        if (inOpening(w, mid, up)) continue

        const [x, z] = w.axis === 'x' ? [w.from + mid, w.at] : [w.at, w.from + mid]
        blocks.push({
          x,
          y: w.y + up,
          z,
          ry: w.axis === 'x' ? 0 : Math.PI / 2,
          len: (b - a) * 0.97,
          // Laying order: level by level, up each wall, along each course.
          order: (w.level + (c + mid / len) / courses) / levels,
        })
      }
    }
  }

  return { blocks, courseH }
}

function inOpening(w: Wall, along: number, up: number) {
  return w.openings.some((o) => along > o.a && along < o.b && up > o.sill && up < o.head)
}
