import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { evolvePath, getLength, getPointAtLength } from '@remotion/paths';
import { COLORS, EASE, FONTS } from '../tokens';

/**
 * 04 — DATA VISUALIZATION
 * Counters, bars, a drawing line chart and a donut — all SVG, all fictional data,
 * labeled as such. Motion is value-accurate: bars ease to their true proportions.
 */
const BARS = [
  { label: 'KINETIC TYPE', v: 0.82 },
  { label: 'PARTICLES', v: 0.95 },
  { label: '3D RENDER', v: 0.61 },
  { label: 'SHADERS', v: 0.74 },
  { label: 'AUDIO SYNC', v: 0.99 },
];
const LINE = 'M 0 190 C 90 150 150 60 260 84 S 430 190 540 120 S 720 10 840 44';
const LINE_LEN = getLength(LINE);

const Counter: React.FC<{ to: number; start: number; suffix?: string; size?: number }> = ({ to, start, suffix = '', size = 120 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.exp) });
  return (
    <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: size, color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>
      {Math.round(to * p).toLocaleString('en-US')}
      <span style={{ color: COLORS.accent }}>{suffix}</span>
    </span>
  );
};

export const S04DataViz: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drawP = interpolate(frame, [96, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const drawn = evolvePath(drawP, LINE);
  const tip = getPointAtLength(LINE, LINE_LEN * drawP);
  const donutP = interpolate(frame, [156, 208], [0, 0.72], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOutQuint });
  const R = 88;
  const CIRC = 2 * Math.PI * R;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, padding: '150px 96px 120px' }}>
      <div style={{ display: 'flex', gap: 70, height: '100%' }}>
        {/* left column — counters + bars */}
        <div style={{ width: 900, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 22, color: COLORS.muted, letterSpacing: '0.2em' }}>REEL TELEMETRY — FICTIONAL DATA, REAL MOTION</div>
          <div style={{ marginTop: 8 }}>
            <Counter to={5850} start={6} suffix=" FRAMES" />
          </div>
          <div style={{ display: 'flex', gap: 60 }}>
            <div>
              <Counter to={22} start={26} size={64} />
              <div style={{ fontFamily: FONTS.mono, fontSize: 19, color: COLORS.muted, letterSpacing: '0.16em' }}>SCENES</div>
            </div>
            <div>
              <Counter to={0} start={32} size={64} suffix="" />
              <div style={{ fontFamily: FONTS.mono, fontSize: 19, color: COLORS.muted, letterSpacing: '0.16em' }}>TEMPLATES USED</div>
            </div>
          </div>
          <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {BARS.map((b, i) => {
              const s = spring({ frame: frame - (44 + i * 7), fps, config: { damping: 200, mass: 0.5 } });
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
                  <div style={{ width: 200, fontFamily: FONTS.mono, fontSize: 19, color: COLORS.muted, letterSpacing: '0.1em' }}>{b.label}</div>
                  <div style={{ flex: 1, height: 26, backgroundColor: COLORS.panel, position: 'relative' }}>
                    <div style={{ width: `${b.v * 100 * s}%`, height: '100%', background: i === 4 ? COLORS.accent : COLORS.ink }} />
                  </div>
                  <div style={{ width: 74, fontFamily: FONTS.mono, fontSize: 20, color: COLORS.ink, textAlign: 'right' }}>{Math.round(b.v * 100 * s)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* right column — line chart + donut */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 40, alignItems: 'center' }}>
          <svg viewBox="0 0 840 240" width="860" height="246">
            {[40, 100, 160, 220].map((y) => (
              <line key={y} x1={0} y1={y} x2={840} y2={y} stroke={COLORS.line} strokeWidth={1} />
            ))}
            <path
              d={LINE} fill="none" stroke={COLORS.accent} strokeWidth={6} strokeLinecap="round"
              strokeDasharray={drawn.strokeDasharray} strokeDashoffset={drawn.strokeDashoffset}
            />
            <circle cx={tip!.x} cy={tip!.y} r={9} fill={COLORS.ink} />
          </svg>
          <div style={{ display: 'flex', alignItems: 'center', gap: 44 }}>
            <svg width={240} height={240} viewBox="0 0 240 240">
              <circle cx={120} cy={120} r={R} fill="none" stroke={COLORS.panel} strokeWidth={20} />
              <circle
                cx={120} cy={120} r={R} fill="none" stroke={COLORS.ink} strokeWidth={20} strokeLinecap="round"
                strokeDasharray={`${CIRC * donutP} ${CIRC}`} transform="rotate(-90 120 120)"
              />
              <text x={120} y={132} textAnchor="middle" fill={COLORS.ink} style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 44 }}>
                {Math.round(donutP * 100)}%
              </text>
            </svg>
            <div style={{ fontFamily: FONTS.mono, fontSize: 20, color: COLORS.muted, letterSpacing: '0.14em', lineHeight: 2 }}>
              FRAME BUDGET<br />
              <span style={{ color: COLORS.ink }}>SPENT ON MOTION — 72%</span><br />
              <span style={{ color: COLORS.accent }}>WASTED — 0%</span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
