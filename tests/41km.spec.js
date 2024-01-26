import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://dev.marathon.rplearn.net/minami_ito/index.html');
  await page.getByRole('link', { name: '顧客一覧' }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: '顧客情報を削除する' }).click();
});