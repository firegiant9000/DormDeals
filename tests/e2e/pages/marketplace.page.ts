import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Marketplace Page
 */
export class MarketplacePage {
  readonly page: Page;
  readonly listingsGrid: Locator;
  readonly listingCards: Locator;
  readonly searchBar: Locator;
  readonly filtersBar: Locator;
  readonly categoryFilter: Locator;
  readonly priceRangeFilter: Locator;
  readonly sortSelect: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.listingsGrid = page.locator('.listings-grid, .marketplace-grid, [data-testid="listings-grid"]');
    this.listingCards = page.locator('.listing-card, .item-card, [data-testid="listing-card"]');
    this.searchBar = page.locator('input[type="search"], [data-testid="search-input"]');
    this.filtersBar = page.locator('.filters-bar, [data-testid="filters-bar"]');
    this.categoryFilter = page.locator('select[name="category"], [data-testid="category-filter"]');
    this.priceRangeFilter = page.locator('.price-range, [data-testid="price-range"]');
    this.sortSelect = page.locator('select[name="sort"], [data-testid="sort-select"]');
    this.loadingSpinner = page.locator('.loading, .spinner, [data-testid="loading"]');
    this.emptyState = page.locator('.empty-state, [data-testid="empty-state"]');
  }

  /**
   * Navigate to marketplace page
   */
  async goto(): Promise<void> {
    await this.page.goto('/marketplace');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for listings to load
   */
  async waitForListings(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await expect(this.listingsGrid).toBeVisible();
  }

  /**
   * Get count of listing cards
   */
  async getListingsCount(): Promise<number> {
    return await this.listingCards.count();
  }

  /**
   * Click on a listing card
   */
  async clickListingCard(index: number = 0): Promise<void> {
    await this.listingCards.nth(index).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search for listings
   */
  async search(query: string): Promise<void> {
    await this.searchBar.fill(query);
    await this.searchBar.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Filter by category
   */
  async filterByCategory(category: string): Promise<void> {
    await this.categoryFilter.selectOption(category);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Sort listings
   */
  async sortBy(option: string): Promise<void> {
    await this.sortSelect.selectOption(option);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if listings are visible
   */
  async expectListingsVisible(): Promise<void> {
    await expect(this.listingsGrid).toBeVisible();
    await expect(this.listingCards.first()).toBeVisible();
  }

  /**
   * Check if empty state is visible
   */
  async expectEmptyStateVisible(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }
}

