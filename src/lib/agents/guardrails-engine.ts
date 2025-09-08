import { 
  ComprehensiveAssessment, 
  GuardrailsConfig,
  Guardrail,
  ImplementationConfig 
} from './types';
import { GuardrailsOrchestrator } from './guardrails-orchestrator';
import { generateGuardrailsPrompt } from './prompts/guardrails-prompts';
import OpenAI from 'openai';
import { guardrailLogger } from './utils/guardrail-logger';

/**
 * Guardrails Generation Engine
 * Uses LLM to generate intelligent, context-aware guardrails
 * Combines agent recommendations with deep reasoning
 */
export class GuardrailsEngine {
  private orchestrator: GuardrailsOrchestrator;
  private openai: OpenAI;

  constructor() {
    this.orchestrator = new GuardrailsOrchestrator();
    
    // Initialize OpenAI client - require API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('LLM Configuration Required: OPENAI_API_KEY must be set in environment variables for guardrail generation');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Generate guardrails using the agentic system
   */
  async generateGuardrails(
    assessment: ComprehensiveAssessment,
    orgPolicies?: any
  ): Promise<GuardrailsConfig> {
    console.log('🚀 Starting Agentic Guardrails Generation...');
    
    // Start logging session
    guardrailLogger.startSession(
      assessment.useCaseId || 'unknown',
      assessment.useCaseTitle || 'Unknown Use Case'
    );

    try {
      // Step 1: Generate multiple perspectives using LLM
      guardrailLogger.logOrchestratorAction('GENERATE_PERSPECTIVES', {
        approaches: ['conservative_safety', 'balanced_practical', 'innovation_focused']
      });
      const perspectives = await this.generatePerspectives(assessment, orgPolicies);

      // Step 2: Let orchestrator coordinate specialist agents
      const agentGuardrails = await this.orchestrator.generateGuardrails(assessment);

      // Step 3: Synthesize LLM and agent recommendations
      guardrailLogger.logOrchestratorAction('SYNTHESIZE_RECOMMENDATIONS', {
        llmPerspectives: perspectives.length,
        agentGuardrails: Object.keys(agentGuardrails.guardrails?.rules || {}).length
      });
      const synthesized = await this.synthesizeRecommendations(
        perspectives,
        agentGuardrails,
        assessment
      );
      guardrailLogger.logSynthesis(
        { perspectives, agentGuardrails: agentGuardrails.guardrails?.rules },
        synthesized
      );

      // Step 4: Validate and optimize
      const validated = await this.validateGuardrails(synthesized);

      // Step 5: Generate implementation configurations
      const implementation = await this.generateImplementationConfigs(validated, assessment);

      const finalResult = {
        guardrails: implementation,
        reasoning: this.combineReasoning(perspectives, agentGuardrails.reasoning),
        confidence: this.calculateOverallConfidence(perspectives, agentGuardrails.confidence),
        metadata: {
          generatedAt: new Date().toISOString(),
          version: '2.0.0',
          agents: ['orchestrator', 'llm-reasoning'],
          contextComplexity: this.assessComplexity(assessment)
        }
      };
      
      // Log final output and save
      guardrailLogger.logFinalOutput(finalResult);
      guardrailLogger.saveToFile();
      
      return finalResult;
    } catch (error) {
      console.error('Error generating guardrails:', error);
      throw error;
    }
  }

  /**
   * Generate multiple perspectives using LLM
   */
  private async generatePerspectives(
    assessment: ComprehensiveAssessment,
    orgPolicies: any
  ): Promise<any[]> {
    console.log('🧠 Generating LLM perspectives...');

    const perspectives = await Promise.all([
      this.generatePerspective(assessment, orgPolicies, 'conservative_safety'),
      this.generatePerspective(assessment, orgPolicies, 'balanced_practical'),
      this.generatePerspective(assessment, orgPolicies, 'innovation_focused')
    ]);

    return perspectives;
  }

  /**
   * Generate a single perspective using LLM
   */
  private async generatePerspective(
    assessment: ComprehensiveAssessment,
    orgPolicies: any,
    approach: 'conservative_safety' | 'balanced_practical' | 'innovation_focused'
  ): Promise<any> {
    const prompt = generateGuardrailsPrompt(assessment, orgPolicies, approach);
    
    // Log LLM input
    guardrailLogger.logLLMInput(approach, prompt);

    // Call the actual LLM API
    const response = await this.callLLM(prompt, approach);

    return {
      approach,
      guardrails: this.parseLLMResponse(response),
      reasoning: response.reasoning,
      confidence: response.confidence
    };
  }

  /**
   * Call OpenAI API to generate guardrails
   */
  private async callLLM(prompt: string, approach?: string): Promise<any> {
    console.log('📝 Calling OpenAI API with prompt length:', prompt.length);

    try {
      // Prepare the system prompt for structured output
      const systemPrompt = `You are an AI safety expert generating guardrails for AI systems. 
      You must respond with a valid, parseable JSON object. Be concise but comprehensive.
      
      Structure your response EXACTLY as follows:
      {
        "critical": [...],      // Array of critical guardrails
        "operational": [...],   // Array of operational guardrails  
        "ethical": [...],       // Array of ethical guardrails
        "economic": [...],      // Array of economic guardrails
        "reasoning": {...},     // Object with key_insights and assumptions
        "confidence": 0.85      // Number between 0-1
      }
      
      Each guardrail must have: id, type, severity, rule, description, rationale.
      Keep descriptions concise (max 100 chars). Focus on the most important guardrails specific to this use case.`;

      // Call OpenAI API with reduced tokens to avoid truncation
      const completion = await this.openai.chat.completions.create({
        model: process.env.DEFAULT_LLM_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 3000 // Reduced to avoid truncation
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI API');
      }

      console.log('✅ OpenAI API call successful');
      
      // Parse and validate the response with error handling
      let parsedResponse;
      try {
        // Try to clean the response first
        const cleanedResponse = response
          .trim()
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
          .replace(/\n\s*\n/g, '\n'); // Remove excessive newlines
        
        parsedResponse = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('Failed to parse LLM response as JSON:', parseError);
        console.log('Response length:', response.length);
        
        // Try to extract JSON from the response if it's wrapped in text
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedResponse = JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('Failed to extract valid JSON from response');
            // Return a minimal valid structure
            parsedResponse = {
              critical: [],
              operational: [],
              ethical: [],
              economic: [],
              reasoning: {
                key_insights: ['LLM response was malformed, using fallback structure'],
                assumptions: []
              }
            };
          }
        } else {
          // Return a minimal valid structure
          parsedResponse = {
            critical: [],
            operational: [],
            ethical: [],
            economic: [],
            reasoning: {
              key_insights: ['LLM response was not valid JSON, using fallback structure'],
              assumptions: []
            }
          };
        }
      }
      
      // Ensure the response has the expected structure
      const validatedResponse = {
        guardrails: {
          critical: parsedResponse.critical || parsedResponse.guardrails?.critical || [],
          operational: parsedResponse.operational || parsedResponse.guardrails?.operational || [],
          ethical: parsedResponse.ethical || parsedResponse.guardrails?.ethical || [],
          economic: parsedResponse.economic || parsedResponse.guardrails?.economic || []
        },
        reasoning: parsedResponse.reasoning || 'Generated based on comprehensive analysis',
        confidence: parsedResponse.confidence || 0.75
      };
      
      // Log the LLM output after parsing
      if (approach) {
        guardrailLogger.logLLMOutput(approach, validatedResponse, true);
      }

      return validatedResponse;

    } catch (error) {
      console.error('❌ Error calling OpenAI API:', error);
      if (approach) {
        guardrailLogger.logLLMOutput(approach, null, false, error);
      }
      throw new Error(`Failed to generate guardrails via LLM: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  /**
   * Parse LLM response into structured guardrails
   */
  private parseLLMResponse(response: any): Guardrail[] {
    const guardrails: Guardrail[] = [];

    // Parse critical guardrails
    if (response.guardrails?.critical) {
      guardrails.push(...response.guardrails.critical);
    }

    // Parse operational guardrails
    if (response.guardrails?.operational) {
      guardrails.push(...response.guardrails.operational);
    }

    // Parse ethical guardrails
    if (response.guardrails?.ethical) {
      guardrails.push(...response.guardrails.ethical);
    }

    // Parse economic guardrails
    if (response.guardrails?.economic) {
      guardrails.push(...response.guardrails.economic);
    }

    return guardrails;
  }

  /**
   * Synthesize LLM and agent recommendations
   */
  private async synthesizeRecommendations(
    perspectives: any[],
    agentGuardrails: GuardrailsConfig,
    assessment: ComprehensiveAssessment
  ): Promise<Guardrail[]> {
    console.log('🔄 Synthesizing recommendations...');

    const allGuardrails: Guardrail[] = [];

    // Add agent-generated guardrails
    if (agentGuardrails.guardrails.rules) {
      Object.values(agentGuardrails.guardrails.rules).forEach((ruleSet: any) => {
        if (Array.isArray(ruleSet)) {
          allGuardrails.push(...ruleSet);
        }
      });
    }

    // Add LLM-generated guardrails from each perspective
    perspectives.forEach(perspective => {
      allGuardrails.push(...perspective.guardrails);
    });

    // Remove duplicates and resolve conflicts
    const synthesized = this.deduplicateAndResolve(allGuardrails);

    // Prioritize based on severity and consensus
    return this.prioritizeGuardrails(synthesized);
  }

  /**
   * Remove duplicate guardrails and resolve conflicts
   */
  private deduplicateAndResolve(guardrails: Guardrail[]): Guardrail[] {
    const seen = new Map<string, Guardrail>();

    guardrails.forEach(guardrail => {
      const key = `${guardrail.type}-${guardrail.rule}`;
      
      if (!seen.has(key)) {
        seen.set(key, guardrail);
      } else {
        // Resolve conflict by taking the more conservative option
        const existing = seen.get(key)!;
        if (this.getSeverityScore(guardrail.severity) > this.getSeverityScore(existing.severity)) {
          seen.set(key, guardrail);
        }
      }
    });

    return Array.from(seen.values());
  }

  /**
   * Get numeric score for severity level
   */
  private getSeverityScore(severity: string): number {
    const scores: Record<string, number> = {
      'critical': 4,
      'high': 3,
      'medium': 2,
      'low': 1
    };
    return scores[severity] || 0;
  }

  /**
   * Prioritize guardrails based on importance
   */
  private prioritizeGuardrails(guardrails: Guardrail[]): Guardrail[] {
    return guardrails.sort((a, b) => {
      // Sort by severity first
      const severityDiff = this.getSeverityScore(b.severity) - this.getSeverityScore(a.severity);
      if (severityDiff !== 0) return severityDiff;

      // Then by type priority
      const typePriority: Record<string, number> = {
        'content_safety': 10,
        'data_protection': 9,
        'human_oversight': 8,
        'compliance': 7,
        'ethical': 6,
        'hallucination_control': 5,
        'bias_mitigation': 4,
        'performance': 3,
        'cost_control': 2,
        'agent_behavior': 1
      };

      const aPriority = typePriority[a.type] || 0;
      const bPriority = typePriority[b.type] || 0;
      
      return bPriority - aPriority;
    });
  }

  /**
   * Validate generated guardrails
   */
  private async validateGuardrails(guardrails: Guardrail[]): Promise<Guardrail[]> {
    console.log('✅ Validating guardrails...');

    const validated: Guardrail[] = [];

    for (const guardrail of guardrails) {
      if (this.isValidGuardrail(guardrail)) {
        validated.push(guardrail);
      } else {
        console.warn(`Invalid guardrail skipped: ${guardrail.id}`);
      }
    }

    return validated;
  }

  /**
   * Check if a guardrail is valid
   */
  private isValidGuardrail(guardrail: Guardrail): boolean {
    return !!(
      guardrail.id &&
      guardrail.type &&
      guardrail.severity &&
      guardrail.rule &&
      guardrail.description &&
      guardrail.implementation
    );
  }

  /**
   * Generate implementation-ready configurations
   */
  private async generateImplementationConfigs(
    guardrails: Guardrail[],
    assessment: ComprehensiveAssessment
  ): Promise<ImplementationConfig> {
    console.log('🔧 Generating implementation configurations...');

    // Group guardrails by category
    const grouped = {
      critical: guardrails.filter(g => g.severity === 'critical'),
      operational: guardrails.filter(g => ['performance', 'cost_control'].includes(g.type)),
      ethical: guardrails.filter(g => ['ethical', 'bias_mitigation'].includes(g.type)),
      economic: guardrails.filter(g => g.type === 'cost_control'),
      evolutionary: guardrails.filter(g => g.evolutionStrategy !== undefined)
    };

    // Determine platform
    const platform = this.determinePlatform(assessment);

    return {
      version: '2.0.0',
      platform,
      rules: grouped,
      deployment: {
        stages: ['development', 'staging', 'production'],
        rollback: {
          triggers: this.determineRollbackTriggers(assessment),
          strategy: 'gradual'
        }
      },
      monitoring: this.generateMonitoringRequirements(guardrails),
      documentation: {
        rationale: 'Generated through multi-agent reasoning system',
        tradeoffs: this.identifyTradeoffs(guardrails),
        assumptions: [
          'Current regulatory framework remains stable',
          'User behavior follows expected patterns',
          'Infrastructure can support specified requirements'
        ]
      }
    };
  }

  /**
   * Determine the target platform
   */
  private determinePlatform(assessment: ComprehensiveAssessment): any {
    if (assessment.technicalFeasibility?.modelProvider) {
      const provider = assessment.technicalFeasibility.modelProvider.toLowerCase();
      if (provider.includes('openai')) return 'openai';
      if (provider.includes('anthropic')) return 'anthropic';
      if (provider.includes('google')) return 'google';
      if (provider.includes('aws')) return 'aws';
      if (provider.includes('azure')) return 'azure';
    }
    return 'multi-platform';
  }

  /**
   * Determine rollback triggers based on assessment
   */
  private determineRollbackTriggers(assessment: ComprehensiveAssessment): string[] {
    const triggers = ['error_rate > 5%', 'latency > 2000ms'];

    if (assessment.businessFeasibility?.systemCriticality === 'Mission Critical') {
      triggers.push('availability < 99.9%');
      triggers.push('data_loss_detected');
    }

    if (assessment.businessFeasibility?.maxHallucinationRate) {
      triggers.push(`hallucination_rate > ${assessment.businessFeasibility.maxHallucinationRate}%`);
    }

    return triggers;
  }

  /**
   * Generate monitoring requirements from guardrails
   */
  private generateMonitoringRequirements(guardrails: Guardrail[]): any[] {
    const requirements: any[] = [];

    guardrails.forEach(guardrail => {
      if (guardrail.implementation.monitoring) {
        requirements.push(...guardrail.implementation.monitoring);
      }
    });

    // Remove duplicates
    const unique = new Map();
    requirements.forEach(req => {
      const key = `${req.metric}-${req.threshold}`;
      if (!unique.has(key)) {
        unique.set(key, req);
      }
    });

    return Array.from(unique.values());
  }

  /**
   * Identify tradeoffs in the guardrails
   */
  private identifyTradeoffs(guardrails: Guardrail[]): string[] {
    const tradeoffs = [];

    // Check for performance vs safety tradeoffs
    const hasStrictSafety = guardrails.some(g => g.type === 'content_safety' && g.severity === 'critical');
    const hasPerformanceReqs = guardrails.some(g => g.type === 'performance');

    if (hasStrictSafety && hasPerformanceReqs) {
      tradeoffs.push('Strict safety checks may impact latency targets');
    }

    // Check for cost vs quality tradeoffs
    const hasCostControls = guardrails.some(g => g.type === 'cost_control');
    const hasQualityReqs = guardrails.some(g => g.type === 'hallucination_control');

    if (hasCostControls && hasQualityReqs) {
      tradeoffs.push('Cost optimization may require using smaller models with potential quality impact');
    }

    return tradeoffs;
  }

  /**
   * Combine reasoning from different sources
   */
  private combineReasoning(perspectives: any[], agentReasoning: any): any {
    return {
      timestamp: new Date().toISOString(),
      perspectives: perspectives.map(p => ({
        approach: p.approach,
        reasoning: p.reasoning
      })),
      agentReasoning,
      synthesis: 'Combined multi-perspective LLM reasoning with specialist agent analysis'
    };
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(perspectives: any[], agentConfidence: any): any {
    const llmConfidence = perspectives.reduce((sum, p) => sum + p.confidence, 0) / perspectives.length;
    const overallScore = (llmConfidence + agentConfidence.overall) / 2;

    return {
      overall: overallScore,
      breakdown: {
        ...agentConfidence.breakdown,
        llmReasoning: llmConfidence
      },
      uncertainties: [
        'Emerging regulations may require updates',
        'Long-term model behavior under edge cases',
        'Unforeseen interaction effects between guardrails'
      ]
    };
  }

  /**
   * Assess the complexity of the use case
   */
  private assessComplexity(assessment: ComprehensiveAssessment): number {
    let complexity = 0;

    // Technical complexity
    complexity += (assessment.technicalFeasibility?.technicalComplexity || 0) / 10;

    // Integration complexity
    complexity += (assessment.technicalFeasibility?.integrationPoints?.length || 0) / 10;

    // Regulatory complexity
    complexity += (assessment.riskAssessment?.dataProtection?.jurisdictions?.length || 0) / 5;

    // Data complexity
    complexity += (assessment.dataReadiness?.dataTypes?.length || 0) / 10;

    // User complexity
    complexity += (assessment.businessFeasibility?.userCategories?.length || 0) / 5;

    return Math.min(complexity, 10);
  }
}