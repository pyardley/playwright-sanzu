// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('4 — Product Detail Page', () => {
  test('PD-07 — Demo Organization logo link in detail page header returns to home', async ({ productDetailPage, page }) => {
    // Step 1: Guest. Navigate to /product-detail-info?pid_product=1
    await page.goto(productDetailPage.path + '?pid_product=1');
    await expect(page).toHaveTitle('Product Detail Info');

    // Step 2: Click 'Demo Organization' logo link in the banner
    await productDetailPage.header.logoLink.click();
    // expect: Browser navigates to /home
    await expect(page).toHaveURL(/\/home/);
    // expect: Page title is 'Home'
    await expect(page).toHaveTitle('Home');
  });
});
