# YAML Generation - Comprehensive Guide & Implementation

> **⚠️ DEPRECATED - This guide covers multiple agents and is being phased out.**  
> **Please use the agent-specific guides instead:**
> - **For API YAML generation**: See [api-analyzer-service-guide.md](api-analyzer-service-guide.md)
> - **For Web Locator YAML generation**: See [locator-generation-guide.md](locator-generation-guide.md)

---

## 🤖 Agent Information

**Agent Mode**: `api-analyzer-service` (for YAML generation from API docs)  
**Related Agents**:  
- `page-objects-generator` - For web page locator YAML (complete pipeline)

**Agent Files**:  
- `.github/agents/api-analyzer-service.agent.md`  
- `.github/agents/page-objects-generator.agent.md`  

### How to Activate YAML Generation

**For API Documentation YAML:**
```
@api-analyzer-service Analyze API document from "Input/API_Collections/demo.json" and save it in "tests/api_output"
```
See detailed guide: [api-analyzer-service-guide.md](api-analyzer-service-guide.md)

**For Web Locator YAML (Single Command):**
```
@page-objects-generator Generate locators for https://your-url.com
```
See detailed guide: [locator-generation-guide.md](locator-generation-guide.md)

## 📖 Table of Contents

### 🚀 Quick Start
- [Overview](#-overview)
- [User Commands](#-user-commands)
- [System Architecture](#-system-architecture)

### 📋 Implementation Details
- [Current System Status](#-current-system-status)
- [Copilot Instructions & Prompts](#-copilot-instructions--prompts)
- [Universal Architecture](#-universal-architecture)
- [Supported Document Sources](#-supported-document-sources)

### 🔧 Advanced Features
- [Intelligent Generation Pipeline](#-intelligent-generation-pipeline)
- [Enhancement Roadmap](#-enhancement-roadmap)
- [Best Practices](#-best-practices)

### 📚 Examples & Usage
- [Usage Examples](#-usage-examples)
- [Sample Outputs](#-sample-outputs)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

The **Intelligent YAML Generator** is a comprehensive Copilot-driven system that transforms API documentation from ANY format into correlated, meaningful test artifacts for the FusionIQ testing framework.

**Core Principle**: Document-agnostic intelligence that extracts API information and generates correlated test artifacts automatically using **ONLY existing framework utilities** - no new script creation.

### Key Features
- ✅ **Universal Input**: Postman Collections, OpenAPI/Swagger, PDF documents
- ✅ **Intelligent Analysis**: LLM-powered parsing with domain-specific understanding
- ✅ **Framework Integration**: Direct integration with existing FusionIQ utilities
- ✅ **Four YAML Outputs**: endpoints.yaml, schema.yaml, testdata.yaml, template.yaml
- ✅ **Copilot-Driven**: Fully guided workflow through GitHub Copilot prompts

### Current Implementation Status
- ✅ **Framework**: `src/services/framework_yaml_generator_service_enhanced.py`
- ✅ **Parser**: `src/services/structured_api_parser.py`
- ✅ **Analyzer**: `src/services/api_analyzer_enhanced.py`
- ✅ **Supported**: Postman Collections, OpenAPI/Swagger, PDF documents
- ✅ **Generates**: endpoints.yaml, schema.yaml, testdata.yaml, template.yaml

---

## 🚀 User Commands

### Primary User Prompt
```
Analyze api document - input file path and save it in output directory path
```

### What Copilot Does Automatically
1. **Prompts for Required Information**:
   - Input file path (Postman collection, Swagger, PDF, etc.)
   - Output directory path for generated YAML files
   - Service name for proper categorization

2. **Analyzes Document** using existing framework utilities:
   - Extracts API endpoints, schemas, and examples
   - Identifies domain context and patterns
   - Generates intelligent test data

3. **Creates Four YAML Files**:
   - `endpoints.yaml` - API endpoint definitions
   - `schema.yaml` - Request/response schemas
   - `testdata.yaml` - Dynamic test data
   - `template.yaml` - Data generation templates

4. **Validates and Confirms**:
   - Checks file generation success
   - Provides completion summary with file paths

---

## 🏗️ System Architecture

### Workflow Overview
```
User Input (API Document)
    ↓
Document Analysis Pipeline
    ├─ Structured Parser (existing utility)
    ├─ API Analyzer (existing utility)
    └─ YAML Generator (existing utility)
    ↓
Generated Outputs
    ├─ endpoints.yaml (Endpoint Definitions)
    ├─ schema.yaml (API Schemas) 
    ├─ testdata.yaml (Dynamic Test Data)
    └─ template.yaml (Data Templates)
    ↓
Validation & Confirmation
    └─ Success notification with file paths
```

### Component Integration
- **Parser Layer**: `structured_api_parser.py` - Universal document parsing
- **Analysis Layer**: `api_analyzer_enhanced.py` - Intelligent content analysis
- **Generation Layer**: `framework_yaml_generator_service_enhanced.py` - YAML creation
- **Validation Layer**: Built-in format and structure validation

---

## 🔍 Current System Status

### ✅ Working Features

#### 1. **Endpoint Generation** (Excellent - Comprehensive)
```yaml
# Current output from endpoints.yaml
POST_create_product:
  url: /api/product
  method: POST
  headers:
    Content-Type: application/json
    Authorization: "Bearer {{auth_token}}"
  body: "{{create_product_data}}"
  expected_status: 201
  validation:
    - status_code: 201
    - response_contains: ["id", "name", "price"]
```

#### 2. **Template Generation** (Good - Domain Aware)
```yaml
# Current output from template.yaml
name: create_product_template
description: Template for generating create product data dynamically
template:
  product:
    name: '{{product_name}}'
    price: '{{commerce_price}}'
    category: '{{commerce_department}}'
    sku: '{{commerce_sku}}'
---
generators:
  product_name:
    type: faker
    options:
      method: commerce.product_name  # ✅ Domain-specific!
```

### 🔄 Areas Being Enhanced

#### 1. **Schema Generation** - Intelligence Improvements
**Current Output**:
```yaml
# Generic schemas without deep analysis
CreateProduct:
  properties:
    active: { example: 1, type: integer }
    description: { example: Description, type: string }  # Generic!
```

**Enhanced Target**:
```yaml
schemas:
  ProductCreateRequest:
    type: object
    required: [name, price, reference, description, active]
    properties:
      name: 
        type: string
        example: "Acoustic Guitar"  # Realistic!
        minLength: 1
        maxLength: 255
      price:
        type: number
        example: 123.45
        minimum: 0
        format: decimal
      reference:
        type: string
        example: "PROD-GUITAR-001"
        pattern: "^PROD-[A-Z]+-\\d{3}$"
```

#### 2. **Test Data Generation** - Context Awareness
**Current Issue**: Generic placeholder data
**Enhancement Goal**: Domain-specific, realistic test data with relationships

---

## 🤖 Copilot Instructions & Prompts

### 🚫 Critical Constraints - ABSOLUTE PROHIBITION

```markdown
## NO NEW SCRIPT CREATION
- **MANDATORY**: Use only existing Python utilities from the framework
- **FUNCTION INVOCATION**: Call existing functions via terminal: 
  `python -c "from module import function; function(args)"`
- **EXECUTION**: Use existing scripts: `python existing_script.py`
- **ENFORCEMENT**: ANY attempt to create new `.py`, `.js`, `.ts`, `.sh` files violates this constraint

## Allowed Operations
✅ Call existing Python functions using inline commands
✅ Execute existing framework utilities  
✅ Create data files: `.yaml`, `.json`, `.md` (non-executable)
✅ Use terminal commands for data processing

## Prohibited Operations
❌ Creating new `.py`, `.js`, `.ts`, `.sh`, `.bat` files
❌ Creating "helper scripts" or "wrapper scripts"
❌ Using `create_file` tool for executable code
```

### Primary Agent Instructions

#### 🎯 Core Objectives

1. **Interactive Document Analysis**
   - Prompt user for input file paths
   - Analyze Postman collections, Swagger/OpenAPI specs, PDF documents
   - Use existing framework parsers and analyzers

2. **Custom Directory YAML Generation**
   - Generate standardized YAML files in user-specified output directory
   - Follow sample format patterns from `tests/apidata/`
   - Ensure framework compatibility

3. **Dynamic Test Data Creation**
   - Generate realistic, domain-aware test data
   - Create relationship-based data scenarios
   - Use intelligent data patterns

#### 🔄 Step-by-Step Workflow

```markdown
1. **User Input Collection**
   - Request input file path (validate existence)
   - Request output directory path (create if needed)
   - Request service name for categorization

2. **Document Analysis** (Using Existing Utils)
   ```bash
   python -c "
   from src.services.structured_api_parser import StructuredAPIParser;
   from src.services.api_analyzer_enhanced import APIAnalyzer;
   parser = StructuredAPIParser();
   analyzer = APIAnalyzer();
   # Process document with existing utilities
   "
   ```

3. **YAML Generation** (Using Existing Utils)
   ```bash
   python -c "
   from src.services.framework_yaml_generator_service_enhanced import YAMLGenerator;
   generator = YAMLGenerator();
   # Generate four YAML files
   "
   ```

4. **Validation & Confirmation**
   - Check generated file existence
   - Validate YAML format and structure
   - Report success with file paths
```

### Advanced Prompt Templates

#### Document Analysis Prompt
```markdown
When user provides API document path:
1. Validate file existence and format
2. Use existing framework utilities to parse:
   - Endpoints and methods
   - Request/response schemas  
   - Example data and patterns
   - Authentication requirements
3. Extract domain context for intelligent generation
4. Identify data relationships and dependencies
```

#### YAML Generation Prompt
```markdown
Generate four framework-compatible YAML files:

1. **endpoints.yaml**: Complete endpoint definitions with headers, auth, validation
2. **schema.yaml**: Request/response schemas with realistic examples and constraints
3. **testdata.yaml**: Dynamic test data with domain awareness and relationships
4. **template.yaml**: Data generation templates using faker and custom generators

Use existing utilities - NO new scripts created.
```

---

## 🏗️ Universal Architecture

### Document Processing Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNIVERSAL INPUT LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  Postman Collection  │  OpenAPI/Swagger  │  PDF Documents       │
│  • .json format      │  • .yaml/.json    │  • API specs        │
│  • Collections/envs  │  • Full spec      │  • Text extraction  │
└─────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│                   INTELLIGENT PARSING LAYER                     │
├─────────────────────────────────────────────────────────────────┤
│  StructuredAPIParser (existing utility)                         │
│  • Universal document analysis                                  │
│  • Format-agnostic extraction                                  │
│  • Metadata and relationship identification                     │
│                                                                │
│  Output: Structured API Information                             │
│  {                                                              │
│    "endpoints": [{...}],                                       │
│    "schemas": [{...}],                                         │
│    "examples": [{...}],                                        │
│    "relationships": [{...}]                                    │
│  }                                                             │
└─────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│                  INTELLIGENCE ANALYSIS LAYER                    │
├─────────────────────────────────────────────────────────────────┤
│  APIAnalyzer (existing utility)                                │
│  • Domain context identification                               │
│  • Data pattern recognition                                    │
│  • Relationship mapping                                        │
│  • Intelligent example generation                              │
│                                                                │
│  Enhanced Output: Intelligent API Model                        │
│  {                                                             │
│    "domain_context": "e-commerce",                            │
│    "data_patterns": [{...}],                                  │
│    "intelligent_examples": [{...}],                           │
│    "test_scenarios": [{...}]                                  │
│  }                                                             │
└─────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│                   YAML GENERATION LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  YAMLGenerator (existing utility)                              │
│  • Framework-compatible output                                 │
│  • Four specialized YAML files                                │
│  • Validation and structure checks                            │
│                                                                │
│  Generated Files:                                              │
│  ├─ endpoints.yaml (Complete endpoint definitions)             │
│  ├─ schema.yaml (Request/response schemas)                     │
│  ├─ testdata.yaml (Dynamic test data)                         │
│  └─ template.yaml (Data generation templates)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Supported Document Sources

### 1. Postman Collections (.json)
```json
{
  "info": { "name": "API Collection" },
  "item": [
    {
      "name": "Create Product",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/product",
        "body": { "raw": "{...}" }
      }
    }
  ]
}
```

**Extraction Capabilities**:
- ✅ Endpoints and methods
- ✅ Request/response examples
- ✅ Environment variables
- ✅ Authentication headers
- ✅ Collection-level metadata

### 2. OpenAPI/Swagger (.yaml/.json)
```yaml
openapi: 3.0.0
paths:
  /api/product:
    post:
      summary: Create Product
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Product'
      responses:
        201:
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProductResponse'
```

**Extraction Capabilities**:
- ✅ Complete API specification
- ✅ Schema definitions
- ✅ Response codes and examples
- ✅ Parameter constraints
- ✅ Security requirements

### 3. PDF Documents
**Support for**:
- API specification documents
- Technical documentation
- Manual API references

**Extraction Method**: Text extraction with pattern recognition for API elements

---

## 🚀 Intelligent Generation Pipeline

### Phase 1: Document Analysis
1. **Format Detection**: Automatically detect document type and structure
2. **Content Extraction**: Parse all API-related information
3. **Metadata Collection**: Gather context, patterns, and relationships

### Phase 2: Intelligence Application
1. **Domain Recognition**: Identify business domain (e-commerce, finance, etc.)
2. **Pattern Analysis**: Recognize data patterns and validation rules
3. **Relationship Mapping**: Map dependencies between endpoints and data

### Phase 3: Smart Generation
1. **Endpoint Generation**: Create complete endpoint definitions with validation
2. **Schema Intelligence**: Generate schemas with realistic constraints
3. **Test Data Creation**: Create domain-aware, realistic test data
4. **Template Building**: Build intelligent data generation templates

### Phase 4: Validation & Output
1. **Format Validation**: Ensure YAML structure and syntax
2. **Framework Compatibility**: Verify compatibility with FusionIQ framework
3. **File Generation**: Create four standardized YAML files
4. **Success Confirmation**: Provide completion status and file paths

---

## 🚀 Enhancement Roadmap

### Phase 1: Intelligence Improvements (Current Focus)
- **Schema Generation**: More intelligent schema analysis with realistic constraints
- **Test Data Intelligence**: Domain-aware test data with proper relationships
- **Example Enhancement**: Better example generation from document analysis

### Phase 2: Advanced Features (Next Release)
- **Multi-Service Support**: Handle multiple API services in single document
- **Dependency Resolution**: Automatic endpoint dependency identification  
- **Security Integration**: Enhanced security pattern recognition
- **Custom Domain Support**: User-defined domain patterns and generators

### Phase 3: Framework Integration (Future)
- **Live Testing**: Integration with actual test execution
- **Result Correlation**: Map generated tests to actual test results
- **Continuous Updates**: Automatic re-generation when API changes detected
- **Performance Optimization**: Caching and incremental generation

---

## 📝 Best Practices

### Document Preparation
1. **Postman Collections**: Include comprehensive examples and environment variables
2. **OpenAPI Specs**: Provide detailed schemas and realistic examples  
3. **PDF Documents**: Ensure clear API structure and consistent formatting

### Output Organization
1. **Directory Structure**: Use consistent naming conventions for output directories
2. **Service Naming**: Use descriptive service names that reflect API purpose
3. **File Management**: Organize generated files by service and version

### Quality Assurance  
1. **Review Generated Files**: Always review generated YAML files for accuracy
2. **Test Data Validation**: Verify test data makes sense for your domain
3. **Schema Accuracy**: Check schemas match actual API requirements
4. **Template Functionality**: Test template generation produces valid data

### Framework Integration
1. **Follow Samples**: Use `tests/apidata/` samples as reference patterns
2. **Validation Standards**: Ensure generated files meet framework requirements
3. **Naming Conventions**: Follow consistent naming patterns across projects
4. **Documentation**: Document any custom patterns or modifications

---

## 📚 Usage Examples

### Example 1: Postman Collection Analysis
```
User: "Analyze api document - Input/API_Collections/ecommerce_api.json and save it in Output_Files/ecommerce_yaml"

Copilot Actions:
1. Validates Input/API_Collections/ecommerce_api.json exists
2. Creates Output_Files/ecommerce_yaml directory if needed
3. Prompts for service name: "ecommerce"
4. Executes existing framework utilities:
   python -c "from src.services.structured_api_parser import StructuredAPIParser; ..."
5. Generates four YAML files:
   - Output_Files/ecommerce_yaml/endpoints.yaml
   - Output_Files/ecommerce_yaml/schema.yaml  
   - Output_Files/ecommerce_yaml/testdata.yaml
   - Output_Files/ecommerce_yaml/template.yaml
6. Confirms: "Successfully generated YAML files for ecommerce service"
```

### Example 2: OpenAPI Specification
```
User: "Analyze api document - docs/payment_api.yaml and save it in tests/payment_output"

Copilot Actions:
1. Analyzes OpenAPI specification structure
2. Extracts comprehensive schema definitions
3. Identifies payment domain patterns
4. Generates intelligent test data for financial operations
5. Creates framework-compatible YAML files with proper validation rules
```

### Example 3: PDF Document Processing
```
User: "Analyze api document - docs/legacy_api_spec.pdf and save it in Output_Files/legacy_yaml"

Copilot Actions:
1. Extracts text content from PDF
2. Identifies API patterns using text analysis
3. Maps endpoints and data structures
4. Generates YAML files with available information
5. Flags areas needing manual review
```

---

## 📊 Sample Outputs

### Generated endpoints.yaml
```yaml
service_name: ecommerce
base_url: "{{base_url}}"

endpoints:
  GET_products_list:
    url: /api/products
    method: GET
    headers:
      Authorization: "Bearer {{auth_token}}"
    query_params:
      page: "{{page_number}}"
      limit: "{{page_size}}"
    expected_status: 200
    validation:
      - status_code: 200
      - response_contains: ["products", "pagination"]
      
  POST_create_product:
    url: /api/products
    method: POST
    headers:
      Content-Type: application/json
      Authorization: "Bearer {{auth_token}}"
    body: "{{create_product_data}}"
    expected_status: 201
    validation:
      - status_code: 201
      - response_contains: ["id", "name", "price", "created_at"]
```

### Generated schema.yaml
```yaml
schemas:
  ProductCreateRequest:
    type: object
    required: [name, price, category, description]
    properties:
      name:
        type: string
        example: "Wireless Bluetooth Headphones"
        minLength: 1
        maxLength: 255
      price:
        type: number
        example: 79.99
        minimum: 0
        format: decimal
      category:
        type: string
        example: "Electronics"
        enum: ["Electronics", "Clothing", "Books", "Home"]
      description:
        type: string
        example: "High-quality wireless headphones with noise cancellation"
        maxLength: 1000

  ProductResponse:
    type: object
    properties:
      id:
        type: integer
        example: 12345
      name:
        type: string
        example: "Wireless Bluetooth Headphones"
      price:
        type: number
        example: 79.99
      created_at:
        type: string
        format: date-time
        example: "2024-01-15T10:30:00Z"
```

### Generated testdata.yaml
```yaml
test_data:
  create_product_scenarios:
    valid_product:
      name: "Gaming Mechanical Keyboard"
      price: 129.99
      category: "Electronics"
      description: "RGB backlit mechanical gaming keyboard with blue switches"
      
    budget_product:
      name: "Basic Wired Mouse"
      price: 9.99
      category: "Electronics"
      description: "Simple 3-button wired optical mouse"
      
    premium_product:
      name: "Professional Studio Monitors"
      price: 499.99
      category: "Electronics"
      description: "High-end reference monitor speakers for professional audio work"

  boundary_tests:
    min_price_product:
      name: "Digital Download Code"
      price: 0.01
      category: "Digital"
      description: "Minimum price test product"
      
    long_name_product:
      name: "Super Ultra High Performance Gaming Laptop Computer with Advanced Graphics Processing Unit and Extended Battery Life for Professional Esports Gaming and Content Creation"
      price: 1999.99
      category: "Electronics"
      description: "Test product with maximum length name"
```

### Generated template.yaml
```yaml
templates:
  create_product_template:
    name: create_product_template
    description: Template for generating product creation data dynamically
    template:
      product:
        name: '{{product_name}}'
        price: '{{product_price}}'
        category: '{{product_category}}'
        description: '{{product_description}}'
        sku: '{{product_sku}}'
        active: 1

generators:
  product_name:
    type: faker
    options:
      method: commerce.product_name
      
  product_price:
    type: faker  
    options:
      method: commerce.price
      min_price: 1
      max_price: 999
      
  product_category:
    type: choice
    options:
      choices: ["Electronics", "Clothing", "Books", "Home", "Sports", "Beauty"]
      
  product_description:
    type: faker
    options:
      method: text.text
      max_nb_chars: 200
      
  product_sku:
    type: pattern
    options:
      pattern: "SKU-{{category_code}}-{{random_int(10000,99999)}}"
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. File Not Found Error
**Problem**: Input file path doesn't exist
**Solution**: 
- Verify file path using absolute path
- Check file permissions
- Ensure file extension is correct (.json, .yaml, .pdf)

#### 2. Invalid Document Format
**Problem**: Document format not recognized
**Solution**:
- Verify document structure matches expected format
- Check for malformed JSON/YAML syntax
- Try with sample documents first

#### 3. Missing Framework Utilities
**Problem**: Existing utilities not found
**Solution**:
- Verify `src/services/` directory structure
- Check Python path configuration  
- Ensure all dependencies are installed

#### 4. Output Directory Issues
**Problem**: Cannot create output directory
**Solution**:
- Check write permissions on target directory
- Verify parent directory exists
- Use absolute paths for clarity

### Validation Checks

#### Pre-Generation Validation
1. Input file exists and is readable
2. Output directory is writable
3. Framework utilities are accessible
4. Document format is supported

#### Post-Generation Validation  
1. All four YAML files created successfully
2. YAML syntax is valid
3. Framework compatibility confirmed
4. Required fields are present

### Debug Information

#### Enable Verbose Logging
```bash
python -c "
import logging;
logging.basicConfig(level=logging.DEBUG);
from src.services.framework_yaml_generator_service_enhanced import YAMLGenerator;
# Run with debug logging
"
```

#### Common Debug Commands
```bash
# Check file structure
ls -la Input/API_Collections/

# Validate YAML syntax
python -c "import yaml; yaml.safe_load(open('output.yaml'))"

# Check framework utilities
python -c "from src.services import structured_api_parser; print('Parser available')"
```

---

## 🎯 Summary

This comprehensive YAML Generation guide provides everything needed to transform API documentation into framework-ready test artifacts using GitHub Copilot and existing framework utilities. The system ensures:

- **No Script Creation**: Uses only existing framework utilities
- **Universal Support**: Handles multiple document formats
- **Intelligent Generation**: Creates realistic, domain-aware test data
- **Framework Integration**: Produces framework-compatible YAML files
- **User-Friendly**: Simple Copilot commands for complex operations

**Key Success Factors**:
1. Follow the constraint of using only existing utilities
2. Provide clear input file paths and output directories  
3. Review generated files for accuracy and completeness
4. Use domain-appropriate service names for better organization
5. Validate outputs match framework requirements

The system transforms complex API documentation analysis into a simple, repeatable process that enhances test automation capabilities while maintaining framework consistency and avoiding script proliferation.

**Last Updated**: January 2025  
**Version**: 2.0 (Comprehensive Consolidation)  
**Framework Compatibility**: FusionIQ Testing Framework v2.0+