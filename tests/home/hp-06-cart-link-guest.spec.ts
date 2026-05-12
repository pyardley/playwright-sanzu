// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('1 — Home Page', () => {
  test('HP-06 — Cart total link navigates to cart detail page (guest is redirected to login)', async ({ homePage, page }) => {
    // Step 1: Preconditions: guest. Navigate to /home via homePage fixture.
    await expect(page).toHaveTitle('Home');

    // Step 2: Locate the Cart Region total link (homePage.header.cartTotal, link text '0.00') and click it.
    await homePage.header.cartTotal.click();

    // expect: Browser redirects to /login_desktop because cart detail page requires authentication
    await expect(page).toHaveURL(/login_desktop/);
    // expect: Page title is 'LOGIN'
    await expect(page).toHaveTitle('LOGIN');
  });
});
