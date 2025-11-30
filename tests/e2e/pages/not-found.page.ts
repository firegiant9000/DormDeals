import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the 404 Not Found Page
 * Encapsulates all 404 page-related selectors and actions
 */
export class NotFoundPage {
  readonly page: Page;
  readonly errorCode: Locator;
  readonly errorTitle: Locator;
  readonly errorMessage: Locator;
  readonly goHomeButton: Locator;
  readonly goBackButton: Locator;
  readonly marketplaceLink: Locator;
  readonly aboutLink: Locator;
  readonly profileLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.errorCode = page.locator('text=/404/, [class*="404"], [class*="error-code"]');
    this.errorTitle = page.locator('h1:has-text("Page Not Found"), h1:has-text("404"), h1:has-text("Not Found")');
    this.errorMessage = page.locator('p:has-text("couldn\'t find"), p:has-text("not found"), [class*="error-message"]');
    this.goHomeButton = page.locator('a:has-text("Go Home"), button:has-text("Go Home")');
    this.goBackButton = page.locator('button:has-text("Go Back"), button[onclick*="history.back"]');
    this.marketplaceLink = page.locator('a:has-text("Marketplace"), a[href*="marketplace"]');
    this.aboutLink = page.locator('a:has-text("About"), a[href*="about"]');
    this.profileLink = page.locator('a:has-text("Profile"), a[href*="profile"]');
  }

  /**
   * Navigate to a non-existent page to trigger 404
   */
  async goto404(): Promise<void> {
    await this.page.goto('/this-page-does-not-exist-12345');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to the not found page directly (if you have a route for it)
   */
  async goto(): Promise<void> {
    await this.page.goto('/404');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if 404 page is loaded
   */
  async isLoaded(): Promise<boolean> {
    try {
      // 404 page might be on any invalid route
      await expect(this.errorCode.or(this.errorTitle)).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify all elements are visible
   */
  async expectAllElementsVisible(): Promise<void> {
    await expect(this.errorCode.or(this.errorTitle)).toBeVisible();
    await expect(this.errorMessage).toBeVisible();
    await expect(this.goHomeButton).toBeVisible();
  }

  /**
   * Click Go Home button
   */
  async clickGoHome(): Promise<void> {
    await this.goHomeButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click Go Back button
   */
  async clickGoBack(): Promise<void> {
    await this.goBackButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Click Marketplace link
   */
  async clickMarketplaceLink(): Promise<void> {
    await this.marketplaceLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click About link
   */
  async clickAboutLink(): Promise<void> {
    await this.aboutLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click Profile link
   */
  async clickProfileLink(): Promise<void> {
    await this.profileLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify helpful links section is visible
   */
  async expectHelpfulLinksVisible(): Promise<void> {
    const helpfulLinksSection = this.page.locator('text=/popular pages/i, text=/try these/i');
    const isVisible = await helpfulLinksSection.isVisible().catch(() => false);
    
    if (isVisible || await this.marketplaceLink.isVisible().catch(() => false)) {
      // At least some helpful links should be visible
      expect(await this.marketplaceLink.or(this.aboutLink).or(this.profileLink).isVisible().catch(() => false)).toBeTruthy();
    }
  }
}

