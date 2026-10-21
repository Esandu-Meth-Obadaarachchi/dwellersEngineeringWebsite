import * as THREE from 'three'
import { texture } from './textures'

/**
 * One shared set of materials for the whole scene.
 *
 * Realism here comes from three things working together: textures at
 * true scale (see `textures.ts`), an image-based environment that gives
 * every surface something to reflect (see `Lighting.tsx`), and a sun
 * that casts shadows. Materials are tuned for that set-up, so glass
 * and water carry low roughness and real metalness where they need it.
 */

const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p)

/** Raw concrete, and the painted render the frame wears at handover.
 *  `frame` fades between them during the finishing phase. */
export const CONCRETE = new THREE.Color('#A19E97')
export const RENDER = new THREE.Color('#F1EEE7')

export const M = {
  /** Cast in-situ concrete that stays raw: footings, ground beams. */
  concrete: std({ map: texture('concrete', 2.4), color: CONCRETE, roughness: 0.92, metalness: 0 }),

  /** Columns and slabs: concrete while the frame goes up, white render
   *  once it is finished. The colour is animated in `Finishes`. */
  frame: std({ map: texture('concrete', 2.4), color: CONCRETE.clone(), roughness: 0.9, metalness: 0 }),

  /** Blinding and screed. */
  screed: std({ map: texture('concrete', 3), color: '#7E7B74', roughness: 1, metalness: 0 }),

  /** Cement blockwork, before it is rendered over. */
  block: std({ map: texture('concrete', 1.2), color: '#8C877D', roughness: 0.95, metalness: 0 }),

  /** Painted render: the white of the finished house. */
  render: std({ map: texture('plaster', 3), color: RENDER, roughness: 0.86, metalness: 0 }),

  /** Ledgestone cladding on the blade wall. */
  stone: std({ map: texture('stone', 1.6), roughness: 0.94, metalness: 0 }),

  /** Teak: louvres, pergola, doors, soffit strips. */
  timber: std({ map: texture('timber', 1.2), color: '#C9A27A', roughness: 0.62, metalness: 0 }),

  /** Hardwood decking around the pool and on the roof terrace. */
  deck: std({ map: texture('timber', 1.6), color: '#B08865', roughness: 0.72, metalness: 0 }),

  /** Powder-coated aluminium window frames: dark bronze-grey. */
  alu: std({ color: '#2E2C29', roughness: 0.38, metalness: 0.7 }),

  /** Reinforcement — carries the crest bronze. */
  steel: std({ color: '#B29629', roughness: 0.42, metalness: 0.6 }),

  /** Painted structural steel: carport posts, pergola brackets. */
  darkSteel: std({ color: '#1F1E1C', roughness: 0.45, metalness: 0.6 }),

  /** Clear double glazing. Reflects the environment; the interior shows
   *  through. Emissive is raised at dusk when the lights come on. */
  glass: std({
    color: '#B9CCD1',
    roughness: 0.04,
    metalness: 0.9,
    transparent: true,
    opacity: 0.38,
    envMapIntensity: 1.6,
    emissive: new THREE.Color('#FFC873'),
    emissiveIntensity: 0,
    depthWrite: false,
  }),

  /** Frameless glass balustrades: lighter and greener at the edge. */
  railGlass: std({
    color: '#CFE3DD',
    roughness: 0.05,
    metalness: 0.6,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  }),

  /** Pool water: animated level and ripple, see `Pool`. */
  water: std({
    color: '#5EC6D0',
    roughness: 0.04,
    metalness: 0.25,
    transparent: true,
    opacity: 0.72,
    envMapIntensity: 1.4,
    depthWrite: false,
  }),

  /** Glass mosaic pool lining. Lit from inside at dusk. */
  poolTile: std({
    map: texture('mosaic', 0.5),
    roughness: 0.3,
    metalness: 0,
    emissive: new THREE.Color('#2BB3C0'),
    emissiveIntensity: 0,
  }),

  /** Pale limestone coping and sills. */
  coping: std({ map: texture('plaster', 1.5), color: '#D9D2C2', roughness: 0.8, metalness: 0 }),

  /** Porcelain paving: terrace and drive. */
  paving: std({ map: texture('paving', 1.2), roughness: 0.82, metalness: 0 }),

  /** Bare site, and the garden once it is planted. */
  ground: std({ map: texture('soil', 16), color: '#7A7064', roughness: 1, metalness: 0 }),
  lawn: std({ map: texture('grass', 4), roughness: 1, metalness: 0 }),

  /** Roof finishes. */
  gravel: std({ map: texture('gravel', 1), roughness: 1, metalness: 0 }),
  membrane: std({ map: texture('concrete', 4), color: '#6F6C67', roughness: 0.95, metalness: 0 }),

  /** Planting. Two foliage tones per tree so crowns read in relief. */
  foliage: std({ color: '#2F4A22', roughness: 0.9, metalness: 0 }),
  foliageLit: std({ color: '#4A6B2E', roughness: 0.88, metalness: 0 }),
  palm: std({ color: '#4D6A2A', roughness: 0.8, metalness: 0, side: THREE.DoubleSide }),
  shrub: std({ color: '#36532A', roughness: 0.9, metalness: 0 }),
  trunk: std({ color: '#5A4A3A', roughness: 1, metalness: 0 }),
  palmTrunk: std({ color: '#7D6E5C', roughness: 1, metalness: 0 }),
  bloom: std({ color: '#F2D27A', roughness: 0.6, metalness: 0 }),

  /** Car paint: deep graphite, glossy. */
  carPaint: std({ color: '#2C3036', roughness: 0.22, metalness: 0.75, envMapIntensity: 1.3 }),
  tyre: std({ color: '#121212', roughness: 0.85, metalness: 0 }),
  chrome: std({ color: '#C9CCCF', roughness: 0.15, metalness: 1 }),
  carGlass: std({ color: '#0E1418', roughness: 0.05, metalness: 0.9 }),

  /** Furniture and interior surfaces. */
  fabric: std({ color: '#D8D2C6', roughness: 0.95, metalness: 0 }),
  fabricDark: std({ color: '#3A3836', roughness: 0.95, metalness: 0 }),
  interiorFloor: std({ map: texture('paving', 1.2), color: '#E2DDD3', roughness: 0.55, metalness: 0 }),

  /** Ceiling downlights and wall washers. Off by day; on at handover. */
  lamp: std({ color: '#2A2824', emissive: new THREE.Color('#FFD9A0'), emissiveIntensity: 0 }),
} as const

/** Setting-out lines, grid, string lines and the ghost of the
 *  finished massing: pure signal gold, unlit. */
export const LINE = {
  gold: new THREE.LineBasicMaterial({ color: '#FFDE59', transparent: true, opacity: 0.9 }),
  ghost: new THREE.LineBasicMaterial({ color: '#FFDE59', transparent: true, opacity: 0.22 }),
  grid: new THREE.LineBasicMaterial({ color: '#B29629', transparent: true, opacity: 0.16 }),
} as const

/** Marker material for survey pegs. */
export const goldSolid = new THREE.MeshBasicMaterial({ color: '#FFDE59' })
