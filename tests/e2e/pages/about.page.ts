import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the About Page
 * Encapsulates all about page-related selectors and actions
 * Includes methods for verifying content and page elements
 */
export class AboutPage {
  readonly page: Page;
  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly missionSection: Locator;
  readonly missionTitle: Locator;
  readonly missionDescription: Locator;
  readonly statsSection: Locator;
  readonly statsItems: Locator;
  readonly valuesSection: Locator;
  readonly valuesTitle: Locator;
  readonly valuesList: Locator;
  readonly teamSection: Locator;
  readonly teamTitle: Locator;
  readonly teamMembers: Locator;
  readonly ctaSection: Locator;
  readonly ctaTitle: Locator;
  readonly startShoppingButton: Locator;
  readonly startSellingButton: Locator;
  readonly awardIcon: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroTitle = page.locator('h1:has-text("About DormDeals"), h1:has-text("About")');
    this.heroSubtitle = page.locator('p:has-text("Connecting UL students"), [class*="hero"] p');
    this.missionSection = page.locator('section:has-text("Our Mission"), section:has-text("Mission")');
    this.missionTitle = page.locator('h2:has-text("Our Mission"), h2:has-text("Mission")');
    this.missionDescription = page.locator('section:has-text("Our Mission") p, [class*="mission"] p');
    this.statsSection = page.locator('section:has-text("Active Students"), section:has([class*="stat"])');
    this.statsItems = page.locator('[class*="stat"], section:has-text("Active Students") [class*="text"]');
    this.valuesSection = page.locator('section:has-text("Our Values"), section:has-text("Values")');
    this.valuesTitle = page.locator('h2:has-text("Our Values"), h2:has-text("Values")');
    this.valuesList = page.locator('[class*="value"], section:has-text("Our Values") [class*="card"]');
    this.teamSection = page.locator('section:has-text("Meet Our Team"), section:has-text("Team")');
    this.teamTitle = page.locator('h2:has-text("Meet Our Team"), h2:has-text("Team")');
    this.teamMembers = page.locator('[class*="team"], section:has-text("Meet Our Team") [class*="card"]');
    this.ctaSection = page.locator('section:has-text("Join Our Community")');
    this.ctaTitle = page.locator('h2:has-text("Join Our Community")');
    this.startShoppingButton = page.locator('a:has-text("Start Shopping"), button:has-text("Start Shopping")');
    this.startSellingButton = page.locator('a:has-text("Start Selling"), button:has-text("Start Selling")');
    this.awardIcon = page.locator('svg:has([class*="award"]), [class*="award"]');
  }

  /**
   * Navigate to the about page
   */
  async goto(): Promise<void> {
    await this.page.goto('/about');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if about page is loaded
   */
  async isLoaded(): Promise<boolean> {
    try {
      await expect(this.page).toHaveURL(/\/about/);
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
    await expect(this.missionSection).toBeVisible();
    await expect(this.statsSection).toBeVisible();
    await expect(this.valuesSection).toBeVisible();
    await expect(this.teamSection).toBeVisible();
    await expect(this.ctaSection).toBeVisible();
  }

  /**
   * Click Start Shopping button
   */
  async clickStartShopping(): Promise<void> {
    await this.startShoppingButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click Start Selling button
   */
  async clickStartSelling(): Promise<void> {
    await this.startSellingButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get stats count
   */
  async getStatsCount(): Promise<number> {
    return await this.statsItems.count();
  }

  /**
   * Get values count
   */
  async getValuesCount(): Promise<number> {
    return await this.valuesList.count();
  }

  /**
   * Get team members count
   */
  async getTeamMembersCount(): Promise<number> {
    return await this.teamMembers.count();
  }

  /**
   * Verify hero section content
   */
  async verifyHeroContent(): Promise<void> {
    await expect(this.heroTitle).toBeVisible();
    await expect(this.heroSubtitle).toBeVisible();
    const titleText = await this.heroTitle.textContent();
    expect(titleText).toContain('DormDeals');
  }

  /**
   * Verify mission section content
   */
  async verifyMissionContent(): Promise<void> {
    await expect(this.missionSection).toBeVisible();
    await expect(this.missionTitle).toBeVisible();
    await expect(this.missionDescription).toBeVisible();
    
    const missionText = await this.missionDescription.textContent();
    expect(missionText?.length).toBeGreaterThan(0);
  }

  /**
   * Verify stats section content
   */
  async verifyStatsContent(): Promise<void> {
    await expect(this.statsSection).toBeVisible();
    
    const statsCount = await this.getStatsCount();
    expect(statsCount).toBeGreaterThan(0);
    
    // Verify each stat has a label and value
    for (let i = 0; i < statsCount; i++) {
      const statItem = this.statsItems.nth(i);
      await expect(statItem).toBeVisible();
    }
  }

  /**
   * Verify values section content
   */
  async verifyValuesContent(): Promise<void> {
    await expect(this.valuesSection).toBeVisible();
    await expect(this.valuesTitle).toBeVisible();
    
    const valuesCount = await this.getValuesCount();
    expect(valuesCount).toBeGreaterThan(0);
    
    // Verify each value card has content
    for (let i = 0; i < valuesCount; i++) {
      const valueCard = this.valuesList.nth(i);
      await expect(valueCard).toBeVisible();
      
      // Check for title or description
      const hasTitle = await valueCard.locator('h3, [class*="title"]').isVisible().catch(() => false);
      const hasDescription = await valueCard.locator('p, [class*="description"]').isVisible().catch(() => false);
      expect(hasTitle || hasDescription).toBeTruthy();
    }
  }

  /**
   * Verify team section content
   */
  async verifyTeamContent(): Promise<void> {
    await expect(this.teamSection).toBeVisible();
    await expect(this.teamTitle).toBeVisible();
    
    const teamCount = await this.getTeamMembersCount();
    expect(teamCount).toBeGreaterThan(0);
    
    // Verify each team member has information
    for (let i = 0; i < teamCount; i++) {
      const memberCard = this.teamMembers.nth(i);
      await expect(memberCard).toBeVisible();
      
      // Check for name or role
      const hasName = await memberCard.locator('h3, [class*="name"]').isVisible().catch(() => false);
      const hasRole = await memberCard.locator('[class*="role"], p').isVisible().catch(() => false);
      expect(hasName || hasRole).toBeTruthy();
    }
  }

  /**
   * Verify CTA section content
   */
  async verifyCTAContent(): Promise<void> {
    await expect(this.ctaSection).toBeVisible();
    await expect(this.ctaTitle).toBeVisible();
    
    const hasShoppingButton = await this.startShoppingButton.isVisible().catch(() => false);
    const hasSellingButton = await this.startSellingButton.isVisible().catch(() => false);
    
    expect(hasShoppingButton || hasSellingButton).toBeTruthy();
  }

  /**
   * Verify all page content comprehensively
   */
  async verifyAllContent(): Promise<void> {
    await this.verifyHeroContent();
    await this.verifyMissionContent();
    await this.verifyStatsContent();
    await this.verifyValuesContent();
    await this.verifyTeamContent();
    await this.verifyCTAContent();
  }

  /**
   * Get specific stat value by label
   */
  async getStatValue(statLabel: string): Promise<string | null> {
    const statItems = await this.statsItems.all();
    
    for (const item of statItems) {
      const text = await item.textContent();
      if (text?.includes(statLabel)) {
        // Try to extract the value (number or text)
        const valueMatch = text.match(/(\d+[,\d]*\+?|\$\d+[,\d]*K?\+?)/);
        return valueMatch ? valueMatch[1] : text;
      }
    }
    
    return null;
  }

  /**
   * Get value description by title
   */
  async getValueDescription(valueTitle: string): Promise<string | null> {
    const valueItems = await this.valuesList.all();
    
    for (const item of valueItems) {
      const title = await item.locator('h3, [class*="title"]').textContent().catch(() => '');
      if (title?.includes(valueTitle)) {
        const description = await item.locator('p, [class*="description"]').textContent().catch(() => '');
        return description || null;
      }
    }
    
    return null;
  }

  /**
   * Get team member info by name
   */
  async getTeamMemberInfo(memberName: string): Promise<{ role: string | null; description: string | null }> {
    const memberItems = await this.teamMembers.all();
    
    for (const item of memberItems) {
      const name = await item.locator('h3, [class*="name"]').textContent().catch(() => '');
      if (name?.includes(memberName)) {
        const role = await item.locator('[class*="role"], p:first-of-type').textContent().catch(() => null);
        const description = await item.locator('p:last-of-type, [class*="description"]').textContent().catch(() => null);
        return { role, description };
      }
    }
    
    return { role: null, description: null };
  }
}

