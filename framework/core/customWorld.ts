import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Page, BrowserContext, Browser } from '@playwright/test';
import { Logger } from '../utils/logger';
import { StepLogger } from '../utils/stepLogger';

export interface ICustomWorld extends World {
  page?: Page;
  context?: BrowserContext;
  browser?: Browser;
  logger: Logger;
  stepLogger: StepLogger;
  
  // Helper methods for step logging
  logAction(action: string, selector?: string, value?: string): void;
  logAssertion(assertion: string, expected: any, actual?: any): void;
  logWait(condition: string, timeout: number, result: boolean): void;
  logError(message: string, error?: any): void;
  
  // Step counter management
  stepCounterInitialized?: boolean;
  currentStepStartTime?: number;
  currentStepText?: string;
  
  // Scenario tracking
  scenarioStartTime?: number;
  browserStackSessionId?: string;
}

export class CustomWorld extends World implements ICustomWorld {
  public page?: Page;
  public context?: BrowserContext;
  public browser?: Browser;
  public logger: Logger;
  public stepLogger: StepLogger;
  
  // Step tracking properties
  public stepCounterInitialized?: boolean;
  public currentStepStartTime?: number;
  public currentStepText?: string;
  
  // Scenario tracking
  public scenarioStartTime?: number;
  public browserStackSessionId?: string;

  constructor(options: IWorldOptions) {
    super(options);
    this.logger = Logger.getInstance();
    this.stepLogger = StepLogger.getInstance();
  }

  /**
   * Log an action being performed
   */
  logAction(action: string, selector?: string, value?: string): void {
    this.stepLogger.logAction(action, selector || '', value);
  }

  /**
   * Log an assertion/verification
   */
  logAssertion(assertion: string, expected: any, actual?: any): void {
    this.stepLogger.logAssertion(assertion, expected, actual);
  }

  /**
   * Log a wait condition
   */
  logWait(condition: string, timeout: number, result: boolean): void {
    this.stepLogger.logWaitCondition(condition, timeout, result);
  }

  /**
   * Log an error with context
   */
  logError(message: string, error?: any): void {
    this.logger.error(message, error);
    
    // If we have a page, capture additional context
    if (this.page) {
      this.capturePageContext().catch(e => 
        this.logger.warn('Failed to capture page context after error', e)
      );
    }
  }

  /**
   * Capture page context for debugging
   */
  private async capturePageContext(): Promise<void> {
    if (!this.page) return;

    try {
      const url = this.page.url();
      const title = await this.page.title().catch(() => 'Unable to get title');
      const readyState = await this.page.evaluate(() => document.readyState).catch(() => 'unknown');
      
      this.logger.debug(`Page Context - URL: ${url}, Title: ${title}, ReadyState: ${readyState}`);
      
      // Capture any console errors
      const errors = await this.page.evaluate(() => {
        const errorMessages: string[] = [];
        // This would be populated by console event listeners in actual implementation
        return errorMessages;
      }).catch(() => []);
      
      if (errors.length > 0) {
        this.logger.warn('Browser Console Errors:', errors);
      }
      
    } catch (error) {
      this.logger.warn('Failed to capture page context', error);
    }
  }

  /**
   * Enhanced attach method with automatic type detection and logging
   * Temporarily commented out due to type incompatibility with Cucumber types
   */
  /*
  attach(data: string | Buffer, mediaType?: string, fileName?: string): void {
    // Auto-detect media type if not provided
    if (!mediaType) {
      if (typeof data === 'string') {
        if (data.startsWith('data:image/')) {
          mediaType = 'image/png';
        } else if (data.startsWith('{') || data.startsWith('[')) {
          mediaType = 'application/json';
        } else {
          mediaType = 'text/plain';
        }
      } else {
        mediaType = 'application/octet-stream';
      }
    }

    // Log the attachment
    this.logger.debug(`Attaching ${mediaType} ${fileName ? `(${fileName})` : ''} to scenario`);
    
    // Call parent attach method
    super.attach(data, mediaType, fileName);
  }
  */
}

// Set the custom world constructor
setWorldConstructor(CustomWorld);
