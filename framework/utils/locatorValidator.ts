import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { Logger } from './logger';

interface LocatorValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
}

interface ElementData {
  preferred?: string;
  fallbacks?: string[];
  element_type?: string;
  [key: string]: any;
}

interface ParsedContent {
  locators?: { [key: string]: ElementData };
  elements?: { [key: string]: ElementData };
  [key: string]: any;
}

export class LocatorValidator {
  private locatorDir: string;
  private logger: Logger;
  
  constructor(locatorDir: string = '../../tests/locators') {
    this.locatorDir = path.resolve(__dirname, locatorDir);
    this.logger = Logger.getInstance();
  }
  
  public validateAllLocatorFiles(): LocatorValidationResult[] {
    const results: LocatorValidationResult[] = [];
    
    try {
      const files = fs.readdirSync(this.locatorDir).filter(file => file.endsWith('.yaml'));
      
      for (const file of files) {
        const result = this.validateLocatorFile(file);
        results.push(result);
      }
    } catch (error) {
      this.logger.error(`Error reading locator directory: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return results;
  }
  
  public validateLocatorFile(filename: string): LocatorValidationResult {
    const result: LocatorValidationResult = {
      file: filename,
      valid: true,
      errors: []
    };
    
    try {
      const filePath = path.join(this.locatorDir, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      const parsedContent = yaml.parse(content);
      
      if (!parsedContent.locators) {
        result.valid = false;
        result.errors.push('Missing root "locators" key');
        return result;
      }
      
      for (const [elementName, elementData] of Object.entries(parsedContent.locators)) {
        this.validateElement(elementName, elementData as ElementData, result);
      }
      
    } catch (error) {
      result.valid = false;
      result.errors.push(`Failed to parse file: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return result;
  }
  
  private validateElement(elementName: string, elementData: ElementData, result: LocatorValidationResult) {
    if (!elementData.element_type) {
      result.valid = false;
      result.errors.push(`Element "${elementName}" is missing required field "element_type"`);
    }
    
    if (!elementData.preferred) {
      result.valid = false;
      result.errors.push(`Element "${elementName}" is missing required "preferred" locator`);
    } else {
      this.validateLocatorInfo(elementName, 'preferred', elementData.preferred, result);
    }
    
    if (elementData.fallbacks) {
      for (const [fallbackKey, fallbackData] of Object.entries(elementData.fallbacks)) {
        this.validateLocatorInfo(elementName, fallbackKey, fallbackData as any, result);
      }
    } else {
      result.valid = false;
      result.errors.push(`Element "${elementName}" is missing "fallbacks" section`);
    }
    
    if (!elementData.attributes) {
      result.valid = false;
      result.errors.push(`Element "${elementName}" is missing "attributes" section`);
    } else {
      if (!Object.hasOwnProperty.call(elementData.attributes, 'id')) {
        result.valid = false;
        result.errors.push(`Element "${elementName}" attributes is missing "id" property`);
      }
      if (!Object.hasOwnProperty.call(elementData.attributes, 'name')) {
        result.valid = false;
        result.errors.push(`Element "${elementName}" attributes is missing "name" property`);
      }
      if (!Object.hasOwnProperty.call(elementData.attributes, 'text')) {
        result.valid = false;
        result.errors.push(`Element "${elementName}" attributes is missing "text" property`);
      }
      if (!Object.hasOwnProperty.call(elementData.attributes, 'is_hidden')) {
        result.valid = false;
        result.errors.push(`Element "${elementName}" attributes is missing "is_hidden" property`);
      }
    }
  }
  
  private validateLocatorInfo(elementName: string, locatorType: string, locatorInfo: any, result: LocatorValidationResult) {
    if (!locatorInfo.locator) {
      result.valid = false;
      result.errors.push(`Element "${elementName}" ${locatorType} is missing "locator" value`);
    }
    
    if (!locatorInfo.type) {
      result.valid = false;
      result.errors.push(`Element "${elementName}" ${locatorType} is missing "type" value`);
    } else if (!['xpath', 'css'].includes(locatorInfo.type)) {
      result.valid = false;
      result.errors.push(`Element "${elementName}" ${locatorType} has invalid "type" value: ${locatorInfo.type}`);
    }
    
    if (!locatorInfo.confidence || isNaN(locatorInfo.confidence)) {
      result.valid = false;
      result.errors.push(`Element "${elementName}" ${locatorType} is missing valid "confidence" value`);
    }
  }
  
  public fixLocatorFile(filename: string): boolean {
    try {
      const filePath = path.join(this.locatorDir, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      let parsedContent: ParsedContent = yaml.parse(content);
      
      // If the file uses 'elements' instead of 'locators'
      if (parsedContent.elements && !parsedContent.locators) {
        const locators: { [key: string]: any } = {};
        
        for (const [elementName, elementData] of Object.entries(parsedContent.elements)) {
          // Create a standardized element structure
          const standardizedElement: any = {
            element_type: this.inferElementType(elementName),
            preferred: {},
            fallbacks: {},
            attributes: {
              id: '',
              name: '',
              text: '',
              is_hidden: false
            }
          };
          
          // Handle preferred locator
          if (typeof elementData?.preferred === 'string') {
            standardizedElement.preferred = {
              locator: elementData.preferred,
              type: this.inferLocatorType(elementData.preferred),
              confidence: 0.95
            };
          }
          
          // Handle fallbacks
          if (Array.isArray(elementData?.fallbacks)) {
            elementData.fallbacks.forEach((fallback: string, index: number) => {
              standardizedElement.fallbacks[`fallback_${index + 1}`] = {
                locator: fallback,
                type: this.inferLocatorType(fallback),
                confidence: 0.85 - (index * 0.05)
              };
            });
          }
          
          locators[elementName] = standardizedElement;
        }
        
        // Replace elements with locators
        delete parsedContent.elements;
        parsedContent.locators = locators;
        
        // Write back to file
        fs.writeFileSync(filePath, yaml.stringify(parsedContent));
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Error fixing locator file ${filename}: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
  
  private inferElementType(elementName: string): string {
    if (elementName.includes('button')) return 'button';
    if (elementName.includes('link')) return 'link';
    if (elementName.includes('input') || 
        elementName.includes('email') || 
        elementName.includes('password') || 
        elementName.includes('name')) return 'input';
    if (elementName.includes('select')) return 'select';
    if (elementName.includes('checkbox')) return 'checkbox';
    if (elementName.includes('radio')) return 'radio';
    if (elementName.includes('message') || 
        elementName.includes('error') || 
        elementName.includes('text')) return 'div';
    return 'div';
  }
  
  private inferLocatorType(locator: string): string {
    if (locator.startsWith('//') || locator.startsWith('(//')) {
      return 'xpath';
    }
    return 'css';
  }
}

// Run validation when executed directly
if (require.main === module) {
  const validator = new LocatorValidator();
  const results = validator.validateAllLocatorFiles();
  
  let allValid = true;
  
  for (const result of results) {
    if (result.valid) {
      console.log(`✅ ${result.file}: Valid`);
    } else {
      allValid = false;
      console.log(`❌ ${result.file}: Invalid`);
      for (const error of result.errors) {
        console.log(`   - ${error}`);
      }
      
      // Auto-fix non-compliant files
      if (result.file !== 'login.yaml') {
        console.log(`🔄 Attempting to fix ${result.file}...`);
        const fixed = validator.fixLocatorFile(result.file);
        if (fixed) {
          console.log(`✅ Successfully fixed ${result.file}`);
        } else {
          console.log(`❌ Could not automatically fix ${result.file}`);
        }
      }
    }
  }
  
  if (allValid) {
    console.log('\n✅ All locator files are valid!');
  } else {
    console.log('\n❌ Some locator files have been fixed. Run the validator again to check.');
    process.exit(1);
  }
}
