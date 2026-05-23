// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('4 — Product Detail Page', () => {
  test('PD-06 — Home navigation from detail page header returns to home', async ({ productDetailPage, page }) => {
    // Step 1: Guest. Navigate to /product-detail-info?pid_product=3 (iPhone 16 Pro Max)
    await page.goto(productDetailPage.path + '?pid_product=3');
    // expect: Page title is 'Product Detail Info'
    await expect(page).toHaveTitle('Product Detail Info');

    // Step 2: Click 'Home' nav link in header (productDetailPage.header.homeLink)
    await productDetailPage.header.homeLink.click();
    // expect: Browser navigates to /home
    await expect(page).toHaveURL(/\/home/);
    // expect: Page title is 'Home'
    await expect(page).toHaveTitle('Home');
  });
});
