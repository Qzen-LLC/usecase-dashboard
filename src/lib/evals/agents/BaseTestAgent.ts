/**
 * Base Test Agent Class
 * Abstract base class for all specialist test generation agents
 */

import { EvaluationContext } from '../evaluation-context-aggregator';
import { TestSuite, TestScenario } from '../types';
import { AgentTestProposal } from '../evaluation-generation-orchestrator';
import OpenAI from 'openai';

export abstract class BaseTestAgent {
  protected openai: OpenAI | null = null;
  protected agentId: string;
  protected agentType: string;
  protected priority: number;

  constructor(agentId: string, agentType: string, priority: number = 5) {
    this.agentId = agentId;
    this.agentType = agentType;
    this.priority = priority;
    
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  /**
   * Generate test proposals for this agent's domain
   */
  abstract async generateTests(context: EvaluationContext): Promise<AgentTestProposal>;

  /**
   * Get agent name
   */
  getName(): string {
    return this.agentId;
  }

  /**
   * Get agent type
   */
  getType(): string {
    return this.agentType;
  }

  /**
   * Get agent priority for conflict resolution
   */
  getPriority(): number {
    return this.priority;
  }

  /**
   * Analyze context to determine if this agent should be active
   */
  protected abstract shouldActivate(context: EvaluationContext): boolean;

  /**
   * Generate test scenarios using LLM
   */
  protected async generateScenariosWithLLM(
    prompt: string,
    context: string,
    maxScenarios: number = 10
  ): Promise<TestScenario[]> {
    if (!this.openai) {
      console.warn(`${this.agentId}: No OpenAI client, using fallback generation`);
      return this.generateFallbackScenarios(context, maxScenarios);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 3000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('Empty response from LLM');
      }

      const parsed = JSON.parse(response);
      return this.parseScenarios(parsed);
    } catch (error) {
      console.error(`${this.agentId}: LLM generation failed, using fallback`, error);
      return this.generateFallbackScenarios(context, maxScenarios);
    }
  }

  /**
   * Get system prompt for this agent
   */
  protected abstract getSystemPrompt(): string;

  /**
   * Parse LLM response into test scenarios
   */
  protected parseScenarios(response: any): TestScenario[] {
    if (!response.scenarios || !Array.isArray(response.scenarios)) {
      return [];
    }

    return response.scenarios.map((scenario: any, index: number) => ({
      id: `${this.agentId}-scenario-${Date.now()}-${index}`,
      name: scenario.name || `${this.agentType} Test ${index + 1}`,
      description: scenario.description || '',
      guardrailId: scenario.guardrailId || `${this.agentType}-guardrail`,
      inputs: [
        {
          type: 'prompt',
          value: scenario.testInput || scenario.input || '',
          metadata: {
            agent: this.agentId,
            generated: true
          }
        }
      ],
      expectedOutputs: [
        {
          type: scenario.expectedType || 'behavior',
          value: scenario.expectedBehavior || scenario.expectedOutput || '',
          explanation: scenario.reasoning || ''
        }
      ],
      assertions: this.parseAssertions(scenario),
      metrics: this.getMetricsForScenario(scenario),
      weight: this.calculateWeight(scenario),
      tags: [...(scenario.tags || []), this.agentType]
    }));
  }

  /**
   * Parse assertions from scenario
   */
  protected parseAssertions(scenario: any): any[] {
    const assertions = [];

    if (scenario.assertions && Array.isArray(scenario.assertions)) {
      assertions.push(...scenario.assertions.map((a: any) => ({
        type: a.type || 'general',
        condition: a.condition || a,
        expected: a.expected !== undefined ? a.expected : true,
        severity: a.severity || 'should_pass',
        message: a.message || a.condition || ''
      })));
    }

    // Add default assertion if none provided
    if (assertions.length === 0) {
      assertions.push({
        type: 'general',
        condition: 'Test completes successfully',
        expected: true,
        severity: 'should_pass',
        message: 'Default assertion'
      });
    }

    return assertions;
  }

  /**
   * Get metrics for a scenario
   */
  protected abstract getMetricsForScenario(scenario: any): any[];

  /**
   * Calculate weight/priority for a scenario
   */
  protected calculateWeight(scenario: any): number {
    if (scenario.priority === 'critical' || scenario.severity === 'critical') return 2.0;
    if (scenario.priority === 'high' || scenario.severity === 'high') return 1.5;
    if (scenario.priority === 'low' || scenario.severity === 'low') return 0.5;
    return 1.0;
  }

  /**
   * Generate fallback scenarios when LLM is unavailable
   */
  protected abstract generateFallbackScenarios(context: string, maxScenarios: number): TestScenario[];

  /**
   * Build test suite from scenarios
   */
  protected buildTestSuite(
    scenarios: TestScenario[],
    name: string,
    description: string,
    priority: 'critical' | 'high' | 'medium' | 'low' = 'medium'
  ): TestSuite {
    return {
      id: `suite-${this.agentId}-${Date.now()}`,
      name,
      description,
      type: this.agentType as any,
      priority,
      scenarios,
      coverage: this.calculateCoverage(scenarios)
    };
  }

  /**
   * Calculate test coverage
   */
  protected calculateCoverage(scenarios: TestScenario[]): any {
    const guardrails = new Set(scenarios.map(s => s.guardrailId));
    
    return {
      guardrailsCovered: guardrails.size,
      guardrailsTotal: guardrails.size, // Will be updated by orchestrator
      percentage: 100, // Will be recalculated by orchestrator
      byType: {
        [this.agentType]: scenarios.length
      },
      gaps: []
    };
  }

  /**
   * Determine test suite priority based on context
   */
  protected determinePriority(context: EvaluationContext): 'critical' | 'high' | 'medium' | 'low' {
    // Override in subclasses for specific logic
    if (context.useCase.systemCriticality === 'Mission Critical') return 'critical';
    if (context.risks.criticalCount > 0) return 'high';
    if (context.risks.highCount > 2) return 'medium';
    return 'low';
  }

  /**
   * Build LLM prompt for test generation
   */
  protected buildPrompt(context: EvaluationContext, focusArea: string, maxTests: number = 10): string {
    return `Generate ${maxTests} test scenarios for ${focusArea}.

USE CASE: ${context.useCase.title}
PROBLEM: ${context.useCase.problemStatement}
CRITICALITY: ${context.useCase.systemCriticality}
GUARDRAILS: ${context.guardrails.totalRules} rules (${context.guardrails.criticalRules} critical)

Focus on:
- ${focusArea} specific challenges
- Real-world scenarios
- Edge cases and boundary conditions
- Guardrail validation

Response format:
{
  "scenarios": [
    {
      "name": "Descriptive test name",
      "description": "What this test validates",
      "testInput": "Specific input to test",
      "expectedBehavior": "Expected system response",
      "assertions": ["Assertion 1", "Assertion 2"],
      "priority": "critical|high|medium|low",
      "tags": ["tag1", "tag2"]
    }
  ],
  "reasoning": "Why these tests are important",
  "confidence": 0.85
}`;
  }
}