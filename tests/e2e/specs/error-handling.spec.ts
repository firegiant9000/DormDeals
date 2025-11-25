import { test, expect } from '@playwright/test';
import { MainFeaturePage } from '../pages/main-feature.page';
import { ResultsPage } from '../pages/results.page';
import { CreateListingPage } from '../pages/create-listing.page';
import { ItemDetailPage } from '../pages/item-detail.page';
import { testFormData } from '../fixtures/test-data';

test.describe('Error Handling - API Errors', () => {
  test('handles network failure gracefully during search', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/**', route => route.abort());

    const mainFeaturePage = new MainFeaturePage(page);
    await mainFeaturePage.goto();

    // Attempt search
    await mainFeaturePage.search('laptop');

    // Verify error handling (error message or fallback UI)
    await expect(
      page.getByText(/network.*error|connection.*failed|try.*again/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('handles 500 server error during search', async ({ page }) => {
    // Mock 500 error
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    const mainFeaturePage = new MainFeaturePage(page);
    await mainFeaturePage.goto();

    await mainFeaturePage.search('laptop');

    // Verify error message is shown
    await expect(
      page.getByText(/server.*error|something.*wrong|try.*again/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('handles 404 error when item not found', async ({ page }) => {
    // Mock 404 error for item detail
    await page.route('**/api/items/nonexistent**', route => {
      route.fulfill({
        status: 404,
        body: JSON.stringify({ error: 'Item not found' }),
      });
    });

    const itemDetailPage = new ItemDetailPage(page);
    await itemDetailPage.goto('nonexistent-id');

    // Verify error message or 404 page
    await expect(
      page.getByText(/not.*found|404|item.*not.*exist/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('handles timeout during API call', async ({ page }) => {
    // Simulate timeout
    await page.route('**/api/**', route => {
      // Delay response beyond timeout
      setTimeout(() => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ data: [] }),
        });
      }, 30000);
    });

    const mainFeaturePage = new MainFeaturePage(page);
    await mainFeaturePage.goto();

    await mainFeaturePage.search('laptop');

    // Verify timeout handling (error message or loading state)
    await expect(
      page.getByText(/timeout|request.*took.*long|try.*again/i)
    ).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Error Handling - Empty Results', () => {
  test('displays empty state when no search results found', async ({ page }) => {
    // Mock empty results
    await page.route('**/api/**/search**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          items: [],
          totalCount: 0,
          currentPage: 1,
          totalPages: 0,
        }),
      });
    });

    const mainFeaturePage = new MainFeaturePage(page);
    const resultsPage = new ResultsPage(page);

    await mainFeaturePage.goto();
    await mainFeaturePage.search('nonexistentitem12345');
    await page.waitForURL(/\/results/, { timeout: 10000 });

    // Verify empty state is displayed
    await resultsPage.expectEmptyStateVisible();
    await expect(resultsPage.tryAgainButton).toBeVisible();
  });

  test('allows user to try again from empty state', async ({ page }) => {
    const resultsPage = new ResultsPage(page);

    // Navigate to results page with empty state
    await page.goto('/results?query=nonexistent');
    await resultsPage.waitForResults();

    // Click try again button
    await resultsPage.clickTryAgain();

    // Verify navigation back to search or main feature page
    await expect(page).toHaveURL(/\/(main-feature|search|$)/);
  });
});

test.describe('Error Handling - Form Submission Errors', () => {
  test('handles validation errors during listing creation', async ({ page }) => {
    const createListingPage = new CreateListingPage(page);
    await createListingPage.goto();

    // Submit form with invalid data
    await createListingPage.fillForm({
      title: '', // Empty title
      description: 'Test',
      price: 'abc', // Invalid price
      category: '',
      condition: '',
      location: '',
    });

    await createListingPage.submitForm();

    // Verify validation errors are shown
    await createListingPage.expectFormErrorsVisible();
    const errors = await createListingPage.getFormErrors();
    expect(errors.length).toBeGreaterThan(0);
  });

  test('handles API error during listing creation', async ({ page }) => {
    // Mock API error
    await page.route('**/api/items**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Failed to create listing' }),
      });
    });

    const createListingPage = new CreateListingPage(page);
    await createListingPage.goto();

    // Fill and submit valid form
    await createListingPage.fillForm(testFormData.createListing.validInput);
    await createListingPage.submitForm();

    // Verify error message is shown
    await createListingPage.expectFormErrorsVisible();
  });
});

test.describe('Error Handling - Edge Cases', () => {
  test('handles very long search query', async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);
    const resultsPage = new ResultsPage(page);

    await mainFeaturePage.goto();

    // Search with very long query
    const longQuery = 'a'.repeat(1000);
    await mainFeaturePage.search(longQuery);

    // Should either show results or handle gracefully
    await page.waitForURL(/\/results/, { timeout: 10000 });
    await resultsPage.waitForResults();
  });

  test('handles special characters in search query', async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);
    const resultsPage = new ResultsPage(page);

    await mainFeaturePage.goto();

    // Search with special characters
    await mainFeaturePage.search('!@#$%^&*()');

    // Should handle gracefully (show empty results or error)
    await page.waitForURL(/\/results/, { timeout: 10000 });
    await resultsPage.waitForResults();
  });

  test('handles unicode characters in search query', async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);
    const resultsPage = new ResultsPage(page);

    await mainFeaturePage.goto();

    // Search with unicode characters
    await mainFeaturePage.search('你好世界');

    // Should handle gracefully
    await page.waitForURL(/\/results/, { timeout: 10000 });
    await resultsPage.waitForResults();
  });

  test('handles rapid successive searches', async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);

    await mainFeaturePage.goto();

    // Perform rapid searches
    await mainFeaturePage.search('laptop');
    await page.waitForTimeout(100);
    await mainFeaturePage.search('textbook');
    await page.waitForTimeout(100);
    await mainFeaturePage.search('chair');

    // Should handle debouncing or cancel previous requests
    await page.waitForURL(/\/results/, { timeout: 10000 });
  });

  test('handles navigation to invalid item ID', async ({ page }) => {
    const itemDetailPage = new ItemDetailPage(page);

    // Navigate to invalid item ID
    await itemDetailPage.goto('invalid-id-12345');

    // Verify error handling
    await expect(
      page.getByText(/not.*found|404|invalid.*item/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('handles missing authentication for protected actions', async ({ page }) => {
    const createListingPage = new CreateListingPage(page);

    // Try to access create listing without login
    await createListingPage.goto();

    // Should redirect to login or show error
    await expect(
      page.getByText(/login|sign.*in|authentication.*required/i)
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Error Handling - Loading States', () => {
  test('shows loading state during search', async ({ page }) => {
    // Delay API response
    await page.route('**/api/**/search**', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ items: [], totalCount: 0 }),
        });
      }, 2000);
    });

    const mainFeaturePage = new MainFeaturePage(page);
    await mainFeaturePage.goto();

    await mainFeaturePage.search('laptop');

    // Verify loading indicator appears
    await mainFeaturePage.expectLoadingVisible();
  });

  test('hides loading state after results load', async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);
    const resultsPage = new ResultsPage(page);

    await mainFeaturePage.goto();
    await mainFeaturePage.search('laptop');
    await page.waitForURL(/\/results/, { timeout: 10000 });

    // Verify loading is hidden
    await mainFeaturePage.expectLoadingHidden();
    await resultsPage.waitForResults();
  });
});

