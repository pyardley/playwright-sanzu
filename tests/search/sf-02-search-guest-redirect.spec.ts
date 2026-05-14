// spec: specs/sanzu.plan.md — Area 2: Search and Filtering
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

// SF-02 is a guest test — clear any inherited auth storageState so the fixture
// behaves as an unauthenticated session when run under chromium-auth project.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('2 — Search and Filtering', () => {
  test('SF-02 — Search redirects unauthenticated user to login', async ({ homePage, page }) => {
    // Step 1: Preconditions: guest. Navigate to /home via homePage fixture.
    await expect(page).toHaveURL(/\/home/);

    // Step 2: Call homePage.header.search('Samsung') — fills the textbox and presses Enter.
    // Expect: Browser navigates to /login_desktop.
    // Expect: Page title is 'LOGIN'.
    // Note: APEX search on this app requires an authenticated session; guest users are redirected.
    await homePage.header.search('Samsung');

    await expect(page).toHaveURL(/login_desktop/);
    await expect(page).toHaveTitle(/LOGIN/i);
  });
});
