---
name: bdd-gherkin-patterns
description: Complete reference for Gherkin syntax, BDD scenario patterns, Given/When/Then structure, tags, Scenario Outline, and quality standards for generating comprehensive test scenarios.
---

# BDD Gherkin Syntax & Patterns

## Purpose
Complete reference for Gherkin syntax, BDD scenario patterns, and quality standards for generating comprehensive test scenarios.

---

## Gherkin Syntax Reference

### Feature File Structure
```gherkin
Feature: [Feature Title] - [Business Value]
  [Feature Description - What is being tested]
  
  As a [user role/persona]
  I want to [action/capability]
  So that [business benefit/value]

  Background:
    [Common preconditions that apply to ALL scenarios]
    Given [setup step 1]
    And [setup step 2]

  @tag1 @tag2
  Scenario: [Simple scenario title]
    Given [precondition]
    When [action]
    Then [expected outcome]
    And [additional assertion]

  @tag3 @tag4
  Scenario Outline: [Parameterized scenario title]
    Given [precondition with "<parameter>"]
    When [action with "<input>"]
    Then [expected outcome with "<expected>"]
    
    Examples: [Description of test data]
      | parameter | input    | expected |
      | value1    | input1   | result1  |
      | value2    | input2   | result2  |
```

### Gherkin Keywords
- **Feature**: High-level description of functionality
- **Scenario**: Single test case
- **Scenario Outline**: Parameterized test template
- **Examples**: Data table for Scenario Outline
- **Background**: Common setup for all scenarios
- **Given**: Preconditions/setup
- **When**: Actions/events
- **Then**: Expected outcomes/assertions
- **And**: Additional steps of same type
- **But**: Negative assertions

### Valid Syntax Rules
✅ **DO**:
- Use present tense: "User clicks button"
- Be specific: "User enters 'john@example.com' in Email field"
- One action per When step
- Multiple assertions in Then/And steps
- Use quotes for exact values

❌ **DON'T**:
- Use past tense: "User clicked button"
- Use asterisks (*) in output
- Combine multiple actions in one When
- Use technical implementation details
- Leave placeholders like "XXX" or "[TBD]"

---

## Standard BDD Tags

### Functional Tags
- `@positive` - Happy path scenarios
- `@negative` - Error handling scenarios
- `@edge-case` - Boundary value tests
- `@smoke` - Critical functionality
- `@functional` - Functional testing
- `@business-rule` - Business logic validation
- `@data-driven` - Parameterized scenarios

### Coverage Tags
- `@user-journey` - End-to-end multi-step workflows
- `@rbac` - Role-based access control
- `@authorization` - Permission testing
- `@authentication` - Login/logout scenarios
- `@data-integrity` - Cross-entity validation
- `@validation` - Input validation

### Flow Tags
- `@alternative-flow` - User deviations from happy path
- `@exception-flow` - System failures and errors
- `@state-transition` - Workflow state changes
- `@integration` - External system integration

**Tag Usage Guidelines**:
- Use 2-3 tags per scenario
- Always include one functional tag (@positive/@negative)
- Add coverage tag if applicable
- Tag inheritance: Feature-level tags apply to all scenarios

---

## BDD Scenario Patterns

### Pattern 1: Happy Path (Positive Scenario)
```gherkin
@positive @smoke
Scenario Outline: Successfully complete main user workflow
  Given I am logged in as "<user_role>"
  And I navigate to "<start_page>"
  When I perform "<primary_action>" with "<input_data>"
  Then I should see "<success_message>"
  And the "<result_field>" should display "<expected_value>"
  And the system should log action as "<log_entry>"
  
  Examples: Valid workflow data
    | user_role | start_page | primary_action | input_data | success_message | result_field | expected_value | log_entry |
    | Admin     | Dashboard  | Create Item    | Item A     | Success         | Item Name    | Item A         | Created   |
    | User      | Dashboard  | Create Item    | Item B     | Success         | Item Name    | Item B         | Created   |
```

### Pattern 2: Negative Scenario (Error Handling)
```gherkin
@negative @validation
Scenario Outline: Validation errors for invalid inputs
  Given I am on "<page_name>" page
  When I enter "<field_name>" as "<invalid_value>"
  And I attempt to submit the form
  Then I should see error message "<error_message>"
  And the "<field_name>" field should be highlighted with "error" style
  And the "Submit" button should remain "disabled"
  And no data should be saved to database
  
  Examples: Invalid input combinations
    | page_name | field_name | invalid_value | error_message              |
    | Form      | Email      | invalid@      | Invalid email format       |
    | Form      | Phone      | 123           | Phone must be 10 digits    |
    | Form      | Age        | -5            | Age must be positive       |
```

### Pattern 3: Edge Cases (Boundary Values)
```gherkin
@edge-case @boundary-value
Scenario Outline: Test boundary values for field constraints
  Given I am on form page
  When I enter "<field_name>" with "<test_value>" of length "<length>"
  Then the validation result should be "<result>"
  And I should see "<feedback_message>"
  
  Examples: Boundary value analysis
    | field_name | test_value | length | result  | feedback_message           |
    | Username   | ab         | 2      | invalid | Minimum 3 characters       |
    | Username   | abc        | 3      | valid   | Valid username             |
    | Username   | a...z      | 20     | valid   | Valid username             |
    | Username   | a...z1     | 21     | invalid | Maximum 20 characters      |
```

### Pattern 4: Business Rules Validation
```gherkin
@business-rule @calculation
Scenario Outline: Verify calculation business rules
  Given "<entity>" has "<attribute>" value "<initial_value>"
  When "<calculation_trigger>" is applied with "<input>"
  Then "<result_field>" should display "<expected_result>"
  And the calculation should follow rule "<rule_id>"
  
  Examples: Business rule test cases
    | entity  | attribute | initial_value | calculation_trigger | input | result_field | expected_result | rule_id |
    | Order   | Subtotal  | 100.00        | Apply Discount      | 10%   | Total        | 90.00           | BR-001  |
    | Order   | Subtotal  | 100.00        | Apply Tax           | 8%    | Total        | 108.00          | BR-002  |
```

### Pattern 5: User Journey (End-to-End)
```gherkin
@user-journey @end-to-end
Scenario Outline: Complete user journey from start to finish
  Given I am "<user_type>" on "<start_page>"
  When I perform step 1: "<action_1>" with "<data_1>"
  And I perform step 2: "<action_2>" with "<data_2>"
  And I perform step 3: "<action_3>" with "<data_3>"
  And I perform step 4: "<action_4>"
  Then I should reach "<final_state>"
  And all intermediate steps should have "success" status
  And I should see confirmation "<confirmation_message>"
  
  Examples: End-to-end user journeys
    | user_type | start_page | action_1 | data_1 | action_2 | data_2 | action_3 | data_3 | action_4 | final_state | confirmation_message |
    | Customer  | Home       | Search   | Item A | Add Cart | Qty: 1 | Checkout | Card   | Confirm  | Complete    | Order confirmed      |
```

### Pattern 6: RBAC (Role-Based Access Control)
```gherkin
@rbac @authorization
Scenario Outline: Feature access by user role
  Given I am logged in as "<user_role>" with permissions "<permissions>"
  When I attempt to access "<feature>"
  Then access should be "<access_result>"
  And "<ui_element>" should be "<element_state>"
  And I should see "<user_message>"
  
  Examples: Role-based access matrix
    | user_role | permissions | feature      | access_result | ui_element   | element_state | user_message       |
    | Admin     | full_access | Delete Item  | granted       | Delete Button| visible       | -                  |
    | Manager   | create_read | Delete Item  | denied        | Delete Button| hidden        | Access denied      |
    | Employee  | read_only   | Delete Item  | denied        | Delete Button| hidden        | Access denied      |
```

### Pattern 7: Data Integrity (Cross-Entity Relationships)
```gherkin
@data-integrity @relationships
Scenario Outline: Validate data relationships and constraints
  Given "<entity_1>" with id "<id_1>" has "<relationship>" with "<entity_2>" id "<id_2>"
  When I perform "<action>" on "<target_entity>" id "<target_id>"
  Then "<related_entity>" should "<expected_impact>"
  And referential integrity should be "<integrity_status>"
  And database constraints should be "<constraint_status>"
  
  Examples: Entity relationship test cases
    | entity_1 | id_1 | relationship | entity_2 | id_2 | action | target_entity | target_id | related_entity | expected_impact | integrity_status | constraint_status |
    | Customer | C001 | parent_of    | Order    | O001 | delete | Customer      | C001      | Order          | cascade_delete  | maintained       | satisfied         |
    | Order    | O001 | references   | Product  | P001 | delete | Product       | P001      | Order          | block_delete    | maintained       | violated          |
```

### Pattern 8: Alternative Flow (User Deviations)
```gherkin
@alternative-flow @user-deviation
Scenario Outline: User navigates away and returns to form
  Given I am filling "<form_name>" form
  And I have entered data in "<number_of_fields>" fields
  When I navigate to "<other_page>" without saving
  And I see prompt "<confirmation_prompt>"
  And I choose to "<user_action>"
  Then my form data should be "<data_state>"
  And I should see "<result_message>"
  
  Examples: Alternative navigation scenarios
    | form_name     | number_of_fields | other_page | confirmation_prompt          | user_action | data_state     | result_message        |
    | Profile Form  | 3                | Dashboard  | Unsaved changes. Continue?   | Cancel      | preserved      | Continue editing      |
    | Profile Form  | 5                | Settings   | Unsaved changes. Continue?   | Leave       | discarded      | Changes discarded     |
```

### Pattern 9: Exception Flow (System Failures)
```gherkin
@exception-flow @system-failure
Scenario Outline: Handle system failures gracefully
  Given I am performing "<user_action>"
  When "<failure_type>" occurs during "<operation>"
  Then I should see "<error_message>"
  And the system should "<recovery_action>"
  And my data should be "<data_status>"
  
  Examples: System failure scenarios
    | user_action | failure_type   | operation       | error_message         | recovery_action | data_status |
    | Submit Form | Network Error  | API Call        | Connection failed     | Show retry      | preserved   |
    | Save Data   | Timeout        | Database Write  | Request timed out     | Auto-retry      | preserved   |
    | Upload File | Server Error   | File Processing | Server unavailable    | Queue request   | saved       |
```

### Pattern 10: State Transition
```gherkin
@state-transition @workflow
Scenario Outline: State transitions for workflow entities
  Given "<entity>" is in "<initial_state>"
  When "<trigger_event>" occurs with "<event_data>"
  Then "<entity>" should transition to "<final_state>"
  And system should perform "<system_action>"
  And user should see "<user_message>"
  
  Examples: Valid state transitions
    | entity | initial_state | trigger_event | event_data | final_state | system_action    | user_message         |
    | Order  | Draft         | Submit        | Items: 3   | Pending     | Send notification| Order submitted      |
    | Order  | Pending       | Approve       | Manager: M1| Approved    | Update inventory | Order approved       |
    | Order  | Approved      | Ship          | Tracking#  | Shipped     | Email customer   | Order shipped        |
```

---

## Scenario Quality Standards

### Quality Criteria Checklist

Every scenario MUST include:

✅ **1. Minimum 3-4 Specific Assertions** (DO NOT use generic assertions)
```gherkin
# ❌ INSUFFICIENT (Too generic)
Then the form should load

# ✅ COMPREHENSIVE (Specific, measurable)
Then the form should load within "3" seconds
And I should see page title "Customer Registration"
And all "10" mandatory fields should be displayed with "*" indicator
And the "Submit" button should be "enabled"
And I should see breadcrumb "Home > Registration"
```

✅ **2. State Verification After Actions**
```gherkin
When I click "Submit" button
Then the form should transition to "submitted" state
And the "Submit" button should change to "disabled" state
And I should see success message "Registration successful"
And I should be redirected to "Dashboard" page
And the new customer should appear in "Customers" list
```

✅ **3. Negative Assertions** (Verify what should NOT happen)
```gherkin
Then I should see error message "Invalid email format"
And the form should NOT be submitted
And the database should NOT contain new customer record
And no confirmation email should be sent
And the page should NOT navigate away
```

✅ **4. Specific Values from Application Context**
```gherkin
# ❌ TOO GENERIC
Then the field should show an error

# ✅ SPECIFIC (Using real application data)
Then the "Email Address" field should display error "Email format must be name@domain.com"
And the field border should be "#FF0000" color
And the error icon "⚠" should appear beside the field
And the field should have "aria-invalid" attribute set to "true"
```

### Quality Score Per Scenario
- **5 points**: Has 3+ specific assertions with actual application values
- **3 points**: Verifies state changes explicitly (before/after)
- **2 points**: Includes negative assertions (what should NOT happen)
- **2 points**: Uses specific values from application context, not generic terms
- **Target**: 10-12 points per scenario (≥10 = high quality)

### Quality Anti-Patterns to Avoid

❌ **Anti-Pattern 1: Vague Assertions**
```gherkin
Then the page should work correctly
```

✅ **Correct**:
```gherkin
Then the "Dashboard" page should load within "2" seconds
And I should see "Welcome, John" message
And all "5" dashboard widgets should be visible
```

❌ **Anti-Pattern 2: Missing State Verification**
```gherkin
When I click "Save"
Then I should see success message
```

✅ **Correct**:
```gherkin
When I click "Save" button
Then I should see success message "Changes saved successfully"
And the form should transition from "editing" to "saved" state
And the "Save" button should change to "disabled" state
And the last modified timestamp should update to current time
```

❌ **Anti-Pattern 3: Combining Multiple Actions**
```gherkin
When I fill out the form and submit it
```

✅ **Correct**:
```gherkin
When I enter "John" in "First Name" field
And I enter "Doe" in "Last Name" field
And I enter "john.doe@example.com" in "Email" field
And I click "Submit" button
```

---

## Background Usage Patterns

### When to Use Background

Background should contain:
- Common authentication/authorization setup
- Standard test data setup
- Application state initialization
- Common navigation

```gherkin
Background: Common setup for all user scenarios
  Given I am logged in as "Admin" user
  And I have navigated to "Dashboard" page
  And the test database contains following data:
    | Entity   | Count |
    | Customer | 10    |
    | Order    | 25    |
    | Product  | 50    |
```

### When NOT to Use Background

DON'T use Background for:
- Steps that apply to only some scenarios
- Steps that need parameterization per scenario
- Cleanup/teardown actions (use hooks instead)

---

## Examples Tables Best Practices

### Minimum Data Coverage Requirements

Each Examples table MUST include (5-7 rows minimum):

1. **At least 2-3 valid equivalence classes**
   - Common/typical values
   - Boundary values (min, max)
   - Edge cases (special characters, unicode)

2. **At least 1-2 invalid equivalence classes** (for negative tests)
   - Format violations
   - Required field violations
   - Range violations

3. **Coverage documentation in comments**:
```gherkin
Examples: Comprehensive field validation
  # Coverage:
  # - 3 valid classes: common (4-6 chars), long (10-12 chars), short (2-3 chars)
  # - 2 boundary values: min (2), max (20)
  # - 2 edge cases: special chars, compound names
  # - 2 error classes: invalid format, required field
  # Total: 9 test cases
  
  | field_name | test_value        | test_type        | expected_result |
  | First Name | John              | valid_common     | accepted        |
  | First Name | Christopher       | valid_long       | accepted        |
  | First Name | Li                | valid_short      | accepted        |
  | First Name | José              | valid_unicode    | accepted        |
  | First Name | Mary-Jane         | valid_hyphenated | accepted        |
  | First Name | J                 | invalid_too_short| error           |
  | First Name | 123               | invalid_format   | error           |
  | First Name | [empty]           | invalid_required | error           |
```

### Examples Table Anti-Patterns

❌ **Anti-Pattern: Too Few Rows**
```gherkin
Examples:
  | field | value |
  | Name  | John  |
  | Email | test  |
```

✅ **Correct: Comprehensive Coverage**
```gherkin
Examples: User registration fields validation
  | field      | value             | validity | error_message          |
  | Name       | John Doe          | valid    | -                      |
  | Name       | Christopher Smith | valid    | -                      |
  | Name       | Li                | valid    | -                      |
  | Name       | José García       | valid    | -                      |
  | Name       | [empty]           | invalid  | Name is required       |
  | Email      | john@example.com  | valid    | -                      |
  | Email      | invalid@          | invalid  | Invalid email format   |
```

---

## Complete Feature File Example

```gherkin
# ==========================================
# TEST CASE METADATA
# ==========================================
# Generated: 2024-01-20
# Story: PROJ-123 - User Registration
# Generator: Web BDD Test Case Generator v2.0
#
# ACCEPTANCE CRITERIA COVERAGE: 3/3 (100%) ✅
# BUSINESS RULES COVERAGE: 5/5 (100%) ✅
# QUALITY SCORE: 95/100 ✅
# ==========================================

Feature: User Registration
  Enable new users to create accounts in the system
  
  As a new user
  I want to register for an account
  So that I can access the platform features

  Background:
    Given the registration page is accessible at "/register"
    And the database contains existing users:
      | email               | username |
      | john@example.com    | john123  |
      | mary@example.com    | mary456  |

  @positive @smoke
  Scenario Outline: Successfully register new user with valid data
    Given I navigate to registration page
    When I enter "<first_name>" in "First Name" field
    And I enter "<last_name>" in "Last Name" field
    And I enter "<email>" in "Email" field
    And I enter "<username>" in "Username" field
    And I enter "<password>" in "Password" field
    And I click "Register" button
    Then I should see success message "Registration successful"
    And I should be redirected to "Dashboard" page
    And the new user should be created in database
    And a confirmation email should be sent to "<email>"
    
    Examples: Valid registration data
      | first_name | last_name | email            | username | password    |
      | Alice      | Smith     | alice@test.com   | alice01  | Pass@123    |
      | Bob        | Johnson   | bob@test.com     | bob02    | SecureP@ss1 |
      | Charlie    | Brown     | charlie@test.com | charlie3 | MyP@ssw0rd  |

  @negative @validation
  Scenario Outline: Registration fails with invalid email format
    Given I navigate to registration page
    When I enter "John" in "First Name" field
    And I enter "Doe" in "Last Name" field
    And I enter "<invalid_email>" in "Email" field
    Then I should see error message "<error_message>"
    And the "Email" field should be highlighted with "error" style
    And the "Register" button should remain "disabled"
    And no user should be created in database
    
    Examples: Invalid email formats
      | invalid_email | error_message                |
      | invalid@      | Invalid email format         |
      | @example.com  | Invalid email format         |
      | plaintext     | Email must contain @         |
      | user@         | Domain part is required      |

  @rbac @authorization
  Scenario Outline: Access control for registration page
    Given I am "<user_status>"
    When I attempt to access registration page at "/register"
    Then access should be "<access_result>"
    And I should see "<message>"
    
    Examples: User access scenarios
      | user_status        | access_result | message                    |
      | not logged in      | granted       | Welcome to registration    |
      | logged in as User  | denied        | You are already registered |
      | logged in as Admin | denied        | You are already registered |
```

---

## Summary

### Key Takeaways

1. **Gherkin Syntax**: Use Given/When/Then structure with specific values
2. **Tags**: 2-3 tags per scenario for categorization and filtering
3. **Scenario Patterns**: 10 reusable patterns for common test situations
4. **Quality Standards**: 10-12 points per scenario with specific assertions
5. **Examples Tables**: 5-7 rows minimum with comprehensive coverage
6. **Background**: Use for common setup across all scenarios

### DO's and DON'Ts

✅ **DO**:
- Use Scenario Outline with Examples for 80%+ of scenarios
- Include 3-4 specific assertions per scenario
- Use real application data, not placeholders
- Document coverage rationale in comments
- Verify both positive outcomes AND negative conditions

❌ **DON'T**:
- Use asterisks (*) in Gherkin keywords
- Leave generic placeholders like "value1", "field1"
- Combine multiple actions in single When step
- Skip negative assertions about what should NOT happen
- Use fewer than 5 rows in Examples tables

---

## Pattern 11: Flat Linear E2E Workflow (Automation-Ready)

### When to Use This Pattern
Use Pattern 11 for **any multi-page or multi-step workflow** where:
- The user progresses through a sequence of pages/tabs/screens
- Each page has distinct UI elements (buttons, forms, popups)
- The goal is scenarios that can be **directly converted to automation scripts**
- Steps must map 1:1 to automatable UI actions

### ❌ ANTI-PATTERN: Never Collapse E2E Steps into Abstract Parameters

Do NOT use Pattern 5 (or any parameterized action approach) for E2E workflows.
Collapsing real steps into abstract parameters destroys automation-readiness.

```gherkin
# ❌ WRONG — Parameters replace real steps (NOT automatable directly)
@user-journey @end-to-end
Scenario Outline: Broker completes submission
  Given I am "Broker" on "Login page"
  When I perform step 1: "<action_1>" with "<data_1>"
  And I perform step 2: "<action_2>" with "<data_2>"
  And I perform step 3: "<action_3>" with "<data_3>"
  Then I should reach "<final_state>"

  Examples:
    | action_1 | data_1 | action_2       | data_2 | action_3       | data_3   | final_state      |
    | Login    | Broker | Create Case    | Manual | Accept T&C     | dataset1 | Quote Generated  |
```

### ✅ CORRECT — Flat Linear Sequence, Dataset-Only Examples

The step sequence is fully written out. Only the **data identifier** is parameterized.
Every step = one atomic UI action or one assertion.

```gherkin
# ✅ CORRECT — Real step sequence, dataset drives input values
@positive @smoke @end-to-end @user-journey
Scenario Outline: [Persona] completes [workflow name] from [start] to [end state]
  # ── STEP GROUP 1: Authentication ──
  Given the [persona] is on the [Application Name] login page
  When the [persona] logs in with credentials from "<dataSet>" dataset
  Then the [persona] should be successfully logged in and land on the Dashboard page
  And the "[Primary CTA Button]" should be visible and enabled on the Dashboard

  # ── STEP GROUP 2: Initiate Workflow ──
  When the [persona] clicks on the "[Trigger Button/Icon]" to [start action]
  Then the "[Popup/Screen Name]" should be displayed
  When the [persona] selects [option] from "<dataSet>" dataset and clicks "[Confirm Button]"
  Then the [persona] should be navigated to the [Page 2 Name] page

  # ── STEP GROUP 3: Page 2 Actions ──
  And the "[Field A]" [element type] and "[Field B]" field should be visible on [Page 2]
  When the [persona] selects [field values] from "<dataSet>" dataset and clicks Next
  Then the [persona] should be navigated to the [Page 3 Name] page

  # ── STEP GROUP 4: Page 3 Actions ──
  And the [Page 3] form should be visible with all required fields enabled
  When the [persona] fills in all [page 3] details from "<dataSet>" dataset
  And the [persona] clicks the "Next" button on [Page 3] page
  Then the [persona] should be navigated to the [Page 4 Name] page

  # ── STEP GROUP N: API / Integration Step (if applicable) ──
  When the [persona] clicks the "[API Trigger Button]" button
  Then the [Field X], [Field Y] and [Field Z] fields should be populated and validated via API response

  # ── STEP GROUP N+1: Final Action ──
  When the [persona] clicks the "[Final Submit Button]" button
  Then a successful [outcome] popup message should be displayed to the [persona]
  And a unique [Reference Number] should be generated and displayed on the submission

  Examples:
    | dataSet  |
    | dataset1 |
    | dataset2 |
```

### Automation-Ready Step Depth Standard

This standard defines what "one step" means for automation-readiness.
Every Gherkin step MUST correspond to exactly ONE of:

| Step Type | Rule | Example |
|---|---|---|
| **Page arrival** | One `Then navigated to [Page]` per page transition | `Then the broker should be navigated to the Insured Details page` |
| **Button click** | One `When clicks "[Button Name]"` per click | `When the broker clicks the "+" icon to create a new case` |
| **Popup verification** | One `Then "[Popup Name]" popup should be displayed` per popup | `Then the "Create New Submission" popup should be displayed` |
| **Form fill (dataset)** | One `When fills in [page] details from "<dataSet>"` per page | `When the broker fills in all insured details from "<dataSet>" dataset` |
| **Field assertion** | One `And the "[Field]" and "[Field]" should be visible` per group | `And the "Line of Business" dropdown and "Effective Date" field should be visible` |
| **API trigger** | One `When clicks "[API Button]"` + one `Then [fields] populated` | `When the broker clicks the "Lookup" button` + `Then the DUNS Number... should be populated` |
| **State assertion** | One `And [element] should be "[state]"` per state check | `And the "Create New Submission" button should be visible and enabled` |
| **Final outcome** | One popup/message assertion + one reference number assertion | `Then a successful quote generation popup message should be displayed` |

**Step Grouping Rule**: Group related steps under a comment header:
```gherkin
# ── STEP GROUP: Property Information Page ──
And the property location form and "Add New Building Details" button should be visible
When the broker fills in property location details from "<dataSet>" dataset
And the broker clicks the "Add New Building Details" button
Then the building information fields should be enabled
When the broker fills in building information from "<dataSet>" dataset and clicks Save
Then the building details should be successfully added and displayed
When the broker clicks the "Next" button on Property Information page
```

**Minimum Steps Per Page Group**: 3-5 steps (arrive → see elements → act → assert outcome)

### E2E Scenario Count Rules

For a workflow with **N pages** and **M decision points**:
- **Minimum scenarios**: 1 happy path (full flow, all pages) + 1 per major decision point variant
- **For each page**: 1 required-field validation scenario (separate from E2E)
- **For each API integration point**: 1 scenario (success) + 1 scenario (failure)
- **For each status transition**: 1 forward transition scenario + 1 blocked transition scenario

**Example for an 11-page wizard with 3 decision points**:
```
E2E Happy Path (full wizard, path A):         1 scenario  (~40-55 steps)
E2E Path B (different decision point option): 1 scenario  (~40-55 steps)
Page 3 Required Field validation:             1 scenario  (Scenario Outline, 5+ rows)
Page 4 Required Field validation:             1 scenario  (Scenario Outline, 5+ rows)
Page 7 API Lookup — Success:                  1 scenario
Page 7 API Lookup — Failure:                  1 scenario
STP Path (auto-quote outcome):                1 scenario
NSTP Path (referred to UW outcome):           1 scenario
```

### Complete Pattern 11 Example (Generic Domain)

```gherkin
@positive @smoke @end-to-end @user-journey
Scenario Outline: Customer completes loan application through 4-step wizard — approved path
  # ── STEP GROUP 1: Login & Dashboard ──
  Given the customer is on the Banking Portal login page
  When the customer logs in with credentials from "<dataSet>" dataset
  Then the customer should be successfully logged in and land on the Account Dashboard
  And the "Apply for Loan" button should be visible and enabled on the Account Dashboard

  # ── STEP GROUP 2: Loan Type Selection ──
  When the customer clicks the "Apply for Loan" button
  Then the "Loan Application" popup should be displayed
  When the customer selects loan type from "<dataSet>" dataset and clicks "Continue"
  Then the customer should be navigated to the Personal Details page

  # ── STEP GROUP 3: Personal Details Page ──
  And the Personal Details form should be visible with all required fields enabled
  And the "Full Name", "Date of Birth", "PAN Number" and "Annual Income" fields should be visible
  When the customer fills in all personal details from "<dataSet>" dataset
  And the customer clicks the "Next" button on Personal Details page
  Then the customer should be navigated to the Employment Details page

  # ── STEP GROUP 4: Employment Details Page ──
  And the "Employer Name" and "Employment Type" fields should be visible
  When the customer fills in employment details from "<dataSet>" dataset
  And the customer clicks the "Next" button on Employment Details page
  Then the customer should be navigated to the Loan Configuration page

  # ── STEP GROUP 5: Loan Configuration ──
  And the "Loan Amount", "Tenure" and "Interest Rate" fields should be visible
  When the customer fills in loan configuration from "<dataSet>" dataset
  When the customer clicks the "Calculate EMI" button
  Then the "Monthly EMI", "Total Interest" and "Total Repayable" fields should be populated

  # ── STEP GROUP 6: Submission ──
  When the customer clicks the "Submit Application" button
  Then a successful application submission popup message should be displayed
  And a unique Loan Application Reference number should be generated and displayed
  And the application status should show "Under Review"

  Examples:
    | dataSet  |
    | dataset1 |
    | dataset2 |
```
