# FusionIQ Test Automation Framework - AI Agent Instructions

## ⚡ QUICK REFERENCE (Most Critical Rules)

### 🚫 NEVER DO:
- ❌ Create new `.py`, `.js`, `.ts`, `.sh`, `.bat` files
- ❌ Call MCP tools without `tool_search_tool_regex` first
- ❌ Use hardcoded paths (always load from config)
- ❌ Use `&&` in PowerShell (use `;` instead)

### ✅ ALWAYS DO:
1. **MCP Pattern**: `tool_search_tool_regex("pattern")` → Load → Call tool
2. **Existing Functions**: `python -c "from module import func; func()"` or CLI
3. **Config Paths**: Load from `config.yaml` / `config.json`
4. **Context First**: Check `data/stories/`, load MCP Context Server before generating
5. **Validate Output**: Apply validation layers, check for errors

### 📚 Skills Reference
See `.github/skills/*.md` for reusable patterns:
- **[mcp-integration-guide.md](.github/skills/mcp-integration-guide.md)** - MCP server patterns
- **[bdd-gherkin-patterns.md](.github/skills/bdd-gherkin-patterns.md)** - BDD best practices
- **[web-defensive-automation.md](.github/skills/web-defensive-automation.md)** - Wait strategies, interactions
- **[validation-and-autofix.md](.github/skills/validation-and-autofix.md)** - 5-layer validation
- **[page-object-design-patterns.md](.github/skills/page-object-design-patterns.md)** - Page object patterns

### 📖 Documentation
- **Architecture**: `docs/framework_arch.md`
- **Guides**: `docs/*.md` (web-bdd, api-analyzer, locator-generation, impact-analysis)
- **Agents**: `.github/agents/*.agent.md` (specialized generation agents)

---

## 🚫 GLOBAL CONSTRAINTS - APPLY TO ALL OPERATIONS

### **CRITICAL RULE: NO NEW SCRIPT CREATION**
- **ABSOLUTE PROHIBITION**: Never create new Python, JavaScript, TypeScript, or shell scripts during any operation
- **MANDATORY BEHAVIOR**: Use only existing utilities and functions from the codebase
- **FUNCTION INVOCATION**: Call existing functions directly via terminal commands or inline Python execution
- **NO EXCEPTIONS**: This rule applies to ALL chatmodes, ALL operations, and ALL scenarios
- **ENFORCEMENT**: Any attempt to create new executable files violates this constraint

### **Allowed Operations**
✅ Call existing Python functions using: `python -c "from module import function; function(args)"`
✅ Execute existing scripts: `python existing_script.py`
✅ Use terminal commands: `Get-ChildItem`, `Get-Content`, etc. (PowerShell)
✅ Create data files: `.txt`, `.yaml`, `.json`, `.md`, `.feature` (non-executable)

### **Prohibited Operations**
❌ Creating new `.py`, `.js`, `.ts`, `.sh`, `.bat` files
❌ Creating "helper scripts" or "wrapper scripts" or "pipeline scripts"
❌ Creating "orchestrator files" or "executor scripts"
❌ Using `create_file` tool for executable code
❌ Suggesting "let me create a script to automate this"

---

## 🏗️ Architecture Overview

### **Hybrid Framework**
This is a **Python + TypeScript hybrid test automation framework** combining:
- **Python Backend** (`src/`) - AI-powered test generation via MCP servers
- **TypeScript Frontend** (`framework/`) - Playwright + Cucumber BDD test execution
- **MCP Integration** - Custom MCP servers for AI test generation (FusionIQ-agen tools)
- **Atlassian MCP** - Requirement fetching from Jira/Confluence

### **Component Map**
```
src/
├── services/          → AI generation services (BDD, step defs, page objects, API clients)
├── mcp/               → MCP servers (context, Jira, ADO automation)
├── utils/             → CLI utilities (api_analyzer_cli.py)
├── context/           → Domain context for AI generation
└── templates/         → Generation templates

framework/
├── core/              → Base classes (BasePage, CustomWorld, BrowserManager)
├── utils/             → Locator healing, RCA capture, logging
├── config/            → YAML configs (config.yaml, browser-combinations.yaml)
└── hooks/             → Cucumber hooks, test lifecycle

data/
├── stories/           → Fetched requirements (JIRA_XXX-123.txt)
├── testcases/GenAI_generated/ → Generated feature files
└── context/           → Application/domain/business rules context
```

### **Data Flow**
```
1. Requirements: Atlassian MCP → data/stories/*.txt
2. Generation: Story + MCP Context Server → Python services → MCP tools → Artifacts
3. Execution: Cucumber → Playwright → Test results
4. Analysis: Change requests → Impact analyzer → Prioritized test suite
```

---

## 🎯 Core Developer Workflows

### **1. Requirement Fetching (Atlassian MCP)**
Fetch stories from Jira/Confluence and save as structured `.txt` files in `data/stories/`.

**Triggers**: "Fetch PROJ-123", "Fetch all open stories from Sprint 5", "Fetch stories under EPIC-456"

**MCP Server**: Configured via `uvx mcp-atlassian` in the **global** `mcp.json` (`%APPDATA%\Code\User\mcp.json`) — VS Code starts it automatically.
> If tools are not responding: Open VS Code MCP panel → restart `atlassian` server, or run `Developer: Reload Window`.

**MCP Tools** (server: `atlassian`, configured via `uvx mcp-atlassian`):
- `atlassian/atlassian-mcp-server/getAccessibleAtlassianResources` → Get Cloud ID
- `atlassian/atlassian-mcp-server/getJiraIssue` → Fetch single issue
- `atlassian/atlassian-mcp-server/searchJiraIssuesUsingJql` → Search multiple issues (JQL)
- `atlassian/atlassian-mcp-server/search` → Natural language Rovo search
- `atlassian/atlassian-mcp-server/getConfluencePage` → Fetch Confluence page

**Workflow**:
```
PRIMARY (Tier 1) — Atlassian MCP Server [MANDATORY FIRST ATTEMPT]:
1. Call atlassian/atlassian-mcp-server/getJiraIssue
2. If MCP server not started → restart via VS Code MCP Panel (Restart 'atlassian')
   OR Ctrl+Shift+P → Developer: Reload Window, then retry
3. On success → format + save → data/stories/JIRA_{STORY_ID}.txt
4. Prompt: "Generate test cases from these stories? (y/n)"

FALLBACK (Tier 2) — jira_service.py [ONLY after Tier 1 + restart + retry all fail]:
1. Use Python inline via JiraService (credentials from config.json → mcp.jira_url + mcp.jira_token)
2. python -c "import asyncio, json; from src.mcp.jira_service import JiraService; ..."
3. Parse response → format → data/stories/JIRA_{STORY_ID}.txt
4. Prompt: "Generate test cases from these stories? (y/n)"

IF BOTH FAIL → STOP. Do NOT reconstruct story from workspace context.
  Ask user to fix atlassian MCP server config in %APPDATA%\Code\User\mcp.json
```

> **See**: `.github/skills/jira-story-fetch.md` for full two-tier fetch workflow including inline Python command and field mapping.

> ❌ **STRICTLY PROHIBITED**: Reconstructing or creating a story from workspace artefacts (page objects, locator YAMLs, TypeScript files, or any local files). Stories MUST come from JIRA.

**File Format**: `{SOURCE}_{STORY_ID}.txt` (e.g., `JIRA_PROJ-123.txt`)

**Content Structure**:
```
=== STORY METADATA ===
Source: {Jira/ADO/Other}
Story ID: {Original Story ID}
Title: {Story Title}
Type: {Story/Epic/Task/Bug}
Status: {Open/In Progress/Done}
Priority: {High/Medium/Low}
...

=== DESCRIPTION ===
{Full story description}

=== ACCEPTANCE CRITERIA ===
- Criterion 1
- Criterion 2
...

=== TECHNICAL DETAILS ===
{Technical notes, architecture details}

=== DEPENDENCIES ===
- Dependency 1: {ID} - {Description}
...
```

**Error Handling**:
- MCP Server Not Started → Restart via MCP Panel or `Developer: Reload Window`, then retry — do NOT skip to Tier 2 on first attempt
- MCP Server Unavailable (after restart+retry) → Fall back to `jira_service.py` (Tier 2)
- Authentication Failures (MCP) → Restart server → retry; if still fails, try Tier 2
- Authentication Failures (jira_service.py) → Inform user to verify `mcp.jira_token` in `config.json`
- Invalid Story ID (404) → "Story {ID} not found in JIRA." — STOP, do not proceed
- Both tiers fail → **STOP. Ask user to fix MCP connectivity. DO NOT reconstruct from workspace.**
- Batch Operations → Create summary file with statistics

**See**: `.github/skills/mcp-integration-guide.md` for complete MCP patterns

---

### **2. AI-Powered Test Generation**
Generate test artifacts using Python services + MCP tool integration.

**Available MCP Tools** (prefix: `mcp_fusioniq-agen_`):
- `web_BDD_Testscenarios_gen` → BDD feature files from stories
- `web_step_definitions_generator` → TypeScript step definitions
- `web_page_actions_generator` → Page object actions
- `locator_generator_*` → YAML locator files (step1, step2, step_final)
- `api_analyzer_service` → Parse API collections
- `api_service_client_generator` → Generate API clients
- `api_BDD_Testscenarios_gen` → API test scenarios
- `api_step_definitions_generator` → API step definitions
- `impact_based_test_analysis` → Prioritize tests by change impact
- `video_processor_analyzer` → Extract requirements from demo videos

**CRITICAL PATTERN**: Always search for MCP tools before using them:
```python
# ❌ WRONG - calling directly without search
invoke mcp_fusioniq-agen_web_BDD_Testscenarios_gen

# ✅ CORRECT
1. tool_search_tool_regex(pattern="fusioniq.*web_BDD")
2. Invoke the tool after it's loaded
```

**Example Workflow** (Web BDD):
```
User: "Generate BDD test cases for POCTC-56"

1. Read data/stories/JIRA_POCTC-56.txt
2. tool_search_tool_regex("mcp.*context.*scan") → Load context server
3. tool_search_tool_regex("fusioniq.*web_BDD") → Load BDD generator
4. Call mcp_mcp-context-s_scan_workspace to get application context
5. Call mcp_fusioniq-agen_web_BDD_Testscenarios_gen with story + context
6. Save output → data/testcases/GenAI_generated/POCTC-56_bdd.feature
```

**See**: `.github/agents/*.agent.md` for specialized generation agents

---

### **3. API Analysis & Client Generation**
Parse Postman/Swagger collections and generate service clients.

**CLI Utility**: `src/utils/api_analyzer_cli.py`
```powershell
python src/utils/api_analyzer_cli.py Input/API_Collections/demo.json tests/api_output my_service
```

**OR use Python inline**:
```powershell
python -c "from src.services.api_analyzer_enhanced import EnhancedAPIAnalyzer; analyzer = EnhancedAPIAnalyzer(output_dir='tests/api_output'); analyzer.analyze_api_document(open('Input/API_Collections/demo.json').read(), 'postman', 'my_service')"
```

**Outputs**: API docs (Markdown), Service clients (Python/TypeScript/Java), Request builders, BDD scenarios

**See**: `docs/api-analyzer-service-guide.md`

---

### **4. Impact Analysis & Test Prioritization**
Reduce test suite size by 85-95% using AI-powered impact analysis.

**Input**: `data/Input/change_requests.json`
```json
{"change_id": "CR-2024-001", "modules": ["login"], "description": "Update validation", "risk_level": "high"}
```

**Execution**:
```powershell
python -c "from src.services.impact_analyzer import ImpactAnalyzer; analyzer = ImpactAnalyzer(); analyzer.analyze_change_request_with_llm(open('data/Input/change_requests.json').read())"
```

**Scoring**: `Final_Score = (LLM_Score × 0.4) + (Module_Score × 0.3) + (Defects_Score × 0.2) + (Business_Score × 0.1)`

**See**: `docs/COPILOT_IMPACT_ANALYSIS_GUIDE.md`

---

### **5. Test Execution (Cucumber + Playwright)**
**Configuration**: `framework/config/config.yaml` - Execution environment (local/browserstack/saucelabs), browser settings, RCA features

**BasePage Pattern** (`framework/core/basePage.ts`):
```typescript
protected async clickElement(selector: string, options?: {...})
protected async fillElement(selector: string, value: string, options?: {...})
protected async waitForElement(selector: string, timeout?: number)
// Auto-logging + AI locator healing built-in
```

**AI Locator Healing**: Primary selector → Fallback selectors (YAML) → AI semantic locator → Visual matching

**See**: `.github/skills/web-defensive-automation.md` for wait strategies and interaction patterns

---

### **6. Locator Generation**
Extract UI locators from web pages and generate YAML files.

**MCP Tools** (3-step process):
1. `mcp_fusioniq-agen_locator_generator_step1` → Capture DOM snapshot
2. `mcp_fusioniq-agen_locator_generator_step2` → Extract element data
3. `mcp_fusioniq-agen_locator_generator_step_final` → Generate YAML

**Output Format** (`tests/page-object/*.yaml`):
```yaml
elements:
  login_button:
    selector: "#loginBtn"
    fallback_selectors: ["button[type='submit']", "//button[contains(text(), 'Login')]"]
    ai_description: "Primary login submit button"
    element_type: "button"
```

**See**: `docs/locator-generation-guide.md`, `.github/skills/yaml-locator-analysis.md`

---

## 📋 Project-Specific Conventions

### **File Naming**
- **Stories**: `JIRA_{PROJECT}-{ID}.txt` (e.g., `JIRA_POCTC-56.txt`)
- **Features**: `{STORY_ID}_bdd.feature` (e.g., `POCTC-56_bdd.feature`)
- **Locators**: `{page_name}_locators.yaml` (e.g., `login_locators.yaml`)
- **Test Results**: Auto-generated in `test-results/`

### **Directory Structure**
- **Generated**: `data/testcases/GenAI_generated/` - DO touch (AI outputs)
- **Manual**: `tests/stepdefs/`, `tests/page-object/` - Read-only (human-written)
- **Config**: `framework/config/*.yaml` - Modify with caution
- **Logs**: `logs/`, `test-results/` - Auto-managed

### **Code Patterns**
- **CustomWorld**: Cucumber World object with page/context/logger
- **BasePage**: Inherit for all page objects, never bypass methods
- **LocatorUtility**: Always use instead of direct Playwright selectors
- **StepLogger**: Automatic logging, don't add manual logs unless debugging

### **Configuration Layers**
1. `config.json` - Python service settings (AI, MCP, logging)
2. `framework/config/config.yaml` - Test execution settings
3. `framework/config/browser-combinations.yaml` - Browser matrix
4. `framework/config/cloud-providers.yaml` - BrowserStack/SauceLabs
5. `.env` (if exists) - Credentials (not in repo)

---

## 🔧 Common Tasks & Commands

### **Setup & Dependencies**
```powershell
# Python environment
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# TypeScript dependencies (if package.json exists)
npm install
```

### **API Analysis**
```powershell
python src/utils/api_analyzer_cli.py Input/API_Collections/demo.json tests/api_output demo_service
```

### **Generate from Story**
```
User: "Generate BDD + step defs + page objects for POCTC-83"

Agent workflow:
1. Confirm story exists: data/stories/JIRA_POCTC-83.txt
2. Load MCP tools (search first!)
3. Generate BDD → data/testcases/GenAI_generated/POCTC-83_bdd.feature
4. Generate step defs (use MCP tool)
5. Generate page objects (use MCP tool)
6. Report: "Generated 3 artifacts for POCTC-83"
```

### **Impact Analysis**
```powershell
# Analyze change request and prioritize tests
python -c "from src.services.impact_analyzer import ImpactAnalyzer; analyzer = ImpactAnalyzer(); result = analyzer.analyze_change_request_with_llm({'change_id': 'CR-001', 'modules': ['login'], 'description': 'Update validation'}); print(result)"
```

---

## 🚨 Critical Reminders

1. **Never create new .py/.ts/.js files** - Use existing functions via `python -c` or CLI
2. **Always search MCP tools first** - Use `tool_search_tool_regex` before calling deferred tools
3. **Read before generate** - Check `data/stories/` before asking to fetch
4. **PowerShell syntax** - Use `;` for chaining (NEVER `&&`), use `Get-ChildItem` not `ls`
5. **Context matters** - Load MCP Context Server data for better generation quality
6. **Validate outputs** - Generated features should have Scenario Outline with Examples
7. **Reference skills** - Use `.github/skills/*.md` for patterns instead of reinventing
8. **Document tool calls** - When using MCP tools, explain what was called and why

---

## 📚 Key Resources

### Skills (Reusable Patterns)
- **[mcp-integration-guide.md](.github/skills/mcp-integration-guide.md)** - MCP server integration patterns
- **[bdd-gherkin-patterns.md](.github/skills/bdd-gherkin-patterns.md)** - BDD/Gherkin best practices
- **[web-defensive-automation.md](.github/skills/web-defensive-automation.md)** - Wait strategies, interactions
- **[validation-and-autofix.md](.github/skills/validation-and-autofix.md)** - 5-layer validation
- **[page-object-design-patterns.md](.github/skills/page-object-design-patterns.md)** - Page object patterns
- **[bdd-data-driven-testing.md](.github/skills/bdd-data-driven-testing.md)** - Data-driven test patterns
- **[web-framework-discovery.md](.github/skills/web-framework-discovery.md)** - Framework detection

### Documentation Guides
- `docs/framework_arch.md` - Architecture overview
- `docs/web-bdd-Test scenarios-generation-guide.md` - Web BDD generation
- `docs/api-analyzer-service-guide.md` - API analysis
- `docs/locator-generation-guide.md` - Locator generation
- `docs/COPILOT_IMPACT_ANALYSIS_GUIDE.md` - Impact analysis

### Specialized Agents
- `.github/agents/web-Traditional-Testcases-gen.agent.md` - Traditional test cases
- `.github/agents/web-traditional-test-scripts-gen.agent.md` - Test scripts
- `.github/agents/web-step-definitions-generator.agent.md` - Step definitions
- `.github/agents/page-objects-generator.agent.md` - Complete locator generation pipeline