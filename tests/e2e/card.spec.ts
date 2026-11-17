import { expect, test } from '@playwright/test';
import { go } from './helpers';

async function reachCard(page: import('@playwright/test').Page) {
  await go(page, '/start');
  await page.getByLabel('כתיבה וניסוח').check();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByLabel('קשה לנסח').check();
  await page.getByLabel('טיוטה כתובה').check();
  await page.getByLabel('חומר פנימי').check();
  await page.getByRole('button', { name: 'הראו לי שימושים' }).click();
  await page.locator('.result-card').first().waitFor();
  await page.getByRole('link', { name: 'לכרטיס השימושים שלי' }).click();
}

test('card shows caution for internal material and the "coming soon" request path (mode none)', async ({
  page,
}) => {
  await reachCard(page);
  await expect(page.getByText('בחומר כזה, פעלו לפי הנחיות הארגון. בינתיים התנסו בחומר מדומה.')).toBeVisible();
  await expect(page.getByText('הדרך לבקשת רישיון תתפרסם בקרוב')).toBeVisible();
});

test('print stylesheet hides navigation and banners but keeps the after-license note', async ({ page }) => {
  await reachCard(page);
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByTestId('notice-banner')).toBeHidden();
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.print-footer')).toBeVisible();
  await expect(page.locator('.personal-card')).toBeVisible();
});
