import fetch, { RequestInit, Response } from 'node-fetch';
import { getConfig } from '../../utils/configUtility';
import { UrlConfigUtility } from '../../utils/urlConfigUtility';
import { Logger } from '../../utils/logger';

export interface ApiRequestConfig extends RequestInit {
  url: string;
  retries?: number;
  timeout?: number;
  validateStatus?: (status: number) => boolean;
  baseURL?: string;
  params?: Record<string, any>;
  beforeRequest?: (config: ApiRequestConfig) => Promise<ApiRequestConfig>;
  afterResponse?: (response: ApiResponse) => Promise<ApiResponse>;
}

export interface ApiResponse {
  data: any;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: ApiRequestConfig;
  duration: number;
  timestamp: string;
}

export interface AuthConfig {
  type: 'bearer' | 'basic' | 'apikey' | 'oauth2';
  token?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  refreshToken?: string;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private authConfig: AuthConfig | null = null;
  protected logger: Logger;
  private urlConfig: UrlConfigUtility;
  private environment: string;
  protected servicePath: string = '';
  private requestInterceptors: Array<(config: ApiRequestConfig) => Promise<ApiRequestConfig>> = [];
  private responseInterceptors: Array<(response: ApiResponse) => Promise<ApiResponse>> = [];

  constructor(baseURL?: string, environment?: string) {
    this.environment = environment || process.env.API_ENV || process.env.TEST_ENVIRONMENT || 'default';
    this.urlConfig = UrlConfigUtility.getInstance();
    
    // Priority: constructor parameter > URL config utility > legacy config > default
    this.baseURL = baseURL || 
                   this.urlConfig.getAPIBaseUrl(this.environment) || 
                   'https://jsonplaceholder.typicode.com';
    
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    this.logger = Logger.getInstance();
    
    this.logger.info('API Client initialized', {
      baseURL: this.baseURL,
      environment: this.environment
    });
  }

  /**
   * Set authentication configuration
   */
  setAuth(authConfig: AuthConfig): void {
    this.authConfig = authConfig;
    this.updateAuthHeaders();
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: (config: ApiRequestConfig) => Promise<ApiRequestConfig>): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: (response: ApiResponse) => Promise<ApiResponse>): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Set default headers
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * GET request
   */
  async get(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse> {
    return this.request({ ...config, method: 'GET', url });
  }

  /**
   * POST request
   */
  async post(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse> {
    return this.request({ ...config, method: 'POST', url, body: JSON.stringify(data) });
  }

  /**
   * PUT request
   */
  async put(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse> {
    return this.request({ ...config, method: 'PUT', url, body: JSON.stringify(data) });
  }

  /**
   * PATCH request
   */
  async patch(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse> {
    return this.request({ ...config, method: 'PATCH', url, body: JSON.stringify(data) });
  }

  /**
   * DELETE request
   */
  async delete(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse> {
    return this.request({ ...config, method: 'DELETE', url });
  }

  /**
   * Request using endpoint configuration
   */
  async requestEndpoint(service: string, endpointName: string, options?: {
    parameters?: Record<string, any>;
    data?: any;
    config?: Partial<ApiRequestConfig>;
  }): Promise<ApiResponse> {
    const endpointConfig = this.urlConfig.getEndpointConfig(service, endpointName);
    const url = this.urlConfig.buildAPIEndpointUrl(service, endpointName, {
      environment: this.environment,
      parameters: options?.parameters
    });

    const requestConfig: ApiRequestConfig = {
      ...options?.config,
      method: endpointConfig.method,
      url: url.replace(this.baseURL, ''), // Remove base URL as it will be added in buildUrl
    };

    // Add request body for POST, PUT, PATCH methods
    if (['POST', 'PUT', 'PATCH'].includes(endpointConfig.method) && options?.data) {
      requestConfig.body = JSON.stringify(options.data);
    }

    this.logger.info('Making endpoint request', {
      service,
      endpoint: endpointName,
      method: endpointConfig.method,
      url
    });

    return this.request(requestConfig);
  }

  /**
   * Main request method
   */
  async request(config: ApiRequestConfig): Promise<ApiResponse> {
    const startTime = Date.now();
    let finalConfig = { ...config };

    try {
      // Apply request interceptors
      for (const interceptor of this.requestInterceptors) {
        finalConfig = await interceptor(finalConfig);
      }

      // Build full URL with proper path handling
      let fullUrl: string;

      if (finalConfig.url.startsWith('http')) {
        // If URL is absolute, use it as is
        fullUrl = finalConfig.url;
      } else {
        // Handle relative URLs by combining baseURL, servicePath and the URL
        let path = finalConfig.url;
        
        // Remove leading slash if servicePath ends with slash or path starts with slash
        if ((this.servicePath?.endsWith('/') && path.startsWith('/')) ||
            (!this.servicePath && path.startsWith('/'))) {
          path = path.substring(1);
        }

        // Ensure servicePath has trailing slash if needed
        const adjustedServicePath = this.servicePath && !this.servicePath.endsWith('/') 
          ? `${this.servicePath}/` 
          : this.servicePath || '';

        // Combine servicePath and path
        const fullPath = `${adjustedServicePath}${path}`;

        // Ensure proper URL construction
        const baseUrl = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
        const normalizedPath = fullPath.startsWith('/') ? fullPath : `/${fullPath}`;

        fullUrl = `${baseUrl}${normalizedPath}`;
      }

      // Add query parameters if any
      if (finalConfig.params) {
        const searchParams = new URLSearchParams();
        Object.entries(finalConfig.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        const queryString = searchParams.toString();
        if (queryString) {
          fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
        }
      }

      // Store full URL for request
      finalConfig.url = fullUrl;

      // Log the constructed URL for debugging
      this.logger.debug('Constructed URL:', { 
        baseURL: this.baseURL,
        servicePath: this.servicePath,
        originalUrl: config.url,
        finalUrl: fullUrl
      });

      // Prepare headers
      const headers = {
        ...this.defaultHeaders,
        ...finalConfig.headers
      };

      // Prepare request options
      const requestOptions: RequestInit = {
        method: finalConfig.method || 'GET',
        headers,
        body: finalConfig.body
      };

      this.logger.info(`API Request: ${requestOptions.method} ${fullUrl}`, {
        url: fullUrl,
        method: requestOptions.method,
        headers: this.sanitizeHeaders(headers),
        body: finalConfig.body
      });

      // Log the actual request URL for debugging
      this.logger.debug('Making request to:', { url: fullUrl });
      
      // Execute request with retry logic
      const response = await this.executeWithRetry(fullUrl, requestOptions, finalConfig.retries || 3);
      
      const duration = Date.now() - startTime;
      const responseData = await this.parseResponse(response);

      let apiResponse: ApiResponse = {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: this.responseHeadersToObject(response.headers),
        config: finalConfig,
        duration,
        timestamp: new Date().toISOString()
      };

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        apiResponse = await interceptor(apiResponse);
      }

      // Validate status
      const isValidStatus = finalConfig.validateStatus 
        ? finalConfig.validateStatus(response.status)
        : response.status >= 200 && response.status < 300;

      if (!isValidStatus) {
        throw new ApiError(
          `Request failed with status ${response.status}`,
          apiResponse,
          'STATUS_ERROR'
        );
      }

      this.logger.info(`API Response: ${response.status} ${response.statusText}`, {
        status: response.status,
        duration,
        responseSize: JSON.stringify(responseData).length
      });

      return apiResponse;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`API Request Failed: ${finalConfig.method} ${finalConfig.url}`, {
        error: error instanceof Error ? error.message : String(error),
        duration,
        config: finalConfig
      });
      throw error;
    }
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry(url: string, options: RequestInit, retries: number): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeout);
        return response;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === retries) {
          break;
        }

        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new ApiError(
      `Request failed after ${retries} attempts: ${lastError?.message}`,
      null,
      'RETRY_EXHAUSTED'
    );
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(url: string, params?: Record<string, any>): string {
    let fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      fullUrl += `?${searchParams.toString()}`;
    }
    
    return fullUrl;
  }

  /**
   * Parse response data
   */
  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType.includes('text/')) {
      return await response.text();
    } else {
      return await response.buffer();
    }
  }

  /**
   * Convert response headers to plain object
   */
  private responseHeadersToObject(headers: any): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of headers.entries()) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Update authentication headers based on auth config
   */
  private updateAuthHeaders(): void {
    if (!this.authConfig) return;

    switch (this.authConfig.type) {
      case 'bearer':
        this.defaultHeaders['Authorization'] = `Bearer ${this.authConfig.token}`;
        break;
      case 'basic':
        const credentials = Buffer.from(`${this.authConfig.username}:${this.authConfig.password}`).toString('base64');
        this.defaultHeaders['Authorization'] = `Basic ${credentials}`;
        break;
      case 'apikey':
        this.defaultHeaders['X-API-Key'] = this.authConfig.apiKey!;
        break;
    }
  }

  /**
   * Sanitize headers for logging (remove sensitive data)
   */
  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'x-api-key', 'cookie'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public response: ApiResponse | null,
    public code: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Factory method to create API client instances
 */
export class ApiClientFactory {
  private static instances: Map<string, ApiClient> = new Map();

  static getInstance(name: string = 'default', baseURL?: string, environment?: string): ApiClient {
    const instanceKey = `${name}_${environment || 'default'}`;
    if (!this.instances.has(instanceKey)) {
      this.instances.set(instanceKey, new ApiClient(baseURL, environment));
    }
    return this.instances.get(instanceKey)!;
  }

  static createInstance(name: string, baseURL?: string, environment?: string): ApiClient {
    const client = new ApiClient(baseURL, environment);
    const instanceKey = `${name}_${environment || 'default'}`;
    this.instances.set(instanceKey, client);
    return client;
  }
}
