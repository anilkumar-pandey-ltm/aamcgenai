import { chromium, firefox, webkit, Browser, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as yaml from 'yaml';
import * as process from 'process';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  // Use basic console.log for initialization as Logger may not be ready yet
  console.log('✓ Environment variables loaded from .env file');
} else {
  console.log('⚠ No .env file found, using system environment variables');
}

const configPath = './framework/config/config.yaml';
const browserCombinationsPath = path.resolve(__dirname, '../config/browser-combinations.yaml');
const cloudProvidersPath = path.resolve(__dirname, '../config/cloud-providers.yaml');

// Helper function to check if we should log to console based on level
function shouldLogToConsole(messageLevel: 'debug' | 'info' | 'warn' | 'error'): boolean {
  try {
    const consoleLevel = process.env.CONSOLE_LOG_LEVEL?.toLowerCase() || 'info';
    const levelMap: { [key: string]: number } = { 'debug': 0, 'info': 1, 'warn': 2, 'error': 3 };
    const currentLevel = levelMap[consoleLevel] ?? 1;
    const messageNumLevel = levelMap[messageLevel] ?? 1;
    return messageNumLevel >= currentLevel;
  } catch {
    return true; // Default to showing messages if check fails
  }
}

// Controlled console logging functions
function logInfo(message: string): void {
  if (shouldLogToConsole('info')) {
    console.log(message);
  }
}

function logWarn(message: string): void {
  if (shouldLogToConsole('warn')) {
    console.warn(message);
  }
}

function logDebug(message: string): void {
  if (shouldLogToConsole('debug')) {
    console.log(message);
  }
}

// New interfaces for consolidated configuration
export interface BrowserCombination {
  os?: string;
  osVersion?: string;
  browserName: string;
  browserVersion?: string;
  deviceName?: string;
  platformName?: string;
  deviceOrientation?: string;
}

export interface BrowserCombinations {
  combinations: Record<string, BrowserCombination>;
}

export interface CloudProviderSettings {  browserstack?: {
    screenResolution?: string;
    recordVideo?: boolean;
    recordScreenshots?: boolean;
    maxDuration?: number;
    debug?: boolean;
    networkLogs?: boolean;
    consoleLogs?: string;
    seleniumVersion?: string;
    timezone?: string;
    local?: boolean;
    acceptSslCerts?: boolean;
  };
  saucelabs?: {
    screenResolution?: string;
    recordVideo?: boolean;
    recordScreenshots?: boolean;
    maxDuration?: number;
    tags?: string[];
  };
}

// Existing interfaces
export interface SauceLabsConfig {
  username: string;
  accessKey: string;
  region: string;
  buildName: string;
  tunnel: boolean;
  capabilities: {
    browserName: string;
    browserVersion: string;
    platformName: string;
    'sauce:options': {
      name: string;
      build: string;
      tags: string[];
      screenResolution: string;
      recordVideo: boolean;
      recordScreenshots: boolean;
      maxDuration: number;
    };
  };
}

export interface BrowserStackConfig {
  username: string;
  accessKey: string;
  buildName: string;
  projectName: string;
  local: boolean;
  localIdentifier: string;
  capabilities: {
    browserName: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    'bstack:options': {
      sessionName: string;
      buildName: string;
      projectName: string;
      local: boolean;
      debug: boolean;
      networkLogs: boolean;
      consoleLogs: string;
      video: boolean;
      seleniumVersion: string;
      resolution: string;
      timezone: string;
    };
  };
}

export interface Config {
  execution: {
    environment: 'local' | 'saucelabs' | 'browserstack';
    fallbackToLocal?: boolean;
  };
  browser: {
    name: string;
    headless: boolean;
  };  recording?: {
    enabled: boolean;
    mode: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry';
    dir: string;
    size: string;
  };
  localRecordVideo?: 'all' | 'failures' | 'off';
  debugging?: {
    networkLogs: boolean;
    consoleCapture: boolean;
    performanceMetrics: boolean;
    harFiles: boolean;
    screenshotOnError: boolean;
    pageSource: boolean;
    slowMotion: number;
  };
  stepLogging?: {
    enabled: boolean;
    logLevel: string;
    capturePageState: boolean;
    logElementActions: boolean;
    logAssertions: boolean;
    logWaitConditions: boolean;
    rcaOnFailure: boolean;
  };
  rca?: {
    enabled: boolean;
    captureScreenshots: boolean;
    capturePageSource: boolean;
    captureBrowserInfo: boolean;
    captureDOMState: boolean;
    captureNetworkState: boolean;
    generateSummary: boolean;
  };
  network?: {
    captureRequests: boolean;
    captureResponses: boolean;
    captureHeaders: boolean;
    captureCookies: boolean;
    filterDomains: string[];
    ignoredResourceTypes: string[];
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
  parallel: {
    workers: number;
  };
  logging?: {
    consoleLevel: string;
    fileLevel: string;
  };
  baseUrl: string;
  tags: string;
  compatibility: {
    enabled: boolean;
    browsers: string[];
    mode: 'parallel' | 'sequential';
  };
  build: {
    name: string;
    project: string;
  };
  saucelabs: SauceLabsConfig;
  browserstack: BrowserStackConfig;
  ai_locator_healing?: {
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
  };
  report: {
    jsonFile: string;
    htmlFile: string;
    theme: string;
    metadata: any;
  };
}

// Functions to read new configuration files
export function getBrowserCombinations(): BrowserCombinations {
  try {
    const filePath = browserCombinationsPath;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    logDebug(`✓ Browser combinations loaded from: ${filePath}`);
    const parsed = yaml.parse(fileContent) as BrowserCombinations;
    logDebug(`✓ Found ${Object.keys(parsed.combinations || {}).length} browser combinations`);
    return parsed;
  } catch (error) {
    logWarn('⚠ Could not load browser combinations, using defaults');
    logWarn(`Error: ${error}`);
    return {
      combinations: {
        'local-chromium': { browserName: 'chromium' },
        'local-firefox': { browserName: 'firefox' },
        'local-webkit': { browserName: 'webkit' }
      }
    };
  }
}

export function getCloudProviderSettings(): CloudProviderSettings {
  try {
    const filePath = cloudProvidersPath;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    logDebug(`✓ Cloud provider settings loaded from: ${filePath}`);
    return yaml.parse(fileContent) as CloudProviderSettings;
  } catch (error) {
    logWarn('⚠ Could not load cloud provider settings, using defaults');
    logWarn(`Error: ${error}`);
    return {};
  }
}

export function getBrowserCombination(combinationName: string): BrowserCombination | null {
  const combinations = getBrowserCombinations();
  return combinations.combinations[combinationName] || null;
}

// Generate build name once at module load time, not per config call
const BUILD_TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

// Helper function to detect parallel execution and generate appropriate build name
function generateBuildName(baseName: string): string {
  const workerId = process.env.CUCUMBER_WORKER_ID || process.env.JEST_WORKER_ID || process.env.VITEST_WORKER_ID;
  const totalWorkers = process.env.CUCUMBER_TOTAL_WORKERS || process.env.JEST_WORKER_TOTAL;
  
  let buildName = `${baseName}-${BUILD_TIMESTAMP}`;
  
  // Add parallel execution indicator if running with multiple workers
  if (workerId && totalWorkers && parseInt(totalWorkers) > 1) {
    buildName += `-P${totalWorkers}W${workerId}`;
    console.log(`🔀 Parallel execution detected: Worker ${workerId}/${totalWorkers}`);
  }
  
  return buildName;
}

// Helper function to get parallel worker information for session naming
export function getParallelWorkerInfo(): { isParallel: boolean; workerId?: string; totalWorkers?: string; displayText?: string } {
  const workerId = process.env.CUCUMBER_WORKER_ID || process.env.JEST_WORKER_ID || process.env.VITEST_WORKER_ID;
  const totalWorkers = process.env.CUCUMBER_TOTAL_WORKERS || process.env.JEST_WORKER_TOTAL;
  
  if (workerId && totalWorkers && parseInt(totalWorkers) > 1) {
    return {
      isParallel: true,
      workerId,
      totalWorkers,
      displayText: `[Worker ${workerId}/${totalWorkers}]`
    };
  }
  
  return { isParallel: false };
}

// Enhanced function to generate build names with more detailed parallel information
export function generateEnhancedBuildName(baseName: string, includeProject?: string): string {
  const parallelInfo = getParallelWorkerInfo();
  const timestamp = BUILD_TIMESTAMP;
  
  let buildName = baseName;
  
  // Add project prefix if provided
  if (includeProject) {
    buildName = `${includeProject}-${buildName}`;
  }
  
  // Add timestamp
  buildName = `${buildName}-${timestamp}`;
  
  // Add parallel execution details
  if (parallelInfo.isParallel) {
    buildName += `-P${parallelInfo.totalWorkers}W${parallelInfo.workerId}`;
    console.log(`🔀 Parallel execution detected: Worker ${parallelInfo.workerId}/${parallelInfo.totalWorkers}`);
    console.log(`📋 Build name includes parallel execution info: ${buildName}`);
  }
  
  return buildName;
}

export function getConfig(): Config {
  const file = fs.readFileSync(configPath, 'utf8');
  const yamlConfig = yaml.parse(file);

  // Smart environment detection: if LOCAL_RECORD_VIDEO is set, force local execution for video recording
  let executionEnvironment = process.env.EXECUTION_ENV || yamlConfig.execution?.environment || 'local';
  
  // Override to local if LOCAL_RECORD_VIDEO is explicitly set (for local video recording)
  if (process.env.LOCAL_RECORD_VIDEO && process.env.LOCAL_RECORD_VIDEO !== 'off') {
    console.log(`🎬 LOCAL_RECORD_VIDEO detected (${process.env.LOCAL_RECORD_VIDEO}) - forcing local execution for video recording`);
    executionEnvironment = 'local';
  }

  return {
    execution: {
      environment: executionEnvironment,
    },    browser: {
      name: process.env.BROWSER || 'chromium', // Default to chromium for local execution
      headless: process.env.HEADLESS === 'true' || yamlConfig.browser.headless,
    },
    recording: yamlConfig.recording ? {
      enabled: process.env.VIDEO_RECORDING === 'true' || yamlConfig.recording.enabled,
      mode: process.env.VIDEO_MODE || yamlConfig.recording.mode,
      dir: yamlConfig.recording.dir,
      size: yamlConfig.recording.size
    } : undefined,
    localRecordVideo: process.env.LOCAL_RECORD_VIDEO || yamlConfig.localRecordVideo || 'off',
    debugging: yamlConfig.debugging ? {
      networkLogs: process.env.NETWORK_LOGS === 'true' || yamlConfig.debugging.networkLogs || false,
      consoleCapture: process.env.CONSOLE_CAPTURE === 'true' || yamlConfig.debugging.consoleCapture || false,
      performanceMetrics: process.env.PERFORMANCE_METRICS === 'true' || yamlConfig.debugging.performanceMetrics || false,
      harFiles: process.env.HAR_FILES === 'true' || yamlConfig.debugging.harFiles || false,
      screenshotOnError: process.env.SCREENSHOT_ON_ERROR === 'true' || yamlConfig.debugging.screenshotOnError || false,
      pageSource: process.env.PAGE_SOURCE === 'true' || yamlConfig.debugging.pageSource || false,
      slowMotion: parseInt(process.env.SLOW_MOTION || '', 10) || yamlConfig.debugging.slowMotion || 0
    } : undefined,
    stepLogging: yamlConfig.stepLogging ? {
      enabled: process.env.STEP_LOGGING_ENABLED === 'true' || yamlConfig.stepLogging.enabled,
      logLevel: process.env.STEP_LOG_LEVEL || yamlConfig.stepLogging.logLevel || 'info',
      capturePageState: process.env.CAPTURE_PAGE_STATE === 'true' || yamlConfig.stepLogging.capturePageState || true,
      logElementActions: process.env.LOG_ELEMENT_ACTIONS === 'true' || yamlConfig.stepLogging.logElementActions || true,
      logAssertions: process.env.LOG_ASSERTIONS === 'true' || yamlConfig.stepLogging.logAssertions || true,
      logWaitConditions: process.env.LOG_WAIT_CONDITIONS === 'true' || yamlConfig.stepLogging.logWaitConditions || true,
      rcaOnFailure: process.env.RCA_ON_FAILURE === 'true' || yamlConfig.stepLogging.rcaOnFailure || true,
    } : undefined,
    rca: yamlConfig.rca ? {
      enabled: process.env.RCA_ENABLED === 'true' || yamlConfig.rca.enabled,
      captureScreenshots: process.env.RCA_CAPTURE_SCREENSHOTS === 'true' || yamlConfig.rca.captureScreenshots || true,
      capturePageSource: process.env.RCA_CAPTURE_PAGE_SOURCE === 'true' || yamlConfig.rca.capturePageSource || true,
      captureBrowserInfo: process.env.RCA_CAPTURE_BROWSER_INFO === 'true' || yamlConfig.rca.captureBrowserInfo || true,
      captureDOMState: process.env.RCA_CAPTURE_DOM_STATE === 'true' || yamlConfig.rca.captureDOMState || true,
      captureNetworkState: process.env.RCA_CAPTURE_NETWORK_STATE === 'true' || yamlConfig.rca.captureNetworkState || true,
      generateSummary: process.env.RCA_GENERATE_SUMMARY === 'true' || yamlConfig.rca.generateSummary || true,
    } : undefined,
    network: yamlConfig.network ? {
      captureRequests: process.env.CAPTURE_REQUESTS === 'true' || yamlConfig.network.captureRequests || false,
      captureResponses: process.env.CAPTURE_RESPONSES === 'true' || yamlConfig.network.captureResponses || false,
      captureHeaders: process.env.CAPTURE_HEADERS === 'true' || yamlConfig.network.captureHeaders || false,
      captureCookies: process.env.CAPTURE_COOKIES === 'true' || yamlConfig.network.captureCookies || false,
      filterDomains: yamlConfig.network.filterDomains || [],
      ignoredResourceTypes: yamlConfig.network.ignoredResourceTypes || ['image', 'font', 'media'],
      logLevel: process.env.NETWORK_LOG_LEVEL || yamlConfig.network.logLevel || 'info'
    } : undefined,
    parallel: {
      workers: parseInt(process.env.PARALLEL_WORKERS || '', 10) || yamlConfig.parallel.workers,
    },
    logging: yamlConfig.logging ? {
      consoleLevel: process.env.CONSOLE_LOG_LEVEL || yamlConfig.logging.consoleLevel || 'info',
      fileLevel: process.env.FILE_LOG_LEVEL || yamlConfig.logging.fileLevel || 'debug'
    } : {
      consoleLevel: 'info',
      fileLevel: 'debug'
    },
    baseUrl: process.env.BASE_URL || yamlConfig.baseUrl,
    tags: process.env.TAGS || yamlConfig.tags,
    compatibility: {
      enabled: process.env.COMPATIBILITY_ENABLED === 'true' || yamlConfig.compatibility?.enabled || false,
      browsers: yamlConfig.compatibility?.browsers || ['windows-chrome'],
      mode: yamlConfig.compatibility?.mode || 'parallel'
    },
    build: {
      name: process.env.BUILD_NAME || generateBuildName(yamlConfig.build?.name || 'FusionIQ-Framework-Build'),
      project: process.env.BUILD_PROJECT || yamlConfig.build?.project || 'FusionIQ Automation Project',
    },    saucelabs: {
      username: process.env.SAUCE_USERNAME || yamlConfig.saucelabs?.username || '',
      accessKey: process.env.SAUCE_ACCESS_KEY || yamlConfig.saucelabs?.accessKey || '',
      region: process.env.SAUCE_REGION || yamlConfig.saucelabs?.region || 'eu-central-1',
      buildName: process.env.SAUCE_BUILD || generateBuildName(yamlConfig.saucelabs?.buildName || 'FusionIQ-Framework-Build'),
      tunnel: process.env.SAUCE_TUNNEL === 'true' || yamlConfig.saucelabs?.tunnel || false,
      capabilities: {
        browserName: process.env.SAUCE_BROWSER || yamlConfig.saucelabs?.capabilities?.browserName || 'chrome',
        browserVersion: process.env.SAUCE_BROWSER_VERSION || yamlConfig.saucelabs?.capabilities?.browserVersion || 'latest',
        platformName: process.env.SAUCE_PLATFORM || yamlConfig.saucelabs?.capabilities?.platformName || 'Windows 11',
        'sauce:options': {
          name: process.env.SAUCE_TEST_NAME || yamlConfig.saucelabs?.capabilities?.['sauce:options']?.name || 'FusionIQ Test',
          build: process.env.SAUCE_BUILD || generateBuildName(yamlConfig.saucelabs?.capabilities?.['sauce:options']?.build || 'FusionIQ-Framework-Build'),
          tags: yamlConfig.saucelabs?.capabilities?.['sauce:options']?.tags || ['FusionIQ', 'Playwright', 'BDD'],
          screenResolution: yamlConfig.saucelabs?.capabilities?.['sauce:options']?.screenResolution || '1920x1080',
          recordVideo: yamlConfig.saucelabs?.capabilities?.['sauce:options']?.recordVideo || true,
          recordScreenshots: yamlConfig.saucelabs?.capabilities?.['sauce:options']?.recordScreenshots || true,
          maxDuration: yamlConfig.saucelabs?.capabilities?.['sauce:options']?.maxDuration || 3600,        },
      },
    },browserstack: {
      username: process.env.BROWSERSTACK_USERNAME || yamlConfig.browserstack?.username || '',
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY || yamlConfig.browserstack?.accessKey || '',
      buildName: process.env.BROWSERSTACK_BUILD || generateBuildName(yamlConfig.browserstack?.buildName || 'FusionIQ-Framework-Build'),
      projectName: process.env.BROWSERSTACK_PROJECT || yamlConfig.browserstack?.projectName || 'FusionIQ Automation Project',
      local: process.env.BROWSERSTACK_LOCAL === 'true' || yamlConfig.browserstack?.local || false,
      localIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER || yamlConfig.browserstack?.localIdentifier || '',
      capabilities: {
        browserName: process.env.BROWSERSTACK_BROWSER || yamlConfig.browserstack?.capabilities?.browserName || 'chrome',
        browserVersion: process.env.BROWSERSTACK_BROWSER_VERSION || yamlConfig.browserstack?.capabilities?.browserVersion || 'latest',
        os: process.env.BROWSERSTACK_OS || yamlConfig.browserstack?.capabilities?.os || 'Windows',
        osVersion: process.env.BROWSERSTACK_OS_VERSION || yamlConfig.browserstack?.capabilities?.osVersion || '11',
        'bstack:options': {
          sessionName: process.env.BROWSERSTACK_SESSION_NAME || yamlConfig.browserstack?.capabilities?.['bstack:options']?.sessionName || 'FusionIQ Test',
          buildName: process.env.BROWSERSTACK_BUILD || generateBuildName(yamlConfig.browserstack?.capabilities?.['bstack:options']?.buildName || 'FusionIQ-Framework-Build'),
          projectName: process.env.BROWSERSTACK_PROJECT || yamlConfig.browserstack?.capabilities?.['bstack:options']?.projectName || 'FusionIQ Automation',
          local: process.env.BROWSERSTACK_LOCAL === 'true' || yamlConfig.browserstack?.capabilities?.['bstack:options']?.local || false,
          debug: process.env.BROWSERSTACK_DEBUG === 'true' || yamlConfig.browserstack?.capabilities?.['bstack:options']?.debug || true,
          networkLogs: process.env.BROWSERSTACK_NETWORK_LOGS === 'true' || yamlConfig.browserstack?.capabilities?.['bstack:options']?.networkLogs || true,
          consoleLogs: process.env.BROWSERSTACK_CONSOLE_LOGS || yamlConfig.browserstack?.capabilities?.['bstack:options']?.consoleLogs || 'info',
          video: process.env.BROWSERSTACK_VIDEO === 'true' || yamlConfig.browserstack?.capabilities?.['bstack:options']?.video || true,
          seleniumVersion: process.env.BROWSERSTACK_SELENIUM_VERSION || yamlConfig.browserstack?.capabilities?.['bstack:options']?.seleniumVersion || '4.0.0',
          resolution: process.env.BROWSERSTACK_RESOLUTION || yamlConfig.browserstack?.capabilities?.['bstack:options']?.resolution || '1920x1080',
          timezone: process.env.BROWSERSTACK_TIMEZONE || yamlConfig.browserstack?.capabilities?.['bstack:options']?.timezone || 'UTC',
        },
      },
    },
    ai_locator_healing: yamlConfig.ai_locator_healing ? {
      enabled: process.env.AI_HEALING_ENABLED === 'true' || yamlConfig.ai_locator_healing.enabled,
      server: yamlConfig.ai_locator_healing.server || {
        base_url: 'http://127.0.0.1:8000',
        endpoint: '/automation/self_heal_locator',
        timeout: 60000,
        retry_attempts: 3
      },
      model_settings: yamlConfig.ai_locator_healing.model_settings || {
        default_model: 'claude',
        fallback_models: ['gpt4', 'llama'],
        max_suggestions: 5
      },
      behavior: yamlConfig.ai_locator_healing.behavior || {
        auto_update_yaml: false,
        cache_ai_results: true,
        try_all_suggestions: true
      },
      error_handling: yamlConfig.ai_locator_healing.error_handling || {
        fallback_to_traditional: true,
        max_ai_attempts: 3,
        capture_failure_data: true
      }
    } : undefined,
    report: {
      jsonFile: process.env.REPORT_JSON || yamlConfig.report.jsonFile,
      htmlFile: process.env.REPORT_HTML || yamlConfig.report.htmlFile,
      theme: yamlConfig.report.theme,
      metadata: yamlConfig.report.metadata,
    },
  };
}

export async function getBrowserInstance(browserName: string, isHeadless: boolean): Promise<Browser> {
  const config = getConfig();
  
  if (config.execution.environment === 'saucelabs') {
    return await getSauceLabsBrowserInstance();
  }
  
  // Local browser execution
  switch (browserName) {
    case 'firefox':
      return await firefox.launch({ headless: isHeadless });
    case 'webkit':
      return await webkit.launch({ headless: isHeadless });
    default:
      return await chromium.launch({ headless: isHeadless });
  }
}

export async function getSauceLabsBrowserInstance(): Promise<Browser> {
  const config = getConfig();
  const sauceConfig = config.saucelabs;
  
  if (!sauceConfig.username || !sauceConfig.accessKey) {
    throw new Error('Sauce Labs username and access key must be provided via environment variables or config');
  }
  
  // For Sauce Labs, we'll use the remote browser approach
  // Note: This requires setting up the test to use remote browser context
  const browserType = sauceConfig.capabilities.browserName.toLowerCase();
  
  let browser: Browser;
  switch (browserType) {
    case 'firefox':
      browser = await firefox.launch({
        headless: false // Sauce Labs requires non-headless mode
      });
      break;
    case 'webkit':
    case 'safari':
      browser = await webkit.launch({
        headless: false
      });
      break;
    default:
      browser = await chromium.launch({
        headless: false
      });
      break;
  }
  
  return browser;
}

export async function getSauceLabsBrowserContext(browser: Browser): Promise<BrowserContext> {
  const config = getConfig();
  const sauceConfig = config.saucelabs;
  
  // Create context with Sauce Labs specific options
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: sauceConfig.capabilities['sauce:options'].recordVideo ? { dir: './test-results/videos/' } : undefined,
    recordHar: { path: './test-results/har/sauce-labs-session.har' }
  });
  
  return context;
}

export async function getBrowserInstanceFromConfig(): Promise<Browser> {
  const config = getConfig();
  const browserName = config.browser.name;
  const isHeadless = config.browser.headless;
  return await getBrowserInstance(browserName, isHeadless);
}

export function getBaseUrl(): string {
  return process.env.BASE_URL || 'http://localhost:3000'; // Default base URL
}

export function isRunningOnSauceLabs(): boolean {
  const config = getConfig();
  return config.execution.environment === 'saucelabs';
}

export function getSauceLabsConfig(): SauceLabsConfig {
  const config = getConfig();
  return config.saucelabs;
}

export function getBaseUrlFromConfig(): string {
  const config = getConfig();
  return config.baseUrl;
}

export function getParallelWorkers(): number {
  const config = getConfig();
  return config.parallel.workers;
}

export function getTags(): string {
  const config = getConfig();
  return config.tags;
}

// Helper function to get step logging configuration with defaults
export function getStepLoggingConfig(): NonNullable<Config['stepLogging']> {
  const config = getConfig();
  return {
    enabled: config.stepLogging?.enabled ?? true,
    logLevel: config.stepLogging?.logLevel ?? 'info',
    capturePageState: config.stepLogging?.capturePageState ?? true,
    logElementActions: config.stepLogging?.logElementActions ?? true,
    logAssertions: config.stepLogging?.logAssertions ?? true,
    logWaitConditions: config.stepLogging?.logWaitConditions ?? true,
    rcaOnFailure: config.stepLogging?.rcaOnFailure ?? true,
  };
}

// Helper function to get RCA configuration with defaults
export function getRCAConfig(): NonNullable<Config['rca']> {
  const config = getConfig();
  return {
    enabled: config.rca?.enabled ?? true,
    captureScreenshots: config.rca?.captureScreenshots ?? true,
    capturePageSource: config.rca?.capturePageSource ?? true,
    captureBrowserInfo: config.rca?.captureBrowserInfo ?? true,
    captureDOMState: config.rca?.captureDOMState ?? true,
    captureNetworkState: config.rca?.captureNetworkState ?? true,
    generateSummary: config.rca?.generateSummary ?? true,
  };
}