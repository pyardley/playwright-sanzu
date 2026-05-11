import { Page, Locator } from '@playwright/test';

export abstract class BaseComponent {
  protected readonly page: Page;
  protected readonly root: Locator;

  constructor(page: Page, root: Locator) {
    this.page = page;
    this.root = root;
  }

  async isVisible() {
    return this.root.isVisible();
  }

  async waitFor(state: 'attached' | 'detached' | 'visible' | 'hidden' = 'visible') {
    await this.root.waitFor({ state });
  }
}
