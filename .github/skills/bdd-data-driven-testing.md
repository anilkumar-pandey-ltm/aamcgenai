---
name: bdd-data-driven-testing
description: Complete guide to data-driven testing in BDD using Scenario Outline with Examples tables, parameterization strategies, and test data selection patterns to reduce duplication and increase coverage.
---

# BDD Data-Driven Testing & Parameterization

## Purpose
Complete guide to data-driven testing in BDD using Scenario Outline with Examples tables, test data strategies, and parameterization best practices.

---

## Overview

Data-driven testing in BDD uses **Scenario Outline** with **Examples** tables to:
- ✅ Test multiple data combinations with single scenario template
- ✅ Reduce test duplication and maintenance effort
- ✅ Increase coverage with comprehensive test data
- ✅ Separate test logic from test data

**Target**: ≥80% of scenarios should be Scenario Outline (parameterized)

---

## Part 1: Scenario Outline Fundamentals

### Basic Structure

```gherkin
Scenario Outline: [Template description with "<placeholders>"]
  Given [precondition with "<parameter1>"]
  When [action with "<parameter2>"]
  Then [expected outcome with "<parameter3>"]
  And [additional assertion with "<parameter4>"]
  
  Examples: [Description of test data coverage]
    | parameter1  | parameter2  | parameter3       | parameter4    |
    | value1      | input1      | expected_result1 | assertion1    |
    | value2      | input2      | expected_result2 | assertion2    |
    | value3      | input3      | expected_result3 | assertion3    |
```

### How It Works

1. **Scenario Outline** is a template with `"<placeholders>"`
2. **Examples** table provides concrete values for each run
3. **Each row** in Examples = one test execution
4. **Placeholders** are replaced with values from current row

**Example**:
```gherkin
Scenario Outline: User login with different credentials
  Given I am on login page
  When I enter username "<username>" and password "<password>"
  Then I should see "<result>"
  
  Examples:
    | username | password  | result                    |
    | admin    | pass123   | Welcome, Admin            |
    | john     | wrong     | Invalid credentials       |
    | [empty]  | pass      | Username is required      |
```

**Executions**:
- Test 1: username = "admin", password = "pass123" → "Welcome, Admin"
- Test 2: username = "john", password = "wrong" → "Invalid credentials"
- Test 3: username = "[empty]", password = "pass" → "Username is required"

---

## Part 2: When to Use Scenario Outline vs Simple Scenario

### Use Scenario Outline When (80-90% of cases):

✅ **Testing multiple entities/records**
```gherkin
Scenario Outline: Verify product details
  # Can test 10+ different products with same steps
```

✅ **Testing multiple users/roles**
```gherkin
Scenario Outline: Access control by user role
  # Test Admin, Manager, Employee, Guest with same logic
```

✅ **Testing multiple input values**
```gherkin
Scenario Outline: Field validation
  # Test valid values, invalid formats, boundary values with same template
```

✅ **Testing multiple error conditions**
```gherkin
Scenario Outline: Error handling
  # Test missing required fields, format errors, range violations
```

✅ **Testing business rules with multiple data points**
```gherkin
Scenario Outline: Discount calculation
  # Test different order totals, member types, coupon codes
```

### Use Simple Scenario When (10-20% of cases):

✅ **Unique workflow that appears once**
```gherkin
Scenario: Initial system setup wizard
  # One-time configuration, can't be parameterized
```

✅ **Complex multi-step setup**
```gherkin
Scenario: Import data from legacy system
  # Complex steps with specific sequence, not data-driven
```

✅ **Non-parameterizable workflows**
```gherkin
Scenario: First-time user onboarding tour
  # Specific UI tour sequence, doesn't vary by data
```

### Decision Tree

```
Is the test repeatable with different data?
├─ YES → Use Scenario Outline
│   └─ Can you identify 2+ test data variations?
│       ├─ YES → Use Scenario Outline with Examples (5-7 rows)
│       └─ NO → Reconsider if truly unique
│
└─ NO → Use Simple Scenario
    └─ Is it truly unique or just complex?
        ├─ Unique → Simple Scenario OK
        └─ Complex → Break into smaller parameterized scenarios
```

---

## Part 3: Examples Table Requirements

### Minimum Data Coverage (5-7 Rows Per Table)

Each Examples table MUST include:

1. **2-3 valid equivalence classes**
   - Common/typical values
   - Boundary values (min, max)
   - Edge cases (special characters, unicode, compound values)

2. **1-2 invalid equivalence classes** (for negative tests)
   - Format violations
   - Required field violations
   - Range/length violations

3. **Coverage documentation in comments**

### Example Transformation

#### ❌ INSUFFICIENT (Only 2 rows)
```gherkin
Scenario Outline: User registration
  When I enter name "<name>"
  Then result should be "<result>"
  
  Examples:
    | name | result   |
    | John | Success  |
    | Jane | Success  |
```
**Problem**: Not enough variety, missing edge cases, no error scenarios

#### ✅ COMPREHENSIVE (7 rows with coverage)
```gherkin
Scenario Outline: User registration name field validation
  When I enter name "<name>"
  Then validation result should be "<result>"
  And I should see "<message>"
  
  Examples: Comprehensive name validation coverage
    # Coverage:
    # - 3 valid classes: common (4-6 chars), long (10-12 chars), short (2-3 chars)
    # - 2 boundary values: min (2), max (50)
    # - 2 edge cases: special chars (accents), compound (hyphenated)
    # - 2 error classes: invalid format (numbers), required field (empty)
    # Total: 9 test cases covering all major scenarios
    
    | name                | length | result  | message                  | test_type        |
    | John                | 4      | valid   | Name accepted            | valid_common     |
    | Christopher         | 11     | valid   | Name accepted            | valid_long       |
    | Li                  | 2      | valid   | Name accepted            | valid_short      |
    | José García         | 11     | valid   | Name accepted            | valid_unicode    |
    | Mary-Jane           | 9      | valid   | Name accepted            | valid_hyphenated |
    | JohnDoe (48 chars)  | 48     | valid   | Name accepted            | boundary_max-2   |
    | J...z (50 chars)    | 50     | valid   | Name accepted            | boundary_max     |
    | 123                 | 3      | invalid | Name cannot have numbers | invalid_format   |
    | [empty]             | 0      | invalid | Name is required         | invalid_required |
```

### Coverage Rationale Template

Document WHY you chose each test data value:

```gherkin
Examples: [Feature] test data
  # Coverage Rationale:
  # - Valid classes: [List equivalence classes tested]
  # - Boundary values: [List min/max boundaries]
  # - Edge cases: [List unusual but valid scenarios]
  # - Error classes: [List validation errors tested]
  # Total: [N] test cases
  
  | param1 | param2 | expected | test_type      |
  | ...    | ...    | ...      | valid_common   |
  | ...    | ...    | ...      | boundary_min   |
  | ...    | ...    | ...      | invalid_format |
```

---

## Part 4: Test Data Selection Strategies

###Strategy 1: Real Application Data

**DO**: Use actual values from YOUR application context (fetched from MCP Context Server)

✅ **CORRECT** (E-Commerce Example):
```gherkin
Examples: Real products from application inventory
  | product_name         | category    | price  | stock | sku       |
  | Blue Cotton T-Shirt  | Clothing    | $29.99 | 150   | CLO-BL-TS |
  | Leather Wallet       | Accessories | $49.99 | 80    | ACC-LW-01 |
  | Running Shoes        | Footwear    | $89.99 | 45    | FTW-RS-42 |
```

❌ **WRONG** (Generic Placeholders):
```gherkin
Examples:
  | product_name | category  | price | stock | sku   |
  | Product1     | Category1 | 10.00 | 100   | SKU1  |
  | Product2     | Category2 | 20.00 | 200   | SKU2  |
```

### Strategy 2: Domain-Specific Data Patterns

Use data formats and patterns specific to YOUR domain:

**Banking Application**:
```gherkin
Examples: Real account types and transactions
  | account_type       | account_number | balance   | transaction_limit |
  | Savings            | SA-0012345     | $5,000.00 | $1,000/day        |
  | Checking           | CH-0067890     | $2,500.00 | $5,000/day        |
  | Premium Checking   | PC-0011111     | $50,000.00| $25,000/day       |
```

**Healthcare Application**:
```gherkin
Examples: Real appointment data
  | patient_name | doctor_name    | specialty   | appointment_date | duration |
  | John Smith   | Dr. Anderson   | Cardiology  | 2024-03-15       | 30 min   |
  | Mary Johnson | Dr. Chen       | Dermatology | 2024-03-20       | 45 min   |
  | Bob Williams | Dr. Patel      | Orthopedics | 2024-03-22       | 60 min   |
```

### Strategy 3: Boundary Value Coverage

Include boundary values explicitly labeled:

```gherkin
Examples: Age validation with boundary values
  | age | test_type      | expected  | message                  |
  | 17  | boundary_min-1 | rejected  | Must be at least 18      |
  | 18  | boundary_min   | accepted  | Valid age                |
  | 19  | boundary_min+1 | accepted  | Valid age                |
  | 35  | mid_range      | accepted  | Valid age                |
  | 64  | boundary_max-1 | accepted  | Valid age                |
  | 65  | boundary_max   | accepted  | Valid age                |
  | 66  | boundary_max+1 | rejected  | Must not exceed 65       |
```

### Strategy 4: Equivalence Partitioning Coverage

Label which equivalence class each row tests:

```gherkin
Examples: Email validation with equivalence classes
  | email                 | equivalence_class | expected | error_message          |
  | john@example.com      | EC1_valid_standard| accepted | -                      |
  | john+tag@example.com  | EC2_valid_plus    | accepted | -                      |
  | user@sub.example.com  | EC3_valid_subdomain| accepted| -                      |
  | user123@example.com   | EC4_valid_numeric | accepted | -                      |
  | userexample.com       | EC5_invalid_no_at | rejected | Email must contain @   |
  | user@                 | EC6_invalid_no_domain| rejected| Domain required     |
  | @example.com          | EC7_invalid_no_local| rejected| Username required    |
  | [empty]               | EC8_invalid_required| rejected| Email is required    |
```

### Strategy 5: Error Type Coverage

For negative scenarios, cover ALL error types:

```gherkin
Examples: Comprehensive error coverage
  | field      | value         | error_type       | error_message               |
  | Email      | [empty]       | required_field   | Email is required           |
  | Email      | invalid@      | format_error     | Invalid email format        |
  | Email      | a@b.c         | min_length       | Email too short             |
  | Password   | [empty]       | required_field   | Password is required        |
  | Password   | short         | min_length       | Password min 8 characters   |
  | Password   | lowercase     | complexity       | Must have 1 uppercase       |
  | Password   | NoNumber      | complexity       | Must have 1 number          |
  | Age        | -5            | invalid_range    | Age must be positive        |
  | Age        | abc           | invalid_type     | Age must be a number        |
```

---

## Part 5: Multi-Column Examples Tables

### Pattern 1: Multi-Entity Testing

Test multiple entities with their full attributes:

```gherkin
@product-validation @multi-entity
Scenario Outline: Verify product details across categories
  Given I navigate to "<category>" section
  When I select product "<product_name>"
  Then I should see name as "<product_name>"
  And I should see price as "<price>"
  And I should see stock as "<stock>" items
  And I should see SKU as "<sku>"
  And I should see rating as "<rating>" stars
  
  Examples: Real products from inventory (10 products across 3 categories)
    | category    | product_name         | price  | stock | sku       | rating |
    | Clothing    | Blue Cotton T-Shirt  | $29.99 | 150   | CLO-BL-TS | 4.5    |
    | Clothing    | Red Polo Shirt       | $39.99 | 80    | CLO-RD-PS | 4.7    |
    | Clothing    | Black Jeans          | $59.99 | 120   | CLO-BK-JN | 4.3    |
    | Accessories | Leather Wallet       | $49.99 | 80    | ACC-LW-01 | 4.8    |
    | Accessories | Sunglasses           | $79.99 | 60    | ACC-SG-02 | 4.6    |
    | Accessories | Watch                | $199.99| 30    | ACC-WA-03 | 4.9    |
    | Footwear    | Running Shoes        | $89.99 | 45    | FTW-RS-42 | 4.4    |
    | Footwear    | Casual Sneakers      | $69.99 | 70    | FTW-CS-38 | 4.5    |
    | Footwear    | Formal Shoes         | $129.99| 25    | FTW-FS-40 | 4.7    |
    | Electronics | Bluetooth Speaker    | $149.99| 50    | ELC-BS-01 | 4.6    |
```

### Pattern 2: Multi-Condition Testing

Test complex business logic with multiple conditions:

```gherkin
@business-rule @multi-condition
Scenario Outline: Shipping cost calculation with multiple factors
  Given I am a "<member_type>" member in "<location>"
  When I place order with "<item_count>" items totaling "<order_total>"
  And I select "<shipping_speed>" shipping
  Then shipping cost should be "<shipping_cost>"
  And estimated delivery should be "<delivery_days>" days
  And I should see shipping message "<message>"
  
  Examples: Shipping rules matrix (member type × location × order total × speed)
    | member_type | location    | item_count | order_total | shipping_speed | shipping_cost | delivery_days | message            |
    | Premium     | Urban       | 3          | $150        | Standard       | $0            | 3-5           | Free shipping      |
    | Premium     | Urban       | 3          | $150        | Express        | $10           | 1-2           | Express surcharge  |
    | Premium     | Rural       | 5          | $200        | Standard       | $5            | 5-7           | Rural area fee     |
    | Standard    | Urban       | 2          | $50         | Standard       | $15           | 5-7           | Standard shipping  |
    | Standard    | Urban       | 4          | $120        | Express        | $25           | 2-3           | Express available  |
    | Standard    | Rural       | 3          | $80         | Standard       | $20           | 7-10          | Rural standard     |
    | Guest       | Urban       | 1          | $30         | Standard       | $10           | 5-7           | Register for discount |
```

### Pattern 3: State Transition Testing with Data

```gherkin
@state-transition @data-driven
Scenario Outline: Order workflow state transitions
  Given order "<order_id>" is in "<initial_state>" state
  And order was created by "<creator>"
  And order total is "<order_total>"
  When "<actor>" performs "<action>"
  Then order should transition to "<final_state>"
  And system should send "<notification>" to "<recipient>"
  And audit log should record "<log_entry>"
  
  Examples: Complete order lifecycle with actors and data
    | order_id | initial_state | creator  | order_total | actor    | action  | final_state | notification       | recipient  | log_entry         |
    | ORD-001  | Draft         | Customer | $100        | Customer | Submit  | Pending     | Order received     | Customer   | Order submitted   |
    | ORD-001  | Pending       | Customer | $100        | Manager  | Approve | Approved    | Order approved     | Customer   | Approved by MGR   |
    | ORD-001  | Approved      | Customer | $100        | Warehouse| Ship    | Shipped     | Order shipped      | Customer   | Shipped tracking# |
    | ORD-001  | Shipped       | Customer | $100        | Delivery | Deliver | Delivered   | Order delivered    | Customer   | Delivered signed  |
    | ORD-002  | Draft         | Customer | $50         | Customer | Cancel  | Cancelled   | Order cancelled    | Customer   | Cancelled by user |
```

---

## Part 6: Examples Table Anti-Patterns

### Anti-Pattern 1: Too Few Rows

❌ **WRONG** (Insufficient coverage):
```gherkin
Examples:
  | name | result  |
  | John | Success |
  | Jane | Success |
```
**Problem**: Only 2 rows, no variety, missing error cases

✅ **CORRECT** (Comprehensive):
```gherkin
Examples: Name validation (7 rows)
  | name        | result  | test_type      |
  | John        | Success | valid_common   |
  | Christopher | Success | valid_long     |
  | Li          | Success | valid_short    |
  | José        | Success | valid_unicode  |
  | Mary-Jane   | Success | valid_compound |
  | 123         | Error   | invalid_format |
  | [empty]     | Error   | invalid_required |
```

### Anti-Pattern 2: Duplicate Test Data

❌ **WRONG** (Redundant rows):
```gherkin
Examples:
  | name  | age | result  |
  | John  | 25  | Success |
  | Jane  | 26  | Success |
  | Bob   | 27  | Success |
  | Alice | 28  | Success |
```
**Problem**: All rows test same equivalence class (valid names, valid ages)

✅ **CORRECT** (Diverse coverage):
```gherkin
Examples: Age validation across ranges
  | name  | age | result  | test_type      |
  | John  | 18  | Success | boundary_min   |
  | Jane  | 35  | Success | mid_range      |
  | Bob   | 65  | Success | boundary_max   |
  | Alice | 17  | Error   | below_min      |
  | Charlie | 66 | Error   | above_max      |
```

### Anti-Pattern 3: Missing Error Scenarios

❌ **WRONG** (Only happy path):
```gherkin
Examples:
  | email             | result  |
  | john@example.com  | Success |
  | jane@example.com  | Success |
```

✅ **CORRECT** (Including errors):
```gherkin
Examples: Email validation (valid + invalid)
  | email             | result  | error_message          |
  | john@example.com  | Success | -                      |
  | jane@test.org     | Success | -                      |
  | invalid@          | Error   | Invalid email format   |
  | @example.com      | Error   | Username required      |
  | [empty]           | Error   | Email is required      |
```

### Anti-Pattern 4: Using Generic Placeholders

❌ **WRONG** (Generic data):
```gherkin
Examples:
  | product_name | price | stock |
  | Product1     | 10.00 | 100   |
  | Product2     | 20.00 | 200   |
  | Product3     | 30.00 | 300   |
```

✅ **CORRECT** (Real application data):
```gherkin
Examples: Real products from inventory
  | product_name        | price  | stock |
  | Blue Cotton T-Shirt | $29.99 | 150   |
  | Leather Wallet      | $49.99 | 80    |
  | Running Shoes       | $89.99 | 45    |
```

### Anti-Pattern 5: No Coverage Documentation

❌ **WRONG** (No explanation):
```gherkin
Examples:
  | name | age | result |
  | ...  | ... | ...    |
```

✅ **CORRECT** (With coverage rationale):
```gherkin
Examples: User registration validation
  # Coverage:
  # - 3 valid classes: common, boundary_min, boundary_max
  # - 2 error classes: invalid format, required field
  # Total: 5 test cases
  
  | name | age | result | test_type |
  | ...  | ... | ...    | ...       |
```

---

## Part 7: Advanced Examples Patterns

### Pattern 1: Nested Data Structures (Using Lists)

```gherkin
@cart-validation @multi-item
Scenario Outline: Calculate cart total with multiple items
  Given I have following items in cart:
    | product      | quantity | price  |
    | <product_1>  | <qty_1>  | <price_1> |
    | <product_2>  | <qty_2>  | <price_2> |
  When I proceed to checkout
  Then cart subtotal should be "<subtotal>"
  And tax should be "<tax>"
  And final total should be "<total>"
  
  Examples:
    | product_1 | qty_1 | price_1 | product_2 | qty_2 | price_2 | subtotal | tax   | total  |
    | T-Shirt   | 2     | $29.99  | Jeans     | 1     | $59.99  | $119.97  | $9.60 | $129.57|
    | Wallet    | 1     | $49.99  | Watch     | 1     | $199.99 | $249.98  | $20.00| $269.98|
```

### Pattern 2: Date/Time Testing

```gherkin
@date-validation @scheduling
Scenario Outline: Appointment scheduling with date/time validation
  Given today is "<current_date>"
  When I try to schedule appointment on "<appointment_date>" at "<time>"
  Then scheduling should be "<result>"
  And I should see message "<message>"
  
  Examples: Date/time validation scenarios
    | current_date | appointment_date | time  | result  | message                       |
    | 2024-01-15   | 2024-01-16       | 10:00 | Success | Appointment scheduled         |
    | 2024-01-15   | 2024-01-14       | 14:00 | Error   | Cannot schedule in past       |
    | 2024-01-15   | 2024-02-29       | 10:00 | Success | Leap year date accepted       |
    | 2024-01-15   | 2024-03-15       | 09:00 | Error   | Outside business hours        |
    | 2024-01-15   | 2024-03-15       | 24:00 | Error   | Invalid time format           |
```

### Pattern 3: Conditional Logic Testing

```gherkin
@conditional-logic @discount-rules
Scenario Outline: Apply discounts based on multiple conditions
  Given I am "<member_type>" member
  And I am shopping during "<promotion_period>"
  And I have coupon code "<coupon>" with value "<coupon_value>"
  When I place order totaling "<order_total>"
  Then member discount should be "<member_discount>"
  And promotion discount should be "<promo_discount>"
  And coupon discount should be "<coupon_discount>"
  And final price should be "<final_price>"
  
  Examples: Complex discount rules (nested conditions)
    | member_type | promotion_period | coupon    | coupon_value | order_total | member_discount | promo_discount | coupon_discount | final_price |
    | Premium     | Black Friday     | BF2024    | $20          | $200        | $40 (20%)       | $30 (15%)      | $20             | $110        |
    | Standard    | Black Friday     | NONE      | $0           | $200        | $20 (10%)       | $30 (15%)      | $0              | $150        |
    | Premium     | Regular          | SAVE10    | $10          | $150        | $30 (20%)       | $0             | $10             | $110        |
```

---

## Part 8: Parameterization Metrics

### Calculating Parameterization Level

```
Parameterization % = (Scenario Outlines / Total Scenarios) × 100

Target: ≥80%
```

**Example**:
```
Total Scenarios: 25
- Scenario Outlines: 22
- Simple Scenarios: 3

Parameterization = (22 / 25) × 100 = 88% ✅
```

### Calculating Average Examples Per Outline

```
Avg Examples/Outline = Total Examples Rows / Total Scenario Outlines

Target: ≥5 rows per outline
```

**Example**:
```
Scenario Outlines: 20
Total Examples Rows: 132

Avg = 132 / 20 = 6.6 rows per outline ✅
```

---

## Summary

### Parameterization Checklist

Before saving feature file, verify:
- [ ] ≥80% scenarios are Scenario Outline (not simple Scenario)
- [ ] Each Examples table has ≥5 rows (ideally 5-7)
- [ ] Test data covers valid, boundary, and error cases
- [ ] Real application data used (not placeholders like "Value1", "Item1")
- [ ] Coverage rationale documented in comments
- [ ] Each row tests different equivalence class or scenario
- [ ] No duplicate/redundant test data
- [ ] Error scenarios included (not just happy path)
- [ ] Multi-column tables use real entity attributes

### Key Takeaways

✅ **Parameterize 80%+**: Use Scenario Outline for most scenarios

✅ **5-7 Examples Minimum**: Each table should have comprehensive test data

✅ **Real Data Only**: Use actual application data from MCP context

✅ **Coverage Documentation**: Explain WHY each test data value was chosen

✅ **Diverse Data**: Valid, boundary, edge case, and error scenarios in every table

❌ **Avoid**: Generic placeholders, insufficient rows, redundant data, missing error cases
