import { expect, test } from '@playwright/test';
import { blockExternal, go } from './helpers';

test('quick path: unit + topic → curated suggestions with reason, then deepen', async ({ page }, info) => {
  const external = blockExternal(page);
  await go(page, '/');
  await page.getByLabel('באיזו יחידה אתם עובדים?').selectOption('patents');
  const chips = page.locator('.topic-chip');
  await expect(chips).toHaveCount(3);
  await page.getByLabel(/רישום, רישוי ובדיקת בקשות/).check();
  if (process.env.SHOTS)
    await page.screenshot({ path: `test-results/shot-home-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'הראו לי מה אפשר לעשות' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('אלה השימושים שכדאי לך לבדוק');
  await expect(page.locator('.context-line')).toContainText('רשות הפטנטים');
  await expect(page.locator('.result-card')).toHaveCount(3);
  await expect(page.locator('.result-card').first().locator('.reason')).toContainText(
    'רישום, רישוי ובדיקת בקשות',
  );
  await expect(page.getByText('אריאל נבו').first()).toBeVisible();
  if (process.env.SHOTS)
    await page.screenshot({ path: `test-results/shot-results-${info.project.name}.png`, fullPage: true });

  await page.getByRole('button', { name: 'דייקו את ההתאמה (2 שאלות)' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('מה מעסיק אותך בעבודה?');
  await expect(page.getByLabel('קריאת מסמכים ונהלים')).toBeChecked();
  expect(external).toEqual([]);
});

test('quick path: "other" unit offers every topic', async ({ page }) => {
  await go(page, '/');
  await page.getByLabel('באיזו יחידה אתם עובדים?').selectOption('other');
  expect(await page.locator('.topic-chip').count()).toBeGreaterThan(15);
});

test('card from quick path carries unit and topic in the request summary', async ({ page }) => {
  await go(page, '/results?unit=finance&topic=budget-finance');
  await page.getByRole('link', { name: 'לכרטיס השימושים שלי' }).click();
  await page.getByRole('button', { name: 'אני רוצה להתנסות' }).click();
  const payload = page.getByTestId('request-payload');
  await expect(payload).toContainText('יחידה: אגף הכספים');
  await expect(payload).toContainText('נושא עיקרי: תקציב, כספים ותשלומים');
  await expect(page.getByTestId('request-confirm')).toHaveAttribute(
    'href',
    /^https:\/\/forms\.monday\.com\//,
  );
  await expect(page.getByRole('button', { name: 'העתיקו את התקציר' })).toBeVisible();
});
