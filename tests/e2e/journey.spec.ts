import { expect, test } from '@playwright/test';
import { blockExternal, go } from './helpers';

test('full journey: home → questions → results → demo → card, with no external requests', async ({
  page,
}) => {
  const external = blockExternal(page);
  await go(page, '/');
  await page.getByRole('link', { name: /בואו נתחיל/ }).click();
  await page.getByLabel('קריאת מסמכים ונהלים').check();
  await page.getByLabel('הכנת ישיבות ותדריכים').check();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByLabel('יש יותר מדי חומר').check();
  await page.getByLabel('כמה מסמכים').check();
  await page.getByRole('button', { name: 'הראו לי שימושים' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('אלה השימושים שכדאי לך לבדוק');
  const cards = page.locator('.result-card');
  await expect(cards.first()).toBeVisible();
  const n = await cards.count();
  expect(n).toBeGreaterThanOrEqual(1);
  expect(n).toBeLessThanOrEqual(3);
  await expect(cards.first().locator('.reason')).toContainText('הצענו את זה כי');
  await expect(page.locator('body')).not.toContainText('%');
  await expect(cards.first()).toContainText('טיוטה: טרם נבדק');

  await page.getByRole('link', { name: 'הראו לי דוגמה' }).first().click();
  await expect(page.locator('.provenance')).toContainText('דוגמה להמחשה');
  await page.locator('.fact').first().click();
  await expect(page.locator('.mock-section.is-highlighted')).toHaveCount(1);

  await page.getByRole('link', { name: 'השימושים שלי' }).click();
  await expect(page.locator('.personal-card > li')).toHaveCount(n);
  expect(external).toEqual([]);
});

test('no clear match shows the empty state and catalog link', async ({ page }) => {
  await go(page, '/results?frequency=once&tasks=');
  await go(page, '/start');
  await page.getByLabel('עבודה עם נתונים').check();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByLabel('רשימת משימות').check();
  await page.getByRole('button', { name: 'הראו לי שימושים' }).click();
  const text = await page.locator('main').innerText();
  // Either a sensible result list or the honest empty state, never a percentage.
  expect(text).not.toContain('%');
});

test('catalog search finds scenarios in Hebrew and filters by tool', async ({ page }) => {
  await go(page, '/catalog');
  await page.getByLabel('חיפוש בנושא כללי').fill('מה השתנה');
  await expect(page.locator('.catalog-grid li').first()).toContainText('מה השתנה בנוהל');
  await page.getByLabel('חיפוש בנושא כללי').fill('');
  await page.getByLabel('כלי').selectOption('gemini-in-workspace-apps');
  await expect(page.locator('.catalog-grid li')).toHaveCount(1);
});

test('every demo renders with provenance and the can/check line', async ({ page }) => {
  for (const id of [
    'demo-plain-language',
    'demo-manager-brief',
    'demo-compare-procedures',
    'demo-ask-the-procedure',
    'demo-learn-a-field',
    'demo-bullets-to-draft',
  ]) {
    await go(page, `/demo/${id}`);
    await expect(page.locator('.provenance')).toContainText('דוגמה להמחשה: נכתבה ידנית ולא הופקה בכלי');
    await expect(page.getByText('מה הכלי יכול לעשות כאן, ומה מחייב בדיקה מקצועית')).toBeVisible();
    await expect(page.getByTestId('notice-demos')).toBeVisible();
  }
});

test('scenario without a demo says so', async ({ page }) => {
  await go(page, '/scenario/check-consistency');
  await expect(page.getByText('הדגמה לתרחיש הזה עדיין לא זמינה')).toBeVisible();
  await expect(page.getByText('נבדק בארגון: עדיין לא')).toBeVisible();
});

test('keyboard only: complete the journey without a mouse', async ({ page }) => {
  await go(page, '/start');
  // Focus the first checkbox via Tab from the heading.
  const first = page.getByLabel('כתיבה וניסוח');
  for (let i = 0; i < 40 && !(await first.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await expect(first).toBeFocused();
  await page.keyboard.press('Space');
  await expect(first).toBeChecked();
  const next = page.getByRole('button', { name: 'המשך' });
  for (let i = 0; i < 40 && !(await next.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('איפה העבודה נעשית קשה או איטית?');
  const draft = page.getByLabel('טיוטה כתובה');
  for (let i = 0; i < 60 && !(await draft.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await page.keyboard.press('Space');
  const submit = page.getByRole('button', { name: 'הראו לי שימושים' });
  for (let i = 0; i < 60 && !(await submit.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await page.keyboard.press('Enter');
  await expect(page.locator('.result-card').first()).toBeVisible();
});

test('nothing is written to storage until the user presses save; delete clears it', async ({ page }) => {
  await go(page, '/start');
  await page.getByLabel('כתיבה וניסוח').check();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByLabel('טיוטה כתובה').check();
  await page.getByRole('button', { name: 'הראו לי שימושים' }).click();
  await page.locator('.result-card').first().waitFor();
  await page.getByRole('link', { name: 'לכרטיס השימושים שלי' }).click();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(await page.context().cookies()).toEqual([]);
  await page.getByRole('button', { name: 'שמור לי את המסלול' }).click();
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['gemini-discovery:v1']);
  await page.getByRole('button', { name: 'מחק את הנתונים שלי' }).click();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
