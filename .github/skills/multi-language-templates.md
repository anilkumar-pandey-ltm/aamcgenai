---
name: multi-language-templates
description: Language-specific step definition templates for generating idiomatic code across Python, Java, TypeScript, JavaScript, C#, and Ruby with framework detection and naming convention enforcement.
---

# Multi-Language Step Definition Templates

Language-specific templates for generating step definitions across Python, Java, TypeScript, C#, JavaScript, and Ruby.

## Template Selection by Language

| Language | Extension | Framework | Template |
|----------|-----------|-----------|----------|
| Python | `.py` | pytest-bdd, behave | Python Template |
| Java | `.java` | Cucumber, RestAssured | Java Template |
| TypeScript | `.ts` | Cucumber, Playwright | TypeScript Template |
| JavaScript | `.js` | Cucumber, Jest | JavaScript Template |
| C# | `.cs` | SpecFlow | C# Template |
| Ruby | `.rb` | Cucumber | Ruby Template |

---

## Python Template (pytest-bdd / behave)

### File Structure

```python
"""
Step Definitions for {Service Name} API
Feature: {feature_file_name}
Generated: {timestamp}
"""

# pytest-bdd imports
from pytest_bdd import given, when, then, scenarios, parsers
from pytest import fixture
import requests
import json
import logging

# Service client import
from {service_client_module} import {ServiceClientClass}

logger = logging.getLogger(__name__)

# Fixtures
@fixture
def api_context():
    """API test context fixture"""
    class APIContext:
        def __init__(self):
            self.api_client = None
            self.response = None
            self.headers = {}
            self.request_data = {}
    return APIContext()

# Background Steps
@given(parsers.parse('the {service} API is available at "{base_url}"'))
def api_is_available(api_context, service, base_url):
    logger.info(f'Setting up API client for {service}')
    api_context.api_client = {ServiceClientClass}(base_url)

# Authentication
@given(parsers.parse('I have API key "{api_key}"'))
def set_api_key(api_context, api_key):
    api_context.api_client.set_auth_header(api_key)
    logger.info('API key configured')

# API Operations
@when(parsers.parse('I send a "{method}" request to "{endpoint}"'))
def send_request(api_context, method, endpoint):
    logger.info(f'Executing {method} request to {endpoint}')
    try:
        api_context.response = api_context.api_client.request(
            method=method.upper(),
            url=endpoint
        )
    except Exception as error:
        logger.error(f'Request failed: {error}')
        api_context.error = error

# Validation
@then(parsers.parse('the response status should be {status:d}'))
def verify_status(api_context, status):
    assert api_context.response.status_code == status
    logger.info(f'Status validation passed: {status}')
```

---

## Java Template (Cucumber / RestAssured)

### File Structure

```java
/**
 * Step Definitions for {Service Name} API
 * Feature: {feature_file_name}
 * Generated: {timestamp}
 */

package {discovered_package};

// Cucumber imports
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import io.cucumber.datatable.DataTable;

// RestAssured imports
import io.restassured.RestAssured;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

// Assertions
import static org.junit.Assert.*;
import static org.hamcrest.Matchers.*;

// Service client import
import {discovered_package}.{ServiceClientClass};

public class {ServiceName}ApiSteps {
    
    private {ServiceClientClass} apiClient;
    private Response apiResponse;
    private {ContextClass} context;

    // Background Steps
    @Given("the {Service} API is available at {string}")
    public void apiIsAvailable(String service, String baseUrl) {
        apiClient = new {ServiceClientClass}(baseUrl);
        System.out.println("API client configured for " + service);
    }

    // Authentication
    @Given("I have valid API credentials with key {string}")
    public void setApiCredentials(String apiKey) {
        apiClient.setAuthHeader(apiKey);
    }

    // API Operations
    @When("I send a {string} request to {string}")
    public void sendRequest(String method, String endpoint) {
        apiResponse = apiClient.request(method.toUpperCase(), endpoint);
    }

    // Validation
    @Then("the response status should be {int}")
    public void verifyResponseStatus(int expectedStatus) {
        assertEquals(expectedStatus, apiResponse.getStatusCode());
    }

    @Then("the response should contain {string}")
    public void verifyResponseContent(String expectedContent) {
        String responseBody = apiResponse.getBody().asString();
        assertTrue(responseBody.contains(expectedContent));
    }
}
```

---

## TypeScript Template (Cucumber / Playwright)

### File Structure

```typescript
/**
 * Step Definitions for {Service Name} API
 * Feature: {feature_file_name}
 * Generated: {timestamp}
 */

// Cucumber imports
import { Given, When, Then } from '@cucumber/cucumber';
import { DataTable } from '@cucumber/cucumber';

// Assertion library
import { expect } from '@playwright/test';

// Service client import
import { {ServiceClientClass}, {DiscoveredInterfaces} } from '{service_client_path}';

// Context/World import
import { CustomWorld } from '{discovered_world_path}';

// Logger
import { Logger } from '{discovered_logger_path}';

// Background Steps
Given('the {Service} API is available at {string}', async function(this: CustomWorld, baseUrl: string) {
  this.logger.info('Setting up API client', { service: '{service_name}', baseUrl });
  this.context.apiClient = new {ServiceClientClass}(baseUrl);
  this.stepLogger.logAction('setup_api_client', baseUrl);
});

// Authentication
Given('I have valid API credentials with key {string}', async function(this: CustomWorld, apiKey: string) {
  this.logger.info('Configuring API authentication');
  this.context.apiClient.setAuthHeader(apiKey);
  this.stepLogger.logAction('configure_auth', 'api_key');
});

// API Operations
When('I send a {string} request to {string}', async function(this: CustomWorld, method: string, endpoint: string) {
  this.logger.info('Executing API request', { method, endpoint });
  
  try {
    this.context.apiResponse = await this.apiClient.request({
      method: method.toUpperCase(),
      url: endpoint,
      validateStatus: (status) => status < 500
    });
    this.stepLogger.logAction('api_request', `${method} ${endpoint}`);
  } catch (error) {
    this.logger.error('API request failed', { error: error.message });
    this.context.apiError = error;
  }
});

// Validation
Then('the response status should be {int}', async function(this: CustomWorld, expectedStatus: number) {
  expect(this.context.apiResponse).toBeDefined();
  expect(this.context.apiResponse.status).toBe(expectedStatus);
  
  this.logger.info('Status validation passed', { expected: expectedStatus, actual: this.context.apiResponse.status });
  this.stepLogger.logAssertion('response_status', expectedStatus, this.context.apiResponse.status);
});

Then('the response should contain {string}', async function(this: CustomWorld, expectedContent: string) {
  expect(this.context.apiResponse).toBeDefined();
  const responseText = JSON.stringify(this.context.apiResponse.data);
  expect(responseText).toContain(expectedContent);
  this.stepLogger.logAssertion('response_content', expectedContent, 'found');
});
```

---

## C# Template (SpecFlow)

### File Structure

```csharp
/**
 * Step Definitions for {Service Name} API
 * Feature: {feature_file_name}
 * Generated: {timestamp}
 */

using System;
using TechTalk.SpecFlow;
using TechTalk.SpecFlow.Assist;
using FluentAssertions;
using {DiscoveredNamespace}.{ServiceClientClass};

namespace {DiscoveredNamespace}.StepDefinitions
{
    [Binding]
    public class {ServiceName}ApiSteps
    {
        private readonly ScenarioContext _scenarioContext;
        private {ServiceClientClass} _apiClient;
        private object _apiResponse;

        public {ServiceName}ApiSteps(ScenarioContext scenarioContext)
        {
            _scenarioContext = scenarioContext;
        }

        [Given(@"the (.*) API is available at ""(.*)""")]
        public void GivenApiIsAvailable(string service, string baseUrl)
        {
            _apiClient = new {ServiceClientClass}(baseUrl);
            Console.WriteLine($"API client configured for {service}");
        }

        [Given(@"I have valid API credentials with key ""(.*)""")]
        public void GivenApiCredentials(string apiKey)
        {
            _apiClient.SetAuthHeader(apiKey);
        }

        [When(@"I send a ""(.*)"" request to ""(.*)""")]
        public async Task WhenSendRequest(string method, string endpoint)
        {
            _apiResponse = await _apiClient.Request(method.ToUpper(), endpoint);
        }

        [Then(@"the response status should be (.*)")]
        public void ThenVerifyStatus(int expectedStatus)
        {
            var response = _apiResponse as HttpResponseMessage;
            ((int)response.StatusCode).Should().Be(expectedStatus);
        }

        [Then(@"the response should contain ""(.*)""")]
        public async Task ThenVerifyContent(string expectedContent)
        {
            var response = _apiResponse as HttpResponseMessage;
            var content = await response.Content.ReadAsStringAsync();
            content.Should().Contain(expectedContent);
        }
    }
}
```

---

## JavaScript Template (Cucumber)

### File Structure

```javascript
/**
 * Step Definitions for {Service Name} API
 * Feature: {feature_file_name}
 * Generated: {timestamp}
 */

const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { {ServiceClientClass} } = require('{service_client_path}');

// Module-level state
let apiClient;
let apiResponse;

// Background Steps
Given('the {Service} API is available at {string}', async function(baseUrl) {
  apiClient = new {ServiceClientClass}(baseUrl);
  console.log('API client configured');
});

// Authentication
Given('I have valid API credentials with key {string}', async function(apiKey) {
  apiClient.setAuthHeader(apiKey);
});

// API Operations
When('I send a {string} request to {string}', async function(method, endpoint) {
  try {
    apiResponse = await apiClient.request({
      method: method.toUpperCase(),
      url: endpoint
    });
  } catch (error) {
    this.lastError = error;
    apiResponse = error.response;
  }
});

// Validation
Then('the response status should be {int}', async function(expectedStatus) {
  expect(apiResponse.status).to.equal(expectedStatus);
});

Then('the response should contain {string}', async function(expectedContent) {
  const responseText = JSON.stringify(apiResponse.data);
  expect(responseText).to.include(expectedContent);
});
```

---

## Ruby Template (Cucumber)

### File Structure

```ruby
# Step Definitions for {Service Name} API
# Feature: {feature_file_name}
# Generated: {timestamp}

require '{service_client_path}'

# Background Steps
Given('the {Service} API is available at {string}') do |service, base_url|
  @api_client = {ServiceClientClass}.new(base_url)
  puts "API client configured for #{service}"
end

# Authentication
Given('I have valid API credentials with key {string}') do |api_key|
  @api_client.set_auth_header(api_key)
end

# API Operations
When('I send a {string} request to {string}') do |method, endpoint|
  begin
    @api_response = @api_client.request(method.upcase, endpoint)
  rescue => error
    @api_error = error
    @api_response = error.response if error.respond_to?(:response)
  end
end

# Validation
Then('the response status should be {int}') do |expected_status|
  expect(@api_response.code).to eq(expected_status)
end

Then('the response should contain {string}') do |expected_content|
  response_text = @api_response.body.to_s
  expect(response_text).to include(expected_content)
end
```

---

## Language-Specific Adaptation Rules

### Python
- Step decorators: `@given`, `@when`, `@then`
- Context via pytest fixtures or behave context
- Assertions: `assert` statements
- Type hints: Optional but recommended

### Java
- Step annotations: `@Given`, `@When`, `@Then`
- Context via class fields or dependency injection
- Assertions: `assertEquals`, `assertThat`
- Type safety: Strong typing required

### TypeScript
- Step functions: `Given()`, `When()`, `Then()`
- Context via `this: CustomWorld`
- Assertions: `expect()` from test framework
- Type safety: Interfaces required

### C#
- Step attributes: `[Given]`, `[When]`, `[Then]`
- Context via `ScenarioContext`
- Assertions: `.Should()` fluent assertions
- Type safety: Strong typing required

### JavaScript
- Step functions: `Given()`, `When()`, `Then()`
- Context via module-level or `this`
- Assertions: `expect()` from chai/jest
- Type safety: Optional JSDoc

### Ruby
- Step blocks: `Given`, `When`, `Then`
- Context via instance variables `@variable`
- Assertions: RSpec `expect()` or MiniTest `assert`
- Type safety: Dynamic typing
