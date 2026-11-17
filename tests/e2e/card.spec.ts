import { expect, test } from '@playwright/test';
import { go } from './helpers';

async function reachCard(page: import('@playwright/test').Page) {
  await go(page, '/start');
  await page.getByLabel('כתיבה וניסוח').check();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByLabel('קשה לנסח').check();
  await page.getByLabel('טיוטה כתובה').check();
  await page.getByLabel('חומר מוגן או רגיש').check();
  await page.getByRole('button', { name: 'הראו לי שימושים' }).click();
  await page.locator('.result-card').first().waitFor();
  await page.getByRole('link', { name: 'לכרטיס השימושים שלי' }).click();
}

test('card shows caution and a CDO consult for protected material, and the form request path', async ({
  page,
}) => {
  await reachCard(page);
  await expect(
    page.getByText('לחומר מסווג או רגיש במיוחד, פעלו לפי הנחיות המשרד, ואם יש ספק, התייעצו.'),
  ).toBeVisible();
  await expect(page.locator('.consult')).toContainText('סימנתם שאתם עובדים עם חומר מוגן או רגיש');
  await page.getByRole('button', { name: 'אני רוצה להתנסות' }).click();
  await expect(page.getByTestId('request-payload')).toContainText('השימושים שבחרתי:');
  await expect(page.getByTestId('request-confirm')).toHaveAttribute('target', '_blank');
});

test('print stylesheet hides navigation and banners but keeps the after-license note', async ({ page }) => {
  await reachCard(page);
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByTestId('notice-banner')).toBeHidden();
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.print-footer')).toBeVisible();
  await expect(page.locator('.personal-card')).toBeVisible();
});
