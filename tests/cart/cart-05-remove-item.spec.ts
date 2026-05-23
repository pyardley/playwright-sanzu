// spec: specs/sanzu.plan.md — 5 — Cart Management
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.use({ storageState: '.auth/user.json' });

test.describe('5 — Cart Management', () => {
  // The cart detail page (org-wise-cart-detail1) is read-only — no remove button exists per row.
  // Delete ("X") controls are only on the Order Details page reached via the "Place Order" link.
  test.fixme('CART-05 — Remove item from cart reduces cart row count (authenticated)', async ({ homePage, cartPage, loginPage }) => {
    // Precondition: ensure an active APEX session by logging in explicitly.
    await loginPage.loginAs(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

    // Step 1: Add first product and navigate to cart
    await homePage.addFirstProductToCart();
    await homePage.header.goToCart();
    await expect(cartPage.page).toHaveURL(/org-wise-cart-detail1/);

    // Step 2: Record row count — expect at least 1
    const rowCount = await cartPage.getCartRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // Step 3: Remove the first item
    await cartPage.removeItemByIndex(0);

    // Step 4: If there was only 1 item, assert empty cart message is visible;
    // otherwise assert row count decreased by 1
    if (rowCount === 1) {
      await expect(cartPage.emptyCartMessage).toBeVisible();
    } else {
      const newRowCount = await cartPage.getCartRowCount();
      expect(newRowCount).toBe(rowCount - 1);
    }
  });
});
