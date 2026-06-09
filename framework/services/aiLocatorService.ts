import { 
  SelfHealRequest,
  SelfHealResponse,
  HealingSuggestion,
  FailedLocatorData,
  AIHealingConfig,
  AIHealingError 
} from '../types/aiHealing';
import { getConfig } from '../utils/configUtility';
import { Logger } from '../utils/logger';
import fetch from 'node-fetch';

export class AILocatorService {
  private static instance: AILocatorService;
  private logger: Logger;
  private config: AIHealingConfig;
  
  private constructor() {
    this.logger = Logger.getInstance();
    this.config = this.loadAIConfig();
  }
  
  public static getInstance(): AILocatorService {
    if (!AILocatorService.instance) {
      AILocatorService.instance = new AILocatorService();
    }
    return AILocatorService.instance;
  }
  
  /**
   * Load AI healing configuration from config.yaml and environment variables
   */
  private loadAIConfig(): AIHealingConfig {
    const mainConfig = getConfig();
    const aiConfig = mainConfig.ai_locator_healing;
    
    // Override with environment variables if available
    const serverUrl = process.env.FUSIONIQ_SERVER_URL || aiConfig?.server?.base_url || 'http://localhost:8000';
    const defaultModel = process.env.FUSIONIQ_AI_MODEL || aiConfig?.model_settings?.default_model || 'claude';
    const enabled = process.env.AI_HEALING_ENABLED === 'true' || aiConfig?.enabled || false;
    
    return {
      enabled,
      server: {
        base_url: serverUrl,
        endpoint: aiConfig?.server?.endpoint || '/api/v1/self_healing/generate_locators',
        timeout: aiConfig?.server?.timeout || 30000,
        retry_attempts: aiConfig?.server?.retry_attempts || 2
      },
      model_settings: {
        default_model: defaultModel,
        fallback_models: aiConfig?.model_settings?.fallback_models || ['gpt4', 'llama'],
        max_suggestions: aiConfig?.model_settings?.max_suggestions || 3
      },
      behavior: {
        auto_update_yaml: aiConfig?.behavior?.auto_update_yaml || false,
        cache_ai_results: aiConfig?.behavior?.cache_ai_results || true,
        try_all_suggestions: aiConfig?.behavior?.try_all_suggestions || false
      },
      error_handling: {
        fallback_to_traditional: aiConfig?.error_handling?.fallback_to_traditional || true,
        max_ai_attempts: aiConfig?.error_handling?.max_ai_attempts || 2,
        capture_failure_data: aiConfig?.error_handling?.capture_failure_data || true
      }
    };
  }
  
  /**
   * Check if AI healing is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }
  
  /**
   * Main method to heal failed locators using FusionIQ API
   */
  public async healLocator(
    failedLocatorData: FailedLocatorData[],
    pageSource: string,
    elementDescription: string,
    errorContext?: string
  ): Promise<SelfHealResponse> {
    if (!this.isEnabled()) {
      throw new Error('AI healing is disabled in configuration');
    }
    
    this.logger.info(`🤖 Starting AI healing for element: ${elementDescription}`);
    
    const request = this.buildApiRequest(failedLocatorData, pageSource, elementDescription, errorContext);
    
    // Try with primary model first
    try {
      return await this.callHealingAPI(request, this.config.model_settings.default_model);
    } catch (error) {
      this.logger.warn(`Primary model ${this.config.model_settings.default_model} failed, trying fallback models`);
      
      // Try fallback models
      for (const fallbackModel of this.config.model_settings.fallback_models) {
        try {
          this.logger.info(`🔄 Trying fallback model: ${fallbackModel}`);
          return await this.callHealingAPI(request, fallbackModel);
        } catch (fallbackError) {
          this.logger.warn(`Fallback model ${fallbackModel} also failed: ${fallbackError}`);
          continue;
        }
      }
      
      throw new AIHealingError(
        'All AI models failed to provide healing suggestions',
        failedLocatorData[0]?.elementKey || 'unknown',
        failedLocatorData.map(f => f.locatorValue),
        undefined,
        error as Error
      );
    }
  }
  
  /**
   * Build API request payload
   */
  private buildApiRequest(
    failedData: FailedLocatorData[],
    pageSource: string,
    elementDescription: string,
    errorContext?: string
  ): SelfHealRequest {
    return {
      html_source: pageSource,
      failed_locators: failedData.map(f => f.locatorValue),
      element_description: elementDescription || 'target element',
      llm_provider: this.config.model_settings.default_model
    };
  }
  
  /**
   * Call the FusionIQ healing API
   */
  private async callHealingAPI(request: SelfHealRequest, model: string): Promise<SelfHealResponse> {
    const url = `${this.config.server.base_url}${this.config.server.endpoint}`;
    const startTime = Date.now();
    
    this.logger.debug(`🌐 Calling AI healing API: ${url}`);
    this.logger.debug(`📊 Model: ${model}, Failed locators: ${request.failed_locators.length}`);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'model': model
        },
        body: JSON.stringify({
          ...request,
          llm_provider: model
        }),
        timeout: this.config.server.timeout
      });
      
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json() as SelfHealResponse;
      const duration = Date.now() - startTime;
      
      this.logger.info(`✅ AI healing API successful in ${duration}ms using model: ${model}`);
      this.logger.info(`📈 Received ${data.suggestions?.length || 0} suggestions`);
      
      return this.validateApiResponse(data);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`❌ AI healing API failed after ${duration}ms: ${error}`);
      throw error;
    }
  }
  
  /**
   * Validate and process API response
   */
  private validateApiResponse(response: any): SelfHealResponse {
    if (!response.success) {
      throw new Error(`API returned failure: ${response.message || 'Unknown error'}`);
    }
    
    if (!response.suggestions || !Array.isArray(response.suggestions)) {
      throw new Error('API response missing suggestions array');
    }
    
    // Filter suggestions based on max_suggestions config
    const suggestions = response.suggestions
      .slice(0, this.config.model_settings.max_suggestions);
    
    return {
      success: response.success,
      suggestions: suggestions,
      total_count: response.total_count || suggestions.length,
      message: response.message
    };
  }
  
  /**
   * Process healing suggestions and sort by confidence
   */
  public processSuggestions(suggestions: HealingSuggestion[]): HealingSuggestion[] {
    return suggestions
      .filter(s => s.confidence > 0) // Only keep suggestions with positive confidence
      .sort((a, b) => b.confidence - a.confidence); // Sort by confidence (highest first)
  }
  
  /**
   * Get the current configuration
   */
  public getConfig(): AIHealingConfig {
    return { ...this.config }; // Return a copy to prevent mutations
  }
}