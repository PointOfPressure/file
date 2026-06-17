import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

/** Breathing dark vignette — tightens slightly over time to build pressure. */
export const Vignette: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const tighten = interpolate(frame, [0, durationInFrames], [62, 44], {
    extrapolateRight: 'clamp',
  });
  const pulse = Math.sin(frame / 8) * 1.5;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, rgba(0,0,0,0) ${
          tighten + pulse
        }%, rgba(0,0,0,0.92) 100%)`,
        pointerEvents: 'none',
      }}
    />
  );
};
