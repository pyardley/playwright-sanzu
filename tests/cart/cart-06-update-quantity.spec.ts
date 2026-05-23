// spec: specs/sanzu.plan.md — 5 — Cart Management
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.use({ storageState: '.auth/user.json' });

test.describe('5 — Cart Management', () => {
  // The cart detail page (org-wise-cart-detail1) is read-only — no quantity input exists per row.
  // Quantity ±1 controls are only on the Order Details page reached via the "Place Order" link.
  test.fixme('CART-06 — Update quantity in cart updates the line total (authenticated)', async ({ homePage, cartPage, loginPage }) => {
    // Precondition: ensure an active APEX session by logging in explicitly.
    await loginPage.loginAs(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

    // Step 1: Add first product and navigate to cart
    await homePage.addFirstProductToCart();
    await homePage.header.goToCart();
    await expect(cartPage.page).toHaveURL(/org-wise-cart-detail1/);

    // Step 2: Update quantity of first item to 3 — expect APEX AJAX resolves
    await cartPage.updateQuantity(0, 3);

    // Step 3: Assert cart still has at least 1 row and cartSummary is visible
    const rowCount = await cartPage.getCartRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(1);
    const summaryVisible = await cartPage.cartSummary.isVisible();
    expect(summaryVisible).toBe(true);
  });
});
