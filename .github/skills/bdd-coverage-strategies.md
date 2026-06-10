---
name: bdd-coverage-strategies
description: Comprehensive strategies for ensuring 100% test coverage of acceptance criteria, business rules, and functional test categories using a 17-category validation checklist and AC matrix.
---

# BDD Test Coverage Strategies

## Purpose
Comprehensive strategies for ensuring 100% test coverage of acceptance criteria, business rules, and functional test categories with validation frameworks.

---

## Overview

Effective test coverage requires systematic tracking of:
1. **Acceptance Criteria** - Every criterion from user story
2. **Business Rules** - All domain-specific validations
3. **Test Categories** - Functional test types (positive, negative, edge cases, etc.)
4. **Quality Metrics** - Measurable quality indicators

**Goal**: 100% AC coverage + 100% BR coverage + 10-15 test categories + Quality Score ≥90

---

## Part 1: Acceptance Criteria Traceability Matrix

### Concept
Map every acceptance criterion (AC) from the user story to specific test scenario(s), ensuring NOTHING is missed.

### Process

#### Step 1: Parse Acceptance Criteria
Extract all acceptance criteria from user story, including:
- Main criteria (AC-1, AC-2, AC-3...)
- Sub-criteria (Given/When/Then within each AC)
- Derived requirements from Description
- Definition of Done (DoD) items

**Example User Story**:
```
Title: User Registration
AC-1: Users can register with email and password
  - Email must be valid format
  - Password must be 8+ characters with 1 uppercase, 1 number
AC-2: System sends confirmation email after registration
  - Email contains activation link
  - Link expires after 24 hours
AC-3: New users are assigned "Standard" role by default
```

#### Step 2: Create Coverage Matrix
```plaintext
[AC-ID] → [Sub-Criteria] → [Scenario Mapping] → [Coverage Status]

AC-1: Users can register with email and password
  ├─ AC-1.1: Email must be valid format → Scenarios [2, 7, 8]
  ├─ AC-1.2: Password 8+ chars → Scenarios [3, 9]
  ├─ AC-1.3: Password 1 uppercase → Scenarios [3, 10]
  └─ AC-1.4: Password 1 number → Scenarios [3, 11]

AC-2: System sends confirmation email
  ├─ AC-2.1: Email contains activation link → Scenario [4]
  └─ AC-2.2: Link expires after 24hrs → Scenario [5]

AC-3: New users assigned "Standard" role
  └─ AC-3.1: Default role is Standard → Scenario [6]
```

#### Step 3: Validate Coverage
```plaintext
VALIDATION RULES:
✅ EVERY AC must have at least ONE scenario
✅ EVERY sub-criterion must be tested
✅ Flag any AC with ZERO scenarios immediately
✅ Document coverage % (total covered / total ACs)

COVERAGE MATRIX:
AC-1: [8 scenarios] ✅
AC-2: [2 scenarios] ✅
AC-3: [1 scenario] ✅

TOTAL: 3/3 Acceptance Criteria (100%) ✅
```

#### Step 4: Document in Feature File
```gherkin
# ==========================================
# ACCEPTANCE CRITERIA COVERAGE MATRIX
# ==========================================
# AC-1: Users can register with email and password → Scenarios [1,2,3,7,8,9,10,11]
#   ├─ AC-1.1: Email valid format → Scenarios [2,7,8]
#   ├─ AC-1.2: Password 8+ chars → Scenarios [3,9]
#   ├─ AC-1.3: Password 1 uppercase → Scenarios [3,10]
#   └─ AC-1.4: Password 1 number → Scenarios [3,11]
#
# AC-2: System sends confirmation email → Scenarios [4,5]
#   ├─ AC-2.1: Email contains activation link → Scenario [4]
#   └─ AC-2.2: Link expires after 24hrs → Scenario [5]
#
# AC-3: New users assigned "Standard" role → Scenario [6]
#   └─ AC-3.1: Default role is Standard → Scenario [6]
#
# COVERAGE: 3/3 Acceptance Criteria (100%) ✅
# ==========================================
```

### Coverage Matrix Template

```plaintext
ACCEPTANCE CRITERIA TRACEABILITY MATRIX
========================================

STORY: [Story ID] - [Story Title]

AC-[ID]: [Acceptance Criterion Title]
  ├─ AC-[ID].1: [Sub-criterion 1] → Scenario(s): [S1, S2, S3]
  ├─ AC-[ID].2: [Sub-criterion 2] → Scenario(s): [S4, S5]
  └─ AC-[ID].3: [Sub-criterion 3] → Scenario(s): [S6]

AC-[ID]: [Next Acceptance Criterion]
  └─ AC-[ID].1: [Sub-criterion 1] → Scenario(s): [S7, S8]

COVERAGE SUMMARY:
------------------
Total Acceptance Criteria: [N]
Criteria with Test Coverage: [N]
Criteria with NO Coverage: [0] ✅
Coverage Percentage: 100% ✅

GAPS IDENTIFIED: None ✅
```

---

## Part 2: Business Rules Inventory & Coverage

### Concept
Every business rule MUST have explicit test scenario(s). Business rules are often implicit and easy to miss.

### Process

#### Step 1: Extract Business Rules
Business rules come from:
- User story description
- MCP Context Server (business_rules context)
- Domain model constraints
- Implicit system behavior

**Example Business Rules** (E-Commerce):
```
BR-001: Orders ≥$100 get 10% discount (Priority: Critical)
BR-002: Maximum 10 items per product in cart (Priority: High)
BR-003: Free shipping for Premium members (Priority: High)
BR-004: Email confirmation sent within 5 minutes (Priority: Medium)
BR-005: Session timeout after 30 minutes inactivity (Priority: Medium)
BR-006: Passwords expire after 90 days (Priority: Low)
```

#### Step 2: Create Business Rules Inventory

```plaintext
BUSINESS RULES INVENTORY
=========================
[Rule ID] | [Category]    | [Rule Description]                      | [Priority] | [Scenario Mapping]

BR-001    | Calculation   | Orders ≥$100 get 10% discount           | Critical   | Scenario [12]
BR-002    | Validation    | Max 10 items per product in cart        | High       | Scenario [13, 14]
BR-003    | Authorization | Free shipping for Premium members       | High       | Scenario [15]
BR-004    | Integration   | Email confirmation within 5 min         | Medium     | Scenario [16]
BR-005    | Session       | Session timeout after 30 min            | Medium     | Not covered ❌
BR-006    | Security      | Passwords expire after 90 days          | Low        | Not covered ❌

COVERAGE: 4/6 Business Rules (67%) ⚠️ GAPS EXIST
```

#### Step 3: Map Rules to Scenarios

```gherkin
# ==========================================
# BUSINESS RULES COVERAGE
# ==========================================
# BR-001: Orders ≥$100 get 10% discount → Scenario [12] | Priority: Critical ✅
# BR-002: Max 10 items per product → Scenarios [13,14] | Priority: High ✅
# BR-003: Free shipping for Premium members → Scenario [15] | Priority: High ✅
# BR-004: Email confirmation within 5 min → Scenario [16] | Priority: Medium ✅
# BR-005: Session timeout after 30 min → NOT COVERED ❌ | Priority: Medium
# BR-006: Passwords expire after 90 days → NOT COVERED ❌ | Priority: Low
#
# COVERAGE: 4/6 Business Rules (67%) ⚠️
# ACTION REQUIRED: Add scenarios for BR-005, BR-006
# ==========================================
```

#### Step 4: Generate Scenarios for Uncovered Rules

If ANY business rule shows "NOT COVERED", generate scenarios immediately:

```gherkin
@business-rule @session-management
Scenario: Session timeout after 30 minutes of inactivity (BR-005)
  Given I am logged in to the application
  And I have been inactive for "29" minutes
  When I perform an action
  Then the session should remain "active"
  
@business-rule @session-timeout
Scenario: Session expires after exceeding timeout
  Given I am logged in to the application
  And I have been inactive for "31" minutes
  When I attempt to perform an action
  Then I should see message "Session expired"
  And I should be redirected to "Login" page
```

### Rule Interaction Testing

Test scenarios where MULTIPLE business rules apply simultaneously:

```gherkin
@business-rule @rule-interaction
Scenario Outline: Multiple business rules applied together
  Given I am a "<member_type>" member
  And I have "<item_count>" items totaling "<order_total>" in cart
  When I proceed to checkout
  Then discount rule "<discount_rule>" should apply
  And shipping rule "<shipping_rule>" should apply
  And final total should be "<final_total>"
  
  Examples: Combined rules scenarios
    | member_type | item_count | order_total | discount_rule | shipping_rule | final_total |
    | Premium     | 5          | $150        | BR-001: 10%   | BR-003: Free  | $135        |
    | Premium     | 12         | $200        | BR-002: Max 10| BR-003: Free  | Error       |
    | Standard    | 5          | $150        | BR-001: 10%   | Standard $10  | $145        |
```

---

## Part 3: Test Category Coverage Checklist

### Functional Test Categories (17 Categories)

Use this checklist to ensure ALL functional test areas are covered:

```plaintext
FUNCTIONAL TEST COVERAGE CATEGORIES
====================================

[ ] 1. HAPPY PATH - Main user flow with valid inputs
      Examples: 2 scenarios
      
[ ] 2. INPUT VALIDATION - Field-level validation (format, length, type)
      Examples: 5 scenarios
      
[ ] 3. BUSINESS RULES - Calculations, constraints, logic enforcement
      Examples: 6 scenarios
      
[ ] 4. AUTHENTICATION - Login, logout, session management
      Examples: 3 scenarios (if applicable)
      
[ ] 5. AUTHORIZATION (RBAC) - Role-based access, permissions per role
      Examples: 4 scenarios (if applicable)
      
[ ] 6. ERROR HANDLING - Invalid inputs, system errors, network failures
      Examples: 7 scenarios
      
[ ] 7. EDGE CASES - Boundary values, null/empty, special characters
      Examples: 8 scenarios
      
[ ] 8. STATE TRANSITIONS - Workflow states, status changes
      Examples: 5 scenarios (if applicable)
      
[ ] 9. DATA INTEGRITY - Cross-entity validation, referential integrity
      Examples: 3 scenarios (if applicable)
      
[ ] 10. NAVIGATION - Menu, breadcrumbs, back/forward, deep links
       Examples: 2 scenarios
       
[ ] 11. USER JOURNEYS - Multi-step workflows, end-to-end scenarios
       Examples: 3 scenarios
       
[ ] 12. ALTERNATIVE FLOWS - User deviations, cancel/back actions
       Examples: 4 scenarios
       
[ ] 13. EXCEPTION FLOWS - System failures, timeouts, concurrent access
       Examples: 3 scenarios
       
[ ] 14. PRECONDITIONS - Required system state, dependencies
       Covered in Background or Given steps
       
[ ] 15. INTEGRATION POINTS - APIs, third-party services, databases
       Examples: 2 scenarios (if applicable)
       
[ ] 16. DEPENDENT FEATURES - Impact on related modules/features
       Examples: 2 scenarios (if applicable)
       
[ ] 17. DEFINITION OF DONE - All DoD items from story
       Examples: Varies based on DoD

COVERAGE TARGET: Check ≥10 categories (ideally 12-15)
ACTUAL COVERAGE: [N/17] categories
STATUS: ✅ Pass (≥10) / ⚠️ Need More (8-9) / ❌ Insufficient (<8)
```

### Category Coverage Documentation

```gherkin
# ==========================================
# TEST CATEGORY COVERAGE (Step 1.6 Checklist)
# ==========================================
# ✅ Happy Path: 2 scenarios [S1, S6]
# ✅ Input Validation: 5 scenarios [S2, S7, S8, S9, S10]
# ✅ Business Rules: 6 scenarios [S12, S13, S14, S15, S16, S17]
# ✅ Authorization (RBAC): 4 scenarios [S18, S19, S20, S21]
# ✅ Error Handling: 7 scenarios [S22-S28]
# ✅ Edge Cases: 8 scenarios [S29-S36]
# ✅ User Journeys: 3 scenarios [S37, S38, S39]
# ✅ Alternative Flows: 4 scenarios [S40, S41, S42, S43]
# ✅ Exception Flows: 3 scenarios [S44, S45, S46]
# ✅ Data Integrity: 2 scenarios [S47, S48]
# ✅ Navigation: 2 scenarios [S49, S50]
# ⚠️ Authentication: N/A (no auth in this story)
# ⚠️ State Transitions: N/A (no workflow in this story)
# ⚠️ Integration Points: N/A (no external integrations)
#
# CATEGORIES COVERED: 11/17 (Target: ≥10) ✅
# STATUS: PASS - Comprehensive coverage achieved
# ==========================================
```

---

## Part 4: Quality Score Framework

### Quality Scoring Criteria (100 points total)

#### 1. Acceptance Criteria Coverage (30 points)
- **30 points**: 100% AC coverage
- **20 points**: 80-99% AC coverage
- **10 points**: 60-79% AC coverage
- **0 points**: <60% AC coverage

#### 2. Business Rules Coverage (25 points)
- **25 points**: 100% BR coverage
- **18 points**: 80-99% BR coverage
- **10 points**: 60-79% BR coverage
- **0 points**: <60% BR coverage

#### 3. Parameterization Level (20 points)
- **20 points**: ≥80% scenarios are Scenario Outline
- **15 points**: 60-79% parameterized
- **10 points**: 40-59% parameterized
- **0 points**: <40% parameterized

#### 4. Test Data Quality (15 points)
- **15 points**: Avg ≥5 Examples rows per Scenario Outline
- **10 points**: Avg 3-4 Examples rows
- **5 points**: Avg 2 Examples rows
- **0 points**: Avg <2 Examples rows

#### 5. Test Design Techniques Applied (10 points)
- **10 points**: Applied 3+ techniques (EP, BVA, Decision Tables, State Transitions)
- **7 points**: Applied 2 techniques
- **4 points**: Applied 1 technique
- **0 points**: No systematic techniques

### Quality Score Calculation Example

```plaintext
==========================================
QUALITY SCORE CALCULATION
==========================================

1. Acceptance Criteria Coverage
   - Total ACs: 5
   - Covered: 5
   - Coverage: 100%
   - Score: 30/30 ✅

2. Business Rules Coverage
   - Total BRs: 8
   - Covered: 8
   - Coverage: 100%
   - Score: 25/25 ✅

3. Parameterization Level
   - Total Scenarios: 25
   - Scenario Outlines: 22
   - Parameterization: 88%
   - Score: 20/20 ✅

4. Test Data Quality
   - Total Examples Rows: 132
   - Total Scenario Outlines: 22
   - Avg Examples/Outline: 6
   - Score: 15/15 ✅

5. Test Design Techniques
   - EP: ✅ Applied
   - BVA: ✅ Applied
   - Decision Tables: ✅ Applied
   - State Transitions: ⚠️ N/A
   - Techniques Applied: 3
   - Score: 10/10 ✅

==========================================
TOTAL QUALITY SCORE: 100/100 ✅
GRADE: A (Excellent)
READY FOR EXECUTION: YES ✅
==========================================
```

### Quality Grades

- **90-100**: Excellent (Grade A) - Production ready
- **80-89**: Good (Grade B) - Minor improvements needed
- **70-79**: Acceptable (Grade C) - Significant gaps exist
- **<70**: Poor (Grade F) - Major rework required

---

## Part 5: Gap Analysis & Resolution

### Gap Identification Process

#### Step 1: Run Coverage Validation Checks

```plaintext
COVERAGE VALIDATION CHECKS
===========================

CHECK 1: Acceptance Criteria
QUERY: Are there any ACs with zero scenario mapping?
RESULT: AC-4 has no scenarios ❌
ACTION: Generate scenarios for AC-4

CHECK 2: Business Rules
QUERY: Are there any BRs marked "Not covered"?
RESULT: BR-005, BR-006 not covered ❌
ACTION: Generate scenarios for BR-005, BR-006

CHECK 3: Test Categories
QUERY: How many categories are covered?
RESULT: 8/17 categories ⚠️
ACTION: Add scenarios for User Journeys, Alternative Flows

CHECK 4: Test Design Techniques
QUERY: Which techniques are missing?
RESULT: No BVA applied ❌
ACTION: Add boundary value scenarios

CHECK 5: Examples Tables
QUERY: Are all Scenario Outlines using ≥5 Examples rows?
RESULT: Scenario [S7] has only 2 rows ❌
ACTION: Expand Examples table with more test data
```

#### Step 2: Prioritize Gaps

```plaintext
GAP PRIORITIZATION
==================

CRITICAL (Must Fix):
- Missing AC coverage (AC-4) → IMMEDIATE
- Business rule gaps (BR-005, BR-006) → HIGH PRIORITY
- Quality score <90 → IMPORTANT

IMPORTANT (Should Fix):
- Test categories <10 → ADD 2-3 MORE CATEGORIES
- Missing techniques (BVA) → APPLY WHERE RELEVANT

NICE TO HAVE (Optional):
- Expand Examples tables from 5 to 7 rows → ENHANCED COVERAGE
```

#### Step 3: Generate Missing Scenarios

For each identified gap, generate appropriate scenario(s):

**Example - Gap: AC-4 Not Covered**:
```gherkin
@acceptance-criteria @AC-4
Scenario Outline: Verify AC-4 - User can reset password
  Given I am on "Forgot Password" page  When I enter "<email>" and request reset
  Then I should receive password reset email at "<email>"
  And email should contain valid reset link
  
  Examples:
    | email              |
    | user1@example.com  |
    | user2@example.com  |
    | user3@example.com  |
```

#### Step 4: Re-Validate Coverage

After generating missing scenarios, re-run all validation checks until:
- ✅ 100% AC coverage
- ✅ 100% BR coverage
- ✅ ≥10 test categories covered
- ✅ Quality score ≥90

---

## Part 6: Final Validation Summary Template

Use this template before saving the feature file:

```plaintext
==========================================
FINAL VALIDATION SUMMARY
==========================================

ACCEPTANCE CRITERIA COVERAGE:
- Total Acceptance Criteria: [N]
- Criteria Covered: [N]
- Coverage: 100% ✅
- Gaps: None ✅

BUSINESS RULES COVERAGE:
- Total Business Rules: [N]
- Rules Covered: [N]
- Coverage: 100% ✅
- Gaps: None ✅

TEST CATEGORY COVERAGE:
- Categories Covered: [N/17] (Target: ≥10)
- Status: ✅ Pass / ⚠️ Close / ❌ Insufficient
- Categories:
  ✅ Happy Path: [X] scenarios
  ✅ Input Validation: [Y] scenarios
  ✅ Business Rules: [Z] scenarios
  ... [list all applicable categories]

PARAMETERIZATION METRICS:
- Total Scenarios: [N]
- Scenario Outlines: [M]
- Simple Scenarios: [N-M]
- Parameterization %: [M/N × 100]%
- Target: ≥80% ✅

TEST DATA METRICS:
- Total Examples Rows: [N]
- Total Scenario Outlines: [M]
- Avg Examples/Outline: [N/M]
- Target: ≥5 ✅

TEST DESIGN TECHNIQUES APPLIED:
✅ Equivalence Partitioning
✅ Boundary Value Analysis
✅ Decision Tables
⚠️ State Transitions (N/A - no workflow)
✅ Error Guessing

QUALITY SCORE:
- AC Coverage (30): [Score]/30
- BR Coverage (25): [Score]/25
- Parameterization (20): [Score]/20
- Test Data (15): [Score]/15
- Techniques (10): [Score]/10
- TOTAL: [Score]/100
- GRADE: [A/B/C/F]

CRITICAL COVERAGE AREAS:
- User Journeys: ✅ Covered / ⚠️ N/A
- RBAC: ✅ Covered / ⚠️ N/A
- Data Integrity: ✅ Covered / ⚠️ N/A
- Dependent Features: ✅ Covered / ⚠️ N/A
- Definition of Done: ✅ Covered / ⚠️ N/A

GAPS IDENTIFIED: None ✅ / [List gaps] ❌
READY TO SAVE: YES ✅ / NO ❌
==========================================
```

### Decision Matrix

```plaintext
SAVE FILE DECISION:
===================

IF (AC Coverage = 100%)
AND (BR Coverage = 100%)
AND (Test Categories ≥ 10)
AND (Quality Score ≥ 90)
AND (No gaps identified)
THEN → ✅ SAVE FILE

ELSE → ❌ DO NOT SAVE
     → Generate additional scenarios
     → Re-validate coverage
     → Repeat until all criteria met
```

---

## Part 7: Coverage Anti-Patterns to Avoid

### Anti-Pattern 1: Incomplete AC Mapping
❌ **WRONG**:
```
AC-1: User can submit feedback → Scenario [S1]
[No mapping for sub-criteria]
```

✅ **CORRECT**:
```
AC-1: User can submit feedback
  ├─ AC-1.1: Feedback form has Name, Email, Message → Scenario [S1]
  ├─ AC-1.2: All fields are mandatory → Scenario [S2, S3, S4]
  └─ AC-1.3: Confirmation email sent → Scenario [S5]
```

### Anti-Pattern 2: Ignoring Implicit Business Rules
❌ **WRONG**: Only test explicit rules from story

✅ **CORRECT**: Extract rules from:
- Story description
- MCP business rules context
- Domain model constraints
- System behavior expectations

### Anti-Pattern 3: Low Test Category Coverage
❌ **WRONG**: Only covering 5-6 categories (Happy Path, Validation, Errors)

✅ **CORRECT**: Cover 10-15 categories including User Journeys, RBAC, Data Integrity, Alternative Flows

### Anti-Pattern 4: Low Quality Score
❌ **WRONG**: Accepting quality score <80

✅ **CORRECT**: Iterate until quality score ≥90

---

## Summary

### Coverage Formula

```
Complete Coverage = (AC Coverage × 30%)
                  + (BR Coverage × 25%)
                  + (Test Categories × 20%)
                  + (Parameterization × 15%)
                  + (Test Data Quality × 10%)

TARGET: ≥90% for production-ready test suite
```

### Coverage Checklist

Before saving feature file, verify:
- [ ] 100% Acceptance Criteria coverage with traceability matrix
- [ ] 100% Business Rules coverage with inventory
- [ ] ≥10 test categories covered from 17 categories checklist
- [ ] ≥80% scenarios are Scenario Outline with Examples
- [ ] ≥5 average Examples rows per Scenario Outline
- [ ] Applied 3+ test design techniques
- [ ] Quality score ≥90/100
- [ ] No gaps identified in validation summary
- [ ] Critical coverage areas addressed (User Journeys, RBAC, Data Integrity)

### Key Takeaways

✅ **Systematic over Ad-Hoc**: Use matrices and checklists, not intuition

✅ **100% AC/BR Coverage**: Non-negotiable requirement

✅ **Comprehensive Categories**: Cover 10-15 test categories, not just happy path

✅ **Quality Score ≥90**: Measurable quality gate before saving

✅ **Gap Resolution**: Identify and resolve gaps immediately, don't skip
