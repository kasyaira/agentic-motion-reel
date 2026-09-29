import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, OffthreadVideo, staticFile } from 'remotion';
import { COLORS, FONTS } from '../tokens';
import { mulberry32 } from '../lib/rand';

/**
 * 18 — MEDIA COMPOSITING
 * Real footage (the "inkfield" source clip rendered earlier by this same
 * pipeline) — re-timed, re-cropped, graded, and composited with PiP and
 * cinematic letterboxing. Four operations, all frame-exact.
 */
const A = 40; // shot A: speed ramp
const B = 82; // shot B: ken-burns crop
const C = 124; // shot C: color grade
const D = 170; // shot D: PiP + letterbox

const Label: React.FC<{ n: string; text: string }> = ({ n, text }) => (
  <div style={{ position: 'absolute', left: 96, bottom: 92 }}>
    <div style={{ fontFamily: FONTS.mono, fontSize: 34, fontWeight: 700, color: COLORS.accent, letterSpacing: '0.2em' }}>{n}</div>
    <div style={{ fontFamily: FONTS.mono, fontSize: 20, color: COLORS.muted, letterSpacing: '0.16em', marginTop: 8 }}>{text}</div>
  </div>
);

export const S18MediaCompositing: React.FC = () => {
  const frame = useCurrentFrame();
  const rnd = mulberry32(5150);

  // A — speed ramp: playbackRate steps 0.4 -> 2 -> 1
  const rateA = frame < 26 ? 0.4 : frame < 52 ? 2.2 : 1;
  const aIn = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const aOut = interpolate(frame, [A - 8, A], [1, 0.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // B — ken burns inside an oversized container (re-crop)
  const kbX = interpolate(frame, [B, A + 78], [-260, 60], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const kbS = interpolate(frame, [B, A + 78], [1.35, 1.12], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });

  // C — grade: cool push + orange duotone wash
  const gradeMix = interpolate(frame, [C, C + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const flicker = Math.sin(frame * 1.7) * 0.02;

  // D — PiP
  const pip = springy(frame, D + 2);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
      {/* A — speed ramp full-frame */}
      {frame < A && (
        <AbsoluteFill style={{ opacity: Math.min(aIn, aOut) }}>
          <OffthreadVideo src={staticFile('footage/source.mp4')} playbackRate={rateA} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <Label n="01" text={`PLAYBACK RATE — ${rateA}x`} />
        </AbsoluteFill>
      )}

      {/* B — ken burns crop */}
      {frame >= A && frame < C && (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 1920, height: 1080, transform: `scale(${kbS}) translate(${kbX}px, 0px)` }}>
            <OffthreadVideo src={staticFile('footage/source.mp4')} playbackRate={0.85} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <Label n="02" text="RE-CROP — KEN BURNS, 1.35x → 1.12x" />
        </AbsoluteFill>
      )}

      {/* C — color grade */}
      {frame >= C && frame < D && (
        <AbsoluteFill>
          <OffthreadVideo
            src={staticFile('footage/source.mp4')}
            playbackRate={0.7}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `saturate(${(0.55 + 0.5 * gradeMix).toFixed(2)}) contrast(1.22) hue-rotate(${(-14 * gradeMix).toFixed(1)}deg) brightness(${(0.92 + flicker).toFixed(3)})` }}
          />
          <AbsoluteFill style={{ background: 'linear-gradient(160deg, rgba(255,74,31,0.22), rgba(10,10,12,0.55))', mixBlendMode: 'multiply', opacity: gradeMix }} />
          <AbsoluteFill style={{ background: 'rgba(120,190,255,0.10)', mixBlendMode: 'screen', opacity: gradeMix }} />
          <Label n="03" text="GRADE — DUTONE + CONTRAST + FLICKER" />
        </AbsoluteFill>
      )}

      {/* D — PiP + letterbox */}
      {frame >= D && (
        <AbsoluteFill style={{ backgroundColor: '#050506' }}>
          <OffthreadVideo src={staticFile('footage/source.mp4')} playbackRate={0.5} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
          <div
            style={{
              position: 'absolute', right: 130, bottom: 170, width: 520, height: 300, borderRadius: 12,
              overflow: 'hidden', border: `2px solid ${COLORS.ink}`, boxShadow: '0 30px 80px rgba(0,0,0,0.65)',
              transform: `scale(${pip}) translateY(${(1 - pip) * 50}px)`, opacity: pip,
            }}
          >
            <OffthreadVideo src={staticFile('footage/source.mp4')} playbackRate={1.6} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {/* letterbox */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 130, background: '#050506' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 130, background: '#050506' }} />
          <Label n="04" text="PiP + LETTERBOX — 2.39:1 FEEL" />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

function springy(frame: number, from: number) {
  return interpolate(frame, [from, from + 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.70158)),
  });
}
