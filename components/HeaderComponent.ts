import { Page, Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class HeaderComponent extends BaseComponent {
  readonly navRoot: Locator;
  // Cart is a sidebar widget on the home page, not a header icon
  readonly cartWidget: Locator;
  readonly cartTotal: Locator;
  readonly userMenuTrigger: Locator;
  readonly myAccountBtn: Locator;
  readonly searchInput: Locator;
  readonly loginLink: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    // APEX renders the site header as <header> → ARIA role "banner"
    const root = page.getByRole('banner').first();
    super(page, root);
    this.navRoot       = root;
    // Sidebar cart widget — present on home page, targets the cart detail page
    this.cartWidget    = page.getByRole('table', { name: /cart region/i }).first();
    this.cartTotal     = page.getByRole('link', { name: /^\d/ }).filter({ hasText: /\.00/ }).first();
    this.myAccountBtn  = page.getByRole('button', { name: /my account/i }).first();
    // When logged in, the username appears as a button in the nav list
    this.userMenuTrigger = page.locator('header').getByRole('list').getByRole('button').last();
    // Actual placeholder text confirmed from live page snapshot
    this.searchInput   = page.getByPlaceholder('Search Product').first();
    // Guest state only
    this.loginLink     = page.getByRole('link', { name: /log.?in|sign.?in/i }).first();
    this.logoutLink    = page.getByRole('link', { name: /log.?out|sign.?out/i }).first();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async goToCart() {
    // Click the cart total link in the sidebar widget to reach the cart detail page
    await this.cartTotal.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getCartTotal(): Promise<string> {
    return (await this.cartTotal.textContent({ timeout: 5_000 }).catch(() => '0.00'))?.trim() ?? '0.00';
  }

  async openUserMenu() {
    await this.userMenuTrigger.click();
  }

  async logout() {
    await this.openUserMenu();
    await this.logoutLink.click();
    await this.page.waitForLoadState('networkidle');
  }
}
