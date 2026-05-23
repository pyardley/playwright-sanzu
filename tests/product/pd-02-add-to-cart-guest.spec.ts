// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('4 — Product Detail Page', () => {
  test('PD-02 — Add To Cart button on detail page redirects guest to login', async ({ productDetailPage, page }) => {
    // Step 1: Guest. Navigate to /product-detail-info?pid_product=1
    await page.goto(productDetailPage.path + '?pid_product=1');
    // expect: Page title is 'Product Detail Info'
    await expect(page).toHaveTitle('Product Detail Info');

    // Step 2: Assert 'Add To Cart' button is visible
    // expect: 'Add To Cart' button visible
    await expect(page.getByRole('button', { name: 'Add To Cart' })).toBeVisible();

    // Step 3: Click productDetailPage.addToCartBtn
    // expect: Browser navigates to /login_desktop OR APEX auth challenge
    page.on('dialog', async dialog => dialog.accept());
    await page.getByRole('button', { name: 'Add To Cart' }).click();
    // expect: User is challenged to log in.
    // APEX may redirect to a login URL that contains "login_desktop", "f?p=111:101", or similar.
    await expect(page.getByRole('button', { name: 'LOGIN' })).toBeVisible();
    await expect(page).toHaveURL(/login_desktop|f\?p=111|login/i);
  });
});
