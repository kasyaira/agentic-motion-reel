import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Lottie } from '@remotion/lottie';
import lottieData from '../../public/lottie/eq-orbit.json';
import { COLORS, FONTS } from '../tokens';

/**
 * 14 — LOTTIE IMPORT
 * A Lottie JSON authored by hand (no external asset), driven through
 * @remotion/lottie with real speed control: 1.5x -> 1x -> 0.4x -> reverse.
 * The JSON source itself is displayed as proof of provenance.
 */
const RATE_WINDOWS: { from: number; rate: number }[] = [
  { from: 0, rate: 1.5 },
  { from: 70, rate: 1 },
  { from: 130, rate: 0.4 },
  { from: 190, rate: -1.2 },
];

export const S14Lottie: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let rate = 1.5;
  for (const w of RATE_WINDOWS) if (frame >= w.from) rate = w.rate;

  const jsonLines = [
    '{ "v": "5.7.4", "fr": 30,',
    '  "ip": 0, "op": 90, "w": 800, "h": 800,',
    '  "layers": [',
    '    { "nm": "bar-1", "ty": 4,',
    '      "ks": { "s": [',
    '        { "t": 0,  "s": [100, 30, 100] },',
    '        { "t": 30, "s": [100, 240, 100] },',
    '        { "t": 60, "s": [100, 70, 100] }',
    '      ] } },',
    '    { "nm": "bar-2", "ty": 4, ... },',
    '    { "nm": "bar-3", "ty": 4, ... },',
    '    { "nm": "orbit", "ty": 4, "p": [...] }',
    '  ]',
    '}',
  ];
  const reveal = Math.floor(interpolate(frame, [10, 80], [0, jsonLines.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  return (
    <div style={{ backgroundColor: COLORS.bg, display: 'flex', flexDirection: 'row', width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      {/* left — the lottie, with speed ramps */}
      <div style={{ width: '48%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingLeft: 60, position: 'relative' }}>
        <div
          style={{
            transform: `scale(${spring({ frame: frame - 2, fps, config: { damping: 200, mass: 0.7 } })})`,
            opacity: spring({ frame: frame - 2, fps, config: { damping: 200, mass: 0.7 } }),
          }}
        >
          <Lottie animationData={lottieData as any} playbackRate={rate} style={{ width: 540, height: 540 }} loop />
        </div>
        <div style={{ position: 'absolute', bottom: 110, fontFamily: FONTS.mono, fontSize: 22, color: COLORS.muted, letterSpacing: '0.16em' }}>
          playbackRate = {rate}x
        </div>
      </div>

      {/* right — the source of truth */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: 150 }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 21, color: COLORS.accent, letterSpacing: '0.2em', marginBottom: 22 }}>
          eq-orbit.json — HAND-AUTHORED, ZERO IMPORTS
        </div>
        <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 30 }}>
          {jsonLines.slice(0, reveal).map((l, i) => (
            <div key={i} style={{ fontFamily: FONTS.mono, fontSize: 19, color: i === 0 || l.includes('"s"') ? COLORS.ink : COLORS.muted, lineHeight: 1.65, whiteSpace: 'pre' }}>
              {l}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, fontFamily: FONTS.body, fontSize: 21, color: COLORS.muted, lineHeight: 1.6 }}>
          Timing curves, keyframes and layer structure — owned by the timeline,
          scrubbed, ramped and reversed like any other layer.
        </div>
      </div>
    </div>
  );
};
