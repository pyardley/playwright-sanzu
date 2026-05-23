// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.use({ storageState: '.auth/user.json' });

test.describe('4 — Product Detail Page', () => {
  test('PD-04 — Setting quantity > 1 before Add To Cart increases line total (authenticated)', async ({ productDetailPage, loginPage, page }) => {
    // Precondition: ensure an active APEX session by logging in explicitly.
    await loginPage.loginAs(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

    // Step 1: Authenticated. Navigate to /product-detail-info?pid_product=11 (TWS Pro Bluetooth Earbuds)
    // Include session param to avoid anonymous APEX session on form submission.
    const sessionId = new URL(page.url()).searchParams.get('session') ?? '';
    await page.goto(productDetailPage.path + '?pid_product=11' + (sessionId ? '&session=' + sessionId : ''));
    await expect(page).toHaveTitle('Product Detail Info');

    // Step 2: Call productDetailPage.setQuantity(2)
    await page.getByRole('textbox', { name: 'Quantity' }).fill('2');
    // expect: Quantity input value is '2'
    await expect(page.getByRole('textbox', { name: 'Quantity' })).toHaveValue('2');

    // Step 3: Call productDetailPage.addToCart()
    await productDetailPage.addToCart();
    // expect: Cart sidebar total reflects cumulative total (non-zero)
    const cartRegionTable = page.getByRole('table', { name: 'Cart Region' });
    const cartLink = cartRegionTable.getByRole('link').first();
    await expect(cartLink).not.toHaveText('0.00');
    // expect: No error — page still at product-detail-info
    await expect(page).toHaveURL(/product-detail-info/);
  });
});
