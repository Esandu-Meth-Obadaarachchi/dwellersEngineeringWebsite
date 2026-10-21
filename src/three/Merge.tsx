import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

type Batch = { geometry: THREE.BufferGeometry; material: THREE.Material }

/**
 * Collapses a static subtree into one mesh per material.
 *
 * The scene is modelled the readable way, one mesh per real element,
 * which would cost a draw call for every window bar, rafter and leaf
 * cluster: well over a thousand per frame at handover. On first mount
 * this walks its children, bakes each mesh's transform into a copy of
 * its geometry, and merges the copies by material. The children are
 * then swapped for those few merged meshes.
 *
 * Only for parts that never move relative to each other. Anything
 * animated inside must sit outside the `Merge`; the `Assembly` around
 * it can still move and scale the merged result as a whole.
 */
export function Merge({ children }: { children: ReactNode }) {
  const root = useRef<THREE.Group>(null!)
  const [batches, setBatches] = useState<Batch[] | null>(null)

  useLayoutEffect(() => {
    const group = root.current
    if (!group) return
    group.updateMatrixWorld(true)
    const toLocal = group.matrixWorld.clone().invert()
    const m = new THREE.Matrix4()

    const byMaterial = new Map<THREE.Material, THREE.BufferGeometry[]>()
    group.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh || (mesh as THREE.InstancedMesh).isInstancedMesh) return
      const material = mesh.material as THREE.Material
      const g = normalise(mesh.geometry)
      g.applyMatrix4(m.multiplyMatrices(toLocal, mesh.matrixWorld))
      const list = byMaterial.get(material) ?? []
      list.push(g)
      byMaterial.set(material, list)
    })

    const out: Batch[] = []
    for (const [material, geos] of byMaterial) {
      const merged = mergeGeometries(geos, false)
      geos.forEach((g) => g.dispose())
      if (merged) out.push({ geometry: merged, material })
    }
    setBatches(out)
  }, [])

  if (batches) {
    return (
      <group>
        {batches.map((b, i) => (
          <mesh
            key={i}
            geometry={b.geometry}
            material={b.material}
            castShadow={!b.material.transparent}
            receiveShadow
          />
        ))}
      </group>
    )
  }

  return <group ref={root}>{children}</group>
}

/** A non-indexed copy carrying exactly position, normal and uv, so any
 *  two geometries in the scene can be merged. */
function normalise(src: THREE.BufferGeometry) {
  const g = (src.index ? src.toNonIndexed() : src.clone()) as THREE.BufferGeometry
  for (const name of Object.keys(g.attributes)) {
    if (name !== 'position' && name !== 'normal' && name !== 'uv') g.deleteAttribute(name)
  }
  if (!g.attributes.normal) g.computeVertexNormals()
  if (!g.attributes.uv) {
    g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2))
  }
  g.morphAttributes = {}
  return g
}
