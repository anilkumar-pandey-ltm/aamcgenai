import { CachedLocator, AIHealingMetrics, ModelStats } from '../types/aiHealing';
import { Logger } from './logger';

export class AILocatorCache {
  private static instance: AILocatorCache;
  private cache = new Map<string, CachedLocator>();
  private metrics: AIHealingMetrics;
  private logger: Logger;
  
  private constructor() {
    this.logger = Logger.getInstance();
    this.metrics = {
      attempts: 0,
      successes: 0,
      failures: 0,
      average_response_time: 0,
      cache_hits: 0,
      model_performance: new Map<string, ModelStats>()
    };
  }
  
  public static getInstance(): AILocatorCache {
    if (!AILocatorCache.instance) {
      AILocatorCache.instance = new AILocatorCache();
    }
    return AILocatorCache.instance;
  }
  
  /**
   * Cache a successful AI-generated locator
   */
  public cacheSuccessfulLocator(
    elementKey: string, 
    locator: string, 
    confidence: number, 
    source: 'ai' | 'fallback' = 'ai'
  ): void {
    const cachedLocator: CachedLocator = {
      elementKey,
      locator,
      confidence,
      timestamp: new Date().toISOString(),
      source
    };
    
    this.cache.set(elementKey, cachedLocator);
    this.logger.info(`💾 Cached ${source} locator for '${elementKey}': ${locator} (confidence: ${confidence})`);
  }
  
  /**
   * Get a cached locator if available
   */
  public getFromCache(elementKey: string): CachedLocator | null {
    const cached = this.cache.get(elementKey);
    if (cached) {
      this.metrics.cache_hits++;
      this.logger.debug(`🎯 Cache hit for '${elementKey}': ${cached.locator}`);
      return cached;
    }
    
    this.logger.debug(`❌ Cache miss for '${elementKey}'`);
    return null;
  }
  
  /**
   * Check if a locator is cached
   */
  public isCached(elementKey: string): boolean {
    return this.cache.has(elementKey);
  }
  
  /**
   * Remove a cached locator
   */
  public removeFromCache(elementKey: string): boolean {
    const removed = this.cache.delete(elementKey);
    if (removed) {
      this.logger.debug(`🗑️ Removed cached locator for '${elementKey}'`);
    }
    return removed;
  }
  
  /**
   * Clear all cached locators
   */
  public clearCache(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.info(`🧹 Cleared AI locator cache (${size} entries removed)`);
  }
  
  /**
   * Get all cached locators
   */
  public getAllCached(): CachedLocator[] {
    return Array.from(this.cache.values());
  }
  
  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    total_entries: number;
    ai_generated: number;
    fallback_generated: number;
    cache_hit_rate: number;
  } {
    const entries = Array.from(this.cache.values());
    const aiGenerated = entries.filter(e => e.source === 'ai').length;
    const fallbackGenerated = entries.filter(e => e.source === 'fallback').length;
    
    return {
      total_entries: entries.length,
      ai_generated: aiGenerated,
      fallback_generated: fallbackGenerated,
      cache_hit_rate: this.metrics.attempts > 0 ? this.metrics.cache_hits / this.metrics.attempts : 0
    };
  }
  
  /**
   * Record an AI healing attempt
   */
  public recordAttempt(model: string, responseTime: number, success: boolean): void {
    this.metrics.attempts++;
    
    if (success) {
      this.metrics.successes++;
    } else {
      this.metrics.failures++;
    }
    
    // Update model-specific stats
    let modelStats = this.metrics.model_performance.get(model);
    if (!modelStats) {
      modelStats = {
        attempts: 0,
        successes: 0,
        average_response_time: 0,
        average_confidence: 0
      };
      this.metrics.model_performance.set(model, modelStats);
    }
    
    modelStats.attempts++;
    if (success) {
      modelStats.successes++;
    }
    
    // Update average response time
    modelStats.average_response_time = 
      (modelStats.average_response_time * (modelStats.attempts - 1) + responseTime) / modelStats.attempts;
    
    // Update overall average response time
    this.metrics.average_response_time = 
      (this.metrics.average_response_time * (this.metrics.attempts - 1) + responseTime) / this.metrics.attempts;
  }
  
  /**
   * Record confidence score for model performance tracking
   */
  public recordConfidence(model: string, confidence: number): void {
    const modelStats = this.metrics.model_performance.get(model);
    if (modelStats) {
      const totalAttempts = modelStats.attempts;
      modelStats.average_confidence = 
        (modelStats.average_confidence * (totalAttempts - 1) + confidence) / totalAttempts;
    }
  }
  
  /**
   * Get AI healing metrics
   */
  public getMetrics(): AIHealingMetrics {
    return {
      ...this.metrics,
      model_performance: new Map(this.metrics.model_performance) // Return a copy
    };
  }
  
  /**
   * Get performance summary for logging
   */
  public getPerformanceSummary(): string {
    const stats = this.getCacheStats();
    const successRate = this.metrics.attempts > 0 ? 
      (this.metrics.successes / this.metrics.attempts * 100).toFixed(1) : '0';
    
    return `AI Healing Performance: ${this.metrics.successes}/${this.metrics.attempts} success (${successRate}%), ` +
           `Cache: ${stats.total_entries} entries, Hit rate: ${(stats.cache_hit_rate * 100).toFixed(1)}%, ` +
           `Avg response: ${this.metrics.average_response_time.toFixed(0)}ms`;
  }
  
  /**
   * Export cache for persistence (optional feature)
   */
  public exportCache(): string {
    const data = {
      cache: Object.fromEntries(this.cache),
      metrics: {
        ...this.metrics,
        model_performance: Object.fromEntries(this.metrics.model_performance)
      },
      exported_at: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }
  
  /**
   * Import cache from persistence (optional feature)
   */
  public importCache(data: string): void {
    try {
      const parsed = JSON.parse(data);
      
      // Import cache entries
      if (parsed.cache) {
        this.cache.clear();
        for (const [key, value] of Object.entries(parsed.cache)) {
          this.cache.set(key, value as CachedLocator);
        }
      }
      
      // Import metrics
      if (parsed.metrics) {
        this.metrics = {
          ...parsed.metrics,
          model_performance: new Map(Object.entries(parsed.metrics.model_performance || {}))
        };
      }
      
      this.logger.info(`📥 Imported AI cache: ${this.cache.size} entries`);
    } catch (error) {
      this.logger.error('Failed to import AI cache data', error);
      throw error;
    }
  }
}