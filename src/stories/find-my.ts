import type {Story} from '../types';

/**
 * "Find My" — a location-sharing horror story with a doppelganger twist.
 * Hook lands in the first ~2s; the final line is rewatch-bait.
 *
 * To make a new video: copy this file, rewrite the captions/cues, register it
 * in src/Root.tsx. No component changes needed.
 */
export const findMy: Story = {
  id: 'find-my',
  title: 'Find My',
  fps: 30,
  width: 1080,
  height: 1920,
  durationInSeconds: 57,
  bg: '#050507',
  // narration: 'narration/find-my.wav', // uncomment after `npm run narrate`

  captions: [
    {start: 0, end: 3, text: 'My best friend and I share our location. 24/7.'},
    {start: 3, end: 6, text: "It's a safety thing. We tell each other everything."},
    {start: 6, end: 9, text: 'Last night she texted me: "are you outside my house?"'},
    {start: 9, end: 11, text: 'I wasn\'t. I was in bed.', emphasis: true},
    {start: 11, end: 14, text: 'I opened Find My. My dot was at her address.'},
    {start: 14, end: 16.5, text: 'Two of my dots.', emphasis: true},
    {start: 16.5, end: 19, text: 'One at her house. One in my room.'},
    {start: 19, end: 22, text: 'I called her. "Don\'t open the door," I said.'},
    {start: 22, end: 25, text: 'She whispered: "too late. you just walked in."'},
    {start: 25, end: 27, text: 'Then the line went dead.'},
    {start: 27, end: 30, text: 'I drove over. Every light in her house was off.'},
    {start: 30, end: 32, text: 'Her front door was wide open.'},
    {start: 32, end: 35, text: 'My location dot was upstairs now. Moving.'},
    {start: 35, end: 38, text: 'I went up. Her room was empty.'},
    {start: 38, end: 41, text: 'Both dots were in that room. With me.', emphasis: true},
    {start: 41, end: 43, text: 'I turned around.'},
    {start: 43, end: 46, text: 'She was in the doorway. Smiling.', emphasis: true},
    {start: 46, end: 48, text: '"I knew you\'d come," she said.'},
    {start: 48, end: 51, text: "But my best friend doesn't smile like that."},
    {start: 51, end: 53, text: "And my best friend's location—"},
    {start: 53, end: 56.5, text: 'was still in my bedroom.', emphasis: true},
  ],

  cues: [
    {at: 14, type: 'redFlash', intensity: 0.5},
    {at: 16, type: 'punchIn', intensity: 0.5},
    {at: 22.4, type: 'shake', intensity: 0.6, duration: 0.6},
    {at: 25, type: 'whiteFlash', intensity: 0.4, duration: 0.3},
    {at: 38, type: 'redFlash', intensity: 0.6},
    {at: 43, type: 'shake', intensity: 0.85, duration: 0.8},
    {at: 53, type: 'redFlash', intensity: 0.8, duration: 0.7},
  ],

  sound: [
    {src: 'sfx/drone.wav', at: 0, volume: 0.5, loop: true},
    {src: 'sfx/knock.wav', at: 6.2, volume: 0.9},
    {src: 'sfx/sting.wav', at: 14, volume: 0.7},
    {src: 'sfx/heartbeat.wav', at: 19, volume: 0.6, loop: true},
    {src: 'sfx/knock.wav', at: 30.2, volume: 1},
    {src: 'sfx/riser.wav', at: 40.5, volume: 0.7},
    {src: 'sfx/sting.wav', at: 43, volume: 0.9},
    {src: 'sfx/sting.wav', at: 53, volume: 1},
  ],
};
