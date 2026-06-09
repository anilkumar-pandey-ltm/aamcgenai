import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.DEBUG; // Capture all logs in file
  private logFile: string;
  private consoleLogLevel: LogLevel = LogLevel.INFO; // Show INFO and above on console

  private constructor() {
    // Create logs directory if it doesn't exist
    const logsDir = path.resolve(process.cwd(), 'test-results', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Create log file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const workerId = process.env.CUCUMBER_WORKER_ID || process.env.JEST_WORKER_ID || '0';
    this.logFile = path.join(logsDir, `framework-${timestamp}-worker${workerId}.log`);
    
    // Initialize log file
    this.writeToFile(`=== FusionIQ Test Framework Log - Worker ${workerId} ===\n`);
    this.writeToFile(`Started at: ${new Date().toISOString()}\n`);
    this.writeToFile(`Process PID: ${process.pid}\n`);
    this.writeToFile(`Working Directory: ${process.cwd()}\n\n`);
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private writeToFile(message: string): void {
    try {
      // Mask sensitive information before writing to file
      const maskedMessage = this.maskSensitiveInfo(message);
      fs.appendFileSync(this.logFile, maskedMessage);
    } catch (error) {
      // Fallback to console if file write fails
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Mask sensitive information in log messages
   */
  private maskSensitiveInfo(message: string): string {
    let maskedMessage = message;
    
    // Mask BrowserStack access keys
    maskedMessage = maskedMessage.replace(
      /"browserstack\.accessKey":\s*"[^"]+"/g,
      '"browserstack.accessKey": "***MASKED***"'
    );
    maskedMessage = maskedMessage.replace(
      /'browserstack\.accessKey':\s*'[^']+'/g,
      "'browserstack.accessKey': '***MASKED***'"
    );
    
    // Mask access keys in URLs or other contexts
    maskedMessage = maskedMessage.replace(
      /accessKey[=:]\s*[A-Za-z0-9+/=]{10,}/g,
      'accessKey=***MASKED***'
    );
    
    // Mask any long base64-like strings that might be credentials
    maskedMessage = maskedMessage.replace(
      /[A-Za-z0-9+/]{20,}={0,2}/g,
      (match) => {
        // Only mask if it looks like a credential (contains mixed case and numbers)
        if (/[a-z]/.test(match) && /[A-Z]/.test(match) && /[0-9]/.test(match)) {
          return '***MASKED***';
        }
        return match;
      }
    );
    
    // Mask SAUCE_ACCESS_KEY
    maskedMessage = maskedMessage.replace(
      /SAUCE_ACCESS_KEY[=:]\s*[A-Za-z0-9\-]+/g,
      'SAUCE_ACCESS_KEY=***MASKED***'
    );
    
    // Mask BROWSERSTACK_ACCESS_KEY  
    maskedMessage = maskedMessage.replace(
      /BROWSERSTACK_ACCESS_KEY[=:]\s*[A-Za-z0-9\-]+/g,
      'BROWSERSTACK_ACCESS_KEY=***MASKED***'
    );
    
    return maskedMessage;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const workerId = process.env.CUCUMBER_WORKER_ID || '0';
    let formatted = `[${timestamp}] [Worker-${workerId}] [${level}] ${message}`;
    
    if (data) {
      formatted += `\nData: ${JSON.stringify(data, null, 2)}`;
    }
    
    return formatted + '\n';
  }
  public debug(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      const formatted = this.formatMessage('DEBUG', message, data);
      this.writeToFile(formatted);
      
      if (this.consoleLogLevel <= LogLevel.DEBUG) {
        const maskedMessage = this.maskSensitiveInfo(message);
        const maskedData = data ? this.maskSensitiveInfo(JSON.stringify(data)) : '';
        console.log(`🔍 ${maskedMessage}`, maskedData || '');
      }
    }
  }

  public info(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.INFO) {
      const formatted = this.formatMessage('INFO', message, data);
      this.writeToFile(formatted);
      
      if (this.consoleLogLevel <= LogLevel.INFO) {
        const maskedMessage = this.maskSensitiveInfo(message);
        const maskedData = data ? this.maskSensitiveInfo(JSON.stringify(data)) : '';
        console.log(`ℹ️  ${maskedMessage}`, maskedData || '');
      }
    }
  }

  public warn(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.WARN) {
      const formatted = this.formatMessage('WARN', message, data);
      this.writeToFile(formatted);
      
      if (this.consoleLogLevel <= LogLevel.WARN) {
        const maskedMessage = this.maskSensitiveInfo(message);
        const maskedData = data ? this.maskSensitiveInfo(JSON.stringify(data)) : '';
        console.warn(`⚠️  ${maskedMessage}`, maskedData || '');
      }
    }
  }

  public error(message: string, error?: any): void {
    if (this.logLevel <= LogLevel.ERROR) {
      const formatted = this.formatMessage('ERROR', message, error);
      this.writeToFile(formatted);
      
      if (this.consoleLogLevel <= LogLevel.ERROR) {
        const maskedMessage = this.maskSensitiveInfo(message);
        const maskedError = error ? this.maskSensitiveInfo(JSON.stringify(error)) : '';
        console.error(`❌ ${maskedMessage}`, maskedError || '');
      }
    }
  }

  public test(message: string): void {
    // Show test progress on console only if level allows, write to file always
    if (this.consoleLogLevel <= LogLevel.INFO) {
      const maskedMessage = this.maskSensitiveInfo(message);
      console.log(`🧪 ${maskedMessage}`);
    }
    this.info(`TEST: ${message}`);
  }

  public success(message: string): void {
    // Show success on console only if level allows, write to file always
    if (this.consoleLogLevel <= LogLevel.INFO) {
      const maskedMessage = this.maskSensitiveInfo(message);
      console.log(`✅ ${maskedMessage}`);
    }
    this.info(`SUCCESS: ${message}`);
  }

  public cloud(message: string, data?: any): void {
    // Cloud operations - only to file unless error
    this.debug(`CLOUD: ${message}`, data);
  }

  public parallel(message: string): void {
    // Show parallel execution info only if level allows
    if (this.consoleLogLevel <= LogLevel.INFO) {
      console.log(`🔀 ${message}`);
    }
    this.info(`PARALLEL: ${message}`);
  }

  public setConsoleLogLevel(level: LogLevel): void {
    this.consoleLogLevel = level;
  }

  public setFileLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public getLogFilePath(): string {
    return this.logFile;
  }
}
