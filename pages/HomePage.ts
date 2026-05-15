import { Page, Locator } from '@playwright/test';
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
    await firstBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  async searchProducts(query: string) {
    await this.header.search(query);
    await this.waitForProducts();
  }
}
