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
  readonly reviewText: Locator;

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
    this.reviewText    = root.getByText(/\(\d+(\.\d+)? \/ 5 from \d+ reviews\)/);
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
    // timeout: 0 — products are already rendered; no del/s means no discount, return immediately
    return (await this.originalPrice.textContent({ timeout: 0 }).catch(() => null))?.trim() ?? '';
  }

  async getSalePrice(): Promise<string> {
    // APEX renders the sale price as a text node or bare element adjacent to <del>/<s>.
    // The class-based locator is kept as a fast path; the evaluate fallback walks the DOM.
    // timeout: 0 — if the class-based element isn't present at render time it won't appear later
    const fast = await this.salePrice.textContent({ timeout: 0 }).catch(() => null);
    if (fast?.trim()) return fast.trim();
    return this.root.evaluate((li: HTMLElement) => {
      const del = li.querySelector('del, s');
      if (del) {
        // Products WITH discount: price is the text/element after <del>
        const nextEl = del.nextElementSibling;
        if (nextEl && !/^(del|s)$/i.test(nextEl.tagName)) {
          const t = nextEl.textContent?.trim() ?? '';
          if (t && /\d/.test(t)) return t;
        }
        let node: Node | null = del.nextSibling;
        while (node) {
          const t = (node.textContent ?? '').trim();
          if (t && /\d/.test(t)) return t;
          node = node.nextSibling;
        }
      }
      // Products WITHOUT discount: price is a bare text node in the h3, after the image link
      const h3 = li.querySelector('h3');
      if (h3) {
        // Walk h3 text nodes directly, skip child elements
        const walker = document.createTreeWalker(h3, NodeFilter.SHOW_TEXT);
        let n: Node | null;
        while ((n = walker.nextNode())) {
          const t = (n.textContent ?? '').trim();
          if (t && /[\d,]+\.\d{2}/.test(t)) return t;
        }
      }
      return '';
    });
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
