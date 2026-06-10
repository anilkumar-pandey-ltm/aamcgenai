# FusionIQ Framework - Agent Documentation Index

## 📋 Complete Agent Directory

This document provides a comprehensive mapping of all GitHub Copilot agents to their corresponding documentation guides, making it easy to find the right agent and learn how to use it.

---

## 🌐 Web Testing Agents

### 1. Web BDD Test Scenarios Generator

**Agent Mode**: `web-BDD_Testscenarios-gen`  
**Agent File**: [.github/agents/web-BDD_Testscenarios-gen.agent.md](../.github/agents/web-BDD_Testscenarios-gen.agent.md)  
**Documentation**: [web-bdd-Test scenarios-generation-guide.md](web-bdd-Test%20scenarios-generation-guide.md)

**Purpose**: Generates comprehensive Gherkin BDD test scenarios from user stories with MCP context integration

**Quick Start**:
```
@web-BDD_Testscenarios-gen Generate BDD test cases for POCTC-56
```

**What it does**:
- Fetches user stories from Jira
- Loads application context from MCP servers
- Generates parameterized BDD scenarios
- Saves to `data/testcases/GenAI_generated/`

---

### 2. Web Step Definitions Generator

**Agent Mode**: `web-step-definitions-generator`  
**Agent File**: [.github/agents/web-step-definitions-generator.agent.md](../.github/agents/web-step-definitions-generator.agent.md)  
**Documentation**: [web-step-definitions-generation-guide.md](web-step-definitions-generation-guide.md)

**Purpose**: Creates or updates Cucumber/SpecFlow step definition files from feature files

**Quick Start**:
```
@web-step-definitions-generator Generate step definitions for "Feature/login.feature" output to "tests/stepdefs/"
```

**What it does**:
- Detects programming language automatically
- Discovers framework patterns
- Creates step implementations
- Avoids duplicate steps

---

### 3. Web Page Actions Generator

**Agent Mode**: `web-page-actions-generator`  
**Agent File**: [.github/agents/web-page-actions-generator.agent.md](../.github/agents/web-page-actions-generator.agent.md)  
**Documentation**: [web-page-actions-gen-guide.md](web-page-actions-gen-guide.md)

**Purpose**: Generates Page Object classes from YAML locator files

**Quick Start**:
```
@web-page-actions-generator Generate page actions for HomePage using YAML at "page-object/home_locators.yaml"
```

**What it does**:
- Creates intelligent page object methods
- Understands business domain from context
- Auto-fixes imports and dependencies
- Framework-agnostic (TypeScript, Python, Java, C#)

---

### 4. Page Objects Generator (Complete Locator Generation Pipeline)

**Agent Mode**: `page-objects-generator`

**Agent File**: [.github/agents/page-objects-generator.agent.md](../.github/agents/page-objects-generator.agent.md)

**Documentation**: [locator-generation-guide.md](locator-generation-guide.md)

**Purpose**: Complete end-to-end locator generation pipeline - fetches, cleans, chunks, analyzes, and generates comprehensive YAML locator files from web applications

**Quick Start**:
```
@page-objects-generator Generate locators for https://your-url.com
```

**What it does**:
- Fetches page source (supports manual login for authenticated pages)
- Cleans HTML (removes SVG, scripts, decorative elements)
- Intelligently chunks large pages
- Generates comprehensive locators with 3 fallback strategies
- Smart merges with existing locator files
- Validates and repairs YAML format
- Creates YAML locator files

---

### 5. Web Traditional Test Cases Generator

**Agent Mode**: `web-Traditional-Testcases-gen`  
**Agent File**: [.github/agents/web-Traditional-Testcases-gen.agent.md](../.github/agents/web-Traditional-Testcases-gen.agent.md)  
**Documentation**: *See agent file for detailed usage*

**Purpose**: Generates traditional (non-BDD) test case documentation

**Quick Start**:
```
@web-Traditional-Testcases-gen Generate traditional test cases for user story POCTC-56
```

---

### 6. Web Traditional Test Scripts Generator

**Agent Mode**: `web-traditional-test-scripts-gen`  
**Agent File**: [.github/agents/web-traditional-test-scripts-gen.agent.md](../.github/agents/web-traditional-test-scripts-gen.agent.md)  
**Documentation**: *See agent file for detailed usage*

**Purpose**: Generates traditional test scripts (non-BDD automation code)

**Quick Start**:
```
@web-traditional-test-scripts-gen Generate test scripts for login functionality
```

---

## 🔌 API Testing Agents

### 7. API Analyzer Service

**Agent Mode**: `api-analyzer-service`  
**Agent File**: [.github/agents/api-analyzer-service.agent.md](../.github/agents/api-analyzer-service.agent.md)  
**Documentation**: [api-analyzer-service-guide.md](api-analyzer-service-guide.md)

**Purpose**: Analyzes API documentation (Postman, Swagger, etc.) and generates YAML test artifacts

**Quick Start**:
```
@api-analyzer-service Analyze API document from "Input/API_Collections/demo.json" and save it in "tests/api_output"
```

**What it does**:
- Parses API documentation (Postman, Swagger, OpenAPI, PDF)
- Extracts endpoints, schemas, parameters
- Generates 4 YAML files (endpoints, schema, testdata, template)
- Creates dynamic test data with Faker

---

### 8. API BDD Test Scenarios Generator

**Agent Mode**: `api-BDD_Testscenarios-gen`  
**Agent File**: [.github/agents/api-BDD_Testscenarios-gen.agent.md](../.github/agents/api-BDD_Testscenarios-gen.agent.md)  
**Documentation**: [api-bdd-testscenarios-generation-guide.md](api-bdd-testscenarios-generation-guide.md)

**Purpose**: Generates comprehensive BDD feature files for API testing with test design techniques

**Quick Start**:
```
@api-BDD_Testscenarios-gen Generate BDD Functional API Test Cases for User API from "tests/apidoc/user_api_swagger.json"
```

**What it does**:
- Applies 5 test design techniques (EP, BVA, Decision Table, etc.)
- Covers 100% functional API testing (status codes, auth, schema)
- Integrates business rules from MCP
- Generates positive and negative scenarios

---

### 9. API Service Client Generator

**Agent Mode**: `api-service-client-generator`  
**Agent File**: [.github/agents/api-service-client-generator.agent.md](../.github/agents/api-service-client-generator.agent.md)  
**Documentation**: [api-service-client-generator-guide.md](api-service-client-generator-guide.md)

**Purpose**: Generates multi-language API service clients (TypeScript, Python, Java, C#, Go, Kotlin)

**Quick Start**:
```
@api-service-client-generator Generate API service client for user_management API configuration: "tests/apidata/user_management/"
```

**What it does**:
- Auto-detects framework language
- Extends existing base classes
- Supports multiple authentication methods
- Integrates with framework logging

---

### 10. API Step Definitions Generator

**Agent Mode**: `api-step-definitions-generator`  
**Agent File**: [.github/agents/api-step-definitions-generator.agent.md](../.github/agents/api-step-definitions-generator.agent.md)  
**Documentation**: [api-stepdef-gen-guide.md](api-stepdef-gen-guide.md)

**Purpose**: Creates API test step definitions from feature files

**Quick Start**:
```
@api-step-definitions-generator Generate step definitions for "Feature/API/user_api.feature" with service client "tests/serviceclient/UserApiClient.ts"
```

**What it does**:
- Multi-language support (Python, TypeScript, Java, C#)
- Framework discovery via MCP
- Integrates with service clients
- Applies business rules

---

### 11. API Request Builder Generator

**Agent Mode**: `api-requestbuilder-gen`  
**Agent File**: [.github/agents/api-requestbuilder-gen.agent.md](../.github/agents/api-requestbuilder-gen.agent.md)  
**Documentation**: [API_REQUEST_BUILDER_GUIDE.md](API_REQUEST_BUILDER_GUIDE.md)

**Purpose**: Generates production-ready HTTP client utilities for API testing

**Quick Start**:
```
@api-requestbuilder-gen Generate Request Builder utilities for TypeScript automation framework
```

**What it does**:
- Creates BaseHttpClient, AuthManager, RequestBuilder
- Implements retry logic, circuit breaker
- Adds response caching and logging
- Framework-agnostic utilities

---

## 📊 Test Analysis & Optimization Agents

### 12. Impact-Based Test Analysis

**Agent Mode**: `impact-based-test-analysis`  
**Agent File**: [.github/agents/impact-based-test-analysis.agent.md](../.github/agents/impact-based-test-analysis.agent.md)  
**Documentation**: 
- [COPILOT_IMPACT_ANALYSIS_GUIDE.md](COPILOT_IMPACT_ANALYSIS_GUIDE.md)
- [IMPACT_ANALYSIS_GUIDE.md](IMPACT_ANALYSIS_GUIDE.md)

**Purpose**: AI-powered test case prioritization for change requests (85-95% reduction)

**Quick Start**:
```
@impact-based-test-analysis Analyze change request CR-2024-001 and prioritize test cases
```

**What it does**:
- Analyzes change requests
- Scores test case relevance
- Prioritizes by impact/risk
- Generates Excel/JSON reports

---

## 🎥 Multimedia Analysis Agents

### 13. Video Processor Analyzer

**Agent Mode**: `video-processor-analyzer`  
**Agent File**: [.github/agents/processor-analyzer.agent.md](../.github/agents/processor-analyzer.agent.md)  
**Documentation**: [video_processor_analyzer_guide.md](video_processor_analyzer_guide.md)

**Purpose**: Converts video demos into test documentation (test cases, defects, user stories, BDD scenarios)

**Quick Start**:
```
@video-processor-analyzer Analyze video "data/Input/video_requirement/demo.mp4" and generate test cases
```

**What it does**:
- Extracts frames and audio from videos (audio fully optional)
- Transcribes audio to text (local Whisper or OpenAI Whisper API)
- Identifies workflows and UI elements
- Generates standard test cases/user stories/BDD scenarios
- **NEW**: Comprehensive E2E test case generation with 12 standard techniques + flow-specific cases (Excel/CSV output)
- Works without API key using comprehensive template generation

**For Long Videos (30+ min):**
```powershell
# Chunk into 5-minute segments
ffmpeg -i "video.mp4" -f segment -segment_time 300 -c copy "chunks/chunk_%02d.mp4"

# Process each chunk
@video-processor-analyzer Analyze video chunk "chunks/chunk_01.mp4" for UAT requirements
```

---

##  Quick Reference Table

| **Purpose** | **Agent Mode** | **Documentation** |
|-------------|---------------|-------------------|
| Web BDD Scenarios | `web-BDD_Testscenarios-gen` | [web-bdd-Test scenarios-generation-guide.md](web-bdd-Test%20scenarios-generation-guide.md) |
| Web Step Defs | `web-step-definitions-generator` | [web-step-definitions-generation-guide.md](web-step-definitions-generation-guide.md) |
| Page Objects | `web-page-actions-generator` | [web-page-actions-gen-guide.md](web-page-actions-gen-guide.md) |
| UI Locators | `page-objects-generator` | [locator-generation-guide.md](locator-generation-guide.md) |
| API Analysis | `api-analyzer-service` | [api-analyzer-service-guide.md](api-analyzer-service-guide.md) |
| API BDD Tests | `api-BDD_Testscenarios-gen` | [api-bdd-testscenarios-generation-guide.md](api-bdd-testscenarios-generation-guide.md) |
| API Clients | `api-service-client-generator` | [api-service-client-generator-guide.md](api-service-client-generator-guide.md) |
| API Step Defs | `api-step-definitions-generator` | [api-stepdef-gen-guide.md](api-stepdef-gen-guide.md) |
| HTTP Utilities | `api-requestbuilder-gen` | [API_REQUEST_BUILDER_GUIDE.md](API_REQUEST_BUILDER_GUIDE.md) |
| Test Prioritization | `impact-based-test-analysis` | [COPILOT_IMPACT_ANALYSIS_GUIDE.md](COPILOT_IMPACT_ANALYSIS_GUIDE.md) |
| Video Analysis | `video-processor-analyzer` | [video_processor_analyzer_guide.md](video_processor_analyzer_guide.md) |

---

## 🎯 Common Workflows

### Complete Web Test Automation Pipeline

```
1. @page-objects-generator Generate locators for https://your-url.com
   → Fetches page, cleans HTML, generates comprehensive YAML locators
2. @web-page-actions-generator Generate page objects from YAML
   → Creates Page Object classes with intelligent methods
3. @web-BDD_Testscenarios-gen Generate BDD scenarios for STORY-123
   → Creates feature files from user stories
4. @web-step-definitions-generator Generate step definitions
   → Creates step implementation code from feature files
```

### Complete API Test Automation Pipeline

```
1. @api-analyzer-service → Analyze API docs, generate YAMLs
2. @api-BDD_Testscenarios-gen → Generate BDD feature files
3. @api-service-client-generator → Generate API service client
4. @api-step-definitions-generator → Generate step definitions
5. @api-requestbuilder-gen → Generate HTTP utilities (optional)
```

### Change Request Impact Analysis

```
1. Create change_requests.json with CR details
2. @impact-based-test-analysis → Analyze and prioritize tests
3. Review prioritized test suite (85-95% reduction)
4. Execute high/medium priority tests only
```

### Video-Based Test Case Generation

```
1. Record product demo video (or chunk long videos)
2. @video-processor-analyzer → Extract requirements
3. @web-BDD_Testscenarios-gen or @api-BDD_Testscenarios-gen → Generate test cases
4. Continue with standard automation pipeline
```

---

## 💡 Tips for Effective Agent Usage

### General Best Practices

1. **Use Agent Prefixes**: Always prefix prompts with `@agent-mode` for correct routing
2. **Check Prerequisites**: Ensure MCP servers are running before invoking agents
3. **Provide Context**: Include file paths, service names, and specific requirements
4. **Review Outputs**: Always validate generated artifacts before committing
5. **Iterate**: Refine prompts if results don't meet expectations

### MCP Server Requirements

Most agents require MCP servers:
- **MCP Context Server**: Business rules, domain models (`src/mcp/mcp_context_server.py`)
- **MCP Automation Server**: Framework patterns (`src/mcp/mcp_automation_server.py`)

**Start Servers:**
```powershell
# Terminal 1
python src/mcp/mcp_context_server.py

# Terminal 2
python src/mcp/mcp_automation_server.py
```

### Configuration

Verify paths in `copilot-agent.paths.yaml`:
```yaml
feature_paths:
  web: "Feature/Web"
  api: "Feature/API"

test_paths:
  stepdefs: "tests/stepdefs"
  page_object: "tests/page-object"
  apidata: "tests/apidata"
  serviceclient: "tests/serviceclient"
```

---

## 📚 Additional Resources

- **Framework Architecture**: [framework_arch.md](framework_arch.md)
- **Skills Library**: `.github/skills/*.md`
- **Agent Definitions**: `.github/agents/*.agent.md`
- **Copilot Instructions**: `.github/instructions/copilot-instructions.md`
- **Configuration**: `copilot-agent.paths.yaml`, `config.json`

---

## 🆘 Getting Help

### Agent-Specific Issues

Refer to the specific documentation guide for troubleshooting:
- Each agent has a dedicated guide with usage examples
- Check the **Troubleshooting** section in each guide
- Review the agent file (`.agent.md`) for implementation details

### General Framework Help

- **Architecture Questions**: See [framework_arch.md](framework_arch.md)
- **Configuration Issues**: Check `copilot-agent.paths.yaml` and `config.json`
- **MCP Server Issues**: Ensure servers are running and accessible

---

## 📝 Agent Usage Templates

Use these standardized templates to invoke agents with proper formatting:

### Web Testing Agents

**Web BDD Scenarios**
```
@web-BDD_Testscenarios-gen Generate BDD test scenarios for JIRA story {STORY_ID}
@web-BDD_Testscenarios-gen Create BDD tests for story POCTC-56 with parameterization
```

**Web Step Definitions**
```
@web-step-definitions-generator Generate step definitions for "Feature/web/{feature_name}.feature" output to "tests/stepdefs/"
@web-step-definitions-generator Create step defs for "data/testcases/GenAI_generated/login.feature"
```

**Web Page Actions**
```
@web-page-actions-generator Generate page actions for {PageName} using YAML at "page-object/{page}_locators.yaml"
@web-page-actions-generator Create HomePage page object from "page-object/home_locators.yaml"
```

**Page Objects / Locators**
```
@page-objects-generator Generate locators for {URL}
@page-objects-generator Generate locators for https://example.com/dashboard (authenticated page)
```

**Web Traditional Tests**
```
@web-Traditional-Testcases-gen Generate traditional test cases for user story {STORY_ID}
@web-traditional-test-scripts-gen Generate test scripts for {functionality_name}
```

### API Testing Agents

**API Analyzer**
```
@api-analyzer-service Analyze API document from "{collection_path}" and save it in "{output_dir}"
@api-analyzer-service Analyze "Input/API_Collections/petstore.json" save to "tests/api_output/petstore"
```

**API BDD Scenarios**
```
@api-BDD_Testscenarios-gen Generate BDD Functional API Test Cases for {API_Name} from "{swagger_path}"
@api-BDD_Testscenarios-gen Create API tests for User API from "tests/apidoc/user_api.yaml"
```

**API Service Client**
```
@api-service-client-generator Generate API service client for {service_name} API configuration: "{config_dir}"
@api-service-client-generator Create client for order_service config: "tests/apidata/order_service/"
```

**API Step Definitions**
```
@api-step-definitions-generator Generate step definitions for "{feature_path}" with service client "{client_path}"
@api-step-definitions-generator Create step defs for "Feature/API/users.feature" with "tests/serviceclient/UserClient.ts"
```

**API Request Builder**
```
@api-requestbuilder-gen Generate Request Builder utilities for {language} automation framework
@api-requestbuilder-gen Create HTTP client utilities for TypeScript framework
```

### Analysis & Optimization Agents

**Impact Analysis**
```
@impact-based-test-analysis Analyze change request {CR_ID} and prioritize test cases
@impact-based-test-analysis Prioritize tests for CR-2024-001 using defect history
```

**Video Analysis**
```
@video-processor-analyzer Analyze video "{video_path}" and generate {artifact_type}
@video-processor-analyzer Process "data/Input/video_requirement/demo.mp4" generate test cases
@video-processor-analyzer Analyze video chunk "{chunk_path}" for UAT requirements
```

---

**Last Updated**: April 23, 2026  
**Version**: 2.0  
**Total Agents**: 13  
**Total Documentation Guides**: 12

---

## 📖 Document Navigation

**Parent Directory**: [../docs/](.)  
**Agent Directory**: [../.github/agents/](../.github/agents/)  
**Skills Directory**: [../.github/skills/](../.github/skills/)
