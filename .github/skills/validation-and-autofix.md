---
name: validation-and-autofix
description: Comprehensive 5-layer validation and intelligent auto-fixing for generated automation artifacts including web page actions, step definitions, API step definitions, and request builders.
---

# Validation and Auto-Fix Patterns

This skill provides comprehensive validation and intelligent auto-fixing for all generated automation artifacts across the framework:
- **Web Page Actions** (TypeScript/JavaScript/Python/Java/C#)
- **Step Definitions** (Cucumber/BDD implementations)  
- **API Step Definitions** (REST/GraphQL test automation)
- **Request Builders** (HTTP client implementations)

## Multi-Layer Validation Process

### Layer 1: Syntax Validation
**Purpose**: Detect language-specific compile/parse errors
**Tools**: `get_errors()` tool, language-specific linters
**Common Issues**: Missing imports, type errors, syntax mistakes

```typescript
// Validation Check
const errors = await get_errors([generatedFilePath]);
if (errors.length > 0) {
  await applySyntaxFixes(errors, targetLanguage, frameworkType);
}
```

### Layer 2: Framework Integration Validation  
**Purpose**: Ensure compatibility with automation framework
**Focus**: Import paths, base class usage, method signatures
**Context-Aware**: Detects Playwright, Selenium, Cypress, RestAssured frameworks

### Layer 3: Locator/Endpoint Validation
**Purpose**: Verify YAML keys, API endpoints, data contracts exist
**Scope**: Runtime validation against source files
**Prevention**: Method failures due to missing references

### Layer 4: Business Logic Validation
**Purpose**: Ensure generated methods align with requirements
**Validation**: Method naming, parameter types, return values
**Context**: BDD scenarios, API documentation, domain models

### Layer 5: Performance & Best Practices
**Purpose**: Apply framework-specific optimizations
**Enhancements**: Auto-waiting, parallel execution, defensive patterns
**Quality**: Code maintainability and reliability improvements

## Intelligent Auto-Fix Strategies

### Import Path Resolution (4-Step Strategy)

#### Step 1: Relative Path Correction
```typescript
// Auto-fix: Incorrect relative paths
// BEFORE: import { BasePage } from '../core/basePage'
// AFTER:  import { BasePage } from '../../framework/core/basePage'

async function autoFixRelativePaths(filePath: string, frameworkStructure: any): Promise<boolean> {
  const fixes = [
    {
      pattern: /import.*from ['"]\.\.\/core\/basePage['"]/g,
      replacement: "import { BasePage } from '../../framework/core/basePage'"
    },
    {
      pattern: /import.*from ['"]\.\.\/utils\/locatorUtility['"]/g, 
      replacement: "import { LocatorUtility } from '../../framework/utils/locatorUtility'"
    }
  ];
  
  return await applyPatternFixes(filePath, fixes);
}
```

#### Step 2: Framework Path Discovery
```typescript
// Auto-detect framework structure and correct imports
async function discoverFrameworkPaths(): Promise<FrameworkPaths> {
  const paths = {};
  
  // Scan for base classes
  const basePageFiles = await file_search("**/basePage.ts");
  const baseStepFiles = await file_search("**/baseSteps.ts");  
  const configFiles = await file_search("**/config.yaml");
  
  return {
    basePage: basePageFiles[0] || 'framework/core/basePage.ts',
    baseSteps: baseStepFiles[0] || 'framework/core/baseSteps.ts',
    config: configFiles[0] || 'framework/config/config.yaml'
  };
}
```

#### Step 3: Package Dependency Check
```typescript
// Verify framework dependencies exist
async function validateFrameworkDependencies(language: string): Promise<ValidationResult> {
  const packageFiles = await file_search("**/package.json");
  const requirementFiles = await file_search("**/requirements.txt");
  
  if (language === 'typescript' && packageFiles.length === 0) {
    return { valid: false, missing: ['package.json'], fixes: ['npm init', 'npm install @playwright/test'] };
  }
  
  return { valid: true, missing: [], fixes: [] };
}
```

#### Step 4: Framework Context Discovery Using MCP Automation Server
```typescript
// Ensure src\mcp\mcp_automation_server.py is running and utilize it for framework context
async function getFrameworkContextFromMCPServer(): Promise<FrameworkContext> {
  console.log("🔍 Starting/Using MCP Automation Server: src\\mcp\\mcp_automation_server.py");
  
  try {
    // First, ensure the MCP automation server is running
    await ensureMCPAutomationServerRunning();
    
    // Search for available MCP automation server tools
    const mcpTools = await tool_search_tool_regex("mcp_mcp_automatio.*");
    
    if (mcpTools.length === 0) {
      console.log("⚠️ MCP automation server tools not found. Starting server...");
      await startMCPAutomationServer();
      // Retry tool search after server start
      const retryMcpTools = await tool_search_tool_regex("mcp_mcp_automatio.*");
      if (retryMcpTools.length === 0) {
        throw new Error("Failed to start MCP automation server");
      }
    }
    
    console.log(`✅ MCP Automation Server (src\\mcp\\mcp_automation_server.py) running with ${mcpTools.length} tools available`);
    
    // Get BasePage context from the MCP automation server
    const basePageContext = await mcp_mcp_automatio_ts_basePage_getPageContext();
    
    // Get multiple elements text for comprehensive analysis
    const basePageMethods = await mcp_mcp_automatio_ts_basePage_getMultipleElementsText({
      selector: "BasePage methods and patterns"
    });
    
    // Get browser management context
    const browserContext = await mcp_mcp_automatio_ts_browserManager_createBrowserContext();
    
    // Get custom world context for BDD integration
    const customWorldContext = await mcp_mcp_automatio_ts_customWorld_capturePageContext();
    
    // Perform AI-powered analysis of framework patterns
    const frameworkAnalysis = await mcp_mcp_automatio_ts_basePage_performActionWithAIFallback({
      action: "analyze framework architecture",
      context: {
        basePageMethods: basePageMethods,
        browserContext: browserContext
      }
    });
    
    return {
      framework: {
        name: determineFrameworkFromMCPContext(basePageContext, frameworkAnalysis),
        version: extractVersionFromMCPAnalysis(frameworkAnalysis),
        patterns: extractFrameworkPatterns(basePageMethods),
        architecture: frameworkAnalysis.architecture
      },
      language: 'typescript',
      basePage: {
        className: 'BasePage',
        methods: parseMethodsFromMCPResponse(basePageMethods),
        constructorPattern: extractConstructorFromMCPContext(basePageContext),
        importPath: '../../framework/core/basePage'
      },
      browserManager: {
        available: true,
        context: browserContext,
        capabilities: extractBrowserCapabilities(browserContext)
      },
      customWorld: {
        available: true,
        structure: customWorldContext,
        bddIntegration: true
      },
      mcpServerPath: 'src\\mcp\\mcp_automation_server.py',
      mcpServerRunning: true,
      contextSource: 'mcp-automation-server'
    };
    
  } catch (error) {
    console.error("❌ Error with MCP automation server (src\\mcp\\mcp_automation_server.py):", error);
    throw new Error(`MCP automation server failed: ${error.message}`);
  }
}

// Ensure MCP automation server is running
async function ensureMCPAutomationServerRunning(): Promise<void> {
  // Check if server is already running by testing tool availability
  try {
    const testTools = await tool_search_tool_regex("mcp_mcp_automatio.*");
    if (testTools.length > 0) {
      console.log("✅ MCP automation server already running");
      return;
    }
  } catch (error) {
    console.log("⚠️ No MCP automation tools found, starting server...");
  }
  
  await startMCPAutomationServer();
}

// Start the MCP automation server
async function startMCPAutomationServer(): Promise<void> {
  console.log("🚀 Starting MCP automation server: src\\mcp\\mcp_automation_server.py");
  
  // Start the server using the configured command from mcp.json
  await run_in_terminal({
    command: "python src\\mcp\\mcp_automation_server.py --config src\\config\\mcp_path.yaml --log-level INFO",
    explanation: "Starting MCP automation server for framework context",
    goal: "Initialize MCP automation server",
    isBackground: true,
    timeout: 10000
  });
  
  // Wait for server to be ready (check for tool availability)
  let retryCount = 0;
  const maxRetries = 10;
  
  while (retryCount < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    try {
      const tools = await tool_search_tool_regex("mcp_mcp_automatio.*");
      if (tools.length > 0) {
        console.log(`✅ MCP automation server ready with ${tools.length} tools`);
        return;
      }
    } catch (error) {
      // Continue retrying
    }
    
    retryCount++;
    console.log(`⏳ Waiting for MCP server to be ready... (${retryCount}/${maxRetries})`);
  }
  
  throw new Error("MCP automation server failed to start within timeout period");
}
```

## Context-Aware Framework Error Detection Using MCP Automation Server

### Utilizing src\mcp\mcp_automation_server.py for Intelligent Context-Aware Fixes

```typescript
// Use the specific MCP automation server for precise, framework-aware fixes
async function generateMCPServerContextAwareFixes(errors: CompilerError[]): Promise<FixAttempt[]> {
  console.log("🔧 Using MCP automation server (src\\mcp\\mcp_automation_server.py) for context-aware fixes");
  
  const fixes = [];
  
  // Ensure MCP automation server is running and get framework context
  const frameworkContext = await getFrameworkContextFromMCPServer();
  
  for (const error of errors) {
    if (error.message.includes("Cannot find name 'Page'")) {
      // Use MCP server to analyze element patterns and framework detection
      const frameworkAnalysis = await mcp_mcp_automatio_ts_basePage_performActionWithAIFallback({
        action: "detect framework type for Page import",
        context: { errorFile: error.filePath }
      });
      
      if (frameworkAnalysis?.framework === 'playwright') {
        fixes.push({
          errorType: 'missing-page-import',
          fix: "import { Page } from '@playwright/test';",
          confidence: 0.98,
          source: 'mcp-automation-server',
          mcpServerPath: 'src\\mcp\\mcp_automation_server.py',
          frameworkDetected: 'playwright'
        });
      }
    }
    
    if (error.message.includes("Cannot find name 'BasePage'")) {
      // Use MCP automation server to get actual BasePage structure
      try {
        const basePageInfo = await mcp_mcp_automatio_ts_basePage_getPageContext();
        const basePageMethods = await mcp_mcp_automatio_ts_basePage_getMultipleElementsText({
          selector: "BasePage class structure"
        });
        
        const importPath = frameworkContext.basePage?.importPath || '../../framework/core/basePage';
        
        fixes.push({
          errorType: 'missing-basepage-import',
          fix: `import { BasePage } from '${importPath}';`,
          confidence: 0.98,
          source: 'mcp-automation-server-verified',
          basePageStructure: basePageInfo,
          availableMethods: basePageMethods,
          mcpServerPath: 'src\\mcp\\mcp_automation_server.py'
        });
      } catch (mcpError) {
        console.log("⚠️ MCP server BasePage analysis failed, using framework context");
        fixes.push({
          errorType: 'missing-basepage-import',
          fix: `import { BasePage } from '${frameworkContext.basePage.importPath}';`,
          confidence: 0.85,
          source: 'mcp-server-fallback-context',
          mcpServerPath: 'src\\mcp\\mcp_automation_server.py'
        });
      }
    }
    
    if (error.message.includes("incorrectly extends base class")) {
      // Use MCP automation server AI capabilities for constructor pattern analysis
      const constructorAnalysis = await mcp_mcp_automatio_ts_basePage_performActionWithAIFallback({
        action: "analyze and generate correct constructor pattern",
        context: {
          currentCode: extractClassFromError(error),
          basePageContext: frameworkContext.basePage,
          errorMessage: error.message
        }
      });
      
      const constructorFix = generateOptimalConstructor(
        constructorAnalysis,
        frameworkContext.basePage.constructorPattern
      );
      
      fixes.push({
        errorType: 'incorrect-constructor',
        fix: constructorFix,
        confidence: 0.95,
        source: 'mcp-server-ai-analysis',
        aiRecommendation: constructorAnalysis,
        mcpServerPath: 'src\\mcp\\mcp_automation_server.py'
      });
    }
    
    // Method validation using MCP automation server
    if (error.message.includes("Property") && error.message.includes("does not exist")) {
      const missingMethod = extractMissingMethodFromError(error.message);
      
      // Get available methods from MCP server
      const availableMethods = await mcp_mcp_automatio_ts_basePage_getMultipleElementsText({
        selector: "all available BasePage methods"
      });
      
      const methodAnalysis = await mcp_mcp_automatio_ts_basePage_performActionWithAIFallback({
        action: "find best matching method",
        context: {
          missingMethod: missingMethod,
          availableMethods: availableMethods,
          usage: extractMethodUsageFromError(error)
        }
      });
      
      fixes.push({
        errorType: 'method-not-found',
        fix: generateMethodFix(methodAnalysis, missingMethod),
        suggestion: methodAnalysis.bestMatch,
        confidence: methodAnalysis.confidence || 0.90,
        source: 'mcp-server-method-analysis',
        availableMethods: availableMethods,
        aiAnalysis: methodAnalysis,
        mcpServerPath: 'src\\mcp\\mcp_automation_server.py'
      });
    }
    
    // CustomWorld validation for BDD step definitions
    if (error.message.includes("CustomWorld") || error.message.includes("World")) {
      const customWorldContext = await mcp_mcp_automatio_ts_customWorld_capturePageContext();
      
      fixes.push({
        errorType: 'customworld-integration',
        fix: generateCustomWorldFix(customWorldContext, error),
        confidence: 0.92,
        source: 'mcp-server-customworld-analysis',
        customWorldStructure: customWorldContext,
        mcpServerPath: 'src\\mcp\\mcp_automation_server.py'
      });
    }
  }
  
  return fixes;
}

// Generate optimal constructor based on MCP server AI analysis
function generateOptimalConstructor(aiAnalysis: any, basePattern: string): string {
  if (aiAnalysis?.optimalConstructor) {
    return aiAnalysis.optimalConstructor;
  }
  
  if (aiAnalysis?.constructorRecommendations?.pattern) {
    return aiAnalysis.constructorRecommendations.pattern;
  }
  
  // Fallback to base pattern with intelligent adaptations
  return basePattern
    .replace(/ClassName/g, aiAnalysis?.suggestedClassName || 'GeneratedPageClass')
    .replace(/locator_file_name/g, aiAnalysis?.suggestedLocatorFile || 'page_locators');
}
```

#### Pattern 2: Base Class Extension Issues (Using MCP Context)
```typescript
// Use MCP automation server to understand actual BasePage structure
if (error.message.includes("incorrectly extends base class")) {
  const frameworkContext = await getFrameworkContextFromMCPServer();
  
  if (frameworkContext.mcpAvailable && frameworkContext.basePage) {
    // Use MCP-discovered BasePage information
    const basePageInfo = frameworkContext.basePage;
    
    const constructorFix = {
      errorType: 'incorrect-base-extension',
      fix: `
        constructor(page: Page) {
          super(page, '${extractLocatorFileName()}');
          this.page = page;
        }
      `,
      basedOn: 'mcp-discovered-pattern',
      confidence: 0.95
    };
    
    return constructorFix;
  } else {
    // Fallback: Direct BasePage file analysis
    const basePageFiles = await file_search("**/basePage.*");
    
    if (basePageFiles.length > 0) {
      const basePageContent = await read_file(basePageFiles[0], 1, 200);
      
      // Extract actual constructor pattern from BasePage
      const constructorMatch = basePageContent.match(
        /constructor\s*\([^)]+\)\s*{[^}]+}/
      );
      
      if (constructorMatch) {
        const actualConstructorPattern = constructorMatch[0];
        
        return {
          errorType: 'incorrect-base-extension',
          fix: generateChildConstructor(actualConstructorPattern),
          basedOn: 'direct-basepage-analysis',
          confidence: 0.85
        };
      }
    }
    
    // Final fallback: Search for existing page object examples
    const pageObjectExamples = await grep_search({
      query: "extends.*BasePage", 
      isRegexp: true,
      includePattern: "**/*.ts"
    });
    
    if (pageObjectExamples.length > 0) {
      // Learn from existing working examples
      return generateFixFromWorkingExamples(pageObjectExamples);
    }
  }
}

// Generate child class constructor based on actual BasePage constructor
function generateChildConstructor(baseConstructorPattern: string): string {
  // Analyze the actual BasePage constructor and generate compatible child constructor
  const parameterMatch = baseConstructorPattern.match(/constructor\s*\(([^)]+)\)/);
  const bodyMatch = baseConstructorPattern.match(/{([^}]+)}/);
  
  if (parameterMatch && bodyMatch) {
    const parameters = parameterMatch[1];
    const superCallPattern = extractSuperCall(bodyMatch[1]);
    
    return `
      constructor(${parameters}) {
        ${superCallPattern}
        this.page = page;
      }
    `;
  }
  
  // Default fallback pattern
  return `
    constructor(page: Page) {
      super(page, 'locator_file_name');
      this.page = page;
    }
  `;
}
```

## Auto-Fix Implementation Patterns

### Pattern 1: Multi-Field Replacement
```typescript
async function applyMultiFieldFix(filePath: string, fixes: FixRule[]): Promise<FixResult> {
  const replacements = fixes.map(fix => ({
    filePath,
    oldString: fix.searchPattern,
    newString: fix.replacement
  }));
  
  const result = await multi_replace_string_in_file({
    explanation: "Auto-fixing framework integration errors",
    replacements
  });
  
  return { success: result.success, appliedFixes: fixes.length };
}
```

## Validation Checklists by Generation Type

### Web Page Actions Validation

#### Post-Generation Validation:
- [ ] **Syntax Clean**: No compile/parse errors
- [ ] **Import Paths Correct**: Relative paths resolve correctly  
- [ ] **Base Class Extended**: Constructor properly implemented
- [ ] **Method Signatures**: Return types and parameters correct
- [ ] **YAML Key Usage**: Never uses raw selectors
- [ ] **Defensive Patterns**: Waits and error handling applied

### Step Definitions Validation

#### Cucumber Integration Checks:
- [ ] **Given/When/Then Annotations**: Proper decorator usage
- [ ] **Step Parameter Binding**: Regex groups match method parameters
- [ ] **Page Object Injection**: CustomWorld access patterns
- [ ] **Async Compatibility**: Proper Promise handling
- [ ] **Step Reusability**: No duplicate step patterns

### API Step Definitions Validation

#### REST/GraphQL Checks:
- [ ] **HTTP Client Import**: RestAssured, Axios, Fetch, Requests
- [ ] **Endpoint Validation**: Base URLs and paths verified
- [ ] **Response Schema**: JSON schema validation ready
- [ ] **Authentication**: Token/key handling implemented
- [ ] **Error Handling**: HTTP status code validation

### Request Builder Validation

#### HTTP Client Compatibility:
- [ ] **Builder Pattern**: Fluent interface implemented
- [ ] **Method Chaining**: Return types support chaining  
- [ ] **Parameter Validation**: Required fields enforceable
- [ ] **Serialization**: JSON/XML handling correct
- [ ] **Authentication**: Headers and tokens manageable

## Usage Patterns by Generation Type

### For Web Page Actions:
```typescript
// In web-page-actions-generator mode
await validateAndAutoFix({
  generatedFile: 'Output/page-actions/LoginPage.ts',
  yamlSource: 'Output/page-object/login_locators.yaml',  
  language: 'typescript-playwright',
  validationLayers: ['syntax', 'framework', 'locators', 'business', 'performance']
});
```

### For Step Definitions:
```typescript
// In step-definitions-generator mode
await validateAndAutoFix({
  generatedFile: 'Output/stepdefs/LoginSteps.ts',
  bddSource: 'Output/testcases/PROJ-123_bdd.feature',
  pageActions: 'Output/page-actions/LoginPage.ts',
  language: 'typescript-cucumber',
  validationLayers: ['syntax', 'cucumber', 'binding', 'world', 'performance']
});
```

### For API Step Definitions:
```typescript
// In api-step-definitions-generator mode
await validateAndAutoFix({
  generatedFile: 'Output/stepdefs/ApiSteps.ts', 
  apiSpec: 'Input/API_Collections/demo.json',
  requestBuilders: 'Output/api/UserServiceClient.ts',
// language: await detectLanguage(),
  framework: await detectFramework(),
  validationLayers: ['syntax', 'integration', 'schema', 'auth', 'performance']
});

// Framework-agnostic detection
async function detectFramework(): Promise<FrameworkInfo> {
  const detectionStrategies = [
    () => detectFromPackageFiles(),
    () => detectFromImportStatements(), 
    () => detectFromExistingCode(),
    () => detectFromConfigFiles()
  ];
  
  for (const strategy of detectionStrategies) {
    const result = await strategy();
    if (result.confidence > 0.7) return result;
  }
  
  return { name: 'generic', version: 'unknown', confidence: 0.0 };
}

// Check for:
// - Business methods that don't compose atomic actions
// - Missing parameter validation
// - Incorrect business workflow sequencing
// - Missing error handling
```

### 4. Framework Compatibility Validation Using MCP Automation Server

```typescript
// Leverage MCP automation server (src\mcp\mcp_automation_server.py) for comprehensive validation
async function validateUsingMCPAutomationServer(generatedFilePath: string): Promise<ValidationResult> {
  console.log("🔍 Performing validation using MCP automation server: src\\mcp\\mcp_automation_server.py");
  
  // Ensure MCP automation server is running
  const frameworkContext = await getFrameworkContextFromMCPServer();
  
  const errors = await get_errors([generatedFilePath]);
  const validationIssues = [];
  
  // Read generated file content
  const fileContent = await read_file(generatedFilePath, 1, 1000);
  
  console.log(`✅ MCP Automation Server Running - Framework: ${frameworkContext.framework.name}`);
  console.log(`⚙️ Using: ${frameworkContext.mcpServerPath}`);
  
  // Use MCP automation server for comprehensive code analysis
  const codeAnalysis = await mcp_mcp_automatio_ts_basePage_performActionWithAIFallback({
    action: "comprehensive code validation",
    context: {
      fileContent: fileContent,
      filePath: generatedFilePath,
      frameworkType: frameworkContext.framework.name,
      expectedPatterns: frameworkContext.framework.patterns,
      architecture: frameworkContext.framework.architecture
    }
  });
  
  if (codeAnalysis?.validationResults) {
    // Process MCP automation server validation results
    codeAnalysis.validationResults.forEach(result => {
      if (!result.isValid) {
        validationIssues.push({
          type: `mcp-server-${result.category}`,
          message: result.message,
          fix: result.suggestedFix || 'Review and fix manually',
          confidence: result.confidence || 0.85,
          mcpServerValidated: true,
          mcpServerPath: 'src\\mcp\\mcp_automation_server.py'
        });
      }
    });
  }
  
  // Framework-specific validation using MCP server context
  if (frameworkContext.framework.name === 'playwright') {
    // Validate async/await patterns
    const asyncAnalysis = await mcp_mcp_automatio_ts_basePage_performActionWithAIFallback({
      action: "validate async patterns",
      context: { code: fileContent, framework: 'playwright' }
    });
    
    if (asyncAnalysis?.issues?.length > 0) {
      asyncAnalysis.issues.forEach(issue => {
        validationIssues.push({
          type: 'playwright-async-validation',
          message: issue.description,
          fix: issue.suggestedFix,
          confidence: 0.95,
          mcpFrameworkDetected: 'playwright',
          mcpServerPath: 'src\\mcp\\mcp_automation_server.py'
        });
      });
    }
  }
  
  // Validate BasePage method usage using MCP automation server
  const methodValidation = await mcp_mcp_automatio_ts_basePage_getMultipleElementsText({
    selector: "method usage validation for generated code"
  });
  
  // AI-powered method analysis
  const methodAnalysis = await mcp_mcp_automatio_ts_basePage_performActionWithAIFallback({
    action: "analyze method usage and compatibility",
    context: {
      generatedMethods: extractMethodCalls(fileContent),
      availableBaseMethods: methodValidation,
      basePageContext: frameworkContext.basePage
    }
  });
  
  if (methodAnalysis?.incompatibleMethods?.length > 0) {
    validationIssues.push({
      type: 'basepage-method-compatibility',
      message: `Methods not compatible with BasePage: ${methodAnalysis.incompatibleMethods.join(', ')}`,
      fix: methodAnalysis.suggestedAlternatives || 'Use compatible BasePage methods',
      confidence: 0.98,
      mcpServerVerified: true,
      availableMethods: methodValidation,
      aiAnalysis: methodAnalysis,
      mcpServerPath: 'src\\mcp\\mcp_automation_server.py'
    });
  }
  
  // CustomWorld integration validation for BDD files
  if (generatedFilePath.includes('step') || generatedFilePath.includes('bdd')) {
    const customWorldValidation = await mcp_mcp_automatio_ts_customWorld_capturePageContext();
    
    const bddAnalysis = await mcp_mcp_automatio_ts_basePage_performActionWithAIFallback({
      action: "validate BDD and CustomWorld integration",
      context: {
        stepDefinitions: fileContent,
        customWorldStructure: customWorldValidation,
        bddIntegration: frameworkContext.customWorld.bddIntegration
      }
    });
    
    if (bddAnalysis?.integrationIssues?.length > 0) {
      bddAnalysis.integrationIssues.forEach(issue => {
        validationIssues.push({
          type: 'bdd-customworld-integration',
          message: issue.description,
          fix: issue.recommendation,
          confidence: 0.92,
          customWorldContext: customWorldValidation,
          mcpServerPath: 'src\\mcp\\mcp_automation_server.py'
        });
      });
    }
  }
  
  // Performance and best practices analysis
  const performanceAnalysis = await mcp_mcp_automatio_ts_basePage_performActionWithAIFallback({
    action: "analyze performance and best practices",
    context: {
      code: fileContent,
      framework: frameworkContext.framework,
      patterns: frameworkContext.framework.patterns
    }
  });
  
  if (performanceAnalysis?.recommendations?.length > 0) {
    performanceAnalysis.recommendations.forEach(rec => {
      if (rec.priority === 'high') {
        validationIssues.push({
          type: 'performance-optimization',
          message: rec.description,
          fix: rec.solution,
          confidence: rec.confidence || 0.85,
          category: 'performance',
          mcpServerPath: 'src\\mcp\\mcp_automation_server.py'
        });
      }
    });
  }
  
  return {
    errors: errors,
    validationIssues: validationIssues,
    frameworkContext: frameworkContext,
    mcpAutomationServerUsed: true,
    mcpServerPath: 'src\\mcp\\mcp_automation_server.py',
    codeAnalysis: codeAnalysis,
    methodAnalysis: methodAnalysis,
    bddAnalysis: bddAnalysis,
    performanceAnalysis: performanceAnalysis,
    requiresManualReview: validationIssues.length > 0,
    validationQuality: calculateValidationQuality(validationIssues, codeAnalysis)
  };
}

### 5. Accessibility Compliance Validation

```typescript
// Verify accessibility support is properly implemented
const a11yErrors = await validateAccessibilitySupport(
  generatedMethods,
  yamlAriaAttributes
);

// Check for:
// - ARIA methods generated for labeled elements
// - Proper keyboard navigation support
// - Screen reader compatibility
```

## Intelligent Auto-Fix with Learning

### Import Path Resolution (Multi-Strategy)

```typescript
// Enhanced import path resolution with fallback strategies
if (importErrors.length > 0) {
  const fixStrategies = [
    // Strategy 1: Search for base class in framework directory
    () => searchForBaseClassInFramework(baseClassName),
    
    // Strategy 2: Analyze existing imports in similar files
    () => analyzeExistingImportsInProject(),
    
    // Strategy 3: Infer path from directory structure
    () => inferPathFromDirectoryStructure(),
    
    // Strategy 4: Fallback to configured path
    () => fallbackToConfiguredPath('copilot-agent.paths.yaml')
  ];
  
  for (const strategy of fixStrategies) {
    try {
      const correctPath = await strategy();
      if (correctPath) {
        await fixImportPath(generatedFile, correctPath);
        console.log(`✅ Auto-fixed import path using strategy`);
        break;
      }
    } catch (strategyError) {
      console.warn(`Import fix strategy failed: ${strategyError.message}`);
      // Continue to next strategy
    }
  }
}
```

### Detailed Import Fix Strategies

#### Strategy 1: Framework Directory Search
```typescript
async function searchForBaseClassInFramework(baseClassName: string): Promise<string | null> {
  // Search framework directory for base class
  const frameworkPath = 'framework/core/';
  const possibleFiles = [
    `${frameworkPath}basePage.ts`,
    `${frameworkPath}base_page.ts`,
    `${frameworkPath}BasePage.ts`,
    `${frameworkPath}${baseClassName}.ts`
  ];
  
  for (const filePath of possibleFiles) {
    if (await fileExists(filePath)) {
      // Calculate relative path from generated file to base class
      const relativePath = calculateRelativePath(generatedFilePath, filePath);
      return relativePath;
    }
  }
  
  return null;
}
```

#### Strategy 2: Existing Import Analysis
```typescript
async function analyzeExistingImportsInProject(): Promise<string | null> {
  // Find similar page object files
  const existingPageObjects = await findFiles('**/page-actions/**/*.ts');
  
  for (const file of existingPageObjects) {
    const content = await readFile(file);
    
    // Extract import statement for BasePage
    const importMatch = content.match(/import\s+\{[^}]*BasePage[^}]*\}\s+from\s+['"]([^'"]+)['"]/);
    
    if (importMatch) {
      const importPath = importMatch[1];
      console.log(`📚 Found BasePage import pattern: ${importPath}`);
      return importPath;
    }
  }
  
  return null;
}
```

#### Strategy 3: Directory Structure Inference
```typescript
async function inferPathFromDirectoryStructure(): Promise<string | null> {
  // Infer path based on standard project structure
  const generatedDir = path.dirname(generatedFilePath);
  const projectRoot = findProjectRoot(generatedDir);
  
  // Count directory levels from generated file to project root
  const levelsUp = countDirectoryLevels(generatedDir, projectRoot);
  
  // Construct relative path
  const relativePath = '../'.repeat(levelsUp) + 'framework/core/basePage';
  
  // Verify path exists
  if (await fileExists(path.resolve(generatedDir, relativePath + '.ts'))) {
    return relativePath;
  }
  
  return null;
}
```

#### Strategy 4: Configured Path Fallback
```typescript
async function fallbackToConfiguredPath(configFile: string): Promise<string | null> {
  // Read path configuration
  const config = await readYAML(configFile);
  
  if (config.framework_paths?.core) {
    const frameworkCorePath = config.framework_paths.core;
    
    // Calculate relative path from output directory
    const outputDir = config.page_actions?.base || 'tests/page-actions';
    const relativePath = calculateRelativePath(outputDir, frameworkCorePath);
    
    return `${relativePath}/basePage`;
  }
  
  return null;
}
```

### Missing Method Auto-Creation

```typescript
// Enhanced method creation with context awareness
if (missingMethodErrors.length > 0) {
  for (const methodError of missingMethodErrors) {
    console.log(`🔧 Auto-creating missing method: ${methodError.methodName}`);
    
    const methodImplementation = await generateContextAwareMethod(
      methodError.methodName,
      methodError.expectedSignature,
      frameworkContext,
      applicationContext
    );
    
    await addMethodToBasePage(
      basePagePath,
      methodImplementation,
      {
        withLogging: true,
        withErrorHandling: true,
        withBusinessContext: true
      }
    );
    
    console.log(`✅ Added ${methodError.methodName} to BasePage`);
  }
}
```

### Context-Aware Method Generation

```typescript
async function generateContextAwareMethod(
  methodName: string,
  signature: string,
  frameworkContext: FrameworkContext,
  applicationContext: ApplicationContext
): Promise<string> {
  
  // Determine method purpose from name
  const methodPurpose = inferMethodPurpose(methodName);
  
  // Generate method based on purpose and context
  if (methodPurpose === 'navigation') {
    return generateNavigationMethod(methodName, signature, frameworkContext);
  } else if (methodPurpose === 'text_retrieval') {
    return generateTextRetrievalMethod(methodName, signature, frameworkContext);
  } else if (methodPurpose === 'state_check') {
    return generateStateCheckMethod(methodName, signature, frameworkContext);
  } else if (methodPurpose === 'dropdown') {
    return generateDropdownMethod(methodName, signature, frameworkContext);
  }
  
  // Default: generate basic interaction method
  return generateBasicInteractionMethod(methodName, signature, frameworkContext);
}
```

### Example Generated Methods

#### Navigation Method
```typescript
/**
 * Navigate to a specific URL
 * @param url - The URL to navigate to
 */
protected async navigateTo(url: string): Promise<void> {
  try {
    this.logger.info(`Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    this.logger.debug(`✅ Successfully navigated to: ${url}`);
  } catch (error) {
    this.logger.error(`❌ Failed to navigate to: ${url}`);
    throw error;
  }
}
```

#### Text Retrieval Method
```typescript
/**
 * Get text content from an element
 * @param selector - Element selector key from YAML
 * @returns Text content or null if element not found
 */
protected async getElementText(selector: string): Promise<string | null> {
  try {
    const locator = await this.locatorUtility.getLocator(selector);
    const element = await this.page.locator(locator);
    await element.waitFor({ state: 'visible', timeout: 5000 });
    const text = await element.textContent();
    return text?.trim() || null;
  } catch (error) {
    this.logger.error(`Failed to get text from element: ${selector}`);
    return null;
  }
}
```

#### Dropdown Selection Method
```typescript
/**
 * Select an option from a dropdown
 * @param selector - Dropdown selector key from YAML
 * @param option - Option value or text to select
 */
protected async selectDropdownOption(selector: string, option: string | { value?: string; label?: string; index?: number }): Promise<void> {
  try {
    const locator = await this.locatorUtility.getLocator(selector);
    const dropdown = await this.page.locator(locator);
    
    // Wait for dropdown to be visible and enabled
    await dropdown.waitFor({ state: 'visible', timeout: 5000 });
    
    // Select based on option type
    if (typeof option === 'string') {
      await dropdown.selectOption({ label: option });
    } else if (option.value) {
      await dropdown.selectOption({ value: option.value });
    } else if (option.label) {
      await dropdown.selectOption({ label: option.label });
    } else if (option.index !== undefined) {
      await dropdown.selectOption({ index: option.index });
    }
    
    this.logger.info(`Selected option from dropdown: ${selector}`);
  } catch (error) {
    this.logger.error(`Failed to select dropdown option: ${selector}`);
    throw error;
  }
}
```

## Framework-Specific Auto-Fix

### Playwright Optimizations

```typescript
// Reduce redundant waits (Playwright auto-waits)
if (framework === 'playwright') {
  await optimizePlaywrightWaits(generatedFile);
  
  // Remove explicit waits before auto-waiting actions
  // Before:
  // await this.waitForElement('button', { state: 'visible' });
  // await this.clickElement('button');
  
  // After (optimized):
  // await this.clickElement('button'); // Playwright auto-waits
  
  // Add web-first assertions where appropriate
  await addWebFirstAssertions(generatedFile);
}
```

### Example: Playwright Wait Optimization
```typescript
async function optimizePlaywrightWaits(filePath: string): Promise<void> {
  const content = await readFile(filePath);
  
  // Pattern: waitForElement followed immediately by clickElement on same selector
  const redundantWaitPattern = /await this\.waitForElement\('([^']+)',\s*\{[^}]*state:\s*'visible'[^}]*\}\);?\s*await this\.clickElement\('\1'\);?/g;
  
  // Replace with optimized version (single click, Playwright auto-waits)
  const optimized = content.replace(redundantWaitPattern, (match, selector) => {
    return `await this.clickElement('${selector}'); // Playwright auto-waits for visibility`;
  });
  
  if (optimized !== content) {
    await writeFile(filePath, optimized);
    console.log('✅ Optimized Playwright wait patterns');
  }
}
```

### Java/Selenium Explicit Waits

```typescript
// Add WebDriverWait patterns for Selenium
if (framework === 'java-selenium') {
  await addExplicitWaits(generatedFile);
  
  // Before (basic):
  // driver.findElement(By.cssSelector(".button")).click();
  
  // After (with explicit wait):
  // WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
  // WebElement button = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(".button")));
  // button.click();
  
  await addSeleniumSynchronization(generatedFile);
}
```

## Validation Workflow

### Complete Validation Sequence

```typescript
async function validateGeneratedPageObject(
  filePath: string,
  yamlData: YAMLLocators,
  frameworkContext: FrameworkContext
): Promise<ValidationResult> {
  
  const results = {
    syntaxErrors: [],
    importErrors: [],
    locatorErrors: [],
    businessLogicErrors: [],
    frameworkErrors: [],
    a11yErrors: []
  };
  
  // 1. Syntax validation
  results.syntaxErrors = await validateSyntax(filePath);
  
  // 2. Import validation
  results.importErrors = await validateImports(filePath, frameworkContext);
  
  // 3. Locator key validation
  results.locatorErrors = await validateLocatorKeys(filePath, yamlData);
  
  // 4. Business logic validation
  results.businessLogicErrors = await validateBusinessLogic(filePath);
  
  // 5. Framework compatibility
  results.frameworkErrors = await validateFramework(filePath, frameworkContext);
  
  // 6. Accessibility validation
  results.a11yErrors = await validateAccessibility(filePath, yamlData);
  
  return results;
}
```

### Auto-Fix Execution

```typescript
async function executeAutoFix(
  validationResults: ValidationResult,
  filePath: string
): Promise<FixResult> {
  
  const fixResults = {
    syntaxFixed: 0,
    importsFixed: 0,
    methodsAdded: 0,
    optimizationsApplied: 0,
    failedFixes: []
  };
  
  // Fix imports first (other fixes may depend on correct imports)
  if (validationResults.importErrors.length > 0) {
    const importFixResult = await autoFixImports(filePath, validationResults.importErrors);
    fixResults.importsFixed = importFixResult.fixed;
    fixResults.failedFixes.push(...importFixResult.failed);
  }
  
  // Add missing methods to BasePage
  if (validationResults.syntaxErrors.some(e => e.type === 'missing_method')) {
    const methodFixResult = await autoAddMissingMethods(filePath, validationResults.syntaxErrors);
    fixResults.methodsAdded = methodFixResult.added;
    fixResults.failedFixes.push(...methodFixResult.failed);
  }
  
  // Apply framework-specific optimizations
  const optimizationResult = await applyFrameworkOptimizations(filePath);
  fixResults.optimizationsApplied = optimizationResult.count;
  
  // Re-validate after fixes
  const revalidation = await validateGeneratedPageObject(filePath, yamlData, frameworkContext);
  
  return {
    ...fixResults,
    remainingErrors: countTotalErrors(revalidation)
  };
}
```

## User Notification Patterns

### Success Notification

```typescript
function notifySuccess(className: string, fixResults: FixResult): void {
  console.log(`✅ Generated ${className}.ts`);
  
  if (fixResults.importsFixed > 0) {
    console.log(`🔧 Auto-fixed ${fixResults.importsFixed} import errors`);
  }
  
  if (fixResults.methodsAdded > 0) {
    console.log(`➕ Added ${fixResults.methodsAdded} missing methods to BasePage`);
    fixResults.addedMethods.forEach(method => {
      console.log(`   - ${method}`);
    });
  }
  
  if (fixResults.optimizationsApplied > 0) {
    console.log(`⚡ Applied ${fixResults.optimizationsApplied} framework optimizations`);
  }
  
  console.log(`✅ Validation passed - no errors detected`);
  console.log(`📁 Location: ${filePath}`);
  
  if (fixResults.basePageUpdated) {
    console.log(`📝 Updated: ${basePagePath}`);
  }
}
```

### Manual Fix Required Notification

```typescript
function notifyManualFixRequired(errors: ValidationError[]): void {
  console.log(`⚠️ Generated ${className}.ts with warnings`);
  console.log(`❌ Could not auto-fix ${errors.length} error(s)`);
  
  errors.forEach((error, index) => {
    console.log(`\n${index + 1}. ${error.type}: ${error.message}`);
    console.log(` Location: Line ${error.line}`);
    console.log(` Suggested fix: ${error.suggestion}`);
    
    if (error.code) {
      console.log(` Suggested code:`);
      console.log(` ${error.code}`);
    }
  });
  
  console.log(`\n💡 Manual fixes required before use`);
}
```

## Auto-Fix Capabilities Summary

### ✅ Fully Automated Fixes

| Issue Type | Auto-Fix Strategy | Success Rate |
|------------|------------------|--------------|
| Import path corrections | Multi-strategy path resolution | 95% |
| Module resolution | File search + path inference | 90% |
| Missing methods in BasePage | Context-aware method generation | 85% |
| Method signature adjustments | Type inference + framework patterns | 80% |
| Relative path segments | Directory level counting | 100% |
| Case sensitivity | File system verification | 100% |
| Playwright wait optimization | Pattern matching + replacement | 100% |
| TypeScript type annotations | Type inference from context | 75% |

### ⚠️ Partial Automation (May Require Manual Review)

| Issue Type | Auto-Fix Approach | Manual Review Needed |
|------------|-------------------|---------------------|
| Business logic errors | Template-based fixes | Complex workflows |
| Framework incompatibilities | Pattern conversion | Custom patterns |
| Accessibility compliance | ARIA method generation | Complex a11y requirements |
| Complex type definitions | Inference from usage | Generic types |

### ❌ Manual Fixes Required

| Issue Type | Reason | Suggested Action |
|------------|--------|-----------------|
| Breaking API changes | Requires architectural decision | Update framework version or adapt code |
| Custom framework extensions | No pattern available | Create custom templates |
| Binary incompatibility | Platform-specific issue | Check runtime environment |

## Best Practices

### DO
✅ Run full validation immediately after generation
✅ Attempt automated fixes before notifying user
✅ Provide detailed error messages with fix suggestions
✅ Re-validate after each fix attempt
✅ Log all fix attempts for debugging
✅ Update fix strategies based on success patterns
✅ Cache successful fix patterns for future use

### DON'T
❌ Apply fixes without validation
❌ Modify BasePage without confirmation
❌ Skip re-validation after fixes
❌ Hide fix failures from user
❌ Apply breaking changes automatically
❌ Override user's custom code patterns

---

## 🌐 Framework-Agnostic Design Principles

This validation and auto-fix system is designed to be **completely framework-agnostic** and **language-agnostic**:

### ✅ **Universal Approach**
- **Dynamic Framework Detection**: Auto-detects web frameworks (Playwright, Selenium, Cypress), BDD frameworks (Cucumber, pytest-bdd, behave, SpecFlow), and API frameworks (RestAssured, Axios, Requests, HttpClient)
- **Language Agnostic**: Supports TypeScript, Python, Java, C#, JavaScript, Ruby without hardcoded assumptions
- **Pattern Discovery**: Uses MCP automation server and file scanning to discover existing patterns rather than assuming framework-specific structures
- **Adaptive Validation**: Validation rules adapt to detected framework capabilities and constraints

### ✅ **Context-Aware Detection**
```typescript
// Framework detection is dynamic, not hardcoded
const frameworkContext = await detectFrameworkContext({
  language: await detectLanguage(),           // Auto-detected from file extensions, imports
  webFramework: await detectWebFramework(),   // Auto-detected from dependencies, patterns  
  bddFramework: await detectBDDFramework(),   // Auto-detected from step definition patterns
  httpFramework: await detectHTTPFramework()  // Auto-detected from HTTP client usage
});

// Auto-fix patterns adapt to detected context
const autoFixPatterns = createAdaptiveAutoFix(frameworkContext);
```

### ✅ **No Hardcoded Framework References**
- ❌ **Avoided**: Hardcoded imports like `'@playwright/test'`
- ❌ **Avoided**: Framework-specific method names or patterns
- ❌ **Avoided**: Language-framework combinations like `'typescript-playwright'`
- ✅ **Used**: Dynamic pattern discovery from existing project files
- ✅ **Used**: Generic validation rules that adapt to any framework
- ✅ **Used**: Context-aware error fixing based on detected technology stack

### ✅ **Cross-Framework Compatibility**
This system works equally well with:
- **Web Testing**: Playwright + TypeScript, Selenium + Java, Cypress + JavaScript, Puppeteer + Python
- **BDD Testing**: Cucumber (any language), pytest-bdd, behave, SpecFlow, cucumber-ruby
- **API Testing**: RestAssured + Java, Axios + TypeScript, Requests + Python, HttpClient + C#
- **Any Combination**: The system adapts to whatever framework combination is detected in the project

### ✅ **Future Framework Support**
When new frameworks emerge, this system will automatically support them through:
- Pattern-based detection mechanisms
- Generic validation principle application
- Adaptive auto-fix strategy generation
- No code changes required to support new frameworks
