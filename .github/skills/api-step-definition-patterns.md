---
name: api-step-definition-patterns
description: Reusable patterns for generating API test step definitions across TypeScript, Python, Java, JavaScript, C#, and Ruby testing frameworks.
---

# API Step Definition Patterns

Reusable patterns for generating API test step definitions across all supported frameworks.

## Common Step Definition Patterns

### Background Steps (API Setup)

**Pattern:** API availability and client initialization

```typescript
// TypeScript/Cucumber
Given('the {Service} API is available at {string}', async function(this: CustomWorld, baseUrl: string) {
  this.logger.info('Setting up API client', { service: '{service_name}', baseUrl });
  this.context.apiClient = new {ServiceClientClass}(baseUrl);
  this.stepLogger.logAction('setup_api_client', baseUrl);
});
```

```python
# Python/pytest-bdd
@given(parsers.parse('the {service} API is available at "{base_url}"'))
def api_is_available(api_context, service, base_url):
    logger.info(f'Setting up API client for {service} at {base_url}')
    api_context.api_client = ApiClient(base_url)
```

### Authentication Steps

**Pattern 1: API Key Authentication**

```typescript
Given('I have valid API credentials with key {string}', async function(this: CustomWorld, apiKey: string) {
  this.logger.info('Configuring API authentication');
  this.context.apiClient.setAuthHeader(apiKey);
  this.stepLogger.logAction('configure_auth', 'api_key');
});
```

**Pattern 2: Bearer Token Authentication**

```typescript
Given('I have Bearer token authentication', async function(this: CustomWorld, token: string) {
  this.context.apiClient.setBearerToken(token);
  this.stepLogger.logAction('set_bearer_token', 'configured');
});
```

**Pattern 3: Multiple Auth Types**

```typescript
Given('I use {string} Authentication', async function(this: CustomWorld, authType: string) {
  const authConfig = this.getAuthConfigFromBusinessRules(authType);
  this.apiClient.setAuthentication(authConfig);
  this.stepLogger.logAction('set_auth_type', authType);
});
```

### API Operation Steps (When)

**Pattern 1: Simple HTTP Request**

```typescript
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
```

**Pattern 2: Request with Data Table**

```typescript
When('I send a {string} request to {string} with data:', async function(this: CustomWorld, method: string, endpoint: string, dataTable: DataTable) {
  const requestData = dataTable.rowsHash();
  this.context.apiResponse = await this.apiClient.request({
    method: method.toUpperCase(),
    url: endpoint,
    data: requestData,
    headers: { 'Content-Type': 'application/json' }
  });
  this.stepLogger.logAction('api_request_with_data', `${method} ${endpoint}`);
});
```

**Pattern 3: Request with Headers**

```typescript
When('I send a {string} request to {string} with header {string}={string}', 
  async function(method: string, endpoint: string, headerName: string, headerValue: string) {
    const headers = { [headerName]: headerValue };
    this.context.apiResponse = await this.apiClient.request({
      method: method.toUpperCase(),
      url: endpoint,
      headers
    });
});
```

### Response Validation Steps (Then)

**Pattern 1: Status Code Validation**

```typescript
Then('the response status should be {int}', async function(this: CustomWorld, expectedStatus: number) {
  expect(this.context.apiResponse).toBeDefined();
  expect(this.context.apiResponse.status).toBe(expectedStatus);
  this.logger.info('Status validation passed', { expected: expectedStatus, actual: this.context.apiResponse.status });
  this.stepLogger.logAssertion('response_status', expectedStatus, this.context.apiResponse.status);
});
```

**Pattern 2: Content Validation**

```typescript
Then('the response should contain {string}', async function(this: CustomWorld, expectedContent: string) {
  expect(this.context.apiResponse).toBeDefined();
  const responseText = JSON.stringify(this.context.apiResponse.data);
  expect(responseText).toContain(expectedContent);
  this.stepLogger.logAssertion('response_content', expectedContent, 'found');
});
```

**Pattern 3: Array Response Validation**

```typescript
Then('the response should contain {int} items', async function(this: CustomWorld, count: number) {
  const items = Array.isArray(this.context.apiResponse.data) ? 
    this.context.apiResponse.data : this.context.apiResponse.data.data;
  expect(Array.isArray(items)).toBeTruthy();
  expect(items.length).toBe(count);
  this.stepLogger.logAssertion('item_count', count, items.length);
});
```

**Pattern 4: Schema Validation**

```typescript
Then('the response should match the {string} schema', async function(this: CustomWorld, schemaName: string) {
  const response = this.context.apiResponse.data;
  const schema = await this.getSchemaFromBusinessRules(schemaName);
  
  // Validate required fields
  for (const field of schema.required || []) {
    expect(response).toHaveProperty(field);
    expect(response[field]).toBeDefined();
  }
  
  this.stepLogger.logAssertion('schema_validation', schemaName, 'passed');
});
```

### Error Handling Patterns

**Pattern 1: Expected Error Handling**

```typescript
When('I attempt to access {string} without authentication', 
  async function(this: CustomWorld, endpoint: string) {
    try {
      const originalAuth = this.apiClient.getAuthHeader();
      this.apiClient.removeAuthentication();
      this.context.apiResponse = await this.apiClient.get(endpoint);
      this.apiClient.setAuthHeader(originalAuth);
    } catch (error) {
      this.context.apiError = error;
      this.context.apiResponse = error.response;
    }
});
```

**Pattern 2: Validation Error Checking**

```typescript
Then('the validation should fail for field {string}', async function(this: CustomWorld, fieldName: string) {
  const response = this.context.apiResponse;
  expect(response.status).toBe(400);
  
  const errors = response.data.errors || response.data.validation_errors || [];
  const fieldError = errors.find((err: any) => 
    err.field === fieldName || err.param === fieldName
  );
  
  expect(fieldError).toBeDefined();
  this.stepLogger.logAssertion('validation_error_for_field', fieldName, 'found');
});
```

## Reusable Helper Functions

### API Request Helper

```typescript
async function sendApiRequest(
  context: CustomWorld, 
  method: string, 
  endpoint: string, 
  data?: any,
  headers?: Record<string, string>
): Promise<ApiResponse> {
  context.logger.info('Sending API request', { method, endpoint });
  const response = await context.apiClient.request({
    method: method.toUpperCase(),
    url: endpoint,
    data,
    headers
  });
  context.stepLogger.logAction('api_request', `${method} ${endpoint}`);
  return response;
}
```

### Response Validation Helper

```typescript
async function validateResponseSchema(context: CustomWorld, response: any, schemaName: string): Promise<void> {
  const schema = context.getSchemaFromBusinessRules(schemaName);
  const isValid = context.validateAgainstSchema(response.data, schema);
  expect(isValid.valid).toBeTruthy();
  context.stepLogger.logAssertion('schema_validation', schemaName, isValid.valid);
}
```

### Error Handling Helper

```typescript
async function handleApiError(context: CustomWorld, error: any): Promise<void> {
  context.logger.error('API operation failed', {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data
  });
  context.context.lastError = {
    message: error.message,
    status: error.response?.status,
    response: error.response?.data
  };
}
```

## Scenario Context Management

### Context Storage Pattern

```typescript
// Extend CustomWorld with API-specific context
declare module '../../framework/core/customWorld' {
  interface CustomWorld {
    apiContext: {
      apiClient: ApiClient;
      lastResponse: ApiResponse | null;
      createdResources: {
        products: number[];
        users: number[];
        orders: number[];
      };
      testData: Map<string, any>;
      authToken: string | null;
    };
  }
}
```

### Cleanup Hook Pattern

```typescript
// After scenario cleanup
After(async function(this: CustomWorld, scenario: ITestCaseHookParameter) {
  if (this.apiContext?.createdResources) {
    // Cleanup created products
    for (const productId of this.apiContext.createdResources.products) {
      try {
        await this.apiContext.apiClient.deleteProduct(productId);
      } catch (error) {
        this.logger.warn('Failed to cleanup product', { productId, error: error.message });
      }
    }
    
    // Clear context
    this.apiContext.testData.clear();
    this.apiContext.lastResponse = null;
  }
});
```

## Best Practices

1. **Generic Steps**: Create generic, reusable steps that work across multiple features
2. **Helper Functions**: Extract common operations into helper functions
3. **Context Management**: Use CustomWorld/context for state sharing
4. **Error Handling**: Always include try-catch for API operations
5. **Logging**: Use stepLogger for all actions and assertions
6. **Cleanup**: Implement After hooks to clean up created resources
