---
name: video-output-validation
description: Quality assurance checks and validation criteria for video analysis outputs. Includes metrics, validation by task type, and quality indicators for test cases, defects, user stories, and BDD scenarios.
---

# Video Output Validation

## Purpose
Systematic validation of video analysis outputs to ensure quality, completeness, and actionable content across all task types.

---

## ✅ Post-Processing Validation Workflow

### **1. Verify File Creation**

```powershell
# Check output file exists
Test-Path "Output/video_analysis_output/demo_test_case_analysis.md"

# Verify file size (should be > 1KB for meaningful content)
(Get-Item "Output/video_analysis_output/demo_test_case_analysis.md").Length -gt 1024
```

**Checks:**
- ✅ File created successfully
- ✅ File size indicates substantial content (> 1KB)
- ✅ File has correct extension (.md, .json, .yaml, .xml, .xlsx, .csv)
- ✅ Naming convention followed: `{video_name}_{task_type}_analysis.{ext}`

---

### **2. Review Content Structure**

**Standard Documents (MD/JSON/YAML/XML):**
1. ✅ **Header** - Metadata (video name, duration, processing stats, timestamp)
2. ✅ **Executive Summary** - High-level overview
3. ✅ **Main Analysis** - Task-specific content
4. ✅ **Recommendations** - Integration guidance and next steps
5. ✅ **Appendix** - Technical details (frames analyzed, timestamps, metadata)

**E2E Test Cases (Excel/CSV):**
- ✅ All 12 columns present
- ✅ Test case IDs unique and sequential
- ✅ Each technique represented (12 standard techniques)
- ✅ Proper Excel formatting (headers, borders, filters)

---

### **3. Validate Processing Statistics**

```json
{
  "success": true,
  "video_duration": 120.5,        // Reasonable duration
  "frames_analyzed": 30,           // Based on quality setting
  "processing_time": 45.3,         // Not timing out
  "confidence_score": 0.85,        // High confidence (>0.7)
  "content_length": 5432           // Substantial content
}
```

**Validation Rules:**
| Metric | Expected | Warning Threshold | Issue Threshold |
|--------|----------|-------------------|-----------------|
| `success` | `true` | N/A | `false` |
| `video_duration` | > 0 | < 5s (too short) | 0 or negative |
| `frames_analyzed` | > 10 | 5-10 frames | < 5 frames |
| `processing_time` | < 120s | 120-300s | > 300s (timeout) |
| `confidence_score` | > 0.8 | 0.6-0.8 | < 0.6 |
| `content_length` | > 2000 chars | 500-2000 | < 500 |

---

### **4. Quality Indicators**

| Metric | Good ✅ | Warning ⚠️ | Issue ❌ |
|--------|---------|-----------|---------|
| **File size** | > 5KB | 1-5KB | < 1KB |
| **Processing time** | < 2 min | 2-5 min | > 5 min |
| **Frames analyzed** | > 10 | 5-10 | < 5 |
| **Confidence score** | > 0.8 | 0.6-0.8 | < 0.6 |
| **Content completeness** | 100% | 80-99% | < 80% |

---

## 📋 Content Validation by Task Type

### **Test Case Validation**

**Required Elements:**
- ✅ Test scenario names present
- ✅ Preconditions listed
- ✅ Numbered test steps (sequential)
- ✅ Expected results defined for each step
- ✅ Timestamps included (if enabled)
- ✅ Test data requirements specified
- ✅ Pass/Fail criteria clear

**Structure Check:**
```markdown
## Test Case: TC-001
**Preconditions**: ...
**Test Steps**:
  1. Step description → Expected: ...
  2. Step description → Expected: ...
**Timestamps**: [00:12], [00:45]
```

**Quality Criteria:**
- Steps are clear and actionable
- Expected results are specific and measurable
- Preconditions are complete
- No ambiguous language ("should work", "might", etc.)

---

### **E2E Test Case Validation (Excel)**

**12 Required Columns:**
1. ✅ `test_case_id` - Unique ID (e.g., TC_E2E_DATA_ENTRY_001)
2. ✅ `e2e_flow_name` - Business scenario name
3. ✅ `business_scenario` - Detailed description
4. ✅ `user_role` - Actor performing test
5. ✅ `module` - System component
6. ✅ `pre_conditions` - Setup requirements (array)
7. ✅ `test_data` - Input values (object)
8. ✅ `test_steps` - Detailed actions (array)
9. ✅ `expected_output` - Success criteria
10. ✅ `test_design_technique` - Methodology used
11. ✅ `priority` - Critical/High/Medium/Low
12. ✅ `coverage_tag` - UI | API | DB

**12 Standard Test Design Techniques (Must be present):**
1. Happy Path Testing
2. Negative Testing
3. Boundary Value Analysis
4. Equivalence Partitioning
5. Decision Table Testing
6. State Transition Testing
7. Error Handling & Recovery
8. Role-Based Access Control
9. Integration Testing
10. Session Management
11. Cross-Browser Compatibility
12. Data Persistence & Concurrency

**Quality Checks:**
- Each technique represented with at least 1 test case
- Test case IDs follow naming convention
- Pre-conditions are complete and realistic
- Test steps are detailed and executable
- Expected outputs are specific
- Priority reflects business criticality

---

### **Defect Validation**

**Required Elements:**
- ✅ Defect ID and title
- ✅ Severity classification (Critical/High/Medium/Low)
- ✅ Reproduction steps (detailed, numbered)
- ✅ Impact assessment (user/business/system)
- ✅ Expected vs Actual behavior
- ✅ Suggested solutions or workarounds
- ✅ Screenshots/timestamps references
- ✅ Environment details

**Structure Check:**
```markdown
## Defect: DEF-001 - [Title]
**Severity**: High
**Impact**: User unable to complete checkout

**Reproduction Steps**:
  1. Navigate to ...
  2. Click on ...
  3. Observe error ...

**Expected**: ...
**Actual**: ...
**Suggested Fix**: ...
**Timestamp**: [01:23]
```

**Quality Criteria:**
- Reproduction steps are clear and complete
- Severity matches impact assessment
- Root cause analysis provided (when possible)
- Audio context included (if available)

---

### **User Story Validation**

**Required Elements:**
- ✅ Story title and ID
- ✅ Persona definition (role, context, needs)
- ✅ "As a... I want... So that..." format
- ✅ Acceptance criteria (clear, testable)
- ✅ Definition of done
- ✅ Business value statement
- ✅ Dependencies (if any)
- ✅ Priority/Story points (optional)

**Structure Check:**
```markdown
## User Story: US-001 - [Title]
**As a** [persona]
**I want** [feature/capability]
**So that** [business value]

**Acceptance Criteria**:
  - [ ] Criterion 1
  - [ ] Criterion 2

**Definition of Done**: ...
**Business Value**: ...
```

**Quality Criteria:**
- Persona is realistic and specific
- Goal is clear and achievable
- Business value is articulated
- Acceptance criteria are SMART (Specific, Measurable, Achievable, Relevant, Time-bound)

---

### **BDD Scenario Validation**

**Required Elements:**
- ✅ Feature declaration
- ✅ Scenario with Given/When/Then
- ✅ Proper Gherkin syntax
- ✅ Scenario Outline with Examples (for data-driven tests)
- ✅ Background section (if shared setup)
- ✅ Tags for categorization
- ✅ Clear, testable steps

**Structure Check:**
```gherkin
Feature: [Feature name]

  Background:
    Given common preconditions

  @smoke @regression
  Scenario: [Scenario name]
    Given [precondition]
    When [action]
    Then [expected result]
    And [additional verification]

  Scenario Outline: [Data-driven scenario]
    Given user enters "<input>"
    When action is performed
    Then result should be "<output>"

    Examples:
      | input | output |
      | val1  | res1   |
      | val2  | res2   |
```

**Quality Criteria:**
- Gherkin syntax is valid (no syntax errors)
- Steps are declarative, not imperative
- Scenarios are independent and isolated
- Examples table has sufficient coverage
- Tags are meaningful and consistent

**See**: `.github/skills/bdd-gherkin-patterns.md` for detailed Gherkin best practices

---

## 🎯 Success Criteria Summary

| Task Type | Min File Size | Min Content Length | Key Indicators |
|-----------|---------------|-------------------|----------------|
| **test_case** | 2KB | 1000 chars | ≥ 3 test cases, clear steps |
| **e2e_testcase** | 10KB (Excel) | N/A | 12 techniques, all columns |
| **defect** | 1KB | 500 chars | Reproduction steps, severity |
| **user_story** | 1KB | 500 chars | As-I-So format, acceptance criteria |
| **bdd** | 1KB | 500 chars | Valid Gherkin, Given/When/Then |

---

## 🚨 Common Issues & Fixes

| Issue | Symptom | Fix |
|-------|---------|-----|
| **Empty output** | File < 500 bytes | Re-run with higher quality setting |
| **Low confidence** | Score < 0.6 | Check video quality, add description |
| **Missing sections** | Incomplete structure | Verify model availability |
| **Invalid format** | JSON/YAML parse error | Check output_format parameter |
| **Timeout** | Processing > 5 min | Reduce quality or split video |

---

## 📊 Validation Reporting Template

```
==========================================
VIDEO OUTPUT VALIDATION REPORT
==========================================
Video: {video_name}
Task Type: {task_type}
Output File: {file_path}

✅ File Creation: PASS
✅ Content Structure: PASS
✅ Processing Stats: PASS
⚠️ Quality Indicators: WARNING (file size: 3KB)
✅ Task-Specific Validation: PASS

Overall Status: ✅ PASS (1 warning)

Recommendations:
- Consider increasing video quality for richer content
- Review sections with sparse details
==========================================
```

---

## Integration with Validation Skill

For deeper validation patterns, see: **`.github/skills/validation-and-autofix.md`**

**5-Layer Validation Framework:**
1. **Syntax Validation** - File format, structure
2. **Schema Validation** - Required fields, data types
3. **Semantic Validation** - Content quality, completeness
4. **Integration Validation** - Framework compatibility
5. **Execution Validation** - Runnable tests (for BDD/test cases)
