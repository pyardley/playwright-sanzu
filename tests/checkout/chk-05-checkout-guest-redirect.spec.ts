// spec: specs/sanzu.plan.md — 6 — Checkout
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

// No test.use({ storageState }) — guest (unauthenticated) test

test.describe('6 — Checkout', () => {
  test('CHK-05 — Guest user accessing checkout URL is denied access (no auth)', async ({ checkoutPage, page }) => {
    // Step 1: Navigate directly to checkout URL as a guest
    await checkoutPage.goto();

    // Step 2: Assert guest cannot access checkout — either redirected to login or page not found
    // APEX may redirect to /login_desktop OR return a 404 for unauthenticated access
    const currentUrl = page.url();
    const isOnLogin = currentUrl.includes('login_desktop');
    const isNotFound = currentUrl.includes('checkout') && (await page.title()) === 'Not Found';
    expect(isOnLogin || isNotFound).toBe(true);

    // expect: Checkout form is not shown (firstNameInput not visible)
    await expect(checkoutPage.firstNameInput).not.toBeVisible();
  });
});
