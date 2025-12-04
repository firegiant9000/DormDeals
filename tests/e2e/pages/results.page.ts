import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Results Page (Search Results)
 */
export class ResultsPage {
  readonly page: Page;
  readonly resultsContainer: Locator;
  readonly resultCards: Locator;
  readonly emptyState: Locator;
  readonly tryAgainButton: Locator;
  readonly searchBar: Locator;
  readonly filtersButton: Locator;
  readonly sortSelect: Locator;
  readonly pagination: Locator;
  readonly nextPageButton: Locator;
  readonly previousPageButton: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.resultsContainer = page.locator('.results-container, [data-testid="results-container"], main');
    this.resultCards = page.locator('.item-card, .listing-card, [data-testid="item-card"], [data-testid="listing-card"]');
    this.emptyState = page.locator('.empty-state, [data-testid="empty-state"], :has-text("No results")');
    this.tryAgainButton = page.locator('button:has-text("Try Again"), a:has-text("Try Again"), [data-testid="try-again"]');
    this.searchBar = page.locator('input[type="search"], [data-testid="search-input"]');
    this.filtersButton = page.locator('button:has-text("Filter"), button:has-text("Filters"), [data-testid="filters-button"]');
    this.sortSelect = page.locator('select[name="sort"], [data-testid="sort-select"]');
    this.pagination = page.locator('.pagination, [data-testid="pagination"]');
    this.nextPageButton = page.locator('button:has-text("Next"), a:has-text("Next"), [data-testid="next-page"]');
    this.previousPageButton = page.locator('button:has-text("Previous"), a:has-text("Previous"), [data-testid="prev-page"]');
    this.loadingSpinner = page.locator('.loading, .spinner, [data-testid="loading"]');
  }

  /**
   * Navigate to results page
   */
  async goto(): Promise<void> {
    await this.page.goto('/results');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for results to load
   */
  async waitForResults(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await expect(this.resultsContainer).toBeVisible();
  }

  /**
   * Check if results are visible
   */
  async expectResultsVisible(): Promise<void> {
    await expect(this.resultsContainer).toBeVisible();
  }

  /**
   * Check if empty state is visible
   */
  async expectEmptyStateVisible(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  /**
   * Get count of result cards
   */
  async getResultsCount(): Promise<number> {
    return await this.resultCards.count();
  }

  /**
   * Click on a result card
   */
  async clickResultCard(index: number = 0): Promise<void> {
    await this.resultCards.nth(index).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click try again button
   */
  async clickTryAgain(): Promise<void> {
    await this.tryAgainButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Apply sort option
   */
  async sortBy(option: string): Promise<void> {
    await this.sortSelect.selectOption(option);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to next page
   */
  async goToNextPage(): Promise<void> {
    await this.nextPageButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to previous page
   */
  async goToPreviousPage(): Promise<void> {
    await this.previousPageButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if pagination is visible
   */
  async expectPaginationVisible(): Promise<void> {
    await expect(this.pagination).toBeVisible();
  }

  /**
   * Get result card by index
   */
  getResultCard(index: number): Locator {
    return this.resultCards.nth(index);
  }

  /**
   * Get result card title
   */
  async getResultCardTitle(index: number): Promise<string> {
    const card = this.getResultCard(index);
    const title = card.locator('h3, h4, .title, [data-testid="item-title"]');
    return await title.textContent() || '';
  }

  /**
   * Get result card price
   */
  async getResultCardPrice(index: number): Promise<string> {
    const card = this.getResultCard(index);
    const price = card.locator('.price, [data-testid="item-price"]');
    return await price.textContent() || '';
  }

  /**
   * Filter results by category
   */
  async filterByCategory(category: string): Promise<void> {
    const categoryFilter = this.page.locator('select[name="category"], [data-testid="category-filter"]');
    await categoryFilter.selectOption(category);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Filter results by price range
   */
  async filterByPriceRange(minPrice: string, maxPrice: string): Promise<void> {
    const minInput = this.page.locator('input[name="minPrice"], [data-testid="min-price"]');
    const maxInput = this.page.locator('input[name="maxPrice"], [data-testid="max-price"]');
    await minInput.fill(minPrice);
    await maxInput.fill(maxPrice);
    await this.page.locator('button:has-text("Apply"), button[type="submit"]').click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Filter results by condition
   */
  async filterByCondition(condition: string): Promise<void> {
    const conditionFilter = this.page.locator('select[name="condition"], [data-testid="condition-filter"]');
    await conditionFilter.selectOption(condition);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Reset all filters
   */
  async resetFilters(): Promise<void> {
    const resetButton = this.page.locator('button:has-text("Reset"), button:has-text("Clear Filters"), [data-testid="reset-filters"]');
    await resetButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify result count matches expected
   */
  async expectResultCount(expectedCount: number): Promise<void> {
    const actualCount = await this.getResultsCount();
    expect(actualCount).toBe(expectedCount);
  }

  /**
   * Verify result count is greater than or equal to expected
   */
  async expectResultCountAtLeast(minCount: number): Promise<void> {
    const actualCount = await this.getResultsCount();
    expect(actualCount).toBeGreaterThanOrEqual(minCount);
  }

  /**
   * Verify results contain search query
   */
  async expectResultsContainQuery(query: string): Promise<void> {
    const count = await this.getResultsCount();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const title = await this.getResultCardTitle(i);
      const description = this.getResultCard(i).locator('.description, [data-testid="item-description"]');
      const descText = await description.textContent().catch(() => '');
      expect(
        title.toLowerCase().includes(query.toLowerCase()) ||
        descText.toLowerCase().includes(query.toLowerCase())
      ).toBeTruthy();
    }
  }

  /**
   * Verify all results are in price range
   */
  async expectResultsInPriceRange(minPrice: number, maxPrice: number): Promise<void> {
    const count = await this.getResultsCount();
    for (let i = 0; i < count; i++) {
      const priceText = await this.getResultCardPrice(i);
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      expect(price).toBeGreaterThanOrEqual(minPrice);
      expect(price).toBeLessThanOrEqual(maxPrice);
    }
  }

  /**
   * Verify all results match category
   */
  async expectResultsMatchCategory(category: string): Promise<void> {
    const count = await this.getResultsCount();
    for (let i = 0; i < count; i++) {
      const card = this.getResultCard(i);
      const categoryBadge = card.locator('.category, [data-testid="category"]');
      const categoryText = await categoryBadge.textContent().catch(() => '');
      expect(categoryText.toLowerCase()).toContain(category.toLowerCase());
    }
  }

  /**
   * Add item to cart from results
   */
  async addToCartFromResult(index: number = 0): Promise<void> {
    const card = this.getResultCard(index);
    const addToCartButton = card.locator('button:has-text("Add to Cart"), [data-testid="add-to-cart"]');
    await addToCartButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Add item to wishlist from results
   */
  async addToWishlistFromResult(index: number = 0): Promise<void> {
    const card = this.getResultCard(index);
    const addToWishlistButton = card.locator('button:has-text("Wishlist"), [data-testid="add-to-wishlist"]');
    await addToWishlistButton.click();
    await this.page.waitForTimeout(500);
  }
}

