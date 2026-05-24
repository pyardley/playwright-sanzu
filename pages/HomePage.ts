import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from '../components/HeaderComponent';
import { ProductCardComponent } from '../components/ProductCardComponent';
import { SmartFilterComponent } from '../components/SmartFilterComponent';

export class HomePage extends BasePage {
  readonly path = `${HomePage.APEX_ROOT}/home`;
  readonly header: HeaderComponent;
  readonly smartFilter: SmartFilterComponent;
  // The product grid with Add to Cart buttons is a <ul> list below the offer banner
  readonly productGrid: Locator;
  readonly discountOfferStrip: Locator;
  readonly discountOfferLabel: Locator;
  readonly hotLabel: Locator;
  readonly noResultsMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.header       = new HeaderComponent(page);
    this.smartFilter  = new SmartFilterComponent(page);
    // Snapshot: products-with-Add-to-Cart are in a <ul> list that contains buttons named "Add to Cart"
    this.productGrid  = page.locator('ul').filter({
      has: page.getByRole('button', { name: 'Add to Cart' }),
    }).first();
    // The top "Discount Offer / HOT" strip is a scrolling ticker with product links (no Add to Cart).
    // APEX renders it inside #stiker-container or a div with class ticker_holder.
    this.discountOfferStrip  = page.locator('#stiker-container, .ticker_holder, [id*="ticker"]').first();
    this.discountOfferLabel  = page.getByText('Discount Offer');
    this.hotLabel            = page.getByText('HOT', { exact: true }).first();
    this.noResultsMessage    = page.getByText(/no products|no results|nothing found/i).first();
  }

  async waitForProducts() {
    await this.productGrid.waitFor({ state: 'visible', timeout: 20_000 });
  }

  /** Returns all product card components that have an "Add to Cart" button */
  async getProductCards(): Promise<ProductCardComponent[]> {
    await this.waitForProducts();
    const items = this.productGrid.locator('li');
    const count = await items.count();
    return Array.from(
      { length: count },
      (_, i) => new ProductCardComponent(this.page, items.nth(i)),
    );
  }

  /**
   * Extracts title, salePrice and originalPrice for every card in a single
   * evaluate() call — one browser round-trip instead of 3 per card.
   */
  async getAllProductCardData(): Promise<Array<{ title: string; salePrice: string; originalPrice: string }>> {
    await this.waitForProducts();
    return this.productGrid.evaluate((ul: HTMLElement) => {
      return Array.from(ul.querySelectorAll('li')).map((li) => {
        // Title: first non-empty line from the info/name/detail section
        const infoEl = li.querySelector('[class*="info"], [class*="name"], [class*="detail"]');
        const title = infoEl
          ? ((infoEl.textContent ?? '').split('\n').map((l: string) => l.trim()).filter(Boolean)[0] ?? '')
          : '';

        // Original price: struck-through element
        const originalEl = li.querySelector('del, s, [class*="original"]');
        const originalPrice = originalEl?.textContent?.trim() ?? '';

        // Sale price — mirrors ProductCardComponent.getSalePrice() logic
        let salePrice = '';
        const priceEl = li.querySelector('[class*="price"]:not(del):not(s)');
        if (priceEl?.textContent?.trim()) {
          salePrice = priceEl.textContent.trim();
        } else {
          const del = li.querySelector('del, s');
          if (del) {
            const nextEl = del.nextElementSibling;
            if (nextEl && !/^(del|s)$/i.test(nextEl.tagName)) {
              const t = nextEl.textContent?.trim() ?? '';
              if (t && /\d/.test(t)) salePrice = t;
            }
            if (!salePrice) {
              let node: Node | null = del.nextSibling;
              while (node) {
                const t = (node.textContent ?? '').trim();
                if (t && /\d/.test(t)) { salePrice = t; break; }
                node = node.nextSibling;
              }
            }
          }
          if (!salePrice) {
            const h3 = li.querySelector('h3');
            if (h3) {
              const walker = document.createTreeWalker(h3, NodeFilter.SHOW_TEXT);
              let n: Node | null;
              while ((n = walker.nextNode())) {
                const t = (n.textContent ?? '').trim();
                if (t && /[\d,]+\.\d{2}/.test(t)) { salePrice = t; break; }
              }
            }
          }
        }

        return { title, salePrice, originalPrice };
      });
    });
  }

  async getProductCardByName(name: string): Promise<ProductCardComponent> {
    const cards = await this.getProductCards();
    for (const card of cards) {
      const title = await card.getTitle();
      if (title.toLowerCase().includes(name.toLowerCase())) return card;
    }
    throw new Error(`Product card with name "${name}" not found on home page`);
  }

  async addFirstProductToCart(): Promise<void> {
    const firstBtn = this.page.getByRole('button', { name: 'Add to Cart' }).first();
    await firstBtn.scrollIntoViewIfNeeded();
    const beforeText = (await this.header.cartTotal.textContent({ timeout: 5_000 }).catch(() => '0.00'))?.trim() ?? '0.00';
    await firstBtn.click();
    // Wait for the cart sidebar to reflect the addition — stops as soon as the total changes,
    // rather than waiting for all APEX background requests to settle (networkidle).
    await expect(this.header.cartTotal).not.toHaveText(beforeText, { timeout: 15_000 });
  }

  async searchProducts(query: string) {
    await this.header.search(query);
    await this.waitForProducts();
  }
}
