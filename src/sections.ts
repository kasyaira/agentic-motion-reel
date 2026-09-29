import type { FC } from 'react';
import { S01Opening } from './scenes/S01Opening';
import { S02KineticType } from './scenes/S02KineticType';
import { S03MotionGraphics } from './scenes/S03MotionGraphics';
import { S04DataViz } from './scenes/S04DataViz';
import { S05UIMotion } from './scenes/S05UIMotion';
import { S06TransitionLab } from './scenes/S06TransitionLab';
import { S07PhysicsBlur } from './scenes/S07PhysicsBlur';
import { S08Particles } from './scenes/S08Particles';
import { S09AudioReactive } from './scenes/S09AudioReactive';
import { S10SoundDesign } from './scenes/S10SoundDesign';
import { S11ThreeD } from './scenes/S11ThreeD';
import { S12PostVFX } from './scenes/S12PostVFX';
import { S13Shader } from './scenes/S13Shader';
import { S14Lottie } from './scenes/S14Lottie';
import { S15Rough } from './scenes/S15Rough';
import { S16Captions } from './scenes/S16Captions';
import { S18MediaCompositing } from './scenes/S18MediaCompositing';
import { S19CodeViz } from './scenes/S19CodeViz';
import { S20Everything } from './scenes/S20Everything';
import { S21CapabilityMatrix } from './scenes/S21CapabilityMatrix';
import { S22Hero } from './scenes/S22Hero';

export type Section = {
  id: string;
  title: string;
  tech: string;
  dur: number;
  C: FC<any>;
  hud?: boolean;
};

/** The single source of truth for the film's timeline. Durations in frames @30fps. */
export const SECTIONS: Section[] = [
  { id: '01', title: 'OPENING', tech: 'KINETIC TYPE · BEAT IMPACTS', dur: 300, C: S01Opening, hud: false },
  { id: '02', title: 'KINETIC TYPOGRAPHY', tech: 'CHAR STAGGER · SCRAMBLE · TEXT-ON-PATH', dur: 300, C: S02KineticType },
  { id: '03', title: '2D MOTION GRAPHICS', tech: 'SVG · TRIM PATH · PROCEDURAL PATTERN', dur: 270, C: S03MotionGraphics },
  { id: '04', title: 'DATA VISUALIZATION', tech: 'SPRING BARS · COUNTERS · DONUT', dur: 270, C: S04DataViz },
  { id: '05', title: 'UI / PRODUCT MOTION', tech: 'MODALS · MICRO-INTERACTIONS · CURSOR', dur: 270, C: S05UIMotion },
  { id: '06', title: 'TRANSITION LAB', tech: '8 OFFICIAL PRESENTATIONS', dur: 300, C: S06TransitionLab },
  { id: '07', title: 'MOTION BLUR & PHYSICS', tech: 'TRAIL · CAMERA BLUR · DAMPED SPRINGS', dur: 240, C: S07PhysicsBlur },
  { id: '08', title: 'PARTICLES', tech: 'NOISE FLOW FIELD · TEXT CONVERGENCE', dur: 300, C: S08Particles },
  { id: '09', title: 'AUDIO REACTIVE', tech: 'REAL FFT VIA visualizeAudio()', dur: 300, C: S09AudioReactive },
  { id: '10', title: 'SOUND DESIGN', tech: 'SYNTHESIZED SFX · LANE ANATOMY', dur: 240, C: S10SoundDesign },
  { id: '11', title: '3D', tech: 'R3F · CHROME · GLASS · INSTANCING', dur: 360, C: S11ThreeD },
  { id: '12', title: 'POST PROCESSING', tech: '6 ISOLATED PASSES → COMBINED', dur: 300, C: S12PostVFX },
  { id: '13', title: 'SHADER / GENERATIVE', tech: 'RAW WEBGL · FBM · TUNNEL', dur: 300, C: S13Shader },
  { id: '14', title: 'LOTTIE IMPORT', tech: 'HAND-AUTHORED JSON · SPEED RAMP', dur: 240, C: S14Lottie },
  { id: '15', title: 'ROUGH ANNOTATION', tech: 'rough-notation · SEEDED STROKES', dur: 240, C: S15Rough },
  { id: '16', title: 'CAPTIONS', tech: 'WORD-LEVEL · SYNTH VOICE', dur: 240, C: S16Captions },
  // 17 — MAPS: intentionally skipped (see CAPABILITIES.md § Limitations)
  { id: '18', title: 'MEDIA COMPOSITING', tech: 'SPEED · CROP · GRADE · PiP', dur: 270, C: S18MediaCompositing },
  { id: '19', title: 'CODE VISUALIZATION', tech: 'TYPING EDITOR · CLI · NODE GRAPH', dur: 270, C: S19CodeViz },
  { id: '20', title: 'EVERYTHING TOGETHER', tech: 'LAYERED COMPOSITE · STRICT HIERARCHY', dur: 300, C: S20Everything },
  { id: '21', title: 'CAPABILITY MATRIX', tech: '16 TILES · BEAT FLIPS', dur: 240, C: S21CapabilityMatrix },
  { id: '22', title: 'FINAL HERO', tech: 'BREATHING MARK · BURN-OUT', dur: 300, C: S22Hero, hud: false },
];

export const TOTAL_FRAMES = SECTIONS.reduce((a, s) => a + s.dur, 0);
