import { Page, Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class LoginFormComponent extends BaseComponent {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly rememberMe: Locator;

  constructor(page: Page) {
    const root = page.locator('.t-Login-container, #login_form, [id*="LOGIN"]').first();
    super(page, root);
    // APEX login page items typically use IDs P9999_USERNAME / P9999_PASSWORD
    this.emailInput = page
      .locator('#P9999_USERNAME, #P101_USERNAME, [name*="USERNAME"]')
      .or(page.getByLabel(/email|username/i))
      .first();
    this.passwordInput = page
      .locator('#P9999_PASSWORD, #P101_PASSWORD, [name*="PASSWORD"]')
      .or(page.getByLabel(/password/i))
      .first();
    this.submitButton = page
      .getByRole('button', { name: /log.?in|sign.?in|submit/i })
      .or(page.locator('.t-Button--hot'))
      .first();
    this.errorMessage = page
      .locator('#t_Alert_Notification, .t-Alert--danger, .t-Alert--warning, #APEX_ERROR_MESSAGE, .apex-error')
      .first();
    this.rememberMe = page.getByLabel(/remember/i).first();
  }

  async fill(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getError(): Promise<string | null> {
    // APEX renders the error/throttle notification in #t_Alert_Notification (inside #APEX_ERROR_MESSAGE).
    // Use page.locator() to look for the alert region by its specific alert heading.
    // Check for the alert element using waitFor to avoid race conditions.
    const alertRegion = this.page.locator('#t_Alert_Notification[role="region"]');
    const text = await alertRegion.textContent({ timeout: 5_000 }).catch(() => null);
    if (text?.trim()) return text.trim();
    // Fallback: broader selector
    const text2 = await this.errorMessage.textContent({ timeout: 2_000 }).catch(() => null);
    return text2?.trim() || null;
  }
}
