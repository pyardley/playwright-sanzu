// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('3 — Authentication', () => {
  test('AUTH-05 — Logout clears session and returns to login or home as guest', async ({ homePage, loginPage, page }) => {
    // Step 1: Preconditions: Log in explicitly so the APEX session is active, then
    // navigate back to /home (loginPage.loginAs redirects there after login).
    await loginPage.loginAs(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    // Assert username button is visible in the nav list.
    await expect(homePage.header.loggedInIndicator).toBeVisible();

    // Step 2: Call homePage.header.openUserMenu() — clicks the last button in the header nav list.
    await homePage.header.openUserMenu();

    // Step 3: Call homePage.header.logout() — clicks the logout link and waits for networkidle.
    await homePage.header.logout();

    // Step 4: Assert browser navigates to login_desktop or guest home.
    await expect(page).toHaveURL(/login_desktop|LOGIN_DESKTOP/i);

    // Step 5: Assert the username button is no longer visible in the nav.
    await expect(homePage.header.loggedInIndicator).not.toBeVisible();

    // Step 6: Assert the login form (Username textbox) reappears — confirming guest state.
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
  });
});
