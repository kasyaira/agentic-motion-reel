import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, FONTS } from '../tokens';

/**
 * 12 — POST PROCESSING / VFX
 * One base signal, six treatments. Each pass is isolated and labeled, then a
 * combined grade. Effects are real compositing ops: channel split, animated
 * grain seed, slice-glitch displacement, scanline pattern, additive bloom.
 */
const BaseSignal: React.FC = () => (
  <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
    <div style={{ position: 'absolute', width: 460, height: 460, borderRadius: 230, background: COLORS.accent, filter: 'blur(2px)' }} />
    <div style={{ position: 'relative', fontFamily: FONTS.display, fontWeight: 700, fontSize: 120, color: COLORS.ink, letterSpacing: '0.04em' }}>
      SIGNAL
    </div>
  </AbsoluteFill>
);

const ChromaticSplit: React.FC<{ amount: number; children: React.ReactNode }> = ({ amount, children }) => (
  <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: COLORS.bg }}>
    <div style={{ position: 'absolute', transform: `translateX(${-amount}px)`, filter: 'url(#redOnly)', mixBlendMode: 'screen' }}>{children}</div>
    <div style={{ position: 'absolute', transform: `translateX(${amount}px)`, filter: 'url(#blueOnly)', mixBlendMode: 'screen' }}>{children}</div>
    <div style={{ position: 'absolute', filter: 'url(#greenOnly)', mixBlendMode: 'screen' }}>{children}</div>
  </AbsoluteFill>
);

const SliceGlitch: React.FC<{ intensity: number; children: React.ReactNode }> = ({ intensity, children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      {Array.from({ length: 9 }, (_, i) => {
        const seed = Math.sin(frame * 12.9898 + i * 78.233) * 43758.5453;
        const jx = ((seed - Math.floor(seed)) - 0.5) * 90 * intensity;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', top: `${i * 11.2}%`, height: '11.2%', width: '100%',
              clipPath: `inset(0 0 ${(10 - (i + 1)) * 0.2}% 0)`,
              transform: `translateX(${jx}px)`,
            }}
          >
            {children}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const EffectLabel: React.FC<{ text: string; sub: string }> = ({ text, sub }) => (
  <div style={{ position: 'absolute', right: 96, bottom: 92, textAlign: 'right' }}>
    <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 52, color: COLORS.ink }}>{text}</div>
    <div style={{ fontFamily: FONTS.mono, fontSize: 19, color: COLORS.muted, letterSpacing: '0.16em', marginTop: 6 }}>{sub}</div>
  </div>
);

export const S12PostVFX: React.FC = () => {
  const frame = useCurrentFrame();
  const step = Math.min(5, Math.floor(frame / 44));
  const local = frame - step * 44;
  const combo = frame >= 244;
  const glitchBeat = local % 16 < 5 ? 1 : 0.08;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="redOnly"><feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
        <filter id="greenOnly"><feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
        <filter id="blueOnly"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" /></filter>
        <filter id="grainHeavy">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed={frame % 8} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>

      {combo || step === 2 ? (
        <ChromaticSplit amount={combo ? 9 : 14}>
          <BaseSignal />
        </ChromaticSplit>
      ) : step === 4 ? (
        <SliceGlitch intensity={glitchBeat}>
          <BaseSignal />
        </SliceGlitch>
      ) : (
        <BaseSignal />
      )}

      {step === 0 && !combo && <EffectLabel text="BLOOM" sub="additive blur stack" />}
      {step === 1 && !combo && <EffectLabel text="GRAIN" sub="animated seed · per-frame" />}
      {step === 2 && !combo && <EffectLabel text="CHROMATIC ABERRATION" sub="RGB channel split + screen" />}
      {step === 3 && !combo && <EffectLabel text="SCANLINES" sub="CRT mask + flicker" />}
      {step === 4 && !combo && <EffectLabel text="GLITCH" sub="slice displacement on beat" />}
      {step === 5 && !combo && <EffectLabel text="VIGNETTE" sub="edge falloff" />}
      {combo && <EffectLabel text="COMBINED GRADE" sub="bloom + grain + aberration + scanlines" />}

      {step === 0 && !combo && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 460, height: 460, borderRadius: 230, boxShadow: '0 0 160px 60px rgba(255,74,31,0.55)', filter: 'blur(30px)' }} />
        </AbsoluteFill>
      )}
      {step === 1 && !combo && (
        <AbsoluteFill style={{ opacity: 0.32, mixBlendMode: 'overlay' }}>
          <div style={{ width: '100%', height: '100%', filter: 'url(#grainHeavy)' }} />
        </AbsoluteFill>
      )}
      {step === 3 && !combo && (
        <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.42) 0 3px, transparent 3px 6px)', opacity: 0.85 + 0.15 * Math.sin(frame * 0.9) }} />
      )}
      {(step === 5 || combo) && (
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)' }} />
      )}
      {combo && (
        <>
          <AbsoluteFill style={{ opacity: 0.18, mixBlendMode: 'overlay' }}>
            <div style={{ width: '100%', height: '100%', filter: 'url(#grainHeavy)' }} />
          </AbsoluteFill>
          <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0 2px, transparent 2px 5px)', opacity: 0.5 }} />
        </>
      )}

      <div style={{ position: 'absolute', left: 96, bottom: 92, fontFamily: FONTS.mono, fontSize: 20, color: COLORS.muted, letterSpacing: '0.18em' }}>
        PASS {combo ? 6 : step + 1} / 6 — ISOLATED, THEN COMPOSED
      </div>
    </AbsoluteFill>
  );
};
