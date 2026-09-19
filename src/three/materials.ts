import * as THREE from 'three'

/**
 * One shared set of materials for the whole scene.
 *
 * There is no environment map and there are no shadow maps — both cost
 * more than this scene can afford on a five-year-old laptop. Metalness
 * is therefore kept low everywhere (a metal with nothing to reflect
 * renders black) and form is carried by roughness and three lights.
 */

const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p)

export const M = {
  /** Cast in-situ concrete: footings, columns, beams, slabs. */
  concrete: std({ color: '#9A978D', roughness: 0.95, metalness: 0.02 }),

  /** Blinding / screed — slightly darker so slabs read against footings. */
  screed: std({ color: '#6E6B64', roughness: 1, metalness: 0 }),

  /** Cement blockwork. */
  block: std({ color: '#837A6E', roughness: 0.9, metalness: 0.02 }),

  /** Finished render, once the walls are painted at handover. */
  render: std({ color: '#CFCABC', roughness: 0.8, metalness: 0.02 }),

  /** Reinforcement and structural steel — carries the crest bronze. */
  steel: std({ color: '#B29629', roughness: 0.42, metalness: 0.55 }),

  /** Dark steel: shed portal frame, railings, gates. */
  darkSteel: std({ color: '#3A3733', roughness: 0.5, metalness: 0.45 }),

  /** Roof tiles. */
  tile: std({ color: '#2B2724', roughness: 0.78, metalness: 0.05 }),

  /** Corrugated sheeting on the shed. */
  sheeting: std({ color: '#55524C', roughness: 0.45, metalness: 0.35 }),

  /** Glazing. Emissive is driven up at handover when the lights come on. */
  glass: std({
    color: '#0D161B',
    roughness: 0.08,
    metalness: 0.2,
    transparent: true,
    opacity: 0.42,
    emissive: new THREE.Color('#FFDE59'),
    emissiveIntensity: 0,
  }),

  /** Pool water. Opacity and level are both animated as it fills. */
  water: std({
    color: '#0E2E38',
    roughness: 0.05,
    metalness: 0.35,
    transparent: true,
    opacity: 0.88,
  }),

  /** Pool tiling and coping. */
  poolTile: std({ color: '#1C5566', roughness: 0.25, metalness: 0.1 }),
  coping: std({ color: '#B9B3A4', roughness: 0.85, metalness: 0.02 }),

  /** Timber: doors, pergola, hoarding. */
  timber: std({ color: '#53412C', roughness: 0.85, metalness: 0 }),

  /** Ground and planting, kept far down the value scale so the
   *  palette stays black and gold rather than turning into a park. */
  ground: std({ color: '#16150F', roughness: 1, metalness: 0 }),
  paving: std({ color: '#3E3C36', roughness: 0.9, metalness: 0.02 }),
  planting: std({ color: '#1F2A1B', roughness: 1, metalness: 0 }),
  trunk: std({ color: '#33291D', roughness: 1, metalness: 0 }),
} as const

/** The two ends of the blockwork's finish: raw block, and the render
 *  and paint it wears at handover. Interpolated in `Landscape`. */
export const BLOCK_RAW = new THREE.Color('#837A6E')
export const RENDER_FINISH = new THREE.Color('#CFCABC')

/** Setting-out lines, grid, string lines and the ghost of the
 *  finished massing: pure signal gold, unlit. */
export const LINE = {
  gold: new THREE.LineBasicMaterial({ color: '#FFDE59', transparent: true, opacity: 0.9 }),
  ghost: new THREE.LineBasicMaterial({ color: '#FFDE59', transparent: true, opacity: 0.22 }),
  grid: new THREE.LineBasicMaterial({ color: '#B29629', transparent: true, opacity: 0.16 }),
} as const

/** Marker material for survey pegs. */
export const goldSolid = new THREE.MeshBasicMaterial({ color: '#FFDE59' })

/** A single blurred radial gradient stands in for contact shadow.
 *  Generated once on a 128px canvas — no shadow map, no render pass. */
export function makeContactShadow(): THREE.Texture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(0,0,0,0.75)')
  g.addColorStop(0.55, 'rgba(0,0,0,0.35)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
