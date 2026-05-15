import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoginFormComponent } from '../components/LoginFormComponent';
import { HeaderComponent } from '../components/HeaderComponent';

export class LoginPage extends BasePage {
  // APEX page alias confirmed from redirect URL in live app
  readonly path = `${LoginPage.APEX_ROOT}/login_desktop`;
  readonly loginForm: LoginFormComponent;
  readonly header: HeaderComponent;

  constructor(page: Page) {
    super(page);
    this.loginForm = new LoginFormComponent(page);
    this.header    = new HeaderComponent(page);
  }

  async loginAs(email: string, password: string): Promise<void> {
    await this.goto();
    await this.loginForm.fill(email, password);
    await this.loginForm.submit();
    await this.page.waitForURL(/home|dashboard/i, { timeout: 20_000 });
  }
}
