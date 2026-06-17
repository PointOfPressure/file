#!/usr/bin/env node
/**
 * OPTIONAL voiceover (TTS) scaffold.
 *
 * Remotion does NOT do TTS itself, and there's no bundled voice model. This
 * script turns a story's captions into a single narration track that the
 * template can play (set `narration: 'narration/<id>.wav'` in the story).
 *
 * It supports three backends, picked via --engine (default: auto):
 *
 *   1. elevenlabs  — best quality. Needs ELEVENLABS_API_KEY (and network).
 *   2. piper       — good offline neural TTS. Needs `piper` on PATH + a voice.
 *   3. say/espeak  — robotic fallback. macOS `say` or Linux `espeak-ng`.
 *
 * Usage:
 *   node scripts/generate-narration.mjs find-my            # auto-detect engine
 *   node scripts/generate-narration.mjs find-my --engine piper
 *
 * This is intentionally a scaffold: wiring real per-caption timing to the audio
 * is the next step once you pick a voice. For now it concatenates caption text
 * into one VO file so you can hear pacing.
 */
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const storyId = args.find((a) => !a.startsWith('--')) ?? 'find-my';
const engineArg = (args.find((a) => a.startsWith('--engine=')) ?? '').split('=')[1] ?? 'auto';

const outDir = join(root, 'public', 'narration');
mkdirSync(outDir, {recursive: true});
const outFile = join(outDir, `${storyId}.wav`);

// Pull the script text straight from the story module.
const {pathToFileURL} = await import('node:url');
const storyMod = await import(pathToFileURL(join(root, 'src', 'stories', `${storyId}.ts`)).href).catch(
  () => null
);
if (!storyMod) {
  console.error(
    `Could not import src/stories/${storyId}.ts directly (TS). ` +
      `Paste the narration text manually or run via a TS loader.`
  );
}
const story = storyMod ? Object.values(storyMod)[0] : null;
const text = story ? story.captions.map((c) => c.text).join(' ') : '';

function has(bin) {
  return spawnSync(bin, ['--version'], {stdio: 'ignore'}).status === 0;
}

let engine = engineArg;
if (engine === 'auto') {
  if (process.env.ELEVENLABS_API_KEY) engine = 'elevenlabs';
  else if (has('piper')) engine = 'piper';
  else if (process.platform === 'darwin') engine = 'say';
  else if (has('espeak-ng')) engine = 'espeak';
  else engine = 'none';
}

console.log(`Story: ${storyId}  Engine: ${engine}`);

switch (engine) {
  case 'say': {
    // macOS built-in. Produces AIFF -> good enough for a scratch VO.
    const aiff = outFile.replace(/\.wav$/, '.aiff');
    spawnSync('say', ['-v', 'Daniel', '-o', aiff, text], {stdio: 'inherit'});
    console.log(`Wrote ${aiff} (convert to wav if you want: use Remotion's bundled ffmpeg).`);
    break;
  }
  case 'espeak': {
    spawnSync('espeak-ng', ['-v', 'en', '-s', '150', '-w', outFile, text], {stdio: 'inherit'});
    console.log(`Wrote ${outFile}`);
    break;
  }
  case 'piper': {
    console.log('Run, e.g.:');
    console.log(`  echo ${JSON.stringify(text)} | piper -m en_US-amy-medium.onnx -f ${outFile}`);
    break;
  }
  case 'elevenlabs': {
    console.log('Set ELEVENLABS_API_KEY and POST to their TTS endpoint, saving to:');
    console.log(`  ${outFile}`);
    console.log('Text:\n' + text);
    break;
  }
  default:
    console.log('No TTS engine available. Options: install espeak-ng/piper, use macOS `say`,');
    console.log('or set ELEVENLABS_API_KEY. Narration is optional — the video renders without it.');
}

if (existsSync(outFile)) {
  console.log(`\nNext: set  narration: 'narration/${storyId}.wav'  in src/stories/${storyId}.ts`);
}
