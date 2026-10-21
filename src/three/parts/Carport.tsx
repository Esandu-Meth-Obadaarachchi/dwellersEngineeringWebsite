import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { M } from '../materials'
import { Assembly, readProgress } from '../Assembly'
import { boxGeo, planeGeo } from '../geometry'
import { ease, span, lerp } from '../progress'
import { PHASE } from '../schedule'
import { CARPORT, DRIVE, rectW, rectD, rectCX, rectCZ } from '../villa'

/**
 * The carport: a thin white slab cantilevered off the stone wall onto
 * three slim steel posts, lined with teak underneath. When it is done,
 * the client's car drives in through the gate and parks.
 */
export function Carport() {
  const c = CARPORT
  const postX = c.x0 + 0.3
  const postH = c.top - c.t
  const posts = [c.z0 + 0.3, rectCZ(c), c.z1 - 0.3]

  return (
    <group>
      {posts.map((z, i) => (
        <group key={i} position={[postX, 0, z]}>
          <Assembly window={PHASE.carport} offset={i * 0.08} length={0.3}>
            <mesh position-y={postH / 2} geometry={boxGeo(0.14, postH, 0.14)} material={M.darkSteel} />
          </Assembly>
        </group>
      ))}

      <Assembly window={PHASE.carport} offset={0.3} length={0.3} mode="crane" drop={3} merge>
        <mesh position={[rectCX(c), c.top - c.t / 2, rectCZ(c)]} geometry={boxGeo(rectW(c), c.t, rectD(c))} material={M.render} />
        <mesh
          position={[rectCX(c), c.top - c.t - 0.01, rectCZ(c)]}
          rotation-x={Math.PI / 2}
          geometry={planeGeo(rectW(c) - 0.2, rectD(c) - 0.2)}
          material={M.timber}
        />
      </Assembly>

      <Car />
    </group>
  )
}

/** A saloon car, from an extruded side profile. Parks itself. */
function Car() {
  const group = useRef<THREE.Group>(null!)

  const { body, glass } = useMemo(() => {
    const side = (pts: [number, number][]) => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)))

    const bodyShape = side([
      [-2.35, 0.32], [2.3, 0.32], [2.4, 0.62], [2.32, 0.8], [1.9, 0.88],
      [0.85, 0.98], [-0.05, 1.42], [-1.25, 1.43], [-2.0, 1.06], [-2.38, 0.98], [-2.42, 0.6],
    ])
    const body = new THREE.ExtrudeGeometry(bodyShape, {
      depth: 1.66,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.06,
      bevelSegments: 3,
      curveSegments: 4,
    })
    body.translate(0, 0, -0.83)

    const glassShape = side([[0.78, 1.0], [-0.05, 1.37], [-1.22, 1.38], [-1.92, 1.06]])
    const glass = new THREE.ExtrudeGeometry(glassShape, { depth: 1.86, bevelEnabled: false })
    glass.translate(0, 0, -0.93)

    return { body, glass }
  }, [])

  const parked = { x: rectCX(CARPORT) + 0.5, z: rectCZ(CARPORT) - 0.4 }
  const enter = DRIVE.z1 + 6

  useFrame(() => {
    const g = group.current
    if (!g) return
    const t = ease(span(readProgress(), PHASE.carport, 0.6, 0.4))
    const visible = t > 0.001
    if (g.visible !== visible) g.visible = visible
    if (!visible) return
    g.position.z = lerp(enter, parked.z, t)
  })

  return (
    <group ref={group} position={[parked.x, 0, enter]} rotation-y={Math.PI / 2} visible={false}>
      <mesh geometry={body} material={M.carPaint} />
      <mesh geometry={glass} material={M.carGlass} />
      {[-1.45, 1.45].flatMap((x) =>
        [-0.82, 0.82].map((z) => (
          <group key={`${x}${z}`} position={[x, 0.34, z]} rotation-x={Math.PI / 2}>
            <mesh material={M.tyre}>
              <cylinderGeometry args={[0.34, 0.34, 0.24, 18]} />
            </mesh>
            <mesh position-y={z > 0 ? 0.121 : -0.121} material={M.chrome}>
              <cylinderGeometry args={[0.2, 0.2, 0.01, 14]} />
            </mesh>
          </group>
        )),
      )}
      {/* Head and tail lights. */}
      {[-0.62, 0.62].map((z) => (
        <group key={z}>
          <mesh position={[2.38, 0.72, z]} geometry={boxGeo(0.06, 0.1, 0.36)} material={M.lamp} />
          <mesh position={[-2.43, 0.84, z]} geometry={boxGeo(0.04, 0.08, 0.4)} material={M.darkSteel} />
        </group>
      ))}
    </group>
  )
}
