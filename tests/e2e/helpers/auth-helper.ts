import { Page, expect } from '@playwright/test';
import { testUsers } from '../fixtures/test-data';

/**
 * Authentication helper functions for E2E tests
 * Provides reusable authentication methods
 */

export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Login with valid credentials
   */
  async login(email: string = testUsers.validUser.email, password: string = testUsers.validUser.password): Promise<void> {
    // Navigate to login page (adjust selector based on your app)
    await this.page.goto('/login');
    
    // Fill in login form (adjust selectors based on your app)
    await this.page.fill('input[type="email"], input[name="email"]', email);
    await this.page.fill('input[type="password"], input[name="password"]', password);
    
    // Submit form
    await this.page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    
    // Wait for navigation or success indicator
    await this.page.waitForURL(/\/(dashboard|home|profile)/, { timeout: 10000 });
  }

  /**
   * Logout from the application
   */
  async logout(): Promise<void> {
    // Click logout button (adjust selector based on your app)
    await this.page.click('button:has-text("Logout"), button:has-text("Sign Out"), [data-testid="logout"]');
    
    // Wait for navigation to login/home page
    await this.page.waitForURL(/\/(login|home|$)/, { timeout: 5000 });
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    // Check for logged-in indicators (adjust selectors based on your app)
    const userMenu = await this.page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Profile")').first();
    return await userMenu.isVisible().catch(() => false);
  }

  /**
   * Register a new user
   */
  async register(name: string, email: string, password: string): Promise<void> {
    // Navigate to registration page
    await this.page.goto('/register');
    
    // Fill in registration form (adjust selectors based on your app)
    await this.page.fill('input[name="name"], input[placeholder*="name" i]', name);
    await this.page.fill('input[type="email"], input[name="email"]', email);
    await this.page.fill('input[type="password"]:nth-of-type(1)', password);
    await this.page.fill('input[type="password"]:nth-of-type(2), input[name="confirmPassword"]', password);
    
    // Submit form
    await this.page.click('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")');
    
    // Wait for success or navigation
    await this.page.waitForTimeout(2000);
  }

  /**
   * Wait for authentication to complete
   */
  async waitForAuth(): Promise<void> {
    // Wait for auth state to be ready (adjust based on your app)
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get current user info from the page
   */
  async getCurrentUser(): Promise<{ name: string; email: string } | null> {
    try {
      // Try to extract user info from the page (adjust selectors)
      const name = await this.page.locator('[data-testid="user-name"], .user-name').textContent();
      const email = await this.page.locator('[data-testid="user-email"], .user-email').textContent();
      
      if (name && email) {
        return { name: name.trim(), email: email.trim() };
      }
    } catch {
      // User info not found
    }
    return null;
  }
}

