# Testing Documentation - Phase 3

## Testing Philosophy

At Dormdeals, we believe in comprehensive testing that ensures code quality, prevents regressions, and enables confident refactoring. Our testing strategy follows these principles:

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Write Readable Tests**: Tests should serve as documentation for how components work
3. **Maintain High Coverage**: Aim for 80%+ coverage on critical paths
4. **Test User Interactions**: Prioritize testing from the user's perspective
5. **Keep Tests Fast**: Tests should run quickly to enable rapid feedback

## Testing Layers

Our testing strategy includes three layers:

1. **Unit Tests** (Vitest) - Fast, isolated component tests
2. **Integration Tests** (Vitest) - Component interaction tests
3. **End-to-End Tests** (Playwright) - Full user journey tests

---

## Unit & Integration Testing

### How to Run Tests

#### Run all tests
```bash
npm test
```

#### Run tests in watch mode (recommended during development)
```bash
npm run test:watch
```

#### Run tests with UI (interactive test runner)
```bash
npm run test:ui
```

#### Run tests with coverage report
```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage/` directory:
- **HTML Report**: Open `coverage/index.html` in your browser for a detailed interactive report
- **Text Report**: View coverage summary in the terminal
- **JSON Report**: Available at `coverage/coverage-final.json` for CI/CD integration

### How to Write Tests

#### Basic Component Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, userEvent } from '@/test/test-utils';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    render(<YourComponent />);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);
    
    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

### Coverage Requirements

Our coverage thresholds are enforced in `vitest.config.ts`:

- **Branches**: 70% minimum
- **Functions**: 70% minimum
- **Lines**: 80% minimum
- **Statements**: 80% minimum

---

## End-to-End Testing with Playwright

### Overview

End-to-End (E2E) tests verify that the entire application works correctly from a user's perspective. We use Playwright to simulate real user interactions across different browsers and devices.

### Why Playwright?

- **Cross-browser testing**: Chromium, Firefox, WebKit
- **Auto-waiting**: Automatically waits for elements to be ready
- **Powerful debugging**: Screenshots, videos, and traces
- **Fast execution**: Parallel test execution
- **Great developer experience**: Excellent TypeScript support

### Installation

Playwright is already installed as a dev dependency. To install browser binaries:

```bash
npx playwright install
```

Or install specific browsers:

```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

### Running E2E Tests

#### Run all E2E tests
```bash
npm run test:e2e
```

#### Run E2E tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```

#### Run E2E tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

#### Debug E2E tests
```bash
npm run test:e2e:debug
```

#### View test report
```bash
npm run test:e2e:report
```

### E2E Test Structure

Our E2E tests are organized in `tests/e2e/`:

```
tests/e2e/
├── fixtures/          # Test data and fixtures
│   └── test-data.ts
├── helpers/           # Reusable helper functions
│   └── auth-helper.ts
├── pages/             # Page Object Models
│   ├── home.page.ts
│   └── feature.page.ts
└── specs/             # Test specifications
    └── example.spec.ts
```

### Page Object Model Pattern

The Page Object Model (POM) pattern encapsulates page-specific logic and selectors, making tests more maintainable and readable.

#### Example Page Object

```typescript
// tests/e2e/pages/home.page.ts
import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly navigation: Locator;
  readonly searchBar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigation = page.locator('nav');
    this.searchBar = page.locator('input[type="search"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async search(query: string) {
    await this.searchBar.fill(query);
    await this.page.keyboard.press('Enter');
  }
}
```

#### Using Page Objects in Tests

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';

test('should search for products', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.search('laptop');
  
  await expect(page).toHaveURL(/\/search/);
});
```

### Writing E2E Tests

#### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test('should load homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/DormDeals/);
  await expect(page.locator('nav')).toBeVisible();
});
```

#### Test with Multiple Assertions

```typescript
test('should complete user registration', async ({ page }) => {
  await page.goto('/register');
  
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.fill('input[name="confirmPassword"]', 'Password123!');
  
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator('text=Welcome')).toBeVisible();
});
```

#### Using Test Helpers

```typescript
import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';

test('should login successfully', async ({ page }) => {
  const authHelper = new AuthHelper(page);
  await authHelper.login('test@example.com', 'password123');
  
  await expect(page).toHaveURL(/\/dashboard/);
});
```

#### Testing Responsive Design

```typescript
test('should work on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  
  // Mobile-specific assertions
  const mobileMenu = page.locator('[data-testid="mobile-menu"]');
  await expect(mobileMenu).toBeVisible();
});
```

### Test Fixtures

Test fixtures provide reusable test data:

```typescript
// tests/e2e/fixtures/test-data.ts
export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'TestPassword123!',
  },
};
```

### Best Practices for E2E Tests

1. **Use Page Object Model**: Encapsulate page logic in page objects
2. **Use Data Attributes**: Prefer `data-testid` over CSS classes for selectors
3. **Wait Explicitly**: Use `waitFor` when needed, but leverage Playwright's auto-waiting
4. **Keep Tests Independent**: Each test should be able to run in isolation
5. **Use Helpers**: Create reusable helper functions for common operations
6. **Test Critical Paths**: Focus on user journeys that matter most
7. **Avoid Hard Waits**: Use `waitFor` instead of `setTimeout`

### Debugging E2E Tests

#### Using Debug Mode

```bash
npm run test:e2e:debug
```

This opens Playwright Inspector where you can:
- Step through tests
- Inspect elements
- View console logs
- See network requests

#### Using Screenshots and Videos

Screenshots are automatically taken on failure. Videos are recorded on retry.

View them in:
- `test-results/` directory

#### Using Traces

Traces are recorded on first retry. View them with:

```bash
npx playwright show-trace trace.zip
```

#### Console Logging

```typescript
test('debug example', async ({ page }) => {
  await page.goto('/');
  
  // Log page title
  console.log(await page.title());
  
  // Log element text
  const heading = page.locator('h1');
  console.log(await heading.textContent());
});
```

### Configuration

E2E tests are configured in `playwright.config.ts`:

- **Base URL**: `http://localhost:3000`
- **Test Directory**: `tests/e2e/specs/`
- **Timeout**: 30 seconds per test
- **Retries**: 2 on CI, 0 locally
- **Browsers**: Chromium, Firefox, WebKit
- **Viewports**: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)

### Running Tests Against Different Browsers

```bash
# Run only in Chromium
npx playwright test --project=chromium

# Run only in Firefox
npx playwright test --project=firefox

# Run only in WebKit
npx playwright test --project=webkit
```

### Running Tests on Specific Viewports

```bash
# Run only desktop tests
npx playwright test --project=Desktop

# Run only mobile tests
npx playwright test --project="Mobile Chrome"
```

### CI/CD Integration

For CI/CD, ensure browsers are installed:

```yaml
# GitHub Actions example
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
```

### Common Patterns

#### Waiting for Navigation

```typescript
await page.click('a[href="/dashboard"]');
await page.waitForURL(/\/dashboard/);
```

#### Filling Forms

```typescript
await page.fill('input[name="email"]', 'test@example.com');
await page.fill('input[name="password"]', 'password123');
await page.click('button[type="submit"]');
```

#### Handling Dialogs

```typescript
page.on('dialog', dialog => dialog.accept());
await page.click('button:has-text("Delete")');
```

#### Intercepting API Calls

```typescript
await page.route('**/api/users', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ id: 1, name: 'Test User' }),
  });
});
```

### Troubleshooting

#### Tests are flaky
- Check for proper waits
- Ensure elements are stable before interacting
- Use `waitForLoadState` when needed

#### Tests are slow
- Run tests in parallel (already configured)
- Use `test.describe.parallel()` for parallel test suites
- Consider reducing timeout if appropriate

#### Selectors not found
- Use Playwright's codegen to generate selectors: `npx playwright codegen`
- Prefer `data-testid` attributes
- Use Playwright Inspector to debug

---

## Testing Best Practices

### 1. Test Organization

- Place test files next to the components they test: `Component.test.tsx`
- Or in a `__tests__` directory: `__tests__/Component.test.tsx`
- Use descriptive test names that explain what is being tested

### 2. Test Structure (AAA Pattern)

```typescript
it('should do something specific', () => {
  // Arrange: Set up test data and conditions
  const props = { name: 'Test' };
  
  // Act: Execute the code being tested
  render(<Component {...props} />);
  
  // Assert: Verify the expected outcome
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### 3. Query Priority

Use queries in this order of preference:

1. **getByRole** - Most accessible, matches how users interact
2. **getByLabelText** - For form inputs
3. **getByPlaceholderText** - When no label exists
4. **getByText** - For text content
5. **getByTestId** - Last resort, avoid if possible

### 4. Avoid Testing Implementation Details

```typescript
// ❌ Bad: Testing implementation
expect(component.state.isOpen).toBe(true);

// ✅ Good: Testing behavior
expect(screen.getByText('Modal Content')).toBeInTheDocument();
```

### 5. Use Custom Render for Providers

Always use the custom `render` from `test-utils` to ensure components have access to all providers:

```typescript
// ✅ Good
import { render } from '@/test/test-utils';
render(<YourComponent />);

// ❌ Bad
import { render } from '@testing-library/react';
render(<YourComponent />); // Missing Router, Auth, etc.
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## Questions?

If you have questions about testing, reach out to the Tech Lead or check the team's testing guidelines in the project wiki.

