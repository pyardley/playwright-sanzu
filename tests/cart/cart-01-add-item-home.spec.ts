// spec: specs/sanzu.plan.md — 5 — Cart Management
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';
import { HomePage } from '../../pages/HomePage';

test.use({ storageState: '.auth/user.json' });

test.describe('5 — Cart Management', () => {
  test('CART-01 — Adding a product from home page updates cart sidebar total (authenticated)', async ({ page, loginPage }) => {
    // Log in explicitly to ensure a valid APEX session.
    // Using page + loginPage (not homePage fixture) avoids a redundant goto(/home) before login.
    await loginPage.loginAs(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    const homePage = new HomePage(page); // already on /home after loginAs — no extra goto()

    // Step 1: Note initial cart total
    const initialTotal = await homePage.header.getCartTotal();
    const initialValue = parseFloat(initialTotal.replace(/,/g, '')) || 0;

    // Step 2: Call addFirstProductToCart() — expect no redirect to /login_desktop
    await homePage.addFirstProductToCart();
    await expect(page).not.toHaveURL(/login_desktop/);

    // Step 3: Read cart total again — expect new total > initial total
    const updatedTotal = await homePage.header.getCartTotal();
    const updatedValue = parseFloat(updatedTotal.replace(/,/g, ''));
    expect(updatedValue).toBeGreaterThan(initialValue);
  });
});
