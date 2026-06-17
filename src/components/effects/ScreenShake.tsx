import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Cue} from '../../types';

/**
 * Wraps children and applies camera shake during any 'shake' cue window.
 * Shake decays over the cue duration so it lands hard then settles.
 */
export const ScreenShake: React.FC<{cues: Cue[]; children: React.ReactNode}> = ({
  cues,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  let x = 0;
  let y = 0;
  let rot = 0;
  let scale = 1;

  for (const cue of cues) {
    const intensity = cue.intensity ?? 0.6;

    if (cue.type === 'shake') {
      const start = cue.at * fps;
      const dur = (cue.duration ?? 0.6) * fps;
      if (frame < start || frame > start + dur) continue;
      const decay = interpolate(frame, [start, start + dur], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      const amp = 26 * intensity * decay;
      // random() is deterministic per seed -> reproducible renders.
      x += (random(`sx-${frame}`) - 0.5) * 2 * amp;
      y += (random(`sy-${frame}`) - 0.5) * 2 * amp;
      rot += (random(`sr-${frame}`) - 0.5) * 2 * 1.2 * intensity * decay;
    }

    if (cue.type === 'punchIn') {
      const start = cue.at * fps;
      const dur = (cue.duration ?? 0.4) * fps;
      if (frame < start || frame > start + dur) continue;
      // Quick zoom toward the viewer that eases back out.
      const punch = interpolate(frame, [start, start + dur * 0.3, start + dur], [0, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      scale += punch * 0.12 * intensity;
    }
  }

  return (
    <AbsoluteFill
      style={{transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`}}
    >
      {children}
    </AbsoluteFill>
  );
};
