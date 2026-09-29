import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { evolvePath, getLength, getPointAtLength } from '@remotion/paths';
import { COLORS, FONTS } from '../tokens';
import { mulberry32 } from '../lib/rand';

/**
 * 03 — 2D MOTION GRAPHICS / VECTOR LAB
 * Pure SVG: trim-path evolution on a signature glyph, a procedural moiré fan,
 * and a mask-reveal stack. Zero raster assets — everything is vector math.
 */
const GLYPH_PATH = 'M 300 700 C 300 300 700 200 960 420 C 1220 640 1620 540 1620 240';

export const S03MotionGraphics: React.FC = () => {
  const frame = useCurrentFrame();
  const total = getLength(GLYPH_PATH);

  // 1) trim path 0-95
  const evo = interpolate(frame, [6, 88], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const evolved = evolvePath(evo, GLYPH_PATH);
  const headPt = getPointAtLength(GLYPH_PATH, total * evo);

  // 2) moiré fan 96-190
  const fanT = interpolate(frame, [96, 190], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fanOp = interpolate(frame, [96, 108], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * interpolate(frame, [180, 190], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 3) mask reveal stack 192-270
  const stackIn = interpolate(frame, [192, 206], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const phase1 = frame < 96;
  const phase2 = frame >= 96 && frame < 192;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* 1 — trim path */}
      <AbsoluteFill style={{ opacity: phase1 ? 1 : 0 }}>
        <svg viewBox="0 0 1920 1080">
          <path d={GLYPH_PATH} fill="none" stroke={COLORS.line} strokeWidth={2} />
          <path
            d={GLYPH_PATH} fill="none" stroke={COLORS.accent} strokeWidth={10} strokeLinecap="round"
            strokeDasharray={evolved.strokeDasharray} strokeDashoffset={evolved.strokeDashoffset}
          />
          {phase1 && (
            <circle cx={headPt!.x} cy={headPt!.y} r={16} fill={COLORS.ink} />
          )}
          <text x={100} y={960} fill={COLORS.muted} style={{ fontFamily: FONTS.mono, fontSize: 24, letterSpacing: '0.2em' }}>
            evolvePath() — {Math.round(total * evo)} / {Math.round(total)} px
          </text>
        </svg>
      </AbsoluteFill>

      {/* 2 — moiré fan (procedural pattern) */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: fanOp }}>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%">
          <g transform="translate(960, 540)">
            {Array.from({ length: 48 }, (_, i) => {
              const rot = i * (4 + Math.sin(fanT * Math.PI) * 2.2) - 90;
              const len = 320 + i * 12;
              return (
                <line key={i} x1={0} y1={0} x2={0} y2={-len} stroke={i % 6 === 0 ? COLORS.accent : COLORS.ink} strokeWidth={2.2} opacity={0.25 + (i / 48) * 0.6} transform={`rotate(${rot})`} />
              );
            })}
            <circle r={54} fill={COLORS.bg} stroke={COLORS.accent} strokeWidth={4} />
          </g>
          <text x={100} y={960} fill={COLORS.muted} style={{ fontFamily: FONTS.mono, fontSize: 24, letterSpacing: '0.2em' }}>
            PROCEDURAL PATTERN — 48 LINES, ONE PARAMETER
          </text>
        </svg>
      </AbsoluteFill>

      {/* 3 — mask reveal stack */}
      <AbsoluteFill style={{ justifyContent: 'center', opacity: stackIn }}>
        <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <clipPath id="wipeClip">
              <rect x={interpolate(frame, [192, 250], [-1920, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASEIO })} y={0} width={1920} height={1080} />
            </clipPath>
          </defs>
          <g clipPath="url(#wipeClip)">
            {Array.from({ length: 9 }, (_, i) => {
              const s = 90 + ((frame * 1.4 + i * 40) % 500);
              const o = interpolate(s, [90, 500], [0.85, 0], { extrapolateRight: 'clamp' });
              return <rect key={i} x={960 - s / 2} y={540 - s / 2} width={s} height={s} fill="none" stroke={i % 3 === 0 ? COLORS.accent : COLORS.ink} strokeWidth={2} opacity={o} transform={`rotate(${(frame + i * 8) % 360} 960 540)`} />;
            })}
          </g>
        </svg>
        <div style={{ position: 'absolute', right: 120, bottom: 140, textAlign: 'right' }}>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 64, color: COLORS.ink }}>SHAPE IS</div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 64, color: COLORS.accent }}>A TIMELINE TOO.</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const EASEIO = Easing.inOut(Easing.poly(5));
