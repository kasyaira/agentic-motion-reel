# CAPABILITIES — honest audit

Status legend:
`[implemented]` code exists · `[visually demonstrated]` appears in the film ·
`[rendered successfully]` verified in the final MP4 · `[audited]` API checked
but not shown · `[skipped]` deliberate, reason documented.

## Rendering core

| Capability | Technology | Status |
|---|---|---|
| Timeline & composition engine | Remotion 4.0.529, Sequence/Composition | [rendered successfully] |
| Deterministic randomness | mulberry32 seeded PRNG (src/lib/rand.ts) | [rendered successfully] |
| Local font pipeline | woff2 → base64 data-URI @font-face | [rendered successfully] |
| Global film grade | SVG feTurbulence grain + CSS vignette | [rendered successfully] |
| Software WebGL rendering | Chrome headless + `--gl=swangle` | [rendered successfully] |

## Per-scene capabilities

| # | Capability | Technology | Status |
|---|---|---|---|
| 01 | Beat-driven kinetic type | impact punch + camera scale + particle burst | [rendered successfully] |
| 02 | Kinetic typography | char-spring stagger, scramble decode, line-mask reveals, SVG `<textPath>` motion | [rendered successfully] |
| 03 | 2D motion graphics | `evolvePath()` trim animation, procedural moiré fan, clip-path mask reveal | [rendered successfully] |
| 04 | Data visualization | spring bars, expo counters, donut sweep, dash-drawn line chart (fictional data, labeled) | [rendered successfully] |
| 05 | UI / product motion | window+cards springs, modal w/ backdrop blur, toggle, toast, SVG cursor + click ripple | [rendered successfully] |
| 06 | Transition lab | 8 official presentations: fade, slide, wipe, flip, clock-wipe, iris, film-burn (shader), crosswarp (shader) | [rendered successfully] |
| 07 | Motion blur & physics | `Trail` (lagged layers), analytic ballistics, damped harmonic pendulum, `CameraMotionBlur` 200° | [rendered successfully] |
| 08 | Particles / procedural | 650-particle noise flow field (canvas), 900-particle text convergence, canvas rasterized targets | [rendered successfully] |
| 09 | Audio reactive | real FFT via `visualizeAudio()` at absolute frame, mirrored radial spectrum, band-driven rings | [rendered successfully] |
| 10 | Sound design anatomy | 6 lanes, frame-exact playhead, SFX fired at the frames shown | [rendered successfully] |
| 11 | 3D | @remotion/three + R3F: chrome torus knot, glass transmission sphere, instanced pillars, shadows, fog, frame-driven dolly | [rendered successfully] |
| 12 | Post processing | 6 isolated passes — bloom stack, per-frame-seed grain, RGB channel split, scanlines, slice glitch, vignette — then combined | [rendered successfully] |
| 13 | GLSL shader | raw WebGL fragment shaders: domain-warped FBM flow + polar tunnel, `u_time = frame/fps` | [rendered successfully] |
| 14 | Lottie import | hand-authored JSON, `@remotion/lottie` with 1.5× → 1× → 0.4× → 1.25× speed ramp (negative rates rejected by the component — documented) | [rendered successfully] |
| 15 | Rough / hand-drawn | rough-notation: highlight, underline, box, circle, bracket — progress-driven, seeded | [rendered successfully] |
| 16 | Captions | synthesized voice (TTS) + word-level spring-highlight captions | [rendered successfully] |
| 17 | Maps | — | [skipped] — tile servers break offline/deterministic renders; no map asset could be bundled locally |
| 18 | Media compositing | real self-rendered footage: playbackRate ramps 0.4–2.2×, ken-burns re-crop, duotone grade, PiP, letterbox | [rendered successfully] |
| 19 | Code visualization | syntax-typed GLSL editor, CLI session, animated pipeline node graph | [rendered successfully] |
| 20 | Composite staging | particles + spectrum arc + counters + kinetic type + rough ellipse, strict hierarchy | [rendered successfully] |
| 21 | Capability matrix | 16 tiles, beat-synced flips | [rendered successfully] |
| 22 | Hero shot | breathing mark, two-line resolve, sub-hit, film burn-out | [rendered successfully] |

## Audio capabilities

| Capability | Technology | Status |
|---|---|---|
| Original music bed | oscillator synthesis, 128 BPM, A-minor pentatonic, delay bus, tanh master (scripts/gen-audio.mjs) | [rendered successfully] |
| SFX set | whoosh / impact / sub / tick / riser — synthesized WAVs placed frame-exact | [rendered successfully] |
| Frame-synced hits | section boundaries are frame-derived; impacts at f24/f72/f120/f150 etc. | [rendered successfully] |
| Ducking | baked envelope: −62 % scene 10, −45 % scene 16 | [rendered successfully] |
| Real audio-data visuals | `@remotion/media-utils` FFT (scene 9) | [rendered successfully] |
| TTS voice | z-ai TTS ("jam" voice), 6.35 s, word timings scaled to fit | [rendered successfully] |

## Audited but not demonstrated (deliberate)

| Package | Reason |
|---|---|
| `@remotion/shapes` | Shapes are hand-drawn SVG in scenes 3/6 — stronger control; package API verified (`Circle`, `Star`, `Triangle`, …) |
| `@remotion/mac-cursors` | ESM-only package audited; a custom SVG cursor was used for full styling control |
| `@remotion/captions` | Caption data authored directly in `src/data/captions.ts` (12 word timings); the parser wasn't needed for a single line |
| `@remotion/google-fonts` | Replaced by inlined base64 fonts for deterministic rendering |
| Rive (`.riv`) | Requires proprietary editor; no open asset used |
| `@remotion/motion-blur` HtmlInCanvas / `makeHtmlInCanvasPresentation` | Available in the installed version; Trail + CameraMotionBlur demonstrated instead |
| Maps (scene 17) | Skipped — see per-scene table |

## Environment constraints discovered

- 2 CPU cores, no GPU → software WebGL via `swangle`; 30 fps chosen as the
  documented fallback (render budget).
- Remotion static server 404'd local woff2 → fonts inlined as base64.
- WebGL2 only available through ANGLE/SwiftShader flags → set in
  `remotion.config.ts`; raw-GLSL scene requests webgl2 with webgl fallback.
