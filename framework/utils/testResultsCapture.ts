/**
 * Test Results Capture Utility
 * Captures test execution data to generate proper cucumber reports
 */

export interface TestStep {
  keyword: string;
  name: string;
  line: number;
  result: {
    status: 'passed' | 'failed' | 'skipped' | 'pending' | 'undefined';
    duration: number;
    error_message?: string;
  };
  match?: {
    location: string;
  };
}

export interface TestScenario {
  id: string;
  name: string;
  line: number;
  description: string;
  keyword: string;
  tags: Array<{ name: string; line: number }>;
  steps: TestStep[];
  type: string;
}

export interface TestFeature {
  id: string;
  name: string;
  line: number;
  keyword: string;
  description: string;
  uri: string;
  tags: Array<{ name: string; line: number }>;
  elements: TestScenario[];
}

class TestResultsCapture {
  private static instance: TestResultsCapture;
  private currentFeature: TestFeature | null = null;
  private currentScenario: TestScenario | null = null;
  private currentSteps: TestStep[] = [];
  private features: TestFeature[] = [];

  private constructor() {}

  public static getInstance(): TestResultsCapture {
    if (!TestResultsCapture.instance) {
      TestResultsCapture.instance = new TestResultsCapture();
    }
    return TestResultsCapture.instance;
  }

  public startFeature(featureName: string, description: string, uri: string): void {
    this.currentFeature = {
      id: this.sanitizeId(featureName),
      name: featureName,
      line: 1,
      keyword: 'Feature',
      description: description,
      uri: uri,
      tags: [],
      elements: []
    };
  }

  public startScenario(scenarioName: string, tags: string[] = []): void {
    if (!this.currentFeature) {
      throw new Error('Cannot start scenario without starting feature first');
    }

    const scenarioId = `${this.currentFeature.id};${this.sanitizeId(scenarioName)}`;

    this.currentScenario = {
      id: scenarioId,
      name: scenarioName,
      line: 1,
      description: '',
      keyword: 'Scenario',
      tags: tags.map((tag, index) => ({ name: tag, line: index + 1 })),
      steps: [],
      type: 'scenario'
    };
    this.currentSteps = [];
  }

  public addStep(keyword: string, name: string, status: 'passed' | 'failed' | 'skipped' | 'pending', duration: number = 0, location?: string): void {
    if (!this.currentScenario) {
      throw new Error('Cannot add step without starting scenario first');
    }

    const step: TestStep = {
      keyword: keyword.trim() + ' ',
      name: name,
      line: this.currentSteps.length + 1,
      result: {
        status,
        duration: duration * 1000000, // Convert to nanoseconds
      },
      match: location ? { location } : undefined
    };

    this.currentSteps.push(step);
  }

  public finishScenario(): void {
    if (this.currentScenario && this.currentFeature) {
      this.currentScenario.steps = [...this.currentSteps];
      this.currentFeature.elements.push(this.currentScenario);
      this.currentScenario = null;
      this.currentSteps = [];
    }
  }

  public finishFeature(): void {
    if (this.currentFeature) {
      this.features.push(this.currentFeature);
      this.currentFeature = null;
    }
  }

  public generateJsonReport(): TestFeature[] {
    return [...this.features];
  }

  public saveJsonReport(filePath: string): void {
    const fs = require('fs');
    const path = require('path');
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const report = this.generateJsonReport();
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  }

  public reset(): void {
    this.features = [];
    this.currentFeature = null;
    this.currentScenario = null;
    this.currentSteps = [];
  }

  private sanitizeId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
}

export default TestResultsCapture;
