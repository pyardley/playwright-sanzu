// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('4 — Product Detail Page', () => {
  test('PD-01 — Product detail page displays full product information', async ({ productDetailPage, page }) => {
    // Step 1: Guest. Navigate to /product-detail-info?pid_product=1
    await page.goto(productDetailPage.path + '?pid_product=1');
    // expect: Page title is 'Product Detail Info'
    await expect(page).toHaveTitle('Product Detail Info');

    // Step 2: Assert productName is visible; text matches 'Samsung'
    // expect: Product name visible and equals 'Samsung'
    await expect(page.getByRole('link', { name: 'Samsung' })).toBeVisible();

    // Step 3: Assert price row 'Price-মূল্য' shows '40,000.00'
    // expect: Full price '40,000.00' visible in details table
    await expect(page.getByText('40,000.00')).toBeVisible();

    // Step 4: Assert product image is visible (img element near Add To Cart button)
    // expect: Product image rendered and visible
    await expect(page.getByRole('img', { name: 'Default Logo' })).toBeVisible();

    // Step 5: Assert Review List table visible with expected columns
    // expect: Review table present
    const reviewTable = page.getByRole('table', { name: 'Review List' });
    await expect(reviewTable).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Client User' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Review Message' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Review Date' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'User Rating' })).toBeVisible();
    // expect: Samsung has >= 2 review rows
    const reviewRows = reviewTable.getByRole('row');
    expect(await reviewRows.count()).toBeGreaterThanOrEqual(3); // header + 2 data rows

    // Step 6: Assert Statistics region visible with expected rows
    // expect: Statistics table visible with expected rows
    await expect(page.getByRole('region', { name: 'Statistics' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Product Rate' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Total Chatting or Query' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Total Review' })).toBeVisible();

    // Step 7: Assert Rating Chart region is visible
    // expect: Rating Chart region present
    await expect(page.getByRole('region', { name: 'Rating Chart' })).toBeVisible();
  });
});
