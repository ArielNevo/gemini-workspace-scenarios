/**
 * Post-build guard: (1) with the AI flag off, no Firebase / Google API code is shipped at all;
 * (2) the initial load (index.html + entry JS/CSS + modulepreloads) stays under 200 KB gzip.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const LIMIT = 200 * 1024;
const aiOn = process.env.VITE_ENABLE_AI_ASSIST === 'true';
let failed = false;

const assets = readdirSync(join(dist, 'assets'));
if (!aiOn) {
  for (const f of assets) {
    const text = readFileSync(join(dist, 'assets', f), 'utf8');
    if (/firebase|googleapis|recaptcha/i.test(text)) {
      console.error(`AI flag is off but ${f} contains Firebase/Google API code.`);
      failed = true;
    }
  }
}

const html = readFileSync(join(dist, 'index.html'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((m) => m[1]!.split('/').pop()!);
let total = gzipSync(html).length;
for (const r of new Set(refs)) total += gzipSync(readFileSync(join(dist, 'assets', r))).length;
console.log(
  `Initial load: ${(total / 1024).toFixed(1)} KB gzip (${refs.length} files). Limit ${LIMIT / 1024} KB.`,
);
if (total > LIMIT) failed = true;

if (failed) process.exit(1);
console.log('Bundle check OK.');
