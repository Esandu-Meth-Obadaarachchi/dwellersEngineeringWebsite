import * as THREE from 'three'
import { rand } from './geometry'

/**
 * Procedural surface textures.
 *
 * Every texture is painted onto a canvas when the scene loads, so the
 * build still downloads no image files. Each one is drawn as a single
 * seamless tile and repeated by the material at its real-world size
 * (see `geometry.ts`, where UVs are in metres).
 *
 * The neutral "detail" textures (plaster, concrete) are painted close
 * to white and take their hue from the material colour, which lets the
 * columns and slabs fade from raw concrete to painted render without
 * swapping textures.
 */

const SIZE = 512

type Paint = (ctx: CanvasRenderingContext2D, r: () => number, s: number) => void

function make(paint: Paint, seed: number, size = SIZE): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  paint(ctx, rand(seed), size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 4
  return tex
}

/**
 * Soft value noise, layered in octaves.
 *
 * A tiny canvas of random greys is drawn up to full size with smoothing
 * on, which blurs it into low-frequency mottling for almost nothing.
 * Drawing the cells three times, offset by the tile size, keeps the
 * result seamless at the wrap.
 */
function mottle(
  ctx: CanvasRenderingContext2D,
  r: () => number,
  s: number,
  cells: number,
  alpha: number,
  dark = 0,
  light = 255,
) {
  const small = document.createElement('canvas')
  small.width = small.height = cells
  const sctx = small.getContext('2d')!
  const img = sctx.createImageData(cells, cells)
  for (let i = 0; i < cells * cells; i++) {
    const v = dark + r() * (light - dark)
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v
    img.data[i * 4 + 3] = 255
  }
  sctx.putImageData(img, 0, 0)

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.imageSmoothingEnabled = true
  // A 3×3 tiling of the cell grid, cropped to the middle tile, wraps
  // cleanly at every edge.
  for (let ox = -1; ox <= 1; ox++) {
    for (let oy = -1; oy <= 1; oy++) {
      ctx.drawImage(small, ox * s, oy * s, s, s)
    }
  }
  ctx.restore()
}

/** Fine speckle: grain, sand, aggregate. */
function speckle(
  ctx: CanvasRenderingContext2D,
  r: () => number,
  s: number,
  count: number,
  colors: string[],
  size: [number, number],
) {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = colors[Math.floor(r() * colors.length)]
    const d = size[0] + r() * (size[1] - size[0])
    ctx.fillRect(r() * s, r() * s, d, d)
  }
}

const painters = {
  /** Painted render: near-white, with the faint cloud of a trowelled
   *  finish. Tile ≈ 3 m. */
  plaster: (ctx, r, s) => {
    ctx.fillStyle = '#EDEBE6'
    ctx.fillRect(0, 0, s, s)
    mottle(ctx, r, s, 6, 0.08, 200, 255)
    mottle(ctx, r, s, 24, 0.06, 210, 255)
    speckle(ctx, r, s, 2600, ['rgba(0,0,0,0.035)', 'rgba(255,255,255,0.06)'], [1, 2])
  },

  /** Cast concrete: mottled, with the board lines of the formwork and
   *  the odd blowhole. Tile ≈ 2.4 m. */
  concrete: (ctx, r, s) => {
    ctx.fillStyle = '#D6D4CE'
    ctx.fillRect(0, 0, s, s)
    mottle(ctx, r, s, 5, 0.22, 140, 255)
    mottle(ctx, r, s, 20, 0.14, 150, 255)
    ctx.fillStyle = 'rgba(40,36,30,0.10)'
    for (let y = 0; y < s; y += s / 4) ctx.fillRect(0, y, s, 2)
    speckle(ctx, r, s, 520, ['rgba(30,28,24,0.32)', 'rgba(30,28,24,0.18)'], [1.5, 3.5])
  },

  /** Ledgestone cladding: long, thin stones in random courses with
   *  deep joints. The colour lives in the texture. Tile ≈ 1.6 m. */
  stone: (ctx, r, s) => {
    ctx.fillStyle = '#26221E'
    ctx.fillRect(0, 0, s, s)
    const tones = ['#7B7266', '#8E8475', '#665F56', '#A29683', '#57524B', '#857967', '#6F655A']
    let y = 0
    while (y < s) {
      const h = Math.min(s - y, 18 + Math.floor(r() * 30))
      let x = -Math.floor(r() * 80)
      while (x < s) {
        const w = 50 + Math.floor(r() * 120)
        const tone = tones[Math.floor(r() * tones.length)]
        const g = ctx.createLinearGradient(0, y, 0, y + h)
        g.addColorStop(0, tone)
        g.addColorStop(1, shade(tone, -0.22))
        ctx.fillStyle = g
        // Draw twice across the seam so the tile wraps horizontally.
        for (const ox of [0, s]) ctx.fillRect(x + 2 - ox, y + 2, w - 3, h - 3)
        x += w
      }
      y += h
    }
    mottle(ctx, r, s, 32, 0.14, 0, 255)
    speckle(ctx, r, s, 1800, ['rgba(0,0,0,0.25)', 'rgba(255,255,255,0.12)'], [1, 2.5])
  },

  /** Timber boards, running along U, with grain and staggered butt
   *  joints. Tile ≈ 1.2 m, eight boards. */
  timber: (ctx, r, s) => {
    const boards = 8
    const bh = s / boards
    for (let b = 0; b < boards; b++) {
      const base = ['#8A5A36', '#7A4E2E', '#94633D', '#6E4529', '#835532'][Math.floor(r() * 5)]
      ctx.fillStyle = base
      ctx.fillRect(0, b * bh, s, bh)
      // Grain: long, slightly wavy dark streaks.
      for (let g = 0; g < 26; g++) {
        const gy = b * bh + r() * bh
        ctx.strokeStyle = `rgba(40,22,10,${0.08 + r() * 0.14})`
        ctx.lineWidth = 0.6 + r() * 1.4
        ctx.beginPath()
        ctx.moveTo(0, gy)
        for (let x = 0; x <= s; x += 32) ctx.lineTo(x, gy + Math.sin(x * 0.02 + g) * 1.6)
        ctx.stroke()
      }
      // Gap between boards.
      ctx.fillStyle = 'rgba(20,10,4,0.75)'
      ctx.fillRect(0, b * bh, s, 2)
      // One butt joint per board, staggered.
      ctx.fillRect(Math.floor(r() * s), b * bh, 2, bh)
    }
    mottle(ctx, r, s, 8, 0.1, 0, 255)
  },

  /** Large-format porcelain paving, 600 mm square. Tile = 1.2 m. */
  paving: (ctx, r, s) => {
    ctx.fillStyle = '#4A4844'
    ctx.fillRect(0, 0, s, s)
    const n = 2
    const t = s / n
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const v = 168 + Math.floor(r() * 18)
        ctx.fillStyle = `rgb(${v},${v - 3},${v - 9})`
        ctx.fillRect(i * t + 2, j * t + 2, t - 4, t - 4)
      }
    }
    mottle(ctx, r, s, 16, 0.12, 80, 255)
    speckle(ctx, r, s, 1400, ['rgba(0,0,0,0.12)', 'rgba(255,255,255,0.1)'], [1, 2])
  },

  /** Mown lawn, seen from a height. Tile ≈ 4 m. */
  grass: (ctx, r, s) => {
    ctx.fillStyle = '#3F5A27'
    ctx.fillRect(0, 0, s, s)
    mottle(ctx, r, s, 6, 0.35, 40, 200)
    mottle(ctx, r, s, 28, 0.18, 60, 220)
    speckle(ctx, r, s, 9000, ['#4E6E30', '#35491F', '#5C7C38', '#2C3D1A'], [1, 2.5])
  },

  /** Bare earth for the site before landscaping. Tile ≈ 16 m, large
   *  enough that the repeat never reads as a chequerboard. */
  soil: (ctx, r, s) => {
    ctx.fillStyle = '#4A3C2E'
    ctx.fillRect(0, 0, s, s)
    mottle(ctx, r, s, 7, 0.16, 60, 160)
    mottle(ctx, r, s, 30, 0.12, 60, 180)
    speckle(ctx, r, s, 9000, ['#544636', '#3A2E22', '#5E4F3D', '#2E241A'], [1, 2])
  },

  /** Glass mosaic for the pool lining, 25 mm chips. Tile = 0.5 m. */
  mosaic: (ctx, r, s) => {
    ctx.fillStyle = '#DCE6E4'
    ctx.fillRect(0, 0, s, s)
    const n = 20
    const t = s / n
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const k = r()
        ctx.fillStyle = k < 0.5 ? '#2C9AA8' : k < 0.8 ? '#3BAFBB' : k < 0.95 ? '#1F8090' : '#5CC4CC'
        ctx.fillRect(i * t + 1.5, j * t + 1.5, t - 3, t - 3)
      }
    }
  },

  /** Roof gravel. Tile ≈ 1 m. */
  gravel: (ctx, r, s) => {
    ctx.fillStyle = '#8B877F'
    ctx.fillRect(0, 0, s, s)
    speckle(ctx, r, s, 16000, ['#A5A096', '#6F6B64', '#7E796F', '#B8B2A6', '#5A5650'], [2, 5])
  },
} satisfies Record<string, Paint>

export type TextureName = keyof typeof painters

const cache = new Map<TextureName, THREE.CanvasTexture>()

/** A texture repeating every `tile` metres. Textures are painted once;
 *  each call with a new tile size shares the same canvas. */
export function texture(name: TextureName, tile: number): THREE.Texture {
  let base = cache.get(name)
  if (!base) {
    base = make(painters[name], [...name].reduce((h, c) => h * 31 + c.charCodeAt(0), 7))
    cache.set(name, base)
  }
  const t = base.clone()
  t.repeat.set(1 / tile, 1 / tile)
  t.needsUpdate = true
  return t
}

function shade(hex: string, k: number) {
  const c = new THREE.Color(hex)
  c.offsetHSL(0, 0, k * 0.5)
  return `#${c.getHexString()}`
}
