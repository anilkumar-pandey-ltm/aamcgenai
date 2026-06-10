# API Analyzer Service Guide

## 🤖 Agent Information

**Agent Mode**: `api-analyzer-service`  
**Agent File**: `.github/agents/api-analyzer-service.agent.md`  
**Activation**: Use `@api-analyzer-service` prefix in your Copilot prompts

### How to Activate This Agent

```
@api-analyzer-service [Your Prompt]
```

**Example:**
```
@api-analyzer-service Analyze API document from "Input/API_Collections/demo.json" and save it in "tests/api_output"
```

## 📋 Overview

This guide explains how to use the **API Analyzer Service Agent** to automatically analyze API documentation and generate comprehensive test automation artifacts (YAML files) using existing framework utilities.

**What This Agent Does:**
- ✅ Analyzes API documentation (Postman Collections, Swagger/OpenAPI, PDF, etc.)
- ✅ Extracts endpoints, schemas, authentication, and parameters
- ✅ Generates 4 standardized YAML files (endpoints, schema, testdata, template)
- ✅ Creates dynamic test data with Faker integration
- ✅ Saves to user-specified output directory
- ✅ Provides comprehensive analysis reports

---

## 🚀 Quick Start

### Prerequisites

#### 1. Python Environment
```powershell
# Ensure Python environment is configured
python --version  # Should be Python 3.8+
```

#### 2. Configure Output Path (Optional)
Default output path in `copilot-agent.paths.yaml`:
```yaml
test_paths:
  apidata: "tests/apidata"  # Default location for generated YAML files
```

#### 3. Prepare API Documentation Files
Supported formats:
- **Postman Collections**: `.json`
- **Swagger/OpenAPI**: `.yaml`, `.json`
- **PDF Documents**: `.pdf`
- **API Documentation**: Various formats

---

## 🎯 Sample Prompts

### ⭐ Template 1: Simple Direct Command (Recommended)

```
Analyze API document from "[INPUT_FILE_PATH]" and save it in "[OUTPUT_DIR]"
```

**Example:**
```
Analyze API document from "Input\API_Collections\demo_product_collection.json" and save it in "tests\api_output"
```

**What Happens:**
- Copilot automatically extracts service name from filename
- Uses CLI utility: `python src/utils/api_analyzer_cli.py`
- Generates all 4 YAML files automatically
- No large Python code blocks or syntax errors

### ⭐ Template 2: With Explicit Service Name

```
Analyze API document - input file path and save it in output directory path

Input File: [FULL PATH TO API DOCUMENT]
Output Directory: [FULL PATH TO OUTPUT DIRECTORY]
Service Name: [SERVICE_NAME]
```

**Example:**
```
Analyze api document - input file path and save it in output directory path

Input File: C:\API_Docs\user_api_postman.json
Output Directory: C:\TestOutput
Service Name: user_management
```

---

### ⭐ Template 3: Batch Multiple Files

```
Analyze API documents:
1. From "Input/API_Collections/user_api.json" to "tests/api_output"
2. From "Input/API_Collections/product_api.json" to "tests/api_output"
3. From "Input/API_Collections/order_api.json" to "tests/api_output"
```

---

### ⭐ Template 4: Quick One-Liner

```
Analyze [API_FILE_PATH] and save to [OUTPUT_DIR]
```

**Example:**
```
Analyze Input/API_Collections/payment_api.json and save to tests/api_output
```

---

## 🔧 How It Works (Behind the Scenes)

### CLI Utility Approach

The agent now uses a dedicated CLI utility (`src/utils/api_analyzer_cli.py`) instead of inline Python code blocks.

**Command Executed:**
```bash
python src/utils/api_analyzer_cli.py <INPUT_FILE> <OUTPUT_DIR> <SERVICE_NAME>
```

**Benefits:**
- ✅ **No Syntax Errors**: Pre-tested Python utility
- ✅ **Token Efficient**: Single command instead of 30+ lines of code
- ✅ **Clean Output**: Clear progress messages and validation
- ✅ **Maintainable**: Updates in one place
- ✅ **Reliable**: Handles path resolution automatically

**What the CLI Does:**
1. Adds project root to Python path (fixes import issues)
2. Creates output directory automatically
3. Loads and validates input file
4. Detects document type (Postman/OpenAPI)
5. Initializes EnhancedAPIAnalyzer
6. Analyzes API and generates all 4 YAML files
7. Validates generated files
8. Reports clear success/failure messages

---

## 📂 Sample Input Files

### Sample 1: Postman Collection (`user_api_postman.json`)

```json
{
  "info": {
    "name": "User Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create User",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/users",
          "host": ["{{base_url}}"],
          "path": ["api", "users"]
        },
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"john_doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"SecurePass123\",\n  \"role\": \"user\"\n}"
        }
      },
      "response": [
        {
          "name": "Success Response",
          "status": "Created",
          "code": 201,
          "body": "{\n  \"id\": 1001,\n  \"username\": \"john_doe\",\n  \"email\": \"john@example.com\",\n  \"role\": \"user\",\n  \"createdAt\": \"2025-11-27T10:30:00Z\"\n}"
        }
      ]
    },
    {
      "name": "Get User by ID",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{base_url}}/api/users/:userId",
          "host": ["{{base_url}}"],
          "path": ["api", "users", ":userId"],
          "variable": [
            {
              "key": "userId",
              "value": "1001"
            }
          ]
        }
      }
    },
    {
      "name": "Update User",
      "request": {
        "method": "PUT",
        "url": "{{base_url}}/api/users/:userId",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"john.doe@example.com\",\n  \"role\": \"admin\"\n}"
        }
      }
    },
    {
      "name": "Delete User",
      "request": {
        "method": "DELETE",
        "url": "{{base_url}}/api/users/:userId"
      }
    }
  ]
}
```

---

### Sample 2: Swagger/OpenAPI Spec (`product_api_swagger.yaml`)

```yaml
openapi: 3.0.0
info:
  title: Product Catalog API
  version: 1.0.0
  description: API for managing product catalog

servers:
  - url: https://api.example.com/v1
    description: Production server

paths:
  /api/products:
    get:
      summary: List all products
      operationId: listProducts
      tags:
        - Products
      parameters:
        - name: category
          in: query
          schema:
            type: string
          required: false
        - name: minPrice
          in: query
          schema:
            type: number
            minimum: 0
        - name: maxPrice
          in: query
          schema:
            type: number
            maximum: 99999.99
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Product'
    
    post:
      summary: Create a new product
      operationId: createProduct
      tags:
        - Products
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProductInput'
      responses:
        '201':
          description: Product created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '400':
          description: Invalid input

  /api/products/{productId}:
    get:
      summary: Get product by ID
      operationId: getProduct
      parameters:
        - name: productId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Product details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '404':
          description: Product not found

components:
  schemas:
    Product:
      type: object
      required:
        - id
        - name
        - price
        - stock
      properties:
        id:
          type: string
          description: Unique product identifier
        name:
          type: string
          minLength: 2
          maxLength: 100
          description: Product name
        description:
          type: string
          maxLength: 500
        price:
          type: number
          minimum: 0.01
          maximum: 99999.99
          description: Product price
        category:
          type: string
          enum: [Electronics, Clothing, Books, Home, Sports]
        stock:
          type: integer
          minimum: 0
          description: Available stock quantity
        createdAt:
          type: string
          format: date-time
    
    ProductInput:
      type: object
      required:
        - name
        - price
        - stock
      properties:
        name:
          type: string
          minLength: 2
          maxLength: 100
        description:
          type: string
          maxLength: 500
        price:
          type: number
          minimum: 0.01
        category:
          type: string
        stock:
          type: integer
          minimum: 0

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
```

---

### Sample 3: Minimal OpenAPI (`payment_api.json`)

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Payment Processing API",
    "version": "1.0.0"
  },
  "paths": {
    "/api/payments": {
      "post": {
        "summary": "Process payment",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["amount", "currency", "paymentMethod"],
                "properties": {
                  "amount": {
                    "type": "number",
                    "minimum": 0.01,
                    "maximum": 99999.99
                  },
                  "currency": {
                    "type": "string",
                    "enum": ["USD", "EUR", "GBP", "INR"]
                  },
                  "paymentMethod": {
                    "type": "string",
                    "enum": ["CARD", "WALLET", "NET_BANKING", "UPI"]
                  },
                  "cardDetails": {
                    "type": "object",
                    "properties": {
                      "cardNumber": {
                        "type": "string",
                        "pattern": "^[0-9]{16}$"
                      },
                      "cvv": {
                        "type": "string",
                        "pattern": "^[0-9]{3,4}$"
                      },
                      "expiryMonth": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 12
                      },
                      "expiryYear": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Payment successful",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "transactionId": {"type": "string"},
                    "status": {"type": "string", "enum": ["SUCCESS", "PENDING", "FAILED"]},
                    "amount": {"type": "number"},
                    "timestamp": {"type": "string", "format": "date-time"}
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

---

## 🎬 Complete Workflow Examples

### Example 1: Analyze Postman Collection (Real Output)

**Step 1: Prepare Input File**
Save the API Postman collection to: `Input/API_Collections/demo_product_collection.json`

**Step 2: Use Simple Copilot Prompt**
```
Analyze API document from "Input\API_Collections\demo_product_collection.json" and save it in "tests\api_output"
```

**Step 3: What Copilot Executes**
```bash
python src/utils/api_analyzer_cli.py "Input\API_Collections\demo_product_collection.json" "tests\api_output" "prestashop_products"
```

**Step 4: Real Console Output**
```
============================================================
API Analyzer CLI
============================================================
Input File:    Input\API_Collections\demo_product_collection.json
Output Dir:    tests\api_output
Service Name:  prestashop_products
============================================================
✅ Output directory ready: tests\api_output
✅ Loaded API document: Input\API_Collections\demo_product_collection.json (13070 chars)
✅ Detected document type: postman

✅ Analysis complete!
✅ Generated files: endpoints, schema, testdata, template
✅ Location: tests\api_output/prestashop_products/
✅ Total files: 4

📊 Validation: 4/4 files generated
✅ endpoints.yaml
✅ schema.yaml
✅ testdata.yaml
✅ template.yaml
```

**Step 5: Generated Output**
```
tests/api_output/prestashop_products/
├── endpoints.yaml      # All API endpoints
├── schema.yaml         # Request/response schemas
├── testdata.yaml       # Valid and invalid test data
└── template.yaml       # Dynamic data generation templates
```

**Key Improvements:**
- ❌ **OLD**: 30+ lines of Python code in prompt → Syntax errors
- ✅ **NEW**: Single CLI command → No errors, clean output
- ⚡ **Fast**: Analysis completed in seconds
- 📊 **Clear**: Progress messages and validation results

---

### Example 2: Analyze Swagger/OpenAPI Specification

**Step 1: Prepare Input File**
Save the Product API Swagger spec to: `Input/API_Collections/product_api_swagger.yaml`

**Step 2: Use Simple Copilot Prompt**
```
Analyze API document from "Input/API_Collections/product_api_swagger.yaml" and save it in "tests/api_output"
```

**Step 3: Copilot Executes**
```bash
python src/utils/api_analyzer_cli.py "Input/API_Collections/product_api_swagger.yaml" "tests/api_output" "product_api"
```

**Step 4: Generated Files Preview**

**endpoints.yaml:**
```yaml
product_catalog:
  base_path: "/api/products"
  endpoints:
    listProducts:
      method: GET
      path: "/api/products"
      description: "List all products"
      parameters:
        category:
          type: "string"
          required: false
        minPrice:
          type: "number"
          minimum: 0
        maxPrice:
          type: "number"
          maximum: 99999.99
    
    createProduct:
      method: POST
      path: "/api/products"
      description: "Create a new product"
      headers:
        "Content-Type": "application/json"
        "Authorization": "Bearer {token}"
```

**schema.yaml:**
```yaml
name: "product_catalog_schema"
version: "1.0"
schemas:
  Product_response:
    type: object
    required: [id, name, price, stock]
    properties:
      id:
        type: string
      name:
        type: string
        minLength: 2
        maxLength: 100
      price:
        type: number
        minimum: 0.01
        maximum: 99999.99
      category:
        type: string
        enum: [Electronics, Clothing, Books, Home, Sports]
      stock:
        type: integer
        minimum: 0
```

**testdata.yaml:**
```yaml
- name: "product_catalog_valid_data"
  description: "Valid product data for positive scenarios"
  tags: ["product_catalog", "positive", "api"]
  environment: ["dev", "staging", "api"]
  data:
    product:
      name: "Wireless Mouse"
      description: "Ergonomic wireless mouse"
      price: 29.99
      category: "Electronics"
      stock: 100

- name: "product_catalog_invalid_data"
  description: "Invalid product data for negative scenarios"
  tags: ["product_catalog", "negative", "validation"]
  environment: ["dev", "staging", "api"]
  data:
    product:
      name: ""  # Invalid: empty name
      price: -10.00  # Invalid: negative price
      stock: -5  # Invalid: negative stock
```

**template.yaml:**
```yaml
templates:
  product:
    generators:
      name:
        type: "faker"
        method: "fake.commerce.productName()"
        pattern: "{{productName}}"
      description:
        type: "faker"
        method: "fake.commerce.productDescription()"
      price:
        type: "random"
        range: [0.01, 999.99]
      stock:
        type: "sequence"
        start: 1
        increment: 1
    constraints:
      name:
        min_length: 2
        max_length: 100
      price:
        minimum: 0.01
        maximum: 99999.99
    variations:
      positive:
        overrides:
          stock: "range:1,1000"
      negative:
        overrides:
          name: "null|empty"
          price: "range:-100,0"
```

---

### Example 3: Batch Analysis

**Prompt:**
```
Analyze these API documents and save to tests/api_output:
1. Input/API_Collections/user_api.json
2. Input/API_Collections/product_api.yaml
3. Input/API_Collections/order_api.json
```

**Copilot Executes (3 commands):**
```bash
python src/utils/api_analyzer_cli.py "Input/API_Collections/user_api.json" "tests/api_output" "user_api"
python src/utils/api_analyzer_cli.py "Input/API_Collections/product_api.yaml" "tests/api_output" "product_api"
python src/utils/api_analyzer_cli.py "Input/API_Collections/order_api.json" "tests/api_output" "order_api"
```

**Result:**
```
tests/api_output/
├── user_api/
│   ├── endpoints.yaml
│   ├── schema.yaml
│   ├── testdata.yaml
│   └── template.yaml
├── product_api/
│   ├── endpoints.yaml
│   ├── schema.yaml
│   ├── testdata.yaml
│   └── template.yaml
└── order_api/
    ├── endpoints.yaml
    ├── schema.yaml
    ├── testdata.yaml
    └── template.yaml
```

---

## 📊 Generated YAML File Examples

### endpoints.yaml Structure
```yaml
payment_gateway:
  base_path: "/api/payments"
  endpoints:
    processPayment:
      method: POST
      path: "/api/payments"
      description: "Process payment"
      headers:
        "Content-Type": "application/json"
      parameters:
        amount:
          type: "number"
          required: true
          minimum: 0.01
          maximum: 99999.99
        currency:
          type: "string"
          required: true
          enum: [USD, EUR, GBP, INR]
        paymentMethod:
          type: "string"
          required: true
          enum: [CARD, WALLET, NET_BANKING, UPI]
```

### schema.yaml Structure
```yaml
name: "payment_gateway_schema"
description: "Schema for validating payment_gateway API responses"
version: "1.0"
schemas:
  PaymentRequest:
    type: object
    required: [amount, currency, paymentMethod]
    properties:
      amount:
        type: number
        minimum: 0.01
        maximum: 99999.99
      currency:
        type: string
        enum: [USD, EUR, GBP, INR]
      paymentMethod:
        type: string
        enum: [CARD, WALLET, NET_BANKING, UPI]
  
  PaymentResponse:
    type: object
    required: [transactionId, status, amount]
    properties:
      transactionId:
        type: string
      status:
        type: string
        enum: [SUCCESS, PENDING, FAILED]
      amount:
        type: number
      timestamp:
        type: string
        format: date-time
```

### testdata.yaml Structure
```yaml
- name: "payment_gateway_valid_card_payment"
  description: "Valid card payment data"
  tags: ["payment_gateway", "positive", "card"]
  environment: ["dev", "staging", "api"]
  data:
    payment:
      amount: 150.00
      currency: "USD"
      paymentMethod: "CARD"
      cardDetails:
        cardNumber: "4111111111111111"
        cvv: "123"
        expiryMonth: 12
        expiryYear: 2026

- name: "payment_gateway_invalid_amount"
  description: "Invalid payment amount (negative)"
  tags: ["payment_gateway", "negative", "validation"]
  environment: ["dev", "staging", "api"]
  data:
    payment:
      amount: -50.00  # Invalid
      currency: "USD"
      paymentMethod: "CARD"
```

### template.yaml Structure
```yaml
templates:
  payment:
    generators:
      amount:
        type: "random"
        range: [0.01, 9999.99]
        precision: 2
      transactionId:
        type: "faker"
        method: "fake.uuid4()"
      timestamp:
        type: "faker"
        method: "fake.iso8601()"
    constraints:
      amount:
        minimum: 0.01
        maximum: 99999.99
      currency:
        values: [USD, EUR, GBP, INR]
    variations:
      positive:
        overrides:
          amount: "range:0.01,9999.99"
          paymentMethod: "random:[CARD,WALLET,UPI]"
      negative:
        overrides:
          amount: "range:-100,0"
          currency: "invalid_currency"
```

---

## 🎯 Best Practices

### DO's ✅

1. **Provide Absolute Paths**: Use full paths to avoid ambiguity
   ```
   Input File: C:\Projects\API\user_api.json
   Output Directory: C:\Projects\TestOutput
   ```

2. **Use Descriptive Service Names**: Lowercase with underscores
   ```
   Service Name: user_management
   Service Name: payment_gateway
   Service Name: product_catalog
   ```

3. **Organize API Documents**: Keep in dedicated directory
   ```
   tests/apidoc/
   ├── user_api_postman.json
   ├── product_api_swagger.yaml
   └── payment_api.json
   ```

4. **Review Generated Files**: Validate YAML structure and content
   ```powershell
   Get-Content tests\apidata\service_name\endpoints.yaml
   ```

5. **Use Existing Utilities**: Agent uses only framework utilities (no new scripts)

### DON'Ts ❌

1. **Don't Skip Service Name**: Always provide meaningful service names
2. **Don't Use Special Characters**: Stick to lowercase, underscores, numbers
3. **Don't Modify YAML Manually**: Regenerate if changes needed
4. **Don't Mix Document Types**: Analyze one API at a time for clarity

---

## 📋 Validation Checklist

After generation, verify:

```
✅ All 4 YAML files created (endpoints, schema, testdata, template)
✅ Files saved in correct output directory structure
✅ endpoints.yaml contains all API operations
✅ schema.yaml has request/response models
✅ testdata.yaml includes positive and negative scenarios
✅ template.yaml has dynamic data generators
✅ YAML syntax is valid (no parsing errors)
✅ Service name matches across all files
✅ File naming convention followed
```

**Quick Validation Command:**
```powershell
# Check if all files exist
$service = "user_management"
$files = @("endpoints.yaml", "schema.yaml", "testdata.yaml", "template.yaml")
foreach ($file in $files) {
    $path = "tests\apidata\$service\$file"
    if (Test-Path $path) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
    }
}
```

---

## 🔧 Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'src'"

**Solution:**
- This is now **automatically fixed** by the CLI utility
- The utility adds project root to Python path
- No manual PYTHONPATH configuration needed

### Issue: "File not found"

**Solution:**
- Verify the input file path is correct
- Use relative paths from project root: `Input/API_Collections/file.json`
- Or use absolute paths: `C:\Path\To\API\Document.json`
```powershell
Test-Path "Input\API_Collections\demo_product_collection.json"
```

### Issue: "Output directory not created"

**Solution:**
- CLI utility automatically creates directories
- If manual creation needed:
```powershell
New-Item -ItemType Directory -Path "tests\api_output" -Force
```

### Issue: "YAML files incomplete or missing data"

**Solution:**
- Verify API document is valid JSON/YAML
- Check document follows Postman Collection v2.1+ or OpenAPI 3.0+ format
- Review CLI output messages for specific errors

### Issue: "Schema extraction failed"

**Solution:**
- Ensure API document includes request/response examples
- For Postman: Add example responses to requests
- For Swagger: Define schemas in `components/schemas`

### Issue: "Syntax errors in Python code"

**Solution:**
- This issue is **eliminated** with the new CLI approach
- No more inline Python code blocks
- CLI utility is pre-tested and error-free

---

## 🔗 Framework Integration

### Using Generated YAML Files

#### 1. **API Test Execution**
```typescript
// Load endpoints from generated YAML
import { ApiClient } from '@framework/api/clients';
const endpoints = loadYaml('tests/apidata/user_management/endpoints.yaml');
const client = new ApiClient(endpoints.user_management.base_path);
```

#### 2. **Schema Validation**
```typescript
// Validate responses using generated schema
import { SchemaValidator } from '@framework/api/validation';
const schema = loadYaml('tests/apidata/user_management/schema.yaml');
const validator = new SchemaValidator(schema);
validator.validate(response, 'UserResponse');
```

#### 3. **Test Data Generation**
```typescript
// Use test data in scenarios
import { TestDataManager } from '@framework/utils';
const testData = TestDataManager.loadDataset('user_management_valid_data');
const user = testData.data.user;
```

#### 4. **Dynamic Data Creation**
```typescript
// Generate dynamic test data using templates
import { DataGenerator } from '@framework/utils';
const template = loadYaml('tests/apidata/user_management/template.yaml');
const dynamicUser = DataGenerator.generate(template.templates.user);
```

---

## 📞 Key Resources

### Configuration Files
- **Path Configuration**: `copilot-agent.paths.yaml`
- **Agent Definition**: `.github/agents/api-analyzer-service.agent.md`

### CLI Utility (Primary Tool)
- **CLI Utility**: `src/utils/api_analyzer_cli.py` ⭐ **NEW**
  - Simple command-line interface
  - No syntax errors or import issues
  - Automatic validation and reporting

### Framework Utilities (Used Internally)
- **StructuredAPIParser**: `src/services/structured_api_parser.py`
- **EnhancedAPIAnalyzer**: `src/services/api_analyzer_enhanced.py`
- **FrameworkYamlGeneratorService**: `src/services/framework_yaml_generator_service_enhanced.py`
- **CopilotAPIAnalyzerService**: `src/services/copilot_api_analyzer_service.py`

### Sample Files (Reference Formats)
- **Endpoints Sample**: `tests/apidata/sample_endpoints.yaml`
- **Schema Sample**: `tests/apidata/sample_schema.yaml`
- **Test Data Sample**: `tests/apidata/sample_datasets.yaml`
- **Template Sample**: `tests/apidata/sample_templates.yaml`

### Output Directories
- **Default Output**: `tests/apidata/`
- **Service Structure**: `tests/apidata/{service_name}/`

### Related Documentation
- **Agent Documentation**: [AGENT_DOCUMENTATION_INDEX.md](AGENT_DOCUMENTATION_INDEX.md)
- **Locator Generation**: [locator-generation-guide.md](locator-generation-guide.md) (for web locator YAML)

---

## 🎓 Advanced Usage

### Scenario 1: Analyze Multiple APIs in Batch

**Prompt:**
```
Analyze the following API documents and generate YAML files:

1. User API
   - File: tests/apidoc/user_api_postman.json
   - Output: tests/apidata/user_service
   
2. Product API
   - File: tests/apidoc/product_api_swagger.yaml
   - Output: tests/apidata/product_service
   
3. Order API
   - File: tests/apidoc/order_api.json
   - Output: tests/apidata/order_service

Generate all required YAML files for each service.
```

### Scenario 2: Custom Output Directory Structure

**Prompt:**
```
Analyze API document with custom directory structure:

Input File: C:\Projects\APIs\payment_api.json
Output Directory: C:\TestAutomation\APITests\Payments
Service Name: payment_gateway

Create the directory structure if it doesn't exist.
```

### Scenario 3: Re-analyze and Update Existing YAMLs

**Prompt:**
```
Re-analyze the User API and update YAML files:

Input File: tests/apidoc/user_api_postman_v2.json
Output Directory: tests/apidata
Service Name: user_management

Note: This will overwrite existing YAML files.
```

---

## 📈 Quality Metrics

A well-generated YAML set should have:

- **Endpoints File**: All CRUD operations documented
- **Schema File**: Complete request/response models with validation
- **Test Data File**: 3-5 datasets per endpoint (positive + negative)
- **Template File**: Dynamic generators for all entity fields
- **File Size**: Typically 5-15 KB per YAML file (depending on API complexity)
- **Validation**: All YAML files parse without errors

---

## 🚀 Next Steps

After generating YAML files:

1. **Review Generated Files**: Validate structure and completeness
2. **Generate API Clients**: Use multi-language client generator
3. **Create BDD Scenarios**: Use api-BDD agent to generate feature files
4. **Generate Step Definitions**: Use step-definitions generator
5. **Execute Tests**: Run with Playwright/Cucumber framework
6. **Integrate CI/CD**: Add to test automation pipeline

---

## 💡 Tips for Best Results

### Tip 1: Use Simple Prompts
- ✅ **Good**: `Analyze API document from "Input/file.json" and save it in "tests/api_output"`
- ❌ **Avoid**: Complex multi-line prompts with detailed instructions

### Tip 2: Let Copilot Extract Service Names
- Service name is automatically derived from filename
- `demo_product_collection.json` → `prestashop_products` or `demo_product`
- Manual override possible if needed

### Tip 3: Organize Files Systematically
```
Input/API_Collections/       # Source API documents
├── user_api.json
├── product_api.yaml
└── payment_api.json

tests/api_output/            # Generated YAML files
├── user_api/
├── product_api/
└── payment_api/
```

### Tip 4: Trust the CLI Utility
- Automatic validation included
- Clear progress messages
- Error handling built-in
- No manual validation needed (but available if desired)

### Tip 5: Provide Complete API Documentation
- Include request/response examples in Postman collections
- Define all schemas in Swagger/OpenAPI specifications
- Document authentication and headers

---

## 📚 Example Project Structure

```
C:\Automation_POCs\GenAI_FusionIQ_Copilot\GenAI_FusionIQ_Framework_Copilot\
├── Input/
│   └── API_Collections/                 # Input: API documentation
│       ├── demo_product_collection.json
│       ├── user_api_postman.json
│       ├── product_api_swagger.yaml
│       └── payment_api.json
│
├── tests/
│   └── api_output/                      # Output: Generated YAML files
│       ├── prestashop_products/         # Generated by CLI
│       │   ├── endpoints.yaml
│       │   ├── schema.yaml
│       │   ├── testdata.yaml
│       │   └── template.yaml
│       │
│       ├── user_api/
│       │   ├── endpoints.yaml
│       │   ├── schema.yaml
│       │   ├── testdata.yaml
│       │   └── template.yaml
│       │
│       └── product_api/
│           ├── endpoints.yaml
│           ├── schema.yaml
│           ├── testdata.yaml
│           └── template.yaml
│
├── src/
│   └── utils/
│       └── api_analyzer_cli.py          # ⭐ CLI Utility
│
├── Feature/API/                         # BDD feature files (next step)
│   ├── prestashop_products_functional_tests.feature
│   └── user_api_functional_tests.feature
│
├── .github/agents/
│   └── api-analyzer-service.agent.md    # Custom agent definition
│
└── copilot-agent.paths.yaml            # Path configuration
```

---

## 🆕 What's New (November 27, 2025)

### Major Improvements

1. **CLI Utility Introduction** ⭐
   - New `src/utils/api_analyzer_cli.py`
   - Eliminates 30+ line Python code blocks
   - No more syntax errors or import issues
   - Single command execution

2. **Simplified Prompts**
   - From: Complex multi-line instructions
   - To: `Analyze API document from "file.json" and save it in "output_dir"`

3. **Automatic Service Name Extraction**
   - No need to specify service name
   - Extracted from filename automatically
   - Override available if needed

4. **Built-in Validation**
   - Automatic file validation
   - Clear progress messages
   - Success/failure reporting

5. **Improved Error Handling**
   - Module import issues fixed
   - Path resolution automated
   - Clear error messages

### Migration Guide

**Old Approach (Deprecated):**
```
Analyze api document - input file path and save it in output directory path

Input File: C:\API\file.json
Output Directory: tests\apidata
Service Name: my_service

[Copilot generates 30+ lines of Python code]
[Frequent syntax errors with quotes and escaping]
```

**New Approach (Recommended):**
```
Analyze API document from "Input/API_Collections/file.json" and save it in "tests/api_output"

[Copilot executes single CLI command]
[No syntax errors, clean output]
```

---

**Last Updated**: November 27, 2025  
**Version**: 2.0 (CLI Utility Update)  
**Agent**: api-analyzer-service.agent.md  
**Framework**: FusionIQ API Test Automation
