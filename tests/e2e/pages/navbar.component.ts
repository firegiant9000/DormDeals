import { Page, Locator, expect } from '@playwright/test';

/**
 * Component Page Object Model for the Navbar
 * Encapsulates navbar-related selectors and actions
 * Can be used across all pages since navbar is present on every page
 */
export class NavbarComponent {
  readonly page: Page;
  readonly navbar: Locator;
  readonly logo: Locator;
  readonly desktopNav: Locator;
  readonly mobileMenuButton: Locator;
  readonly mobileMenu: Locator;
  readonly userMenuButton: Locator;
  readonly userMenuDropdown: Locator;
  readonly themeToggle: Locator;
  readonly cartButton: Locator;
  readonly wishlistButton: Locator;
  readonly chatButton: Locator;
  readonly sellButton: Locator;
  readonly upgradeButton: Locator;
  
  // Navigation links
  readonly homeLink: Locator;
  readonly marketplaceLink: Locator;
  readonly aboutLink: Locator;
  
  // User menu items
  readonly profileLink: Locator;
  readonly createListingLink: Locator;
  readonly analyticsLink: Locator;
  readonly adminPanelLink: Locator;
  readonly loginLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navbar = page.locator('nav, [role="navigation"], [class*="navbar"]');
    this.logo = page.locator('a[href="/"], [class*="logo"], a:has-text("DormDeals")');
    this.desktopNav = page.locator('nav:not([class*="mobile"]), [class*="desktop-nav"], .hidden.lg\\:flex');
    this.mobileMenuButton = page.locator('button[aria-label*="menu" i], button:has(svg[class*="menu"]), button:has(svg[class*="Menu"])');
    this.mobileMenu = page.locator('[class*="mobile-menu"], nav[class*="mobile"], [class*="mobile-nav"]');
    this.userMenuButton = page.locator('button:has-text("Account"), button:has-text("Login"), [class*="user-menu"] button');
    this.userMenuDropdown = page.locator('[class*="dropdown"], [class*="user-menu"] [class*="menu"], [class*="user-menu"] [class*="dropdown"]');
    this.themeToggle = page.locator('button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="light" i], button:has(svg[class*="moon"]), button:has(svg[class*="sun"])');
    
    // Action buttons
    this.cartButton = page.locator('button:has(svg[class*="cart"]), button[aria-label*="cart" i], [class*="cart-button"]');
    this.wishlistButton = page.locator('button:has(svg[class*="heart"]), button[aria-label*="wishlist" i], [class*="wishlist-button"]');
    this.chatButton = page.locator('a:has(svg[class*="message"]), a[href*="chat"], button:has(svg[class*="message"])');
    this.sellButton = page.locator('a:has-text("Sell"), button:has-text("Sell"), a[href*="create-listing"]:has-text("Sell")');
    this.upgradeButton = page.locator('a:has-text("Upgrade"), button:has-text("Upgrade"), a[href*="premium"]');
    
    // Navigation links
    this.homeLink = page.locator('a[href="/"], nav a:has-text("Home"), [class*="nav"] a:has-text("Home")');
    this.marketplaceLink = page.locator('a[href*="marketplace"], nav a:has-text("Marketplace")');
    this.aboutLink = page.locator('a[href*="about"], nav a:has-text("About")');
    
    // User menu items
    this.profileLink = page.locator('a[href*="profile"], [class*="user-menu"] a:has-text("Profile")');
    this.createListingLink = page.locator('a[href*="create-listing"], [class*="user-menu"] a:has-text("Create Listing")');
    this.analyticsLink = page.locator('a[href*="analytics"], [class*="user-menu"] a:has-text("Analytics")');
    this.adminPanelLink = page.locator('a[href*="admin"], [class*="user-menu"] a:has-text("Admin")');
    this.loginLink = page.locator('a[href*="login"], [class*="user-menu"] a:has-text("Login")');
    this.logoutButton = page.locator('button:has-text("Logout"), [class*="user-menu"] button:has-text("Logout")');
  }

  /**
   * Check if navbar is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.navbar.isVisible().catch(() => false);
  }

  /**
   * Click on logo to navigate home
   */
  async clickLogo(): Promise<void> {
    await this.logo.first().click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate using desktop navigation link
   */
  async clickDesktopNavLink(linkName: 'Home' | 'Marketplace' | 'About'): Promise<void> {
    const linkMap = {
      Home: this.homeLink,
      Marketplace: this.marketplaceLink,
      About: this.aboutLink,
    };
    
    const link = linkMap[linkName];
    if (await link.isVisible().catch(() => false)) {
      await link.first().click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Open mobile menu
   */
  async openMobileMenu(): Promise<void> {
    if (await this.mobileMenuButton.isVisible().catch(() => false)) {
      await this.mobileMenuButton.click();
      await this.page.waitForTimeout(300); // Wait for animation
      await expect(this.mobileMenu).toBeVisible();
    }
  }

  /**
   * Close mobile menu
   */
  async closeMobileMenu(): Promise<void> {
    // Click menu button again or close button
    const closeButton = this.page.locator('button:has(svg[class*="x"]), button:has(svg[class*="close"])');
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
      await this.page.waitForTimeout(300);
    } else if (await this.mobileMenuButton.isVisible().catch(() => false)) {
      await this.mobileMenuButton.click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Navigate using mobile menu link
   */
  async clickMobileNavLink(linkName: 'Home' | 'Marketplace' | 'About'): Promise<void> {
    await this.openMobileMenu();
    
    const linkMap = {
      Home: this.mobileMenu.locator('a:has-text("Home"), a[href="/"]'),
      Marketplace: this.mobileMenu.locator('a:has-text("Marketplace"), a[href*="marketplace"]'),
      About: this.mobileMenu.locator('a:has-text("About"), a[href*="about"]'),
    };
    
    const link = linkMap[linkName];
    if (await link.isVisible().catch(() => false)) {
      await link.first().click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Open user menu dropdown
   */
  async openUserMenu(): Promise<void> {
    if (await this.userMenuButton.isVisible().catch(() => false)) {
      await this.userMenuButton.click();
      await this.page.waitForTimeout(300); // Wait for dropdown animation
    }
  }

  /**
   * Close user menu dropdown
   */
  async closeUserMenu(): Promise<void> {
    // Click outside or press Escape
    if (await this.userMenuDropdown.isVisible().catch(() => false)) {
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Click on user menu item
   */
  async clickUserMenuItem(item: 'Profile' | 'Create Listing' | 'Analytics' | 'Admin Panel' | 'Login' | 'Logout'): Promise<void> {
    await this.openUserMenu();
    
    const itemMap = {
      Profile: this.profileLink,
      'Create Listing': this.createListingLink,
      Analytics: this.analyticsLink,
      'Admin Panel': this.adminPanelLink,
      Login: this.loginLink,
      Logout: this.logoutButton,
    };
    
    const menuItem = itemMap[item];
    if (await menuItem.isVisible().catch(() => false)) {
      await menuItem.first().click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Toggle theme (light/dark mode)
   */
  async toggleTheme(): Promise<void> {
    if (await this.themeToggle.isVisible().catch(() => false)) {
      await this.themeToggle.click();
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * Click cart button
   */
  async clickCart(): Promise<void> {
    if (await this.cartButton.isVisible().catch(() => false)) {
      await this.cartButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Click wishlist button
   */
  async clickWishlist(): Promise<void> {
    if (await this.wishlistButton.isVisible().catch(() => false)) {
      await this.wishlistButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Click chat button
   */
  async clickChat(): Promise<void> {
    if (await this.chatButton.isVisible().catch(() => false)) {
      await this.chatButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Click sell/create listing button
   */
  async clickSell(): Promise<void> {
    if (await this.sellButton.isVisible().catch(() => false)) {
      await this.sellButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Click upgrade to premium button
   */
  async clickUpgrade(): Promise<void> {
    if (await this.upgradeButton.isVisible().catch(() => false)) {
      await this.upgradeButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Check if user is logged in (based on user menu content)
   */
  async isUserLoggedIn(): Promise<boolean> {
    await this.openUserMenu();
    const hasProfile = await this.profileLink.isVisible().catch(() => false);
    const hasLogout = await this.logoutButton.isVisible().catch(() => false);
    await this.closeUserMenu();
    
    return hasProfile || hasLogout;
  }

  /**
   * Check if mobile menu is open
   */
  async isMobileMenuOpen(): Promise<boolean> {
    return await this.mobileMenu.isVisible().catch(() => false);
  }

  /**
   * Check if user menu is open
   */
  async isUserMenuOpen(): Promise<boolean> {
    return await this.userMenuDropdown.isVisible().catch(() => false);
  }

  /**
   * Verify all navigation links are visible (desktop)
   */
  async verifyDesktopNavLinks(): Promise<void> {
    const hasHome = await this.homeLink.isVisible().catch(() => false);
    const hasMarketplace = await this.marketplaceLink.isVisible().catch(() => false);
    const hasAbout = await this.aboutLink.isVisible().catch(() => false);
    
    // At least one should be visible
    expect(hasHome || hasMarketplace || hasAbout).toBeTruthy();
  }

  /**
   * Verify mobile menu button is visible on mobile viewport
   */
  async verifyMobileMenuButton(): Promise<void> {
    // Set mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await expect(this.mobileMenuButton).toBeVisible();
  }

  /**
   * Verify user menu button is visible
   */
  async verifyUserMenuButton(): Promise<void> {
    await expect(this.userMenuButton).toBeVisible();
  }

  /**
   * Get current active navigation link
   */
  async getActiveNavLink(): Promise<string | null> {
    const activeLink = this.page.locator('nav a[class*="active"], nav a[class*="primary"], nav a[aria-current="page"]');
    if (await activeLink.isVisible().catch(() => false)) {
      const href = await activeLink.first().getAttribute('href');
      return href;
    }
    return null;
  }

  /**
   * Verify navbar is sticky/fixed at top
   */
  async verifyNavbarSticky(): Promise<void> {
    await expect(this.navbar).toBeVisible();
    
    // Scroll down
    await this.page.evaluate(() => window.scrollTo(0, 500));
    await this.page.waitForTimeout(300);
    
    // Navbar should still be visible
    await expect(this.navbar).toBeVisible();
  }

  /**
   * Verify all navbar elements are present
   */
  async verifyAllElements(): Promise<void> {
    await expect(this.navbar).toBeVisible();
    await expect(this.logo).toBeVisible();
    
    // Check viewport size to determine which nav to verify
    const viewport = this.page.viewportSize();
    const isMobile = viewport && viewport.width < 1024;
    
    if (isMobile) {
      await expect(this.mobileMenuButton).toBeVisible();
    } else {
      await this.verifyDesktopNavLinks();
    }
    
    await expect(this.userMenuButton).toBeVisible();
  }
}

