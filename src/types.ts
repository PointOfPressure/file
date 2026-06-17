/**
 * The data contract for a horror short.
 *
 * A new video should require ONLY a new `Story` object (see src/stories/*.ts).
 * No component code should need to change to ship a new story.
 */

export type CaptionAnim =
  | 'words' // word-by-word reveal (default, best for storytime)
  | 'fade' // whole line fades in
  | 'pop'; // whole line springs in

export interface Caption {
  /** Caption text. Use a blank line ("\n\n") sparingly for hard beats. */
  text: string;
  /** Start time in SECONDS. */
  start: number;
  /** End time in SECONDS. */
  end: number;
  /** Entrance animation. Defaults to 'words'. */
  anim?: CaptionAnim;
  /** Emphasis = larger, blood-red, heavier weight. Use on twist/reveal beats. */
  emphasis?: boolean;
}

export type CueType =
  | 'shake' // camera shake
  | 'redFlash' // blood-red full-screen flash
  | 'whiteFlash' // harsh white flash
  | 'punchIn'; // quick scale punch toward the viewer

export interface Cue {
  /** Time in SECONDS the effect fires. */
  at: number;
  type: CueType;
  /** 0..1 strength. Defaults to 0.6. */
  intensity?: number;
  /** Effect length in SECONDS. Defaults vary per type. */
  duration?: number;
}

export interface SoundCue {
  /** Path relative to public/, e.g. 'sfx/knock.wav'. */
  src: string;
  /** Time in SECONDS the sound starts. */
  at: number;
  /** 0..1. Defaults to 1. */
  volume?: number;
  /** Loop until the end of the video (use for drone / heartbeat beds). */
  loop?: boolean;
}

export interface Story {
  id: string;
  title: string;

  // Canvas
  fps: number;
  width: number;
  height: number;
  durationInSeconds: number;

  /** Background base color (a dark vignette is layered on top). */
  bg?: string;

  /** Optional full voiceover track in public/, e.g. 'narration/find-my.wav'. */
  narration?: string;

  captions: Caption[];
  cues: Cue[];
  sound: SoundCue[];
}
