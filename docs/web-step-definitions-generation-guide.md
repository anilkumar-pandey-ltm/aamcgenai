# Step Definitions Generation Guide

## 🤖 Agent Information

**Agent Mode**: `web-step-definitions-generator`  
**Agent File**: `.github/agents/web-step-definitions-generator.agent.md`  
**Activation**: Use `@web-step-definitions-generator` prefix in your Copilot prompts

### How to Activate This Agent

```
@web-step-definitions-generator [Your Prompt]
```

**Example:**
```
@web-step-definitions-generator Generate step definitions for feature file "Feature/login.feature" output to "tests/stepdefs/"
```

## 📖 Overview

This guide explains how to use the **MCP-Powered Step Definitions Generator** to automatically create or update Cucumber/SpecFlow step definition files from feature files. The tool uses Model Context Protocol (MCP) Server for intelligent context discovery and smart file management.

## 🎯 Key Features

### 1. **MCP-Powered Context Discovery**
- Automatically detects programming language (TypeScript, JavaScript, Java, Python, C#)
- Discovers framework (Playwright, Cucumber, Cypress, etc.)
- Scans page actions and their methods
- Identifies reusable utility methods
- Detects existing step definitions to avoid duplicates
- Loads business rules, domain, and application context

### 2. **Smart File Management**
- **CREATE Mode**: Generates new step definition files
- **UPDATE Mode**: Adds only new steps to existing files
- Preserves existing code, imports, and formatting
- Detects duplicate steps across all files

### 3. **Configuration-Driven**
- Loads paths from `src/config/config.yaml`
- No hardcoded paths
- Supports flexible path resolution

## 🚀 Getting Started

### Prerequisites

1. **Configuration File**: Ensure `src/config/config.yaml` contains:
```yaml
step_definitions_generation:
  Feature_filepath: "C://path//to//Feature"
  StepDef_filepath: "C://path//to//tests//stepdefs"
```

2. **Python Environment**: Activate your virtual environment
```powershell
.\.venv\Scripts\Activate.ps1
```

3. **Install Dependencies**:
```powershell
pip install pyyaml
```

## 📋 Usage Examples

### 1. Show Configuration

Display current configuration and available languages:

```powershell
python step-definitions/step_defs_prompt_builder.py --show-config
```

**Output:**
```
=== Step Definitions Generator Configuration ===

Base Directory: C:\Automation_POCs\GenAI_FusionIQ_Copilot\GenAI_FusionIQ_Framework_Copilot

MCP Server: ✅ Available

Feature Directory: C://Automation_POCs//GenAI_FusionIQ_Copilot//GenAI_FusionIQ_Framework_Copilot//Feature
StepDef Directory: C://Automation_POCs//GenAI_FusionIQ_Copilot//GenAI_FusionIQ_Framework_Copilot//tests//stepdefs

Supported Languages:
  - typescript: Playwright + Cucumber (.ts)
  - javascript: Playwright + Cucumber (.js)
  - java: Playwright + Cucumber (.java)
  - python: Playwright + Behave (.py)
  - csharp: Playwright + SpecFlow (.cs)
```

### 2. Resolve Feature File Path

Get the full path to a feature file:

```powershell
python step-definitions/step_defs_prompt_builder.py --resolve-path login.feature
```

**Output:**
```
C:\Automation_POCs\GenAI_FusionIQ_Copilot\GenAI_FusionIQ_Framework_Copilot\Feature\login.feature
```

### 3. MCP-Powered Mode (Auto-Discovery)

**Recommended approach** - Let the tool discover all context automatically:

```powershell
python step-definitions/step_defs_prompt_builder.py `
    --feature login.feature `
    --output-dir tests/stepdefs/authentication `
    --output-name login.steps.ts
```

**What happens:**
1. ✅ Resolves `login.feature` path from config
2. ✅ Auto-detects language (TypeScript)
3. ✅ Discovers all page actions and methods
4. ✅ Scans reusable utilities
5. ✅ Identifies existing step definitions
6. ✅ Loads business/domain/application context
7. ✅ Generates comprehensive prompt

**Output:**
```
🔍 Discovering context using MCP Server...

✅ Detected Language: typescript
✅ Detected Framework: Playwright + Cucumber
✅ Found 5 page actions
✅ Found 12 reusable methods
✅ Found 3 existing step definition files

# CREATE Step Definitions (MCP-Powered)
...
[Complete prompt with all discovered context]
```

### 4. Generate with Pre-Saved MCP Context

If you have MCP context saved in a JSON file:

```powershell
python step-definitions/step_defs_prompt_builder.py `
    --feature checkout.feature `
    --mcp-context C:/temp/mcp_context.json `
    --output-dir tests/stepdefs/ecommerce
```

### 5. Save Prompt to File

Save the generated prompt for later use:

```powershell
python step-definitions/step_defs_prompt_builder.py `
    --feature cart.feature `
    --output C:/temp/cart_steps_prompt.md
```

### 6. Legacy Mode (Manual)

If MCP Server is unavailable, use manual mode:

```powershell
python step-definitions/step_defs_prompt_builder.py `
    --feature Feature/login.feature `
    --page-objects page-actions/ `
    --language typescript `
    --output prompts/login_steps.md
```

## 🔧 Command-Line Arguments

### Configuration Commands

| Argument | Description | Example |
|----------|-------------|---------|
| `--show-config` | Display current configuration | `--show-config` |
| `--resolve-path` | Resolve feature file path | `--resolve-path login.feature` |

### MCP Mode Arguments (Recommended)

| Argument | Required | Description | Example |
|----------|----------|-------------|---------|
| `--feature` | ✅ | Feature file name or path | `--feature login.feature` |
| `--output-dir` | ❌ | Output directory (overrides config) | `--output-dir tests/stepdefs/auth` |
| `--output-name` | ❌ | Output filename | `--output-name login.steps.ts` |
| `--mcp-context` | ❌ | Path to JSON with MCP context | `--mcp-context /tmp/context.json` |

### Legacy Mode Arguments

| Argument | Required | Description | Example |
|----------|----------|-------------|---------|
| `--page-objects` | ✅ | Path to page object files | `--page-objects page-actions/` |
| `--language` | ✅ | Programming language | `--language typescript` |

### Common Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--output` | Save prompt to file | `stdout` |
| `--no-patterns` | Exclude language patterns | `false` |

## 📂 Directory Structure

The tool scans the following directories:

### Page Actions
- `page-actions/`
- `src/pages/`
- `tests/pages/`
- `page-object/`

### Reusable Methods
- `framework/utils/`
- `framework/core/`
- `src/templates/step-def_templates/utils/`

### Existing Step Definitions
- `tests/stepdefs/` (from config)
- Configured `StepDef_filepath`

### Business Context
- `data/context/business_rules/`
- `data/context/domain/`
- `data/context/application/`

## 🎨 Generated Prompt Structure

The tool generates a comprehensive prompt with:

### 1. Feature File Content
```gherkin
Feature: User Login
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in
```

### 2. Available Page Actions
```typescript
### LoginPage
**Path**: `page-actions/LoginPage.ts`
**Class**: `LoginPage`

**Available Methods:**
- `async navigateToLogin(): Promise<void>`
- `async fillUsername(username: string): Promise<void>`
- `async fillPassword(password: string): Promise<void>`
- `async clickLoginButton(): Promise<void>`
```

### 3. Reusable Methods
```typescript
### locatorUtility
**Path**: `framework/utils/locatorUtility.ts`
**Methods**:
- `getLocator(page: Page, locatorKey: string): Locator`
```

### 4. Existing Step Definitions
```
### File: `tests/stepdefs/common.steps.ts`

- **Given**(`I navigate to {string}`) - Line 12
- **When**(`I click on {string} button`) - Line 25
- **Then**(`I should see {string}`) - Line 38
```

### 5. Business Context
```
### Business Rules
**login_rules**:
Users must authenticate with email and password...

### Domain Context
**authentication_domain**:
The authentication module handles user login...
```

### 6. Requirements & Instructions
- Language-specific requirements
- CREATE/UPDATE mode instructions
- Duplicate detection rules
- Code style guidelines

## 🔄 Workflow Examples

### Scenario 1: Create New Step Definitions

**Goal**: Generate step definitions for a new feature file

```powershell
# Step 1: Check configuration
python step-definitions/step_defs_prompt_builder.py --show-config

# Step 2: Generate prompt (auto-discover context)
python step-definitions/step_defs_prompt_builder.py `
    --feature payment.feature `
    --output-name payment.steps.ts

# Step 3: Use the generated prompt with GitHub Copilot Chat
# Copy the output and paste into Copilot Chat

# Step 4: Copilot generates the step definitions file
# File: tests/stepdefs/payment.steps.ts
```

### Scenario 2: Update Existing Step Definitions

**Goal**: Add new steps to an existing file

```powershell
# Step 1: Generate prompt (detects existing file)
python step-definitions/step_defs_prompt_builder.py `
    --feature login.feature `
    --output-name login.steps.ts

# Output shows: "UPDATE login.steps.ts (file exists)"

# Step 2: The prompt includes UPDATE MODE instructions:
# - Read existing file
# - Add ONLY new steps
# - Preserve existing code
# - Skip duplicates

# Step 3: Use with Copilot to update the file
```

### Scenario 3: Multiple Features

**Goal**: Generate step definitions for multiple features

```powershell
# Generate for each feature
python step-definitions/step_defs_prompt_builder.py --feature login.feature > prompts/login.md
python step-definitions/step_defs_prompt_builder.py --feature checkout.feature > prompts/checkout.md
python step-definitions/step_defs_prompt_builder.py --feature payment.feature > prompts/payment.md

# Use each prompt with Copilot
```

### Scenario 4: Save MCP Context for Reuse

**Goal**: Discover context once, reuse for multiple features

```powershell
# Step 1: Discover and save context (manual approach - requires custom script)
# Note: The tool discovers context automatically each time

# Step 2: Generate for multiple features
python step-definitions/step_defs_prompt_builder.py --feature login.feature
python step-definitions/step_defs_prompt_builder.py --feature signup.feature
python step-definitions/step_defs_prompt_builder.py --feature profile.feature
```

## 🛠️ Troubleshooting

### Issue 1: "Feature file not found"

**Problem**: Feature file path cannot be resolved

**Solution**:
```powershell
# Check configuration
python step-definitions/step_defs_prompt_builder.py --show-config

# Verify feature file exists
python step-definitions/step_defs_prompt_builder.py --resolve-path login.feature

# Use full path if needed
python step-definitions/step_defs_prompt_builder.py --feature Feature/login.feature
```

### Issue 2: "MCP Server not available"

**Problem**: MCP Server not found

**Solution**:
```powershell
# Option 1: Use legacy mode
python step-definitions/step_defs_prompt_builder.py `
    --feature login.feature `
    --page-objects page-actions/ `
    --language typescript

# Option 2: Install MCP dependencies (if available)
# Check if src/mcp/mcp_automation_server.py exists
```

### Issue 3: "No page actions discovered"

**Problem**: Page action files not found

**Solution**:
- Verify page actions exist in: `page-actions/`, `src/pages/`, `tests/pages/`, or `page-object/`
- Check file extensions match detected language (.ts, .js, .java, .py, .cs)
- Ensure files contain proper class definitions

### Issue 4: "yaml module not found"

**Problem**: PyYAML not installed

**Solution**:
```powershell
pip install pyyaml
```

### Issue 5: Wrong language detected

**Problem**: Tool detects wrong programming language

**Solution**:
```powershell
# Use legacy mode with explicit language
python step-definitions/step_defs_prompt_builder.py `
    --feature login.feature `
    --page-objects page-actions/ `
    --language typescript  # Explicitly specify language
```

## 📊 Best Practices

### 1. Feature File Organization
```
Feature/
├── authentication/
│   ├── login.feature
│   └── signup.feature
├── ecommerce/
│   ├── cart.feature
│   └── checkout.feature
└── profile/
    └── settings.feature
```

### 2. Step Definition Organization
```
tests/stepdefs/
├── authentication/
│   ├── login.steps.ts
│   └── signup.steps.ts
├── ecommerce/
│   ├── cart.steps.ts
│   └── checkout.steps.ts
├── common.steps.ts
└── hooks.ts
```

### 3. Use Descriptive Filenames
- ✅ `login.steps.ts` - Clear and descriptive
- ✅ `user-authentication.steps.ts` - Descriptive
- ❌ `test.steps.ts` - Too generic
- ❌ `steps1.ts` - Unclear

### 4. Organize by Feature Area
```powershell
# Authentication features
python step-definitions/step_defs_prompt_builder.py `
    --feature login.feature `
    --output-dir tests/stepdefs/authentication

# E-commerce features
python step-definitions/step_defs_prompt_builder.py `
    --feature checkout.feature `
    --output-dir tests/stepdefs/ecommerce
```

### 5. Review Generated Code
- Always review generated step definitions
- Test the generated code
- Refactor for clarity and reusability
- Add error handling where needed

### 6. Maintain Business Context
- Keep `data/context/business_rules/` updated
- Document domain-specific logic
- Include validation rules and constraints

## 🔍 Understanding the Output

### CREATE Mode Output

```markdown
# CREATE Step Definitions (MCP-Powered)

## Request
Generate Cucumber step definitions for the feature file below using **typescript** with Playwright + Cucumber.

**Action**: CREATE `tests/stepdefs/login.steps.ts`

## Feature File
[Feature content]

## Available Page Actions (MCP Discovered)
[Page actions and methods]

## Existing Step Definitions (MCP Discovered)
**⚠️ CRITICAL: DO NOT duplicate these steps!**
[List of existing steps to avoid duplicating]

## Requirements
- **Language**: typescript
- **Action**: CREATE (file does not exist)
- **Duplicate Detection**: Skip steps that exist in other files

## Output Instructions
**FILE DOES NOT EXIST - CREATE MODE**:
1. Generate complete step definitions file
2. Include all necessary imports
3. Create step definitions for each unique step
4. Use discovered page actions and reusable methods
```

### UPDATE Mode Output

```markdown
# UPDATE Step Definitions (MCP-Powered)

**Action**: UPDATE `tests/stepdefs/login.steps.ts`

## Output Instructions
**FILE EXISTS - UPDATE MODE**:
1. Read the existing file content
2. Identify NEW steps from feature file that don't exist
3. Add ONLY new step definitions to the file
4. Preserve all existing imports and code
5. Maintain consistent code style
```

## 🎓 Advanced Usage

### Custom Output Locations

```powershell
# Different output directories for different features
python step-definitions/step_defs_prompt_builder.py `
    --feature login.feature `
    --output-dir tests/stepdefs/auth `
    --output-name authentication.steps.ts
```

### Shorter Prompts (No Patterns)

```powershell
# Exclude language patterns for shorter prompts
python step-definitions/step_defs_prompt_builder.py `
    --feature login.feature `
    --no-patterns
```

### Integration with CI/CD

```yaml
# .github/workflows/generate-step-defs.yml
name: Generate Step Definitions

on:
  push:
    paths:
      - 'Feature/**/*.feature'

jobs:
  generate:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.x'
      - name: Install dependencies
        run: pip install pyyaml
      - name: Generate prompts
        run: |
          python step-definitions/step_defs_prompt_builder.py --feature login.feature --output prompts/login.md
```

## 📚 Additional Resources

### Related Documentation
- [BDD Test Scenarios Generation Guide](./BDD%20Test%20scenarios-generation-guide.md)
- [Page Actions Generation Guide](./page-actions-gen-guide.md)
- [Locator Generation Guide](./locator-generation-guide.md)
- [Framework Architecture](./framework_arch.md)

### Configuration Files
- `src/config/config.yaml` - Main configuration
- `framework/config/config.yaml` - Framework configuration

### Example Files
- `src/templates/step-def_templates/examples/` - Example step definitions
- `src/templates/step-def_templates/templates/` - Step definition templates

## 🤝 Contributing

To improve the step definition generator:

1. Add new language support in `SUPPORTED_LANGUAGES`
2. Enhance context discovery methods
3. Improve step pattern detection regex
4. Add more comprehensive business context integration

## 📝 Summary

The MCP-Powered Step Definitions Generator provides:

✅ **Automatic context discovery** - No manual configuration needed
✅ **Smart file management** - Create or update intelligently
✅ **Duplicate detection** - Avoid duplicate step definitions
✅ **Business context** - Include domain knowledge
✅ **Multi-language support** - TypeScript, JavaScript, Java, Python, C#
✅ **Configuration-driven** - Flexible and maintainable

Start using it today to accelerate your test automation development!
