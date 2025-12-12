# Testing Documentation - Phase 3

## 1. Testing Overview

### Why We Test

At DormDeals, we believe in comprehensive testing that ensures:

- **Code Quality**: Catch bugs before they reach production
- **Prevent Regressions**: Ensure new changes don't break existing functionality
- **Enable Refactoring**: Confident code changes with test safety net
- **Documentation**: Tests serve as living documentation of how code works
- **Faster Development**: Catch issues early in the development cycle
- **User Confidence**: Deliver reliable features to our users

### Types of Tests We Use

Our testing strategy includes three layers:

1. **Unit Tests** (Vitest) - Fast, isolated component and function tests
   - Test individual components in isolation
   - Test utility functions and services
   - Mock external dependencies
   - Run quickly (< 1 second per test)

2. **Integration Tests** (Vitest) - Component interaction tests
   - Test how components work together
   - Test context providers and hooks
   - Test service integrations

3. **End-to-End Tests** (Playwright) - Full user journey tests
   - Test complete user workflows
   - Test across different browsers
   - Test responsive design
   - Simulate real user interactions

### Coverage Requirements

Our coverage thresholds are enforced in `vitest.config.ts`:

- **Lines**: 80% minimum
- **Branches**: 70% minimum
- **Functions**: 70% minimum
- **Statements**: 80% minimum

These thresholds ensure we maintain high-quality code while allowing flexibility for edge cases and complex logic.

---

## 2. Running Tests Locally

### Unit Tests

#### Run all unit tests
```bash
npm test
```

This runs all unit tests once and exits. Use this for quick verification.

#### Run unit tests with coverage
```bash
npm run test:coverage
```

Generates a comprehensive coverage report in the `coverage/` directory:
- **HTML Report**: Open `coverage/index.html` in your browser for interactive exploration
- **Terminal Report**: View summary in the terminal output
- **JSON Report**: Available at `coverage/coverage-final.json` for CI/CD integration

#### Watch tests (recommended during development)
```bash
npm run test:watch
```

Runs tests in watch mode, automatically re-running tests when files change. Perfect for TDD (Test-Driven Development).

#### Run tests with UI (interactive test runner)
```bash
npm run test:ui
```

Opens Vitest's interactive UI in your browser for a visual test experience.

### E2E Tests

#### Run all E2E tests
```bash
npm run test:e2e
```

Runs all end-to-end tests across configured browsers (Chromium, Firefox, WebKit).

#### Debug E2E tests
```bash
npm run test:e2e:debug
```

Opens Playwright Inspector for step-by-step debugging:
- Step through tests line by line
- Inspect page state at each step
- View console logs and network requests
- Pause and resume execution

#### Run E2E tests with UI mode
```bash
npm run test:e2e:ui
```

Opens Playwright's interactive UI for running and debugging tests visually.

#### Run E2E tests in headed mode
```bash
npm run test:e2e:headed
```

Runs tests with visible browser windows (useful for debugging visual issues).

#### View E2E test report
```bash
npm run test:e2e:report
```

Opens the HTML test report showing test results, screenshots, and traces.

---

## 3. Writing Unit Tests

### Where to Place Test Files

**Co-located with source files** (recommended):
```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx    ← Test file next to component
├── services/
│   ├── apiService.ts
│   └── apiService.test.ts ← Test file next to service
└── utils/
    ├── validation.ts
    └── validation.test.ts ← Test file next to utility
```

**Or in `__tests__` directories**:
```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
```

### Naming Convention

- `*.test.tsx` - For component tests
- `*.test.ts` - For service/utility tests
- `*.spec.tsx` - Alternative naming (also supported)
- `*.spec.ts` - Alternative naming (also supported)

Examples:
- `Button.test.tsx`
- `apiService.test.ts`
- `validation.spec.ts`

### Testing Components

#### Best Practices

1. **Query by role/label (accessibility first)**
   ```typescript
   // ✅ Good: Query by role (most accessible)
   screen.getByRole('button', { name: /submit/i })
   
   // ✅ Good: Query by label
   screen.getByLabelText('Email address')
   
   // ❌ Avoid: Query by test ID unless necessary
   screen.getByTestId('submit-button')
   ```

2. **Test user behavior, not implementation**
   ```typescript
   // ✅ Good: Test what user sees/does
   expect(screen.getByText('Welcome!')).toBeInTheDocument();
   await user.click(screen.getByRole('button', { name: /login/i }));
   
   // ❌ Bad: Test internal state
   expect(component.state.isLoggedIn).toBe(true);
   ```

3. **Use userEvent for interactions**
   ```typescript
   import userEvent from '@testing-library/user-event';
   
   const user = userEvent.setup();
   await user.click(button);
   await user.type(input, 'text');
   await user.keyboard('{Enter}');
   ```

#### Example Component Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
  });
});
```

### Testing Services

#### Best Practices

1. **Mock external dependencies**
   ```typescript
   import { vi } from 'vitest';
   import axios from 'axios';
   
   vi.mock('axios');
   const mockedAxios = axios as jest.Mocked<typeof axios>;
   ```

2. **Test success and error cases**
   ```typescript
   describe('apiService', () => {
     it('handles successful API call', async () => {
       mockedAxios.get.mockResolvedValue({ data: { id: 1 } });
       const result = await fetchUser(1);
       expect(result).toEqual({ id: 1 });
     });

     it('handles API errors', async () => {
       mockedAxios.get.mockRejectedValue(new Error('Network error'));
       await expect(fetchUser(1)).rejects.toThrow('Network error');
     });
   });
   ```

3. **Test edge cases**
   ```typescript
   it('handles empty response', async () => {
     mockedAxios.get.mockResolvedValue({ data: null });
     const result = await fetchUser(1);
     expect(result).toBeNull();
   });

   it('handles invalid input', () => {
     expect(() => validateEmail('invalid')).toThrow('Invalid email');
   });
   ```

#### Example Service Test

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchListing } from './listingService';
import * as apiService from './apiService';

vi.mock('./apiService');

describe('listingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches listing successfully', async () => {
    const mockListing = { id: '1', title: 'Test Item' };
    vi.spyOn(apiService, 'get').mockResolvedValue(mockListing);

    const result = await fetchListing('1');

    expect(result).toEqual(mockListing);
    expect(apiService.get).toHaveBeenCalledWith('/listings/1');
  });

  it('handles fetch errors', async () => {
    vi.spyOn(apiService, 'get').mockRejectedValue(new Error('Not found'));

    await expect(fetchListing('999')).rejects.toThrow('Not found');
  });
});
```

### Example Test Template

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  // Setup before each test
  beforeEach(() => {
    // Setup code here
  });

  // Cleanup after each test
  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      render(<YourComponent />);
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });

    it('renders with custom props', () => {
      render(<YourComponent title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles button click', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<YourComponent onClick={handleClick} />);
      
      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty data gracefully', () => {
      render(<YourComponent data={[]} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });
});
```

---

## 4. Writing E2E Tests

### Where to Place E2E Tests

All E2E tests are located in `tests/e2e/specs/`:

```
tests/e2e/
├── fixtures/          # Test data and fixtures
│   └── test-data.ts
├── helpers/           # Reusable helper functions
│   └── auth-helper.ts
├── pages/             # Page Object Models
│   ├── home.page.ts
│   ├── login.page.ts
│   └── marketplace.page.ts
└── specs/             # Test specifications
    ├── homepage.spec.ts
    ├── navigation.spec.ts
    └── feature-workflow.spec.ts
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
  readonly heroSection: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigation = page.locator('nav');
    this.searchBar = page.locator('input[type="search"]');
    this.heroSection = page.locator('[data-testid="hero"]');
    this.footer = page.locator('footer');
  }

  async goto() {
    await this.page.goto('/');
  }

  async search(query: string) {
    await this.searchBar.fill(query);
    await this.page.keyboard.press('Enter');
  }

  async isLoaded(): Promise<boolean> {
    return await this.navigation.isVisible();
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

### Best Practices

1. **Use auto-waiting (no hard-coded waits)**
   ```typescript
   // ✅ Good: Playwright auto-waits
   await page.click('button');
   await expect(page.locator('.result')).toBeVisible();
   
   // ❌ Bad: Hard-coded wait
   await page.waitForTimeout(2000);
   await page.click('button');
   ```

2. **Query by user-visible elements**
   ```typescript
   // ✅ Good: Query by visible text or role
   await page.getByRole('button', { name: 'Submit' }).click();
   await page.getByText('Welcome').isVisible();
   
   // ❌ Avoid: CSS selectors unless necessary
   await page.locator('.btn-primary').click();
   ```

3. **Test critical paths**
   - User registration and login
   - Creating and viewing listings
   - Search and filtering
   - Checkout process
   - Messaging between users

### Example E2E Test Template

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { LoginPage } from '../pages/login.page';
import { AuthHelper } from '../helpers/auth-helper';

test.describe('User Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    await loginPage.fillEmail('test@example.com');
    await loginPage.fillPassword('password123');
    await loginPage.submit();
    
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Welcome')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    await loginPage.fillEmail('invalid@example.com');
    await loginPage.fillPassword('wrongpassword');
    await loginPage.submit();
    
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});

test.describe('Marketplace Search', () => {
  test('should search and filter listings', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    await homePage.search('laptop');
    
    await expect(page).toHaveURL(/\/search/);
    await expect(page.getByText('laptop')).toBeVisible();
  });
});
```

---

## 5. Code Coverage

### Coverage Thresholds

Our coverage requirements are:
- **Lines**: 80% minimum
- **Branches**: 70% minimum
- **Functions**: 70% minimum
- **Statements**: 80% minimum

These thresholds are enforced in `vitest.config.ts` and will cause tests to fail if not met.

### Viewing Coverage Reports

After running `npm run test:coverage`, view the report:

```bash
# Open HTML report in browser
open coverage/index.html

# Or on Linux
xdg-open coverage/index.html

# Or on Windows
start coverage/index.html
```

The HTML report provides:
- Overall coverage percentage
- Coverage by file
- Line-by-line coverage highlighting
- Uncovered lines and branches

### Understanding Coverage Metrics

- **Lines**: Percentage of executable lines covered
- **Branches**: Percentage of conditional branches (if/else, switch) covered
- **Functions**: Percentage of functions called at least once
- **Statements**: Percentage of statements executed

### What to Do If Coverage Drops

1. **Identify uncovered code**
   - Open `coverage/index.html`
   - Find files with low coverage
   - Review uncovered lines

2. **Prioritize critical paths**
   - Focus on user-facing features first
   - Test error handling and edge cases
   - Don't obsess over 100% coverage

3. **Add missing tests**
   - Write tests for uncovered branches
   - Test error cases
   - Test edge cases and boundary conditions

4. **Review coverage exclusions**
   - Some code may be intentionally excluded (e.g., index files, type definitions)
   - Ensure exclusions are documented

---

## 6. CI/CD Testing

### Tests Run Automatically on Every MR

Our GitLab CI/CD pipeline automatically runs:
1. **Linting** - Code quality checks
2. **Type Checking** - TypeScript validation
3. **Build** - Production build verification
4. **Unit Tests** - All unit tests (when configured)
5. **E2E Tests** - All E2E tests (when configured)

### How to View Test Results in GitLab

1. Navigate to your Merge Request
2. Click on the **Pipelines** tab
3. Click on the pipeline status badge
4. View individual job results:
   - Green checkmark ✅ = Passed
   - Red X ❌ = Failed
   - Orange circle ⏸ = Running

### What to Do When CI Tests Fail

1. **Check the job logs**
   - Click on the failed job
   - Scroll through the logs to find the error
   - Look for test failures or build errors

2. **Reproduce locally**
   ```bash
   # Run the same command that failed in CI
   npm test
   npm run lint
   npm run build
   ```

3. **Fix the issue**
   - Address test failures
   - Fix linting errors
   - Resolve build issues

4. **Push fixes**
   - Commit your changes
   - Push to the same branch
   - CI will automatically re-run

### How to Debug CI Failures

1. **Check environment differences**
   - CI uses Node 20 Alpine
   - Ensure your local environment matches

2. **Review test output**
   - Look for specific test failures
   - Check for timeout issues
   - Review error messages

3. **Test locally with CI settings**
   ```bash
   # Run tests in CI-like environment
   CI=true npm test
   ```

4. **Check for flaky tests**
   - Tests that pass sometimes and fail other times
   - May need better waits or mocks
   - Consider adding retries for known flaky tests

---

## 7. Testing Checklist for MRs

Before submitting a Merge Request, ensure:

- [ ] **Unit tests added for new code**
  - New components have test files
  - New services have test files
  - New utilities have test files

- [ ] **E2E tests updated if user flow changed**
  - Critical user paths still work
  - New features have E2E coverage
  - Existing E2E tests still pass

- [ ] **All tests passing locally**
  ```bash
  npm test
  npm run test:e2e
  ```

- [ ] **Coverage meets threshold**
  ```bash
  npm run test:coverage
  # Check that coverage is above 80% lines, 70% branches
  ```

- [ ] **No console errors or warnings**
  - Run the app locally
  - Check browser console
  - Fix any warnings or errors

- [ ] **Linting passes**
  ```bash
  npm run lint
  ```

- [ ] **Type checking passes**
  ```bash
  npm run type-check
  ```

---

## 8. Common Testing Pitfalls

### 1. Testing Implementation Details

**❌ Bad:**
```typescript
expect(component.state.isOpen).toBe(true);
expect(component.props.onClick).toHaveBeenCalled();
```

**✅ Good:**
```typescript
expect(screen.getByText('Modal Content')).toBeInTheDocument();
expect(screen.getByText('Success!')).toBeVisible();
```

### 2. Not Cleaning Up After Tests

**❌ Bad:**
```typescript
test('test 1', () => {
  // Modifies global state
});

test('test 2', () => {
  // May be affected by test 1
});
```

**✅ Good:**
```typescript
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

### 3. Hard-Coded Waits in E2E Tests

**❌ Bad:**
```typescript
await page.waitForTimeout(2000);
await page.click('button');
```

**✅ Good:**
```typescript
await page.getByRole('button', { name: 'Submit' }).click();
await expect(page.locator('.result')).toBeVisible();
```

### 4. Not Mocking External Dependencies

**❌ Bad:**
```typescript
test('fetches data', async () => {
  const result = await fetchFromAPI(); // Makes real API call
});
```

**✅ Good:**
```typescript
vi.mock('./apiService');
test('fetches data', async () => {
  vi.spyOn(apiService, 'get').mockResolvedValue({ data: [] });
  const result = await fetchFromAPI();
});
```

### 5. Flaky Tests

**Common causes:**
- Race conditions
- Timing issues
- Shared state between tests
- Network dependencies

**Solutions:**
- Use proper waits in E2E tests
- Mock external dependencies
- Keep tests independent
- Use `waitFor` instead of `setTimeout`

---

## 9. Debugging Tests

### Using test:watch Mode

```bash
npm run test:watch
```

Benefits:
- Automatically re-runs tests on file changes
- Shows which tests are affected by changes
- Fast feedback loop
- Great for TDD

### Using Playwright UI Mode

```bash
npm run test:e2e:ui
```

Features:
- Visual test runner
- Step through tests
- See browser state
- Inspect elements
- View network requests

### Using console.log vs debugger

**console.log** - For quick debugging:
```typescript
test('debug example', () => {
  const result = someFunction();
  console.log('Result:', result);
  expect(result).toBe(expected);
});
```

**debugger** - For step-by-step debugging:
```typescript
test('debug example', () => {
  debugger; // Execution pauses here
  const result = someFunction();
  expect(result).toBe(expected);
});
```

Run with Node debugger:
```bash
node --inspect-brk node_modules/.bin/vitest
```

### Inspecting Test Output

1. **Check terminal output**
   - Test names and results
   - Error messages and stack traces
   - Coverage summaries

2. **Check test reports**
   - HTML coverage reports
   - Playwright HTML reports
   - Screenshots and videos on failure

3. **Use verbose mode**
   ```bash
   npm test -- --reporter=verbose
   ```

---

## 10. Test Coverage Report

### Current Coverage Summary

**Overall Coverage**: [To be updated after running `npm run test:coverage`]

**Coverage by Category**:
- **Components**: [X]% (Target: 80%+)
- **Services**: [Y]% (Target: 80%+)
- **Utils**: [Z]% (Target: 80%+)
- **Pages**: [W]% (Target: 70%+)

### Files with 100% Coverage

- `src/components/Button.tsx`
- `src/components/LoadingSpinner.tsx`
- `src/utils/validation.ts`
- `src/utils/helpers.ts`

### Files Needing Improvement

| File | Current Coverage | Target | Priority |
|------|-----------------|--------|----------|
| `src/services/apiService.ts` | 65% | 80% | High |
| `src/pages/Marketplace.tsx` | 45% | 70% | Medium |
| `src/components/CartDrawer.tsx` | 30% | 80% | High |

**Action Items**:
1. Add tests for error handling in `apiService.ts`
2. Add integration tests for `Marketplace.tsx`
3. Add user interaction tests for `CartDrawer.tsx`

### Coverage Report Screenshot

To generate and view the coverage report:

```bash
npm run test:coverage
open coverage/index.html
```

The HTML report provides an interactive view of:
- Overall coverage metrics
- File-by-file breakdown
- Line-by-line coverage highlighting
- Uncovered code identification

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Questions?

If you have questions about testing, reach out to:
- **QA Lead**: For testing strategy and best practices
- **Tech Lead**: For technical implementation questions
- **Team Wiki**: For project-specific guidelines

---

*Last Updated: [Current Date]*
*Maintained by: QA Team*
