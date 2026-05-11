import { Page } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  abstract readonly path: string;

  /** Shared APEX application root — all page paths are relative to this */
  protected static readonly APEX_ROOT = '/ords/r/sanjay_sikder/ecommerceportal';

  constructor(page: Page) {
    this.page = page;
  }

  async goto(options?: Parameters<Page['goto']>[1]) {
    await this.page.goto(this.path, { waitUntil: 'networkidle', ...options });
    await this.waitForApexReady();
  }

  /** Waits for Oracle APEX framework JS to finish initialising */
  protected async waitForApexReady(timeout = 20_000) {
    await this.page.waitForFunction(
      () =>
        typeof (globalThis as any).apex !== 'undefined' &&
        (globalThis as any).apex.event !== undefined,
      { timeout },
    ).catch(() => {
      // APEX may not be present on all pages (e.g. login) — non-fatal
    });
  }

  /** Dismiss any APEX success/warning alerts that may block interactions */
  async dismissAlert() {
    const alert = this.page.locator('.t-Alert--success, .t-Alert--warning').first();
    const closeBtn = alert.getByRole('button', { name: /close|dismiss/i });
    if (await closeBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await closeBtn.click();
    }
  }

  async waitForNetwork() {
    await this.page.waitForLoadState('networkidle');
  }
}
