import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { BANNER, INLINE, ROUTES, go } from './helpers';

test('the route list here matches the app router', () => {
  const app = readFileSync(new URL('../../src/app/App.tsx', import.meta.url), 'utf8');
  const declared = [...app.matchAll(/^\s+'(\/[^']*)',?$/gm)].map((m) => m[1]!.replace(/:id$/, ''));
  for (const r of declared)
    expect(ROUTES.some((x) => x === r || (x.startsWith(r) && r.endsWith('/')))).toBe(true);
});

for (const route of ROUTES) {
  test(`org-data banner on ${route}`, async ({ page }) => {
    await go(page, route);
    await expect(page.getByTestId('notice-banner')).toContainText(BANNER);
    await expect(page.getByTestId('notice-footer')).toBeVisible();
  });
}

test('unknown route still shows the banner', async ({ page }) => {
  await go(page, '/does-not-exist');
  await expect(page.getByTestId('notice-banner')).toContainText(BANNER);
});

for (const route of ['/start', '/results']) {
  test(`inline notice on ${route}`, async ({ page }) => {
    await go(page, route);
    await expect(page.getByText(INLINE).first()).toBeVisible();
  });
}

test('step 2 of the journey shows the inline notice above the questions', async ({ page }) => {
  await go(page, '/start');
  await page.getByLabel('קריאת מסמכים ונהלים').check();
  await page.getByRole('button', { name: 'המשך' }).click();
  const notice = page.getByText(INLINE).first();
  const firstFieldset = page.locator('fieldset').first();
  await expect(notice).toBeVisible();
  const nb = (await notice.boundingBox())!;
  const fb = (await firstFieldset.boundingBox())!;
  expect(nb.y).toBeLessThan(fb.y);
});

test('no free-text field except the catalog search', async ({ page }) => {
  for (const route of ROUTES) {
    await go(page, route);
    const count = await page
      .locator('textarea, input[type="text"], input:not([type]), [contenteditable="true"]')
      .count();
    expect(count, route).toBe(0);
  }
  await go(page, '/catalog');
  await expect(page.locator('input[type="search"]')).toHaveCount(1);
});
