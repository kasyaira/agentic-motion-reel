import React, { useEffect, useRef } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { noise2D } from '@remotion/noise';
import { COLORS, FONTS } from '../tokens';
import { mulberry32 } from '../lib/rand';

/**
 * 08 — PARTICLES / PROCEDURAL
 * Two systems, one canvas: a curl-ish noise flow field with streak rendering,
 * then 900 particles converging into the word "EMERGE". All positions are
 * pure functions of (seed, frame) — reproducible on every render.
 */
const FLOW_END = 132;
const COUNT_FLOW = 650;
const COUNT_TEXT = 900;

/* ---- flow field trajectories, precomputed once per worker ---- */
type P = { x: number; y: number; trail: number[][] };
const flowParticles: P[] = (() => {
  const rnd = mulberry32(1337);
  const ps: P[] = [];
  for (let i = 0; i < COUNT_FLOW; i++) {
    let x = rnd() * 1920;
    let y = rnd() * 1080;
    const trail: number[][] = [[x, y]];
    for (let f = 1; f <= FLOW_END; f++) {
      const a = noise2D('flowfield', x * 0.0016, y * 0.0016) * Math.PI * 2.6;
      x += Math.cos(a) * 7.5;
      y += Math.sin(a) * 7.5;
      // soft wrap
      if (x < -40) x = 1960; if (x > 1960) x = -40;
      if (y < -40) y = 1120; if (y > 1120) y = -40;
      trail.push([x, y]);
    }
    ps.push({ x, y, trail });
  }
  return ps;
})();

/* ---- text target points ---- */
const textTargets: { x: number; y: number }[] = (() => {
  const c = document.createElement('canvas');
  c.width = 1920; c.height = 400;
  const ctx = c.getContext('2d')!;
  ctx.font = '700 300px SpaceGrotesk';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText('EMERGE', 960, 200);
  const data = ctx.getImageData(0, 0, 1920, 400).data;
  const pts: { x: number; y: number }[] = [];
  const step = 4;
  for (let y = 0; y < 400; y += step) {
    for (let x = 0; x < 1920; x += step) {
      if (data[(y * 1920 + x) * 4] > 128) pts.push({ x, y: y + 340 });
    }
  }
  // shuffle deterministically & resample to COUNT_TEXT
  const rnd = mulberry32(99);
  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < COUNT_TEXT; i++) out.push(pts[Math.floor((i / COUNT_TEXT) * pts.length)]);
  return out;
})();

export const S08Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, 1920, 1080);

    if (frame <= FLOW_END) {
      // flow field streaks
      const fadeScene = interpolate(frame, [118, FLOW_END], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      for (let i = 0; i < COUNT_FLOW; i++) {
        const p = flowParticles[i];
        const t = Math.min(frame, FLOW_END);
        const [x1, y1] = p.trail[Math.max(0, t - 3)];
        const [x2, y2] = p.trail[t];
        const accent = i % 9 === 0;
        ctx.strokeStyle = accent ? 'rgba(255,74,31,0.9)' : 'rgba(244,241,234,0.5)';
        ctx.lineWidth = accent ? 3 : 1.6;
        ctx.globalAlpha = fadeScene * (0.35 + (i % 5) * 0.13);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else {
      // converge to text
      const t = frame - FLOW_END;
      const rnd = mulberry32(777);
      for (let i = 0; i < COUNT_TEXT; i++) {
        const tgt = textTargets[i];
        const sx = mulberry32(i * 31 + 5)() * 1920;
        const sy = mulberry32(i * 17 + 9)() * 1080;
        const delay = rnd() * 30;
        const p = interpolate(t, [delay, delay + 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
        const jitter = (1 - p) * Math.sin(t * 0.4 + i) * 14;
        const x = sx + (tgt.x - sx) * p + jitter;
        const y = sy + (tgt.y - sy) * p + jitter * 0.6;
        const r = interpolate(p, [0, 1], [3.2, 1.9]);
        ctx.fillStyle = i % 11 === 0 ? 'rgba(255,74,31,0.95)' : 'rgba(244,241,234,0.85)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (t > 120) {
        ctx.globalAlpha = interpolate(t, [120, 150], [0, 0.9], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        ctx.fillStyle = COLORS.muted;
        ctx.font = '400 26px JetBrainsMono';
        ctx.fillText('900 AGENTS SEEDED WITH mulberry32(1337) — SAME SEED, SAME FILM', 100, 990);
        ctx.globalAlpha = 1;
      }
    }
  }, [frame]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <canvas ref={canvasRef} width={1920} height={1080} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', left: 96, top: 88, fontFamily: FONTS.mono, fontSize: 22, color: COLORS.muted, letterSpacing: '0.2em' }}>
        NOISE FLOW FIELD → {frame <= FLOW_END ? 'ADVECTION' : 'TEXT CONVERGENCE'}
      </div>
    </AbsoluteFill>
  );
};
