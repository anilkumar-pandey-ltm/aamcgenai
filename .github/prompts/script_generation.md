# Script Generation Prompts for GitHub Copilot

## Purpose
These prompts help GitHub Copilot generate automated test scripts from BDD scenarios.

## Base Script Generation Prompt

```
You are an expert test automation engineer. Generate Python test automation scripts using Selenium WebDriver and pytest.

Context:
- BDD Scenario: {scenario_text}
- Framework: Selenium + pytest + Behave
- Browser: {browser_type}
- Page Objects: {page_objects_available}

Requirements:
1. Convert BDD steps to Python code
2. Use Page Object Model pattern
3. Implement proper wait strategies
4. Add error handling and logging
5. Include assertions and validations
6. Follow PEP 8 coding standards
7. Add comprehensive comments

Generate:
- Step definition methods
- Page object interactions
- Test data handling
- Configuration management
- Reporting integration

BDD Scenario:
{gherkin_scenario}
```

## Page Object Generation

```
Generate a Page Object class for {page_name}:

Requirements:
- Selenium WebDriver integration
- Locator strategies with fallbacks
- Action methods (click, type, select)
- Validation methods
- Wait strategies
- Error handling
- Method chaining support

Page Elements:
{elements_list}

Generate:
- Class definition with inheritance
- Locator definitions
- Action methods
- Validation methods
- Helper utilities
```

## Step Definition Generation

```
Generate step definitions for the following Gherkin steps:

{gherkin_steps}

Requirements:
- Use @given, @when, @then decorators
- Integrate with page objects
- Handle test data
- Implement proper assertions
- Add logging and screenshots
- Handle exceptions gracefully

Framework: Behave + Selenium + pytest
```

## Test Data Management

```
Generate test data management utilities:

Requirements:
- JSON/CSV data readers
- Dynamic data generation
- Environment-specific data
- Data validation
- Cleanup mechanisms

Generate:
- Data provider classes
- Faker integration for synthetic data
- Database utilities
- API data setup/teardown
- Configuration loaders
```

## Utility Script Generation

```
Generate utility scripts for:

1. Browser Management:
   - WebDriver factory
   - Browser configuration
   - Headless/GUI modes
   - Mobile emulation
   - Cross-browser support

2. Reporting Integration:
   - Allure reports
   - HTML reports
   - Screenshot capture
   - Video recording
   - Test metrics

3. CI/CD Integration:
   - Jenkins pipeline
   - GitHub Actions
   - Docker containerization
   - Parallel execution
   - Test result publishing
```

## API Automation Scripts

```
Generate API automation scripts:

Requirements:
- Requests library integration
- Authentication handling
- Response validation
- Schema validation
- Performance measurements
- Error scenarios

API Details:
- Base URL: {base_url}
- Endpoints: {endpoints}
- Authentication: {auth_type}
- Data Format: {data_format}

Generate:
- API client classes
- Test fixtures
- Response validators
- Mock server integration
```

## Mobile Automation Scripts

```
Generate mobile automation scripts:

Requirements:
- Appium integration
- Device management
- Platform-specific actions
- Performance monitoring
- App installation/uninstallation

Platform: {ios_android}
App Type: {native_hybrid_web}

Generate:
- Driver initialization
- Mobile-specific actions
- Gesture implementations
- Device capability management
```

## Database Interaction Scripts

```
Generate database interaction utilities:

Requirements:
- Connection management
- Query execution
- Data validation
- Transaction handling
- Connection pooling

Database: {database_type}
Tables: {table_names}

Generate:
- Database connection factory
- Query builders
- Data validators
- Cleanup utilities
```

## Performance Testing Scripts

```
Generate performance testing scripts:

Requirements:
- Load testing scenarios
- Performance metrics collection
- Response time validation
- Concurrent user simulation
- Resource monitoring

Tools: {performance_tools}

Generate:
- Load test scenarios
- Metrics collectors
- Report generators
- Threshold validators
```