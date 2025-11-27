import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Checkout Page
 */
export class CheckoutPage {
  readonly page: Page;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipCodeInput: Locator;
  readonly cardNumberInput: Locator;
  readonly expiryDateInput: Locator;
  readonly cvcInput: Locator;
  readonly cardNameInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly orderSummary: Locator;
  readonly totalAmount: Locator;
  readonly formErrors: Locator;
  readonly loadingSpinner: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fullNameInput = page.locator('input[name="fullName"], input[name="name"], [data-testid="full-name-input"]');
    this.emailInput = page.locator('input[name="email"], input[type="email"], [data-testid="email-input"]');
    this.addressInput = page.locator('input[name="address"], [data-testid="address-input"]');
    this.cityInput = page.locator('input[name="city"], [data-testid="city-input"]');
    this.stateInput = page.locator('input[name="state"], select[name="state"], [data-testid="state-input"]');
    this.zipCodeInput = page.locator('input[name="zipCode"], input[name="zip"], [data-testid="zip-input"]');
    this.cardNumberInput = page.locator('input[name="cardNumber"], input[name="card"], [data-testid="card-number-input"]');
    this.expiryDateInput = page.locator('input[name="expiryDate"], input[name="expiry"], [data-testid="expiry-input"]');
    this.cvcInput = page.locator('input[name="cvc"], input[name="cvv"], [data-testid="cvc-input"]');
    this.cardNameInput = page.locator('input[name="cardName"], input[name="cardholder"], [data-testid="card-name-input"]');
    this.submitButton = page.locator('button[type="submit"], button:has-text("Place Order"), button:has-text("Complete"), [data-testid="submit-button"]');
    this.cancelButton = page.locator('button:has-text("Cancel"), a:has-text("Cancel"), [data-testid="cancel-button"]');
    this.orderSummary = page.locator('.order-summary, [data-testid="order-summary"]');
    this.totalAmount = page.locator('.total, .total-amount, [data-testid="total-amount"]');
    this.formErrors = page.locator('.error, .form-error, [data-testid="form-error"]');
    this.loadingSpinner = page.locator('.loading, .spinner, [data-testid="loading"]');
    this.successMessage = page.locator('.success, [data-testid="success-message"]');
  }

  /**
   * Navigate to checkout page
   */
  async goto(): Promise<void> {
    await this.page.goto('/checkout');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill shipping information
   */
  async fillShippingInfo(data: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }): Promise<void> {
    await this.fullNameInput.fill(data.fullName);
    await this.emailInput.fill(data.email);
    await this.addressInput.fill(data.address);
    await this.cityInput.fill(data.city);
    await this.stateInput.fill(data.state);
    await this.zipCodeInput.fill(data.zipCode);
  }

  /**
   * Fill payment information
   */
  async fillPaymentInfo(data: {
    cardNumber: string;
    expiryDate: string;
    cvc: string;
    cardName: string;
  }): Promise<void> {
    await this.cardNumberInput.fill(data.cardNumber);
    await this.expiryDateInput.fill(data.expiryDate);
    await this.cvcInput.fill(data.cvc);
    await this.cardNameInput.fill(data.cardName);
  }

  /**
   * Fill complete checkout form
   */
  async fillCheckoutForm(data: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    cardNumber: string;
    expiryDate: string;
    cvc: string;
    cardName: string;
  }): Promise<void> {
    await this.fillShippingInfo({
      fullName: data.fullName,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
    });
    await this.fillPaymentInfo({
      cardNumber: data.cardNumber,
      expiryDate: data.expiryDate,
      cvc: data.cvc,
      cardName: data.cardName,
    });
  }

  /**
   * Submit checkout form
   */
  async submitCheckout(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Cancel checkout
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get total amount
   */
  async getTotalAmount(): Promise<string> {
    return await this.totalAmount.textContent() || '';
  }

  /**
   * Check if order summary is visible
   */
  async expectOrderSummaryVisible(): Promise<void> {
    await expect(this.orderSummary).toBeVisible();
  }

  /**
   * Check if form errors are visible
   */
  async expectFormErrorsVisible(): Promise<void> {
    await expect(this.formErrors.first()).toBeVisible();
  }

  /**
   * Check if success message is visible
   */
  async expectSuccessMessageVisible(): Promise<void> {
    await expect(this.successMessage).toBeVisible();
  }
}

