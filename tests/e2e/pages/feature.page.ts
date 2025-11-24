import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for main feature pages
 * Generic page object that can be extended for specific features
 */
export class FeaturePage {
  readonly page: Page;
  readonly title: Locator;
  readonly backButton: Locator;
  readonly content: Locator;
  readonly loadingIndicator: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1, [data-testid="page-title"]');
    this.backButton = page.locator('button:has-text("Back"), a:has-text("Back"), [data-testid="back-button"]');
    this.content = page.locator('main, [role="main"], .content');
    this.loadingIndicator = page.locator('.loading, [data-testid="loading"], .spinner');
    this.errorMessage = page.locator('.error, [data-testid="error"], .error-message');
  }

  /**
   * Wait for page to load
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await expect(this.content).toBeVisible();
  }

  /**
   * Check if page is loaded
   */
  async isLoaded(): Promise<boolean> {
    try {
      await expect(this.content).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.title.textContent() || '';
  }

  /**
   * Navigate back
   */
  async goBack(): Promise<void> {
    await this.backButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if loading indicator is visible
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingIndicator.isVisible().catch(() => false);
  }

  /**
   * Check if error message is visible
   */
  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible().catch(() => false);
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    if (await this.hasError()) {
      return await this.errorMessage.textContent() || '';
    }
    return '';
  }
}

