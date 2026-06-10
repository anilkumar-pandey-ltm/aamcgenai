# Step Definitions Generation Prompt

Generate Cucumber step definitions for Playwright test automation based on the provided page objects and feature file scenarios.

## Context

**Language**: {language}  
**Framework**: Playwright + Cucumber  
**Feature File**: {feature_file_name}  
**Page Objects**: {page_object_count} page object(s) provided

## Input Files

### Feature File Content
```gherkin
{feature_file_content}
```

### Page Object Files
{page_objects_content}

## Generation Requirements

### Language-Specific Patterns

**TypeScript**
- Import pattern: `import { Given, When, Then } from '@cucumber/cucumber'`
- Page object import: `import { PageName } from '../pages/pageName'`
- Type annotations for all parameters
- Async/await for all Playwright operations
- Use Playwright Page fixture from World context

**JavaScript**
- Import pattern: `const { Given, When, Then } = require('@cucumber/cucumber')`
- Page object import: `const { PageName } = require('../pages/pageName')`
- Async/await for all Playwright operations
- Use Playwright Page fixture from World context

**Java**
- Annotations: `@Given`, `@When`, `@Then` from `io.cucumber.java.en`
- Page object instantiation in Before hook or constructor
- Playwright Java API syntax
- Step definition class with proper package structure

**Python**
- Decorator pattern: `@given`, `@when`, `@then` from `behave`
- Page object import from pages directory
- Async/await if using async Playwright
- Context object for sharing state

**C#**
- Attributes: `[Given]`, `[When]`, `[Then]` from `TechTalk.SpecFlow`
- Page object dependency injection
- Playwright .NET API syntax
- Step definition class with proper namespace

## Step Definition Structure

### 1. Extract Steps from Feature File
- Parse all Given, When, Then, And, But steps
- Group by scenario and scenario outline
- Identify step parameters (captured groups)
- Handle data tables and doc strings

### 2. Map Steps to Page Object Methods
- Match step text to available page object methods
- Use semantic matching (navigate → goto, click → click, etc.)
- Identify missing page object methods (flag for user)
- Create method call chains for complex steps

### 3. Generate Step Definitions

**For each unique step:**
```
Step Text: "I navigate to the login page"
↓
Step Definition:
Given('I navigate to the login page', async function() {
  const loginPage = new LoginPage(this.page);
  await loginPage.navigate();
});
```

**For parameterized steps:**
```
Step Text: "I enter {string} in the username field"
↓
Step Definition:
When('I enter {string} in the username field', async function(username: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.enterUsername(username);
});
```

**For data tables:**
```
Step Text: "I fill the login form:"
↓
Step Definition:
When('I fill the login form:', async function(dataTable: DataTable) {
  const loginPage = new LoginPage(this.page);
  const data = dataTable.rowsHash();
  await loginPage.fillLoginForm(data);
});
```

## Code Quality Requirements

✅ **Proper Imports**: All necessary Cucumber and page object imports  
✅ **Type Safety**: Full type annotations (TypeScript/Java/C#)  
✅ **Error Handling**: Try-catch blocks for critical operations  
✅ **Async/Await**: Proper async handling for Playwright operations  
✅ **Page Object Pattern**: Utilize existing page object methods  
✅ **Reusability**: Generic steps that work across scenarios  
✅ **Readable Step Text**: Natural language matching  
✅ **Parameter Handling**: Proper regex/cucumber expressions  

## Output Format

Generate a single step definitions file with:

1. **File Header** (imports, dependencies)
2. **Step Definitions** (one per unique step)
3. **Helper Methods** (if needed for complex logic)
4. **Comments** (explaining complex mappings)

### File Naming Convention
- TypeScript: `{feature_name}.steps.ts`
- JavaScript: `{feature_name}.steps.js`
- Java: `{FeatureName}StepDefinitions.java`
- Python: `{feature_name}_steps.py`
- C#: `{FeatureName}Steps.cs`

## Example Output (TypeScript)

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { HomePage } from '../pages/homePage';

// Navigation Steps
Given('I am on the login page', async function() {
  const loginPage = new LoginPage(this.page);
  await loginPage.navigate();
});

// Interaction Steps
When('I enter {string} in the username field', async function(username: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.enterUsername(username);
});

When('I enter {string} in the password field', async function(password: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.enterPassword(password);
});

When('I click the login button', async function() {
  const loginPage = new LoginPage(this.page);
  await loginPage.clickLoginButton();
});

// Assertion Steps
Then('I should see the home page', async function() {
  const homePage = new HomePage(this.page);
  await expect(this.page).toHaveURL(/.*home/);
  await expect(homePage.welcomeMessage).toBeVisible();
});

Then('I should see an error message {string}', async function(errorMessage: string) {
  const loginPage = new LoginPage(this.page);
  await expect(loginPage.errorMessage).toContainText(errorMessage);
});
```

## Special Considerations

### Scenario Outlines
- Create generic step definitions that work with Examples table
- Use parameters for all variable data
- Avoid hardcoding values

### Background Steps
- Reuse step definitions across scenarios
- Keep setup steps generic and composable

### Hooks Integration
- Assume Before/After hooks handle browser context
- Access page through `this.page` or World context
- Don't create new browser instances in steps

### Missing Page Object Methods
If a step requires a method not present in page objects:
```typescript
// TODO: Add method to LoginPage class
// Method needed: enterEmail(email: string)
When('I enter my email address', async function() {
  // Temporary implementation - move to page object
  await this.page.fill('[data-testid="email-input"]', 'user@example.com');
});
```

## Validation Checklist (PRE-OUTPUT VALIDATION)

**⚠️ MANDATORY: Before outputting ANY code, perform complete self-validation!**

### Step 1: Syntax Validation
- [ ] All steps from feature file have definitions
- [ ] Package/module declarations correct
- [ ] Class/function declarations syntactically valid
- [ ] Method names have NO SPACES (critical for Java!)
  - ❌ BAD: `public void removeB irthdayDate()`
  - ✅ GOOD: `public void removeBirthdayDate()`
- [ ] All annotations/decorators properly formatted
- [ ] Regex patterns properly escaped
- [ ] Language-specific syntax followed

### Step 2: Import Validation
- [ ] All imports are correct and complete
- [ ] No imports of non-existent utilities (e.g., DataUtils)
- [ ] Page object imports match actual files
- [ ] Framework imports correct for language
- [ ] No missing import statements

### Step 3: Method Call Validation  
- [ ] Page object methods are properly called
- [ ] Method names match page object inventory EXACTLY
- [ ] No invented method names
- [ ] All method calls have correct parameter count
- [ ] Parameter types match method signatures
- [ ] Methods exist in page objects (or marked as TODO)

### Step 4: Parameter & Type Validation
- [ ] Parameters are properly typed and used
- [ ] Cucumber expressions correct ({string}, {int}, {float})
- [ ] Type annotations present (TypeScript, Java, C#)
- [ ] Parameter names descriptive
- [ ] No unused parameters

### Step 5: Async/Await Validation
- [ ] Async/await is consistently applied
- [ ] All Playwright operations await'ed
- [ ] Async keyword on function declarations
- [ ] Promise handling correct

### Step 6: Data & Config Validation
- [ ] No hardcoded test data (emails, passwords, URLs)
- [ ] ConfigLoader used correctly (Java)
- [ ] Test data from config or parameters only
- [ ] No duplicate step definitions
- [ ] No magic numbers or strings

### Step 7: Logging & Error Handling
- [ ] Logger statements present (LOG.info for Java)
- [ ] All methods have throws Exception (Java)
- [ ] Error messages are descriptive
- [ ] No System.out.println (use proper logging)

### Step 8: Code Quality Validation
- [ ] Code follows language-specific conventions
- [ ] Comments explain non-obvious logic
- [ ] File naming matches project conventions
- [ ] Proper code formatting
- [ ] No code duplication

### Step 9: Automated Error Pattern Detection

Run regex checks for common errors:

**Java-Specific Patterns:**
```regex
METHOD_NAME_WITH_SPACE: public\s+void\s+\w+\s+\w+\s*\(
HARDCODED_EMAIL: "[a-z]+@[a-z]+\.[a-z]+"
HARDCODED_PASSWORD: "password\d*"
MISSING_THROWS: \)\s*\{  (without "throws Exception")
WRONG_LOGGER: (System\.out|log\.info|Logger\.info)
DATAUTILS_IMPORT: import\s+utilities\.DataUtils
```

**TypeScript/JavaScript Patterns:**
```regex
MISSING_AWAIT: (page|this\.page)\.\w+\([^)]*\)(?!\s*;)
MISSING_ASYNC: function\s*\([^)]*\)\s*\{  (without async)
MISSING_TYPE: function\s*\([^:)]*\)  (no type annotation in TS)
```

**Python Patterns:**
```regex
MISSING_CONTEXT: def\s+step_impl\([^c]  (missing context param)
WRONG_DECORATOR: @(given|when|then)\(
```

### Step 10: Self-Correction Loop

**CRITICAL PROCESS:**

```
DO {
    errors = run_all_validations_above()
    
    IF errors.found():
        FOR each error:
            fix_error_automatically()
            log_fix_applied()
        END FOR
        
        re_run_validations()
    ENDIF
    
} WHILE (errors.exist() AND iterations < 3)

IF errors.still_exist():
    output_error_report_with_partial_code()
    request_user_guidance()
ELSE:
    output_validated_code()
    output_validation_summary()
ENDIF
```

**Only output code after ALL validations pass!**

### Validation Output Format

**If all validations pass:**
```
✅ VALIDATION COMPLETE - All checks passed

File: {filename}
Language: {language}
Steps: {count}

All validations successful:
✅ Syntax check
✅ Import validation  
✅ Method validation
✅ Type validation
✅ Async/await validation
✅ Data/config validation
✅ Logging validation
✅ Code quality check
✅ Error pattern detection

Code is production-ready!
```

**If issues were found and fixed:**
```
⚠️ VALIDATION COMPLETE - Issues found and auto-corrected

File: {filename}
Language: {language}  
Steps: {count}

Auto-corrections applied:
1. Fixed method name: "removeB irthdayDate" → "removeBirthdayDate"
2. Added missing throws Exception on 3 methods
3. Replaced hardcoded email with ConfigLoader.getInstance().getEmail()
4. Fixed LOG.info statements (was using System.out.println)

All issues resolved - code is now production-ready!
```

---

## Generation Process Summary

1. **Read all page objects completely** (build method inventory)
2. **Analyze feature file** (extract steps and parameters)
3. **Map steps to page methods** (only use methods that exist)
4. **Generate step definitions** (following language patterns)
5. **⚠️ RUN COMPLETE VALIDATION** (all 10 steps above)
6. **Auto-fix any errors found** (run up to 3 correction loops)
7. **Output validated code** (with validation summary)

**Generate the step definitions now based on the above requirements and provided context.**
