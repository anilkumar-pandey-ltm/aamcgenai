---
name: test-design-techniques
description: Systematic test design techniques for BDD covering Equivalence Partitioning, Boundary Value Analysis, Decision Tables, State Transitions, and Use Case Testing to maximize scenario coverage with minimum redundancy.
---

# Test Design Techniques for BDD

## Purpose
Comprehensive guide to systematic test design techniques for creating thorough BDD scenarios with maximum coverage using minimum test cases.

---

## Overview of Test Design Techniques

Test design techniques help identify the RIGHT test cases systematically, avoiding:
- ❌ Random/unstructured test identification
- ❌ Over-testing (too many redundant tests)
- ❌ Under-testing (missing critical scenarios)

**Benefits**:
- ✅ Systematic test identification
- ✅ Maximum coverage with minimum tests
- ✅ Reduced redundancy
- ✅ Clear coverage justification

---

## Technique 1: Equivalence Partitioning (EP)

### Concept
Group input values into equivalence classes where all values in a class are expected to behave the same way.

**Rule**: Test ONE value from each equivalence class instead of testing every possible value.

### Process
1. **Identify input fields and their constraints**
2. **Divide into valid and invalid classes**
3. **Select representative values from each class**
4. **Create test cases for each equivalence class**

### Example 1: Email Field Validation

**Constraints**: Must be valid email format (name@domain.extension)

**Equivalence Classes**:

| Class ID | Class Type | Description | Representative Value | Expected Result |
|----------|-----------|-------------|---------------------|-----------------|
| EC-1     | Valid     | Standard email | john.doe@example.com | Accepted |
| EC-2     | Valid     | Email with + sign | john+tag@example.com | Accepted |
| EC-3     | Valid     | Email with subdomain | user@mail.example.com | Accepted |
| EC-4     | Valid     | Email with numbers | user123@example.com | Accepted |
| EC-5     | Invalid   | Missing @ symbol | userexample.com | Rejected |
| EC-6     | Invalid   | Missing domain | user@ | Rejected |
| EC-7     | Invalid   | Missing local part | @example.com | Rejected |
| EC-8     | Invalid   | Special chars in domain | user@exa!mple.com | Rejected |
| EC-9     | Invalid   | Empty field | [empty] | Rejected |

**BDD Scenario**:
```gherkin
@equivalence-partitioning @validation
Scenario Outline: Email field validation using EP
  Given I am on registration page
  When I enter "<email>" in "Email" field
  Then validation result should be "<result>"
  And I should see "<feedback>"
  
  Examples: Email equivalence classes
    | email                  | result   | feedback                | class_id |
    | john.doe@example.com   | accepted | Valid email             | EC-1     |
    | john+tag@example.com   | accepted | Valid email             | EC-2     |
    | user@mail.example.com  | accepted | Valid email             | EC-3     |
    | user123@example.com    | accepted | Valid email             | EC-4     |
    | userexample.com        | rejected | Email must contain @    | EC-5     |
    | user@                  | rejected | Domain part required    | EC-6     |
    | @example.com           | rejected | Username required       | EC-7     |
    | user@exa!mple.com      | rejected | Invalid domain format   | EC-8     |
    | [empty]                | rejected | Email is required       | EC-9     |
```

### Example 2: Age Field (Numeric Range)

**Constraints**: Age must be between 18 and 65

**Equivalence Classes**:

| Class ID | Class Type | Description | Representative Value | Expected |
|----------|-----------|-------------|---------------------|----------|
| EC-1     | Valid     | Within range 18-65 | 25 | Accepted |
| EC-2     | Valid     | Minimum boundary (18) | 18 | Accepted |
| EC-3     | Valid     | Maximum boundary (65) | 65 | Accepted |
| EC-4     | Invalid   | Below minimum (<18) | 15 | Rejected |
| EC-5     | Invalid   | Above maximum (>65) | 70 | Rejected |
| EC-6     | Invalid   | Negative number | -5 | Rejected |
| EC-7     | Invalid   | Zero | 0 | Rejected |
| EC-8     | Invalid   | Non-numeric | abc | Rejected |

**BDD Scenario**:
```gherkin
@equivalence-partitioning @age-validation
Scenario Outline: Age validation using equivalence partitioning
  Given I am on registration form
  When I enter "<age>" in "Age" field
  Then validation should be "<result>"
  And I should see message "<message>"
  
  Examples: Age equivalence classes with boundaries
    | age | result   | message                    | class_id | partition_type |
    | 25  | accepted | Valid age                  | EC-1     | valid_mid      |
    | 18  | accepted | Valid age                  | EC-2     | valid_min      |
    | 65  | accepted | Valid age                  | EC-3     | valid_max      |
    | 15  | rejected | Age must be at least 18    | EC-4     | invalid_low    |
    | 70  | rejected | Age must not exceed 65     | EC-5     | invalid_high   |
    | -5  | rejected | Age must be positive       | EC-6     | invalid_negative |
    | 0   | rejected | Age must be at least 18    | EC-7     | invalid_zero   |
    | abc | rejected | Age must be a number       | EC-8     | invalid_format |
```

---

## Technique 2: Boundary Value Analysis (BVA)

### Concept
Test at the boundaries of equivalence classes, as errors often occur at edges.

**Test Values**: Min-1, Min, Mid, Max, Max+1

### Process
1. **Identify input boundaries** (minimum, maximum, length limits)
2. **Select test values**: Just below boundary, at boundary, just above boundary
3. **Create test cases for each boundary point**

### Example 1: Username Length (3-20 characters)

**Boundaries**: 
- Minimum: 3 characters
- Maximum: 20 characters

**BVA Test Values**:

| Test Point | Value | Length | Expected Result | Rationale |
|-----------|-------|--------|----------------|-----------|
| min-1     | "ab"  | 2      | Invalid        | Below minimum |
| min       | "abc" | 3      | Valid          | At minimum boundary |
| min+1     | "abcd"| 4      | Valid          | Just above minimum |
| mid       | "username01" | 11 | Valid       | Middle of range |
| max-1     | "a...z" (19 chars) | 19 | Valid | Just below maximum |
| max       | "a...z0" (20 chars) | 20 | Valid | At maximum boundary |
| max+1     | "a...z01" (21 chars) | 21 | Invalid | Above maximum |

**BDD Scenario**:
```gherkin
@boundary-value-analysis @username
Scenario Outline: Username length boundary value testing
  Given I am on registration page
  When I enter username with "<test_value>" of length "<length>"
  Then validation result should be "<result>"
  And I should see "<message>"
  
  Examples: Boundary values for username length (3-20 chars)
    | test_value           | length | result  | message                        | bva_point |
    | ab                   | 2      | invalid | Username must be at least 3    | min-1     |
    | abc                  | 3      | valid   | Valid username                 | min       |
    | abcd                 | 4      | valid   | Valid username                 | min+1     |
    | username01           | 11     | valid   | Valid username                 | mid       |
    | usernameusername123  | 19     | valid   | Valid username                 | max-1     |
    | usernameusername1234 | 20     | valid   | Valid username                 | max       |
    | usernameusername12345| 21     | invalid | Username must not exceed 20    | max+1     |
```

### Example 2: Order Quantity (1-999)

**Boundaries**:
- Minimum: 1 item
- Maximum: 999 items

**BVA Test Values**:

| Test Point | Value | Expected | Rationale |
|-----------|-------|----------|-----------|
| min-1     | 0     | Invalid  | Below minimum |
| min       | 1     | Valid    | At minimum |
| min+1     | 2     | Valid    | Just above min |
| mid       | 500   | Valid    | Middle range |
| max-1     | 998   | Valid    | Just below max |
| max       | 999   | Valid    | At maximum |
| max+1     | 1000  | Invalid  | Above maximum |

**BDD Scenario**:
```gherkin
@boundary-value-analysis @quantity
Scenario Outline: Order quantity boundary testing
  Given I have product "Widget A" in cart
  When I set quantity to "<quantity>"
  Then order should be "<validation_result>"
  And I should see "<message>"
  And "Checkout" button should be "<button_state>"
  
  Examples: BVA for quantity (1-999)
    | quantity | validation_result | message                      | button_state | bva_point |
    | 0        | invalid           | Quantity must be at least 1  | disabled     | min-1     |
    | 1        | valid             | -                            | enabled      | min       |
    | 2        | valid             | -                            | enabled      | min+1     |
    | 500      | valid             | -                            | enabled      | mid       |
    | 998      | valid             | -                            | enabled      | max-1     |
    | 999      | valid             | -                            | enabled      | max       |
    | 1000     | invalid           | Quantity must not exceed 999 | disabled     | max+1     |
```

---

## Technique 3: Decision Tables

### Concept
Model complex business logic with multiple conditions by creating a table of all condition combinations and their expected outcomes.

**Formula**: For N boolean conditions, create 2^N test cases.

### Process
1. **Identify all conditions** that affect the outcome
2. **List all possible combinations** of conditions (True/False)
3. **Determine expected action/outcome** for each combination
4. **Create test cases** for each row in decision table

### Example: Discount Eligibility

**Business Rules**:
- Discount applies if:
  - Member = Premium OR Standard
  - Order Total ≥ $100
  - First Purchase = Any

**Conditions** (3 conditions → 2^3 = 8 combinations):

| Rule# | Member Type | Order Total | First Purchase | Discount% | Outcome |
|-------|------------|-------------|----------------|-----------|---------|
| 1     | Premium    | ≥$100       | Yes            | 20%       | Applied |
| 2     | Premium    | ≥$100       | No             | 20%       | Applied |
| 3     | Premium    | <$100       | Yes            | 10%       | Applied |
| 4     | Premium    | <$100       | No             | 10%       | Applied |
| 5     | Standard   | ≥$100       | Yes            | 15%       | Applied |
| 6     | Standard   | ≥$100       | No             | 15%       | Applied |
| 7     | Standard   | <$100       | Yes            | 0%        | None    |
| 8     | Standard   | <$100       | No             | 0%        | None    |
| 9     | Guest      | ≥$100       | Yes            | 0%        | None    |
| 10    | Guest      | <$100       | Yes            | 0%        | None    |

**BDD Scenario**:
```gherkin
@decision-table @discount-rules
Scenario Outline: Discount calculation based on decision table
  Given I am a "<member_type>" member
  And I am placing "<purchase_type>" purchase
  When I add items totaling "<order_total>" to cart
  And I proceed to checkout
  Then discount percentage should be "<discount_percent>"
  And final price should be "<final_price>"
  And I should see "<discount_message>"
  
  Examples: All combination rules for discount eligibility
    | rule | member_type | order_total | purchase_type | discount_percent | final_price | discount_message     |
    | R1   | Premium     | $150        | First         | 20%              | $120        | Premium 20% applied  |
    | R2   | Premium     | $150        | Repeat        | 20%              | $120        | Premium 20% applied  |
    | R3   | Premium     | $50         | First         | 10%              | $45         | Premium 10% applied  |
    | R4   | Premium     | $50         | Repeat        | 10%              | $45         | Premium 10% applied  |
    | R5   | Standard    | $150        | First         | 15%              | $127.50     | Standard 15% applied |
    | R6   | Standard    | $150        | Repeat        | 15%              | $127.50     | Standard 15% applied |
    | R7   | Standard    | $50         | First         | 0%               | $50         | No discount          |
    | R8   | Standard    | $50         | Repeat        | 0%               | $50         | No discount          |
    | R9   | Guest       | $150        | First         | 0%               | $150        | Register for discount|
    | R10  | Guest       | $50         | First         | 0%               | $50         | Register for discount|
```

### Collapsed Decision Table (Optimized)

**Optimization**: Combine rows with same outcome to reduce test cases.

| Rule# | Member Type | Order Total | Discount% | Test Cases Covered |
|-------|------------|-------------|-----------|-------------------|
| R1    | Premium    | ≥$100       | 20%       | R1, R2 (any purchase type) |
| R2    | Premium    | <$100       | 10%       | R3, R4 (any purchase type) |
| R3    | Standard   | ≥$100       | 15%       | R5, R6 (any purchase type) |
| R4    | Standard   | <$100       | 0%        | R7, R8 (any purchase type) |
| R5    | Guest      | Any         | 0%        | R9, R10 (all guest orders) |

**Optimized BDD Scenario** (5 tests instead of 10):
```gherkin
@decision-table-optimized @discount
Scenario Outline: Optimized discount rules (collapsed decision table)
  Given I am a "<member_type>" member
  When My order total is "<order_total>"
  Then I should receive "<discount_percent>" discount
  
  Examples: Collapsed decision table (reduced from 10 to 5 rules)
    | member_type | order_total | discount_percent | rules_covered |
    | Premium     | $150        | 20%              | R1,R2         |
    | Premium     | $50         | 10%              | R3,R4         |
    | Standard    | $150        | 15%              | R5,R6         |
    | Standard    | $50         | 0%               | R7,R8         |
    | Guest       | $100        | 0%               | R9,R10        |
```

---

## Technique 4: State Transition Testing

### Concept
Test workflows where an entity moves through different states, ensuring all valid transitions work and invalid transitions are blocked.

**Components**:
- **States**: Possible conditions of the entity
- **Transitions**: Events that cause state changes
- **Actions**: What the system does during transition
- **Guards**: Conditions that allow/block transitions

### Process
1. **Identify all possible states**
2. **Map allowed transitions** between states
3. **Identify triggers** (events) for each transition
4. **Test all valid state transitions**
5. **Test invalid state transitions** (should be blocked)

### Example: Order Lifecycle

**States**: Draft, Submitted, Approved, Rejected, Shipped, Delivered, Cancelled

**State Transition Diagram**:
```
Draft → Submit → Submitted
Submitted → Approve → Approved
Submitted → Reject → Rejected
Approved → Ship → Shipped
Shipped → Deliver → Delivered
Draft → Cancel → Cancelled (any time before Shipped)
Submitted → Cancel → Cancelled
```

**Valid Transitions Table**:

| From State | Event   | To State  | System Action | Guard Condition |
|-----------|---------|-----------|---------------|-----------------|
| Draft     | Submit  | Submitted | Send notification | Items > 0 |
| Submitted | Approve | Approved  | Reserve stock | Manager role |
| Submitted | Reject  | Rejected  | Send rejection | Manager role |
| Approved  | Ship    | Shipped   | Generate tracking | Stock available |
| Shipped   | Deliver | Delivered | Send confirmation | Tracking confirmed |
| Draft     | Cancel  | Cancelled | Release items | Before submit |
| Submitted | Cancel  | Cancelled | Refund payment | Before shipping |

**Invalid Transitions** (should be blocked):
- Draft → Approved (must go through Submitted)
- Shipped → Draft (can't go backward)
- Delivered → Cancelled (too late)

**BDD Scenario - Valid Transitions**:
```gherkin
@state-transition @valid-transitions
Scenario Outline: Valid order state transitions
  Given order is in "<initial_state>" state
  And user has "<user_role>" role
  When "<trigger_event>" occurs
  Then order should transition to "<final_state>" state
  And system should perform "<system_action>"
  And user should see message "<user_message>"
  
  Examples: All valid state transitions
    | initial_state | trigger_event | user_role | final_state | system_action         | user_message           |
    | Draft         | Submit        | Customer  | Submitted   | Send notification     | Order submitted        |
    | Submitted     | Approve       | Manager   | Approved    | Reserve stock         | Order approved         |
    | Submitted     | Reject        | Manager   | Rejected    | Send rejection email  | Order rejected         |
    | Approved      | Ship          | Warehouse | Shipped     | Generate tracking #   | Order shipped          |
    | Shipped       | Deliver       | Delivery  | Delivered   | Send confirmation     | Order delivered        |
    | Draft         | Cancel        | Customer  | Cancelled   | Release items         | Order cancelled        |
    | Submitted     | Cancel        | Customer  | Cancelled   | Refund payment        | Order cancelled        |
```

**BDD Scenario - Invalid Transitions**:
```gherkin
@state-transition @invalid-transitions
Scenario Outline: Block invalid state transitions
  Given order is in "<current_state>" state
  When user attempts "<invalid_action>"
  Then the action should be "blocked"
  And order should remain in "<current_state>" state
  And user should see error "<error_message>"
  
  Examples: Invalid state transitions that should be blocked
    | current_state | invalid_action | error_message                           |
    | Draft         | Approve        | Order must be submitted first           |
    | Draft         | Ship           | Order must be approved first            |
    | Shipped       | Cancel         | Cannot cancel order after shipping      |
    | Delivered     | Cancel         | Cannot cancel delivered order           |
    | Cancelled     | Approve        | Cannot approve cancelled order          |
    | Rejected      | Ship           | Cannot ship rejected order              |
```

---

## Technique 5: Pairwise Testing (Orthogonal Arrays)

### Concept
For systems with multiple parameters, test all **pairs** of values instead of all combinations, significantly reducing test count while maintaining high defect detection.

**Example**: 3 parameters with 3 values each → 3^3 = 27 combinations → Pairwise = 9 tests (covers 100% of pairs)

### Example: Cross-Browser Testing

**Parameters**:
- Browser: Chrome, Firefox, Edge (3 values)
- OS: Windows, MacOS, Linux (3 values)
- Screen: Desktop, Tablet, Mobile (3 values)

**Full Coverage**: 3 × 3 × 3 = 27 test combinations

**Pairwise Coverage**: 9 tests (covers all pairs)

**BDD Scenario**:
```gherkin
@pairwise-testing @cross-browser
Scenario Outline: Cross-platform compatibility using pairwise testing
  Given I am using "<browser>" browser
  And I am on "<os>" operating system
  And I am testing on "<screen_size>" device
  When I navigate to application
  Then application should load successfully
  And all features should be functional
  
  Examples: Pairwise coverage (9 tests instead of 27)
    | test# | browser | os      | screen_size | pairs_covered                    |
    | 1     | Chrome  | Windows | Desktop     | Chrome-Windows, Chrome-Desktop, Windows-Desktop |
    | 2     | Chrome  | MacOS   | Tablet      | Chrome-MacOS, Chrome-Tablet, MacOS-Tablet |
    | 3     | Chrome  | Linux   | Mobile      | Chrome-Linux, Chrome-Mobile, Linux-Mobile |
    | 4     | Firefox | Windows | Tablet      | Firefox-Windows, Firefox-Tablet, Windows-Tablet |
    | 5     | Firefox | MacOS   | Mobile      | Firefox-MacOS, Firefox-Mobile, MacOS-Mobile |
    | 6     | Firefox | Linux   | Desktop     | Firefox-Linux, Firefox-Desktop, Linux-Desktop |
    | 7     | Edge    | Windows | Mobile      | Edge-Windows, Edge-Mobile, Windows-Mobile |
    | 8     | Edge    | MacOS   | Desktop     | Edge-MacOS, Edge-Desktop, MacOS-Desktop |
    | 9     | Edge    | Linux   | Tablet      | Edge-Linux, Edge-Tablet, Linux-Tablet |
```

---

## Technique 6: Error Guessing

### Concept
Use experience and intuition to guess WHERE errors are likely to occur, based on:
- Common defect patterns
- Historical bugs
- Complex areas of code
- Integration points

### Common Error-Prone Areas

1. **Null/Empty Values**: Missing data
2. **Special Characters**: Unicode, SQL injection attempts
3. **Large Numbers**: Integer overflow
4. **Date/Time**: Timezones, DST, Feb 29
5. **Concurrent Access**: Race conditions
6. **Network Issues**: Timeouts, disconnections

**BDD Scenario Example**:
```gherkin
@error-guessing @edge-cases
Scenario Outline: Test error-prone scenarios based on experience
  Given I am testing "<feature>"
  When I test with "<error_prone_input>"
  Then system should handle gracefully with "<expected_behavior>"
  
  Examples: Common error-prone scenarios
    | feature       | error_prone_input      | expected_behavior        |
    | Name Field    | O'Brien                | Accept apostrophe        |
    | Search        | <script>alert()</script> | Sanitize XSS attempt   |
    | Amount        | 999999999999           | Handle large numbers     |
    | Date          | 2024-02-29             | Validate leap year       |
    | Upload        | 10GB file              | Reject size limit        |
```

---

## Combining Multiple Techniques

### Best Practice: Layered Approach

1. **Start with EP** - Identify equivalence classes
2. **Add BVA** - Test boundaries of each class
3. **Apply Decision Tables** - For complex multi-condition logic
4. **Add State Transitions** - For workflow testing
5. **Sprinkle Error Guessing** - For edge cases

**Combined Example**:
```gherkin
Feature: User Registration (Combining EP, BVA, Decision Table)
  
  @equivalence-partitioning @boundary-value
  Scenario Outline: Email validation (EP + BVA)
    [EP: valid/invalid classes]
    [BVA: length boundaries]
  
  @decision-table
  Scenario Outline: Account type determination (Decision Table)
    [All combinations of: age, country, premium status]
  
  @state-transition
  Scenario Outline: Account activation workflow (State Transition)
    [Stages: Registered → Email Verified → Active]
```

---

## Technique Selection Guide

| Technique | Use When | Example Scenarios |
|-----------|----------|-------------------|
| **Equivalence Partitioning** | Multiple input fields with distinct valid/invalid groups | Email format, dropdown selections |
| **Boundary Value Analysis** | Numeric ranges, length constraints | Age (18-65), username length (3-20) |
| **Decision Tables** | Complex business rules with multiple conditions | Discount eligibility, access control |
| **State Transitions** | Workflow with multiple stages | Order lifecycle, approval process |
| **Pairwise Testing** | Many parameters, need to reduce test count | Cross-browser, configuration combinations |
| **Error Guessing** | Known problem areas, edge cases | Special characters, null values, large data |

---

## Functional Testing Scope & Performance Exclusions

### ⚠️ CRITICAL: These Techniques Apply to Functional Testing ONLY

All test design techniques in this document are intended for **FUNCTIONAL TESTING** of application behavior, business logic, data validation, and user workflows.

**Test design techniques (EP, BVA, Decision Tables, etc.) DO NOT apply to:**
- ❌ Performance testing (response time, page load speed)
- ❌ Security testing (penetration, XSS, SQL injection)
- ❌ Load/stress testing (concurrent users, scalability)
- ❌ Accessibility testing (WCAG compliance, screen readers)

---

### 🚫 Performance Testing — Strict Prohibition

**The following are ALL considered performance testing and are STRICTLY PROHIBITED:**

| Prohibited Pattern | Example (DO NOT CREATE) | Why It's Wrong |
|-------------------|-------------------------|----------------|
| Timing assertions | `Then the modal should appear within "3" seconds` | Tests response time, not functionality |
| Response time checks | `And the page should load in "≤2s"` | Performance metric, not functional behavior |
| Millisecond/second benchmarks | `Then API response time should be "<500ms"` | Timing threshold testing |
| BVA applied to timing | `Scenario: Modal timing BVA — min/max response time` | BVA for performance, not data |
| Load time verification | `Then the product list should load within "5" seconds` | Page load performance |
| Performance thresholds | `And checkout flow completes in "≤30 seconds"` | End-to-end timing test |

---

### ✅ Correct Functional Approach vs ❌ Performance Approach

| Scenario Context | ❌ PROHIBITED (Performance) | ✅ CORRECT (Functional) |
|------------------|----------------------------|------------------------|
| Cart modal appears | `Then cart modal appears within "3" seconds` | `Then the cart modal should be displayed`<br>`And the modal should show product name`<br>`And the modal should show quantity` |
| Page load | `Then page loads in "≤2 seconds"` | `Then the product listing page should be displayed`<br>`And all product images should be visible`<br>`And product prices should be displayed` |
| Form submission | `Then form submits within "1 second"` | `Then the form should be submitted successfully`<br>`And I should see confirmation message "Thank you"`<br>`And I should be redirected to success page` |
| API response | `Then API responds in "<500ms"` | `Then the API should return status code "200"`<br>`And response should contain product details`<br>`And product price should match expected value` |

**Key Principle**: Verify WHAT appears/happens, NOT HOW FAST it happens.

---

### 📏 BVA Scope Clarification — DATA Values Only

**Boundary Value Analysis (BVA) applies ONLY to DATA constraints:**

✅ **CORRECT BVA Usage** (Data boundaries):
- Field length: Username 3-20 characters → Test: 2, 3, 10, 20, 21
- Age range: 18-65 years → Test: 17, 18, 40, 65, 66
- Price range: $10-$1000 → Test: $9.99, $10.00, $500, $1000, $1000.01
- Quantity limits: 1-10 items → Test: 0, 1, 5, 10, 11
- File size: Max 5MB → Test: 4.9MB, 5.0MB, 5.1MB

❌ **PROHIBITED BVA Usage** (Timing boundaries):
- Response time: ≤3s → DO NOT test: 2.9s, 3.0s, 3.1s
- Page load: 1-5s → DO NOT test: 0.9s, 1.0s, 5.0s, 5.1s
- Timeout: 30s → DO NOT test: 29s, 30s, 31s
- Modal display: ≤2s → DO NOT test timing boundaries

**BVA Formula Reminder** (for DATA values only):
```
Test values: min-1, min, mid-range, max, max+1
Example (Age 18-65): 17, 18, 40, 65, 66
```

---

### 🎯 When Acceptance Criteria Mentions Timing

**If story AC says**: "Cart modal should appear within 3 seconds"

❌ **WRONG INTERPRETATION** (Performance test):
```gherkin
Scenario: Cart modal timing compliance
  When I click "Add to Cart"
  Then cart modal should appear within "3" seconds  # ← Performance assertion
```

✅ **CORRECT INTERPRETATION** (Functional test):
```gherkin
Scenario: Cart modal displays after adding to cart
  When I click "Add to Cart" button
  Then the cart modal should be displayed
  And the modal should show product "Hummingbird T-Shirt"
  And the modal should show quantity "1"
  And the modal should show total price "₹23.90"
  And "Continue Shopping" button should be enabled
  And "Proceed to Checkout" button should be enabled
```

**Rationale**: The functional requirement is that the modal **appears with correct content**, not that it meets a performance SLA. Performance testing is a separate discipline with specialized tools (JMeter, LoadRunner, etc.).

---

### 📋 Functional Testing Checklist

Before creating test cases, verify:

- [ ] Tests verify **WHAT** happens (data, state, display), not **HOW FAST**
- [ ] BVA applied to **DATA boundaries** (lengths, amounts, counts), not timing
- [ ] No timing assertions (seconds, milliseconds) in expected results
- [ ] No response time / page load / performance thresholds tested
- [ ] Decision tables based on **business logic**, not performance conditions
- [ ] State transitions verify **functional states**, not timing between states

---

## Summary

### Key Takeaways

✅ **Functional Testing Only**: All techniques apply to functional testing — NOT performance, security, load, or accessibility

✅ **Systematic over Random**: Use techniques to identify tests systematically, not randomly

✅ **Coverage over Volume**: Maximum coverage with minimum tests (do NOT test everything)

✅ **Combine Techniques**: Layer EP + BVA + Decision Tables for comprehensive coverage

✅ **BVA for Data Only**: Apply BVA to data boundaries (lengths, amounts, counts) — NEVER to timing/response time

✅ **Document Rationale**: Tag scenarios with technique used (e.g., `@boundary-value-analysis`)

✅ **Reduce Redundancy**: Collapse decision tables, use pairwise for large parameter spaces

✅ **No Performance Assertions**: Test WHAT happens, not HOW FAST it happens

### Checklist for Test Design

**Technique Application:**
- [ ] Applied Equivalence Partitioning for input fields?
- [ ] Tested boundary values (min-1, min, max, max+1) for DATA constraints?
- [ ] Created decision table for multi-condition logic?
- [ ] Mapped state transitions for workflows?
- [ ] Used pairwise for parameter combinations?
- [ ] Added error guessing for known problem areas?

**Functional Testing Compliance:**
- [ ] All test cases verify functional behavior (WHAT), not performance (HOW FAST)?
- [ ] BVA applied ONLY to data boundaries, NOT to timing/response time?
- [ ] No timing assertions in expected results (no "within X seconds")?
- [ ] No performance thresholds tested (response time, page load)?
- [ ] If AC mentions timing, interpreted as functional requirement (modal appears with content)?
