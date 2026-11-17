/**
 * Records the short walkthrough video shown on the home page (public/media/quick-path.webm).
 * Run manually after UI changes:  npm run build && npm run preview  (port 4173), then
 *   npx tsx scripts/record-demo.ts && <ffmpeg> ... (see docs/DECISIONS.md).
 * Uses only the site itself: no generated or real content.
 */
import { chromium } from '@playwright/test';
import { mkdirSync, readdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';

const out = 'test-results/recording';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: out, size: { width: 1280, height: 720 } },
  locale: 'he-IL',
  colorScheme: 'light',
});
const page = await ctx.newPage();
const pause = (ms: number) => page.waitForTimeout(ms);
await page.goto('http://localhost:4173/#/');
await pause(1800);
await page.locator('#quick').scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, -40));
await pause(900);
await page.getByLabel('באיזו יחידה אתם עובדים?').selectOption('legal-counsel-legislation');
await pause(1200);
await page.getByLabel(/ליווי חקיקה, תקנות ונהלים/).hover();
await pause(500);
await page.getByLabel(/ליווי חקיקה, תקנות ונהלים/).check();
await pause(900);
await page.getByRole('button', { name: 'הראו לי מה אפשר לעשות' }).click();
await pause(2600);
await page.mouse.wheel(0, 380);
await pause(1600);
await page.getByRole('link', { name: 'הראו לי דוגמה' }).first().click();
await pause(1600);
await page.locator('.change-table .fact').nth(1).click();
await pause(2400);
await ctx.close();
await browser.close();
const file = readdirSync(out).find((f) => f.endsWith('.webm'))!;
renameSync(join(out, file), join(out, 'raw.webm'));
console.log('recorded', join(out, 'raw.webm'));
