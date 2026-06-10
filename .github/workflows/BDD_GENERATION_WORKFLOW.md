# BDD Test Case Generation Workflow with MCP Context
## Streamlined 2-Step Process for Generating BDD Test Cases

---

## Overview
Generate comprehensive BDD test cases from Jira requirements using MCP context servers for application, domain, and business rules.

---

## Prerequisites

### ✅ What You Need
1. **Jira Story ID** (User provides: e.g., POCTC-56, PROJ-123, etc.)
2. **MCP Servers Active**:
   - **Atlassian MCP** — configured via `uvx mcp-atlassian` in `.vscode/mcp.json`
     > VS Code auto-starts it. If tools aren't responding, open the MCP panel and restart the `atlassian` server.
   - **MCP Context Server** — for application/domain/business rules context
3. **Prompt Files**:
   - `Testscenarios_gen.md`
   - `Testdesign_techniques.md`

---


## 🔄 Streamlined Workflow (2 Steps)

### **STEP 1: Fetch Requirements from Jira**
**Purpose**: Retrieve story details from Jira

**Prompt Template** (Replace `{STORY_ID}` with your story):
```
Fetch story {STORY_ID} from Jira and save to data/stories/
```

**Example**:
```
Fetch story POCTC-56 from Jira and save to data/stories/
```

**What Copilot Does**:
- Gets Cloud ID: `atlassian/atlassian-mcp-server/getAccessibleAtlassianResources`
- Fetches issue: `atlassian/atlassian-mcp-server/getJiraIssue`
- Saves to: `data/stories/JIRA_{STORY_ID}.txt`

**Output**:
```
✅ Fetched {STORY_ID}: [Story Title]
📄 Saved to: data/stories/JIRA_{STORY_ID}.txt
```

---

### **STEP 2: Generate BDD Test Cases with Context**
**Purpose**: Generate comprehensive BDD scenarios using application context

**Prompt Template** (Replace `{STORY_ID}` with your story):
```
Generate BDD test cases for {STORY_ID}.

1. Read story from: data/stories/JIRA_{STORY_ID}.txt

2. Get application context using MCP:
   - mcp_mcp-context-s_get_file_info: ../../data/context/application/ecommerce_application_context.txt
   - mcp_mcp-context-s_get_file_info: ../../data/context/domain/ecommerce_domain_model.txt
   - mcp_mcp-context-s_get_file_info: ../../data/context/business_rules/ecommerce_business_rules.txt

3. Use prompts:
   - .github/prompts/Testscenarios_gen.md (BDD format)
   - .github/prompts/Testdesign_techniques.md (coverage)

4. Generate PARAMETERIZED Gherkin scenarios:
   - CRITICAL: MINIMUM 80% scenarios MUST use Scenario Outline with Examples
   - Positive flows: Scenario Outline with 3+ products from context
   - Negative flows: Scenario Outline with 3+ error conditions
   - Edge cases: Scenario Outline with boundary values
   - Business rules: Scenario Outline with different calculation scenarios
   - Use REAL test data from context in Examples tables (ALL products, prices, categories)
   - Each Examples table MUST have minimum 3 rows
   - Avoid hardcoded values - parameterize everything

5. Save to: data/testcases/GenAI_generated/{STORY_ID}_bdd.feature
```

**Example**:
```
Generate BDD test cases for POCTC-56.

1. Read story from: data/stories/JIRA_POCTC-56.txt

2. Get application context using MCP:
   - mcp_mcp-context-s_get_file_info: ../../data/context/application/ecommerce_application_context.txt
   - mcp_mcp-context-s_get_file_info: ../../data/context/domain/ecommerce_domain_model.txt
   - mcp_mcp-context-s_get_file_info: ../../data/context/business_rules/ecommerce_business_rules.txt

3. Use prompts:
   - .github/prompts/Testscenarios_gen.md (BDD format)
   - .github/prompts/Testdesign_techniques.md (coverage)

4. Generate Gherkin scenarios:
   - Positive flows (happy path)
   - Negative flows (error handling)
   - Edge cases (boundary values)
   - Data-driven scenarios with Examples tables
   - Use REAL test data from context (product names, prices, categories)

5. Save to: data/testcases/GenAI_generated/POCTC-56_bdd.feature
```

**What Copilot Does**:
- Reads story file
- Fetches all 3 context files via MCP
- Loads prompt templates
- Applies test design techniques
- Generates comprehensive BDD scenarios
- Uses real application data
- Saves .feature file

**Output**:
```
✅ Generated: data/testcases/GenAI_generated/{STORY_ID}_bdd.feature
📊 Coverage:
   - Positive: X scenarios
   - Negative: Y scenarios
   - Edge Cases: Z scenarios
   Total: N scenarios
```

---

## 🎯 Quick Command Templates

### **Single Story**
```
Step 1: Fetch story {STORY_ID} from Jira
Step 2: Generate BDD test cases for {STORY_ID} [use full prompt from above]
```

### **Multiple Stories**
```
Generate BDD test cases for stories: {STORY_ID_1}, {STORY_ID_2}, {STORY_ID_3}

For each story:
1. Fetch from Jira
2. Get application context via MCP
3. Generate BDD scenarios
4. Save to data/testcases/GenAI_generated/{STORY_ID}_bdd.feature
```

**Example**:
```
Generate BDD test cases for stories: POCTC-56, POCTC-1, PROJ-123

For each story:
1. Fetch from Jira
2. Get application context via MCP
3. Generate BDD scenarios
4. Save to data/testcases/GenAI_generated/{STORY_ID}_bdd.feature
```

---

## 📂 File Structure

```
project/
├── data/
│   ├── stories/
│   │   └── JIRA_{STORY_ID}.txt          ← Step 1 output
│   ├── testcases/
│   │   └── GenAI_generated/
│   │       └── {STORY_ID}_bdd.feature   ← Step 2 output
│   └── context/                         ← MCP reads from here
│       ├── application/
│       │   └── ecommerce_application_context.txt
│       ├── domain/
│       │   └── ecommerce_domain_model.txt
│       └── business_rules/
│           └── ecommerce_business_rules.txt
└── .github/
    └── prompts/
        ├── Testscenarios_gen.md
        ├── Testdesign_techniques.md
        └── BDD_GENERATION_WORKFLOW.md
```

---

## � Usage Examples

### Example 1: Single Story
```
User Story: POCTC-56

Step 1: Fetch story POCTC-56 from Jira

Step 2: Generate BDD test cases for POCTC-56.
        [Use full prompt template from Step 2 above]
```

### Example 2: Different Story
```
User Story: PROJ-789

Step 1: Fetch story PROJ-789 from Jira

Step 2: Generate BDD test cases for PROJ-789.
        [Use full prompt template from Step 2 above]
```

### Example 3: Multiple Stories
```
Generate BDD test cases for: POCTC-56, POCTC-1, PROJ-123

For each story:
1. Fetch from Jira
2. Get context via MCP  
3. Generate BDD scenarios using prompts
4. Save .feature file
```

---

## ✅ Success Checklist

After both steps:
- [ ] Story file exists: `data/stories/JIRA_{STORY_ID}.txt`
- [ ] Feature file exists: `data/testcases/GenAI_generated/{STORY_ID}_bdd.feature`
- [ ] **MINIMUM 80% scenarios are Scenario Outline (not hardcoded)**
- [ ] **Each Examples table has 3+ rows with real test data**
- [ ] Scenarios use real application data from context (product names, prices, categories)
- [ ] Business rules are validated with parameterized scenarios
- [ ] Valid Gherkin syntax
- [ ] All products/categories from context appear in Examples tables
- [ ] Positive, negative, and edge cases covered with data-driven approach

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| MCP Context Not Loading | Verify: `mcp_mcp-context-s_scan_workspace()` |
| Story Not Found | Check Cloud ID: `atlassian/atlassian-mcp-server/getAccessibleAtlassianResources` |
| Generic Scenarios | Add: "Use actual product names, prices from context" |
| Missing Business Rules | Add: "Include scenarios to validate business rules from context" |

---

## 📊 Token Optimization

This 2-step workflow saves tokens by:
- ✅ Eliminating separate analysis step
- ✅ Fetching context only when generating tests
- ✅ Combining all MCP calls in Step 2
- ✅ Using parameterized templates (not fixed story IDs)

---

**Remember**: Replace `{STORY_ID}` with your actual story ID in all prompts!
