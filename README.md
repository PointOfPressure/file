# Horror Shorts — a reusable Remotion pipeline

Short-form vertical (1080×1920) horror videos for TikTok. The whole point of
this repo: **a new video is a data swap, not a re-code.** A story is a single
object (captions + timed effect cues + sound); the shared `HorrorShort`
template renders it.

## What's in here

```
src/
  types.ts                 # the Story data contract (the only thing you edit per video)
  theme.ts                 # colors + fonts
  Root.tsx                 # registers one <Composition> per story
  components/
    HorrorShort.tsx        # the reusable template (composes everything)
    Background.tsx         # living gradient + Ken Burns drift
    Captions.tsx           # kinetic captions (word-by-word reveal, emphasis beats)
    SoundDesign.tsx        # plays the story's sound cues + optional narration
    effects/
      ScreenShake.tsx      # shake + punch-in camera rig
      FlashOverlay.tsx     # red / white impact flashes
      Vignette.tsx         # breathing vignette
      FilmGrain.tsx        # animated grain
  stories/
    find-my.ts             # "Find My" — location/doppelganger story (the demo)
scripts/
  generate-sfx.mjs         # synthesizes the SFX bed as WAVs (pure Node, no ffmpeg)
  generate-narration.mjs   # OPTIONAL voiceover (TTS) scaffold
```

## Setup

Needs **Node 18+** (Node 22 used here). Remotion brings its own ffmpeg.

```bash
npm install
npm run sfx          # generates public/sfx/*.wav  (do this before rendering)
```

**Platform notes**
- **Linux** (incl. this dev container): rendering uses software GL — already
  configured via `Config.setChromiumOpenGlRenderer('swangle')` in
  `remotion.config.ts`.
- **macOS / Windows**: that line is harmless but you can delete it (hardware GL
  is fine). Everything else is identical.

## Preview & render

```bash
npm run studio       # interactive editor at http://localhost:3000
npm run render       # -> out/find-my.mp4   (runs `npm run sfx` first)
npm run still        # -> out/find-my-cover.png  (thumbnail frame)
```

> **Heads up about Claude Code on the web / restricted sandboxes:** the first
> render downloads a Chrome Headless Shell from `remotion.media`. If your
> environment has a network egress allowlist, add **`remotion.media`** to it, or
> render on your own machine where the download is allowed. The project builds
> and bundles fine without it — only the final frame rasterization needs Chrome.

## Add a new story (the whole workflow)

1. Copy `src/stories/find-my.ts` → `src/stories/my-story.ts`, rewrite the
   `captions`, `cues`, and `sound` arrays. Give it a unique `id`.
2. Register it in `src/Root.tsx` (add to the `stories` array).
3. `npm run render:story MyStory out/my-story.mp4`
   (the composition id is the PascalCase of your `id`, e.g. `my-story` →
   `MyStory`).

### The Story shape (see `src/types.ts`)

- **captions**: `{start, end}` in seconds, `text`, optional `anim`
  (`words` | `fade` | `pop`), optional `emphasis` (big blood-red uppercase — use
  on twist beats).
- **cues**: timed effects — `shake`, `redFlash`, `whiteFlash`, `punchIn`, each
  with `at` (seconds), `intensity` (0–1), `duration`.
- **sound**: `{src, at, volume, loop}`. `src` is relative to `public/`. Use
  `loop: true` for the drone/heartbeat beds.

## Voiceover (optional)

Remotion has no built-in TTS. `scripts/generate-narration.mjs` scaffolds three
backends — **ElevenLabs** (best, needs `ELEVENLABS_API_KEY`), **Piper** (offline
neural), or **`say`/`espeak`** (robotic fallback):

```bash
npm run narrate find-my
```

Then set `narration: 'narration/find-my.wav'` in the story and re-render.

## Sound design

`npm run sfx` synthesizes `drone`, `heartbeat`, `knock`, `sting`, and `riser`
WAVs deterministically in pure Node — no ffmpeg, reproducible across machines.
Tweak the synth functions in `scripts/generate-sfx.mjs` to taste. They're
gitignored (cheap to regenerate); commit them if you prefer.
