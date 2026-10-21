import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Geometry with real-world texture coordinates.
 *
 * A stock BoxGeometry maps its texture once per face, so a 15 m wall and
 * a 0.3 m column would stretch the same plaster texture across both.
 * These helpers rescale UVs to metres instead, and every material sets
 * its texture's repeat to its real tile size, so plaster grain, stone
 * coursing and deck boards stay true to scale on any element.
 *
 * Geometries are cached by size: a scene with a few hundred boxes ends
 * up with a few dozen buffers.
 */

const boxCache = new Map<string, THREE.BoxGeometry>()

export function boxGeo(w: number, h: number, d: number): THREE.BoxGeometry {
  const key = `${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}`
  const hit = boxCache.get(key)
  if (hit) return hit

  const geo = new THREE.BoxGeometry(w, h, d)
  const uv = geo.attributes.uv as THREE.BufferAttribute
  // Face order is +x, -x, +y, -y, +z, -z; four vertices per face.
  const dims: [number, number][] = [
    [d, h], [d, h],
    [w, d], [w, d],
    [w, h], [w, h],
  ]
  for (let f = 0; f < 6; f++) {
    const [su, sv] = dims[f]
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v
      uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv)
    }
  }
  uv.needsUpdate = true
  boxCache.set(key, geo)
  return geo
}

/** A horizontal plane, UVs in metres. Lies in XZ once rotated -90° on X. */
export function planeGeo(w: number, d: number, segW = 1, segD = 1): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(w, d, segW, segD)
  const uv = geo.attributes.uv as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * d)
  uv.needsUpdate = true
  return geo
}

/** Deterministic pseudo-random, so the scene is identical on every load. */
export function rand(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * An organic blob for foliage: an icosphere with its vertices pushed in
 * and out by a seeded noise, so leaf masses read as irregular clumps
 * rather than faceted gems.
 */
export function blobGeo(seed: number, detail = 2, amount = 0.22): THREE.BufferGeometry {
  // Welded first: the stock icosphere repeats every vertex per face,
  // which would leave the displaced surface flat-shaded and cracked.
  const raw = new THREE.IcosahedronGeometry(1, detail)
  raw.deleteAttribute('normal')
  raw.deleteAttribute('uv')
  const geo = mergeVertices(raw)
  raw.dispose()
  const pos = geo.attributes.position as THREE.BufferAttribute
  const r = rand(seed)
  const lobes = Array.from({ length: 6 }, () =>
    new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize(),
  )
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    let k = 0
    for (const l of lobes) k += Math.max(0, v.dot(l)) ** 3
    const h = Math.sin(v.x * 12.9898 + v.y * 78.233 + v.z * 37.719 + seed) * 43758.5453
    const n = h - Math.floor(h)
    v.multiplyScalar(1 + (k * 0.35 - 0.15) * amount * 2 + (n - 0.5) * amount)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  return geo
}
