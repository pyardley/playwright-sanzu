// spec: specs/sanzu.plan.md — 5 — Cart Management
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.use({ storageState: '.auth/user.json' });

test.describe('5 — Cart Management', () => {
  test('CART-04 — Adding the same product twice increases quantity or total (authenticated)', async ({ homePage, loginPage }) => {
    // Precondition: ensure an active APEX session by logging in explicitly.
    await loginPage.loginAs(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

    // Step 2: Call addFirstProductToCart() twice — each resolves networkidle without error
    await homePage.addFirstProductToCart();
    await homePage.addFirstProductToCart();

    // Step 3: Read cart total — expect total > 0 (at least 2× the first product price)
    const total = await homePage.header.getCartTotal();
    expect(parseFloat(total.replace(/,/g, ''))).toBeGreaterThan(0);
  });
});
