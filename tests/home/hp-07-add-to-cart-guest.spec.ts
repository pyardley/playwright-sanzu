// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('1 — Home Page', () => {
  test('HP-07 — Add to Cart button redirects guest user to login', async ({ homePage, page }) => {
    // Step 1: Preconditions: guest. Navigate to /home via homePage fixture.
    await expect(page).toHaveTitle('Home');

    // Step 2: Click the first 'Add to Cart' button.
    // APEX note: In guest state the button triggers an alert dialog 'Please login to keep
    // record your selection.' and then redirects to /login_desktop.
    page.once('dialog', dialog => dialog.accept());
    await homePage.addFirstProductToCart();

    // expect: Browser navigates to /login_desktop
    await expect(page).toHaveURL(/login_desktop/);
    // expect: Page title is 'LOGIN'
    await expect(page).toHaveTitle('LOGIN');
    // expect: No cart update occurs (we are now on the login page, not home)
    await expect(page).not.toHaveURL(/\/home/);
  });
});
