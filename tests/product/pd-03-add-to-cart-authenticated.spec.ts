// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.use({ storageState: '.auth/user.json' });

test.describe('4 — Product Detail Page', () => {
  test('PD-03 — Add To Cart from detail page updates cart sidebar (authenticated)', async ({ productDetailPage, loginPage, page }) => {
    // Precondition: ensure an active APEX session by logging in explicitly.
    await loginPage.loginAs(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

    // Step 1: Authenticated. Navigate to /product-detail-info?pid_product=1
    // APEX uses URL-based sessions — include session param from post-login URL to avoid
    // anonymous session being created for the form submission (addToCart would redirect to login).
    const sessionId = new URL(page.url()).searchParams.get('session') ?? '';
    await page.goto(productDetailPage.path + '?pid_product=1' + (sessionId ? '&session=' + sessionId : ''));
    // expect: Page title is 'Product Detail Info'
    await expect(page).toHaveTitle('Product Detail Info');

    // Step 2: Note current cart total from sidebar Cart Region table
    const cartRegionTable = page.getByRole('table', { name: 'Cart Region' });
    const initialCartTotalCell = cartRegionTable.getByRole('cell').last();

    // Step 3: Call productDetailPage.setQuantity(1)
    await page.getByRole('textbox', { name: 'Quantity' }).fill('1');
    // expect: Quantity input shows '1'
    await expect(page.getByRole('textbox', { name: 'Quantity' })).toHaveValue('1');

    // Step 4: Call productDetailPage.addToCart()
    await productDetailPage.addToCart();
    // expect: Cart Region sidebar total > 0.00
    const cartLink = cartRegionTable.getByRole('link').first();
    await expect(cartLink).not.toHaveText('0.00');
    // expect: No error dialog — page still at product-detail-info
    await expect(page).toHaveURL(/product-detail-info/);
  });
});
