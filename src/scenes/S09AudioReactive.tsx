import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import { COLORS, FONTS } from '../tokens';

/**
 * 09 — AUDIO REACTIVE
 * The spectrum you see is a real FFT of the actual soundtrack at the actual
 * frame — @remotion/media-utils visualizeAudio() with an absolute-frame offset.
 */
export const S09AudioReactive: React.FC<{ absStart: number }> = ({ absStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(staticFile('audio/music.mp3'));

  if (!audioData) return <AbsoluteFill style={{ backgroundColor: COLORS.bg }} />;

  const samples = visualizeAudio({
    audioData,
    frame: absStart + frame,
    fps,
    numberOfSamples: 128,
    smoothing: true,
  });

  // split into bass / mid / treble bands
  const bass = samples.slice(0, 12).reduce((a, b) => a + b, 0) / 12;
  const mid = samples.slice(12, 48).reduce((a, b) => a + b, 0) / 36;
  const treble = samples.slice(48).reduce((a, b) => a + b, 0) / samples.slice(48).length;

  // perceptual scaling: quiet bins stay visible, loud bins punch
  const shape = (v: number) => Math.pow(v, 0.55);
  const R = 240 + shape(bass) * 300;
  const cx = 960, cy = 540;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <circle cx={cx} cy={cy} r={R * 0.72} fill="none" stroke={COLORS.accent} strokeWidth={2 + shape(bass) * 12} opacity={0.25 + shape(bass) * 0.55} />
        <circle cx={cx} cy={cy} r={R * 0.45} fill="none" stroke={COLORS.ink} strokeWidth={1.5} opacity={0.18 + shape(mid) * 0.4} />
        {samples.map((s, i) => {
          const v = Math.pow(Math.min(1, s * 1.7), 0.55);
          const N = samples.length;
          // mirrored spectrum: low freqs at top, symmetric left/right
          const m = i < N / 2 ? i / (N / 2) : (N - i) / (N / 2);
          const a = -Math.PI / 2 + (m - 0.5) * Math.PI * 1.7;
          const len = 24 + v * 560;
          const x1 = cx + Math.cos(a) * (R + 26);
          const y1 = cy + Math.sin(a) * (R + 26);
          const x2 = cx + Math.cos(a) * (R + 26 + len);
          const y2 = cy + Math.sin(a) * (R + 26 + len);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={i % 12 === 0 ? COLORS.accent : COLORS.ink}
              strokeWidth={5}
              opacity={0.3 + v * 1.6}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div style={{ position: 'absolute', fontFamily: FONTS.display, fontWeight: 700, fontSize: 54, color: COLORS.ink, textAlign: 'center' }}>
        REAL FFT DATA
      </div>
      <div style={{ position: 'absolute', bottom: 92, left: 96, fontFamily: FONTS.mono, fontSize: 22, color: COLORS.muted, letterSpacing: '0.18em' }}>
        visualizeAudio() — BASS {(bass * 100).toFixed(0)} · MID {(mid * 100).toFixed(0)} · TREBLE {(treble * 100).toFixed(0)}
      </div>
    </AbsoluteFill>
  );
};
