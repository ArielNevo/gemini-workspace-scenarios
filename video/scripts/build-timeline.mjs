// Narration is the clock: copies the chosen takes (vo/picks.json) to public/audio and writes src/timeline.json.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FFPROBE = process.env.FFPROBE ?? `${process.env.HOME}/AI-Studio/bin/ffprobe`;
const FPS = 30;
const picks = JSON.parse(fs.readFileSync(path.join(ROOT, 'vo/picks.json'), 'utf8'));
const captionText = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, 'captions.tsv'), 'utf8').trim().split('\n').map((l) => l.split('\t')),
);
const dur = (p) => parseFloat(execSync(`"${FFPROBE}" -v error -show_entries format=duration -of default=nw=1:nk=1 "${p}"`).toString());

const ORDER = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
const GAP = { P1: 0.6, P2: 0.5, P3: 0.5, P4: 0.6, P5: 0.8, P6: 0 };
const LEAD = 0.8;
const TAIL = 2.4;
let t = LEAD;
const scenes = [];
for (const k of ORDER) {
  const src = path.resolve(ROOT, picks[k]);
  fs.copyFileSync(src, path.join(ROOT, 'public/audio', `${k}.wav`));
  const d = dur(src);
  // Captions: one sentence per caption, timed by share of characters.
  // Captions in full spelling (captions.tsv), chunks separated by "|".
  const sentences = captionText[k].split('|').map((s) => s.trim()).filter(Boolean);
  const total = sentences.reduce((a, s) => a + s.length, 0);
  let c = 0;
  const captions = sentences.map((s) => {
    const from = c / total;
    c += s.length;
    return { text: s, from: Math.round((t + from * d) * FPS), to: Math.round((t + (c / total) * d) * FPS) };
  });
  const start = k === 'P1' ? 0 : Math.round(t * FPS) - 6;
  scenes.push({ id: k, audioFrom: Math.round(t * FPS), audioDur: Math.round(d * FPS), start, captions });
  t += d + GAP[k];
}
const total = Math.round((t + TAIL) * FPS);
for (let i = 0; i < scenes.length; i++) scenes[i].end = i + 1 < scenes.length ? scenes[i + 1].start : total;
fs.writeFileSync(path.join(ROOT, 'src/timeline.json'), JSON.stringify({ fps: FPS, total, scenes }, null, 2));
console.log(`timeline: ${(total / FPS).toFixed(1)} s`, scenes.map((s) => `${s.id} ${(s.audioDur / FPS).toFixed(1)}s`).join(', '));
