import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Login Page
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"], input[name="email"], [data-testid="email-input"]');
    this.passwordInput = page.locator('input[type="password"], input[name="password"], [data-testid="password-input"]');
    this.loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In"), [data-testid="login-button"]');
    this.registerLink = page.locator('a:has-text("Register"), a:has-text("Sign Up"), [data-testid="register-link"]');
    this.forgotPasswordLink = page.locator('a:has-text("Forgot"), a:has-text("Reset"), [data-testid="forgot-password-link"]');
    this.errorMessage = page.locator('.error, .error-message, [data-testid="error-message"]');
    this.successMessage = page.locator('.success, [data-testid="success-message"]');
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill login form
   */
  async fillLoginForm(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Submit login form
   */
  async submitLogin(): Promise<void> {
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Perform complete login
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillLoginForm(email, password);
    await this.submitLogin();
  }

  /**
   * Click register link
   */
  async clickRegister(): Promise<void> {
    await this.registerLink.click();
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

