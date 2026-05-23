// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('3 — Authentication', () => {
  test('AUTH-01 — Successful login with valid credentials redirects to home', async ({ loginPage, page }) => {
    // Step 2: Call loginPage.goto() to navigate to /login_desktop.
    await loginPage.goto();
    await expect(page).toHaveTitle('LOGIN');
    await expect(loginPage.loginForm.emailInput).toBeVisible();
    await expect(loginPage.loginForm.passwordInput).toBeVisible();
    await expect(loginPage.loginForm.submitButton).toBeVisible();

    // Step 3: Call loginPage.loginAs() with valid credentials.
    await loginPage.loginAs(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await expect(page).toHaveURL(/\/home/);
    await expect(page).toHaveTitle('Home');

    // Step 4: Assert authenticated username button is visible in the header nav list.
    await expect(loginPage.header.loggedInIndicator).toBeVisible();
    await expect(loginPage.header.loginLink).not.toBeVisible();
  });
});
