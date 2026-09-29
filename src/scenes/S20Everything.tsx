import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../tokens';
import { mulberry32 } from '../lib/rand';

/**
 * 20 — EVERYTHING TOGETHER
 * The composite: procedural particle ring + counter + kinetic type + a rough
 * annotation, staged with a strict hierarchy — type leads, systems support.
 */
export const S20Everything: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const push = interpolate(frame, [0, 300], [1, 1.16], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const line1 = spring({ frame: frame - 10, fps, config: { damping: 200, mass: 0.6 } });
  const line2 = spring({ frame: frame - 34, fps, config: { damping: 200, mass: 0.6 } });
  const ringIn = interpolate(frame, [4, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const counterP = interpolate(frame, [60, 130], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.exp) });
  const circleP = interpolate(frame, [180, 215], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const outro = interpolate(frame, [272, 300], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // particle ring — 160 deterministic dots orbiting
  const rnd = mulberry32(2020);
  const dots = React.useMemo(
    () =>
      Array.from({ length: 160 }, (_, i) => {
        const rr = mulberry32(i * 13 + 3);
        return { a0: rr() * Math.PI * 2, r: 300 + rr() * 90, s: 0.14 + rr() * 0.5, size: 1.5 + rr() * 2.5, accent: rr() > 0.85 };
      }),
    []
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', opacity: outro }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        {/* supporting layer — particle ring */}
        <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, opacity: ringIn * 0.9 }}>
          {dots.map((d, i) => {
            const a = d.a0 + t * d.s;
            const x = 960 + Math.cos(a) * d.r;
            const y = 540 + Math.sin(a) * d.r * 0.55;
            return <circle key={i} cx={x} cy={y} r={d.size} fill={d.accent ? COLORS.accent : COLORS.ink} opacity={0.5 + (i % 4) * 0.12} />;
          })}
          {/* spectrum echo arc */}
          {Array.from({ length: 72 }, (_, i) => {
            const v = 0.3 + 0.7 * Math.abs(Math.sin(t * 3.1 + i * 0.55) * Math.sin(i * 0.23));
            const a = (i / 72) * Math.PI * 2 - Math.PI / 2;
            const r1 = 430, r2 = 430 + v * 70;
            return (
              <line
                key={`s${i}`}
                x1={960 + Math.cos(a) * r1} y1={540 + Math.sin(a) * r1 * 0.9}
                x2={960 + Math.cos(a) * r2} y2={540 + Math.sin(a) * r2 * 0.9}
                stroke={i % 9 === 0 ? COLORS.accent : COLORS.ink}
                strokeWidth={3} opacity={0.35 + v * 0.4}
              />
            );
          })}
        </svg>

        {/* stat layer */}
        <div style={{ position: 'absolute', left: 110, bottom: 130, fontFamily: FONTS.mono, fontSize: 22, color: COLORS.muted, letterSpacing: '0.14em', lineHeight: 2 }}>
          <span style={{ color: COLORS.ink, fontFamily: FONTS.display, fontWeight: 700, fontSize: 54 }}>
            {Math.round(counterP * 5850).toLocaleString('en-US')}
          </span>
          <span style={{ color: COLORS.accent }}> FRAMES</span><br />
          <span style={{ color: COLORS.ink, fontFamily: FONTS.display, fontWeight: 700, fontSize: 54 }}>
            {Math.round(counterP * 96)}
          </span>
          <span style={{ color: COLORS.accent }}> AUDIO EVENTS</span><br />
          <span style={{ color: COLORS.ink, fontFamily: FONTS.display, fontWeight: 700, fontSize: 54 }}>0</span>
          <span style={{ color: COLORS.accent }}> TEMPLATES</span>
        </div>

        {/* lead layer — kinetic type */}
        <div style={{ position: 'absolute', width: '100%', top: 380, textAlign: 'center' }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 128, color: COLORS.ink, letterSpacing: '-0.01em', transform: `translateY(${(1 - line1) * 110}%)` }}>
              EVERY SYSTEM.
            </div>
          </div>
          <div style={{ overflow: 'hidden', marginTop: 6 }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 128, color: COLORS.accent, letterSpacing: '-0.01em', transform: `translateY(${(1 - line2) * 110}%)` }}>
              <span style={{ display: 'inline-block', position: 'relative' }}>
                ONE TIMELINE.
                <svg viewBox="0 0 760 120" style={{ position: 'absolute', left: -24, bottom: -38, width: 'calc(100% + 48px)', height: 120 }}>
                  <ellipse
                    cx={380} cy={60} rx={350} ry={46}
                    fill="none" stroke={COLORS.ink} strokeWidth={4}
                    pathLength={100}
                    strokeDasharray={`${(circleP * 100).toFixed(1)} 100`}
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
