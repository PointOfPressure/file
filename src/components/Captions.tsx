import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {Caption} from '../types';
import {theme} from '../theme';

/** Renders every caption as its own timed Sequence. */
export const Captions: React.FC<{captions: Caption[]}> = ({captions}) => {
  const {fps} = useVideoConfig();
  return (
    <>
      {captions.map((c, i) => {
        const from = Math.round(c.start * fps);
        const durationInFrames = Math.max(1, Math.round((c.end - c.start) * fps));
        return (
          <Sequence key={i} from={from} durationInFrames={durationInFrames}>
            <CaptionCard caption={c} durationInFrames={durationInFrames} />
          </Sequence>
        );
      })}
    </>
  );
};

const CaptionCard: React.FC<{caption: Caption; durationInFrames: number}> = ({
  caption,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const anim = caption.anim ?? 'words';

  // Shared fade-out for the last 8 frames of any caption.
  const out = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  const baseStyle: React.CSSProperties = {
    fontFamily: theme.font,
    color: caption.emphasis ? theme.bloodSoft : theme.text,
    fontSize: caption.emphasis ? 88 : 70,
    fontWeight: 900,
    lineHeight: 1.12,
    textAlign: 'center',
    letterSpacing: caption.emphasis ? 0.5 : 0,
    textShadow:
      '0 4px 24px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.9)',
    maxWidth: theme.captionMaxWidth,
    padding: '0 40px',
    textTransform: caption.emphasis ? 'uppercase' : 'none',
  };

  return (
    <AbsoluteFill
      style={{justifyContent: 'center', alignItems: 'center', opacity: out}}
    >
      <div style={baseStyle}>
        {anim === 'words' ? (
          <WordReveal text={caption.text} fps={fps} />
        ) : (
          <WholeLine text={caption.text} anim={anim} frame={frame} fps={fps} />
        )}
      </div>
    </AbsoluteFill>
  );
};

const WordReveal: React.FC<{text: string; fps: number}> = ({text, fps}) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');
  const stagger = Math.max(1, Math.round(fps * 0.07)); // ~70ms between words
  return (
    <>
      {words.map((w, i) => {
        const delay = i * stagger;
        const appear = spring({
          frame: frame - delay,
          fps,
          config: {damping: 16, stiffness: 140, mass: 0.6},
        });
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: '0.28em',
              opacity: appear,
              transform: `translateY(${(1 - appear) * 22}px) scale(${
                0.92 + appear * 0.08
              })`,
            }}
          >
            {w}
          </span>
        );
      })}
    </>
  );
};

const WholeLine: React.FC<{
  text: string;
  anim: 'fade' | 'pop';
  frame: number;
  fps: number;
}> = ({text, anim, frame, fps}) => {
  const s = spring({frame, fps, config: {damping: 14, stiffness: 120}});
  const opacity = anim === 'fade' ? interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'}) : s;
  const scale = anim === 'pop' ? 0.8 + s * 0.2 : 1;
  return <span style={{display: 'inline-block', opacity, transform: `scale(${scale})`}}>{text}</span>;
};
