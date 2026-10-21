# Prompt: rebuild the 3D build sequence as a new house

Use this file to turn photos, renders or a 2D floor plan of any house into the
scroll-driven 3D build on the home page, the same way the tropical villa was
made.

---

## Part 1. How to use this file (for you)

1. Collect what you have for the house:
   - Floor plans for each level, with dimensions if possible. A hand sketch
     with measurements works.
   - At least one elevation or photo of the front and the garden side.
   - Any section or roof plan, if you have one.
   - The plot size and where the gate, drive, pool and garden go.
2. Fill in the **Brief** in Part 2. Leave a field blank if you do not know;
   the assistant will make a sensible choice and tell you what it chose.
3. Start a new Claude Code session on this repository, attach the pictures,
   and paste everything from **Part 2** onwards.
4. Answer the assistant's questions. It should confirm its reading of the
   plans before it writes any code.
5. Review the screenshots it sends at each build stage, then merge the PR
   and redeploy (`npm run build`, then `netlify deploy --prod --dir=dist`).

Tips for better results:

- Dimensions matter more than pretty pictures. One measured plan beats ten
  photos.
- Mark north on the plan, or say which side faces the street and which faces
  the garden.
- If the house is very large or has curved walls, say so up front. Curves are
  possible but cost more work and performance.

---

## Part 2. The prompt (paste from here)

You are rebuilding the scroll-driven 3D construction sequence on this
website so it builds a **new house** from the plans and pictures I have
attached. The current scene builds a two-storey tropical villa. Replace that
house with mine while keeping the system, the style of animation and the
performance budget exactly as they are.

### Brief

Fill in what you know. Ask me about anything blank or unclear before writing
code.

```
House name / label for the HUD:   e.g. "Contemporary residence · Three storey · Pool"
Storeys (and any roof terrace):
Overall footprint (m):            width x depth
Floor-to-floor height (m):        default 3.5
Roof type:                        flat slab / hipped tile / gable / mixed
Style and key materials:          e.g. white render, ledgestone, teak, clay tile
Street side:                      north / south / east / west of the house
Garden side (camera side):
Plot size (m):
Pool:                             yes / no, size
Carport or garage:                yes / no, how many cars
Other features:                   balconies, pergola, louvres, stairs, water feature
Things that must match exactly:   e.g. window pattern on the front elevation
Things I don't care about:        e.g. interior layout
```

### What you must read first

Read these before planning. They are the whole system:

- `src/three/villa.ts`: the house as data. Every footprint, slab, wall and
  opening lives here. This is the main file you will rewrite.
- `src/three/schedule.ts`: `PHASE` (when each trade happens on the 0 to 1
  scroll timeline), `frameWindow` (columns then slab, one level at a time),
  `CAPTIONS` (the six process stages, do not change the titles) and `CAMERA`
  (camera keyframes).
- `src/three/Assembly.tsx` and `src/three/Merge.tsx`: how every element
  arrives (`rise`, `crane`, `sink`, `fade`) and how static parts are merged
  into one mesh per material.
- `src/three/geometry.ts`, `textures.ts`, `materials.ts`: UVs in metres,
  canvas-painted textures and the shared material set.
- Every file in `src/three/parts/`.
- `src/three/BuildScene.tsx` and `src/hooks/useDeviceTier.ts` for the
  per-device budget.

These parts read villa-specific exports and will need updating for a new
house:

| Part | Villa exports it uses |
| --- | --- |
| `Structure.tsx` | `GRID_X`, `GRID_Z`, `SLABS`, `LEVEL_Y`, `GROUND`, `PAVILION_COLS`, `STONE_WALL` |
| `Finishes.tsx` | `WALLS`, `SLABS`, `STONE_WALL`, `LOUVRES`, `FIRST`, `GROUND` |
| `Roof.tsx` | `SLABS`, `PAVILION`, `PERGOLA`, `FIRST`, `STONE_WALL` |
| `Interior.tsx` | `GROUND`, `FIRST`, `PAVILION` |
| `Site.tsx` | `GROUND`, `FIRST`, `PAVILION`, `POOL`, `CARPORT`, `ENVELOPE`, `PLOT`, grid |
| `Landscape.tsx` | `PLOT`, `GATE`, `DRIVE`, `TERRACE`, `DECK`, `CARPORT` |
| `Pool.tsx`, `Carport.tsx`, `Lighting.tsx` | `POOL`, `DECK`, `CARPORT`, `DRIVE`, `LEVEL_Y` |
| `Walls.tsx`, `Glazing.tsx` | `WALLS` only, so they adapt automatically |

### Coordinate system and units

- Units are metres. `y` is up.
- The camera and the garden are on the `+z` (south) and `+x` (east) side.
  Rotate my plan so my garden side faces `+z`, or tell me if that framing
  does not suit this house and propose another.
- Keep the house roughly centred around `x = -5, z = -2` so the existing
  camera framing and shadow camera still cover it, or update both.
- Floor tops are in `LEVEL_Y`. Walls stand on a level's floor and run to
  the slab soffit above (`STOREY_CLEAR`).

### How to translate the plans into `villa.ts`

1. **Scale and orient.** State the scale you read from the plan, and the
   rotation you applied. Convert every dimension to metres.
2. **Levels.** One entry per floor in `LEVEL_Y`. Add or remove levels as
   needed and make `Structure.tsx` loop over them rather than the fixed
   `[0, 1]` plus pavilion it has now.
3. **Footprints.** One `Rect` per enclosed floor plate. Use several rects
   for L or U shapes, or for a floor smaller than the one below.
4. **Column grid.** `GRID_X` and `GRID_Z` on the main structural lines,
   spaced 3 to 6 m. Columns must sit on walls or at slab corners, and every
   level's columns must stand on the slab or footings below. Nothing floats.
5. **Slabs.** One `Slab` per suspended floor and roof, with real overhangs
   for balconies and eaves.
6. **Walls.** One `Wall` per straight run, axis-aligned (`axis: 'x' | 'z'`,
   `at`, `from`, `to`, `out` for the outside face).
7. **Openings.** For every window and door, measured along the wall from its
   `from` end: `a`, `b`, `sill`, `head`, and a `kind` (`slider`, `window`,
   `door`, `pivot`). Openings must not overlap and must sit inside the wall.
   Match the elevations: count the windows on each face and check them
   against my pictures.
8. **Features.** Stone walls, louvres, pergolas, carports, pools and decks
   are exported constants. Keep the ones my house has, delete the ones it
   doesn't, and add new ones in the same style (a typed constant in
   `villa.ts` plus a part that reads it).
9. **Roofs.** Flat roofs use a slab plus `Roof.tsx` finishes. For a pitched
   roof, add a new part that builds rafters and trusses with `crane`, then
   tiles or sheeting as an `InstancedMesh`, in the `roof` phase. Keep tile
   counts within the device budget.
10. **Site.** Set `PLOT`, `GATE`, `DRIVE`, `TERRACE`, `POOL`, `DECK` from the
    site plan. The lawn in `Landscape.tsx` is cut around these, so holes
    must not overlap or touch.

Before writing any code, send me:

- a short table of levels, footprints, grid and slabs,
- a list of walls with their openings,
- the features you will keep, remove or add,
- any guesses you made where the plans were unclear.

Wait for my "go" after that.

### Rules that must not break

- **Everything procedural.** No model files, no image files, no HDRs. New
  textures are painted in `textures.ts`. New materials go in `materials.ts`.
- **Real construction order.** Site, excavation, footings, ground beams,
  then per level: cages, columns, slab. Then blockwork, cladding, roof,
  render and paint over the blocks, glazing, interior, external works,
  landscape, dusk at handover. Keep the six `CAPTIONS` titles as they are;
  only adjust their `at` and `note`.
- **Assembly rules.** A `rise` group is positioned at the element's base;
  its children are modelled upward from `y = 0`. Use `merge` on every
  static `Assembly`. Never put a ref'd or animated child inside a merged
  one.
- **Geometry.** Use `boxGeo` and `planeGeo` so UVs stay in metres. Repeated
  things (blocks, tiles, plants) are `InstancedMesh`.
- **Performance budget.** At the final frame on desktop: under 300 draw
  calls (shadow pass included) and under 80k triangles. Check with
  `renderer.info` and report the numbers.
- **Accessibility and motion.** Keep the `sr-only` stage list,
  `prefers-reduced-motion` handling and the lazy-loaded 3D chunk.
- **Brand.** Black page, signal gold `#FFDE59` linework and HUD, bronze
  `#B29629` rebar. The house itself may use real material colours.
- Update the HUD label in `src/components/BuildSequence.tsx` and the 3D
  description in `README.md`.

### Camera

Rework `CAMERA` so each keyframe frames what is being built at that moment:
the empty plot, footings, the column grid, slabs landing, the main
elevation, the roof, the glazing close up, the pool or garden, any carport
or garage, and a wide handover shot. Keep the same number of keyframes or
close to it, and make sure no keyframe looks straight through the house at
something hidden behind it.

### How to verify (do this, don't skip it)

1. `npm run typecheck` and `npm run build` must pass.
2. Run `npx vite`, then use Playwright with SwiftShader WebGL
   (`--use-angle=swiftshader --enable-unsafe-swiftshader`) to scroll the
   `#build` section to progress 0.05, 0.2, 0.4, 0.55, 0.65, 0.75, 0.85,
   0.9 and 1, wait about 6 s at each, and screenshot at 1440×900 and
   390×844.
3. Compare the final frame against my pictures, face by face. List every
   difference you can see and fix the ones that matter.
4. Look for: floating parts, gaps at wall corners, render over glass,
   openings that don't line up between blockwork and glazing, z-fighting,
   things poking through the lawn, the camera clipping walls.
5. Report draw calls and triangles at progress 0.3, 0.6 and 1.
6. Send me the screenshots as a contact sheet.

### Deliverable

- One branch, one PR, with a description of what changed, the verification
  numbers and anything that still needs checking on a real phone.
- In your final message, tell me plainly which parts of my plans you could
  not reproduce and why, and what you would need from me to close the gap.
