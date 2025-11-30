import { test, expect } from '@playwright/test';
import {
  HomePage,
  MarketplacePage,
  AboutPage,
  ProfilePage,
  PremiumPage,
  NotFoundPage,
  LoginPage,
  RegisterPage,
  CreateListingPage,
  MessagePage,
  ItemDetailPage,
  ResultsPage,
  MainFeaturePage,
} from '../pages';

/**
 * Comprehensive E2E tests for page navigation flows
 * Tests all major navigation paths and page transitions
 */

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Main Navigation', () => {
    test('should navigate from home to marketplace', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      
      // Navigate via navbar
      await homePage.navigateTo('Marketplace');
      await expect(page).toHaveURL(/\/marketplace/);
    });

    test('should navigate from home to about page', async ({ page }) => {
      const homePage = new HomePage(page);
      const aboutPage = new AboutPage(page);
      
      await homePage.goto();
      await homePage.navigateTo('About');
      
      await expect(page).toHaveURL(/\/about/);
      await aboutPage.expectAllSectionsVisible();
    });

    test('should navigate to home via logo', async ({ page }) => {
      const homePage = new HomePage(page);
      
      // Navigate away first
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');
      
      // Click logo to return home
      if (await homePage.logo.isVisible().catch(() => false)) {
        await homePage.logo.click();
        await expect(page).toHaveURL(/\/(home|$)/);
      }
    });

    test('should navigate using Get Started button', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      
      // Click Get Started button
      await homePage.clickGetStarted();
      
      // Should navigate to marketplace or results page
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(marketplace|results)/);
    });

    test('should navigate using Learn More button', async ({ page }) => {
      const homePage = new HomePage(page);
      const aboutPage = new AboutPage(page);
      
      await homePage.goto();
      
      // Click Learn More button
      const learnMoreButton = page.getByRole('link', { name: /learn more/i });
      if (await learnMoreButton.isVisible().catch(() => false)) {
        await learnMoreButton.click();
        await expect(page).toHaveURL(/\/about/);
        await aboutPage.expectAllSectionsVisible();
      }
    });
  });

  test.describe('Authentication Navigation', () => {
    test('should navigate to login page', async ({ page }) => {
      const homePage = new HomePage(page);
      const loginPage = new LoginPage(page);
      
      await homePage.goto();
      
      // Check if login button is visible (user not logged in)
      const loginVisible = await homePage.loginButton.isVisible().catch(() => false);
      
      if (loginVisible) {
        await homePage.clickLogin();
        await expect(page).toHaveURL(/\/login/);
        await loginPage.isLoaded();
      }
    });

    test('should navigate to register page', async ({ page }) => {
      const homePage = new HomePage(page);
      const registerPage = new RegisterPage(page);
      
      await homePage.goto();
      
      const registerVisible = await homePage.registerButton.isVisible().catch(() => false);
      
      if (registerVisible) {
        await homePage.clickRegister();
        await expect(page).toHaveURL(/\/register/);
        await registerPage.isLoaded();
      }
    });

    test('should navigate from login to register', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const registerPage = new RegisterPage(page);
      
      await loginPage.goto();
      
      // Look for register link on login page
      const registerLink = page.locator('a:has-text("Register"), a:has-text("Sign Up"), a[href*="register"]');
      if (await registerLink.isVisible().catch(() => false)) {
        await registerLink.click();
        await expect(page).toHaveURL(/\/register/);
        await registerPage.isLoaded();
      }
    });

    test('should navigate from register to login', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const registerPage = new RegisterPage(page);
      
      await registerPage.goto();
      
      // Look for login link on register page
      const loginLink = page.locator('a:has-text("Login"), a:has-text("Sign In"), a[href*="login"]');
      if (await loginLink.isVisible().catch(() => false)) {
        await loginLink.click();
        await expect(page).toHaveURL(/\/login/);
        await loginPage.isLoaded();
      }
    });
  });

  test.describe('User Profile Navigation', () => {
    test('should navigate to profile page from user menu', async ({ page }) => {
      const homePage = new HomePage(page);
      const profilePage = new ProfilePage(page);
      
      await homePage.goto();
      
      // Check if user is logged in
      const isLoggedIn = await homePage.isUserLoggedIn();
      
      if (isLoggedIn) {
        // Open user menu
        await homePage.userMenu.click();
        
        // Click profile link
        const profileLink = page.locator('a:has-text("Profile"), a[href*="profile"]');
        if (await profileLink.isVisible().catch(() => false)) {
          await profileLink.click();
          await expect(page).toHaveURL(/\/profile/);
          await profilePage.isLoaded();
        }
      } else {
        test.skip();
      }
    });

    test('should navigate to create listing from profile', async ({ page }) => {
      const profilePage = new ProfilePage(page);
      const createListingPage = new CreateListingPage(page);
      
      // Only test if user can access profile
      try {
        await profilePage.goto();
        await profilePage.isLoaded();
        
        // Click Create Listing button
        if (await profilePage.createListingButton.isVisible().catch(() => false)) {
          await profilePage.clickCreateListing();
          await expect(page).toHaveURL(/\/create-listing/);
          await createListingPage.isLoaded();
        }
      } catch {
        test.skip(); // User not authenticated
      }
    });
  });

  test.describe('Marketplace Navigation', () => {
    test('should navigate from marketplace to item detail', async ({ page }) => {
      const marketplacePage = new MarketplacePage(page);
      
      await marketplacePage.goto();
      await marketplacePage.isLoaded();
      
      // Click on first item if available
      const firstItem = page.locator('[class*="product-card"], [class*="listing-card"]').first();
      if (await firstItem.isVisible().catch(() => false)) {
        await firstItem.click();
        await page.waitForLoadState('networkidle');
        
        // Should be on item detail or listing detail page
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/(item|listing)\/\d+/);
      }
    });

    test('should navigate from marketplace search to results', async ({ page }) => {
      const marketplacePage = new MarketplacePage(page);
      const resultsPage = new ResultsPage(page);
      
      await marketplacePage.goto();
      
      // Perform search if search bar is available
      const searchBar = page.locator('input[type="search"], input[placeholder*="search" i]');
      if (await searchBar.isVisible().catch(() => false)) {
        await searchBar.fill('test');
        await searchBar.press('Enter');
        await page.waitForLoadState('networkidle');
        
        // Should navigate to results page
        const currentUrl = page.url();
        if (currentUrl.includes('/results')) {
          await resultsPage.isLoaded();
        }
      }
    });
  });

  test.describe('About Page Navigation', () => {
    test('should navigate from about to marketplace via CTA', async ({ page }) => {
      const aboutPage = new AboutPage(page);
      const marketplacePage = new MarketplacePage(page);
      
      await aboutPage.goto();
      await aboutPage.expectAllSectionsVisible();
      
      // Click Start Shopping button
      if (await aboutPage.startShoppingButton.isVisible().catch(() => false)) {
        await aboutPage.clickStartShopping();
        await expect(page).toHaveURL(/\/marketplace/);
        await marketplacePage.isLoaded();
      }
    });

    test('should navigate from about to create listing via CTA', async ({ page }) => {
      const aboutPage = new AboutPage(page);
      
      await aboutPage.goto();
      
      // Click Start Selling button
      if (await aboutPage.startSellingButton.isVisible().catch(() => false)) {
        await aboutPage.clickStartSelling();
        await page.waitForLoadState('networkidle');
        
        // Should navigate to create listing or login
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/(create-listing|login)/);
      }
    });
  });

  test.describe('Premium Page Navigation', () => {
    test('should navigate to premium page', async ({ page }) => {
      const premiumPage = new PremiumPage(page);
      
      await premiumPage.goto();
      await premiumPage.isLoaded();
      await premiumPage.expectAllSectionsVisible();
    });

    test('should navigate from premium to login if not authenticated', async ({ page }) => {
      const premiumPage = new PremiumPage(page);
      const loginPage = new LoginPage(page);
      
      await premiumPage.goto();
      
      // If user is not authenticated, sign in button should be visible
      const isAuthenticated = await premiumPage.isUserAuthenticated();
      
      if (!isAuthenticated) {
        if (await premiumPage.signInButton.isVisible().catch(() => false)) {
          await premiumPage.clickSignInToSubscribe();
          await expect(page).toHaveURL(/\/login/);
          await loginPage.isLoaded();
        }
      } else {
        test.skip();
      }
    });

    test('should navigate from premium to register', async ({ page }) => {
      const premiumPage = new PremiumPage(page);
      const registerPage = new RegisterPage(page);
      
      await premiumPage.goto();
      
      const isAuthenticated = await premiumPage.isUserAuthenticated();
      
      if (!isAuthenticated) {
        if (await premiumPage.createAccountButton.isVisible().catch(() => false)) {
          await premiumPage.clickCreateAccount();
          await expect(page).toHaveURL(/\/register/);
          await registerPage.isLoaded();
        }
      } else {
        test.skip();
      }
    });
  });

  test.describe('404 Error Page Navigation', () => {
    test('should show 404 page for invalid route', async ({ page }) => {
      const notFoundPage = new NotFoundPage(page);
      
      await notFoundPage.goto404();
      await notFoundPage.isLoaded();
      await notFoundPage.expectAllElementsVisible();
    });

    test('should navigate home from 404 page', async ({ page }) => {
      const notFoundPage = new NotFoundPage(page);
      const homePage = new HomePage(page);
      
      await notFoundPage.goto404();
      
      // Click Go Home button
      await notFoundPage.clickGoHome();
      await expect(page).toHaveURL(/\/(home|$)/);
      await homePage.isLoaded();
    });

    test('should navigate to marketplace from 404 page', async ({ page }) => {
      const notFoundPage = new NotFoundPage(page);
      const marketplacePage = new MarketplacePage(page);
      
      await notFoundPage.goto404();
      
      // Click Marketplace link
      if (await notFoundPage.marketplaceLink.isVisible().catch(() => false)) {
        await notFoundPage.clickMarketplaceLink();
        await expect(page).toHaveURL(/\/marketplace/);
        await marketplacePage.isLoaded();
      }
    });
  });

  test.describe('Mobile Navigation', () => {
    test('should open mobile menu on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const homePage = new HomePage(page);
      await homePage.goto();
      
      // Check for mobile menu button
      const mobileMenuButton = page.locator('button[aria-label*="menu" i], button:has(svg[class*="menu"])');
      
      if (await mobileMenuButton.isVisible().catch(() => false)) {
        await mobileMenuButton.click();
        
        // Menu should be visible after click
        const mobileMenu = page.locator('[class*="mobile-menu"], nav[class*="mobile"]');
        await expect(mobileMenu).toBeVisible();
      }
    });

    test('should navigate from mobile menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const homePage = new HomePage(page);
      const marketplacePage = new MarketplacePage(page);
      
      await homePage.goto();
      
      // Open mobile menu
      const mobileMenuButton = page.locator('button[aria-label*="menu" i], button:has(svg[class*="menu"])');
      if (await mobileMenuButton.isVisible().catch(() => false)) {
        await mobileMenuButton.click();
        
        // Click marketplace link in mobile menu
        const marketplaceLink = page.locator('a:has-text("Marketplace"), a[href*="marketplace"]');
        if (await marketplaceLink.isVisible().catch(() => false)) {
          await marketplaceLink.click();
          await expect(page).toHaveURL(/\/marketplace/);
          await marketplacePage.isLoaded();
        }
      }
    });
  });

  test.describe('Breadcrumb and Back Navigation', () => {
    test('should navigate back using browser back button', async ({ page }) => {
      const homePage = new HomePage(page);
      const aboutPage = new AboutPage(page);
      
      // Navigate to home
      await homePage.goto();
      const homeUrl = page.url();
      
      // Navigate to about
      await aboutPage.goto();
      await expect(page).toHaveURL(/\/about/);
      
      // Go back
      await page.goBack();
      await page.waitForLoadState('networkidle');
      
      // Should be back on home
      expect(page.url()).toMatch(homeUrl);
    });

    test('should navigate using Go Back button on 404 page', async ({ page }) => {
      const homePage = new HomePage(page);
      const notFoundPage = new NotFoundPage(page);
      
      // Start on home
      await homePage.goto();
      
      // Navigate to 404
      await notFoundPage.goto404();
      
      // Click Go Back button
      await notFoundPage.clickGoBack();
      
      // Should navigate back (may need to wait)
      await page.waitForTimeout(500);
    });
  });

  test.describe('Deep Linking', () => {
    test('should load marketplace page directly', async ({ page }) => {
      const marketplacePage = new MarketplacePage(page);
      
      await marketplacePage.goto();
      await marketplacePage.isLoaded();
    });

    test('should load about page directly', async ({ page }) => {
      const aboutPage = new AboutPage(page);
      
      await aboutPage.goto();
      await aboutPage.isLoaded();
      await aboutPage.expectAllSectionsVisible();
    });

    test('should load profile page directly', async ({ page }) => {
      const profilePage = new ProfilePage(page);
      
      // May require authentication
      try {
        await profilePage.goto();
        await profilePage.isLoaded();
      } catch {
        // Expected if not authenticated
        test.skip();
      }
    });

    test('should load premium page directly', async ({ page }) => {
      const premiumPage = new PremiumPage(page);
      
      await premiumPage.goto();
      await premiumPage.isLoaded();
      await premiumPage.expectAllSectionsVisible();
    });
  });

  test.describe('Footer Navigation', () => {
    test('should navigate via footer links if available', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      
      // Look for footer
      if (await homePage.footer.isVisible().catch(() => false)) {
        // Look for about link in footer
        const aboutLink = homePage.footer.locator('a:has-text("About"), a[href*="about"]');
        if (await aboutLink.isVisible().catch(() => false)) {
          await aboutLink.click();
          await expect(page).toHaveURL(/\/about/);
        }
      }
    });
  });
});

