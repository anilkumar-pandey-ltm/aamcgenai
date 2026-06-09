import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { Logger } from './logger';

export interface BaseUrlConfig {
  ui: {
    default: string;
    environments: Record<string, string>;
    paths?: Record<string, string>;
  };
  api: {
    default: string;
    environments: Record<string, string>;
    versions?: Record<string, string>;
  };
  environment_overrides?: Record<string, any>;
  command_line_mapping?: Record<string, any>;
  validation?: {
    ui_url_pattern: string;
    api_url_pattern: string;
    required_protocols: string[];
  };
  timeouts?: Record<string, any>;
}

export interface EndpointsConfig {
  [serviceName: string]: {
    base_path: string;
    endpoints: Record<string, {
      method: string;
      path: string;
      description: string;
      tags: string[];
      parameters?: Array<{
        name: string;
        type: 'path' | 'query' | 'header' | 'body';
        required: boolean;
        description: string;
      }>;
      request_schema?: string;
      response_schema?: string;
    }>;
  };
}

export interface UrlResolutionOptions {
  environment?: string;
  service?: string;
  endpoint?: string;
  parameters?: Record<string, any>;
  version?: string;
}

export class UrlConfigUtility {
  private static instance: UrlConfigUtility;
  private logger: Logger;
  private baseUrlConfig!: BaseUrlConfig;
  private endpointsConfig!: EndpointsConfig;
  private configDir: string;

  private constructor() {
    this.logger = Logger.getInstance();
    this.configDir = path.join(process.cwd(), 'framework', 'config');
    this.loadConfigurations();
  }

  static getInstance(): UrlConfigUtility {
    if (!UrlConfigUtility.instance) {
      UrlConfigUtility.instance = new UrlConfigUtility();
    }
    return UrlConfigUtility.instance;
  }

  /**
   * Load base URLs and endpoints configurations
   */
  private loadConfigurations(): void {
    try {
      // Load base URLs configuration
      const baseUrlsPath = path.join(this.configDir, 'base-urls.yaml');
      if (fs.existsSync(baseUrlsPath)) {
        const baseUrlsContent = fs.readFileSync(baseUrlsPath, 'utf-8');
        this.baseUrlConfig = yaml.parse(baseUrlsContent);
      } else {
        this.logger.warn('base-urls.yaml not found, using default configuration');
        this.baseUrlConfig = this.getDefaultBaseUrlConfig();
      }

      // Load endpoints configuration from tests/config
      const endpointsPath = path.join(process.cwd(), 'tests', 'config', 'endpoints.yaml');
      if (fs.existsSync(endpointsPath)) {
        const endpointsContent = fs.readFileSync(endpointsPath, 'utf-8');
        this.endpointsConfig = yaml.parse(endpointsContent);
      } else {
        this.logger.warn('endpoints.yaml not found in tests/config, using empty configuration');
        this.endpointsConfig = {};
      }

      this.logger.info('URL configurations loaded successfully', {
        baseUrlEnvironments: Object.keys(this.baseUrlConfig.ui?.environments || {}),
        endpointServices: Object.keys(this.endpointsConfig)
      });

    } catch (error) {
      this.logger.error('Failed to load URL configurations', { error });
      this.baseUrlConfig = this.getDefaultBaseUrlConfig();
      this.endpointsConfig = {};
    }
  }

  /**
   * Get UI base URL with priority: Command line > Environment variable > Config file
   */
  getUIBaseUrl(environment?: string): string {
    // Priority 1: Command line argument (passed via environment variable)
    const cmdLineUrl = process.env.UI_BASE_URL || process.env.BASE_URL;
    if (cmdLineUrl) {
      this.logger.info('Using UI base URL from command line/environment', { url: cmdLineUrl });
      return this.validateAndFormatUrl(cmdLineUrl, 'ui');
    }

    // Priority 2: Environment-specific configuration
    if (environment && this.baseUrlConfig.ui?.environments?.[environment]) {
      const envUrl = this.baseUrlConfig.ui.environments[environment];
      this.logger.info('Using UI base URL from environment config', { environment, url: envUrl });
      return this.validateAndFormatUrl(envUrl, 'ui');
    }

    // Priority 3: Environment override configuration
    if (environment && this.baseUrlConfig.environment_overrides?.[environment]?.ui_base_url) {
      const overrideUrl = this.baseUrlConfig.environment_overrides[environment].ui_base_url;
      this.logger.info('Using UI base URL from environment override', { environment, url: overrideUrl });
      return this.validateAndFormatUrl(overrideUrl, 'ui');
    }

    // Priority 4: Default configuration
    const defaultUrl = this.baseUrlConfig.ui?.default || 'http://localhost:3000';
    this.logger.info('Using default UI base URL', { url: defaultUrl });
    return this.validateAndFormatUrl(defaultUrl, 'ui');
  }

  /**
   * Get API base URL with priority: Command line > Environment variable > Config file
   */
  getAPIBaseUrl(environment?: string): string {
    // Priority 1: Command line argument (passed via environment variable)
    const cmdLineUrl = process.env.API_BASE_URL;
    if (cmdLineUrl) {
      this.logger.info('Using API base URL from command line/environment', { url: cmdLineUrl });
      return this.validateAndFormatUrl(cmdLineUrl, 'api');
    }

    // Priority 2: Environment-specific configuration
    if (environment && this.baseUrlConfig.api?.environments?.[environment]) {
      const envUrl = this.baseUrlConfig.api.environments[environment];
      this.logger.info('Using API base URL from environment config', { environment, url: envUrl });
      return this.validateAndFormatUrl(envUrl, 'api');
    }

    // Priority 3: Environment override configuration
    if (environment && this.baseUrlConfig.environment_overrides?.[environment]?.api_base_url) {
      const overrideUrl = this.baseUrlConfig.environment_overrides[environment].api_base_url;
      this.logger.info('Using API base URL from environment override', { environment, url: overrideUrl });
      return this.validateAndFormatUrl(overrideUrl, 'api');
    }

    // Priority 4: Default configuration
    const defaultUrl = this.baseUrlConfig.api?.default || 'https://jsonplaceholder.typicode.com';
    this.logger.info('Using default API base URL', { url: defaultUrl });
    return this.validateAndFormatUrl(defaultUrl, 'api');
  }

  /**
   * Build complete API endpoint URL
   */
  buildAPIEndpointUrl(service: string, endpointName: string, options?: UrlResolutionOptions): string {
    const serviceConfig = this.endpointsConfig[service];
    if (!serviceConfig) {
      throw new Error(`Service '${service}' not found in endpoints configuration`);
    }

    const endpoint = serviceConfig.endpoints[endpointName];
    if (!endpoint) {
      throw new Error(`Endpoint '${endpointName}' not found in service '${service}'`);
    }

    // Get base URL
    const baseUrl = this.getAPIBaseUrl(options?.environment);
    
    // Get API version if specified
    const version = options?.version || this.getAPIVersion(options?.environment);
    
    // Build path: baseUrl + version + service.base_path + endpoint.path
    let fullPath = baseUrl;
    
    if (version && !baseUrl.includes(version)) {
      fullPath += version;
    }
    
    fullPath += serviceConfig.base_path + endpoint.path;

    // Replace path parameters
    if (options?.parameters) {
      Object.entries(options.parameters).forEach(([key, value]) => {
        fullPath = fullPath.replace(`{${key}}`, String(value));
      });
    }

    this.logger.info('Built API endpoint URL', {
      service,
      endpoint: endpointName,
      url: fullPath,
      method: endpoint.method
    });

    return fullPath;
  }

  /**
   * Get endpoint configuration
   */
  getEndpointConfig(service: string, endpointName: string) {
    const serviceConfig = this.endpointsConfig[service];
    if (!serviceConfig) {
      throw new Error(`Service '${service}' not found in endpoints configuration`);
    }

    const endpoint = serviceConfig.endpoints[endpointName];
    if (!endpoint) {
      throw new Error(`Endpoint '${endpointName}' not found in service '${service}'`);
    }

    return {
      ...endpoint,
      service,
      endpointName,
      base_path: serviceConfig.base_path
    };
  }

  /**
   * Get all endpoints for a service
   */
  getServiceEndpoints(service: string) {
    const serviceConfig = this.endpointsConfig[service];
    if (!serviceConfig) {
      throw new Error(`Service '${service}' not found in endpoints configuration`);
    }

    return serviceConfig.endpoints;
  }

  /**
   * List all available services
   */
  getAvailableServices(): string[] {
    return Object.keys(this.endpointsConfig);
  }

  /**
   * List all endpoints across all services
   */
  getAllEndpoints(): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    Object.entries(this.endpointsConfig).forEach(([service, config]) => {
      result[service] = Object.keys(config.endpoints);
    });
    return result;
  }

  /**
   * Get API version for environment
   */
  private getAPIVersion(environment?: string): string {
    if (environment && this.baseUrlConfig.environment_overrides?.[environment]?.api_version) {
      return this.baseUrlConfig.environment_overrides[environment].api_version;
    }
    
    return this.baseUrlConfig.api?.versions?.latest || '';
  }

  /**
   * Get UI page URL
   */
  getUIPageUrl(pagePath: string, environment?: string): string {
    const baseUrl = this.getUIBaseUrl(environment);
    const configuredPath = this.baseUrlConfig.ui?.paths?.[pagePath];
    const path = configuredPath || pagePath;
    
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  /**
   * Get timeout configuration for environment
   */
  getTimeouts(environment?: string) {
    const env = environment || 'local';
    return this.baseUrlConfig.timeouts?.[env] || this.baseUrlConfig.timeouts?.local || {
      ui_load_timeout: 10000,
      api_request_timeout: 5000
    };
  }

  /**
   * Validate and format URL
   */
  private validateAndFormatUrl(url: string, type: 'ui' | 'api'): string {
    if (!url) {
      throw new Error(`${type.toUpperCase()} URL cannot be empty`);
    }

    // Basic URL validation
    try {
      const urlObj = new URL(url);
      const allowedProtocols = this.baseUrlConfig.validation?.required_protocols || ['http', 'https'];
      
      if (!allowedProtocols.includes(urlObj.protocol.replace(':', ''))) {
        throw new Error(`Invalid protocol. Allowed: ${allowedProtocols.join(', ')}`);
      }
      
      return url.endsWith('/') ? url.slice(0, -1) : url;
    } catch (error) {
      throw new Error(`Invalid ${type.toUpperCase()} URL format: ${url}`);
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultBaseUrlConfig(): BaseUrlConfig {
    return {
      ui: {
        default: 'http://localhost:3000',
        environments: {
          local: 'http://localhost:3000',
          prestashop_local: 'http://localhost',
          dev: 'https://dev.example.com',
          staging: 'https://staging.example.com',
          prod: 'https://www.example.com'
        }
      },
      api: {
        default: 'https://jsonplaceholder.typicode.com',
        environments: {
          local: 'http://localhost:8080/api',
          dev: 'https://dev-api.example.com',
          staging: 'https://staging-api.example.com',
          prod: 'https://api.example.com'
        }
      }
    };
  }

  /**
   * Reload configurations (useful for testing)
   */
  reloadConfigurations(): void {
    this.loadConfigurations();
  }
}