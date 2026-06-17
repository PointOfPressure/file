import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import type {Story} from '../types';
import {Background} from './Background';
import {Captions} from './Captions';
import {SoundDesign} from './SoundDesign';
import {ScreenShake} from './effects/ScreenShake';
import {FlashOverlay} from './effects/FlashOverlay';
import {Vignette} from './effects/Vignette';
import {FilmGrain} from './effects/FilmGrain';
import {theme} from '../theme';

/**
 * The reusable template. Render any story by passing it as the single prop.
 * Layer order (bottom -> top): background, [shake-wrapped: captions], flashes,
 * vignette, grain, audio.
 */
export const HorrorShort: React.FC<{story: Story}> = ({story}) => {
  const {durationInFrames} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor: story.bg ?? theme.bg}}>
      <Background bg={story.bg} durationInFrames={durationInFrames} />

      <ScreenShake cues={story.cues}>
        <Captions captions={story.captions} />
      </ScreenShake>

      <FlashOverlay cues={story.cues} />
      <Vignette durationInFrames={durationInFrames} />
      <FilmGrain />

      <SoundDesign
        sound={story.sound}
        narration={story.narration}
        totalFrames={durationInFrames}
      />
    </AbsoluteFill>
  );
};
