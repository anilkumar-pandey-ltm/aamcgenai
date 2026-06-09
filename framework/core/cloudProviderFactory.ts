import { Browser, chromium, firefox, webkit } from 'playwright';
import { getConfig, Config, getBrowserCombinations, getCloudProviderSettings } from '../utils/configUtility';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

export class CloudProviderFactory {  async createBrowser(config?: Config): Promise<Browser> {
    const currentConfig = config || getConfig();
    const environment = currentConfig.execution.environment;
    
    logger.cloud(`Environment = ${environment}`);
    logger.debug(`Config`, currentConfig.execution);
    
    switch (environment) {
      case 'local':
        return await this.createLocalBrowser(currentConfig);
      case 'saucelabs':
        return await this.createSauceLabsBrowser(currentConfig);
      case 'browserstack':
        return await this.createBrowserStackBrowser(currentConfig);
      default:
        throw new Error(`Unsupported execution environment: ${environment}`);
    }
  }
  private async createLocalBrowser(config: Config): Promise<Browser> {
    const browserName = config.browser.name;
    const headless = config.browser.headless;
    
    // Prepare launch options with video recording if enabled
    const launchOptions: any = { 
      headless 
    };
    
    // Add video recording configuration for local execution
    if (config.recording?.enabled) {
      logger.debug(`Video recording enabled: ${config.recording.mode}`);
      logger.debug(`Video directory: ${config.recording.dir}`);
    }
    
    switch (browserName) {
      case 'firefox':
        return await firefox.launch(launchOptions);
      case 'webkit':
        return await webkit.launch(launchOptions);
      case 'chromium':
      default:
        return await chromium.launch(launchOptions);
    }
  }
    private async createSauceLabsBrowser(config: Config): Promise<Browser> {
    console.log('Creating Sauce Labs browser connection...');
    
    try {
      // For now, we'll simulate Sauce Labs by creating a local browser
      // Later we'll implement actual Sauce Labs WebDriver integration
      const sauceConfig = config.saucelabs;
      
      if (!sauceConfig.username || !sauceConfig.accessKey) {
        throw new Error('Sauce Labs credentials not provided. Set SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables.');
      }
      
      // Placeholder implementation - will be enhanced later
      const browserName = sauceConfig.capabilities.browserName.toLowerCase();
      
      switch (browserName) {
        case 'firefox':
          return await firefox.launch({ headless: false }); // Sauce Labs requires non-headless
        case 'webkit':
        case 'safari':
          return await webkit.launch({ headless: false });
        case 'chrome':
        case 'chromium':
        default:
          return await chromium.launch({ headless: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Sauce Labs connection failed:', errorMessage);
      
      // Check if fallback to local is enabled (environment variable takes precedence)
      const envFallback = process.env.FALLBACK_TO_LOCAL?.toLowerCase() === 'true';
      const configFallback = config.execution.fallbackToLocal ?? false;
      const fallbackEnabled = envFallback || configFallback;
      
      if (fallbackEnabled) {
        console.log('🔄 Fallback to local browser is enabled - switching to local execution...');
        if (envFallback) {
          console.log('   (Enabled via FALLBACK_TO_LOCAL environment variable)');
        } else {
          console.log('   (Enabled via config.yaml: execution.fallbackToLocal)');
        }
        return await this.createLocalBrowser(config);
      } else {
        console.log('❌ Fallback to local browser is disabled');
        console.log('💡 To enable fallback:');
        console.log('   - Set execution.fallbackToLocal: true in config.yaml, OR');
        console.log('   - Use environment variable: FALLBACK_TO_LOCAL=true');
        throw error;
      }
    }}  private async createBrowserStackBrowser(config: Config): Promise<Browser> {
    logger.cloud('Connecting to BrowserStack cloud...');
    
    // Get credentials from .env (already loaded in config)
    const credentials = {
      username: config.browserstack.username,
      accessKey: config.browserstack.accessKey
    };
    
    if (!credentials.username || !credentials.accessKey) {
      throw new Error('BrowserStack credentials not provided. Check your .env file or set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY environment variables.');
    }

    // Get browser combination name from environment or use default
    const combinationName = process.env.BROWSER_COMBINATION || 'windows-chrome';
    logger.cloud(`Using browser combination: ${combinationName}`);
    
    try {      // Load browser combinations and cloud provider settings
      const browserCombinations = getBrowserCombinations();
      const cloudProviders = getCloudProviderSettings();
      
      // Validate browser combinations loaded successfully
      if (!browserCombinations || !browserCombinations.combinations) {
        throw new Error('Failed to load browser combinations configuration');
      }
      
      // Get the specific browser combination
      const combination = browserCombinations.combinations[combinationName];
      if (!combination) {
        throw new Error(`Browser combination '${combinationName}' not found in browser-combinations.yaml`);
      }
      
      console.log(`🔍 Browser details: ${combination.browserName} on ${combination.os} ${combination.osVersion}`);
        // Get BrowserStack specific settings
      const bsSettings = cloudProviders.browserstack;
      if (!bsSettings) {
        throw new Error('BrowserStack settings not found in cloud-providers.yaml');
      }      // Map BrowserStack browser names to their BrowserStack names and Playwright types
      const browserStackMapping: Record<string, { browserStackName: string; playwrightType: string }> = {
        'chrome': { browserStackName: 'chrome', playwrightType: 'chrome' },
        'firefox': { browserStackName: 'playwright-firefox', playwrightType: 'firefox' },
        'webkit': { browserStackName: 'webkit', playwrightType: 'webkit' },
        'safari': { browserStackName: 'safari', playwrightType: 'webkit' },
        'edge': { browserStackName: 'edge', playwrightType: 'chrome' }
      };
      
      const mapping = browserStackMapping[combination.browserName] || { browserStackName: 'chrome', playwrightType: 'chrome' };
      console.log(`🔍 Browser mapping: ${combination.browserName} → ${mapping.browserStackName} (Playwright: ${mapping.playwrightType})`);

      // Build BrowserStack capabilities using correct BrowserStack format
      const caps = {
        'browser': mapping.browserStackName, // Use the correct BrowserStack browser name
        'browser_version': combination.browserVersion,
        'os': combination.os,
        'os_version': combination.osVersion,
        'name': `FusionIQ Test - ${combinationName}`,
        'build': config.build.name,
        'project': config.build.project,        'browserstack.username': credentials.username,
        'browserstack.accessKey': credentials.accessKey,
        'browserstack.local': bsSettings.local,
        'browserstack.debug': bsSettings.debug,
        'browserstack.video': bsSettings.recordVideo,
        'browserstack.console': bsSettings.consoleLogs,
        'browserstack.networkLogs': bsSettings.networkLogs,
        'browserstack.acceptSslCerts': bsSettings.acceptSslCerts,
        'browserstack.timezone': bsSettings.timezone,
        'browserstack.playwrightVersion': '1.32.0' // Match our actual Playwright version
      };

      const wsEndpoint = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`;
      console.log(`🔗 Connecting to: ${wsEndpoint.substring(0, 80)}...`);
      
      // Mask sensitive information in capabilities before logging
      const maskedCaps = { ...caps };
      if (maskedCaps['browserstack.accessKey']) {
        maskedCaps['browserstack.accessKey'] = '***MASKED***';
      }
      console.log(`🔍 Capabilities: ${JSON.stringify(maskedCaps, null, 2)}`);
      
      let browser: Browser;
      switch (mapping.playwrightType.toLowerCase()) {
        case 'firefox':
          console.log('🦊 Connecting to Firefox browser...');
          console.log('⚠️  NOTE: Firefox support on BrowserStack with Playwright may be limited');
          try {
            browser = await firefox.connect(wsEndpoint, {
              timeout: 120000 // 120 seconds timeout for connection
            });
            console.log('✅ Firefox connection established successfully!');          } catch (firefoxError) {
            console.error('❌ Firefox connection failed:', firefoxError);
            
            // Specific handling for BrowserStack Firefox issues
            const errorMessage = firefoxError instanceof Error ? firefoxError.message : String(firefoxError);
            if (errorMessage.includes('Browser has been closed')) {
              console.log('');
              console.log('🔍 FIREFOX BROWSERSTACK COMPATIBILITY ISSUE:');
              console.log('   Firefox may not be fully supported on BrowserStack with Playwright 1.32.0');
              console.log('   This is a known limitation, not a configuration error.');
              console.log('');
              console.log('💡 RECOMMENDED SOLUTIONS:');
              console.log('   1. Use Chrome for BrowserStack cloud testing (verified working)');
              console.log('   2. Use Firefox for local testing only');
              console.log('   3. Set BROWSER_COMBINATION=windows-chrome for cloud tests');
              console.log('');
              console.log('🔧 QUICK FIX: Run with Chrome on BrowserStack:');
              console.log('   EXECUTION_ENV=browserstack BROWSER_COMBINATION=windows-chrome npx cucumber-js --tags @TC002');
              console.log('');
            }
            
            console.log('🔄 Falling back to local Firefox browser...');
            throw firefoxError;
          }
          break;
        case 'webkit':
        case 'safari':
          console.log('🍎 Connecting to WebKit browser...');
          browser = await webkit.connect(wsEndpoint, {
            timeout: 60000
          });
          break;
        case 'chrome':
        case 'chromium':
        default:
          console.log('🌐 Connecting to Chrome browser...');
          browser = await chromium.connect(wsEndpoint, {
            timeout: 60000
          });
          break;
      }

      console.log('✅ BrowserStack cloud connection established');
      
      // Test the browser connection with safer context creation
      try {
        const context = await browser.newContext({
          bypassCSP: true,
          ignoreHTTPSErrors: true
        });
        
        const page = await context.newPage();
        await page.close();
        await context.close();
        console.log('✓ Browser context test successful');
      } catch (contextError) {
        const errorMessage = contextError instanceof Error ? contextError.message : String(contextError);
        console.warn('⚠ Browser context test failed, but connection is working:', errorMessage);
      }
      
      // Generate and show BrowserStack dashboard link
      const dashboardUrl = `https://automate.browserstack.com/dashboard/v2/builds`;
      console.log(`🔗 BrowserStack Dashboard: ${dashboardUrl}`);
      console.log(`📊 Build: ${config.build.name} | Project: ${config.build.project}`);
      
      return browser;    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ BrowserStack cloud connection failed:', errorMessage);
      
      // Provide specific guidance for common issues
      if (errorMessage.includes('Browser has been closed')) {
        console.log('💡 Connection tip: Try using a different browser combination or check BrowserStack compatibility');
        console.log('🔄 Alternative: Set BROWSER_COMBINATION=windows-chrome environment variable');
        console.log('📖 Troubleshooting: https://browserstack.com/docs/automate/playwright/troubleshooting');
      }
        // Check if fallback to local is enabled (environment variable takes precedence)
      const envFallback = process.env.FALLBACK_TO_LOCAL?.toLowerCase() === 'true';
      const configFallback = config.execution.fallbackToLocal ?? false;
      const fallbackEnabled = envFallback || configFallback;
      
      if (fallbackEnabled) {
        console.log('🔄 Fallback to local browser is enabled - switching to local execution...');
        if (envFallback) {
          console.log('   (Enabled via FALLBACK_TO_LOCAL environment variable)');
        } else {
          console.log('   (Enabled via config.yaml: execution.fallbackToLocal)');
        }
        return await this.createLocalBrowser(config);
      } else {
        console.log('❌ Fallback to local browser is disabled');
        console.log('💡 To enable fallback:');
        console.log('   - Set execution.fallbackToLocal: true in config.yaml, OR');
        console.log('   - Use environment variable: FALLBACK_TO_LOCAL=true');
        throw error;
      }
    }
  }
  
  private async getBrowserStackSessionId(browser: Browser): Promise<string | null> {
    try {
      // Try to extract session ID from browser context
      const contexts = browser.contexts();
      if (contexts.length > 0) {
        const pages = contexts[0].pages();
        if (pages.length > 0) {
          // For BrowserStack, the session ID is usually available in the browser's metadata
          // This is a simplified approach - in practice, you might need to use BrowserStack's API
          const cdpSession = await pages[0].context().newCDPSession(pages[0]);
          try {
            const target = await cdpSession.send('Target.getTargetInfo');
            // Extract session ID from target info if available
            return (target as any)?.targetId || null;
          } catch {
            return null;
          }
        }
      }
      return null;
    } catch (error) {
      console.warn('Could not extract BrowserStack session ID:', error);
      return null;
    }
  }
}
