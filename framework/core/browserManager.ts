import { Browser, Page, BrowserContext } from 'playwright';
import { CloudProviderFactory } from './cloudProviderFactory';
import { getConfig } from '../utils/configUtility';
import * as fs from 'fs';
import * as path from 'path';

export class BrowserManager {
  private static instance: BrowserManager;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private cloudProvider: CloudProviderFactory;
  private activeSessions: Set<Page> = new Set();
  private activeContexts: Set<BrowserContext> = new Set(); // Track contexts for cleanup

  private constructor() {
    this.cloudProvider = new CloudProviderFactory();
  }
  static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  /**
   * Create a new independent instance for BrowserStack scenario isolation
   * This bypasses the singleton pattern to create separate browser instances
   */
  static createNewInstance(): BrowserManager {
    return new BrowserManager();
  }async initializeBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }
    
    const config = getConfig();
    this.browser = await this.cloudProvider.createBrowser(config);
    
    // Create a persistent context with BrowserStack-compatible options
    try {
      const contextOptions: any = {
        viewport: { width: 1920, height: 1080 },
      };
      
      // Only add video recording for local environment to avoid BrowserStack conflicts
      if (config.execution.environment === 'local') {
        contextOptions.recordVideo = { dir: './test-results/videos/' };
      }
      
      // For BrowserStack, add compatibility options
      if (config.execution.environment === 'browserstack') {
        contextOptions.bypassCSP = true;
        contextOptions.ignoreHTTPSErrors = true;
      }
      
      this.context = await this.browser.newContext(contextOptions);
        } catch (contextError) {
      const errorMessage = contextError instanceof Error ? contextError.message : String(contextError);
      console.warn('⚠ Context creation failed, using fallback approach:', errorMessage);
      // Fallback: try with minimal options
      try {
        this.context = await this.browser.newContext({
          bypassCSP: true,
          ignoreHTTPSErrors: true
        });
      } catch (fallbackError) {
        const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        console.error('❌ Both context creation attempts failed:', fallbackMessage);
        throw fallbackError;
      }
    }
    
    return this.browser;
  }
  async createPage(): Promise<Page> {
    if (!this.context) {
      await this.initializeBrowser();
    }
    
    const page = await this.context!.newPage();
    this.activeSessions.add(page);
    
    // Set up basic page configurations
    await page.setDefaultTimeout(30000);
    await page.setDefaultNavigationTimeout(30000);
    
    return page;
  }

  /**
   * Create a new browser context specifically for BrowserStack session isolation
   * Each context represents a separate BrowserStack session
   */
  async createNewContext(sessionName: string = 'Test Session'): Promise<BrowserContext> {
    if (!this.browser) {
      await this.initializeBrowser();
    }

    const config = getConfig();
    
    // Create context options based on environment
    const contextOptions: any = {
      viewport: { width: 1920, height: 1080 },
    };
    
    // Only add video recording for local environment to avoid BrowserStack conflicts
    if (config.execution.environment === 'local') {
      contextOptions.recordVideo = { dir: './test-results/videos/' };
    }
    
    // For BrowserStack, add compatibility options
    if (config.execution.environment === 'browserstack') {
      contextOptions.bypassCSP = true;
      contextOptions.ignoreHTTPSErrors = true;
      
      // Add session-specific metadata for BrowserStack
      contextOptions.extraHTTPHeaders = {
        'X-BrowserStack-SessionName': sessionName,
        'X-BrowserStack-TestName': sessionName
      };
    }

    console.log(`🆕 Creating new context for: "${sessionName}"`);
    const newContext = await this.browser!.newContext(contextOptions);
    this.activeContexts.add(newContext);
    
    return newContext;
  }

  public async createBrowserContext(): Promise<BrowserContext> {
    if (!this.browser) {
      throw new Error('Browser not launched. Call launchBrowser() first.');
    }

    const config = getConfig();
    
    // Prepare context options
    const contextOptions: any = {
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
    };

    // Add video recording configuration if enabled
    if (this.shouldRecordVideo()) {
      const videoDir = path.join(process.cwd(), 'test-results', 'videos');
      
      // Ensure video directory exists
      if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
      }

      contextOptions.recordVideo = {
        dir: videoDir,
        size: this.getVideoSize()
      };

      console.log(`✅ Video recording enabled - saving to: ${videoDir}`);
    }

    const context = await this.browser.newContext(contextOptions);
    return context;
  }

  private shouldRecordVideo(): boolean {
    const config = getConfig();
    
    // Check environment variable first (highest priority)
    const envVideoSetting = process.env.LOCAL_RECORD_VIDEO;
    if (envVideoSetting) {
      return envVideoSetting === 'all' || envVideoSetting === 'failures';
    }

    // Check config file setting
    const localRecordVideo = config.localRecordVideo || 'off';
    return localRecordVideo === 'all' || localRecordVideo === 'failures';
  }

  private getVideoSize(): { width: number; height: number } {
    const config = getConfig();
    const sizeString = config.recording?.size || '1920x1080';
    const [width, height] = sizeString.split('x').map(Number);
    return { width: width || 1920, height: height || 1080 };
  }

  async closePage(page: Page): Promise<void> {
    if (this.activeSessions.has(page)) {
      await page.close();
      this.activeSessions.delete(page);
    }
  }async markTestResult(status: 'passed' | 'failed', reason?: string): Promise<void> {
    // Test result marking is handled by cloud providers if needed
  }  async cleanup(): Promise<void> {
    // Close all active pages
    for (const page of this.activeSessions) {
      try {
        await page.close();
      } catch (error) {
        // Silent cleanup
      }
    }
    this.activeSessions.clear();

    // Close all active contexts (for BrowserStack session isolation)
    for (const context of this.activeContexts) {
      try {
        await context.close();
      } catch (error) {
        // Silent cleanup
      }
    }
    this.activeContexts.clear();

    // Close main context
    if (this.context) {
      try {
        await this.context.close();
        this.context = null;
      } catch (error) {
        // Silent cleanup
      }
    }

    // Close browser
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
      } catch (error) {
        // Silent cleanup
      }
    }
  }

  getBrowser(): Browser | null {
    return this.browser;
  }

  getContext(): BrowserContext | null {
    return this.context;
  }

  getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  getActiveContextsCount(): number {
    return this.activeContexts.size;
  }
}
