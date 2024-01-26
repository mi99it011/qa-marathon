import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://dev.marathon.rplearn.net/minami_ito/index.html');
  await page.getByRole('link', { name: '顧客一覧' }).click();
  await page.goto('http://dev.marathon.rplearn.net/minami_ito/customer/update.html?customerId=51');
  await page.getByLabel('連絡先').click();
  await page.getByLabel('連絡先').fill('000000000000000000000');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: '更新' }).click();
});