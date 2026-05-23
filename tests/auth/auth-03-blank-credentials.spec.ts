// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe.configure({ retries: 0 });

test.describe('3 — Authentication', () => {
  test('AUTH-03 — Login with blank credentials shows validation error', async ({ loginPage, page }) => {
    // Step 1: Navigate to /login_desktop via loginPage.goto().
    await loginPage.goto();

    // Step 2: Call loginPage.loginForm.submit() without calling fill() (both fields remain empty).
    await loginPage.loginForm.submit();

    // Step 3: Assert page stays on /login_desktop.
    await expect(page).toHaveURL(/login_desktop/);

    // Step 3: Assert error or APEX validation message is visible.
    await expect(loginPage.loginForm.errorMessage).toBeVisible();
  });
});
