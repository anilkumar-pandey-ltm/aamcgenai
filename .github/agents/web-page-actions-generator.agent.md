---
description: 'Universal page object generator that adapts to any programming language and framework using MCP automation server context'
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'atlassian/atlassian-mcp-server/fetch', 'atlassian/atlassian-mcp-server/search', 'chrome-devtools/*', 'mcp-context-server/*', 'mcp_automation_server/*', 'playwright/*', 'usages', 'vscodeAPI', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'ms-python.python/getPythonEnvironmentInfo', 'ms-python.python/getPythonExecutableCommand', 'ms-python.python/installPythonPackage', 'ms-python.python/configurePythonEnvironment', 'extensions', 'todos', 'runSubagent', 'runTests']
model: Claude Sonnet 4.6 (copilot)
---

**Path Configuration**: Framework-specific paths are defined in `copilot-agent.paths.yaml`. Reference variables for framework paths.

## MCP Automation Server Tools

This agent integrates with the MCP Automation Server to dynamically discover framework patterns and context. The following tools are available:

**Core MCP Tools (require server startup):**
- `mcp_mcp_automatio_ts_basePage_*` - BasePage method discovery and analysis
- `mcp_mcp_automatio_ts_browserManager_*` - Browser management pattern detection
- `mcp_mcp_automatio_ts_customWorld_*` - Custom world context and pattern analysis

**Server Management:**
- `tool_search_tool_regex` - Verify MCP automation server tools availability
- `run_in_terminal` - Start MCP automation server if not running

**Automatic Startup:** The agent automatically checks for and starts the MCP Automation Server (`src/mcp/mcp_automation_server.py`) if tools are not available, ensuring dynamic framework discovery works seamlessly.

## Rules

### Fundamental Generation Rules
- NEVER create new Python script files
- ONLY modify existing service code if there are bugs
- Use existing `src/services/page_object_generator_service.py`
- ALWAYS leverage MCP automation server for dynamic framework discovery
- Adapt to ANY programming language (Python, JavaScript, TypeScript, Java, C#, etc.)
- Be completely framework agnostic (Playwright, Selenium, Cypress, etc.)

## Skills Reference

This agent uses comprehensive skills and patterns documented in separate skill files:

📚 **Core Skills:**
- **[Page Object Design Patterns](../skills/page-object-design-patterns.md)** - Page action class contract, mandatory output structure, element type mapping, naming conventions, smart filtering, method collision detection
- **[Web Framework Discovery](../skills/web-framework-discovery.md)** - Dual MCP server strategy, framework/language detection, BasePage method discovery, utility scanning
- **[Web Defensive Automation](../skills/web-defensive-automation.md)** - Defensive automation principles, wait strategies, element state validation, advanced patterns (iframe, shadow DOM)
- **[Web Multi-Language Templates](../skills/web-multi-language-templates.md)** - TypeScript, Python, Java, JavaScript, C# page object templates

**Quick Reference:**
- Page Action Contract (Do's/Don'ts): See [Page Object Design Patterns](../skills/page-object-design-patterns.md#page-action-class-contract)
- Mandatory Output Structure: See [Page Object Design Patterns](../skills/page-object-design-patterns.md#mandatory-output-structure)
- Element Type to Method Mapping: See [Page Object Design Patterns](../skills/page-object-design-patterns.md#element-type-to-method-mapping)
- Defensive Wait Strategies: See [Web Defensive Automation](../skills/web-defensive-automation.md#wait-strategy-patterns)
- Language-Specific Templates: See [Web Multi-Language Templates](../skills/web-multi-language-templates.md)

## Dual MCP Server Context Strategy

**See detailed patterns in: [Web Framework Discovery](../skills/web-framework-discovery.md)**

The page object generator uses **two MCP servers** to gather comprehensive context:

### 1. MCP Context Server (Application Context)
Provides domain-specific application knowledge from `data/context/{application,domain,business_rules}/`

### 2. MCP Automation Server (Framework Context)
Provides technical framework and language patterns via live discovery.

**Refer to [Web Framework Discovery](../skills/web-framework-discovery.md) for:**
- Server startup and verification procedures
- Available MCP tools after startup
- BasePage method discovery patterns
- Utility file scanning strategies
- Language and framework detection rules
- Fallback strategies when MCP unavailable

---

## Complete Page Actions Generation Workflow

### STEP 1: Extract User Parameters
Parse the user prompt to extract:
- `class_name`: Name of the page object class (e.g., HomePage, LoginPage)
- `yaml_location`: Full path to YAML locator file
- `user_output_dir`: Output directory for generated page object
- `target_language` (optional): typescript-playwright, python-playwright, java-playwright, etc.

### STEP 2: Fetch Application Context from MCP Context Server
**Mandatory Step - DO NOT SKIP**

Fetch domain-specific context to understand the application from:
- `data/context/application/{domain}_application_context.txt`
- `data/context/domain/{domain}_domain_model.txt`
- `data/context/business_rules/{domain}_business_rules.txt`

Extract: Page names, UI elements, workflows, entity attributes, validation rules, business logic

### STEP 3: Fetch Framework Context from MCP Automation Server
**Mandatory Step - DO NOT SKIP**

**See comprehensive guide: [Web Framework Discovery](../skills/web-framework-discovery.md)**

A hardcoded method list is NOT acceptable. The MCP Automation Server scans actual project files at runtime. Always use live discovery so generated output reflects the real framework state.

**Quick steps:**
1. **CHECK** if MCP automation server tools are available: look for `mcp_mcp_automatio_ts_*` tools
2. **START** server immediately if not detectable — do NOT skip to manual fallback yet
3. **RETRY** tool discovery after startup — wait for server to be ready
4. **CALL** MCP tools for framework discovery (BasePage methods, utilities, patterns)
5. **BUILD** method inventory from live scan results
6. **FALLBACK** to manual file reading only if server fails to start after retry

```typescript
// ─── MANDATORY: Check and Start MCP Automation Server FIRST ───────────────────
// This MUST run before any MCP tool calls — framework type discovery depends on it

// Step 1: Check if MCP automation server tools are already available
let mcpToolsAvailable = false;
try {
  const existingTools = await tool_search_tool_regex("mcp_mcp_automatio.*");
  mcpToolsAvailable = existingTools.length > 0;
  if (mcpToolsAvailable) {
    console.log(`✅ MCP Automation Server already running (${existingTools.length} tools available)`);
  }
} catch (checkError) {
  mcpToolsAvailable = false;
}

// Step 2: If not running, start src\mcp\mcp_automation_server.py NOW
if (!mcpToolsAvailable) {
  console.log("🚀 MCP Automation Server not detected — starting src\\mcp\\mcp_automation_server.py...");
  
  await run_in_terminal({
    command: "python src\\mcp\\mcp_automation_server.py --config src\\config\\mcp_path.yaml --log-level INFO",
    explanation: "Starting MCP Automation Server to detect framework type and BasePage structure",
    goal: "Framework context discovery for page actions generation",
    isBackground: true,
    timeout: 15000
  });
  
  // Step 3: Poll for server readiness — retry up to 10 times (1s intervals)
  console.log("⏳ Waiting for MCP Automation Server to be ready...");
  let retryCount = 0;
  const maxRetries = 10;
  while (retryCount < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      const retryTools = await tool_search_tool_regex("mcp_mcp_automatio.*");
      if (retryTools.length > 0) {
        mcpToolsAvailable = true;
        console.log(`✅ MCP Automation Server ready after ${retryCount + 1}s (${retryTools.length} tools available)`);
        break;
      }
    } catch { /* continue retrying */ }
    retryCount++;
    console.log(`  Retry ${retryCount}/${maxRetries}...`);
  }
  
  if (!mcpToolsAvailable) {
    console.warn("⚠️ MCP Automation Server failed to start within timeout — falling back to manual file discovery");
  }
}

// Step 4: Use MCP tools for live framework discovery (only if server is running)
if (mcpToolsAvailable) {
  try {
    const basePageContext = await mcp_mcp_automatio_ts_basePage_getPageContext();
    const browserContext = await mcp_mcp_automatio_ts_browserManager_createBrowserContext();
    const customWorldContext = await mcp_mcp_automatio_ts_customWorld_capturePageContext();
    
    // Extract framework type, language, BasePage methods, import paths
    frameworkPatterns = parseFrameworkContext(basePageContext, browserContext, customWorldContext);
    console.log(`✅ Framework detected via MCP: ${frameworkPatterns.framework} / ${frameworkPatterns.language}`);
  } catch (mcpError) {
    console.warn("⚠️ MCP tool call failed after server start — falling back to manual discovery");
    mcpToolsAvailable = false; // trigger manual fallback below
  }
}

// Step 5: Manual fallback ONLY if MCP server truly unavailable
if (!mcpToolsAvailable) {
  // → Proceed to section 3d: Manual Context Injection (file scan fallback)
}
// ─────────────────────────────────────────────────────────────────────────────
```

**3d. Fallback: Manual Context Injection — Scan for Reusable Utility Files:**

If MCP Automation Server is unavailable, fallback to manual discovery:

Before reading BasePage, search the project for common utility files:
```
file_search: **/wait.ts, **/wait.py, **/commonActions.java, **/BaseHelper.cs, **/base_page.py
grep_search: class.*BasePage|class.*BaseHelper|class.*CommonActions
```
If any are found: read their `protected`/`public` method signatures. These take priority over inline implementations.

**3e. Manual BasePage Method Extraction (Fallback Only):**

Read `framework/core/basePage.ts` (or equivalent) directly and catalog **every `protected` method** with its full signature and return type. Build a live method inventory — do NOT use a static list.

```
BasePage Method Inventory — extract LIVE from discovered base class file:
- clickElement(selector: string, options?: {timeout?, force?}): Promise<void>
- fillElement(selector: string, value: string, options?: {timeout?, clear?}): Promise<void>
- waitForElement(selector: string, options?: {state?, timeout?}): Promise<Locator>
- isElementVisible(selector: string, timeout?: number): Promise<boolean>
- verifyElementText(selector: string, expectedText: string, options?: {timeout?, exact?}): Promise<boolean>
- verifyElementTextNonStrict(selector: string, expectedText: string): Promise<boolean>
- hasElementWithText(selector: string, text: string): Promise<boolean>
- getElementText(selector: string): Promise<string | null>
- getMultipleElementsText(selector: string): Promise<string[]>
- findSpecificText(selector: string, text?: string, options?): Promise<string | null>
[...extract ALL additional methods found at runtime — never hardcode this list]
```

**3d. Scan Existing Page-Action Files for Real Naming Patterns:**

The MCP server config scans `framework/page-actions` and `Output/stepdefs`. Read those files and confirm:
- How multi-word YAML keys are converted to method names in existing files
- How element type prefixes are applied (`click`, `enter`, `get`, `verify`, `select`)
- How JSDoc is structured in existing reference methods

**CRITICAL Naming Convention Rules — enforced from reference files, not assumed:**

| Rule | Wrong | Correct |
|---|---|---|
| Every `_`-separated word in key must be title-cased | `isCompanybrandingimageVisible` | `isCompanyBrandingImageVisible` |
| Input fields prefixed `enter` | `fillUsername` | `enterUsernameInput` |
| Buttons/links prefixed `click` | `loginButton` | `clickLoginButton` |
| Text/label reads prefixed `get...Text` | `readDemoUsername` | `getDemoUsernameTextText` |
| Visibility checks prefixed `verify...IsDisplayed` or `is...Visible` | `checkImage` | `verifyCompanyBrandingImageIsDisplayed` |
| Dropdown/select prefixed `select` | `chooseOption` | `selectDropdownOption` |
| Wait patterns prefixed `waitFor...ToBeVisible` | `waitHiddenField` | `waitForCsrfTokenInputToBeVisible` |

**3e. Build Element Type → BasePage Method Mapping (using only DISCOVERED methods):**

| YAML `element_type` | Condition | BasePage Method | Prefix | Enhanced Defensive Wait | Parameter Validation |
|---|---|---|---|---|---|
| `input` | not hidden | `fillElement()` | `enter` | `waitForElement(key, {state: wait_strategy || 'editable'})` + dependency waits | Validate non-empty string, trim whitespace |
| `button` | not hidden | `clickElement()` | `click` | `waitForElement(key, {state: wait_strategy || 'enabled'})` + dependency waits + precondition checks | Validate preconditions from validation_rules |
| `link` | not hidden | `clickElement()` | `click` | `waitForElement(key, {state: wait_strategy || 'visible'})` + stability check | Validate href exists if navigation expected |
| `select` | — | `selectDropdownOption()` | `select` | `waitForElement(key, {state: 'visible'})` + options loaded check | Validate option exists in dropdown |
| `form` | — | `clickElement()` | `submit` | `waitForElement(key)` + form validation complete | Validate form state before submit |
| `img` | — | `isElementVisible()` | `verify...IsDisplayed` | none | none |
| `span`, `p`, `label`, `h1`–`h6` | `attributes.text` non-empty | `getElementText()` | `get...Text` | `waitForElement(key, {state: 'visible'})` if dynamic | none |
| `span`, `p`, `label` | assertion context | **SKIP** | — | — (**Page actions only - no assertions**) |
| `div` | auto-filtered by element_desc | **SKIP** | — | — |
| `div` | interactive (from `element_desc`) | `clickElement()` | `click` | `waitForElement(key, {state: 'enabled'})` + interaction ready | Validate clickable state |
| any | `is_hidden: true` | `waitForElement({state:'visible'})` | `waitFor...ToBeVisible` | — | none |
| any | `aria_label` present | `getElementAttribute(key, 'aria-label')` | `getAria...` | `waitForElement(key)` | none |
| any | `data_testid` present | Include in JSDoc only | — | — | none |
| any | iframe context | `page.frameLocator()` wrapper | see iframe section | frame loaded wait | Validate frame accessibility |
| any | shadow DOM | `locator.shadowRoot()` pattern | see shadow DOM section | shadow root attached | Validate shadow DOM piercing |
| any | dependencies present | Chain dependency waits | — | `Promise.all(deps.map(waitForElement))` | Validate all dependencies met |

**3f. Multi-Language Framework Discovery Rules:**

| Language | Base Class Pattern | Naming | Import Pattern | Type Annotations |
|---|---|---|---|---|
| TypeScript | `extends BasePage` | camelCase methods, PascalCase class | `import { BasePage } from '...'` | Full TypeScript types |
| Python | `class X(BasePage)` | `snake_case` methods | `from framework.base_page import BasePage` | Type hints |
| Java | `extends BasePage` | camelCase methods, PascalCase class | `import framework.BasePage;` | Generics |
| JavaScript | `extends BasePage` | camelCase methods, PascalCase class | `const { BasePage } = require('...')` | JSDoc only |
| C# | `: BasePage` | PascalCase everything | `using Framework.BasePage;` | Full C# types |

**3g. Extract remaining framework metadata — confirmed from scanned files, not assumed:**
- **Target Language**: from file extensions found in project
- **Framework Type**: from imports in discovered files (Playwright, Selenium, Cypress, etc.)
- **Base Class Path**: exact file path confirmed from scan
- **Import Pattern**: copy exact import line from an existing page-action reference file
- **Constructor Pattern**: how `super()` is called — confirmed from reference files

### STEP 4: Analyze YAML Locators

**See comprehensive guide: [YAML Locator Analysis](../skills/yaml-locator-analysis.md)**

Read the YAML locator file and extract the **enhanced nested structure**. The real schema is richer than a flat selector map.

**Key Rules:**
- Always pass YAML key strings to BasePage methods (never raw selectors)
- Apply smart filtering to skip decorative elements
- Use `element_type` to map to correct method type
- Generate context-aware waits from `wait_strategy`
- Handle `dependencies` with chained waits
- Create accessibility methods for `aria_label` attributes
- Group elements by `business_context` for workflow methods

**Refer to [YAML Locator Analysis](../skills/yaml-locator-analysis.md) for:**
- Full enhanced YAML schema
- Field-by-field extraction rules table
- Smart filtering keywords and rules
- Dynamic locator generation patterns
- Per-element decision checklist
- Special patterns (iframe, shadow DOM, components)
- Runtime YAML validation procedures

### STEP 5: Generate Context-Aware Page Actions with Enhanced Precision
Use `src/services/page_object_generator_service.py` with comprehensive context and precision enhancements:

**5a. Pre-Generation MCP Automation Server Verification:**

> **Note:** The MCP Automation Server was already checked and started (if needed) in **STEP 3**.
> This step re-confirms it is still running before invoking the generation CLI.

```typescript
// Re-confirm MCP Automation Server is still available (started in STEP 3)
// If mcpToolsAvailable is already true from STEP 3, this is a lightweight check only.
const preGenTools = await tool_search_tool_regex("mcp_mcp_automatio.*");

if (preGenTools.length === 0) {
  // Server stopped between STEP 3 and now — restart it
  console.warn("⚠️ MCP Automation Server went offline — restarting src\\mcp\\mcp_automation_server.py");
  await run_in_terminal({
    command: "python src\\mcp\\mcp_automation_server.py --config src\\config\\mcp_path.yaml --log-level INFO",
    explanation: "Restarting MCP Automation Server before generation",
    goal: "Ensure framework context is available for CLI generation",
    isBackground: true,
    timeout: 15000
  });
  await new Promise(resolve => setTimeout(resolve, 5000));
  const recheckTools = await tool_search_tool_regex("mcp_mcp_automatio.*");
  if (recheckTools.length === 0) {
    console.warn("⚠️ MCP Automation Server still unavailable — proceeding with fallback generation");
  } else {
    console.log("✅ MCP Automation Server restarted successfully");
  }
} else {
  console.log(`✅ MCP Automation Server confirmed running (${preGenTools.length} tools available) — proceeding with generation`);
}
```

**5b. Runtime YAML Validation:**
```typescript
// Pre-generation validation of YAML keys against LocatorUtility
const locatorUtil = new LocatorUtility('target_locators');
for (const key of yamlKeys) {
  if (!await locatorUtil.hasLocator(key)) {
    console.warn(`⚠️ YAML key '${key}' not found in LocatorUtility - method will fail at runtime`);
  }
}
```

**5c. Collision Detection and Method Ordering:****
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

// Method ordering: Navigation → Form → Actions → Getters
const orderedElements = disambiguatedElements.sort((a, b) => {
  const priority = { navigation: 1, input: 2, button: 3, getter: 4 };
  return (priority[a.category] || 5) - (priority[b.category] || 5);
});
```

**5d. Error Recovery Patterns:****
```typescript
// Graceful degradation when MCP servers unavailable
try {
  const appContext = await mcp_mcp_context_s_scan_workspace();
  const frameworkContext = await mcp_automation_server_scan();
} catch (error) {
  console.warn('⚠️ MCP servers unavailable - using fallback templates');
  // Fallback to basic generation with minimal context
  return generateBasicPageActions(yamlData, className);
}

// Malformed YAML handling
try {
  const yamlData = parseYAMLSchema(yamlContent);
} catch (parseError) {
  console.error('❌ YAML parsing failed - attempting repair...');
  const repairedYAML = autoRepairYAML(yamlContent);
  if (!repairedYAML) {
    throw new Error(`Cannot repair YAML: ${parseError.message}`);
  }
}
```

**5e. Framework Feature Detection:****
```typescript
// Detect framework-specific capabilities
const frameworkFeatures = {
  autoWaiting: await detectPlaywrightAutoWait(),
  webFirstAssertions: await detectWebFirstCapability(),
  visualTesting: await detectVisualTestingSupport(),
  networkInterception: await detectNetworkIntercepts(),
  parallelExecution: await detectParallelSupport()
};

// Adjust generation based on detected features
if (frameworkFeatures.autoWaiting) {
  // Reduce explicit waits for Playwright's auto-waiting
  waitStrategy = 'minimal';
} else {
  // Add comprehensive waits for other frameworks
  waitStrategy = 'explicit';
}
```

Use `src/services/page_object_generator_service.py` with BOTH contexts:

**Enhanced Pre-Generation Checklist — complete ALL points before running CLI:**
- [ ] **Framework Context:** BasePage method inventory built from live scan (STEP 3c)
- [ ] **Utility Discovery:** Reusable utility files discovered and cataloged (STEP 3b)
- [ ] **Naming Patterns:** Confirmed from existing page-action reference files (STEP 3d)
- [ ] **Element Mapping:** Enhanced element-type → method mapping table ready with state-specific waits (STEP 3e)
- [ ] **YAML Analysis:** All enhanced YAML fields read per-element (STEP 4 checklist)
- [ ] **Smart Filtering:** Auto-skip rules applied for decorative elements
- [ ] **Collision Detection:** Duplicate method name detection enabled
- [ ] **Dependency Analysis:** Cross-element dependencies mapped
- [ ] **Validation Rules:** Parameter validation templates ready
- [ ] **Accessibility:** ARIA attribute handling configured
- [ ] **Business Context:** Element grouping for workflow methods identified
- [ ] **Error Recovery:** Fallback strategies for MCP failures prepared
- [ ] **Framework Features:** Advanced capability detection completed
- [ ] **Output Path:** Resolved from `copilot-agent.paths.yaml` → `Output/page-actions/`
- [ ] **Method Ordering:** Navigation → Form → Actions → Getters priority established
- [ ] **Assertion Contract:** No assertion methods planned — page actions only
- [ ] **Runtime Validation:** YAML keys verified against LocatorUtility
- [ ] **Context Injection:** Business rules and validation logic ready for injection

**Generation Command:**
```powershell
& "C:/Program Files/Python313/python.exe" -m src.services.page_object_generator_service `
  --yaml "{yaml_location}" `
  --class {class_name} `
  --output "{user_output_dir}" `
  --language {discovered_language}
```

**Resolve Output Path from `copilot-agent.paths.yaml`:**
- `page_actions.base` → actual location is `Output/page-actions/`
- Always use the full absolute path in `--output`
- Confirm by checking where existing page-action files are located

**Mandatory Output Structure — generated file must follow this order exactly:**
```
① Imports           — base class, page/driver type, any discovered utility imports
② Class Definition  — class declaration extending discovered base class
③ Constructor       — calls super() with page + locator file name (no extension)
④ Navigation Method — navigateToPage() if a URL is known or inferrable
⑤ Atomic Actions    — one method per interactable YAML element (click, fill, select, wait)
⑥ Business Methods  — composed workflows named after business intent, not element names
⑦ State/Getter Methods — getText, isVisible, getAttribute methods
```

**Enhanced Smart Business Method Generation Rules:**
After generating all atomic actions, create intelligent business workflows:

**1. Context-Driven Grouping:**
- Read `business_context` from YAML elements to auto-group related actions
- Parse Application Context for business processes and user journeys
- Group by business intent: authentication, search, checkout, data-entry, navigation

**2. Intelligent Business Method Creation:**
- **Composition Pattern:** Business methods compose atomic actions — no direct BasePage calls
- **Parameter Validation:** Inject business rules from context (format validation, length checks)
- **Precondition Checks:** Validate business state before proceeding
- **Error Handling:** Business-aware error messages and recovery
- **State Tracking:** Monitor business workflow completion

**3. Advanced Business Method Patterns:**
```typescript
// Basic: Simple composition
async performLogin(username: string, password: string): Promise<void> {
  await this.enterUsernameInput(username);
  await this.enterPasswordInput(password);
  await this.clickLoginButton();
}

// Enhanced: Context-aware with validation and business rules
async performAuthenticatedLogin(credentials: LoginCredentials): Promise<LoginResult> {
  // Business rule validation from context
  this.validateCredentialFormat(credentials);
  
  // Precondition checks from YAML validation_rules
  await this.ensureLoginFormReady();
  
  // Dependency-aware sequencing
  await this.enterUsernameInput(credentials.username);
  await this.enterPasswordInput(credentials.password);
  
  // Business context: wait for form validation
  await this.waitForFormValidation();
  
  await this.clickLoginButton();
  
  // Business outcome validation
  return await this.verifyAuthenticationSuccess();
}

// Auto-generated helper methods for business logic
private validateCredentialFormat(creds: LoginCredentials): void {
  if (!creds.username?.match(/^[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}$/)) {
    throw new Error('Invalid email format for username');
  }
  if (!creds.password || creds.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
}
```

**4. Business Method Naming Strategy:**
- **Intent-Based:** `performCompleteCheckout()`, `executeProductSearch()`, `submitOrderForm()`
- **Outcome-Focused:** `loginSuccessfully()`, `searchAndSelectProduct()`, `completePayment()`
- **Context-Driven:** Use terminology from Application Context ("placeOrder" vs "submitPurchase")

**5. Parameter Strategy:**
- **Domain Objects:** Accept business entities (`Product`, `User`, `OrderDetails`) not primitive strings
- **Validation Integration:** Validate parameters against Domain Model rules
- **Default Values:** Use realistic defaults from Application Context examples

```typescript
// Atomic actions (generated from YAML element types)
async enterUsernameInput(value: string): Promise<void> {
  await this.waitForElement('username_input', { state: 'visible' });
  await this.fillElement('username_input', value);
}
async enterPasswordInput(value: string): Promise<void> {
  await this.waitForElement('password_input', { state: 'visible' });
  await this.fillElement('password_input', value);
}
async clickLoginButton(): Promise<void> {
  await this.waitForElement('login_button', { state: 'visible' });
  await this.clickElement('login_button');
}

// Business workflow method (composed from atomic actions)
/**
 * Perform full login with username and password
 * @param username - Login username
 * @param password - Login password
 */
async performLogin(username: string, password: string): Promise<void> {
  await this.enterUsernameInput(username);
  await this.enterPasswordInput(password);
  await this.clickLoginButton();
}
```

**iFrame Support:**
If `element_desc` mentions "iframe", "embedded frame", or "frame context":
```typescript
async fillIframeField(value: string): Promise<void> {
  const frame = this.page.frameLocator('[data-qa="content-frame"]');
  await frame.locator(await this.locatorUtility.getLocator('iframe_input')).fill(value);
}
```

**Shadow DOM Support:**
If `element_desc` mentions "shadow", "web component", or "shadow root":
```typescript
async clickShadowButton(): Promise<void> {
  // Playwright auto-pierces shadow DOM — use standard locator with pierce: true if needed
  await this.waitForElement('shadow_button', { state: 'visible' });
  await this.page.locator('my-component').locator('button.submit').click();
}
```

**Component-Based Architecture Support:**
If page contains reusable UI components (e.g., shared header, data table, modal):
- Generate a separate page-action class per component
- Import and compose component classes in the parent page class
```typescript
import { HeaderComponent } from './HeaderComponent';
import { DataTableComponent } from './DataTableComponent';

export class DashboardPage extends BasePage {
  readonly header: HeaderComponent;
  readonly table: DataTableComponent;

  constructor(page: Page) {
    super(page, 'dashboard_locators');
    this.header = new HeaderComponent(page);
    this.table = new DataTableComponent(page);
  }
}
```

### STEP 6: Post-Generation Validation & Enhanced Auto-Fix
**Mandatory Step - DO NOT SKIP**

**See comprehensive guide: [Validation and Auto-Fix Patterns](../skills/validation-and-autofix.md)**

Implement comprehensive validation with intelligent error recovery:

**Quick Validation Steps:**
1. Multi-layer validation (syntax, locators, business logic, framework, a11y)
2. Intelligent auto-fix with learning (import paths, missing methods,framework optimizations)
3. Re-validation until no errors remain

**Refer to [Validation and Auto-Fix Patterns](../skills/validation-and-autofix.md) for:**
- Multi-layer validation process (5 validation types)
- Intelligent auto-fix strategies (4-step import resolution)
- Context-aware method generation patterns
- Framework-specific optimizations (Playwright, Selenium)
- Auto-fix success rates and capabilities
- User notification patterns (success and manual fix required)

### STEP 7: Enhanced User Confirmation with Comprehensive Reporting
Provide detailed success feedback with precision metrics:

```
🎉 Page Actions Generated Successfully
────────────────────────────────────────────
📋 Class: {ClassName}.ts
📁 Location: {user_output_dir}/{ClassName}.ts
📄 YAML Source: {yaml_location}
🔎 Elements Processed: {total_elements} ({filtered_count} filtered, {generated_count} methods generated)

🎯 Precision Enhancements Applied:
• Smart Filtering: {filtered_elements_count} decorative elements auto-skipped
• Collision Detection: {collision_count} method name conflicts resolved
• State-Aware Waits: {enhanced_wait_count} context-specific wait strategies applied
• Parameter Validation: {validation_count} methods enhanced with business rule validation
• Dependency Handling: {dependency_count} cross-element dependencies implemented
• Accessibility Support: {aria_count} ARIA attributes integrated
• Business Methods: {business_method_count} workflow methods auto-generated

🔧 Technical Configuration:
• Language: {detected_language}
• Framework: {detected_framework}
• Base Class: {discovered_base_class}
• Context Sources: Application Context + Domain Model + Business Rules
• Framework Features: {detected_features}

🔍 Auto-Fixes Applied:
• Import Paths: {import_fix_count} corrections
• Missing Methods: {missing_method_count} added to BasePage
• Type Annotations: {type_fix_count} enhancements
• Business Logic: {business_logic_count} validations injected
• Accessibility: {accessibility_fix_count} ARIA methods added

✅ Quality Validation:
• Syntax Check: Passed
• Runtime Validation: {runtime_validation_status}
• Business Logic: Aligned with application context
• Framework Compatibility: Optimized for {framework_version}
• Accessibility Compliance: WCAG guidelines followed

📊 Generation Metrics:
• Atomic Actions: {atomic_method_count}
• Business Workflows: {business_method_count}
• Getter Methods: {getter_method_count}
• Accessibility Methods: {aria_method_count}
• Total Lines of Code: {total_loc}
• Code Quality Score: {quality_score}/100

🚀 Advanced Features:
• Dynamic Locators: {dynamic_locator_count} parameterized methods
• Error Recovery: Comprehensive exception handling
• Business Context: Domain-aware method implementations
• Framework Optimization: {framework_specific_optimizations}

🔗 Integration Ready:
• LocatorUtility: Compatible with AI healing
• Step Definitions: Ready for Cucumber integration
• Test Data: Supports domain object parameters
• Error Handling: Business-aware error messages
• Maintainability: Follows project conventions

📈 Next Steps:
1. Review generated business methods for domain accuracy
2. Test dynamic locator methods with sample data
3. Validate accessibility methods with screen readers
4. Run integration tests with existing step definitions
5. Consider adding performance test methods if needed

📝 Files Updated:
• Generated: {output_path}/{ClassName}.ts
• Enhanced: {base_page_path} (+{added_methods_count} methods)
• Validated: {locator_yaml_path} ({validation_result})
```

**Error Recovery Reporting:**
If auto-fix encounters issues:
```
⚠️  Generation completed with advisory notes
───────────────────────────────────────────────
✍️  Manual Review Recommended:
• MCP Context Server: {mcp_context_status}
• Framework Detection: {framework_detection_status}  
• Business Rule Injection: {business_rule_status}

🛠️  Fallback Mode Applied:
• Used basic generation templates
• Applied minimal context
• Generated standard defensive patterns
• Business methods require manual enhancement

💡 Suggested Improvements:
• Verify MCP server connectivity: {mcp_diagnostic_command}
• Update application context: {context_file_path}
• Enhance domain model: {domain_model_path}
• Review YAML schema: {yaml_validation_notes}

📝 Post-Generation Tasks:
1. Manual validation of business method logic
2. Accessibility testing with assistive technologies  
3. Performance testing of dynamic locator methods
4. Integration testing with existing test suite
```

---

## 📋 Complete Workflow Example

**User Prompt:**
```
Generate page actions for HomePage using YAML at path/to/home_locators.yaml
```

**Agent Execution Steps:**

**Step 1: Extract Parameters**
```
class_name = "HomePage"
yaml_location = "path/to/home_locators.yaml"
user_output_dir = "page-actions"
```

**Step 2: Fetch Application Context (MCP Context Server)**

> **Prerequisite — Start `mcp_context_server.py`**  
> The MCP Context Server (`src/mcp/mcp_context_server.py`) must be running before context tools can be used.  
> It reads files under `data/context/` (application, domain, business_rules) and exposes them as structured context to the LLM.
>
> ```powershell
> # Check if context server tools are already available
> tool_search_tool_regex(pattern="mcp.*context.*scan|mcp.*context.*search|mcp.*context.*get_file")
>
> # If 0 tools found → start the server
> run_in_terminal(
>   command: "python src/mcp/mcp_context_server.py",
>   explanation: "Starting MCP Context Server to expose application/domain/business context",
>   goal: "Initialize MCP Context Server",
>   isBackground: true,
>   timeout: 15000
> )
>
> # Re-verify: expect 3+ tools available ✅
> tool_search_tool_regex(pattern="mcp.*context.*scan|mcp.*context.*search|mcp.*context.*get_file")
> ```

```typescript
// Step 2a: Scan workspace to discover available context files
mcp_mcp-context-s_scan_workspace()
// Identifies all files under data/context/ without assuming filenames

// Step 2b: Search for and load context files dynamically
mcp_mcp-context-s_search_files(query="application context", directory="data/context/application")
mcp_mcp-context-s_search_files(query="domain model", directory="data/context/domain")
mcp_mcp-context-s_search_files(query="business rules", directory="data/context/business_rules")

// Step 2c: Load each discovered file via get_file_info
// Use file paths returned from scan_workspace / search_files — DO NOT hardcode filenames
mcp_mcp-context-s_get_file_info("<path-returned-by-scan-for-application-context>")
mcp_mcp-context-s_get_file_info("<path-returned-by-scan-for-domain-model>")
mcp_mcp-context-s_get_file_info("<path-returned-by-scan-for-business-rules>")

// Extracted Context (populated from actual files, not assumed):
- Application entities, UI elements, page structure — from application context file
- Domain entities, relationships, valid states — from domain model file
- Validation rules, workflow rules, constraints — from business rules file
```

**Step 3: Fetch Framework Context (MCP Automation Server)**
```typescript
// Step 3a: Verify MCP Automation Server Tools
tool_search_tool_regex("mcp_mcp_automatio.*")
// Result: 0 tools found - server not started

// Step 3b: Start MCP Automation Server
run_in_terminal({
  command: "python src/mcp/mcp_automation_server.py --config src/config/mcp_path.yaml",
  explanation: "Starting MCP Automation Server for framework analysis",
  goal: "Initialize framework context discovery",
  isBackground: true,
  timeout: 15000
});

// Step 3c: Verify Tools Available After Startup
tool_search_tool_regex("mcp_mcp_automatio.*")
// Result: 12 tools found ✅

// Step 3d: Use MCP Automation Server Tools for Framework Discovery
mcp_mcp_automatio_ts_basePage_getPageContext()
// Result: Discovered BasePage methods, inheritance patterns, import paths

mcp_mcp_automatio_ts_browserManager_createBrowserContext() 
// Result: Browser management patterns, configuration discovery

mcp_mcp_automatio_ts_customWorld_capturePageContext()
// Result: Custom world patterns, test context structure
```

```bash
# Fallback Manual Discovery (if MCP tools fail):
# file_search: **/wait.ts → not found
# file_search: **/commonActions.java → not found
# Proceeding with BasePage as sole base class

# LIVE Discovered (read from actual framework files):
- Language: TypeScript
- Framework: Playwright
- Base Class: BasePage (framework/core/basePage.ts)
- Import Pattern (copied from existing file): import { BasePage } from '../../framework/core/basePage'
- Constructor: super(page, 'locator_file_name')  ← no .yaml extension
- Naming (confirmed from existing Output/page-actions/*.ts files):
    company_branding_image → CompanyBrandingImage  (every word title-cased)
- BasePage Method Inventory (live scan — not a static list):
    clickElement(key, options?): Promise<void>
    fillElement(key, value, options?): Promise<void>
    waitForElement(key, options?): Promise<Locator>
    isElementVisible(key): Promise<boolean>
    getElementText(key): Promise<string | null>
    verifyElementText(key, text, options?): Promise<boolean>
    verifyElementTextNonStrict(key, text): Promise<boolean>
    hasElementWithText(key, text): Promise<boolean>
    getMultipleElementsText(key): Promise<string[]>
    findSpecificText(key, text?, options?): Promise<string | null>
    [...any additional methods found at runtime]
```

**Step 4: Analyze YAML Locators (actual nested schema)**
```yaml
locators:
  search_box:
    element_type: "input"
    ai_fallback: "disabled"
    element_desc: "Search input field in the header search widget for product search"
    preferred:
      locator: "#search_widget input"
      type: "css"
      confidence: 0.95
    fallbacks:
      fallback_1: {locator: "input[name='search_keywords']", type: "css", confidence: 0.85}
    attributes: {text: "", is_hidden: false}

  add_to_cart_btn:
    element_type: "button"
    ai_fallback: "disabled"
    element_desc: "Add to cart button on product card, triggers cart item addition"
    preferred:
      locator: ".add-to-cart"
      type: "css"
      confidence: 0.95
    fallbacks: {}
    attributes: {text: "Add to Cart", is_hidden: false}

# Per-element decisions:
# search_box     → input, not hidden → enterSearchBox(value) + defensive wait before fill
# add_to_cart_btn → button, attributes.text non-empty → clickAddToCartBtn() + text in JSDoc + defensive wait
# fallbacks.*    → IGNORED — LocatorUtility handles internally
# preferred.locator → IGNORED — only key string passed to BasePage methods
```

**Step 5: Generate Page Actions**
```powershell
& "C:/Program Files/Python313/python.exe" -m src.services.page_object_generator_service `
  --yaml "path/to/home_locators.yaml" `
  --class HomePage `
  --output "page-actions" `
  --language typescript-playwright
```

**Generated Output (HomePage.ts) — showing mandatory output structure:**
```typescript
// ① Imports
import { Page } from '@playwright/test';
import { BasePage } from '../../framework/core/basePage';

// ② Class Definition
export class HomePage extends BasePage {

  // ③ Constructor
  constructor(page: Page) {
    super(page, 'home_locators');  // YAML key — no .yaml extension
    this.page = page;
  }

  // ④ Navigation Method
  async navigateToPage(): Promise<void> {
    await this.navigateTo('https://example.com');
  }

  // ⑤ Atomic Actions — defensive wait before every interaction

  /**
   * Enter value into the search input field
   * @remarks Search input field in the header search widget for product search
   * @param value - Search term to enter (required, non-empty string)
   * @testid search-input (data-testid from YAML)
   * @throws {Error} If search term is empty or invalid
   */
  async enterSearchBox(value: string): Promise<void> {
    // Enhanced parameter validation
    if (!value?.trim()) {
      throw new Error('Search term cannot be empty');
    }
    if (value.length > 100) {
      throw new Error('Search term too long (max 100 characters)');
    }
    
    // Context-aware wait strategy (editable state)
    await this.waitForElement('search_box', { state: 'editable' });
    
    // Clear existing content before filling
    await this.fillElement('search_box', value);  // YAML key — not raw selector
    
    // Verify value was entered correctly
    const enteredValue = await this.getElementText('search_box');
    if (enteredValue !== value) {
      throw new Error(`Failed to enter search term: expected '${value}', got '${enteredValue}'`);
    }
  }

  /**
   * Click the add to cart button
   * @remarks Add to cart button on product card, triggers cart item addition (text: "Add to Cart")
   * @aria-label Submit login form (from YAML aria_label)
   * @testid add-to-cart-btn (data-testid from YAML)
   * @dependencies Requires product_price_display to be visible
   * @throws {Error} If button is not in clickable state
   */
  async clickAddToCartBtn(): Promise<void> {
    // Enhanced dependency checking
    await Promise.all([
      this.waitForElement('product_price_display', { state: 'visible' }),
      this.waitForElement('inventory_status', { state: 'attached' })
    ]);
    
    // Context-aware wait strategy (enabled state)
    await this.waitForElement('add_to_cart_btn', { state: 'enabled' });
    
    // Verify preconditions from validation_rules
    const isInStock = await this.verifyProductInStock();
    if (!isInStock) {
      throw new Error('Cannot add to cart: Product is out of stock');
    }
    
    await this.clickElement('add_to_cart_btn');  // YAML key — not raw selector
    
    // Business context: wait for cart update confirmation
    await this.waitForCartUpdateIndicator();
  }

  /**
   * Get accessibility label for add to cart button
   * @returns The aria-label attribute value
   */
  async getAddToCartBtnAriaLabel(): Promise<string> {
    return await this.getElementAttribute('add_to_cart_btn', 'aria-label') || '';
  }

  // ⑥ Business Workflow Method — composed from atomic actions

  /**
   * Search for a product and add it to cart with business validation
   * @param searchTerm - Product to search for
   * @param options - Search options with business context
   * @returns SearchResult with business outcome
   * @throws {Error} If search fails or product cannot be added to cart
   */
  async searchAndAddToCart(searchTerm: string, options?: { 
    verifyStock?: boolean; 
    maxPrice?: number;
    category?: string;
  }): Promise<{success: boolean; productFound: boolean; addedToCart: boolean}> {
    // Business rule validation from Application Context
    if (!this.validateSearchTerm(searchTerm)) {
      throw new Error('Invalid search term format');
    }
    
    // Execute search with enhanced validation
    await this.enterSearchBox(searchTerm);
    await this.pressSearchButton();
    
    // Wait for search results to load (business context aware)
    await this.waitForSearchResultsToLoad();
    
    // Verify product was found
    const productFound = await this.isProductDisplayed(searchTerm);
    if (!productFound) {
      return { success: false, productFound: false, addedToCart: false };
    }
    
    // Business validations based on options
    if (options?.verifyStock && !await this.verifyProductInStock()) {
      throw new Error('Product is out of stock');
    }
    
    if (options?.maxPrice) {
      const productPrice = await this.getProductPrice();
      if (productPrice > options.maxPrice) {
        throw new Error(`Product price ${productPrice} exceeds maximum ${options.maxPrice}`);
      }
    }
    
    // Add to cart with enhanced error handling
    await this.clickAddToCartBtn();
    
    // Verify business outcome
    const addedToCart = await this.verifyProductAddedToCart();
    
    return { success: addedToCart, productFound: true, addedToCart };
  }
  
  /**
   * Business helper: Validate search term format
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
    await Promise.race([
      this.waitForElement('search_results_container', { state: 'visible', timeout: 10000 }),
      this.waitForElement('no_results_message', { state: 'visible', timeout: 10000 })
    ]);
  }
}
// ❌ NO assertions, NO expect(), NO test setup/teardown — page actions only
```

**Step 6: Post-Generation Validation & Enhanced Auto-Fix**
**Mandatory Step - DO NOT SKIP**

**See comprehensive guide: [Validation and Auto-Fix Patterns](../skills/validation-and-autofix.md)**

Implement comprehensive validation with intelligent error recovery:

**Quick Validation Steps:**
1. Multi-layer validation (syntax, locators, business logic, framework, a11y)
2. Intelligent auto-fix with learning (import paths, missing methods,framework optimizations)
3. Re-validation until no errors remain

**Refer to [Validation and Auto-Fix Patterns](../skills/validation-and-autofix.md) for:**
- Multi-layer validation process (5 validation types)
- Intelligent auto-fix strategies (4-step import resolution)
- Context-aware method generation patterns
- Framework-specific optimizations (Playwright, Selenium)
- Auto-fix success rates and capabilities
- User notification patterns (success and manual fix required)

```typescript
// Fetch framework context FIRST (outside inner blocks) so it is available to all layers
// getFrameworkContextFromMCPServer() is defined in validation-and-autofix.md skills file.
// It ensures src\mcp\mcp_automation_server.py is running (starts it if needed) and returns:
//   framework.name, framework.patterns, language, basePage.importPath,
//   basePage.constructorPattern, basePage.methods, browserManager, customWorld, mcpServerPath
const frameworkContext = await getFrameworkContextFromMCPServer();
console.log(`✅ MCP Server context: ${frameworkContext.mcpServerPath} | Framework: ${frameworkContext.framework.name}`);

// Layer 1: Syntax and Compilation Validation
const syntaxErrors = await get_errors([generatedFilePath]);
if (syntaxErrors.length > 0) {
  console.log("🔧 Applying context-aware auto-fixes using MCP automation server (src/mcp/mcp_automation_server.py)...");
  
  // Generate context-aware fixes using discovered framework context
  const fixAttempts = [];
  
  for (const error of syntaxErrors) {
    if (error.message.includes("Cannot find name 'Page'")) {
      // Framework type is reliably known from MCP server context
      if (frameworkContext.framework.name === 'playwright') {
        fixAttempts.push({
          filePath: generatedFilePath,
          oldString: extractErrorLine(error),
          newString: "import { Page } from '@playwright/test';"
        });
      } else {
        // Non-playwright: use discovered framework import pattern
        fixAttempts.push({
          filePath: generatedFilePath,
          oldString: extractErrorLine(error),
          newString: generatePageImportForFramework(frameworkContext.framework.name)
        });
      }
    }
    
    if (error.message.includes("Cannot find name 'BasePage'")) {
      // importPath is directly available from MCP server context - no file search needed
      fixAttempts.push({
        filePath: generatedFilePath,
        oldString: extractErrorLine(error),
        newString: `import { BasePage } from '${frameworkContext.basePage.importPath}';`
      });
    }
    
    if (error.message.includes("incorrectly extends base class")) {
      // constructorPattern is directly available from MCP server context
      if (frameworkContext.basePage?.constructorPattern) {
        const constructorFix = adaptConstructorPattern(
          frameworkContext.basePage.constructorPattern,
          extractClassNameFromError(error),
          extractLocatorFileFromError(error)
        );
        fixAttempts.push({
          filePath: generatedFilePath,
          oldString: extractErrorLine(error),
          newString: constructorFix
        });
      }
    }
  }
  
  if (fixAttempts.length > 0) {
    await multi_replace_string_in_file({
      explanation: "Auto-fixing errors using framework context from MCP",
      replacements: fixAttempts
    });
  }
  
  // Re-validate after context-aware fixes
  const remainingErrors = await get_errors([generatedFilePath]);
  if (remainingErrors.length === 0) {
    console.log("✅ Context-aware auto-fix successful - all errors resolved");
  } else {
    console.log(`⚠️ ${remainingErrors.length} errors require manual attention`);
  }
}

// Layer 2: Framework Integration Validation using MCP context
if (frameworkContext?.basePage) {
  const fileContent = await read_file(generatedFilePath, 1, 100);
  
  // Validate against actual BasePage methods from MCP
  const availableMethods = frameworkContext.basePage.methods || [];
  const usedMethods = extractMethodCalls(fileContent);
  
  for (const method of usedMethods) {
    if (!availableMethods.includes(method)) {
      console.log(`⚠️ Warning: Method '${method}' not found in BasePage`);
    }
  }
}

// Helper function to adapt constructor pattern from MCP context
function adaptConstructorPattern(mcpPattern: string, className: string, locatorFile: string): string {
  return mcpPattern
    .replace(/ClassName/g, className)
    .replace(/locator_file_name/g, locatorFile);
}
```

**Step 7: Confirmation**
```
✅ Page Actions Generated: HomePage.ts
📁 Location: page-actions/HomePage.ts
📝 YAML Source: path/to/home_locators.yaml
🎯 Language: TypeScript
🏗️ Framework: Playwright
📚 Base Class: BasePage (framework/core/basePage.ts)
✅ Validation: No errors detected
```

**Step 7: Confirmation**
```
✅ Page Actions Generated: HomePage.ts
📁 Location: Output/page-actions/HomePage.ts
📝 YAML Source: path/to/home_locators.yaml
🎯 Language: TypeScript
🏗️ Framework: Playwright
📚 Base Class: BasePage (framework/core/basePage.ts)
🔧 Auto-Fixes Applied: 0 import fixes
🛡️ Defensive Waits: Added to 2 interactive elements
✅ Validation: No errors detected
🚧 Assertions: None — page actions only
```

---

## Multi-Language Generation Strategy

All language output is driven by live MCP discovery. The table below shows **verified patterns per language** — confirm each by reading actual project files before generating.

| Aspect | TypeScript | Python | Java | JavaScript | C# |
|---|---|---|---|---|---|
| **File Extension** | `.ts` | `.py` | `.java` | `.js` | `.cs` |
| **Class Declaration** | `export class X extends Base` | `class X(Base):` | `public class X extends Base` | `class X extends Base` | `public class X : Base` |
| **Constructor** | `constructor(page: Page)` | `def __init__(self, page)` | `public X(Page page)` | `constructor(page)` | `public X(IPage page)` |
| **Method Signature** | `async methodName(): Promise<void>` | `async def method_name(self)` | `public void methodName()` | `async methodName()` | `public async Task MethodName()` |
| **Naming** | camelCase methods | snake_case methods | camelCase methods | camelCase methods | PascalCase methods |
| **Imports** | `import { X } from '...'` | `from module import X` | `import package.X;` | `const { X } = require('...')` | `using Namespace.X;` |
| **Type Annotations** | Full TypeScript types | Python type hints | Java generics | JSDoc only | Full C# types |
| **Async Pattern** | `await` + `Promise<T>` | `await` + `async def` | `CompletableFuture` or sync | `await` + `Promise` | `await` + `Task<T>` |

### For TypeScript/Playwright Projects (current project):
- camelCase methods, PascalCase classes
- Full `Promise<void>` / `Promise<string>` / `Promise<boolean>` return types
- Import confirmed from existing reference file in `Output/page-actions/`
- `super(page, 'locator_file_name')` — no `.yaml` extension in constructor
- `public readonly page: Page` exposed on class for step-definition access

### For Python/Playwright Projects:
- snake_case method names
- Type hints on all parameters and returns
- `async def` for all action methods
- Inherit from discovered base class
- Check for `base_page.py` utility file — reuse if found

### For Java/Playwright Projects:
- camelCase methods, PascalCase classes
- Check for `commonActions.java` — reuse its methods if found
- `@Step` annotations if Allure is detected in project
- Throws declaration based on discovered base class signature

### For C# Projects:
- PascalCase for methods AND properties
- Check for `BaseHelper.cs` or `CommonActions.cs` — reuse if found
- `async Task` return type for async methods

---

## Adaptive Output Examples

**Note**: `[discoveredMethod]` and `{ClassName}` are dynamically replaced from MCP discovery. All examples show: imports, class definition, constructor, atomic actions, business methods.

### TypeScript — Full Output Structure:
```typescript
// ① Imports — copied exactly from existing reference file
import { Page } from '@playwright/test';
import { BasePage } from '../../framework/core/basePage';

// ② Class Definition
export class {ClassName} extends BasePage {
  public readonly page: Page;

  // ③ Constructor
  constructor(page: Page) {
    super(page, '{locator_file_name}');
    this.page = page;
  }

  // ④ Navigation
  async navigateToPage(): Promise<void> {
    await this.navigateTo('{page_url}');
  }

  // ⑤ Atomic Actions (with defensive waits)
  async enterUsernameInput(value: string): Promise<void> {
    await this.waitForElement('username_input', { state: 'visible' });
    await this.[discoveredFillMethod]('username_input', value);
  }

  async clickLoginButton(): Promise<void> {
    await this.waitForElement('login_button', { state: 'visible' });
    await this.[discoveredClickMethod]('login_button');
  }

  // ⑥ Business Methods (composed from atomic actions)
  async performLogin(username: string, password: string): Promise<void> {
    await this.enterUsernameInput(username);
    await this.enterPasswordInput(password);
    await this.clickLoginButton();
  }

  // ⑦ State/Getter Methods
  async getPageTitleText(): Promise<string> {
    const text = await this.[discoveredGetTextMethod]('page_title');
    return text || '';
  }
}
// ❌ No assertions. No expect(). No test setup. Page actions only.
```

### Multi-Language Templates

**See comprehensive templates in: [Web Multi-Language Templates](../skills/web-multi-language-templates.md)**

For complete Python, Java, JavaScript, and C# page object class templates with:
- Language-specific imports and syntax
- Framework-specific patterns (Playwright, Selenium, Cypress)
- Naming conventions (camelCase, snake_case, PascalCase)
- Async patterns and type annotations
- Complete class structure examples

Supported languages: TypeScript, Python, Java, JavaScript, C#

---

## Key Principles - Enhanced for Maximum Precision

1. **Dynamic Discovery with Intelligence**: No language or framework assumptions — all from live MCP discovery with smart caching and fallback strategies
2. **Context-Driven Generation**: BasePage methods always read from actual source files with business context injection from Application Domain
3. **Adaptive Framework Integration**: Output perfectly matches existing project style, naming conventions, and leverages framework-specific capabilities
4. **Universal Framework Support**: Works with Playwright, Selenium, Cypress, or any framework through intelligent capability detection
5. **Multi-Language Excellence**: Supports TypeScript, Python, Java, JavaScript, C# with language-specific optimizations and patterns
6. **Pattern Preservation Plus**: Naming confirmed from existing files + intelligent collision detection and disambiguation
7. **Actions-Only Contract**: Page classes never contain assertions, test setup, or business validations — pure interaction layer
8. **Defensive by Design**: Every interactive method preceded by context-aware state waits with business rule validation
9. **Smart Context Injection**: Utility files discovered and reused + application context drives business method generation
10. **YAML Key Priority**: Always pass YAML key strings to BasePage — never raw selectors, with runtime validation
11. **Business Logic Separation**: Domain-aware business methods compose atomic actions with proper validation and error handling
12. **Accessibility First**: ARIA attributes integrated by default with WCAG compliance patterns
13. **Error Recovery Built-in**: Graceful degradation when MCP servers unavailable with intelligent fallback generation
14. **Performance Optimized**: Framework-specific optimizations (auto-waiting, batching, parallel execution where safe)
15. **Quality Assured**: Multi-layer validation with automatic fixing and comprehensive reporting
16. **Maintainability Focus**: Generated code follows project conventions with clear documentation and error messages
17. **Extensibility Ready**: Business context injection allows for easy enhancement and customization
18. **Precision Driven**: Smart filtering eliminates non-interactive elements and applies collision-safe naming

## Enhanced Precision Capabilities

### **Smart Element Analysis**
- Auto-filtering of decorative elements (dividers, spacers, layout containers)
- Collision detection with intelligent disambiguation  
- Context-aware wait strategies (visible/enabled/editable/stable)
- Cross-element dependency handling with chained waits

### **Business Context Integration**
- Application context drives business method generation
- Domain model integration for parameter validation
- Business rule injection for workflow methods
- Real-world data examples from context files

### **Advanced Framework Features**
- Runtime capability detection and optimization
- Framework-specific pattern application
- Auto-waiting optimization for modern frameworks
- Platform-specific error handling and recovery

### **Accessibility & Compliance**
- ARIA attribute integration and getter methods
- WCAG guideline adherence in generated methods
- Keyboard navigation support where applicable
- Screen reader compatibility validation

### **Quality & Reliability**
- Runtime YAML key validation against LocatorUtility
- Multi-layer error checking and auto-fixing
- Business logic validation against application context
- Performance optimization and parallel execution support

## Post-Generation Validation & Auto-Fix

**See comprehensive guide: [Validation and Auto-Fix Patterns](../skills/validation-and-autofix.md)**

After generating a page object, ALWAYS perform validation and auto-fix:
1. Check for errors using `get_errors` tool
2. Auto-fix import errors (multi-strategy path resolution)
3. Auto-create missing methods in BasePage
4. Apply framework-specific optimizations
5. Re-validate until no errors remain

Refer to the Validation and Auto-Fix skill file for detailed strategies and examples.

## CLI Command Template

Always use this command format for page object generation:

```powershell
& "C:/Program Files/Python313/python.exe" -m src.services.page_object_generator_service --yaml "YAML_PATH" --class ClassName --output "OUTPUT_DIR" --language LANGUAGE
```

**Parameters:**
- `--yaml`: Full absolute path to YAML locator file
- `--class`: Name of the page object class (PascalCase)
- `--output`: Full absolute output directory path — resolved from `copilot-agent.paths.yaml`
- `--language`: One of: `typescript-playwright`, `javascript-playwright`, `java-playwright`, `python-playwright`, `csharp-playwright`

**Resolving the Output Path from `copilot-agent.paths.yaml`:**
```yaml
# copilot-agent.paths.yaml
page_actions:
  base: "page-actions"   ← relative key; actual folder is Output/page-actions/
```
Confirm by checking where existing `.ts` page-action files live. For this project: `Output/page-actions/`.

**Example:**
```powershell
& "C:/Program Files/Python313/python.exe" -m src.services.page_object_generator_service `
  --yaml "C:\full\path\to\tests\loc\login_locators.yaml" `
  --class LoginPage `
  --output "C:\full\path\to\tests\page-actions" `
  --language typescript-playwright
```

**Enhanced Post-Generation Verification Checklist:**
1. ❌ **Selector Validation**: No raw CSS/XPath selector strings as arguments to BasePage methods + Runtime YAML key validation
2. ✅ **Key-Based Interactions**: All BasePage method calls pass validated YAML key strings (e.g., `'login_button'`)
3. ✅ **Smart Naming**: All multi-word YAML keys properly title-cased with collision detection and disambiguation
4. ❌ **Fallback Encapsulation**: No fallback locator logic in generated methods (handled by LocatorUtility internally)
5. ❌ **Assertion-Free Contract**: No assertion methods (`expect`, `assert`, `verify`) in page action class - pure actions only
6. ✅ **Enhanced Defensive Waits**: Every interactive method has context-aware waits (enabled/editable/stable) with dependency checks
7. ✅ **Business Composition**: Business workflow methods compose atomic actions with parameter validation and error handling
8. ✅ **Constructor Compliance**: Constructor passes locator file name without `.yaml` extension to BasePage
9. ✅ **Structural Integrity**: Output follows mandatory structure: Imports → Class → Constructor → Navigation → Atomic → Business → Getters
10. ✅ **Context Integration**: Business methods leverage application context and domain model for intelligent behavior
11. ✅ **Accessibility Support**: ARIA attributes integrated with appropriate getter methods where present
12. ✅ **Error Handling**: Comprehensive parameter validation and business rule checking in all methods
13. ✅ **Framework Optimization**: Generated code leverages detected framework capabilities (auto-waiting, web-first assertions)
14. ✅ **Documentation Quality**: Enhanced JSDoc with test identifiers, accessibility info, and business context
15. ✅ **Performance Awareness**: Efficient wait strategies and batch operations where applicable
