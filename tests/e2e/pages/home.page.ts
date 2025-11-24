import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Homepage
 * Encapsulates all homepage-related selectors and actions
 */
export class HomePage {
  readonly page: Page;
  readonly navigation: Locator;
  readonly logo: Locator;
  readonly searchBar: Locator;
  readonly searchButton: Locator;
  readonly loginButton: Locator;
  readonly registerButton: Locator;
  readonly userMenu: Locator;
  readonly heroSection: Locator;
  readonly featuredProducts: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigation = page.locator('nav, [role="navigation"]');
    this.logo = page.locator('a[href="/"], .logo, [data-testid="logo"]');
    this.searchBar = page.locator('input[type="search"], input[placeholder*="search" i], [data-testid="search-input"]');
    this.searchButton = page.locator('button:has-text("Search"), button[type="submit"]:near(input[type="search"]), [data-testid="search-button"]');
    this.loginButton = page.locator('a:has-text("Login"), a:has-text("Sign In"), button:has-text("Login"), [data-testid="login-button"]');
    this.registerButton = page.locator('a:has-text("Register"), a:has-text("Sign Up"), button:has-text("Register"), [data-testid="register-button"]');
    this.userMenu = page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Profile")');
    this.heroSection = page.locator('section.hero, .hero-section, [data-testid="hero"]');
    this.featuredProducts = page.locator('.featured-products, [data-testid="featured-products"], section:has-text("Featured")');
    this.footer = page.locator('footer, [role="contentinfo"]');
  }

  /**
   * Navigate to the homepage
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if homepage is loaded
   */
  async isLoaded(): Promise<boolean> {
    try {
      await expect(this.page).toHaveURL(/\/(home|$)/);
      await expect(this.navigation).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Perform a search
   */
  async search(query: string): Promise<void> {
    await this.searchBar.fill(query);
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click on login button
   */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
    await this.page.waitForURL(/\/login/);
  }

  /**
   * Click on register button
   */
  async clickRegister(): Promise<void> {
    await this.registerButton.click();
    await this.page.waitForURL(/\/register/);
  }

  /**
   * Navigate to a specific page via navigation
   */
  async navigateTo(pageName: string): Promise<void> {
    const link = this.page.locator(`a:has-text("${pageName}"), nav a[href*="${pageName.toLowerCase()}"]`);
    await link.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if user is logged in (user menu visible)
   */
  async isUserLoggedIn(): Promise<boolean> {
    return await this.userMenu.isVisible().catch(() => false);
  }

  /**
   * Get featured products count
   */
  async getFeaturedProductsCount(): Promise<number> {
    const products = this.page.locator('.product-card, [data-testid="product-card"], .featured-products > *');
    return await products.count();
  }

  /**
   * Click on a featured product
   */
  async clickFeaturedProduct(index: number = 0): Promise<void> {
    const products = this.page.locator('.product-card, [data-testid="product-card"]');
    await products.nth(index).click();
    await this.page.waitForLoadState('networkidle');
  }
}

