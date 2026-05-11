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
      .locator('.t-Alert--danger, #APEX_ERROR_MESSAGE, .apex-error')
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
    if (await this.errorMessage.isVisible({ timeout: 5_000 }).catch(() => false)) {
      return (await this.errorMessage.textContent())?.trim() ?? null;
    }
    return null;
  }
}
