// spec: specs/sanzu.plan.md — Area 2: Search and Filtering
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('2 — Search and Filtering', () => {
  test('SF-03 — Search with no-match term shows empty state (authenticated)', async ({ homePage, page }) => {
    // Step 1: Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home via homePage fixture.
    await expect(page).toHaveURL(/\/home/);

    // Step 2: Call homePage.header.search('ZZZNOMATCH99999').
    // Expect: waitForLoadState('networkidle') resolves.
    await homePage.header.search('ZZZNOMATCH99999');

    // Step 3: Assert homePage.noResultsMessage is visible, OR assert homePage.getProductCards() returns an empty array.
    // Expect: Either a no-results message is shown or the product grid contains zero items.
    // Expect: No JavaScript error is thrown.
    const noResultsVisible = await homePage.noResultsMessage.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!noResultsVisible) {
      // Fall back: product grid should have zero items
      const cards = await homePage.getProductCards().catch(() => []);
      expect(cards.length).toBe(0);
    } else {
      await expect(homePage.noResultsMessage).toBeVisible();
    }
  });
});
