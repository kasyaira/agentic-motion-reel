import { AbsoluteFill } from 'remotion';
import { COLORS, GLOBAL } from '../tokens';
import { FONT_DATA } from '../font-data';

/** @font-face with inlined base64 woff2 — zero network at render time. */
const face = (fam: string, weight: number, key: string) => `
  @font-face {
    font-family: '${fam}';
    src: url(${FONT_DATA[key]}) format('woff2');
    font-weight: ${weight};
  }`;

export const GlobalStyles: React.FC = () => (
  <style>{`
    ${face('SpaceGrotesk', 400, 'SpaceGrotesk_400')}
    ${face('SpaceGrotesk', 500, 'SpaceGrotesk_500')}
    ${face('SpaceGrotesk', 700, 'SpaceGrotesk_700')}
    ${face('Inter', 400, 'Inter_400')}
    ${face('Inter', 600, 'Inter_600')}
    ${face('Inter', 800, 'Inter_800')}
    ${face('JetBrainsMono', 400, 'JetBrainsMono_400')}
    ${face('JetBrainsMono', 700, 'JetBrainsMono_700')}
  `}</style>
);

/** Fine film grain via deterministic noise — cheap SVG turbulence, no images. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = GLOBAL.grain }) => (
  <svg
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      opacity,
      mixBlendMode: 'overlay',
      pointerEvents: 'none',
    }}
  >
    <filter id="grainF">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grainF)" />
  </svg>
);

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background:
        'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
    }}
  />
);

/** Subtle safe-frame guides used on a few scenes for the "studio" look. */
export const FrameLines: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', opacity }}>
    <div style={{ position: 'absolute', top: 64, left: 96, right: 96, height: 1, background: COLORS.line }} />
    <div style={{ position: 'absolute', bottom: 64, left: 96, right: 96, height: 1, background: COLORS.line }} />
  </AbsoluteFill>
);
