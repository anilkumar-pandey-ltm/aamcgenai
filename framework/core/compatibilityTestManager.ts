import { Browser } from 'playwright';
import { CloudProviderFactory } from '../core/cloudProviderFactory';
import { getConfig, getBrowserCombination, getParallelWorkerInfo } from '../utils/configUtility';
import { setSessionName, updateSessionStatus } from '../utils/browserstackRestApi';

export interface CompatibilityTestContext {
  browser: Browser;
  browserCombination: string;
  sessionId?: string;
}

export class CompatibilityTestManager {
  private static instance: CompatibilityTestManager;
  private cloudFactory: CloudProviderFactory;
  private config = getConfig();

  private constructor() {
    this.cloudFactory = new CloudProviderFactory();
  }

  public static getInstance(): CompatibilityTestManager {
    if (!CompatibilityTestManager.instance) {
      CompatibilityTestManager.instance = new CompatibilityTestManager();
    }
    return CompatibilityTestManager.instance;
  }

  /**
   * Determines if compatibility testing is enabled and returns browser combinations to test
   */
  public getCompatibilityBrowsers(): string[] {
    const config = getConfig();
    
    if (!config.compatibility.enabled) {
      // Return current browser combination from environment or default
      return [process.env.BROWSER_COMBINATION || 'windows-chrome'];
    }
    
    return config.compatibility.browsers;
  }

  /**
   * Creates browser instances for compatibility testing
   * If compatibility is disabled, returns single browser instance
   */
  public async createCompatibilityBrowsers(testName: string): Promise<CompatibilityTestContext[]> {
    const browserCombinations = this.getCompatibilityBrowsers();
    const parallelInfo = getParallelWorkerInfo();
    
    console.log(`🧪 Compatibility Testing: ${this.config.compatibility.enabled ? 'ENABLED' : 'DISABLED'}`);
    console.log(`🌐 Testing on browsers: ${browserCombinations.join(', ')}`);
    
    const contexts: CompatibilityTestContext[] = [];
    
    for (const combination of browserCombinations) {
      try {
        console.log(`🚀 Creating browser instance for: ${combination}`);
        
        // Set environment variable for this specific browser combination
        process.env.BROWSER_COMBINATION = combination;
        
        // Create browser instance
        const browser = await this.cloudFactory.createBrowser();
        
        // Create enhanced session name with browser and worker info
        let sessionName = testName;
        if (this.config.compatibility.enabled && browserCombinations.length > 1) {
          const browserInfo = getBrowserCombination(combination);
          const browserDisplay = browserInfo ? `${browserInfo.browserName.toUpperCase()}` : combination.toUpperCase();
          sessionName = `${testName} [${browserDisplay}]`;
        }
        
        if (parallelInfo.isParallel) {
          sessionName += ` ${parallelInfo.displayText}`;
        }
        
        const context: CompatibilityTestContext = {
          browser,
          browserCombination: combination,
        };
        
        // Set up BrowserStack session if using BrowserStack
        if (this.config.execution.environment === 'browserstack') {
          try {
            const sessionId = await this.setupBrowserStackSession(browser, sessionName);
            context.sessionId = sessionId;
            console.log(`✅ BrowserStack session created for: "${sessionName}"`);
          } catch (error) {
            console.warn(`⚠️ Failed to set up BrowserStack session for ${combination}:`, error);
          }
        }
        
        contexts.push(context);
        
      } catch (error) {
        console.error(`❌ Failed to create browser for ${combination}:`, error);
        // Continue with other browsers
      }
    }
    
    if (contexts.length === 0) {
      throw new Error('Failed to create any browser instances for compatibility testing');
    }
    
    console.log(`✅ Created ${contexts.length} browser instance(s) for compatibility testing`);
    return contexts;
  }

  /**
   * Runs a test function on all compatibility browsers in parallel or sequential mode
   */
  public async runCompatibilityTest<T>(
    testName: string,
    testFunction: (context: CompatibilityTestContext) => Promise<T>
  ): Promise<T[]> {
    const contexts = await this.createCompatibilityBrowsers(testName);
    
    try {
      let results: T[];
      
      if (this.config.compatibility.mode === 'parallel' && contexts.length > 1) {
        console.log(`🔀 Running compatibility test in PARALLEL mode on ${contexts.length} browsers`);
        results = await Promise.all(contexts.map(context => testFunction(context)));
      } else {
        console.log(`➡️ Running compatibility test in SEQUENTIAL mode on ${contexts.length} browsers`);
        results = [];
        for (const context of contexts) {
          const result = await testFunction(context);
          results.push(result);
        }
      }
      
      // Mark all sessions as passed
      await this.updateAllSessionsStatus(contexts, 'passed', 'Test completed successfully');
      
      return results;
      
    } catch (error) {
      // Mark all sessions as failed
      await this.updateAllSessionsStatus(contexts, 'failed', `Test failed: ${error}`);
      throw error;
      
    } finally {
      // Clean up all browser instances
      await this.cleanupCompatibilityBrowsers(contexts);
    }
  }

  /**
   * Sets up BrowserStack session for a browser instance
   */
  private async setupBrowserStackSession(browser: Browser, sessionName: string): Promise<string | undefined> {
    try {
      const sessionId = await setSessionName(browser, sessionName);
      return sessionId;
    } catch (error) {
      console.warn('Failed to set up BrowserStack session:', error);
      return undefined;
    }
  }

  /**
   * Updates session status for all browser contexts
   */
  private async updateAllSessionsStatus(
    contexts: CompatibilityTestContext[],
    status: 'passed' | 'failed',
    reason: string
  ): Promise<void> {
    if (this.config.execution.environment !== 'browserstack') {
      return;
    }
    
    const updatePromises = contexts
      .filter(context => context.sessionId)
      .map(context => {
        return updateSessionStatus(context.sessionId!, status, reason)
          .catch(error => {
            console.warn(`Failed to update session status for ${context.browserCombination}:`, error);
          });
      });
    
    await Promise.all(updatePromises);
  }

  /**
   * Cleans up all browser instances
   */
  private async cleanupCompatibilityBrowsers(contexts: CompatibilityTestContext[]): Promise<void> {
    console.log(`🧹 Cleaning up ${contexts.length} browser instance(s)`);
    
    const cleanupPromises = contexts.map(async (context) => {
      try {
        await context.browser.close();
        console.log(`✅ Browser cleanup completed for: ${context.browserCombination}`);
      } catch (error) {
        console.warn(`⚠️ Failed to cleanup browser for ${context.browserCombination}:`, error);
      }
    });
    
    await Promise.all(cleanupPromises);
  }

  /**
   * Check if compatibility testing is enabled
   */
  public isCompatibilityTestingEnabled(): boolean {
    return this.config.compatibility.enabled;
  }

  /**
   * Get compatibility testing mode
   */
  public getCompatibilityMode(): 'parallel' | 'sequential' {
    return this.config.compatibility.mode;
  }
}
