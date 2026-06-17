#!/usr/bin/env node
/**
 * Generates the horror sound-design bed as 16-bit PCM WAV files.
 * Pure Node — no ffmpeg, no native deps, fully deterministic.
 *
 *   node scripts/generate-sfx.mjs   (or: npm run sfx)
 *
 * Output: public/sfx/{drone,heartbeat,knock,sting,riser}.wav
 */
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'sfx');
mkdirSync(outDir, {recursive: true});

const TAU = Math.PI * 2;

/** Write a mono Float[-1,1] sample array to a 16-bit PCM WAV. */
function writeWav(name, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE((s * 0x7fff) | 0, 44 + i * 2);
  }
  const path = join(outDir, name);
  writeFileSync(path, buf);
  console.log(`  ✓ ${name}  (${(buf.length / 1024).toFixed(0)} KB, ${(n / SR).toFixed(2)}s)`);
}

const buffer = (sec) => new Float32Array(Math.round(sec * SR));
const sine = (t, f) => Math.sin(TAU * f * t);
// Deterministic PRNG so renders are reproducible.
let seed = 1337;
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;

// --- Drone: detuned low sines + slow tremolo. Loopable bed. ---
function drone(sec = 8) {
  const b = buffer(sec);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const lfo = 0.7 + 0.3 * Math.sin(TAU * 0.12 * t);
    let s = sine(t, 55) * 0.5 + sine(t, 55.4) * 0.5; // beating
    s += sine(t, 82.5) * 0.25; // fifth-ish
    s += sine(t, 36.7) * 0.3; // sub
    b[i] = s * 0.3 * lfo;
  }
  return b;
}

// --- Heartbeat: lub-dub, one 1.2s cycle (loop for a steady pulse). ---
function heartbeat(sec = 1.2) {
  const b = buffer(sec);
  const thump = (start, f, decay, gain) => {
    for (let i = 0; i < b.length; i++) {
      const t = i / SR - start;
      if (t < 0) continue;
      const env = Math.exp(-t / decay);
      b[i] += sine(t, f * (1 + t * 0.5)) * env * gain;
    }
  };
  thump(0.0, 60, 0.09, 0.9); // lub
  thump(0.22, 50, 0.12, 0.7); // dub
  return b;
}

// --- Knock: noisy transient + damped low sine. ---
function knock(sec = 0.3) {
  const b = buffer(sec);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const env = Math.exp(-t / 0.05);
    const body = sine(t, 110) * Math.exp(-t / 0.12);
    b[i] = (rand() * 0.6 * env + body * 0.7) * 0.9;
  }
  return b;
}

// --- Sting: dissonant rising cluster, sharp attack. ---
function sting(sec = 0.9) {
  const b = buffer(sec);
  const freqs = [220, 233, 311, 466];
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.01) * Math.exp(-t / 0.4);
    const bend = 1 + t * 0.6;
    let s = 0;
    for (const f of freqs) s += sine(t, f * bend);
    b[i] = (s / freqs.length) * env * 0.8;
  }
  return b;
}

// --- Riser: noise + rising tone swelling to a cliff, then cut. ---
function riser(sec = 2.5) {
  const b = buffer(sec);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const p = t / sec;
    const swell = Math.pow(p, 2.2);
    const tone = sine(t, 120 + p * p * 600) * 0.5;
    const noise = rand() * 0.5;
    b[i] = (tone + noise) * swell * 0.7;
  }
  return b;
}

console.log('Generating SFX -> public/sfx/');
writeWav('drone.wav', drone());
writeWav('heartbeat.wav', heartbeat());
writeWav('knock.wav', knock());
writeWav('sting.wav', sting());
writeWav('riser.wav', riser());
console.log('Done.');
