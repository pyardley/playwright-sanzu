import { Page, Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class CartSummaryComponent extends BaseComponent {
  readonly items: Locator;
  readonly subtotal: Locator;
  readonly total: Locator;
  readonly checkoutBtn: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    // Root: the main cart content table (has "Product Name" column) or the Place Order link container
    const root = page
      .getByRole('table')
      .filter({ has: page.getByRole('columnheader', { name: 'Product Name' }) })
      .or(page.locator('.t-Region--cart, [id*="CART_SUMMARY"], .cart-summary'))
      .first();
    super(page, root);
    this.items = root.locator('.t-Report-cell, .cart-item, [class*="cart-row"]');
    this.subtotal = root
      .locator('[class*="subtotal"], [data-id="subtotal"]')
      .first();
    this.total = root
      .locator('[class*="total"]:last-of-type, [data-id="total"]')
      .first();
    // Cart detail page uses a "Place Order" link; product detail page has a "Checkout" button
    this.checkoutBtn = page
      .getByRole('link', { name: /place order/i })
      .or(page.getByRole('button', { name: /checkout|proceed/i }))
      .or(page.locator('.t-Button--hot[id*="CHECKOUT"]'))
      .first();
    this.emptyMessage = root.getByText(/cart is empty|no items/i).first();
  }

  async getItemCount(): Promise<number> {
    return this.items.count();
  }

  async getTotal(): Promise<string> {
    return (await this.total.textContent())?.trim() ?? '0';
  }

  async proceedToCheckout() {
    await this.checkoutBtn.click();
    await this.page.waitForLoadState('networkidle');
  }
}
