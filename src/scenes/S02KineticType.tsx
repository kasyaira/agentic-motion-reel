import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, EASE, FONTS } from '../tokens';
import { SPRING } from '../tokens';

/**
 * 02 — KINETIC TYPOGRAPHY
 * Char-level spring stagger -> scramble decode -> line-mask reveals -> SVG path-following type.
 * Rhythm is deliberately bipolar: fast cuts, then a slow drift to prove the range.
 */
const SCRAMBLE = 'PRECISION';
const GLYPHS = '▮▯/\\|<>+*#%&';

const Scramble: React.FC<{ text: string; start: number }> = ({ text, start }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0) return null;
  const reveal = Math.floor(interpolate(t, [0, 45], [0, text.length], { extrapolateRight: 'clamp' }));
  const rnd = (i: number) => {
    const s = Math.sin((t * 7.13 + i * 91.7) * 12.9898) * 43758.5453;
    return GLYPHS[Math.floor((s - Math.floor(s)) * GLYPHS.length)];
  };
  return (
    <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 120, color: COLORS.ink, letterSpacing: '0.04em' }}>
      {text.split('').map((c, i) => (
        <span key={i} style={{ color: i < reveal ? COLORS.ink : COLORS.accent, opacity: i < reveal ? 1 : 0.85 }}>
          {i < reveal ? c : rnd(i)}
        </span>
      ))}
    </span>
  );
};

const MaskLine: React.FC<{ text: string; start: number; size?: number; color?: string }> = ({
  text, start, size = 92, color = COLORS.ink,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + 22], [100, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.outExpo });
  return (
    <div style={{ overflow: 'hidden', padding: '4px 0' }}>
      <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: size, lineHeight: 1.06, color, transform: `translateY(${p}%)` }}>
        {text}
      </div>
    </div>
  );
};

export const S02KineticType: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const word = 'MOTION';

  // A: char stagger (frames 0-80)
  const aOut = interpolate(frame, [72, 84], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // C: line reveals visible 92-190
  const cOut = interpolate(frame, [182, 194], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // D: path-following type 196-300
  const dIn = interpolate(frame, [196, 210], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const offset = interpolate(frame, [196, 300], [-420, 160], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin) });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
      {/* A — char stagger */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: aOut }}>
        <div style={{ display: 'flex' }}>
          {word.split('').map((c, i) => {
            const s = spring({ frame: frame - i * 4, fps, config: SPRING.punchy });
            const y = (1 - s) * 160;
            const rot = (1 - s) * (i % 2 === 0 ? 14 : -14);
            return (
              <span key={i} style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 210, color: i === 0 ? COLORS.accent : COLORS.ink, display: 'inline-block', transform: `translateY(${y}px) rotate(${rot}deg)`, opacity: s }}>
                {c}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* B — scramble decode */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: aOut === 0 ? (frame < 150 ? 1 : 0) : 0 }}>
        <Scramble text={SCRAMBLE} start={80} />
      </AbsoluteFill>

      {/* C — mask line reveals */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: cOut, transform: `translateX(-8%)` }}>
        <div>
          <MaskLine text="EVERY WORD" start={100} />
          <MaskLine text="WEIGHS EXACTLY" start={112} color={COLORS.accent} />
          <MaskLine text="WHAT IT SHOULD." start={124} />
        </div>
      </AbsoluteFill>

      {/* D — type on a path */}
      <AbsoluteFill style={{ opacity: dIn }}>
        <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <path id="wavePath" d="M -200 560 C 320 320, 640 800, 960 560 S 1600 320, 2120 560" fill="none" />
          </defs>
          <text fill={COLORS.ink} style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 128, letterSpacing: '0.08em' }}>
            <textPath href="#wavePath" startOffset={offset}>
              FOLLOW THE CURVE — FOLLOW THE CURVE
            </textPath>
          </text>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
