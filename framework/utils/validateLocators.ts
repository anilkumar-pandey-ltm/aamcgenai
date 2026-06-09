import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { Logger } from './logger';

/**
 * Validates locator files to ensure they follow the standard schema
 */
export class LocatorValidator {
  private logger = Logger.getInstance();
  
  /**
   * Validates all locator files in the specified directory
   * @param locatorDir Directory containing locator YAML files
   * @returns Array of validation results
   */
  validateLocatorFiles(locatorDir: string = path.resolve(__dirname, '../../tests/locators')): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    try {
      const files = fs.readdirSync(locatorDir).filter(file => file.endsWith('.yaml'));
      console.log(`Found ${files.length} locator files to validate`);
      
      for (const file of files) {
        const filePath = path.join(locatorDir, file);
        const result = this.validateLocatorFile(filePath);
        results.push({
          file,
          path: filePath,
          ...result
        });
      }
      
      const validFiles = results.filter(r => r.valid).length;
      const invalidFiles = results.filter(r => !r.valid).length;
      
      console.log(`\nValidation Summary:`);
      console.log(`- Total files: ${results.length}`);
      console.log(`- Valid files: ${validFiles}`);
      console.log(`- Invalid files: ${invalidFiles}`);
      
      if (invalidFiles > 0) {
        console.log(`\nThe following files have issues:`);
        results.filter(r => !r.valid).forEach(r => {
          console.log(`\n${r.file}:`);
          r.errors.forEach(err => console.log(`  - ${err}`));
        });
      }
      
      return results;
    } catch (error) {
      this.logger.error('Error validating locator files', error);
      throw error;
    }
  }
  
  /**
   * Validates a single locator file
   * @param filePath Path to the locator file
   * @returns Validation result with errors
   */
  validateLocatorFile(filePath: string): Omit<ValidationResult, 'file' | 'path'> {
    const result: Omit<ValidationResult, 'file' | 'path'> = {
      valid: true,
      errors: []
    };
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = yaml.parse(content);
      
      // Check if root 'locators' object exists
      if (!parsed || !parsed.locators) {
        result.valid = false;
        result.errors.push('Missing root "locators" key');
        return result;
      }
      
      // Validate each locator entry
      Object.entries(parsed.locators).forEach(([key, value]: [string, any]) => {
        // Validate locator structure
        if (!value.element_type) {
          result.valid = false;
          result.errors.push(`Locator "${key}" missing required "element_type" field`);
        }
        
        // Validate preferred locator
        if (!value.preferred) {
          result.valid = false;
          result.errors.push(`Locator "${key}" missing required "preferred" field`);
        } else if (typeof value.preferred === 'string') {
          // Simple string format needs to be converted
          result.valid = false;
          result.errors.push(`Locator "${key}" has invalid "preferred" format - should be object with locator, type and confidence`);
        } else {
          // Check preferred object structure
          const preferred = value.preferred;
          if (!preferred.locator) {
            result.valid = false;
            result.errors.push(`Locator "${key}" preferred missing "locator" field`);
          }
          if (!preferred.type) {
            result.valid = false;
            result.errors.push(`Locator "${key}" preferred missing "type" field`);
          }
          if (!preferred.confidence) {
            result.valid = false;
            result.errors.push(`Locator "${key}" preferred missing "confidence" field`);
          }
        }
        
        // Validate fallbacks
        if (!value.fallbacks) {
          result.valid = false;
          result.errors.push(`Locator "${key}" missing required "fallbacks" field`);
        } else if (Array.isArray(value.fallbacks)) {
          // Simple array format needs to be converted
          result.valid = false;
          result.errors.push(`Locator "${key}" has invalid "fallbacks" format - should be object with fallback_1, fallback_2, etc.`);
        } else {
          // Check each fallback
          Object.entries(value.fallbacks).forEach(([fbKey, fbValue]: [string, any]) => {
            if (!fbValue.locator) {
              result.valid = false;
              result.errors.push(`Locator "${key}" fallback "${fbKey}" missing "locator" field`);
            }
            if (!fbValue.type) {
              result.valid = false;
              result.errors.push(`Locator "${key}" fallback "${fbKey}" missing "type" field`);
            }
            if (!fbValue.confidence) {
              result.valid = false;
              result.errors.push(`Locator "${key}" fallback "${fbKey}" missing "confidence" field`);
            }
          });
        }
        
        // Validate attributes
        if (!value.attributes) {
          result.valid = false;
          result.errors.push(`Locator "${key}" missing "attributes" section`);
        }
      });
      
    } catch (error: any) {
      result.valid = false;
      result.errors.push(`Failed to parse file: ${error?.message || 'Unknown error'}`);
    }
    
    return result;
  }
  
  /**
   * Fix common issues in locator files
   * @param filePath Path to the locator file
   * @returns Whether the file was fixed
   */
  fixLocatorFile(filePath: string): boolean {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = yaml.parse(content);
      let modified = false;
      
      if (!parsed || !parsed.locators) {
        return false;
      }
      
      Object.entries(parsed.locators).forEach(([key, value]: [string, any]) => {
        // Fix preferred if it's a string
        if (typeof value.preferred === 'string') {
          const locator = value.preferred;
          value.preferred = {
            locator,
            type: locator.startsWith('/') ? 'xpath' : 'css',
            confidence: 0.95
          };
          modified = true;
        }
        
        // Fix fallbacks if it's an array
        if (Array.isArray(value.fallbacks)) {
          const fallbacks: any = {};
          value.fallbacks.forEach((locator: string, index: number) => {
            fallbacks[`fallback_${index + 1}`] = {
              locator,
              type: locator.startsWith('/') ? 'xpath' : 'css',
              confidence: 0.85 - (index * 0.05)
            };
          });
          value.fallbacks = fallbacks;
          modified = true;
        }
        
        // Add element_type if missing
        if (!value.element_type) {
          value.element_type = 'div';
          modified = true;
        }
        
        // Add attributes if missing
        if (!value.attributes) {
          value.attributes = {
            id: '',
            name: '',
            text: '',
            is_hidden: false
          };
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, yaml.stringify(parsed));
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Error fixing locator file: ${filePath}`, error);
      return false;
    }
  }
  
  /**
   * Fix all locator files in the specified directory
   * @param locatorDir Directory containing locator files
   * @returns Number of files fixed
   */
  fixLocatorFiles(locatorDir: string = path.resolve(__dirname, '../../tests/locators')): number {
    try {
      const files = fs.readdirSync(locatorDir).filter(file => file.endsWith('.yaml'));
      let fixedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(locatorDir, file);
        const fixed = this.fixLocatorFile(filePath);
        if (fixed) {
          console.log(`Fixed ${file}`);
          fixedCount++;
        }
      }
      
      return fixedCount;
    } catch (error) {
      this.logger.error('Error fixing locator files', error);
      throw error;
    }
  }
}

interface ValidationResult {
  file: string;
  path: string;
  valid: boolean;
  errors: string[];
}

// Execute directly if this file is run as a script
if (require.main === module) {
  const validator = new LocatorValidator();
  const command = process.argv[2] || 'validate';
  
  if (command === 'validate') {
    validator.validateLocatorFiles();
  } else if (command === 'fix') {
    const fixedCount = validator.fixLocatorFiles();
    console.log(`Fixed ${fixedCount} files`);
    // Validate again to ensure fixes worked
    validator.validateLocatorFiles();
  } else {
    console.log('Unknown command. Use "validate" or "fix".');
  }
}
