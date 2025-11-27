import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Main Feature Page (Search & Filter)
 */
export class MainFeaturePage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly categoryFilter: Locator;
  readonly minPriceInput: Locator;
  readonly maxPriceInput: Locator;
  readonly conditionFilter: Locator;
  readonly pickupMethodFilter: Locator;
  readonly locationInput: Locator;
  readonly sortBySelect: Locator;
  readonly searchButton: Locator;
  readonly resetFiltersButton: Locator;
  readonly featuredItems: Locator;
  readonly loadingSpinner: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name="query"], [data-testid="search-input"]');
    this.categoryFilter = page.locator('select[name="category"], [data-testid="category-filter"]');
    this.minPriceInput = page.locator('input[name="minPrice"], input[placeholder*="min" i], [data-testid="min-price"]');
    this.maxPriceInput = page.locator('input[name="maxPrice"], input[placeholder*="max" i], [data-testid="max-price"]');
    this.conditionFilter = page.locator('select[name="condition"], [data-testid="condition-filter"]');
    this.pickupMethodFilter = page.locator('select[name="pickupMethod"], [data-testid="pickup-method-filter"]');
    this.locationInput = page.locator('input[name="location"], input[placeholder*="location" i], [data-testid="location-input"]');
    this.sortBySelect = page.locator('select[name="sortBy"], [data-testid="sort-select"]');
    this.searchButton = page.locator('button:has-text("Search"), button:has-text("Find"), button[type="submit"], [data-testid="search-button"]');
    this.resetFiltersButton = page.locator('button:has-text("Reset"), button:has-text("Clear"), [data-testid="reset-filters"]');
    this.featuredItems = page.locator('.item-card, [data-testid="item-card"], .listing-card');
    this.loadingSpinner = page.locator('.loading, .spinner, [data-testid="loading"]');
    this.errorMessage = page.locator('.error, [data-testid="error"], .error-message');
  }

  /**
   * Navigate to main feature page
   */
  async goto(): Promise<void> {
    await this.page.goto('/main-feature');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill search form with data
   */
  async fillSearchForm(data: {
    query?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    pickupMethod?: string;
    location?: string;
    sortBy?: string;
  }): Promise<void> {
    if (data.query) {
      await this.searchInput.fill(data.query);
    }
    if (data.category) {
      await this.categoryFilter.selectOption(data.category);
    }
    if (data.minPrice) {
      await this.minPriceInput.fill(data.minPrice);
    }
    if (data.maxPrice) {
      await this.maxPriceInput.fill(data.maxPrice);
    }
    if (data.condition) {
      await this.conditionFilter.selectOption(data.condition);
    }
    if (data.pickupMethod) {
      await this.pickupMethodFilter.selectOption(data.pickupMethod);
    }
    if (data.location) {
      await this.locationInput.fill(data.location);
    }
    if (data.sortBy) {
      await this.sortBySelect.selectOption(data.sortBy);
    }
  }

  /**
   * Submit search form
   */
  async submitSearch(): Promise<void> {
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Reset all filters
   */
  async resetFilters(): Promise<void> {
    await this.resetFiltersButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Perform a search with query
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.submitSearch();
  }

  /**
   * Check if loading spinner is visible
   */
  async expectLoadingVisible(): Promise<void> {
    await expect(this.loadingSpinner).toBeVisible();
  }

  /**
   * Check if loading spinner is hidden
   */
  async expectLoadingHidden(): Promise<void> {
    await expect(this.loadingSpinner).toBeHidden();
  }

  /**
   * Check if featured items are visible
   */
  async expectFeaturedItemsVisible(): Promise<void> {
    await expect(this.featuredItems.first()).toBeVisible();
  }

  /**
   * Get count of featured items
   */
  async getFeaturedItemsCount(): Promise<number> {
    return await this.featuredItems.count();
  }

  /**
   * Click on a featured item
   */
  async clickFeaturedItem(index: number = 0): Promise<void> {
    await this.featuredItems.nth(index).click();
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

