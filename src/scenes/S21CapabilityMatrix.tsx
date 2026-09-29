import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../tokens';

/**
 * 21 — CAPABILITY MATRIX
 * Sixteen tiles, one per demonstrated capability, flipping in on the beat.
 * Not a recap slide — a checklist rendered as choreography.
 */
const CAPS = [
  'KINETIC TYPE', '2D VECTOR', 'DATA VIZ', 'UI MOTION',
  'TRANSITIONS', 'PHYSICS + BLUR', 'PARTICLES', 'AUDIO REACTIVE',
  'SOUND DESIGN', '3D / R3F', 'POST VFX', 'GLSL SHADERS',
  'LOTTIE', 'ROUGH SKETCH', 'CAPTIONS', 'MEDIA COMP',
];

export const S21CapabilityMatrix: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const finalPulse = spring({ frame: frame - 176, fps, config: { damping: 14, stiffness: 160, mass: 0.8 } });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'absolute', top: 120, fontFamily: FONTS.mono, fontSize: 22, color: COLORS.muted, letterSpacing: '0.24em' }}>
        WHAT ONE AGENT DIRECTED
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 380px)',
          gridTemplateRows: 'repeat(4, 150px)',
          gap: 18,
          transform: `scale(${1 + finalPulse * 0.015})`,
        }}
      >
        {CAPS.map((cap, i) => {
          const beat = Math.floor(i / 4) * 11 + (i % 4) * 4;
          const s = spring({ frame: frame - beat, fps, config: { damping: 16, stiffness: 190, mass: 0.75 } });
          const rot = (1 - s) * 70;
          return (
            <div
              key={i}
              style={{
                background: COLORS.bg2,
                border: `1px solid ${i === 8 ? COLORS.accent : COLORS.line}`,
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px 24px',
                opacity: s,
                transform: `perspective(900px) rotateX(${rot}deg)`,
                boxShadow: i === 8 ? '0 0 40px rgba(255,74,31,0.25) inset' : 'none',
              }}
            >
              <div style={{ fontFamily: FONTS.mono, fontSize: 18, color: i === 8 ? COLORS.accent : COLORS.muted }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 30, color: i === 8 ? COLORS.accent : COLORS.ink, letterSpacing: '0.02em' }}>
                {cap}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', bottom: 110, fontFamily: FONTS.mono, fontSize: 20, color: COLORS.muted, letterSpacing: '0.18em' }}>
        EACH TILE = A SCENE YOU JUST WATCHED
      </div>
    </AbsoluteFill>
  );
};
