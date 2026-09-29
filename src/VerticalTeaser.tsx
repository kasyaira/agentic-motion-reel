import React, { useEffect, useRef } from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import { COLORS, FONTS, SPRING } from './tokens';
import { mulberry32 } from './lib/rand';
import { GlobalStyles, Grain, Vignette } from './components/Atmosphere';

/**
 * VERTICAL TEASER — 1080×1920, 40s.
 * NOT a crop: six signature moments re-composed for 9:16.
 * Music: the energetic core of the soundtrack (1:00–1:40).
 */

// ---------- moment 1: opening words (re-laid-out vertically) ----------
const M1Words: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = ['ONE AGENT.', 'ONE TIMELINE.', 'LIMITLESS MOTION.'];
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      {lines.map((l, i) => {
        const s = spring({ frame: frame - i * 12, fps, config: SPRING.punchy });
        return (
          <div key={i} style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: i === 2 ? 92 : 104, color: i === 1 ? COLORS.accent : COLORS.ink, opacity: s, transform: `translateY(${(1 - s) * 60}px)`, marginBottom: 18, letterSpacing: '-0.01em' }}>
            {l}
          </div>
        );
      })}
      <div style={{ marginTop: 40, width: 90, height: 90, backgroundColor: COLORS.accent, borderRadius: 16, transform: `rotate(45deg) scale(${spring({ frame: frame - 44, fps, config: SPRING.punchy })})` }} />
    </AbsoluteFill>
  );
};

// ---------- moment 2: EMERGE particles (re-sampled for 1080 width) ----------
const M2Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targets = useRef<{ x: number; y: number }[]>([]);
  const local = frame - 200; // moment start

  useEffect(() => {
    const c = document.createElement('canvas');
    c.width = 1080; c.height = 300;
    const ctx = c.getContext('2d')!;
    ctx.font = '700 190px SpaceGrotesk';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText('EMERGE', 540, 150);
    const data = ctx.getImageData(0, 0, 1080, 300).data;
    const pts: { x: number; y: number }[] = [];
    for (let y = 0; y < 300; y += 4) {
      for (let x = 0; x < 1080; x += 4) {
        if (data[(y * 1080 + x) * 4] > 128) pts.push({ x, y: y + 780 });
      }
    }
    const rnd = mulberry32(99);
    for (let i = pts.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [pts[i], pts[j]] = [pts[j], pts[i]];
    }
    targets.current = pts.slice(0, 750);
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, 1080, 1920);
    const t = local;
    if (t < 0 || targets.current.length === 0) return;
    const rnd = mulberry32(777);
    for (let i = 0; i < targets.current.length; i++) {
      const tgt = targets.current[i];
      const sx = mulberry32(i * 31 + 5)() * 1080;
      const sy = mulberry32(i * 17 + 9)() * 1920;
      const delay = rnd() * 26;
      const p = interpolate(t, [delay, delay + 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
      const x = sx + (tgt.x - sx) * p;
      const y = sy + (tgt.y - sy) * p;
      ctx.fillStyle = i % 11 === 0 ? 'rgba(255,74,31,0.95)' : 'rgba(244,241,234,0.85)';
      ctx.beginPath();
      ctx.arc(x, y, interpolate(p, [0, 1], [3, 1.8]), 0, Math.PI * 2);
      ctx.fill();
    }
  }, [frame, local]);

  return <canvas ref={canvasRef} width={1080} height={1920} style={{ position: 'absolute', inset: 0 }} />;
};

// ---------- moment 3: audio-reactive ring (music offset 60s) ----------
const M3FFT: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(staticFile('audio/music.mp3'));
  if (!audioData) return null;
  const samples = visualizeAudio({ audioData, frame: 1800 + (frame - 400), fps, numberOfSamples: 128, smoothing: true });
  const bass = samples.slice(0, 12).reduce((a, b) => a + b, 0) / 12;
  const shape = (v: number) => Math.pow(Math.min(1, v * 1.7), 0.55);
  const R = 230 + shape(bass) * 300;
  const cx = 540, cy = 900;
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <circle cx={cx} cy={cy} r={R * 0.7} fill="none" stroke={COLORS.accent} strokeWidth={2 + shape(bass) * 12} opacity={0.3 + shape(bass) * 0.5} />
        {samples.map((s, i) => {
          const v = shape(s);
          const N = samples.length;
          const m = i < N / 2 ? i / (N / 2) : (N - i) / (N / 2);
          const a = -Math.PI / 2 + (m - 0.5) * Math.PI * 1.7;
          const len = 20 + v * 500;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * (R + 22)} y1={cy + Math.sin(a) * (R + 22)}
              x2={cx + Math.cos(a) * (R + 22 + len)} y2={cy + Math.sin(a) * (R + 22 + len)}
              stroke={i % 12 === 0 ? COLORS.accent : COLORS.ink}
              strokeWidth={5} opacity={0.3 + v * 1.6} strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div style={{ position: 'absolute', top: 878, fontFamily: FONTS.display, fontWeight: 700, fontSize: 46, color: COLORS.ink }}>REAL FFT</div>
    </AbsoluteFill>
  );
};

// ---------- moment 4: capability tiles (2×3 grid, 6 tiles) ----------
const M4Matrix: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const caps = ['KINETIC TYPE', 'PARTICLES', 'AUDIO REACTIVE', '3D / R3F', 'GLSL SHADERS', 'SOUND DESIGN'];
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 420px)', gap: 20 }}>
        {caps.map((c, i) => {
          const s = spring({ frame: frame - (620 + i * 6), fps, config: { damping: 16, stiffness: 190, mass: 0.75 } });
          return (
            <div key={i} style={{ height: 150, background: COLORS.bg2, border: `1px solid ${i === 5 ? COLORS.accent : COLORS.line}`, borderRadius: 12, padding: '18px 22px', opacity: s, transform: `perspective(700px) rotateY(${(1 - s) * 60}deg)`, display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 30, color: i === 5 ? COLORS.accent : COLORS.ink }}>{c}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- moment 5: hero ----------
const M5Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const breathe = 1 + Math.sin((frame / 30) * Math.PI) * 0.07;
  const l1 = interpolate(frame, [842, 872], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.exp) });
  const l2 = interpolate(frame, [866, 896], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.exp) });
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ transform: `scale(${breathe})`, marginBottom: 70 }}>
        <div style={{ width: 100, height: 100, background: COLORS.accent, borderRadius: 18, transform: 'rotate(45deg)', boxShadow: '0 0 100px rgba(255,74,31,0.5)' }} />
      </div>
      <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 84, color: COLORS.ink, opacity: l1, transform: `translateY(${(1 - l1) * 26}px)` }}>
        BUILT WITH <span style={{ color: COLORS.accent }}>CODE.</span>
      </div>
      <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 84, color: COLORS.ink, opacity: l2, transform: `translateY(${(1 - l2) * 26}px)`, marginTop: 12 }}>
        DIRECTED BY <span style={{ color: COLORS.accent }}>INTENT.</span>
      </div>
      <div style={{ marginTop: 40, fontFamily: FONTS.mono, fontSize: 20, color: COLORS.muted, letterSpacing: '0.3em' }}>
        SUPER Z · 2026
      </div>
    </AbsoluteFill>
  );
};

export const VerticalTeaser: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [1150, 1200], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, opacity: fadeOut }}>
      <GlobalStyles />
      <Audio src={staticFile('audio/music.mp3')} startFrom={1800} />
      {frame < 200 && <M1Words />}
      {frame >= 200 && frame < 400 && <M2Particles />}
      {frame >= 400 && frame < 620 && <M3FFT />}
      {frame >= 620 && frame < 820 && <M4Matrix />}
      {frame >= 820 && <M5Hero />}
      <Vignette />
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
