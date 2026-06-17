import React from 'react';
import {Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import type {SoundCue} from '../types';

/**
 * Plays every sound cue. Looping cues (drone/heartbeat beds) start at their cue
 * time and run to the end; one-shots fire at their timestamp.
 *
 * Files are resolved from public/ — run `npm run sfx` first to generate them.
 */
export const SoundDesign: React.FC<{
  sound: SoundCue[];
  narration?: string;
  totalFrames: number;
}> = ({sound, narration, totalFrames}) => {
  const {fps} = useVideoConfig();
  return (
    <>
      {narration ? <Audio src={staticFile(narration)} /> : null}
      {sound.map((cue, i) => {
        const from = Math.round(cue.at * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, totalFrames - from)}>
            <Audio src={staticFile(cue.src)} volume={cue.volume ?? 1} loop={cue.loop} />
          </Sequence>
        );
      })}
    </>
  );
};
