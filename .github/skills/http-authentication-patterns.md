---
name: http-authentication-patterns
description: Comprehensive authentication strategies for HTTP API clients covering Bearer tokens, API keys, OAuth2, JWT, Basic Auth, and custom authentication schemes across multiple programming languages.
---

# HTTP Authentication Patterns

## Overview
This skill file defines comprehensive authentication strategies for HTTP API clients. These patterns cover common authentication methods including Bearer tokens, API keys, OAuth2, JWT, Basic Auth, and custom authentication schemes.

## Authentication Manager Architecture

### Core Interface

```python
# Python Authentication Manager Interface
from abc import ABC, abstractmethod
from typing import Optional, Dict

class AuthenticationStrategy(ABC):
    """Base authentication strategy interface"""
    
    @abstractmethod
    def apply_auth(self, request_headers: Dict[str, str]) -> Dict[str, str]:
        """Apply authentication to request headers"""
        pass
    
    @abstractmethod
    def is_expired(self) -> bool:
        """Check if authentication credentials are expired"""
        pass
    
    @abstractmethod
    def refresh(self) -> bool:
        """Refresh authentication credentials"""
        pass

class AuthenticationManager:
    def __init__(self, strategy: AuthenticationStrategy):
        self.strategy = strategy
    
    def get_auth_headers(self) -> Dict[str, str]:
        """Get authenticated headers"""
        if self.strategy.is_expired():
            self.strategy.refresh()
        return self.strategy.apply_auth({})
    
    def set_strategy(self, strategy: AuthenticationStrategy):
        """Change authentication strategy"""
        self.strategy = strategy
```

### TypeScript Interface

```typescript
// TypeScript Authentication Interface
interface AuthenticationStrategy {
  applyAuth(headers: Record<string, string>): Record<string, string>;
  isExpired(): boolean;
  refresh(): Promise<boolean>;
}

class AuthenticationManager {
  private strategy: AuthenticationStrategy;
  
  constructor(strategy: AuthenticationStrategy) {
    this.strategy = strategy;
  }
  
  async getAuthHeaders(): Promise<Record<string, string>> {
    if (this.strategy.isExpired()) {
      await this.strategy.refresh();
    }
    return this.strategy.applyAuth({});
  }
  
  setStrategy(strategy: AuthenticationStrategy): void {
    this.strategy = strategy;
  }
}
```

## Authentication Strategies

### 1. Bearer Token Authentication

**Use Case**: JWT access tokens, OAuth2 access tokens, API access tokens

#### Implementation Pattern

```python
class BearerTokenAuth(AuthenticationStrategy):
    def __init__(self, token: str, expires_at: Optional[float] = None):
        """
        Initialize Bearer token authentication
        
        Args:
            token: Bearer access token
            expires_at: Unix timestamp when token expires (optional)
        """
        self.token = token
        self.expires_at = expires_at
    
    def apply_auth(self, request_headers: Dict[str, str]) -> Dict[str, str]:
        """Add Bearer token to Authorization header"""
        request_headers['Authorization'] = f'Bearer {self.token}'
        return request_headers
    
    def is_expired(self) -> bool:
        """Check if token is expired"""
        if self.expires_at is None:
            return False
        import time
        return time.time() >= self.expires_at
    
    def refresh(self) -> bool:
        """Bearer tokens typically don't auto-refresh"""
        return False
    
    def update_token(self, new_token: str, expires_at: Optional[float] = None):
        """Manually update token"""
        self.token = new_token
        self.expires_at = expires_at
```

#### Usage Example

```python
# Initialize with bearer token
auth = BearerTokenAuth(
    token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    expires_at=1735689600  # Unix timestamp
)

# Apply to request
headers = {}
headers = auth.apply_auth(headers)
# Result: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}
```

### 2. API Key Authentication

**Use Case**: Simple API authentication with static keys

#### Implementation Patterns

**Header-Based API Key**
```python
class ApiKeyAuth(AuthenticationStrategy):
    def __init__(self, api_key: str, header_name: str = 'X-API-Key'):
        """
        Initialize API Key authentication
        
        Args:
            api_key: API key value
            header_name: Header name for API key (default: X-API-Key)
        """
        self.api_key = api_key
        self.header_name = header_name
    
    def apply_auth(self, request_headers: Dict[str, str]) -> Dict[str, str]:
        """Add API key to custom header"""
        request_headers[self.header_name] = self.api_key
        return request_headers
    
    def is_expired(self) -> bool:
        """API keys typically don't expire"""
        return False
    
    def refresh(self) -> bool:
        """API keys don't auto-refresh"""
        return False
```

**Query Parameter API Key**
```python
class QueryParamApiKeyAuth(AuthenticationStrategy):
    def __init__(self, api_key: str, param_name: str = 'api_key'):
        """
        API Key passed as query parameter
        
        Args:
            api_key: API key value
            param_name: Query parameter name (default: api_key)
        """
        self.api_key = api_key
        self.param_name = param_name
    
    def apply_auth(self, request_headers: Dict[str, str]) -> Dict[str, str]:
        """API key added to query params (handled outside headers)"""
        return request_headers
    
    def get_query_params(self) -> Dict[str, str]:
        """Get query parameters for authentication"""
        return {self.param_name: self.api_key}
    
    def is_expired(self) -> bool:
        return False
    
    def refresh(self) -> bool:
        return False
```

#### Usage Examples

```python
# Header-based API key
header_auth = ApiKeyAuth(
    api_key="sk_live_1234567890abcdef",
    header_name="X-API-Key"
)

# Query parameter API key
query_auth = QueryParamApiKeyAuth(
    api_key="abc123xyz789",
    param_name="apikey"
)
```

### 3. OAuth2 Authentication

**Use Case**: Third-party API integrations (Google, Microsoft, GitHub, etc.)

#### Features
- Access token management
- Automatic token refresh using refresh token
- Token expiration tracking
- Authorization code flow
- Client credentials flow

#### Implementation Pattern

```python
import requests
import time
from typing import Optional, Dict

class OAuth2Auth(AuthenticationStrategy):
    def __init__(
        self,
        client_id: str,
        client_secret: str,
        token_url: str,
        access_token: Optional[str] = None,
        refresh_token: Optional[str] = None,
        expires_at: Optional[float] = None
    ):
        """
        Initialize OAuth2 authentication
        
        Args:
            client_id: OAuth2 client ID
            client_secret: OAuth2 client secret
            token_url: Token endpoint URL
            access_token: Initial access token (optional)
            refresh_token: Refresh token for renewing access
            expires_at: Unix timestamp when access token expires
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self.token_url = token_url
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.expires_at = expires_at
    
    def apply_auth(self, request_headers: Dict[str, str]) -> Dict[str, str]:
        """Add OAuth2 access token to Authorization header"""
        if not self.access_token:
            self._get_initial_token()
        
        request_headers['Authorization'] = f'Bearer {self.access_token}'
        return request_headers
    
    def is_expired(self) -> bool:
        """Check if access token is expired (with 60s buffer)"""
        if not self.expires_at:
            return False
        return time.time() >= (self.expires_at - 60)
    
    def refresh(self) -> bool:
        """Refresh access token using refresh token"""
        if not self.refresh_token:
            return False
        
        try:
            response = requests.post(
                self.token_url,
                data={
                    'grant_type': 'refresh_token',
                    'refresh_token': self.refresh_token,
                    'client_id': self.client_id,
                    'client_secret': self.client_secret
                },
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 200:
                token_data = response.json()
                self._update_tokens(token_data)
                return True
            
            return False
        except Exception as e:
            print(f"Token refresh failed: {str(e)}")
            return False
    
    def _get_initial_token(self):
        """Get initial access token using client credentials"""
        response = requests.post(
            self.token_url,
            data={
                'grant_type': 'client_credentials',
                'client_id': self.client_id,
                'client_secret': self.client_secret
            },
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        if response.status_code == 200:
            token_data = response.json()
            self._update_tokens(token_data)
    
    def _update_tokens(self, token_data: Dict):
        """Update tokens from response data"""
        self.access_token = token_data['access_token']
        self.refresh_token = token_data.get('refresh_token', self.refresh_token)
        
        if 'expires_in' in token_data:
            self.expires_at = time.time() + token_data['expires_in']
    
    def authorize_with_code(self, authorization_code: str, redirect_uri: str) -> bool:
        """Exchange authorization code for tokens (authorization code flow)"""
        try:
            response = requests.post(
                self.token_url,
                data={
                    'grant_type': 'authorization_code',
                    'code': authorization_code,
                    'redirect_uri': redirect_uri,
                    'client_id': self.client_id,
                    'client_secret': self.client_secret
                },
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 200:
                token_data = response.json()
                self._update_tokens(token_data)
                return True
            
            return False
        except Exception as e:
            print(f"Authorization code exchange failed: {str(e)}")
            return False
```

#### OAuth2 Flow Examples

**Client Credentials Flow** (Service-to-Service)
```python
oauth2_auth = OAuth2Auth(
    client_id="your_client_id",
    client_secret="your_client_secret",
    token_url="https://oauth.example.com/token"
)

# Token automatically obtained on first request
headers = oauth2_auth.apply_auth({})
```

**Authorization Code Flow** (User Authorization)
```python
oauth2_auth = OAuth2Auth(
    client_id="your_client_id",
    client_secret="your_client_secret",
    token_url="https://oauth.example.com/token"
)

# Step 1: User authorizes and you receive authorization code
authorization_code = "received_auth_code"
redirect_uri = "https://yourapp.com/callback"

# Step 2: Exchange code for tokens
if oauth2_auth.authorize_with_code(authorization_code, redirect_uri):
    print("Authorization successful")
    headers = oauth2_auth.apply_auth({})
```

**Automatic Token Refresh**
```python
# AuthenticationManager handles refresh automatically
auth_manager = AuthenticationManager(oauth2_auth)

# Tokens refreshed automatically when expired
headers = auth_manager.get_auth_headers()
```

### 4. JWT Authentication

**Use Case**: Stateless authentication with self-contained tokens

#### Implementation Pattern

```python
import jwt
import time
from typing import Dict, Optional

class JWTAuth(AuthenticationStrategy):
    def __init__(
        self,
        secret_key: str,
        algorithm: str = 'HS256',
        payload: Optional[Dict] = None,
        token: Optional[str] = None,
        token_lifetime: int = 3600
    ):
        """
        Initialize JWT authentication
        
        Args:
            secret_key: Secret key for signing JWT
            algorithm: JWT signing algorithm (HS256, RS256, etc.)
            payload: JWT payload data
            token: Pre-generated JWT token (optional)
            token_lifetime: Token lifetime in seconds (default: 3600)
        """
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.payload = payload or {}
        self.token = token
        self.token_lifetime = token_lifetime
        self.issued_at = None
    
    def apply_auth(self, request_headers: Dict[str, str]) -> Dict[str, str]:
        """Add JWT to Authorization header"""
        if not self.token or self.is_expired():
            self._generate_token()
        
        request_headers['Authorization'] = f'Bearer {self.token}'
        return request_headers
    
    def _generate_token(self):
        """Generate new JWT token"""
        self.issued_at = time.time()
        
        payload = {
            **self.payload,
            'iat': self.issued_at,
            'exp': self.issued_at + self.token_lifetime
        }
        
        self.token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def is_expired(self) -> bool:
        """Check if JWT is expired"""
        if not self.issued_at:
            return True
        return time.time() >= (self.issued_at + self.token_lifetime)
    
    def refresh(self) -> bool:
        """Generate new JWT token"""
        self._generate_token()
        return True
    
    def decode_token(self) -> Dict:
        """Decode and verify JWT token"""
        if not self.token:
            return {}
        
        try:
            return jwt.decode(
                self.token,
                self.secret_key,
                algorithms=[self.algorithm]
            )
        except jwt.ExpiredSignatureError:
            return {}
        except jwt.InvalidTokenError:
            return {}
```

#### Usage Example

```python
# Initialize JWT auth with payload
jwt_auth = JWTAuth(
    secret_key="your-256-bit-secret",
    algorithm="HS256",
    payload={
        "user_id": "12345",
        "role": "admin",
        "sub": "user@example.com"
    },
    token_lifetime=3600  # 1 hour
)

# Token generated automatically
headers = jwt_auth.apply_auth({})

# Decode token to verify
decoded = jwt_auth.decode_token()
print(decoded)  # {'user_id': '12345', 'role': 'admin', ...}
```

### 5. Basic Authentication

**Use Case**: Simple username/password authentication (HTTPS required)

#### Implementation Pattern

```python
import base64
from typing import Dict

class BasicAuth(AuthenticationStrategy):
    def __init__(self, username: str, password: str):
        """
        Initialize Basic authentication
        
        Args:
            username: Username for authentication
            password: Password for authentication
        """
        self.username = username
        self.password = password
        self._encoded_credentials = self._encode_credentials()
    
    def _encode_credentials(self) -> str:
        """Encode username:password in Base64"""
        credentials = f"{self.username}:{self.password}"
        encoded = base64.b64encode(credentials.encode()).decode()
        return encoded
    
    def apply_auth(self, request_headers: Dict[str, str]) -> Dict[str, str]:
        """Add Basic auth to Authorization header"""
        request_headers['Authorization'] = f'Basic {self._encoded_credentials}'
        return request_headers
    
    def is_expired(self) -> bool:
        """Basic auth credentials don't expire"""
        return False
    
    def refresh(self) -> bool:
        """Basic auth doesn't support refresh"""
        return False
    
    def update_credentials(self, username: str, password: str):
        """Update username and password"""
        self.username = username
        self.password = password
        self._encoded_credentials = self._encode_credentials()
```

#### Usage Example

```python
basic_auth = BasicAuth(
    username="api_user",
    password="secure_password_123"
)

headers = basic_auth.apply_auth({})
# Result: {'Authorization': 'Basic YXBpX3VzZXI6c2VjdXJlX3Bhc3N3b3JkXzEyMw=='}
```

### 6. Custom Authentication

**Use Case**: Non-standard authentication schemes (HMAC, AWS Signature, custom headers)

#### HMAC Signature Authentication

```python
import hmac
import hashlib
import time
from typing import Dict

class HMACAuth(AuthenticationStrategy):
    def __init__(self, api_key: str, secret_key: str):
        """
        Initialize HMAC signature authentication
        
        Args:
            api_key: Public API key identifier
            secret_key: Secret key for HMAC signature
        """
        self.api_key = api_key
        self.secret_key = secret_key
    
    def apply_auth(self, request_headers: Dict[str, str]) -> Dict[str, str]:
        """Add HMAC signature headers"""
        timestamp = str(int(time.time()))
        
        # Create signature: HMAC-SHA256(secret_key, api_key + timestamp)
        message = f"{self.api_key}{timestamp}"
        signature = hmac.new(
            self.secret_key.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        request_headers['X-API-Key'] = self.api_key
        request_headers['X-Timestamp'] = timestamp
        request_headers['X-Signature'] = signature
        
        return request_headers
    
    def is_expired(self) -> bool:
        """HMAC signatures are generated per-request"""
        return False
    
    def refresh(self) -> bool:
        """HMAC auth doesn't require refresh"""
        return False
```

#### Multi-Header Custom Authentication

```python
class CustomHeaderAuth(AuthenticationStrategy):
    def __init__(self, auth_headers: Dict[str, str]):
        """
        Custom authentication with multiple headers
        
        Args:
            auth_headers: Dictionary of authentication headers
        """
        self.auth_headers = auth_headers
    
    def apply_auth(self, request_headers: Dict[str, str]) -> Dict[str, str]:
        """Add custom authentication headers"""
        request_headers.update(self.auth_headers)
        return request_headers
    
    def is_expired(self) -> bool:
        return False
    
    def refresh(self) -> bool:
        return False
```

#### Usage Examples

```python
# HMAC authentication
hmac_auth = HMACAuth(
    api_key="public_key_12345",
    secret_key="secret_key_67890"
)

# Custom multi-header authentication
custom_auth = CustomHeaderAuth({
    'X-Client-ID': 'client_12345',
    'X-API-Version': 'v2',
    'X-Auth-Token': 'custom_token_abc'
})
```

## Authentication Configuration

### YAML Configuration Pattern

```yaml
# auth_config.yaml
authentication:
  type: "oauth2"  # bearer, apikey, oauth2, jwt, basic, custom
  
  # Bearer Token Config
  bearer:
    token: "${API_ACCESS_TOKEN}"
    expires_at: 1735689600
  
  # API Key Config
  apikey:
    key: "${API_KEY}"
    header_name: "X-API-Key"
    # OR query_param: "apikey"
  
  # OAuth2 Config
  oauth2:
    client_id: "${OAUTH_CLIENT_ID}"
    client_secret: "${OAUTH_CLIENT_SECRET}"
    token_url: "https://auth.example.com/oauth/token"
    scopes: ["read", "write"]
    grant_type: "client_credentials"  # or authorization_code
  
  # JWT Config
  jwt:
    secret_key: "${JWT_SECRET}"
    algorithm: "HS256"
    payload:
      user_id: "test_user"
      role: "admin"
    token_lifetime: 3600
  
  # Basic Auth Config
  basic:
    username: "${API_USERNAME}"
    password: "${API_PASSWORD}"
  
  # Custom Auth Config
  custom:
    headers:
      X-Client-ID: "${CLIENT_ID}"
      X-API-Version: "v2"
      X-Auth-Token: "${CUSTOM_TOKEN}"
```

### Configuration Loader

```python
import yaml
import os
from typing import Dict, Any

class AuthConfigLoader:
    @staticmethod
    def load(config_path: str) -> AuthenticationStrategy:
        """Load authentication configuration from YAML"""
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        
        auth_config = config.get('authentication', {})
        auth_type = auth_config.get('type', 'bearer')
        
        # Resolve environment variables
        auth_config = AuthConfigLoader._resolve_env_vars(auth_config)
        
        # Create appropriate auth strategy
        if auth_type == 'bearer':
            return BearerTokenAuth(
                token=auth_config['bearer']['token'],
                expires_at=auth_config['bearer'].get('expires_at')
            )
        elif auth_type == 'apikey':
            apikey_config = auth_config['apikey']
            if 'header_name' in apikey_config:
                return ApiKeyAuth(
                    api_key=apikey_config['key'],
                    header_name=apikey_config['header_name']
                )
            else:
                return QueryParamApiKeyAuth(
                    api_key=apikey_config['key'],
                    param_name=apikey_config.get('query_param', 'api_key')
                )
        elif auth_type == 'oauth2':
            oauth_config = auth_config['oauth2']
            return OAuth2Auth(
                client_id=oauth_config['client_id'],
                client_secret=oauth_config['client_secret'],
                token_url=oauth_config['token_url']
            )
        elif auth_type == 'jwt':
            jwt_config = auth_config['jwt']
            return JWTAuth(
                secret_key=jwt_config['secret_key'],
                algorithm=jwt_config.get('algorithm', 'HS256'),
                payload=jwt_config.get('payload', {}),
                token_lifetime=jwt_config.get('token_lifetime', 3600)
            )
        elif auth_type == 'basic':
            basic_config = auth_config['basic']
            return BasicAuth(
                username=basic_config['username'],
                password=basic_config['password']
            )
        elif auth_type == 'custom':
            return CustomHeaderAuth(
                auth_headers=auth_config['custom']['headers']
            )
        else:
            raise ValueError(f"Unsupported auth type: {auth_type}")
    
    @staticmethod
    def _resolve_env_vars(config: Dict) -> Dict:
        """Resolve ${ENV_VAR} references"""
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
```

## Integration with HTTP Client

### Complete Integration Example

```python
# Create authentication strategy
auth_strategy = OAuth2Auth(
    client_id="your_client_id",
    client_secret="your_client_secret",
    token_url="https://oauth.example.com/token"
)

# Create authentication manager
auth_manager = AuthenticationManager(auth_strategy)

# Create HTTP client with authentication
class AuthenticatedHttpClient(BaseHttpClient):
    def __init__(self, base_url: str, auth_manager: AuthenticationManager):
        super().__init__(base_url)
        self.auth_manager = auth_manager
    
    def request(self, method: str, endpoint: str, **kwargs):
        # Get authenticated headers
        auth_headers = self.auth_manager.get_auth_headers()
        
        # Merge with request headers
        headers = kwargs.get('headers', {})
        headers.update(auth_headers)
        kwargs['headers'] = headers
        
        # Execute request
        return super().request(method, endpoint, **kwargs)

# Usage
client = AuthenticatedHttpClient(
    base_url="https://api.example.com",
    auth_manager=auth_manager
)

response = client.get("/api/users")  # Automatically authenticated
```

## Best Practices

### DO
✅ Use environment variables for credentials (never hardcode)
✅ Implement token expiration checks with 60-second buffer
✅ Support automatic token refresh for OAuth2/JWT
✅ Mask sensitive data in logs (tokens, secrets, passwords)
✅ Use HTTPS for Basic Authentication
✅ Implement retry logic for token refresh failures
✅ Support multiple authentication strategies via configuration
✅ Cache tokens to avoid unnecessary refresh calls
✅ Validate tokens before making requests

### DON'T
❌ Log authentication tokens or credentials in plain text
❌ Store credentials in code or version control
❌ Use Basic Auth over unencrypted HTTP
❌ Ignore token expiration (leads to 401 errors)
❌ Hardcode authentication type (use config)
❌ Re-authenticate for every request (use caching)
❌ Mix authentication logic with business logic
❌ Skip error handling for token refresh failures

## Summary

HTTP Authentication Patterns provide:
- **6 Authentication Strategies**: Bearer, API Key, OAuth2, JWT, Basic, Custom
- **Automatic Token Management**: Expiration tracking and automatic refresh
- **Configuration-Driven**: YAML-based authentication configuration
- **Strategy Pattern**: Easy to switch between authentication methods
- **Security Best Practices**: Environment variables, sensitive data masking, HTTPS enforcement
- **Multi-Language Support**: Patterns applicable to Python, TypeScript, Java, C#
