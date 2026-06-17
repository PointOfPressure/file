import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Cue} from '../../types';
import {theme} from '../../theme';

/** Red/white full-screen flashes for redFlash + whiteFlash cues. */
export const FlashOverlay: React.FC<{cues: Cue[]}> = ({cues}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <>
      {cues
        .filter((c) => c.type === 'redFlash' || c.type === 'whiteFlash')
        .map((cue, i) => {
          const start = cue.at * fps;
          const dur = (cue.duration ?? 0.5) * fps;
          const intensity = cue.intensity ?? 0.6;
          // Fast attack, slower fade — feels like an impact.
          const opacity = interpolate(
            frame,
            [start, start + dur * 0.15, start + dur],
            [0, intensity, 0],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
          );
          if (opacity <= 0) return null;
          return (
            <AbsoluteFill
              key={i}
              style={{
                backgroundColor: cue.type === 'redFlash' ? theme.blood : '#ffffff',
                opacity,
                mixBlendMode: 'screen',
              }}
            />
          );
        })}
    </>
  );
};
