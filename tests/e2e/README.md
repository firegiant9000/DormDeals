# DormDeals E2E Tests

Comprehensive End-to-End tests for DormDeals marketplace using Playwright.

## 📁 Structure

```
tests/e2e/
├── fixtures/          # Test data and mock responses
│   └── test-data.ts
├── helpers/          # Reusable helper functions
│   └── auth-helper.ts
├── pages/            # Page Object Models (POM)
│   ├── main-feature.page.ts
│   ├── results.page.ts
│   ├── create-listing.page.ts
│   ├── item-detail.page.ts
│   ├── marketplace.page.ts
│   ├── message.page.ts
│   ├── checkout.page.ts
│   ├── login.page.ts
│   ├── register.page.ts
│   └── index.ts
└── specs/            # Test specifications
    ├── feature-workflow.spec.ts
    ├── form-validation.spec.ts
    └── error-handling.spec.ts
```

## 🚀 Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run on specific browser
```bash
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

### Run in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

### Run specific test file
```bash
npm run test:e2e -- tests/e2e/specs/feature-workflow.spec.ts
```

### Run specific test
```bash
npm run test:e2e -- -g "user can complete search workflow"
```

## 📝 Test Coverage

### Feature Workflow Tests
- ✅ Search and filter workflows
- ✅ Results page interactions
- ✅ Item detail navigation
- ✅ Cart and wishlist operations
- ✅ Combined filter scenarios

### Form Validation Tests
- ✅ Search form validation
- ✅ Create listing form validation
- ✅ Checkout form validation
- ✅ Login/Register form validation
- ✅ Edge cases and special characters

### Error Handling Tests
- ✅ API error scenarios (500, 404, network failures)
- ✅ Empty results handling
- ✅ Timeout scenarios
- ✅ Invalid data handling
- ✅ Authentication errors

## 🏗️ Page Object Model Pattern

All tests use the Page Object Model (POM) pattern for maintainability:

```typescript
import { MainFeaturePage } from '../pages/main-feature.page';
import { ResultsPage } from '../pages/results.page';

test('example test', async ({ page }) => {
  const mainFeaturePage = new MainFeaturePage(page);
  const resultsPage = new ResultsPage(page);
  
  await mainFeaturePage.goto();
  await mainFeaturePage.search('laptop');
  await resultsPage.expectResultsVisible();
});
```

## 📊 Test Data

Test data is centralized in `fixtures/test-data.ts`:
- User credentials
- Product/item data
- Form input data
- Edge case scenarios

## 🔧 Configuration

Playwright configuration is in `playwright.config.ts`:
- Base URL: `https://dormdeals-9cb29.web.app/`
- Timeout: 30 seconds
- Retries: 2 (on CI)
- Browsers: Chromium, Firefox, WebKit
- Mobile viewports: Pixel 5, iPhone 12
- Tablet viewport: iPad Pro

## 🎯 Best Practices

1. **Use Page Objects**: Always use POM for page interactions
2. **Centralize Test Data**: Use fixtures for test data
3. **Clear Test Names**: Descriptive test names explain what's being tested
4. **Wait for States**: Always wait for network idle or specific elements
5. **Error Handling**: Test both happy paths and error scenarios
6. **Isolation**: Each test should be independent

## 🐛 Debugging

### View test traces
```bash
npx playwright show-trace trace.zip
```

### Take screenshots on failure
Screenshots are automatically saved on test failure in `test-results/`

### View videos
Videos are saved for failed tests in `test-results/`

## 📈 CI/CD Integration

Tests are configured to run in CI with:
- Retries: 2
- Workers: 1 (sequential execution)
- HTML report generation
- Trace on first retry

## 🔍 Test Selectors

Tests use multiple selector strategies for reliability:
- Data attributes: `[data-testid="..."]`
- Role-based: `getByRole('button', { name: '...' })`
- Text content: `getByText('...')`
- CSS selectors: Fallback when needed

## 📝 Writing New Tests

1. Create or use existing Page Object Model
2. Add test data to `fixtures/test-data.ts` if needed
3. Write test in appropriate spec file
4. Use descriptive test names
5. Test both success and failure scenarios
6. Add comments for complex business logic

## 🚨 Common Issues

### Tests timing out
- Increase timeout in `playwright.config.ts`
- Check if selectors are correct
- Verify network requests complete

### Selectors not found
- Check if element exists in DOM
- Verify page has loaded
- Use more specific selectors

### Flaky tests
- Add proper waits
- Use `waitForLoadState('networkidle')`
- Avoid hard-coded timeouts when possible

