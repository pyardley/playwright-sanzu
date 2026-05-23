// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('3 — Authentication', () => {
  test('AUTH-06 — Login page links to Sign Up and Forgot Password', async ({ loginPage, page }) => {
    // Step 1: Navigate to /login_desktop via loginPage.goto().
    await loginPage.goto();

    // Step 1: Verify page title is LOGIN.
    await expect(page).toHaveTitle('LOGIN');

    // Step 2: Assert the Sign Up link is present and visible.
    await expect(loginPage.header.signUpLink).toBeVisible();

    // Step 3: Assert the Forgot Password? link is present and visible.
    await expect(page.getByRole('link', { name: 'Forgot Password?' })).toBeVisible();

    // Step 4: Assert the Sanzu E-commerce heading link is visible and href ends in /home.
    const logoLink = page.getByRole('link', { name: 'Sanzu E-commerce', exact: true });
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toHaveAttribute('href', /\/home/);
  });
});
