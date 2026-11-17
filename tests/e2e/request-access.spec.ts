import { expect, test } from '@playwright/test';
import { go } from './helpers';

test('request access (mailto): shows exactly what will be sent, then builds the link on confirm only', async ({
  page,
}) => {
  await go(page, '/start');
  await page.getByLabel('השוואת מסמכים').check();
  await page.getByRole('button', { name: 'המשך' }).click();
  await page.getByLabel('טבלת שינויים או השוואה').check();
  await page.getByRole('button', { name: 'הראו לי שימושים' }).click();
  await page.locator('.result-card').first().waitFor();
  await page.getByRole('link', { name: 'לכרטיס השימושים שלי' }).click();

  await expect(page.getByTestId('request-confirm')).toHaveCount(0);
  await page.getByRole('button', { name: 'אני רוצה להתנסות' }).click();
  const payload = page.getByTestId('request-payload');
  await expect(payload).toContainText('השימושים שבחרתי:');
  await expect(payload).toContainText('what-changed-in-procedure');
  await expect(payload).toContainText('משימות: השוואת מסמכים');
  await expect(payload).toContainText(/תאריך: \d{4}-\d{2}-\d{2}/);

  const href = await page.getByTestId('request-confirm').getAttribute('href');
  expect(href).toMatch(/^mailto:requests@example\.test\?subject=/);
  const body = new URL(href!.replace('mailto:', 'http://x/')).searchParams.get('body')!;
  expect(body).toBe(await payload.innerText());
});
