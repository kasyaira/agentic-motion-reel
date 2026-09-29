import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import type { TransitionPresentation } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { flip } from '@remotion/transitions/flip';
import { clockWipe } from '@remotion/transitions/clock-wipe';
import { iris } from '@remotion/transitions/iris';
import { filmBurn } from '@remotion/transitions/film-burn';
import { crosswarp } from '@remotion/transitions/crosswarp';
import { COLORS, FONTS } from '../tokens';

/**
 * 06 — TRANSITION LAB
 * Nine self-contained shots, eight distinct official presentations from
 * @remotion/transitions, each cut synced to a tick. Every label names the
 * real transition used into that shot.
 */
const SHOT = 44;
const TRAN = 12;

const Label: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: 'absolute', left: 96, bottom: 96, fontFamily: FONTS.mono,
      fontSize: 30, fontWeight: 700, letterSpacing: '0.3em', color: COLORS.accent,
    }}
  >
    {text}
  </div>
);

const Shot: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [0, 10], [1.06, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <AbsoluteFill style={{ transform: `scale(${inP})` }}>{children}</AbsoluteFill>
      <Label text={label} />
    </AbsoluteFill>
  );
};

const SHOTS: { label: string; el: React.ReactNode }[] = [
  {
    label: 'FADE', el: (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: 560, height: 560, borderRadius: 280, background: COLORS.accent }} />
      </AbsoluteFill>
    ),
  },
  {
    label: 'SLIDE', el: (
      <AbsoluteFill style={{ justifyContent: 'center' }}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{ height: 42, background: i % 2 ? COLORS.ink : 'transparent', transform: `skewY(-6deg) translateX(${i * 8}px)`, margin: '8px 0' }} />
        ))}
      </AbsoluteFill>
    ),
  },
  {
    label: 'WIPE', el: (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 420, color: COLORS.ink, letterSpacing: '-0.03em' }}>CUT</div>
      </AbsoluteFill>
    ),
  },
  {
    label: 'FLIP', el: (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ position: 'absolute', width: 300 + i * 220, height: 300 + i * 220, borderRadius: '50%', border: `3px solid ${i === 1 ? COLORS.accent : COLORS.ink}`, opacity: 1 - i * 0.18 }} />
        ))}
      </AbsoluteFill>
    ),
  },
  {
    label: 'CLOCK WIPE', el: (
      <AbsoluteFill>
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 10 }, (_, c) => (
            <div key={`${r}-${c}`} style={{ position: 'absolute', left: c * 192, top: r * 180, width: 192, height: 180, background: (r + c) % 2 ? COLORS.ink : COLORS.bg2, opacity: 0.9 }} />
          ))
        )}
      </AbsoluteFill>
    ),
  },
  {
    label: 'IRIS', el: (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: 0, height: 0, borderLeft: '340px solid transparent', borderRight: '340px solid transparent', borderBottom: `560px solid ${COLORS.accent}`, transform: 'rotate(12deg)' }} />
        <div style={{ position: 'absolute', width: 0, height: 0, borderLeft: '340px solid transparent', borderRight: '340px solid transparent', borderBottom: `560px solid ${COLORS.ink}`, opacity: 0.25, transform: 'rotate(-24deg) translateX(60px)' }} />
      </AbsoluteFill>
    ),
  },
  {
    label: 'FILM BURN', el: (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 220, color: COLORS.ink }}>60<span style={{ color: COLORS.accent }}>FPS</span></div>
      </AbsoluteFill>
    ),
  },
  {
    label: 'CROSSWARP', el: (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} style={{ width: 190, height: 190, borderRadius: 95, border: `4px solid ${i % 2 ? COLORS.accent : COLORS.ink}`, position: 'absolute', transform: `translateX(${-360 + i * 90}px) rotate(${i * 9}deg)` }} />
        ))}
      </AbsoluteFill>
    ),
  },
  {
    label: 'CUT ON MOTION', el: (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 96, color: COLORS.ink, letterSpacing: '0.06em' }}>
          TRANSITIONS ARE <span style={{ color: COLORS.accent }}>CHOREOGRAPHY</span>
        </div>
      </AbsoluteFill>
    ),
  },
];

const PRESENTATIONS: TransitionPresentation<any>[] = [
  fade(),
  slide({ direction: 'from-right' }),
  wipe({ direction: 'from-left' }),
  flip({ direction: 'from-top' }),
  clockWipe({ width: 1920, height: 1080 }),
  iris({ width: 1920, height: 1080 }),
  filmBurn({ seed: 7 }),
  crosswarp({}),
];

export const S06TransitionLab: React.FC = () => (
  <TransitionSeries>
    {SHOTS.flatMap((s, i): React.ReactNode[] => {
      const seq = (
        <TransitionSeries.Sequence key={`s${i}`} durationInFrames={SHOT}>
          {s.el ? <Shot label={s.label}>{s.el}</Shot> : null}
        </TransitionSeries.Sequence>
      );
      if (i === 0) return [seq];
      return [
        <TransitionSeries.Transition
          key={`t${i}`}
          presentation={PRESENTATIONS[i - 1]}
          timing={linearTiming({ durationInFrames: TRAN })}
        />,
        seq,
      ];
    })}
  </TransitionSeries>
);
