// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('4 — Product Detail Page', () => {
  test('PD-05 — Navigating to a non-existent product ID shows error or empty state', async ({ productDetailPage, page }) => {
    // Step 1: Guest. Navigate to /product-detail-info?pid_product=99999
    await page.goto(productDetailPage.path + '?pid_product=99999');

    // Step 2: Assert page shows empty product detail (not a 500 error)
    // expect: Page loads without 500 error
    await expect(page).toHaveTitle('Product Detail Info');
    // expect: Add To Cart button still renders (page loaded)
    await expect(page.getByRole('button', { name: 'Add To Cart' })).toBeVisible();
    // expect: Product name element not present (empty state — no product link shown)
    const productNameLink = page.getByRole('link', { name: /\w+/ }).filter({ hasText: /samsung|honor|infinix|iphone|tws|awei|redmi/i });
    await expect(productNameLink).toHaveCount(0);
    // expect: Statistics show zero values indicating no product data
    await expect(page.getByRole('cell', { name: '0 out of 0' })).toBeVisible();
  });
});
