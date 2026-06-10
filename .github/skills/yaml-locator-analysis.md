---
name: yaml-locator-analysis
description: Patterns for analyzing YAML locator files to drive intelligent page object method generation, smart filtering, deduplication, and context-aware automation based on element type metadata and locator schema.
---

# YAML Locator Analysis Patterns

## Overview
This skill file defines how to analyze YAML locator files for page object generation. The YAML schema contains rich metadata that drives intelligent method generation, smart filtering, and context-aware automation patterns.

## Enhanced YAML Schema

Real-world YAML locator files follow this comprehensive schema:

```yaml
locators:
  login_button:
    element_type: "button"
    ai_fallback: "disabled"
    element_desc: "Primary login submit button with text 'Login', inside orangehrm-login-form"
    preferred:
      locator: "button[type='submit']"
      type: "css"
      confidence: 0.95
    fallbacks:
      fallback_1:
        locator: ".orangehrm-login-form button"
        type: "css"
        confidence: 0.85
    attributes:
      id: ""
      name: ""
      text: "Login"
      is_hidden: false
      aria_label: "Submit login form"
      data_testid: "login-submit-btn"
    dependencies: ["username_input", "password_input"]
    wait_strategy: "enabled"
    business_context: "authentication"
    validation_rules:
      required_state: "form_valid"
      preconditions: ["credentials_entered"]
```

## Field-by-Field Extraction Rules

### Core Fields

| Field | Usage | Impact on Generation |
|-------|-------|---------------------|
| `element_type` | Primary driver for method type selection | Maps to BasePage method (button → click, input → fill, etc.) |
| `element_desc` | **Critical for smart filtering** | Auto-skip if contains: "divider", "spacer", "decoration", "visual separator", "background", "wrapper div", "layout section", "container wrapper" unless marked as interactive |
| `preferred.locator` | **NEVER pass to BasePage methods** | The YAML key string is passed instead; LocatorUtility handles resolution |
| `fallbacks.*` | **IGNORE entirely** | Fallback resolution handled internally by LocatorUtility—no references in generated code |

### Attribute Fields

| Field | Action | Generated Code |
|-------|--------|----------------|
| `attributes.text` | Non-empty → generate getter | `async get{ElementName}Text(): Promise<string>` using `getElementText()` |
| `attributes.is_hidden` | `true` → visibility wait only | `async waitFor{ElementName}ToBeVisible(): Promise<void>` (no interaction method) |
| `attributes.aria_label` | Present → generate accessibility method | `async get{ElementName}AriaLabel(): Promise<string>` + include in JSDoc |
| `attributes.data_testid` | Present → document in JSDoc | Include as `@testid {value}` comment for test traceability |

### Advanced Fields (Precision Enhancements)

| Field | Purpose | Implementation |
|-------|---------|----------------|
| `dependencies` | Cross-element dependencies | Generate chained waits: `await Promise.all(deps.map(dep => this.waitForElement(dep)))` |
| `wait_strategy` | Context-aware wait override | "enabled" → `{state: 'attached', enabled: true}`<br>"editable" → `{state: 'editable'}`<br>"stable" → `{state: 'visible', stable: true}` |
| `business_context` | Element grouping for workflows | Group elements: "authentication", "checkout", "search" for business method generation |
| `validation_rules` | Parameter/state validation | Generate validation code and precondition checks |
| `ai_fallback` | Informational only | Never reference in generated page actions |

## Smart Filtering Rules

### Auto-Skip Conditions

Skip element if `element_desc` contains any of these keywords:

#### Decorative Elements (Skip)
- "divider", "separator", "spacer"
- "decoration", "ornament", "visual element"
- "background", "backdrop"
- "layout section", "container wrapper", "flex container"
- "purely structural", "non-interactive"

#### Keep Elements (Generate Methods)
- Any text content with semantic meaning
- Interactive elements (buttons,links, inputs)
- Form controls (select, checkbox, radio)
- ARIA-labeled elements
- Elements with `attributes.text` or `attributes.aria_label`

### Exception Rules
- If `element_desc` contains "clickable" or "interactive" → always generate, even if matches skip keywords
- If `attributes.aria_label` is present → always generate (accessibility requirement)
- If `business_context` is set → always generate (business-critical element)

## Key Passing Rules

### ✅ CORRECT — Always Pass YAML Key String

```typescript
// Pass the YAML key — LocatorUtility resolves to selector internally
await this.clickElement('login_button');
await this.fillElement('username_input', value);
await this.waitForElement('search_results', { state: 'visible' });
```

###  ❌ WRONG — Never Pass Raw Selector Strings

```typescript
// NEVER do this — bypasses fallback chain and AI healing
await this.clickElement("button[type='submit']");
await this.fillElement('#input-1', value);
await this.page.locator('.result').click(); // Direct Playwright locator
```

### Rationale
- **LocatorUtility** manages the locator resolution chain:
  1. Primary selector from `preferred.locator`
  2. Fallback selectors from `fallbacks.*`
  3. AI-powered semantic locators (if `ai_fallback: "enabled"`)
  4. Visual locators (screenshot-based matching)
- Passing raw selectors **breaks this chain** and disables resilience features

## Dynamic Locator Support

### When to Generate Dynamic Locators

If `element_desc` mentions any of these patterns:
- "dynamic", "row", "item index", "list item"
- "parameterized", "variable", "by identifier"
- Business entities: "product", "user", "order", "cart item"

### Enhanced Dynamic Locator Pattern

```typescript
/**
 * Click a product item by name, index, or ID with business validation
 * @param identifier - Product identifier (string for name, object for structured selection)
 * @param options - Business validation options
 * @returns Interaction result with business context
 */
async clickProductItem(
  identifier: string | { name?: string; index?: number; id?: string },
  options?: { waitForPrice?: boolean; verifyStock?: boolean }
): Promise<{ found: boolean; clicked: boolean; reason?: string }> {
  
  let locatorStrategy: string;
  
  // Smart parameter handling based on identifier type
  if (typeof identifier === 'string') {
    // Text-based selection with business validation
    locatorStrategy = `[data-qa='product-item']:has-text("${identifier}")`;
    
    // Validate product name format (from Domain Model context)
    if (!this.validateProductName(identifier)) {
      throw new Error(`Invalid product name format: ${identifier}`);
    }
  } else if (identifier.index !== undefined) {
    // Index-based selection with bounds checking
    if (identifier.index < 0) {
      throw new Error('Product index cannot be negative');
    }
    locatorStrategy = `[data-qa='product-item']:nth-child(${identifier.index + 1})`;
  } else if (identifier.id) {
    // ID-based selection
    locatorStrategy = `[data-qa='product-item'][data-product-id="${identifier.id}"]`;
  } else {
    throw new Error('Invalid product identifier: must provide name, index, or id');
  }
  
  // Business context: wait for product list to load
  await this.waitForElement('product_list_container', { state: 'visible' });
  
  // Optional business validations
  if (options?.waitForPrice) {
    await this.waitForProductPriceLoaded(locatorStrategy);
  }
  
  if (options?.verifyStock) {
    const inStock = await this.verifyProductStock(locatorStrategy);
    if (!inStock) {
      return { found: true, clicked: false, reason: 'Out of stock' };
    }
  }
  
  // Attempt interaction with business-aware locator
  const productElement = this.page.locator(locatorStrategy);
  const isVisible = await productElement.isVisible({ timeout: 5000 });
  
  if (!isVisible) {
    return { found: false, clicked: false, reason: 'Element not found' };
  }
  
  await productElement.click();
  
  // Business context: confirm product was selected
  await this.waitForProductSelectionConfirmation();
  
  return { found: true, clicked: true };
}

// Business validation helper
private validateProductName(name: string): boolean {
  // Business rules from Domain Model context
  const validPattern = /^[A-Za-z0-9\s\-_.()]+$/;
  return validPattern.test(name) && name.length > 0 && name.length <= 100;
}
```

## Per-Element Decision Checklist

Run this checklist for **every locator key** before generating methods:

1. **Smart Filtering**
   - Read `element_desc`
   - Check against auto-skip keywords
   - If matches skip criteria → skip element (no method generated)

2. **Collision Detection**
   - Check for duplicate method names from similar keys
   - Example: `submit_btn` vs `submit_button` both → `clickSubmitBtn()`
   - Apply disambiguation: `clickSubmitBtnPrimary()`, `clickSubmitBtnFooter()`

3. **Method Type Mapping**
   - Read `element_type`
   - Look up method prefix from element type mapping (see [Page Object Design Patterns](page-object-design-patterns.md))
   - button → `click`, input → `enter`, select → `select`, etc.

4. **Hidden Element Handling**
   - Read `attributes.is_hidden`
   - If `true` → generate only `waitFor{ElementName}ToBeVisible()`
   - No interaction methods for hidden elements

5. **Context-Aware Wait Strategy**
   - Read `wait_strategy` field
   - Override default wait based on context:
     - "enabled" → `{state: 'attached', enabled: true}`
     - "editable" → `{state: 'editable'}`
     - "stable" → `{state: 'visible', stable: true}`
   - Default (not specified) → `{state: 'visible'}`

6. **Dependency Chain Generation**
   - Read `dependencies` array
   - Generate chained waits before interaction:
     ```typescript
     await Promise.all([
       this.waitForElement('dep1'),
       this.waitForElement('dep2')
     ]);
     ```

7. **Parameter Validation Generation**
   - Read `validation_rules`
   - Generate input validation code
   - Add precondition checks

8. **Text Content Handling**
   - Read `attributes.text`
   - If non-empty → generate `get{ElementName}Text()` method

9. **Accessibility Support**
   - Read `attributes.aria_label`
   - If present → generate `get{ElementName}AriaLabel()` method
   - Include ARIA info in JSDoc

10. **Naming Transformation**
    - Title-case **every `_`-separated word** in the YAML key
    - Apply collision-safe disambiguation if needed
    - Examples:
      - `login_button` → `clickLoginButton()`
      - `user_name_input` → `enterUserNameInput()`
      - `submit_form_btn` → `clickSubmitFormBtn()`

11. **Business Context Grouping**
    - Read `business_context` field
    - Mark for business method composition
    - Group with related elements: "authentication", "checkout", "search"

12. **Documentation Generation**
    - Use `element_desc` for JSDoc description
    - Include `@testid` from `attributes.data_testid`
    - Include `@aria-label` from `attributes.aria_label`
    - Document business context if present

13. **Defensive Pattern Application**
    - Apply context-aware wait before interaction
    - Add parameter validation for user inputs
    - Include error handling with business-meaningful messages

## Special Pattern Handling

### iFrame Context

If `element_desc` mentions "iframe", "embedded frame", or "frame context":

```typescript
async fillIframeField(value: string): Promise<void> {
  // Wait for frame to load
  const frame = this.page.frameLocator('[data-qa="content-frame"]');
  
  // Wait for element within frame
  await frame.locator(await this.locatorUtility.getLocator('iframe_input')).waitFor({ state: 'visible' });
  
  // Interact within frame context
  await frame.locator(await this.locatorUtility.getLocator('iframe_input')).fill(value);
}
```

### Shadow DOM

If `element_desc` mentions "shadow", "web component", or "shadow root":

```typescript
async clickShadowButton(): Promise<void> {
  // Playwright auto-pierces shadow DOM in most cases
  await this.waitForElement('shadow_button', { state: 'visible' });
  
  // If explicit piercing needed:
  const shadowHost = this.page.locator('my-component');
  await shadowHost.waitFor({ state: 'attached' });
  
  // Pierce shadow DOM
  await shadowHost.locator('button.submit').click();
}
```

### Component-Based Architecture

If page contains reusable UI components (e.g., shared header, data table, modal):

```typescript
import { HeaderComponent } from './HeaderComponent';
import { DataTableComponent } from './DataTableComponent';
import { ModalComponent } from './ModalComponent';

export class DashboardPage extends BasePage {
  readonly header: HeaderComponent;
  readonly table: DataTableComponent;
  readonly modal: ModalComponent;

  constructor(page: Page) {
    super(page, 'dashboard_locators');
    
    // Initialize component instances
    this.header = new HeaderComponent(page);
    this.table = new DataTableComponent(page);
    this.modal = new ModalComponent(page);
  }
  
  // Page-specific methods compose component methods
  async performQuickSearch(term: string): Promise<void> {
    await this.header.enterSearchBox(term);
    await this.header.clickSearchButton();
    await this.table.waitForDataLoad();
  }
}
```

## Runtime YAML Validation

### Pre-Generation Validation

Before generating methods, validate YAML keys against LocatorUtility:

```typescript
const locatorUtil = new LocatorUtility('target_locators');

for (const key of yamlKeys) {
  if (!await locatorUtil.hasLocator(key)) {
    console.warn(`⚠️ YAML key '${key}' not found in LocatorUtility - method will fail at runtime`);
  }
}
```

### Post-Generation Validation

After generation, verify:
1. All method calls reference valid YAML keys
2. No hardcoded selector strings in BasePage method calls
3. All `waitForElement()` calls use valid keys
4. Dynamic locators properly escape user input

## Business Method Generation from YAML Context

### Auto-Group Elements by Business Context

```typescript
// Group elements by business_context field
const authElements = yamlElements.filter(e => e.business_context === 'authentication');
const checkoutElements = yamlElements.filter(e => e.business_context === 'checkout');
const searchElements = yamlElements.filter(e => e.business_context === 'search');
```

### Generate Composed Business Methods

```typescript
// Auto-generate business workflow from grouped elements
async performAuthentication(username: string, password: string): Promise<void> {
  // Composed from elements with business_context: 'authentication'
  await this.enterUsernameInput(username);
  await this.enterPasswordInput(password);
  await this.clickLoginButton();
  await this.waitForDashboardToLoad();
}

async completeCheckout(paymentInfo: PaymentDetails): Promise<OrderResult> {
  // Composed from elements with business_context: 'checkout'
  await this.enterCardNumberInput(paymentInfo.cardNumber);
  await this.enterExpiryDateInput(paymentInfo.expiryDate);
  await this.enterCvvInput(paymentInfo.cvv);
  await this.clickPlaceOrderButton();
  
  return await this.getOrderConfirmation();
}
```

## YAML Analysis Best Practices

### DO
✅ Always read the full YAML schema for each element
✅ Apply smart filtering to skip decorative elements
✅ Pass YAML key strings to BasePage methods
✅ Generate context-aware wait strategies
✅ Handle dependencies with chained waits
✅ Create accessibility methods for ARIA attributes
✅ Group elements by business_context for workflow methods
✅ Apply parameter validation from validation_rules
✅ Document test identifiers in JSDoc

### DON'T
❌ Pass raw selector strings from `preferred.locator`
❌ Reference `fallbacks.*` in generated code
❌ Generate methods for decorative elements
❌ Use hardcoded waits (page.waitForTimeout)
❌ Create duplicate method names
❌ Skip dependency checking
❌ Ignore accessibility attributes
❌ Generate methods for hidden elements (except visibility waits)
