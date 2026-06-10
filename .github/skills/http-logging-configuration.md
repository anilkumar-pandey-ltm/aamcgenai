---
name: http-logging-configuration
description: Comprehensive logging patterns and configuration management for HTTP API clients with sensitive data masking, structured logging formats, and multi-environment configuration support.
---

# HTTP Logging and Configuration Patterns

## Overview
This skill file defines comprehensive logging patterns and configuration management for HTTP API clients. These patterns ensure proper request/response logging with sensitive data masking, structured logging formats, and flexible configuration management across environments.

## HTTP Logger Architecture

### Core Interface

```python
# Python HTTP Logger
import logging
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
import hashlib

class HttpLogger:
    """HTTP request/response logger with sensitive data masking"""
    
    def __init__(
        self,
        logger_name: str = "http_client",
        log_level: str = "INFO",
        mask_sensitive: bool = True,
        sensitive_keys: Optional[List[str]] = None
    ):
        """
        Initialize HTTP logger
        
        Args:
            logger_name: Logger name
            log_level: Logging level (DEBUG, INFO, WARNING, ERROR)
            mask_sensitive: Enable sensitive data masking
            sensitive_keys: List of keys to mask
        """
        self.logger = logging.getLogger(logger_name)
        self.logger.setLevel(getattr(logging, log_level.upper()))
        self.mask_sensitive = mask_sensitive
        self.sensitive_keys = sensitive_keys or [
            'password', 'token', 'api_key', 'secret', 'authorization',
            'api-key', 'apikey', 'access_token', 'refresh_token',
            'client_secret', 'private_key', 'credential', 'auth'
        ]
        
        # Configure handler if not already configured
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
    
    def log_request(
        self,
        method: str,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        body: Optional[Any] = None,
        query_params: Optional[Dict[str, Any]] = None
    ):
        """Log HTTP request details"""
        request_data = {
            'timestamp': datetime.now().isoformat(),
            'type': 'REQUEST',
            'method': method.upper(),
            'url': url,
            'headers': self._mask_data(headers or {}),
            'query_params': self._mask_data(query_params or {}),
            'body': self._mask_data(self._serialize_body(body)) if body else None
        }
        
        # Generate request ID
        request_id = self._generate_request_id(method, url)
        request_data['request_id'] = request_id
        
        log_message = self._format_request_log(request_data)
        self.logger.info(log_message)
        
        return request_id
    
    def log_response(
        self,
        request_id: str,
        status_code: int,
        headers: Optional[Dict[str, str]] = None,
        body: Optional[Any] = None,
        elapsed_time: Optional[float] = None
    ):
        """Log HTTP response details"""
        response_data = {
            'timestamp': datetime.now().isoformat(),
            'type': 'RESPONSE',
            'request_id': request_id,
            'status_code': status_code,
            'headers': self._mask_data(headers or {}),
            'body': self._mask_data(self._serialize_body(body)) if body else None,
            'elapsed_time_ms': int(elapsed_time * 1000) if elapsed_time else None
        }
        
        log_message = self._format_response_log(response_data)
        
        # Log level based on status code
        if 200 <= status_code < 300:
            self.logger.info(log_message)
        elif 400 <= status_code < 500:
            self.logger.warning(log_message)
        else:
            self.logger.error(log_message)
    
    def log_error(
        self,
        request_id: str,
        error: Exception,
        context: Optional[Dict[str, Any]] = None
    ):
        """Log HTTP error"""
        error_data = {
            'timestamp': datetime.now().isoformat(),
            'type': 'ERROR',
            'request_id': request_id,
            'error_type': type(error).__name__,
            'error_message': str(error),
            'context': self._mask_data(context or {})
        }
        
        log_message = self._format_error_log(error_data)
        self.logger.error(log_message, exc_info=True)
    
    def _mask_data(self, data: Any) -> Any:
        """Recursively mask sensitive data"""
        if not self.mask_sensitive:
            return data
        
        if isinstance(data, dict):
            masked = {}
            for key, value in data.items():
                if self._is_sensitive_key(key):
                    masked[key] = self._mask_value(value)
                else:
                    masked[key] = self._mask_data(value)
            return masked
        
        elif isinstance(data, list):
            return [self._mask_data(item) for item in data]
        
        else:
            return data
    
    def _is_sensitive_key(self, key: str) -> bool:
        """Check if key contains sensitive data"""
        key_lower = key.lower()
        return any(
            sensitive_key in key_lower
            for sensitive_key in self.sensitive_keys
        )
    
    def _mask_value(self, value: Any) -> str:
        """Mask sensitive value"""
        if value is None:
            return None
        
        value_str = str(value)
        if len(value_str) <= 8:
            return "***MASKED***"
        
        # Show first 4 and last 4 characters
        return f"{value_str[:4]}...{value_str[-4:]}"
    
    def _serialize_body(self, body: Any) -> Any:
        """Serialize body for logging"""
        if isinstance(body, (str, int, float, bool)):
            return body
        elif isinstance(body, dict):
            return body
        elif isinstance(body, (list, tuple)):
            return list(body)
        else:
            return str(body)
    
    def _generate_request_id(self, method: str, url: str) -> str:
        """Generate unique request ID"""
        timestamp = datetime.now().isoformat()
        data = f"{method}{url}{timestamp}"
        return hashlib.md5(data.encode()).hexdigest()[:16]
    
    def _format_request_log(self, data: Dict[str, Any]) -> str:
        """Format request log message"""
        return f"""
=== HTTP REQUEST [{data['request_id']}] ===
Timestamp: {data['timestamp']}
Method: {data['method']}
URL: {data['url']}
Headers: {json.dumps(data['headers'], indent=2)}
Query Params: {json.dumps(data['query_params'], indent=2)}
Body: {json.dumps(data['body'], indent=2) if data['body'] else 'None'}
"""
    
    def _format_response_log(self, data: Dict[str, Any]) -> str:
        """Format response log message"""
        return f"""
=== HTTP RESPONSE [{data['request_id']}] ===
Timestamp: {data['timestamp']}
Status Code: {data['status_code']}
Elapsed Time: {data['elapsed_time_ms']}ms
Headers: {json.dumps(data['headers'], indent=2)}
Body: {json.dumps(data['body'], indent=2) if data['body'] else 'None'}
"""
    
    def _format_error_log(self, data: Dict[str, Any]) -> str:
        """Format error log message"""
        return f"""
=== HTTP ERROR [{data['request_id']}] ===
Timestamp: {data['timestamp']}
Error Type: {data['error_type']}
Error Message: {data['error_message']}
Context: {json.dumps(data['context'], indent=2)}
"""
    
    def set_log_level(self, level: str):
        """Change logging level"""
        self.logger.setLevel(getattr(logging, level.upper()))
    
    def enable_sensitive_masking(self, enabled: bool = True):
        """Enable or disable sensitive data masking"""
        self.mask_sensitive = enabled
    
    def add_sensitive_keys(self, keys: List[str]):
        """Add keys to sensitive data list"""
        self.sensitive_keys.extend(keys)
```

### TypeScript Logger Implementation

```typescript
// TypeScript HTTP Logger
enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

interface LoggerConfig {
  loggerName: string;
  logLevel: LogLevel;
  maskSensitive: boolean;
  sensitiveKeys: string[];
}

class HttpLogger {
  private config: LoggerConfig;
  
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      loggerName: 'http_client',
      logLevel: LogLevel.INFO,
      maskSensitive: true,
      sensitiveKeys: [
        'password', 'token', 'api_key', 'secret', 'authorization',
        'apikey', 'access_token', 'refresh_token', 'client_secret'
      ],
      ...config
    };
  }
  
  logRequest(
    method: string,
    url: string,
    headers?: Record<string, string>,
    body?: any,
    queryParams?: Record<string, any>
  ): string {
    const requestId = this.generateRequestId(method, url);
    
    const requestData = {
      timestamp: new Date().toISOString(),
      type: 'REQUEST',
      requestId,
      method: method.toUpperCase(),
      url,
      headers: this.maskData(headers || {}),
      queryParams: this.maskData(queryParams || {}),
      body: body ? this.maskData(this.serializeBody(body)) : null
    };
    
    console.log(this.formatRequestLog(requestData));
    
    return requestId;
  }
  
  logResponse(
    requestId: string,
    statusCode: number,
    headers?: Record<string, string>,
    body?: any,
    elapsedTime?: number
  ): void {
    const responseData = {
      timestamp: new Date().toISOString(),
      type: 'RESPONSE',
      requestId,
      statusCode,
      headers: this.maskData(headers || {}),
      body: body ? this.maskData(this.serializeBody(body)) : null,
      elapsedTimeMs: elapsedTime ? Math.round(elapsedTime) : null
    };
    
    const logMessage = this.formatResponseLog(responseData);
    
    if (statusCode >= 200 && statusCode < 300) {
      console.log(logMessage);
    } else if (statusCode >= 400 && statusCode < 500) {
      console.warn(logMessage);
    } else {
      console.error(logMessage);
    }
  }
  
  logError(requestId: string, error: Error, context?: Record<string, any>): void {
    const errorData = {
      timestamp: new Date().toISOString(),
      type: 'ERROR',
      requestId,
      errorType: error.name,
      errorMessage: error.message,
      stack: error.stack,
      context: this.maskData(context || {})
    };
    
    console.error(this.formatErrorLog(errorData));
  }
  
  private maskData(data: any): any {
    if (!this.config.maskSensitive) {
      return data;
    }
    
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const masked: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        if (this.isSensitiveKey(key)) {
          masked[key] = this.maskValue(value);
        } else {
          masked[key] = this.maskData(value);
        }
      }
      return masked;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.maskData(item));
    }
    
    return data;
  }
  
  private isSensitiveKey(key: string): boolean {
    const keyLower = key.toLowerCase();
    return this.config.sensitiveKeys.some(sensitiveKey =>
      keyLower.includes(sensitiveKey)
    );
  }
  
  private maskValue(value: any): string {
    if (value === null || value === undefined) {
      return '***MASKED***';
    }
    
    const valueStr = String(value);
    if (valueStr.length <= 8) {
      return '***MASKED***';
    }
    
    return `${valueStr.slice(0, 4)}...${valueStr.slice(-4)}`;
  }
  
  private serializeBody(body: any): any {
    if (typeof body === 'string' || typeof body === 'number' || typeof body === 'boolean') {
      return body;
    }
    return body;
  }
  
  private generateRequestId(method: string, url: string): string {
    const timestamp = Date.now();
    const data = `${method}${url}${timestamp}`;
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 16);
  }
  
  private formatRequestLog(data: any): string {
    return `
=== HTTP REQUEST [${data.requestId}] ===
Timestamp: ${data.timestamp}
Method: ${data.method}
URL: ${data.url}
Headers: ${JSON.stringify(data.headers, null, 2)}
Query Params: ${JSON.stringify(data.queryParams, null, 2)}
Body: ${data.body ? JSON.stringify(data.body, null, 2) : 'None'}
`;
  }
  
  private formatResponseLog(data: any): string {
    return `
=== HTTP RESPONSE [${data.requestId}] ===
Timestamp: ${data.timestamp}
Status Code: ${data.statusCode}
Elapsed Time: ${data.elapsedTimeMs}ms
Headers: ${JSON.stringify(data.headers, null, 2)}
Body: ${data.body ? JSON.stringify(data.body, null, 2) : 'None'}
`;
  }
  
  private formatErrorLog(data: any): string {
    return `
=== HTTP ERROR [${data.requestId}] ===
Timestamp: ${data.timestamp}
Error Type: ${data.errorType}
Error Message: ${data.errorMessage}
Context: ${JSON.stringify(data.context, null, 2)}
Stack: ${data.stack}
`;
  }
}
```

## Structured Logging Format

### JSON Structure for Analytics

```python
import json
from typing import Dict, Any
from datetime import datetime

class StructuredHttpLogger(HttpLogger):
    """HTTP logger with structured JSON output for analytics"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Use JSON formatter
        for handler in self.logger.handlers:
            handler.setFormatter(logging.Formatter('%(message)s'))
    
    def log_request(self, method: str, url: str, **kwargs) -> str:
        """Log request as structured JSON"""
        request_id = self._generate_request_id(method, url)
        
        log_entry = {
            '@timestamp': datetime.now().isoformat(),
            'event.type': 'http_request',
            'event.action': 'request',
            'http.request.id': request_id,
            'http.request.method': method.upper(),
            'url.full': url,
            'http.request.headers': self._mask_data(kwargs.get('headers', {})),
            'url.query': self._mask_data(kwargs.get('query_params', {})),
            'http.request.body.content': self._mask_data(
                self._serialize_body(kwargs.get('body'))
            ) if kwargs.get('body') else None
        }
        
        self.logger.info(json.dumps(log_entry))
        return request_id
    
    def log_response(self, request_id: str, status_code: int, **kwargs):
        """Log response as structured JSON"""
        log_entry = {
            '@timestamp': datetime.now().isoformat(),
            'event.type': 'http_response',
            'event.action': 'response',
            'http.request.id': request_id,
            'http.response.status_code': status_code,
            'http.response.headers': self._mask_data(kwargs.get('headers', {})),
            'http.response.body.content': self._mask_data(
                self._serialize_body(kwargs.get('body'))
            ) if kwargs.get('body') else None,
            'event.duration': kwargs.get('elapsed_time', 0) * 1000000,  # nanoseconds
            'event.outcome': 'success' if 200 <= status_code < 300 else 'failure'
        }
        
        if 200 <= status_code < 300:
            self.logger.info(json.dumps(log_entry))
        elif 400 <= status_code < 500:
            self.logger.warning(json.dumps(log_entry))
        else:
            self.logger.error(json.dumps(log_entry))
```

### Example JSON Output

```json
{
  "@timestamp": "2024-01-15T10:30:45.123Z",
  "event.type": "http_request",
  "event.action": "request",
  "http.request.id": "a1b2c3d4e5f6g7h8",
  "http.request.method": "POST",
  "url.full": "https://api.example.com/v1/users",
  "http.request.headers": {
    "Content-Type": "application/json",
    "Authorization": "Bea...56ef",
    "User-Agent": "API-Test-Framework/1.0"
  },
  "url.query": {},
  "http.request.body.content": {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "***MASKED***"
  }
}
```

## Configuration Management

### Configuration File Structure

#### Complete Configuration Example

```yaml
# api_client_config.yaml

# Base Configuration
base:
  base_url: "https://api.example.com"
  api_version: "v1"
  timeout: 30
  verify_ssl: true
  
# Authentication Configuration
authentication:
  type: "oauth2"  # bearer, apikey, oauth2, jwt, basic
  oauth2:
    client_id: "${OAUTH_CLIENT_ID}"
    client_secret: "${OAUTH_CLIENT_SECRET}"
    token_url: "https://auth.example.com/oauth/token"
    scopes: ["read", "write", "admin"]

# Default Headers
headers:
  Content-Type: "application/json"
  Accept: "application/json"
  User-Agent: "API-Test-Framework/1.0"
  X-Client-Version: "1.0.0"
  X-Request-Source: "automation"

# Retry Configuration
retry:
  enabled: true
  max_attempts: 3
  backoff_strategy: "exponential"
  backoff_factor: 2.0
  initial_delay: 1.0
  max_delay: 60.0
  retry_on_status: [408, 429, 500, 502, 503, 504]
  jitter: true

# Circuit Breaker Configuration
circuit_breaker:
  enabled: true
  failure_threshold: 5
  success_threshold: 2
  timeout: 60.0

# Rate Limiter Configuration
rate_limiter:
  enabled: true
  max_requests: 100
  per_seconds: 60
  strategy: "sliding_window"

# Logging Configuration
logging:
  enabled: true
  level: "INFO"
  format: "json"  # text or json
  mask_sensitive: true
  sensitive_keys:
    - "password"
    - "token"
    - "api_key"
    - "secret"
    - "authorization"
  output:
    console: true
    file: true
    file_path: "logs/http_client.log"
    max_file_size: "10MB"
    backup_count: 5

# Environment-Specific Overrides
environments:
  development:
    base_url: "https://dev-api.example.com"
    verify_ssl: false
    logging:
      level: "DEBUG"
    
  staging:
    base_url: "https://staging-api.example.com"
    verify_ssl: true
    logging:
      level: "INFO"
    
  production:
    base_url: "https://api.example.com"
    verify_ssl: true
    logging:
      level: "WARNING"
      mask_sensitive: true
    rate_limiter:
      max_requests: 1000
      per_seconds: 60
```

### Configuration Loader with Environment Support

```python
import yaml
import os
from pathlib import Path
from typing import Dict, Any, Optional

class ConfigurationManager:
    """Comprehensive configuration management"""
    
    def __init__(
        self,
        config_path: str,
        environment: Optional[str] = None
    ):
        """
        Initialize configuration manager
        
        Args:
            config_path: Path to configuration file
            environment: Environment name (dev, staging, prod)
        """
        self.config_path = Path(config_path)
        self.environment = environment or os.getenv('ENVIRONMENT', 'development')
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load and merge configuration"""
        with open(self.config_path, 'r') as f:
            config = yaml.safe_load(f)
        
        # Resolve environment variables
        config = self._resolve_env_vars(config)
        
        # Merge environment-specific config
        if 'environments' in config and self.environment in config['environments']:
            env_config = config['environments'][self.environment]
            config = self._deep_merge(config, env_config)
        
        return config
    
    def _resolve_env_vars(self, config: Any) -> Any:
        """Recursively resolve ${ENV_VAR} references"""
        if isinstance(config, str):
            if config.startswith('${') and config.endswith('}'):
                env_var = config[2:-1]
                return os.getenv(env_var, config)
            return config
        
        elif isinstance(config, dict):
            return {k: self._resolve_env_vars(v) for k, v in config.items()}
        
        elif isinstance(config, list):
            return [self._resolve_env_vars(item) for item in config]
        
        return config
    
    def _deep_merge(self, base: Dict, override: Dict) -> Dict:
        """Deep merge override config into base config"""
        result = base.copy()
        
        for key, value in override.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = self._deep_merge(result[key], value)
            else:
                result[key] = value
        
        return result
    
    def get(self, key_path: str, default: Any = None) -> Any:
        """
        Get configuration value by dot-notation path
        
        Example: config.get('retry.max_attempts')
        """
        keys = key_path.split('.')
        value = self.config
        
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        
        return value
    
    def get_base_url(self) -> str:
        """Get base URL for current environment"""
        return self.get('base.base_url')
    
    def get_retry_config(self) -> Dict[str, Any]:
        """Get retry configuration"""
        return self.get('retry', {})
    
    def get_auth_config(self) -> Dict[str, Any]:
        """Get authentication configuration"""
        return self.get('authentication', {})
    
    def get_logging_config(self) -> Dict[str, Any]:
        """Get logging configuration"""
        return self.get('logging', {})
    
    def is_retry_enabled(self) -> bool:
        """Check if retry is enabled"""
        return self.get('retry.enabled', False)
    
    def is_circuit_breaker_enabled(self) -> bool:
        """Check if circuit breaker is enabled"""
        return self.get('circuit_breaker.enabled', False)
    
    def is_rate_limiter_enabled(self) -> bool:
        """Check if rate limiter is enabled"""
        return self.get('rate_limiter.enabled', False)
```

### Usage Example

```python
# Load configuration
config_manager = ConfigurationManager(
    config_path='config/api_client_config.yaml',
    environment='production'
)

# Access configuration
base_url = config_manager.get_base_url()
retry_config = config_manager.get_retry_config()
auth_config = config_manager.get_auth_config()

# Check feature flags
if config_manager.is_retry_enabled():
    print("Retry is enabled")

# Get specific values with defaults
timeout = config_manager.get('base.timeout', 30)
max_attempts = config_manager.get('retry.max_attempts', 3)
```

## Environment Variable Management

### .env File Pattern

```bash
# .env file
ENVIRONMENT=production

# API Configuration
API_BASE_URL=https://api.example.com
API_VERSION=v1
API_TIMEOUT=30

# Authentication
OAUTH_CLIENT_ID=your_client_id_here
OAUTH_CLIENT_SECRET=your_client_secret_here
OAUTH_TOKEN_URL=https://auth.example.com/oauth/token
API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here

# Feature Flags
ENABLE_RETRY=true
ENABLE_CIRCUIT_BREAKER=true
ENABLE_RATE_LIMITER=false

# Logging
LOG_LEVEL=INFO
MASK_SENSITIVE_DATA=true
LOG_TO_FILE=true
LOG_FILE_PATH=logs/http_client.log
```

### Loading .env File

```python
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# Access environment variables
api_key = os.getenv('API_KEY')
environment = os.getenv('ENVIRONMENT', 'development')
log_level = os.getenv('LOG_LEVEL', 'INFO')
```

## Best Practices

### Logging Best Practices

#### DO
✅ Log all HTTP requests and responses
✅ Mask sensitive data (tokens, passwords, API keys)
✅ Include request IDs for correlation
✅ Log response times for performance monitoring
✅ Use structured logging (JSON) for analytics
✅ Set appropriate log levels (DEBUG, INFO, WARNING, ERROR)
✅ Log errors with full stack traces
✅ Include context information in logs
✅ Rotate log files to prevent disk space issues
✅ Log to both console and file in test environments

#### DON'T
❌ Log sensitive data in plain text
❌ Log full request/response bodies in production (unless masked)
❌ Use print() statements instead of proper logging
❌ Log at DEBUG level in production
❌ Ignore log file rotation
❌ Log without timestamps
❌ Log without request correlation IDs
❌ Log binary data without encoding

### Configuration Best Practices

#### DO
✅ Use environment variables for secrets
✅ Support multiple environments (dev, staging, prod)
✅ Validate configuration on startup
✅ Provide sensible defaults
✅ Use YAML or JSON for configuration files
✅ Document all configuration options
✅ Separate config by concern (auth, retry, logging)
✅ Use dot-notation for nested config access
✅ Version control config files (without secrets)
✅ Load .env files for local development

#### DON'T
❌ Hardcode credentials in configuration files
❌ Commit .env files to version control
❌ Use production credentials in test environments
❌ Mix configuration with code
❌ Ignore missing required configuration
❌ Use different config formats across projects
❌ Store binary data in config files
❌ Skip config validation

## Integration Example

### Complete HTTP Client with Logging and Configuration

```python
class ConfiguredHttpClient:
    """HTTP client with full logging and configuration support"""
    
    def __init__(self, config_path: str, environment: str = None):
        # Load configuration
        self.config_manager = ConfigurationManager(config_path, environment)
        
        # Initialize logger
        logging_config = self.config_manager.get_logging_config()
        self.logger = HttpLogger(
            log_level=logging_config.get('level', 'INFO'),
            mask_sensitive=logging_config.get('mask_sensitive', True),
            sensitive_keys=logging_config.get('sensitive_keys', [])
        )
        
        # Initialize HTTP session
        self.base_url = self.config_manager.get_base_url()
        self.session = requests.Session()
        self.session.headers.update(
            self.config_manager.get('headers', {})
        )
    
    def get(self, endpoint: str, **kwargs):
        """GET request with logging"""
        return self._request('GET', endpoint, **kwargs)
    
    def post(self, endpoint: str, **kwargs):
        """POST request with logging"""
        return self._request('POST', endpoint, **kwargs)
    
    def _request(self, method: str, endpoint: str, **kwargs):
        """Execute request with full logging"""
        url = f"{self.base_url}{endpoint}"
        
        # Log request
        request_id = self.logger.log_request(
            method=method,
            url=url,
            headers=kwargs.get('headers'),
            body=kwargs.get('json') or kwargs.get('data'),
            query_params=kwargs.get('params')
        )
        
        try:
            # Execute request
            start_time = time.time()
            response = self.session.request(method, url, **kwargs)
            elapsed_time = time.time() - start_time
            
            # Log response
            self.logger.log_response(
                request_id=request_id,
                status_code=response.status_code,
                headers=dict(response.headers),
                body=response.json() if response.content else None,
                elapsed_time=elapsed_time
            )
            
            return response
            
        except Exception as e:
            # Log error
            self.logger.log_error(
                request_id=request_id,
                error=e,
                context={'method': method, 'url': url}
            )
            raise
```

## Summary

HTTP Logging and Configuration Patterns provide:
- **Comprehensive Logging**: Request/response logging with sensitive data masking
- **Structured Logging**: JSON format for analytics and monitoring
- **Configuration Management**: YAML-based config with environment support
- **Environment Variables**: Secure credential management
- **Request Correlation**: Request IDs for tracing
- **Performance Monitoring**: Response time tracking
- **Security**: Automatic sensitive data masking
- **Multi-Environment Support**: Dev, staging, production configurations
