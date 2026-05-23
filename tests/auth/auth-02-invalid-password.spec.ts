// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe.configure({ retries: 0 });

test.describe('3 — Authentication', () => {
  test('AUTH-02 — Login with invalid password shows error message', async ({ loginPage, page }) => {
    // Step 1: Navigate to /login_desktop via loginPage.goto().
    await loginPage.goto();

    // Step 2: Call loginPage.loginForm.fill() with invalid credentials.
    await loginPage.loginForm.fill('invalid@example.com', 'WrongPassword123!');

    // Step 3: Call loginPage.loginForm.submit().
    await loginPage.loginForm.submit();

    // Step 4: Assert page stays on /login_desktop (no redirect to /home).
    await expect(page).toHaveURL(/login_desktop/);

    // Step 4: Assert error message is visible.
    await expect(loginPage.loginForm.errorMessage).toBeVisible();

    // Step 4: Assert getError() returns a truthy string.
    const error = await loginPage.loginForm.getError();
    expect(error).toBeTruthy();
  });
});
