import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Item Detail Page
 */
export class ItemDetailPage {
  readonly page: Page;
  readonly itemTitle: Locator;
  readonly itemPrice: Locator;
  readonly itemDescription: Locator;
  readonly itemImages: Locator;
  readonly sellerInfo: Locator;
  readonly addToCartButton: Locator;
  readonly addToWishlistButton: Locator;
  readonly removeFromCartButton: Locator;
  readonly removeFromWishlistButton: Locator;
  readonly contactSellerButton: Locator;
  readonly buyNowButton: Locator;
  readonly backButton: Locator;
  readonly conditionBadge: Locator;
  readonly categoryBadge: Locator;
  readonly locationInfo: Locator;
  readonly specifications: Locator;

  constructor(page: Page) {
    this.page = page;
    this.itemTitle = page.locator('h1, .item-title, [data-testid="item-title"]');
    this.itemPrice = page.locator('.price, .item-price, [data-testid="item-price"]');
    this.itemDescription = page.locator('.description, .item-description, [data-testid="item-description"]');
    this.itemImages = page.locator('.item-image, img[alt*="item"], [data-testid="item-image"]');
    this.sellerInfo = page.locator('.seller-info, [data-testid="seller-info"]');
    this.addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Cart"), [data-testid="add-to-cart"]');
    this.addToWishlistButton = page.locator('button:has-text("Wishlist"), button:has-text("Favorite"), [data-testid="add-to-wishlist"]');
    this.removeFromCartButton = page.locator('button:has-text("Remove from Cart"), [data-testid="remove-from-cart"]');
    this.removeFromWishlistButton = page.locator('button:has-text("Remove from Wishlist"), [data-testid="remove-from-wishlist"]');
    this.contactSellerButton = page.locator('button:has-text("Contact Seller"), button:has-text("Message"), [data-testid="contact-seller"]');
    this.buyNowButton = page.locator('button:has-text("Buy Now"), button:has-text("Purchase"), [data-testid="buy-now"]');
    this.backButton = page.locator('button:has-text("Back"), a:has-text("Back"), [data-testid="back-button"]');
    this.conditionBadge = page.locator('.condition, .condition-badge, [data-testid="condition"]');
    this.categoryBadge = page.locator('.category, .category-badge, [data-testid="category"]');
    this.locationInfo = page.locator('.location, [data-testid="location"]');
    this.specifications = page.locator('.specifications, [data-testid="specifications"]');
  }

  /**
   * Navigate to item detail page by ID
   */
  async goto(itemId: string): Promise<void> {
    await this.page.goto(`/item/${itemId}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to listing detail page by ID
   */
  async gotoListing(listingId: string): Promise<void> {
    await this.page.goto(`/listing/${listingId}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for item details to load
   */
  async waitForLoad(): Promise<void> {
    await expect(this.itemTitle).toBeVisible();
    await expect(this.itemPrice).toBeVisible();
  }

  /**
   * Get item title
   */
  async getItemTitle(): Promise<string> {
    return await this.itemTitle.textContent() || '';
  }

  /**
   * Get item price
   */
  async getItemPrice(): Promise<string> {
    return await this.itemPrice.textContent() || '';
  }

  /**
   * Get item description
   */
  async getItemDescription(): Promise<string> {
    return await this.itemDescription.textContent() || '';
  }

  /**
   * Add item to cart
   */
  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
    await this.page.waitForTimeout(500); // Wait for state update
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(): Promise<void> {
    await this.removeFromCartButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Add item to wishlist
   */
  async addToWishlist(): Promise<void> {
    await this.addToWishlistButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(): Promise<void> {
    await this.removeFromWishlistButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Contact seller
   */
  async contactSeller(): Promise<void> {
    await this.contactSellerButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Buy now
   */
  async buyNow(): Promise<void> {
    await this.buyNowButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if item is in cart
   */
  async isInCart(): Promise<boolean> {
    return await this.removeFromCartButton.isVisible().catch(() => false);
  }

  /**
   * Check if item is in wishlist
   */
  async isInWishlist(): Promise<boolean> {
    return await this.removeFromWishlistButton.isVisible().catch(() => false);
  }

  /**
   * Go back
   */
  async goBack(): Promise<void> {
    await this.backButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get seller name
   */
  async getSellerName(): Promise<string> {
    const sellerName = this.sellerInfo.locator('.seller-name, .name, h3, h4');
    return await sellerName.textContent() || '';
  }

  /**
   * Get condition
   */
  async getCondition(): Promise<string> {
    return await this.conditionBadge.textContent() || '';
  }

  /**
   * Get category
   */
  async getCategory(): Promise<string> {
    return await this.categoryBadge.textContent() || '';
  }

  /**
   * Get location
   */
  async getLocation(): Promise<string> {
    return await this.locationInfo.textContent() || '';
  }
}

