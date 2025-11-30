# E2E Test Suite Documentation

## Overview

This directory contains comprehensive End-to-End (E2E) tests for the DormDeals application using Playwright. All tests follow the **Page Object Model (POM)** pattern for maintainability and reliability.

## Test Structure

### Page Object Models (`pages/`)

All page objects are located in `tests/e2e/pages/` and follow a consistent pattern:

- **`home.page.ts`** - Homepage page object
- **`marketplace.page.ts`** - Marketplace page object
- **`about.page.ts`** - About page object
- **`profile.page.ts`** - Profile page object
- **`premium.page.ts`** - Premium page object
- **`pricing.page.ts`** - Pricing page object
- **`login.page.ts`** - Login page object
- **`register.page.ts`** - Register page object
- **`not-found.page.ts`** - 404 page object
- **`navbar.component.ts`** - Navbar component (used across all pages)
- And more...

All page objects are exported from `pages/index.ts` for easy importing.

### Test Specs (`specs/`)

#### Core Test Suites

1. **`all-pages.spec.ts`**
   - Tests all pages load correctly
   - Verifies navbar on all pages
   - Tests mobile menu on all pages
   - Responsive design across all pages
   - Accessibility checks for all pages

2. **`navigation.spec.ts`**
   - Main navigation flows
   - Authentication navigation
   - User profile navigation
   - Marketplace navigation
   - About page navigation
   - Premium page navigation
   - 404 error page navigation
   - Mobile navigation
   - Breadcrumb and back navigation
   - Deep linking

3. **`homepage.spec.ts`**
   - Page loading and structure
   - Hero section
   - Features section
   - How It Works section
   - Featured items section
   - Stats section
   - CTA buttons and navigation
   - Search functionality
   - Smooth scrolling
   - Interactive elements
   - Responsive design
   - Performance and accessibility
   - Content verification

4. **`about-page.spec.ts`**
   - Page loading and structure
   - Hero section
   - Mission section
   - Stats section
   - Values section
   - Team section
   - CTA section
   - Interactive elements
   - Content verification
   - Visual elements
   - Responsive design
   - Accessibility
   - Page navigation

5. **`404-page.spec.ts`**
   - 404 page display
   - Navigation elements
   - Multiple invalid routes
   - Navigation from 404 page
   - 404 page content
   - Error handling
   - Accessibility
   - Responsive design
   - User experience

6. **`responsive.spec.ts`**
   - Mobile viewport (375x667)
   - Tablet viewport (768x1024)
   - Desktop viewport (1920x1080)
   - Viewport transitions
   - Cross-page responsive testing
   - Touch target sizes
   - Content overflow
   - Specific breakpoint testing

7. **`accessibility.spec.ts`**
   - Keyboard navigation (Tab, Shift+Tab, Enter, Space, Arrow keys, Escape)
   - Focus management
   - Skip links
   - Modal focus trap
   - Mobile menu keyboard navigation
   - Form keyboard navigation
   - Dropdown menu keyboard navigation
   - ARIA attributes
   - Page-specific keyboard navigation

8. **`pages.spec.ts`**
   - Individual page functionality tests
   - Page-specific features
   - UI element verification

## Test Requirements Coverage

✅ **Page Object Model Pattern** - All tests use POM
✅ **All Pages Tested** - Comprehensive coverage via `all-pages.spec.ts`
✅ **Navigation Flows** - Covered in `navigation.spec.ts`
✅ **Responsive Design** - Covered in `responsive.spec.ts` and per-page specs
✅ **Mobile Menu Interactions** - Covered in responsive and navigation specs
✅ **Accessibility (Keyboard Navigation)** - Covered in `accessibility.spec.ts`
✅ **Clear Test Descriptions** - All tests have descriptive names and organized in `test.describe` blocks
✅ **UI and Navigation Focus** - All tests focus on UI elements and navigation
✅ **Maintainable and Reliable** - Uses POM, clear structure, and conditional checks

## Running Tests

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test File
```bash
npx playwright test tests/e2e/specs/homepage.spec.ts
```

### Run Tests in UI Mode
```bash
npx playwright test --ui
```

### Run Tests in Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Tests on Mobile Viewport
```bash
npx playwright test --project="Mobile Chrome"
```

### Run Tests with Debug
```bash
npx playwright test --debug
```

## Viewport Sizes Tested

- **Mobile**: 375x667 (iPhone SE)
- **Mobile Large**: 414x896 (iPhone 12 Pro)
- **Tablet**: 768x1024 (iPad)
- **Tablet Landscape**: 1024x768
- **Desktop Small**: 1366x768
- **Desktop**: 1920x1080

## Accessibility Testing

All tests include accessibility checks:
- Keyboard navigation (Tab, Enter, Space, Arrow keys, Escape)
- Focus visibility
- ARIA attributes
- Image alt text
- Form labels
- Heading hierarchy
- Link accessibility

## Best Practices

1. **Page Object Model**: All page interactions go through page objects
2. **Clear Test Names**: Descriptive test names explain what is being tested
3. **Organized Structure**: Tests organized in `test.describe` blocks by feature/functionality
4. **Conditional Checks**: Tests check for element existence before assertions
5. **Wait Strategies**: Proper use of `waitForLoadState` and `waitForTimeout`
6. **Error Handling**: Tests gracefully handle optional elements and authentication requirements
7. **Maintainability**: Changes to UI only require updates to page objects, not test specs

## Test Maintenance

When adding new pages or features:

1. Create a page object in `tests/e2e/pages/`
2. Export it from `pages/index.ts`
3. Add tests to relevant spec files or create new ones
4. Ensure tests follow the established patterns
5. Add accessibility and responsive tests
6. Update this README if needed

## CI/CD Integration

Tests are configured to:
- Run in parallel on CI
- Retry failed tests (2 retries on CI)
- Generate HTML reports
- Take screenshots on failure
- Record video on failure
- Collect traces on retry

## Reporting

Test reports are generated in `playwright-report/` directory:
```bash
npx playwright show-report
```
