/// <reference path="../types/global.d.ts" />

import * as yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';
import { Page } from '@playwright/test';
import { Logger } from './logger';
import { DOMSnapshotCapture } from './domSnapshotCapture';
import { AILocatorService } from '../services/aiLocatorService';
import { AILocatorCache } from './aiLocatorCache';
import { getConfig } from './configUtility';
import { 
  FailedLocatorData, 
  HealingSuggestion, 
  AIHealingError 
} from '../types/aiHealing';

export class LocatorUtility {
  private locators: any;
  private debugMode: boolean;
  private logger: Logger;
  private domSnapshotCapture: DOMSnapshotCapture;
  private page: Page | null = null;
  private aiService: AILocatorService;
  private aiCache: AILocatorCache;
  
  constructor(locatorFilePath: string, debugMode: boolean = false) {
    this.debugMode = debugMode;
    this.logger = Logger.getInstance();
    this.domSnapshotCapture = DOMSnapshotCapture.getInstance();
    this.aiService = AILocatorService.getInstance();
    this.aiCache = AILocatorCache.getInstance();
    
    // Force console log level to ensure we see logs (temporary debug)
    this.logger.setConsoleLogLevel(0); // DEBUG level
    
    // Test log to verify logger is working
    console.log('🔧 LocatorUtility: Constructor called with debugMode:', debugMode);
    this.logger.info('🔧 LocatorUtility: Logger initialized successfully');
    
    const resolvedPath = path.resolve(__dirname, '../../tests/locators', `${locatorFilePath}.yaml`);
    
    if (this.debugMode) {
      this.logger.debug(`Resolved locator file path: ${resolvedPath}`);
    }
    
    if (!fs.existsSync(resolvedPath)) {
      const errorMessage = `Locator file not found: ${resolvedPath}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    try {
      this.locators = yaml.parse(fs.readFileSync(resolvedPath, 'utf8'));
      if (this.debugMode) {
        this.logger.debug('Parsed YAML content:', this.locators);
      }
    } catch (error) {
      const errorMessage = `Failed to parse YAML file: ${resolvedPath}`;
      this.logger.error(errorMessage, error);
      throw new Error(`${errorMessage}. ${error}`);
    }
  }

  /**
   * Sets the current page context for the locator utility
   * @param page The Playwright page instance
   */
  public setPage(page: Page): void {
    this.page = page;
  }

  async getLocator(key: string, page?: Page): Promise<string> {
    // Use provided page or fallback to this.page
    const targetPage = page || this.page;
    if (!targetPage) {
      throw new Error('No page instance available for locator operations. Use setPage() or provide page parameter.');
    }
    
    console.log(`🔍 LocatorUtility: Getting locator for key: ${key}`);
    this.logger.info(`🔍 Getting locator for key: ${key}`);
    
    // Check cache first if AI healing is enabled
    if (this.aiService.isEnabled() && this.aiCache.isCached(key)) {
      const cachedLocator = this.aiCache.getFromCache(key);
      if (cachedLocator) {
        this.logger.info(`🎯 Using cached locator for '${key}': ${cachedLocator.locator}`);
        try {
          await targetPage.waitForSelector(cachedLocator.locator, { timeout: 1000 });
          return cachedLocator.locator;
        } catch (error) {
          this.logger.warn(`❌ Cached locator for '${key}' no longer works, removing from cache`);
          this.aiCache.removeFromCache(key);
        }
      }
    }
    
    const locatorData = this.locators['locators'][key];
    if (!locatorData) {
      const errorMessage = `Locator for key '${key}' not found.`;
      console.log(`❌ LocatorUtility ERROR: ${errorMessage}`);
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (this.debugMode) {
      this.logger.debug(`Attempting to retrieve locator for key: ${key}`);
      this.logger.debug('Current locators object:', this.locators);
      this.logger.debug(`Available locators for key '${key}':`, locatorData);
      this.logger.debug(`Element type: ${locatorData.element_type}`);
      this.logger.debug(`Attributes:`, locatorData.attributes);
    }

    const { preferred, fallbacks } = locatorData;
    const locatorOptions = [preferred, ...Object.values(fallbacks)];
    const failedAttempts: FailedLocatorData[] = [];
    
    // Always log the fallback strategy summary
    console.log(`📋 LocatorUtility: Locator strategy for '${key}': ${locatorOptions.length} options available (1 preferred + ${Object.keys(fallbacks).length} fallbacks)`);
    this.logger.info(`📋 Locator strategy for '${key}': ${locatorOptions.length} options available (1 preferred + ${Object.keys(fallbacks).length} fallbacks)`);
    
    let attemptCount = 0;

    // Try all traditional locators first
    for (const option of locatorOptions as { locator: string; type: string; confidence: number }[]) {
      attemptCount++;
      const isPreferred = attemptCount === 1;
      const locatorType = isPreferred ? 'preferred' : `fallback_${attemptCount - 1}`;
      
      try {
        console.log(`🎯 LocatorUtility: Trying ${locatorType} locator: ${option.locator} (type: ${option.type}, confidence: ${option.confidence})`);
        this.logger.info(`🎯 Trying ${locatorType} locator: ${option.locator} (type: ${option.type}, confidence: ${option.confidence})`);
        
        // Validate the locator by checking if it exists on the page
        await targetPage.waitForSelector(option.locator, { timeout: 1000 });
        
        if (!isPreferred) {
          console.log(`✅ LocatorUtility: Fallback locator succeeded after ${attemptCount - 1} failed attempts: ${option.locator}`);
          this.logger.warn(`✅ Fallback locator succeeded after ${attemptCount - 1} failed attempts: ${option.locator}`);
          
          // Cache successful fallback
          if (this.aiService.isEnabled()) {
            this.aiCache.cacheSuccessfulLocator(key, option.locator, option.confidence, 'fallback');
          }
          
          // Capture DOM snapshot for successful fallback
          if (targetPage && typeof key === 'string') {
            try {
              const preferredLocator = locatorOptions[0].locator;
              this.domSnapshotCapture.captureFallbackLocatorSnapshot(
                targetPage,
                `fallback_locator_${key}`,
                preferredLocator,
                option.locator
              );
              this.logger.info(`📊 DOM snapshot captured for fallback locator: ${key}`);
            } catch (snapshotError) {
              this.logger.warn(`Failed to capture DOM snapshot for fallback: ${snapshotError}`);
            }
          }
        } else {
          console.log(`✅ LocatorUtility: Preferred locator succeeded: ${option.locator}`);
          this.logger.info(`✅ Preferred locator succeeded: ${option.locator}`);
        }
        
        return option.locator;
      } catch (error) {
        if (isPreferred) {
          console.log(`❌ LocatorUtility: Preferred locator failed: ${option.locator}. Trying fallback options...`);
          this.logger.warn(`❌ Preferred locator failed: ${option.locator}. Trying fallback options...`);
        } else {
          console.log(`❌ LocatorUtility: Fallback ${attemptCount - 1} failed: ${option.locator}. Trying next fallback...`);
          this.logger.warn(`❌ Fallback ${attemptCount - 1} failed: ${option.locator}. Trying next fallback...`);
        }
        
        // Record failed attempt
        failedAttempts.push({
          elementKey: key,
          locatorValue: option.locator,
          locatorType: option.type,
          confidence: option.confidence,
          error: error as Error
        });
        
        // Take a screenshot on fallback failure
        const screenshotPath = path.resolve(__dirname, '../../test-results/screenshots', `fallback_failure_${key}_${option.type}.png`);
        try {
          await targetPage.screenshot({ path: screenshotPath });
        } catch (screenshotError) {
          this.logger.error(`Failed to take screenshot: ${screenshotPath}`, screenshotError);
        }
      }
    }

    // All traditional locators failed - check if AI healing is enabled
    // Debug: Log the actual ai_fallback value and its type
    this.logger.debug(`🔍 AI Fallback Debug for '${key}': value='${locatorData.ai_fallback}', type='${typeof locatorData.ai_fallback}'`);
    
    const aiEnabledForElement = locatorData.ai_fallback === true || 
                               locatorData.ai_fallback === 'true' || 
                               locatorData.ai_fallback === "true";
    
    this.logger.debug(`🔍 AI Healing Check for '${key}': aiEnabledForElement=${aiEnabledForElement}, globalEnabled=${this.aiService.isEnabled()}`);
    
    if (this.aiService.isEnabled() && aiEnabledForElement) {
      console.log(`🤖 LocatorUtility: All traditional locators failed for '${key}'. Attempting AI healing...`);
      this.logger.info(`🤖 All traditional locators failed for '${key}'. AI healing enabled, attempting recovery...`);
      
      try {
        const healedLocator = await this.attemptAIHealing(key, failedAttempts, targetPage, locatorData);
        if (healedLocator) {
          console.log(`✅ LocatorUtility: AI healing successful for '${key}': ${healedLocator}`);
          this.logger.info(`✅ AI healing successful for '${key}': ${healedLocator}`);
          return healedLocator;
        }
      } catch (aiError) {
        this.logger.error(`❌ AI healing failed for '${key}':`, aiError);
      }
    } else if (!this.aiService.isEnabled()) {
      this.logger.info(`🤖 AI healing is disabled globally for '${key}'`);
    } else if (!aiEnabledForElement) {
      this.logger.info(`🤖 AI healing is disabled for element '${key}' (ai_fallback: ${locatorData.ai_fallback})`);
    }

    // Final failure - throw comprehensive error
    const errorMessage = `All locators for key '${key}' failed. Attempted ${failedAttempts.length} traditional locators${aiEnabledForElement && this.aiService.isEnabled() ? ' and AI healing' : ''}.`;
    this.logger.error(errorMessage);
    
    throw new AIHealingError(
      errorMessage,
      key,
      failedAttempts.map(f => f.locatorValue),
      undefined,
      failedAttempts[0]?.error
    );
  }

  /**
   * AI healing attempt method
   */
  private async attemptAIHealing(
    key: string, 
    failedAttempts: FailedLocatorData[], 
    targetPage: Page, 
    locatorData: any
  ): Promise<string | null> {
    const startTime = Date.now();
    const testName = process.env.CUCUMBER_SCENARIO_NAME || 'unknown-test';
    let aiStartTime = Date.now();
    
    try {
      // Get page source for AI analysis
      const pageSource = await targetPage.content();
      
      const elementDescription = locatorData.element_desc || `Element with key: ${key}`;
      
      this.logger.info(`🤖 Calling AI healing service for '${key}'`);
      
      // Track AI healing start time
      aiStartTime = Date.now();
      
      // Call AI healing service with raw HTML (server handles optimization)
      const aiResponse = await this.aiService.healLocator(
        failedAttempts,
        pageSource,
        elementDescription,
        `Traditional locator failure for element: ${key}`
      );
      
      // Calculate AI healing time
      const aiHealingTime = Date.now() - aiStartTime;
      const responseTime = Date.now() - startTime;
      
      // Enhanced API returns suggestions directly
      let suggestions: HealingSuggestion[] = [];
      let modelUsed = this.aiService.getConfig().model_settings.default_model;
      
      if (aiResponse.suggestions && Array.isArray(aiResponse.suggestions)) {
        // Current API format with unified interface
        suggestions = this.aiService.processSuggestions(aiResponse.suggestions);
        this.logger.info(`🎯 AI returned ${suggestions.length} suggestions for '${key}'`);
      } else {
        this.logger.warn(`⚠️ No valid suggestions received from AI for '${key}'`);
        return null;
      }
      
      this.aiCache.recordAttempt(modelUsed, responseTime, true);
      
      // Update metrics with AI healing results
      let healingSuccessful = false;
      const suggestionsReceived = suggestions.length;
      
      // Try each suggestion
      for (let i = 0; i < suggestions.length; i++) {
        const suggestion = suggestions[i];
        this.logger.info(`🧪 Trying AI suggestion ${i + 1}/${suggestions.length}: ${suggestion.value} (confidence: ${suggestion.confidence})`);
        
        try {
          await targetPage.waitForSelector(suggestion.value, { timeout: 2000 });
          
          // Success! Cache the result
          this.aiCache.cacheSuccessfulLocator(key, suggestion.value, suggestion.confidence, 'ai');
          this.aiCache.recordConfidence(modelUsed, suggestion.confidence);
          
          this.logger.info(`✅ AI suggestion successful: ${suggestion.value}`);
          
          // Mark healing as successful
          healingSuccessful = true;
          
          return suggestion.value;
        } catch (suggestionError) {
          this.logger.warn(`❌ AI suggestion ${i + 1} failed: ${suggestion.value}`);
          continue;
        }
      }
      
      // All AI suggestions failed
      this.logger.warn(`❌ All AI suggestions failed for '${key}'`);
      
      return null;
      
    } catch (aiError) {
      const responseTime = Date.now() - startTime;
      const aiHealingTime = Date.now() - aiStartTime;
      this.aiCache.recordAttempt('unknown', responseTime, false);
      
      this.logger.error(`❌ AI healing service failed for '${key}':`, aiError);
      throw aiError;
    }
  }

  /**
   * Clicks an element with fallback locators
   * @param elementKey The key of the element in the locator file
   * @param timeout Optional timeout in milliseconds
   * @param force Whether to force the click
   */
  public async clickWithFallback(elementKey: string, timeout?: number, force?: boolean): Promise<void> {
    const selector = await this.getLocator(elementKey);
    const targetPage = this.page;
    if (!targetPage) {
      throw new Error('No page instance available for click operation. Use setPage() first.');
    }
    
    try {
      await targetPage.click(selector, { 
        timeout: timeout || 30000, 
        force: force || false 
      });
    } catch (error) {
      this.logger.error(`Failed to click element ${elementKey}: ${error}`);
      throw error;
    }
  }

  /**
   * Fills an input field with fallback locators
   * @param elementKey The key of the element in the locator file
   * @param value The value to fill
   * @param timeout Optional timeout in milliseconds
   * @param clear Whether to clear the field before filling
   */
  public async fillWithFallback(elementKey: string, value: string, timeout?: number, clear?: boolean): Promise<void> {
    const selector = await this.getLocator(elementKey);
    const targetPage = this.page;
    if (!targetPage) {
      throw new Error('No page instance available for fill operation. Use setPage() first.');
    }
    
    try {
      if (clear) {
        await targetPage.click(selector, { timeout: timeout || 30000 });
        await targetPage.fill(selector, '');
      }
      await targetPage.fill(selector, value, { timeout: timeout || 30000 });
    } catch (error) {
      this.logger.error(`Failed to fill element ${elementKey}: ${error}`);
      throw error;
    }
  }

  /**
   * Waits for an element with fallback locators
   * @param elementKey The key of the element in the locator file
   * @param state The state to wait for
   * @param timeout Optional timeout in milliseconds
   * @returns Locator for the element
   */
  public async waitForElementWithFallback(
    elementKey: string, 
    state: 'visible' | 'hidden' | 'attached' | 'detached' = 'visible', 
    timeout?: number
  ) {
    const selector = await this.getLocator(elementKey);
    const targetPage = this.page;
    if (!targetPage) {
      throw new Error('No page instance available for wait operation. Use setPage() first.');
    }
    
    try {
      const locator = targetPage.locator(selector);
      await locator.waitFor({ state, timeout: timeout || 30000 });
      return locator;
    } catch (error) {
      this.logger.error(`Failed to wait for element ${elementKey}: ${error}`);
      throw error;
    }
  }
}