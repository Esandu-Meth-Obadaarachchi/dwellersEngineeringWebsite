import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { M, LINE, goldSolid } from '../materials'
import { Assembly, readProgress } from '../Assembly'
import { boxGeo, planeGeo } from '../geometry'
import { ease, span, clamp01 } from '../progress'
import { PHASE } from '../schedule'
import {
  GROUND, FIRST, PAVILION, POOL, CARPORT, ENVELOPE, PLOT, GRID_X, GRID_Z, LEVEL_Y,
  PAVILION_ROOF_Y, rectW, rectD, rectCX, rectCZ, type Rect,
} from '../villa'

/** Outline of a box as line segments, centred on its own origin. */
const edges = (w: number, h: number, d: number) => new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d))

/**
 * The ground, the site grid, the setting-out, and the ghost of the
 * finished scheme.
 *
 * The whole villa is drawn in gold line before a single element is
 * cast — the drawing arrives first and the structure grows into it,
 * which is the one idea this animation exists to show. The ghost dims
 * as real geometry takes over.
 */
export function Site() {
  const mats = useMemo(
    () => ({ setOut: LINE.gold.clone(), ghost: LINE.ghost.clone(), grid: LINE.grid.clone() }),
    [],
  )

  // Setting-out: the footprint and every gridline, run past the building
  // to the profile boards, the way they are strung on site.
  const settingOut = useMemo(() => {
    const o = 1.6
    const pts: THREE.Vector3[] = []
    const y = 0.03
    for (const x of GRID_X) pts.push(new THREE.Vector3(x, y, GRID_Z[0] - o), new THREE.Vector3(x, y, GRID_Z[GRID_Z.length - 1] + o))
    for (const z of GRID_Z) pts.push(new THREE.Vector3(GRID_X[0] - o, y, z), new THREE.Vector3(GRID_X[GRID_X.length - 1] + o, y, z))
    // Diagonals: the check every setting-out crew actually pulls.
    pts.push(
      new THREE.Vector3(GROUND.x0, y, GROUND.z0), new THREE.Vector3(GROUND.x1, y, GROUND.z1),
      new THREE.Vector3(GROUND.x1, y, GROUND.z0), new THREE.Vector3(GROUND.x0, y, GROUND.z1),
    )
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  const pegs = useMemo(() => {
    const o = 1.6
    const out: [number, number][] = []
    for (const x of GRID_X) out.push([x, GRID_Z[0] - o], [x, GRID_Z[GRID_Z.length - 1] + o])
    for (const z of GRID_Z) out.push([GRID_X[0] - o, z], [GRID_X[GRID_X.length - 1] + o, z])
    return out
  }, [])

  // Ghost massing: every finished volume, in line only.
  const ghost = useMemo(() => {
    const vol = (r: Rect, y0: number, y1: number) => ({
      geo: edges(rectW(r), y1 - y0, rectD(r)),
      pos: [rectCX(r), (y0 + y1) / 2, rectCZ(r)] as [number, number, number],
    })
    return [
      vol(GROUND, 0, LEVEL_Y[1]),
      vol(FIRST, LEVEL_Y[1], LEVEL_Y[2]),
      vol(PAVILION, LEVEL_Y[2], PAVILION_ROOF_Y),
      vol(CARPORT, 0, CARPORT.top),
      vol(POOL, -POOL.depth, 0),
    ]
  }, [])

  const setRef = useRef<THREE.LineSegments>(null!)
  const ghostRef = useRef<THREE.Group>(null!)
  const gridRef = useRef<THREE.GridHelper>(null!)
  const patchRef = useRef<THREE.Mesh>(null!)
  const pegsRef = useRef<THREE.Group>(null!)

  useFrame(() => {
    const p = readProgress()

    // Setting-out lines: struck early, gone once the frame is up.
    mats.setOut.opacity = clamp01(ease(span(p, PHASE.site)) * (1 - ease(span(p, PHASE.frame, 0, 0.4)))) * 0.9
    if (setRef.current) setRef.current.visible = mats.setOut.opacity > 0.01

    // Ghost massing: strongest while the shell goes up, retired once
    // the render coat has made the real volumes legible.
    mats.ghost.opacity = clamp01(ease(span(p, PHASE.site)) * (1 - ease(span(p, PHASE.finishes)))) * 0.3
    if (ghostRef.current) ghostRef.current.visible = mats.ghost.opacity > 0.01

    // The site grid stays, quietly, until the garden covers it.
    mats.grid.opacity = clamp01(ease(span(p, PHASE.site)) * (1 - ease(span(p, PHASE.landscape)))) * 0.2
    if (gridRef.current) gridRef.current.visible = mats.grid.opacity > 0.01

    // Profile boards come out once the walls are being laid.
    if (pegsRef.current) pegsRef.current.visible = p < PHASE.walls[0]

    // The pool opening stays covered until the dig begins.
    if (patchRef.current) patchRef.current.visible = p < PHASE.pool[0]
  })

  // The ground is cut around the pool, so the dig reads as a dig.
  const groundGeo = useMemo(() => {
    const s = 520
    const shape = new THREE.Shape([
      new THREE.Vector2(-s / 2, -s / 2), new THREE.Vector2(s / 2, -s / 2),
      new THREE.Vector2(s / 2, s / 2), new THREE.Vector2(-s / 2, s / 2),
    ])
    shape.holes.push(
      new THREE.Path([
        new THREE.Vector2(POOL.x0, -POOL.z1), new THREE.Vector2(POOL.x1, -POOL.z1),
        new THREE.Vector2(POOL.x1, -POOL.z0), new THREE.Vector2(POOL.x0, -POOL.z0),
      ]),
    )
    // ShapeGeometry's UVs are its own coordinates: metres already.
    return new THREE.ShapeGeometry(shape)
  }, [])

  const gridSize = Math.ceil(Math.max(rectW(PLOT), rectD(PLOT)) + 8)

  return (
    <group>
      <mesh geometry={groundGeo} rotation-x={-Math.PI / 2} position-y={-0.02} material={M.ground} />
      <mesh
        ref={patchRef}
        rotation-x={-Math.PI / 2}
        position={[rectCX(POOL), -0.019, rectCZ(POOL)]}
        geometry={planeGeo(rectW(POOL), rectD(POOL))}
        material={M.ground}
      />

      <gridHelper
        ref={gridRef}
        args={[gridSize, gridSize]}
        position={[rectCX(PLOT), 0.006, rectCZ(PLOT)]}
        material={mats.grid}
      />

      <lineSegments ref={setRef} geometry={settingOut} material={mats.setOut} />

      {/* Profile boards with gold survey nails. */}
      <Assembly window={PHASE.site}>
        <group ref={pegsRef}>
          {pegs.map(([x, z], i) => (
            <group key={i} position={[x, 0, z]}>
              <mesh position-y={0.5} geometry={boxGeo(0.08, 1, 0.08)} material={M.timber} />
              <mesh position-y={1.05} material={goldSolid}>
                <sphereGeometry args={[0.07, 8, 6]} />
              </mesh>
            </group>
          ))}
        </group>
      </Assembly>

      <group ref={ghostRef}>
        {ghost.map((g, i) => (
          <lineSegments key={i} geometry={g.geo} material={mats.ghost} position={g.pos} />
        ))}
      </group>

      {/* Excavation: the reduced-level dig under the footprint. */}
      <Assembly window={PHASE.excavate} mode="fade">
        <mesh
          rotation-x={-Math.PI / 2}
          position={[rectCX(ENVELOPE), 0.008, rectCZ(ENVELOPE)]}
          geometry={planeGeo(rectW(ENVELOPE) + 2, rectD(ENVELOPE) + 2)}
          material={M.screed}
        />
      </Assembly>
    </group>
  )
}
