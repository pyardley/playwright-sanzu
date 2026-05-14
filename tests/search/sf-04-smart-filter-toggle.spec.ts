// spec: specs/sanzu.plan.md — Area 2: Search and Filtering
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

// SF-04 is a guest test — clear any inherited auth storageState so the fixture
// behaves as an unauthenticated session when run under chromium-auth project.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('2 — Search and Filtering', () => {
  test('SF-04 — Smart Filter expands and collapses on toggle', async ({ homePage, page }) => {
    // Step 1: Preconditions: guest. Navigate to /home via homePage fixture.
    await expect(page).toHaveURL(/\/home/);

    // Step 2: Assert the Smart Filter region (homePage.smartFilter.root) is initially collapsed.
    // Expect: CSS class 'is-collapsed' is present on the region element (#faceted-id).
    // Expect: Smart Filter body (.t-Region-body.a-Collapsible-content) has display:none.
    const smartFilterRoot = page.locator('#faceted-id');
    await expect(smartFilterRoot).toHaveClass(/is-collapsed/);

    const smartFilterBody = page.locator('#faceted-id .t-Region-body.a-Collapsible-content');
    await expect(smartFilterBody).not.toBeVisible();

    // Step 3: Call homePage.smartFilter.expand() which clicks the 'Smart Filter' button.
    // Expect: APEX collapsible region animates open.
    // Expect: The 'is-collapsed' class is removed from the region element.
    // Expect: The region body becomes visible.
    await homePage.smartFilter.expand();

    await expect(smartFilterRoot).not.toHaveClass(/is-collapsed/);
    await expect(smartFilterBody).toBeVisible();

    // Step 4: Click the Smart Filter toggle button again to collapse.
    // Expect: Region returns to collapsed state.
    // Expect: 'is-collapsed' class is reapplied.
    await homePage.smartFilter.toggleBtn.click();
    await expect(smartFilterRoot).toHaveClass(/is-collapsed/);
    await expect(smartFilterBody).not.toBeVisible();
  });
});
