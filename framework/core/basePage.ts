import { Page, Locator } from '@playwright/test';
import { Logger } from '../utils/logger';
import { StepLogger } from '../utils/stepLogger';
import { LocatorUtility } from '../utils/locatorUtility';

export class BasePage {
  protected page: Page;
  protected logger: Logger;
  protected stepLogger: StepLogger;
  protected locatorUtility: LocatorUtility;

  constructor(page: Page, locatorFile: string = 'common') {
    this.page = page;
    this.logger = Logger.getInstance();
    this.stepLogger = StepLogger.getInstance();
    this.locatorUtility = new LocatorUtility(locatorFile, false);
    this.locatorUtility.setPage(page);
  }

  /**
   * Enhanced click with automatic logging and fallback
   */
  protected async clickElement(selector: string, options?: { timeout?: number; force?: boolean }): Promise<void> {
    const action = `Click on element`;
    this.stepLogger.logAction(action, selector);
    
    try {
      await this.locatorUtility.clickWithFallback(selector, options?.timeout, options?.force);
      this.logger.debug(`✅ Successfully clicked: ${selector}`);
    } catch (error) {
      this.stepLogger.logElementFailure(selector, action, error, true);
      throw error;
    }
  }

  /**
   * Enhanced fill with automatic logging and fallback
   */
  protected async fillElement(selector: string, value: string, options?: { timeout?: number; clear?: boolean }): Promise<void> {
    const action = `Fill element with value`;
    this.stepLogger.logAction(action, selector, value);
    
    try {
      await this.locatorUtility.fillWithFallback(selector, value, options?.timeout, options?.clear);
      this.logger.debug(`✅ Successfully filled: ${selector} with "${value}"`);
    } catch (error) {
      this.stepLogger.logElementFailure(selector, action, error, true);
      throw error;
    }
  }

  /**
   * Enhanced wait for element with logging
   */
  protected async waitForElement(selector: string, options?: { 
    state?: 'visible' | 'hidden' | 'attached' | 'detached';
    timeout?: number;
  }): Promise<Locator> {
    const condition = `Wait for element to be ${options?.state || 'visible'}`;
    const timeout = options?.timeout || 30000;
    
    try {
      const element = await this.locatorUtility.waitForElementWithFallback(
        selector, 
        options?.state || 'visible', 
        timeout
      );
      this.stepLogger.logWaitCondition(condition + `: ${selector}`, timeout, true);
      return element;
    } catch (error) {
      this.stepLogger.logWaitCondition(condition + `: ${selector}`, timeout, false);
      this.stepLogger.logElementFailure(selector, condition, error, true);
      throw error;
    }
  }

  /**
   * Enhanced text verification with logging
   */
  protected async verifyElementText(selector: string, expectedText: string, options?: { 
    timeout?: number; 
    exact?: boolean; 
  }): Promise<boolean> {
    this.stepLogger.logAssertion(`Verify element text`, expectedText);
    
    try {
      const element = await this.waitForElement(selector, { timeout: options?.timeout });
      const actualText = await element.textContent();
      
      const isMatch = options?.exact ? 
        actualText === expectedText : 
        actualText?.includes(expectedText) || false;
      
      this.stepLogger.logAssertion(`Text verification for ${selector}`, expectedText, actualText);
      
      if (isMatch) {
        this.logger.debug(`✅ Text verification passed: "${actualText}" ${options?.exact ? 'equals' : 'contains'} "${expectedText}"`);
      } else {
        this.logger.error(`❌ Text verification failed: Expected "${expectedText}", got "${actualText}"`);
      }
      
      return isMatch;
    } catch (error) {
      this.stepLogger.logElementFailure(selector, 'text verification', error);
      throw error;
    }
  }

  /**
   * Verifies text in elements with non-strict mode handling (can handle multiple matching elements)
   * This is especially useful for error messages where multiple elements might match the selector
   */
  protected async verifyElementTextNonStrict(selector: string, expectedText: string, options?: { 
    timeout?: number;
    exact?: boolean;
  }): Promise<boolean> {
    this.stepLogger.logAssertion(`Verify element text (non-strict)`, expectedText);
    
    try {
      // Get the locator string directly
      const locatorString = await this.locatorUtility.getLocator(selector);
      
      // Use page.$$ to get all matching elements without strict mode enforcement
      const elements = await this.page.$$(locatorString);
      
      if (elements.length === 0) {
        this.logger.debug(`❌ No elements found with selector: ${locatorString}`);
        return false;
      }
      
      this.logger.debug(`Found ${elements.length} potential elements matching: ${locatorString}`);
      
      // Check all matching elements for the text
      for (const element of elements) {
        if (!await element.isVisible()) continue;
        
        const actualText = await element.textContent();
        const isMatch = options?.exact ? 
          actualText === expectedText : 
          actualText?.includes(expectedText) || false;
        
        if (isMatch) {
          this.stepLogger.logAssertion(`Text verification for ${selector}`, expectedText, actualText);
          this.logger.debug(`✅ Text verification passed: "${actualText}" ${options?.exact ? 'equals' : 'contains'} "${expectedText}"`);
          return true;
        }
      }
      
      // If we get here, no matching element was found
      this.logger.warn(`⚠️ Elements found (${elements.length}) but none contain text: "${expectedText}"`);
      return false;
    } catch (error) {
      this.stepLogger.logElementFailure(selector, 'non-strict text verification', error);
      this.logger.debug(`❌ Text verification failed: ${error}`);
      return false;
    }
  }

  /**
   * Enhanced element visibility check with logging
   */
  protected async isElementVisible(selector: string, timeout: number = 5000): Promise<boolean> {
    try {
      await this.waitForElement(selector, { state: 'visible', timeout });
      this.logger.debug(`✅ Element is visible: ${selector}`);
      return true;
    } catch (error) {
      this.logger.debug(`ℹ️ Element not visible: ${selector}`);
      return false;
    }
  }

  /**
   * Get text content from an element
   * @param selector - Element selector key from YAML
   * @returns Text content or null if element not found
   */
  protected async getElementText(selector: string): Promise<string | null> {
    try {
      const element = await this.waitForElement(selector);
      const text = await element.textContent();
      this.logger.debug(`✅ Got text from element: ${selector} - "${text}"`);
      return text;
    } catch (error) {
      this.logger.error(`❌ Failed to get text from element: ${selector}`);
      return null;
    }
  }

  /**
   * Navigate with logging
   */
  protected async navigateTo(url: string): Promise<void> {
    this.stepLogger.logAction('Navigate to URL', url);
    
    try {
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
      const actualUrl = this.page.url();
      this.logger.debug(`✅ Successfully navigated to: ${actualUrl}`);
    } catch (error) {
      this.logger.error(`❌ Navigation failed to: ${url}`, error);
      throw error;
    }
  }

  /**
   * Get current page info for debugging
   */
  protected async getCurrentPageInfo(): Promise<{url: string; title: string; readyState: string}> {
    try {
      const url = this.page.url();
      const title = await this.page.title();
      const readyState = await this.page.evaluate(() => document.readyState);
      
      return { url, title, readyState };
    } catch (error) {
      this.logger.warn('Failed to get page info', error);
      return { url: 'unknown', title: 'unknown', readyState: 'unknown' };
    }
  }

  /**
   * Take screenshot for debugging
   */
  protected async takeDebugScreenshot(name: string): Promise<string | null> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `debug_${name}_${timestamp}.png`;
      const path = `test-results/screenshots/${filename}`;
      
      await this.page.screenshot({ path, fullPage: true });
      this.logger.debug(`Debug screenshot taken: ${path}`);
      return path;
    } catch (error) {
      this.logger.warn('Failed to take debug screenshot', error);
      return null;
    }
  }

  /**
   * Log element state for debugging
   */
  protected async logElementState(selector: string): Promise<void> {
    try {
      const element = this.page.locator(selector);
      const isVisible = await element.isVisible();
      const isEnabled = await element.isEnabled();
      const isAttached = await element.count() > 0;
      
      this.logger.debug(`Element State [${selector}]: Visible=${isVisible}, Enabled=${isEnabled}, Attached=${isAttached}`);
      
      if (isAttached) {
        try {
          const boundingBox = await element.boundingBox();
          this.logger.debug(`Element Position [${selector}]: ${JSON.stringify(boundingBox)}`);
        } catch (e) {
          // Ignore if we can't get bounding box
        }
      }
    } catch (error) {
      this.logger.debug(`Could not get element state for: ${selector}`);
    }
  }

  /**
   * Gets text content from multiple elements that match a selector
   * Returns an array of text values from visible elements
   */
  protected async getMultipleElementsText(selector: string): Promise<string[]> {
    try {
      const locatorString = await this.locatorUtility.getLocator(selector);
      const elements = await this.page.$$(locatorString);
      
      const textContents: string[] = [];
      
      for (const element of elements) {
        if (await element.isVisible()) {
          const text = await element.textContent();
          if (text !== null) {
            textContents.push(text);
          }
        }
      }
      
      return textContents;
    } catch (error) {
      this.logger.warn(`Failed to get text from multiple elements: ${error}`);
      return [];
    }
  }

  /**
   * Checks if any element matching the selector contains the expected text
   * Safer than verifyElementText when multiple elements might match the selector
   */
  protected async hasElementWithText(selector: string, text: string): Promise<boolean> {
    const textContents = await this.getMultipleElementsText(selector);
    return textContents.some(content => content.includes(text));
  }

  /**
   * Wait for a condition to be true with polling
   * Useful for custom waiting conditions that aren't directly supported by Playwright
   */
  protected async waitForCondition(
    conditionFn: () => Promise<boolean>,
    options?: {
      timeout?: number;
      pollingInterval?: number;
      timeoutMessage?: string;
    }
  ): Promise<boolean> {
    const timeout = options?.timeout || 30000;
    const pollingInterval = options?.pollingInterval || 500;
    const timeoutMessage = options?.timeoutMessage || 'Condition not met within timeout period';
    
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (await conditionFn()) {
        return true;
      }
      await this.page.waitForTimeout(pollingInterval);
    }
    
    this.logger.warn(timeoutMessage);
    return false;
  }

  /**
   * Take a screenshot with automatic directory creation and logging
   */
  protected async screenshot(name: string): Promise<string | null> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${name}_${timestamp}.png`;
      const path = `test-results/screenshots/${filename}`;
      
      await this.page.screenshot({ path, fullPage: true });
      this.logger.debug(`Screenshot taken: ${path}`);
      return path;
    } catch (error) {
      this.logger.warn(`Failed to take screenshot: ${error}`);
      return null;
    }
  }

  /**
   * Find specific text within elements that match a selector
   * @param selector Locator key from YAML file
   * @param expectedText Optional specific text to look for
   * @param options Additional options for the search
   * @returns The text content that matches the expected text, or the first text content found, or null if not found
   */
  protected async findSpecificText(
    selector: string, 
    expectedText?: string, 
    options?: { waitForElement?: boolean; timeout?: number }
  ): Promise<string | null> {
    try {
      const waitForElement = options?.waitForElement !== false;
      const timeout = options?.timeout || 1000;
      
      const locatorString = await this.locatorUtility.getLocator(selector);
      
      // If waitForElement is true, wait for the selector to appear
      if (waitForElement) {
        try {
          await this.page.waitForSelector(locatorString, { 
            state: 'attached', 
            timeout 
          });
        } catch (e) {
          // Ignore timeout errors, we'll check for elements anyway
          this.logger.debug(`Warning: Timeout waiting for selector: ${selector}`);
        }
      }
      
      const elements = await this.page.$$(locatorString);
      
      if (elements.length === 0) {
        this.logger.debug(`No elements found matching selector: ${selector}`);
        return null;
      }
      
      // If an expected text is provided, look for that specific text
      if (expectedText) {
        for (const element of elements) {
          if (!await element.isVisible()) continue;
          
          const textContent = await element.textContent();
          if (textContent && textContent.includes(expectedText)) {
            this.logger.debug(`Found element with specific text: "${textContent}"`);
            return textContent;
          }
        }
        
        this.logger.debug(`No elements found with the expected text: "${expectedText}"`);
        return null;
      } 
      
      // If no expected text is provided, return the first visible element's text
      for (const element of elements) {
        if (!await element.isVisible()) continue;
        
        const textContent = await element.textContent();
        if (textContent && textContent.trim()) {
          this.logger.debug(`Found element with text: "${textContent}"`);
          return textContent;
        }
      }
      
      this.logger.debug(`No visible elements with text found for selector: ${selector}`);
      return null;
    } catch (error) {
      this.logger.warn(`Error finding specific text: ${error}`);
      return null;
    }
  }

  /**
   * Wait for a specific amount of time
   * @param milliseconds Time to wait in milliseconds
   * @param reason Optional reason for waiting, used for logging
   */
  protected async waitForTime(milliseconds: number, reason?: string): Promise<void> {
    const reasonText = reason ? ` (${reason})` : '';
    this.logger.debug(`Waiting for ${milliseconds}ms${reasonText}`);
    
    await this.page.waitForTimeout(milliseconds);
    
    this.logger.debug(`✅ Wait completed: ${milliseconds}ms${reasonText}`);
  }

  /**
   * Get full page source for AI healing analysis
   * @returns Promise<string> Complete HTML source of the current page
   */
  public async getPageSource(): Promise<string> {
    try {
      this.logger.debug('📄 Extracting page source for AI analysis');
      const htmlContent = await this.page.content();
      this.logger.debug(`✅ Page source extracted: ${htmlContent.length} characters`);
      return htmlContent;
    } catch (error) {
      this.logger.error('Failed to extract page source for AI healing', error);
      throw error;
    }
  }

  /**
   * Get current page context for AI healing
   * @returns Promise<PageContext> Page context information
   */
  public async getPageContext(): Promise<{
    url: string;
    title: string;
    viewport: { width: number; height: number } | null;
    timestamp: string;
  }> {
    try {
      const context = {
        url: this.page.url(),
        title: await this.page.title(),
        viewport: this.page.viewportSize(),
        timestamp: new Date().toISOString()
      };
      
      this.logger.debug('📊 Page context extracted:', context);
      return context;
    } catch (error) {
      this.logger.error('Failed to extract page context', error);
      throw error;
    }
  }

  /**
   * Enhanced element interaction with automatic retry and AI fallback
   * This method can be used when traditional locator methods fail
   */
  protected async performActionWithAIFallback(
    elementKey: string, 
    action: 'click' | 'fill' | 'wait',
    value?: string,
    options?: any
  ): Promise<void> {
    try {
      // First try with traditional locator utility
      switch (action) {
        case 'click':
          await this.clickElement(elementKey, options);
          break;
        case 'fill':
          if (value !== undefined) {
            await this.fillElement(elementKey, value, options);
          }
          break;
        case 'wait':
          await this.locatorUtility.waitForElementWithFallback(elementKey, options?.state || 'visible', options?.timeout);
          break;
      }
    } catch (error) {
      this.logger.warn(`Traditional ${action} failed for ${elementKey}, AI fallback may be triggered by LocatorUtility`);
      throw error; // Let LocatorUtility handle AI fallback
    }
  }

}
