import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { M, LINE, goldSolid, makeContactShadow } from '../materials'
import { Assembly, readProgress } from '../Assembly'
import { ease, span, clamp01 } from '../progress'
import { PHASE, PLOT, HOUSE, POOL, SHED, HOUSE_CX, HOUSE_CZ, HOUSE_W, HOUSE_D, ROOF_Y } from '../schedule'

/** Outline of a box, as gold linework. */
function boxEdges(w: number, h: number, d: number) {
  return new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d))
}

/** A closed rectangle lying on the ground at height y. */
function rectOnGround(x0: number, x1: number, z0: number, z1: number, y = 0.02) {
  const pts = [
    new THREE.Vector3(x0, y, z0),
    new THREE.Vector3(x1, y, z0),
    new THREE.Vector3(x1, y, z1),
    new THREE.Vector3(x0, y, z1),
    new THREE.Vector3(x0, y, z0),
  ]
  return new THREE.BufferGeometry().setFromPoints(pts)
}

/**
 * The ground, the site grid, the setting-out, and the ghost of the
 * finished scheme.
 *
 * The whole building is drawn in gold line before a single element is
 * cast — the drawing arrives first and the structure grows into it,
 * which is the one idea this animation exists to show. The ghost dims
 * as real geometry takes over.
 */
export function Site() {
  const shadowTex = useMemo(makeContactShadow, [])

  const settingOut = useMemo(
    () => rectOnGround(HOUSE.x0, HOUSE.x1, HOUSE.z0, HOUSE.z1),
    [],
  )

  // Ghost massing: the finished volumes, in line only.
  const ghost = useMemo(
    () => ({
      house: boxEdges(HOUSE_W, ROOF_Y, HOUSE_D),
      pool: boxEdges(POOL.x1 - POOL.x0, POOL.depth, POOL.z1 - POOL.z0),
      shed: boxEdges(SHED.x1 - SHED.x0, SHED.h, SHED.z1 - SHED.z0),
    }),
    [],
  )

  // Own copies so each line group can be faded independently.
  const mats = useMemo(
    () => ({
      setOut: LINE.gold.clone(),
      ghost: LINE.ghost.clone(),
      grid: LINE.grid.clone(),
    }),
    [],
  )

  const stringLines = useMemo(() => {
    const y = 1.05
    const o = 1.1 // profile boards stand clear of the excavation
    const c = [
      new THREE.Vector3(HOUSE.x0 - o, y, HOUSE.z0 - o),
      new THREE.Vector3(HOUSE.x1 + o, y, HOUSE.z0 - o),
      new THREE.Vector3(HOUSE.x1 + o, y, HOUSE.z1 + o),
      new THREE.Vector3(HOUSE.x0 - o, y, HOUSE.z1 + o),
    ]
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < 4; i++) {
      pts.push(c[i], c[(i + 1) % 4])
      // Diagonals: the check every setting-out crew actually pulls.
      if (i < 2) pts.push(c[i], c[(i + 2) % 4])
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  const pegPositions = useMemo(() => {
    const o = 1.1
    return [
      [HOUSE.x0 - o, HOUSE.z0 - o],
      [HOUSE.x1 + o, HOUSE.z0 - o],
      [HOUSE.x1 + o, HOUSE.z1 + o],
      [HOUSE.x0 - o, HOUSE.z1 + o],
    ] as const
  }, [])

  const settingRef = useRef<THREE.LineLoop>(null!)
  const ghostRef = useRef<THREE.Group>(null!)
  const gridRef = useRef<THREE.GridHelper>(null!)
  const patchRef = useRef<THREE.Mesh>(null!)

  useFrame(() => {
    const p = readProgress()

    // Setting-out lines: struck early, gone once the frame is up.
    const on = ease(span(p, PHASE.site))
    const off = ease(span(p, PHASE.columns))
    mats.setOut.opacity = clamp01(on * (1 - off)) * 0.9
    if (settingRef.current) settingRef.current.visible = mats.setOut.opacity > 0.01

    // Ghost massing: strongest while the shell is going up, then
    // retired once the real roof lands on it.
    const gOn = ease(span(p, PHASE.site))
    const gOff = ease(span(p, PHASE.roof, 0.4, 0.6))
    mats.ghost.opacity = clamp01(gOn * (1 - gOff)) * 0.26
    if (ghostRef.current) ghostRef.current.visible = mats.ghost.opacity > 0.01

    // Site grid stays, quietly, all the way to handover.
    const grOff = ease(span(p, PHASE.landscape))
    mats.grid.opacity = clamp01(ease(span(p, PHASE.site)) * (1 - grOff * 0.75)) * 0.18
    if (gridRef.current) gridRef.current.visible = mats.grid.opacity > 0.01

    // The pool opening stays covered until the dig begins.
    if (patchRef.current) patchRef.current.visible = p < PHASE.pool[0]
  })

  // The ground is cut around the pool. Without the hole the pool is a
  // frame painted on a solid floor: you never see that it was dug.
  const groundGeo = useMemo(() => {
    // Wide enough that its edge never appears inside the fog.
    const w = 420
    const d = 420
    const shape = new THREE.Shape([
      new THREE.Vector2(-w / 2, -d / 2),
      new THREE.Vector2(w / 2, -d / 2),
      new THREE.Vector2(w / 2, d / 2),
      new THREE.Vector2(-w / 2, d / 2),
    ])
    const hole = new THREE.Path([
      new THREE.Vector2(POOL.x0, -POOL.z1),
      new THREE.Vector2(POOL.x1, -POOL.z1),
      new THREE.Vector2(POOL.x1, -POOL.z0),
      new THREE.Vector2(POOL.x0, -POOL.z0),
    ])
    shape.holes.push(hole)
    return new THREE.ShapeGeometry(shape)
  }, [])

  return (
    <group>
      {/* Ground, cut around the pool */}
      <mesh
        geometry={groundGeo}
        rotation-x={-Math.PI / 2}
        position-y={-0.02}
        material={M.ground}
      />

      {/* The hole in the ground is permanent geometry, so it is kept
          covered until the machine actually arrives to dig it. */}
      <mesh
        ref={patchRef}
        rotation-x={-Math.PI / 2}
        position={[
          (POOL.x0 + POOL.x1) / 2,
          -0.019,
          (POOL.z0 + POOL.z1) / 2,
        ]}
        material={M.ground}
      >
        <planeGeometry args={[POOL.x1 - POOL.x0, POOL.z1 - POOL.z0]} />
      </mesh>

      {/* Soft contact shading under the building mass. */}
      <mesh rotation-x={-Math.PI / 2} position={[HOUSE_CX, 0.012, HOUSE_CZ]}>
        <planeGeometry args={[HOUSE_W * 2.1, HOUSE_D * 2.3]} />
        <meshBasicMaterial map={shadowTex} transparent opacity={0.85} depthWrite={false} />
      </mesh>

      {/* Site grid — one square per metre of setting-out. */}
      <gridHelper
        ref={gridRef}
        args={[PLOT.w + 12, PLOT.w + 12]}
        position-y={0.005}
        material={mats.grid}
      />

      {/* Setting-out rectangle */}
      <lineLoop ref={settingRef} geometry={settingOut} material={mats.setOut} />

      {/* Profile boards, pegs and string lines */}
      <Assembly window={PHASE.site} mode="rise">
        <lineSegments geometry={stringLines} material={mats.setOut} />
        {pegPositions.map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh position-y={0.55} material={M.timber}>
              <boxGeometry args={[0.09, 1.1, 0.09]} />
            </mesh>
            <mesh position-y={1.16} material={goldSolid}>
              <sphereGeometry args={[0.075, 8, 6]} />
            </mesh>
          </group>
        ))}
      </Assembly>

      {/* Ghost of the finished scheme */}
      <group ref={ghostRef}>
        <lineSegments
          geometry={ghost.house}
          material={mats.ghost}
          position={[HOUSE_CX, ROOF_Y / 2, HOUSE_CZ]}
        />
        <lineSegments
          geometry={ghost.pool}
          material={mats.ghost}
          position={[(POOL.x0 + POOL.x1) / 2, -POOL.depth / 2, (POOL.z0 + POOL.z1) / 2]}
        />
        <lineSegments
          geometry={ghost.shed}
          material={mats.ghost}
          position={[(SHED.x0 + SHED.x1) / 2, SHED.h / 2, (SHED.z0 + SHED.z1) / 2]}
        />
      </group>

      {/* Excavation: the reduced-level dig under the footprint. */}
      <Assembly window={PHASE.excavate} mode="fade">
        <mesh
          rotation-x={-Math.PI / 2}
          position={[HOUSE_CX, 0.008, HOUSE_CZ]}
          material={M.screed}
        >
          <planeGeometry args={[HOUSE_W + 2.2, HOUSE_D + 2.2]} />
        </mesh>
      </Assembly>
    </group>
  )
}
