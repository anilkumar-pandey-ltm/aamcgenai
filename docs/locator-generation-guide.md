# Page Objects Generation Guide

## 🤖 Agent Information

**Agent Mode**: `page-objects-generator`

**Agent File**: `.github/agents/page-objects-generator.agent.md`

**Activation**: Use `@page-objects-generator` prefix

### How to Activate This Agent

**Single Command - Complete Pipeline:**
```
@page-objects-generator Generate locators for https://your-url.com
```

The agent automatically executes all 7 phases:
- Phase 0: Clean workspace
- Phase 1: Fetch page source (supports manual login)
- Phase 2: Clean HTML (removes SVG, scripts, decorative elements)
- Phase 3: Intelligent chunking (if needed)
- Phase 4: Generate locators with fallbacks
- Phase 5: Smart merge with existing files
- Phase 6: YAML repair and validation
- Phase 7: Cleanup temporary files

## Overview
This guide explains how to generate YAML locator files from web applications using GitHub Copilot with the FusionIQ Framework. The page-objects-generator provides a complete end-to-end pipeline that captures UI elements and creates structured locator definitions with fallback strategies.

**✨ Built-in Manual Login Support**  
Generate locators for pages requiring authentication! The agent automatically detects when login is needed and guides you through the manual login workflow. See [Authenticated Pages](#generating-locators-for-authenticated-pages) section for details.

## Prerequisites
- Python 3.13+ installed
- Chrome DevTools MCP server configured
- GitHub Copilot enabled in VS Code
- Page Objects Generator chatmode active
- Target web application URL accessible

## Page Type Support

| Page Type | Support | Action Required |
|-----------|---------|-----------------|
| 🌐 Public Pages | ✅ Full | None - automatic |
| 🔐 Authenticated Pages | ✅ Full | Manual login required |
| 📱 SPAs (React/Angular/Vue) | ✅ Full | Wait for dynamic content |
| 🔄 AJAX/Dynamic Content | ✅ Full | Auto-detected |
| 🔑 SSO/SAML/OAuth | ✅ Full | Manual auth flow |
| 🔢 2FA/MFA | ✅ Full | Complete 2FA manually |

## Quick Start

### Step 1: Open the Target Web Page

Use Copilot to navigate to your target application:

```
Navigate to https://your-app-url.com
```

Or if you have a specific page:

```
Open https://your-app-url.com/login in browser
```

### Step 2: Trigger Page Objects Generation

Use this command format in Copilot chat:

```
Generate locators for the current page
Output file: page-object/login_locators.yaml
```

Or with more specific parameters:

```
Extract locators from current page and save to:
- Filename: homepage_locators
- Output directory: page-object/
- Include: buttons, inputs, links, navigation elements
```

### Step 3: Review Generated YAML

Copilot will automatically:
1. ✅ **Capture DOM snapshot** - Extract page structure
2. ✅ **Identify UI elements** - Find interactive elements
3. ✅ **Generate locators** - Create CSS/XPath selectors with fallbacks
4. ✅ **Structure YAML** - Format with element descriptions and attributes
5. ✅ **Save file** - Create YAML in page-object directory
6. ✅ **Validate** - Check for duplicate keys and syntax errors

## What Copilot Does Behind the Scenes

### Phase 1: DOM Capture
1. Takes snapshot of current page using Chrome DevTools
2. Extracts HTML structure and accessibility tree
3. Identifies interactive elements (buttons, inputs, links, etc.)

### Phase 2: Element Analysis
1. Analyzes each element's attributes (id, class, name, type)
2. Determines element purpose and description
3. Identifies parent-child relationships
4. Captures element state (visible, hidden, disabled)

### Phase 3: Locator Strategy Generation
For each element, generates multiple locator strategies:

**Preferred Locator** (Highest confidence):
- ID-based selectors
- Unique data attributes
- Semantic role-based selectors

**Fallback Locators** (Medium to low confidence):
- Class-based CSS selectors
- XPath with text matching
- Position-based selectors
- Complex CSS combinations

### Phase 4: YAML Structuring
Creates structured YAML with:
- Element keys (snake_case)
- Element type classification
- Human-readable descriptions
- Preferred and fallback locators
- Confidence scores
- Element attributes

## Generated YAML Structure

### Example Output

```yaml
locators:
  login_button:
    element_type: "button"
    ai_fallback: "disabled"
    element_desc: "Primary login button in the authentication form, blue background with white text 'Sign In'"
    preferred:
      locator: "button#login-btn"
      type: "css"
      confidence: 0.95
    fallbacks:
      fallback_1:
        locator: "//button[text()='Sign In']"
        type: "xpath"
        confidence: 0.90
      fallback_2:
        locator: "form.login-form button[type='submit']"
        type: "css"
        confidence: 0.85
      fallback_3:
        locator: "//form[@class='login-form']//button[contains(@class, 'btn-primary')]"
        type: "xpath"
        confidence: 0.75
    attributes:
      id: "login-btn"
      name: "submit"
      text: "Sign In"
      is_hidden: false

  username_input:
    element_type: "input"
    ai_fallback: "disabled"
    element_desc: "Username input field with placeholder 'Enter your email'"
    preferred:
      locator: "input#username"
      type: "css"
      confidence: 0.95
    fallbacks:
      fallback_1:
        locator: "//input[@id='username']"
        type: "xpath"
        confidence: 0.90
      fallback_2:
        locator: "input[name='username']"
        type: "css"
        confidence: 0.85
      fallback_3:
        locator: "//input[@placeholder='Enter your email']"
        type: "xpath"
        confidence: 0.80
    attributes:
      id: "username"
      name: "username"
      text: ""
      is_hidden: false

  password_input:
    element_type: "input"
    ai_fallback: "disabled"
    element_desc: "Password input field with type='password'"
    preferred:
      locator: "input#password"
      type: "css"
      confidence: 0.95
    fallbacks:
      fallback_1:
        locator: "//input[@type='password']"
        type: "xpath"
        confidence: 0.90
      fallback_2:
        locator: "input[name='password']"
        type: "css"
        confidence: 0.85
    attributes:
      id: "password"
      name: "password"
      text: ""
      is_hidden: false

  error_message:
    element_type: "div"
    ai_fallback: "enabled"
    element_desc: "Error message container displayed when login fails"
    preferred:
      locator: "div.error-message"
      type: "css"
      confidence: 0.85
    fallbacks:
      fallback_1:
        locator: "//div[@class='error-message']"
        type: "xpath"
        confidence: 0.80
      fallback_2:
        locator: "//div[contains(@class, 'error')]"
        type: "xpath"
        confidence: 0.70
    attributes:
      id: ""
      name: ""
      text: ""
      is_hidden: true
```

## Page Objects Generation Strategies

### 1. ID-Based Locators (Highest Priority)
Most reliable and performant:
```yaml
preferred:
  locator: "button#submit-btn"
  type: "css"
  confidence: 0.95
```

### 2. Attribute-Based Locators
Stable and maintainable:
```yaml
preferred:
  locator: "button[data-testid='submit']"
  type: "css"
  confidence: 0.90
```

### 3. Text-Based Locators
Useful for dynamic IDs:
```yaml
fallback_1:
  locator: "//button[text()='Submit']"
  type: "xpath"
  confidence: 0.85
```

### 4. Class-Based Locators
Less stable but common:
```yaml
fallback_2:
  locator: "button.btn-primary"
  type: "css"
  confidence: 0.75
```

### 5. Position-Based Locators (Last Resort)
Fragile but necessary:
```yaml
fallback_3:
  locator: "form > div:nth-child(3) > button"
  type: "css"
  confidence: 0.60
```

## Advanced Usage

### Generating Locators for Authenticated Pages

**🔐 Use Case**: Pages requiring login (dashboards, admin panels, user profiles)

The page objects generator supports **manual login workflow** for authenticated pages. When you need to generate locators for pages behind authentication:

**Step 1: Use Manual Login Mode**

```python
python -c "from src.services.locator_extractor import get_page_source; get_page_source('https://your-app.com/#/dashboard', 'Output/yamlGeneration/Temp_DOM/original_page_source.html', wait_for_manual_login=True)"
```

**Step 2: Follow the Interactive Workflow**

```
============================================================
⏸️  MANUAL LOGIN REQUIRED
============================================================
📍 Target URL: https://your-app.com/#/dashboard

📋 INSTRUCTIONS:
   1. Browser is now open - please log in manually
   2. After login, navigate to: https://your-app.com/#/dashboard
   3. Wait for the page to fully load
   4. Press Enter in this terminal when ready to capture page source
============================================================

🌐 Opening: https://your-app.com

⏸️  Press Enter after you've logged in and navigated to the target page...
```

**Step 3: Complete Login and Navigation in Browser**
- Browser opens automatically (visible window, not headless)
- Login page loads (or redirects to login)
- **You manually enter credentials and log in**
- **You manually navigate to the target page through UI:**
  - Can navigate via menus, buttons, links, tabs
  - Can go through multiple intermediate pages
  - Can use search, filters, or any UI interaction
  - Example: Dashboard → Menu → Submenu → Target Page
- Wait for final page to fully load (all AJAX requests complete)
- **Return to terminal and press Enter**

**Step 4: Page Source Captured**
```
✅ Continuing with page source extraction...
📍 Current URL: https://your-app.com/#/dashboard
📥 Fetching page source...
✅ Page source fetched: 245,892 characters
💾 HTML saved successfully to: Output/yamlGeneration/Temp_DOM/original_page_source.html
🔒 WebDriver closed
```

**Complete Example for Unqork Underwriter Workbench:**

```bash
# Agent prompt
@page-objects-generator Generate locators for authenticated page:
URL: https://ltimindtree-uatx.unqork.io/#/display/underwriter-workbench
Output: Brokerpage.yaml
Authentication: Required

# Agent executes Phase 1 with manual login
python -c "from src.services.locator_extractor import get_page_source; get_page_source('https://ltimindtree-uatx.unqork.io/#/display/underwriter-workbench', 'Output/yamlGeneration/Temp_DOM/original_page_source.html', wait_for_manual_login=True)"

# You perform manual login in browser
# Browser opens → Login manually → Navigate to underwriter-workbench → Press Enter

# Agent continues with Phases 2-7 (cleanup, chunking, YAML generation)
```

**💡 Multi-Step Navigation Support:**

The manual login mode supports **any navigation complexity**:

```
🔐 Login → 📊 Dashboard → 📋 Menu → 🔧 Settings → 🎯 Target Page
   ↑           ↑              ↑          ↑            ↑
  Login    Wait/Load    Click Menu   Navigate    Press Enter
```

**Real-World Examples:**

1. **Simple Direct Access:**
   ```
   Login → Dashboard (target) → Press Enter
   ```

2. **Menu Navigation:**
   ```
   Login → Dashboard → Click "Underwriting" → Workbench (target) → Press Enter
   ```

3. **Deep Navigation:**
   ```
   Login → Home → Settings → User Management → Advanced → 
   Permissions → Role Management (target) → Press Enter
   ```

4. **Dynamic Routes (Search/Filter):**
   ```
   Login → Dashboard → Search "Order #12345" → Order Details (target) → Press Enter
   ```

**Navigation Modes:**

| Mode | Parameter | Best For | Capture Behavior |
|------|-----------|----------|------------------|
| 🎯 **Flexible** (Default) | `validate_url=False` | UI-driven navigation, complex flows | Captures ANY page when you press Enter |
| 🔒 **Strict** | `validate_url=True` | Direct URL access, simple navigation | Validates URL matches before capture |

**Flexible Mode Example (Recommended for Multi-Step):**
```python
# Flexible - navigate anywhere via UI clicks
get_page_source(
    'https://app.example.com/#/target-page',
    wait_for_manual_login=True,
    validate_url=False  # Default - captures wherever you navigate
)
```

**Strict Mode Example (URL Validation):**
```python
# Strict - must be on exact URL
get_page_source(
    'https://app.example.com/#/target-page',
    wait_for_manual_login=True,
    validate_url=True  # Validates URL before capture
)
```

**Benefits:**
- ✅ No hardcoded credentials in code
- ✅ Works with any authentication system (SAML, OAuth, 2FA)
- ✅ Supports MFA/2FA workflows
- ✅ Session tokens handled automatically
- ✅ Captures actual post-login page content
- ✅ **Supports multi-step navigation** (any number of intermediate pages)
- ✅ **UI-driven navigation** (clicks, menus, search, filters)
- ✅ **Handles dynamic routes** (generated URLs, query parameters)

**When to Use Manual Login:**
- Pages requiring user authentication
- Admin panels and dashboards
- User profile pages
- Protected routes
- Pages with complex authentication flows (SSO, SAML, 2FA)

**When NOT to Use Manual Login:**
- Public pages (login page itself, marketing pages, documentation)
- Pages accessible without credentials

### Filtering Specific Element Types

```
Generate locators for:
- All buttons on the page
- All input fields
- Navigation menu items only
Save to: page-object/homepage_nav_locators.yaml
```

### Page-Specific Regions

```
Generate locators for the header section only
Save to: page-object/header_locators.yaml
```

### Exclude Hidden Elements

```
Generate locators excluding:
- Hidden elements
- Display: none elements
- Visibility: hidden elements
Save to: page-object/visible_elements_locators.yaml
```

### Update Existing YAML

```
Update page-object/login_locators.yaml with new elements from current page
Merge strategy: Add new elements, preserve existing
```

## Best Practices

### 1. Naming Conventions
- Use **snake_case** for locator keys: `login_button`, `user_profile_link`
- Be descriptive: `primary_cta_button` instead of `btn1`
- Include context: `header_search_input` instead of just `search_input`
- Avoid abbreviations unless widely understood

### 2. Element Descriptions
Write clear, detailed descriptions:
```yaml
element_desc: "Primary login button in the authentication form, positioned below password field, blue background with white text 'Sign In'"
```

Not:
```yaml
element_desc: "Login button"
```

### 3. Locator Strategy Priority
1. **ID selectors** - Most stable (if IDs are semantic)
2. **Data attributes** - Test-friendly (`data-testid`, `data-test`)
3. **Semantic selectors** - Meaningful class names
4. **Text content** - For dynamic IDs
5. **Position-based** - Only as last resort

### 4. Confidence Scores
- **0.90-1.00**: Highly stable (ID, unique data attributes)
- **0.80-0.89**: Stable (semantic classes, aria labels)
- **0.70-0.79**: Moderately stable (combined selectors)
- **0.60-0.69**: Potentially fragile (position-based)
- **Below 0.60**: High maintenance risk

### 5. AI Fallback Configuration
```yaml
ai_fallback: "enabled"   # For dynamic/complex elements
ai_fallback: "disabled"  # For stable elements with good locators
```

Enable AI fallback for:
- Dynamic content
- Elements with frequently changing classes
- Complex nested structures
- Elements without stable identifiers

## Integration with Framework

### Using Locators in Page Objects

After generating locators, use them in page objects:

```typescript
// The page object automatically loads the YAML
import { BasePage } from '../framework/core/basePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page, 'login_locators'); // References login_locators.yaml
  }

  async clickLoginButton(): Promise<void> {
    // Uses locator key from YAML with automatic fallback
    await this.clickElement('login_button');
  }

  async enterUsername(username: string): Promise<void> {
    await this.fillElement('username_input', username);
  }
}
```

The framework's `LocatorUtility` automatically:
1. Tries the preferred locator first
2. Falls back to fallback_1, fallback_2, etc. if preferred fails
3. Uses AI locator if all fallbacks fail and `ai_fallback: "enabled"`
4. Logs which locator strategy succeeded

## Troubleshooting

### Issue: "No elements found on page"
**Solution:** 
- Ensure page is fully loaded before generating locators
- Check if page requires authentication
- Verify Chrome DevTools connection is active

### Issue: "Duplicate locator keys"
**Solution:**
- Review generated YAML for naming conflicts
- Make locator keys more specific (add context)
- Copilot should auto-resolve by appending suffixes

### Issue: "Locators are too fragile"
**Solution:**
- Work with developers to add `data-testid` attributes
- Use semantic HTML and ARIA labels
- Avoid position-based selectors when possible

### Issue: "YAML syntax errors"
**Solution:**
- Copilot validates YAML before saving
- Check for proper indentation (2 spaces)
- Ensure quotes are balanced
- Verify colons and hyphens are correctly placed

### Issue: "Too many locators generated"
**Solution:**
- Use filtering: `Generate locators for buttons only`
- Focus on specific regions: `Generate locators for navigation menu`
- Manually edit YAML to remove unnecessary elements

## Locator Maintenance

### Updating Locators

When UI changes, regenerate locators:

```
Update locators in page-object/homepage_locators.yaml
Keep existing element_desc and attributes where possible
Add new elements, mark changed elements
```

### Merging Strategies

**Additive Merge** (Default):
- Adds new elements
- Preserves existing elements
- Updates confidence scores

**Replace Merge**:
- Completely replaces existing file
- Use when major UI refactor occurs

**Smart Merge**:
- Compares old vs new locators
- Updates only changed elements
- Preserves manual customizations in descriptions

### Version Control

```yaml
# Add metadata to YAML files
metadata:
  generated_date: "2025-11-11"
  page_url: "https://example.com/login"
  generator_version: "1.0.0"
  last_updated: "2025-11-11"
```

## Command Reference

### Basic Generation

```
Generate locators for current page
Output: page-object/page_locators.yaml
```

### Filtered Generation

```
Generate locators for:
- Buttons
- Input fields
- Links
Output: page-object/interactive_elements.yaml
```

### Region-Specific Generation

```
Generate locators for header region
Output: page-object/header_locators.yaml
```

### Update Existing File

```
Update page-object/login_locators.yaml with new elements
Merge: additive
```

### With Custom Naming

```
Generate locators for current page
Prefix all keys with: header_
Output: page-object/header_elements.yaml
```

## Example Workflows

### Workflow 1: New Page Locators

```
1. Navigate to https://app.example.com/dashboard
2. Generate locators for current page
3. Output: page-object/dashboard_locators.yaml
4. Review generated file
5. Generate page object: class_name="DashboardPage"
```

### Workflow 2: Update Existing Locators

```
1. Navigate to https://app.example.com/login
2. Update page-object/login_locators.yaml
3. Merge strategy: smart merge
4. Review changes
5. Regenerate page object if needed
```

### Workflow 3: Component-Based Locators

```
1. Navigate to https://app.example.com
2. Generate locators for navigation menu -> nav_locators.yaml
3. Generate locators for sidebar -> sidebar_locators.yaml
4. Generate locators for main content -> content_locators.yaml
5. Combine in page object or keep separate
```

## Quality Checklist

Before finalizing locator YAML:

- [ ] All interactive elements are captured
- [ ] Element descriptions are clear and detailed
- [ ] Preferred locators have confidence > 0.85
- [ ] At least 2-3 fallback strategies per element
- [ ] No duplicate locator keys
- [ ] YAML syntax is valid
- [ ] AI fallback is configured appropriately
- [ ] Attributes are accurate (id, name, text)
- [ ] Hidden elements are marked correctly
- [ ] File naming follows conventions

## Performance Considerations

### Large Pages
For pages with 100+ elements:
- Generate in sections (header, content, footer)
- Filter by element type
- Focus on interactive elements only
- Consider splitting into multiple YAML files

### Dynamic Content
For single-page applications:
- Generate locators per view/route
- Use stable parent containers
- Enable AI fallback for dynamic sections
- Update confidence scores based on stability

### Iframe Handling
For pages with iframes:
- Generate separate YAML for iframe content
- Note iframe context in element descriptions
- Use iframe-aware locator strategies

## Related Documentation

- [Page Actions Generation Guide](./page-actions-gen-guide.md)
- [Step Definitions Generation](./step-definitions-guide.md)
- [Framework Architecture](./framework_arch.md)
- [LocatorUtility API](../framework/utils/locatorUtility.ts)

## Support

For issues or questions:
1. Check this guide first
2. Review the agent instructions: `.github/agents/page-objects-generator.agent.md`
3. Examine existing locator YAML files in `page-object/` directory
4. Check LocatorUtility implementation for supported features
5. Verify browser automation setup is working

## Advanced Topics

### Custom Locator Strategies

Add custom locator strategies in `framework/utils/locatorUtility.ts`:

```typescript
// Example: Add custom data-qa attribute strategy
async getCustomQaLocator(key: string): Promise<string> {
  return `[data-qa="${key}"]`;
}
```

### Locator Validation

Validate generated locators:

```
Validate all locators in page-object/homepage_locators.yaml
Check: uniqueness, reachability, performance
Report: confidence scores, suggestions
```

### Bulk Operations

```
Generate locators for all pages in sitemap:
- https://example.com/page1
- https://example.com/page2
- https://example.com/page3
Output directory: page-object/
Naming: {page_name}_locators.yaml
```

## Tips for Success

1. **Generate Early** - Create locators during development, not after
2. **Review Generated Files** - Always review and refine AI-generated locators
3. **Add Context** - Enhance element descriptions with business context
4. **Iterate** - Regenerate locators as UI evolves
5. **Collaborate** - Work with developers to add test-friendly attributes
6. **Document** - Add comments in YAML for complex locators
7. **Test** - Validate locators work across browsers and environments
8. **Maintain** - Regular updates prevent locator decay
