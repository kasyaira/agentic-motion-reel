import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Underline, Circle, Box, Highlight, Bracket } from '@remotion/rough-notation';
import { COLORS, FONTS } from '../tokens';

/**
 * 15 — ROUGH / HAND-DRAWN ANNOTATION
 * A design brief annotated with rough-notation: underline, circle, box,
 * highlight and bracket — each stroke animated via `progress`, seeded so
 * every render draws the same "hand".
 */
const p = (frame: number, from: number, dur = 26) =>
  interpolate(frame, [from, from + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

export const S15Rough: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', opacity: fadeIn }}>
      <div style={{ width: 1240, background: COLORS.bg2, border: `1px solid ${COLORS.line}`, borderRadius: 18, padding: '70px 84px', position: 'relative' }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 20, color: COLORS.muted, letterSpacing: '0.2em' }}>
          SCENE 15 — ANNOTATION PASS
        </div>

        <div style={{ marginTop: 34, display: 'inline-block' }}>
          <Highlight progress={p(frame, 18)} color="rgba(255,74,31,0.32)">
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 58, color: COLORS.ink }}>
              Everything is deliberate.
            </div>
          </Highlight>
        </div>

        <div style={{ marginTop: 40, fontFamily: FONTS.body, fontSize: 30, color: COLORS.muted, lineHeight: 1.7, width: 1000 }}>
          <div style={{ display: 'inline-block' }}>
            <Underline progress={p(frame, 44)} color={COLORS.accent} strokeWidth={4}>
              <span style={{ color: COLORS.ink }}>Springs, not tweens.</span>
            </Underline>
          </div>{' '}
          Every value eases through physics —{' '}
          <span style={{ display: 'inline-block', position: 'relative' }}>
            <Box progress={p(frame, 66)} color={COLORS.ink} strokeWidth={3}>
              <span style={{ color: COLORS.ink }}>deterministic seeds</span>
            </Box>
          </span>{' '}
          keep the randomness{' '}
          <span style={{ display: 'inline-block', position: 'relative' }}>
            <Circle progress={p(frame, 88)} color={COLORS.accent} strokeWidth={4}>
              <span style={{ color: COLORS.ink }}>reproducible</span>
            </Circle>
          </span>
          .
        </div>

        <div style={{ marginTop: 44, display: 'flex', gap: 60 }}>
          <div style={{ display: 'inline-block' }}>
            <Bracket progress={p(frame, 110, 30)} color={COLORS.muted} strokeWidth={2.5}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 22, color: COLORS.ink, lineHeight: 1.8, padding: '0 18px' }}>
                NO TEMPLATES<br />
                NO STOCK CLIPS<br />
                NO AUTOPLOT
              </div>
            </Bracket>
          </div>
          <div style={{ flex: 1, fontFamily: FONTS.mono, fontSize: 22, color: COLORS.muted, letterSpacing: '0.14em', lineHeight: 1.9 }}>
            <span style={{ color: COLORS.ink }}>rough-notation × remotion</span><br />
            seeded strokes → same hand, every render<br />
            annotation = direction, not decoration
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
