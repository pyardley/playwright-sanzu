import { Page, Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class SmartFilterComponent extends BaseComponent {
  readonly toggleBtn: Locator;
  readonly filterChips: Locator;
  readonly clearAllBtn: Locator;

  constructor(page: Page) {
    // Snapshot confirms: region with accessible name "Smart Filter"
    const root = page.getByRole('region', { name: 'Smart Filter' }).first();
    super(page, root);
    this.toggleBtn  = root.getByRole('button', { name: 'Smart Filter' }).first();
    this.filterChips = root.locator('.a-SF-chip, [class*="chip"], [class*="filter-value"]');
    this.clearAllBtn = root.getByRole('button', { name: /clear all|reset/i }).first();
  }

  async expand() {
    const expanded = await this.root.getAttribute('aria-expanded').catch(() => null);
    if (expanded === 'false' || expanded === null) {
      await this.toggleBtn.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async selectFilterOption(label: string) {
    await this.expand();
    await this.root
      .getByRole('checkbox', { name: label })
      .or(this.root.getByRole('option', { name: label }))
      .or(this.root.getByText(label))
      .first()
      .click();
    await this.page.waitForLoadState('networkidle');
  }

  async clearAll() {
    if (await this.clearAllBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await this.clearAllBtn.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async getActiveFilters(): Promise<string[]> {
    const count = await this.filterChips.count();
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await this.filterChips.nth(i).textContent();
      if (text?.trim()) labels.push(text.trim());
    }
    return labels;
  }
}
