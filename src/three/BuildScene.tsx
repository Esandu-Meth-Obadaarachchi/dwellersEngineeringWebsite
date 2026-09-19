import { Suspense, type MutableRefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { ProgressBridge } from './Assembly'
import { tierBudget, type DeviceTier } from '../hooks/useDeviceTier'
import { Site } from './parts/Site'
import { Structure } from './parts/Structure'
import { Walls } from './parts/Walls'
import { Roof } from './parts/Roof'
import { Glazing } from './parts/Glazing'
import { Pool } from './parts/Pool'
import { Shed } from './parts/Shed'
import { Landscape } from './parts/Landscape'
import { Rig } from './parts/Rig'

export type BuildSceneProps = {
  progress: MutableRefObject<number>
  tier: DeviceTier
  reducedMotion: boolean
  /** Rendering is suspended whenever the canvas is off screen. */
  active: boolean
}

/**
 * The scroll-driven build.
 *
 * Everything below is procedural: no models, no textures, nothing
 * fetched. The whole scene is a few hundred kilobytes of arithmetic,
 * which is what makes it viable on the phones this company's clients
 * will actually open it on.
 */
export default function BuildScene({
  progress,
  tier,
  reducedMotion,
  active,
}: BuildSceneProps) {
  const budget = tierBudget[tier]

  return (
    <>
      <Canvas
        // Rendering stops dead when the section is off screen.
        frameloop={active ? 'always' : 'never'}
        dpr={budget.dpr}
        gl={{
          antialias: budget.antialias,
          powerPreference: 'high-performance',
          alpha: true,
          stencil: false,
          depth: true,
        }}
        camera={{ fov: 38, near: 0.5, far: 320, position: [24, 6, 22] }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          scene.fog = new THREE.Fog('#050505', 52, 155)
        }}
      >
        <ProgressBridge source={progress} />
        <Rig reducedMotion={reducedMotion} />

        <Suspense fallback={null}>
          <Site />
          <Structure segments={budget.segments} />
          <Walls budget={budget.bricks} />
          <Roof budget={budget.tiles} />
          <Glazing />
          <Pool segments={budget.segments} />
          <Shed />
          <Landscape trees={budget.trees} />
        </Suspense>
      </Canvas>
    </>
  )
}
