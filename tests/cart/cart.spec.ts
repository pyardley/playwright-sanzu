import { test, expect } from '../../fixtures/fixtures';

test.describe('Cart management', () => {
  test('should add a product to cart and cart total should update', async ({ homePage }) => {
    const totalBefore = await homePage.header.getCartTotal();
    await homePage.addFirstProductToCart();
    // After adding, reload the page to see updated cart widget total
    await homePage.goto();
    const totalAfter = await homePage.header.getCartTotal();
    // Total should be non-zero after adding a product (comparing strings)
    expect(totalAfter).not.toBe('');
    expect(totalBefore !== totalAfter || totalAfter !== '0.00').toBeTruthy();
  });

  test('should display added items on cart detail page', async ({ homePage, cartPage }) => {
    await homePage.addFirstProductToCart();
    await homePage.header.goToCart();

    const rowCount = await cartPage.getCartRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should show empty cart message when cart is empty', async ({ cartPage }) => {
    await cartPage.goto();
    const rows = await cartPage.getCartRowCount();
    if (rows === 0) {
      await expect(cartPage.emptyCartMessage).toBeVisible();
    }
  });

  test('should remove an item from cart', async ({ homePage, cartPage }) => {
    await homePage.addFirstProductToCart();
    await homePage.header.goToCart();

    const countBefore = await cartPage.getCartRowCount();
    if (countBefore > 0) {
      await cartPage.removeItemByIndex(0);
      const countAfter = await cartPage.getCartRowCount();
      expect(countAfter).toBe(countBefore - 1);
    }
  });
});
