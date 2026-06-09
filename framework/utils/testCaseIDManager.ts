/**
 * Minimal Test Case ID Manager - NO REPORTING, NO LOOPS
 * Just extracts TCID from tags or generates a fallback
 */

import * as yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';

interface TCMConfig {
  tcm_patterns: Record<string, {
    pattern: string;
    example: string;
  }>;
  settings: {
    active_patterns: string[];
    missing_id_message: string;
  };
}

interface TestCaseInfo {
  testCaseId: string;
  hasTCMTag: boolean;
  tcmTag?: string;
}

export class TestCaseIDManager {
  private static instance: TestCaseIDManager;
  private config: TCMConfig;

  private constructor() {
    this.config = this.loadConfiguration();
  }

  public static getInstance(): TestCaseIDManager {
    if (!TestCaseIDManager.instance) {
      TestCaseIDManager.instance = new TestCaseIDManager();
    }
    return TestCaseIDManager.instance;
  }

  private loadConfiguration(): TCMConfig {
    try {
      const configPath = path.join(process.cwd(), 'framework', 'config', 'tcm-patterns.yaml');
      const configContent = fs.readFileSync(configPath, 'utf-8');
      return yaml.parse(configContent);
    } catch (error) {
      // Return default config if file not found
      return {
        tcm_patterns: {
          generic: {
            pattern: "^(TC|TEST|ID)\\d+$",
            example: "@TC001"
          }
        },
        settings: {
          active_patterns: ["generic"],
          missing_id_message: "missingTCID"
        }
      };
    }
  }

  /**
   * Extract TCID from scenario tags - MINIMAL VERSION
   */
  public generateTestCaseID(
    scenarioName: string,
    featureName: string,
    tags: any[]
  ): TestCaseInfo {
    // Simple tag extraction
    const allTags = tags.map(tag => tag.name || tag);
    const tcmTag = this.findTCMTag(allTags);
    
    if (tcmTag) {
      return {
        testCaseId: tcmTag.replace('@', ''),
        hasTCMTag: true,
        tcmTag
      };
    } else {
      // Generate simple fallback ID
      const timestamp = Date.now().toString().slice(-4);
      return {
        testCaseId: `${this.config.settings.missing_id_message}_${timestamp}`,
        hasTCMTag: false
      };
    }
  }

  /**
   * Find TCM tag using configured patterns
   */
  private findTCMTag(tags: string[]): string | undefined {
    for (const tag of tags) {
      const cleanTag = tag.replace('@', '');
      
      // Check against all active patterns from config
      for (const patternName of this.config.settings.active_patterns) {
        const pattern = this.config.tcm_patterns[patternName];
        if (pattern) {
          const regex = new RegExp(pattern.pattern);
          if (regex.test(cleanTag)) {
            return tag; // Return the original tag with @
          }
        }
      }
    }
    return undefined;
  }
}
