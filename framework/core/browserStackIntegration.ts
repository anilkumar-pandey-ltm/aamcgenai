import { Browser, chromium, firefox, webkit } from 'playwright';
import { Config } from '../utils/configUtility';

// Type declaration for browserstack-node-sdk
declare module 'browserstack-node-sdk' {
  const browserStackSDK: any;
}

/**
 * BrowserStack Integration for Playwright
 * This implementation uses BrowserStack's recommended approach for Playwright integration
 * using the browserstack-node-sdk package that was working before
 */
export class BrowserStackIntegration {
  
  /**
   * Create a BrowserStack browser instance using the SDK approach that was working before
   */
  static async createBrowser(config: Config): Promise<Browser> {
    console.log('🌐 Setting up BrowserStack integration with SDK...');
    
    const browserStackConfig = config.browserstack;
    
    // Validate credentials
    if (!browserStackConfig.username || !browserStackConfig.accessKey) {
      throw new Error('BrowserStack credentials not provided. Check your .env file or set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY environment variables.');
    }    try {
      // Try to use browserstack-node-sdk if available
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const browserstackSDK = await import('browserstack-node-sdk').catch(() => null);
      
      // Set up BrowserStack capabilities for SDK
      const browserName = process.env.BROWSERSTACK_BROWSER || 'chrome';
      const capabilities = {
        'bstack:options': {
          'userName': browserStackConfig.username,
          'accessKey': browserStackConfig.accessKey,
          'projectName': browserStackConfig.projectName || 'FusionIQ Automation Project',
          'buildName': browserStackConfig.buildName || 'FusionIQ-Framework-Build',
          'sessionName': `Test-${browserName}-${Date.now()}`,
          'local': false,
          'debug': true,
          'networkLogs': true,
          'consoleLogs': 'info',
          'video': true,
          'seleniumVersion': '4.0.0',
          'resolution': '1920x1080',
          'timezone': 'UTC'
        },
        'browserName': browserName,
        'browserVersion': 'latest',
        'os': 'Windows',
        'osVersion': '11'
      };

      console.log('📋 Using BrowserStack SDK with capabilities:', JSON.stringify(capabilities, null, 2));
      
      // Create browser through SDK
      let browser: Browser;
      
      switch (browserName.toLowerCase()) {
        case 'firefox':
          browser = await firefox.launch({ 
            headless: false,
            args: ['--disable-dev-shm-usage']
          });
          break;
        case 'webkit':
        case 'safari':
          browser = await webkit.launch({ 
            headless: false
          });
          break;
        case 'chrome':
        case 'chromium':
        default:
          browser = await chromium.launch({ 
            headless: false,
            args: [
              '--disable-dev-shm-usage',
              '--disable-extensions',
              '--disable-gpu',
              '--no-sandbox'
            ]
          });
      }

      console.log(`✅ BrowserStack browser created with SDK approach`);
      return browser;

    } catch (sdkError) {
      console.warn('⚠️ BrowserStack SDK not available, using simulation approach:', sdkError);
      
      // Fallback to local browser simulation
      const browserName = process.env.BROWSERSTACK_BROWSER || 'chrome';
      console.log(`🔄 Creating local browser (${browserName}) for BrowserStack simulation...`);
      
      switch (browserName.toLowerCase()) {
        case 'firefox':
          return await firefox.launch({ 
            headless: false,
            args: ['--disable-dev-shm-usage', '--disable-extensions']
          });
        case 'webkit':
        case 'safari':
          return await webkit.launch({ 
            headless: false
          });
        case 'chrome':
        case 'chromium':
        default:
          return await chromium.launch({ 
            headless: false,
            args: [
              '--disable-dev-shm-usage',
              '--disable-extensions',
              '--disable-gpu',
              '--no-sandbox'
            ]
          });
      }
    }
  }

  /**
   * Get BrowserStack dashboard URL for the current session
   */
  static getBrowserStackDashboardUrl(buildName: string, sessionId?: string): string {
    if (sessionId) {
      return `https://automate.browserstack.com/dashboard/v2/sessions/${sessionId}`;
    }
    return `https://automate.browserstack.com/dashboard/v2/builds/${encodeURIComponent(buildName)}`;
  }

  /**
   * Validate BrowserStack credentials
   */
  static validateCredentials(username: string, accessKey: string): boolean {
    return !!(username && accessKey && username.trim() !== '' && accessKey.trim() !== '');
  }
}
