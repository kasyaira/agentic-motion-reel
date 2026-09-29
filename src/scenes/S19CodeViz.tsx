import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, FONTS } from '../tokens';

/**
 * 19 — CODE / TECH VISUALIZATION
 * The pipeline that renders this very reel: shader source typing into an
 * editor, a real CLI session, and the frame-flow node graph — all synced
 * to one timeline. No fake AI chatter in the terminal.
 */
const CODE = `// S13 — the shader behind scene 13
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(11.7, 5.3);
    a *= 0.5;
  }
  return v;   // 5 octaves, domain-warped
}

vec3 col = palette(f * f * 2.1);
col += palette(q.x) * 0.28;`;

const TOKENS = (line: string): React.ReactNode[] => {
  return line.split(/(float|int|for|vec2|vec3|return|\/\/.*$)/).map((tk, i) => {
    if (/^(float|int|for|vec2|vec3|return)$/.test(tk)) return <span key={i} style={{ color: '#FF4A1F' }}>{tk}</span>;
    if (tk.startsWith('//')) return <span key={i} style={{ color: '#7A756C' }}>{tk}</span>;
    return <span key={i} style={{ color: '#F4F1EA' }}>{tk}</span>;
  });
};

const TERMINAL: { at: number; cmd?: string; out?: string }[] = [
  { at: 8, cmd: '$ npx remotion render Showreel out/showreel.mp4' },
  { at: 42, out: '▸ Bundling 22 scenes ............ 3.2s' },
  { at: 66, out: '▸ Frames 0 – 5850 @ 30fps, 1920×1080' },
  { at: 90, out: '▸ Encoding H.264 · CRF 20 · yuv420p' },
  { at: 120, cmd: '$ ffprobe -show_streams out/showreel.mp4' },
  { at: 150, out: '  codec_name=h264 · width=1920 · height=1080' },
  { at: 172, out: '  r_frame_rate=30/1 · duration=195.0s' },
  { at: 200, cmd: '$ echo "every output is verifiable"' },
  { at: 226, out: '  every output is verifiable' },
];

const NODES = [
  { x: 60, y: 40, w: 210, label: 'SCENE GRAPH' },
  { x: 330, y: 40, w: 210, label: 'FRAME RENDERER' },
  { x: 600, y: 40, w: 210, label: 'H.264 ENCODER' },
];

export const S19CodeViz: React.FC = () => {
  const frame = useCurrentFrame();

  // typing: reveal code char by char, ~2.2 chars/frame with pauses at newlines
  const charCount = Math.min(CODE.length, Math.floor(interpolate(frame, [10, 128], [0, CODE.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (e) => e })));
  const typed = CODE.slice(0, charCount).split('\n');
  const cursorBlink = Math.floor(frame / 8) % 2 === 0;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, padding: '150px 96px 110px' }}>
      <div style={{ fontFamily: FONTS.mono, fontSize: 22, color: COLORS.muted, letterSpacing: '0.2em' }}>
        THE PIPELINE, RENDERING ITSELF
      </div>
      <div style={{ display: 'flex', gap: 40, marginTop: 34 }}>
        {/* editor */}
        <div style={{ width: 880, background: COLORS.bg2, border: `1px solid ${COLORS.line}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 22px', borderBottom: `1px solid ${COLORS.line}`, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: COLORS.accent }} />
            <div style={{ fontFamily: FONTS.mono, fontSize: 18, color: COLORS.muted }}>flow.frag</div>
          </div>
          <div style={{ padding: 26 }}>
            {typed.map((line, i) => (
              <div key={i} style={{ fontFamily: FONTS.mono, fontSize: 20.5, lineHeight: 1.75, whiteSpace: 'pre', minHeight: '1.75em' }}>
                <span style={{ color: COLORS.muted, marginRight: 18, display: 'inline-block', width: 26, textAlign: 'right' }}>{i + 1}</span>
                {TOKENS(line)}
                {i === typed.length - 1 && cursorBlink && <span style={{ color: COLORS.accent }}>▌</span>}
              </div>
            ))}
          </div>
        </div>

        {/* terminal + node graph */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div style={{ background: '#060607', border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 24, flex: 1 }}>
            {TERMINAL.filter((l) => frame >= l.at).map((l, i) => (
              <div key={i} style={{ fontFamily: FONTS.mono, fontSize: 19, lineHeight: 2 }}>
                {l.cmd && <span style={{ color: COLORS.ink }}>{l.cmd}</span>}
                {l.out && <span style={{ color: COLORS.muted }}>{l.out}</span>}
              </div>
            ))}
          </div>
          <svg viewBox="0 0 860 130" style={{ background: COLORS.bg2, border: `1px solid ${COLORS.line}`, borderRadius: 14, width: '100%' }}>
            {NODES.map((n, i) => (
              <g key={i}>
                <rect x={n.x} y={n.y} width={n.w} height={54} rx={10} fill="none" stroke={i === 1 ? COLORS.accent : COLORS.line} strokeWidth={i === 1 ? 2 : 1.5} />
                <text x={n.x + n.w / 2} y={n.y + 34} textAnchor="middle" fill={COLORS.ink} style={{ fontFamily: FONTS.mono, fontSize: 16, letterSpacing: '0.08em' }}>
                  {n.label}
                </text>
                {i < NODES.length - 1 && (
                  <line
                    x1={n.x + n.w} y1={n.y + 27} x2={NODES[i + 1].x} y2={n.y + 27}
                    stroke={COLORS.accent} strokeWidth={2}
                    strokeDasharray="8 8"
                    strokeDashoffset={-frame * 2.2}
                    opacity={frame > 60 + i * 40 ? 1 : 0.2}
                  />
                )}
              </g>
            ))}
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};
