---
name: video-task-templates
description: Task-specific templates, capabilities, and example prompts for video analysis. Covers test case generation, E2E test cases, defect analysis, user story creation, and BDD scenario generation with comprehensive examples.
---

# Video Task Templates & Examples

## Purpose
Standardized templates and prompts for each video analysis task type to ensure consistent, high-quality outputs.

---

## 📋 Task-Specific Capabilities

| Task Type | Function | Key Outputs | Output Formats |
|-----------|----------|-------------|----------------|
| `e2e_testcase` | `generate_e2e_testcases_from_video()` | **12 standard techniques** + **Flow-specific cases** | **Excel** (recommended), CSV, JSON, MD |
| `test_case` | `generate_test_cases_from_video()` | Test scenarios, preconditions, steps, expected results, timestamps | MD, JSON, YAML, XML |
| `defect` | `analyze_video_for_defects()` | Bug descriptions, severity, reproduction steps, impact assessment, audio-enhanced context | MD, JSON, YAML, XML |
| `user_story` | `generate_user_stories_from_video()` | Personas, goals, acceptance criteria, workflow documentation | MD, JSON, YAML, XML |
| `bdd` | `generate_bdd_scenarios_from_video()` | Gherkin features, Given/When/Then, Examples tables, scenario variations | MD (Gherkin), JSON |

**Recommended**: Use `e2e_testcase` with **Excel format** for comprehensive test documentation ready for import into test management tools.

---

## 🎯 Test Case Generation (`test_case`)

### **Output Structure**
```markdown
# Test Case Analysis - {video_name}

**Video**: {video_name}.mp4
**Duration**: {duration}
**Analysis Date**: {timestamp}

---

## Test Case: TC-001 - {Scenario Name}

**Objective**: Verify that {objective}

**Preconditions**:
- Application is loaded
- User is logged in
- Test data is prepared

**Test Steps**:
1. Navigate to {page/module}
   - **Expected**: Page loads with all elements visible [Timestamp: 00:12]
2. Enter {data} in {field}
   - **Expected**: Field accepts input without errors [Timestamp: 00:23]
3. Click on {button/link}
   - **Expected**: Action completes successfully [Timestamp: 00:45]

**Expected Results**: 
- {Final outcome}
- No errors in console
- Data persisted correctly

**Test Data**: 
- Username: testuser@example.com
- Password: ValidPass@123

---

## Integration Recommendations
- Review framework patterns for similar scenarios
- Validate test data requirements
- Consider edge cases and error scenarios
```

### **Example Prompts**
```
@video-processor-analyzer Generate test cases from C:\videos\login_demo.mp4

@video-processor-analyzer Create test scenarios for payment_flow.mp4 with high quality settings

@video-processor-analyzer Generate test cases from demo.mp4 and save to Output/video_analysis_output in JSON format
```

---

## 🚀 E2E Test Case Generation (`e2e_testcase`)

### **Excel Output (Recommended)**

**Why Excel?**
- ✅ **Test Management Tools Ready**: Direct import into Jira, TestRail, Azure DevOps, Zephyr
- ✅ **Comprehensive Structure**: 12 columns with all test case details
- ✅ **12 Test Design Techniques**: Systematic coverage (Happy Path, Negative, BVA, etc.)
- ✅ **Easy Review**: Stakeholders can review in familiar format
- ✅ **Filtering & Sorting**: Excel features for test case management
- ✅ **Template-Based**: No API key required for core generation

**Excel Workbook Structure:**
```
demo_video_E2E_TestCases_20260428_190411.xlsx
  └── Sheet: Test Cases
      ├── 12 Columns (test_case_id, e2e_flow_name, business_scenario, ...)
      └── 12 Rows (one per test design technique)
```

### **12 Standard Test Design Techniques**

1. **Happy Path Testing** - Complete successful workflow
2. **Negative Testing** - Invalid inputs, error scenarios
3. **Boundary Value Analysis** - Min/max/edge values
4. **Equivalence Partitioning** - Valid/invalid data classes
5. **Decision Table Testing** - Complex condition combinations
6. **State Transition Testing** - Workflow state changes
7. **Error Handling & Recovery** - Failure scenarios, resilience
8. **Role-Based Access Control** - Permission/authorization testing
9. **Integration Testing** - Multi-system workflows
10. **Session Management** - Timeout/expiry scenarios
11. **Cross-Browser Compatibility** - Multi-browser/device testing
12. **Data Persistence & Concurrency** - DB operations, race conditions

### **Flow-Specific Augmentation**

**Authentication Flows:**
- Password reset workflows
- Account lockout scenarios
- Multi-factor authentication
- Session timeout handling

**Search Flows:**
- Pagination testing
- Sorting/filtering validation
- Empty result scenarios
- Search term validation

**Checkout Flows:**
- Discount code application
- Payment validation
- Cart management
- Order confirmation

**Registration Flows:**
- Duplicate email prevention
- Field validation rules
- Email verification
- Profile completion

**File Upload Flows:**
- File type validation
- File size limits
- Batch upload scenarios
- Error handling

**Report Generation:**
- Parameter validation
- Format options (PDF/Excel/CSV)
- Large dataset handling
- Scheduling/automation

**Approval Workflows:**
- Multi-level approvals
- Rejection scenarios
- Comment/feedback loops
- Notification triggers

### **Excel Output Structure**

| Column | Description | Example |
|--------|-------------|---------|
| `test_case_id` | Unique identifier | TC_E2E_LOGIN_001 |
| `e2e_flow_name` | Business scenario name | Complete Login - Happy Path |
| `business_scenario` | Detailed description | Verify user can successfully log in with valid credentials |
| `user_role` | Actor performing test | Registered User, Admin, Guest |
| `module` | System component | Authentication, Search, Checkout |
| `pre_conditions` | Setup requirements | Application loaded, user account exists |
| `test_data` | Input values | `{"username": "test@example.com", "password": "Pass123"}` |
| `test_steps` | Detailed actions | Array of step objects with step_number and step_description |
| `expected_output` | Success criteria | Login successful, redirect to dashboard |
| `test_design_technique` | Methodology | Happy Path Testing, Negative Testing, etc. |
| `priority` | Business criticality | Critical, High, Medium, Low |
| `coverage_tag` | Layers covered | UI \| API \| DB |

### **Example Prompts**
```
@video-processor-analyzer Generate comprehensive E2E test cases from checkout_flow.mp4 in Excel format

@video-processor-analyzer Create E2E test cases with 12 standard techniques from demo.mp4 as Excel

@video-processor-analyzer Generate E2E test cases from login_video.mp4 with authentication flow-specific scenarios in Excel

@video-processor-analyzer Process payment_video.mp4 for E2E test cases in Excel format with high quality settings
```

**Excel Output Example:**
```
Output/video_analysis_output/
  └── demo_video_E2E_TestCases_20260428_190411.xlsx (11.8 KB)
      └── 12 test cases × 12 columns = Comprehensive test suite
```

**Alternative Formats:**
```
@video-processor-analyzer Generate E2E test cases from demo.mp4 in CSV format  # For spreadsheet tools
@video-processor-analyzer Generate E2E test cases from demo.mp4 in JSON format # For automation tools
@video-processor-analyzer Generate E2E test cases from demo.mp4 in Markdown   # For documentation
```

---

## 🐞 Defect Analysis (`defect`)

### **Output Structure**
```markdown
# Defect Analysis - {video_name}

**Video**: {video_name}.mp4
**Duration**: {duration}
**Analysis Date**: {timestamp}

---

## Defect: DEF-001 - {Defect Title}

**Severity**: Critical | High | Medium | Low
**Status**: New
**Module**: {Module/Component}

**Description**:
{Detailed description of the issue observed in the video}

**Audio Context** (if available):
{Transcribed audio providing context: user comments, error sounds, etc.}

**Reproduction Steps**:
1. Navigate to {page} [Timestamp: 00:12]
2. Enter {data} in {field} [Timestamp: 00:23]
3. Click on {button} [Timestamp: 00:34]
4. Observe error/issue [Timestamp: 00:45]

**Expected Behavior**:
{What should happen}

**Actual Behavior**:
{What actually happened}

**Impact Assessment**:
- **User Impact**: User unable to complete transaction
- **Business Impact**: Revenue loss, customer satisfaction
- **System Impact**: Data corruption risk, security vulnerability

**Root Cause** (if identifiable):
{Potential technical cause}

**Suggested Solutions**:
1. {Solution approach 1}
2. {Solution approach 2}

**Workaround** (if available):
{Temporary workaround for users}

**Environment**:
- Browser: Chrome 118
- OS: Windows 11
- Application Version: v2.3.4

---

## Summary
Total Defects Found: {count}
Critical: {count} | High: {count} | Medium: {count} | Low: {count}
```

### **Example Prompts**
```
@video-processor-analyzer Analyze search_bug.mp4 for defects

@video-processor-analyzer Generate defect report from payment_error_video.mp4

@video-processor-analyzer Analyze demo_bugs.mp4 for defects and include audio transcription
```

---

## 📖 User Story Creation (`user_story`)

### **Output Structure**
```markdown
# User Story Analysis - {video_name}

**Video**: {video_name}.mp4
**Duration**: {duration}
**Analysis Date**: {timestamp}

---

## User Story: US-001 - {Story Title}

**Persona**: {User Role/Type}
- **Context**: {Background about the user}
- **Needs**: {Primary goals and pain points}
- **Technical Proficiency**: {Beginner/Intermediate/Advanced}

**Story**:
**As a** {persona}
**I want** {feature/capability}
**So that** {business value/benefit}

**Acceptance Criteria**:
- [ ] Given {context}, when {action}, then {expected outcome}
- [ ] User can {capability} without {constraint}
- [ ] System validates {data} according to {rules}
- [ ] Error messages are clear and actionable

**Definition of Done**:
- [ ] Feature implemented and tested
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] UAT sign-off received

**Business Value**:
{Quantifiable business impact: time saved, revenue increase, error reduction, etc.}

**Dependencies**:
- {Upstream/downstream dependencies}

**Priority**: High | Medium | Low
**Story Points**: {1, 2, 3, 5, 8, 13}

**Related Workflows** (from video):
1. {Workflow step 1} [Timestamp: 00:12]
2. {Workflow step 2} [Timestamp: 00:34]

---

## Summary
Total Stories Identified: {count}
Epic: {Epic name}
Sprint Recommendation: Sprint {number}
```

### **Example Prompts**
```
@video-processor-analyzer Create user stories from product_demo.mp4

@video-processor-analyzer Generate user stories from requirement_video.mp4 with acceptance criteria

@video-processor-analyzer Analyze stakeholder_interview.mp4 and generate user stories in JSON format
```

---

## 🥒 BDD Scenario Generation (`bdd`)

### **Output Structure**
```gherkin
Feature: {Feature Name from Video}
  As a {persona}
  I want {capability}
  So that {business value}

  Background:
    Given the application is running
    And user is on the {page}

  @smoke @regression
  Scenario: {Scenario Name}
    Given {precondition state} [Timestamp: 00:12]
    When {user action} [Timestamp: 00:23]
    Then {expected outcome} [Timestamp: 00:45]
    And {additional verification}

  @data-driven @positive
  Scenario Outline: {Data-Driven Scenario Name}
    Given user enters "<username>" and "<password>"
    When user clicks login button
    Then user should see "<message>"
    And user should be redirected to "<page>"

    Examples:
      | username           | password    | message          | page      |
      | valid@example.com  | ValidPass1  | Login successful | dashboard |
      | invalid@example.com| ValidPass1  | User not found   | login     |
      | valid@example.com  | WrongPass   | Invalid password | login     |

  @negative @error-handling
  Scenario: {Error Scenario Name}
    Given user is on login page
    When user submits empty credentials
    Then error message "All fields required" is displayed
    And login button remains disabled

  @integration @api
  Scenario: {Integration Scenario Name}
    Given API endpoint "/api/login" is available
    When user submits valid credentials
    Then API returns status code 200
    And response contains authentication token
    And user session is created in database
```

### **Example Prompts**
```
@video-processor-analyzer Generate BDD scenarios from checkout_demo.mp4

@video-processor-analyzer Create Gherkin scenarios from login_flow.mp4 with timestamps

@video-processor-analyzer Generate BDD scenarios from api_demo.mp4 with data-driven examples
```

**See**: `.github/skills/bdd-gherkin-patterns.md` for comprehensive Gherkin best practices

---

## 🎨 Advanced Usage Examples

### **Batch Processing**
```
@video-processor-analyzer Generate test cases for all videos in C:\videos\sprint_demos\ directory

Process each video with task_type='test_case' and output to Output/video_analysis_output
```

### **High Quality Analysis**
```
@video-processor-analyzer Process demo.mp4 for test cases using high quality settings (50+ frames)

Use quality='high' for detailed UI element capture
```

### **Multi-Format Output**
```
@video-processor-analyzer Generate test cases from demo.mp4 in JSON format for tool integration

Output format: JSON for importing into test management tools
```

### **Audio-Enhanced Analysis**
```
@video-processor-analyzer Analyze training_video.mp4 with audio transcription for user stories

Include verbal instructions and narration in analysis
```

---

## 🔧 Technical Implementation Reference

### **Standard Task Processing**
```python
from src.services.video_service import VideoProcessingService

service = VideoProcessingService()

# Convenience methods for each task type
service.generate_test_cases_from_video(
    video_file_path='path/to/video.mp4',
    output_directory='Output/video_analysis_output',
    model='claude-3.5-sonnet',
    description='Optional context',
    include_timestamps=True,
    video_quality='medium'
)

service.analyze_video_for_defects(...)
service.generate_user_stories_from_video(...)
service.generate_bdd_scenarios_from_video(...)
```

### **E2E Test Case Processing**
```python
service.generate_e2e_testcases_from_video_frames(
    video_file_path='path/to/video.mp4',
    output_directory='Output/video_analysis_output',
    model='claude-3.5-sonnet',
    output_format='excel',  # or 'csv', 'json', 'markdown'
    include_timestamps=True,
    video_quality='medium'
)
```

### **Generic Processing Method**
```python
result = service.process_video_for_copilot(
    video_file_path='path/to/video.mp4',
    task_type='test_case',  # or 'defect', 'user_story', 'bdd'
    output_directory='Output/video_analysis_output',
    model='claude-3.5-sonnet',
    description='Optional description',
    include_timestamps=True,
    video_quality='medium',
    output_format='markdown'  # or 'json', 'yaml', 'xml'
)
```

---

## 📊 Quality Settings Impact

| Quality | Frames | Analysis Depth | Use Case |
|---------|--------|----------------|----------|
| **High** | 50+ | Very detailed | Complex UI workflows, detailed element identification |
| **Medium** | 30 | Standard | Most test case/defect scenarios (default) |
| **Low** | 15 | Basic | Quick analysis, long videos, overview generation |

---

## Model Selection Guide

| Model | Best For | Speed | Cost |
|-------|----------|-------|------|
| **claude-3.5-sonnet** | Comprehensive analysis, nuanced understanding (default) | Medium | Medium |
| **gpt-4o** | Fast processing, good quality | Fast | Low |
| **gpt-4-turbo** | Complex scenarios, deep reasoning | Slow | High |

---

## Integration with Other Skills

- **Test Design**: `.github/skills/test-design-techniques.md` - 12 standard test design techniques
- **BDD Patterns**: `.github/skills/bdd-gherkin-patterns.md` - Gherkin syntax and best practices
- **Excel Export**: `.github/skills/traceability-excel-export.md` - Excel formatting and structure
- **Validation**: `.github/skills/validation-and-autofix.md` - Output quality validation
- **Test Data**: `.github/skills/test-data-analysis.md` - Test data extraction and management
