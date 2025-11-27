import { test, expect } from '@playwright/test';
import { MainFeaturePage } from '../pages/main-feature.page';
import { ResultsPage } from '../pages/results.page';
import { CreateListingPage } from '../pages/create-listing.page';
import { CheckoutPage } from '../pages/checkout.page';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { testFormData } from '../fixtures/test-data';

test.describe('Form Validation - Search Form', () => {
  test.beforeEach(async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);
    await mainFeaturePage.goto();
  });

  test('shows errors for invalid price range (max < min)', async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);

    // Fill form with invalid price range
    await mainFeaturePage.fillSearchForm({
      minPrice: '1000',
      maxPrice: '500', // Less than minPrice
    });

    await mainFeaturePage.submitSearch();

    // Verify error message appears
    await expect(page.getByText(/maximum.*greater.*minimum|price.*range/i)).toBeVisible();
  });

  test('shows error for non-numeric price values', async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);

    // Fill form with invalid price
    await mainFeaturePage.fillSearchForm({
      minPrice: 'abc',
      maxPrice: 'xyz',
    });

    await mainFeaturePage.submitSearch();

    // Verify error message appears
    await expect(page.getByText(/valid.*number|numeric/i)).toBeVisible();
  });

  test('allows empty form submission (shows all results)', async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);
    const resultsPage = new ResultsPage(page);

    // Submit empty form
    await mainFeaturePage.submitSearch();

    // Should navigate to results with all items
    await page.waitForURL(/\/results/, { timeout: 10000 });
    await resultsPage.expectResultsVisible();
  });

  test('validates search query minimum length', async ({ page }) => {
    const mainFeaturePage = new MainFeaturePage(page);

    // Fill form with query that's too short
    await mainFeaturePage.fillSearchForm({
      query: 'a', // Less than 2 characters
    });

    await mainFeaturePage.submitSearch();

    // Verify error message appears
    await expect(page.getByText(/at least.*2.*characters|minimum.*length/i)).toBeVisible();
  });
});

test.describe('Form Validation - Create Listing Form', () => {
  test.beforeEach(async ({ page }) => {
    const createListingPage = new CreateListingPage(page);
    await createListingPage.goto();
  });

  test('shows errors for empty required fields', async ({ page }) => {
    const createListingPage = new CreateListingPage(page);

    // Submit empty form
    await createListingPage.submitForm();

    // Verify form errors are visible
    await createListingPage.expectFormErrorsVisible();

    // Verify specific error messages
    const errors = await createListingPage.getFormErrors();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => /title.*required|required.*field/i.test(e))).toBeTruthy();
  });

  test('shows error for invalid price (non-numeric or zero)', async ({ page }) => {
    const createListingPage = new CreateListingPage(page);

    // Fill form with invalid price
    await createListingPage.fillForm({
      title: 'Test Item',
      description: 'Test description',
      price: 'abc',
      category: 'Electronics',
      condition: 'Good',
      location: 'Lafayette, LA',
    });

    await createListingPage.submitForm();

    // Verify error message
    await createListingPage.expectFormErrorsVisible();
    const errors = await createListingPage.getFormErrors();
    expect(errors.some(e => /price.*valid|price.*greater.*0/i.test(e))).toBeTruthy();
  });

  test('shows error for missing category', async ({ page }) => {
    const createListingPage = new CreateListingPage(page);

    // Fill form without category
    await createListingPage.fillForm({
      title: 'Test Item',
      description: 'Test description',
      price: '100',
      category: '', // Empty category
      condition: 'Good',
      location: 'Lafayette, LA',
    });

    await createListingPage.submitForm();

    // Verify error message
    await createListingPage.expectFormErrorsVisible();
    const errors = await createListingPage.getFormErrors();
    expect(errors.some(e => /category.*required/i.test(e))).toBeTruthy();
  });

  test('shows error for missing images', async ({ page }) => {
    const createListingPage = new CreateListingPage(page);

    // Fill form without images
    await createListingPage.fillForm(testFormData.createListing.validInput);
    // Don't upload images

    await createListingPage.submitForm();

    // Verify error message
    await createListingPage.expectFormErrorsVisible();
    const errors = await createListingPage.getFormErrors();
    expect(errors.some(e => /image|photo.*required/i.test(e))).toBeTruthy();
  });

  test('enables submit button only when form is valid', async ({ page }) => {
    const createListingPage = new CreateListingPage(page);

    // Initially submit button should be enabled (or disabled based on your implementation)
    const submitButton = createListingPage.submitButton;
    await expect(submitButton).toBeVisible();

    // Fill form with valid data
    await createListingPage.fillForm(testFormData.createListing.validInput);

    // Submit button should be enabled
    await expect(submitButton).toBeEnabled();
  });
});

test.describe('Form Validation - Checkout Form', () => {
  test.beforeEach(async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();
  });

  test('shows errors for empty required fields', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Submit empty form
    await checkoutPage.submitCheckout();

    // Verify form errors are visible
    await checkoutPage.expectFormErrorsVisible();
  });

  test('shows error for invalid email format', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Fill form with invalid email
    await checkoutPage.fillShippingInfo({
      fullName: 'John Doe',
      email: 'invalid-email',
      address: '123 Main St',
      city: 'Lafayette',
      state: 'LA',
      zipCode: '70503',
    });

    await checkoutPage.submitCheckout();

    // Verify error message
    await checkoutPage.expectFormErrorsVisible();
  });

  test('shows error for invalid card number (wrong length)', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Fill form with invalid card number
    await checkoutPage.fillCheckoutForm({
      ...testFormData.checkout.validInput,
      cardNumber: '1234', // Too short
    });

    await checkoutPage.submitCheckout();

    // Verify error message
    await checkoutPage.expectFormErrorsVisible();
  });

  test('shows error for invalid expiry date format', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Fill form with invalid expiry date
    await checkoutPage.fillCheckoutForm({
      ...testFormData.checkout.validInput,
      expiryDate: '13/20', // Invalid month
    });

    await checkoutPage.submitCheckout();

    // Verify error message
    await checkoutPage.expectFormErrorsVisible();
  });

  test('shows error for expired card', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Fill form with expired card
    await checkoutPage.fillCheckoutForm({
      ...testFormData.checkout.validInput,
      expiryDate: '01/20', // Expired date
    });

    await checkoutPage.submitCheckout();

    // Verify error message
    await checkoutPage.expectFormErrorsVisible();
  });
});

test.describe('Form Validation - Login Form', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('shows error for empty email', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Submit with empty email
    await loginPage.fillLoginForm('', 'password123');
    await loginPage.submitLogin();

    // Verify error message
    await loginPage.expectErrorVisible();
  });

  test('shows error for invalid email format', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Submit with invalid email
    await loginPage.fillLoginForm('invalid-email', 'password123');
    await loginPage.submitLogin();

    // Verify error message
    await loginPage.expectErrorVisible();
  });

  test('shows error for empty password', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Submit with empty password
    await loginPage.fillLoginForm('test@example.com', '');
    await loginPage.submitLogin();

    // Verify error message
    await loginPage.expectErrorVisible();
  });
});

test.describe('Form Validation - Register Form', () => {
  test.beforeEach(async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('shows error when passwords do not match', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    // Fill form with mismatched passwords
    await registerPage.fillRegisterForm({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!',
    });

    await registerPage.submitRegister();

    // Verify error message
    await registerPage.expectErrorVisible();
    const errorMessage = await registerPage.getErrorMessage();
    expect(errorMessage).toMatch(/password.*match|do not match/i);
  });

  test('shows error for weak password (too short)', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    // Fill form with weak password
    await registerPage.fillRegisterForm({
      displayName: 'Test User',
      email: 'test@example.com',
      password: '12345', // Too short
      confirmPassword: '12345',
    });

    await registerPage.submitRegister();

    // Verify error message
    await registerPage.expectErrorVisible();
    const errorMessage = await registerPage.getErrorMessage();
    expect(errorMessage).toMatch(/password.*at least.*6|password.*too short/i);
  });

  test('shows error for empty required fields', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    // Submit empty form
    await registerPage.submitRegister();

    // Verify error message
    await registerPage.expectErrorVisible();
  });
});

