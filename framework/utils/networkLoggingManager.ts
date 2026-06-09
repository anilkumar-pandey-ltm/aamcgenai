import { Page, Request, Response } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

const logger = Logger.getInstance();

interface NetworkLog {
  url: string;
  method: string;
  status?: number;
  timestamp: string;
  type: 'request' | 'response';
  headers?: Record<string, string>;
  body?: string;
}

interface DebuggingConfig {
  networkLogging: boolean;
  networkLogs: boolean;
  performanceMetrics: boolean;
  screenshots: boolean;
  harFiles: boolean;
  consoleCapture: boolean;
  screenshotOnError: boolean;
  pageSource: boolean;
  slowMotion: number;
}

export class NetworkLoggingManager {
  private static instance: NetworkLoggingManager;
  private networkLogs: NetworkLog[] = [];
  private logDirectory: string;
  private screenshotDirectory: string;
  private debuggingConfig: DebuggingConfig;

  private constructor() {
    this.logDirectory = path.join(process.cwd(), 'test-results', 'network-logs');
    this.screenshotDirectory = path.join(process.cwd(), 'test-results', 'screenshots');
    this.debuggingConfig = {
      networkLogging: true,
      networkLogs: true,
      performanceMetrics: true,
      screenshots: true,
      harFiles: true,
      consoleCapture: true,
      screenshotOnError: true,
      pageSource: true,
      slowMotion: 0
    };
    this.ensureDirectoriesExist();
    logger.debug('NetworkLoggingManager initialized');
    logger.debug(`Log directory: ${this.logDirectory}`);
    logger.debug(`Screenshot directory: ${this.screenshotDirectory}`);
  }

  public static getInstance(): NetworkLoggingManager {
    if (!NetworkLoggingManager.instance) {
      NetworkLoggingManager.instance = new NetworkLoggingManager();
    }
    return NetworkLoggingManager.instance;
  }

  public getDebuggingStatus(): DebuggingConfig {
    return this.debuggingConfig;
  }

  private ensureDirectoriesExist(): void {
    const directories = [
      path.join(process.cwd(), 'test-results'),
      this.logDirectory,
      this.screenshotDirectory,
      path.join(process.cwd(), 'test-results', 'performance-metrics'),
      path.join(process.cwd(), 'test-results', 'page-sources'),
      path.join(process.cwd(), 'test-results', 'videos'),
      path.join(process.cwd(), 'test-results', 'logs')
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    });
  }

  public async enableNetworkLogging(page: Page): Promise<void> {
    page.on('request', (request: Request) => {
      this.networkLogs.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString(),
        type: 'request',
        headers: request.headers(),
        body: request.postData() || undefined
      });
    });

    page.on('response', (response: Response) => {
      this.networkLogs.push({
        url: response.url(),
        method: response.request().method(),
        status: response.status(),
        timestamp: new Date().toISOString(),
        type: 'response',
        headers: response.headers()
      });
    });
  }

  public async initializeNetworkLogging(page: Page, testName: string): Promise<void> {
    console.log(`Initializing network logging for test: ${testName}`);
    await this.enableNetworkLogging(page);
  }

  public async saveNetworkLogs(testName: string, testPassed: boolean): Promise<void> {
    if (!this.debuggingConfig.networkLogs) {
      console.log('ℹ️  Network logs saving is disabled');
      return;
    }

    const sanitizedTestName = testName.replace(/[^a-zA-Z0-9\-_]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${sanitizedTestName}_${timestamp}.json`;
    const filePath = path.join(this.logDirectory, fileName);

    const logData = {
      testName,
      testPassed,
      timestamp: new Date().toISOString(),
      totalRequests: this.networkLogs.filter(log => log.type === 'request').length,
      totalResponses: this.networkLogs.filter(log => log.type === 'response').length,
      logs: this.networkLogs
    };

    try {
      this.ensureDirectoriesExist();
      
      fs.writeFileSync(filePath, JSON.stringify(logData, null, 2));
      console.log(`✅ Network logs saved to: ${filePath}`);
      console.log(`   📊 Total network logs captured: ${this.networkLogs.length}`);
      
      const fileStats = fs.statSync(filePath);
      console.log(`   📁 File size: ${(fileStats.size / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.error('❌ Failed to save network logs:', error);
      console.error(`   📂 Attempted file path: ${filePath}`);
    }
  }

  public async saveHarFile(page: Page, testName: string): Promise<void> {
    if (!this.debuggingConfig.harFiles) {
      console.log('ℹ️  HAR file saving is disabled');
      return;
    }

    const sanitizedTestName = testName.replace(/[^a-zA-Z0-9\-_]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${sanitizedTestName}_${timestamp}.har`;
    const filePath = path.join(this.logDirectory, fileName);

    try {
      this.ensureDirectoriesExist();

      const harData = {
        log: {
          version: "1.2",
          creator: {
            name: "Playwright Framework",
            version: "1.0.0"
          },
          browser: {
            name: "Playwright",
            version: "1.0.0"
          },
          pages: [{
            startedDateTime: new Date().toISOString(),
            id: "page_1",
            title: testName,
            pageTimings: {}
          }],
          entries: this.networkLogs.map(log => ({
            pageref: "page_1",
            startedDateTime: log.timestamp,
            time: 0,
            request: {
              method: log.method,
              url: log.url,
              httpVersion: "HTTP/1.1",
              headers: Object.entries(log.headers || {}).map(([name, value]) => ({ name, value })),
              queryString: [],
              cookies: [],
              headersSize: -1,
              bodySize: log.body ? log.body.length : 0,
              postData: log.body ? { mimeType: "application/json", text: log.body } : undefined
            },
            response: log.type === 'response' ? {
              status: log.status || 0,
              statusText: "",
              httpVersion: "HTTP/1.1",
              headers: Object.entries(log.headers || {}).map(([name, value]) => ({ name, value })),
              cookies: [],
              content: { size: 0, mimeType: "text/html" },
              redirectURL: "",
              headersSize: -1,
              bodySize: -1
            } : undefined,
            cache: {},
            timings: {
              send: 0,
              wait: 0,
              receive: 0
            }
          }))
        }
      };
      
      fs.writeFileSync(filePath, JSON.stringify(harData, null, 2));
      console.log(`✅ HAR file saved to: ${filePath}`);
      
      const fileStats = fs.statSync(filePath);
      console.log(`   📁 File size: ${(fileStats.size / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.error('❌ Failed to save HAR file:', error);
      console.error(`   📂 Attempted file path: ${filePath}`);
    }
  }

  public async collectPerformanceMetrics(page: Page): Promise<void> {
    if (!this.debuggingConfig.performanceMetrics) {
      console.log('Performance metrics collection is disabled');
      return;
    }

    try {
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        return {
          loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
          domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
          firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        };
      });

      const metricsDirectory = path.join(process.cwd(), 'test-results', 'performance-metrics');
      if (!fs.existsSync(metricsDirectory)) {
        fs.mkdirSync(metricsDirectory, { recursive: true });
        console.log(`Created performance metrics directory: ${metricsDirectory}`);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `performance_metrics_${timestamp}.json`;
      const filePath = path.join(metricsDirectory, fileName);

      fs.writeFileSync(filePath, JSON.stringify(performanceMetrics, null, 2));
      console.log(`✅ Performance metrics saved successfully to: ${filePath}`);
      console.log(`   - Load time: ${performanceMetrics.loadTime}ms`);
      console.log(`   - DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
    } catch (error) {
      console.error('❌ Failed to collect performance metrics:', error);
    }
  }

  public async takeErrorScreenshot(page: Page, testName: string, errorMessage: string): Promise<void> {
    const sanitizedTestName = testName.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `error_${sanitizedTestName}_${timestamp}.png`;
    const filePath = path.join(this.screenshotDirectory, fileName);

    try {
      await page.screenshot({ 
        path: filePath, 
        fullPage: true 
      });
      console.log(`Error screenshot saved to: ${filePath}`);
      console.log(`Error message: ${errorMessage}`);
    } catch (error) {
      console.error('Failed to take error screenshot:', error);
    }
  }

  public async savePageSource(page: Page, testName: string): Promise<void> {
    if (!this.debuggingConfig.pageSource) {
      console.log('ℹ️  Page source saving is disabled');
      return;
    }

    const sanitizedTestName = testName.replace(/[^a-zA-Z0-9\-_]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `page_source_${sanitizedTestName}_${timestamp}.html`;
    const sourceDirectory = path.join(process.cwd(), 'test-results', 'page-sources');
    
    try {
      if (!fs.existsSync(sourceDirectory)) {
        fs.mkdirSync(sourceDirectory, { recursive: true });
      }
      
      const filePath = path.join(sourceDirectory, fileName);
      const pageSource = await page.content();
      
      fs.writeFileSync(filePath, pageSource);
      console.log(`✅ Page source saved to: ${filePath}`);
    } catch (error) {
      console.error('❌ Failed to save page source:', error);
    }
  }

  public clearLogs(): void {
    const logCount = this.networkLogs.length;
    this.networkLogs = [];
    console.log(`✅ Network logs cleared (${logCount} logs removed)`);
  }

  // Add a method to manually trigger file generation for testing
  public async generateTestFiles(page: Page): Promise<void> {
    const testName = 'manual_test_generation';
    console.log('🧪 Generating test files manually...');
    
    // Add some dummy network logs if none exist
    if (this.networkLogs.length === 0) {
      this.networkLogs.push({
        url: 'https://example.com/test',
        method: 'GET',
        timestamp: new Date().toISOString(),
        type: 'request',
        headers: { 'User-Agent': 'Test' }
      });
    }

    await this.saveNetworkLogs(testName, true);
    await this.saveHarFile(page, testName);
    await this.collectPerformanceMetrics(page);
    
    console.log('🧪 Test file generation completed');
  }
}
