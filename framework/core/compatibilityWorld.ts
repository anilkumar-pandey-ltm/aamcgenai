import { setWorldConstructor, World } from '@cucumber/cucumber';
import { Page, BrowserContext } from 'playwright';
import { CompatibilityTestManager, CompatibilityTestContext } from '../core/compatibilityTestManager';

export interface CompatibilityWorld extends World {
  compatibilityContexts: CompatibilityTestContext[];
  page: Page;
  context: BrowserContext;
  
  // Compatibility testing methods
  runOnAllBrowsers<T>(testFunction: (page: Page, context: BrowserContext) => Promise<T>): Promise<T[]>;
  getCurrentBrowserInfo(): string;
}

class FusionIQWorld extends World implements CompatibilityWorld {
  public compatibilityContexts: CompatibilityTestContext[] = [];
  public page!: Page;
  public context!: BrowserContext;
  
  private compatibilityManager = CompatibilityTestManager.getInstance();

  /**
   * Initialize compatibility testing contexts for a scenario
   */
  async initializeCompatibilityContexts(scenarioName: string): Promise<void> {
    this.compatibilityContexts = await this.compatibilityManager.createCompatibilityBrowsers(scenarioName);
    
    // Set the first context as the primary one for backward compatibility
    if (this.compatibilityContexts.length > 0) {
      const primaryContext = this.compatibilityContexts[0];
      this.context = await primaryContext.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
        bypassCSP: true
      });
      this.page = await this.context.newPage();
      
      // Set up basic page configurations
      await this.page.setDefaultTimeout(30000);
      await this.page.setDefaultNavigationTimeout(30000);
    }
  }

  /**
   * Run a test function on all browser contexts
   */
  async runOnAllBrowsers<T>(testFunction: (page: Page, context: BrowserContext) => Promise<T>): Promise<T[]> {
    const results: T[] = [];
    
    for (const compatContext of this.compatibilityContexts) {
      try {
        // Create a fresh context for each browser
        const context = await compatContext.browser.newContext({
          viewport: { width: 1920, height: 1080 },
          ignoreHTTPSErrors: true,
          bypassCSP: true
        });
        
        const page = await context.newPage();
        await page.setDefaultTimeout(30000);
        await page.setDefaultNavigationTimeout(30000);
        
        console.log(`🧪 Running test on: ${compatContext.browserCombination}`);
        
        // Execute the test function
        const result = await testFunction(page, context);
        results.push(result);
        
        // Clean up this context
        await page.close();
        await context.close();
        
        console.log(`✅ Test completed on: ${compatContext.browserCombination}`);
        
      } catch (error) {
        console.error(`❌ Test failed on ${compatContext.browserCombination}:`, error);
        throw new Error(`Test failed on ${compatContext.browserCombination}: ${error}`);
      }
    }
    
    return results;
  }

  /**
   * Get current browser information
   */
  getCurrentBrowserInfo(): string {
    if (this.compatibilityContexts.length > 0) {
      return this.compatibilityContexts.map(ctx => ctx.browserCombination).join(', ');
    }
    return 'Unknown';
  }

  /**
   * Clean up all compatibility contexts
   */
  async cleanupCompatibilityContexts(): Promise<void> {
    // Close primary context
    if (this.page && !this.page.isClosed()) {
      await this.page.close();
    }
    if (this.context) {
      await this.context.close();
    }
    
    // Close all browser instances
    for (const compatContext of this.compatibilityContexts) {
      try {
        await compatContext.browser.close();
      } catch (error) {
        console.warn(`Failed to close browser for ${compatContext.browserCombination}:`, error);
      }
    }
    
    this.compatibilityContexts = [];
  }
}

setWorldConstructor(FusionIQWorld);
