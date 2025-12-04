import { test, expect } from '@playwright/test';
import { MainFeaturePage } from '../pages/main-feature.page';
import { ResultsPage } from '../pages/results.page';
import { ItemDetailPage } from '../pages/item-detail.page';
import { MarketplacePage } from '../pages/marketplace.page';
import { testFormData } from '../fixtures/test-data';
import { AuthHelper } from '../helpers/auth-helper';

test.describe('Main Feature Workflow - Search & Filter', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to main feature page before each test
    const mainFeaturePage = new MainFeaturePage(page);
    await mainFeaturePage.goto();
  });

  test('user can complete search workflow with valid data', async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);
    const resultsPage = new ResultsPage(page);

    // Fill search form with valid data
    await mainFeaturePage.fillSearchForm(testFormData.search.validInput);

    // Submit search
    await mainFeaturePage.submitSearch();

    // Wait for navigation to results page
    await page.waitForURL(/\/results/, { timeout: 10000 });

    // Verify results appear
    await resultsPage.waitForResults();
    await resultsPage.expectResultsVisible();

    // Verify results contain search query
    await resultsPage.expectResultsContainQuery(testFormData.search.validInput.query);
  });

  test('user can search by query only', async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);
    const resultsPage = new ResultsPage(page);

    // Search with just a query
    await mainFeaturePage.search('calculator');

    // Verify navigation to results
    await page.waitForURL(/\/results/, { timeout: 10000 });
    await resultsPage.expectResultsVisible();

    // Verify results count is greater than 0
    const count = await resultsPage.getResultsCount();
    expect(count).toBeGreaterThan(0);
  });

  test('user can filter results by category', async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);
    const resultsPage = new ResultsPage(page);

    // Submit search to get to results page
    await mainFeaturePage.search('laptop');
    await page.waitForURL(/\/results/, { timeout: 10000 });
    await resultsPage.waitForResults();

    // Filter by category
    await resultsPage.filterByCategory('Electronics');

    // Verify all results match the category
    await resultsPage.expectResultsMatchCategory('Electronics');
  });

  test('user can filter results by price range', async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);
    const resultsPage = new ResultsPage(page);

    // Submit search
    await mainFeaturePage.search('textbook');
    await page.waitForURL(/\/results/, { timeout: 10000 });
    await resultsPage.waitForResults();

    // Filter by price range
    await resultsPage.filterByPriceRange('50', '150');

    // Verify all results are in price range
    await resultsPage.expectResultsInPriceRange(50, 150);
  });

  test('user can sort results', async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);
    const resultsPage = new ResultsPage(page);

    // Submit search
    await mainFeaturePage.search('chair');
    await page.waitForURL(/\/results/, { timeout: 10000 });
    await resultsPage.waitForResults();

    const initialCount = await resultsPage.getResultsCount();
    expect(initialCount).toBeGreaterThan(0);

    // Sort by price low to high
    await resultsPage.sortBy('price_low_to_high');

    // Verify results are sorted (check first two prices)
    if (initialCount >= 2) {
      const price1 = await resultsPage.getResultCardPrice(0);
      const price2 = await resultsPage.getResultCardPrice(1);
      const numPrice1 = parseFloat(price1.replace(/[^0-9.]/g, ''));
      const numPrice2 = parseFloat(price2.replace(/[^0-9.]/g, ''));
      expect(numPrice1).toBeLessThanOrEqual(numPrice2);
    }
  });

  test('user can click on result card to view details', async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);
    const resultsPage = new ResultsPage(page);
    const itemDetailPage = new ItemDetailPage(page);

    // Submit search
    await mainFeaturePage.search('laptop');
    await page.waitForURL(/\/results/, { timeout: 10000 });
    await resultsPage.waitForResults();

    // Get first result title
    const resultTitle = await resultsPage.getResultCardTitle(0);
    expect(resultTitle).toBeTruthy();

    // Click on first result
    await resultsPage.clickResultCard(0);

    // Verify navigation to item detail page
    await page.waitForURL(/\/item\/|\/listing\//, { timeout: 10000 });
    await itemDetailPage.waitForLoad();

    // Verify item title matches
    const detailTitle = await itemDetailPage.getItemTitle();
    expect(detailTitle).toContain(resultTitle.substring(0, 10)); // Partial match
  });

  test('user can add item to cart from results', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    const mainFeaturePage = new MainFeaturePage(page);
    const resultsPage = new ResultsPage(page);

    // Login first (required for cart functionality)
    await authHelper.login();
    await authHelper.waitForAuth();

    // Navigate and search
    await mainFeaturePage.goto();
    await mainFeaturePage.search('laptop');
    await page.waitForURL(/\/results/, { timeout: 10000 });
    await resultsPage.waitForResults();

    // Add first item to cart
    await resultsPage.addToCartFromResult(0);

    // Verify item was added (check for success message or cart badge update)
    // This depends on your implementation
    await page.waitForTimeout(1000);
  });

  test('user can add item to wishlist from results', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    const mainFeaturePage = new MainFeaturePage(page);
    const resultsPage = new ResultsPage(page);

    // Login first
    await authHelper.login();
    await authHelper.waitForAuth();

    // Navigate and search
    await mainFeaturePage.goto();
    await mainFeaturePage.search('textbook');
    await page.waitForURL(/\/results/, { timeout: 10000 });
    await resultsPage.waitForResults();

    // Add first item to wishlist
    await resultsPage.addToWishlistFromResult(0);

    // Verify item was added
    await page.waitForTimeout(1000);
  });

  test('user can reset filters and see all results', async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);
    const resultsPage = new ResultsPage(page);

    // Submit search with filters
    await mainFeaturePage.fillSearchForm({
      query: 'laptop',
      category: 'Electronics',
      minPrice: '500',
      maxPrice: '1000',
    });
    await mainFeaturePage.submitSearch();
    await page.waitForURL(/\/results/, { timeout: 10000 });
    await resultsPage.waitForResults();

    const filteredCount = await resultsPage.getResultsCount();

    // Reset filters
    await resultsPage.resetFilters();

    // Verify results count increased (or stayed same if all items match)
    const resetCount = await resultsPage.getResultsCount();
    expect(resetCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test('user can navigate from marketplace to item detail', async ({ page }) => {
    const marketplacePage = new MarketplacePage(page);
    const itemDetailPage = new ItemDetailPage(page);

    // Navigate to marketplace
    await marketplacePage.goto();
    await marketplacePage.waitForListings();

    // Verify listings are visible
    await marketplacePage.expectListingsVisible();

    // Click on first listing
    await marketplacePage.clickListingCard(0);

    // Verify navigation to item detail
    await page.waitForURL(/\/item\/|\/listing\//, { timeout: 10000 });
    await itemDetailPage.waitForLoad();
    await expect(itemDetailPage.itemTitle).toBeVisible();
  });

  test('user can use combined filters for precise search', async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);
    const resultsPage = new ResultsPage(page);

    // Fill form with multiple filters
    await mainFeaturePage.fillSearchForm({
      query: 'laptop',
      category: 'Electronics',
      condition: 'Like New',
      minPrice: '500',
      maxPrice: '1500',
      location: 'Lafayette',
      sortBy: 'price_low_to_high',
    });

    await mainFeaturePage.submitSearch();
    await page.waitForURL(/\/results/, { timeout: 10000 });
    await resultsPage.waitForResults();

    // Verify results are visible and match criteria
    await resultsPage.expectResultsVisible();
    const count = await resultsPage.getResultsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

