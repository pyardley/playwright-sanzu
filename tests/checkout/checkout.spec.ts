import { test, expect } from '../../fixtures/fixtures';

const SHIPPING = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test.user@example.com',
  address: '123 Test Street',
  city: 'Mumbai',
  zip: '400001',
};

const PAYMENT = {
  number: '4111111111111111',
  expiry: '12/26',
  cvv: '123',
};

test.describe('Checkout — happy path', () => {
  test.beforeEach(async ({ homePage }) => {
    // Ensure at least one item in cart before checkout tests
    await homePage.addFirstProductToCart();
    await homePage.header.goToCart();
  });

  test('should reach checkout page from cart', async ({ cartPage }) => {
    await cartPage.proceedToCheckout();
    await expect(cartPage.page).toHaveURL(/checkout/i);
  });

  test('should display order confirmation after successful checkout', async ({
    cartPage,
    checkoutPage,
  }) => {
    await cartPage.proceedToCheckout();
    await checkoutPage.fillShippingDetails(SHIPPING);
    await checkoutPage.fillPaymentDetails(PAYMENT);
    await checkoutPage.placeOrder();

    await expect(checkoutPage.confirmationMessage).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Checkout — negative cases', () => {
  test('should show validation errors when submitting empty checkout form', async ({
    cartPage,
    checkoutPage,
  }) => {
    // Add item first
    const homePage = await cartPage.page.goto('/');
    await cartPage.page.waitForLoadState('networkidle');

    await checkoutPage.goto();
    await checkoutPage.placeOrder();

    // APEX validation should surface field errors
    const errorVisible = await cartPage.page
      .locator('.t-Alert--danger, .apex-page-error, [class*="error"]')
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
    expect(errorVisible).toBe(true);
  });
});
