# API Step Definitions Generator - User Guide

## 🤖 Agent Information

**Agent Mode**: `api-step-definitions-generator`  
**Agent File**: `.github/agents/api-step-definitions-generator.agent.md`  
**Activation**: Use `@api-step-definitions-generator` prefix in your Copilot prompts

### How to Activate This Agent

```
@api-step-definitions-generator [Your Prompt]
```

**Example:**
```
@api-step-definitions-generator Generate step definitions for "Feature/API/user_api.feature" with service client "tests/serviceclient/UserApiClient.ts"
```

## 📋 Overview

The API Step Definitions Generator is an AI-powered tool that automatically creates comprehensive, framework-compliant step definitions for your API feature files. It leverages MCP (Model Context Protocol) servers to discover your framework structure and apply business rules, ensuring generated code follows your project's patterns and conventions.

## 🎯 Key Features

- **Multi-Language Support**: Python, TypeScript, JavaScript, Java, C#, Ruby
- **Framework Agnostic**: Adapts to Cucumber, pytest-bdd, behave, RestAssured, SpecFlow, Playwright
- **Framework Discovery**: Uses MCP Automation Server to detect your actual framework
- **Business Rules Integration**: Applies validation rules from MCP Context Server
- **Type-Safe Code**: Generates strongly-typed, interface-compliant code
- **Service Client Integration**: Works with your existing API clients
- **Comprehensive Coverage**: Handles all CRUD operations, authentication, validation

## 🚀 Quick Start

### Prerequisites

1. **Feature File**: A Gherkin `.feature` file with API test scenarios
2. **Service Client**: An existing API service client implementation
3. **MCP Servers**: Both Automation and Context servers must be accessible

### Basic Usage

```
Generate step definitions for feature file "Feature/API/prestashop_product_api_functional_tests.feature" with service name "prestashop" and service client "tests/serviceclient/PrestashopProductsApiClient.ts". Use MCP automation server for framework discovery and MCP context server for business rules.
```

**Output**: `tests/stepdefs/api_stepdefs/prestashop_stepdefs.ts`

## 📝 Sample Prompts

### 1. Basic Step Definition Generation (TypeScript)

**Prompt:**
```
Generate step definitions for feature file "Feature/API/prestashop_product_api_functional_tests.feature" with service name "prestashop" and service client "tests/serviceclient/PrestashopProductsApiClient.ts". Use MCP servers for context.
```

**What It Does:**
- Analyzes the feature file scenarios
- Discovers TypeScript/Cucumber framework patterns
- Integrates with PrestashopProductsApiClient
- Applies business rules from context files
- Generates complete step definitions

**Output Location:** `tests/stepdefs/api_stepdefs/prestashop_stepdefs.ts`

---

### 2. Python API Step Definitions (pytest-bdd)

**Prompt:**
```
Generate step definitions for feature file "Feature/API/user_management_api.feature" with service name "user_management" and service client "tests/serviceclient/user_api_client.py". Use MCP automation server for framework discovery and MCP context server for business rules.
```

**What It Does:**
- Detects Python language from `.py` extension
- Discovers pytest-bdd or behave framework
- Generates Python-specific decorators (@given, @when, @then)
- Creates pytest fixtures for context management

**Output Location:** `tests/stepdefs/api_stepdefs/user_management_stepdefs.py`

---

### 3. Java API Step Definitions (Cucumber)

**Prompt:**
```
Generate step definitions for feature file "Feature/API/payment_api_tests.feature" with service name "payment" and service client "tests/serviceclient/PaymentApiClient.java". Include framework discovery and business context.
```

**What It Does:**
- Detects Java language from `.java` extension
- Discovers Cucumber or RestAssured framework
- Generates Java annotations (@Given, @When, @Then)
- Creates proper class structure with dependency injection

**Output Location:** `tests/stepdefs/api_stepdefs/PaymentStepDefs.java`

---

### 4. Custom Output Directory

**Prompt:**
```
Generate step definitions for "Feature/API/order_api.feature" with service "order", service client "tests/serviceclient/OrderApiClient.ts", and output to "custom/stepdefs/". Use MCP servers for context.
```

**What It Does:**
- Uses custom output directory instead of default
- All other functionality remains the same

**Output Location:** `custom/stepdefs/order_stepdefs.ts`

---

### 5. Complex Service with Multiple Operations

**Prompt:**
```
Generate comprehensive step definitions for "Feature/API/inventory_management_api.feature" with service "inventory_management", service client "tests/serviceclient/InventoryApiClient.ts". Include all CRUD operations, bulk operations, and error handling. Use MCP automation server for framework discovery and MCP context server for business rules.
```

**What It Does:**
- Generates step definitions for complex scenarios
- Includes bulk operation support
- Adds comprehensive error handling
- Applies inventory-specific business rules

---

### 6. API with Advanced Authentication

**Prompt:**
```
Generate step definitions for "Feature/API/secured_api_tests.feature" with service "secure_api", service client "tests/serviceclient/SecureApiClient.ts". Include OAuth2, JWT, and API key authentication patterns. Use framework discovery and business validation.
```

**What It Does:**
- Generates multiple authentication step patterns
- Supports OAuth2, JWT, and API key flows
- Includes token refresh and validation logic

---

### 7. Validation-Heavy API Testing

**Prompt:**
```
Generate and validate step definitions for "Feature/API/data_validation_api.feature" with service "data_validation" and client "tests/serviceclient/ValidationApiClient.ts". Include comprehensive schema validation, business rule validation, and data type checking. Use MCP servers for context.
```

**What It Does:**
- Generates extensive validation step definitions
- Includes schema validation against OpenAPI/Swagger specs
- Applies business rule validations from context server
- Adds data type and format validations

---

### 8. RESTful API with State Transitions

**Prompt:**
```
Generate step definitions for "Feature/API/workflow_state_api.feature" with service "workflow", service client "tests/serviceclient/WorkflowApiClient.ts". Include state transition validation and workflow constraints from business rules. Use MCP servers.
```

**What It Does:**
- Generates steps for state transition testing
- Applies workflow constraints from business rules
- Validates state sequences and dependencies

---

## 🔧 Command Components Explained

### Required Components

#### 1. Feature File Path
```
"Feature/API/prestashop_product_api_functional_tests.feature"
```
- Path to your Gherkin feature file
- Must exist and be valid Gherkin syntax
- Contains scenarios you want to automate

#### 2. Service Name
```
service name "prestashop"
```
- Used for file naming: `{service_name}_stepdefs.ts`
- Should match your service domain
- Examples: "prestashop", "user_management", "payment"

#### 3. Service Client Path
```
service client "tests/serviceclient/PrestashopProductsApiClient.ts"
```
- Path to your existing API client implementation
- File extension determines language detection (.ts, .py, .java, .cs)
- Must contain API methods referenced in feature file

### Optional Components

#### 4. Output Directory
```
output to "custom/stepdefs/"
```
- Specifies where to save generated file
- If omitted, uses `tests/stepdefs/api_stepdefs/` (default)
- Directory will be created if it doesn't exist

#### 5. MCP Context Request
```
Use MCP automation server for framework discovery and MCP context server for business rules
```
- **CRITICAL**: Always include this phrase
- Ensures framework patterns are discovered
- Applies business rules and validations
- Without this, code may not follow your framework conventions

---

## 📂 Output Structure

### TypeScript Output
```
tests/stepdefs/api_stepdefs/
└── prestashop_stepdefs.ts     # Complete step definitions
```

### Python Output
```
tests/stepdefs/api_stepdefs/
└── prestashop_stepdefs.py     # Complete step definitions
```

### Java Output
```
tests/stepdefs/api_stepdefs/
└── PrestashopStepDefs.java    # Complete step definitions
```

---

## 🎯 Generated Step Definition Structure

### File Contents (TypeScript Example)

```typescript
/**
 * Step Definitions for PrestaShop Products API
 * Feature: prestashop_product_api_functional_tests.feature
 * 
 * Generated with MCP context integration
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../framework/core/customWorld';
import { PrestashopProductsApiClient } from '../serviceclient/PrestashopProductsApiClient';

// Background Steps
Given('the PrestaShop API is available at {string}', async function(this: CustomWorld, baseUrl: string) {
  // Setup API client
});

// Authentication Steps
Given('I have valid API credentials with key {string}', async function(this: CustomWorld, apiKey: string) {
  // Configure authentication
});

// API Operation Steps
When('I send a GET request to {string}', async function(this: CustomWorld, endpoint: string) {
  // Execute GET request
});

When('I send a POST request to {string} with product XML data', async function(this: CustomWorld, endpoint: string) {
  // Execute POST request
});

// Validation Steps
Then('the response status should be {int}', async function(this: CustomWorld, expectedStatus: number) {
  // Validate status code
});

Then('the response should contain a list of products', async function(this: CustomWorld) {
  // Validate response structure
});

// Utility Functions
async function setupApiClient(this: CustomWorld, baseUrl?: string, apiKey?: string): Promise<PrestashopProductsApiClient> {
  // Helper function
}
```

---

## 🔍 How It Works

### Step 1: Language Detection
- Analyzes service client file extension
- `.ts` → TypeScript
- `.py` → Python
- `.java` → Java
- `.cs` → C#

### Step 2: Framework Discovery
- Scans workspace via MCP Automation Server
- Detects Cucumber, pytest-bdd, behave, RestAssured, SpecFlow, etc.
- Identifies existing step definition patterns

### Step 3: Business Rules Application
- Retrieves validation rules from MCP Context Server
- Applies domain-specific business logic
- Incorporates compliance requirements

### Step 4: Code Generation
- Generates language-specific syntax
- Follows discovered framework patterns
- Integrates with service client methods
- Includes comprehensive error handling

### Step 5: Type Safety
- Creates TypeScript interfaces (if TypeScript)
- Uses type hints (if Python 3.6+)
- Strong typing (Java, C#)

---

## ✅ Success Criteria

After generation, your step definitions will:

- ✅ **Compile Successfully**: No syntax or type errors
- ✅ **Follow Framework Patterns**: Uses your project's conventions
- ✅ **Integrate with Service Client**: Properly calls API methods
- ✅ **Include Business Logic**: Applies validation rules
- ✅ **Handle Errors**: Comprehensive try-catch and logging
- ✅ **Support All Scenarios**: Covers all feature file scenarios

---

## 🛠️ Troubleshooting

### Issue 1: "Feature file not found"
**Solution:**
```powershell
# Verify file exists
Test-Path "Feature\API\your_feature.feature"

# Use correct path separators
# Windows: "Feature\API\file.feature" or "Feature/API/file.feature"
```

### Issue 2: "Service client not found"
**Solution:**
```powershell
# Check service client exists
Test-Path "tests\serviceclient\YourApiClient.ts"

# Verify file extension matches language
# TypeScript: .ts
# Python: .py
# Java: .java
```

### Issue 3: "MCP server not accessible"
**Solution:**
```powershell
# Test MCP Automation Server
python -c "import sys; sys.path.append('src/mcp'); from mcp_automation_server import *"

# Test MCP Context Server
python -c "import sys; sys.path.append('src/mcp'); from mcp_context_server import *"
```

### Issue 4: Generated code doesn't compile
**Possible Causes:**
- Missing framework dependencies
- Incorrect import paths
- TypeScript configuration issues

**Solution:**
```powershell
# Install dependencies
npm install @cucumber/cucumber @playwright/test typescript

# Check TypeScript config
Test-Path "tsconfig.json"

# Verify framework files exist
Test-Path "framework\core\customWorld.ts"
```

---

## 🎓 Best Practices

### 1. Always Include MCP Context Request
```
Use MCP automation server for framework discovery and MCP context server for business rules
```
This ensures generated code follows your project's patterns.

### 2. Use Descriptive Service Names
```
service name "user_management"    # Good
service name "um"                  # Avoid
```

### 3. Keep Feature Files Organized
```
Feature/API/
  ├── user_api.feature
  ├── product_api.feature
  └── order_api.feature
```

### 4. Maintain Service Client Consistency
```
tests/serviceclient/
  ├── UserApiClient.ts
  ├── ProductApiClient.ts
  └── OrderApiClient.ts
```

### 5. Review Generated Code
- Check for framework pattern compliance
- Verify business rule integration
- Test with actual API endpoints
- Adjust as needed for edge cases

---

## 📊 Advanced Usage

### Multi-Service Integration
```
Generate step definitions for "Feature/API/order_fulfillment.feature" with service "order_fulfillment", service client "tests/serviceclient/OrderFulfillmentApiClient.ts". This service integrates payment, inventory, and shipping APIs. Include comprehensive validation and state management. Use MCP servers for context.
```

### Legacy API Migration
```
Generate step definitions for "Feature/API/legacy_system_api.feature" with service "legacy_system", service client "tests/serviceclient/LegacySystemApiClient.ts". Include backward compatibility checks and extensive error handling for legacy response formats. Use framework discovery and business rules.
```

### Microservices Testing
```
Generate step definitions for "Feature/API/microservice_auth.feature" with service "auth_service", service client "tests/serviceclient/AuthServiceApiClient.ts". Include service-to-service authentication, circuit breaker patterns, and retry logic. Use MCP servers.
```

---

## 🔗 Related Documentation

- **Feature File Guide**: How to write effective API feature files
- **Service Client Guide**: Creating service API clients
- **Framework Setup**: Configuring your test framework
- **Business Rules**: Defining validation rules in context files

---

## 📞 Support

### Common Questions

**Q: Can I modify generated step definitions?**
A: Yes! Generated code is a starting point. Customize as needed for your specific use cases.

**Q: Does it work with my custom framework?**
A: The tool discovers frameworks dynamically. If it follows standard patterns (Cucumber, pytest-bdd, etc.), it should work.

**Q: What if I don't have a service client?**
A: Create a basic service client first. The generator needs it for API method discovery and type information.

**Q: Can I regenerate if my feature file changes?**
A: Yes! Re-run the generator. Review changes before overwriting existing files.

---

## 🚦 Getting Started Checklist

- [ ] Create or have a Gherkin feature file ready
- [ ] Implement or have an API service client
- [ ] Verify MCP servers are accessible
- [ ] Decide on output directory (or use default)
- [ ] Run generation command with all required parameters
- [ ] Review generated code
- [ ] Test with actual API
- [ ] Commit to version control

---

## 📈 Example Workflow

### Step 1: Create Feature File
```gherkin
# Feature/API/product_api.feature
Feature: Product API Testing
  
  Background:
    Given the Product API is available at "http://localhost:8080"
    And I have valid API credentials with key "YOUR_API_KEY"
  
  Scenario: Get all products
    When I send a GET request to "/api/products"
    Then the response status should be 200
    And the response should contain a list of products
```

### Step 2: Create Service Client
```typescript
// tests/serviceclient/ProductApiClient.ts
export class ProductApiClient extends ApiClient {
  async getAllProducts(): Promise<ProductListResponse> {
    return this.get('/api/products');
  }
}
```

### Step 3: Generate Step Definitions
```
Generate step definitions for feature file "Feature/API/product_api.feature" with service name "product" and service client "tests/serviceclient/ProductApiClient.ts". Use MCP servers for context.
```

### Step 4: Run Tests
```powershell
npx cucumber-js Feature/API/product_api.feature
```

---

## 🎉 Success!

You now have comprehensive, framework-compliant, business-rule-aware step definitions ready to use for your API testing!

---

**Last Updated**: November 27, 2025
**Version**: 1.0.0
