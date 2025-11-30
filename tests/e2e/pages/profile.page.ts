import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Profile Page
 * Encapsulates all profile page-related selectors and actions
 */
export class ProfilePage {
  readonly page: Page;
  readonly profileHeader: Locator;
  readonly profileImage: Locator;
  readonly username: Locator;
  readonly email: Locator;
  readonly tabs: Locator;
  readonly listingsTab: Locator;
  readonly cartTab: Locator;
  readonly favoritesTab: Locator;
  readonly messagesTab: Locator;
  readonly settingsTab: Locator;
  readonly analyticsTab: Locator;
  readonly premiumTab: Locator;
  readonly adminTab: Locator;
  readonly createListingButton: Locator;
  readonly editProfileButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.profileHeader = page.locator('[class*="profile"], [data-testid="profile-header"]');
    this.profileImage = page.locator('img[alt*="profile" i], [class*="profile-image"], .profile img');
    this.username = page.locator('h1:has-text("Profile"), [class*="username"], [class*="displayName"]');
    this.email = page.locator('[class*="email"], p:has-text("@")');
    this.tabs = page.locator('nav[class*="tab"], [role="tablist"], [class*="tabs"]');
    this.listingsTab = page.locator('button:has-text("My Listings"), button:has-text("Listings"), [role="tab"]:has-text("Listings")');
    this.cartTab = page.locator('button:has-text("Cart"), [role="tab"]:has-text("Cart")');
    this.favoritesTab = page.locator('button:has-text("Favorites"), [role="tab"]:has-text("Favorites")');
    this.messagesTab = page.locator('button:has-text("Messages"), [role="tab"]:has-text("Messages")');
    this.settingsTab = page.locator('button:has-text("Settings"), [role="tab"]:has-text("Settings")');
    this.analyticsTab = page.locator('button:has-text("Analytics"), [role="tab"]:has-text("Analytics")');
    this.premiumTab = page.locator('button:has-text("Premium"), [role="tab"]:has-text("Premium")');
    this.adminTab = page.locator('button:has-text("Admin"), [role="tab"]:has-text("Admin")');
    this.createListingButton = page.locator('button:has-text("Create New Listing"), a:has-text("Create New Listing")');
    this.editProfileButton = page.locator('button[title="Edit Profile"], button:has-text("Edit"), [class*="edit-button"]');
  }

  /**
   * Navigate to the profile page
   */
  async goto(): Promise<void> {
    await this.page.goto('/profile');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if profile page is loaded
   */
  async isLoaded(): Promise<boolean> {
    try {
      await expect(this.page).toHaveURL(/\/profile/);
      await expect(this.profileHeader).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Click on a specific tab
   */
  async clickTab(tabName: 'listings' | 'cart' | 'favorites' | 'messages' | 'settings' | 'analytics' | 'premium' | 'admin'): Promise<void> {
    const tabMap = {
      listings: this.listingsTab,
      cart: this.cartTab,
      favorites: this.favoritesTab,
      messages: this.messagesTab,
      settings: this.settingsTab,
      analytics: this.analyticsTab,
      premium: this.premiumTab,
      admin: this.adminTab,
    };
    
    const tab = tabMap[tabName];
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
      await this.page.waitForTimeout(500); // Wait for tab content to load
    }
  }

  /**
   * Click Create Listing button
   */
  async clickCreateListing(): Promise<void> {
    await this.createListingButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click Edit Profile button
   */
  async clickEditProfile(): Promise<void> {
    await this.editProfileButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Get listings count from listings tab
   */
  async getListingsCount(): Promise<number> {
    const listings = this.page.locator('[class*="listing"], [class*="product-card"]');
    return await listings.count();
  }

  /**
   * Check if user is verified
   */
  async isUserVerified(): Promise<boolean> {
    const verifiedBadge = this.page.locator('span:has-text("Verified"), [class*="verified"]');
    return await verifiedBadge.isVisible().catch(() => false);
  }

  /**
   * Check if user is premium
   */
  async isUserPremium(): Promise<boolean> {
    const premiumBadge = this.page.locator('[class*="premium"], [title="Premium User"], svg[class*="crown"]');
    return await premiumBadge.isVisible().catch(() => false);
  }

  /**
   * Check if user is admin
   */
  async isUserAdmin(): Promise<boolean> {
    const adminBadge = this.page.locator('span:has-text("Admin"), [class*="admin"]');
    return await adminBadge.isVisible().catch(() => false);
  }

  /**
   * Fill profile settings form
   */
  async fillProfileSettings(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    university?: string;
    graduationYear?: string;
    profileImageUrl?: string;
  }): Promise<void> {
    await this.clickTab('settings');
    
    if (data.firstName) {
      await this.page.fill('input[name="first_name"]', data.firstName);
    }
    if (data.lastName) {
      await this.page.fill('input[name="last_name"]', data.lastName);
    }
    if (data.phone) {
      await this.page.fill('input[name="phone"]', data.phone);
    }
    if (data.university) {
      await this.page.fill('input[name="university"]', data.university);
    }
    if (data.graduationYear) {
      await this.page.fill('input[name="graduation_year"]', data.graduationYear);
    }
    if (data.profileImageUrl) {
      await this.page.fill('input[name="profile_image_url"]', data.profileImageUrl);
    }
  }

  /**
   * Save profile settings
   */
  async saveProfileSettings(): Promise<void> {
    await this.page.click('button:has-text("Save Changes"), button[type="submit"]');
    await this.page.waitForTimeout(1000);
  }
}

