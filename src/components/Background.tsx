import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';

/**
 * Living background: a deep gradient with a slow Ken Burns drift + breathing
 * glow so even text-only frames never feel like a static slide.
 */
export const Background: React.FC<{bg?: string; durationInFrames: number}> = ({
  bg = theme.bg,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [1.08, 1.18]);
  const driftX = interpolate(frame, [0, durationInFrames], [-30, 30]);
  const glow = 0.18 + Math.sin(frame / 22) * 0.06;

  return (
    <AbsoluteFill style={{backgroundColor: bg, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          width,
          height,
          transform: `scale(${scale}) translateX(${driftX}px)`,
          background: `radial-gradient(circle at 50% 38%, rgba(70,12,12,${glow}) 0%, rgba(5,5,7,0) 55%), radial-gradient(circle at 50% 120%, rgba(20,20,30,0.5) 0%, rgba(5,5,7,0) 60%)`,
        }}
      />
    </AbsoluteFill>
  );
};
