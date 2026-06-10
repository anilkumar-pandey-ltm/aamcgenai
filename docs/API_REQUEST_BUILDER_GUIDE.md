# API Request Builder Agent - Complete Guide

## 🤖 Agent Information

**Agent Mode**: `api-requestbuilder-gen`  
**Agent File**: `.github/agents/api-requestbuilder-gen.agent.md`  
**Activation**: Use `@api-requestbuilder-gen` prefix in your Copilot prompts

### How to Activate This Agent

```
@api-requestbuilder-gen [Your Prompt]
```

**Example:**
```
@api-requestbuilder-gen Generate Request Builder utilities for API test automation for TypeScript automation framework
```

## 📖 Table of Contents
- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [What Gets Generated](#-what-gets-generated)
- [Supported Languages & Frameworks](#-supported-languages--frameworks)
- [Key Features](#-key-features)
- [Usage Examples](#-usage-examples)
- [Configuration](#️-configuration)
- [Demo Prompts](#-demo-prompts)
- [Advanced Features](#-advanced-features)
- [Testing Patterns](#-testing-patterns)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

The **API Request Builder Agent** is a custom GitHub Copilot agent that generates production-ready, reusable HTTP client utilities for API test automation. It eliminates repetitive code for HTTP operations and provides framework-agnostic utilities with authentication, retry logic, logging, and error handling.

### Package Contents
```
📁 Package Structure
├── .github/agents/api-requestbuilder-agent.agent.md  (~3,000 lines)
│   └── Complete agent instructions and workflow
├── docs/API_REQUEST_BUILDER_GUIDE.md  (This file)
│   └── User guide, examples, and best practices
└── Generated Output (when you use the agent)
    ├── framework/api/clients/       # HTTP client utilities
    ├── framework/api/config/        # Configuration files
    ├── framework/api/examples/      # Usage examples
    └── docs/REQUEST_BUILDER_GUIDE.md # Generated documentation
```

---

## 🚀 Quick Start

### Simple Usage

Just prompt GitHub Copilot with:

```
Generate Request Builder utilities for API test automation for Python automation framework.
```

The agent will:
1. ✅ Analyze your framework structure using MCP Context Server
2. ✅ Detect the programming language and test framework
3. ✅ Generate complete Request Builder utilities
4. ✅ Create configuration files and examples
5. ✅ Provide comprehensive documentation

### Detailed Usage

For more control, use a detailed prompt:

```
Create an API Request Builder for TypeScript test framework with:
- Authentication: OAuth2 and Bearer Token
- Features: Retry logic, Circuit breaker, Response caching
- Output: framework/api/clients/
```

---

## 📋 What Gets Generated

### Core Utilities

```
framework/api/clients/
├── BaseHttpClient      # Core HTTP operations (GET, POST, PUT, PATCH, DELETE)
├── AuthManager         # Authentication strategies (Bearer, OAuth2, JWT, API Key)
├── RequestBuilder      # Fluent API for building requests
├── ResponseHandler     # Response parsing and validation
├── RetryManager        # Retry logic with exponential backoff
├── Logger              # Request/response logging with data masking
└── ConfigLoader        # Configuration management
```

### Configuration Files

```
framework/api/config/
├── api_config.yaml     # Base API configuration
└── auth_config.yaml    # Authentication configurations
```

### Examples & Documentation

```
framework/api/examples/
├── basic_usage         # Simple GET/POST examples
├── advanced_auth       # OAuth2, JWT examples
└── retry_examples      # Retry and circuit breaker examples

docs/
└── REQUEST_BUILDER_GUIDE.md  # Comprehensive guide
```

---

## 🎨 Supported Languages & Frameworks

### Languages
| Language | HTTP Libraries | Test Frameworks |
|----------|----------------|-----------------|
| **Python** | requests, httpx, aiohttp | Pytest, unittest |
| **Java** | RestAssured, OkHttp, Apache HttpClient | JUnit, TestNG |
| **JavaScript/TypeScript** | axios, node-fetch, supertest, got | Jest, Mocha, Jasmine |
| **C#** | HttpClient, RestSharp, Flurl | NUnit, xUnit |
| **Go** | net/http, resty | testing, testify |
| **Ruby** | faraday, httparty | RSpec, Minitest |

---

## 🔑 Key Features

### 1. HTTP Methods Support
- GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- Automatic retry on failure
- Configurable timeouts

### 2. Authentication Methods
- **Bearer Token**: Simple token-based auth
- **API Key**: Custom header-based authentication
- **OAuth2**: Full OAuth2 flow with token refresh
- **JWT**: JSON Web Token with refresh support
- **Basic Auth**: Username/password authentication
- **Custom Auth**: Implement your own auth strategy

### 3. Retry Logic
- Exponential backoff (2^n delay)
- Configurable retry attempts (default: 3)
- Retry on specific status codes (408, 429, 500, 502, 503, 504)
- Circuit breaker pattern to prevent cascading failures

### 4. Request/Response Logging
- Comprehensive logging of all requests and responses
- Automatic masking of sensitive data (tokens, passwords, API keys)
- Configurable log levels (DEBUG, INFO, WARNING, ERROR)
- Support for different log formats

### 5. Fluent API
- Intuitive, chainable request building
- Type-safe method calls
- IDE auto-completion support

---

## 📖 Usage Examples

### Example 1: Simple GET Request

```python
from framework.api.clients import ApiClient

# Initialize client
client = ApiClient(base_url="https://api.example.com")

# Make GET request
response = client.get("/users/123")
user = response.json()
print(f"User: {user['name']}")
```

### Example 2: POST with Bearer Token Authentication

```python
from framework.api.clients import ApiClient, BearerTokenAuth

# Setup authentication
auth = BearerTokenAuth(token="your-api-token")
client = ApiClient(base_url="https://api.example.com", auth=auth)

# POST request with JSON body
response = client.post("/users", json={
    "name": "John Doe",
    "email": "john@example.com"
})

created_user = response.json()
print(f"Created user ID: {created_user['id']}")
```

### Example 3: Using Fluent Request Builder

```python
from framework.api.clients import RequestBuilder

response = (RequestBuilder("https://api.example.com")
    .endpoint("/users")
    .method("POST")
    .header("Content-Type", "application/json")
    .header("Authorization", "Bearer your-token")
    .query_param("notify", True)
    .body({"name": "Jane", "email": "jane@example.com"})
    .timeout(30)
    .execute())

print(f"Status: {response.status_code}")
```

### Example 4: OAuth2 Authentication with Auto-Refresh

```python
from framework.api.clients import ApiClient, OAuth2AuthManager

# Setup OAuth2
oauth2 = OAuth2AuthManager(
    client_id="your-client-id",
    client_secret="your-client-secret",
    token_url="https://auth.example.com/oauth/token"
)

# Client automatically refreshes token when expired
client = ApiClient(base_url="https://api.example.com", auth=oauth2)

# Make authenticated requests
response = client.get("/protected-resource")
```

### Example 5: Retry Logic Configuration

```python
from framework.api.clients import ApiClient, RetryManager

# Configure retry behavior
retry_manager = RetryManager(
    max_retries=5,
    backoff_factor=2.0,
    retry_on_status=[408, 429, 500, 502, 503, 504]
)

client = ApiClient(
    base_url="https://api.example.com",
    retry_manager=retry_manager
)

# Will automatically retry on failure with exponential backoff
response = client.get("/unstable-endpoint")
```

### Example 6: Pytest Integration

```python
# conftest.py
import pytest
from framework.api.clients import ApiClient, BearerTokenAuth

@pytest.fixture(scope="session")
def api_client():
    """Shared API client for all tests"""
    auth = BearerTokenAuth(token=os.getenv("API_TOKEN"))
    client = ApiClient(
        base_url=os.getenv("API_BASE_URL"),
        auth=auth
    )
    yield client

# test_users.py
def test_get_user(api_client):
    response = api_client.get("/users/123")
    assert response.status_code == 200
    user = response.json()
    assert "name" in user

def test_create_user(api_client):
    response = api_client.post("/users", json={
        "name": "Test User",
        "email": "test@example.com"
    })
    assert response.status_code == 201
```

---

## ⚙️ Configuration

### API Configuration (`api_config.yaml`)

```yaml
# Base configuration
base_url: "https://api.example.com"
timeout: 30
verify_ssl: true
max_retries: 3
backoff_factor: 2.0

# Authentication
auth:
  type: "bearer"  # bearer, apikey, oauth2, jwt, basic
  token: "${API_TOKEN}"  # Environment variable
  
# Default headers
default_headers:
  Content-Type: "application/json"
  Accept: "application/json"
  User-Agent: "API-Test-Framework/1.0"

# Retry configuration
retry:
  max_attempts: 3
  backoff_factor: 2.0
  retry_on_status: [408, 429, 500, 502, 503, 504]
  
# Circuit breaker
circuit_breaker:
  enabled: true
  failure_threshold: 5
  recovery_timeout: 60
  
# Logging
logging:
  enabled: true
  level: "INFO"
  mask_sensitive: true
  sensitive_keys: ["password", "token", "api_key", "secret"]
```

### Authentication Configuration (`auth_config.yaml`)

```yaml
# Environment-specific authentication
environments:
  dev:
    auth_type: "bearer"
    token: "${DEV_API_TOKEN}"
    base_url: "https://dev-api.example.com"
    
  staging:
    auth_type: "oauth2"
    client_id: "${STAGING_CLIENT_ID}"
    client_secret: "${STAGING_CLIENT_SECRET}"
    token_url: "https://staging-auth.example.com/oauth/token"
    base_url: "https://staging-api.example.com"
    
  prod:
    auth_type: "jwt"
    jwt_token: "${PROD_JWT_TOKEN}"
    refresh_token: "${PROD_REFRESH_TOKEN}"
    base_url: "https://api.example.com"
```

### Environment Variables

Create a `.env` file:

```bash
# API Configuration
API_BASE_URL=https://api.example.com
API_TOKEN=your-bearer-token-here

# OAuth2 Configuration
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_TOKEN_URL=https://auth.example.com/oauth/token

# Environment Selection
API_ENV=dev  # dev, staging, prod
```

---

## 🎯 Demo Prompts

### Demo 1: Basic Python Request Builder
```
Generate Request Builder utilities for API test automation for Python automation framework.
```

**Expected Output**: BaseHttpClient, AuthManager, config files, examples

---

### Demo 2: TypeScript with Advanced Features
```
Create an API Request Builder for TypeScript test framework with:
- Authentication: OAuth2 and Bearer Token
- Features: Retry logic, Circuit breaker, Response caching
- Output: framework/api/clients/
```

**Expected Output**: TypeScript client with axios, OAuth2, retry, circuit breaker

---

### Demo 3: Java with RestAssured
```
Generate API Request Builder for Java with RestAssured:
- Language: Java
- Auth: Bearer Token, API Key, OAuth2
- Features: Retry logic, Timeout handling, Request/Response logging
- Integration: JUnit
- Output: src/main/java/framework/api/clients/
```

**Expected Output**: Java classes with RestAssured, JUnit integration

---

### Demo 4: Python Async with httpx
```
Create async API Request Builder for Python using httpx with:
- Async/await support
- Connection pooling
- Authentication: Bearer Token, OAuth2, JWT
- Features: Retry logic with exponential backoff, Request logging
- Integration: Pytest-asyncio
- Output: framework/api/clients/
```

**Expected Output**: Async HTTP client with httpx, async auth, pytest-asyncio

---

### Demo 5: C# with Dependency Injection
```
Generate C# API Request Builder with:
- Language: C#
- HTTP Library: HttpClient
- Features: Dependency Injection, Retry policy, Logging
- Integration: xUnit
- Output: Framework/Api/Clients/
```

**Expected Output**: C# classes with DI, Polly retry, xUnit tests

---

## 🔧 Advanced Features

### Custom Authentication Handler

```python
from framework.api.clients import BaseAuthHandler

class CustomApiKeyAuth(BaseAuthHandler):
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    def get_auth_header(self) -> str:
        return f"X-API-Key: {self.api_key}"
    
    def handle_auth_failure(self, response) -> bool:
        if response.status_code == 401:
            # Refresh API key logic
            return True
        return False

# Use custom auth
client = ApiClient(
    base_url="https://api.example.com",
    auth=CustomApiKeyAuth("your-api-key")
)
```

### Request/Response Interceptors

```python
class LoggingInterceptor:
    def before_request(self, request_config):
        print(f"Sending request to: {request_config['url']}")
        return request_config
    
    def after_response(self, response):
        print(f"Received response: {response.status_code}")
        return response

client = ApiClient(
    base_url="https://api.example.com",
    interceptors=[LoggingInterceptor()]
)
```

### Circuit Breaker Pattern

```python
from framework.api.clients import CircuitBreaker

circuit_breaker = CircuitBreaker(
    failure_threshold=5,
    recovery_timeout=60
)

client = ApiClient(
    base_url="https://api.example.com",
    circuit_breaker=circuit_breaker
)

# Circuit breaker prevents cascading failures
try:
    response = client.get("/unstable-endpoint")
except CircuitBreakerOpenError:
    print("Circuit breaker is OPEN, service unavailable")
```

### Response Caching

```python
from framework.api.clients import ResponseCache

cache = ResponseCache(ttl=300)  # 5 minutes TTL

client = ApiClient(
    base_url="https://api.example.com",
    response_cache=cache
)

# First call hits the API
response1 = client.get("/users/123")

# Second call returns cached response
response2 = client.get("/users/123")
```

---

## 🧪 Testing Patterns

### Pattern 1: Fixture-Based Testing

```python
@pytest.fixture
def api_client():
    return ApiClient(base_url="https://api.example.com")

@pytest.fixture
def user_factory(api_client):
    created_users = []
    
    def _create_user(**kwargs):
        response = api_client.post("/users", json=kwargs)
        user = response.json()
        created_users.append(user["id"])
        return user
    
    yield _create_user
    
    # Cleanup
    for user_id in created_users:
        api_client.delete(f"/users/{user_id}")

def test_user_creation(user_factory):
    user = user_factory(name="Test User")
    assert user["name"] == "Test User"
```

### Pattern 2: BDD/Cucumber Integration

```gherkin
Feature: User Management API

  Scenario: Create a new user
    Given I have an authenticated API client
    When I send a POST request to "/users" with data:
      | name     | email              |
      | John Doe | john@example.com   |
    Then the response status code should be 201
    And the response should contain "name" with value "John Doe"
```

```python
# features/steps/api_steps.py
@given('I have an authenticated API client')
def step_impl(context):
    context.api_client = ApiClient(
        base_url="https://api.example.com",
        auth=BearerTokenAuth(token="test-token")
    )

@when('I send a POST request to "{endpoint}" with data')
def step_impl(context, endpoint):
    data = {row['name']: row['email'] for row in context.table}
    context.response = context.api_client.post(endpoint, json=data)

@then('the response status code should be {status_code:d}')
def step_impl(context, status_code):
    assert context.response.status_code == status_code
```

---

## 📊 Best Practices

### 1. Environment-Specific Configuration
- ✅ Use environment variables for sensitive data
- ✅ Maintain separate configs for dev/staging/prod
- ❌ Never commit credentials to version control

### 2. Logging Strategy
- ✅ Use DEBUG level in development
- ✅ Use INFO level in production
- ✅ Always mask sensitive data in logs
- ✅ Rotate log files regularly

### 3. Error Handling
- ✅ Implement comprehensive error handling
- ✅ Use specific exception types
- ✅ Provide meaningful error messages
- ✅ Log errors with context

### 4. Performance Optimization
- ✅ Use connection pooling
- ✅ Enable HTTP keep-alive
- ✅ Cache responses when appropriate
- ✅ Use parallel requests for bulk operations

### 5. Security
- ✅ Always use HTTPS in production
- ✅ Validate SSL certificates
- ✅ Store credentials securely (env vars, secrets managers)
- ✅ Implement token rotation
- ✅ Mask sensitive data in logs and error messages

---

## 🐛 Troubleshooting

### Issue 1: Import Errors
**Problem**: Cannot import generated utilities

**Solution**: Ensure the output directory is in your Python path:
```python
import sys
sys.path.append('framework/api/clients')
```

---

### Issue 2: Authentication Failures
**Problem**: 401 Unauthorized errors

**Solution**: 
- Verify token/credentials are correct
- Check if token has expired
- Ensure correct authentication method is used

---

### Issue 3: Timeout Errors
**Problem**: Requests timing out

**Solution**:
- Increase timeout in configuration
- Check network connectivity
- Verify API endpoint is accessible

---

### Issue 4: Retry Not Working
**Problem**: Requests not retrying on failure

**Solution**:
- Check retry configuration
- Verify status codes are in retry_on_status list
- Ensure RetryManager is properly initialized

---

## 📚 Additional Resources

### Generated Documentation
After generation, refer to:
- `docs/REQUEST_BUILDER_GUIDE.md` - Comprehensive guide
- `framework/api/examples/` - Usage examples
- `framework/api/README.md` - Quick reference

### External Resources
- [Python Requests Documentation](https://requests.readthedocs.io/)
- [Axios Documentation](https://axios-http.com/)
- [RestAssured Documentation](https://rest-assured.io/)
- [HTTP Status Codes](https://httpstatuses.com/)

---

## ✨ Summary

The API Request Builder Agent provides:

| Feature | Description |
|---------|-------------|
| ✅ **Zero Duplication** | Centralized HTTP client eliminates repeated code |
| ✅ **Multi-Language** | Supports Python, Java, JavaScript/TypeScript, C#, and more |
| ✅ **Production Ready** | Includes auth, retry, logging, error handling |
| ✅ **Framework Agnostic** | Adapts to any test framework |
| ✅ **MCP Context Aware** | Leverages framework context automatically |
| ✅ **Best Practices** | Follows industry standards |
| ✅ **Extensible** | Easy to customize and extend |
| ✅ **Well Documented** | Comprehensive guides and examples |

### Get Started Now

Use this simple prompt:
```
Generate Request Builder utilities for API test automation for Python automation framework.
```

Happy Testing! 🚀
