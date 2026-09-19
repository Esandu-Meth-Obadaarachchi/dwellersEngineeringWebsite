import { useMemo } from 'react'
import { M } from '../materials'
import { Assembly } from '../Assembly'
import { PHASE, SHED } from '../schedule'

const W = SHED.x1 - SHED.x0
const D = SHED.z1 - SHED.z0
const CX = (SHED.x0 + SHED.x1) / 2
const CZ = (SHED.z0 + SHED.z1) / 2
const RISE = 0.55
const SLOPE = Math.hypot(D / 2, RISE)
const PITCH = Math.atan2(RISE, D / 2)

/**
 * A steel portal-frame shed with corrugated sheeting.
 *
 * Deliberately a different construction system to the house — bolted
 * steel rather than cast concrete — so the sequence shows two trades,
 * and the corrugation is real geometry rather than a texture.
 */
export function Shed() {
  // The ridge runs along X, so each portal frame stands in the Z–Y
  // plane and the frames are spaced across the width.
  const frames = 4
  const bays = useMemo(
    () =>
      Array.from({ length: frames }, (_, i) => ({
        i,
        x: -W / 2 + (i * W) / (frames - 1),
      })),
    [],
  )

  const sheets = useMemo(() => Math.max(10, Math.round(W / 0.42)), [])

  return (
    <group position={[CX, 0, CZ]}>
      {/* --- Slab --------------------------------------------- */}
      <Assembly window={PHASE.shed} offset={0} length={0.18} mode="fade">
        <mesh position-y={0.07} material={M.screed}>
          <boxGeometry args={[W + 0.5, 0.14, D + 0.5]} />
        </mesh>
      </Assembly>

      {/* --- Portal frames ------------------------------------ */}
      {bays.map(({ i, x }) => (
        <Assembly
          key={i}
          window={PHASE.shed}
          offset={0.14 + (i / frames) * 0.3}
          length={0.26}
          mode="rise"
        >
          <group position={[x, 0, 0]}>
            {/* Stanchions, one each side of the bay */}
            {[-1, 1].map((s) => (
              <mesh
                key={s}
                position={[0, SHED.h / 2, (s * D) / 2]}
                material={M.darkSteel}
              >
                <boxGeometry args={[0.16, SHED.h, 0.16]} />
              </mesh>
            ))}
            {/* Rafters, eaves up to the ridge */}
            {[-1, 1].map((s) => (
              <mesh
                key={s}
                position={[0, SHED.h + RISE / 2, (s * D) / 4]}
                rotation-x={s * PITCH}
                material={M.darkSteel}
              >
                <boxGeometry args={[0.14, 0.14, SLOPE]} />
              </mesh>
            ))}
          </group>
        </Assembly>
      ))}

      {/* --- Purlins and ridge -------------------------------- */}
      <Assembly window={PHASE.shed} offset={0.42} length={0.2} mode="crane" drop={3}>
        <group>
          {/* Ridge purlin, along the length of the shed */}
          <mesh position-y={SHED.h + RISE} material={M.darkSteel}>
            <boxGeometry args={[W, 0.12, 0.12]} />
          </mesh>
          {/* Intermediate purlins down each slope */}
          {[-1, 1].map((s) =>
            [0.35, 0.72].map((f) => (
              <mesh
                key={`${s}-${f}`}
                position={[0, SHED.h + RISE * (1 - f), (s * D * f) / 2]}
                material={M.darkSteel}
              >
                <boxGeometry args={[W, 0.09, 0.09]} />
              </mesh>
            )),
          )}
        </group>
      </Assembly>

      {/* --- Corrugated roof ---------------------------------- */}
      <Assembly window={PHASE.shed} offset={0.56} length={0.3} mode="fade">
        <group>
          {([-1, 1] as const).map((s) => (
            <group
              key={s}
              position={[0, SHED.h + RISE / 2, (s * D) / 4]}
              rotation-x={s * PITCH}
            >
              {Array.from({ length: sheets }, (_, j) => (
                <mesh
                  key={j}
                  position={[-W / 2 + ((j + 0.5) * W) / sheets, 0, 0]}
                  material={M.sheeting}
                >
                  {/* Alternating ribs give the corrugation its profile. */}
                  <boxGeometry
                    args={[(W / sheets) * 0.9, j % 2 ? 0.1 : 0.05, SLOPE]}
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      </Assembly>

      {/* --- Cladding to three sides, open front --------------- */}
      <Assembly window={PHASE.shed} offset={0.62} length={0.3} mode="rise">
        <group>
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              position={[(s * W) / 2, SHED.h / 2, 0]}
              material={M.sheeting}
            >
              <boxGeometry args={[0.06, SHED.h, D]} />
            </mesh>
          ))}
          <mesh position={[0, SHED.h / 2, -D / 2]} material={M.sheeting}>
            <boxGeometry args={[W, SHED.h, 0.06]} />
          </mesh>
        </group>
      </Assembly>
    </group>
  )
}
