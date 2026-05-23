// spec: specs/sanzu.plan.md — 6 — Checkout
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.use({ storageState: '.auth/user.json' });

test.describe('6 — Checkout', () => {
  // The checkout flow lands on Order Details (f?p=111:12), not a /checkout URL. The Order Details
  // page has a "Shipping Address" field and final "Place Order" button, but no firstName/email/zip
  // fields. Validation behaviour (required fields, error messages) has not been confirmed live.
  test.fixme('CHK-03 — Submitting empty checkout form shows APEX validation error (authenticated)', async ({ homePage, cartPage, checkoutPage, loginPage, page }) => {
    // Precondition: ensure an active APEX session by logging in explicitly.
    await loginPage.loginAs(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

    // Step 1: Navigate to checkout via cart
    await homePage.addFirstProductToCart();
    await homePage.header.goToCart();
    await cartPage.proceedToCheckout();

    // Step 2: Attempt to place order without filling any fields
    await checkoutPage.placeOrder();

    // Step 3: Assert APEX validation error is visible
    const apexError = page
      .locator('.t-Alert--danger, .apex-page-error, [class*="error"]')
      .first();
    await expect(apexError).toBeVisible({ timeout: 10_000 });

    // expect: Page stays on checkout URL
    await expect(page).toHaveURL(/checkout/);
  });
});
