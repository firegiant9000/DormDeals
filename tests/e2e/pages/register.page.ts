import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Register Page
 */
export class RegisterPage {
  readonly page: Page;
  readonly displayNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly loginLink: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.displayNameInput = page.locator('input[name="displayName"], input[name="name"], [data-testid="display-name-input"]');
    this.emailInput = page.locator('input[type="email"], input[name="email"], [data-testid="email-input"]');
    this.passwordInput = page.locator('input[type="password"][name="password"], [data-testid="password-input"]');
    this.confirmPasswordInput = page.locator('input[type="password"][name="confirmPassword"], input[name="confirm"], [data-testid="confirm-password-input"]');
    this.registerButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up"), [data-testid="register-button"]');
    this.loginLink = page.locator('a:has-text("Login"), a:has-text("Sign In"), [data-testid="login-link"]');
    this.errorMessage = page.locator('.error, .error-message, [data-testid="error-message"]');
    this.successMessage = page.locator('.success, [data-testid="success-message"]');
  }

  /**
   * Navigate to register page
   */
  async goto(): Promise<void> {
    await this.page.goto('/register');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill registration form
   */
  async fillRegisterForm(data: {
    displayName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<void> {
    await this.displayNameInput.fill(data.displayName);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.confirmPassword);
  }

  /**
   * Submit registration form
   */
  async submitRegister(): Promise<void> {
    await this.registerButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Perform complete registration
   */
  async register(data: {
    displayName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<void> {
    await this.fillRegisterForm(data);
    await this.submitRegister();
  }

  /**
   * Click login link
   */
  async clickLogin(): Promise<void> {
    await this.loginLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if error message is visible
   */
  async expectErrorVisible(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }
}

