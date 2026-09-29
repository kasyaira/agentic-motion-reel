/**
 * DESIGN SYSTEM — single source of truth for the showreel.
 * Palette: near-black charcoal, warm off-white ink, international orange accent.
 * Deliberately avoids "AI-startup" blue/purple gradients.
 */
export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const COLORS = {
  bg: '#0A0A0C',
  bg2: '#121214',
  ink: '#F4F1EA',
  accent: '#FF4A1F',
  accentDim: '#B33312',
  muted: '#7A756C',
  line: 'rgba(244,241,234,0.14)',
  panel: 'rgba(244,241,234,0.04)',
};

export const FONTS = {
  display: 'SpaceGrotesk',
  body: 'Inter',
  mono: 'JetBrainsMono',
};

/** Signature easing functions (Remotion interpolate() takes functions). */
export const EASE = {
  outExpo: (t: number): number => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutQuint: (t: number): number =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,
  outBack: (t: number): number =>
    1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
};

/** Standard spring presets (used with Remotion `spring()`) */
export const SPRING = {
  snappy: { damping: 200, mass: 0.6 },
  punchy: { damping: 12, stiffness: 180, mass: 0.8 },
  soft: { damping: 26, stiffness: 90, mass: 1 },
};

/** Grain/vignette and HUD are applied globally; scenes stay clean. */
export const GLOBAL = {
  grain: 0.05,
  vignette: 0.35,
};
