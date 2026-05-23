// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe.configure({ retries: 0 });

test.describe('3 — Authentication', () => {
  test('AUTH-04 — Login with valid email but wrong password does not throttle on first attempt', async ({ loginPage, page }) => {
    // Step 1: Navigate to /login_desktop via loginPage.goto().
    await loginPage.goto();

    // Step 2: Call loginPage.loginForm.fill() with valid email but wrong password.
    await loginPage.loginForm.fill(process.env.TEST_USER_EMAIL!, 'DefinitelyWrong!XYZ');

    // Step 3: Call loginPage.loginForm.submit().
    await loginPage.loginForm.submit();

    // Step 4: Assert page stays on /login_desktop (no redirect to /home).
    await expect(page).toHaveURL(/login_desktop/);

    // Step 4: Assert error message is displayed and page title remains LOGIN.
    await expect(loginPage.loginForm.errorMessage).toBeVisible();
    await expect(page).toHaveTitle('LOGIN');
  });
});
