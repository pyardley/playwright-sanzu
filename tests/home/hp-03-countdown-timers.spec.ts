// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('1 — Home Page', () => {
  test('HP-03 — Countdown timers display on discounted product cards', async ({ homePage, page }) => {
    // Step 1: Preconditions: guest. Navigate to /home via homePage fixture.
    await expect(page).toHaveTitle('Home');

    // Step 2: Locate the product list and check for 'Offer ends..' text and
    // numeric Days / Hrs / Min / Sec sub-elements on discounted product cards.
    await homePage.waitForProducts();
    const productGrid = homePage.productGrid;

    // expect: countdown timer elements are visible in the product grid.
    // Note: "Offer ends.." text is rendered via CSS ::before pseudo-element on .countdown-button
    // and cannot be matched by getByText — use the CSS class selector instead.
    await expect(productGrid.locator('.countdown').first()).toBeVisible();

    // expect: Four numeric counters (Days, Hrs, Min, Sec) are visible
    await expect(productGrid.locator('.time-label', { hasText: 'Days' }).first()).toBeVisible();
    await expect(productGrid.locator('.time-label', { hasText: 'Hrs' }).first()).toBeVisible();
    await expect(productGrid.locator('.time-label', { hasText: 'Min' }).first()).toBeVisible();
    await expect(productGrid.locator('.time-label', { hasText: 'Sec' }).first()).toBeVisible();

    // Step 3: Assert the Redmi 15 card (no discount) does NOT show a countdown timer.
    // Find its <li> by locating the card whose title contains 'Redmi'.
    const redmiCard = productGrid.locator('li').filter({ hasText: /redmi/i }).first();
    await expect(redmiCard).toBeVisible();
    await expect(redmiCard.locator('.countdown')).not.toBeVisible();
  });
});
