/**
 * Evaluation Runner - Executes evaluation test suites
 */

import {
  EvaluationConfig,
  TestSuite,
  TestScenario,
  EvaluationResult,
  TestResult,
  AssertionResult,
  MetricResult,
  Issue,
  Recommendation,
  ExecutionEnvironment
} from './types';
import { ScenarioGenerator } from './scenario-generator';

export class EvaluationRunner {
  private scenarioGenerator: ScenarioGenerator;
  private activeEnvironment: ExecutionEnvironment | null = null;
  private metricsCollector: Map<string, any[]>;
  private executionId: string;
  
  constructor() {
    this.scenarioGenerator = new ScenarioGenerator();
    this.metricsCollector = new Map();
    this.executionId = '';
  }
  
  async runEvaluation(
    config: EvaluationConfig,
    environment: ExecutionEnvironment
  ): Promise<EvaluationResult> {
    this.executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.activeEnvironment = environment;
    this.metricsCollector.clear();
    
    const startTime = Date.now();
    const testResults: TestResult[] = [];
    const issues: Issue[] = [];
    
    console.log(`🚀 Starting evaluation execution: ${this.executionId}`);
    console.log(`   Environment: ${environment.name}`);
    console.log(`   Test suites: ${config.testSuites.length}`);
    
    try {
      // Execute test suites based on strategy
      if (config.executionStrategy.mode === 'parallel') {
        testResults.push(...await this.runParallel(config.testSuites, config));
      } else {
        testResults.push(...await this.runSequential(config.testSuites, config));
      }
      
      // Analyze results
      const analysisResults = this.analyzeResults(testResults, config);
      issues.push(...analysisResults.issues);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(testResults, issues, config);
      
      // Calculate final scores
      const scores = this.calculateScores(testResults, config);
      
      const endTime = Date.now();
      
      return {
        id: `result-${this.executionId}`,
        evaluationConfigId: config.id,
        executionId: this.executionId,
        timestamp: new Date().toISOString(),
        status: this.determineOverallStatus(testResults),
        duration: endTime - startTime,
        testResults,
        scores,
        issues,
        recommendations,
        artifacts: this.collectArtifacts(),
        metadata: {
          environment: environment.name,
          configurationHash: this.hashConfig(config),
          triggeredBy: 'manual',
          modelVersion: config.metadata.version
        }
      };
    } catch (error) {
      console.error(`❌ Evaluation execution failed: ${error}`);
      return this.createFailedResult(config, error as Error, startTime);
    }
  }
  
  private async runSequential(
    testSuites: TestSuite[],
    config: EvaluationConfig
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const suite of testSuites) {
      console.log(`  Running suite: ${suite.name}`);
      
      for (const scenario of suite.scenarios) {
        const result = await this.executeScenario(scenario, suite, config);
        results.push(result);
        
        // Check for critical failures
        if (this.shouldStopOnFailure(result, config)) {
          console.log(`  ⛔ Critical failure detected, stopping execution`);
          break;
        }
      }
    }
    
    return results;
  }
  
  private async runParallel(
    testSuites: TestSuite[],
    config: EvaluationConfig
  ): Promise<TestResult[]> {
    const parallelism = config.executionStrategy.parallelism || 5;
    const results: TestResult[] = [];
    
    // Flatten all scenarios with suite context
    const allScenarios = testSuites.flatMap(suite =>
      suite.scenarios.map(scenario => ({ scenario, suite }))
    );
    
    // Execute in batches
    for (let i = 0; i < allScenarios.length; i += parallelism) {
      const batch = allScenarios.slice(i, i + parallelism);
      const batchPromises = batch.map(({ scenario, suite }) =>
        this.executeScenario(scenario, suite, config)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Check for critical failures
      if (batchResults.some(r => this.shouldStopOnFailure(r, config))) {
        console.log(`  ⛔ Critical failure detected in batch, stopping execution`);
        break;
      }
    }
    
    return results;
  }
  
  private async executeScenario(
    scenario: TestScenario,
    suite: TestSuite,
    config: EvaluationConfig
  ): Promise<TestResult> {
    const startTime = new Date().toISOString();
    const startMs = Date.now();
    
    try {
      // Generate concrete test inputs if needed
      const concreteInputs = this.prepareInputs(scenario, suite.type);
      
      // Execute the test
      const executionResult = await this.executeTest(concreteInputs, scenario);
      
      // Run assertions
      const assertionResults = await this.runAssertions(
        scenario.assertions,
        executionResult
      );
      
      // Collect metrics
      const metricResults = this.collectMetrics(
        scenario.metrics,
        executionResult
      );
      
      const endTime = new Date().toISOString();
      const duration = Date.now() - startMs;
      
      const status = this.determineTestStatus(assertionResults);
      
      return {
        testId: suite.id,
        scenarioId: scenario.id,
        status,
        startTime,
        endTime,
        duration,
        assertions: assertionResults,
        metrics: metricResults,
        artifacts: executionResult.artifacts
      };
    } catch (error) {
      const endTime = new Date().toISOString();
      const duration = Date.now() - startMs;
      
      return {
        testId: suite.id,
        scenarioId: scenario.id,
        status: 'error',
        startTime,
        endTime,
        duration,
        assertions: [],
        metrics: [],
        error: {
          type: error instanceof Error ? error.constructor.name : 'UnknownError',
          message: error instanceof Error ? error.message : String(error),
          stackTrace: error instanceof Error ? error.stack : undefined
        }
      };
    }
  }
  
  private prepareInputs(scenario: TestScenario, suiteType: string): any {
    // Expand template inputs into concrete test cases
    const inputs: any[] = [];
    
    scenario.inputs.forEach(input => {
      if (input.value === '[TOXIC_CONTENT_VARIATIONS]') {
        inputs.push(...this.scenarioGenerator.generateScenarios('content_safety', 10, {} as any));
      } else if (input.value === '[DEMOGRAPHIC_VARIATIONS]') {
        inputs.push(...this.scenarioGenerator.generateScenarios('bias', 10, {} as any));
      } else {
        inputs.push(input);
      }
    });
    
    return inputs;
  }
  
  private async executeTest(inputs: any[], scenario: TestScenario): Promise<any> {
    // Mock execution - in real implementation, this would call the actual AI system
    const mockResult = {
      response: 'Mock response',
      latency: Math.random() * 1000,
      tokens: Math.floor(Math.random() * 500),
      cost: Math.random() * 0.1,
      artifacts: []
    };
    
    // Simulate different test types
    if (scenario.id.includes('toxic')) {
      mockResult.response = 'CONTENT_BLOCKED';
    } else if (scenario.id.includes('injection')) {
      mockResult.response = 'REQUEST_DENIED';
    } else if (scenario.id.includes('latency')) {
      mockResult.latency = scenario.expectedOutputs[0].value as number * 0.9;
    }
    
    // Add some randomness for realistic testing
    if (Math.random() > 0.95) {
      throw new Error('Simulated test execution error');
    }
    
    return mockResult;
  }
  
  private async runAssertions(
    assertions: any[],
    executionResult: any
  ): Promise<AssertionResult[]> {
    const results: AssertionResult[] = [];
    
    for (const assertion of assertions) {
      const result = await this.evaluateAssertion(assertion, executionResult);
      results.push(result);
    }
    
    return results;
  }
  
  private async evaluateAssertion(
    assertion: any,
    executionResult: any
  ): Promise<AssertionResult> {
    // Mock assertion evaluation
    let passed = true;
    let actual = executionResult.response;
    let expected = assertion.expected;
    
    switch (assertion.type) {
      case 'content_safety':
        passed = !executionResult.response.includes('toxic');
        break;
      case 'performance_threshold':
        passed = executionResult.latency < 1000;
        actual = executionResult.latency;
        break;
      case 'token_limit':
        passed = executionResult.tokens < 4096;
        actual = executionResult.tokens;
        expected = 4096;
        break;
      case 'cost_within_budget':
        passed = executionResult.cost < 1.0;
        actual = executionResult.cost;
        expected = 1.0;
        break;
      default:
        passed = Math.random() > 0.2; // 80% pass rate for unknown assertions
    }
    
    return {
      assertionId: `assert-${Math.random().toString(36).substr(2, 9)}`,
      passed,
      actual,
      expected,
      message: assertion.message
    };
  }
  
  private collectMetrics(
    metricDefinitions: any[],
    executionResult: any
  ): MetricResult[] {
    const results: MetricResult[] = [];
    
    metricDefinitions.forEach(metric => {
      let value = 0;
      let withinThreshold = true;
      
      switch (metric.name) {
        case 'response_latency':
        case 'latency_p95':
          value = executionResult.latency;
          withinThreshold = value < 1000;
          break;
        case 'token_count':
        case 'token_usage':
          value = executionResult.tokens;
          withinThreshold = value < 4096;
          break;
        case 'cost':
        case 'monthly_spend':
          value = executionResult.cost;
          withinThreshold = value < 1.0;
          break;
        default:
          value = Math.random() * 100;
      }
      
      // Store in collector for aggregation
      if (!this.metricsCollector.has(metric.name)) {
        this.metricsCollector.set(metric.name, []);
      }
      this.metricsCollector.get(metric.name)!.push(value);
      
      results.push({
        metricName: metric.name,
        value,
        unit: metric.unit,
        threshold: metric.threshold,
        withinThreshold
      });
    });
    
    return results;
  }
  
  private determineTestStatus(assertionResults: AssertionResult[]): 'passed' | 'failed' | 'skipped' | 'error' {
    const mustPass = assertionResults.filter(a => a.assertionId.includes('must'));
    const shouldPass = assertionResults.filter(a => a.assertionId.includes('should'));
    
    if (mustPass.some(a => !a.passed)) {
      return 'failed';
    }
    
    if (shouldPass.filter(a => !a.passed).length > shouldPass.length / 2) {
      return 'failed';
    }
    
    return 'passed';
  }
  
  private shouldStopOnFailure(result: TestResult, config: EvaluationConfig): boolean {
    if (config.executionStrategy.failureHandling.strategy !== 'fail_fast') {
      return false;
    }
    
    return result.status === 'failed' && 
           result.assertions.some(a => !a.passed && a.assertionId.includes('critical'));
  }
  
  private analyzeResults(
    testResults: TestResult[],
    config: EvaluationConfig
  ): { issues: Issue[] } {
    const issues: Issue[] = [];
    
    // Identify failed tests
    const failedTests = testResults.filter(r => r.status === 'failed');
    
    if (failedTests.length > 0) {
      issues.push({
        id: `issue-${Date.now()}`,
        severity: 'high',
        type: 'test_failures',
        description: `${failedTests.length} tests failed out of ${testResults.length}`,
        affectedTests: failedTests.map(t => t.scenarioId),
        suggestedFix: 'Review failed assertions and adjust guardrails or system behavior'
      });
    }
    
    // Check for performance issues
    const slowTests = testResults.filter(r => r.duration > 5000);
    if (slowTests.length > 0) {
      issues.push({
        id: `issue-${Date.now()}-perf`,
        severity: 'medium',
        type: 'performance',
        description: `${slowTests.length} tests exceeded performance threshold`,
        affectedTests: slowTests.map(t => t.scenarioId),
        suggestedFix: 'Optimize test execution or adjust timeout thresholds'
      });
    }
    
    // Check for metric violations
    this.metricsCollector.forEach((values, metricName) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const max = Math.max(...values);
      
      if (metricName.includes('error') && avg > 0.01) {
        issues.push({
          id: `issue-${Date.now()}-${metricName}`,
          severity: 'high',
          type: 'metric_violation',
          description: `High ${metricName}: average ${avg.toFixed(4)}`,
          affectedTests: [],
          suggestedFix: `Investigate root cause of elevated ${metricName}`
        });
      }
    });
    
    return { issues };
  }
  
  private generateRecommendations(
    testResults: TestResult[],
    issues: Issue[],
    config: EvaluationConfig
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Analyze pass rate
    const passRate = testResults.filter(r => r.status === 'passed').length / testResults.length;
    
    if (passRate < 0.8) {
      recommendations.push({
        type: 'guardrail_adjustment',
        priority: 'high',
        description: 'Low test pass rate indicates guardrails may be too strict',
        impact: 'Adjusting guardrails could improve system usability',
        effort: 'medium',
        implementation: 'Review failed tests and adjust thresholds where appropriate'
      });
    }
    
    // Check for missing test coverage
    const coverage = config.testSuites.reduce((acc, suite) => 
      acc + (suite.coverage?.percentage || 0), 0
    ) / config.testSuites.length;
    
    if (coverage < 80) {
      recommendations.push({
        type: 'test_improvement',
        priority: 'medium',
        description: `Test coverage is ${coverage.toFixed(1)}%, below recommended 80%`,
        impact: 'Improved coverage reduces risk of undetected issues',
        effort: 'low',
        implementation: 'Add test scenarios for uncovered guardrails'
      });
    }
    
    // Performance recommendations
    const avgLatency = this.metricsCollector.get('latency_p95')?.[0] || 0;
    if (avgLatency > 2000) {
      recommendations.push({
        type: 'threshold_change',
        priority: 'low',
        description: 'Consider adjusting latency thresholds to match actual performance',
        impact: 'More realistic performance expectations',
        effort: 'low',
        implementation: `Update latency threshold from 1000ms to ${Math.ceil(avgLatency * 1.2)}ms`
      });
    }
    
    // Monitoring recommendations
    if (issues.filter(i => i.severity === 'critical').length > 0) {
      recommendations.push({
        type: 'monitoring_enhancement',
        priority: 'high',
        description: 'Critical issues detected - enhance monitoring',
        impact: 'Faster detection and resolution of production issues',
        effort: 'medium',
        implementation: 'Add real-time alerts for critical metrics'
      });
    }
    
    return recommendations;
  }
  
  private calculateScores(
    testResults: TestResult[],
    config: EvaluationConfig
  ): any {
    const dimensionScores: Record<string, any> = {};
    
    // Calculate dimension scores
    config.evaluationCriteria.dimensions.forEach(dimension => {
      const relevantTests = testResults.filter(r => 
        r.testId.toLowerCase().includes(dimension.name.toLowerCase())
      );
      
      const passRate = relevantTests.length > 0
        ? relevantTests.filter(r => r.status === 'passed').length / relevantTests.length
        : 0;
      
      const rawScore = passRate * 100;
      const normalizedScore = this.normalizeScore(rawScore, dimension.thresholds);
      
      dimensionScores[dimension.name] = {
        dimension: dimension.name,
        rawScore,
        normalizedScore,
        weight: dimension.weight,
        contributionToOverall: normalizedScore * dimension.weight
      };
    });
    
    // Calculate overall score
    const overallValue = Object.values(dimensionScores).reduce(
      (sum: number, score: any) => sum + score.contributionToOverall,
      0
    );
    
    const grade = this.calculateGrade(overallValue);
    const trend = 'stable'; // Would compare with historical data
    const recommendation = overallValue >= 70 ? 'deploy' : overallValue >= 50 ? 'review' : 'block';
    
    return {
      algorithm: config.scoringFramework.algorithm,
      scoreRanges: config.scoringFramework.scoreRanges,
      dimensionScores,
      overallScore: {
        value: overallValue,
        grade,
        trend,
        recommendation,
        explanation: `Overall score of ${overallValue.toFixed(1)} indicates ${recommendation} recommendation`
      },
      confidence: {
        overall: 0.85,
        byDimension: Object.keys(dimensionScores).reduce((acc, key) => ({
          ...acc,
          [key]: 0.8 + Math.random() * 0.15
        }), {}),
        factors: [
          {
            factor: 'Test Execution',
            impact: 0.4,
            explanation: `${testResults.length} tests executed successfully`
          }
        ]
      }
    };
  }
  
  private normalizeScore(rawScore: number, thresholds: any): number {
    if (rawScore >= thresholds.excellent) return 100;
    if (rawScore >= thresholds.good) return 80;
    if (rawScore >= thresholds.acceptable) return 60;
    if (rawScore >= thresholds.poor) return 40;
    return 20;
  }
  
  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
  
  private determineOverallStatus(testResults: TestResult[]): 'running' | 'completed' | 'failed' | 'cancelled' {
    if (testResults.some(r => r.status === 'error')) {
      return 'failed';
    }
    
    const failureRate = testResults.filter(r => r.status === 'failed').length / testResults.length;
    if (failureRate > 0.5) {
      return 'failed';
    }
    
    return 'completed';
  }
  
  private collectArtifacts(): any[] {
    // Collect execution artifacts
    return [
      {
        type: 'log',
        name: 'execution.log',
        path: `/logs/${this.executionId}.log`,
        size: 1024 * 50,
        mimeType: 'text/plain'
      },
      {
        type: 'report',
        name: 'evaluation_report.html',
        path: `/reports/${this.executionId}.html`,
        size: 1024 * 200,
        mimeType: 'text/html'
      }
    ];
  }
  
  private hashConfig(config: EvaluationConfig): string {
    // Simple hash for config versioning
    const str = JSON.stringify({
      version: config.version,
      suites: config.testSuites.length,
      criteria: config.evaluationCriteria
    });
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16);
  }
  
  private createFailedResult(
    config: EvaluationConfig,
    error: Error,
    startTime: number
  ): EvaluationResult {
    return {
      id: `result-${this.executionId}-failed`,
      evaluationConfigId: config.id,
      executionId: this.executionId,
      timestamp: new Date().toISOString(),
      status: 'failed',
      duration: Date.now() - startTime,
      testResults: [],
      scores: {
        algorithm: 'weighted_average',
        scoreRanges: config.scoringFramework.scoreRanges,
        dimensionScores: {},
        overallScore: {
          value: 0,
          grade: 'F',
          trend: 'stable',
          recommendation: 'block',
          explanation: 'Evaluation failed to execute'
        },
        confidence: {
          overall: 0,
          byDimension: {},
          factors: []
        }
      },
      issues: [{
        id: 'fatal-error',
        severity: 'critical',
        type: 'execution_failure',
        description: error.message,
        affectedTests: [],
        suggestedFix: 'Check system configuration and retry'
      }],
      recommendations: [],
      metadata: {
        environment: this.activeEnvironment?.name || 'unknown',
        configurationHash: this.hashConfig(config),
        triggeredBy: 'manual',
        notes: `Execution failed: ${error.message}`
      }
    };
  }
}