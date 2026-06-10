---
name: web-defensive-automation
description: Defensive automation principles ensuring test resilience through element-state-based wait strategies, iframe/shadow DOM handling, and context-aware interaction patterns for timing issues and dynamic content.
---

# Web Defensive Automation Patterns

## Core Defensive Automation Principles

Defensive automation ensures tests are resilient to timing issues, dynamic content, and UI variability. Apply these patterns automatically based on element context.

## Defensive Automation Rules by Element Type

### Basic Wait Rules

Apply these defensive patterns automatically based on element context:

- **Before clicking a button**: ensure it is visible and enabled — use `waitFor Element(key, {state:'enabled'})`
- **Before filling an input**: wait for it to be enabled — add `waitForElement` before `fillElement`
- **After navigation**: wait for a landmark element to confirm page load
- **For elements with `is_hidden: true`**: generate `waitFor...ToBeVisible()` only — no interaction method
- **For async-loaded content** (described in `element_desc` as "loaded", "dynamic", "async"): prepend a wait before interaction
- **Never use hardcoded `page.waitForTimeout()`** — always wait for a specific element state

### State-Specific Wait Strategies

| Element State | Wait Strategy | When to Use |
|---|---|---|
| `visible` | `waitForElement(key, {state: 'visible'})` | Before reading text, verifying display |
| `hidden` | `waitForElement(key, {state: 'hidden'})` | After closing modals, toasts |
| `attached` | `waitForElement(key, {state: 'attached'})` | For dynamically added elements |
| `detached` | `waitForElement(key, {state: 'detached'})` | For removed elements |
| `enabled` | `waitForElement(key, {state: 'enabled'})` | Before clicking buttons, submitting forms |
| `disabled` | `waitForElement(key, {state: 'disabled'})` | After form submission, loading states |
| `editable` | `waitForElement(key, {state: 'editable'})` | Before filling inputs, textareas |
| `readonly` | `waitForElement(key, {state: 'readonly'})` | For read-only fields |
| `stable` | `waitForElement(key, {state: 'stable'})` | Before interacting with animated elements |

### Enhanced Element Type → Wait Strategy Mapping

| YAML `element_type` | Condition | Default Wait Strategy | Enhanced Wait | Parameter Validation |
|---|---|---|---|---|
| `input` | not hidden | `editable` | `waitForElement(key, {state: 'editable'})` + dependency waits | Validate non-empty string, trim whitespace |
| `textarea` | not hidden | `editable` | `waitForElement(key, {state: 'editable'})` + auto-grow wait | Validate max length |
| `button` | not hidden | `enabled` | `waitForElement(key, {state: 'enabled'})` + precondition checks | Validate preconditions from validation_rules |
| `link` | not hidden | `visible` | `waitForElement(key, {state: 'visible'})` + stability check | Validate href exists if navigation expected |
| `select` | — | `visible` | `waitForElement(key, {state: 'visible'})` + options loaded check | Validate option exists in dropdown |
| `checkbox` | — | `enabled` | `waitForElement(key, {state: 'enabled'})` | Validate boolean toggle expected |
| `radio` | — | `enabled` | `waitForElement(key, {state: 'enabled'})` | Validate single selection |
| `form` | — | `attached` | `waitForElement(key)` + form validation complete | Validate form state before submit |
| `img` | — | `visible` | `waitForElement(key, {state: 'visible'})` | none |
| `span`, `p`, `label`, `h1`–`h6` | has text | `visible` | `waitForElement(key, {state: 'visible'})` if dynamic | none |
| `div` | interactive | `enabled` | `waitForElement(key, {state: 'enabled'})` + interaction ready | Validate clickable state |
| `div` | decorative | **SKIP** | — | — |
| any | `is_hidden: true` | `visible` (wait only) | `waitForElement({state:'visible'})` | none |
| any | `aria_label` present | `attached` | `waitForElement(key)` | Validate accessibility |
| any | iframe context | `attached` | frame loaded wait | Validate frame accessibility |
| any | shadow DOM | `attached` | shadow root attached | Validate shadow DOM piercing |
| any | dependencies present | `visible` | `Promise.all(deps.map(waitForElement))` | Validate all dependencies met |

## Dependency-Based Waits

### Cross-Element Dependencies

When an element depends on other elements (from `depends_on` in YAML):

```typescript
/**
 * Click submit button with dependency validation
 * Waits for all dependencies before proceeding
 */
async clickSubmitButton(): Promise<void> {
  // Wait for all dependencies first
  await Promise.all([
    this.waitForElement('username_input', { state: 'visible' }),
    this.waitForElement('password_input', { state: 'visible' }),
    this.waitForElement('agree_checkbox', { state: 'enabled' })
  ]);
  
  // Wait for the button itself
  await this.waitForElement('submit_button', { state: 'enabled' });
  
  // Perform action
  await this.clickElement('submit_button');
}
```

### Conditional Dependencies

```typescript
/**
 * Click checkout button with optional coupon dependency
 * Only waits for coupon field if coupon code is provided
 */
async clickCheckoutButton(applyCoupon: boolean = false): Promise<void> {
  if (applyCoupon) {
    await this.waitForElement('coupon_input', { state: 'visible' });
  }
  
  await this.waitForElement('checkout_button', { state: 'enabled' });
  await this.clickElement('checkout_button');
}
```

## Dynamic Content Patterns

### Async-Loaded Content

For elements marked as async or dynamic in `element_desc`:

```typescript
/**
 * Wait for dynamically loaded product list
 * Handles async content loading with timeout
 */
async waitForProductListToLoad(): Promise<void> {
  // Wait for loading spinner to disappear
  await this.waitForElement('loading_spinner', { state: 'hidden', timeout: 10000 });
  
  // Wait for content to appear
  await this.waitForElement('product_list', { state: 'visible', timeout: 15000 });
  
  // Ensure at least one product is loaded
  await this.waitForElement('product_item', { state: 'visible', timeout: 5000 });
}
```

### Lazy-Loaded Elements

```typescript
/**
 * Scroll to element and wait for lazy loading
 * Used for images, videos, and other lazy-loaded content
 */
async scrollToLazyElement(elementKey: string): Promise<void> {
  // Scroll element into view
  await this.page.locator(this.getSelector(elementKey)).scrollIntoViewIfNeeded();
  
  // Wait for element to load
  await this.waitForElement(elementKey, { state: 'visible', timeout: 10000 });
  
  // Additional wait for images to load
  if (await this.isImageElement(elementKey)) {
    await this.waitForImageLoad(elementKey);
  }
}
```

## Animation & Transition Handling

### Wait for Animations to Complete

```typescript
/**
 * Click element after ensuring animations are complete
 * Prevents clicking during transitions
 */
async clickAfterAnimation(elementKey: string): Promise<void> {
  // Wait for element to be visible
  await this.waitForElement(elementKey, { state: 'visible' });
  
  // Wait for stable state (no animations)
  await this.waitForElement(elementKey, { state: 'stable', timeout: 5000 });
  
  // Perform click
  await this.clickElement(elementKey);
}
```

### Modal/Dialog Handling

```typescript
/**
 * Wait for modal to open and be interactive
 * Handles modal animations and backdrop
 */
async waitForModalOpen(modalKey: string): Promise<void> {
  // Wait for modal to appear
  await this.waitForElement(modalKey, { state: 'visible', timeout: 5000 });
  
  // Wait for modal backdrop animation
  await this.page.waitForTimeout(300); // Min animation time
  
  // Wait for modal to be stable
  await this.waitForElement(modalKey, { state: 'stable', timeout: 2000 });
}

/**
 * Close modal and wait for complete dismissal
 */
async closeModal(modalKey: string, closeButtonKey: string): Promise<void> {
  await this.clickElement(closeButtonKey);
  
  // Wait for modal to be hidden
  await this.waitForElement(modalKey, { state: 'hidden', timeout: 5000 });
  
  // Ensure backdrop is also removed
  await this.page.waitForSelector('.modal-backdrop', { state: 'detached', timeout: 3000 }).catch(() => {});
}
```

## Form Interaction Patterns

### Form Field Validation

```typescript
/**
 * Fill input with validation and wait for feedback
 * Handles real-time validation feedback
 */
async enterInputWithValidation(
  inputKey: string, 
  value: string, 
  validationKey?: string
): Promise<void> {
  // Wait for input to be editable
  await this.waitForElement(inputKey, { state: 'editable' });
  
  // Fill the input
  await this.fillElement(inputKey, value);
  
  // Trigger blur to activate validation
  await this.page.locator(this.getSelector(inputKey)).blur();
  
  // Wait for validation feedback if provided
  if (validationKey) {
    await this.waitForElement(validationKey, { state: 'visible', timeout: 3000 });
  }
}
```

### Form Submission

```typescript
/**
 * Submit form with comprehensive validation
 * Ensures form is valid before submission
 */
async submitFormWithValidation(
  formKey: string, 
  submitButtonKey: string
): Promise<void> {
  // Wait for form to be ready
  await this.waitForElement(formKey, { state: 'attached' });
  
  // Verify no validation errors present
  const hasErrors = await this.hasValidationErrors();
  if (hasErrors) {
    throw new Error('Form has validation errors - cannot submit');
  }
  
  // Wait for submit button to be enabled
  await this.waitForElement(submitButtonKey, { state: 'enabled' });
  
  // Click submit
  await this.clickElement(submitButtonKey);
  
  // Wait for form to be detached (successful submission)
  await this.waitForElement(formKey, { state: 'detached', timeout: 10000 }).catch(() => {
    // Form might not detach if submission failed
    console.warn('Form did not detach after submission - may indicate error');
  });
}
```

## Navigation Patterns

### Wait for Page Load

```typescript
/**
 * Navigate to page and wait for key elements
 * Ensures page is fully loaded before proceeding
 */
async navigateToPageAndWait(url: string, landmarkKey: string): Promise<void> {
  // Navigate to URL
  await this.navigateTo(url);
  
  // Wait for network idle
  await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  
  // Wait for landmark element
  await this.waitForElement(landmarkKey, { state: 'visible', timeout: 10000 });
  
  // Additional wait for dynamic content
  await this.waitForDynamicContentLoad();
}
```

### Single Page Application (SPA) Navigation

```typescript
/**
 * Navigate in SPA by clicking link and waiting for URL change
 * Handles client-side routing
 */
async navigateInSPA(linkKey: string, expectedUrlPattern: RegExp): Promise<void> {
  const initialUrl = this.page.url();
  
  // Click navigation link
  await this.clickElement(linkKey);
  
  // Wait for URL to change
  await this.page.waitForURL(expectedUrlPattern, { timeout: 10000 });
  
  // Wait for navigation to complete
  await this.page.waitForLoadState('domcontentloaded');
  
  // Verify URL actually changed
  const newUrl = this.page.url();
  if (initialUrl === newUrl) {
    throw new Error('SPA navigation failed - URL did not change');
  }
}
```

## Retry & Error Recovery Patterns

### Retry with Exponential Backoff

```typescript
/**
 * Retry action with exponential backoff
 * Used for flaky elements or network-dependent actions
 */
async retryWithBackoff<T>(
  action: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await action();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await this.page.waitForTimeout(delay);
    }
  }
  
  throw new Error('Retry limit exceeded');
}
```

### Graceful Fallback

```typescript
/**
 * Click element with fallback strategy
 * Tries primary selector, then fallback selectors
 */
async clickWithFallback(
  primaryKey: string, 
  fallbackKeys: string[]
): Promise<void> {
  try {
    await this.waitForElement(primaryKey, { state: 'visible', timeout: 5000 });
    await this.clickElement(primaryKey);
    return;
  } catch (primaryError) {
    console.warn(`Primary selector failed: ${primaryKey}`);
    
    for (const fallbackKey of fallbackKeys) {
      try {
        await this.waitForElement(fallbackKey, { state: 'visible', timeout: 3000 });
        await this.clickElement(fallbackKey);
        console.log(`Fallback selector succeeded: ${fallbackKey}`);
        return;
      } catch (fallbackError) {
        console.warn(`Fallback selector failed: ${fallbackKey}`);
      }
    }
    
    throw new Error(`All selectors failed: primary=${primaryKey}, fallbacks=${fallbackKeys.join(', ')}`);
  }
}
```

## Iframe & Shadow DOM Patterns

### Iframe Interaction

```typescript
/**
 * Interact with element inside iframe
 * Ensures iframe is loaded and accessible
 */
async interactWithIframe(
  iframeKey: string, 
  elementKey: string, 
  action: 'click' | 'fill',
  value?: string
): Promise<void> {
  // Wait for iframe to be attached
  await this.waitForElement(iframeKey, { state: 'attached', timeout: 10000 });
  
  // Get frame locator
  const frame = this.page.frameLocator(this.getSelector(iframeKey));
  
  // Wait for element inside iframe
  const element = frame.locator(this.getSelector(elementKey));
  await element.waitFor({ state: 'visible', timeout: 5000 });
  
  // Perform action
  if (action === 'click') {
    await element.click();
  } else if (action === 'fill' && value) {
    await element.fill(value);
  }
}
```

### Shadow DOM Interaction

```typescript
/**
 * Interact with element inside shadow DOM
 * Pierces shadow boundaries
 */
async interactWithShadowDOM(
  hostKey: string, 
  shadowElementKey: string,
  action: 'click' | 'fill',
  value?: string
): Promise<void> {
  // Wait for shadow host to be attached
  await this.waitForElement(hostKey, { state: 'attached', timeout: 5000 });
  
  // Get shadow root element
  const shadowElement = this.page.locator(
    `${this.getSelector(hostKey)} >> ${this.getSelector(shadowElementKey)}`
  );
  
  // Wait for element inside shadow DOM
  await shadowElement.waitFor({ state: 'visible', timeout: 5000 });
  
  // Perform action
  if (action === 'click') {
    await shadowElement.click();
  } else if (action === 'fill' && value) {
    await shadowElement.fill(value);
  }
}
```

## Network & API Wait Patterns

### Wait for API Response

```typescript
/**
 * Perform action and wait for specific API response
 * Useful for actions that trigger API calls
 */
async performActionAndWaitForAPI(
  actionKey: string,
  apiEndpoint: string,
  expectedStatus: number = 200
): Promise<void> {
  // Setup network listener
  const responsePromise = this.page.waitForResponse(
    response => response.url().includes(apiEndpoint) && response.status() === expectedStatus,
    { timeout: 15000 }
  );
  
  // Perform action
  await this.clickElement(actionKey);
  
  // Wait for API response
  await responsePromise;
  
  // Additional wait for UI to update
  await this.page.waitForLoadState('networkidle', { timeout: 5000 });
}
```

### Wait for Network Idle

```typescript
/**
 * Wait for all network activity to complete
 * Useful after page loads or AJAX operations
 */
async waitForNetworkIdle(): Promise<void> {
  await this.page.waitForLoadState('networkidle', { timeout: 30000 });
}
```

## Performance & Stability Patterns

### Debounced Interactions

```typescript
/**
 * Fill input with debounce to avoid excessive API calls
 * Useful for search inputs with autocomplete
 */
async fillInputWithDebounce(
  inputKey: string, 
  value: string,
  debounceMs: number = 500
): Promise<void> {
  await this.waitForElement(inputKey, { state: 'editable' });
  
  // Fill input
  await this.fillElement(inputKey, value);
  
  // Wait for debounce period
  await this.page.waitForTimeout(debounceMs);
  
  // Wait for any triggered actions to complete
  await this.waitForNetworkIdle();
}
```

### Viewport & Scrolling

```typescript
/**
 * Scroll element into view before interaction
 * Ensures element is visible and clickable
 */
async scrollIntoView(elementKey: string): Promise<void> {
  const element = this.page.locator(this.getSelector(elementKey));
  
  // Scroll into view if needed
  await element.scrollIntoViewIfNeeded();
  
  // Wait for scroll animation to complete
  await this.page.waitForTimeout(300);
  
  // Verify element is in viewport
  const isVisible = await element.isVisible();
  if (!isVisible) {
    throw new Error(`Element ${elementKey} not visible after scrolling`);
  }
}
```

## Parameter Validation

### Business Rule Validation

```typescript
/**
 * Validate input before filling based on business rules
 */
private validateInput(value: string, validationRules?: any[]): void {
  if (!value || value.trim().length === 0) {
    throw new Error('Input value cannot be empty');
  }
  
  if (validationRules) {
    for (const rule of validationRules) {
      if (rule.type === 'minLength' && value.length < rule.value) {
        throw new Error(`Input must be at least ${rule.value} characters`);
      }
      if (rule.type === 'maxLength' && value.length > rule.value) {
        throw new Error(`Input must be at most ${rule.value} characters`);
      }
      if (rule.type === 'pattern' && !new RegExp(rule.value).test(value)) {
        throw new Error(`Input does not match required pattern`);
      }
    }
  }
}
```

## Defensive Pattern Application Checklist

When generating page actions, ensure:

- [ ] **Wait before click** - All button/link clicks preceded by enabled/visible wait
- [ ] **Wait before fill** - All input fills preceded by editable wait
- [ ] **Wait after navigation** - Landmark element wait after URL navigation
- [ ] **Dependency waits** - Cross-element dependencies resolved before action
- [ ] **Animation stability** - Stable state wait for animated elements
- [ ] **Form validation** - Real-time validation feedback handling
- [ ] **Modal handling** - Proper open/close waits with animation consideration
- [ ] **Network waits** - API response waits for network-dependent actions
- [ ] **Retry logic** - Exponential backoff for flaky elements
- [ ] **Fallback selectors** - Alternative selectors for resilience
- [ ] **Iframe handling** - Frame attachment and accessibility validation
- [ ] **Shadow DOM** - Shadow root piercing for web components
- [ ] **Scroll handling** - Viewport visibility ensured before interaction
- [ ] **Parameter validation** - Business rules validated before actions
- [ ] **Dynamic content** - Async/lazy-loaded content handling
- [ ] **No hardcoded timeouts** - All waits element-state based
