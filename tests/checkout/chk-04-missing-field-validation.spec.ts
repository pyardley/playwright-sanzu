// spec: specs/sanzu.plan.md — 6 — Checkout
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.use({ storageState: '.auth/user.json' });

test.describe('6 — Checkout', () => {
  // The Order Details page has no email field — the form only has Shipping Address, Shipping Notes,
  // and payment method radio. fillShippingDetails() targets non-existent fields so this test cannot
  // exercise the intended scenario against the actual application.
  test.fixme('CHK-04 — Missing email field shows APEX validation error and blocks order (authenticated)', async ({ homePage, cartPage, checkoutPage, loginPage, page }) => {
    // Precondition: ensure an active APEX session by logging in explicitly.
    await loginPage.loginAs(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

    // Step 1: Navigate to checkout via cart
    await homePage.addFirstProductToCart();
    await homePage.header.goToCart();
    await cartPage.proceedToCheckout();

    // Step 2: Fill shipping details with email left blank
    await checkoutPage.fillShippingDetails({
      firstName: 'Test',
      lastName: 'User',
      email: '',
      address: '123 Test Street',
      city: 'Mumbai',
      zip: '400001',
    });

    // Step 3: Fill payment details
    await checkoutPage.fillPaymentDetails({
      number: '4111111111111111',
      expiry: '12/26',
      cvv: '123',
    });

    // Step 4: Attempt to place order
    await checkoutPage.placeOrder();

    // expect: APEX validation error visible referencing email field
    const apexError = page
      .locator('.t-Alert--danger, .apex-page-error, [class*="error"]')
      .first();
    await expect(apexError).toBeVisible({ timeout: 10_000 });

    // expect: Confirmation message is NOT visible
    await expect(checkoutPage.confirmationMessage).not.toBeVisible();

    // expect: URL stays on checkout
    await expect(page).toHaveURL(/checkout/);
  });
});
