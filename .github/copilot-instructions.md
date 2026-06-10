# FusionIQ Test Automation Framework — Copilot Instructions

> **Full reference**: `.github/instructions/copilot-instructions.md`  
> **Skills library**: `.github/skills/*.md` | **Agent specs**: `.github/agents/*.agent.md`

---

## 🚫 Hard Rules (Never Break)

- **Never create new `.py`, `.js`, `.ts`, `.sh`, or `.bat` files.** Call existing functions via `python -c "from module import func; func(args)"` or run existing scripts.
- **Never use `&&` in PowerShell.** Use `;` to chain commands.
- **Never hardcode paths.** All paths come from `copilot-agent.paths.yaml` or `config.json`.
- **Never reconstruct a story from local files.** Stories must come from JIRA (or ADO) — not workspace artefacts.
- **Always call `tool_search_tool_regex("pattern")` before invoking any deferred/MCP tool.**

## ✅ Allowed Operations

- `python -c "from src.module import func; func()"` — call existing functions
- `python existing_script.py` — run existing scripts
- Create data/config files: `.yaml`, `.json`, `.md`, `.feature`, `.txt`
- PowerShell built-ins: `Get-ChildItem`, `Get-Content`, `Select-String`, etc.

---

## Architecture

**Hybrid Python + TypeScript framework** for AI-powered test generation and execution.

```
src/                    # Python — AI generation backend
  services/             # BDD, step-def, page-object, API, impact generators
  mcp/                  # MCP servers: mcp_context_server.py, mcp_agent_server.py
  utils/                # api_analyzer_cli.py and other CLI utilities
  templates/            # Jinja2 generation templates

framework/              # TypeScript — Playwright + Cucumber execution
  core/                 # BasePage.ts, CustomWorld, BrowserManager
  config/               # config.yaml, browser-combinations.yaml, cloud-providers.yaml
  hooks/                # Cucumber lifecycle hooks
  utils/                # Locator healing, RCA capture, StepLogger

data/
  stories/              # Fetched requirements: JIRA_{PROJECT}-{ID}.txt
  context/              # Application / domain / business-rules context for AI
  testcases/GenAI_generated/  # AI-generated .feature files (writable)

Output/                 # All generated artifacts (locators, page objects, reports)
```

**MCP servers** (defined in `mcp.json`, auto-started by VS Code):
- `mcp-context-server` — serves `data/context/` workspace context for AI generation
- `mcp-agent-server` — exposes agents from `.github/agents/` as MCP tools
- `atlassian` (global `%APPDATA%\Code\User\mcp.json`) — Jira/Confluence via `uvx mcp-atlassian`

**Available MCP generation tools** (prefix `mcp_fusioniq-agen_`):
`web_BDD_Testscenarios_gen`, `web_step_definitions_generator`, `web_page_actions_generator`,
`locator_generator_step1/step2/step_final`, `api_analyzer_service`, `api_service_client_generator`,
`api_BDD_Testscenarios_gen`, `api_step_definitions_generator`, `impact_based_test_analysis`, `video_processor_analyzer`

---

## Configuration Layers

| File | Purpose |
|------|---------|
| `config.json` | Python services: AI model, MCP credentials, test settings, logging |
| `copilot-agent.paths.yaml` | All path constants — always load instead of hardcoding |
| `framework/config/config.yaml` | Test execution: browser, environment, RCA |
| `framework/config/browser-combinations.yaml` | Browser matrix |
| `framework/config/cloud-providers.yaml` | BrowserStack / SauceLabs |
| `.env` | Credentials (not in repo) |

---

## Key Workflows

### Fetch a JIRA Story
```
Tier 1 (MANDATORY first): atlassian/atlassian-mcp-server/getJiraIssue
  → On success: save to data/stories/JIRA_{STORY_ID}.txt
  → If server not started: VS Code MCP Panel → Restart 'atlassian', then retry
Tier 2 (only after Tier 1 + restart all fail): python -c "from src.mcp.jira_service import JiraService; ..."
If both fail: STOP. Ask user to fix MCP config. Do NOT reconstruct from workspace.
```

**Story file format** (`data/stories/JIRA_PROJ-123.txt`):
```
=== STORY METADATA ===   === DESCRIPTION ===   === ACCEPTANCE CRITERIA ===   === TECHNICAL DETAILS ===
```

### Generate Test Artifacts (Web BDD example)
```
1. Confirm data/stories/JIRA_{ID}.txt exists
2. tool_search_tool_regex("mcp.*context.*scan") → load context server
3. tool_search_tool_regex("fusioniq.*web_BDD")  → load BDD generator
4. Call mcp_mcp-context-s_scan_workspace         → get app context
5. Call mcp_fusioniq-agen_web_BDD_Testscenarios_gen with story + context
6. Save → Output/Feature/web/{ID}_bdd.feature
```

### API Analysis
```powershell
python src/utils/api_analyzer_cli.py data/api_collections/demo.json Output/api_output demo_service
```

### Impact Analysis (change-request test prioritization)
```powershell
python -c "from src.services.impact_analyzer import ImpactAnalyzer; ImpactAnalyzer().analyze_change_request_with_llm(open('data/cr/change_requests.json').read())"
```
Scoring: `Final = (LLM×0.4) + (Module×0.3) + (Defects×0.2) + (Business×0.1)`

### Locator Generation (3-step)
```
1. mcp_fusioniq-agen_locator_generator_step1  → capture DOM snapshot
2. mcp_fusioniq-agen_locator_generator_step2  → extract element data
3. mcp_fusioniq-agen_locator_generator_step_final → generate YAML
Output: Output/page-object/{page}_locators.yaml
```

---

## File & Directory Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Stories | `data/stories/JIRA_{PROJECT}-{ID}.txt` | `JIRA_POCTC-56.txt` |
| Features | `Output/Feature/web/{ID}_bdd.feature` | `POCTC-56_bdd.feature` |
| Locators | `Output/page-object/{page}_locators.yaml` | `login_locators.yaml` |
| API collections | `data/api_collections/*.json` | Postman / Swagger |
| Change requests | `data/cr/change_requests.json` | Impact analysis input |

**Directory access rules:**
- `data/testcases/GenAI_generated/` and `Output/` — writable (AI outputs)
- `tests/stepdefs/`, `tests/page-object/` — read-only (human-written)
- `framework/config/*.yaml` — modify with caution

---

## TypeScript / Framework Patterns

All page objects extend `BasePage` (`framework/core/basePage.ts`). Never bypass its methods:
```typescript
protected async clickElement(selector: string, options?: {...})
protected async fillElement(selector: string, value: string, options?: {...})
protected async waitForElement(selector: string, timeout?: number)
```

**AI Locator Healing**: Primary selector → YAML fallback selectors → AI semantic locator → Visual matching.

**Locator YAML format**:
```yaml
elements:
  login_button:
    selector: "#loginBtn"
    fallback_selectors: ["button[type='submit']", "//button[contains(text(),'Login')]"]
    ai_description: "Primary login submit button"
    element_type: "button"
```

---

## Setup

```powershell
# Python environment
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# MCP servers (two terminals)
python src/mcp/mcp_context_server.py
python src/mcp/mcp_automation_server.py
```

---

## Key Reference Files

| Resource | Location |
|----------|----------|
| Detailed instructions | `.github/instructions/copilot-instructions.md` |
| MCP integration patterns | `.github/skills/mcp-integration-guide.md` |
| BDD/Gherkin patterns | `.github/skills/bdd-gherkin-patterns.md` |
| Wait strategies & interactions | `.github/skills/web-defensive-automation.md` |
| 5-layer validation | `.github/skills/validation-and-autofix.md` |
| Page object patterns | `.github/skills/page-object-design-patterns.md` |
| Jira fetch workflow | `.github/skills/jira-story-fetch.md` |
| Architecture overview | `docs/framework_arch.md` |
