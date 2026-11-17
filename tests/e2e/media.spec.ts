import { expect, test } from '@playwright/test';
import { blockExternal, go } from './helpers';

test('avatar greeting plays with captions in the bubble and an AI label', async ({ page }) => {
  const external = blockExternal(page);
  await go(page, '/');
  await expect(page.locator('.ai-label')).toContainText('אווטאר וקול שנוצרו ב-AI');
  await page.getByRole('button', { name: /כן, ספר לי/ }).click();
  await expect(page.locator('.bubble-text')).toContainText('Gemini יכול לעזור', { timeout: 8000 });
  await expect(page.locator('.figure canvas')).not.toHaveClass(/is-hidden/);
  await page.getByRole('button', { name: /עצור/ }).click();
  await expect(page.getByRole('button', { name: /כן, ספר לי/ })).toBeVisible();
  expect(external).toEqual([]);
});

test('film and walkthrough are local media with credits and a transcript', async ({ page }) => {
  await go(page, '/');
  const film = page.locator('video[aria-describedby="film-desc"] source');
  await expect(film).toHaveAttribute('src', /media\/film\.mp4$/);
  await expect(page.locator('#film-desc')).toContainText('ערוץ Google Workspace ב-YouTube');
  await page.locator('#film-desc summary').click();
  await expect(page.locator('#film-desc details')).toContainText('שלושה כללים');
  const ok = await page.evaluate(async () => (await fetch('media/film.mp4', { method: 'HEAD' })).ok);
  expect(ok).toBe(true);
});
