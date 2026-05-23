// spec: specs/sanzu.plan.md — 6 — Checkout
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.use({ storageState: '.auth/user.json' });

test.describe('6 — Checkout', () => {
  // Direct page.goto() to the cart URL drops the APEX session (URL session param is required).
  // Additionally, the test user's cart is persistent across runs and always contains items, so
  // the "empty cart" precondition cannot be established without a cart-clear API that does not exist.
  test.fixme('CHK-07 — Empty cart prevents proceeding to checkout (authenticated)', async ({ cartPage, loginPage, page }) => {
    // Precondition: ensure an active APEX session by logging in explicitly.
    await loginPage.loginAs(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

    // Step 1: Navigate directly to cart page with empty cart
    await page.goto('/ords/r/sanjay_sikder/ecommerceportal/org-wise-cart-detail1?p42_pid_org=1');

    // expect: Cart page loads (URL contains org-wise-cart-detail1)
    await expect(page).toHaveURL(/org-wise-cart-detail1/);

    // Step 2: Check if checkout button is visible; if so, attempt to click it
    const checkoutBtnVisible = await cartPage.cartSummary.checkoutBtn
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (checkoutBtnVisible) {
      const isDisabled = await cartPage.cartSummary.checkoutBtn.isDisabled().catch(() => false);

      if (!isDisabled) {
        await cartPage.cartSummary.checkoutBtn.click();
      }

      // Step 3: Assert user cannot proceed — button disabled, APEX error shown, or page stays on cart
      const apexError = page
        .locator('.t-Alert--danger, .apex-page-error, [class*="error"]')
        .first();
      const errorVisible = await apexError.isVisible({ timeout: 5_000 }).catch(() => false);
      const staysOnCart = page.url().includes('org-wise-cart-detail1');

      expect(isDisabled || errorVisible || staysOnCart).toBe(true);
    } else {
      // Checkout button not visible with empty cart — cannot proceed
      await expect(cartPage.cartSummary.checkoutBtn).not.toBeVisible();
    }
  });
});
