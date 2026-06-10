---
name: mcp-integration-guide
description: Complete guide for integrating MCP Automation Server and MCP Context Server in test generation workflows, including tool loading patterns, context discovery, and business intelligence retrieval.
---

# MCP Server Integration Guide

Complete guide for integrating MCP Automation Server and MCP Context Server in test generation workflows.

## Overview

Two primary MCP servers provide context discovery and business intelligence:

1. **MCP Automation Server** - Framework structure, existing patterns, step reusability
2. **MCP Context Server** - Business rules, domain knowledge, application context

## MCP Automation Server Usage

### Purpose
- Discover existing framework structure and patterns
- Find reusable step definitions (40-60% reusability)
- Identify utilities, helpers, and configuration
- Detect programming language and framework

### Primary Tool: Search for MCP Tools First

```python
# ALWAYS search for MCP tools before using them
tool_search_tool_regex(pattern="mcp.*automation|fusioniq")
```

### Framework Discovery Pattern

```python
# Step 1: Scan entire workspace structure
workspace_scan = await mcp_automation_server.scan_workspace()

# Step 2: Search for specific patterns
step_patterns = await mcp_automation_server.search_files(
    query='@Given|@When|@Then|Given\\(|When\\(|Then\\(',
    directory='tests/stepdefs/'
)

# Step 3: Extract existing step definitions
existing_steps = extractStepPatterns(step_patterns)
```

### Language Detection

```python
# Detect programming language via configuration files
language_indicators = await mcp_automation_server.search_files(
    query='package.json|tsconfig.json|requirements.txt|pom.xml|*.csproj',
    directory='./'
)

# Analyze file extensions in test directories
test_files = await mcp_automation_server.search_files(
    query='*.py|*.ts|*.js|*.java|*.cs|*.rb',
    directory='tests/stepdefs/'
)

# Determine language
if 'requirements.txt' in language_indicators or '*.py' in test_files:
    detected_language = 'python'
    detected_framework = 'pytest-bdd' if 'pytest' in test_files else 'behave'
elif 'tsconfig.json' in language_indicators or '*.ts' in test_files:
    detected_language = 'typescript'
    detected_framework = 'cucumber-ts'
```

### Step Reusability Discovery (CRITICAL)

```typescript
// Step 1: Query MCP Automation Server for existing step definitions
const existingSteps = await mcp_automation_server.search_files(
  '@Given|@When|@Then|Given\\(|When\\(|Then\\(',
  'tests/stepdefs/'
);

// Step 2: Extract step patterns from existing files
const stepPatterns = extractStepPatterns(existingSteps);
/**
 * Example discovered patterns:
 * [
 *   { type: 'Given', pattern: 'I have an authenticated API client', file: 'common_steps.ts' },
 *   { type: 'When', pattern: 'I send a {string} request to {string}', file: 'api_steps.ts' },
 *   { type: 'Then', pattern: 'the response status should be {int}', file: 'api_steps.ts' }
 * ]
 */

// Step 3: Match feature file steps with existing step definitions
const featureSteps = parseFeatureFile(feature_file_path);
const reusableSteps = featureSteps.filter(featureStep => 
  stepPatterns.some(pattern => matchesPattern(featureStep.text, pattern.pattern))
);

// Step 4: Generate only NEW steps (not covered by existing definitions)
const newStepsNeeded = featureSteps.filter(featureStep =>
  !stepPatterns.some(pattern => matchesPattern(featureStep.text, pattern.pattern))
);

console.log('Step Reusability Analysis', {
  totalSteps: featureSteps.length,
  reusableSteps: reusableSteps.length,
  newStepsNeeded: newStepsNeeded.length,
  reusabilityPercentage: (reusableSteps.length / featureSteps.length * 100).toFixed(2) + '%'
});
```

### Pattern Discovery

```python
# Python Pattern Discovery
if detected_language == 'python':
    # Fixture patterns
    fixture_patterns = await mcp_automation_server.search_files(
        query='@fixture|@pytest.fixture|def.*context',
        directory='tests/stepdefs/'
    )
    
    # Step definition patterns
    step_patterns = await mcp_automation_server.search_files(
        query='@given|@when|@then|from pytest_bdd import',
        directory='tests/stepdefs/'
    )
    
    # Assertion patterns
    assertion_patterns = await mcp_automation_server.search_files(
        query='assert |pytest.raises|expect\\(',
        directory='tests/stepdefs/'
    )

# TypeScript Pattern Discovery
elif detected_language == 'typescript':
    # Context management
    context_patterns = await mcp_automation_server.search_files(
        query='CustomWorld|TestContext|World|interface.*World',
        directory='framework/core/'
    )
    
    # Step definition patterns
    step_patterns = await mcp_automation_server.search_files(
        query='Given\\(|When\\(|Then\\(',
        directory='tests/stepdefs/'
    )
    
    # Type definitions
    type_patterns = await mcp_automation_server.search_files(
        query='interface|type |declare module',
        directory='framework/core/'
    )
```

## MCP Context Server Usage

### Purpose
- Retrieve business validation rules
- Access domain knowledge and terminology
- Load application architecture patterns
- Apply compliance requirements

### Primary Tools

```python
# Search for MCP Context Server tools
tool_search_tool_regex(pattern="mcp.*context.*scan|search")

# Available tools:
# - mcp_mcp-context-s_scan_workspace()
# - mcp_mcp-context-s_search_files(query, directory)
# - mcp_mcp-context-s_get_file_info(file_path)
```

### Business Rules Discovery

```python
# Step 1: Scan context directories
context_scan = await mcp_context_server.scan_workspace()

# Step 2: Discover business rules for API validation
business_rules = await mcp_context_server.search_files(
    query='validation|rules|constraint|requirement',
    directory='data/context/business_rules/'
)

# Step 3: Extract domain context and terminology
domain_context = await mcp_context_server.search_files(
    query='api|service|entity|model',
    directory='data/context/domain/'
)

# Step 4: Retrieve application configurations
app_context = await mcp_context_server.search_files(
    query='config|architecture|integration',
    directory='data/context/application/'
)
```

### Context Integration Pattern

```typescript
// Load context from MCP Context Server
const businessRules = await mcp_context_server.search_files(
  'validation|required_fields',
  'data/context/business_rules/'
);

// Apply business rules to step definitions
Then('the product should have valid fields', async function(this: CustomWorld) {
  const product = this.apiContext.lastResponse.data;
  
  // Get required fields from business rules context
  const requiredFields = await this.getRequiredFieldsFromBusinessRules('product');
  
  for (const field of requiredFields) {
    expect(product).toHaveProperty(field);
    expect(product[field]).toBeDefined();
  }
});
```

## Complete MCP Integration Workflow

### 1. Prerequisites Check
```powershell
# Verify MCP Automation Server
Test-Path "src\mcp\mcp_automation_server.py"
python -c "import sys; sys.path.append('src/mcp'); from mcp_automation_server import *; print('OK')"

# Verify MCP Context Server
Test-Path "src\mcp\mcp_context_server.py"
python -c "import sys; sys.path.append('src/mcp'); from mcp_context_server import *; print('OK')"
```

### 2. Framework Context Retrieval (MANDATORY)

```python
# PHASE 1: Language Detection
workspace_scan = await mcp_automation_server.scan_workspace()
language_indicators = await mcp_automation_server.search_files(
    'package.json|tsconfig.json|requirements.txt|pom.xml'
)

# PHASE 2: Framework Detection (Language-Specific)
if detected_language == 'python':
    framework_detection = await mcp_automation_server.search_files(
        'pytest|pytest-bdd|behave|@given|@when',
        'tests/stepdefs/'
    )
elif detected_language == 'typescript':
    framework_detection = await mcp_automation_server.search_files(
        '@cucumber/cucumber|playwright|Given\\(',
        'tests/stepdefs/'
    )

# PHASE 3: Pattern Discovery
existing_patterns = await mcp_automation_server.search_files(
    '@Given|@When|@Then|Given\\(|When\\(|Then\\(',
    'tests/stepdefs/'
)
```

### 3. Business Context Retrieval (MANDATORY)

```python
# Business rules for validation
business_rules = await mcp_context_server.search_files(
    query='validation|rules|constraint',
    directory='data/context/business_rules/'
)

# Domain terminology
domain_context = await mcp_context_server.search_files(
    query='api|service|entity',
    directory='data/context/domain/'
)

# Application architecture
app_context = await mcp_context_server.search_files(
    query='architecture|integration',
    directory='data/context/application/'
)
```

### 4. Generate with Context

```typescript
// Use discovered context to generate step definitions
function generateStepDefinition(
  step: GherkinStep,
  discoveredContext: FrameworkContext,
  businessRules: BusinessContext
) {
  // Use discovered language syntax
  const decorator = discoveredContext.language === 'python' ? '@when' : 'When(';
  
  // Apply discovered patterns
  const contextType = discoveredContext.contextType || 'CustomWorld';
  
  // Integrate business rules
  const validationRules = businessRules.getValidationRules(step.entity);
  
  return `
${decorator}'${step.pattern}', async function(this: ${contextType}, ${step.params}) {
  // Use discovered logger
  this.${discoveredContext.loggerProperty}.info('${step.action}');
  
  // Execute API operation
  this.apiContext.lastResponse = await this.apiClient.${step.method}();
  
  // Apply business validation
  ${generateBusinessValidation(validationRules)}
  
  // Use discovered step logger
  this.${discoveredContext.stepLoggerProperty}.logAction('${step.action}');
});
  `;
}
```

## Troubleshooting

### MCP Automation Server Not Accessible

```powershell
# Verify installation
Test-Path "src\mcp\mcp_automation_server.py"

# Test server manually
python src\mcp\mcp_automation_server.py

# Check Python path
python -c "import sys; print('\n'.join(sys.path))"
```

### MCP Context Server Not Accessible

```powershell
# Check context server
Test-Path "src\mcp\mcp_context_server.py"

# Verify context directories
Test-Path "data\context\business_rules\"
Test-Path "data\context\domain\"
Test-Path "data\context\application\"

# List context files
Get-ChildItem data\context\business_rules -Recurse
```

### No Existing Steps Found

```python
# Verify step definition directory exists
existing_step_dirs = await mcp_automation_server.search_files('', 'tests/stepdefs/')

if not existing_step_dirs:
    print("No existing step definitions found - generating all steps fresh")
    reusability_percentage = 0
else:
    # Proceed with reusability analysis
    ...
```

## Best Practices

1. **ALWAYS retrieve MCP context FIRST** before generation
2. **Use MCP Automation Server** for framework discovery and step reusability (40-60% savings)
3. **Use MCP Context Server** for business rules and domain knowledge
4. **Search for tools** with `tool_search_tool_regex` before calling MCP tools
5. **Log reusability metrics** (totalSteps, reusableSteps, newStepsNeeded, percentage)
6. **Fallback gracefully** if MCP servers unavailable (use vanilla patterns)
7. **Validate context** before applying (check for null/undefined)

## Integration Checklist

- [ ] Search for MCP tools with `tool_search_tool_regex`
- [ ] Verify MCP Automation Server accessible
- [ ] Verify MCP Context Server accessible
- [ ] Retrieve framework context (language, framework, patterns)
- [ ] Retrieve business context (rules, domain, architecture)
- [ ] Discover existing step definitions for reusability
- [ ] Calculate reusability percentage (target: 40-60%)
- [ ] Generate only NEW steps not covered by existing
- [ ] Apply discovered patterns to generated code
- [ ] Integrate business rules from context
- [ ] Log context usage and reusability metrics
