import { Before, After, BeforeAll, AfterAll, BeforeStep, AfterStep } from '@cucumber/cucumber';
import { Page, BrowserContext, Browser } from '@playwright/test';
import { CloudProviderFactory } from '../core/cloudProviderFactory';
import { getConfig, getParallelWorkerInfo } from '../utils/configUtility';
import { markBrowserStackSessionStatus, findRecentBrowserStackSession, setBrowserStackSessionName } from '../utils/browserstackRestApi';
import { Logger } from '../utils/logger';
import { StepLogger } from '../utils/stepLogger';
import { SessionTracker } from '../utils/sessionTracker';
import { VideoRecordingManager } from '../utils/videoRecordingManager';
import { NetworkLoggingManager } from '../utils/networkLoggingManager';
import { RCADataCapture } from '../utils/rcaDataCapture';
import { DOMSnapshotCapture } from '../utils/domSnapshotCapture';
import TestResultsCapture from '../utils/testResultsCapture';

// Optional TCID Manager (non-intrusive)
let testCaseIDManager: any = null;
try {
  const { TestCaseIDManager } = require('../utils/testCaseIDManager');
  testCaseIDManager = TestCaseIDManager.getInstance();
} catch (error) {
  console.log('⚠️ TestCaseIDManager not available, skipping TCID features');
}

let cloudProviderFactory: CloudProviderFactory;
const logger = Logger.getInstance();
const stepLogger = StepLogger.getInstance();
const sessionTracker = SessionTracker.getInstance();
const videoRecorder = VideoRecordingManager.getInstance();
const networkLogger = NetworkLoggingManager.getInstance();
const rcaCapture = RCADataCapture.getInstance();
const domSnapshotCapture = DOMSnapshotCapture.getInstance();
const testCapture = TestResultsCapture.getInstance();

// Initialize TestResultsCleanup with fallback
let resultsCleanup: any;
try {
  const { TestResultsCleanup } = require('../utils/testResultsCleanup.js');
  resultsCleanup = TestResultsCleanup.getInstance();
} catch (error) {
  console.log('⚠️ TestResultsCleanup not available, skipping cleanup features');
  resultsCleanup = null;
}

// Helper function to determine step type from step text
function determineStepType(stepText: string): string {
  const text = stepText.toLowerCase().trim();
  
  // Check for Given/Context steps
  if (text.includes('navigate') || text.includes('open') || text.includes('visit') || 
      text.includes('given') || text.includes('i am on') || text.includes('i have')) {
    return 'GIVEN';
  }
  
  // Check for When/Action steps  
  if (text.includes('enter') || text.includes('click') || text.includes('fill') || 
      text.includes('select') || text.includes('type') || text.includes('press') ||
      text.includes('when') || text.includes('i click') || text.includes('i enter') ||
      text.includes('i select') || text.includes('i fill')) {
    return 'WHEN';
  }
  
  // Check for Then/Assertion steps
  if (text.includes('should') || text.includes('expect') || text.includes('verify') ||
      text.includes('see') || text.includes('then') || text.includes('redirected') ||
      text.includes('displayed') || text.includes('visible') || text.includes('contains')) {
    return 'THEN';
  }
  
  // Check for And/But steps - determine based on context
  if (text.includes('and ') || text.includes('but ')) {
    // For And/But, try to determine based on action words
    if (text.includes('enter') || text.includes('click') || text.includes('select')) {
      return 'WHEN';
    } else if (text.includes('should') || text.includes('see') || text.includes('verify')) {
      return 'THEN';
    } else {
      return 'AND';
    }
  }
  
  return 'STEP';
}

// Helper function to detect browser combination from scenario tags
function detectBrowserCombination(tags: readonly { name: string }[]): string | null {
  const browserTags = ['@chrome', '@firefox', '@safari', '@edge', '@webkit'];
  const osTags = ['@windows', '@mac', '@linux'];
  
  for (const tag of tags) {
    // Check for specific browser combination tags
    if (tag.name === '@windows-chrome') return 'windows-chrome';
    if (tag.name === '@windows-firefox') return 'windows-firefox';
    if (tag.name === '@windows-edge') return 'windows-edge';
    if (tag.name === '@macos-safari') return 'macos-safari';
    if (tag.name === '@mac-safari') return 'macos-safari';
  }
  
  // If no specific combination found, return null to use environment/config default
  return null;
}

BeforeAll({ timeout: 60000 }, async function() {
  cloudProviderFactory = new CloudProviderFactory();
  
  try {
    // Initialize test results capture
    testCapture.reset();
    
    // Configure logging levels based on config and environment variables
    const config = getConfig();
    const consoleLogLevel = (process.env.CONSOLE_LOG_LEVEL || config.logging?.consoleLevel || 'info').toLowerCase();
    const fileLogLevel = (process.env.FILE_LOG_LEVEL || config.logging?.fileLevel || 'debug').toLowerCase();
    
    // Map string levels to numeric levels
    const levelMap: { [key: string]: number } = {
      'debug': 0,
      'info': 1, 
      'warn': 2,
      'error': 3
    };
    
    if (levelMap[consoleLogLevel] !== undefined) {
      logger.setConsoleLogLevel(levelMap[consoleLogLevel]);
      if (consoleLogLevel === 'debug') {
        logger.debug('Console logging set to DEBUG level - all logs will be shown');
      }
    }
    
    if (levelMap[fileLogLevel] !== undefined) {
      logger.setFileLogLevel(levelMap[fileLogLevel]);
    }
    
    logger.info('Initializing test framework...');
    
    // Clean up previous test results before starting new execution
    if (resultsCleanup) {
      await resultsCleanup.cleanupBeforeExecution();
    }
    
    const parallelInfo = getParallelWorkerInfo();
    if (parallelInfo.isParallel) {
      logger.parallel(`Worker ${parallelInfo.workerId}/${parallelInfo.totalWorkers} starting`);
    }    // Display video recording status
    const recordingStatus = videoRecorder.getRecordingStatus();
    logger.info(`📹 Video Recording: ${recordingStatus.enabled ? 'Enabled' : 'Disabled'}`);
    if (recordingStatus.enabled) {
      logger.info(`   Environment: ${recordingStatus.environment}`);
      if (recordingStatus.environment === 'local') {
        logger.info(`   Local Recording: ${recordingStatus.localRecordVideo}`);
        logger.info(`   Directory: ${recordingStatus.directory}`);
      } else {
        logger.info(`   Cloud Recording: ${recordingStatus.cloudRecording ? 'Yes' : 'No'}`);
      }
    }
    
    // Display debugging and network logging status
    const debuggingStatus = networkLogger.getDebuggingStatus();
    logger.info(`🐛 Debugging Features:`);
    logger.info(`   Network Logs: ${debuggingStatus.networkLogs ? 'Enabled' : 'Disabled'}`);
    logger.info(`   Console Capture: ${debuggingStatus.consoleCapture ? 'Enabled' : 'Disabled'}`);
    logger.info(`   Performance Metrics: ${debuggingStatus.performanceMetrics ? 'Enabled' : 'Disabled'}`);
    logger.info(`   HAR Files: ${debuggingStatus.harFiles ? 'Enabled' : 'Disabled'}`);
    logger.info(`   Screenshot on Error: ${debuggingStatus.screenshotOnError ? 'Enabled' : 'Disabled'}`);
    logger.info(`   Page Source: ${debuggingStatus.pageSource ? 'Enabled' : 'Disabled'}`);
    if (debuggingStatus.slowMotion > 0) {
      logger.info(`   Slow Motion: ${debuggingStatus.slowMotion}ms delay`);
    }
    
    logger.success('Test framework initialized successfully');
  } catch (error) {
    logger.error('Framework initialization failed', error);
    throw error;
  }
});

Before({ timeout: 30000 }, async function(scenario) {
  try {
    logger.test(`Starting scenario: "${scenario.pickle.name}"`);
    
    // Initialize test capture for this scenario
    const featureName = scenario.gherkinDocument?.feature?.name || 'Unknown Feature';
    const featureDescription = scenario.gherkinDocument?.feature?.description || '';
    const featureUri = scenario.pickle.uri || 'unknown.feature';
    
    // Start feature if not already started
    if (!testCapture['currentFeature'] || testCapture['currentFeature'].name !== featureName) {
      testCapture.startFeature(featureName, featureDescription, featureUri);
    }
    
    // Initialize step logger for this scenario
    stepLogger.initializeForScenario(featureName, scenario.pickle.name);
    
    // Start scenario with tags
    const tags = scenario.pickle.tags.map(tag => tag.name);
    testCapture.startScenario(scenario.pickle.name, tags);
    
    // Extract Test Case ID if TCID manager is available (minimal, non-intrusive)
    if (testCaseIDManager) {
      try {
        const testCaseInfo = testCaseIDManager.generateTestCaseID(
          scenario.pickle.name,
          featureName,
          scenario.pickle.tags
        );
        // Store only the test case ID for potential use in reporting
        this.testCaseId = testCaseInfo.testCaseId;
      } catch (error) {
        // Silently continue if TCID extraction fails - non-intrusive
        this.testCaseId = 'unknown';
      }
    }
    
    // Store scenario start time for duration calculation
    this.scenarioStartTime = Date.now();
    
    const config = getConfig();
    
    // Detect browser combination from scenario tags
    const browserCombination = detectBrowserCombination(scenario.pickle.tags);
    if (browserCombination) {
      logger.info(`Detected browser combination: ${browserCombination}`);
      process.env.BROWSER_COMBINATION = browserCombination;
    }
    
    // Skip browser creation for API-only tests
    if (process.env.EXECUTION_ENV === 'api') {
      logger.info('Skipping browser creation for API-only test');
      return;
    }
    
    // Create a COMPLETELY NEW browser instance for each test case
    // This is the key change: fresh browser = separate BrowserStack session
    logger.cloud('Creating fresh browser instance for this test...');
    this.browser = await cloudProviderFactory.createBrowser(config);
      // Create fresh context and page with video recording options
    const videoOptions = videoRecorder.getVideoRecordingOptions(scenario.pickle.name);
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      bypassCSP: true,
      ...videoOptions
    });
    
    this.page = await this.context.newPage();
      // Start video recording session
    videoRecorder.startRecording(scenario.pickle.name);
    
    // Initialize network logging and debugging features
    await networkLogger.initializeNetworkLogging(this.page, scenario.pickle.name);
    
    // Set up basic page configurations
    await this.page.setDefaultTimeout(30000);
    await this.page.setDefaultNavigationTimeout(30000);
    
    // Apply slow motion if configured for debugging
    const debugConfig = networkLogger.getDebuggingStatus();
    if (debugConfig.slowMotion > 0) {
      await this.page.setDefaultTimeout(30000 + debugConfig.slowMotion * 10); // Extend timeout for slow motion
      logger.info(`🐌 Slow motion enabled: ${debugConfig.slowMotion}ms delay per action`);
    }
    
    // Navigate to base URL - Commented out to allow individual test pages to control navigation
    // await this.page.goto(config.baseUrl);// For BrowserStack, set session name immediately after page creation
    if (config.execution.environment === 'browserstack' && config.browserstack?.username && config.browserstack?.accessKey) {
      logger.cloud(`Setting up BrowserStack session for: "${scenario.pickle.name}"`);
      
      try {
        // Wait a moment for session to be created in BrowserStack
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Clean up old sessions first
        sessionTracker.cleanupOldSessions();
        
        // Try to find session using worker-specific search to avoid race conditions
        const parallelInfo = getParallelWorkerInfo();
        let sessionId: string | null = null;
        
        // For parallel execution, add a worker-specific delay to avoid race conditions
        if (parallelInfo.isParallel) {
          const workerDelay = parseInt(parallelInfo.workerId || '0') * 2000; // 2 second stagger
          await new Promise(resolve => setTimeout(resolve, workerDelay));
        }
        
        sessionId = await findRecentBrowserStackSession({
          username: config.browserstack.username,
          accessKey: config.browserstack.accessKey,
          buildName: config.build.name,
          maxAgeMinutes: 2 // Extended window for parallel execution
        });
        
        if (sessionId) {
          // Create enhanced session name with browser and worker info
          let sessionName = scenario.pickle.name;
          
          // Add parallel worker info if running in parallel
          if (parallelInfo.isParallel && parallelInfo.displayText) {
            sessionName += ` ${parallelInfo.displayText}`;
          }
          
          await setBrowserStackSessionName({
            sessionId,
            testName: sessionName,
            username: config.browserstack.username,
            accessKey: config.browserstack.accessKey
          });
          
          // Register this session with our tracker
          sessionTracker.registerSession(sessionId, scenario.pickle.name, config.build.name);
          
          this.browserStackSessionId = sessionId;
          logger.success(`BrowserStack session created for: "${sessionName}"`);
          logger.info(`View session: https://automate.browserstack.com/dashboard/v2/sessions/${sessionId}`);
        } else {
          logger.warn('Could not find BrowserStack session - will update later');
        }
      } catch (nameError) {
        logger.warn('Failed to set BrowserStack session name', nameError instanceof Error ? nameError.message : String(nameError));
      }
    }
    
    logger.success('Test environment setup complete');  } catch (error) {
    logger.error('Failed to setup test environment', error);
    throw error;
  }
});

After({ timeout: 60000 }, async function(scenario) {  try {
    logger.test(`Completing scenario: "${scenario.pickle.name}"`);
    
    // Capture test results
    const scenarioEndTime = Date.now();
    const scenarioDuration = this.scenarioStartTime ? scenarioEndTime - this.scenarioStartTime : 0;
    const testPassed = scenario.result?.status === 'PASSED';
    
    // Add steps to test capture based on scenario pickle steps
    if (scenario.pickle.steps) {
      // Determine the correct step definition file based on feature location
      let stepDefFile = 'tests/stepDefs/prestashopE2E.steps.ts:1';
      
      if (scenario.pickle.uri) {
        if (scenario.pickle.uri.includes('tests/api/features/prestashop_unified.feature')) {
          stepDefFile = 'tests/api/stepDefs/prestashopApiSteps.ts:1';
        } else if (scenario.pickle.uri.includes('tests/features/prestashopE2E.feature')) {
          stepDefFile = 'tests/stepDefs/prestashopE2E.steps.ts:1';
        }
      }
      
      for (const step of scenario.pickle.steps) {
        const stepStatus = testPassed ? 'passed' : 'failed';
        const stepDuration = scenarioDuration / scenario.pickle.steps.length; // Distribute duration evenly
        
        testCapture.addStep(
          step.type || 'Step',
          step.text || 'Unknown step',
          stepStatus,
          stepDuration,
          stepDefFile
        );
      }
    }
    
    // Finish the scenario in test capture
    testCapture.finishScenario();
    
    const config = getConfig();
    // Note: testPassed is already defined above
      if (this.page) {
      // Collect performance metrics before cleanup
      await networkLogger.collectPerformanceMetrics(this.page);
      
      // Save network logs and debugging data
      await networkLogger.saveNetworkLogs(scenario.pickle.name, testPassed);
      await networkLogger.saveHarFile(this.page, scenario.pickle.name);
      
      // Handle error-specific debugging features
      if (scenario.result?.status === 'FAILED') {
        // Capture comprehensive RCA data
        try {
          const rcaFilePath = await rcaCapture.captureRCAData(
            this.page, 
            scenario.pickle.name, 
            scenario.result?.message || 'Test failed'
          );
          if (rcaFilePath) {
            logger.info(`🔍 RCA data captured: ${rcaFilePath}`);
          }
        } catch (rcaError) {
          logger.warn('Failed to capture RCA data', rcaError);
        }
        
        // Take error screenshot (NetworkLoggingManager handles the config check)
        await networkLogger.takeErrorScreenshot(this.page, scenario.pickle.name, scenario.result?.message || 'Test failed');
        
        // Save page source for debugging
        await networkLogger.savePageSource(this.page, scenario.pickle.name);
        
        // Also take the standard screenshot for backwards compatibility
        const screenshotPath = `test-results/screenshots/failed-${scenario.pickle.name.replace(/\s+/g, '-')}-${Date.now()}.png`;
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        logger.info(`📸 Screenshot saved: ${screenshotPath}`);
      }

      // Stop video recording and handle the recorded video
      const videoPath = await videoRecorder.stopRecording(this.context, scenario.pickle.name, testPassed);
      if (videoPath) {
        logger.info(`📹 Video recorded: ${videoPath}`);
      }

      // Get cloud video information if applicable
      if (this.browserStackSessionId && ['browserstack', 'saucelabs'].includes(config.execution.environment)) {
        const cloudVideoInfo = videoRecorder.getCloudVideoInfo(this.browserStackSessionId);
        if (cloudVideoInfo.browserstack) {
          logger.info(`📹 BrowserStack video: ${cloudVideoInfo.browserstack}`);
        }
      }

      // Mark test result in BrowserStack
      if (config.execution.environment === 'browserstack') {
        const status = testPassed ? 'passed' : 'failed';
        const reason = scenario.result?.status === 'FAILED' ? scenario.result?.message : undefined;
        
        // Use JavaScript execution to mark test status in BrowserStack (primary method)
        try {
          await this.page.evaluate((data: { status: string; reason?: string }) => {
            if (typeof window !== 'undefined') {
              (window as any).browserstack_executor = {
                action: 'setSessionStatus',
                arguments: {
                  status: data.status,
                  reason: data.reason || ''
                }
              };
            }
          }, { status, reason });
          
          logger.success(`BrowserStack test "${scenario.pickle.name}" marked as ${status}`);
        } catch (evalError) {
          logger.warn('Failed to mark test status in BrowserStack', evalError);
        }        
        // Also try REST API as backup
        try {
          if (this.browserStackSessionId && config.browserstack?.username && config.browserstack?.accessKey) {
            await markBrowserStackSessionStatus({
              sessionId: this.browserStackSessionId,
              status,
              reason,
              username: config.browserstack.username,
              accessKey: config.browserstack.accessKey
            });
            
            logger.success(`BrowserStack session status updated via REST API`);
          }
        } catch (restError) {
          logger.warn('Failed to update BrowserStack session via REST API', restError);
        }
      }

      // Close everything: page -> context -> browser (with timeout protection)
      try {
        if (this.page) {
          await Promise.race([
            this.page.close(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Page close timeout')), 10000))
          ]);
          this.page = null;
        }
      } catch (error) {
        logger.warn('Page close failed or timed out', error);
        this.page = null;
      }
      
      try {
        if (this.context) {
          await Promise.race([
            this.context.close(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Context close timeout')), 10000))
          ]);
          this.context = null;
        }
      } catch (error) {
        logger.warn('Context close failed or timed out', error);
        this.context = null;
      }
      
      try {
        if (this.browser) {
          await Promise.race([
            this.browser.close(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Browser close timeout')), 10000))
          ]);
          this.browser = null;
        }
      } catch (error) {
        logger.warn('Browser close failed or timed out', error);
        this.browser = null;
      }
        this.browserStackSessionId = null;
    }
    
    // Clear network logging data for next test
    networkLogger.clearLogs();
    
    logger.success(`Test "${scenario.pickle.name}" cleanup completed`);
  } catch (error) {
    logger.warn('Cleanup warning', error);
  }
});

AfterAll(async function() {
  try {
    logger.success('All tests completed');
    logger.info(`Log file created: ${logger.getLogFilePath()}`);
    
    // Finish the current feature in test capture
    testCapture.finishFeature();
    
    // Generate and save the JSON report using our captured data
    const path = require('path');
    const jsonReportPath = path.resolve(process.cwd(), 'test-results/cucumber-report.json');
    
    try {
      testCapture.saveJsonReport(jsonReportPath);
      logger.success(`📊 Cucumber JSON report generated: ${jsonReportPath}`);
    } catch (captureError) {
      logger.warn('Failed to generate JSON report from captured data', captureError);
    }
    
    // Display final test results directory status
    if (resultsCleanup) {
      resultsCleanup.displayResultsStatus();
    }
    
    // Wait a moment for file operations to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if JSON report exists - if it does, generate HTML report
    const fs = require('fs');
    
    if (fs.existsSync(jsonReportPath)) {
      // Verify the JSON report has actual test data (not empty)
      const jsonContent = fs.readFileSync(jsonReportPath, 'utf8');
      if (jsonContent && jsonContent.trim() !== '[]' && jsonContent.trim() !== '') {
        logger.info('Attempting to generate HTML report from Cucumber JSON...');
        await generateHtmlReport();
      } else {
        logger.warn('JSON report exists but is empty. Skipping HTML generation.');
      }
    } else {
      logger.warn('JSON report not found. This indicates an issue with Cucumber\'s JSON formatter.');
      logger.warn('Check cucumber.js configuration and ensure JSON formatter is properly configured.');
    }
    
    // Generate RCA summary
    try {
      logger.info('Generating RCA data summary...');
      rcaCapture.generateRCASummary();
      logger.success('✅ RCA data summary generated');
    } catch (rcaError) {
      logger.warn('Failed to generate RCA summary', rcaError);
    }
    
    logger.success('✅ Test execution completed successfully');
  } catch (error) {
    logger.warn('Final cleanup warning', error);
  }
});

// Function to generate HTML report
async function generateHtmlReport(): Promise<void> {
  try {
    const path = require('path');
    const fs = require('fs');
    const reporter = require('cucumber-html-reporter');
    
    const jsonFilePath = path.resolve(process.cwd(), 'test-results/cucumber-report.json');
    const htmlFilePath = path.resolve(process.cwd(), 'test-results/cucumber-report.html');
    
    // Check if JSON report exists
    if (!fs.existsSync(jsonFilePath)) {
      logger.warn('JSON report not found, skipping HTML generation');
      return;
    }
    
    logger.info('Generating HTML report...');
    
    // Get current configuration for metadata
    const config = getConfig();
    const parallelInfo = getParallelWorkerInfo();
    
    reporter.generate({
      theme: 'bootstrap',
      jsonFile: jsonFilePath,
      output: htmlFilePath,
      reportSuiteAsScenarios: true,
      launchReport: false, // Don't auto-open in automation
      metadata: {
        "App Version": "1.0.0",
        "Test Environment": config.execution.environment.toUpperCase(),
        "Browser": process.env.BROWSER_COMBINATION || "chrome",
        "Platform": "Windows 10",
        "Parallel": parallelInfo.isParallel ? `${parallelInfo.totalWorkers} Workers` : "Single Worker",
        "Executed": config.execution.environment === 'local' ? 'Local' : 'BrowserStack Cloud',
        "Build": config.build.name || 'Unknown',
        "Project": config.build.project || 'FusionIQ Test'
      }
    });
    
    logger.success(`HTML Report generated: ${htmlFilePath}`);
    console.log(`📊 HTML Report: ${htmlFilePath}`);
  } catch (error) {
    logger.error('Failed to generate HTML report', error);
  }
}

// Export for testing purposes
export { cloudProviderFactory };

// Step-level hooks for automatic logging
BeforeStep(async function(testStep) {
  try {
    const stepText = testStep.pickleStep?.text || 'Unknown step';
    // Determine step type from the step text pattern
    const stepType = determineStepType(stepText);
    
    // Reset step counter for first step of scenario
    if (!this.stepCounterInitialized) {
      stepLogger.resetStepCounter();
      this.stepCounterInitialized = true;
    }
    
    // Log step start with page state if available
    if (this.page) {
      await stepLogger.logStepWithPageState(stepText, this.page, stepType);
    } else {
      stepLogger.logStepStart(stepText, stepType);
    }
    
    // Store step start time for duration calculation
    this.currentStepStartTime = Date.now();
    this.currentStepText = stepText;
    
  } catch (error) {
    logger.warn('Failed to log step start', error);
  }
});

AfterStep(async function(testStep) {
  try {
    const status = testStep.result?.status;
    let stepStatus: 'PASSED' | 'FAILED' | 'SKIPPED' = 'PASSED';
    
    if (status === 'FAILED') {
      stepStatus = 'FAILED';
    } else if (status === 'SKIPPED' || status === 'PENDING') {
      stepStatus = 'SKIPPED';
    }
    
    // Log step completion
    stepLogger.logStepEnd(stepStatus, testStep.result?.message);
    
    // If step failed, capture additional debug info
    if (stepStatus === 'FAILED' && this.page) {
      try {
        // Capture page state for failed step
        const url = this.page.url();
        const title = await this.page.title().catch(() => 'Unable to get title');
        
        logger.error(`Failed Step Context - URL: ${url}, Title: ${title}`);
        
        // Capture DOM snapshot for RCA
        try {
          const stepText = testStep.pickleStep?.text || 'unknown-step';
          const snapshots = await domSnapshotCapture.captureDOMSnapshot(
            this.page,
            stepText,
            'step-failure'
          );
          
          logger.info(`📊 DOM snapshot captured for failed step`);
          logger.debug(`   Full HTML: ${snapshots.htmlPath}`);
          logger.debug(`   DOM tree: ${snapshots.treePath}`);
          
          // Try to identify the failing element if possible
          if (testStep.result?.message) {
            const errorMessage = testStep.result.message;
            // Look for selector patterns in the error message
            const selectorMatch = errorMessage.match(/('|"|`)([^'"]+)('|"|`)/);
            if (selectorMatch && selectorMatch[2]) {
              const possibleSelector = selectorMatch[2];
              try {
                // Attempt to capture context around the failing element
                await domSnapshotCapture.captureElementSnapshot(
                  this.page, 
                  stepText,
                  possibleSelector
                );
              } catch (elementErr) {
                // Silently continue if element capture fails
              }
            }
          }
        } catch (domError) {
          logger.warn('Failed to capture DOM snapshot', domError);
        }
        
        // Log any visible error messages on the page
        try {
          const errorElements = await this.page.$$('text=/error|Error|invalid|Invalid/i');
          if (errorElements.length > 0) {
            for (let i = 0; i < Math.min(errorElements.length, 3); i++) {
              const errorText = await errorElements[i].textContent();
              if (errorText?.trim()) {
                logger.error(`Page Error Message: ${errorText.trim()}`);
              }
            }
          }
        } catch (e) {
          // Silently ignore if we can't get error messages
        }
        
        // Comprehensive RCA data capture for failed step
        try {
          const stepText = testStep.pickleStep?.text || 'unknown-step';
          const rcaFilePath = await rcaCapture.captureRCAData(
            this.page, 
            stepText, 
            testStep.result?.message || 'Step failed without specific error message'
          );
          logger.info(`🔍 Comprehensive RCA data captured: ${rcaFilePath}`);
        } catch (rcaError) {
          logger.warn('Failed to capture comprehensive RCA data', rcaError);
        }
        
      } catch (error) {
        logger.warn('Failed to capture step failure context', error);
      }
    }
    
  } catch (error) {
    logger.warn('Failed to log step completion', error);
  }
});
