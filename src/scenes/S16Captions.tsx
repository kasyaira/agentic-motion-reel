import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { CAPTION_LINE } from '../data/captions';
import { COLORS, FONTS } from '../tokens';

/**
 * 16 — CAPTIONS / KINETIC SUBTITLES
 * Narration (synthesized voice) with word-level highlight captions.
 * The active word pops with a spring; completed words settle to muted;
 * upcoming words stay ghosted. A progress rail mirrors the timing.
 */
export const S16Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const activeIdx = CAPTION_LINE.findIndex((c) => frame >= c.start && frame < c.end);

  const line1 = CAPTION_LINE.slice(0, 6);
  const line2 = CAPTION_LINE.slice(6);

  const renderWord = (c: (typeof CAPTION_LINE)[number], gi: number) => {
    const isActive = gi === activeIdx;
    const done = frame >= c.end;
    const s = spring({ frame: frame - c.start, fps, config: { damping: 14, stiffness: 200, mass: 0.7 } });
    const pop = isActive ? 1 + Math.sin(Math.min(1, (frame - c.start) / 6) * Math.PI) * 0.12 : 1;
    const opacity = done ? 0.42 : frame >= c.start ? 1 : 0.16;
    const color = isActive ? COLORS.accent : COLORS.ink;
    return (
      <span
        key={gi}
        style={{
          display: 'inline-block',
          fontFamily: FONTS.display,
          fontWeight: 700,
          fontSize: isActive ? 96 : 88,
          color,
          opacity,
          transform: `scale(${(isActive ? s * pop : 1).toFixed(3)})`,
          marginRight: 26,
          filter: isActive ? 'drop-shadow(0 0 26px rgba(255,74,31,0.45))' : 'none',
        }}
      >
        {c.w}
      </span>
    );
  };

  const total = CAPTION_LINE[CAPTION_LINE.length - 1].end;
  const railP = interpolate(frame, [0, total], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
      <Audio src={staticFile('audio/voice.mp3')} />

      {/* soft spotlight */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(255,74,31,0.10) 0%, transparent 55%)' }} />

      <div style={{ width: 1500, textAlign: 'center' }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 20, color: COLORS.muted, letterSpacing: '0.24em', marginBottom: 40 }}>
          WORD-LEVEL CAPTIONS — SPRING-TIMED
        </div>
        <div style={{ lineHeight: 1.35 }}>{line1.map((c, i) => renderWord(c, i))}</div>
        <div style={{ lineHeight: 1.35, marginTop: 8 }}>{line2.map((c, i) => renderWord(c, i + 6))}</div>

        {/* progress rail */}
        <div style={{ margin: '70px auto 0', width: 760, height: 4, background: COLORS.panel, borderRadius: 2 }}>
          <div style={{ width: `${railP * 100}%`, height: '100%', background: COLORS.accent, borderRadius: 2, boxShadow: '0 0 14px rgba(255,74,31,0.6)' }} />
        </div>
      </div>

      {/* waveform echo strip — synthesized narration envelope, decorative-but-true */}
      <div style={{ position: 'absolute', bottom: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5, alignItems: 'flex-end', height: 60 }}>
        {Array.from({ length: 64 }, (_, i) => {
          const seed = Math.sin(i * 12.9898) * 43758.5453;
          const r = seed - Math.floor(seed);
          const spoken = frame >= 6 + (i / 64) * (total - 6);
          const h = spoken ? 8 + r * 46 * (0.5 + 0.5 * Math.sin(frame * 0.35 + i)) : 6;
          return <div key={i} style={{ width: 5, height: h, borderRadius: 2.5, background: spoken ? COLORS.ink : COLORS.muted, opacity: spoken ? 0.85 : 0.25 }} />;
        })}
      </div>
    </AbsoluteFill>
  );
};
