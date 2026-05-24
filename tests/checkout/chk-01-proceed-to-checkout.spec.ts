// spec: specs/sanzu.plan.md — 6 — Checkout
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';
import { HomePage } from '../../pages/HomePage';

test.use({ storageState: '.auth/user.json' });

test.describe('6 — Checkout', () => {
  test('CHK-01 — Proceed to checkout from cart navigates to checkout page (authenticated)', async ({ page, cartPage, loginPage }) => {
    // Log in explicitly to ensure a valid APEX session.
    // Using page + loginPage (not homePage fixture) avoids a redundant goto(/home) before login.
    await loginPage.loginAs(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    const homePage = new HomePage(page); // already on /home after loginAs — no extra goto()

    // Step 1: Add first product to cart and navigate to cart detail page
    await homePage.addFirstProductToCart();
    await homePage.header.goToCart();

    // expect: Cart detail page is loaded with at least one item
    const rowCount = await cartPage.getCartRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // Step 2: Proceed to checkout — "Place Order" link creates the order and navigates to Order Details
    await cartPage.proceedToCheckout();

    // expect: Page title is "Order Details" (APEX page 12; no canonical /checkout alias exists)
    await expect(cartPage.page).toHaveTitle('Order Details');

    // Step 3: Assert basic Order Details structure is visible
    const shippingAddressVisible = await cartPage.page
      .getByRole('textbox', { name: 'Shipping Address' })
      .isVisible()
      .catch(() => false);
    const placeOrderBtnVisible = await cartPage.page
      .getByRole('button', { name: /place order/i })
      .isVisible()
      .catch(() => false);
    expect(shippingAddressVisible || placeOrderBtnVisible).toBe(true);
  });
});
