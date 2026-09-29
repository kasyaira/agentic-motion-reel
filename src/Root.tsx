import React from 'react';
import { AbsoluteFill, Audio, Composition, Sequence, staticFile } from 'remotion';
import { SECTIONS, TOTAL_FRAMES } from './sections';
import { SceneHud } from './components/SceneHud';
import { GlobalStyles, Grain, Vignette } from './components/Atmosphere';
import { COLORS, FPS, H, W } from './tokens';
import { InkfieldSource } from './scenes/InkfieldSource';
import { VerticalTeaser } from './VerticalTeaser';

const Showreel: React.FC = () => {
  let offset = 0;
  const cuts = SECTIONS.map((s) => {
    const from = offset;
    offset += s.dur;
    return { s, from };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <GlobalStyles />
      {/* the synthesized music bed — starts at frame 0, runs the full film */}
      <Audio src={staticFile('audio/music.mp3')} />
      {cuts.map(({ s, from }) => (
        <Sequence key={s.id} from={from} durationInFrames={s.dur}>
          <s.C absStart={from} />
          {s.hud !== false && <SceneHud index={s.id} title={s.title} tech={s.tech} />}
        </Sequence>
      ))}
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Showreel"
      component={Showreel}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
    <Composition
      id="InkfieldSource"
      component={InkfieldSource}
      durationInFrames={240}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="VerticalTeaser"
      component={VerticalTeaser}
      durationInFrames={1200}
      fps={FPS}
      width={1080}
      height={1920}
    />
  </>
);
