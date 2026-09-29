import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Trail, CameraMotionBlur } from '@remotion/motion-blur';
import { COLORS, FONTS, SPRING } from '../tokens';

/**
 * 07 — MOTION BLUR & PHYSICS
 * Trail-based real motion blur on a ballistic bounce, a damped pendulum with
 * inertia, and camera motion blur on a fast pan. Springs, not linear tweens.
 */
export const S07PhysicsBlur: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Part A (0-110): bouncing ball with Trail
  // Part B (110-200): damped pendulum
  // Part C (200-240): camera motion blur pan across "VELOCITY"
  const part = frame < 112 ? 0 : frame < 208 ? 1 : 2;

  // Ball: x linear, y parabolic bounces (analytic physics, deterministic)
  const bx = interpolate(frame, [6, 104], [280, 1640], { extrapolateRight: 'clamp' });
  const period = 22;
  const bt = (frame - 6) / period;
  const bounce = Math.abs(Math.sin((bt * Math.PI) / 2));
  const decay = interpolate(bt, [0, 4.5], [1, 0.55], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const by = 760 - bounce * 520 * decay;

  // Pendulum: damped harmonic oscillator
  const pt = (frame - 118) / 30;
  const angle = Math.sin(pt * Math.PI * 2.2) * Math.exp(-pt * 0.9) * 0.85;
  const px = 960 + Math.sin(angle) * 420;
  const py = 200 + Math.cos(angle) * 420;

  // Camera pan
  const pan = interpolate(frame, [204, 240], [-560, 220], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (e) => e });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {part === 0 && (
        <AbsoluteFill>
          <Trail layers={7} lagInFrames={2} trailOpacity={0.32}>
            <div style={{ position: 'absolute', left: bx - 55, top: by - 55, width: 110, height: 110, borderRadius: 55, background: COLORS.accent }} />
          </Trail>
          <div style={{ position: 'absolute', left: 96, bottom: 90, fontFamily: FONTS.mono, fontSize: 24, color: COLORS.muted, letterSpacing: '0.18em' }}>
            TRAIL — 7 LAGGED LAYERS · ANALYTIC BALLISTICS
          </div>
        </AbsoluteFill>
      )}

      {part === 1 && (
        <AbsoluteFill>
          <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
            <line x1={960} y1={200} x2={px} y2={py} stroke="rgba(244,241,234,0.35)" strokeWidth={3} />
          </svg>
          <Trail layers={5} lagInFrames={2} trailOpacity={0.3}>
            <div style={{ position: 'absolute', left: px - 42, top: py - 42, width: 84, height: 84, borderRadius: 42, background: COLORS.ink }} />
          </Trail>
          <div style={{ position: 'absolute', left: 954, top: 186, width: 12, height: 12, borderRadius: 6, background: COLORS.muted }} />
          <div style={{ position: 'absolute', left: 96, bottom: 90, fontFamily: FONTS.mono, fontSize: 24, color: COLORS.muted, letterSpacing: '0.18em' }}>
            DAMPED HARMONIC OSCILLATOR — INERTIA IS VISIBLE
          </div>
        </AbsoluteFill>
      )}

      {part === 2 && (
        <AbsoluteFill style={{ justifyContent: 'center' }}>
          <CameraMotionBlur shutterAngle={200} samples={8}>
            <div style={{ transform: `translateX(${pan}px)`, display: 'flex', justifyContent: 'center' }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 260, color: COLORS.ink, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                VELO<span style={{ color: COLORS.accent }}>CITY</span>
              </div>
            </div>
          </CameraMotionBlur>
          <div style={{ position: 'absolute', left: 96, bottom: 90, fontFamily: FONTS.mono, fontSize: 24, color: COLORS.muted, letterSpacing: '0.18em' }}>
            CAMERA MOTION BLUR — SHUTTER 200°
          </div>
        </AbsoluteFill>
      )}

      {/* spring badge — proves springs everywhere */}
      <div
        style={{
          position: 'absolute', right: 96, top: 96,
          transform: `scale(${spring({ frame: frame - 8, fps, config: SPRING.punchy })})`,
          background: COLORS.bg2, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: '14px 22px',
          fontFamily: FONTS.mono, fontSize: 20, color: COLORS.ink, opacity: 0.9,
        }}
      >
        spring(stiffness=180)
      </div>
      <div style={{ position: 'absolute', width, height: 1, bottom: 170, background: COLORS.line, left: 0 }} />
    </AbsoluteFill>
  );
};
