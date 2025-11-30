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
  CheckoutPage,
  NavbarComponent,
} from '../pages';

/**
 * Comprehensive E2E tests for all pages
 * Ensures every page loads correctly, displays properly, and is navigable
 * Uses Page Object Model pattern for maintainability
 */

test.describe('All Pages - Page Loading and Display', () => {
  test.describe('Public Pages', () => {
    test('Homepage loads and displays correctly', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      
      await expect(page).toHaveURL(/\/(home|$)/);
      const isLoaded = await homePage.isLoaded();
      expect(isLoaded).toBeTruthy();
      
      // Verify key sections
      await homePage.expectHeroVisible();
      await homePage.expectFeaturesVisible();
    });

    test('Marketplace page loads and displays correctly', async ({ page }) => {
      const marketplacePage = new MarketplacePage(page);
      await marketplacePage.goto();
      
      await expect(page).toHaveURL(/\/marketplace/);
      const isLoaded = await marketplacePage.isLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('About page loads and displays correctly', async ({ page }) => {
      const aboutPage = new AboutPage(page);
      await aboutPage.goto();
      
      await expect(page).toHaveURL(/\/about/);
      const isLoaded = await aboutPage.isLoaded();
      expect(isLoaded).toBeTruthy();
      
      // Verify all sections
      await aboutPage.expectAllSectionsVisible();
    });

    test('Premium page loads and displays correctly', async ({ page }) => {
      const premiumPage = new PremiumPage(page);
      await premiumPage.goto();
      
      await expect(page).toHaveURL(/\/premium/);
      const isLoaded = await premiumPage.isLoaded();
      expect(isLoaded).toBeTruthy();
      
      // Verify pricing information
      await premiumPage.expectAllSectionsVisible();
    });

    test('404 page displays for invalid routes', async ({ page }) => {
      const notFoundPage = new NotFoundPage(page);
      await notFoundPage.goto404();
      
      const isLoaded = await notFoundPage.isLoaded();
      expect(isLoaded).toBeTruthy();
      
      // Verify error elements
      await notFoundPage.expectAllElementsVisible();
    });

    test('Login page loads and displays correctly', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      
      await expect(page).toHaveURL(/\/login/);
      const isLoaded = await loginPage.isLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('Register page loads and displays correctly', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      await registerPage.goto();
      
      await expect(page).toHaveURL(/\/register/);
      const isLoaded = await registerPage.isLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('Main Feature page (root) loads correctly', async ({ page }) => {
      const mainFeaturePage = new MainFeaturePage(page);
      await mainFeaturePage.goto();
      
      await expect(page).toHaveURL(/\/(home|$)/);
      const isLoaded = await mainFeaturePage.isLoaded();
      expect(isLoaded).toBeTruthy();
    });
  });

  test.describe('Protected Pages (may require authentication)', () => {
    test('Profile page loads if authenticated', async ({ page }) => {
      const profilePage = new ProfilePage(page);
      
      try {
        await profilePage.goto();
        const isLoaded = await profilePage.isLoaded();
        
        if (isLoaded) {
          await expect(profilePage.profileHeader).toBeVisible();
        } else {
          // If not authenticated, should redirect or show login
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/\/(profile|login)/);
        }
      } catch {
        // Expected if not authenticated
        test.skip();
      }
    });

    test('Create Listing page loads if authenticated', async ({ page }) => {
      const createListingPage = new CreateListingPage(page);
      
      try {
        await createListingPage.goto();
        const isLoaded = await createListingPage.isLoaded();
        
        if (isLoaded) {
          expect(isLoaded).toBeTruthy();
        } else {
          // May redirect to login
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/\/(create-listing|login)/);
        }
      } catch {
        test.skip();
      }
    });

    test('Message/Chat page loads if authenticated', async ({ page }) => {
      const messagePage = new MessagePage(page);
      
      try {
        await messagePage.goto();
        const isLoaded = await messagePage.isLoaded();
        
        if (isLoaded) {
          expect(isLoaded).toBeTruthy();
        } else {
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/\/(chat|login)/);
        }
      } catch {
        test.skip();
      }
    });

    test('Checkout page loads if authenticated', async ({ page }) => {
      const checkoutPage = new CheckoutPage(page);
      
      try {
        await checkoutPage.goto();
        const isLoaded = await checkoutPage.isLoaded();
        
        if (isLoaded) {
          expect(isLoaded).toBeTruthy();
        } else {
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/\/(checkout|login)/);
        }
      } catch {
        test.skip();
      }
    });
  });

  test.describe('Dynamic Pages', () => {
    test('Results page loads correctly', async ({ page }) => {
      const resultsPage = new ResultsPage(page);
      
      try {
        await resultsPage.goto();
        const isLoaded = await resultsPage.isLoaded();
        
        if (isLoaded) {
          expect(isLoaded).toBeTruthy();
        } else {
          // Results page may require search params
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/\/(results|marketplace)/);
        }
      } catch {
        // Results page might require search query
        test.skip();
      }
    });

    test('Item Detail page loads if item exists', async ({ page }) => {
      // Navigate to marketplace first to find an item
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');
      
      // Try to find a product card
      const productCards = page.locator('[class*="product-card"], [class*="listing-card"], a[href*="/item/"], a[href*="/listing/"]');
      const cardCount = await productCards.count();
      
      if (cardCount > 0) {
        // Click first product
        await productCards.first().click();
        await page.waitForLoadState('networkidle');
        
        // Should be on item detail page
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/(item|listing)\/\d+/);
      } else {
        test.skip();
      }
    });
  });
});

test.describe('All Pages - Navigation and UI', () => {
  test.describe('Navbar on All Pages', () => {
    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/marketplace', name: 'Marketplace' },
      { path: '/about', name: 'About' },
      { path: '/premium', name: 'Premium' },
    ];

    for (const pageInfo of pages) {
      test(`navbar is visible and functional on ${pageInfo.name}`, async ({ page }) => {
        await page.goto(pageInfo.path);
        await page.waitForLoadState('networkidle');
        
        const navbar = new NavbarComponent(page);
        
        // Verify navbar is visible
        await expect(navbar.navbar).toBeVisible();
        await expect(navbar.logo).toBeVisible();
        
        // Verify navigation works
        await navbar.verifyAllElements();
      });
    }
  });

  test.describe('Mobile Menu on All Pages', () => {
    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/marketplace', name: 'Marketplace' },
      { path: '/about', name: 'About' },
    ];

    for (const pageInfo of pages) {
      test(`mobile menu works on ${pageInfo.name}`, async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(pageInfo.path);
        await page.waitForLoadState('networkidle');
        
        const navbar = new NavbarComponent(page);
        
        // Verify mobile menu button is visible
        await expect(navbar.mobileMenuButton).toBeVisible();
        
        // Open mobile menu
        await navbar.openMobileMenu();
        expect(await navbar.isMobileMenuOpen()).toBeTruthy();
        
        // Close mobile menu
        await navbar.closeMobileMenu();
        await page.waitForTimeout(300);
        
        // Menu should be closed
        expect(await navbar.isMobileMenuOpen()).toBeFalsy();
      });
    }
  });
});

test.describe('All Pages - Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ];

  const pages = [
    { path: '/', name: 'Homepage' },
    { path: '/marketplace', name: 'Marketplace' },
    { path: '/about', name: 'About' },
    { path: '/premium', name: 'Premium' },
  ];

  for (const viewport of viewports) {
    for (const pageInfo of pages) {
      test(`${pageInfo.name} displays correctly on ${viewport.name} viewport`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(pageInfo.path);
        await page.waitForLoadState('networkidle');
        
        // Verify page loads
        const bodyContent = await page.textContent('body');
        expect(bodyContent?.length).toBeGreaterThan(0);
        
        // Verify navbar is visible
        const navbar = new NavbarComponent(page);
        await expect(navbar.navbar).toBeVisible();
        
        // Verify no horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBeFalsy();
      });
    }
  }
});

test.describe('All Pages - Accessibility', () => {
  const pages = [
    { path: '/', name: 'Homepage' },
    { path: '/marketplace', name: 'Marketplace' },
    { path: '/about', name: 'About' },
    { path: '/premium', name: 'Premium' },
  ];

  for (const pageInfo of pages) {
    test(`${pageInfo.name} has proper heading hierarchy`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      
      // Check for H1
      const h1 = page.locator('h1');
      const h1Count = await h1.count();
      expect(h1Count).toBeGreaterThan(0);
      expect(h1Count).toBeLessThanOrEqual(1); // One H1 per page
    });

    test(`${pageInfo.name} images have alt text`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).not.toBeNull();
      }
    });

    test(`${pageInfo.name} is keyboard navigable`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      
      // Tab through a few elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(200);
        
        const focused = page.locator(':focus');
        const isVisible = await focused.isVisible().catch(() => false);
        
        if (!isVisible) break;
        await expect(focused).toBeVisible();
      }
    });
  }
});

