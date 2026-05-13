// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

const KNOWN_CATALOGUE = [
  'Samsung',
  'Honor X6b',
  'Infinix Hot 40 Pro',
  'infinix Hot 50 Pro',
  'Honor X8b',
  'iPhone 16 Pro Max',
  'Infinix Note 40s',
  'TWS Pro Bluetooth Earbuds',
  'Awei AT7 Headphone',
  'HD Stereo Wired headphones',
  'Redmi 15',
];

test.describe('1 — Home Page', () => {
  test('HP-01 — Product grid renders all catalogue items', async ({ homePage, page }) => {
    // Step 1: Preconditions: guest. Navigate to /home via homePage fixture.
    // expect: Page title is 'Home'
    await expect(page).toHaveTitle('Home');
    // expect: URL contains /home
    await expect(page).toHaveURL(/\/home/);

    // Step 2: Call homePage.waitForProducts() and then homePage.getProductCards().
    await homePage.waitForProducts();
    const cards = await homePage.getProductCards();
    // expect: The returned array contains exactly 11 items
    expect(cards).toHaveLength(11);

    // Step 3: For each card call card.getTitle(), card.getOriginalPrice(), card.getSalePrice().
    for (const card of cards) {
      const title = await card.getTitle();
      const salePrice = await card.getSalePrice();
      const originalPrice = await card.getOriginalPrice();

      // expect: getTitle() returns a non-empty string
      expect(title.length).toBeGreaterThan(0);
      // expect: getSalePrice() returns a non-empty string with numeric content
      expect(salePrice.length).toBeGreaterThan(0);
      expect(salePrice).toMatch(/\d/);
      // expect: For products with a discount, getOriginalPrice() is non-empty and greater than getSalePrice()
      if (originalPrice.length > 0) {
        const orig = parseFloat(originalPrice.replace(/,/g, ''));
        const sale = parseFloat(salePrice.replace(/,/g, ''));
        expect(orig).toBeGreaterThan(sale);
      }
    }

    // expect: Known catalogue names appear in the product grid
    for (const name of KNOWN_CATALOGUE) {
      await expect(page.getByText(new RegExp(name, 'i')).first()).toBeVisible();
    }

    // Step 4: Assert the Discount Offer / HOT strip is visible.
    // expect: Strip is visible and contains at least one product link
    // Note: the discount strip is a scrolling ticker — individual links may be off-screen.
    // Assert the strip container is visible and that at least one link exists (count > 0).
    await expect(homePage.discountOfferStrip).toBeVisible();
    await expect(page.getByText('Discount Offer')).toBeVisible();
    await expect(page.getByText('HOT', { exact: true }).first()).toBeVisible();
    const stripLinks = homePage.discountOfferStrip.getByRole('link');
    expect(await stripLinks.count()).toBeGreaterThan(0);
  });
});
