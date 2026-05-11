import { Page, Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

// Products on the home page are <li> items. Two layouts exist:
//  1. "Discount Offer" strip — link-only cards (no Add to Cart button)
//  2. "Offer ends" list   — full cards WITH Add to Cart button
// This component targets layout 2 (list items that have the Add to Cart button).
export class ProductCardComponent extends BaseComponent {
  readonly title: Locator;
  readonly originalPrice: Locator;
  readonly salePrice: Locator;
  readonly discountBadge: Locator;
  readonly addToCartBtn: Locator;
  readonly detailLink: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    // Product name is the first text node inside the product-info section
    this.title        = root.locator('text').first().or(root.locator('[class*="name"], [class*="title"]').first());
    // Snapshot: deletion element holds original price, adjacent text holds sale price
    this.originalPrice = root.locator('del, s, [class*="original"], deletion').first();
    this.salePrice     = root.locator('[class*="price"]:not(del):not(s)').first();
    this.discountBadge = root.locator('h4, [class*="discount"], heading').filter({ hasText: /discount/i }).first();
    // Add to Cart: APEX renders this as a <button> inside a <a href="javascript:...">
    this.addToCartBtn  = root.getByRole('button', { name: 'Add to Cart' }).first();
    // The product image link navigates to the product detail page
    this.detailLink    = root.getByRole('link', { name: /product pic|^add/i }).first();
  }

  async getTitle(): Promise<string> {
    // Name text is a direct text node sibling to the ID text inside the info section
    const text = await this.root.locator('[class*="info"], [class*="name"], [class*="detail"]')
      .first()
      .textContent()
      .catch(() => '');
    return text?.split('\n').map(l => l.trim()).filter(Boolean)[0] ?? '';
  }

  async getOriginalPrice(): Promise<string> {
    return (await this.originalPrice.textContent())?.trim() ?? '';
  }

  async getSalePrice(): Promise<string> {
    return (await this.salePrice.textContent())?.trim() ?? '';
  }

  async getDiscountText(): Promise<string | null> {
    if (await this.discountBadge.isVisible({ timeout: 2_000 }).catch(() => false)) {
      return (await this.discountBadge.textContent())?.trim() ?? null;
    }
    return null;
  }

  async addToCart(): Promise<void> {
    await this.addToCartBtn.scrollIntoViewIfNeeded();
    await this.addToCartBtn.click();
    // APEX processes $s('P1_ADD_PRODUCT', N) via AJAX — wait for network to settle
    await this.page.waitForLoadState('networkidle');
  }

  async clickDetailLink(): Promise<void> {
    await this.detailLink.click();
    await this.page.waitForLoadState('networkidle');
  }
}
