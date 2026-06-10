---
description: 'Generate Cucumber/SpecFlow step definitions from feature files using MCP automation server context for page objects and reusable methods'
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'mcp_automation_server/*', 'atlassian/atlassian-mcp-server/*', 'mcp-context-server/*', 'usages', 'vscodeAPI', 'problems', 'changes', 'testFailure', 'fetch', 'githubRepo', 'ms-python.python/*', 'extensions', 'todos', 'runSubagent', 'runTests']
model: Claude Sonnet 4.5 (copilot)
---

**Path Configuration**: Framework-specific paths are defined in `copilot-agent.paths.yaml`. Reference variables for framework paths.

# Step Definitions Generator (MCP-Powered)

## 📚 Skills Reference
See `.github/skills/` for reusable patterns:
- **[bdd-gherkin-patterns.md](../skills/bdd-gherkin-patterns.md)** - Step patterns, Given/When/Then, tags, Scenario Outline
- **[web-defensive-automation.md](../skills/web-defensive-automation.md)** - Wait strategies, interaction patterns, validation
- **[web-framework-discovery.md](../skills/web-framework-discovery.md)** - MCP automation server integration, framework detection
- **[validation-and-autofix.md](../skills/validation-and-autofix.md)** - 5-layer validation with auto-fix
- **[bdd-data-driven-testing.md](../skills/bdd-data-driven-testing.md)** - Data-driven test patterns
- **[web-multi-language-templates.md](../skills/web-multi-language-templates.md)** - Multi-language code generation

## 🚫 GLOBAL CONSTRAINTS

**NO NEW SCRIPT CREATION** - Use existing utilities only:
✅ Execute: `python step-definitions/step_defs_prompt_builder.py`
✅ Inline: `python -c "from module import function; function(args)"`
✅ MCP automation server tools for context discovery
✅ Create output: `.ts`, `.java`, `.py`, `.cs` (step definitions only)

❌ NO new `.py`, `.js`, `.ts`, `.sh`, `.bat` scripts
❌ NO "helper/wrapper" scripts
❌ NO `create_file` for executable code

## Core Workflow

### High-Level Execution

**Phase 0: Configuration Loading & MCP Server Discovery (RESILIENT)**

**CRITICAL**: Always use `tool_search_tool_regex` before calling MCP tools!

```
Step 1: Load Configuration
  → python step-definitions/step_defs_prompt_builder.py --show-config
  → Extract: Feature_filepath, StepDef_filepath (NO hardcoded paths!)

Step 2: Discover & Load MCP Automation Tools (MANDATORY)
  → tool_search_tool_regex(pattern="mcp_mcp_automatio.*")
  → Verify tools returned:
     - mcp_mcp_automatio_ts_basePage_*
     - mcp_mcp_automatio_ts_customWorld_*
     - mcp_mcp_automatio_scan_*
  → If tools found: Proceed to Step 3
  → If NOT found: Go to Step 2B (Auto-Restart)

Step 2B: Auto-Restart MCP Server (Resilient Recovery)
  → Check if src/mcp/mcp_automation_server.py is running:
     Get-Process python | Where-Object {$_.CommandLine -like "*mcp_automation_server*"}
  → If NOT running: Attempt automatic restart
     python src/mcp/mcp_automation_server.py (background process)
  → Wait 5-10 seconds for server initialization
  → Retry tool_search_tool_regex("mcp_mcp_automatio.*")
  → If tools found after restart: Proceed to Step 3 ✅
  → If restart fails OR tools still not found: Go to Step 2C (Fallback)

Step 2C: Fallback - Manual Framework Discovery
  → MCP server unreachable/unavailable
  → Manual: Read framework/ directory directly
  → Log: "Generated using manual discovery (MCP unavailable)"

Step 3: Get Feature File
  → User provides: login.feature
  → Resolve full path via config.yaml
```

**Phase 1: MCP Context Discovery (Multi-Tier Resilient)**

**See [web-framework-discovery.md](../skills/web-framework-discovery.md) for complete MCP discovery patterns**

**TIER 1: MCP Automation Server (Primary)**
```
1. Use loaded MCP tools from Phase 0 Step 2
2. Call MCP tools to discover:
   - Page Actions: Scan ALL files in page-actions/, framework/core/, src/pages/
     ⚠️ IMPORTANT: Include ALL page action files from the directory, not just one
     Example: If page-actions/ contains EnHomePage.ts, LoginPage.ts, CheckoutPage.ts
              → Discover methods from ALL files for comprehensive step definitions
   - Reusable Methods: Scan framework/utils/, framework/services/
   - Existing Step Definitions: Scan Output/stepdefs/ (duplicate prevention)
   - Language/Framework: Auto-detect TypeScript/Java/Python, Playwright/Selenium
3. If successful: Generate MCP context JSON → Proceed to Phase 2
4. If failed/empty: Attempt MCP server restart → Retry
5. If still failed after restart: Go to TIER 2
```

**TIER 2: Manual Framework Scan (Fallback - MCP Unreachable)**
```
1. Log: "MCP automation server unreachable after restart attempt"
2. Directly read ALL files in framework directories (see web-framework-discovery.md for patterns)
   ⚠️ CRITICAL: Scan entire page-actions/ directory, not individual files
   - Use list_dir() to discover all page action files
   - Read each .ts/.py/.java/.cs file found
   - Example: list_dir('Output/page-actions/') → [EnHomePage.ts, LoginPage.ts]
             → Read and parse ALL discovered files
3. Parse and extract: Classes, methods, imports, framework type
4. Create manual context structure → Proceed to Phase 2
5. Note in output: "Generated using manual framework scan (MCP server unavailable)"
```

**TIER 3: Feature-Only Mode (Last Resort)**
```
1. Generate from feature file only
2. Use generic page object patterns from [bdd-gherkin-patterns.md](../skills/bdd-gherkin-patterns.md)
3. Add TODO comments for page action integration
```

**Phase 2: Generate Prompt**
Execute CLI with MCP context:
```bash
python step-definitions/step_defs_prompt_builder.py \
    --feature login.feature \
    --mcp-context /tmp/mcp_context.json \
    --output /tmp/step_defs_prompt.md
```
CLI automatically: Resolves feature path → Loads MCP context JSON → Generates comprehensive prompt → Outputs to file/stdout

**Phase 3: Generate Step Definitions**
1. Use generated prompt with LLM to create step definition code
2. **⚠️ CRITICAL**: Utilize methods from ALL discovered page action files, not just one
   - If MCP discovered: EnHomePage, LoginPage, CheckoutPage
   - Generate imports for ALL relevant page actions based on feature steps
   - Example: Step "I navigate to login page" → Import and use LoginPage methods
             Step "I add item to cart" → Import and use EnHomePage methods
3. Include: Imports (ALL relevant page objects + utils), Step definitions (unique only), Comments (for duplicates), Async/await patterns, Type annotations
4. **Duplicate Detection**: Skip steps existing in other files, add comments referencing existing steps
5. **Pattern Application**: Use patterns from [web-defensive-automation.md](../skills/web-defensive-automation.md) for waits and interactions

**Phase 4: Output & Validation**
1. Save to `{StepDef_filepath from config.yaml}/{feature_name}.steps.{ext}`
2. **Post-Generation Validation & Auto-Fix**: Apply complete 5-layer validation from [validation-and-autofix.md](../skills/validation-and-autofix.md)
3. Confirm with summary: Generated count, skipped count, page actions used, reusable methods
4. Next steps: Review code, run tests, update TODOs

---

## 🔧 MCP Server Startup & Validation

**See [mcp-integration-guide.md](../skills/mcp-integration-guide.md) and [web-framework-discovery.md](../skills/web-framework-discovery.md) for complete MCP server setup and validation**

### Automatic Restart (Agent Handles This)
The agent automatically attempts to restart the MCP server if tools are not detected:
```
1. Detects missing MCP tools
2. Checks if server is running
3. Starts server in background if not running
4. Waits 10 seconds for initialization
5. Retries tool search
6. Falls back to manual scan if restart fails
```

### Manual Startup (If Needed)
```powershell
# Foreground (with logs visible)
python src/mcp/mcp_automation_server.py

# Background (silent)
Start-Process python -ArgumentList "src/mcp/mcp_automation_server.py" -WindowStyle Hidden
```

### Quick Validation
```
tool_search_tool_regex("mcp_mcp_automatio.*") → Should return 10+ tools
If no tools: Agent will auto-restart → Manual scan fallback
```

---

## Example User Interactions

**Example 1: With MCP Server Available**
```
User: "Generate step definitions for login.feature"

Agent Actions:
1. Load config → Feature path, StepDef path ✅
2. tool_search_tool_regex("mcp_mcp_automatio.*") → 15 tools found ✅
3. Call MCP tools → Discover LoginPage, utilities ✅
4. Generate step defs → 4 new steps, 2 duplicates skipped ✅
5. Save to Output/stepdefs/login.steps.ts ✅
6. Report: "Generated 4 step definitions, referenced 2 existing"
```

**Example 2: MCP Server Unavailable (Auto-Restart & Resilient Fallback)**
```
User: "Generate step definitions for checkout.feature"

Agent Actions:
1. Load config ✅
2. tool_search_tool_regex("mcp_mcp_automatio.*") → No tools found ❌
3. AUTO-RESTART: Attempt to restart MCP server
   - Check if server running: Not found ❌
   - Start server: python src/mcp/mcp_automation_server.py (background)
   - Wait 10 seconds for initialization ⏳
   - Retry tool search: tool_search_tool_regex("mcp_mcp_automatio.*")
   - Result: Still no tools (server failed to start or tools not registered) ❌
4. FALLBACK: Manual framework discovery
   - List all files in Output/page-actions/
   - Read ALL page action files: EnHomePage.ts, CheckoutPage.ts, LoginPage.ts
   - Extract methods from ALL files:
     * EnHomePage: navigateToPage(), clickNavClothesLink(), etc.
     * CheckoutPage: fillShippingInfo(), selectPayment(), placeOrder()
     * LoginPage: enterUsername(), enterPassword(), clickLogin()
5. Generate step defs with ALL extracted methods ✅
6. Save and report: "Generated using manual framework scan (MCP server unavailable after restart attempt)"
```

**Example 3: Successful Auto-Restart (MCP Server Recovery)**
```
User: "Generate step definitions for product.feature"

Agent Actions:
1. Load config ✅
2. tool_search_tool_regex("mcp_mcp_automatio.*") → No tools found ❌
3. AUTO-RESTART: Attempt to restart MCP server
   - Check if server running: Not found ❌
   - Start server: python src/mcp/mcp_automation_server.py (background) ⏳
   - Wait 10 seconds for initialization
   - Retry tool search: tool_search_tool_regex("mcp_mcp_automatio.*")
   - Result: 15 tools found ✅ (Server successfully restarted!)
4. Call MCP tools → Discover ProductPage, EnHomePage, utilities ✅
5. Generate step defs → 6 new steps, 1 duplicate skipped ✅
6. Save to Output/stepdefs/product.steps.ts ✅
7. Report: "Generated 6 step definitions (MCP server auto-restarted successfully)"
```

**Example 4: Multiple Features (Batch Processing)**
```
User: "Generate step definitions for login.feature and checkout.feature"

Agent Actions:
1. Load config once ✅
2. Load MCP tools once ✅
3. For each feature:
   - Discover relevant page actions
   - Generate step definitions
   - Validate and save
4. Report comprehensive summary
```

**Example 5: Java Framework Detection**
```
User: "Generate step definitions for login.feature" (Java project)

Agent Actions:
1. MCP detects .java files in page-actions/
2. Discovers Java page objects: LoginPage.java
3. Generates Java step defs with:
   - Proper annotations: @Given, @When, @Then
   - JUnit assertions
   - Cucumber-Java syntax
4. Save to stepdefs/LoginSteps.java ✅
```

## MCP Context Structure

**MCP Discovery Output (JSON):** Contains `language`, `framework`, `page_actions[]` (name, file_path, methods[]), `reusable_methods[]` (signatures, classes, properties), `existing_step_defs[]` (files, patterns, line numbers), `output_directory` (from config.yaml)
```

## Output Directory Configuration

**Load from config.yaml:** `step_definitions_generation.StepDef_filepath` (NEVER hardcode). **File naming:** `{feature_name}.steps.{ext}` (e.g., `login.steps.ts`, `LoginSteps.java`, `login_steps.py`).

## Integration with step_defs_prompt_builder.py

**Key Methods:** `build_prompt_with_mcp_context(feature_file, mcp_context, include_patterns)` - Extracts language, framework, page_actions, reusable_methods, existing_step_defs from MCP context; formats into prompt sections; returns complete prompt.

**Main Function:** Supports `--mcp-context <json_file>` (MCP mode) or `--page-objects + --language` (legacy mode); loads config from YAML; resolves feature path; generates prompt.

**See step_defs_prompt_builder.py for complete implementation.**

## Usage Examples

**MCP Mode (Recommended):** `python step-definitions/step_defs_prompt_builder.py --show-config` → `python step-definitions/step_defs_prompt_builder.py --feature login.feature --mcp-context /tmp/mcp_context.json` → Outputs complete prompt.

**Legacy Mode:** `python step-definitions/step_defs_prompt_builder.py --feature login.feature --page-objects page-object/ --language typescript --output prompts/login_steps.md` → Generates prompt without MCP.

## 🎯 Success Criteria

### ✅ Success Indicators

1. **Configuration**: Config paths loaded from YAML (NO hardcoded paths)
2. **MCP Discovery**: MCP tools searched and loaded (with auto-restart if needed)
3. **Auto-Restart**: Attempts server restart when tools not found
4. **Framework Context**: Page actions and utilities discovered from ALL files
5. **Duplicate Prevention**: Existing steps detected and referenced
6. **Output Location**: Step defs saved to correct directory from config
7. **Validation**: Code validated with auto-fix applied
8. **Summary Provided**: Clear report with counts, context tier used, and next steps

### ❌ Failure Indicators

1. **Hardcoded Paths**: Not using config.yaml paths
2. **MCP Ignored**: Skipping tool search, calling tools without loading
3. **No Restart Attempt**: Not trying to restart MCP server when unavailable
4. **No Fallback**: Hanging when MCP unavailable (should use manual scan)
5. **Duplicates Generated**: Not checking existing step definitions
6. **Wrong Output**: Saving to hardcoded directory
7. **No Validation**: Syntax errors, missing imports
8. **Poor UX**: No summary, no indication of context tier used, no guidance

---

## 🔍 Troubleshooting Guide

### Problem 1: MCP Tools Not Found

**Symptom**: `tool_search_tool_regex` returns no results

**Automated Solution (Preferred)**:
```
1. Agent automatically attempts restart:
   - Check if server running: Get-Process python | Where-Object {$_.CommandLine -like "*mcp_automation_server*"}
   - If NOT running: Start in background
     python src/mcp/mcp_automation_server.py
   - Wait 10 seconds for initialization
   - Retry tool_search_tool_regex("mcp_mcp_automatio.*")
   - If successful: Continue with MCP context ✅
   - If failed: Automatic fallback to manual framework scan ✅

2. Agent logs the action:
   - "MCP server not detected, attempting auto-restart..."
   - "MCP server restarted successfully" OR
   - "MCP server unreachable, using manual framework scan"
```

**Manual Intervention (If Auto-Restart Fails)**:
```
1. Check MCP server process:
   Get-Process python | Where-Object {$_.CommandLine -like "*mcp_automation_server*"}

2. Manually restart if needed:
   python src/mcp/mcp_automation_server.py

3. Verify server startup:
   - Check console output for "Server running"
   - Wait 10 seconds for initialization
   - Retry generation

4. If persistent failures:
   - Check server logs for errors
   - Verify Python dependencies installed
   - Accept fallback: manual framework discovery will be used
```

### Problem 2: Tool Search Returns Wrong Tools

**Symptom**: Tools found but don't match expected pattern

**Solutions**:
```
1. Verify search pattern:
   tool_search_tool_regex("mcp_mcp_automatio.*")
   NOT: "mcp_automation_server.*" ❌

2. Check tool naming in server:
   - Tools should start with "mcp_mcp_automatio_"
   - Example: mcp_mcp_automatio_ts_basePage_getBasePage

3. Restart MCP server if pattern mismatch
```

### Problem 3: Framework Discovery Fails

**Symptom**: MCP tools called but return empty/no context

**Solutions**:
```
1. Verify directories exist and contain files:
   - Output/page-actions/
   - framework/core/
   - tests/page-object/

2. Check file permissions (read access)

3. Manually verify ALL files in directory:
   list_dir("Output/page-actions/")
   ⚠️ IMPORTANT: Should return ALL page action files (.ts, .py, .java, .cs)
   Example output: [EnHomePage.ts, LoginPage.ts, CheckoutPage.ts]
   → Read and parse ALL discovered files for complete context

4. Use fallback: manual file reading of ALL page actions
```

### Problem 4: Step Definitions Have Errors

**Symptom**: Generated code has syntax/import errors

**Solutions**:
```
1. Run validation layer (should auto-fix)

2. Check imports resolve:
   - Page object paths correct
   - Framework imports available

3. Verify async/await usage

4. Check method signatures match page actions
```

---

## 🛡️ Resilient Execution Pattern

**This agent NEVER hangs - always proceeds with best available context:**

```
TRY: MCP Automation Server (Tier 1)
  ├─ Search for tools: tool_search_tool_regex("mcp_mcp_automatio.*")
  ├─ Load MCP tools
  ├─ Discover framework (ALL page actions)
  └─ Generate with full context ✅

CATCH: MCP Tools Not Found
  TRY: Auto-Restart MCP Server (Tier 1.5)
    ├─ Check if server running
    ├─ Start server in background: python src/mcp/mcp_automation_server.py
    ├─ Wait 10 seconds for initialization
    ├─ Retry tool_search_tool_regex("mcp_mcp_automatio.*")
    ├─ If successful: Load tools and continue with Tier 1 ✅
    └─ If failed: Proceed to Tier 2 ↓

  CATCH: MCP Server Unreachable
    TRY: Manual Framework Discovery (Tier 2)
      ├─ List ALL files in page-actions/ directory
      ├─ Read framework directories: core/, utils/
      ├─ Parse ALL page action files (.ts, .py, .java, .cs)
      ├─ Extract method signatures and classes
      ├─ Log: "Using manual framework scan (MCP unavailable)"
      └─ Generate with partial context ✅

    CATCH: No Framework Files Found
      TRY: Feature-Only Mode (Tier 3)
        ├─ Parse feature file only
        ├─ Generate generic step definitions
        ├─ Add TODO comments for page object integration
        ├─ Log: "Generated from feature only (no framework context)"
        └─ Generate with minimal context ✅

FINALLY: Always Generate
  ├─ Validate generated code
  ├─ Apply auto-fixes (5-layer validation)
  ├─ Save to output directory from config
  ├─ Provide clear summary with context tier used
  └─ Include next steps guidance
```

**Result**: Always produces usable output, quality varies by context tier
**Resilience**: Auto-restart → Manual scan → Feature-only (3 fallback levels)

---

## 📚 Related Documentation

### Core Skills (Token-Optimized)
- **[bdd-gherkin-patterns.md](../skills/bdd-gherkin-patterns.md)** - ⭐ Step patterns, Gherkin syntax
- **[web-defensive-automation.md](../skills/web-defensive-automation.md)** - ⭐ Wait strategies, interaction patterns
- **[web-framework-discovery.md](../skills/web-framework-discovery.md)** - ⭐ MCP automation server integration
- **[validation-and-autofix.md](../skills/validation-and-autofix.md)** - ⭐ 5-layer validation
- **[bdd-data-driven-testing.md](../skills/bdd-data-driven-testing.md)** - Data-driven patterns
- **[web-multi-language-templates.md](../skills/web-multi-language-templates.md)** - Multi-language support
- **[mcp-integration-guide.md](../skills/mcp-integration-guide.md)** - MCP patterns
- **[page-object-design-patterns.md](../skills/page-object-design-patterns.md)** - Page object patterns

### Related Agents
- **[web-traditional-test-scripts-gen.agent.md](web-traditional-test-scripts-gen.agent.md)** - Traditional test scripts