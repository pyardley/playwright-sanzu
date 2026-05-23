// spec: specs/sanzu.plan.md — 5 — Cart Management
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

// No storageState — guest (unauthenticated) test

test.describe('5 — Cart Management', () => {
  test('CART-07 — Cart detail page is protected — guest is redirected to login', async ({ cartPage }) => {
    // Step 1: Navigate directly to the cart detail page as a guest
    await cartPage.page.goto(cartPage.path + '?p42_pid_org=1');

    // Step 2: Expect URL redirects to /login_desktop
    await expect(cartPage.page).toHaveURL(/login_desktop/);

    // Step 3: Expect page title is 'LOGIN'
    await expect(cartPage.page).toHaveTitle('LOGIN');
  });
});
