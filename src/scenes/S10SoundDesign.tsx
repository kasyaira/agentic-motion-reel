import { AbsoluteFill, interpolate, staticFile, Audio, useCurrentFrame, Sequence } from 'remotion';
import { COLORS, FONTS } from '../tokens';

/**
 * 10 — SOUND DESIGN
 * The soundtrack's own anatomy, on screen: six lanes, a sweeping playhead,
 * and the actual synthesized SFX firing at the exact frames shown.
 * Everything audible here is oscillator math — zero sampled audio.
 */
const LANES = [
  { name: 'MUSIC BED', color: COLORS.muted },
  { name: 'WHOOSH', color: COLORS.ink },
  { name: 'IMPACT', color: COLORS.accent },
  { name: 'SUB HIT', color: COLORS.accent },
  { name: 'UI TICK', color: COLORS.ink },
  { name: 'RISER', color: COLORS.ink },
];

const EVENTS: { lane: number; frame: number; file?: string; dur: number }[] = [
  { lane: 1, frame: 14, file: 'whoosh.wav', dur: 26 },
  { lane: 2, frame: 40, file: 'impact.wav', dur: 18 },
  { lane: 3, frame: 40, file: 'sub.wav', dur: 26 },
  { lane: 4, frame: 66, file: 'tick.wav', dur: 6 },
  { lane: 4, frame: 96, file: 'tick.wav', dur: 6 },
  { lane: 1, frame: 100, file: 'whoosh.wav', dur: 26 },
  { lane: 2, frame: 124, file: 'impact.wav', dur: 18 },
  { lane: 5, frame: 140, file: 'riser.wav', dur: 84 },
  { lane: 4, frame: 168, file: 'tick.wav', dur: 6 },
  { lane: 2, frame: 226, file: 'impact.wav', dur: 14 },
  { lane: 3, frame: 226, file: 'sub.wav', dur: 14 },
];

export const S10SoundDesign: React.FC = () => {
  const frame = useCurrentFrame();
  const playX = 300 + (frame / 240) * 1380;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, padding: '170px 96px 120px' }}>
      {EVENTS.filter((e) => e.file).map((e, i) => (
        <Sequence key={i} from={e.frame} durationInFrames={e.dur + 4}>
          <Audio src={staticFile(`audio/sfx/${e.file}`)} />
        </Sequence>
      ))}

      <div style={{ fontFamily: FONTS.mono, fontSize: 22, color: COLORS.muted, letterSpacing: '0.2em' }}>
        THE SOUNDTRACK, DISSECTED — ALL SOUNDS SYNTHESIZED FROM OSCILLATORS
      </div>

      <div style={{ marginTop: 46, position: 'relative' }}>
        {LANES.map((lane, li) => (
          <div key={li} style={{ display: 'flex', alignItems: 'center', height: 78, gap: 24 }}>
            <div style={{ width: 250, fontFamily: FONTS.mono, fontSize: 21, color: lane.color, letterSpacing: '0.12em' }}>{lane.name}</div>
            <div style={{ position: 'relative', flex: 1, height: 44, background: COLORS.panel, borderRadius: 8 }}>
              {li === 0 && (
                <div style={{ position: 'absolute', inset: 6, borderRadius: 5, background: `repeating-linear-gradient(90deg, rgba(244,241,234,0.22) 0 14px, transparent 14px 22px)` }} />
              )}
              {EVENTS.filter((e) => e.lane === li).map((e, ei) => {
                const d = frame - e.frame;
                const flash = d >= 0 && d < e.dur ? interpolate(d, [0, e.dur], [1, 0.35], { extrapolateRight: 'clamp' }) : 0.12;
                const grow = interpolate(d, [0, 6], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                return (
                  <div
                    key={ei}
                    style={{
                      position: 'absolute', left: 300 + (e.frame / 240) * 1380 - 300 - 6, top: 6,
                      width: Math.max(12, e.dur * 4), height: 32, borderRadius: 5,
                      background: lane.color, opacity: 0.12 + flash * 0.88,
                      transform: `scaleY(${grow})`,
                      boxShadow: flash > 0.4 ? `0 0 26px ${lane.color}` : 'none',
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
        {/* playhead */}
        <div style={{ position: 'absolute', left: 274, top: -14, bottom: -14 }}>
          <div style={{ position: 'absolute', left: playX - 274, top: 0, width: 2, height: '100%', background: COLORS.ink, boxShadow: '0 0 18px rgba(244,241,234,0.7)' }} />
          <div style={{ position: 'absolute', left: playX - 280, top: -8, fontFamily: FONTS.mono, fontSize: 17, color: COLORS.ink }}>
            {(frame / 30).toFixed(2)}s
          </div>
        </div>
      </div>

      <div style={{ marginTop: 54, fontFamily: FONTS.mono, fontSize: 21, color: COLORS.muted, letterSpacing: '0.16em' }}>
        DUCKING IS BAKED INTO THE MUSIC BED · EVERY HIT LANDS ON A FRAME, NOT A GUESS
      </div>
    </AbsoluteFill>
  );
};
