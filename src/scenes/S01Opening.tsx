import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASE, FONTS } from '../tokens';
import { mulberry32 } from '../lib/rand';

/**
 * 01 — OPENING / HOOK
 * Beat-driven kinetic type. Three hard impacts on the music, then the agent mark
 * ignites with a radial particle burst and the reel title assembles.
 */
const IMPACTS = [24, 72, 120];
const LINES = ['ONE AGENT.', 'ONE TIMELINE.', 'LIMITLESS MOTION.'];

const ParticleBurst: React.FC = () => {
  const frame = useCurrentFrame();
  const rnd = mulberry32(42);
  const parts = Array.from({ length: 140 }, () => ({
    a: rnd() * Math.PI * 2,
    d: 120 + rnd() * 900,
    s: 2 + rnd() * 5,
    o: 0.4 + rnd() * 0.6,
    delay: Math.floor(rnd() * 10),
  }));
  const t = Math.max(0, frame - 150 - 4);
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
      {parts.map((p, i) => {
        const pr = interpolate(t - p.delay, [0, 55], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
        const fade = interpolate(t - p.delay, [30, 62], [p.o, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const x = 960 + Math.cos(p.a) * p.d * pr;
        const y = 540 + Math.sin(p.a) * p.d * pr * 0.62;
        return <rect key={i} x={x} y={y} width={p.s} height={p.s} fill={i % 5 === 0 ? COLORS.accent : COLORS.ink} opacity={fade} />;
      })}
    </svg>
  );
};

const PunchWord: React.FC<{ text: string; impact: number; size: number }> = ({ text, impact, size }) => {
  const frame = useCurrentFrame();
  const p = frame - impact;
  const scale = p < 0 ? 2.4 : interpolate(p, [0, 14], [1.35, 1], { easing: Easing.out(Easing.exp), extrapolateRight: 'clamp' });
  const blur = p < 0 ? 18 : interpolate(p, [0, 10], [12, 0], { extrapolateRight: 'clamp' });
  const op = p < 0 ? 0 : interpolate(p, [0, 5], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{ transform: `scale(${scale})`, filter: `blur(${blur}px)`, opacity: op }}>
      <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: size, letterSpacing: '-0.02em', color: COLORS.ink }}>
        {text}
      </span>
    </div>
  );
};

export const S01Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const markIn = interpolate(frame, [150, 172], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.exp) });
  const markScale = frame < 150 ? 0.2 : interpolate(frame, [150, 178], [0.2, 1], { easing: Easing.out(Easing.back(1.70158)), extrapolateRight: 'clamp' });
  const breathe = 1 + Math.sin((frame / FPS) * Math.PI * 2) * 0.012;
  const titleIn = interpolate(frame, [186, 220], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.outExpo });
  const titleY = interpolate(frame, [186, 226], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.outExpo });
  const cam = 1 + IMPACTS.reduce((acc, im) => {
    const d = frame - im;
    return acc + (d >= 0 && d < 16 ? Math.cos((d / 16) * Math.PI) * 0.045 : 0);
  }, 0);
  const fadeOut = interpolate(frame, [288, 300], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', opacity: fadeOut }}>
      <AbsoluteFill style={{ transform: `scale(${cam * breathe})` }}>
        <ParticleBurst />
        <div style={{ position: 'absolute', top: 170, width: '100%', textAlign: 'center' }}>
          {LINES.map((l, i) => (
            <div key={i} style={{ height: 96 }}>
              <PunchWord text={l} impact={IMPACTS[i]} size={86} />
            </div>
          ))}
        </div>
        {/* agent mark */}
        <div style={{ position: 'absolute', top: 560, left: 960 - 56, transform: `scale(${markScale * markIn})`, opacity: markIn }}>
          <div style={{ width: 112, height: 112, backgroundColor: COLORS.accent, borderRadius: 18, transform: 'rotate(45deg)' }} />
        </div>
        <div style={{ position: 'absolute', top: 740, width: '100%', textAlign: 'center', opacity: titleIn, transform: `translateY(${titleY}px)` }}>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 44, letterSpacing: '0.32em', color: COLORS.ink }}>
            AGENTIC MOTION REEL
          </div>
          <div style={{ marginTop: 18, fontFamily: FONTS.mono, fontSize: 21, letterSpacing: '0.3em', color: COLORS.muted }}>
            RENDERED FROM CODE — FRAME BY FRAME
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const FPS = 30;
