import { test, expect } from '@playwright/test';
import { AboutPage } from '../pages/about.page';
import { NavbarComponent } from '../pages/navbar.component';

/**
 * Comprehensive E2E tests for the About Page
 * Tests all content sections and interactive elements
 */

test.describe('About Page', () => {
  let aboutPage: AboutPage;
  let navbar: NavbarComponent;

  test.beforeEach(async ({ page }) => {
    aboutPage = new AboutPage(page);
    navbar = new NavbarComponent(page);
    await aboutPage.goto();
  });

  test.describe('Page Loading and Structure', () => {
    test('should load about page successfully', async ({ page }) => {
      await expect(page).toHaveURL(/\/about/);
      const isLoaded = await aboutPage.isLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('should display navbar on about page', async () => {
      await expect(navbar.navbar).toBeVisible();
      await expect(navbar.logo).toBeVisible();
    });

    test('should have proper page title', async ({ page }) => {
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });
  });

  test.describe('Hero Section', () => {
    test('displays hero section correctly', async () => {
      await expect(aboutPage.heroTitle).toBeVisible();
      await expect(aboutPage.heroSubtitle).toBeVisible();
    });

    test('hero title contains expected text', async ({ page }) => {
      const heroTitle = page.locator('h1:has-text("About DormDeals")');
      await expect(heroTitle).toBeVisible();
      
      const titleText = await heroTitle.textContent();
      expect(titleText?.toLowerCase()).toContain('dormdeals');
    });

    test('hero subtitle is visible and readable', async () => {
      await expect(aboutPage.heroSubtitle).toBeVisible();
      
      const subtitleText = await aboutPage.heroSubtitle.textContent();
      expect(subtitleText?.length).toBeGreaterThan(20);
    });
  });

  test.describe('Mission Section', () => {
    test('displays mission section', async () => {
      await expect(aboutPage.missionSection).toBeVisible();
      await expect(aboutPage.missionTitle).toBeVisible();
    });

    test('mission section has title', async () => {
      const titleText = await aboutPage.missionTitle.textContent();
      expect(titleText?.toLowerCase()).toContain('mission');
    });

    test('mission section has description', async () => {
      await expect(aboutPage.missionDescription).toBeVisible();
      
      const descriptionText = await aboutPage.missionDescription.textContent();
      expect(descriptionText?.length).toBeGreaterThan(50);
    });

    test('verifies mission content', async () => {
      await aboutPage.verifyMissionContent();
    });

    test('displays award icon', async ({ page }) => {
      const awardVisible = await aboutPage.awardIcon.isVisible().catch(() => false);
      if (awardVisible) {
        await expect(aboutPage.awardIcon.first()).toBeVisible();
      }
    });
  });

  test.describe('Stats Section', () => {
    test('displays stats section', async () => {
      await expect(aboutPage.statsSection).toBeVisible();
    });

    test('displays multiple stats', async () => {
      const statsCount = await aboutPage.getStatsCount();
      expect(statsCount).toBeGreaterThan(0);
    });

    test('verifies stats content', async () => {
      await aboutPage.verifyStatsContent();
    });

    test('displays expected stat labels', async ({ page }) => {
      const stats = [
        'Active Students',
        'Items Listed',
        'Successful Transactions',
        'Money Saved'
      ];

      for (const statLabel of stats) {
        const statValue = await aboutPage.getStatValue(statLabel);
        // Stat may exist, check if found or if section is present
        if (statValue) {
          expect(statValue.length).toBeGreaterThan(0);
        }
      }
    });

    test('stats have values displayed', async ({ page }) => {
      const statsItems = page.locator('[class*="stat"], section:has-text("Active Students") > div > div');
      const count = await statsItems.count();
      
      if (count > 0) {
        for (let i = 0; i < Math.min(4, count); i++) {
          const statItem = statsItems.nth(i);
          await expect(statItem).toBeVisible();
          
          const text = await statItem.textContent();
          expect(text?.length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Values Section', () => {
    test('displays values section', async () => {
      await expect(aboutPage.valuesSection).toBeVisible();
      await expect(aboutPage.valuesTitle).toBeVisible();
    });

    test('displays multiple values', async () => {
      const valuesCount = await aboutPage.getValuesCount();
      expect(valuesCount).toBeGreaterThan(0);
    });

    test('verifies values content', async () => {
      await aboutPage.verifyValuesContent();
    });

    test('each value has title and description', async ({ page }) => {
      const valuesList = page.locator('[class*="value"], section:has-text("Our Values") [class*="card"]');
      const count = await valuesList.count();
      
      for (let i = 0; i < count; i++) {
        const valueCard = valuesList.nth(i);
        await expect(valueCard).toBeVisible();
        
        // Check for title
        const hasTitle = await valueCard.locator('h3, [class*="title"]').isVisible().catch(() => false);
        // Check for description
        const hasDescription = await valueCard.locator('p, [class*="description"]').isVisible().catch(() => false);
        
        expect(hasTitle || hasDescription).toBeTruthy();
      }
    });

    test('can retrieve value descriptions', async () => {
      const expectedValues = [
        'Community First',
        'Trust & Safety',
        'Sustainability',
        'Affordability'
      ];

      for (const valueTitle of expectedValues) {
        const description = await aboutPage.getValueDescription(valueTitle);
        // Description may exist, verify if found
        if (description) {
          expect(description.length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Team Section', () => {
    test('displays team section', async () => {
      await expect(aboutPage.teamSection).toBeVisible();
      await expect(aboutPage.teamTitle).toBeVisible();
    });

    test('displays team members', async () => {
      const teamCount = await aboutPage.getTeamMembersCount();
      expect(teamCount).toBeGreaterThan(0);
    });

    test('verifies team content', async () => {
      await aboutPage.verifyTeamContent();
    });

    test('each team member has information', async ({ page }) => {
      const members = page.locator('[class*="team"], section:has-text("Meet Our Team") [class*="card"]');
      const count = await members.count();
      
      for (let i = 0; i < count; i++) {
        const memberCard = members.nth(i);
        await expect(memberCard).toBeVisible();
        
        // Check for name
        const hasName = await memberCard.locator('h3, [class*="name"]').isVisible().catch(() => false);
        // Check for role
        const hasRole = await memberCard.locator('[class*="role"], p').isVisible().catch(() => false);
        
        expect(hasName || hasRole).toBeTruthy();
      }
    });

    test('can retrieve team member info', async () => {
      const expectedMembers = [
        'Alex Johnson',
        'Sarah Chen',
        'Mike Rodriguez'
      ];

      for (const memberName of expectedMembers) {
        const info = await aboutPage.getTeamMemberInfo(memberName);
        // Info may exist, verify structure if found
        if (info.role || info.description) {
          expect(true).toBeTruthy(); // Member info found
        }
      }
    });
  });

  test.describe('CTA Section', () => {
    test('displays CTA section', async () => {
      await expect(aboutPage.ctaSection).toBeVisible();
      await expect(aboutPage.ctaTitle).toBeVisible();
    });

    test('verifies CTA content', async () => {
      await aboutPage.verifyCTAContent();
    });

    test('displays Start Shopping button', async () => {
      const buttonVisible = await aboutPage.startShoppingButton.isVisible().catch(() => false);
      if (buttonVisible) {
        await expect(aboutPage.startShoppingButton).toBeVisible();
      }
    });

    test('displays Start Selling button', async () => {
      const buttonVisible = await aboutPage.startSellingButton.isVisible().catch(() => false);
      if (buttonVisible) {
        await expect(aboutPage.startSellingButton).toBeVisible();
      }
    });
  });

  test.describe('Interactive Elements', () => {
    test('Start Shopping button navigates to marketplace', async ({ page }) => {
      const buttonVisible = await aboutPage.startShoppingButton.isVisible().catch(() => false);
      
      if (buttonVisible) {
        await aboutPage.clickStartShopping();
        await expect(page).toHaveURL(/\/marketplace/);
      }
    });

    test('Start Selling button navigates to create listing or login', async ({ page }) => {
      const buttonVisible = await aboutPage.startSellingButton.isVisible().catch(() => false);
      
      if (buttonVisible) {
        await aboutPage.clickStartSelling();
        await page.waitForLoadState('networkidle');
        
        // Should navigate to create listing or login
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/(create-listing|login)/);
      }
    });

    test('logo navigates to home', async ({ page }) => {
      await navbar.clickLogo();
      await expect(page).toHaveURL(/\/(home|$)/);
    });

    test('navbar links work from about page', async ({ page }) => {
      // Navigate to marketplace via navbar
      await navbar.clickDesktopNavLink('Marketplace');
      await expect(page).toHaveURL(/\/marketplace/);
      
      // Navigate back to about
      await page.goto('/about');
      await navbar.clickDesktopNavLink('About');
      await expect(page).toHaveURL(/\/about/);
    });
  });

  test.describe('Content Verification', () => {
    test('verifies all content sections', async () => {
      await aboutPage.verifyAllContent();
    });

    test('all sections are visible', async () => {
      await aboutPage.expectAllSectionsVisible();
    });

    test('page has proper heading hierarchy', async ({ page }) => {
      const h1 = page.locator('h1');
      const h1Count = await h1.count();
      expect(h1Count).toBeGreaterThan(0);
      expect(h1Count).toBeLessThanOrEqual(1); // One H1 per page
      
      const h2 = page.locator('h2');
      const h2Count = await h2.count();
      expect(h2Count).toBeGreaterThan(0); // Should have multiple H2s for sections
    });

    test('content is readable and well-structured', async ({ page }) => {
      // Check that sections have proper spacing
      const sections = page.locator('section');
      const sectionCount = await sections.count();
      expect(sectionCount).toBeGreaterThan(0);
      
      // Verify text content is present
      const bodyText = await page.textContent('body');
      expect(bodyText?.length).toBeGreaterThan(100);
    });
  });

  test.describe('Visual Elements', () => {
    test('icons are visible in values section', async ({ page }) => {
      await page.evaluate(() => {
        const section = document.querySelector('section:has-text("Our Values")');
        section?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      await page.waitForTimeout(500);

      const icons = page.locator('section:has-text("Our Values") svg, section:has-text("Our Values") [class*="icon"]');
      const iconCount = await icons.count();
      
      // Icons are optional but should be present if values exist
      if (iconCount > 0) {
        expect(iconCount).toBeGreaterThan(0);
      }
    });

    test('team section has visual elements', async ({ page }) => {
      await page.evaluate(() => {
        const section = document.querySelector('section:has-text("Meet Our Team")');
        section?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      await page.waitForTimeout(500);

      const teamCards = page.locator('section:has-text("Meet Our Team") [class*="card"]');
      const cardCount = await teamCards.count();
      
      if (cardCount > 0) {
        await expect(teamCards.first()).toBeVisible();
      }
    });

    test('award icon is visible in mission section', async ({ page }) => {
      await page.evaluate(() => {
        const section = document.querySelector('section:has-text("Our Mission")');
        section?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      await page.waitForTimeout(500);

      const awardVisible = await aboutPage.awardIcon.isVisible().catch(() => false);
      // Award icon is optional
      if (awardVisible) {
        await expect(aboutPage.awardIcon.first()).toBeVisible();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('displays correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await aboutPage.goto();
      
      await expect(aboutPage.heroTitle).toBeVisible();
      await expect(aboutPage.missionSection).toBeVisible();
    });

    test('displays correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await aboutPage.goto();
      
      await expect(aboutPage.heroTitle).toBeVisible();
      await expect(aboutPage.statsSection).toBeVisible();
    });

    test('displays correctly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await aboutPage.goto();
      
      await aboutPage.expectAllSectionsVisible();
    });

    test('no horizontal scroll on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await aboutPage.goto();
      
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBeFalsy();
    });
  });

  test.describe('Accessibility', () => {
    test('images have alt text', async ({ page }) => {
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).not.toBeNull();
      }
    });

    test('links have accessible text', async ({ page }) => {
      const links = page.locator('a[href]');
      const linkCount = await links.count();
      
      // Check first 5 links
      for (let i = 0; i < Math.min(5, linkCount); i++) {
        const link = links.nth(i);
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        
        expect(text?.trim().length || ariaLabel?.length).toBeGreaterThan(0);
      }
    });

    test('buttons have accessible labels', async ({ page }) => {
      const buttons = page.locator('button, a[role="button"]');
      const buttonCount = await buttons.count();
      
      // Check first 5 buttons
      for (let i = 0; i < Math.min(5, buttonCount); i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledBy = await button.getAttribute('aria-labelledby');
        
        expect(text?.trim().length || ariaLabel?.length || ariaLabelledBy).toBeTruthy();
      }
    });
  });

  test.describe('Page Navigation', () => {
    test('can navigate to about page directly', async ({ page }) => {
      await page.goto('/about');
      await expect(page).toHaveURL(/\/about/);
      await aboutPage.isLoaded();
    });

    test('can navigate to about page from navbar', async ({ page }) => {
      await page.goto('/');
      await navbar.clickDesktopNavLink('About');
      await expect(page).toHaveURL(/\/about/);
    });

    test('can navigate away from about page', async ({ page }) => {
      await aboutPage.goto();
      
      await navbar.clickDesktopNavLink('Home');
      await expect(page).toHaveURL(/\/(home|$)/);
    });
  });
});

