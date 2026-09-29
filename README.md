# AGENTIC MOTION REEL — 2026

**One agent. One timeline. Limitless motion.**
A 3 min 15 s cinematic motion-design showreel rendered 100 % from code with
[Remotion](https://remotion.dev) — every frame, every sound, every caption.

> **EN** — This repository contains the complete production: source, timeline,
> synthesized soundtrack, documentation of every decision, and the final renders.
> **ID** — Repositori ini berisi produksi lengkap: source code, timeline, soundtrack
> hasil sintesis, dokumentasi seluruh proses, dan hasil render final.

---

## Final Output

| File | Spec |
|---|---|
| `download/showreel.mp4` | 1920×1080 · 30 fps · 5,850 frames · H.264 CRF 20 · 3:15 · stereo audio (music + SFX + voice) |
| `download/showreel-vertical.mp4` | 1080×1920 · 40 s teaser — five signature moments **re-composed** for 9:16 (not a crop) |
| `download/poster-hero.png` · `thumbnail-opening.png` · `still-particles.png` · `still-3d.png` · `poster-vertical.png` | stills pulled from the final timeline |
| `public/footage/source.mp4` | "Inkfield" — 8 s self-rendered source clip used by Scene 18 |

## Watch order / what each scene proves

See **[SHOWCASE_MAP.md](./SHOWCASE_MAP.md)** — timecode → capability →
technology → scene file, plus the full capability matrix.

## Quick start

```bash
npm install
npx remotion studio            # open the editor at :3000
npx remotion render Showreel out/showreel.mp4   # full render (then mux music, see worklog Phase 7)
node scripts/gen-audio.mjs     # regenerate soundtrack + SFX (deterministic)
```

> Rendering requires software WebGL: `Config.setChromiumOpenGlRenderer('swangle')`
> is already set in `remotion.config.ts` (GPU-less machines). On machines with a
> real GPU you may switch to `angle`.

## Repository map

```
src/
  Root.tsx            composition root — <Showreel> + <InkfieldSource> + <VerticalTeaser>
  sections.ts         the timeline: 21 sections, durations, HUD labels
  VerticalTeaser.tsx  9:16 teaser — re-composed moments, not a crop
  tokens.ts           design system (palette / fonts / easing / springs)
  font-data.ts        inlined base64 woff2 — deterministic font loading
  components/         grain, vignette, per-scene HUD
  lib/rand.ts         mulberry32 — seeded, reproducible randomness
  scenes/S01…S22      one file per capability
  scenes/InkfieldSource.tsx   procedural source footage
  shaders/            GLSL lives inside S13Shader.tsx
  data/captions.ts    word-level caption timings
scripts/
  gen-audio.mjs       the entire soundtrack, synthesized from oscillators
  fetch-fonts.mjs     font download (source of font-data.ts)
public/
  audio/              music.mp3 · voice.mp3 · sfx/*.wav
  lottie/eq-orbit.json   hand-authored Lottie (no external assets)
  footage/source.mp4  self-rendered footage for compositing demos
worklog.md            full production log — audit → render → fixes
CAPABILITIES.md       honest capability audit (implemented / demonstrated)
SHOWCASE_MAP.md       timecode map of the film
```

## Principles

1. **Show, don't explain.** Every scene demonstrates a technology by *using* it.
2. **Deterministic by construction.** All randomness is seeded (`mulberry32`);
   same seed → same film. Re-renders are reproducible.
3. **No templates, no stock.** Music, voice, footage, Lottie asset — all
   generated or hand-authored in this repository.
4. **Honest audit.** CAPABILITIES.md marks what is `[implemented]`,
   `[visually demonstrated]`, `[audited]`, or `[rendered successfully]` —
   and what was skipped, with reasons.

## Key decisions

- **30 fps** (fallback allowed by the brief): 5,850 frames is already the
  render budget ceiling for a 2-core CPU with software WebGL (swangle).
- **Scene 17 (MAPS) skipped**: map stacks require network tile downloads and
  would break the offline/deterministic render guarantee. Documented, not faked.
- **Rive skipped**: needs a proprietary editor to author `.riv` files. Lottie
  was kept with a hand-written JSON asset instead.
- **Audio is code.** No samples. BPM 128; section boundaries are frame-derived
  so hits land exactly on rendered frames; ducking is baked into the mix.
