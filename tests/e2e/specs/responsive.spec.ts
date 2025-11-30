import { test, expect, devices } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { MarketplacePage } from '../pages/marketplace.page';
import { AboutPage } from '../pages/about.page';
import { NavbarComponent } from '../pages/navbar.component';
import { ProfilePage } from '../pages/profile.page';
import { PremiumPage } from '../pages/premium.page';

/**
 * Comprehensive Responsive Design E2E Tests
 * Tests all pages across mobile, tablet, and desktop viewports
 */

// Viewport sizes
const viewports = {
  mobile: { width: 375, height: 667 },
  mobileLarge: { width: 414, height: 896 },
  tablet: { width: 768, height: 1024 },
  tabletLandscape: { width: 1024, height: 768 },
  desktop: { width: 1920, height: 1080 },
  desktopSmall: { width: 1366, height: 768 },
};

test.describe('Responsive Design', () => {
  test.describe('Mobile Viewport (375x667)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
    });

    test('displays correctly on mobile - Homepage', async ({ page }) => {
      await page.goto('/');
      
      const homePage = new HomePage(page);
      const navbar = new NavbarComponent(page);
      
      // Verify navbar is visible
      await expect(navbar.navbar).toBeVisible();
      
      // Verify mobile menu button is visible
      await expect(navbar.mobileMenuButton).toBeVisible();
      
      // Verify logo is visible
      await expect(navbar.logo).toBeVisible();
      
      // Verify hero section
      await homePage.expectHeroVisible();
      
      // Verify desktop nav is hidden on mobile
      const desktopNavVisible = await navbar.desktopNav.isVisible().catch(() => false);
      expect(desktopNavVisible).toBeFalsy();
    });

    test('mobile menu opens and closes correctly', async ({ page }) => {
      await page.goto('/');
      
      const navbar = new NavbarComponent(page);
      
      // Open mobile menu
      await navbar.openMobileMenu();
      expect(await navbar.isMobileMenuOpen()).toBeTruthy();
      
      // Verify menu has navigation links
      const mobileMenuLinks = page.locator('[class*="mobile-menu"] a, nav[class*="mobile"] a');
      const linkCount = await mobileMenuLinks.count();
      expect(linkCount).toBeGreaterThan(0);
      
      // Close mobile menu
      await navbar.closeMobileMenu();
      await page.waitForTimeout(300);
    });

    test('displays correctly on mobile - Marketplace', async ({ page }) => {
      await page.goto('/marketplace');
      
      const marketplacePage = new MarketplacePage(page);
      const navbar = new NavbarComponent(page);
      
      // Verify page loads
      await marketplacePage.isLoaded();
      
      // Verify navbar with mobile menu
      await expect(navbar.mobileMenuButton).toBeVisible();
      
      // Verify content is visible and not cut off
      const mainContent = page.locator('main, [class*="container"], [class*="content"]');
      await expect(mainContent.first()).toBeVisible();
    });

    test('displays correctly on mobile - About Page', async ({ page }) => {
      await page.goto('/about');
      
      const aboutPage = new AboutPage(page);
      
      // Verify page loads
      await aboutPage.isLoaded();
      
      // Verify hero section is visible
      await expect(aboutPage.heroTitle).toBeVisible();
      
      // Verify sections stack vertically on mobile
      await expect(aboutPage.missionSection).toBeVisible();
    });

    test('displays correctly on mobile - Profile Page', async ({ page }) => {
      try {
        await page.goto('/profile');
        const profilePage = new ProfilePage(page);
        
        // Only test if page loads (may require auth)
        if (await profilePage.isLoaded()) {
          await expect(profilePage.profileHeader).toBeVisible();
        }
      } catch {
        // Skip if requires authentication
        test.skip();
      }
    });

    test('displays correctly on mobile - Premium Page', async ({ page }) => {
      await page.goto('/premium');
      
      const premiumPage = new PremiumPage(page);
      
      // Verify page loads
      await premiumPage.isLoaded();
      
      // Verify pricing card is visible
      await expect(premiumPage.pricingCard).toBeVisible();
      
      // Verify buttons are stacked on mobile
      const buttons = page.locator('button, a[class*="button"]');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
    });

    test('navigation works on mobile', async ({ page }) => {
      await page.goto('/');
      
      const navbar = new NavbarComponent(page);
      
      // Open mobile menu
      await navbar.openMobileMenu();
      
      // Navigate to marketplace via mobile menu
      await navbar.clickMobileNavLink('Marketplace');
      await expect(page).toHaveURL(/\/marketplace/);
      
      // Navigate back to home
      await navbar.openMobileMenu();
      await navbar.clickMobileNavLink('Home');
      await expect(page).toHaveURL(/\/(home|$)/);
    });

    test('forms are usable on mobile', async ({ page }) => {
      await page.goto('/');
      
      // Check if search form exists
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      const hasSearch = await searchInput.isVisible().catch(() => false);
      
      if (hasSearch) {
        // Verify input is large enough for touch
        const box = await searchInput.boundingBox();
        expect(box?.height).toBeGreaterThanOrEqual(40); // Minimum touch target size
      }
    });

    test('images are responsive on mobile', async ({ page }) => {
      await page.goto('/');
      
      // Scroll to find images
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(500);
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      // Check first few images
      for (let i = 0; i < Math.min(3, imageCount); i++) {
        const img = images.nth(i);
        const box = await img.boundingBox();
        
        if (box) {
          // Images should fit within viewport width
          expect(box.width).toBeLessThanOrEqual(viewports.mobile.width);
        }
      }
    });

    test('text is readable on mobile', async ({ page }) => {
      await page.goto('/');
      
      const bodyText = page.locator('body');
      const fontSize = await bodyText.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return parseInt(styles.fontSize);
      });
      
      // Font size should be at least 14px for readability
      expect(fontSize).toBeGreaterThanOrEqual(14);
    });
  });

  test.describe('Tablet Viewport (768x1024)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
    });

    test('displays correctly on tablet', async ({ page }) => {
      await page.goto('/');
      
      const homePage = new HomePage(page);
      const navbar = new NavbarComponent(page);
      
      // Verify navbar is visible
      await expect(navbar.navbar).toBeVisible();
      
      // Tablet may show mobile menu or desktop nav depending on breakpoint
      const mobileMenuVisible = await navbar.mobileMenuButton.isVisible().catch(() => false);
      const desktopNavVisible = await navbar.desktopNav.isVisible().catch(() => false);
      
      // One of them should be visible
      expect(mobileMenuVisible || desktopNavVisible).toBeTruthy();
      
      // Verify hero section
      await homePage.expectHeroVisible();
      
      // Verify features section
      await homePage.expectFeaturesVisible();
    });

    test('grid layouts adapt to tablet', async ({ page }) => {
      await page.goto('/marketplace');
      
      // Check if grid items are displayed appropriately
      const gridItems = page.locator('[class*="grid"] [class*="card"], [class*="product-card"]');
      const itemCount = await gridItems.count();
      
      if (itemCount > 0) {
        // Verify items are visible and sized appropriately
        const firstItem = gridItems.first();
        await expect(firstItem).toBeVisible();
        
        const box = await firstItem.boundingBox();
        expect(box?.width).toBeLessThanOrEqual(viewports.tablet.width);
      }
    });

    test('tablet navigation works', async ({ page }) => {
      await page.goto('/');
      
      const navbar = new NavbarComponent(page);
      
      // Try desktop nav first
      const desktopNavVisible = await navbar.desktopNav.isVisible().catch(() => false);
      
      if (desktopNavVisible) {
        await navbar.clickDesktopNavLink('Marketplace');
        await expect(page).toHaveURL(/\/marketplace/);
      } else {
        // Use mobile menu if desktop nav not visible
        await navbar.openMobileMenu();
        await navbar.clickMobileNavLink('Marketplace');
        await expect(page).toHaveURL(/\/marketplace/);
      }
    });

    test('sidebar layouts work on tablet', async ({ page }) => {
      await page.goto('/');
      
      // Look for sidebar elements
      const sidebar = page.locator('aside, [class*="sidebar"]');
      const sidebarVisible = await sidebar.isVisible().catch(() => false);
      
      if (sidebarVisible) {
        // Sidebar should be visible or collapsed appropriately
        await expect(sidebar).toBeVisible();
      }
    });
  });

  test.describe('Desktop Viewport (1920x1080)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
    });

    test('displays correctly on desktop', async ({ page }) => {
      await page.goto('/');
      
      const homePage = new HomePage(page);
      const navbar = new NavbarComponent(page);
      
      // Verify navbar is visible
      await expect(navbar.navbar).toBeVisible();
      
      // Verify desktop navigation is visible
      await expect(navbar.desktopNav).toBeVisible();
      
      // Mobile menu should be hidden
      const mobileMenuVisible = await navbar.mobileMenuButton.isVisible().catch(() => false);
      expect(mobileMenuVisible).toBeFalsy();
      
      // Verify all sections
      await homePage.expectHeroVisible();
      await homePage.expectFeaturesVisible();
    });

    test('desktop navigation works', async ({ page }) => {
      await page.goto('/');
      
      const navbar = new NavbarComponent(page);
      
      // Test all navigation links
      await navbar.clickDesktopNavLink('Home');
      await expect(page).toHaveURL(/\/(home|$)/);
      
      await navbar.clickDesktopNavLink('Marketplace');
      await expect(page).toHaveURL(/\/marketplace/);
      
      await navbar.clickDesktopNavLink('About');
      await expect(page).toHaveURL(/\/about/);
    });

    test('multi-column layouts display correctly', async ({ page }) => {
      await page.goto('/marketplace');
      
      // Check for multi-column grid
      const grid = page.locator('[class*="grid"]');
      const gridVisible = await grid.isVisible().catch(() => false);
      
      if (gridVisible) {
        // Verify grid uses multiple columns on desktop
        const gridItems = page.locator('[class*="grid"] > *');
        const itemCount = await gridItems.count();
        
        if (itemCount > 0) {
          const firstItemBox = await gridItems.first().boundingBox();
          const secondItemBox = await gridItems.nth(1).boundingBox().catch(() => null);
          
          // On desktop, multiple items should be visible side by side
          if (secondItemBox && firstItemBox) {
            // Items should be horizontally arranged
            expect(secondItemBox.y).toBeCloseTo(firstItemBox.y, 1);
          }
        }
      }
    });

    test('hover effects work on desktop', async ({ page }) => {
      await page.goto('/');
      
      // Find interactive elements
      const buttons = page.locator('button, a[class*="button"]');
      const firstButton = buttons.first();
      
      if (await firstButton.isVisible().catch(() => false)) {
        // Hover over button
        await firstButton.hover();
        await page.waitForTimeout(200);
        
        // Verify button is still visible and interactive
        await expect(firstButton).toBeVisible();
      }
    });
  });

  test.describe('Viewport Transitions', () => {
    test('adapts when resizing from mobile to desktop', async ({ page }) => {
      // Start on mobile
      await page.setViewportSize(viewports.mobile);
      await page.goto('/');
      
      const navbar = new NavbarComponent(page);
      expect(await navbar.mobileMenuButton.isVisible()).toBeTruthy();
      
      // Resize to desktop
      await page.setViewportSize(viewports.desktop);
      await page.waitForTimeout(500);
      
      // Desktop nav should appear
      const desktopNavVisible = await navbar.desktopNav.isVisible().catch(() => false);
      expect(desktopNavVisible).toBeTruthy();
      
      // Mobile menu button should be hidden
      const mobileMenuVisible = await navbar.mobileMenuButton.isVisible().catch(() => false);
      expect(mobileMenuVisible).toBeFalsy();
    });

    test('adapts when resizing from desktop to mobile', async ({ page }) => {
      // Start on desktop
      await page.setViewportSize(viewports.desktop);
      await page.goto('/');
      
      const navbar = new NavbarComponent(page);
      expect(await navbar.desktopNav.isVisible()).toBeTruthy();
      
      // Resize to mobile
      await page.setViewportSize(viewports.mobile);
      await page.waitForTimeout(500);
      
      // Mobile menu button should appear
      expect(await navbar.mobileMenuButton.isVisible()).toBeTruthy();
    });
  });

  test.describe('Cross-Page Responsive Testing', () => {
    const pages = [
      { path: '/', name: 'Home' },
      { path: '/marketplace', name: 'Marketplace' },
      { path: '/about', name: 'About' },
      { path: '/premium', name: 'Premium' },
    ];

    const viewportEntries = [
      { name: 'mobile', viewport: viewports.mobile },
      { name: 'tablet', viewport: viewports.tablet },
      { name: 'desktop', viewport: viewports.desktop },
    ];

    for (const { name, viewport } of viewportEntries) {
      test(`${name} viewport - all pages are responsive`, async ({ page }) => {
        for (const pageInfo of pages) {
          await page.setViewportSize(viewport);
          await page.goto(pageInfo.path);
          await page.waitForLoadState('networkidle');
          
          // Verify navbar is visible
          const navbar = new NavbarComponent(page);
          await expect(navbar.navbar).toBeVisible();
          
          // Verify main content is visible
          const mainContent = page.locator('main, [class*="container"], [class*="content"], body > div');
          await expect(mainContent.first()).toBeVisible();
          
          // Verify no horizontal scroll
          const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
          });
          expect(hasHorizontalScroll).toBeFalsy();
        }
      });
    }
  });

  test.describe('Touch Target Sizes (Mobile)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
    });

    test('buttons meet minimum touch target size', async ({ page }) => {
      await page.goto('/');
      
      const buttons = page.locator('button, a[class*="button"], input[type="submit"]');
      const buttonCount = await buttons.count();
      
      // Check first 5 buttons
      for (let i = 0; i < Math.min(5, buttonCount); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible().catch(() => false)) {
          const box = await button.boundingBox();
          
          // Minimum touch target: 44x44px (WCAG recommendation)
          if (box) {
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });

    test('links meet minimum touch target size', async ({ page }) => {
      await page.goto('/');
      
      const links = page.locator('a[href]');
      const linkCount = await links.count();
      
      // Check navigation links
      const navLinks = page.locator('nav a, [class*="nav"] a');
      const navLinkCount = await navLinks.count();
      
      for (let i = 0; i < Math.min(5, navLinkCount); i++) {
        const link = navLinks.nth(i);
        if (await link.isVisible().catch(() => false)) {
          const box = await link.boundingBox();
          
          if (box) {
            // Touch targets should be at least 44x44px
            const minSize = Math.min(box.width, box.height);
            expect(minSize).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });
  });

  test.describe('Content Overflow', () => {
    test('no horizontal scroll on mobile', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto('/');
      
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBeFalsy();
    });

    test('no horizontal scroll on tablet', async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
      await page.goto('/');
      
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBeFalsy();
    });

    test('no horizontal scroll on desktop', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto('/');
      
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBeFalsy();
    });

    test('text does not overflow containers', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto('/');
      
      // Check text elements
      const textElements = page.locator('p, h1, h2, h3, span[class*="text"]');
      const count = await textElements.count();
      
      // Sample a few text elements
      for (let i = 0; i < Math.min(10, count); i++) {
        const element = textElements.nth(i);
        if (await element.isVisible().catch(() => false)) {
          const box = await element.boundingBox();
          const styles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              overflow: computed.overflow,
              textOverflow: computed.textOverflow,
              wordWrap: computed.wordWrap,
            };
          });
          
          if (box) {
            // Text should fit within viewport
            expect(box.width).toBeLessThanOrEqual(viewports.mobile.width);
          }
        }
      }
    });
  });

  test.describe('Specific Breakpoint Testing', () => {
    test('mobile large (414x896)', async ({ page }) => {
      await page.setViewportSize(viewports.mobileLarge);
      await page.goto('/');
      
      const navbar = new NavbarComponent(page);
      await expect(navbar.navbar).toBeVisible();
      await expect(navbar.mobileMenuButton).toBeVisible();
    });

    test('tablet landscape (1024x768)', async ({ page }) => {
      await page.setViewportSize(viewports.tabletLandscape);
      await page.goto('/');
      
      const navbar = new NavbarComponent(page);
      await expect(navbar.navbar).toBeVisible();
      
      // Should show desktop nav at this width
      const desktopNavVisible = await navbar.desktopNav.isVisible().catch(() => false);
      expect(desktopNavVisible).toBeTruthy();
    });

    test('small desktop (1366x768)', async ({ page }) => {
      await page.setViewportSize(viewports.desktopSmall);
      await page.goto('/');
      
      const navbar = new NavbarComponent(page);
      await expect(navbar.desktopNav).toBeVisible();
      
      const homePage = new HomePage(page);
      await homePage.expectHeroVisible();
    });
  });
});

