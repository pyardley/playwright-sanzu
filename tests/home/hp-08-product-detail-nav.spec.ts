// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('1 — Home Page', () => {
  test('HP-08 — Navigating to product detail from product image link', async ({ homePage, page }) => {
    // Step 1: Preconditions: guest. Navigate to /home via homePage fixture.
    await expect(page).toHaveTitle('Home');

    // Step 2: Click the 'Product Pic' image link of the first product card.
    const cards = await homePage.getProductCards();
    await cards[0].clickDetailLink();

    // expect: Browser navigates to /product-detail-info with query param pid_product=<id>
    await expect(page).toHaveURL(/product-detail-info\?pid_product=\d+/);
    // expect: Page title is 'Product Detail Info'
    await expect(page).toHaveTitle('Product Detail Info');
  });
});
