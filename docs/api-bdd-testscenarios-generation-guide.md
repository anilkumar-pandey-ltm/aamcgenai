# API BDD Test Scenarios Generation Guide

## 🤖 Agent Information

**Agent Mode**: `api-BDD_Testscenarios-gen`  
**Agent File**: `.github/agents/api-BDD_Testscenarios-gen.agent.md`  
**Activation**: Use `@api-BDD_Testscenarios-gen` prefix in your Copilot prompts

### How to Activate This Agent

```
@api-BDD_Testscenarios-gen [Your Prompt]
```

**Example:**
```
@api-BDD_Testscenarios-gen Generate BDD Functional API Test Cases for User Management API from "tests/apidoc/user_api_swagger.json"
```

## 📋 Overview

This guide explains how to use the **BDD Functional API Test Case Generation Agent** to automatically generate comprehensive BDD feature files from API documentation using test design techniques and MCP context servers.

**What This Agent Does:**
- ✅ Analyzes API documentation (Swagger/OpenAPI, Postman, PDF, etc.)
- ✅ Applies 5 test design techniques (EP, BVA, Decision Table, State Transition, Use Case)
- ✅ Integrates business rules and domain knowledge from MCP context servers
- ✅ Generates comprehensive BDD feature files with Gherkin scenarios
- ✅ Automatically saves to configured output path
- ✅ Creates positive and negative test scenarios

---

## 🚀 Quick Start

### Prerequisites

#### 1. MCP Servers Must Be Running
```powershell
# Start MCP Context Server (for business rules, domain models)
python src/mcp/mcp_context_server.py

# Start MCP Automation Server (for framework patterns)
python src/mcp/mcp_automation_server.py
```

#### 2. Configure Output Path
Verify feature file output path in `copilot-agent.paths.yaml`:
```yaml
feature_paths:
  api: "Feature/API"  # Where generated .feature files will be saved
```

#### 3. Prepare Context Files (Optional but Recommended)
- Application Context: `data/context/application/`
- Business Rules: `data/context/business_rules/`
- Domain Models: `data/context/domain/`
- User Stories: `data/stories/`

---

## 🎯 Sample Prompts

### ⭐ Template 1: Basic Generation (Recommended)

```
Generate BDD Functional API Test Cases for [API Name]

API Documentation: [FILE PATH, URL, or paste Swagger/OpenAPI content]
Main Entity: [e.g., User, Order, Product, Payment]

Requirements:
- Use business rules from MCP context servers
- Apply all test design techniques from Testdesign_techniques.md
- Include Equivalence Partitioning, Boundary Value Analysis, Decision Tables, State Transitions, and Use Cases
- Generate positive and negative scenarios
- Save to Feature/API/[api_name]_functional_tests.feature
```

**Example:**
```
Generate BDD Functional API Test Cases for User Management API

API Documentation: tests/apidoc/user_api_swagger.json
Main Entity: User

Requirements:
- Use business rules from MCP context servers
- Apply all test design techniques from Testdesign_techniques.md
- Include Equivalence Partitioning, Boundary Value Analysis, Decision Tables, State Transitions, and Use Cases
- Generate positive and negative scenarios
- Save to Feature/API/user_management_functional_tests.feature
```

---

### ⭐ Template 2: With Specific Business Focus

```
Generate BDD Functional API Test Cases for [API Name]

API Documentation: [FILE/URL/Content]
Main Entity: [Entity Name]
Business Focus: [e.g., Discount calculation, Order workflow, Payment processing]

Priority Techniques:
1. [Decision Table] for [discount rules]
2. [State Transition] for [order status flow]
3. [BVA] for [pricing boundaries]

Requirements:
- Emphasize specified techniques
- Include all other techniques for comprehensive coverage
- Use application context from data/context/application/
- Use business rules from data/context/business_rules/
- Use domain models from data/context/domain/
- Reference user stories from data/stories/
- Save to Feature/API/
```

**Example:**
```
Generate BDD Functional API Test Cases for E-Commerce Order API

API Documentation: tests/apidoc/order_api_postman_collection.json
Main Entity: Order
Business Focus: Order discount calculation and status workflow

Priority Techniques:
1. [Decision Table] for discount rules (customer type, order amount, first order)
2. [State Transition] for order status flow (Created → Confirmed → Shipped → Delivered)
3. [BVA] for order amount boundaries (min/max values)

Requirements:
- Emphasize specified techniques
- Include all other techniques for comprehensive coverage
- Use application context from data/context/application/
- Use business rules from data/context/business_rules/
- Use domain models from data/context/domain/
- Reference user stories from data/stories/
- Save to Feature/API/
```

---

### ⭐ Template 3: Minimal Prompt

```
Generate BDD Functional API Test Cases:

API: [API Name]
Documentation: [FILE/URL]

Apply test design techniques and save to Feature/API/
```

**Example:**
```
Generate BDD Functional API Test Cases:

API: Product Catalog API
Documentation: tests/apidoc/product_api_swagger.yaml

Apply test design techniques and save to Feature/API/
```

---

### ⭐ Template 4: With Inline API Spec

```
Generate BDD Functional API Test Cases for [API Name]

Main Entity: [Entity]

API Documentation:
```yaml
[Paste your Swagger/OpenAPI YAML content here]
```

Requirements:
- Apply all test design techniques
- Use business context from MCP servers
- Save to Feature/API/[api_name]_functional_tests.feature
```

**Example:**
```
Generate BDD Functional API Test Cases for Payment Processing API

Main Entity: Payment

API Documentation:
```yaml
openapi: 3.0.0
info:
  title: Payment API
  version: 1.0.0
paths:
  /api/payments:
    post:
      summary: Process payment
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                amount:
                  type: number
                  minimum: 0.01
                  maximum: 99999.99
                currency:
                  type: string
                  enum: [USD, EUR, GBP]
                paymentMethod:
                  type: string
                  enum: [CARD, WALLET, BANK]
```

Requirements:
- Apply all test design techniques
- Use business context from MCP servers
- Save to Feature/API/payment_processing_functional_tests.feature
```

---

## 📐 Test Design Techniques Applied

The agent automatically applies these 5 techniques:

### 1. **Equivalence Partitioning (EP)**
Groups input data into valid and invalid partitions.

**Generated Scenarios:**
```gherkin
@equivalence-partitioning @positive
Scenario: Create user with valid email (Valid Partition)
  Given I have a valid email "user@example.com"
  When I POST to "/api/users" with user data
  Then the response status should be 201

@equivalence-partitioning @negative
Scenario: Create user with invalid email (Invalid Partition)
  Given I have an invalid email "invalid-email"
  When I POST to "/api/users" with user data
  Then the response status should be 400
```

### 2. **Boundary Value Analysis (BVA)**
Tests at the edges of input domains.

**Generated Scenarios:**
```gherkin
@boundary-value-analysis
Scenario Outline: Create product with boundary prices
  Given I have a product with price <price>
  When I POST to "/api/products" with product data
  Then the response status should be <status>

  Examples:
    | price      | status | description          |
    | 0.00       | 400    | Below minimum        |
    | 0.01       | 201    | At minimum           |
    | 0.02       | 201    | Just above minimum   |
    | 99999.98   | 201    | Just below maximum   |
    | 99999.99   | 201    | At maximum           |
    | 100000.00  | 400    | Above maximum        |
```

### 3. **Decision Table Testing**
Covers all combinations of business rules.

**Generated Scenarios:**
```gherkin
@decision-table @discount-calculation
Scenario Outline: Order discount calculation
  Given customer type is <customerType>
  And order amount is <amount>
  And first order flag is <firstOrder>
  When I create an order
  Then discount should be <discount>
  And free shipping should be <freeShipping>

  Examples:
    | customerType | amount | firstOrder | discount | freeShipping |
    | Premium      | 150.00 | true       | 20%      | true         |
    | Premium      | 150.00 | false      | 15%      | true         |
    | Regular      | 150.00 | true       | 10%      | true         |
    | Regular      | 50.00  | false      | 0%       | false        |
```

### 4. **State Transition Testing**
Validates API state changes and workflows.

**Generated Scenarios:**
```gherkin
@state-transition @positive
Scenario: Valid order status transitions
  Given I have an order in "Created" state
  When I change status to "Confirmed"
  Then the order status should be "Confirmed"
  When I change status to "Shipped"
  Then the order status should be "Shipped"

@state-transition @negative
Scenario: Invalid order status transition
  Given I have an order in "Created" state
  When I change status to "Shipped"
  Then the response status should be 400
  And the error should be "Cannot ship unconfirmed order"
```

### 5. **Use Case Testing**
Tests complete end-to-end user scenarios.

**Generated Scenarios:**
```gherkin
@use-case @end-to-end
Scenario: Complete order workflow
  When I search for products with "laptop"
  And I add product "PROD001" to cart
  And I create an order from cart
  And I process payment for the order
  Then the order should be confirmed
  And payment status should be "Processed"
```

---

## 🔌 MCP Context Integration

### What MCP Servers Provide

#### **mcp_context_server** - Business Intelligence
Automatically retrieves:
- ✅ Application architecture and components
- ✅ Business rules and validation constraints
- ✅ Domain models and entity relationships
- ✅ User stories and requirements
- ✅ Data validation patterns

**Context Locations:**
- Application: `data/context/application/`
- Business Rules: `data/context/business_rules/`
- Domain Models: `data/context/domain/`
- User Stories: `data/stories/`

#### **mcp_automation_server** - Framework Patterns
Automatically retrieves:
- ✅ BDD test patterns and best practices
- ✅ Gherkin scenario templates
- ✅ Test data structures
- ✅ Feature file organization patterns

### Server Status Check

**If MCP servers are not running, Copilot will inform you:**
```
❌ MCP Context Server is not running. Please start it to access business context.
   Run: python src/mcp/mcp_context_server.py

❌ MCP Automation Server is not running. Please start it to access framework patterns.
   Run: python src/mcp/mcp_automation_server.py
```

---

## 📂 Output Structure

### Generated Feature File Location
```
Feature/API/[api_name]_functional_tests.feature
```

### File Naming Convention
- Pattern: `{api_name}_functional_tests.feature`
- Examples:
  - `user_management_functional_tests.feature`
  - `order_processing_functional_tests.feature`
  - `payment_gateway_functional_tests.feature`

### Feature File Structure
```gherkin
@functional @[api-name]-api
Feature: [API Name] Functional Testing
  As a test engineer
  I want to validate [API Name] functional behavior
  Using comprehensive test design techniques based on business rules

  Background:
    Given the API base URL is configured
    And I have valid authentication credentials

  # Equivalence Partitioning Scenarios
  @equivalence-partitioning @positive
  Scenario: [EP Positive Test]
    ...

  @equivalence-partitioning @negative
  Scenario: [EP Negative Test]
    ...

  # Boundary Value Analysis Scenarios
  @boundary-value-analysis
  Scenario Outline: [BVA Test with Examples]
    ...
    Examples:
    | ... |

  # Decision Table Scenarios
  @decision-table @business-rules
  Scenario Outline: [Complex Business Rule Test]
    ...
    Examples:
    | ... |

  # State Transition Scenarios
  @state-transition @positive
  Scenario: [Valid State Transition]
    ...

  @state-transition @negative
  Scenario: [Invalid State Transition]
    ...

  # Use Case Scenarios
  @use-case @end-to-end
  Scenario: [Complete Workflow]
    ...
```

---

## 🎬 Complete Workflow Example

### Step 1: Prepare Your Environment

```powershell
# Start MCP servers
python src/mcp/mcp_context_server.py   # Terminal 1
python src/mcp/mcp_automation_server.py # Terminal 2
```

### Step 2: Prepare Context Files (Optional)

**Create Business Rules File** (`data/context/business_rules/payment_rules.yaml`):
```yaml
payment_rules:
  amount:
    minimum: 0.01
    maximum: 99999.99
  
  discount_rules:
    - condition: "customer_type = 'Premium' AND amount >= 100"
      discount: 15%
    - condition: "customer_type = 'Regular' AND amount >= 200"
      discount: 10%
  
  state_transitions:
    - from: "Initiated"
      to: ["Authorized", "Failed"]
    - from: "Authorized"
      to: ["Captured", "Cancelled"]
    - from: "Captured"
      to: ["Refunded"]
```

### Step 3: Use Copilot Agent with Sample Prompt

**Prompt:**
```
Generate BDD Functional API Test Cases for Payment Processing API

API Documentation: tests/apidoc/payment_api_swagger.json
Main Entity: Payment

Requirements:
- Use business rules from MCP context servers
- Apply all test design techniques from Testdesign_techniques.md
- Include Equivalence Partitioning, Boundary Value Analysis, Decision Tables, State Transitions, and Use Cases
- Generate positive and negative scenarios
- Save to Feature/API/payment_processing_functional_tests.feature
```

### Step 4: What Copilot Does Automatically

**Copilot will:**
1. ✅ Check if MCP servers are running
2. ✅ Retrieve business rules from `data/context/business_rules/`
3. ✅ Retrieve domain models from `data/context/domain/`
4. ✅ Review user stories from `data/stories/`
5. ✅ Analyze API documentation (Swagger/OpenAPI)
6. ✅ Apply all 5 test design techniques
7. ✅ Generate comprehensive BDD scenarios
8. ✅ Save feature file to `Feature/API/payment_processing_functional_tests.feature`

### Step 5: Review Generated Output

**Copilot confirms:**
```
✅ Feature file generated and saved!
✅ Location: Feature/API/payment_processing_functional_tests.feature
✅ Total scenarios: 45 (EP: 8, BVA: 12, Decision: 15, State: 6, Use Case: 4)
✅ Test techniques: EP, BVA, DecisionTable, StateTransition, UseCase
✅ Business rules validated: 12 rules from payment_rules.yaml
✅ Ready for execution with Cucumber
```

---

## 🎯 Tips for Best Results

### DO's ✅

1. **Be Specific**: Mention the API name and main entity clearly
   ```
   API: User Management API
   Main Entity: User
   ```

2. **Provide Business Focus**: Share focus areas
   ```
   Business Focus: User registration workflow, email validation, password strength
   ```

3. **Reference Context**: Let Copilot access business context automatically
   ```
   Requirements:
   - Use business rules from data/context/business_rules/
   - Reference user stories from data/stories/
   ```

4. **Specify Priority Techniques**: Mention which techniques to emphasize
   ```
   Priority Techniques:
   1. [Decision Table] for discount rules
   2. [State Transition] for order status flow
   ```

5. **Review Output**: Always validate generated scenarios for business alignment

### DON'Ts ❌

1. **Don't Skip MCP Servers**: Always start them first for best context
2. **Don't Hardcode**: Let Copilot use data tables for parameterization
3. **Don't Ignore Context Files**: Populate business rules and domain models
4. **Don't Over-specify**: Trust the agent to apply techniques appropriately

---

## 📋 Validation Checklist

After generation, verify:

```
✅ Feature declaration and Background section
✅ Scenario declarations clear and concise
✅ Given/When/Then structure followed correctly
✅ Data tables properly formatted
✅ Tags meaningful (@functional, @equivalence, @boundary, @decision, @state, @use-case)
✅ Comments referencing business rules
✅ All test design techniques represented
✅ All API endpoints covered
✅ Positive and negative scenarios included
✅ Boundary values tested
✅ Business rules validated
✅ State transitions covered
✅ End-to-end workflows included
```

---

## 🔧 Troubleshooting

### Issue: "MCP Context Server is not running"

**Solution:**
```powershell
python src/mcp/mcp_context_server.py
```

### Issue: "No business rules found"

**Solution:**
Check context files exist:
```powershell
ls data/context/business_rules/
ls data/context/domain/
```

### Issue: "Feature file not generated"

**Solution:**
1. Verify output path in `copilot-agent.paths.yaml`
2. Check write permissions on `Feature/API/` directory
3. Review Copilot error messages

### Issue: "Generic scenarios without business context"

**Solution:**
1. Ensure MCP Context Server is running
2. Populate business rules files in `data/context/business_rules/`
3. Add domain models to `data/context/domain/`

---

## 📞 Key Resources

### Configuration Files
- **Path Configuration**: `copilot-agent.paths.yaml`
- **Test Design Techniques**: `.github/prompts/Testdesign_techniques.md`
- **Agent Definition**: `.github/agents/api-BDD_Testscenarios-gen.agent.md`

### Context Directories
- **Application Context**: `data/context/application/`
- **Business Rules**: `data/context/business_rules/`
- **Domain Models**: `data/context/domain/`
- **User Stories**: `data/stories/`

### Output Directory
- **Generated Features**: `Feature/API/`

### MCP Servers
- **Context Server**: `src/mcp/mcp_context_server.py`
- **Automation Server**: `src/mcp/mcp_automation_server.py`

---

## 🎓 Advanced Usage

### Generate Multiple API Test Suites

**Prompt:**
```
Generate BDD Functional API Test Cases for the following APIs:

1. User Management API (tests/apidoc/user_api.json)
2. Product Catalog API (tests/apidoc/product_api.yaml)
3. Order Processing API (tests/apidoc/order_api.json)

Requirements:
- Apply all test design techniques to each API
- Use business context from MCP servers
- Save each to Feature/API/ with appropriate naming
```

### Focus on Specific Endpoints

**Prompt:**
```
Generate BDD Functional API Test Cases for Order API - Payment Endpoint Only

API Documentation: tests/apidoc/order_api_swagger.json
Endpoint Focus: POST /api/orders/{orderId}/payment
Main Entity: Payment

Requirements:
- Focus on payment processing business rules
- Emphasize Decision Table for payment method logic
- Include State Transitions for payment status flow
- Apply BVA for payment amount boundaries
- Save to Feature/API/order_payment_functional_tests.feature
```

---

## 📈 Quality Metrics

A well-generated feature file should have:

- **Scenario Count**: 20-50 scenarios (depending on API complexity)
- **Technique Coverage**: All 5 techniques represented
- **Positive/Negative Ratio**: ~60% positive, ~40% negative
- **Business Rule Coverage**: All rules from context files tested
- **State Coverage**: All state transitions validated
- **Endpoint Coverage**: All CRUD operations included

---

## 🚀 Next Steps

After generating feature files:

1. **Review Scenarios**: Validate against actual business requirements
2. **Generate Step Definitions**: Use step-definitions-generator agent
3. **Create Test Data**: Use test data from MCP context server
4. **Execute Tests**: Run with Cucumber/Playwright framework
5. **Integrate CI/CD**: Add to test automation pipeline

---

**Last Updated**: November 27, 2025  
**Version**: 1.0  
**Agent**: api-BDD_Testscenarios-gen.agent.md  
**Framework**: FusionIQ BDD API Test Automation
