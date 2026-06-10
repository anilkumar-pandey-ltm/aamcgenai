# Test Coverage Guidelines

## Objective
Ensure comprehensive test coverage across all functional aspects of the application while maintaining high quality and avoiding redundant test cases.

## Scope
This prompt focuses on **functional testing** coverage. The following testing types are **explicitly excluded**:
- Performance Testing
- Security Testing
- Usability Testing

## Test Coverage Principles

### 1. Functional Coverage Requirements
- **Feature Coverage**: Every user story and feature requirement must have corresponding test cases
- **Code Coverage**: Aim for minimum 80% code coverage for critical business logic
- **Path Coverage**: Test all logical branches and decision paths in the application
- **Data Coverage**: Validate different data types, formats, and boundary conditions

### 2. Test Design Techniques to Apply
- **Equivalence Partitioning**: Group input data into valid and invalid partitions
- **Boundary Value Analysis**: Test at the edges of input domains
- **Decision Table Testing**: Cover all combinations of business rules
- **State Transition Testing**: Validate all state changes and workflows
- **Use Case Testing**: Test complete end-to-end user scenarios

### 3. Coverage Analysis Checklist
Ensure your test suite covers:

#### ✅ Positive Scenarios
- Happy path workflows
- Valid input combinations
- Expected user behaviors
- Successful integration points

#### ✅ Negative Scenarios
- Invalid inputs and edge cases
- Error handling and validation messages
- Boundary violations
- Missing or incomplete data

#### ✅ Integration Points
- API contract validation
- Database operations (CRUD)
- Third-party service interactions
- Inter-module dependencies

#### ✅ Business Logic
- Calculation accuracy
- Business rule enforcement
- Conditional logic paths
- Data transformations

#### ✅ UI Functional Testing (If Applicable)
- Form validations
- Navigation flows
- Button and link functionality
- Data display accuracy
- Error message presentation


### 5. Exclusion Criteria
Do **NOT** include test cases for:
- ❌ Load, stress, or volume testing (Performance)
- ❌ Penetration testing, vulnerability scanning, authentication/authorization testing (Security)
- ❌ UI/UX evaluation, accessibility compliance, user satisfaction (Usability)

