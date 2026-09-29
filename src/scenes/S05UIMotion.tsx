import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, SPRING } from '../tokens';

/**
 * 05 — UI / PRODUCT MOTION
 * A virtual product surface: window entrance, staggered cards, modal with
 * backdrop blur, toggle micro-interaction, toast, and a cursor with click ripple.
 */
const CURSOR_PATH = [
  { x: 620, y: 760, at: 20 },
  { x: 760, y: 640, at: 60 },
  { x: 1130, y: 560, at: 96 },
  { x: 1400, y: 840, at: 150 },
  { x: 830, y: 380, at: 200 },
];

export const S05UIMotion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const win = spring({ frame: frame - 4, fps, config: SPRING.snappy });
  const card1 = spring({ frame: frame - 34, fps, config: SPRING.snappy });
  const card2 = spring({ frame: frame - 42, fps, config: SPRING.snappy });
  const card3 = spring({ frame: frame - 50, fps, config: SPRING.snappy });
  const modal = spring({ frame: frame - 92, fps, config: SPRING.punchy });
  const modalClose = interpolate(frame, [136, 148], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const toast = spring({ frame: frame - 166, fps, config: SPRING.punchy });
  const toggle = spring({ frame: frame - 120, fps, config: SPRING.punchy });

  // cursor position: piecewise eased movement between waypoints
  let cx = CURSOR_PATH[0].x, cy = CURSOR_PATH[0].y, clickR = 0, clickOp = 0;
  for (let i = 0; i < CURSOR_PATH.length; i++) {
    const a = CURSOR_PATH[i];
    const b = CURSOR_PATH[i + 1];
    if (!b && frame > a.at) { cx = a.x; cy = a.y; }
    if (b && frame >= a.at && frame < b.at) {
      const t = interpolate(frame, [a.at, b.at - 6], [0, 1], { easing: Easing.inOut(Easing.cubic), extrapolateRight: 'clamp' });
      cx = a.x + (b.x - a.x) * t;
      cy = a.y + (b.y - a.y) * t;
      break;
    }
  }
  const clicks = [78, 112, 176];
  for (const c of clicks) {
    const d = frame - c;
    if (d >= 0 && d < 22) {
      clickR = interpolate(d, [0, 22], [8, 64], { extrapolateRight: 'clamp' });
      clickOp = interpolate(d, [0, 22], [0.9, 0], { extrapolateRight: 'clamp' });
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
      {/* product window */}
      <div
        style={{
          width: 1240, height: 760, borderRadius: 20, overflow: 'hidden',
          background: COLORS.bg2, border: `1px solid ${COLORS.line}`,
          transform: `translateY(${(1 - win) * 70}px) scale(${0.94 + win * 0.06})`, opacity: win,
          boxShadow: '0 60px 120px rgba(0,0,0,0.6)',
        }}
      >
        {/* title bar */}
        <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '0 28px', borderBottom: `1px solid ${COLORS.line}` }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
          ))}
          <div style={{ marginLeft: 18, fontFamily: FONTS.mono, fontSize: 20, color: COLORS.muted }}>agentic-reel / product-motion</div>
        </div>
        <div style={{ display: 'flex', height: '100%' }}>
          {/* sidebar */}
          <div style={{ width: 250, borderRight: `1px solid ${COLORS.line}`, padding: 26, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ height: 14, width: i === 1 ? '80%' : '55%', background: i === 1 ? COLORS.accent : COLORS.line, borderRadius: 7 }} />
            ))}
            <div style={{ marginTop: 26, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 62, height: 32, borderRadius: 16, background: toggle > 0.5 ? COLORS.accent : COLORS.line,
                  padding: 4, transition: 'none',
                }}
              >
                <div style={{ width: 24, height: 24, borderRadius: 12, background: COLORS.ink, transform: `translateX(${toggle * 30}px)` }} />
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 17, color: COLORS.muted }}>SPRING PHYSICS</div>
            </div>
          </div>
          {/* main area */}
          <div style={{ flex: 1, padding: 34, position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 22 }}>
              {[card1, card2, card3].map((s, i) => (
                <div key={i} style={{ height: 190, borderRadius: 14, background: COLORS.panel, border: `1px solid ${COLORS.line}`, opacity: s, transform: `translateY(${(1 - s) * 44}px)` }}>
                  <div style={{ margin: 20, height: 92, borderRadius: 10, background: i === 1 ? COLORS.accent : COLORS.bg, border: `1px solid ${COLORS.line}` }} />
                  <div style={{ margin: '0 20px', height: 12, width: '60%', background: COLORS.line, borderRadius: 6 }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 30, height: 14, width: '42%', background: COLORS.line, borderRadius: 7 }} />
            <div style={{ marginTop: 16, height: 14, width: '68%', background: COLORS.line, borderRadius: 7 }} />
            <div style={{ marginTop: 16, height: 14, width: '55%', background: COLORS.line, borderRadius: 7 }} />

            {/* toast */}
            <div
              style={{
                position: 'absolute', right: 30, bottom: 34, display: 'flex', alignItems: 'center', gap: 14,
                background: COLORS.bg, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: '16px 22px',
                opacity: toast, transform: `translateY(${(1 - toast) * 80}px)`,
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: 6, background: COLORS.accent }} />
              <div style={{ fontFamily: FONTS.mono, fontSize: 18, color: COLORS.ink }}>Render queued — 5850 frames</div>
            </div>
          </div>
        </div>
      </div>

      {/* modal */}
      {modalClose > 0 && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backdropFilter: `blur(${6 * modalClose}px)`, background: `rgba(10,10,12,${0.55 * modalClose})`, opacity: modalClose }}>
          <div
            style={{
              width: 560, padding: 44, borderRadius: 18, background: COLORS.bg2, border: `1px solid ${COLORS.line}`,
              transform: `scale(${interpolate(modal, [0, 1], [0.7, 1])})`, opacity: modal,
            }}
          >
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 34, color: COLORS.ink }}>Export composition?</div>
            <div style={{ marginTop: 12, fontFamily: FONTS.body, fontSize: 20, color: COLORS.muted, lineHeight: 1.5 }}>
              H.264 · 1920×1080 · 30fps · CRF 20. Every pixel is drawn from a frame number.
            </div>
            <div style={{ marginTop: 30, display: 'flex', gap: 16 }}>
              <div style={{ padding: '14px 30px', borderRadius: 10, background: COLORS.accent, fontFamily: FONTS.mono, fontSize: 18, color: '#0A0A0C', fontWeight: 700 }}>RENDER</div>
              <div style={{ padding: '14px 30px', borderRadius: 10, border: `1px solid ${COLORS.line}`, fontFamily: FONTS.mono, fontSize: 18, color: COLORS.ink }}>CANCEL</div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* click ripple */}
      {clickOp > 0 && (
        <div style={{ position: 'absolute', left: cx - clickR, top: cy - clickR, width: clickR * 2, height: clickR * 2, borderRadius: clickR, border: `2px solid ${COLORS.accent}`, opacity: clickOp }} />
      )}
      {/* cursor */}
      <svg width={34} height={40} viewBox="0 0 34 40" style={{ position: 'absolute', left: cx - 3, top: cy - 2, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}>
        <path d="M2 2 L2 32 L10 24 L16 38 L22 35 L16 21 L28 20 Z" fill={COLORS.ink} stroke="#0A0A0C" strokeWidth={2} />
      </svg>
    </AbsoluteFill>
  );
};
