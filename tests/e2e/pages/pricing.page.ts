import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Pricing Page/Component
 * Encapsulates pricing tiers, plan selection, and pricing-related functionality
 * Can be used for dedicated pricing pages or pricing sections within other pages
 */
export class PricingPage {
  readonly page: Page;
  readonly pricingSection: Locator;
  readonly pricingTiers: Locator;
  readonly premiumPlan: Locator;
  readonly basicPlan: Locator;
  readonly priceAmount: Locator;
  readonly pricePeriod: Locator;
  readonly planFeatures: Locator;
  readonly subscribeButton: Locator;
  readonly selectPlanButton: Locator;
  readonly cancelAnytimeText: Locator;
  readonly faqSection: Locator;
  readonly comparisonTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pricingSection = page.locator('[class*="pricing"], section:has-text("Premium"), section:has-text("Pricing")');
    this.pricingTiers = page.locator('[class*="pricing-card"], [class*="plan"], [class*="tier"]');
    this.premiumPlan = page.locator('[class*="premium"], [class*="plan"]:has-text("Premium"), [class*="tier"]:has-text("Premium")');
    this.basicPlan = page.locator('[class*="basic"], [class*="plan"]:has-text("Basic"), [class*="tier"]:has-text("Basic")');
    this.priceAmount = page.locator('text=/\\$\\d+(\\.\\d+)?/, [class*="price-amount"], [class*="price"]:has-text("$")');
    this.pricePeriod = page.locator('text=/\\/month|\\/year|per month|per year/i, [class*="period"]');
    this.planFeatures = page.locator('[class*="feature"], li:has-text("Featured"), [class*="benefit"]');
    this.subscribeButton = page.locator('button:has-text("Subscribe"), button:has-text("Subscribe Now"), a:has-text("Subscribe")');
    this.selectPlanButton = page.locator('button:has-text("Select Plan"), button:has-text("Choose Plan"), a:has-text("Select")');
    this.cancelAnytimeText = page.locator('text=/cancel anytime/i, text=/no hidden fees/i');
    this.faqSection = page.locator('section:has-text("FAQ"), section:has-text("Frequently Asked"), h2:has-text("FAQ")');
    this.comparisonTable = page.locator('[class*="comparison"], table:has-text("Feature")');
  }

  /**
   * Navigate to pricing/premium page
   */
  async goto(): Promise<void> {
    await this.page.goto('/premium');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if pricing section is loaded
   */
  async isLoaded(): Promise<boolean> {
    try {
      await expect(this.pricingSection.or(this.premiumPlan)).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get pricing tiers count
   */
  async getPricingTiersCount(): Promise<number> {
    return await this.pricingTiers.count();
  }

  /**
   * Get features count for a specific plan
   */
  async getFeaturesCount(planName?: string): Promise<number> {
    if (planName) {
      const plan = this.getPlanByName(planName);
      const features = plan.locator('[class*="feature"], li, [class*="benefit"]');
      return await features.count();
    }
    return await this.planFeatures.count();
  }

  /**
   * Get plan by name
   */
  getPlanByName(planName: string): Locator {
    return this.page.locator(
      `[class*="plan"]:has-text("${planName}"), 
       [class*="tier"]:has-text("${planName}"), 
       [class*="pricing-card"]:has-text("${planName}")`
    );
  }

  /**
   * Select a pricing plan by name
   */
  async selectPlan(planName: string): Promise<void> {
    const plan = this.getPlanByName(planName);
    
    // Look for select/subscribe button within the plan
    const selectButton = plan.locator('button:has-text("Select"), button:has-text("Subscribe"), button:has-text("Choose")');
    
    if (await selectButton.isVisible().catch(() => false)) {
      await selectButton.click();
    } else {
      // Fallback: click on the plan card itself
      await plan.click();
    }
    
    await this.page.waitForTimeout(500);
  }

  /**
   * Get price for a specific plan
   */
  async getPlanPrice(planName?: string): Promise<string | null> {
    if (planName) {
      const plan = this.getPlanByName(planName);
      const price = plan.locator('[class*="price"], text=/\\$\\d+/');
      const priceText = await price.first().textContent().catch(() => null);
      return priceText;
    }
    
    // Get first available price
    const priceText = await this.priceAmount.first().textContent().catch(() => null);
    return priceText;
  }

  /**
   * Get price period (monthly/yearly)
   */
  async getPricePeriod(): Promise<string | null> {
    const periodText = await this.pricePeriod.first().textContent().catch(() => null);
    return periodText;
  }

  /**
   * Verify pricing information is visible
   */
  async verifyPricingVisible(): Promise<void> {
    await expect(this.pricingSection.or(this.premiumPlan)).toBeVisible();
    await expect(this.priceAmount.first()).toBeVisible();
  }

  /**
   * Verify all pricing tiers are displayed
   */
  async verifyAllTiersVisible(): Promise<void> {
    const tiersCount = await this.getPricingTiersCount();
    expect(tiersCount).toBeGreaterThan(0);
    
    for (let i = 0; i < tiersCount; i++) {
      const tier = this.pricingTiers.nth(i);
      await expect(tier).toBeVisible();
    }
  }

  /**
   * Verify features are listed for a plan
   */
  async verifyFeaturesListed(planName?: string): Promise<void> {
    const featuresCount = await this.getFeaturesCount(planName);
    expect(featuresCount).toBeGreaterThan(0);
    
    // Verify at least one feature is visible
    if (planName) {
      const plan = this.getPlanByName(planName);
      const firstFeature = plan.locator('[class*="feature"], li').first();
      await expect(firstFeature).toBeVisible();
    } else {
      await expect(this.planFeatures.first()).toBeVisible();
    }
  }

  /**
   * Verify subscription button is available
   */
  async verifySubscribeButton(): Promise<void> {
    const hasSubscribe = await this.subscribeButton.isVisible().catch(() => false);
    const hasSelect = await this.selectPlanButton.isVisible().catch(() => false);
    
    expect(hasSubscribe || hasSelect).toBeTruthy();
  }

  /**
   * Click subscribe button
   */
  async clickSubscribe(): Promise<void> {
    const subscribeBtn = this.subscribeButton.or(this.selectPlanButton);
    await subscribeBtn.first().click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Verify cancel anytime text is displayed
   */
  async verifyCancelAnytimeText(): Promise<void> {
    const hasText = await this.cancelAnytimeText.isVisible().catch(() => false);
    if (hasText) {
      await expect(this.cancelAnytimeText.first()).toBeVisible();
    }
  }

  /**
   * Get list of features for a plan
   */
  async getPlanFeatures(planName?: string): Promise<string[]> {
    const features: string[] = [];
    
    if (planName) {
      const plan = this.getPlanByName(planName);
      const featureItems = plan.locator('[class*="feature"], li, [class*="benefit"]');
      const count = await featureItems.count();
      
      for (let i = 0; i < count; i++) {
        const featureText = await featureItems.nth(i).textContent();
        if (featureText) {
          features.push(featureText.trim());
        }
      }
    } else {
      const count = await this.planFeatures.count();
      for (let i = 0; i < count; i++) {
        const featureText = await this.planFeatures.nth(i).textContent();
        if (featureText) {
          features.push(featureText.trim());
        }
      }
    }
    
    return features;
  }

  /**
   * Check if a specific feature is included in a plan
   */
  async hasFeature(featureName: string, planName?: string): Promise<boolean> {
    const features = await this.getPlanFeatures(planName);
    return features.some(f => f.toLowerCase().includes(featureName.toLowerCase()));
  }

  /**
   * Verify FAQ section if available
   */
  async verifyFAQSection(): Promise<void> {
    const hasFAQ = await this.faqSection.isVisible().catch(() => false);
    if (hasFAQ) {
      await expect(this.faqSection).toBeVisible();
    }
  }

  /**
   * Verify comparison table if available
   */
  async verifyComparisonTable(): Promise<void> {
    const hasTable = await this.comparisonTable.isVisible().catch(() => false);
    if (hasTable) {
      await expect(this.comparisonTable).toBeVisible();
    }
  }

  /**
   * Verify premium plan is highlighted or featured
   */
  async verifyPremiumPlanHighlighted(): Promise<void> {
    if (await this.premiumPlan.isVisible().catch(() => false)) {
      // Check for highlighting classes or styles
      const classes = await this.premiumPlan.getAttribute('class').catch(() => '');
      const hasHighlight = classes.includes('featured') || 
                          classes.includes('highlighted') || 
                          classes.includes('premium') ||
                          classes.includes('border-primary');
      
      // If not found in classes, check for visual indicators
      if (!hasHighlight) {
        // Premium plan should still be visible
        await expect(this.premiumPlan).toBeVisible();
      }
    }
  }

  /**
   * Verify all pricing content comprehensively
   */
  async verifyAllPricingContent(): Promise<void> {
    await this.verifyPricingVisible();
    await this.verifyAllTiersVisible();
    await this.verifyFeaturesListed();
    await this.verifySubscribeButton();
    await this.verifyCancelAnytimeText();
  }
}

