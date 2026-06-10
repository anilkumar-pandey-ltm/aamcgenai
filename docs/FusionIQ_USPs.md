# FusionIQ — USPs & Enhancements Built on GitHub Copilot

> **Tagline**: *FusionIQ = GitHub Copilot + Custom Agents + Skills Library + Custom MCP Servers + Python AI Utilities → Full STLC Automation Intelligence, out of the box.*

---

## 1. Custom Agents Covering the Entire STLC

- 13 purpose-built `.agent.md` custom agents — each specialized for a specific STLC activity
- Covers: BDD scenario generation, step definitions, page actions, locator generation, API analysis, service client generation, impact analysis, video processing
- Each agent has curated tool permissions, a specific model, and domain-specific instructions — not generic Copilot chat

**Agents in scope:**
| Agent | Purpose |
|-------|---------|
| `web-BDD_Testscenarios-gen` | BDD feature files from user stories |
| `web-step-definitions-generator` | TypeScript Cucumber step definitions |
| `web-page-actions-generator` | Page object action methods |
| `page-objects-generator` | Complete locator generation pipeline (7 phases) |
| `api-analyzer-service` | API collection parsing & YAML generation |
| `api-BDD_Testscenarios-gen` | API BDD test scenarios |
| `api-step-definitions-generator` | API step definitions |
| `api-service-client-generator` | Multi-language API client generation |
| `api-requestbuilder-gen` | HTTP request builder utilities |
| `impact-based-test-analysis` | AI-powered test prioritization |
| `processor-analyzer` | Video-to-test intelligence |
| `web-Traditional-Testcases-gen` | Traditional test case generation |
| `web-traditional-test-scripts-gen` | Traditional automation test scripts |

---

## 2. Reusable Skills Library (Domain Knowledge Injection)

- 20+ `.skills.md` files encoding expert QA knowledge that Copilot doesn't have natively
- Skills are invoked contextually — agents load relevant skill files before generating artifacts, ensuring consistent, production-quality output

**Skills in scope:**
| Skill | Knowledge Encoded |
|-------|------------------|
| `bdd-gherkin-patterns.md` | BDD best practices, scenario structure |
| `test-design-techniques.md` | BVA, EP, Decision Table, State Transition |
| `validation-and-autofix.md` | 5-layer validation framework |
| `impact-based-test-prioritization.md` | Multi-factor scoring algorithms |
| `mcp-integration-guide.md` | MCP server patterns & tool loading |
| `web-defensive-automation.md` | Wait strategies, resilient interactions |
| `page-object-design-patterns.md` | Page object structure & patterns |
| `api-testing-best-practices.md` | REST/GraphQL API testing patterns |
| `http-client-architecture.md` | HTTP client design patterns |
| `http-retry-resilience.md` | Retry strategies, circuit breakers |
| `multi-language-templates.md` | Code generation for multiple languages |
| `traceability-excel-export.md` | Requirement-to-test traceability |
| `jira-story-fetch.md` | Two-tier Jira fetch workflow |
| `html-cleanup-patterns.md` | DOM cleaning for locator extraction |
| `yaml-locator-analysis.md` | YAML locator schema & analysis |
| `bdd-coverage-strategies.md` | Coverage measurement & gap analysis |
| `bdd-data-driven-testing.md` | Data-driven BDD patterns |

---

## 3. Global Copilot Instructions as Guardrails (`copilot-instructions.md`)

- A single `copilot-instructions.md` file enforces **framework-wide behavioral rules** across ALL agents and chat sessions
- Defines hard constraints that Copilot cannot override, regardless of user prompt
- Ensures every output conforms to the framework's architecture — Copilot never goes off-script

**Key guardrails enforced:**
- **No new script creation** — absolute prohibition on creating `.py`, `.js`, `.ts`, `.sh`, `.bat` files
- **MCP-first tooling** — mandatory `tool_search_tool_regex` before any MCP tool call
- **Config-driven paths** — no hardcoded paths; always loaded from `config.yaml` / `config.json`
- **Existing functions only** — reuse via `python -c "from module import func; func(args)"`
- **PowerShell conventions** — use `;` chaining, never `&&`
- **Data integrity rules** — stories must come from Jira; never reconstruct from workspace artefacts

---

## 4. Custom MCP Servers for Deep Context Awareness

Two proprietary MCP servers built specifically for FusionIQ — giving Copilot live awareness of the codebase and business domain:

### MCP Automation Server (`mcp_automation_server.py`)
- Scans workspace structure in real-time
- Discovers existing step definitions, page objects, locators, utilities
- Enables **40–60% step reuse detection** — Copilot generates only what's missing, not duplicates
- Detects programming language and framework from config files

### MCP Context Server (`mcp_context_server.py`)
- Injects domain knowledge into every generation: business rules, application context, domain terminology
- Loads context from `data/context/` (application, business rules, domain layers)
- Ensures generated artifacts align with the actual application under test

### External MCP Integrations
- **Atlassian MCP** — direct Jira/Confluence requirement fetching into the pipeline
- **ADO Service** (`ado_service.py`) — Azure DevOps integration for enterprise environments

---

## 5. Python Utility Layer as AI Execution Engine

Specialized Python services that act as the execution backbone — Copilot orchestrates these, never creates new scripts:

| Service | Capability |
|---------|-----------|
| `impact_analyzer.py` | AI-powered test prioritization with multi-factor scoring |
| `video_service.py` | Requirements extraction from demo video walkthroughs |
| `locator_extractor.py` | Intelligent locator generation from live DOM |
| `copilot_api_analyzer_service.py` | API collection parsing and YAML generation |
| `page_object_generator_service.py` | Page action method generation |
| `step_defs_generator_service.py` | Step definition generation with reuse detection |
| `multi_language_service_client_generator.py` | Multi-language API client generation |
| `framework_yaml_generator_service_enhanced.py` | Enhanced YAML locator file generation |

**Invocation pattern**: `python -c "from src.services.<module> import <function>; <function>(args)"`

---

## 6. Multi-Tier Fallback Workflows (Resilience by Design)

Every critical workflow has a defined, instruction-level fallback chain — Copilot never fabricates or guesses:

**Example — Jira Story Fetch:**
```
Tier 1: Atlassian MCP Server (getJiraIssue)
   ↓ [if MCP unavailable after restart+retry]
Tier 2: jira_service.py Python fallback
   ↓ [if both fail]
HARD STOP — Ask user to fix MCP config. Never reconstruct from workspace.
```

- Prevents hallucinated requirements — data integrity enforced at instruction level
- Batch failure handling — summary files with statistics on partial completions
- Authentication failure paths — explicit recovery instructions built in

---

## 7. AI-Powered Impact-Based Test Prioritization

- Multi-factor scoring algorithm determines which tests to run after a change request:

$$\text{Final Score} = (\text{LLM} \times 0.4) + (\text{Module} \times 0.3) + (\text{Defects} \times 0.2) + (\text{Business} \times 0.1)$$

| Factor | Weight | Source |
|--------|--------|--------|
| LLM Semantic Relevance | 40% | AI-driven analysis of change vs. test description |
| Module Impact | 30% | Direct component mapping |
| Historical Defects | 20% | Risk prediction from defect patterns |
| Business Priority | 10% | Business criticality metadata |

- Reduces test suite size by **85–95%** while maximizing risk coverage
- Output: Excel report with 3-sheet prioritized test suite — fully automated via Copilot agent
- Input: Change requests (`change_requests.json`) + existing test cases + defect history

---

## 8. 5-Layer Validation and Auto-Fix (Self-Healing Generation)

Generated artifacts are not just created — they are validated and auto-fixed across 5 layers:

| Layer | Validation | Auto-Fix |
|-------|-----------|---------|
| Layer 1: Syntax | Compile/parse errors, type errors | Language-specific fixes applied |
| Layer 2: Framework Integration | Import paths, base class usage, method signatures | Relative path correction, framework-aware imports |
| Layer 3: Locator/Endpoint | YAML keys exist, API endpoints valid | Missing reference resolution |
| Layer 4: Business Logic | Method naming, parameter types align with requirements | BDD scenario alignment checks |
| Layer 5: Performance & Best Practices | Auto-waiting, parallel execution, defensive patterns | Framework-specific optimizations applied |

This makes FusionIQ deliver **production-ready artifacts** — not just generated code that needs manual fixing.

---

## 9. Video-to-Test Intelligence

- Unique capability: feed a **demo video walkthrough** → Copilot agent extracts structured testing artifacts
- Powered by `video_service.py` with frame-by-frame AI analysis

**Supported output types:**
| Task Type | Output |
|-----------|--------|
| `test_case` | Test scenarios, preconditions, steps, expected results with timestamps |
| `defect` | Bug descriptions, severity, reproduction steps, impact assessment |
| `user_story` | Personas, goals, acceptance criteria, workflow documentation |
| `bdd` | Gherkin features, Given/When/Then, Examples tables |

- Supported formats: MP4, WebM, AVI, MOV, MKV, FLV, WMV, M4V
- Requirements gathered from visual evidence — no text spec needed

---

## 10. End-to-End Artifact Traceability

- Full traceability chain maintained across the entire STLC pipeline:

```
Jira Story → Feature File → Step Definitions → Page Actions → Locators → Test Execution
```

- `test-traceability.yaml` and TCM patterns ensure every test maps back to a requirement
- `traceability-excel-export.md` skill drives Excel report generation with requirement-to-test mapping
- Built into the framework — not bolted on as an afterthought

---

## 11. Hybrid Execution Framework (Python + TypeScript)

- Python backend handles all AI generation (MCP servers, services, utilities)
- TypeScript/Playwright/Cucumber frontend handles test execution

**TypeScript-side intelligence:**
- `aiLocatorService.ts` — AI-powered locator healing when selectors break
- `rcaDataCapture.ts` — Root cause analysis data capture on failures
- `browserstackRestApi.ts` — BrowserStack session management
- `compatibilityTestManager.ts` — Cross-browser compatibility orchestration
- `networkLoggingManager.ts` — Network traffic logging and analysis

A single Copilot workflow spans both layers — from story fetch to test execution — seamlessly.

---

## 12. Orchestrated Multi-Phase Pipelines with Validation Gates

Complex tasks are split into coordinated sub-agents with mandatory validation checkpoints:

**Example — Locator Generation Pipeline:**
```
page-objects-generator (Complete Pipeline):
  Phase 0: Clean workspace
  Phases 1-3: Fetch HTML → Clean DOM → Chunk
         ↓ [Validation: all chunks created]
  Phase 4: Generate YAML locators per chunk with comprehensive fallback strategies
         ↓ [Validation: all chunk YAMLs exist]
  Phases 5-7: Smart merge → Repair → Validate → Cleanup
         ↓
Final YAML locator file (backup-safe, deduplicated, validated)
```

- Validation gates between phases prevent partial or corrupt outputs
- Backup-safe operations — original files backed up before replacement
- Copilot doesn't just answer questions — it **executes multi-phase pipelines** with checkpoints

---

## Summary — FusionIQ vs. Vanilla GitHub Copilot

| Capability | Vanilla GitHub Copilot | FusionIQ on Copilot |
|-----------|----------------------|---------------------|
| Test generation | Generic, ad-hoc | Structured, STLC-specific agents |
| Domain knowledge | None | 20+ Skills files injected per task |
| Framework awareness | None | Live MCP context from codebase |
| Requirement source | Manual paste | Automated Jira/Confluence MCP fetch |
| Output validation | None | 5-layer auto-validate + auto-fix |
| Test prioritization | None | AI multi-factor scoring (85-95% reduction) |
| Video understanding | None | Frame-by-frame extraction to test artifacts |
| Behavioral guardrails | None | Global instructions enforced across all agents |
| Fallback resilience | None | Multi-tier fallback chains, hard stops |
| Multi-step pipelines | Single-turn chat | Coordinated phased pipelines with gates |
| Traceability | None | Full STLC chain: Story → Execution |
| Execution layer | None | TypeScript/Playwright with AI locator healing |
