import { Suspense, type MutableRefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { ProgressBridge } from './Assembly'
import { tierBudget, type DeviceTier } from '../hooks/useDeviceTier'
import { Site } from './parts/Site'
import { Structure } from './parts/Structure'
import { Walls } from './parts/Walls'
import { Finishes } from './parts/Finishes'
import { Roof } from './parts/Roof'
import { Glazing } from './parts/Glazing'
import { Interior } from './parts/Interior'
import { Pool } from './parts/Pool'
import { Carport } from './parts/Carport'
import { Landscape } from './parts/Landscape'
import { Lighting } from './parts/Lighting'
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
 * Everything below is procedural: no models and no image files. Every
 * texture is painted onto a canvas at load and the reflections come from
 * an environment generated in code, so the whole scene is a few hundred
 * kilobytes of arithmetic, which is what makes it viable on the phones
 * this company's clients will actually open it on.
 */
export default function BuildScene({ progress, tier, reducedMotion, active }: BuildSceneProps) {
  const budget = tierBudget[tier]

  return (
    <Canvas
      // Rendering stops dead when the section is off screen.
      frameloop={active ? 'always' : 'never'}
      dpr={budget.dpr}
      shadows={budget.shadowMap > 0 ? 'soft' : false}
      gl={{
        antialias: budget.antialias,
        powerPreference: 'high-performance',
        alpha: true,
        stencil: false,
        depth: true,
      }}
      camera={{ fov: 38, near: 0.5, far: 420, position: [44, 20, 48] }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.0
        scene.fog = new THREE.Fog('#050505', 75, 210)
      }}
    >
      <ProgressBridge source={progress} />
      <Rig reducedMotion={reducedMotion} />

      <Suspense fallback={null}>
        <Site />
        <Structure segments={budget.segments} />
        <Walls budget={budget.bricks} />
        <Finishes />
        <Roof />
        <Glazing />
        <Interior />
        <Pool segments={budget.segments} />
        <Carport />
        <Landscape trees={budget.trees} shrubs={budget.shrubs} flowers={budget.flowers} />
        {/* Last, so its shadow pass sees every mesh above. */}
        <Lighting shadowMap={budget.shadowMap} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  )
}
