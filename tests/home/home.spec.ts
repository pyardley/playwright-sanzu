import { test, expect } from '../../fixtures/fixtures';

test.describe('Home page — guest browsing', () => {
  test('should display product cards with name and sale price', async ({ homePage }) => {
    const cards = await homePage.getProductCards();
    expect(cards.length).toBeGreaterThan(0);

    const title = await cards[0].getTitle();
    const price = await cards[0].getSalePrice();
    expect(title).toBeTruthy();
    expect(price).toBeTruthy();
  });

  test('should show login link for unauthenticated user', async ({ homePage }) => {
    await expect(homePage.header.loginLink).toBeVisible();
  });

  test('should navigate to product detail when detail link is clicked', async ({ homePage }) => {
    const cards = await homePage.getProductCards();
    expect(cards.length).toBeGreaterThan(0);
    await cards[0].clickDetailLink();
    await expect(homePage.page).toHaveURL(/product-detail-info/i);
  });

  test('should filter products when searching by keyword', async ({ homePage }) => {
    const cards = await homePage.getProductCards();
    const firstTitle = await cards[0].getTitle();
    const keyword = firstTitle.split(' ')[0];

    await homePage.searchProducts(keyword);

    const filtered = await homePage.getProductCards();
    expect(filtered.length).toBeGreaterThan(0);
    for (const card of filtered) {
      const t = await card.getTitle();
      expect(t.toLowerCase()).toContain(keyword.toLowerCase());
    }
  });

  test('should show no-results message for unmatched search', async ({ homePage }) => {
    await homePage.searchProducts('ZZZNONEXISTENTPRODUCT999');
    await expect(homePage.noResultsMessage).toBeVisible();
  });
});
