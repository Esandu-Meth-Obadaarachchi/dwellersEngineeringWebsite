# Dwellers Engineering — Website

Corporate website for **Dwellers Engineering (Pvt) Ltd**, an engineering and
construction company based in Angoda, Sri Lanka.

> Building with Integrity, Engineering with Excellence.

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 5 + TypeScript |
| UI | React 18 |
| 3D | three.js via react-three-fiber |
| Motion | CSS transitions and keyframes, driven by one `IntersectionObserver` |
| Styling | Hand-authored CSS with custom properties — no framework |

There is no animation library and no UI framework. The only runtime
dependencies are React and three.js.

## Design

The visual language is taken from the company's own profile booklet: black,
signal gold `#FFDE59`, crest bronze `#B29629`, and the lion crest.

Every structural device on the page is borrowed from a real structural drawing
sheet — the sheet frame, the title block, grid bubbles down the margin,
dimension strings, and 45° section hatching. Each one carries a value that is
actually true of the content beside it rather than decorating it.

The centrepiece is a scroll-driven 3D build sequence: a house assembles itself
from bare site to handover — setting out, excavation, pad footings, ground
beams, reinforcement cages, columns, suspended slabs, blockwork, roof, glazing
— followed by a swimming pool, a steel shed and landscaping. The six phases of
the animation are the six stages of the company's stated process, so the model
and the text tell the same story.

## Performance

Old laptops and phones are the constraint, so the scene is budgeted:

- All geometry is procedural — no model or texture downloads.
- Repeated elements (blockwork, roof tiles, rebar, paving, fence) are
  `InstancedMesh`; per-instance matrices are only rewritten while that element's
  phase is on screen.
- No shadow maps and no environment map. Contact shadow is a single generated
  radial gradient.
- Scroll progress lives in a ref, so scrolling animates the scene without
  re-rendering React.
- Device tier (`src/hooks/useDeviceTier.ts`) caps device pixel ratio, instance
  counts and geometry segments.
- The canvas renders only while it is on screen.
- The camera path is re-fitted to the viewport's aspect rather than re-authored,
  so a portrait phone gets a wider lens and more distance instead of a cropped
  building.
- `prefers-reduced-motion` is respected: the scene settles to the completed
  building and the scroll-linked animation is disabled.
- The three.js chunk is code-split and lazy-loaded, so first paint does not
  wait for it.

## Images

The booklet's photography is black and white, and the page renders it that way,
so it ships already greyscale — it compresses far better at the same apparent
quality. The hero backdrop is served at three widths through `srcset`, so a
phone fetches ~87 kB rather than ~162 kB. The lion crest is an inlined SVG
component rather than a file, so `currentColor` resolves and it can appear in
gold, bronze or bone without a second request.

## Measured

On a production build, throttled to 4× slower CPU and ~1.6 Mbps:

| | |
| --- | --- |
| First contentful paint | ~0.96 s |
| First load, gzipped (HTML + CSS + app + React) | ~69 kB |
| 3D chunk, gzipped — requested after first paint | ~216 kB |

Per animation frame, while scrubbing the entire build sequence:

| | script | total task |
| --- | --- | --- |
| Desktop | 5.9 ms | 7.7 ms |
| 4× CPU throttle | 8.3 ms | 11.0 ms |
| Phone viewport, 6× CPU throttle | 11.0 ms | 14.2 ms |

All inside the 16.7 ms budget for 60 fps.

## Running

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build to dist/
npm run preview    # serve the production build
npm run typecheck
```

## Content

All copy, both directors' portraits and the crest come from
`docs/Dwellers Official Business Profile.pdf`. Source of truth for text is
`src/data/company.ts` — nothing on the site is invented.
