import copy from '../../content/copy.he.json' with { type: 'json' };
import type { Page } from '@playwright/test';

export const BANNER = copy['notice.banner'];
export const INLINE = copy['notice.inline'];

/** Every route in the app. Keep in sync with src/app/App.tsx ROUTES (checked by a test below). */
export const ROUTES = [
  '/',
  '/start',
  '/results',
  '/scenario/what-changed-in-procedure',
  '/catalog',
  '/demo/demo-compare-procedures',
  '/card',
  '/notice',
  '/about',
];

export async function go(page: Page, route: string) {
  await page.goto(`./#${route}`);
  await page.locator('h1').first().waitFor();
}

/** Fails the test on any request that leaves the local origin. */
export function blockExternal(page: Page, origin = 'http://localhost:4173') {
  const external: string[] = [];
  page.on('request', (req) => {
    const u = req.url();
    if (!u.startsWith(origin) && !u.startsWith('data:') && !u.startsWith('blob:')) external.push(u);
  });
  return external;
}
