---
name: traditional-test-script-patterns
description: Patterns for generating executable traditional (non-BDD) test scripts using page actions, locators, and the automation framework for functional, smoke, regression, and end-to-end test scenarios.
---

# Traditional Test Script Patterns

## Overview
This guide provides patterns for generating executable traditional test scripts (non-BDD) that use page actions, locators, and the automation framework.

---

## Test Script Types

### 1. Functional Test Script
Tests specific functionality end-to-end using page actions.

### 2. Smoke Test Script
Quick validation of critical functionality.

### 3. Regression Test Script
Validates existing functionality after changes.

### 4. Integration Test Script
Tests interaction between multiple components/pages.

---

## Core Test Script Structure

### Required Sections (In Order)

```typescript
// 1. IMPORTS
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LocatorUtility } from '../utils/locatorUtility';

// 2. TEST SUITE DECLARATION
test.describe('Feature Name Test Suite', () => {
  
  // 3. SETUP/TEARDOWN (Optional)
  test.beforeEach(async ({ page }) => {
    // Setup code
  });
  
  test.afterEach(async ({ page }) => {
    // Cleanup code
  });

  // 4. TEST CASES
  test('Test Case Name - Descriptive Title', async ({ page }) => {
    // Test implementation
  });
});
```

---

## Test Case Structure

### Complete Test Case Template

```typescript
test('TC_001: Verify user can login with valid credentials', async ({ page }) => {
  // ARRANGE - Setup test data and preconditions
  const testUser = {
    email: 'test@example.com',
    password: 'ValidPass123'
  };
  
  // Initialize page objects
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  
  // ACT - Execute the test scenario
  await loginPage.navigateTo();
  await loginPage.enterEmail(testUser.email);
  await loginPage.enterPassword(testUser.password);
  await loginPage.clickLoginButton();
  
  // ASSERT - Verify expected outcomes
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(dashboardPage.welcomeMessage).toBeVisible();
  const welcomeText = await dashboardPage.getWelcomeText();
  expect(welcomeText).toContain('Welcome');
});
```

---

## Multi-Language Patterns

### TypeScript (Playwright)

```typescript
import { test, expect, Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Home Page Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigateTo();
  });

  test('TC_001: Verify home page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Home/);
    await expect(homePage.headerLogo).toBeVisible();
  });

  test('TC_002: Verify navigation menu is functional', async () => {
    await homePage.clickProductsLink();
    await expect(homePage.page).toHaveURL(/.*products/);
  });
});
```

### Java (Selenium)

```java
import org.junit.jupiter.api.*;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import pages.HomePage;
import static org.junit.jupiter.api.Assertions.*;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class HomePageTests {
    private WebDriver driver;
    private HomePage homePage;

    @BeforeAll
    void setUp() {
        driver = new ChromeDriver();
    }

    @BeforeEach
    void initPage() {
        homePage = new HomePage(driver);
        homePage.navigateTo();
    }

    @Test
    @DisplayName("TC_001: Verify home page loads successfully")
    void testHomePageLoad() {
        assertTrue(driver.getTitle().contains("Home"));
        assertTrue(homePage.isHeaderLogoVisible());
    }

    @Test
    @DisplayName("TC_002: Verify navigation menu is functional")
    void testNavigationMenu() {
        homePage.clickProductsLink();
        assertTrue(driver.getCurrentUrl().contains("products"));
    }

    @AfterAll
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
```

### Python (pytest)

```python
import pytest
from playwright.sync_api import Page, expect
from pages.home_page import HomePage

class TestHomePage:
    @pytest.fixture(autouse=True)
    def setup(self, page: Page):
        self.home_page = HomePage(page)
        self.home_page.navigate_to()
        yield
        # Teardown code here if needed

    def test_tc_001_verify_home_page_loads(self, page: Page):
        """TC_001: Verify home page loads successfully"""
        expect(page).to_have_title(re.compile("Home"))
        expect(self.home_page.header_logo).to_be_visible()

    def test_tc_002_verify_navigation_menu(self, page: Page):
        """TC_002: Verify navigation menu is functional"""
        self.home_page.click_products_link()
        expect(page).to_have_url(re.compile(".*products"))
```

---

## Best Practices

### 1. Test Independence
```typescript
// ✅ CORRECT - Each test is independent
test('TC_001: Login test', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigateTo(); // Start fresh
  // ... test logic
});

test('TC_002: Dashboard test', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigateTo(); // Independent start
  // ... test logic
});

// ❌ WRONG - Tests depend on execution order
test('TC_001: Login', async () => {
  await loginPage.login(); // Sets state
});

test('TC_002: Dashboard', async () => {
  // Assumes already logged in from TC_001
  await dashboardPage.verify();
});
```

### 2. Clear Test Naming
```typescript
// ✅ CORRECT - Descriptive names
test('TC_001: Verify user can login with valid credentials', async () => {});
test('TC_002: Verify error message for invalid email format', async () => {});

// ❌ WRONG - Vague names
test('test1', async () => {});
test('login', async () => {});
```

### 3. Proper Assertions
```typescript
// ✅ CORRECT - Multiple specific assertions
test('TC_001: Verify login success', async ({ page }) => {
  await loginPage.login(email, password);
  
  // Verify navigation
  await expect(page).toHaveURL(/.*dashboard/);
  
  // Verify UI elements
  await expect(dashboardPage.welcomeMessage).toBeVisible();
  
  // Verify content
  const welcomeText = await dashboardPage.getWelcomeText();
  expect(welcomeText).toContain('Welcome');
});

// ❌ WRONG - Single vague assertion
test('TC_001: Verify login', async () => {
  await loginPage.login(email, password);
  expect(true).toBe(true); // Meaningless
});
```

### 4. Test Data Management
```typescript
// ✅ CORRECT - Externalized test data
const testData = {
  validUser: { email: 'valid@test.com', password: 'Pass123' },
  invalidUser: { email: 'invalid', password: '123' }
};

test('TC_001: Valid login', async () => {
  await loginPage.login(testData.validUser.email, testData.validUser.password);
});

// ❌ WRONG - Hardcoded data in test
test('TC_001: Login', async () => {
  await loginPage.login('user@test.com', 'password123');
});
```

### 5. Error Handling
```typescript
// ✅ CORRECT - Graceful error handling
test('TC_001: Verify element visibility', async ({ page }) => {
  try {
    await loginPage.navigateTo();
    await expect(loginPage.loginButton).toBeVisible({ timeout: 5000 });
  } catch (error) {
    // Capture screenshot for debugging
    await page.screenshot({ path: 'test-failure.png' });
    throw error; // Re-throw to fail test
  }
});

// ❌ WRONG - Swallowing errors
test('TC_001: Test', async () => {
  try {
    await loginPage.clickLoginButton();
  } catch (error) {
    // Silent fail - test passes even on error
  }
});
```

---

## Data-Driven Test Patterns

### Using Test Data Arrays

```typescript
const testUsers = [
  { email: 'user1@test.com', password: 'Pass1', expectedName: 'User One' },
  { email: 'user2@test.com', password: 'Pass2', expectedName: 'User Two' },
  { email: 'user3@test.com', password: 'Pass3', expectedName: 'User Three' }
];

testUsers.forEach((userData) => {
  test(`TC: Verify login for ${userData.email}`, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(userData.email, userData.password);
    
    const dashboardPage = new DashboardPage(page);
    const userName = await dashboardPage.getUserName();
    expect(userName).toBe(userData.expectedName);
  });
});
```

### Parameterized Tests (Playwright)

```typescript
const testCases = [
  { input: 'test@example.com', expected: true, description: 'valid email' },
  { input: 'invalid-email', expected: false, description: 'invalid email' },
  { input: '', expected: false, description: 'empty email' }
];

for (const testCase of testCases) {
  test(`TC: Verify email validation for ${testCase.description}`, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.enterEmail(testCase.input);
    const isValid = await loginPage.isEmailValid();
    expect(isValid).toBe(testCase.expected);
  });
}
```

---

## Page Object Integration

### Using Page Actions

```typescript
test('TC_001: Complete checkout process', async ({ page }) => {
  // Initialize page objects
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  
  // Navigate and select product
  await homePage.navigateTo();
  await homePage.searchProduct('Blue Shirt');
  
  // Add to cart
  await productPage.selectSize('Medium');
  await productPage.clickAddToCart();
  
  // Proceed to checkout
  await cartPage.clickCheckout();
  
  // Fill checkout form
  await checkoutPage.fillShippingInfo({
    name: 'John Doe',
    address: '123 Main St',
    city: 'New York',
    zip: '10001'
  });
  
  await checkoutPage.selectPaymentMethod('Credit Card');
  await checkoutPage.clickPlaceOrder();
  
  // Verify order confirmation
  await expect(page).toHaveURL(/.*order-confirmation/);
  const orderNumber = await checkoutPage.getOrderNumber();
  expect(orderNumber).toMatch(/ORD-\d{6}/);
});
```

---

## Locator Integration with YAML

### Using LocatorUtility

```typescript
import { LocatorUtility } from '../utils/locatorUtility';

test('TC_001: Test with YAML locators', async ({ page }) => {
  // Load locators from YAML file
  const locatorUtil = new LocatorUtility(page, 'login_page.yaml');
  
  // Use locator keys from YAML
  await page.goto('https://example.com/login');
  await locatorUtil.fill('email_input', 'test@example.com');
  await locatorUtil.fill('password_input', 'password123');
  await locatorUtil.click('login_button');
  
  // Verify using YAML locators
  const welcomeText = await locatorUtil.getText('welcome_message');
  expect(welcomeText).toContain('Welcome');
});
```

---

## Test Organization Patterns

### 1. Feature-Based Organization
```
tests/
├── authentication/
│   ├── login.test.ts
│   ├── logout.test.ts
│   └── registration.test.ts
├── shopping/
│   ├── product-search.test.ts
│   ├── cart.test.ts
│   └── checkout.test.ts
└── account/
    ├── profile.test.ts
    └── settings.test.ts
```

### 2. Priority-Based Organization
```
tests/
├── smoke/
│   ├── critical-flows.test.ts
│   └── homepage.test.ts
├── regression/
│   ├── login-flows.test.ts
│   └── checkout-flows.test.ts
└── extended/
    ├── edge-cases.test.ts
    └── performance.test.ts
```

---

## Common Test Patterns

### 1. Login and Perform Action
```typescript
test('TC_001: User can view profile after login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const profilePage = new ProfilePage(page);
  
  // Login
  await loginPage.navigateTo();
  await loginPage.login('test@example.com', 'password123');
  
  // Navigate to profile
  await profilePage.navigateTo();
  
  // Verify profile content
  await expect(profilePage.userEmail).toHaveText('test@example.com');
  await expect(profilePage.profilePicture).toBeVisible();
});
```

### 2. Form Submission with Validation
```typescript
test('TC_002: Form validation prevents invalid submission', async ({ page }) => {
  const contactPage = new ContactPage(page);
  
  await contactPage.navigateTo();
  
  // Leave required field empty
  await contactPage.enterName('John Doe');
  // Email intentionally left empty
  await contactPage.enterMessage('Test message');
  await contactPage.clickSubmit();
  
  // Verify validation error
  const errorMessage = await contactPage.getEmailError();
  expect(errorMessage).toBe('Email is required');
  
  // Verify form not submitted
  await expect(page).toHaveURL(/.*contact/); // Still on contact page
});
```

### 3. Multi-Step Workflow
```typescript
test('TC_003: Complete product purchase workflow', async ({ page }) => {
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  
  // Step 1: Browse and select product
  await homePage.navigateTo();
  await homePage.searchProduct('Laptop');
  await productPage.clickFirstResult();
  
  // Step 2: Add to cart
  await productPage.clickAddToCart();
  await expect(cartPage.cartCount).toHaveText('1');
  
  // Step 3: Proceed to checkout
  await cartPage.clickCheckout();
  await checkoutPage.fillShippingInfo(testData.shippingInfo);
  
  // Step 4: Complete payment
  await checkoutPage.fillPaymentInfo(testData.paymentInfo);
  await checkoutPage.clickPlaceOrder();
  
  // Step 5: Verify order success
  await expect(page).toHaveURL(/.*order-success/);
  const orderConfirmation = await page.locator('.order-confirmation').textContent();
  expect(orderConfirmation).toContain('Order placed successfully');
});
```

---

## Test Execution Hooks

### Playwright Hooks
```typescript
test.describe('Feature Tests', () => {
  test.beforeAll(async ({ browser }) => {
    // Runs once before all tests in the suite
    console.log('Setting up test suite');
  });

  test.beforeEach(async ({ page }) => {
    // Runs before each test
    await page.goto('https://example.com');
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Runs after each test
    if (testInfo.status !== 'passed') {
      await page.screenshot({ path: `failure-${testInfo.title}.png` });
    }
  });

  test.afterAll(async () => {
    // Runs once after all tests
    console.log('Cleaning up test suite');
  });
});
```

---

## Async/Await Best Practices

### ✅ Correct Usage
```typescript
test('TC_001: Async operations', async ({ page }) => {
  // Always await async operations
  await page.goto('https://example.com');
  await page.click('button#submit');
  await page.waitForSelector('.success-message');
  
  // Await assertions
  await expect(page.locator('.success')).toBeVisible();
});
```

### ❌ Common Mistakes
```typescript
// Wrong: Missing await
test('TC_001: Missing await', async ({ page }) => {
  page.goto('https://example.com'); // Missing await
  page.click('button'); // Missing await
});

// Wrong: Not using async
test('TC_002: Not async', ({ page }) => { // Should be async
  await page.goto('https://example.com'); // await without async
});
```

---

## Test Documentation

### Inline Documentation
```typescript
/**
 * Test Suite: Authentication Flow Tests
 * Purpose: Verify login, logout, and session management
 * Prerequisites: Valid test user account exists
 * Test Data: Located in testdata/users.json
 */
test.describe('Authentication Flow Tests', () => {
  
  /**
   * TC_001: Valid Login
   * Description: Verify user can login with valid credentials
   * Priority: High (Smoke Test)
   * Steps:
   *   1. Navigate to login page
   *   2. Enter valid email and password
   *   3. Click login button
   *   4. Verify redirect to dashboard
   */
  test('TC_001: Verify user can login with valid credentials', async ({ page }) => {
    // Test implementation
  });
});
```

---

## Summary

### Key Takeaways

1. **Structure**: Follow consistent test structure (Arrange-Act-Assert)
2. **Independence**: Each test should be independent and atomic
3. **Naming**: Use clear, descriptive test names with test case IDs
4. **Assertions**: Include multiple specific assertions per test
5. **Page Objects**: Use page actions for all interactions
6. **Locators**: Prefer YAML-based locators with LocatorUtility
7. **Data**: Externalize test data from test logic
8. **Error Handling**: Implement proper error handling and debugging
9. **Documentation**: Add inline documentation for complex tests
10. **Async/Await**: Always await async operations

### Anti-Patterns to Avoid

❌ Hard-coded selectors in tests
❌ Test interdependencies
❌ Vague test names
❌ Single assertion per test
❌ Hard-coded test data
❌ Swallowing errors
❌ Missing awaits on async operations
❌ Tests that modify shared state

---

## Related Skills

- **page-object-design-patterns.md** - Page object structure and patterns
- **bdd-gherkin-patterns.md** - BDD test patterns
- **web-defensive-automation.md** - Defensive coding in tests
- **validation-and-autofix.md** - Test validation and auto-fix patterns
