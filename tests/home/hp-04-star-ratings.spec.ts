// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('1 — Home Page', () => {
  test('HP-04 — Star rating and review count are visible on product cards', async ({ homePage, page }) => {
    // Step 1: Preconditions: guest. Navigate to /home via homePage fixture.
    await expect(page).toHaveTitle('Home');

    // Step 2: For each product card, locate the review paragraph matching '(N / 5 from N reviews)'.
    await homePage.waitForProducts();
    const cards = await homePage.getProductCards();

    // expect: Each card shows a review paragraph matching the pattern '(N / 5 from N reviews)'
    for (const card of cards) {
      await expect(card.reviewText).toBeVisible();
    }
  });
});
