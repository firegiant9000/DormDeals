import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Premium Page
 * Encapsulates all premium page-related selectors and actions
 */
export class PremiumPage {
  readonly page: Page;
  readonly heroTitle: Locator;
  readonly pricingCard: Locator;
  readonly priceAmount: Locator;
  readonly featuresList: Locator;
  readonly subscribeButton: Locator;
  readonly maybeLaterButton: Locator;
  readonly signInButton: Locator;
  readonly createAccountButton: Locator;
  readonly faqSection: Locator;
  readonly crownIcon: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroTitle = page.locator('h1:has-text("Upgrade to Premium"), h1:has-text("Premium")');
    this.pricingCard = page.locator('[class*="pricing"], [class*="card"]:has-text("$")');
    this.priceAmount = page.locator('text=/\\$\\d+(\\.\\d+)?/, [class*="price"]');
    this.featuresList = page.locator('[class*="feature"], li:has-text("Featured Listings")');
    this.subscribeButton = page.locator('button:has-text("Subscribe Now"), button:has-text("Subscribe")');
    this.maybeLaterButton = page.locator('a:has-text("Maybe Later"), button:has-text("Maybe Later")');
    this.signInButton = page.locator('a:has-text("Sign In to Subscribe"), a:has-text("Sign In")');
    this.createAccountButton = page.locator('a:has-text("Create Account"), a:has-text("Register")');
    this.faqSection = page.locator('section:has-text("Frequently Asked Questions"), h2:has-text("FAQ")');
    this.crownIcon = page.locator('svg[class*="crown"], [class*="crown"]');
  }

  /**
   * Navigate to the premium page
   */
  async goto(): Promise<void> {
    await this.page.goto('/premium');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if premium page is loaded
   */
  async isLoaded(): Promise<boolean> {
    try {
      await expect(this.page).toHaveURL(/\/premium/);
      await expect(this.heroTitle).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify all sections are visible
   */
  async expectAllSectionsVisible(): Promise<void> {
    await expect(this.heroTitle).toBeVisible();
    await expect(this.pricingCard).toBeVisible();
    await expect(this.crownIcon.first()).toBeVisible();
    await expect(this.featuresList.first()).toBeVisible();
  }

  /**
   * Get features count
   */
  async getFeaturesCount(): Promise<number> {
    return await this.featuresList.count();
  }

  /**
   * Check if user is authenticated (based on button visibility)
   */
  async isUserAuthenticated(): Promise<boolean> {
    const subscribeVisible = await this.subscribeButton.isVisible().catch(() => false);
    const signInVisible = await this.signInButton.isVisible().catch(() => false);
    // If subscribe button is visible but sign in is not, user is authenticated
    return subscribeVisible && !signInVisible;
  }

  /**
   * Click Subscribe button (for authenticated users)
   */
  async clickSubscribe(): Promise<void> {
    await this.subscribeButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Click Sign In to Subscribe button (for unauthenticated users)
   */
  async clickSignInToSubscribe(): Promise<void> {
    await this.signInButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click Create Account button
   */
  async clickCreateAccount(): Promise<void> {
    await this.createAccountButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click Maybe Later button
   */
  async clickMaybeLater(): Promise<void> {
    await this.maybeLaterButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify pricing information is visible
   */
  async expectPricingVisible(): Promise<void> {
    await expect(this.priceAmount).toBeVisible();
    await expect(this.page.locator('text=/\\/month/')).toBeVisible();
  }

  /**
   * Check if FAQ section is visible
   */
  async isFAQVisible(): Promise<boolean> {
    return await this.faqSection.isVisible().catch(() => false);
  }
}

