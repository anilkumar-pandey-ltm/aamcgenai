---
name: page-object-design-patterns
description: Core page object design principles defining the page action class contract, mandatory output structure, element type to method mapping, naming conventions, smart filtering rules, and method collision detection.
---

# Page Object Design Patterns

## Core Page Object Design Principles

### Page Action Class Contract

#### ❌ Page action classes must NEVER contain:
- **Assertions / expect() calls** - Assertions belong in step definitions, not page objects
- **Test setup or teardown logic** - Handled by test framework hooks
- **Direct selector strings** (CSS/XPath) as method arguments - Use YAML keys instead
- **Fallback locator logic** - Handled by LocatorUtility with AI healing
- **Console logging of test results** - Use framework loggers
- **Any import of test runners** - No jest, mocha, jasmine, pytest, JUnit imports
- **Hard-coded test data** - Pass data as parameters
- **Browser/driver management** - Handled by framework setup
- **Test orchestration logic** - Belongs in test files

#### ✅ Page action classes must ONLY contain:
- **Imports** - Base class, page/driver type, utilities
- **Class definition with constructor** - Proper inheritance and initialization
- **Atomic action methods** - Single responsibility (click, fill, select, hover, wait)
- **Business workflow methods** - Composed from atomic actions, domain-aware
- **Navigation methods** - Page navigation and URL handling
- **State-reading methods** - getText, isVisible, getAttribute, verification
- **Private helper methods** - For internal use only, encapsulation support

### Mandatory Output Structure

Every generated file **must** include these sections in order — nothing else:

```
1. Imports
   - Framework-specific imports (Page, Driver, etc.)
   - Base class import
   - Utility imports if needed

2. Class Definition + Constructor
   - Proper class name
   - Extends base class
   - Constructor with dependency injection

3. Navigation Method (if applicable)
   - navigateToPage() or similar
   - Parameterized navigation if needed

4. Atomic Action Methods (one per element, per element_type rule)
   - Input: enter{ElementName}Input(value: string)
   - Button: click{ElementName}Button()
   - Link: click{ElementName}Link()
   - Select: select{ElementName}Dropdown(option: string)
   - Checkbox: toggle{ElementName}Checkbox()
   - Radio: select{ElementName}RadioButton()

5. Business Workflow Methods (composed from atomic actions)
   - Domain-aware method names
   - Combine multiple atomic actions
   - Include business validation
   - Return business-meaningful results

6. State/Getter Methods (getText, isVisible, getAttribute)
   - get{ElementName}Text(): Promise<string>
   - is{ElementName}Visible(): Promise<boolean>
   - verify{ElementName}IsDisplayed(): Promise<boolean>
   - get{ElementName}Attribute(name: string): Promise<string>
```

**No explanatory text, no markdown prose, no TODO comments** — only executable code with JSDoc.

### Naming Convention Rules

#### CRITICAL Naming Convention Rules (enforced from reference files):

| Rule | Wrong | Correct |
|---|---|---|
| Every `_`-separated word in key must be title-cased | `isCompanybrandingimageVisible` | `isCompanyBrandingImageVisible` |
| Input fields prefixed `enter` | `fillUsername` | `enterUsernameInput` |
| Buttons/links prefixed `click` | `loginButton` | `clickLoginButton` |
| Text/label reads prefixed `get...Text` | `readDemoUsername` | `getDemoUsernameTextText` |
| Visibility checks prefixed `verify...IsDisplayed` or `is...Visible` | `checkImage` | `verifyCompanyBrandingImageIsDisplayed` |
| Dropdown/select prefixed `select` | `chooseOption` | `selectDropdownOption` |
| Wait patterns prefixed `waitFor...ToBeVisible` | `waitHiddenField` | `waitForCsrfTokenInputToBeVisible` |
| Checkboxes prefixed `toggle` or `check` | `clickCheckbox` | `toggleAgreeToTermsCheckbox` |
| Radio buttons prefixed `select` | `clickRadio` | `selectPaymentMethodRadio` |
| Forms prefixed `submit` | `clickForm` | `submitLoginForm` |

#### Element Type → Method Prefix Mapping:

| Element Type | Prefix | Example |
|---|---|---|
| input | `enter` | `enterUsernameInput(value)` |
| textarea | `enter` | `enterCommentTextarea(text)` |
| button | `click` | `clickSubmitButton()` |
| link | `click` | `clickLogoutLink()` |
| select | `select` | `selectCountryDropdown(option)` |
| checkbox | `toggle` or `check` | `toggleNewsletterCheckbox()` |
| radio | `select` | `selectPaymentMethodRadio(method)` |
| img | `verify...IsDisplayed` | `verifyLogoImageIsDisplayed()` |
| span, p, label, h1-h6 | `get...Text` | `getWelcomeMessageText()` |
| form | `submit` | `submitContactForm()` |
| Hidden elements | `waitFor...ToBeVisible` | `waitForLoadingSpinnerToBeVisible()` |
| ARIA elements | `getAria...` | `getAriaLabelForSearchButton()` |

### Method Collision Detection

```typescript
// Detect duplicate method names and apply disambiguation
const methodNames = new Set<string>();
const disambiguatedElements = [];

for (const element of yamlElements) {
  let methodName = generateMethodName(element.key, element.element_type);
  
  // Collision detection
  if (methodNames.has(methodName)) {
    methodName = `${methodName}${element.key.split('_').pop()}`; // Add suffix for disambiguation
    console.log(`🔧 Method collision detected - renamed to: ${methodName}`);
  }
  
  methodNames.add(methodName);
  disambiguatedElements.push({ ...element, finalMethodName: methodName });
}
```

### Method Ordering Priority

Methods should be ordered in the generated class:

1. **Navigation** - navigateToPage(), navigateToSection(), etc.
2. **Form Inputs** - enter{Field}Input(), all input methods together
3. **Buttons/Actions** - click{Action}Button(), all action methods
4. **Getters/State** - get{Element}Text(), is{Element}Visible(), all verification methods
5. **Business Workflows** - Complex methods that combine above atomic actions
6. **Private Helpers** - Internal utility methods at the end

```typescript
const orderedElements = disambiguatedElements.sort((a, b) => {
  const priority = { navigation: 1, input: 2, button: 3, getter: 4, workflow: 5, helper: 6 };
  return (priority[a.category] || 7) - (priority[b.category] || 7);
});
```

## Business Workflow Method Patterns

### Basic Workflow Method Structure

```typescript
/**
 * Business workflow: Search for product and add to cart
 * Composed from multiple atomic actions with business validation
 * 
 * @param searchTerm - Product name to search for
 * @param options - Optional business constraints
 * @returns Business outcome with success status
 * @throws {Error} If business rules are violated
 */
async searchAndAddToCart(
  searchTerm: string, 
  options?: { 
    verifyStock?: boolean; 
    maxPrice?: number;
    category?: string;
  }
): Promise<{
  success: boolean; 
  productFound: boolean; 
  addedToCart: boolean;
  price?: number;
}> {
  // 1. Business rule validation
  if (!this.validateSearchTerm(searchTerm)) {
    throw new Error('Invalid search term format');
  }
  
  // 2. Execute atomic actions
  await this.enterSearchBox(searchTerm);
  await this.clickSearchButton();
  
  // 3. Wait for business outcome
  await this.waitForSearchResultsToLoad();
  
  // 4. Verify business state
  const productFound = await this.isProductDisplayed(searchTerm);
  if (!productFound) {
    return { success: false, productFound: false, addedToCart: false };
  }
  
  // 5. Apply business validations
  if (options?.verifyStock) {
    const inStock = await this.verifyProductInStock();
    if (!inStock) {
      throw new Error('Product is out of stock');
    }
  }
  
  if (options?.maxPrice) {
    const price = await this.getProductPrice();
    if (price > options.maxPrice) {
      throw new Error(`Price ${price} exceeds maximum ${options.maxPrice}`);
    }
  }
  
  // 6. Execute final action
  await this.clickAddToCartButton();
  
  // 7. Return business outcome
  const addedToCart = await this.verifyProductAddedToCart();
  const price = await this.getProductPrice();
  
  return { 
    success: addedToCart, 
    productFound: true, 
    addedToCart,
    price 
  };
}
```

### Private Helper Methods for Business Logic

```typescript
/**
 * Business helper: Validate search term format
 * Enforces business rules from Domain Model context
 * @private
 */
private validateSearchTerm(term: string): boolean {
  // Business rules from Domain Model context
  return term && 
         term.trim().length >= 2 && 
         term.length <= 50 && 
         !/[<>"'&]/.test(term); // Prevent XSS
}

/**
 * Business helper: Wait for search results with business timeout
 * @private
 */
private async waitForSearchResultsToLoad(): Promise<void> {
  // Wait for either results or no-results message
  await Promise.race([
    this.waitForElement('search_results_container', { state: 'visible', timeout: 10000 }),
    this.waitForElement('no_results_message', { state: 'visible', timeout: 10000 })
  ]);
}

/**
 * Business helper: Extract numeric price from formatted string
 * @private
 */
private parsePrice(priceText: string): number {
  // Handle different currency formats (₹, $, €, £)
  const numericPrice = priceText.replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(numericPrice);
}
```

## Smart Element Filtering Rules

### Auto-Skip Decorative Elements

Automatically skip generating methods for:

```typescript
const shouldSkipElement = (element: YAMLElement): boolean => {
  // Skip decorative div elements
  if (element.element_type === 'div' && !element.element_desc?.includes('interactive')) {
    return true;
  }
  
  // Skip pure decoration spans
  if (element.element_type === 'span' && element.element_desc?.includes('decoration')) {
    return true;
  }
  
  // Skip SVG icons without interaction
  if (element.element_type === 'svg' && !element.element_desc?.includes('clickable')) {
    return true;
  }
  
  // Skip hidden elements without wait context
  if (element.is_hidden && !element.element_desc?.includes('wait')) {
    return true;
  }
  
  // Skip assertion-only elements (page actions don't have assertions)
  if (element.element_desc?.includes('assert') || element.element_desc?.includes('expect')) {
    return true;
  }
  
  return false;
};
```

### Context-Based Element Analysis

```typescript
const analyzeElementContext = (element: YAMLElement): ElementContext => {
  return {
    isInteractive: ['button', 'input', 'select', 'link', 'checkbox', 'radio'].includes(element.element_type),
    isDecorative: element.element_desc?.includes('decoration') || element.element_type === 'svg',
    isDynamic: element.element_desc?.includes('dynamic') || element.element_desc?.includes('async'),
    requiresWait: element.is_hidden || element.element_desc?.includes('wait'),
    hasBusinessContext: element.element_desc?.includes('business') || element.validation_rules?.length > 0,
    hasAccessibility: element.aria_label || element.attributes?.['aria-label'],
    hasDependencies: element.depends_on?.length > 0
  };
};
```

## JSDoc Standards

### Method Documentation Format

```typescript
/**
 * {One-line summary of what the method does}
 * {Optional: Additional details about business logic or behavior}
 * 
 * @param {paramName} - {Parameter description with business context}
 * @param {paramName} - {Optional parameters with default behavior}
 * @returns {ReturnType} - {What the method returns, business meaning}
 * @throws {ErrorType} - {When and why errors are thrown}
 * 
 * @example
 * ```typescript
 * await homePage.enterSearchBox('laptop');
 * await homePage.clickSearchButton();
 * const results = await homePage.getSearchResultsCount();
 * ```
 */
```

### Class Documentation Format

```typescript
/**
 * Page Actions for {PageName}
 * 
 * This class provides atomic actions and business workflows for the {PageName} page.
 * All methods use YAML-based locators from '{locator_file_name}.yaml' with AI healing support.
 * 
 * Inherits from BasePage:
 * - Automatic locator resolution via LocatorUtility
 * - AI-powered locator healing on failures
 * - Comprehensive logging via StepLogger
 * - Defensive automation patterns (auto-waits, retries)
 * 
 * Generated: {generation_date}
 * Framework: {detected_framework}
 * Language: {detected_language}
 * YAML Source: {yaml_location}
 * 
 * @example
 * ```typescript
 * const homePage = new HomePage(page);
 * await homePage.navigateToPage();
 * await homePage.performSearch('laptop', { maxPrice: 50000 });
 * ```
 */
```

## Error Handling Patterns

### Business Validation Errors

```typescript
// Validate business rules before executing actions
if (!businessRule.validate(input)) {
  throw new Error(`Business rule violation: ${businessRule.message}`);
}

// Provide business-meaningful error messages
if (priceExceedsLimit) {
  throw new Error(`Product price ₹${actualPrice} exceeds budget limit ₹${maxPrice}`);
}

// Don't expose technical details to business users
try {
  await this.lowLevelAction();
} catch (technicalError) {
  throw new Error('Unable to complete checkout - please try again later');
}
```

### Graceful Degradation

```typescript
// Attempt action with fallback
try {
  await this.clickPrimaryButton();
} catch (error) {
  console.warn('Primary action failed, trying alternative...');
  await this.clickAlternativeButton();
}

// Return business outcome even on partial failure
const result = {
  success: false,
  partialSuccess: itemsAdded > 0,
  itemsAdded,
  errors: []
};
```

## Accessibility Support

### ARIA Attribute Handling

```typescript
/**
 * Get ARIA label for accessibility validation
 * Supports screen reader testing and WCAG compliance
 * 
 * @param elementKey - YAML element key
 * @returns ARIA label text or null if not present
 */
async getAriaLabel(elementKey: string): Promise<string | null> {
  return await this.getElementAttribute(elementKey, 'aria-label');
}

/**
 * Verify element has accessible name
 * @param elementKey - YAML element key
 * @param expectedLabel - Expected accessible name
 * @returns true if accessible name matches
 */
async verifyAccessibleName(elementKey: string, expectedLabel: string): Promise<boolean> {
  const ariaLabel = await this.getAriaLabel(elementKey);
  return ariaLabel === expectedLabel;
}
```

## Page Object Generation Quality Checklist

Before considering generation complete, verify:

- [ ] **No assertions** - No expect() calls in page object
- [ ] **Proper inheritance** - Extends correct base class
- [ ] **Correct naming** - Follows element_type → prefix mapping
- [ ] **Method ordering** - Navigation → Inputs → Actions → Getters → Workflows
- [ ] **Collision detection** - No duplicate method names
- [ ] **Business workflows** - Composed from atomic actions
- [ ] **Defensive patterns** - Wait strategies applied correctly
- [ ] **JSDoc complete** - All methods documented
- [ ] **Error handling** - Business-meaningful error messages
- [ ] **Accessibility** - ARIA methods for accessible elements
- [ ] **Smart filtering** - Decorative elements skipped
- [ ] **No hardcoded data** - All data passed as parameters
- [ ] **No test runner imports** - No jest/mocha/pytest imports
- [ ] **Private helpers** - Internal logic properly encapsulated
