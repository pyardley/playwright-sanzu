// spec: specs/sanzu.plan.md — 5 — Cart Management
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.use({ storageState: '.auth/user.json' });

test.describe('5 — Cart Management', () => {
  test('CART-02 — Cart sidebar total link navigates to cart detail page (authenticated)', async ({ homePage, cartPage, loginPage }) => {
    // Precondition: ensure an active APEX session by logging in explicitly.
    await loginPage.loginAs(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

    // Step 1: Add first product — expect cart total is positive
    await homePage.addFirstProductToCart();
    const total = await homePage.header.getCartTotal();
    expect(parseFloat(total.replace(/,/g, ''))).toBeGreaterThan(0);

    // Step 2: Navigate to cart via header link — expect cart detail URL and no login redirect
    await homePage.header.goToCart();
    await expect(cartPage.page).toHaveURL(/org-wise-cart-detail1\?p42_pid_org=1/);
    await expect(cartPage.page).not.toHaveURL(/login_desktop/);

    // Step 3: Assert at least one cart row is present
    const rowCount = await cartPage.getCartRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });
});
