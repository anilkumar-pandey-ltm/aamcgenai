---
name: api-testing-best-practices
description: Advanced patterns for authentication, validation, error handling, and response testing in API automation frameworks.
---

# API Testing Best Practices

Advanced patterns for authentication, validation, error handling, and response testing in API automation.

## Authentication Patterns

### Token Refresh Pattern

```typescript
Given('I have an API client with expiring token', async function(this: CustomWorld) {
  const expiredToken = process.env.EXPIRED_API_TOKEN || 'expired-token';
  this.apiContext.apiClient = new ApiClient(this.config.baseUrl, expiredToken);
  
  // Configure auto-refresh on 401
  this.apiContext.apiClient.onAuthFailure(async () => {
    this.logger.info('Token expired, refreshing...');
    const newToken = await this.refreshToken();
    this.apiContext.apiClient.setAuthHeader(newToken);
    this.apiContext.authToken = newToken;
    return true; // Retry request
  });
  
  this.stepLogger.logAction('setup_auto_refresh', 'enabled');
});

async function refreshToken(this: CustomWorld): Promise<string> {
  const refreshToken = this.config.refreshToken || this.apiContext.refreshToken;
  const response = await fetch(`${this.config.authUrl}/refresh`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Refresh-Token': refreshToken
    }
  });
  const data = await response.json();
  return data.access_token || data.token;
}
```

### Multiple Auth Schemes

```typescript
Given('I have API client for {string} environment with {string} authentication', 
  async function(this: CustomWorld, environment: string, authType: string) {
    const authConfig = await this.loadAuthConfig(environment);
    const baseUrl = this.config.environments[environment];
    
    switch (authType.toLowerCase()) {
      case 'bearer':
      case 'bearer token':
        this.apiContext.apiClient = new ApiClient(baseUrl);
        this.apiContext.apiClient.setBearerToken(authConfig.token);
        break;
        
      case 'api key':
      case 'apikey':
        this.apiContext.apiClient = new ApiClient(baseUrl);
        this.apiContext.apiClient.setHeader('X-API-Key', authConfig.apiKey);
        break;
        
      case 'oauth2':
      case 'oauth':
        const token = await this.getOAuth2Token(authConfig);
        this.apiContext.apiClient = new ApiClient(baseUrl);
        this.apiContext.apiClient.setBearerToken(token);
        break;
        
      case 'basic':
      case 'basic auth':
        this.apiContext.apiClient = new ApiClient(baseUrl);
        this.apiContext.apiClient.setBasicAuth(authConfig.username, authConfig.password);
        break;
        
      default:
        throw new Error(`Unsupported auth type: ${authType}`);
    }
    
    this.logger.info('API client configured', { environment, authType });
});
```

## Response Validation Patterns

### Schema Validation

```typescript
Then('the response should match the {string} schema', async function(this: CustomWorld, schemaName: string) {
  const response = this.apiContext.lastResponse.data;
  const schema = await this.getSchemaFromBusinessRules(schemaName);
  
  // Validate required fields
  for (const field of schema.required || []) {
    expect(response).toHaveProperty(field);
    expect(response[field]).toBeDefined();
    expect(response[field]).not.toBeNull();
  }
  
  // Validate types
  if (schema.properties) {
    for (const [field, fieldSchema] of Object.entries(schema.properties)) {
      if (response[field] !== null && response[field] !== undefined) {
        const actualType = typeof response[field];
        expect(actualType).toBe(fieldSchema.type);
      }
    }
  }
  
  this.stepLogger.logAssertion('schema_validation', schemaName, 'passed');
});
```

### Array Validation

```typescript
Then('the response should contain {int} items', async function(this: CustomWorld, count: number) {
  const response = this.apiContext.lastResponse.data;
  const items = Array.isArray(response) ? response : response.data || response.items;
  
  expect(Array.isArray(items)).toBeTruthy();
  expect(items.length).toBe(count);
  this.stepLogger.logAssertion('item_count', count, items.length);
});

Then('each item should have required fields', async function(this: CustomWorld) {
  const items = this.apiContext.lastResponse.data;
  const requiredFields = await this.getRequiredFieldsFromBusinessRules('item') || 
    ['id', 'name'];
  
  for (const [index, item] of items.entries()) {
    for (const field of requiredFields) {
      expect(item).toHaveProperty(field, 
        `Item at index ${index} missing required field: ${field}`);
      expect(item[field]).toBeDefined();
      expect(item[field]).not.toBeNull();
    }
  }
  
  this.logger.info('Array validation passed', { count: items.length, requiredFields });
});
```

### Header Validation

```typescript
Then('the response should have header {string} with value {string}', 
  async function(this: CustomWorld, headerName: string, expectedValue: string) {
    const headers = this.apiContext.lastResponse.headers;
    const actualValue = headers[headerName.toLowerCase()];
    
    expect(actualValue).toBeDefined();
    expect(actualValue).toBe(expectedValue);
    this.stepLogger.logAssertion('header_validation', headerName, actualValue);
});

Then('the response should have Content-Type {string}', 
  async function(contentType: string) {
    const headers = this.apiContext.lastResponse.headers;
    expect(headers['content-type']).toContain(contentType);
});
```

### Nested Object Validation

```typescript
Then('the response field {string} should contain {string}', 
  async function(fieldPath: string, expectedValue: string) {
    const response = this.apiContext.lastResponse.data;
    const fieldValue = getNestedProperty(response, fieldPath);
    
    expect(fieldValue).toBeDefined();
    expect(String(fieldValue)).toContain(expectedValue);
});

function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}
```

## Error Scenario Patterns

### Expected Error Handling

```typescript
When('I attempt to access {string} without authentication', 
  async function(this: CustomWorld, endpoint: string) {
    try {
      const originalAuth = this.apiContext.apiClient.getAuthHeader();
      this.apiContext.apiClient.removeAuthentication();
      this.apiContext.lastResponse = await this.apiContext.apiClient.get(endpoint);
      this.apiContext.apiClient.setAuthHeader(originalAuth);
    } catch (error) {
      this.apiContext.apiError = error;
      this.apiContext.lastResponse = error.response;
    }
    this.stepLogger.logAction('unauthenticated_request', endpoint);
});

Then('the request should fail with status {int}', async function(this: CustomWorld, expectedStatus: number) {
  const response = this.apiContext.lastResponse;
  expect(response).toBeDefined();
  expect(response.status).toBe(expectedStatus);
  this.logger.info('Expected error received', { status: expectedStatus });
  this.stepLogger.logAssertion('error_status', expectedStatus, response.status);
});
```

### Validation Error Testing

```typescript
When('I create a resource with invalid data:', async function(this: CustomWorld, dataTable: DataTable) {
  const invalidData = dataTable.rowsHash();
  try {
    this.apiContext.lastResponse = await this.apiContext.apiClient.create(invalidData);
  } catch (error) {
    this.apiContext.apiError = error;
    this.apiContext.lastResponse = error.response;
  }
  this.stepLogger.logAction('create_with_invalid_data', Object.keys(invalidData));
});

Then('the validation should fail for field {string}', async function(this: CustomWorld, fieldName: string) {
  const response = this.apiContext.lastResponse;
  expect(response.status).toBe(400);
  
  const errors = response.data.errors || response.data.validation_errors || response.data.details || [];
  const fieldError = errors.find((err: any) => 
    err.field === fieldName || 
    err.param === fieldName || 
    err.property === fieldName ||
    err.path?.includes(fieldName)
  );
  
  expect(fieldError).toBeDefined();
  this.logger.info('Validation error found for field', { fieldName, error: fieldError });
  this.stepLogger.logAssertion('validation_error_for_field', fieldName, 'found');
});
```

### Rate Limiting Tests

```typescript
When('I send {int} requests to {string} rapidly', 
  async function(this: CustomWorld, count: number, endpoint: string) {
    const responses = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const response = await this.apiContext.apiClient.get(endpoint);
        responses.push(response);
      } catch (error) {
        responses.push({ status: error.response?.status, error: error.message });
      }
    }
    
    this.apiContext.testData.set('bulkResponses', responses);
    this.stepLogger.logAction('bulk_requests', count);
});

Then('at least one request should be rate limited', async function(this: CustomWorld) {
  const responses = this.apiContext.testData.get('bulkResponses');
  const rateLimited = responses.some((r: any) => r.status === 429);
  
  expect(rateLimited).toBeTruthy();
  this.logger.info('Rate limiting detected', { 
    totalRequests: responses.length,
    rateLimitedCount: responses.filter((r: any) => r.status === 429).length
  });
});
```

## Scenario Lifecycle Management

### Context Initialization

```typescript
Given('I have an authenticated API client', async function(this: CustomWorld) {
  this.apiContext = {
    apiClient: new ApiClient(this.config.baseUrl, this.config.apiKey),
    lastResponse: null,
    createdResources: {
      products: [],
      users: [],
      orders: []
    },
    testData: new Map(),
    authToken: null
  };
  this.logger.info('API context initialized', { baseUrl: this.config.baseUrl });
});
```

### Resource Tracking

```typescript
When('I create a product with name {string}', async function(this: CustomWorld, name: string) {
  const response = await this.apiContext.apiClient.createProduct({ name });
  const productId = response.data.id;
  
  // Store for later assertions and cleanup
  this.apiContext.createdResources.products.push(productId);
  this.apiContext.testData.set('lastCreatedProductId', productId);
  this.apiContext.testData.set(`product_${name}`, productId);
  this.apiContext.lastResponse = response;
  
  this.stepLogger.logAction('create_product', productId);
});
```

### Cleanup Hook

```typescript
After(async function(this: CustomWorld, scenario: ITestCaseHookParameter) {
  if (this.apiContext?.createdResources) {
    this.logger.info('Cleaning up scenario resources', { 
      scenario: scenario.pickle.name,
      products: this.apiContext.createdResources.products.length
    });
    
    // Cleanup created products
    for (const productId of this.apiContext.createdResources.products) {
      try {
        await this.apiContext.apiClient.deleteProduct(productId);
        this.logger.info('Cleaned up product', { productId });
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

## Performance Testing Patterns

### Response Time Validation

```typescript
Then('the response time should be less than {int} ms', async function(this: CustomWorld, maxTime: number) {
  const responseTime = this.apiContext.lastResponse.duration || 0;
  expect(responseTime).toBeLessThan(maxTime);
  this.stepLogger.logAssertion('response_time', maxTime, responseTime);
});
```

### Concurrent Requests

```typescript
When('I send {int} concurrent requests to {string}', 
  async function(this: CustomWorld, count: number, endpoint: string) {
    const startTime = Date.now();
    const promises = Array(count).fill(null).map(() => 
      this.apiContext.apiClient.get(endpoint)
    );
    
    const responses = await Promise.allSettled(promises);
    const duration = Date.now() - startTime;
    
    this.apiContext.testData.set('concurrentResponses', responses);
    this.apiContext.testData.set('concurrentDuration', duration);
    this.stepLogger.logAction('concurrent_requests', { count, duration});
});
```

## Best Practices Summary

1. **Authentication**: Support multiple auth schemes with auto-refresh
2. **Validation**: Comprehensive schema, array, header, and nested object validation
3. **Error Handling**: Test expected errors, validation failures, and rate limiting
4. **Lifecycle**: Initialize context, track resources, cleanup after scenarios
5. **Performance**: Measure response times and test concurrent requests
6. **Logging**: Use stepLogger for all actions and assertions
