/**
 * TypeScript interfaces for FusionIQ AI Locator Healing API
 * Unified interface structure for Enhanced Self-Healing API v2.0
 */

// Self-Healing API Request Format
export interface SelfHealRequest {
  html_source: string;           // Full page HTML source
  failed_locators: string[];     // Array of failed locator values
  element_description?: string;  // Human-readable element description from YAML
  llm_provider?: string;         // LLM provider (claude, openai, llama, etc.)
}

export interface HealingSuggestion {
  type: string;                  // "css", "xpath", "class", etc.
  value: string;                 // The actual locator string
  confidence: number;            // Confidence score (0-1)
}

// Self-Healing API Response Format
export interface SelfHealResponse {
  success: boolean;
  suggestions: HealingSuggestion[];
  total_count: number;
  message?: string;
}

export interface FailedLocatorData {
  elementKey: string;
  locatorValue: string;
  locatorType: string;
  confidence: number;
  error: Error;
}

export interface PageContext {
  url: string;
  title: string;
  viewport: { width: number; height: number } | null;
  timestamp: string;
}

export interface CachedLocator {
  elementKey: string;
  locator: string;
  confidence: number;
  timestamp: string;
  source: 'ai' | 'fallback';
}

export interface AIHealingMetrics {
  attempts: number;
  successes: number;
  failures: number;
  average_response_time: number;
  cache_hits: number;
  model_performance: Map<string, ModelStats>;
}

export interface ModelStats {
  attempts: number;
  successes: number;
  average_response_time: number;
  average_confidence: number;
}

export interface AIHealingConfig {
  enabled: boolean;
  server: {
    base_url: string;
    endpoint: string;
    timeout: number;
    retry_attempts: number;
  };
  model_settings: {
    default_model: string;
    fallback_models: string[];
    max_suggestions: number;
  };
  behavior: {
    auto_update_yaml: boolean;
    cache_ai_results: boolean;
    try_all_suggestions: boolean;
  };
  error_handling: {
    fallback_to_traditional: boolean;
    max_ai_attempts: number;
    capture_failure_data: boolean;
  };
}

export class AIHealingError extends Error {
  constructor(
    message: string,
    public elementKey: string,
    public failedLocators: string[],
    public aiResponse?: SelfHealResponse,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AIHealingError';
  }
}