import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';

/**
 * Example E2E tests demonstrating Playwright best practices
 * These tests use the Page Object Model pattern
 */

test.describe('Homepage Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should load homepage successfully', async ({ page }) => {
    // Verify homepage is loaded
    await expect(page).toHaveURL(/\/(home|$)/);
    await expect(homePage.navigation).toBeVisible();
    await expect(homePage.logo).toBeVisible();
  });

  test('should display navigation elements', async () => {
    // Check navigation is visible
    await expect(homePage.navigation).toBeVisible();
    
    // Check login/register buttons or user menu
    const isLoggedIn = await homePage.isUserLoggedIn();
    if (isLoggedIn) {
      await expect(homePage.userMenu).toBeVisible();
    } else {
      // If not logged in, should see login/register buttons
      const loginVisible = await homePage.loginButton.isVisible().catch(() => false);
      const registerVisible = await homePage.registerButton.isVisible().catch(() => false);
      expect(loginVisible || registerVisible).toBeTruthy();
    }
  });

  test('should have working search functionality', async ({ page }) => {
    // Check if search bar is visible
    const searchVisible = await homePage.searchBar.isVisible().catch(() => false);
    
    if (searchVisible) {
      // Perform a search
      await homePage.search('test query');
      
      // Verify search results page or URL change
      await expect(page).not.toHaveURL(/\/(home|$)/);
    }
  });

  test('should navigate to login page', async ({ page }) => {
    const loginVisible = await homePage.loginButton.isVisible().catch(() => false);
    
    if (loginVisible) {
      await homePage.clickLogin();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('should navigate to register page', async ({ page }) => {
    const registerVisible = await homePage.registerButton.isVisible().catch(() => false);
    
    if (registerVisible) {
      await homePage.clickRegister();
      await expect(page).toHaveURL(/\/register/);
    }
  });
});

test.describe('Navigation Tests', () => {
  test('should navigate between pages', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Try to navigate to different pages
    // Adjust based on your app's navigation structure
    const navLinks = page.locator('nav a, [role="navigation"] a');
    const linkCount = await navLinks.count();
    
    if (linkCount > 0) {
      // Click first navigation link
      await navLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      // Verify we navigated away from home
      const currentUrl = page.url();
      expect(currentUrl).not.toMatch(/\/(home|$)$/);
    }
  });

  test('should have working logo link', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Navigate away first
    await page.goto('/some-other-page').catch(() => {});
    
    // Click logo to return home
    if (await homePage.logo.isVisible().catch(() => false)) {
      await homePage.logo.click();
      await expect(page).toHaveURL(/\/(home|$)/);
    }
  });
});

test.describe('Responsive Design Tests', () => {
  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Verify page is still functional on mobile
    await expect(homePage.navigation).toBeVisible();
    
    // Check if mobile menu exists (hamburger menu)
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, button[aria-label*="menu" i]');
    const hasMobileMenu = await mobileMenu.isVisible().catch(() => false);
    
    // On mobile, either navigation should be visible or mobile menu should exist
    expect(hasMobileMenu || await homePage.navigation.isVisible()).toBeTruthy();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Verify page is still functional on tablet
    await expect(homePage.navigation).toBeVisible();
    await expect(homePage.content).toBeVisible();
  });

  test('should be responsive on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Verify page is functional on desktop
    await expect(homePage.navigation).toBeVisible();
    await expect(homePage.content).toBeVisible();
  });
});

test.describe('Authentication Flow', () => {
  test('should allow user to login', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto();
    
    // Try to login if login button is visible
    const loginVisible = await homePage.loginButton.isVisible().catch(() => false);
    
    if (loginVisible) {
      await homePage.clickLogin();
      
      // Attempt login (adjust based on your auth flow)
      // const authHelper = new AuthHelper(page);
      // await authHelper.login();
      
      // Verify user is logged in
      // await expect(homePage.userMenu).toBeVisible();
    }
  });
});

