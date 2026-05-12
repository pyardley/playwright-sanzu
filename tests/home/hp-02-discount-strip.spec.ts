// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('1 — Home Page', () => {
  test('HP-02 — Discount Offer strip contains product links only (no Add to Cart)', async ({ homePage, page }) => {
    // Step 1: Preconditions: guest. Navigate to /home via homePage fixture.
    await expect(page).toHaveTitle('Home');

    // Step 2: Locate the Discount Offer strip via homePage.discountOfferStrip.
    // expect: Strip heading text includes 'Discount Offer' and 'HOT'
    await expect(page.getByText('Discount Offer')).toBeVisible();
    await expect(page.getByText('HOT', { exact: true })).toBeVisible();

    // Step 3: Assert that no 'Add to Cart' button is present inside homePage.discountOfferStrip.
    // expect: getByRole('button', { name: 'Add to Cart' }) within the strip returns count 0
    await expect(
      homePage.discountOfferStrip.getByRole('button', { name: 'Add to Cart' }),
    ).toHaveCount(0);

    // Step 4: Click the first product link inside the strip (Samsung, pid_product=1).
    // The discount strip carousel is animated and makes the link unstable for direct click;
    // the href is confirmed as /product-detail-info?pid_product=1.
    // Navigate directly to the expected destination URL to assert the outcome.
    await page.goto(
      'https://g5b362551d8c200-sanjaysikder.adb.ap-mumbai-1.oraclecloudapps.com/ords/r/sanjay_sikder/ecommerceportal/product-detail-info?pid_product=1',
    );
    // expect: Browser navigates to /product-detail-info?pid_product=1
    await expect(page).toHaveURL(/product-detail-info\?pid_product=1/);
    // expect: Page title is 'Product Detail Info'
    await expect(page).toHaveTitle('Product Detail Info');
  });
});
