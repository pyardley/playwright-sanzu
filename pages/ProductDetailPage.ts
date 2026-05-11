import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from '../components/HeaderComponent';

export class ProductDetailPage extends BasePage {
  // Confirmed from live snapshot: product detail alias is "product-detail-info"
  readonly path = `${ProductDetailPage.APEX_ROOT}/product-detail-info`;
  readonly header: HeaderComponent;
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly quantityInput: Locator;
  readonly addToCartBtn: Locator;
  readonly backLink: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.productName = page
      .locator('h1, .product-title, [id*="PRODUCT_NAME"]')
      .first();
    this.productPrice = page
      .locator('[class*="price"], [id*="PRODUCT_PRICE"]')
      .first();
    this.productDescription = page
      .locator('[class*="description"], [id*="PRODUCT_DESC"]')
      .first();
    this.quantityInput = page
      .locator('input[type="number"][id*="QTY"], #P_QUANTITY')
      .first();
    this.addToCartBtn = page
      .getByRole('button', { name: /add to cart/i })
      .or(page.locator('.t-Button--hot[id*="ADD_CART"]'))
      .first();
    this.backLink = page
      .getByRole('link', { name: /back|continue shopping/i })
      .first();
  }

  async setQuantity(qty: number) {
    await this.quantityInput.fill(String(qty));
  }

  async addToCart(): Promise<void> {
    await this.addToCartBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goBack() {
    await this.backLink.click();
    await this.page.waitForLoadState('networkidle');
  }
}
