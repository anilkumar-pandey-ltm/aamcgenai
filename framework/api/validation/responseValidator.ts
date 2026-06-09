import { ApiResponse } from '../clients/apiClient';
import { Logger } from '../../utils/logger';

export interface ValidationRule {
  field: string;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  value?: any;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any, response: ApiResponse) => boolean | string;
}

export interface SchemaValidation {
  type: 'object' | 'array';
  properties?: Record<string, ValidationRule>;
  items?: ValidationRule;
  required?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  name: string;
  field: string;
  message: string;
  actual: any;
  expected: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  actual: any;
}

export class ResponseValidator {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * Validate response against schema
   */
  validateSchema(response: ApiResponse, schema: SchemaValidation): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      this.validateObject(response.data, schema, '', result);
    } catch (error) {
      result.isValid = false;
      result.errors.push({
        name: 'SchemaValidationError',
        field: 'root',
        message: `Schema validation failed: ${error instanceof Error ? error.message : String(error)}`,
        actual: response.data,
        expected: schema
      });
    }

    this.logger.info(`Schema validation completed`, {
      isValid: result.isValid,
      errorCount: result.errors.length,
      warningCount: result.warnings.length
    });

    return result;
  }

  /**
   * Validate HTTP status code
   */
  validateStatus(response: ApiResponse, expectedStatus: number | number[]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const expectedStatuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    
    if (!expectedStatuses.includes(response.status)) {
      result.isValid = false;
      result.errors.push({
        name: 'StatusValidationError',
        field: 'status',
        message: `Expected status ${expectedStatuses.join(' or ')}, got ${response.status}`,
        actual: response.status,
        expected: expectedStatuses
      });
    }

    return result;
  }

  /**
   * Validate response headers
   */
  validateHeaders(response: ApiResponse, expectedHeaders: Record<string, string | RegExp>): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    Object.entries(expectedHeaders).forEach(([headerName, expectedValue]) => {
      const actualValue = response.headers[headerName.toLowerCase()];
      
      if (actualValue === undefined) {
        result.isValid = false;
        result.errors.push({
          name: 'HeaderValidationError',
          field: `headers.${headerName}`,
          message: `Header '${headerName}' is missing`,
          actual: undefined,
          expected: expectedValue
        });
        return;
      }

      if (expectedValue instanceof RegExp) {
        if (!expectedValue.test(actualValue)) {
          result.isValid = false;
          result.errors.push({
            name: 'HeaderValidationError',
            field: `headers.${headerName}`,
            message: `Header '${headerName}' does not match pattern`,
            actual: actualValue,
            expected: expectedValue.toString()
          });
        }
      } else if (actualValue !== expectedValue) {
        result.isValid = false;
        result.errors.push({
          name: 'HeaderValidationError',
          field: `headers.${headerName}`,
          message: `Header '${headerName}' value mismatch`,
          actual: actualValue,
          expected: expectedValue
        });
      }
    });

    return result;
  }

  /**
   * Validate response time
   */
  validateResponseTime(response: ApiResponse, maxDuration: number): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (response.duration > maxDuration) {
      result.isValid = false;
      result.errors.push({
        name: 'ResponseTimeValidationError',
        field: 'duration',
        message: `Response time exceeded limit`,
        actual: response.duration,
        expected: `<= ${maxDuration}ms`
      });
    }

    // Add warning for slow responses (>50% of limit)
    if (response.duration > maxDuration * 0.5) {
      result.warnings.push({
        field: 'duration',
        message: `Response time is approaching limit`,
        actual: response.duration
      });
    }

    return result;
  }

  /**
   * Validate field rules
   */
  validateFields(response: ApiResponse, rules: ValidationRule[]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    rules.forEach(rule => {
      const value = this.getFieldValue(response.data, rule.field);
      
      // Check required
      if (rule.required && (value === undefined || value === null)) {
        result.isValid = false;
        result.errors.push({
          name: 'FieldValidationError',
          field: rule.field,
          message: `Field '${rule.field}' is required`,
          actual: value,
          expected: 'non-null value'
        });
        return;
      }

      if (value === undefined || value === null) return;

      // Check type
      if (rule.type && !this.validateType(value, rule.type)) {
        result.isValid = false;
        result.errors.push({
          name: 'TypeValidationError',
          field: rule.field,
          message: `Field '${rule.field}' has wrong type`,
          actual: typeof value,
          expected: rule.type
        });
        return;
      }

      // Check value
      if (rule.value !== undefined && value !== rule.value) {
        result.isValid = false;
        result.errors.push({
          name: 'ValueValidationError',
          field: rule.field,
          message: `Field '${rule.field}' value mismatch`,
          actual: value,
          expected: rule.value
        });
        return;
      }

      // Check min/max for numbers
      if (rule.type === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          result.isValid = false;
          result.errors.push({
            name: 'RangeValidationError',
            field: rule.field,
            message: `Field '${rule.field}' is below minimum`,
            actual: value,
            expected: `>= ${rule.min}`
          });
        }
        if (rule.max !== undefined && value > rule.max) {
          result.isValid = false;
          result.errors.push({
            name: 'RangeValidationError',
            field: rule.field,
            message: `Field '${rule.field}' is above maximum`,
            actual: value,
            expected: `<= ${rule.max}`
          });
        }
      }

      // Check pattern for strings
      if (rule.type === 'string' && rule.pattern && !rule.pattern.test(value)) {
        result.isValid = false;
        result.errors.push({
          name: 'PatternValidationError',
          field: rule.field,
          message: `Field '${rule.field}' does not match pattern`,
          actual: value,
          expected: rule.pattern.toString()
        });
      }

      // Check custom validation
      if (rule.custom) {
        const customResult = rule.custom(value, response);
        if (customResult !== true) {
          result.isValid = false;
          result.errors.push({
            name: 'CustomValidationError',
            field: rule.field,
            message: typeof customResult === 'string' ? customResult : `Custom validation failed for '${rule.field}'`,
            actual: value,
            expected: 'custom rule validation'
          });
        }
      }
    });

    return result;
  }

  /**
   * Combine multiple validation results
   */
  combineResults(...results: ValidationResult[]): ValidationResult {
    const combined: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    results.forEach(result => {
      if (!result.isValid) {
        combined.isValid = false;
      }
      combined.errors.push(...result.errors);
      combined.warnings.push(...result.warnings);
    });

    return combined;
  }

  /**
   * Assert validation result is valid, throw error if not
   */
  assertValid(result: ValidationResult, context: string = 'Validation'): void {
    if (!result.isValid) {
      const errorMessages = result.errors.map(error => 
        `${error.name}: ${error.message} (field: ${error.field}, expected: ${error.expected}, actual: ${error.actual})`
      ).join('\n');
      
      this.logger.error(`${context} failed`, {
        errors: result.errors,
        warnings: result.warnings
      });
      
      throw new Error(`${context} failed:\n${errorMessages}`);
    }
    
    // Log warnings if any
    if (result.warnings.length > 0) {
      this.logger.warn(`${context} warnings`, {
        warnings: result.warnings
      });
    }
  }

  /**
   * Private helper methods
   */
  private validateObject(data: any, schema: SchemaValidation, path: string, result: ValidationResult): void {
    if (schema.type === 'array') {
      if (!Array.isArray(data)) {
        result.isValid = false;
        result.errors.push({
          name: 'TypeValidationError',
          field: path || 'root',
          message: 'Expected array',
          actual: typeof data,
          expected: 'array'
        });
        return;
      }

      if (schema.items) {
        data.forEach((item, index) => {
          const itemPath = path ? `${path}[${index}]` : `[${index}]`;
          if (schema.items!.type && !this.validateType(item, schema.items!.type)) {
            result.isValid = false;
            result.errors.push({
              name: 'TypeValidationError',
              field: itemPath,
              message: `Array item has wrong type`,
              actual: typeof item,
              expected: schema.items!.type
            });
          }
        });
      }
    } else {
      if (typeof data !== 'object' || data === null) {
        result.isValid = false;
        result.errors.push({
          name: 'TypeValidationError',
          field: path || 'root',
          message: 'Expected object',
          actual: typeof data,
          expected: 'object'
        });
        return;
      }

      // Check required fields
      if (schema.required) {
        schema.required.forEach(field => {
          if (!(field in data)) {
            result.isValid = false;
            result.errors.push({
              name: 'RequiredFieldValidationError',
              field: path ? `${path}.${field}` : field,
              message: `Required field '${field}' is missing`,
              actual: undefined,
              expected: 'non-null value'
            });
          }
        });
      }

      // Validate properties
      if (schema.properties) {
        Object.entries(schema.properties).forEach(([field, rule]) => {
          const fieldPath = path ? `${path}.${field}` : field;
          const value = data[field];
          
          if (rule.required && (value === undefined || value === null)) {
            result.isValid = false;
            result.errors.push({
              name: 'RequiredFieldValidationError',
              field: fieldPath,
              message: `Field '${field}' is required`,
              actual: value,
              expected: 'non-null value'
            });
            return;
          }

          if (value !== undefined && value !== null) {
            if (rule.type && !this.validateType(value, rule.type)) {
              result.isValid = false;
              result.errors.push({
                name: 'TypeValidationError',
                field: fieldPath,
                message: `Field '${field}' has wrong type`,
                actual: typeof value,
                expected: rule.type
              });
            }
          }
        });
      }
    }
  }

  private validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      default:
        return false;
    }
  }

  private getFieldValue(data: any, field: string): any {
    return field.split('.').reduce((obj, key) => {
      return obj && obj[key] !== undefined ? obj[key] : undefined;
    }, data);
  }
}