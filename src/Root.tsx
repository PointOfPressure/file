import React from 'react';
import {Composition} from 'remotion';
import {HorrorShort} from './components/HorrorShort';
import {findMy} from './stories/find-my';
import type {Story} from './types';

/**
 * Register one <Composition> per story. Each just points the shared HorrorShort
 * template at a story data object.
 */
const stories: Story[] = [findMy];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {stories.map((story) => (
        <Composition
          key={story.id}
          id={toCompositionId(story.id)}
          component={HorrorShort}
          durationInFrames={Math.round(story.durationInSeconds * story.fps)}
          fps={story.fps}
          width={story.width}
          height={story.height}
          defaultProps={{story}}
        />
      ))}
    </>
  );
};

/** 'find-my' -> 'FindMy' so it's a clean CLI target: `remotion render FindMy`. */
function toCompositionId(id: string): string {
  return id
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}
