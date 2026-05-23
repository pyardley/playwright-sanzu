// spec: specs/sanzu.plan.md — 6 — Checkout
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.use({ storageState: '.auth/user.json' });

test.describe('6 — Checkout', () => {
  // The Order Details page (reached via "Place Order" link) does not have firstName/lastName/email/
  // city/zip/cardNumber/cardExpiry/cardCvv fields. The actual form has Shipping Address, Shipping
  // Notes, payment radio (Cash on Delivery / Pay Online), and a final "Place Order" button.
  test.fixme('CHK-02 — Complete checkout happy path places order and shows confirmation (authenticated)', async ({ homePage, cartPage, checkoutPage, loginPage }) => {
    // Precondition: ensure an active APEX session by logging in explicitly.
    await loginPage.loginAs(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

    // Step 1: Navigate to checkout via cart
    await homePage.addFirstProductToCart();
    await homePage.header.goToCart();
    await cartPage.proceedToCheckout();

    // Step 2: Fill shipping details
    await checkoutPage.fillShippingDetails({
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@example.com',
      address: '123 Test Street',
      city: 'Mumbai',
      zip: '400001',
    });

    // expect: All shipping fields populated
    await expect(checkoutPage.firstNameInput).toHaveValue('Test');
    await expect(checkoutPage.emailInput).toHaveValue('test.user@example.com');

    // Step 3: Fill payment details
    await checkoutPage.fillPaymentDetails({
      number: '4111111111111111',
      expiry: '12/26',
      cvv: '123',
    });

    // expect: Payment fields populated
    await expect(checkoutPage.cardNumberInput).toHaveValue('4111111111111111');

    // Step 4: Place order
    await checkoutPage.placeOrder();

    // expect: No APEX validation error appears — confirmation message is visible
    // Step 5: Confirmation message visible within 20 seconds
    await expect(checkoutPage.confirmationMessage).toBeVisible({ timeout: 20_000 });
  });
});
