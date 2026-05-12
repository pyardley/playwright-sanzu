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

    // expect: Text 'Offer ends..' is visible in the product grid
    await expect(productGrid.getByText('Offer ends..')).toBeVisible();

    // expect: Four numeric counters (Days, Hrs, Min, Sec) are visible
    await expect(productGrid.getByText('Days').first()).toBeVisible();
    await expect(productGrid.getByText('Hrs').first()).toBeVisible();
    await expect(productGrid.getByText('Min').first()).toBeVisible();
    await expect(productGrid.getByText('Sec').first()).toBeVisible();

    // Step 3: Assert the Redmi 15 card (no discount, pid_product=13) does NOT show countdown.
    // The Redmi 15 list item heading uses the format "Product Pic 19,999.00" with no countdown.
    // expect: The Redmi 15 list item heading does not include countdown text
    const redmiHeading = page.getByRole('heading', { name: 'Product Pic 19,999.00' });
    await expect(redmiHeading).toBeVisible();
    // Confirm the heading text does NOT contain 'Offer ends..'
    await expect(redmiHeading).not.toContainText('Offer ends..');
  });
});
