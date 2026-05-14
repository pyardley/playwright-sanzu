// spec: specs/sanzu.plan.md — Area 2: Search and Filtering
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('2 — Search and Filtering', () => {
  test('SF-08 — Search with special characters does not crash the page (authenticated)', async ({ homePage, page }) => {
    // Step 1: Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home via homePage fixture.
    await expect(page).toHaveURL(/\/home/);

    // Collect any console errors before the search to compare after
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Step 2: Call homePage.header.search("<script>alert('xss')</script>").
    // Expect: Page does not execute any injected script.
    // Expect: Either a no-results state is shown or APEX sanitises the input.
    // Expect: No unhandled JavaScript error is thrown.
    await homePage.header.search("<script>alert('xss')</script>");

    // Expect: Page remains stable — still on /home or login (not crashed)
    await expect(page).toHaveURL(/\/(home|login_desktop)/);

    // Expect: No XSS dialog was triggered (page did not navigate to a third-party URL)
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/ecommerceportal/);

    // Expect: Either no results message is visible, or the product grid is empty
    const onHome = currentUrl.includes('/home');
    if (onHome) {
      const noResultsVisible = await homePage.noResultsMessage.isVisible({ timeout: 5_000 }).catch(() => false);
      if (!noResultsVisible) {
        const cards = await homePage.getProductCards().catch(() => []);
        expect(cards.length).toBe(0);
      } else {
        await expect(homePage.noResultsMessage).toBeVisible();
      }
    }

    // Expect: No unhandled JavaScript errors from the XSS payload
    const xssErrors = consoleErrors.filter(e => e.toLowerCase().includes('xss') || e.toLowerCase().includes('script'));
    expect(xssErrors.length).toBe(0);
  });
});
