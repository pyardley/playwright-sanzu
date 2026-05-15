// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('1 — Home Page', () => {
  test('HP-05 — Header elements are present in guest state', async ({ homePage, page }) => {
    // Step 1: Preconditions: guest. Navigate to /home via homePage fixture.
    await expect(page).toHaveTitle('Home');

    // Step 2: Assert homePage.header.searchInput is visible.
    // expect: Search Product textbox is visible with placeholder 'Search Product'
    await expect(homePage.header.searchInput).toBeVisible();

    // Step 3: Assert the nav list contains a 'Login' link and a 'Sign Up' link.
    // Note: on mobile APEX hides nav text labels (display:none on .t-Button-label),
    // so the Login link is matched by href instead of accessible name.
    // expect: A link to the login page exists in the nav list
    await expect(homePage.header.loginLink).toBeVisible();
    // expect: Link with text 'Sign Up' exists in the nav list (or by href pattern)
    await expect(homePage.header.signUpLink).toBeVisible();

    // Step 4: Assert NO username button is visible (guest state only has Home, Login, Sign Up).
    // expect: No button matching the authenticated username pattern is visible in the nav list
    await expect(homePage.header.navButtons).toHaveCount(0);

    // Step 5: Assert the Cart Region table is visible with Qty and Total column headers.
    // expect: table[aria-label='Cart Region'] is visible
    await expect(homePage.header.cartWidget).toBeVisible();
    // expect: Column headers 'Qty' and 'Total' are present
    await expect(homePage.header.cartQtyHeader).toBeVisible();
    await expect(homePage.header.cartTotalHeader).toBeVisible();
    // expect: Total cell shows '0.00' for an empty session cart
    await expect(homePage.header.cartTotal).toHaveText('0.00');

    // Step 6: Click the 'Demo Organization' logo link in the header.
    // expect: Browser stays on or re-navigates to /home
    await homePage.header.logoLink.click();
    // expect: Page title remains 'Home'
    await expect(page).toHaveTitle('Home');
    await expect(page).toHaveURL(/\/home/);
    // Home link may have icon-only label on mobile, match by href as fallback
    await expect(homePage.header.homeLink).toBeVisible();
  });
});
