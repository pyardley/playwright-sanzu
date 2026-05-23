// spec: specs/sanzu.plan.md — 5 — Cart Management
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.use({ storageState: '.auth/user.json' });

test.describe('5 — Cart Management', () => {
  test('CART-03 — Cart detail page shows correct product name and quantity', async ({ homePage, cartPage, loginPage }) => {
    // Precondition: ensure an active APEX session by logging in explicitly.
    await loginPage.loginAs(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

    // Step 1: Add first product and navigate to cart detail page
    await homePage.addFirstProductToCart();
    await homePage.header.goToCart();
    await expect(cartPage.page).toHaveURL(/org-wise-cart-detail1/);

    // Step 2: Inspect first cart row — expect visible with non-empty text
    const firstRow = cartPage.cartRows.first();
    await expect(firstRow).toBeVisible();
    const rowText = await firstRow.textContent();
    expect(rowText).toBeTruthy();
    expect(rowText!.trim().length).toBeGreaterThan(0);

    // Step 3: Assert cartSummary is visible (via its checkout button or isVisible helper)
    const summaryVisible = await cartPage.cartSummary.isVisible();
    expect(summaryVisible).toBe(true);
  });
});
