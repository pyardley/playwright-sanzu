// spec: specs/sanzu.plan.md — 6 — Checkout
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.use({ storageState: '.auth/user.json' });

test.describe('6 — Checkout', () => {
  // After clicking "Place Order" on the cart page the app navigates to Order Details which shows
  // Order ID (e.g. "1-2605230742"). However, reaching a final post-payment confirmation page
  // requires filling Shipping Address and clicking the second "Place Order" button on Order Details
  // — a flow not covered by the current CheckoutPage page object (wrong field assumptions).
  test.fixme('CHK-06 — Order number or confirmation identifier is visible after successful checkout (authenticated)', async ({ homePage, cartPage, checkoutPage, loginPage }) => {
    // Precondition: ensure an active APEX session by logging in explicitly.
    await loginPage.loginAs(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

    // Step 1: Complete full checkout flow
    await homePage.addFirstProductToCart();
    await homePage.header.goToCart();
    await cartPage.proceedToCheckout();

    await checkoutPage.fillShippingDetails({
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@example.com',
      address: '123 Test Street',
      city: 'Mumbai',
      zip: '400001',
    });

    await checkoutPage.fillPaymentDetails({
      number: '4111111111111111',
      expiry: '12/26',
      cvv: '123',
    });

    await checkoutPage.placeOrder();

    // expect: Confirmation message is visible
    await expect(checkoutPage.confirmationMessage).toBeVisible({ timeout: 20_000 });

    // Step 2: Retrieve order number
    const orderNum = await checkoutPage.getOrderNumber();

    // expect: If orderNumber element is visible, it is a non-empty string
    if (orderNum !== null) {
      expect(orderNum.length).toBeGreaterThan(0);
    } else {
      // OR: confirmationMessage text contains a digit or alphanumeric pattern
      const confirmText = await checkoutPage.confirmationMessage.textContent();
      expect(confirmText).toMatch(/[A-Za-z0-9]/);
    }
  });
});
