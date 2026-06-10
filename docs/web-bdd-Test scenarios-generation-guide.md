# 🚀 QUICK START: Web BDD Test Case Generation

## 🤖 Agent Information

**Agent Mode**: `web-BDD_Testscenarios-gen`  
**Agent File**: `.github/agents/web-BDD_Testscenarios-gen.agent.md`  
**Activation**: Use `@web-BDD_Testscenarios-gen` prefix in your Copilot prompts

### How to Activate This Agent

```
@web-BDD_Testscenarios-gen [Your Prompt]
```

**Example:**
```
@web-BDD_Testscenarios-gen Generate BDD test cases for POCTC-56
```

## Overview
The **Web BDD Test Case Generator** agent automatically generates comprehensive Gherkin test scenarios by:
1. Fetching user stories from Jira (using Atlassian MCP)
2. Loading application context from MCP Context Server
3. Generating parameterized BDD scenarios with real test data
4. Saving feature files to `data/testcases/GenAI_generated/`

---

## 🎯 3 Sample Prompts for Copilot

### **Prompt 1: Basic BDD Generation (Single Story)**
Use this for generating BDD test cases for a single user story:

```
@web-BDD_Testscenarios-gen Generate BDD test cases for POCTC-56
```

**What happens:**
- Reads story from `data/stories/JIRA_POCTC-56.txt`
- Fetches application context, domain model, and business rules from MCP Context Server
- Generates Gherkin scenarios with:
  - Positive flows (happy path)
  - Negative flows (validation errors)
  - Edge cases (boundary values)
  - Data-driven scenarios using Scenario Outline with Examples
  - Real test data from application context
- Saves to `data/testcases/GenAI_generated/POCTC-56_bdd.feature`

**Expected Output:**
```
✅ Story loaded: POCTC-56
✅ Application context fetched from MCP
✅ Domain model loaded
✅ Business rules applied
✅ Generated 10 scenarios (8 parameterized, 2 simple)
✅ Saved: data/testcases/GenAI_generated/POCTC-56_bdd.feature
```

---

### **Prompt 2: BDD Generation with Jira Fetch**
Use this when you need to fetch the story from Jira first:

```
@web-BDD_Testscenarios-gen Fetch story POCTC-57 from Jira and generate BDD test cases
```

**What happens:**
- Uses Atlassian MCP to fetch story POCTC-57 from Jira
- Saves story to `data/stories/JIRA_POCTC-57.txt`
- Fetches application context from MCP Context Server:
  - `data/context/application/ecommerce_application_context.txt`
  - `data/context/domain/ecommerce_domain_model.txt`
  - `data/context/business_rules/ecommerce_business_rules.txt`
- Generates comprehensive BDD scenarios
- Saves feature file

**Expected Output:**
```
✅ Story POCTC-57 fetched from Jira
✅ Saved: data/stories/JIRA_POCTC-57.txt
✅ MCP context loaded (application, domain, business rules)
✅ Generated 12 scenarios with real e-commerce data
✅ Saved: data/testcases/GenAI_generated/POCTC-57_bdd.feature
```

---

### **Prompt 3: Batch BDD Generation (Multiple Stories)**
Use this for generating BDD test cases for multiple stories at once:

```
@web-BDD_Testscenarios-gen Generate BDD test cases for stories: POCTC-56, POCTC-57, POCTC-58
```

**What happens:**
- Loads all 3 stories from `data/stories/`
- Fetches shared application context once (optimization)
- Generates separate feature files for each story
- Uses real test data consistently across all scenarios
- Creates batch summary

**Expected Output:**
```
✅ Batch processing 3 stories...
✅ POCTC-56: 10 scenarios generated
✅ POCTC-57: 12 scenarios generated  
✅ POCTC-58: 9 scenarios generated
✅ Total: 31 scenarios across 3 feature files
✅ All files saved to data/testcases/GenAI_generated/
```

---

## 📋 Sample Output (.feature file)

After running any of the prompts above, you'll get a feature file like this:

---

## 📋 Example Output (.feature file)

```gherkin
Feature: Product Browsing
  As a customer
  I want to browse products
  So that I can find items to purchase

  Scenario: Browse by category
    Given I am on the home page
    When I click on "Clothes"
    Then I should see products in Clothes category
    
  Scenario Outline: View product with discount
    Given I view product "<product>"
    Then I should see price "<original>" with strikethrough
    And I should see discounted price "<final>"
    
    Examples:
      | product                    | original | final   |
      | Hummingbird Printed T-Shirt| ₹23.90  | ₹19.12  |
      | Hummingbird Printed Sweater| ₹35.90  | ₹28.72  |
```


## ✅ Success Checklist

After running the agent, verify:
- [ ] Story file exists: `data/stories/JIRA_{STORY_ID}.txt` (if fetched from Jira)
- [ ] Feature file created: `data/testcases/GenAI_generated/{STORY_ID}_bdd.feature`
- [ ] Scenarios use real application data (not placeholders like "Product1", "Item1")
- [ ] Business rules from context are validated
- [ ] Valid Gherkin syntax (no asterisks, proper indentation)
- [ ] Examples tables included with 3+ rows of real test data
- [ ] 80%+ scenarios are parameterized (Scenario Outline)
- [ ] Proper tags applied (@positive, @negative, @edge-case, etc.)

---

## 🎓 Tips for Best Results

### ✅ DO:
- Use the `@web-BDD_Testscenarios-gen` agent tag to activate the specialized mode
- Ensure story file exists in `data/stories/` before generating (or include "Fetch from Jira")
- Let the agent fetch context from MCP automatically
- Review generated scenarios and customize if needed

### ❌ DON'T:
- Don't manually specify MCP context paths in prompts (agent handles this)
- Don't create stories manually - use Jira fetch or proper format
- Don't expect instant results for large batches (3+ stories take time)

---

## 🔧 Troubleshooting

**Issue**: "Story file not found"
- **Solution**: Use Prompt 2 to fetch from Jira first, or verify `data/stories/JIRA_{STORY_ID}.txt` exists

**Issue**: "No context available"
- **Solution**: Ensure MCP Context Server is running and context files exist in `data/context/`

**Issue**: "Generated scenarios use placeholder data"
- **Solution**: Check that context files have real application data, not generic examples

---

## 📖 Additional Resources

- **Full Agent Configuration**: `.github/agents/web-BDD_Testscenarios-gen.agent.md`
- **BDD Workflow**: `.github/workflows/BDD_GENERATION_WORKFLOW.md`
- **Gherkin Syntax**: https://cucumber.io/docs/gherkin/reference
- **Test Design Techniques**: `.github/prompts/Testdesign_techniques.md`

---

## 🚀 Next Steps After Generation

1. **Review** generated feature file for accuracy
2. **Customize** scenarios with domain-specific details
3. **Generate Step Definitions** using `@web-step-definitions-gen` agent
4. **Execute Tests** using your test framework (Cucumber, Playwright, etc.)
5. **Update** test data in context files for future generations
