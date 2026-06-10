---
name: web-multi-language-templates
description: Language-specific page object class templates for TypeScript, Python, Java, JavaScript, and C# verified against live MCP framework discovery, with class declaration, constructor, method signature, and naming convention patterns per language.
---

# Web Multi-Language Page Object Templates

## Language-Specific Generation Patterns

All language output is driven by live MCP discovery. This reference shows **verified patterns per language** — confirm each by reading actual project files before generating.

## Language Comparison Table

| Aspect | TypeScript | Python | Java | JavaScript | C# |
|---|---|---|---|---|---|
| **File Extension** | `.ts` | `.py` | `.java` | `.js` | `.cs` |
| **Class Declaration** | `export class X extends Base` | `class X(Base):` | `public class X extends Base` | `class X extends Base` | `public class X : Base` |
| **Constructor** | `constructor(page: Page)` | `def __init__(self, page)` | `public X(Page page)` | `constructor(page)` | `public X(IPage page)` |
| **Method Signature** | `async methodName(): Promise<void>` | `async def method_name(self)` | `public void methodName()` | `async methodName()` | `public async Task MethodName()` |
| **Naming Convention** | camelCase methods, PascalCase class | snake_case methods | camelCase methods, PascalCase class | camelCase methods, PascalCase class | PascalCase everything |
| **Imports** | `import { X } from '...'` | `from module import X` | `import package.X;` | `const { X } = require('...')` or `import` | `using Namespace.X;` |
| **Type Annotations** | Full TypeScript types | Python type hints (3.5+) | Java generics | JSDoc comments only | Full C# types |
| **Async Pattern** | `await` + `Promise<T>` | `await` + `async def` | `CompletableFuture` or sync | `await` + `Promise` | `await` + `Task<T>` |
| **Visibility** | `public`, `private`, `protected` | `_private`, `__strongly_private` | `public`, `private`, `protected` | No true private (use `#`) | `public`, `private`, `protected` |
| **Null Safety** | `value | null` | `Optional[type]` or `value | None` | `@Nullable`, `Optional<T>` | `value | null` | `value?` |

## TypeScript/Playwright Template

**Current Project Pattern**

```typescript
// ========================================
// IMPORTS
// ========================================
import { Page } from '@playwright/test';
import { BasePage } from '../../framework/core/basePage';

/**
 * Page Actions for {ClassName}
 * 
 * This class provides atomic actions and business workflows for the {ClassName} page.
 * All methods use YAML-based locators from '{locator_file_name}.yaml' with AI healing support.
 * 
 * Inherits from BasePage:
 * - Automatic locator resolution via LocatorUtility
 * - AI-powered locator healing on failures
 * - Comprehensive logging via StepLogger
 * - Defensive automation patterns (auto-waits, retries)
 * 
 * Generated: {generation_date}
 * Framework: Playwright
 * Language: TypeScript
 * YAML Source: {yaml_location}
 * 
 * @example
 * ```typescript
 * const homePage = new HomePage(page);
 * await homePage.navigateToPage();
 * await homePage.performSearch('laptop', { maxPrice: 50000 });
 * ```
 */
export class {ClassName} extends BasePage {
  public readonly page: Page;

  // ========================================
  // CONSTRUCTOR
  // ========================================
  /**
   * Initialize {ClassName} with page context
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    super(page, '{locator_file_name}'); // No .yaml extension
    this.page = page;
  }

  // ========================================
  // NAVIGATION
  // ========================================
  /**
   * Navigate to {page_name} page
   * Waits for page load and landmark elements
   */
  async navigateToPage(): Promise<void> {
    await this.navigateTo('{page_url}');
    await this.waitForElement('{landmark_element}', { state: 'visible' });
  }

  // ========================================
  // ATOMIC ACTION METHODS
  // ========================================
  /**
   * Enter text into username input field
   * Waits for field to be editable before filling
   * 
   * @param value - Username to enter
   * @throws {Error} If value is empty or field is not editable
   */
  async enterUsernameInput(value: string): Promise<void> {
    if (!value || value.trim().length === 0) {
      throw new Error('Username cannot be empty');
    }
    
    await this.waitForElement('username_input', { state: 'editable' });
    await this.fillElement('username_input', value);
  }

  /**
   * Click login button
   * Waits for button to be enabled before clicking
   * 
   * @throws {Error} If button is not clickable
   */
  async clickLoginButton(): Promise<void> {
    await this.waitForElement('login_button', { state: 'enabled' });
    await this.clickElement('login_button');
  }

  /**
   * Select option from country dropdown
   * Waits for dropdown to be visible and options to load
   * 
   * @param option - Country name to select
   * @throws {Error} If option is not available
   */
  async selectCountryDropdown(option: string): Promise<void> {
    await this.waitForElement('country_dropdown', { state: 'visible' });
    await this.selectDropdownOption('country_dropdown', option);
  }

  // ========================================
  // BUSINESS WORKFLOW METHODS
  // ========================================
  /**
   * Perform complete login workflow
   * Combines username, password entry and button click with validation
   * 
   * @param username - User's username
   * @param password - User's password
   * @returns Login success status
   * @throws {Error} If credentials are invalid or login fails
   */
  async performLogin(username: string, password: string): Promise<boolean> {
    // Validate inputs
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    
    // Execute login workflow
    await this.enterUsernameInput(username);
    await this.enterPasswordInput(password);
    await this.clickLoginButton();
    
    // Wait for login result
    try {
      await this.waitForElement('dashboard_landmark', { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      // Check for error message
      const hasError = await this.isElementVisible('login_error_message');
      if (hasError) {
        const errorText = await this.getElementText('login_error_message');
        throw new Error(`Login failed: ${errorText}`);
      }
      return false;
    }
  }

  // ========================================
  // STATE/GETTER METHODS
  // ========================================
  /**
   * Get welcome message text
   * Waits for element to be visible before reading text
   * 
   * @returns Welcome message text or null if not found
   */
  async getWelcomeMessageText(): Promise<string | null> {
    await this.waitForElement('welcome_message', { state: 'visible' });
    return await this.getElementText('welcome_message');
  }

  /**
   * Verify logo image is displayed
   * 
   * @returns true if logo is visible, false otherwise
   */
  async verifyLogoImageIsDisplayed(): Promise<boolean> {
    return await this.isElementVisible('logo_image');
  }

  /**
   * Get ARIA label from search button for accessibility testing
   * 
   * @returns ARIA label text or null
   */
  async getAriaLabelForSearchButton(): Promise<string | null> {
    return await this.getElementAttribute('search_button', 'aria-label');
  }
}
```

## Python/Playwright Template

```python
# ========================================
# IMPORTS
# ========================================
from typing import Optional
from playwright.async_api import Page
from framework.core.base_page import BasePage

class {ClassName}(BasePage):
    """
    Page Actions for {ClassName}
    
    This class provides atomic actions and business workflows for the {ClassName} page.
    All methods use YAML-based locators from '{locator_file_name}.yaml' with AI healing support.
    
    Inherits from BasePage:
    - Automatic locator resolution via LocatorUtility
    - AI-powered locator healing on failures
    - Comprehensive logging via StepLogger
    - Defensive automation patterns (auto-waits, retries)
    
    Generated: {generation_date}
    Framework: Playwright
    Language: Python
    YAML Source: {yaml_location}
    
    Example:
        >>> home_page = HomePage(page)
        >>> await home_page.navigate_to_page()
        >>> await home_page.perform_search('laptop', max_price=50000)
    """
    
    # ========================================
    # CONSTRUCTOR
    # ========================================
    def __init__(self, page: Page):
        """
        Initialize {ClassName} with page context
        
        Args:
            page: Playwright Page object
        """
        super().__init__(page, '{locator_file_name}')
        self.page = page
    
    # ========================================
    # NAVIGATION
    # ========================================
    async def navigate_to_page(self) -> None:
        """
        Navigate to {page_name} page
        Waits for page load and landmark elements
        """
        await self.navigate_to('{page_url}')
        await self.wait_for_element('{landmark_element}', state='visible')
    
    # ========================================
    # ATOMIC ACTION METHODS
    # ========================================
    async def enter_username_input(self, value: str) -> None:
        """
        Enter text into username input field
        Waits for field to be editable before filling
        
        Args:
            value: Username to enter
            
        Raises:
            ValueError: If value is empty or field is not editable
        """
        if not value or not value.strip():
            raise ValueError('Username cannot be empty')
        
        await self.wait_for_element('username_input', state='editable')
        await self.fill_element('username_input', value)
    
    async def click_login_button(self) -> None:
        """
        Click login button
        Waits for button to be enabled before clicking
        
        Raises:
            Exception: If button is not clickable
        """
        await self.wait_for_element('login_button', state='enabled')
        await self.click_element('login_button')
    
    async def select_country_dropdown(self, option: str) -> None:
        """
        Select option from country dropdown
        Waits for dropdown to be visible and options to load
        
        Args:
            option: Country name to select
            
        Raises:
            Exception: If option is not available
        """
        await self.wait_for_element('country_dropdown', state='visible')
        await self.select_dropdown_option('country_dropdown', option)
    
    # ========================================
    # BUSINESS WORKFLOW METHODS
    # ========================================
    async def perform_login(self, username: str, password: str) -> bool:
        """
        Perform complete login workflow
        Combines username, password entry and button click with validation
        
        Args:
            username: User's username
            password: User's password
            
        Returns:
            Login success status
            
        Raises:
            ValueError: If credentials are invalid or login fails
        """
        # Validate inputs
        if not username or not password:
            raise ValueError('Username and password are required')
        
        # Execute login workflow
        await self.enter_username_input(username)
        await self.enter_password_input(password)
        await self.click_login_button()
        
        # Wait for login result
        try:
            await self.wait_for_element('dashboard_landmark', state='visible', timeout=5000)
            return True
        except Exception:
            # Check for error message
            has_error = await self.is_element_visible('login_error_message')
            if has_error:
                error_text = await self.get_element_text('login_error_message')
                raise ValueError(f'Login failed: {error_text}')
            return False
    
    # ========================================
    # STATE/GETTER METHODS
    # ========================================
    async def get_welcome_message_text(self) -> Optional[str]:
        """
        Get welcome message text
        Waits for element to be visible before reading text
        
        Returns:
            Welcome message text or None if not found
        """
        await self.wait_for_element('welcome_message', state='visible')
        return await self.get_element_text('welcome_message')
    
    async def verify_logo_image_is_displayed(self) -> bool:
        """
        Verify logo image is displayed
        
        Returns:
            True if logo is visible, False otherwise
        """
        return await self.is_element_visible('logo_image')
    
    async def get_aria_label_for_search_button(self) -> Optional[str]:
        """
        Get ARIA label from search button for accessibility testing
        
        Returns:
            ARIA label text or None
        """
        return await self.get_element_attribute('search_button', 'aria-label')
```

## Java/Selenium Template

```java
// ========================================
// IMPORTS
// ========================================
package pages;

import org.openqa.selenium.WebDriver;
import framework.BasePage;

/**
 * Page Actions for {ClassName}
 * 
 * This class provides atomic actions and business workflows for the {ClassName} page.
 * All methods use YAML-based locators with fallback strategies.
 * 
 * Generated: {generation_date}
 * Framework: Selenium WebDriver
 * Language: Java
 * YAML Source: {yaml_location}
 * 
 * @author Test Automation Framework
 * @version 1.0
 */
public class {ClassName} extends BasePage {
    
    // ========================================
    // CONSTRUCTOR
    // ========================================
    /**
     * Initialize {ClassName} with WebDriver context
     * 
     * @param driver WebDriver instance
     */
    public {ClassName}(WebDriver driver) {
        super(driver, "{locator_file_name}");
    }
    
    // ========================================
    // NAVIGATION
    // ========================================
    /**
     * Navigate to {page_name} page
     * Waits for page load and landmark elements
     */
    public void navigateToPage() {
        navigateTo("{page_url}");
        waitForElement("{landmark_element}", "visible");
    }
    
    // ========================================
    // ATOMIC ACTION METHODS
    // ========================================
    /**
     * Enter text into username input field
     * Waits for field to be editable before filling
     * 
     * @param value Username to enter
     * @throws IllegalArgumentException if value is empty
     */
    public void enterUsernameInput(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }
        
        waitForElement("username_input", "editable");
        fillElement("username_input", value);
    }
    
    /**
     * Click login button
     * Waits for button to be enabled before clicking
     */
    public void clickLoginButton() {
        waitForElement("login_button", "enabled");
        clickElement("login_button");
    }
    
    /**
     * Select option from country dropdown
     * Waits for dropdown to be visible and options to load
     * 
     * @param option Country name to select
     */
    public void selectCountryDropdown(String option) {
        waitForElement("country_dropdown", "visible");
        selectDropdownOption("country_dropdown", option);
    }
    
    // ========================================
    // BUSINESS WORKFLOW METHODS
    // ========================================
    /**
     * Perform complete login workflow
     * Combines username, password entry and button click with validation
     * 
     * @param username User's username
     * @param password User's password
     * @return Login success status
     * @throws IllegalArgumentException if credentials are invalid
     */
    public boolean performLogin(String username, String password) {
        // Validate inputs
        if (username == null || password == null) {
            throw new IllegalArgumentException("Username and password are required");
        }
        
        // Execute login workflow
        enterUsernameInput(username);
        enterPasswordInput(password);
        clickLoginButton();
        
        // Wait for login result
        try {
            waitForElement("dashboard_landmark", "visible", 5000);
            return true;
        } catch (Exception e) {
            // Check for error message
            if (isElementVisible("login_error_message")) {
                String errorText = getElementText("login_error_message");
                throw new RuntimeException("Login failed: " + errorText);
            }
            return false;
        }
    }
    
    // ========================================
    // STATE/GETTER METHODS
    // ========================================
    /**
     * Get welcome message text
     * Waits for element to be visible before reading text
     * 
     * @return Welcome message text or null if not found
     */
    public String getWelcomeMessageText() {
        waitForElement("welcome_message", "visible");
        return getElementText("welcome_message");
    }
    
    /**
     * Verify logo image is displayed
     * 
     * @return true if logo is visible, false otherwise
     */
    public boolean verifyLogoImageIsDisplayed() {
        return isElementVisible("logo_image");
    }
    
    /**
     * Get ARIA label from search button for accessibility testing
     * 
     * @return ARIA label text or null
     */
    public String getAriaLabelForSearchButton() {
        return getElementAttribute("search_button", "aria-label");
    }
}
```

## JavaScript/Playwright Template

```javascript
// ========================================
// IMPORTS
// ========================================
const { BasePage } = require('../../framework/core/basePage');

/**
 * Page Actions for {ClassName}
 * 
 * This class provides atomic actions and business workflows for the {ClassName} page.
 * All methods use YAML-based locators from '{locator_file_name}.yaml' with AI healing support.
 * 
 * @class
 * @extends BasePage
 */
class {ClassName} extends BasePage {
    
    // ========================================
    // CONSTRUCTOR
    // ========================================
    /**
     * Initialize {ClassName} with page context
     * 
     * @param {Page} page - Playwright Page object
     */
    constructor(page) {
        super(page, '{locator_file_name}');
        this.page = page;
    }
    
    // ========================================
    // NAVIGATION
    // ========================================
    /**
     * Navigate to {page_name} page
     * Waits for page load and landmark elements
     * 
     * @async
     * @returns {Promise<void>}
     */
    async navigateToPage() {
        await this.navigateTo('{page_url}');
        await this.waitForElement('{landmark_element}', { state: 'visible' });
    }
    
    // ========================================
    // ATOMIC ACTION METHODS
    // ========================================
    /**
     * Enter text into username input field
     * Waits for field to be editable before filling
     * 
     * @async
     * @param {string} value - Username to enter
     * @throws {Error} If value is empty or field is not editable
     * @returns {Promise<void>}
     */
    async enterUsernameInput(value) {
        if (!value || value.trim().length === 0) {
            throw new Error('Username cannot be empty');
        }
        
        await this.waitForElement('username_input', { state: 'editable' });
        await this.fillElement('username_input', value);
    }
    
    /**
     * Click login button
     * Waits for button to be enabled before clicking
     * 
     * @async
     * @throws {Error} If button is not clickable
     * @returns {Promise<void>}
     */
    async clickLoginButton() {
        await this.waitForElement('login_button', { state: 'enabled' });
        await this.clickElement('login_button');
    }
    
    // ========================================
    // BUSINESS WORKFLOW METHODS
    // ========================================
    /**
     * Perform complete login workflow
     * Combines username, password entry and button click with validation
     * 
     * @async
     * @param {string} username - User's username
     * @param {string} password - User's password
     * @returns {Promise<boolean>} Login success status
     * @throws {Error} If credentials are invalid or login fails
     */
    async performLogin(username, password) {
        // Validate inputs
        if (!username || !password) {
            throw new Error('Username and password are required');
        }
        
        // Execute login workflow
        await this.enterUsernameInput(username);
        await this.enterPasswordInput(password);
        await this.clickLoginButton();
        
        // Wait for login result
        try {
            await this.waitForElement('dashboard_landmark', { state: 'visible', timeout: 5000 });
            return true;
        } catch (error) {
            // Check for error message
            const hasError = await this.isElementVisible('login_error_message');
            if (hasError) {
                const errorText = await this.getElementText('login_error_message');
                throw new Error(`Login failed: ${errorText}`);
            }
            return false;
        }
    }
    
    // ========================================
    // STATE/GETTER METHODS
    // ========================================
    /**
     * Get welcome message text
     * Waits for element to be visible before reading text
     * 
     * @async
     * @returns {Promise<string|null>} Welcome message text or null if not found
     */
    async getWelcomeMessageText() {
        await this.waitForElement('welcome_message', { state: 'visible' });
        return await this.getElementText('welcome_message');
    }
}

module.exports = { {ClassName} };
```

## C#/Selenium Template

```csharp
// ========================================
// USING STATEMENTS
// ========================================
using System;
using System.Threading.Tasks;
using OpenQA.Selenium;
using Framework.Core;

namespace Pages
{
    /// <summary>
    /// Page Actions for {ClassName}
    /// 
    /// This class provides atomic actions and business workflows for the {ClassName} page.
    /// All methods use YAML-based locators with fallback strategies.
    /// 
    /// Generated: {generation_date}
    /// Framework: Selenium WebDriver
    /// Language: C#
    /// YAML Source: {yaml_location}
    /// </summary>
    public class {ClassName} : BasePage
    {
        // ========================================
        // CONSTRUCTOR
        // ========================================
        /// <summary>
        /// Initialize {ClassName} with WebDriver context
        /// </summary>
        /// <param name="driver">WebDriver instance</param>
        public {ClassName}(IWebDriver driver) : base(driver, "{locator_file_name}")
        {
        }
        
        // ========================================
        // NAVIGATION
        // ========================================
        /// <summary>
        /// Navigate to {page_name} page
        /// Waits for page load and landmark elements
        /// </summary>
        public async Task NavigateToPage()
        {
            await NavigateTo("{page_url}");
            await WaitForElement("{landmark_element}", "visible");
        }
        
        // ========================================
        // ATOMIC ACTION METHODS
        // ========================================
        /// <summary>
        /// Enter text into username input field
        /// Waits for field to be editable before filling
        /// </summary>
        /// <param name="value">Username to enter</param>
        /// <exception cref="ArgumentException">If value is empty</exception>
        public async Task EnterUsernameInput(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new ArgumentException("Username cannot be empty");
            }
            
            await WaitForElement("username_input", "editable");
            await FillElement("username_input", value);
        }
        
        /// <summary>
        /// Click login button
        /// Waits for button to be enabled before clicking
        /// </summary>
        public async Task ClickLoginButton()
        {
            await WaitForElement("login_button", "enabled");
            await ClickElement("login_button");
        }
        
        // ========================================
        // BUSINESS WORKFLOW METHODS
        // ========================================
        /// <summary>
        /// Perform complete login workflow
        /// Combines username, password entry and button click with validation
        /// </summary>
        /// <param name="username">User's username</param>
        /// <param name="password">User's password</param>
        /// <returns>Login success status</returns>
        /// <exception cref="ArgumentException">If credentials are invalid</exception>
        public async Task<bool> PerformLogin(string username, string password)
        {
            // Validate inputs
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                throw new ArgumentException("Username and password are required");
            }
            
            // Execute login workflow
            await EnterUsernameInput(username);
            await EnterPasswordInput(password);
            await ClickLoginButton();
            
            // Wait for login result
            try
            {
                await WaitForElement("dashboard_landmark", "visible", 5000);
                return true;
            }
            catch (Exception)
            {
                // Check for error message
                if (await IsElementVisible("login_error_message"))
                {
                    string errorText = await GetElementText("login_error_message");
                    throw new Exception($"Login failed: {errorText}");
                }
                return false;
            }
        }
        
        // ========================================
        // STATE/GETTER METHODS
        // ========================================
        /// <summary>
        /// Get welcome message text
        /// Waits for element to be visible before reading text
        /// </summary>
        /// <returns>Welcome message text or null if not found</returns>
        public async Task<string> GetWelcomeMessageText()
        {
            await WaitForElement("welcome_message", "visible");
            return await GetElementText("welcome_message");
        }
        
        /// <summary>
        /// Verify logo image is displayed
        /// </summary>
        /// <returns>True if logo is visible, false otherwise</returns>
        public async Task<bool> VerifyLogoImageIsDisplayed()
        {
            return await IsElementVisible("logo_image");
        }
    }
}
``

## Language-Specific Patterns Summary

### Naming Conventions by Language

**TypeScript**: 
- Classes: `PascalCase` (e.g., `HomePage`)
- Methods: `camelCase` (e.g., `enterUsernameInput`)
- Constants: `UPPER_SNAKE_CASE`

**Python**:
- Classes: `PascalCase` (e.g., `HomePage`)
- Methods: `snake_case` (e.g., `enter_username_input`)
- Constants: `UPPER_SNAKE_CASE`

**Java**:
- Classes: `PascalCase` (e.g., `HomePage`)
- Methods: `camelCase` (e.g., `enterUsernameInput`)
- Constants: `UPPER_SNAKE_CASE`

**C#**:
- Classes: `PascalCase` (e.g., `HomePage`)
- Methods: `PascalCase` (e.g., `EnterUsernameInput`)
- Constants: `PascalCase`

**JavaScript**:
- Classes: `PascalCase` (e.g., `HomePage`)
- Methods: `camelCase` (e.g., `enterUsernameInput`)
- Constants: `UPPER_SNAKE_CASE`

### Async Patterns by Language

**TypeScript**: `async methodName(): Promise<ReturnType>`
**Python**: `async def method_name(self) -> ReturnType:`
**Java**: Sync methods or `CompletableFuture<ReturnType> methodName()`
**C#**: `public async Task<ReturnType> MethodName()`
**JavaScript**: `async methodName()` (returns Promise implicitly)

### Error Handling by Language

**TypeScript**: `throw new Error('message')`
**Python**: `raise ValueError('message')` or `raise Exception('message')`
**Java**: `throw new IllegalArgumentException("message")` or `throw new RuntimeException("message")`
**C#**: `throw new ArgumentException("message")` or `throw new Exception("message")`
**JavaScript**: `throw new Error('message')`
