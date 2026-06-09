import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { Logger } from '../../utils/logger';

export interface TestDataSet {
  name: string;
  description?: string;
  data: Record<string, any>;
  tags?: string[];
  environment?: string[];
}

export interface DataTemplate {
  name: string;
  template: Record<string, any>;
  generators?: Record<string, DataGenerator>;
}

export interface DataGenerator {
  type: 'random' | 'sequence' | 'faker' | 'custom';
  options?: Record<string, any>;
  customFunction?: (context?: any) => any;
}

export interface DataContext {
  environment: string;
  testSuite: string;
  previousResponses?: Record<string, any>;
  variables?: Record<string, any>;
}

export class TestDataManager {
  private static instance: TestDataManager;
  private logger: Logger;
  private dataSets: Map<string, TestDataSet> = new Map();
  private templates: Map<string, DataTemplate> = new Map();
  private dataDirectory: string;

  private constructor() {
    this.logger = Logger.getInstance();
    this.dataDirectory = path.join(process.cwd(), 'tests', 'data');
    this.loadTestData();
  }

  static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager();
    }
    return TestDataManager.instance;
  }

  /**
   * Load test data from files
   */
  private loadTestData(): void {
    try {
      // Load data sets
      const dataSetsPath = path.join(this.dataDirectory, 'datasets');
      if (fs.existsSync(dataSetsPath)) {
        const files = fs.readdirSync(dataSetsPath).filter(file => 
          file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.json')
        );

        files.forEach(file => {
          const filePath = path.join(dataSetsPath, file);
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = file.endsWith('.json') ? JSON.parse(content) : yaml.parse(content);
            
            if (Array.isArray(data)) {
              data.forEach(dataset => this.dataSets.set(dataset.name, dataset));
            } else {
              this.dataSets.set(data.name, data);
            }
          } catch (error) {
            this.logger.warn(`Failed to load test data from ${file}`, { error });
          }
        });
      }

      // Load templates
      const templatesPath = path.join(this.dataDirectory, 'templates');
      if (fs.existsSync(templatesPath)) {
        const files = fs.readdirSync(templatesPath).filter(file => 
          file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.json')
        );

        files.forEach(file => {
          const filePath = path.join(templatesPath, file);
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            if (file.endsWith('.json')) {
              const template = JSON.parse(content);
              this.templates.set(template.name, template);
            } else {
              // Handle multiple YAML documents separated by ---
              const documents = content.split(/^---$/m).filter(doc => doc.trim());
              documents.forEach(docContent => {
                try {
                  const template = yaml.parse(docContent.trim());
                  if (template && template.name) {
                    this.templates.set(template.name, template);
                  }
                } catch (docError) {
                  this.logger.warn(`Failed to parse YAML document in ${file}`, { error: docError });
                }
              });
            }
          } catch (error) {
            this.logger.warn(`Failed to load template from ${file}`, { error });
          }
        });
      }

      this.logger.info(`Loaded test data`, {
        dataSets: this.dataSets.size,
        templates: this.templates.size
      });

    } catch (error) {
      this.logger.error('Failed to load test data', { error });
    }
  }

  /**
   * Get test data by name
   */
  getTestData(name: string, context?: DataContext): Record<string, any> {
    const dataSet = this.dataSets.get(name);
    if (!dataSet) {
      throw new Error(`Test data set '${name}' not found`);
    }

    // Filter by environment if context provided
    if (context?.environment && dataSet.environment && !dataSet.environment.includes(context.environment)) {
      throw new Error(`Test data set '${name}' not available for environment '${context.environment}'`);
    }

    return this.processDataWithContext(dataSet.data, context);
  }

  /**
   * Generate data from template
   */
  generateFromTemplate(templateName: string, context?: DataContext): Record<string, any> {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    let data = JSON.parse(JSON.stringify(template.template)); // Deep clone

    // Apply generators
    if (template.generators) {
      Object.entries(template.generators).forEach(([field, generator]) => {
        const value = this.generateValue(generator, context);
        this.setNestedValue(data, field, value);
      });
    }

    return this.processDataWithContext(data, context);
  }

  /**
   * Create dynamic test data
   */
  createTestData(data: Record<string, any>, context?: DataContext): Record<string, any> {
    return this.processDataWithContext(data, context);
  }

  /**
   * Save data for later use in test context
   */
  saveContextData(key: string, value: any, context: DataContext): void {
    if (!context.variables) {
      context.variables = {};
    }
    context.variables[key] = value;
  }

  /**
   * Get random data set by tag
   */
  getRandomDataByTag(tag: string, context?: DataContext): Record<string, any> {
    const matchingDataSets = Array.from(this.dataSets.values()).filter(dataSet => 
      dataSet.tags && dataSet.tags.includes(tag)
    );

    if (matchingDataSets.length === 0) {
      throw new Error(`No test data sets found with tag '${tag}'`);
    }

    const randomDataSet = matchingDataSets[Math.floor(Math.random() * matchingDataSets.length)];
    return this.processDataWithContext(randomDataSet.data, context);
  }

  /**
   * Merge multiple data sets
   */
  mergeDataSets(names: string[], context?: DataContext): Record<string, any> {
    const merged: Record<string, any> = {};
    
    names.forEach(name => {
      const data = this.getTestData(name, context);
      Object.assign(merged, data);
    });

    return merged;
  }

  /**
   * List available data sets
   */
  listDataSets(environment?: string): string[] {
    return Array.from(this.dataSets.values())
      .filter(dataSet => !environment || !dataSet.environment || dataSet.environment.includes(environment))
      .map(dataSet => dataSet.name);
  }

  /**
   * List available templates
   */
  listTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  /**
   * Private helper methods
   */
  private processDataWithContext(data: Record<string, any>, context?: DataContext): Record<string, any> {
    if (!context) return data;

    let processed = JSON.parse(JSON.stringify(data)); // Deep clone

    // Replace variables
    processed = this.replaceVariables(processed, context);
    
    // Replace previous response references
    if (context.previousResponses) {
      processed = this.replacePreviousResponses(processed, context.previousResponses);
    }

    return processed;
  }

  private replaceVariables(obj: any, context: DataContext): any {
    if (typeof obj === 'string') {
      // Replace {{variable}} patterns
      return obj.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
        if (context.variables && context.variables[variable] !== undefined) {
          return context.variables[variable];
        }
        return match; // Keep original if variable not found
      });
    } else if (Array.isArray(obj)) {
      return obj.map(item => this.replaceVariables(item, context));
    } else if (typeof obj === 'object' && obj !== null) {
      const result: Record<string, any> = {};
      Object.entries(obj).forEach(([key, value]) => {
        result[key] = this.replaceVariables(value, context);
      });
      return result;
    }
    return obj;
  }

  private replacePreviousResponses(obj: any, previousResponses: Record<string, any>): any {
    if (typeof obj === 'string') {
      // Replace {{response.stepName.field}} patterns
      return obj.replace(/\{\{response\.(\w+)\.([^}]+)\}\}/g, (match, stepName, field) => {
        const response = previousResponses[stepName];
        if (response) {
          const value = this.getNestedValue(response, field);
          return value !== undefined ? value : match;
        }
        return match;
      });
    } else if (Array.isArray(obj)) {
      return obj.map(item => this.replacePreviousResponses(item, previousResponses));
    } else if (typeof obj === 'object' && obj !== null) {
      const result: Record<string, any> = {};
      Object.entries(obj).forEach(([key, value]) => {
        result[key] = this.replacePreviousResponses(value, previousResponses);
      });
      return result;
    }
    return obj;
  }

  private generateValue(generator: DataGenerator, context?: DataContext): any {
    switch (generator.type) {
      case 'random':
        return this.generateRandomValue(generator.options);
      case 'sequence':
        return this.generateSequenceValue(generator.options);
      case 'faker':
        return this.generateFakerValue(generator.options);
      case 'custom':
        if (generator.customFunction) {
          try {
            // If customFunction is a string, evaluate it as a function
            if (typeof generator.customFunction === 'string') {
              const func = new Function('context', generator.customFunction);
              return func(context);
            } else if (typeof generator.customFunction === 'function') {
              return generator.customFunction(context);
            }
          } catch (error) {
            this.logger.warn('Failed to execute custom function', { error });
            return null;
          }
        }
        return null;
      default:
        return null;
    }
  }

  private generateRandomValue(options?: Record<string, any>): any {
    if (!options) return Math.random();

    const { type, min = 0, max = 100, length = 10, charset = 'alphanumeric' } = options;

    switch (type) {
      case 'number':
        return Math.floor(Math.random() * (max - min + 1)) + min;
      case 'string':
        return this.generateRandomString(length, charset);
      case 'boolean':
        return Math.random() < 0.5;
      case 'array':
        const arrayLength = Math.floor(Math.random() * (max - min + 1)) + min;
        return Array.from({ length: arrayLength }, () => this.generateRandomValue(options.item));
      default:
        return Math.random();
    }
  }

  private generateSequenceValue(options?: Record<string, any>): any {
    // Simple sequence implementation - could be enhanced with persistent state
    const { start = 1, step = 1, prefix = '', suffix = '' } = options || {};
    const value = start + Math.floor(Math.random() * 1000) * step;
    return `${prefix}${value}${suffix}`;
  }

  private generateFakerValue(options?: Record<string, any>): any {
    // Placeholder for Faker.js integration
    // This would require adding faker as a dependency
    const { method = 'name.firstName' } = options || {};
    
    // Simple implementation without faker dependency
    const fakeData: Record<string, any> = {
      'name.firstName': ['John', 'Jane', 'Alice', 'Bob', 'Charlie'][Math.floor(Math.random() * 5)],
      'name.lastName': ['Doe', 'Smith', 'Johnson', 'Brown', 'Davis'][Math.floor(Math.random() * 5)],
      'internet.email': () => `user${Math.floor(Math.random() * 1000)}@example.com`,
      'phone.phoneNumber': () => `+1-555-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    };

    const value = fakeData[method];
    return typeof value === 'function' ? value() : value || `fake_${method}`;
  }

  private generateRandomString(length: number, charset: string): string {
    const chars = {
      numeric: '0123456789',
      alpha: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      alphanumeric: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    const charSet = chars[charset as keyof typeof chars] || charset;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    return result;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, part) => {
      return current && current[part];
    }, obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    const lastPart = parts.pop()!;
    const target = parts.reduce((current, part) => {
      if (!current[part]) current[part] = {};
      return current[part];
    }, obj);
    target[lastPart] = value;
  }
}