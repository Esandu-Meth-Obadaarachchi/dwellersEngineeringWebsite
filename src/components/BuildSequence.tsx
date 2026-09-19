import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { useDeviceTier } from '../hooks/useDeviceTier'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useInView } from '../hooks/useInView'
import { CAPTIONS } from '../three/schedule'
import './BuildSequence.css'

// three.js is the heaviest thing on the page by a wide margin, so it is
// split out and only requested once the section is near the viewport.
const BuildScene = lazy(() => import('../three/BuildScene'))

export function BuildSequence() {
  const { ref: sectionRef, progress, coarse } = useScrollProgress<HTMLElement>()
  const { ref: stageRef, inView } = useInView<HTMLDivElement>({ margin: '300px' })
  const tier = useDeviceTier()
  const reducedMotion = usePrefersReducedMotion()

  // Only mount the 3D bundle once it is worth the download.
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (inView) setArmed(true)
  }, [inView])

  // With reduced motion the building is simply shown finished.
  useEffect(() => {
    if (reducedMotion) progress.current = 1
  }, [reducedMotion, progress])

  // Dev-only: ?p=0.42 parks the build at one moment so a single frame
  // can be inspected without scrolling to it. Stripped from production.
  const [scrub, setScrub] = useState<number | null>(null)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const p = new URLSearchParams(window.location.search).get('p')
    if (p === null) return
    const v = Math.max(0, Math.min(1, Number(p)))
    if (Number.isNaN(v)) return
    progress.current = v
    setScrub(v)
  }, [progress])

  const shown = scrub ?? (reducedMotion ? 1 : coarse)

  const stage = useMemo(() => {
    const p = shown
    let current = CAPTIONS[0]
    for (const c of CAPTIONS) if (p >= c.at) current = c
    return current
  }, [shown])

  const pct = Math.round(shown * 100)

  return (
    <section
      id="build"
      ref={sectionRef}
      className="build"
      aria-labelledby="build-title"
      data-reduced={reducedMotion || undefined}
    >
      <div className="build__stage" ref={stageRef}>
        <div className="build__canvas">
          {armed && (
            <Suspense fallback={<SceneFallback />}>
              <BuildScene
                progress={progress}
                tier={tier}
                reducedMotion={reducedMotion}
                active={inView}
              />
            </Suspense>
          )}
          {!armed && <SceneFallback />}
        </div>

        {/* --- Drafting HUD over the model --------------------- */}
        <div className="build__hud" aria-hidden="true">
          <div className="build__hud-tl">
            <span className="tech tech--gold">Dwellers Engineering</span>
            <span className="tech">Type A residence · Two storey · Pool · Store</span>
          </div>

          <div className="build__hud-tr tech">
            <span>Sheet 01</span>
            <span className="build__pct">{String(pct).padStart(3, '0')}%</span>
          </div>

          <ol className="build__phases tech">
            {CAPTIONS.map((c) => {
              const done = shown >= c.at
              return (
                <li key={c.stage} data-done={done} data-current={c.stage === stage.stage}>
                  <span className="build__phase-no">{c.stage}</span>
                  <span className="build__phase-tick" />
                </li>
              )
            })}
          </ol>
        </div>

        {/* --- Caption ----------------------------------------- */}
        <div className="build__caption">
          <h2 id="build-title" className="sr-only">
            The build sequence — how a Dwellers Engineering project is delivered
          </h2>
          <p className="tech tech--gold build__stage-no">Stage {stage.stage} / 06</p>
          <p className="build__stage-title" key={stage.stage}>
            {stage.title}
          </p>
          <p className="build__stage-note">{stage.note}</p>
        </div>

        {!reducedMotion && (
          <div className="build__scroll tech" aria-hidden="true">
            <span>Scroll to build</span>
            <span className="build__scroll-line" />
          </div>
        )}
      </div>

      {/* Text-only account of the same six stages, for anyone who
          never sees the canvas. */}
      <ol className="sr-only">
        {CAPTIONS.map((c) => (
          <li key={c.stage}>
            {c.title} — {c.note}
          </li>
        ))}
      </ol>
    </section>
  )
}

function SceneFallback() {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div className="build__fallback" ref={ref}>
      <span className="tech">Loading site model…</span>
    </div>
  )
}
