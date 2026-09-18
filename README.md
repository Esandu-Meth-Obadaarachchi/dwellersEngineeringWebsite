# Dwellers Engineering — Website

Corporate website for **Dwellers Engineering (Pvt) Ltd**, an engineering and
construction company based in Angoda, Sri Lanka.

> Building with Integrity, Engineering with Excellence.

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 5 + TypeScript |
| UI | React 18 |
| 3D | three.js via react-three-fiber + drei |
| Motion | framer-motion (`LazyMotion`, dom-only feature bundle) |
| Styling | Hand-authored CSS with custom properties — no framework |

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
- `prefers-reduced-motion` is respected: the scene settles to the completed
  building and the scroll-linked animation is disabled.
- The three.js chunk is code-split and lazy-loaded, so first paint does not
  wait for it.

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
