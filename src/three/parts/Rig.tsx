import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { readProgress } from '../Assembly'
import { damp, lerp, clamp01, ease, span } from '../progress'
import { CAMERA, PHASE } from '../schedule'

/**
 * Camera and light.
 *
 * The camera walks a keyframed path around the plot, always at the
 * distance the current phase needs: close over the footings, wide when
 * the roof lands, back for handover. It is damped rather than driven
 * directly, so a fast scroll is a sweep and not a jump cut.
 */
export function Rig({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera } = useThree()

  const pos = useRef(new THREE.Vector3(...CAMERA[0].pos))
  const look = useRef(new THREE.Vector3(...CAMERA[0].look))
  const targetPos = useMemo(() => new THREE.Vector3(), [])
  const targetLook = useMemo(() => new THREE.Vector3(), [])

  const key = useRef<THREE.DirectionalLight>(null!)
  const fill = useRef<THREE.DirectionalLight>(null!)
  const hemi = useRef<THREE.HemisphereLight>(null!)
  const warm = useRef<THREE.PointLight>(null!)

  useFrame((state, dt) => {
    const p = reducedMotion ? 1 : readProgress()
    const d = Math.min(dt, 0.1)

    sampleCamera(p, targetPos, targetLook)

    // A slow ambient drift, so the frame is never completely still.
    if (!reducedMotion) {
      const t = state.clock.elapsedTime
      targetPos.x += Math.sin(t * 0.18) * 0.5
      targetPos.y += Math.sin(t * 0.13) * 0.28
    }

    if (reducedMotion) {
      pos.current.copy(targetPos)
      look.current.copy(targetLook)
    } else {
      pos.current.set(
        damp(pos.current.x, targetPos.x, 3.2, d),
        damp(pos.current.y, targetPos.y, 3.2, d),
        damp(pos.current.z, targetPos.z, 3.2, d),
      )
      look.current.set(
        damp(look.current.x, targetLook.x, 4, d),
        damp(look.current.y, targetLook.y, 4, d),
        damp(look.current.z, targetLook.z, 4, d),
      )
    }

    camera.position.copy(pos.current)
    camera.lookAt(look.current)

    // Daylight through the build; dusk at handover, when the lights
    // inside take over as the brightest thing in the frame.
    const dusk = ease(span(p, PHASE.handover))
    if (key.current) key.current.intensity = lerp(2.5, 0.95, dusk)
    if (fill.current) fill.current.intensity = lerp(0.85, 0.5, dusk)
    if (hemi.current) hemi.current.intensity = lerp(0.9, 0.55, dusk)
    if (warm.current) warm.current.intensity = dusk * 26
  })

  return (
    <>
      <hemisphereLight
        ref={hemi}
        args={['#C9CBD6', '#191713', 0.9]}
      />
      {/* Key: high and raking, so columns and coursing read in relief. */}
      <directionalLight ref={key} position={[14, 20, 10]} intensity={2.5} color="#FFF3D6" />
      {/* Fill from the opposite side keeps the dark side off pure black. */}
      <directionalLight ref={fill} position={[-16, 9, -12]} intensity={0.85} color="#8FA5C4" />
      {/* A second fill from the front keeps elevations off pure black
          when the camera swings behind the key. */}
      <directionalLight position={[6, 7, 24]} intensity={0.45} color="#A9B6C6" />
      {/* Warm interior spill, only once the building is occupied. */}
      <pointLight ref={warm} position={[-6.5, 3.4, 0]} intensity={0} color="#FFDE59" distance={26} decay={1.6} />
    </>
  )
}

/** Piecewise-linear walk along the camera keyframes, smoothed. */
function sampleCamera(p: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
  const t = clamp01(p)

  let i = 0
  while (i < CAMERA.length - 2 && t > CAMERA[i + 1].t) i++

  const a = CAMERA[i]
  const b = CAMERA[i + 1] ?? CAMERA[i]
  const spanT = Math.max(1e-6, b.t - a.t)
  const k = ease(clamp01((t - a.t) / spanT))

  outPos.set(
    lerp(a.pos[0], b.pos[0], k),
    lerp(a.pos[1], b.pos[1], k),
    lerp(a.pos[2], b.pos[2], k),
  )
  outLook.set(
    lerp(a.look[0], b.look[0], k),
    lerp(a.look[1], b.look[1], k),
    lerp(a.look[2], b.look[2], k),
  )
}
