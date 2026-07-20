# Remotion animations — SDTM Bootcamp decks

Pilot: an animated video version of **Deck 01, slide 1** (title slide), built with
[Remotion](https://www.remotion.dev/) (React-based programmatic video).

## Output
- `out/slide01.mp4` — 1920×1080, 30 fps, 11 s, H.264 (~1.3 MB)

## Animation timeline (frames @ 30 fps)
| Frames | What happens |
|---|---|
| 0–40 | Concentric rings spring in (staggered), then float gently throughout |
| 25–50 | Eyebrow fades in while letter-spacing expands |
| 55–100 | Title lines rise in, staggered |
| 105–130 | Subtitle fades up |
| 135–170 | Standards chips pop in one by one (SDTM highlighted in accent orange) |
| →330 | Hold |

Palette, geometry, and type all match the pptx deck (`presentations/build_01_intro_sdtm.js`):
ink `#0F2E3D`, teal `#0E7C86`, mint `#6FC8B4`, accent `#E8833A`; Cambria/Georgia headers,
Calibri body. Slide coordinates are authored in inches × 144 px/in, so positions can be
copied straight from the pptx generator.

## Commands
```bash
npm install                 # once
npm run render              # → out/slide01.mp4
npm run preview             # interactive Remotion Studio in the browser
# stills for QA:
npx remotion still src/index.jsx Slide01 out/f160.png --frame=160
```

## Extending to more slides / full decks
Each slide becomes a `<Composition>` in `src/Root.jsx` (one component per slide,
`src/SlideNN.jsx`). Chain them into one video with a `<Series>` of `<Series.Sequence>`
elements in a wrapper composition, one per slide, and render that composition instead.
Voice-over: add an `<Audio>` element per sequence and set each sequence's duration
to the narration length.
