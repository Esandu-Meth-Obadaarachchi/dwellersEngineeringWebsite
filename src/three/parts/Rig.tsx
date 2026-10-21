import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { readProgress } from '../Assembly'
import { damp, lerp, clamp01, ease } from '../progress'
import { CAMERA } from '../schedule'

/**
 * The camera. (Light lives in `Lighting`.)
 *
 * The camera walks a keyframed path around the plot, always at the
 * distance the current phase needs: close over the footings, wide when
 * the roof lands, back for handover. It is damped rather than driven
 * directly, so a fast scroll is a sweep and not a jump cut.
 */
export function Rig({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera, size } = useThree()

  const pos = useRef(new THREE.Vector3(...CAMERA[0].pos))
  const look = useRef(new THREE.Vector3(...CAMERA[0].look))
  const targetPos = useMemo(() => new THREE.Vector3(), [])
  const targetLook = useMemo(() => new THREE.Vector3(), [])

  /**
   * The keyframes are composed for a wide screen. A portrait phone has
   * the same vertical field of view but a far narrower horizontal one,
   * so the identical camera position crops the building in half. The
   * lens is widened and the camera pulled back to suit the aspect —
   * the framing is re-derived rather than the path re-authored.
   */
  const fit = useMemo(() => {
    const aspect = size.width / Math.max(1, size.height)
    const fov = aspect >= 1.4 ? 38 : aspect >= 1 ? 45 : 56
    const pull = THREE.MathUtils.clamp(1.15 / aspect, 1, 1.32)
    return { fov, pull }
  }, [size.width, size.height])

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    if (cam.isPerspectiveCamera && cam.fov !== fit.fov) {
      cam.fov = fit.fov
      cam.updateProjectionMatrix()
    }
  }, [camera, fit.fov])

  useFrame((state, dt) => {
    const p = reducedMotion ? 1 : readProgress()
    const d = Math.min(dt, 0.1)

    sampleCamera(p, targetPos, targetLook)

    // Push the sampled position out along its own sight line so the
    // subject fits the viewport's aspect.
    if (fit.pull !== 1) {
      targetPos.sub(targetLook).multiplyScalar(fit.pull).add(targetLook)
    }

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
  })

  return null
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
