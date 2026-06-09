import { Logger } from './logger';
import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class StepLogger {
  private static instance: StepLogger;
  private logger: Logger;
  private currentStep: string = '';
  private stepStartTime: number = 0;
  private stepCounter: number = 0;
  private stepLogFile: string = '';
  private scenarioName: string = '';
  private featureName: string = '';
  
  private constructor() {
    this.logger = Logger.getInstance();
    
    // Create step logs directory if it doesn't exist
    this.ensureStepLogDirectory();
    
    // Create a default log file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const workerId = process.env.CUCUMBER_WORKER_ID || process.env.JEST_WORKER_ID || '0';
    const stepsLogDir = path.resolve(process.cwd(), 'test-results', 'logs', 'steps');
    this.stepLogFile = path.join(stepsLogDir, `steps-default-${timestamp}-worker${workerId}.log`);
  }

  private ensureStepLogDirectory(): void {
    // Create main logs directory structure
    const logsDir = path.resolve(process.cwd(), 'test-results', 'logs');
    const stepsLogDir = path.join(logsDir, 'steps');
    
    try {
      // Create both directories if they don't exist
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      if (!fs.existsSync(stepsLogDir)) {
        fs.mkdirSync(stepsLogDir, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create step log directories:', error);
    }
  }
  
  /**
   * Initialize step logger for a new scenario
   */
  public initializeForScenario(featureName: string, scenarioName: string): void {
    this.featureName = featureName;
    this.scenarioName = scenarioName;
    this.resetStepCounter();
    
    // Create step log file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const workerId = process.env.CUCUMBER_WORKER_ID || process.env.JEST_WORKER_ID || '0';
    const sanitizedScenarioName = scenarioName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    const stepsLogDir = path.resolve(process.cwd(), 'test-results', 'logs', 'steps');
    this.stepLogFile = path.join(stepsLogDir, `steps-${sanitizedScenarioName}-${timestamp}-worker${workerId}.log`);
    
    // Initialize step log file
    this.writeToStepLogFile(`=== Step Execution Log for: "${scenarioName}" ===\n`);
    this.writeToStepLogFile(`Feature: ${featureName}\n`);
    this.writeToStepLogFile(`Started at: ${timestamp}\n`);
    this.writeToStepLogFile(`Worker ID: ${workerId}\n\n`);
  }
  
  private writeToStepLogFile(message: string): void {
    try {
      if (this.stepLogFile) {
        // Ensure directory exists before writing
        const dir = path.dirname(this.stepLogFile);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Create file if it doesn't exist
        if (!fs.existsSync(this.stepLogFile)) {
          fs.writeFileSync(this.stepLogFile, '');
        }
        
        // Append to the file
        fs.appendFileSync(this.stepLogFile, message);
      }
    } catch (error) {
      console.error('Failed to write to step log file:', error);
    }
  }

  public static getInstance(): StepLogger {
    if (!StepLogger.instance) {
      StepLogger.instance = new StepLogger();
    }
    return StepLogger.instance;
  }

  /**
   * Log step start with context
   */
  public logStepStart(stepText: string, stepType: string = 'STEP'): void {
    this.stepCounter++;
    this.currentStep = stepText;
    this.stepStartTime = Date.now();
    
    // Log to both console/framework log and step log file
    this.logger.info(`[${stepType}:${this.stepCounter}] STARTING: ${stepText}`);
    this.logger.debug(`Step start timestamp: ${new Date(this.stepStartTime).toISOString()}`);
    
    // Create detailed entry in step log file
    const timestamp = new Date().toISOString();
    this.writeToStepLogFile(`[${timestamp}] STEP ${this.stepCounter} STARTED: ${stepText}\n`);
    this.writeToStepLogFile(`  Type: ${stepType}\n`);
    this.writeToStepLogFile(`  Start Time: ${timestamp}\n`);
  }

  /**
   * Log step completion with timing
   */
  public logStepEnd(status: 'PASSED' | 'FAILED' | 'SKIPPED' = 'PASSED', error?: any): void {
    const endTime = Date.now();
    const duration = endTime - this.stepStartTime;
    
    // Log to console/framework log
    if (status === 'PASSED') {
      this.logger.success(`[STEP:${this.stepCounter}] COMPLETED: ${this.currentStep} (${duration}ms)`);
    } else if (status === 'FAILED') {
      this.logger.error(`[STEP:${this.stepCounter}] FAILED: ${this.currentStep} (${duration}ms)`, error);
    } else {
      this.logger.warn(`[STEP:${this.stepCounter}] SKIPPED: ${this.currentStep}`);
    }
    
    // Create detailed entry in step log file
    const timestamp = new Date().toISOString();
    this.writeToStepLogFile(`[${timestamp}] STEP ${this.stepCounter} ${status}: ${this.currentStep}\n`);
    this.writeToStepLogFile(`  Duration: ${duration}ms\n`);
    this.writeToStepLogFile(`  End Time: ${timestamp}\n`);
    
    if (error) {
      this.writeToStepLogFile(`  Error: ${error instanceof Error ? error.message : String(error)}\n`);
      if (error instanceof Error && error.stack) {
        this.writeToStepLogFile(`  Stack Trace:\n${error.stack}\n`);
      }
    }
    
    this.writeToStepLogFile(`  -----\n`);
  }

  /**
   * Log step with automatic page state capture
   */
  public async logStepWithPageState(stepText: string, page: Page, stepType: string = 'STEP'): Promise<void> {
    this.logStepStart(stepText, stepType);
    
    try {
      // Capture current page state for RCA
      const url = page.url();
      const title = await page.title().catch(() => 'Unable to get title');
      const viewport = page.viewportSize();
      
      // Log to console/framework log
      this.logger.debug(`Page State - URL: ${url}, Title: ${title}, Viewport: ${JSON.stringify(viewport)}`);
      
      // Log page state details to step log file
      this.writeToStepLogFile(`  Page State:\n`);
      this.writeToStepLogFile(`    URL: ${url}\n`);
      this.writeToStepLogFile(`    Title: ${title}\n`);
      this.writeToStepLogFile(`    Viewport: ${JSON.stringify(viewport)}\n`);
      
      // Capture readyState and document info if available
      try {
        const readyState = await page.evaluate(() => document.readyState);
        const docMode = await page.evaluate(() => document.compatMode);
        const elementCount = await page.evaluate(() => document.querySelectorAll('*').length);
        
        this.writeToStepLogFile(`    ReadyState: ${readyState}\n`);
        this.writeToStepLogFile(`    DocMode: ${docMode}\n`);
        this.writeToStepLogFile(`    Elements: ${elementCount}\n`);
      } catch (evalError) {
        // Silently continue if we can't evaluate page state
      }
      
      // Log any console errors from the page
      const consoleMessages = await this.captureRecentConsoleErrors(page);
      if (consoleMessages.length > 0) {
        this.logger.warn(`Browser Console Errors during step:`, consoleMessages);
        this.writeToStepLogFile(`    Console Errors:\n`);
        consoleMessages.forEach(msg => {
          this.writeToStepLogFile(`      - ${msg}\n`);
        });
      }
      
    } catch (error) {
      this.logger.warn(`Could not capture page state: ${error}`);
      this.writeToStepLogFile(`  Could not capture page state: ${error}\n`);
    }
  }

  /**
   * Log action with element details
   */
  public logAction(action: string, selector: string, value?: string): void {
    // Format log message
    let actionLog = `ACTION: ${action} on element "${selector}"`;
    if (value) {
      actionLog += ` with value "${value}"`;
    }
    
    // Log to console/framework log
    this.logger.info(actionLog);
    
    // Create detailed entry in step log file
    const timestamp = new Date().toISOString();
    this.writeToStepLogFile(`[${timestamp}] ACTION: ${action}\n`);
    this.writeToStepLogFile(`  Selector: "${selector}"\n`);
    if (value) {
      this.writeToStepLogFile(`  Value: "${value}"\n`);
    }
    this.writeToStepLogFile(`  Timestamp: ${timestamp}\n`);
  }

  /**
   * Log assertion/verification
   */
  public logAssertion(assertion: string, expected: any, actual?: any): void {
    // Log to console/framework log
    this.logger.info(`ASSERTION: ${assertion}`);
    this.logger.debug(`Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
    
    // Create detailed entry in step log file
    const timestamp = new Date().toISOString();
    this.writeToStepLogFile(`[${timestamp}] ASSERTION: ${assertion}\n`);
    this.writeToStepLogFile(`  Expected: ${JSON.stringify(expected)}\n`);
    if (actual !== undefined) {
      this.writeToStepLogFile(`  Actual: ${JSON.stringify(actual)}\n`);
    }
    this.writeToStepLogFile(`  Timestamp: ${timestamp}\n`);
  }

  /**
   * Log element interaction failure with fallback details
   */
  public logElementFailure(selector: string, action: string, error: any, fallbackUsed?: boolean): void {
    // Log to console/framework log
    this.logger.error(`Element interaction failed - Action: ${action}, Selector: ${selector}`, error);
    
    // Create detailed entry in step log file
    const timestamp = new Date().toISOString();
    this.writeToStepLogFile(`[${timestamp}] ELEMENT FAILURE:\n`);
    this.writeToStepLogFile(`  Action: ${action}\n`);
    this.writeToStepLogFile(`  Selector: ${selector}\n`);
    this.writeToStepLogFile(`  Error: ${error instanceof Error ? error.message : String(error)}\n`);
    
    // Include stack trace for better debugging
    if (error instanceof Error && error.stack) {
      this.writeToStepLogFile(`  Stack Trace:\n${error.stack}\n`);
    }
    
    if (fallbackUsed) {
      this.logger.warn(`Fallback mechanism was used for selector: ${selector}`);
      this.writeToStepLogFile(`  Fallback: Used fallback mechanism for selector: ${selector}\n`);
    }
    
    this.writeToStepLogFile(`  Timestamp: ${timestamp}\n`);
  }

  /**
   * Capture recent console errors from the page
   */
  private async captureRecentConsoleErrors(page: Page): Promise<string[]> {
    // This would be populated by console event listeners
    // For now, we'll return empty array but this can be enhanced
    // to capture real console errors through page event listeners
    return [];
  }

  /**
   * Log step parameter details for debugging
   */
  public logStepParameters(stepText: string, parameters: Record<string, any>): void {
    // Log to console/framework log
    this.logger.debug(`Step Parameters for "${stepText}":`, parameters);
    
    // Create detailed entry in step log file
    const timestamp = new Date().toISOString();
    this.writeToStepLogFile(`[${timestamp}] PARAMETERS for "${stepText}":\n`);
    this.writeToStepLogFile(`  Data: ${JSON.stringify(parameters, null, 2)}\n`);
    this.writeToStepLogFile(`  Timestamp: ${timestamp}\n`);
  }

  /**
   * Log wait conditions and timeouts
   */
  public logWaitCondition(condition: string, timeout: number, result: boolean): void {
    const status = result ? 'SATISFIED' : 'TIMEOUT';
    
    // Log to console/framework log
    this.logger.info(`WAIT CONDITION [${status}]: ${condition} (timeout: ${timeout}ms)`);
    
    // Create detailed entry in step log file
    const timestamp = new Date().toISOString();
    this.writeToStepLogFile(`[${timestamp}] WAIT CONDITION [${status}]:\n`);
    this.writeToStepLogFile(`  Condition: ${condition}\n`);
    this.writeToStepLogFile(`  Timeout: ${timeout}ms\n`);
    this.writeToStepLogFile(`  Result: ${result ? 'Satisfied' : 'Timed out'}\n`);
    this.writeToStepLogFile(`  Timestamp: ${timestamp}\n`);
  }

  /**
   * Reset step counter for new scenario
   */
  public resetStepCounter(): void {
    this.stepCounter = 0;
    
    // Log to console/framework log
    this.logger.debug('Step counter reset for new scenario');
    
    // Create entry in step log file
    const timestamp = new Date().toISOString(); 
    this.writeToStepLogFile(`[${timestamp}] RESET: Step counter reset for new scenario\n`);
  }
}
