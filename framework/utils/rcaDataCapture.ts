import { Page } from '@playwright/test';
import { Logger } from './logger';
import { DOMSnapshotCapture } from './domSnapshotCapture';
import * as fs from 'fs';
import * as path from 'path';

export interface RCAData {
  timestamp: string;
  stepName: string;
  errorMessage: string;
  pageState: {
    url: string;
    title: string;
    readyState: string;
    viewport: { width: number; height: number } | null;
  };
  browserInfo: {
    userAgent: string;
    platform: string;
    language: string;
  };
  networkActivity: {
    pendingRequests: number;
    lastRequests: Array<{
      url: string;
      method: string;
      status?: number;
      timestamp: string;
    }>;
  };
  domState: {
    elementCount: number;
    visibleElements: number;
    forms: number;
    inputs: number;
  };
  consoleErrors: string[];
  screenshots: {
    fullPage?: string;
    viewport?: string;
  };
  pageSource?: string;
  domSnapshots?: {
    htmlPath?: string;
    treePath?: string;
    elementSnapshotPath?: string;
  };
}

export class RCADataCapture {
  private static instance: RCADataCapture;
  private logger: Logger;
  private rcaDir: string;

  private constructor() {
    this.logger = Logger.getInstance();
    this.rcaDir = path.resolve(process.cwd(), 'test-results', 'rca-data');
    this.ensureRCADirectory();
  }

  public static getInstance(): RCADataCapture {
    if (!RCADataCapture.instance) {
      RCADataCapture.instance = new RCADataCapture();
    }
    return RCADataCapture.instance;
  }

  private ensureRCADirectory(): void {
    if (!fs.existsSync(this.rcaDir)) {
      fs.mkdirSync(this.rcaDir, { recursive: true });
    }
  }

  /**
   * Capture comprehensive RCA data for a failed step
   */
  public async captureRCAData(page: Page, stepName: string, error: any): Promise<string> {
    const timestamp = new Date().toISOString();
    const filename = `rca_${stepName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp.replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(this.rcaDir, filename);

    try {
      const rcaData: RCAData = {
        timestamp,
        stepName,
        errorMessage: error?.message || String(error),
        pageState: await this.capturePageState(page),
        browserInfo: await this.captureBrowserInfo(page),
        networkActivity: await this.captureNetworkActivity(page),
        domState: await this.captureDOMState(page),
        consoleErrors: await this.captureConsoleErrors(page),
        screenshots: await this.captureScreenshots(page, stepName, timestamp),
        pageSource: await this.capturePageSource(page),
        domSnapshots: await this.captureDOMSnapshots(page, stepName)
      };

      fs.writeFileSync(filepath, JSON.stringify(rcaData, null, 2));
      this.logger.info(`RCA data captured: ${filepath}`);
      
      return filepath;
    } catch (captureError) {
      this.logger.error('Failed to capture RCA data', captureError);
      return '';
    }
  }

  private async capturePageState(page: Page): Promise<RCAData['pageState']> {
    try {
      return {
        url: page.url(),
        title: await page.title().catch(() => 'Unable to get title'),
        readyState: await page.evaluate(() => document.readyState).catch(() => 'unknown'),
        viewport: page.viewportSize()
      };
    } catch (error) {
      this.logger.warn('Failed to capture page state', error);
      return {
        url: 'unknown',
        title: 'unknown',
        readyState: 'unknown',
        viewport: null
      };
    }
  }

  private async captureBrowserInfo(page: Page): Promise<RCAData['browserInfo']> {
    try {
      return await page.evaluate(() => ({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      }));
    } catch (error) {
      this.logger.warn('Failed to capture browser info', error);
      return {
        userAgent: 'unknown',
        platform: 'unknown',
        language: 'unknown'
      };
    }
  }

  private async captureNetworkActivity(page: Page): Promise<RCAData['networkActivity']> {
    try {
      // This would be enhanced with actual network monitoring
      // For now, return basic structure
      return {
        pendingRequests: 0,
        lastRequests: []
      };
    } catch (error) {
      this.logger.warn('Failed to capture network activity', error);
      return {
        pendingRequests: 0,
        lastRequests: []
      };
    }
  }

  private async captureDOMState(page: Page): Promise<RCAData['domState']> {
    try {
      return await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        const visibleElements = document.querySelectorAll('*:not([style*="display: none"]):not([hidden])');
        const forms = document.querySelectorAll('form');
        const inputs = document.querySelectorAll('input, textarea, select');

        return {
          elementCount: allElements.length,
          visibleElements: visibleElements.length,
          forms: forms.length,
          inputs: inputs.length
        };
      });
    } catch (error) {
      this.logger.warn('Failed to capture DOM state', error);
      return {
        elementCount: 0,
        visibleElements: 0,
        forms: 0,
        inputs: 0
      };
    }
  }

  private async captureConsoleErrors(page: Page): Promise<string[]> {
    try {
      // This would be populated by console event listeners
      // For now, try to get any runtime errors
      return await page.evaluate(() => {
        const errors: string[] = [];
        // In a real implementation, we would have proper console listeners
        // that would capture errors and store them for later retrieval
        // This is just a placeholder for the actual implementation
        return errors;
      });
    } catch (error) {
      this.logger.warn('Failed to capture console errors', error);
      return [];
    }
  }

  private async captureScreenshots(page: Page, stepName: string, timestamp: string): Promise<RCAData['screenshots']> {
    const screenshots: RCAData['screenshots'] = {};
    
    try {
      const screenshotDir = path.resolve(process.cwd(), 'test-results', 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      const baseFilename = `rca_${stepName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp.replace(/[:.]/g, '-')}`;
      
      // Full page screenshot
      const fullPagePath = path.join(screenshotDir, `${baseFilename}_fullpage.png`);
      await page.screenshot({ path: fullPagePath, fullPage: true });
      screenshots.fullPage = fullPagePath;

      // Viewport screenshot
      const viewportPath = path.join(screenshotDir, `${baseFilename}_viewport.png`);
      await page.screenshot({ path: viewportPath, fullPage: false });
      screenshots.viewport = viewportPath;

    } catch (error) {
      this.logger.warn('Failed to capture screenshots', error);
    }

    return screenshots;
  }

  private async capturePageSource(page: Page): Promise<string | undefined> {
    try {
      const sourceDir = path.resolve(process.cwd(), 'test-results', 'page-sources');
      if (!fs.existsSync(sourceDir)) {
        fs.mkdirSync(sourceDir, { recursive: true });
      }

      const content = await page.content();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `page_source_${timestamp}.html`;
      const filepath = path.join(sourceDir, filename);
      
      fs.writeFileSync(filepath, content);
      return filepath;
    } catch (error) {
      this.logger.warn('Failed to capture page source', error);
      return undefined;
    }
  }

  private async captureDOMSnapshots(page: Page, stepName: string): Promise<RCAData['domSnapshots']> {
    try {
      const domSnapshotCapture = DOMSnapshotCapture.getInstance();
      const { htmlPath, treePath } = await domSnapshotCapture.captureDOMSnapshot(
        page, 
        stepName, 
        'failure'
      );
      
      // Try to find the element with focus for more context
      const focusedElementSnapshot = await this.captureFocusedElementSnapshot(page, stepName, domSnapshotCapture);
      
      return {
        htmlPath,
        treePath,
        elementSnapshotPath: focusedElementSnapshot
      };
    } catch (error) {
      this.logger.warn('Failed to capture DOM snapshots', error);
      return {};
    }
  }

  private async captureFocusedElementSnapshot(
    page: Page, 
    stepName: string, 
    domSnapshotCapture: DOMSnapshotCapture
  ): Promise<string | undefined> {
    try {
      // Try to determine which element has focus or was interacted with
      const focusedElementSelector = await page.evaluate(() => {
        const focused = document.activeElement;
        if (focused && focused !== document.body) {
          // Generate a selector for this element
          // This is a simple implementation - in production, you'd want something more robust
          if (focused.id) {
            return `#${focused.id}`;
          } else if (focused.getAttribute('name')) {
            return `[name="${focused.getAttribute('name')}"]`;
          } else {
            // Try to get a CSS selector path
            const getPath = (element: Element): string => {
              if (!element || element === document.body) return 'body';
              const parent = element.parentElement;
              if (!parent) return element.tagName.toLowerCase();
              
              // Get all siblings of the same type
              const siblings = Array.from(parent.children).filter(
                child => child.tagName === element.tagName
              );
              
              // If there are multiple siblings, add an index
              const index = siblings.indexOf(element) + 1;
              const indexSuffix = siblings.length > 1 ? `:nth-child(${index})` : '';
              
              return `${getPath(parent)} > ${element.tagName.toLowerCase()}${indexSuffix}`;
            };
            
            return getPath(focused);
          }
        }
        return null;
      });
      
      if (focusedElementSelector) {
        return await domSnapshotCapture.captureElementSnapshot(page, stepName, focusedElementSelector);
      }
      
      return undefined;
    } catch (error) {
      this.logger.warn('Failed to capture focused element snapshot', error);
      return undefined;
    }
  }

  /**
   * Generate RCA summary report
   */
  public generateRCASummary(): void {
    try {
      const rcaFiles = fs.readdirSync(this.rcaDir).filter(f => f.endsWith('.json'));
      
      if (rcaFiles.length === 0) {
        this.logger.info('No RCA data files found for summary');
        return;
      }

      const summaryPath = path.join(this.rcaDir, 'rca_summary.json');
      const summary = {
        generatedAt: new Date().toISOString(),
        totalFailures: rcaFiles.length,
        files: rcaFiles,
        commonPatterns: this.analyzeCommonPatterns(rcaFiles)
      };

      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      this.logger.info(`RCA summary generated: ${summaryPath}`);
    } catch (error) {
      this.logger.error('Failed to generate RCA summary', error);
    }
  }

  private analyzeCommonPatterns(rcaFiles: string[]): any {
    // This could be enhanced to analyze common failure patterns
    return {
      analysis: 'Basic pattern analysis would be implemented here',
      recommendations: []
    };
  }
}
