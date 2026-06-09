import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

/**
 * Utility for capturing DOM snapshots to assist in Root Cause Analysis
 */
export class DOMSnapshotCapture {
  private static instance: DOMSnapshotCapture;
  private logger: Logger;
  private snapshotsDir: string;
  
  private constructor() {
    this.logger = Logger.getInstance();
    this.snapshotsDir = path.resolve(process.cwd(), 'test-results', 'dom-snapshots');
    this.ensureSnapshotsDirectory();
  }
  
  public static getInstance(): DOMSnapshotCapture {
    if (!DOMSnapshotCapture.instance) {
      DOMSnapshotCapture.instance = new DOMSnapshotCapture();
    }
    return DOMSnapshotCapture.instance;
  }
  
  private ensureSnapshotsDirectory(): void {
    if (!fs.existsSync(this.snapshotsDir)) {
      fs.mkdirSync(this.snapshotsDir, { recursive: true });
    }
  }
  
  /**
   * Captures the current DOM state as HTML and generates a simplified DOM tree structure
   * @param page The Playwright page to capture DOM from
   * @param stepName Name of the step when capturing (for file naming)
   * @param reason Reason for capturing the DOM (e.g. "step-failure", "assertion-failure")
   * @returns Path to the saved snapshot files
   */
  public async captureDOMSnapshot(page: Page, stepName: string, reason: string): Promise<{htmlPath: string, treePath: string}> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedStepName = stepName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const baseFilename = `dom-snapshot_${sanitizedStepName}_${reason}_${timestamp}`;
      
      // 1. Capture full HTML
      const htmlPath = path.join(this.snapshotsDir, `${baseFilename}.html`);
      const html = await page.content();
      fs.writeFileSync(htmlPath, html);
      
      // 2. Generate simplified DOM tree for easier analysis
      const treePath = path.join(this.snapshotsDir, `${baseFilename}.tree.txt`);
      const domTree = await this.generateDOMTree(page);
      fs.writeFileSync(treePath, domTree);
      
      this.logger.info(`DOM snapshot captured for "${stepName}" (${reason})`);
      this.logger.debug(`  Full HTML: ${htmlPath}`);
      this.logger.debug(`  DOM tree: ${treePath}`);
      
      return { htmlPath, treePath };
    } catch (error) {
      this.logger.error(`Failed to capture DOM snapshot: ${error}`);
      return { htmlPath: '', treePath: '' };
    }
  }
  
  /**
   * Captures DOM snapshots with focus on specific elements
   * @param page The Playwright page
   * @param stepName Name of the step
   * @param selector Selector of element to focus on
   * @returns Path to saved snapshot
   */
  public async captureElementSnapshot(page: Page, stepName: string, selector: string): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedStepName = stepName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const baseFilename = `element-snapshot_${sanitizedStepName}_${timestamp}`;
      const filePath = path.join(this.snapshotsDir, `${baseFilename}.html`);
      
      // Get element-focused HTML
      const elementHTML = await this.captureElementContext(page, selector);
      fs.writeFileSync(filePath, elementHTML);
      
      this.logger.info(`Element snapshot captured for "${stepName}" (selector: ${selector})`);
      this.logger.debug(`  Element context: ${filePath}`);
      
      return filePath;
    } catch (error) {
      this.logger.error(`Failed to capture element snapshot: ${error}`);
      return '';
    }
  }
  
  /**
   * Captures DOM snapshot when a locator fallback occurs
   * This helps identify when locators need to be updated
   * @param page The Playwright page
   * @param stepName Name of the step where fallback occurred
   * @param primarySelector The primary selector that failed
   * @param fallbackSelector The fallback selector that succeeded
   * @returns Paths to the saved DOM snapshot files
   */
  public async captureFallbackLocatorSnapshot(
    page: Page, 
    stepName: string, 
    primarySelector: string, 
    fallbackSelector: string
  ): Promise<{htmlPath: string, treePath: string, elementPath: string}> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedStepName = stepName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const baseFilename = `fallback_locator_${sanitizedStepName}_${timestamp}`;
      
      // 1. Capture full HTML with special comment describing the fallback
      const htmlPath = path.join(this.snapshotsDir, `${baseFilename}.html`);
      let html = await page.content();
      
      // Add diagnostic information as HTML comments at the top of the file
      const diagnosticInfo = `
<!--
LOCATOR FALLBACK DETECTED
Step: ${stepName}
Primary selector (failed): ${primarySelector}
Fallback selector (succeeded): ${fallbackSelector}
Timestamp: ${new Date().toISOString()}
-->
`;
      html = diagnosticInfo + html;
      fs.writeFileSync(htmlPath, html);
      
      // 2. Generate DOM tree with fallback info
      const treePath = path.join(this.snapshotsDir, `${baseFilename}.tree.txt`);
      let domTree = await this.generateDOMTree(page);
      
      // Add fallback info at the top of the tree file
      const treeInfo = `
LOCATOR FALLBACK DETECTED
=========================
Step: ${stepName}
Primary selector (failed): ${primarySelector}
Fallback selector (succeeded): ${fallbackSelector}
Timestamp: ${new Date().toISOString()}
=========================

`;
      domTree = treeInfo + domTree;
      fs.writeFileSync(treePath, domTree);
      
      // 3. Capture specific element context using the fallback selector
      let elementPath = '';
      try {
        elementPath = await this.captureElementSnapshot(page, `fallback_${stepName}`, fallbackSelector);
        
        // Add special note to the element snapshot
        if (elementPath) {
          let elementHtml = fs.readFileSync(elementPath, 'utf-8');
          const elementNote = `
<!-- 
LOCATOR FALLBACK NOTE: 
This element was located using the fallback selector: ${fallbackSelector}
The primary selector failed: ${primarySelector}
-->
`;
          elementHtml = elementNote + elementHtml;
          fs.writeFileSync(elementPath, elementHtml);
        }
      } catch (elementError) {
        this.logger.warn(`Failed to capture element snapshot for fallback selector: ${elementError}`);
      }
      
      this.logger.info(`⚠️ Locator fallback detected: "${primarySelector}" ➝ "${fallbackSelector}"`);
      this.logger.info(`🔍 DOM snapshot captured for locator fallback in "${stepName}"`);
      this.logger.debug(`  Full HTML: ${htmlPath}`);
      this.logger.debug(`  DOM tree: ${treePath}`);
      if (elementPath) {
        this.logger.debug(`  Element context: ${elementPath}`);
      }
      
      return { htmlPath, treePath, elementPath };
    } catch (error) {
      this.logger.error(`Failed to capture DOM snapshot for locator fallback: ${error}`);
      return { htmlPath: '', treePath: '', elementPath: '' };
    }
  }
  
  /**
   * Generate a simplified DOM tree for easier analysis
   * @param page Playwright page
   * @returns Text representation of DOM tree
   */
  private async generateDOMTree(page: Page): Promise<string> {
    return await page.evaluate(() => {
      let output = '';
      const maxDepth = 20;  // Prevent infinite recursion
      const maxChildrenPerNode = 20;  // Limit children for readability
      
      function processNode(node: Element, depth: number): void {
        if (depth > maxDepth) return;
        
        // Create indent based on depth
        const indent = '  '.repeat(depth);
        
        // Get node info
        const id = node.id ? `#${node.id}` : '';
        const classes = node.className && typeof node.className === 'string' ? 
          `.${node.className.split(' ').join('.')}` : '';
        const nodeType = node.nodeType;
        
        // Add to output
        output += `${indent}<${node.tagName.toLowerCase()}${id}${classes}`;
        
        // Add key attributes
        if (node.hasAttribute('name')) {
          output += ` name="${node.getAttribute('name')}"`;
        }
        if (node.hasAttribute('type')) {
          output += ` type="${node.getAttribute('type')}"`;
        }
        if (node.hasAttribute('placeholder')) {
          output += ` placeholder="${node.getAttribute('placeholder')}"`;
        }
        
        output += '>\n';
        
        // Process children
        const children = node.children;
        const childCount = children.length;
        if (childCount > 0) {
          // Limit number of children to prevent massive output
          const childrenToProcess = Math.min(childCount, maxChildrenPerNode);
          for (let i = 0; i < childrenToProcess; i++) {
            processNode(children[i], depth + 1);
          }
          if (childCount > maxChildrenPerNode) {
            output += `${indent}  ... (${childCount - maxChildrenPerNode} more children)\n`;
          }
        }
      }
      
      // Start with document element (usually <html>)
      processNode(document.documentElement, 0);
      return output;
    });
  }
  
  /**
   * Capture HTML context around a specific element
   * @param page Playwright page
   * @param selector Selector for element to focus on
   * @returns HTML fragment with context
   */
  private async captureElementContext(page: Page, selector: string): Promise<string> {
    try {
      // First, use Playwright's built-in mechanisms to get the element
      // This works with both CSS and XPath selectors
      const elementHandle = await page.$(selector);
      if (!elementHandle) {
        return `<!-- Element not found: ${selector} -->`;
      }
      
      // Get element's outer HTML with context
      return await elementHandle.evaluate((element) => {
        // Get parent chain for context
        let html = '';
        let currentElement: Element = element;
        const maxParents = 3; // How many parent levels to include
        
        // Get parent elements (for context)
        const parents: Element[] = [];
        for (let i = 0; i < maxParents && currentElement && currentElement.parentElement; i++) {
          const parent = currentElement.parentElement;
          parents.unshift(parent); // Add to beginning
          currentElement = parent;
        }
        
        // Create HTML with parent hierarchy
        let openTags = '';
        for (const parent of parents) {
          // Get minimal representation of parent tag
          const tagName = parent.tagName.toLowerCase();
          const id = parent.id ? ` id="${parent.id}"` : '';
          const classList = parent.className ? ` class="${parent.className}"` : '';
          
          openTags += `<${tagName}${id}${classList}>\n`;
          html += openTags;
        }
        
        // Add the element itself with full content
        const elementHTML = element.outerHTML;
        html += `  ${elementHTML}\n`;
        
        // Close parent tags
        for (let i = parents.length - 1; i >= 0; i--) {
          html += `</${parents[i].tagName.toLowerCase()}>\n`;
        }
        
        return html;
      });
    } catch (error) {
      return `<!-- Error capturing element context: ${error} -->`;
    }
  }
  
  /**
   * Generate a summary of DOM snapshots for HTML report
   * @returns HTML content for report
   */
  public generateSnapshotSummary(): string {
    try {
      if (!fs.existsSync(this.snapshotsDir)) {
        return '<p>No DOM snapshots available</p>';
      }
      
      const files = fs.readdirSync(this.snapshotsDir);
      if (files.length === 0) {
        return '<p>No DOM snapshots available</p>';
      }
      
      // Group files by test/step
      const snapshotsByStep: {[key: string]: {html?: string, tree?: string}[]} = {};
      
      for (const file of files) {
        // Extract step name and type from filename
        const match = file.match(/^(dom|element)-snapshot_([^_]+)_(.+)\.(.+)$/);
        if (!match) continue;
        
        const [_, type, stepName, timestamp, ext] = match;
        
        if (!snapshotsByStep[stepName]) {
          snapshotsByStep[stepName] = [];
        }
        
        if (ext === 'html') {
          snapshotsByStep[stepName].push({
            html: path.join(this.snapshotsDir, file)
          });
        } else if (ext === 'tree.txt') {
          snapshotsByStep[stepName].push({
            tree: path.join(this.snapshotsDir, file)
          });
        }
      }
      
      // Generate HTML summary
      let html = '<h2>DOM Snapshots</h2>';
      
      for (const [stepName, snapshots] of Object.entries(snapshotsByStep)) {
        html += `<h3>Step: ${stepName.replace(/_/g, ' ')}</h3><ul>`;
        
        for (const snapshot of snapshots) {
          if (snapshot.html) {
            html += `<li><a href="${snapshot.html}">HTML Snapshot</a></li>`;
          }
          if (snapshot.tree) {
            html += `<li><a href="${snapshot.tree}">DOM Tree</a></li>`;
          }
        }
        
        html += '</ul>';
      }
      
      return html;
    } catch (error) {
      return `<p>Error generating snapshot summary: ${error}</p>`;
    }
  }
}
