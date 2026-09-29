import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASE, FONTS } from '../tokens';

/**
 * SceneHud — unified per-scene label: index, capability title, tech tags.
 * Appears at scene start (first ~90 frames), then fades to a minimal corner mark.
 */
export const SceneHud: React.FC<{
  index: string;
  title: string;
  tech: string;
}> = ({ index, title, tech }) => {
  const frame = useCurrentFrame();
  const inA = interpolate(frame, [4, 26], [0, 1], {
    extrapolateRight: 'clamp',
    easing: EASE.outExpo,
  });
  const slide = interpolate(frame, [4, 30], [24, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });
  const out = interpolate(frame, [80, 108], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(inA, out);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 88,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 24,
          opacity,
          transform: `translateY(${slide}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 26,
            color: COLORS.accent,
            fontWeight: 700,
            letterSpacing: '0.1em',
            paddingTop: 6,
          }}
        >
          {index}
        </div>
        <div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontWeight: 700,
              fontSize: 40,
              letterSpacing: '0.02em',
              color: COLORS.ink,
              lineHeight: 1,
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 12,
              fontFamily: FONTS.mono,
              fontSize: 19,
              color: COLORS.muted,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            {tech}
          </div>
        </div>
      </div>
      {/* persistent corner mark */}
      <div
        style={{
          position: 'absolute',
          right: 96,
          top: 88,
          fontFamily: FONTS.mono,
          fontSize: 20,
          color: COLORS.muted,
          opacity: 0.7,
          letterSpacing: '0.12em',
        }}
      >
        {index} / 22
      </div>
      <div
        style={{
          position: 'absolute',
          left: 96,
          bottom: 46,
          fontFamily: FONTS.mono,
          fontSize: 18,
          color: COLORS.muted,
          opacity: 0.55,
          letterSpacing: '0.2em',
        }}
      >
        AGENTIC MOTION REEL — 2026
      </div>
    </AbsoluteFill>
  );
};
