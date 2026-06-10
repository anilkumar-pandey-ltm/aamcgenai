---
name: http-retry-resilience
description: Retry logic, exponential backoff, circuit breaker patterns, and resilience strategies for reliable HTTP API communication handling transient failures, network issues, and service unavailability.
---

# HTTP Retry and Resilience Patterns

## Overview
This skill file defines retry logic, exponential backoff, circuit breaker patterns, and resilience strategies for HTTP API clients. These patterns ensure reliable API communication in the face of transient failures, network issues, and service unavailability.

## Retry Manager Architecture

### Core Interface

```python
# Python Retry Manager Interface
from typing import Callable, List, Optional, Dict, Any
import time
import random
from enum import Enum

class RetryStrategy(Enum):
    """Retry strategy types"""
    FIXED = "fixed"
    EXPONENTIAL = "exponential"
    LINEAR = "linear"
    CUSTOM = "custom"

class RetryConfig:
    """Retry configuration"""
    def __init__(
        self,
        max_attempts: int = 3,
        backoff_strategy: RetryStrategy = RetryStrategy.EXPONENTIAL,
        backoff_factor: float = 2.0,
        initial_delay: float = 1.0,
        max_delay: float = 60.0,
        retry_on_status: Optional[List[int]] = None,
        retry_on_exception: Optional[List[type]] = None,
        jitter: bool = True
    ):
        self.max_attempts = max_attempts
        self.backoff_strategy = backoff_strategy
        self.backoff_factor = backoff_factor
        self.initial_delay = initial_delay
        self.max_delay = max_delay
        self.retry_on_status = retry_on_status or [408, 429, 500, 502, 503, 504]
        self.retry_on_exception = retry_on_exception or [
            ConnectionError,
            TimeoutError,
            RequestException
        ]
        self.jitter = jitter

class RetryManager:
    """HTTP request retry manager with multiple strategies"""
    
    def __init__(self, config: RetryConfig):
        self.config = config
        self.attempt_count = 0
    
    def execute_with_retry(
        self,
        request_func: Callable,
        *args,
        **kwargs
    ) -> Any:
        """Execute request with retry logic"""
        last_exception = None
        
        for attempt in range(1, self.config.max_attempts + 1):
            self.attempt_count = attempt
            
            try:
                response = request_func(*args, **kwargs)
                
                # Check if response status requires retry
                if self._should_retry_status(response.status_code):
                    if attempt < self.config.max_attempts:
                        delay = self._calculate_delay(attempt)
                        time.sleep(delay)
                        continue
                
                # Success or non-retryable status
                return response
                
            except Exception as e:
                last_exception = e
                
                # Check if exception type is retryable
                if self._should_retry_exception(e):
                    if attempt < self.config.max_attempts:
                        delay = self._calculate_delay(attempt)
                        time.sleep(delay)
                        continue
                
                # Non-retryable exception
                raise
        
        # All attempts exhausted
        if last_exception:
            raise MaxRetriesExceeded(
                f"Failed after {self.config.max_attempts} attempts"
            ) from last_exception
        
        return response
    
    def _should_retry_status(self, status_code: int) -> bool:
        """Check if status code should trigger retry"""
        return status_code in self.config.retry_on_status
    
    def _should_retry_exception(self, exception: Exception) -> bool:
        """Check if exception type should trigger retry"""
        return any(
            isinstance(exception, exc_type)
            for exc_type in self.config.retry_on_exception
        )
    
    def _calculate_delay(self, attempt: int) -> float:
        """Calculate delay based on retry strategy"""
        if self.config.backoff_strategy == RetryStrategy.FIXED:
            delay = self.config.initial_delay
        
        elif self.config.backoff_strategy == RetryStrategy.EXPONENTIAL:
            delay = self.config.initial_delay * (self.config.backoff_factor ** (attempt - 1))
        
        elif self.config.backoff_strategy == RetryStrategy.LINEAR:
            delay = self.config.initial_delay * attempt
        
        else:  # CUSTOM
            delay = self.config.initial_delay
        
        # Apply max delay cap
        delay = min(delay, self.config.max_delay)
        
        # Add jitter to avoid thundering herd
        if self.config.jitter:
            delay = delay * (0.5 + random.random())
        
        return delay
```

### TypeScript Implementation

```typescript
// TypeScript Retry Manager
enum RetryStrategy {
  FIXED = 'fixed',
  EXPONENTIAL = 'exponential',
  LINEAR = 'linear',
  CUSTOM = 'custom'
}

interface RetryConfig {
  maxAttempts: number;
  backoffStrategy: RetryStrategy;
  backoffFactor: number;
  initialDelay: number;
  maxDelay: number;
  retryOnStatus: number[];
  retryOnException: string[];
  jitter: boolean;
}

class RetryManager {
  private config: RetryConfig;
  private attemptCount: number = 0;
  
  constructor(config: RetryConfig) {
    this.config = {
      maxAttempts: 3,
      backoffStrategy: RetryStrategy.EXPONENTIAL,
      backoffFactor: 2.0,
      initialDelay: 1000,
      maxDelay: 60000,
      retryOnStatus: [408, 429, 500, 502, 503, 504],
      retryOnException: ['NetworkError', 'TimeoutError', 'ECONNREFUSED'],
      jitter: true,
      ...config
    };
  }
  
  async executeWithRetry<T>(
    requestFunc: () => Promise<T>,
    shouldRetryFunc?: (error: any) => boolean
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      this.attemptCount = attempt;
      
      try {
        const response = await requestFunc();
        
        // Check if response requires retry
        if (this.shouldRetryResponse(response)) {
          if (attempt < this.config.maxAttempts) {
            const delay = this.calculateDelay(attempt);
            await this.sleep(delay);
            continue;
          }
        }
        
        return response;
        
      } catch (error) {
        lastError = error;
        
        // Check if exception is retryable
        if (this.shouldRetryException(error) || shouldRetryFunc?.(error)) {
          if (attempt < this.config.maxAttempts) {
            const delay = this.calculateDelay(attempt);
            await this.sleep(delay);
            continue;
          }
        }
        
        throw error;
      }
    }
    
    throw new Error(`Failed after ${this.config.maxAttempts} attempts: ${lastError}`);
  }
  
  private shouldRetryResponse(response: any): boolean {
    return this.config.retryOnStatus.includes(response.status);
  }
  
  private shouldRetryException(error: any): boolean {
    const errorName = error.name || error.code || '';
    return this.config.retryOnException.some(exc => errorName.includes(exc));
  }
  
  private calculateDelay(attempt: number): number {
    let delay: number;
    
    switch (this.config.backoffStrategy) {
      case RetryStrategy.FIXED:
        delay = this.config.initialDelay;
        break;
      
      case RetryStrategy.EXPONENTIAL:
        delay = this.config.initialDelay * Math.pow(this.config.backoffFactor, attempt - 1);
        break;
      
      case RetryStrategy.LINEAR:
        delay = this.config.initialDelay * attempt;
        break;
      
      default:
        delay = this.config.initialDelay;
    }
    
    // Apply max delay cap
    delay = Math.min(delay, this.config.maxDelay);
    
    // Add jitter
    if (this.config.jitter) {
      delay = delay * (0.5 + Math.random());
    }
    
    return delay;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Backoff Strategies

### 1. Exponential Backoff

**Formula**: `delay = initial_delay × (backoff_factor ^ (attempt - 1))`

**Best For**: Most common use cases, API rate limiting, transient failures

```python
# Example delay progression (initial_delay=1s, backoff_factor=2)
# Attempt 1: 1 * (2^0) = 1 second
# Attempt 2: 1 * (2^1) = 2 seconds
# Attempt 3: 1 * (2^2) = 4 seconds
# Attempt 4: 1 * (2^3) = 8 seconds
# Attempt 5: 1 * (2^4) = 16 seconds

config = RetryConfig(
    max_attempts=5,
    backoff_strategy=RetryStrategy.EXPONENTIAL,
    backoff_factor=2.0,
    initial_delay=1.0,
    max_delay=60.0
)
```

**With Jitter** (Recommended):
```python
# Jitter adds randomness: delay × (0.5 + random(0..1))
# This prevents "thundering herd" when many clients retry simultaneously

# Attempt 1: 1s × (0.5..1.5) = 0.5s - 1.5s
# Attempt 2: 2s × (0.5..1.5) = 1s - 3s
# Attempt 3: 4s × (0.5..1.5) = 2s - 6s

config = RetryConfig(
    backoff_strategy=RetryStrategy.EXPONENTIAL,
    backoff_factor=2.0,
    initial_delay=1.0,
    jitter=True  # Recommended
)
```

### 2. Linear Backoff

**Formula**: `delay = initial_delay × attempt`

**Best For**: Predictable retry patterns, low-frequency retries

```python
# Example delay progression (initial_delay=2s)
# Attempt 1: 2 * 1 = 2 seconds
# Attempt 2: 2 * 2 = 4 seconds
# Attempt 3: 2 * 3 = 6 seconds
# Attempt 4: 2 * 4 = 8 seconds

config = RetryConfig(
    max_attempts=5,
    backoff_strategy=RetryStrategy.LINEAR,
    initial_delay=2.0
)
```

### 3. Fixed Backoff

**Formula**: `delay = initial_delay` (constant)

**Best For**: Simple retry logic, testing, known recovery times

```python
# Example delay progression (initial_delay=3s)
# Attempt 1: 3 seconds
# Attempt 2: 3 seconds
# Attempt 3: 3 seconds

config = RetryConfig(
    max_attempts=3,
    backoff_strategy=RetryStrategy.FIXED,
    initial_delay=3.0
)
```

### 4. Fibonacci Backoff

**Formula**: `delay = fibonacci(attempt)`

**Best For**: Gradual increase without aggressive growth

```python
class FibonacciRetryConfig(RetryConfig):
    def __init__(self, max_attempts: int = 5, initial_delay: float = 1.0):
        super().__init__(
            max_attempts=max_attempts,
            backoff_strategy=RetryStrategy.CUSTOM,
            initial_delay=initial_delay
        )
    
    def calculate_fibonacci_delay(self, attempt: int) -> float:
        """Calculate delay using Fibonacci sequence"""
        def fib(n):
            if n <= 1:
                return n
            return fib(n - 1) + fib(n - 2)
        
        fibonacci_value = fib(attempt)
        return self.initial_delay * fibonacci_value

# Attempt 1: 1 * fib(1) = 1s
# Attempt 2: 1 * fib(2) = 1s
# Attempt 3: 1 * fib(3) = 2s
# Attempt 4: 1 * fib(4) = 3s
# Attempt 5: 1 * fib(5) = 5s
# Attempt 6: 1 * fib(6) = 8s
```

## Circuit Breaker Pattern

### Architecture

**Purpose**: Prevent cascading failures by "opening" the circuit when failure rate exceeds threshold

**States**:
- **CLOSED**: Normal operation, requests flow through
- **OPEN**: Failures exceeded threshold, requests fail fast
- **HALF_OPEN**: Testing if service recovered

### Implementation

```python
from enum import Enum
from datetime import datetime, timedelta
import threading

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class CircuitBreakerConfig:
    def __init__(
        self,
        failure_threshold: int = 5,
        success_threshold: int = 2,
        timeout: float = 60.0,
        expected_exception: type = Exception
    ):
        """
        Circuit breaker configuration
        
        Args:
            failure_threshold: Number of failures before opening circuit
            success_threshold: Successes in HALF_OPEN before closing
            timeout: Seconds before transitioning OPEN -> HALF_OPEN
            expected_exception: Exception type to count as failure
        """
        self.failure_threshold = failure_threshold
        self.success_threshold = success_threshold
        self.timeout = timeout
        self.expected_exception = expected_exception

class CircuitBreaker:
    """Circuit breaker pattern implementation"""
    
    def __init__(self, config: CircuitBreakerConfig):
        self.config = config
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None
        self._lock = threading.Lock()
    
    def call(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with circuit breaker protection"""
        with self._lock:
            if self.state == CircuitState.OPEN:
                if self._should_attempt_reset():
                    self.state = CircuitState.HALF_OPEN
                    self.success_count = 0
                else:
                    raise CircuitBreakerOpenError(
                        "Circuit breaker is OPEN. Service unavailable."
                    )
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
            
        except self.config.expected_exception as e:
            self._on_failure()
            raise
    
    def _should_attempt_reset(self) -> bool:
        """Check if enough time has passed to try HALF_OPEN"""
        if self.last_failure_time is None:
            return False
        
        elapsed = (datetime.now() - self.last_failure_time).total_seconds()
        return elapsed >= self.config.timeout
    
    def _on_success(self):
        """Handle successful request"""
        with self._lock:
            if self.state == CircuitState.HALF_OPEN:
                self.success_count += 1
                if self.success_count >= self.config.success_threshold:
                    self._close_circuit()
            elif self.state == CircuitState.CLOSED:
                self.failure_count = 0
    
    def _on_failure(self):
        """Handle failed request"""
        with self._lock:
            self.failure_count += 1
            self.last_failure_time = datetime.now()
            
            if self.state == CircuitState.HALF_OPEN:
                self._open_circuit()
            elif self.failure_count >= self.config.failure_threshold:
                self._open_circuit()
    
    def _open_circuit(self):
        """Transition to OPEN state"""
        self.state = CircuitState.OPEN
        self.failure_count = 0
        print(f"Circuit breaker OPENED at {datetime.now()}")
    
    def _close_circuit(self):
        """Transition to CLOSED state"""
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        print(f"Circuit breaker CLOSED at {datetime.now()}")
    
    def get_state(self) -> CircuitState:
        """Get current circuit breaker state"""
        return self.state
    
    def reset(self):
        """Manually reset circuit breaker"""
        with self._lock:
            self.state = CircuitState.CLOSED
            self.failure_count = 0
            self.success_count = 0
            self.last_failure_time = None
```

### Circuit Breaker Usage

```python
# Configure circuit breaker
circuit_config = CircuitBreakerConfig(
    failure_threshold=5,      # Open after 5 failures
    success_threshold=2,       # Close after 2 successes in HALF_OPEN
    timeout=60.0,             # Wait 60s before trying HALF_OPEN
    expected_exception=RequestException
)

circuit_breaker = CircuitBreaker(circuit_config)

# Wrap API calls with circuit breaker
def make_api_request():
    return requests.get("https://api.example.com/data")

try:
    response = circuit_breaker.call(make_api_request)
except CircuitBreakerOpenError:
    print("Service is down. Circuit breaker is open.")
```

### Circuit Breaker State Transitions

```
              failure_threshold exceeded
CLOSED -----------------------------------------> OPEN
  ^                                                |
  |                                                | timeout elapsed
  |                                                v
  |                                            HALF_OPEN
  |                                                |
  |                success_threshold met           |
  +------------------------------------------------+
  |                                                |
  |                    failure                     |
  +------------------------------------------------+
```

## Combined Retry + Circuit Breaker

### Resilient HTTP Client

```python
class ResilientHttpClient:
    """HTTP client with retry logic and circuit breaker"""
    
    def __init__(
        self,
        base_url: str,
        retry_config: RetryConfig,
        circuit_breaker_config: CircuitBreakerConfig
    ):
        self.base_url = base_url
        self.retry_manager = RetryManager(retry_config)
        self.circuit_breaker = CircuitBreaker(circuit_breaker_config)
        self.session = requests.Session()
    
    def get(self, endpoint: str, **kwargs):
        """GET request with retry and circuit breaker"""
        return self._request('GET', endpoint, **kwargs)
    
    def post(self, endpoint: str, **kwargs):
        """POST request with retry and circuit breaker"""
        return self._request('POST', endpoint, **kwargs)
    
    def _request(self, method: str, endpoint: str, **kwargs):
        """Execute request with resilience patterns"""
        url = f"{self.base_url}{endpoint}"
        
        # Define request function
        def make_request():
            return self.session.request(method, url, **kwargs)
        
        # Execute with circuit breaker protection
        def protected_request():
            return self.circuit_breaker.call(make_request)
        
        # Execute with retry logic
        return self.retry_manager.execute_with_retry(protected_request)
```

### Usage Example

```python
# Configure retry
retry_config = RetryConfig(
    max_attempts=3,
    backoff_strategy=RetryStrategy.EXPONENTIAL,
    backoff_factor=2.0,
    initial_delay=1.0,
    retry_on_status=[408, 429, 500, 502, 503, 504],
    jitter=True
)

# Configure circuit breaker
circuit_config = CircuitBreakerConfig(
    failure_threshold=5,
    success_threshold=2,
    timeout=60.0
)

# Create resilient client
client = ResilientHttpClient(
    base_url="https://api.example.com",
    retry_config=retry_config,
    circuit_breaker_config=circuit_config
)

# Make resilient requests
try:
    response = client.get("/api/users")
    print(f"Success: {response.status_code}")
except MaxRetriesExceeded:
    print("All retry attempts failed")
except CircuitBreakerOpenError:
    print("Circuit breaker is open - service unavailable")
```

## Rate Limiting and Throttling

### Rate Limiter Pattern

```python
import time
from collections import deque

class RateLimiter:
    """Token bucket rate limiter"""
    
    def __init__(self, rate: int, per: float = 1.0):
        """
        Initialize rate limiter
        
        Args:
            rate: Number of requests allowed
            per: Time period in seconds (default: 1.0 = per second)
        """
        self.rate = rate
        self.per = per
        self.allowance = rate
        self.last_check = time.time()
    
    def wait_if_needed(self):
        """Wait if rate limit would be exceeded"""
        current = time.time()
        time_passed = current - self.last_check
        self.last_check = current
        
        # Refill tokens based on time passed
        self.allowance += time_passed * (self.rate / self.per)
        if self.allowance > self.rate:
            self.allowance = self.rate
        
        # Check if we have tokens
        if self.allowance < 1.0:
            sleep_time = (1.0 - self.allowance) * (self.per / self.rate)
            time.sleep(sleep_time)
            self.allowance = 0.0
        else:
            self.allowance -= 1.0

class SlidingWindowRateLimiter:
    """Sliding window rate limiter"""
    
    def __init__(self, max_requests: int, window_seconds: float):
        """
        Initialize sliding window rate limiter
        
        Args:
            max_requests: Maximum requests in window
            window_seconds: Time window in seconds
        """
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = deque()
    
    def wait_if_needed(self):
        """Wait if rate limit would be exceeded"""
        now = time.time()
        
        # Remove requests outside window
        while self.requests and self.requests[0] < now - self.window_seconds:
            self.requests.popleft()
        
        # Check if we're at limit
        if len(self.requests) >= self.max_requests:
            # Calculate sleep time
            oldest_request = self.requests[0]
            sleep_time = (oldest_request + self.window_seconds) - now
            if sleep_time > 0:
                time.sleep(sleep_time)
                # Clean up again after sleep
                while self.requests and self.requests[0] < time.time() - self.window_seconds:
                    self.requests.popleft()
        
        # Add current request
        self.requests.append(time.time())
```

### Rate Limiter Integration

```python
class RateLimitedHttpClient(ResilientHttpClient):
    """HTTP client with rate limiting"""
    
    def __init__(
        self,
        base_url: str,
        retry_config: RetryConfig,
        circuit_breaker_config: CircuitBreakerConfig,
        rate_limiter: RateLimiter
    ):
        super().__init__(base_url, retry_config, circuit_breaker_config)
        self.rate_limiter = rate_limiter
    
    def _request(self, method: str, endpoint: str, **kwargs):
        """Execute request with rate limiting"""
        # Wait if rate limit would be exceeded
        self.rate_limiter.wait_if_needed()
        
        # Execute with retry and circuit breaker
        return super()._request(method, endpoint, **kwargs)
```

## Configuration Examples

### YAML Configuration

```yaml
# resilience_config.yaml
retry:
  max_attempts: 3
  backoff_strategy: "exponential"  # fixed, linear, exponential
  backoff_factor: 2.0
  initial_delay: 1.0
  max_delay: 60.0
  retry_on_status: [408, 429, 500, 502, 503, 504]
  jitter: true

circuit_breaker:
  failure_threshold: 5
  success_threshold: 2
  timeout: 60.0

rate_limiter:
  enabled: true
  max_requests: 100
  per_seconds: 60  # 100 requests per minute
  strategy: "sliding_window"  # token_bucket or sliding_window
```

## Best Practices

### DO
✅ Use exponential backoff with jitter for most cases
✅ Implement circuit breakers for external service dependencies
✅ Set reasonable max_delay caps (typically 60s)
✅ Retry on transient errors (408, 429, 500, 502, 503, 504)
✅ Log retry attempts with context
✅ Monitor circuit breaker state transitions
✅ Use rate limiters to respect API quotas
✅ Combine retry + circuit breaker for maximum resilience
✅ Configure different strategies per service/endpoint
✅ Fail fast when circuit is open (don't queue requests)

### DON'T
❌ Retry on client errors (4xx except 408, 429)
❌ Use unlimited retries (always set max_attempts)
❌ Ignore retry-after headers (429 responses)
❌ Retry non-idempotent operations without careful consideration
❌ Use aggressive retry without backoff (thundering herd)
❌ Keep circuit closed during known outages
❌ Log sensitive data during retry attempts
❌ Retry file uploads without resume capability

## Summary

HTTP Retry and Resilience Patterns provide:
- **Multiple Backoff Strategies**: Exponential, Linear, Fixed, Fibonacci
- **Circuit Breaker**: Prevent cascading failures with state management
- **Rate Limiting**: Token bucket and sliding window algorithms
- **Combined Resilience**: Retry + Circuit Breaker + Rate Limiting
- **Configuration-Driven**: YAML-based resilience configuration
- **Best Practices**: Jitter, max delay caps, proper error handling
- **Production-Ready**: Thread-safe implementations with proper state management
