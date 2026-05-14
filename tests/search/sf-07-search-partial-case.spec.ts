// spec: specs/sanzu.plan.md — Area 2: Search and Filtering
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('2 — Search and Filtering', () => {
  // test.fixme: The APEX demo instance (Oracle Cloud free tier) does not maintain server-side
  // sessions across storageState restores. APEX renders the home page in guest mode even when
  // the ORA_WWV_APP_111 cookie is present (nav shows "Login"/"Sign Up", not a user menu).
  // As a result, the search form POST to wwv_flow.accept is rejected and APEX redirects to
  // login_desktop instead of returning filtered results. The underlying session-persistence
  // limitation is in the APEX demo environment, not the test code.
  test.fixme('SF-07 — Search with partial and case-insensitive term (authenticated)', async ({ homePage, page }) => {
    // Step 1: Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home via homePage fixture.
    await expect(page).toHaveURL(/\/home/);

    // Step 2: Call homePage.header.search('infinix') (all lowercase).
    // Expect: Products with 'Infinix' or 'infinix' in their name are returned.
    // Expect: Search is case-insensitive (Infinix Hot 40 Pro, infinix Hot 50 Pro, Infinix Note 40s).
    await homePage.header.search('infinix');
    // App redirects to login_desktop instead of staying on /home — APEX session not authenticated.
    await expect(page).toHaveURL(/\/home/);

    const infinixCards = await homePage.getProductCards();
    expect(infinixCards.length).toBeGreaterThan(0);

    for (const card of infinixCards) {
      const title = await card.getTitle();
      expect(title.toLowerCase()).toContain('infinix');
    }

    // Step 3: Call homePage.header.search('head') (partial match for headphones).
    // Expect: Products containing 'head' in their name are returned (Awei AT7 Headphone, HD Stereo Wired headphones).
    await homePage.header.search('head');
    await expect(page).toHaveURL(/\/home/);

    const headCards = await homePage.getProductCards();
    expect(headCards.length).toBeGreaterThan(0);

    for (const card of headCards) {
      const title = await card.getTitle();
      expect(title.toLowerCase()).toContain('head');
    }
  });
});
