---
name: http-client-architecture
description: Comprehensive HTTP client architecture patterns for API test automation including BaseClient, AuthManager, RequestBuilder, ResponseHandler, and RetryManager components across multiple languages.
---

# HTTP Client Architecture Patterns

## Overview
This skill file defines comprehensive HTTP client architecture patterns for API test automation. These patterns apply across multiple programming languages and testing frameworks, providing reusable designs for building robust, maintainable HTTP client utilities.

## Core HTTP Client Architecture

### Component Structure

```
RequestBuilder/
├── BaseClient          # Core HTTP operations (GET, POST, PUT, PATCH, DELETE)
├── AuthManager         # Authentication strategies and token management
├── RequestBuilder      # Fluent API for constructing requests
├── ResponseHandler     # Response processing and validation
├── RetryManager        # Retry logic with exponential backoff
├── LoggerService       # Request/response logging and debugging
└── ConfigManager       # Configuration management and environment handling
```

##Base HTTP Client Patterns

### Responsibilities
- Execute HTTP requests (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- Handle request timeouts and cancellation
- Process request/response headers
- Support custom configurations
- Session management
- SSL/TLS verification control
- Proxy support

### Core Interface Pattern

```python
# Python Example
class BaseHttpClient:
    def __init__(self, base_url: str, config: Optional[Dict] = None)
    def get(self, endpoint: str, **kwargs) -> Response
    def post(self, endpoint: str, **kwargs) -> Response
    def put(self, endpoint: str, **kwargs) -> Response
    def patch(self, endpoint: str, **kwargs) -> Response
    def delete(self, endpoint: str, **kwargs) -> Response
    def head(self, endpoint: str, **kwargs) -> Response
    def options(self, endpoint: str, **kwargs) -> Response
    def request(self, method: str, endpoint: str, **kwargs) -> Response
```

```typescript
// TypeScript Example
class BaseHttpClient {
  constructor(baseUrl: string, config?: HttpConfig);
  async get<T>(endpoint: string, options?: RequestOptions): Promise<Response<T>>;
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<Response<T>>;
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<Response<T>>;
  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<Response<T>>;
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<Response<T>>;
  async request<T>(method: string, endpoint: string, options?: RequestOptions): Promise<Response<T>>;
}
```

```java
// Java Example
public class BaseHttpClient {
    public BaseHttpClient(String baseUrl, HttpConfig config);
    public Response get(String endpoint, RequestOptions options);
    public Response post(String endpoint, Object data, RequestOptions options);
    public Response put(String endpoint, Object data, RequestOptions options);
    public Response patch(String endpoint, Object data, RequestOptions options);
    public Response delete(String endpoint, RequestOptions options);
    public Response request(String method, String endpoint, RequestOptions options);
}
```

### Key Features

#### Base URL Management
```python
class BaseHttpClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
    
    def _build_url(self, endpoint: str) -> str:
        endpoint = endpoint.lstrip('/')
        return f"{self.base_url}/{endpoint}"
```

#### Default Headers Configuration
```python
def __init__(self, base_url: str, config: Optional[Dict] = None):
    self.default_headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'API-Test-Framework/1.0'
    }
    if config and 'headers' in config:
        self.default_headers.update(config['headers'])
```

#### Session Management
```python
def __init__(self, base_url: str):
    self.session = requests.Session()
    self.session.headers.update(self.default_headers)

def close(self):
    self.session.close()
```

#### SSL Verification Control
```python
def request(self, method: str, endpoint: str, verify_ssl: bool = True, **kwargs):
    kwargs['verify'] = verify_ssl
    return self.session.request(method, self._build_url(endpoint), **kwargs)
```

## Request Builder Pattern (Fluent API)

### Responsibilities
- Fluent interface for constructing requests
- Header management (add, remove, update)
- Query parameter handling
- Request body construction (JSON, XML, form-data, multipart)
- Timeout configuration
- Authentication integration

### Fluent API Implementation

```python
# Python Fluent API Pattern
class RequestBuilder:
    def __init__(self, base_url: str):
        self._base_url = base_url
        self._endpoint = ""
        self._method = "GET"
        self._headers = {}
        self._query_params = {}
        self._body = None
        self._timeout = 30
        self._auth = None
    
    def endpoint(self, path: str) -> 'RequestBuilder':
        """Set endpoint path"""
        self._endpoint = path
        return self
    
    def method(self, method: str) -> 'RequestBuilder':
        """Set HTTP method"""
        self._method = method.upper()
        return self
    
    def header(self, key: str, value: str) -> 'RequestBuilder':
        """Add single header"""
        self._headers[key] = value
        return self
    
    def headers(self, headers: Dict[str, str]) -> 'RequestBuilder':
        """Set multiple headers"""
        self._headers.update(headers)
        return self
    
    def query_param(self, key: str, value: Any) -> 'RequestBuilder':
        """Add single query parameter"""
        self._query_params[key] = value
        return self
    
    def query_params(self, params: Dict[str, Any]) -> 'RequestBuilder':
        """Set multiple query parameters"""
        self._query_params.update(params)
        return self
    
    def body(self, data: Any) -> 'RequestBuilder':
        """Set request body (auto-serializes JSON/XML)"""
        self._body = data
        return self
    
    def json(self, data: Dict) -> 'RequestBuilder':
        """Set JSON body"""
        self._headers['Content-Type'] = 'application/json'
        self._body = data
        return self
    
    def xml(self, data: str) -> 'RequestBuilder':
        """Set XML body"""
        self._headers['Content-Type'] = 'application/xml'
        self._body = data
        return self
    
    def form_data(self, data: Dict) -> 'RequestBuilder':
        """Set form data"""
        self._headers['Content-Type'] = 'application/x-www-form-urlencoded'
        self._body = data
        return self
    
    def timeout(self, seconds: int) -> 'RequestBuilder':
        """Set request timeout"""
        self._timeout = seconds
        return self
    
    def auth(self, auth_manager) -> 'RequestBuilder':
        """Set authentication"""
        self._auth = auth_manager
        return self
    
    def build(self) -> Dict:
        """Build and return request configuration"""
        return {
            'url': f"{self._base_url}{self._endpoint}",
            'method': self._method,
            'headers': self._headers,
            'params': self._query_params,
            'data': self._body,
            'timeout': self._timeout,
            'auth': self._auth
        }
    
    def execute(self) -> Response:
        """Build and execute request"""
        request_config = self.build()
        return requests.request(**request_config)
```

### Usage Examples

#### Simple Request Construction
```python
request = (RequestBuilder("https://api.example.com")
    .endpoint("/users")
    .method("POST")
    .header("Content-Type", "application/json")
    .header("Authorization", f"Bearer {token}")
    .query_param("page", 1)
    .query_param("limit", 10)
    .json({"name": "John", "email": "john@example.com"})
    .timeout(30)
    .execute())
```

#### Advanced Request with Multiple Features
```python
response = (RequestBuilder(base_url)
    .endpoint("/api/v2/products")
    .method("POST")
    .headers({
        "Accept": "application/json",
        "X-Request-ID": str(uuid.uuid4())
    })
    .query_params({
        "include": "metadata",
        "expand": "categories"
    })
    .json({
        "name": "Product Name",
        "price": 99.99,
        "category_id": 5
    })
    .auth(bearer_auth)
    .timeout(60)
    .execute())
```

## Response Handler Patterns

### Responsibilities
- Parse response data (JSON, XML, plain text)
- Validate response status codes
- Extract response headers
- Handle response errors
- Schema validation
- Response transformation

### Core Interface

```python
class ResponseHandler:
    def __init__(self, response: Response):
        self.response = response
    
    def parse_json(self) -> Dict:
        """Parse JSON response"""
        try:
            return self.response.json()
        except ValueError as e:
            raise ResponseParseError(f"Invalid JSON: {str(e)}")
    
    def parse_xml(self) -> Dict:
        """Parse XML response"""
        import xmltodict
        try:
            return xmltodict.parse(self.response.text)
        except Exception as e:
            raise ResponseParseError(f"Invalid XML: {str(e)}")
    
    def validate_status(self, expected_status: int) -> bool:
        """Validate response status code"""
        if self.response.status_code != expected_status:
            raise StatusCodeError(
                f"Expected {expected_status}, got {self.response.status_code}"
            )
        return True
    
    def validate_schema(self, schema: Dict) -> bool:
        """Validate response against JSON schema"""
        from jsonschema import validate, ValidationError
        try:
            data = self.parse_json()
            validate(instance=data, schema=schema)
            return True
        except ValidationError as e:
            raise SchemaValidationError(f"Schema validation failed: {str(e)}")
    
    def extract_header(self, header_name: str) -> Optional[str]:
        """Extract specific header value"""
        return self.response.headers.get(header_name)
    
    def is_success(self) -> bool:
        """Check if response is successful (2xx status)"""
        return 200 <= self.response.status_code < 300
    
    def is_client_error(self) -> bool:
        """Check if response is client error (4xx)"""
        return 400 <= self.response.status_code < 500
    
    def is_server_error(self) -> bool:
        """Check if response is server error (5xx)"""
        return 500 <= self.response.status_code < 600
    
    def get_error_message(self) -> str:
        """Extract error message from response"""
        if self.is_success():
            return ""
        
        try:
            error_data = self.parse_json()
            # Common error message paths
            for key in ['message', 'error', 'error_description', 'detail']:
                if key in error_data:
                    return error_data[key]
        except:
            pass
        
        return self.response.text or f"HTTP {self.response.status_code}"
    
    def to_dict(self) -> Dict:
        """Convert response to dictionary"""
        return {
            'status_code': self.response.status_code,
            'headers': dict(self.response.headers),
            'body': self.parse_json() if self._is_json() else self.response.text,
            'elapsed': self.response.elapsed.total_seconds()
        }
    
    def _is_json(self) -> bool:
        """Check if response content type is JSON"""
        content_type = self.response.headers.get('Content-Type', '')
        return 'application/json' in content_type
```

### Schema Validation Examples

#### JSON Schema Definition
```python
user_schema = {
    "type": "object",
    "properties": {
        "id": {"type": "integer"},
        "name": {"type": "string"},
        "email": {"type": "string", "format": "email"},
        "created_at": {"type": "string", "format": "date-time"}
    },
    "required": ["id", "name", "email"]
}

# Validate response
handler = ResponseHandler(response)
handler.validate_schema(user_schema)
```

#### Custom Validation Rules
```python
class CustomResponseValidator:
    def validate_pagination(self, data: Dict) -> bool:
        """Validate pagination metadata"""
        required_keys = ['page', 'per_page', 'total', 'total_pages']
        return all(key in data for key in required_keys)
    
    def validate_timestamps(self, data: Dict) -> bool:
        """Validate timestamp formats"""
        from datetime import datetime
        timestamp_keys = ['created_at', 'updated_at']
        for key in timestamp_keys:
            if key in data:
                try:
                    datetime.fromisoformat(data[key].replace('Z', '+00:00'))
                except ValueError:
                    return False
        return True
```

## Language-Specific Library Selection

### Python HTTP Libraries

| Library | Use Case | Pros | Cons |
|---------|----------|------|------|
| **requests** | General HTTP client | Simple, widely used, synchronous | No async support |
| **httpx** | Modern HTTP client | Async support, HTTP/2, similar to requests | Newer, smaller ecosystem |
| **aiohttp** | Async HTTP | High performance, async/await | Async-only |
| **urllib3** | Low-level HTTP | Fine-grained control | More code required |

**Recommendation**: Use `httpx` for new projects (async + sync support), `requests` for existing projects.

### TypeScript/JavaScript HTTP Libraries

| Library | Use Case | Pros | Cons |
|---------|----------|------|------|
| **axios** | Promise-based client | Interceptors, auto JSON parsing, browser + Node.js | Larger bundle size |
| **node-fetch** | Fetch API for Node.js | Lightweight, familiar API | Minimal features |
| **got** | Feature-rich client | Stream support, retry logic, hooks | Node.js only |
| **supertest** | API testing | Built for testing, fluent API | Testing-focused |

**Recommendation**: Use `axios` for full-featured client, `node-fetch` for lightweight needs.

### Java HTTP Libraries

| Library | Use Case | Pros | Cons |
|---------|----------|------|------|
| **RestAssured** | API testing | Fluent BDD-style API, validation | Testing-focused |
| **OkHttp** | Production HTTP client | Connection pooling, interceptors | More complex |
| **Apache HttpClient** | Enterprise applications | Mature, feature-rich | Verbose API |
| **HttpClient (JDK 11+)** | Modern Java | Built-in, async support | Requires Java 11+ |

**Recommendation**: Use `RestAssured` for testing, `OkHttp` for production code.

### C# HTTP Libraries

| Library | Use Case | Pros | Cons |
|---------|----------|------|------|
| **HttpClient** | Built-in .NET | Native, async, connection pooling | Verbose for fluent API |
| **RestSharp** | REST client | Simple API, automatic serialization | Less modern |
| **Flurl** | Fluent HTTP | Clean fluent API, easy testing | Additional dependency |
| **Refit** | Type-safe REST client | Auto-generated from interface | Requires interface definition |

**Recommendation**: Use `Flurl` for fluent API, `HttpClient` for direct control.

## Configuration Management Patterns

### Configuration File Structure

```yaml
# api_config.yaml
base_url: "https://api.example.com"
timeout: 30
verify_ssl: true
max_retries: 3
backoff_factor: 2.0

# Authentication
auth:
  type: "bearer"  # bearer, apikey, oauth2, jwt, basic
  token: "${API_TOKEN}"  # Environment variable reference
  
# Headers
default_headers:
  Content-Type: "application/json"
  Accept: "application/json"
  User-Agent: "API-Test-Framework/1.0"
  X-Client-Version: "1.0.0"

# Retry configuration
retry:
  max_attempts: 3
  backoff_factor: 2.0
  retry_on_status: [408, 429, 500, 502, 503, 504]
  
# Logging
logging:
  enabled: true
  level: "INFO"
  mask_sensitive: true
  sensitive_keys: ["password", "token", "api_key", "secret", "authorization"]
```

### Environment-Specific Configuration

```yaml
# auth_config.yaml
environments:
  dev:
    auth_type: "bearer"
    token: "${DEV_API_TOKEN}"
    base_url: "https://dev-api.example.com"
    verify_ssl: false
    
  staging:
    auth_type: "oauth2"
    client_id: "${STAGING_CLIENT_ID}"
    client_secret: "${STAGING_CLIENT_SECRET}"
    token_url: "https://staging-auth.example.com/oauth/token"
    base_url: "https://staging-api.example.com"
    verify_ssl: true
    
  prod:
    auth_type: "jwt"
    jwt_token: "${PROD_JWT_TOKEN}"
    refresh_token: "${PROD_REFRESH_TOKEN}"
    base_url: "https://api.example.com"
    verify_ssl: true
```

### Configuration Loader Pattern

```python
import yaml
import os
from typing import Dict, Any

class ConfigManager:
    def __init__(self, config_path: str):
        self.config_path = config_path
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load and parse configuration file"""
        with open(self.config_path, 'r') as f:
            config = yaml.safe_load(f)
        return self._resolve_env_vars(config)
    
    def _resolve_env_vars(self, config: Dict) -> Dict:
        """Resolve environment variable references"""
        def resolve(value):
            if isinstance(value, str) and value.startswith('${') and value.endswith('}'):
                env_var = value[2:-1]
                return os.getenv(env_var, value)
            elif isinstance(value, dict):
                return {k: resolve(v) for k, v in value.items()}
            elif isinstance(value, list):
                return [resolve(item) for item in value]
            return value
        
        return resolve(config)
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value by key (supports dot notation)"""
        keys = key.split('.')
        value = self.config
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        return value
```

## Best Practices

### DO
✅ Use fluent API for readable request construction
✅ Implement centralized error handling
✅ Support multiple authentication methods
✅ Include request/response logging with sensitive data masking
✅ Make base URL configurable per environment
✅ Use session management for connection pooling
✅ Support both synchronous and asynchronous operations (when needed)
✅ Validate response schemas for contract testing
✅ Extract configuration to YAML/JSON files
✅ Use environment variables for sensitive data

### DON'T
❌ Hardcode base URLs or credentials in code
❌ Log sensitive data (tokens, passwords, API keys) in plain text
❌ Create new HTTP client instance for every request
❌ Ignore response error handling
❌ Use blocking I/O for high-concurrency scenarios
❌ Skip SSL verification in production
❌ Mix business logic with HTTP client logic
❌ Re-implement standard HTTP functionality (use libraries)

## Integration Patterns

### With Test Frameworks

#### Pytest Integration
```python
# conftest.py
import pytest
from framework.api.clients import ApiClient

@pytest.fixture(scope="session")
def api_client():
    client = ApiClient(base_url="https://api.example.com")
    yield client
    client.close()

# test_api.py
def test_get_user(api_client):
    response = api_client.get("/users/1")
    assert response.status_code == 200
```

#### Cucumber/BDD Integration
```typescript
// step_definitions/api_steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { ApiClient } from '../framework/api/clients/apiClient';

Given('I have an API client', function() {
  this.apiClient = new ApiClient(process.env.BASE_URL);
});

When('I send a GET request to {string}', async function(endpoint: string) {
  this.response = await this.apiClient.get(endpoint);
});

Then('the response status should be {int}', function(expectedStatus: number) {
  expect(this.response.status).toBe(expectedStatus);
});
```

## Summary

HTTP Client Architecture provides:
- **Reusable Components**: Base client, request builder, response handler
- **Fluent API**: Readable, chainable request construction
- **Multi-Language Support**: Patterns applicable to Python, Java, TypeScript, C#
- **Configuration Management**: Environment-specific settings with secret management
- **Framework Integration**: Seamless integration with Pytest, Cucumber, JUnit
- **Best Practices**: Error handling, logging, schema validation, session management
