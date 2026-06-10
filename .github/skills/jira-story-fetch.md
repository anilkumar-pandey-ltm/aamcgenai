---
name: jira-story-fetch
description: Mandatory guideline for fetching JIRA stories via MCP Atlassian server before processing. Prohibits inferring stories from local files; defines Tier 1 (MCP) and Tier 2 (jira_service.py) fetch strategies with fallback handling.
---

# JIRA Story Fetch via MCP (mcp-atlassian)

**Reusable guideline for any agent that needs to auto-fetch a JIRA story before processing.**

---

## 🚫 ABSOLUTE PROHIBITION

> **NEVER reconstruct, infer, or fabricate a story from workspace context, file names, page objects, or any other local artefacts.**
> A story MUST be fetched from JIRA via the Atlassian MCP server (Tier 1) or `jira_service.py` (Tier 2 fallback).
> If both methods fail, **STOP** and ask the user to resolve the connectivity issue — do not proceed with generation.

---

## Prerequisites: Atlassian MCP Server

The Atlassian MCP server **is already configured** in the global `mcp.json` at `%APPDATA%\Code\User\mcp.json`:
```json
{
  "servers": {
    "atlassian": {
      "type": "stdio",
      "command": "uvx",
      "args": ["mcp-atlassian"],
      "env": {
        "JIRA_URL": "<your-jira-url>",
        "JIRA_USERNAME": "<your-email>",
        "JIRA_API_TOKEN": "<your-api-token>"
      }
    }
  }
}
```
> ℹ️ The atlassian server is defined at the **global level**. To view or edit it: `Ctrl+Shift+P` → `Preferences: Open User MCP Configuration`.

### Start / Verify the Server — MANDATORY BEFORE ANY FETCH

If the `atlassian` MCP tools are not responding, **attempt to start the server** before falling back or stopping:

| Priority | Method | Steps |
|----------|--------|-------|
| **1st** | **Auto-invoke** | Simply call any `atlassian/atlassian-mcp-server/*` tool — VS Code will auto-start `uvx mcp-atlassian` |
| **2nd** | **MCP Panel restart** | Open VS Code MCP panel → find `atlassian` → click **Restart** |
| **3rd** | **Reload window** | `Ctrl+Shift+P` → `Developer: Reload Window`, then retry tool call |
| **4th** | **CLI verify** | Run `uvx mcp-atlassian --help` — confirms `uvx` and package are installed |

> ⚠️ **Do NOT skip to Tier 2 on the very first attempt.** Always retry Tier 1 after attempting a server restart (steps 2 or 3) before falling back to `jira_service.py`.

**Tool naming convention** (after server is active):
```
atlassian/atlassian-mcp-server/{toolName}
Examples:
  atlassian/atlassian-mcp-server/getJiraIssue
  atlassian/atlassian-mcp-server/searchJiraIssuesUsingJql
  atlassian/atlassian-mcp-server/getAccessibleAtlassianResources
```

---

## When to Use This Skill

Apply this pattern at the start of any agent workflow that accepts a Story ID as input:
- `web-BDD_Testscenarios-gen` — BDD test case generation
- `web-Traditional-Testcases-gen` — Traditional test case generation
- `web-traditional-test-scripts-gen` — Test script generation
- `web-step-definitions-generator` — Step definition generation
- Any future agent that processes JIRA stories

---

## Step 0: Auto-Fetch Story from JIRA

### Path Resolution (MUST DO FIRST)

Read `copilot-agent.paths.yaml` and resolve the stories directory:
```yaml
data_paths:
  stories: "data/stories"   # ← use this as {STORIES_PATH}
```
> All story file references must use `{STORIES_PATH}` — never hardcode the path.

---

### Decision Logic

> ⚡ **SEQUENTIAL MANDATE**: The story file MUST be fetched from JIRA **AND saved to `{STORIES_PATH}/`** before any test case generation begins. These are hard prerequisites — do NOT start generating BDD scenarios, test scripts, or step definitions until the story file exists on disk and has been read.

```
0a. Read copilot-agent.paths.yaml → resolve {STORIES_PATH} = data_paths.stories
Story ID provided?
├─ YES → Check {STORIES_PATH}/JIRA_{STORY_ID}.txt
│         ├─ EXISTS → Read file content fully → PROCEED TO TEST CASE GENERATION
│         └─ NOT FOUND → MUST fetch from JIRA first (do NOT skip to generation):
│
│               ┌─ TIER 1 (MANDATORY PRIMARY) — Atlassian MCP Server ─────────────┐
│               │  1. Call atlassian/atlassian-mcp-server/getJiraIssue             │
│               │  ├─ SUCCESS → Save to {STORIES_PATH}/JIRA_{STORY_ID}.txt        │
│               │  │           → Confirm save → PROCEED TO TEST CASE GENERATION  │
│               │  └─ FAIL / UNAVAILABLE:                                          │
│               │       a. Attempt server restart (MCP Panel → Restart atlassian)  │
│               │       b. Retry getJiraIssue call                                 │
│               │       ├─ RETRY SUCCESS → Save file → PROCEED TO TEST GENERATION │
│               │       └─ RETRY FAILS → Fall through to Tier 2                   │
│               └───────────────────────────────────────────────────────────────── ┘
│
│               ┌─ TIER 2 (FALLBACK ONLY) — jira_service.py ─────────────────────┐
│               │  Use Python inline via JiraService HTTP session                  │
│               │  ├─ SUCCESS → Save to {STORIES_PATH}/JIRA_{STORY_ID}.txt        │
│               │  │           → Confirm save → PROCEED TO TEST CASE GENERATION  │
│               │  └─ FAIL → STOP. Report error. Ask user to fix connectivity.     │
│               │  ❌ DO NOT proceed to generation without a real fetched story.   │
│               └───────────────────────────────────────────────────────────────── ┘
│
│               ❌ NEVER reconstruct story from workspace files, page objects,
│                  locator YAMLs, page action TypeScript files, or any other
│                  local artefacts. This is strictly prohibited.
│
└─ NO → Ask user for Story ID
```

---

### TIER 1 — Primary Fetch via Atlassian MCP Server *(MANDATORY)*

**Step 1 — Attempt tool call** — `atlassian/atlassian-mcp-server/getJiraIssue`:
```
Tool: getJiraIssue
Parameters:
  issue_key: "{STORY_ID}"   (e.g., "POCTC-55")
  fields: "*all"
```

**Step 1b — If tool call fails:** attempt to start/restart the atlassian MCP server:
1. Open VS Code MCP panel → click **Restart** next to `atlassian`  
   OR run `Ctrl+Shift+P` → `Developer: Reload Window`
2. Retry the `getJiraIssue` call

> Only fall through to **TIER 2** after both the initial call AND the post-restart retry have failed.

**2. Extract Fields** from the response:
| Response Field | Maps To |
|---|---|
| `summary` | Story Title |
| `description` | Full description text |
| `status.name` | Current status |
| `priority.name` | Priority |
| `issuetype.name` | Type (Story/Bug/Task) |
| `assignee.displayName` | Assignee |
| `reporter.displayName` | Reporter |
| `created` / `updated` | Dates |
| `self` | URL |

**3. Save story file** to `{STORIES_PATH}/JIRA_{STORY_ID}.txt` using this standard format:
```
=== STORY METADATA ===
Source: Jira
Story ID: {STORY_ID}
Title: {summary}
Type: {issuetype.name}
Status: {status.name}
Priority: {priority.name}
Assignee: {assignee.displayName}
Reporter: {reporter.displayName}
Created: {created}
Updated: {updated}
URL: {self URL}

=== DESCRIPTION ===
{description}

=== ACCEPTANCE CRITERIA ===
{acceptance criteria extracted from description}

=== DEFINITION OF DONE ===
{DoD items extracted from description, if present}

=== TECHNICAL DETAILS ===
{Any technical notes from description or fields}
```

**4. Confirm save and proceed to generation:**
> ✅ Story `{STORY_ID}` fetched from JIRA via MCP and saved to `{STORIES_PATH}/JIRA_{STORY_ID}.txt`

> ⏩ **NEXT ACTION**: Story file is now on disk. Read the saved file fully, then proceed **immediately** to test case generation (STEP 1 of the agent workflow). Do NOT pause or re-fetch.

---

### TIER 2 — Fallback Fetch via `jira_service.py`

**When to use**: Only when Tier 1 (Atlassian MCP) is unavailable, times out, or returns an error.

**How it works**: Use Python inline execution to call the JIRA REST API directly through `JiraService`'s configured HTTP session (credentials come from `config.json` → `mcp.jira_url` + `mcp.jira_token`).

**Inline execution command**:
```powershell
python -c "
import asyncio, json, sys
from src.mcp.jira_service import JiraService

async def fetch_issue(story_id):
    service = JiraService()
    if not service.session:
        print('ERROR: JIRA not configured. Set mcp.jira_url and mcp.jira_token in config.json')
        return None
    url = f'{service.base_url}/rest/api/3/issue/{story_id}'
    async with service.session.get(url, params={'fields': '*all'}) as r:
        if r.status == 200:
            data = await r.json()
            print(json.dumps(data))
        elif r.status == 404:
            print(f'ERROR: Story {story_id} not found in JIRA (404)')
        elif r.status == 401:
            print('ERROR: JIRA authentication failed. Verify mcp.jira_token in config.json')
        else:
            print(f'ERROR: HTTP {r.status}')

asyncio.run(fetch_issue('{STORY_ID}'))
"
```

**Field mapping from REST API response** (same as Tier 1):
| JSON Path | Maps To |
|---|---|
| `fields.summary` | Story Title |
| `fields.description` | Full description text |
| `fields.status.name` | Current status |
| `fields.priority.name` | Priority |
| `fields.issuetype.name` | Type (Story/Bug/Task) |
| `fields.assignee.displayName` | Assignee |
| `fields.reporter.displayName` | Reporter |
| `fields.created` / `fields.updated` | Dates |
| `self` | URL |

> After parsing the JSON output, save the story file to `{STORIES_PATH}/JIRA_{STORY_ID}.txt` using the same standard format as Tier 1.

**4. Confirm save and proceed to generation:**
> ✅ Story `{STORY_ID}` fetched via jira_service.py (MCP fallback) and saved to `{STORIES_PATH}/JIRA_{STORY_ID}.txt`

> ⏩ **NEXT ACTION**: Story file is now on disk. Read the saved file fully, then proceed **immediately** to test case generation (STEP 1 of the agent workflow). Do NOT pause or re-fetch.

---

### Alternative — Search by JQL (if exact ID unknown)

**Tier 1 (MCP)**:
```
Tool: searchJiraIssuesUsingJql
Parameters:
  jql: "project = {PROJECT} AND summary ~ '{keyword}' ORDER BY created DESC"
  fields: "summary,description,status,priority,issuetype,assignee"
  limit: 10
```

**Tier 2 (jira_service.py fallback)**:
```powershell
python -c "
import asyncio, json
from src.mcp.jira_service import JiraService

async def search(project, keyword):
    service = JiraService()
    if not service.session:
        print('ERROR: JIRA not configured'); return
    jql = f'project = {project} AND summary ~ \"{keyword}\" ORDER BY created DESC'
    url = f'{service.base_url}/rest/api/3/search'
    params = {'jql': jql, 'maxResults': 10, 'fields': 'key,summary,description,status,priority,issuetype,assignee'}
    async with service.session.get(url, params=params) as r:
        if r.status == 200:
            print(json.dumps(await r.json()))
        else:
            print(f'ERROR: HTTP {r.status}')

asyncio.run(search('{PROJECT}', '{keyword}'))
"
```

---

### Error Handling

| Error | Tier 1 Action | Tier 2 Action |
|---|---|---|
| Story not found (404) | Report: "Story `{STORY_ID}` not found." — **STOP** | Same — STOP, do not proceed |
| MCP server unavailable | Restart server (MCP Panel / Reload Window) → retry | Activate only after restart+retry both fail |
| Auth failure (401) | Restart server → retry | "JIRA auth failed. Verify `mcp.jira_token` in `config.json`." |
| Both tiers fail | — | **STOP. Do NOT reconstruct from workspace. Ask user to fix MCP connectivity.** |

> ❌ **STRICTLY FORBIDDEN**: Creating, inferring, or reconstructing a story file from workspace files (page objects, YAML locators, TypeScript page actions, or any other local source). Always fetch from JIRA.

---

## Story File Cache Policy

- **Always check cache first** before calling JIRA — avoids redundant API calls
- **Cache location**: `{STORIES_PATH}/JIRA_{STORY_ID}.txt` (from `copilot-agent.paths.yaml` → `data_paths.stories`)
- **Cache is permanent** — files are not deleted automatically; re-fetch only if user explicitly requests a refresh
- **File naming convention**: `JIRA_{PROJECT}-{NUMBER}.txt` (e.g., `JIRA_POCTC-55.txt`)

---

## ⚡ Sequential Workflow Guarantee

The following order is **non-negotiable** for every agent that uses this skill:

```
1. CHECK  → Does {STORIES_PATH}/JIRA_{STORY_ID}.txt exist?
              YES → Read file → go to step 3
              NO  → go to step 2

2. FETCH  → Retrieve story from JIRA (Tier 1 MCP → Tier 2 fallback)
            SAVE  → Write fetched content to {STORIES_PATH}/JIRA_{STORY_ID}.txt
            VERIFY→ Confirm file was written successfully
            ⚠️  If fetch fails → STOP. Do NOT skip to generation.

3. GENERATE → Only now start test case / BDD scenario generation
              Use the saved story file as the sole source of truth
```

> ❌ **FORBIDDEN SHORTCUT**: Skipping step 2 (fetch + save) and jumping directly to generation when the story file is absent. The story file on disk is the gate — generation cannot begin without it.
