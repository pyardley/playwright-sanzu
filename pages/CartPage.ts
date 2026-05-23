import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartSummaryComponent } from '../components/CartSummaryComponent';
import { HeaderComponent } from '../components/HeaderComponent';

export class CartPage extends BasePage {
  // Confirmed from live snapshot: cart detail alias is "org-wise-cart-detail1"; p42_pid_org=1 is required to load cart items
  readonly path = `${CartPage.APEX_ROOT}/org-wise-cart-detail1?p42_pid_org=1`;
  readonly header: HeaderComponent;
  readonly cartSummary: CartSummaryComponent;
  readonly cartRows: Locator;
  readonly emptyCartMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.cartSummary = new CartSummaryComponent(page);
    // Scope to the main cart content table (has "Product Name" column), exclude header and total rows
    this.cartRows = page
      .getByRole('table')
      .filter({ has: page.getByRole('columnheader', { name: 'Product Name' }) })
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') })
      .filter({ hasNotText: /^\s*Total/ });
    this.emptyCartMessage = page
      .getByText(/your cart is empty|no items in cart|cart is empty/i)
      .first();
  }

  async getCartRowCount(): Promise<number> {
    return this.cartRows.count();
  }

  async removeItemByIndex(index: number) {
    const row = this.cartRows.nth(index);
    const removeBtn = row
      .getByRole('button', { name: /remove|delete/i })
      .or(row.locator('.t-Button--danger, [data-action="remove"]'))
      .first();
    await removeBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  async updateQuantity(index: number, qty: number) {
    const row = this.cartRows.nth(index);
    const qtyInput = row
      .locator('input[type="number"], [id*="QTY"], [name*="QUANTITY"]')
      .first();
    await qtyInput.fill(String(qty));
    await qtyInput.press('Tab');
    await this.page.waitForLoadState('networkidle');
  }

  async proceedToCheckout() {
    await this.cartSummary.proceedToCheckout();
    // Navigates to Order Details page (f?p=111:12:...), not a /checkout canonical URL
  }
}
