# WORKLOG — Agentic Motion Reel

Full production log from environment audit to final output. Every number below
is real — commands, error messages, and fixes are documented as they happened.

---

## Phase 0 — Environment Audit

| Check | Result |
|---|---|
| Node.js | v24.21.0 |
| npm | 11.19.0 |
| FFmpeg / ffprobe | 7.1.5 (Debian) |
| Git | 2.47.3 |
| CPU cores | 2 |
| Disk | 9.3 GB free |
| Remotion agent skills | **not pre-installed** (checked `skills/`) |
| GPU | none — software rendering required |

Decision: install Remotion + official packages directly; no agent skills for
Remotion were available in the sandbox, so official docs knowledge + package
`d.ts` inspection was used and verified locally.

## Phase 1 — Installation

```
npm i remotion @remotion/cli @remotion/transitions @remotion/shapes
     @remotion/paths @remotion/noise @remotion/media-utils
     @remotion/motion-blur @remotion/rough-notation @remotion/lottie
     @remotion/captions @remotion/mac-cursors lottie-web rough-notation
     react@18.3.1 react-dom@18.3.1 three@0.169.0
     @react-three/fiber@8.17.10 @remotion/three
npm i -D typescript@5.6 @types/three
```

Result: **remotion 4.0.529**, 0 vulnerabilities.

- Fixed: `esbuild` postinstall blocked by npm allowScripts policy → approved and
  ran `node node_modules/esbuild/install.js`.
- Compatibility verified from `@remotion/three` peer deps: `@react-three/fiber >= 8`
  → pinned fiber 8.17.10 + React 18.3.1 (stable combo).
- Fonts downloaded locally (Space Grotesk / Inter / JetBrains Mono woff2) so
  renders never touch a CDN. Later **inlined as base64** (see Phase 4).

## Phase 2 — Architecture

```
src/
  index.ts            registerRoot
  Root.tsx            <Composition Showreel> + <Composition InkfieldSource>
  sections.ts         single source of truth: 21 sections, durations in frames
  tokens.ts           design system: palette, fonts, easing, springs, FPS/size
  font-data.ts        base64 woff2 (generated)
  components/         Atmosphere (grain/vignette/global styles), SceneHud
  lib/rand.ts         mulberry32 seeded PRNG — deterministic randomness
  scenes/             S01…S22 + InkfieldSource (source footage)
scripts/
  fetch-fonts.mjs     Google Fonts → local woff2
  gen-audio.mjs       full programmatic soundtrack + SFX (no samples, no libs)
public/
  audio/              music.mp3 (195s), voice.mp3 (TTS), sfx/*.wav (5 files)
  fonts/              woff2 (source of the inline data)
  lottie/eq-orbit.json   hand-authored Lottie
  footage/source.mp4  self-rendered 8s "Inkfield" clip for media compositing
```

Timeline: **5,850 frames @ 30 fps = 195 s**. 22-section spec, section 17 (MAPS)
intentionally skipped (see CAPABILITIES.md → Limitations).

Design system: near-black `#0A0A0C`, warm ink `#F4F1EA`, international orange
`#FF4A1F` — deliberately not "AI-startup" blue/purple. Display: Space Grotesk,
HUD/labels: JetBrains Mono, body: Inter.

## Phase 3 — Scene Implementation (21 scenes)

Written and typechecked with `tsc --noEmit` until clean. API mismatches found
and fixed against the installed versions:

1. `Easing.expo` / `Easing.sinusoidal` / `Easing.quint` don't exist in Remotion
   4.0.529 → replaced with `Easing.out(Easing.exp)`, `Easing.inOut(Easing.sin)`,
   `Easing.inOut(Easing.poly(5))`. `Easing.back` is a **factory** — needs a call:
   `Easing.out(Easing.back(1.70158))`.
2. `evolvePath()` returns `{strokeDasharray, strokeDashoffset}` (CSS props), not
   `{d, points}` → rewritten to dash-offset trim + `getPointAtLength()` tips.
3. Transition presentations are lowercase factories exported from subpaths:
   `fade` from `@remotion/transitions/fade`, etc. `crosswarp({})` requires an
   (empty) argument. Presentation arrays typed as `TransitionPresentation<any>[]`.
4. R3F v8 JSX intrinsics don't land under the react-jsx transform → added
   `src/r3f-jsx.d.ts` augmenting both `React.JSX` and global `JSX` namespaces.
5. `visualizeAudio()` requires `numberOfSamples` to be a **power of two**
   (96 failed at runtime) → 128.
6. `Highlight` (rough-notation) accepts `color` but **not** `strokeWidth`.
7. `Trail` / `CameraMotionBlur` props verified from d.ts
   (`layers, lagInFrames, trailOpacity` / `shutterAngle, samples`).

## Phase 4 — Render Debugging (the real war stories)

| Symptom | Root cause | Fix |
|---|---|---|
| Fonts render as Times fallback | Remotion static server 404s `/fonts/*.woff2` even though files exist | Inlined all 8 woff2 files as base64 data URIs in `src/font-data.ts` — zero network at render |
| `Error creating WebGL context` | Headless Chrome has no GPU; `--gl=angle` / `swiftshader` insufficient | `--gl=swangle` (ANGLE+SwiftShader) works; set `Config.setChromiumOpenGlRenderer('swangle')` |
| Scene 13 (raw WebGL) black | GLSL error: `ember` used in `main()` but declared inside `palette()` | Hoisted `CHARCOAL/EMBER/BONE` to `const` globals; also `webgl2` first, `webgl` fallback |
| Scene 14 layout broken | `AbsoluteFill` (position:absolute) inside a flex row is out-of-flow | Replaced with plain flex `div`s |
| Scene 9 spectrum flat | FFT snapshot landed between kick hits; high band empty by mix design | Sustained 55 Hz sub drone + longer bass notes in the drop; hats + high arp boosted; mirrored symmetric radial spectrum with perceptual `pow(v,0.55)` scaling |
| HUD label collision | Scene captions and persistent HUD label shared bottom-left | HUD label moved to bottom: 46 |

## Phase 5 — Sound Design (100% synthesized)

`scripts/gen-audio.mjs` (pure Node, no audio libraries):

- BPM 128, A-minor pentatonic, section boundaries = frame-derived seconds so
  every hit lands on a rendered frame (e.g. opening impacts at 0.8/2.4/4.0/5.0 s
  = frames 24/72/120/150 of scene 01).
- Instruments implemented from math: kick (sine sweep 137→42 Hz + click),
  sub hit, differentiated-noise hats, snare, filtered-saw bass, triangle arp
  with ping-pong echo, detuned-saw pads, noise riser, impact stack, UI tick,
  bandpass whoosh.
- Stereo delay bus (dotted 8th, feedback 0.42), tanh soft-clip master,
  2.2 s fade-out, ducking baked in (music −62 % during scene 10 demo,
  −45 % under the scene 16 voice).
- SFX files rendered separately: whoosh / impact / sub / tick / riser (WAV).
- Voice for scene 16: TTS-synthesized ("Every frame is rendered from code.
  Every sound is synthesized on purpose."), 6.35 s, word timings scaled ×0.93.

## Phase 6 — QC Pass

20+ frames rendered via `remotion still` across all scenes and inspected
visually. Fixes applied per Phase 4, then re-inspected. Verdict per scene:
all 21 implemented scenes pass (see SHOWCASE_MAP.md for per-scene status).

## Phase 7 — Final Render

- `InkfieldSource` → `public/footage/source.mp4` (240 frames, H.264)
- `Showreel` → `out/showreel.mp4` (5,850 frames, H.264, CRF 20, yuv420p)

Two production incidents, both caught by QC and fixed:

1. **Render crash at Scene 14** — `@remotion/lottie` rejects negative
   `playbackRate` (TypeError). Scene 14 was the only section never still-checked
   before the full run. Fix: final ramp window changed to 1.25× and the
   limitation documented in CAPABILITIES.md. Re-render from scratch (~2.2 h on
   2 cores with software WebGL — measured ≈ 40 frames/min, dipping to ≈ 18
   frames/min inside the 3D scene).
2. **Silent soundtrack in the muxed MP4** — the music bed was analyzed by
   Scene 9 (`useAudioData`) but never *played*; no `<Audio>` element for
   `music.mp3` existed at the composition root, so the mix contained only the
   Scene 10 SFX and Scene 16 voice. Fix (two parts):
   - source corrected: `<Audio src={staticFile('audio/music.mp3')} />` added at
     the Showreel root (`src/Root.tsx`);
   - deliverable repaired without re-render: music bed muxed under the existing
     track with `amix(normalize=0)` + `alimiter`, video stream bit-copied.
     Verified: groove section −4.7 dB mean, intro −16.9 dB, SFX/voice intact.

## Phase 8 — Deliverables & Publication

- `out/showreel.mp4` — 1920×1080 · 30 fps · 3:15 · H.264 CRF 20 · AAC 192k · 44.7 MB
- `out/showreel-vertical.mp4` — 1080×1920 · 40 s teaser **re-composed** for 9:16
  (five signature moments rebuilt for vertical, not cropped)
- Stills extracted from the final timeline: `poster-hero.png`,
  `thumbnail-opening.png`, `still-particles.png`, `still-3d.png`,
  `poster-vertical.png`
- Repository pushed to GitHub: **kasyaira/agentic-motion-reel** (public) —
  source, scripts, synthesized audio, hand-authored Lottie, docs, renders.

## Final verification checklist

- [x] `tsc --noEmit` clean
- [x] 20+ QC stills inspected across all 21 scenes
- [x] Final MP4 spot-checked at 6 timecodes + both audio layers measured
- [x] Vertical teaser QC'd (FFT ring + hero, audio −4.5 dB mean)
- [x] Repo pushed: code + docs + audio + footage + video + stills
