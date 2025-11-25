import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Create Listing Page
 */
export class CreateListingPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly priceInput: Locator;
  readonly categorySelect: Locator;
  readonly conditionSelect: Locator;
  readonly locationInput: Locator;
  readonly pickupAvailableCheckbox: Locator;
  readonly deliveryAvailableCheckbox: Locator;
  readonly deliveryFeeInput: Locator;
  readonly imageUploadInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly formErrors: Locator;
  readonly successMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.locator('input[name="title"], input[placeholder*="title" i], [data-testid="title-input"]');
    this.descriptionTextarea = page.locator('textarea[name="description"], textarea[placeholder*="description" i], [data-testid="description-textarea"]');
    this.priceInput = page.locator('input[name="price"], input[type="number"][name*="price"], [data-testid="price-input"]');
    this.categorySelect = page.locator('select[name="category"], [data-testid="category-select"]');
    this.conditionSelect = page.locator('select[name="condition"], [data-testid="condition-select"]');
    this.locationInput = page.locator('input[name="location"], input[placeholder*="location" i], [data-testid="location-input"]');
    this.pickupAvailableCheckbox = page.locator('input[type="checkbox"][name*="pickup"], [data-testid="pickup-checkbox"]');
    this.deliveryAvailableCheckbox = page.locator('input[type="checkbox"][name*="delivery"], [data-testid="delivery-checkbox"]');
    this.deliveryFeeInput = page.locator('input[name="deliveryFee"], input[name*="delivery"], [data-testid="delivery-fee-input"]');
    this.imageUploadInput = page.locator('input[type="file"], [data-testid="image-upload"]');
    this.submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Submit"), button:has-text("Post"), [data-testid="submit-button"]');
    this.cancelButton = page.locator('button:has-text("Cancel"), a:has-text("Cancel"), [data-testid="cancel-button"]');
    this.formErrors = page.locator('.error, .form-error, [data-testid="form-error"]');
    this.successMessage = page.locator('.success, .toast-success, [data-testid="success-message"]');
    this.loadingSpinner = page.locator('.loading, .spinner, [data-testid="loading"]');
  }

  /**
   * Navigate to create listing page
   */
  async goto(): Promise<void> {
    await this.page.goto('/create-listing');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill the create listing form
   */
  async fillForm(data: {
    title: string;
    description: string;
    price: string;
    category: string;
    condition: string;
    location: string;
    pickupAvailable?: boolean;
    deliveryAvailable?: boolean;
    deliveryFee?: string;
  }): Promise<void> {
    await this.titleInput.fill(data.title);
    await this.descriptionTextarea.fill(data.description);
    await this.priceInput.fill(data.price);
    await this.categorySelect.selectOption(data.category);
    await this.conditionSelect.selectOption(data.condition);
    await this.locationInput.fill(data.location);

    if (data.pickupAvailable !== undefined) {
      const isChecked = await this.pickupAvailableCheckbox.isChecked();
      if (data.pickupAvailable !== isChecked) {
        await this.pickupAvailableCheckbox.click();
      }
    }

    if (data.deliveryAvailable !== undefined) {
      const isChecked = await this.deliveryAvailableCheckbox.isChecked();
      if (data.deliveryAvailable !== isChecked) {
        await this.deliveryAvailableCheckbox.click();
      }
    }

    if (data.deliveryFee) {
      await this.deliveryFeeInput.fill(data.deliveryFee);
    }
  }

  /**
   * Upload image(s)
   */
  async uploadImage(filePath: string | string[]): Promise<void> {
    const files = Array.isArray(filePath) ? filePath : [filePath];
    await this.imageUploadInput.setInputFiles(files);
  }

  /**
   * Submit the form
   */
  async submitForm(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Cancel form submission
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if form errors are visible
   */
  async expectFormErrorsVisible(): Promise<void> {
    await expect(this.formErrors.first()).toBeVisible();
  }

  /**
   * Get form error messages
   */
  async getFormErrors(): Promise<string[]> {
    const errors: string[] = [];
    const count = await this.formErrors.count();
    for (let i = 0; i < count; i++) {
      const errorText = await this.formErrors.nth(i).textContent();
      if (errorText) errors.push(errorText);
    }
    return errors;
  }

  /**
   * Check if success message is visible
   */
  async expectSuccessMessageVisible(): Promise<void> {
    await expect(this.successMessage).toBeVisible();
  }

  /**
   * Check if loading spinner is visible
   */
  async expectLoadingVisible(): Promise<void> {
    await expect(this.loadingSpinner).toBeVisible();
  }

  /**
   * Check if loading spinner is hidden
   */
  async expectLoadingHidden(): Promise<void> {
    await expect(this.loadingSpinner).toBeHidden();
  }

  /**
   * Clear form
   */
  async clearForm(): Promise<void> {
    await this.titleInput.clear();
    await this.descriptionTextarea.clear();
    await this.priceInput.clear();
    await this.locationInput.clear();
  }
}

