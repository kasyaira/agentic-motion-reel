import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, FONTS } from '../tokens';

/**
 * 22 — FINAL HERO SHOT
 * The mark breathes. Two lines settle. Everything goes quiet by design,
 * then a single sub-hit and the film burns out to black.
 */
export const S22Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const breathe = 1 + Math.sin((frame / 30) * Math.PI * 2 * 0.5) * 0.06;

  const markIn = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.exp) });
  const l1 = interpolate(frame, [48, 78], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.exp) });
  const l2 = interpolate(frame, [72, 102], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.exp) });
  const sub = interpolate(frame, [116, 140], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const hit = frame === 132;
  const hitScale = hit ? 1.35 : interpolate(frame, [132, 146], [1.35, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.exp) });
  const burnOut = interpolate(frame, [262, 300], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const flicker = frame > 262 ? 0.9 + Math.sin(frame * 2.7) * 0.1 : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', opacity: burnOut * flicker }}>
      <div style={{ transform: `scale(${breathe * hitScale})`, opacity: markIn, marginTop: -40 }}>
        <div style={{ width: 120, height: 120, background: COLORS.accent, borderRadius: 20, transform: 'rotate(45deg)', boxShadow: '0 0 120px rgba(255,74,31,0.5)' }} />
      </div>

      <div style={{ marginTop: 90, textAlign: 'center' }}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 110, color: COLORS.ink, letterSpacing: '0.01em', opacity: l1, transform: `translateY(${(1 - l1) * 30}px)` }}>
          BUILT WITH <span style={{ color: COLORS.accent }}>CODE.</span>
        </div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 110, color: COLORS.ink, letterSpacing: '0.01em', opacity: l2, transform: `translateY(${(1 - l2) * 30}px)` }}>
          DIRECTED BY <span style={{ color: COLORS.accent }}>INTENT.</span>
        </div>
        <div style={{ marginTop: 46, fontFamily: FONTS.mono, fontSize: 21, color: COLORS.muted, letterSpacing: '0.3em', opacity: sub }}>
          SUPER Z · AGENTIC MOTION REEL · 2026
        </div>
      </div>
    </AbsoluteFill>
  );
};
