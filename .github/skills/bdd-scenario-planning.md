# BDD Scenario Planning & Coverage Strategy

Complete guide for planning comprehensive BDD test scenario coverage from user stories.

---

## Part 1: Scenario Planning Framework

### Step 1: Extract Coverage Inventory from Context

**From User Story:**
- Acceptance Criteria (AC-1, AC-2, AC-3...)
- Each AC may have sub-criteria (Given/When/Then statements)

**From Application Context:**
- Page/tab sequence (e.g., 12-page wizard)
- Decision points (dropdowns, radio buttons, Yes/No questions)
- Required fields per page
- API/integration points
- User roles/personas

**From Domain Model:**
- Entities and their attributes
- Status/state values
- Validation constraints (min/max, required, format)
- Relationships between entities

**From Business Rules:**
- Calculation formulas
- Validation rules (field-level, cross-field, business logic)
- Workflow rules (status transitions, approvals)
- Permission/authorization rules

---

### Step 2: Build Scenario Coverage Matrix

Use this 7-category framework to ensure comprehensive coverage:

#### **Category A: Workflow Paths (End-to-End)**

**Rule:** One scenario per distinct end-to-end workflow path

**Identify from Application Context:**
- Each user persona's complete workflow (Broker, Underwriter, Manager, etc.)
- Each workflow variant (STP vs NSTP, Approved vs Rejected)
- Each terminal state (Quote Approved, Quote Rejected, Policy Issued)

**Count Formula:**
```
Category A = (# personas) × (# workflow variants) × (# terminal states)
```

**Example:**
- 2 personas (Broker, Underwriter)
- 2 variants per persona (Happy path, Rejection path)
- = 4 E2E scenarios

**Scenario Pattern:**
```gherkin
@user-journey @end-to-end @[persona]
Scenario Outline: [Persona] complete [workflow type] workflow
  Given I am logged in as "<role>" with credentials "<username>" and "<password>"
  When I navigate through all "<pageCount>" pages of the workflow
  And I complete each page with "<dataSet>" test data
  Then the workflow should complete with status "<finalStatus>"
  And I should see confirmation message "<confirmationMessage>"
  
  Examples: End-to-End Workflow Paths
    | role        | username      | password | pageCount | dataSet      | finalStatus   | confirmationMessage       |
    | Broker      | broker1@test  | Test123  | 12        | Standard-STP | Quote Generated | Quote reference: QT-12345 |
    | Broker      | broker2@test  | Test123  | 12        | High-Risk-NSTP | Referred to UW | Case assigned to underwriter |
    | Underwriter | uw1@test      | Test123  | 3         | Review-Accept | Quote Pending  | Quote approved successfully |
    | Underwriter | uw2@test      | Test123  | 3         | Review-Reject | Quote Rejected | Quote has been rejected    |
```

---

#### **Category B: Per-Page/Screen Coverage**

**Rule:** 3 scenarios per page (happy path, required field validation, invalid input)

**Identify from Application Context:**
- Count all pages/tabs in sequence (e.g., 12 pages in wizard)
- Extract required fields per page
- Extract validation rules per page

**Count Formula:**
```
Category B = (# pages) × 3 scenario types
```

**Example:**
- 12 pages in submission wizard
- 3 scenarios each (happy, required, invalid)
- = 36 scenarios

**Scenarios per Page:**

**1. Happy Path Navigation:**
```gherkin
@page-[X] @navigation @positive
Scenario Outline: Successfully navigate [Page Name] with valid inputs
  Given I am on the "[Page Name]" page
  When I enter "<field1>" as "<value1>"
  And I enter "<field2>" as "<value2>"
  And I click "Next" button
  Then I should be navigated to "[Next Page Name]"
  And the data should be saved
  
  Examples: Valid [Page Name] Data
    | field1      | value1          | field2         | value2    |
    | [Real field] | [Real value 1] | [Real field 2] | [Real val] |
    [5-7 rows with actual field names and values from context]
```

**2. Required Field Validation:**
```gherkin
@page-[X] @validation @negative
Scenario Outline: [Page Name] required field validation
  Given I am on the "[Page Name]" page
  When I leave "<fieldName>" blank
  And I click "Next" button
  Then I should see error message "<errorMessage>"
  And the "Next" button should remain "disabled"
  And I should remain on "[Page Name]" page
  
  Examples: [Page Name] Required Field Errors
    | fieldName        | errorMessage                          |
    | [Actual field 1] | [Actual error message from context]   |
    | [Actual field 2] | [Actual error message from context]   |
    [One row per required field on this page]
```

**3. Invalid Input Validation:**
```gherkin
@page-[X] @validation @negative @format
Scenario Outline: [Page Name] invalid input handling
  Given I am on the "[Page Name]" page
  When I enter "<fieldName>" as "<invalidValue>"
  And I click "Next" button
  Then I should see error message "<errorMessage>"
  And the field should be highlighted in "red"
  And I should remain on "[Page Name]" page
  
  Examples: Invalid Input Scenarios
    | fieldName    | invalidValue | errorMessage                       |
    | Email        | notanemail   | Please enter a valid email address |
    | Revenue      | -1000        | Revenue must be a positive number  |
    | Effective Date | 01/01/2020 | Effective date cannot be in past  |
    [5-7 rows covering different validation types]
```

---

#### **Category C: Decision Point Coverage**

**Rule:** One scenario per option for each decision point

**Identify from Application Context:**
- Dropdowns with multiple options (e.g., Line of Business: Commercial Property, Business Interruption)
- Radio buttons (e.g., Yes/No questions)
- Checkboxes (single or multi-select)
- Conditional fields (if Yes, show section X)

**Count Formula:**
```
Category C = Σ(options per decision point)
```

**Example:**
- Submission Type: 2 options (New Business, Renewal)
- Line of Business: 2 options (Commercial Property, BI)
- 4 Yes/No questions: 2 options each = 8
- API Lookup: 2 outcomes (Success, Failure)
- = 2 + 2 + 8 + 2 = 14 scenarios

**Scenario Pattern:**
```gherkin
@decision-point @[feature]
Scenario Outline: Selecting "<option>" for [Decision Point] results in [Outcome]
  Given I am on "[Page with decision point]"
  When I select "<option>" for "[Decision Point Field]"
  Then the system should behave as "<expectedBehavior>"
  And I should see "<outcome>"
  
  Examples: [Decision Point] Options
    | option              | expectedBehavior       | outcome                  |
    | New Business        | Show submission wizard | Navigate to Page 1       |
    | Renewal             | Show renewal form      | Navigate to Renewal Page |
    | Commercial Property | Enable CP fields       | CP coverage options visible |
    | Business Interruption | Enable BI fields     | BI coverage options visible |
```

---

#### **Category D: Business Rules Coverage**

**Rule:** Each critical/high-priority business rule gets a dedicated scenario

**Identify from Business Rules Context:**
- Extract all business rules
- Classify by priority: Critical, High, Medium, Low
- Create inventory with rule IDs

**Count Formula:**
```
Category D = # Critical rules + # High rules + (30% of Medium rules)
```

**Example:**
- 5 Critical rules
- 8 High rules
- 10 Medium rules × 30% = 3
- = 5 + 8 + 3 = 16 scenarios

**Business Rules Inventory Example:**
```
BR-001 | Validation   | All mandatory fields required          | Critical → Scenario 15
BR-002 | Validation   | Legal Name must match Insured Name     | Critical → Scenario 16
BR-003 | Authorization| Broker cannot access UW dashboard      | Critical → Scenario 22
BR-004 | Calculation  | Premium = (TIV÷100) × Rate × (Term÷12) | High     → Scenario 18
BR-005 | Workflow     | Risk Score ≥40 → Referred to UW         | High     → Scenario 19
BR-006 | Session      | Session timeout after 30 min idle      | Medium   → Scenario 23
```

**Scenario Pattern:**
```gherkin
@business-rule @BR-[XXX] @[category]
Scenario Outline: Enforce business rule BR-[XXX]: [Rule Description]
  Given [precondition for rule testing]
  When [action that should trigger rule]
  Then [expected outcome per rule]
  And [verification that rule was applied]
  
  Examples: BR-[XXX] Test Cases
    | input     | expectedOutcome | ruleVerification |
    | [Valid]   | [Allowed]       | [Rule not triggered] |
    | [Invalid] | [Blocked]       | [Rule triggered with message] |
```

---

#### **Category E: Status Transition Coverage**

**Rule:** 2 scenarios per status transition (forward + blocked)

**Identify from Domain Model:**
- Extract all status/state values (Draft, Referred to UW, Quote Pending, etc.)
- Map valid transitions (state diagram)
- Identify invalid/blocked transitions

**Count Formula:**
```
Category E = (# valid transitions) + (# blocked transitions)
```

**Example:**
- Valid transitions: Draft→Referred to UW, Referred to UW→Quote Pending, Quote Pending→Policy Issued = 3
- Blocked transitions: Quote Pending→Draft, Policy Issued→Draft = 2
- = 3 + 2 = 5 scenarios

**Scenarios:**

**1. Forward Transition:**
```gherkin
@state-transition @workflow @forward
Scenario Outline: Status transitions from "<currentStatus>" to "<newStatus>"
  Given a submission exists with status "<currentStatus>"
  When the "<triggerEvent>" occurs
  Then the status should change to "<newStatus>"
  And the UI should display "<newStatus>"
  And the status history should log the transition
  
  Examples: Valid Status Transitions
    | currentStatus  | triggerEvent      | newStatus          |
    | Draft          | Submit for review | Referred to UW     |
    | Referred to UW | UW accepts quote  | Quote Pending      |
    | Quote Pending  | Binding confirmed | Policy Issued      |
```

**2. Blocked Transition:**
```gherkin
@state-transition @workflow @negative
Scenario Outline: Cannot transition from "<currentStatus>" to "<attemptedStatus>"
  Given a submission exists with status "<currentStatus>"
  When an attempt is made to change status to "<attemptedStatus>"
  Then the transition should be blocked
  And an error message should display "<blockingMessage>"
  And the status should remain "<currentStatus>"
  
  Examples: Invalid/Blocked Transitions
    | currentStatus  | attemptedStatus | blockingMessage                    |
    | Quote Pending  | Draft           | Cannot revert to Draft from Quote Pending |
    | Policy Issued  | Referred to UW  | Policy already issued, cannot change status |
```

---

#### **Category F: API/Integration Coverage**

**Rule:** 2 scenarios per integration point (success + failure)

**Identify from Application Context:**
- INTEGRATION POINTS section
- External API calls (DUNS lookup, payment gateway, etc.)
- Database operations (if external)
- Third-party services (email, notifications, etc.)

**Count Formula:**
```
Category F = (# integration points) × 2 (success + failure)
```

**Example:**
- DUNS/NAICS Lookup API = 1 integration
- = 1 × 2 = 2 scenarios

**Scenarios:**

**1. API Success:**
```gherkin
@integration @api @[service-name] @positive
Scenario Outline: [API Name] successfully enriches data
  Given I am on the "[Page with API trigger]"
  When I click "<apiTriggerButton>"
  Then the API call should complete successfully
  And the "<field1>" should be populated with "<value1>"
  And the "<field2>" should be populated with "<value2>"
  And all enriched fields should be "read-only"
  
  Examples: Successful API Enrichment
    | apiTriggerButton | field1      | value1        | field2      | value2    |
    | Lookup           | DUNS Number | 12-345-6789   | NAICS Code  | 531210    |
```

**2. API Failure:**
```gherkin
@integration @api @[service-name] @negative @exception
Scenario Outline: [API Name] handles failure gracefully
  Given I am on the "[Page with API trigger]"
  And the "[API Service]" is "<serviceState>"
  When I click "<apiTriggerButton>"
  Then I should see error message "<errorMessage>"
  And the enriched fields should remain "empty"
  And I should have option to "<retryAction>"
  
  Examples: API Failure Scenarios
    | serviceState | apiTriggerButton | errorMessage                  | retryAction |
    | unavailable  | Lookup           | Service temporarily unavailable | Retry      |
    | timeout      | Lookup           | Request timed out             | Retry      |
```

---

#### **Category G: Role-Based Access Control (RBAC)**

**Rule:** 2 scenarios per role (positive access + negative access)

**Identify from Application Context:**
- PRIMARY USER ROLES section
- Features/pages accessible per role
- Features/pages NOT accessible per role

**Count Formula:**
```
Category G = (# roles) × 2 (can access + cannot access)
```

**Example:**
- 3 roles (Broker, Underwriter, UW Manager)
- = 3 × 2 = 6 scenarios

**Scenarios:**

**1. Positive Access:**
```gherkin
@rbac @authorization @[role] @positive
Scenario Outline: [Role] can access permitted features
  Given I am logged in as "<role>" with credentials "<username>"
  When I navigate to "<feature>"
  Then I should see the "<feature>" page
  And all "<role>"-specific actions should be available
  
  Examples: Permitted Access per Role
    | role        | username     | feature                  |
    | Broker      | broker1      | Create New Submission    |
    | Underwriter | uw1          | Review Submissions Queue |
    | UW Manager  | manager1     | Override UW Decisions    |
```

**2. Negative Access:**
```gherkin
@rbac @authorization @[role] @negative
Scenario Outline: [Role] cannot access restricted features
  Given I am logged in as "<role>" with credentials "<username>"
  When I attempt to navigate to "<restrictedFeature>"
  Then I should see access denied message "<deniedMessage>"
  And I should be redirected to "<fallbackPage>"
  
  Examples: Restricted Access per Role
    | role        | username | restrictedFeature         | deniedMessage              | fallbackPage       |
    | Broker      | broker1  | Underwriter Dashboard     | Access denied for Broker   | Broker Dashboard   |
    | Underwriter | uw1      | Create New Submission     | Access denied for UW       | UW Dashboard       |
```

---

## Part 2: Scenario Count Estimation

### Quick Reference Table

| Story Complexity | Pages | Decision Points | Roles | Expected Scenario Count |
|------------------|-------|-----------------|-------|-------------------------|
| Simple           | 1-3   | 2-4             | 1     | 10-15 scenarios         |
| Medium           | 4-7   | 5-8             | 2     | 20-30 scenarios         |
| Complex          | 8-12  | 9-15            | 3+    | 35-50 scenarios         |

### Detailed Calculation Formula

```
Total Expected Scenarios = A + B + C + D + E + F + G

Where:
A = (# personas) × (# workflow variants) × (# terminal states)
B = (# pages) × 3
C = Σ(options per decision point)
D = # Critical rules + # High rules
E = (# valid transitions) + (# blocked transitions)
F = (# integration points) × 2
G = (# roles) × 2
```

### Example Calculation (POCTC-01)

```
Story: End-to-End Underwriting Workflow
- 2 personas (Broker, Underwriter)
- 12-page wizard
- 8 decision points
- 8 business rules (5 Critical, 3 High)
- 3 status transitions
- 1 API integration
- 2 roles

Calculation:
A = 2 personas × 2 variants = 4
B = 12 pages × 3 = 36
C = 8 decision points ~ 12 scenarios
D = 5 + 3 = 8
E = 3 valid + 2 blocked = 5
F = 1 API × 2 = 2
G = 2 roles × 2 = 4

Total = 4 + 36 + 12 + 8 + 5 + 2 + 4 = 71 scenarios

Realistic Target: 40-50 scenarios (prioritize Critical/High priority)
```

---

## Part 3: Prioritization Strategy

When you have 70+ potential scenarios, prioritize using this approach:

### Priority 1 - Must Have (Always Generate)
- All Category A scenarios (E2E workflows)
- All Category D scenarios for Critical/High rules
- Category G scenarios (RBAC)
- Category F scenarios (API integrations)

### Priority 2 - Should Have (Generate if time permits)
- Category B scenarios for complex pages (required fields, validation)
- Category C scenarios for critical decision points
- Category E scenarios for key status transitions

### Priority 3 - Nice to Have (Generate if story is complex)
- Category B scenarios for simple pages
- Category C scenarios for minor decision points
- Medium/Low priority business rules

### Optimization: Consolidate Where Possible
- Combine multiple required field validations into one Scenario Outline with multiple Examples
- Combine similar decision points into one scenario with parameterization
- Use Background to reduce repetitive Given steps

---

## Part 4: Acceptance Criteria to Scenario Mapping

### Create Traceability Matrix

**Template:**
```plaintext
AC-1: [First Acceptance Criterion]
  ├─ AC-1.1: [Sub-criterion] → Scenarios [1, 2, 3]
  ├─ AC-1.2: [Sub-criterion] → Scenarios [1, 7]
  └─ AC-1.3: [Sub-criterion] → Scenarios [2, 11]

AC-2: [Second Acceptance Criterion]
  ├─ AC-2.1: [Sub-criterion] → Scenarios [4, 15]
  └─ AC-2.2: [Sub-criterion] → Scenarios [13]
```

**Goal:** 100% acceptance criteria coverage

**Validation:**
- Every AC must map to ≥1 scenario
- Every Given/When/Then in AC must be tested
- No orphan scenarios (not mapped to any AC)

---

## Part 5: Final Coverage Checklist

Before saving feature file, verify:

```plaintext
[ ] All acceptance criteria mapped to scenarios (100%)
[ ] All critical/high business rules tested (100%)
[ ] All user personas have E2E scenarios
[ ] All pages have validation scenarios
[ ] All integrations have success/failure scenarios
[ ] All user roles have RBAC scenarios
[ ] 80%+ scenarios use Scenario Outline
[ ] 5-7 examples per Scenario Outline
[ ] Real data from context files (no placeholders)
[ ] Total scenario count: [Expected ±20%]
```

---

**Usage:** This skill file provides the complete scenario planning and coverage strategy. The agent references this for detailed planning guidance without duplicating 4,000+ lines of content.
