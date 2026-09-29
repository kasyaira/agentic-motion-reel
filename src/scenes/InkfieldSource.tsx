import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS } from '../tokens';
import { mulberry32 } from '../lib/rand';

/**
 * SOURCE FOOTAGE — "Inkfield"
 * A 8s procedural clip rendered separately and then used by Scene 18 as
 * REAL footage for speed/crop/grade/PiP compositing. Self-generated media:
 * fully licensed, fully deterministic.
 */
export const InkfieldSource: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const rnd = mulberry32(808);

  const blobs = Array.from({ length: 7 }, (_, i) => {
    const r = mulberry32(i * 77 + 1);
    return {
      cx: 0.2 + r() * 0.6,
      cy: 0.25 + r() * 0.5,
      r: 0.18 + r() * 0.3,
      hue: r() > 0.6 ? '255,74,31' : '244,241,234',
      sp: 0.3 + r() * 0.7,
      ph: r() * Math.PI * 2,
    };
  });

  const zoom = interpolate(frame, [0, 240], [1, 1.25]);
  const rot = t * 1.6;

  return (
    <AbsoluteFill style={{ backgroundColor: '#060607', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom}) rotate(${rot * 0.15}deg)` }}>
        {blobs.map((b, i) => {
          const x = (b.cx + Math.sin(t * b.sp + b.ph) * 0.08) * 100;
          const y = (b.cy + Math.cos(t * b.sp * 0.8 + b.ph) * 0.07) * 100;
          const r = b.r * 100;
          return (
            <AbsoluteFill
              key={i}
              style={{
                background: `radial-gradient(circle at ${x}% ${y}%, rgba(${b.hue},${0.16 + (i % 3) * 0.07}) 0%, rgba(${b.hue},0.05) ${r * 0.5}%, transparent ${r}%)`,
                filter: `blur(${28 + i * 6}px)`,
              }}
            />
          );
        })}
        <AbsoluteFill style={{ background: `radial-gradient(circle at ${50 + Math.sin(t * 0.5) * 8}% ${46 + Math.cos(t * 0.4) * 6}%, rgba(255,74,31,0.14) 0%, transparent 42%)`, filter: 'blur(60px)' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.8) 100%)' }} />
      <div style={{ position: 'absolute', left: 60, bottom: 44, fontFamily: 'JetBrainsMono', fontSize: 22, color: COLORS.muted, letterSpacing: '0.2em' }}>
        SOURCE FOOTAGE — INKFIELD / 8S / PROCEDURAL
      </div>
    </AbsoluteFill>
  );
};
