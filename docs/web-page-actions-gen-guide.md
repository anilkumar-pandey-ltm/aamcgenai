# Page Actions Generation Guide

## 🤖 Agent Information

**Agent Mode**: `web-page-actions-generator`  
**Agent File**: `.github/agents/web-page-actions-generator.agent.md`  
**Activation**: Use `@web-page-actions-generator` prefix in your Copilot prompts

### How to Activate This Agent

```
@web-page-actions-generator [Your Prompt]
```

**Example:**
```
@web-page-actions-generator Generate page actions for HomePage using YAML at "page-object/home_locators.yaml"
```

## Overview
This guide explains how to generate Page Object classes from YAML locator files using the **FusionIQ Custom Agent** for automated, context-aware page object creation.

## Prerequisites
- Python 3.13+ installed
- YAML locator file generated (see locator generation guide)
- GitHub Copilot enabled in VS Code
- MCP servers configured and running
- Application context files populated

## 🎯 Primary Method: Custom Agent

The **@web-page-actions-generator** agent provides intelligent, context-aware page object generation using dual MCP server integration.

### What the Agent Does Automatically
1. ✅ **Fetches Application Context** - Understands your business domain and UI elements
2. ✅ **Discovers Framework Patterns** - Adapts to your programming language and automation framework
3. ✅ **Generates Smart Methods** - Creates meaningful method names based on application context
4. ✅ **Auto-Fixes Imports** - Corrects relative paths and missing dependencies
5. ✅ **Validates Output** - Ensures error-free, production-ready code
6. ✅ **Framework Agnostic** - Works with any language (TypeScript, Python, Java, C#, JavaScript)

---

## 🚀 Quick Start - User Prompts

### Basic Generation
**Prompt:**
```
@web-page-actions-generator Generate page actions for HomePage using YAML at "C:\Automation_POCs\GenAI_FusionIQ_Copilot\GenAI_FusionIQ_Framework_Copilot\page-object\pgindiademo-fbbzfecrf5hacphz_home_locators.yaml"
```

### Generate with Custom Output Directory
**Prompt:**
```
@web-page-actions-generator Create LoginPage page actions from YAML "C:\path\to\login_locators.yaml" output to "C:\project\pages"
```

### Generate Multiple Pages
**Prompt:**
```
@web-page-actions-generator Generate page actions for:
1. HomePage from "C:\path\to\home_locators.yaml"
2. LoginPage from "C:\path\to\login_locators.yaml" 
3. DashboardPage from "C:\path\to\dashboard_locators.yaml"
```

### Generate with Specific Class Name
**Prompt:**
```
@web-page-actions-generator Generate page actions for CheckoutPage using YAML at "C:\path\to\checkout_locators.yaml" with class name "CheckoutPageObject"
```

---

## 📋 Detailed User Prompts Guide

### 1. Single Page Object Generation

**Basic Syntax:**
```
@web-page-actions-generator Generate page actions for {PageName} using YAML at "{full_path_to_yaml}"
```

**Real Examples:**

**E-commerce Homepage:**
```
@web-page-actions-generator Generate page actions for HomePage using YAML at "C:\Automation_POCs\GenAI_FusionIQ_Copilot\GenAI_FusionIQ_Framework_Copilot\page-object\pgindiademo-fbbzfecrf5hacphz_home_locators.yaml"
```

**Qatar Airways Homepage:**
```
@web-page-actions-generator Generate page actions for QatarAirwaysHomePage using YAML at "C:\Automation_POCs\GenAI_FusionIQ_Copilot\GenAI_FusionIQ_Framework_Copilot\page-object\qatarairways_com_en_in_homepage_locators.yaml"
```

**Banking Login Page:**
```
@web-page-actions-generator Create page actions for BankLoginPage using YAML "C:\project\locators\bank_login_locators.yaml"
```

### 2. Batch Generation Prompts

**Generate Multiple Related Pages:**
```
@web-page-actions-generator Generate page actions for e-commerce flow:
- HomePage from "C:\locators\home_locators.yaml"
- ProductPage from "C:\locators\product_locators.yaml"  
- CartPage from "C:\locators\cart_locators.yaml"
- CheckoutPage from "C:\locators\checkout_locators.yaml"
```

**Generate Admin Panel Pages:**
```
@web-page-actions-generator Create page actions for admin modules:
1. AdminDashboard from "C:\locators\admin_dashboard_locators.yaml"
2. UserManagement from "C:\locators\user_mgmt_locators.yaml"
3. ReportsPage from "C:\locators\reports_locators.yaml"
```

### 3. Custom Output Directory Prompts

**Specify Custom Output Location:**
```
@web-page-actions-generator Generate page actions for LoginPage using YAML at "C:\locators\login_locators.yaml" output to "C:\test-framework\page-objects"
```

**Organize by Module:**
```
@web-page-actions-generator Create PaymentPage from "C:\locators\payment_locators.yaml" save to "C:\framework\pages\payment\"
```

### 4. Framework-Specific Generation

**For TypeScript/Playwright Projects:**
```
@web-page-actions-generator Generate TypeScript page actions for RegistrationPage using YAML at "C:\locators\registration_locators.yaml"
```

**For Python Projects:**
```
@web-page-actions-generator Create Python page actions for SearchPage using YAML "C:\locators\search_locators.yaml"
```

**For Java Projects:**
```
@web-page-actions-generator Generate Java page actions for ProfilePage using YAML "C:\locators\profile_locators.yaml"
```

---

## 🔄 What Happens During Generation

### Step 1: Context Discovery
The agent automatically:
- Reads application context from `data/context/application/` 
- Loads domain model from `data/context/domain/`
- Extracts business rules from `data/context/business_rules/`
- Discovers framework patterns via MCP Automation Server

### Step 2: Intelligent Analysis
- **Language Detection**: Identifies TypeScript, Python, Java, C#, etc.
- **Framework Discovery**: Finds Playwright, Selenium, Cypress patterns
- **Base Class Location**: Locates and analyzes your BasePage implementation
- **Naming Conventions**: Adapts to camelCase, snake_case, PascalCase

### Step 3: Smart Generation
- **Method Names**: Uses business terminology (e.g., `searchProduct()` instead of `clickElement1()`)
- **Documentation**: Includes business context and rules
- **Type Safety**: Generates proper type annotations
- **Error Handling**: Follows framework patterns

### Step 4: Auto-Validation & Fixes
- **Import Corrections**: Fixes relative path issues automatically
- **Missing Methods**: Creates new methods in BasePage if needed
- **Syntax Validation**: Ensures code compiles without errors
- **Framework Integration**: Verifies all dependencies resolve

---

## 📊 Expected Output Structure

### Generated Page Object Example
```typescript
import { Page } from '@playwright/test';
import { BasePage } from '../framework/core/basePage';

/**
 * HomePage - E-commerce home page interactions
 * Business Context: Product browsing, search, navigation
 * Generated from: pgindiademo-fbbzfecrf5hacphz_home_locators.yaml
 */
export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page, 'pgindiademo-fbbzfecrf5hacphz_home_locators');
  }

  /**
   * Search for a product by name
   * Business Rule: Search filters by exact or partial match
   * @param productName - Name of product to search (e.g., "Hummingbird T-Shirt")
   */
  async searchProduct(productName: string): Promise<void> {
    this.logger.info(`Searching for product: ${productName}`);
    await this.fillElement('search_plans_input', productName);
    await this.clickElement('search_button');
    this.logger.debug(`✅ Search submitted for: ${productName}`);
  }

  /**
   * Navigate to product categories
   * Categories: Clothes, Art, Home Accessories
   */
  async navigateToCategory(categoryName: string): Promise<void> {
    await this.clickElement('category_menu');
    this.logger.info(`Selected category: ${categoryName}`);
  }

  /**
   * Add featured product to cart
   * Business Rule: Check stock availability before adding
   */
  async addFeaturedProductToCart(): Promise<void> {
    await this.clickElement('featured_product_add_to_cart');
    this.logger.info('Added featured product to cart');
  }

  /**
   * Verify homepage loaded successfully
   * Checks for key elements: logo, search box, navigation
   */
  async verifyHomePageLoaded(): Promise<boolean> {
    const isLogoVisible = await this.isElementVisible('site_logo');
    const isSearchVisible = await this.isElementVisible('search_plans_input');
    return isLogoVisible && isSearchVisible;
  }
}
```

---

## ✅ Success Indicators

After successful generation, you'll see:
```
✅ Page Actions Generated: HomePage.ts
📁 Location: C:\Automation_POCs\GenAI_FusionIQ_Copilot\GenAI_FusionIQ_Framework_Copilot\page-actions\HomePage.ts
📝 YAML Source: pgindiademo-fbbzfecrf5hacphz_home_locators.yaml
🎯 Language: TypeScript
🏗️ Framework: Playwright
📚 Base Class: BasePage (framework/core/basePage.ts)
🔧 Auto-Fixes Applied: 1 import fix, 2 methods added to BasePage
✅ Validation: No errors detected
📋 Context Used: E-commerce application context, product domain model
```

---

## 🛠️ Troubleshooting Prompts

### If Generation Fails
```
@web-page-actions-generator Debug page actions generation for HomePage - check YAML file and context availability
```

### If Import Errors Persist
```
@web-page-actions-generator Fix import errors in generated HomePage.ts and validate BasePage integration
```

### If Methods Are Missing
```
@web-page-actions-generator Add missing methods to BasePage for HomePage.ts functionality
```

---

## 📚 Advanced Usage Prompts

### Generate with Business Context
```
@web-page-actions-generator Generate page actions for CheckoutPage using business context from e-commerce domain, YAML at "C:\locators\checkout_locators.yaml"
```

### Regenerate After YAML Updates
```
@web-page-actions-generator Regenerate HomePage page actions after locator updates, YAML at "C:\locators\home_locators_v2.yaml"
```

### Generate Test-Ready Page Objects
```
@web-page-actions-generator Create test-ready page actions for LoginPage with validation methods, YAML "C:\locators\login_locators.yaml"
```

---

## 🔄 Alternative: Direct Service Call

---

## 🔄 Alternative: Direct Service Call

*Use this method if the custom agent is unavailable or you prefer direct service execution*

### When to Use Direct Service Call
- Custom agent shows "no endpoints available" error
- You want manual control over each step
- Debugging specific generation issues
- Working with custom framework configurations

### Direct Service Syntax
```powershell
& "C:/Program Files/Python313/python.exe" -m src.services.page_object_generator_service --yaml "YAML_PATH" --class ClassName --output "OUTPUT_DIR" --language typescript-playwright
```

### Direct Service Examples

**Generate HomePage:**
```powershell
& "C:/Program Files/Python313/python.exe" -m src.services.page_object_generator_service --yaml "C:\Automation_POCs\GenAI_FusionIQ_Copilot\GenAI_FusionIQ_Framework_Copilot\page-object\pgindiademo-fbbzfecrf5hacphz_home_locators.yaml" --class HomePage --output "C:\Automation_POCs\GenAI_FusionIQ_Copilot\GenAI_FusionIQ_Framework_Copilot\page-actions" --language typescript-playwright
```

**Generate LoginPage:**
```powershell
& "C:/Program Files/Python313/python.exe" -m src.services.page_object_generator_service --yaml "C:\project\locators\login_locators.yaml" --class LoginPage --output "C:\project\pages" --language typescript-playwright
```

**Generate for Python:**
```powershell
& "C:/Program Files/Python313/python.exe" -m src.services.page_object_generator_service --yaml "C:\locators\search_locators.yaml" --class SearchPage --output "C:\pages" --language python-playwright
```

### Supported Languages
- `typescript-playwright` (default)
- `javascript-playwright`
- `java-playwright`
- `python-playwright`
- `csharp-playwright`

---

## 🎯 Complete User Prompt Examples

### Real-World Scenarios

**1. E-commerce Website Testing:**
```
@web-page-actions-generator Generate comprehensive page actions for e-commerce testing:

1. HomePage from "C:\ecommerce\locators\home_locators.yaml"
   - Product search and browsing
   - Category navigation
   - Featured products interaction

2. ProductPage from "C:\ecommerce\locators\product_locators.yaml"  
   - Product details viewing
   - Add to cart functionality
   - Product image gallery

3. ShoppingCartPage from "C:\ecommerce\locators\cart_locators.yaml"
   - Item quantity updates
   - Remove items
   - Proceed to checkout

4. CheckoutPage from "C:\ecommerce\locators\checkout_locators.yaml"
   - Billing and shipping forms
   - Payment method selection
   - Order confirmation
```

**2. Banking Application:**
```
@web-page-actions-generator Create page actions for online banking application:

- LoginPage from "C:\banking\locators\login_locators.yaml" with enhanced security validations
- DashboardPage from "C:\banking\locators\dashboard_locators.yaml" with account summary methods
- TransferPage from "C:\banking\locators\transfer_locators.yaml" with transaction validations
- HistoryPage from "C:\banking\locators\history_locators.yaml" with filtering and search capabilities
```

**3. Admin Panel Management:**
```
@web-page-actions-generator Generate admin panel page actions:

Focus on role-based access and data management:
1. AdminLoginPage from "C:\admin\locators\admin_login_locators.yaml"
2. UserManagementPage from "C:\admin\locators\user_mgmt_locators.yaml"
3. ReportsPage from "C:\admin\locators\reports_locators.yaml"
4. SettingsPage from "C:\admin\locators\settings_locators.yaml"

Include audit logging and permission checks in generated methods.
```

**4. Travel Booking System:**
```
@web-page-actions-generator Create travel booking page actions:

- FlightSearchPage from "C:\travel\locators\flight_search_locators.yaml"
- HotelSearchPage from "C:\travel\locators\hotel_search_locators.yaml"  
- BookingPage from "C:\travel\locators\booking_locators.yaml"
- PaymentPage from "C:\travel\locators\payment_locators.yaml"

Include date picker interactions and multi-step form handling.
```

---

## 📋 Prompt Templates for Copy-Paste

### Template 1: Single Page Object
```
@web-page-actions-generator Generate page actions for {PAGE_NAME} using YAML at "{YAML_FILE_PATH}"
```

### Template 2: Multiple Pages
```
@web-page-actions-generator Generate page actions for {PROJECT_NAME}:
1. {Page1Name} from "{yaml1_path}"
2. {Page2Name} from "{yaml2_path}"
3. {Page3Name} from "{yaml3_path}"
```

### Template 3: With Custom Output
```
@web-page-actions-generator Create page actions for {PAGE_NAME} using YAML "{YAML_PATH}" output to "{OUTPUT_DIRECTORY}"
```

### Template 4: Framework-Specific
```
@web-page-actions-generator Generate {LANGUAGE} page actions for {PAGE_NAME} using YAML "{YAML_PATH}"
```

### Template 5: Business Context Focused
```
@web-page-actions-generator Generate page actions for {PAGE_NAME} with {BUSINESS_DOMAIN} context, YAML at "{YAML_PATH}"
```

---

## 🔍 Generated Method Types

The agent creates different method types based on YAML element analysis:

### Click Methods
```typescript
async clickLoginButton(): Promise<void>
async clickSearchIcon(): Promise<void>
async clickAddToCartButton(): Promise<void>
```

### Input/Fill Methods
```typescript
async enterUsername(username: string): Promise<void>
async fillSearchQuery(query: string): Promise<void>
async selectCountry(country: string): Promise<void>
```

### Validation Methods
```typescript
async isElementVisible(): Promise<boolean>
async getErrorMessage(): Promise<string>
async verifyPageTitle(): Promise<boolean>
```

### Navigation Methods
```typescript
async navigateToPage(): Promise<void>
async goToSection(section: string): Promise<void>
async openTab(tabName: string): Promise<void>
```

### Business Logic Methods
```typescript
async searchProduct(productName: string): Promise<void>
async addProductToCart(productId: string): Promise<void>
async processCheckout(orderData: OrderData): Promise<void>
```

---

## ⚠️ Common Issues and Solutions

### Issue: "YAML file not found"
**Solution Prompts:**
```
@web-page-actions-generator Verify YAML file exists and regenerate: check path "C:\path\to\locators.yaml"
```

### Issue: Import errors in generated code
**Solution Prompts:**
```
@web-page-actions-generator Fix import paths for generated page object and update BasePage references
```

### Issue: Missing methods in BasePage
**Solution Prompts:**
```
@web-page-actions-generator Add missing utility methods to BasePage for page object functionality
```

### Issue: Framework not detected correctly
**Solution Prompts:**
```
@web-page-actions-generator Re-analyze framework structure and regenerate page actions with correct patterns
```

---

## 🚀 Best Practices for Prompts

### 1. Be Specific with Paths
✅ **Good:**
```
@web-page-actions-generator Generate page actions for HomePage using YAML at "C:\Automation_POCs\GenAI_FusionIQ_Copilot\GenAI_FusionIQ_Framework_Copilot\page-object\pgindiademo-fbbzfecrf5hacphz_home_locators.yaml"
```

❌ **Avoid:**
```
@web-page-actions-generator Generate page actions for home page
```

### 2. Include Business Context
✅ **Good:**
```
@web-page-actions-generator Generate e-commerce page actions for ProductPage with shopping cart integration, YAML at "C:\locators\product_locators.yaml"
```

❌ **Avoid:**
```
@web-page-actions-generator Generate ProductPage
```

### 3. Specify Output Requirements
✅ **Good:**
```
@web-page-actions-generator Create test-ready page actions for CheckoutPage with validation methods and error handling, YAML "C:\locators\checkout_locators.yaml"
```

### 4. Use Descriptive Class Names
✅ **Good:**
```
@web-page-actions-generator Generate page actions for UserProfileManagementPage using YAML "C:\locators\profile_locators.yaml"
```

❌ **Avoid:**
```
@web-page-actions-generator Generate page actions for Page1 using YAML "C:\locators\locators.yaml"
```

---

## 📚 Integration Examples

### Using Generated Page Objects in Tests

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../page-actions/HomePage';
import { ProductPage } from '../page-actions/ProductPage';

test('Complete e-commerce user journey', async ({ page }) => {
  // Initialize page objects
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  
  // Navigate and verify homepage
  await homePage.navigateToPage();
  const isHomeLoaded = await homePage.verifyHomePageLoaded();
  expect(isHomeLoaded).toBeTruthy();
  
  // Search for product
  await homePage.searchProduct('Hummingbird T-Shirt');
  
  // Verify search results
  const searchResults = await homePage.getSearchResultsCount();
  expect(searchResults).toBeGreaterThan(0);
  
  // Navigate to product and add to cart
  await homePage.clickFirstSearchResult();
  await productPage.addProductToCart();
  
  // Verify cart update
  const cartCount = await homePage.getCartItemCount();
  expect(cartCount).toBe('1');
});
```

---

## 📖 Related Documentation

- [Locator Generation Guide](./locator-generation-guide.md) - How to create YAML locator files
- [Framework Architecture](./framework_arch.md) - Understanding the framework structure  
- [BDD Test Scenarios Generation](./web-bdd-Test scenarios-generation-guide.md) - Creating test scenarios
- [Step Definitions Generation](./web-step-definitions-generation-guide.md) - Generating Cucumber step definitions

---

## 🆘 Support and Help

### Quick Help Prompts
```
@web-page-actions-generator Help me understand page actions generation process and available options
```

```
@web-page-actions-generator Show me examples of page actions generation for different types of web applications
```

```
@web-page-actions-generator Troubleshoot page actions generation issues and provide solutions
```

### Documentation References
- **Agent Instructions**: `.github/instructions/copilot-instructions.md`
- **Service Source**: `src/services/page_object_generator_service.py`
- **Base Page**: `framework/core/basePage.ts`
- **Example Page Objects**: `page-actions/` directory

### Community Examples
Check the `page-actions/` directory for real examples:
- `QatarAirwaysHomePage.ts` - Travel website example
- Additional examples from generated page objects

Remember: The **@web-page-actions-generator** agent is designed to understand your intent and provide intelligent, context-aware page object generation with minimal manual intervention.
