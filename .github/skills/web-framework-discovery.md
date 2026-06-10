---
name: web-framework-discovery
description: Dual MCP server context strategy for page object generation using MCP Context Server for application/domain knowledge and MCP Automation Server for framework patterns, BasePage method discovery, and utility scanning.
---

# Web Framework Discovery Patterns

## Dual MCP Server Context Strategy

The page object generator uses **two MCP servers** to gather comprehensive context:

### 1. MCP Context Server (Application Context)
Provides domain-specific application knowledge:
- **Application Context**: UI elements, page structure, navigation flows, user interactions
- **Domain Model**: Business entities, attributes, relationships, data structures
- **Business Rules**: Validations, calculations, constraints, workflow rules

**Context Files Location:**
- `data/context/application/{domain}_application_context.txt`
- `data/context/domain/{domain}_domain_model.txt`
- `data/context/business_rules/{domain}_business_rules.txt`

**What to Extract:**
- Page names and purposes
- UI elements and their behavior
- User workflows and navigation patterns
- Application-specific terminology
- Real data examples (product names, prices, categories)
- Entity names and attributes
- Data types and validation rules
- Business calculations and constraints
- Error handling requirements

### 2. MCP Automation Server (Framework Context)
Provides technical framework and language patterns:
- **Language Detection**: Target programming language (TypeScript, Python, Java, C#, JavaScript)
- **Framework Identification**: Automation framework (Playwright, Selenium, Cypress, etc.)
- **Base Classes**: Inheritance patterns, parent classes, abstract methods
- **Utility Classes**: Helper classes for locators, logging, configuration, assertions
- **Design Patterns**: Existing code patterns (inheritance, composition, dependency injection)
- **Naming Conventions**: Language-specific naming (camelCase, snake_case, PascalCase)
- **Import/Include Patterns**: How dependencies are managed in the target language

## MCP Automation Server Integration

### Verify and Start MCP Automation Server

Always check if the MCP Automation Server is accessible and start it if needed:

```typescript
// Check if MCP automation server tools are available
try {
  const availableTools = await tool_search_tool_regex("mcp_mcp_automatio.*");
  if (availableTools.length === 0) {
    throw new Error("MCP Automation Server tools not available");
  }
  console.log(`✅ MCP Automation Server verified: ${availableTools.length} tools available`);
} catch (error) {
  console.warn('⚠️ MCP Automation Server not available - starting server...');
  
  // Start MCP Automation Server
  await run_in_terminal({
    command: "python src/mcp/mcp_automation_server.py --config src/config/mcp_path.yaml",
    explanation: "Starting MCP Automation Server for framework context analysis",
    goal: "Initialize MCP server for dynamic framework discovery",
    isBackground: true,
    timeout: 10000
  });
  
  // Wait for server to start and verify tools are available
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const retryTools = await tool_search_tool_regex("mcp_mcp_automatio.*");
  if (retryTools.length === 0) {
    console.warn("⚠️ MCP Automation Server failed to start - falling back to manual discovery");
    throw new Error("MCP Automation Server unavailable");
  }
  
  console.log(`✅ MCP Automation Server started: ${retryTools.length} tools available`);
}
```

### Available MCP Automation Server Tools

Once the server is running, these tools become available for framework analysis:

- `mcp_mcp_automatio_ts_basePage_*` - BasePage method discovery and analysis
- `mcp_mcp_automatio_ts_browserManager_*` - Browser management pattern detection
- `mcp_mcp_automatio_ts_customWorld_*` - Custom world context and pattern analysis
- Additional tools based on project structure

### Execute Framework Context Scan

```typescript
// Use MCP automation server to discover framework context
try {
  const basePageContext = await mcp_mcp_automatio_ts_basePage_getPageContext();
  const browserContext = await mcp_mcp_automatio_ts_browserManager_createBrowserContext();
  const customWorldContext = await mcp_mcp_automatio_ts_customWorld_capturePageContext();
  
  // Extract framework patterns from discovered context
  const frameworkPatterns = parseFrameworkContext(
    basePageContext, 
    browserContext, 
    customWorldContext
  );
  
  console.log('✅ Framework context discovered via MCP Automation Server');
  console.log(`   Language: ${frameworkPatterns.language}`);
  console.log(`   Framework: ${frameworkPatterns.framework}`);
  console.log(`   Base Class: ${frameworkPatterns.baseClass}`);
  console.log(`   Methods: ${frameworkPatterns.methods.length} discovered`);
  
  return frameworkPatterns;
} catch (mcpError) {
  console.warn("⚠️ MCP Automation Server context failed - using manual discovery");
  console.error(mcpError.message);
  
  // Fallback to manual file reading
  return await manualFrameworkDiscovery();
}
```

## Fallback: Manual Framework Discovery

If MCP Automation Server is unavailable, fallback to manual discovery:

### Step 1: Search for Reusable Utility Files

Before reading BasePage, search the project for common utility files:

```typescript
// Search for utility files
const utilityFiles = await file_search({
  patterns: [
    '**/wait.ts', '**/wait.py', 
    '**/commonActions.java', '**/BaseHelper.cs', 
    '**/base_page.py', '**/utilities/*.ts'
  ]
});

// Search for base class patterns
const baseClassFiles = await grep_search({
  query: 'class.*BasePage|class.*BaseHelper|class.*CommonActions',
  isRegexp: true
});

console.log(`Found ${utilityFiles.length} utility files`);
console.log(`Found ${baseClassFiles.length} base class candidates`);
```

### Step 2: Read and Catalog Utility Methods

If utility files are found, read their method signatures:

```typescript
for (const utilityFile of utilityFiles) {
  const content = await read_file(utilityFile);
  const methods = extractMethodSignatures(content, {
    visibility: ['public', 'protected'],
    returnTypes: true,
    parameters: true,
    documentation: true
  });
  
  utilityMethods.push({
    file: utilityFile,
    methods: methods
  });
  
  console.log(`   ${utilityFile}: ${methods.length} methods`);
}

// These utility methods take priority over inline implementations
```

### Step 3: Extract BasePage Method Inventory

Read `framework/core/basePage.ts` (or equivalent) directly and catalog **every `protected` method**:

```typescript
const basePagePath = await findBasePage();
const basePageContent = await read_file(basePagePath);

// Extract all protected/public methods
const basePageMethods = extractMethodSignatures(basePageContent, {
  visibility: ['public', 'protected'],
  excludePrivate: true,
  includeAsync: true
});

console.log('BasePage Method Inventory:');
for (const method of basePageMethods) {
  console.log(`   ${method.name}${method.parameters} → ${method.returnType}`);
}
```

**Example BasePage Method Inventory (TypeScript/Playwright):**

```typescript
// Extracted LIVE from discovered base class file:
const basePageMethodInventory = [
  {
    name: 'clickElement',
    signature: 'clickElement(selector: string, options?: {timeout?, force?}): Promise<void>',
    purpose: 'Click an element with optional configuration'
  },
  {
    name: 'fillElement',
    signature: 'fillElement(selector: string, value: string, options?: {timeout?, clear?}): Promise<void>',
    purpose: 'Fill input/textarea with value'
  },
  {
    name: 'waitForElement',
    signature: 'waitForElement(selector: string, options?: {state?, timeout?}): Promise<Locator>',
    purpose: 'Wait for element with specific state'
  },
  {
    name: 'isElementVisible',
    signature: 'isElementVisible(selector: string, timeout?: number): Promise<boolean>',
    purpose: 'Check if element is visible'
  },
  {
    name: 'verifyElementText',
    signature: 'verifyElementText(selector: string, expectedText: string, options?: {timeout?, exact?}): Promise<boolean>',
    purpose: 'Verify element text matches expected value'
  },
  {
    name: 'getElementText',
    signature: 'getElementText(selector: string): Promise<string | null>',
    purpose: 'Get text content of element'
  },
  {
    name: 'getMultipleElementsText',
    signature: 'getMultipleElementsText(selector: string): Promise<string[]>',
    purpose: 'Get text from multiple matching elements'
  },
  {
    name: 'selectDropdownOption',
    signature: 'selectDropdownOption(selector: string, option: string): Promise<void>',
    purpose: 'Select option from dropdown'
  },
  {
    name: 'getElementAttribute',
    signature: 'getElementAttribute(selector: string, attribute: string): Promise<string | null>',
    purpose: 'Get attribute value from element'
  },
  {
    name: 'navigateTo',
    signature: 'navigateTo(url: string): Promise<void>',
    purpose: 'Navigate to URL'
  }
  // ... extract ALL additional methods found at runtime — never hardcode this list
];
```

### Step 4: Scan Existing Page-Action Files

Read existing page-action files to confirm:
- How multi-word YAML keys are converted to method names
- How element type prefixes are applied (`click`, `enter`, `get`, `verify`, `select`)
- How JSDoc is structured in existing reference methods
- Import patterns and paths
- Constructor patterns

```typescript
const existingPageActions = await file_search('**/page-actions/*.ts');
const referenceFile = existingPageActions[0];

if (referenceFile) {
  const content = await read_file(referenceFile);
  
  // Extract patterns
  const patterns = {
    importPattern: extractImportPattern(content),
    constructorPattern: extractConstructorPattern(content),
    namingPattern: extractMethodNamingPattern(content),
    jsdocPattern: extractJSDocPattern(content)
  };
  
  console.log('✅ Reference patterns extracted from:', referenceFile);
}
```

### Step 5: Build Element Type → BasePage Method Mapping

Map YAML element types to discovered BasePage methods:

| YAML `element_type` | Condition | BasePage Method | Prefix | Enhanced Defensive Wait |
|---|---|---|---|---|
| `input` | not hidden | `fillElement()` | `enter` | `waitForElement(key, {state: 'editable'})` |
| `textarea` | not hidden | `fillElement()` | `enter` | `waitForElement(key, {state: 'editable'})` |
| `button` | not hidden | `clickElement()` | `click` | `waitForElement(key, {state: 'enabled'})` |
| `link` | not hidden | `clickElement()` | `click` | `waitForElement(key, {state: 'visible'})` |
| `select` | — | `selectDropdownOption()` | `select` | `waitForElement(key, {state: 'visible'})` |
| `checkbox` | — | `clickElement()` | `toggle` | `waitForElement(key, {state: 'enabled'})` |
| `radio` | — | `clickElement()` | `select` | `waitForElement(key, {state: 'enabled'})` |
| `form` | — | `clickElement()` | `submit` | `waitForElement(key)` |
| `img` | — | `isElementVisible()` | `verify...IsDisplayed` | none |
| `span`, `p`, `label`, `h1`–`h6` | has text | `getElementText()` | `get...Text` | `waitForElement(key, {state: 'visible'})` |
| `div` | interactive | `clickElement()` | `click` | `waitForElement(key, {state: 'enabled'})` |
| `div` | decorative | **SKIP** | — | — |
| any | `is_hidden: true` | `waitForElement({state:'visible'})` | `waitFor...ToBeVisible` | — |
| any | `aria_label` present | `getElementAttribute(key, 'aria-label')` | `getAria...` | `waitForElement(key)` |

## Multi-Language Framework Discovery

### Language Detection Patterns

Detect target language from project structure:

```typescript
const languageDetection = async () => {
  // Check for language-specific files
  const tsFiles = await file_search('**/*.ts');
  const pyFiles = await file_search('**/*.py');
  const javaFiles = await file_search('**/*.java');
  const csFiles = await file_search('**/*.cs');
  const jsFiles = await file_search('**/*.js');
  
  // Determine primary language
  if (tsFiles.length > 0) return 'typescript';
  if (pyFiles.length > 0) return 'python';
  if (javaFiles.length > 0) return 'java';
  if (csFiles.length > 0) return 'csharp';
  if (jsFiles.length > 0) return 'javascript';
  
  return 'unknown';
};
```

### Framework Detection Patterns

Detect automation framework from dependencies and imports:

```typescript
const frameworkDetection = async () => {
  // Check package.json for Node.js projects
  const packageJson = await read_file('package.json');
  if (packageJson.includes('@playwright/test')) return 'playwright';
  if (packageJson.includes('cypress')) return 'cypress';
  if (packageJson.includes('webdriverio')) return 'webdriverio';
  
  // Check requirements.txt for Python projects
  const requirements = await read_file('requirements.txt');
  if (requirements.includes('playwright')) return 'playwright-python';
  if (requirements.includes('selenium')) return 'selenium-python';
  
  // Check pom.xml for Java projects
  const pomXml = await read_file('pom.xml');
  if (pomXml.includes('selenium-java')) return 'selenium-java';
  if (pomXml.includes('playwright')) return 'playwright-java';
  
  return 'unknown';
};
```

### Multi-Language Framework Discovery Rules

| Language | Base Class Pattern | Naming | Import Pattern | Type Annotations |
|---|---|---|---|---|
| TypeScript | `extends BasePage` | camelCase methods, PascalCase class | `import { BasePage } from '...'` | Full TypeScript types |
| Python | `class X(BasePage)` | `snake_case` methods | `from framework.base_page import BasePage` | Type hints |
| Java | `extends BasePage` | camelCase methods, PascalCase class | `import framework.BasePage;` | Generics |
| JavaScript | `extends BasePage` | camelCase methods, PascalCase class | `const { BasePage } = require('...')` | JSDoc only |
| C# | `: BasePage` | PascalCase everything | `using Framework.BasePage;` | Full C# types |

### Extract Framework Metadata

Extract remaining framework metadata from scanned files:

```typescript
const frameworkMetadata = {
  targetLanguage: await languageDetection(),
  frameworkType: await frameworkDetection(),
  baseClassPath: await findBaseClassPath(),
  importPattern: await extractImportPattern(),
  namingConvention: await detectNamingConvention(),
  asyncPattern: await detectAsyncPattern(),
  typeSystem: await detectTypeSystem()
};

console.log('Framework Metadata:');
console.log(`   Language: ${frameworkMetadata.targetLanguage}`);
console.log(`   Framework: ${frameworkMetadata.frameworkType}`);
console.log(`   Base Class: ${frameworkMetadata.baseClassPath}`);
console.log(`   Naming: ${frameworkMetadata.namingConvention}`);
```

## Framework Feature Detection

Detect framework-specific capabilities:

```typescript
const frameworkFeatures = {
  autoWaiting: await detectPlaywrightAutoWait(),
  webFirstAssertions: await detectWebFirstCapability(),
  visualTesting: await detectVisualTestingSupport(),
  networkInterception: await detectNetworkIntercepts(),
  parallelExecution: await detectParallelSupport(),
  mobileTesting: await detectMobileSupport(),
  apiTesting: await detectAPITestingSupport()
};

// Adjust generation based on detected features
if (frameworkFeatures.autoWaiting) {
  // Reduce explicit waits for Playwright's auto-waiting
  waitStrategy = 'minimal';
  console.log('✅ Auto-waiting detected - using minimal wait strategy');
} else {
  // Add comprehensive waits for other frameworks
  waitStrategy = 'explicit';
  console.log('⚠️ No auto-waiting - using explicit wait strategy');
}
```

### Feature-Specific Adjustments

```typescript
// Playwright-specific optimizations
if (framework === 'playwright') {
  // Playwright has built-in auto-waiting
  // Reduce redundant waits
  optimizations.push('remove_redundant_waits');
  
  // Use web-first assertions
  assertionStyle = 'web-first';
  
  // Enable trace on first retry
  enableTrace = true;
}

// Java/Selenium-specific patterns
if (framework === 'java-selenium') {
  // Add WebDriverWait patterns
  waitPattern = 'explicit_wait';
  
  // Add synchronization
  addFluentWait = true;
  
  // Page Factory pattern
  usePageFactory = true;
}

// Cypress-specific patterns
if (framework === 'cypress') {
  // Cypress commands are automatically retried
  waitStrategy = 'cypress_retry';
  
  // Chainable commands
  chainCommands = true;
}
```

## Error Recovery Patterns

### Graceful Degradation When MCP Servers Unavailable

```typescript
try {
  const appContext = await mcp_mcp_context_s_scan_workspace();
  const frameworkContext = await mcp_automation_server_scan();
  
  console.log('✅ Full context available - generating enhanced page objects');
  return generateEnhancedPageActions(appContext, frameworkContext);
} catch (error) {
  console.warn('⚠️ MCP servers unavailable - using fallback templates');
  console.error(error.message);
  
  // Fallback to basic generation with minimal context
  return generateBasicPageActions(yamlData, className);
}
```

### Malformed YAML Handling

```typescript
try {
  const yamlData = parseYAMLSchema(yamlContent);
  console.log('✅ YAML parsed successfully');
  return yamlData;
} catch (parseError) {
  console.error('❌ YAML parsing failed - attempting repair...');
  
  const repairedYAML = autoRepairYAML(yamlContent);
  if (!repairedYAML) {
    throw new Error(`Cannot repair YAML: ${parseError.message}`);
  }
  
  console.log('✅ YAML repaired successfully');
  return parseYAMLSchema(repairedYAML);
}
```

## Pre-Generation Checklist

Complete ALL points before running generation:

- [ ] **Framework Context**: BasePage method inventory built from live scan
- [ ] **Utility Discovery**: Reusable utility files discovered and cataloged
- [ ] **Naming Patterns**: Confirmed from existing page-action reference files
- [ ] **Element Mapping**: Element-type → method mapping table ready
- [ ] **Language Detection**: Target language confirmed
- [ ] **Framework Detection**: Automation framework confirmed
- [ ] **Import Patterns**: Correct import syntax identified
- [ ] **Base Class Path**: Absolute/relative path to base class confirmed
- [ ] **Naming Convention**: camelCase/snake_case/PascalCase confirmed
- [ ] **Async Pattern**: async/await pattern confirmed
- [ ] **Type System**: Type annotation style confirmed
- [ ] **Framework Features**: Auto-waiting, assertions, etc. detected
- [ ] **Error Recovery**: Fallback strategies prepared
- [ ] **MCP Servers**: Both context and automation servers verified/started
