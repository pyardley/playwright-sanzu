import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  readonly path = `${CheckoutPage.APEX_ROOT}/checkout`;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly zipInput: Locator;
  readonly cardNumberInput: Locator;
  readonly cardExpiryInput: Locator;
  readonly cardCvvInput: Locator;
  readonly placeOrderBtn: Locator;
  readonly confirmationMessage: Locator;
  readonly orderNumber: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page
      .getByLabel(/first name/i)
      .or(page.locator('[id*="FIRST_NAME"]'))
      .first();
    this.lastNameInput = page
      .getByLabel(/last name/i)
      .or(page.locator('[id*="LAST_NAME"]'))
      .first();
    this.emailInput = page
      .getByLabel(/email/i)
      .or(page.locator('[id*="EMAIL"]'))
      .first();
    this.addressInput = page
      .getByLabel(/address/i)
      .or(page.locator('[id*="ADDRESS"]'))
      .first();
    this.cityInput = page
      .getByLabel(/city/i)
      .or(page.locator('[id*="CITY"]'))
      .first();
    this.zipInput = page
      .getByLabel(/zip|postal/i)
      .or(page.locator('[id*="ZIP"]'))
      .first();
    this.cardNumberInput = page
      .getByLabel(/card number/i)
      .or(page.locator('[id*="CARD_NUM"]'))
      .first();
    this.cardExpiryInput = page
      .getByLabel(/expir|mm\/yy/i)
      .or(page.locator('[id*="EXPIRY"]'))
      .first();
    this.cardCvvInput = page
      .getByLabel(/cvv|cvc/i)
      .or(page.locator('[id*="CVV"]'))
      .first();
    this.placeOrderBtn = page
      .getByRole('button', { name: /place order|confirm order|submit/i })
      .or(page.locator('.t-Button--hot[id*="PLACE_ORDER"]'))
      .first();
    this.confirmationMessage = page
      .getByText(/order.*(placed|confirmed|success)/i)
      .first();
    this.orderNumber = page
      .locator('[id*="ORDER_NUM"], [class*="order-number"]')
      .first();
  }

  async fillShippingDetails(details: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    zip: string;
  }) {
    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);
    await this.emailInput.fill(details.email);
    await this.addressInput.fill(details.address);
    await this.cityInput.fill(details.city);
    await this.zipInput.fill(details.zip);
  }

  async fillPaymentDetails(card: {
    number: string;
    expiry: string;
    cvv: string;
  }) {
    await this.cardNumberInput.fill(card.number);
    await this.cardExpiryInput.fill(card.expiry);
    await this.cardCvvInput.fill(card.cvv);
  }

  async placeOrder() {
    await this.placeOrderBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getOrderNumber(): Promise<string | null> {
    if (await this.orderNumber.isVisible({ timeout: 10_000 }).catch(() => false)) {
      return (await this.orderNumber.textContent())?.trim() ?? null;
    }
    return null;
  }
}
