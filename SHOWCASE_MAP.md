# SHOWCASE MAP — timecode → capability → technology → scene

Film: `out/showreel.mp4` · 3:15 · 1920×1080 · 30 fps · 5,850 frames.
"Abs" = absolute composition frame (frame = seconds × 30).

| TC | Abs frames | Scene | Capability demonstrated | Technology (files) |
|---|---|---|---|---|
| 0:00 | 0–300 | 01 OPENING | Hook, beat impacts | punch type, camera punch, particle burst — `S01Opening.tsx` |
| 0:10 | 300–600 | 02 KINETIC TYPE | Type choreography | spring stagger, scramble, mask lines, `<textPath>` — `S02KineticType.tsx` |
| 0:20 | 600–870 | 03 2D MOTION GRAPHICS | Vector lab | `evolvePath` trim, procedural fan, mask stack — `S03MotionGraphics.tsx` |
| 0:29 | 870–1140 | 04 DATA VIZ | Charts & counters | spring bars, expo counters, donut, dash-draw line — `S04DataViz.tsx` |
| 0:38 | 1140–1410 | 05 UI MOTION | Product surface | springs, modal, toggle, toast, cursor+ripple — `S05UIMotion.tsx` |
| 0:47 | 1410–1710 | 06 TRANSITION LAB | 8 official transitions | `@remotion/transitions` fade/slide/wipe/flip/clock-wipe/iris/film-burn/crosswarp — `S06TransitionLab.tsx` |
| 0:57 | 1710–1950 | 07 PHYSICS + BLUR | Velocity & inertia | `Trail`, ballistics, damped oscillator, `CameraMotionBlur` — `S07PhysicsBlur.tsx` |
| 1:05 | 1950–2250 | 08 PARTICLES | Procedural systems | noise flow field (650), text convergence (900) — `S08Particles.tsx` |
| 1:15 | 2250–2550 | 09 AUDIO REACTIVE | Real FFT | `visualizeAudio()` mirrored radial — `S09AudioReactive.tsx` |
| 1:25 | 2550–2790 | 10 SOUND DESIGN | Audio anatomy | 6 lanes, playhead, frame-exact SFX — `S10SoundDesign.tsx` |
| 1:33 | 2790–3150 | 11 3D | R3F scene | chrome, glass transmission, instancing, shadows, PMREM rig — `S11ThreeD.tsx` |
| 1:45 | 3150–3450 | 12 POST VFX | Compositing passes | bloom, grain, RGB split, scanlines, glitch, combo — `S12PostVFX.tsx` |
| 1:55 | 3450–3750 | 13 SHADER | GLSL generative | FBM domain warp + polar tunnel, raw WebGL — `S13Shader.tsx` |
| 2:05 | 3750–3990 | 14 LOTTIE | Asset import + retiming | hand-authored JSON, speed ramp incl. reverse — `S14Lottie.tsx` |
| 2:13 | 3990–4230 | 15 ROUGH | Hand-drawn annotation | rough-notation ×5 types, seeded strokes — `S15Rough.tsx` |
| 2:21 | 4230–4470 | 16 CAPTIONS | Voice + word highlights | TTS voice, spring-timed word captions — `S16Captions.tsx` |
| — | — | 17 MAPS | *skipped* | see CAPABILITIES.md |
| 2:29 | 4470–4740 | 18 MEDIA COMP | Footage ops | rate ramps, ken-burns, duotone grade, PiP — `S18MediaCompositing.tsx` + `public/footage/source.mp4` |
| 2:38 | 4740–5010 | 19 CODE VIZ | Developer optics | typing editor, CLI, node graph — `S19CodeViz.tsx` |
| 2:47 | 5010–5310 | 20 EVERYTHING | Composite climax | particles + spectrum + counters + type — `S20Everything.tsx` |
| 2:57 | 5310–5550 | 21 MATRIX | Recap choreography | 16 beat-flipped tiles — `S21CapabilityMatrix.tsx` |
| 3:05 | 5550–5850 | 22 HERO | Signature close | breathing mark, burn-out — `S22Hero.tsx` |

## Audio map (music bed, BPM 128)

| TC | Section | Music state |
|---|---|---|
| 0:00–0:10 | Intro | impacts @ 0.8/2.4/4.0/5.0 s, sub, riser into groove |
| 0:10–0:29 | Groove-lite | kick 4/4, bass 8ths, sparse arp |
| 0:29–0:47 | Full groove | + snare backbeat, 16th hats, pad cycle Am–F–C–G |
| 0:47–0:57 | Transition lab | ticks on every cut (44-frame grid) |
| 0:57–1:05 | Physics | syncopated arp variation |
| 1:05–1:15 | Particles | octave-up arp, open hats, riser |
| 1:15–1:25 | **Drop** | 41 Hz subs, sustained drone, bright hats + high arp (FFT food) |
| 1:25–1:33 | Sound design | music ducked −62 %, scene plays its own SFX |
| 1:33–1:45 | 3D | halftime, wide pads |
| 1:45–2:05 | VFX/shader | glitch ticks, filtered arp |
| 2:05–2:21 | Lottie/rough/captions | light beds; voice 2:21–2:27 (music −45 %) |
| 2:29–2:47 | Media/code | groove returns |
| 2:47–2:57 | Everything | peak drop |
| 2:57–3:05 | Matrix | halftime heavy |
| 3:05–3:15 | Hero | pads, final sub-hit @ 3:09.4, 2.2 s fade-out |
