import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { M } from '../materials'
import { readProgress } from '../Assembly'
import { ease, span, lerp } from '../progress'
import { PHASE } from '../schedule'
import { LEVEL_Y, POOL, rectCX, rectCZ } from '../villa'

const SUN_DAY = new THREE.Color('#FFF1DC')
const SUN_DUSK = new THREE.Color('#FFB26B')

/**
 * Light, and the change from day to dusk at handover.
 *
 * Three things carry the realism:
 * - An image-based environment, generated in code from three.js's
 *   RoomEnvironment, so glass, water and car paint have something to
 *   reflect and every surface picks up soft bounce light.
 * - A sun that casts soft shadows, so the overhangs throw the deep
 *   shade a tropical house is designed around. Shadows are skipped on
 *   low-tier devices, where the environment alone still reads well.
 * - Dusk at handover: the sun warms and drops, and the house lights
 *   up from inside: downlights, glazing, garden bollards and the pool.
 */
export function Lighting({ shadowMap, reducedMotion }: { shadowMap: number; reducedMotion: boolean }) {
  const { gl, scene } = useThree()

  // Environment map: built once, a few milliseconds.
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    pmrem.dispose()
    return () => {
      scene.environment = null
      env.dispose()
    }
  }, [gl, scene])

  // Every opaque mesh casts and receives. This runs after the whole
  // scene has mounted, so it reaches every part without each one having
  // to opt in.
  useEffect(() => {
    if (!shadowMap) return
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const mat = mesh.material as THREE.Material
      mesh.receiveShadow = true
      mesh.castShadow = !mat.transparent
    })
  }, [scene, shadowMap])

  const sun = useRef<THREE.DirectionalLight>(null!)
  const hemi = useRef<THREE.HemisphereLight>(null!)
  const rooms = useRef<THREE.PointLight[]>([])
  const pool = useRef<THREE.PointLight>(null!)

  useFrame(() => {
    const p = reducedMotion ? 1 : readProgress()
    const dusk = ease(span(p, PHASE.handover))

    scene.environmentIntensity = lerp(0.6, 0.22, dusk)
    if (sun.current) {
      sun.current.intensity = lerp(3.1, 0.9, dusk)
      sun.current.color.lerpColors(SUN_DAY, SUN_DUSK, dusk)
    }
    if (hemi.current) hemi.current.intensity = lerp(0.75, 0.3, dusk)

    M.lamp.emissiveIntensity = dusk * 4
    M.glass.emissiveIntensity = dusk * 0.22
    M.poolTile.emissiveIntensity = dusk * 0.9
    for (const l of rooms.current) if (l) l.intensity = dusk * 34
    if (pool.current) pool.current.intensity = dusk * 18
  })

  const roomLights: [number, number, number][] = [
    [-6, LEVEL_Y[0] + 2.6, -1.5],
    [-5, LEVEL_Y[1] + 2.6, -1.2],
    [-10, LEVEL_Y[2] + 2.4, -5],
  ]

  return (
    <>
      <hemisphereLight ref={hemi} args={['#DCE6F2', '#3B3428', 0.75]} />
      <directionalLight
        ref={sun}
        position={[32, 44, 28]}
        intensity={3.1}
        color={SUN_DAY}
        castShadow={shadowMap > 0}
        shadow-mapSize-width={shadowMap || 512}
        shadow-mapSize-height={shadowMap || 512}
        shadow-camera-left={-38}
        shadow-camera-right={38}
        shadow-camera-top={34}
        shadow-camera-bottom={-34}
        shadow-camera-near={10}
        shadow-camera-far={130}
        shadow-bias={-0.0004}
        shadow-normalBias={0.035}
      />
      {roomLights.map((pos, i) => (
        <pointLight
          key={i}
          ref={(l) => {
            if (l) rooms.current[i] = l
          }}
          position={pos}
          intensity={0}
          color="#FFC98A"
          distance={16}
          decay={1.6}
        />
      ))}
      <pointLight
        ref={pool}
        position={[rectCX(POOL), -0.6, rectCZ(POOL)]}
        intensity={0}
        color="#6FE3EE"
        distance={10}
        decay={1.6}
      />
    </>
  )
}
