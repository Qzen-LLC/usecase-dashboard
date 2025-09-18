import OpenAI from 'openai';
import { AgentResponse, Guardrail } from '../types';
import { guardrailLogger } from '../utils/guardrail-logger';
import { AgentTracer } from '../../observability/AgentTracer';

/**
 * Base class for specialist agents that generate guardrails using LLM
 */
export abstract class BaseSpecialistAgent {
  protected openai: OpenAI;
  protected agentName: string;
  protected domain: string;
  protected tracer: AgentTracer | null = null;

  constructor(agentName: string, domain: string, tracer?: AgentTracer) {
    this.agentName = agentName;
    this.domain = domain;
    this.tracer = tracer || null;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(`${agentName}: OpenAI API key not configured`);
    }

    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Set the tracer for this agent
   */
  public setTracer(tracer: AgentTracer): void {
    this.tracer = tracer;
  }
  
  /**
   * Generate guardrails using LLM based on domain-specific assessment
   */
  protected async generateGuardrailsWithLLM(
    assessmentData: any,
    useCaseContext: any,
    domainPrompt: string
  ): Promise<Guardrail[]> {
    try {
      const systemPrompt = `You are a ${this.domain} specialist generating specific guardrails for an AI system.
      Focus ONLY on ${this.domain.toLowerCase()} aspects.
      Generate 3-7 highly specific, implementable guardrails based on the assessment data provided.
      
      Each guardrail must be:
      - Specific to the use case: "${useCaseContext.useCaseTitle}"
      - Based on actual assessment selections and values
      - Implementable with clear configuration
      - Include monitoring metrics
      
      Respond with a JSON array of guardrails. Each guardrail must have:
      {
        "id": "unique-id",
        "type": "guardrail-type",
        "severity": "critical|high|medium|low",
        "rule": "SPECIFIC_RULE_NAME",
        "description": "What this guardrail does (max 100 chars)",
        "rationale": "Why needed based on assessment (max 150 chars)",
        "implementation": {
          "platform": ["applicable-platforms"],
          "configuration": { ... },
          "monitoring": [{ "metric": "...", "threshold": "...", "frequency": "..." }]
        }
      }`;
      
      const userPrompt = `
      ## Use Case Context
      Title: ${useCaseContext.useCaseTitle}
      Problem: ${useCaseContext.problemStatement}
      Solution: ${useCaseContext.proposedSolution}
      Success Criteria: ${useCaseContext.successCriteria}
      
      ## ${this.domain} Assessment Data
      ${domainPrompt}
      
      ## Instructions
      Generate specific ${this.domain.toLowerCase()} guardrails based on the above assessment data.
      Focus on the actual selections, values, and configurations from the assessment.
      Make guardrails specific to "${useCaseContext.useCaseTitle}".
      `;
      
      console.log(`🤖 ${this.agentName}: Generating guardrails via LLM...`);

      // Use tracer if available for observability
      const completion = this.tracer
        ? await this.tracer.traceOpenAICall(
            this.openai,
            {
              model: process.env.DEFAULT_LLM_MODEL || 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              response_format: { type: 'json_object' },
              temperature: 0.7,
              max_tokens: 2000
            },
            `${this.domain}_guardrails_generation`
          )
        : await this.openai.chat.completions.create({
            model: process.env.DEFAULT_LLM_MODEL || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 2000
          });
      
      const response = completion.choices[0]?.message?.content;
      if (!response) {
        console.warn(`${this.agentName}: No response from LLM`);
        return [];
      }
      
      try {
        const parsed = JSON.parse(response);
        const guardrails = Array.isArray(parsed) ? parsed : (parsed.guardrails || []);
        
        // Validate and clean guardrails
        const validGuardrails = guardrails.filter((g: any) => 
          g.id && g.type && g.severity && g.rule && g.description
        );
        
        console.log(`✅ ${this.agentName}: Generated ${validGuardrails.length} guardrails`);
        return validGuardrails;
        
      } catch (parseError) {
        console.error(`${this.agentName}: Failed to parse LLM response:`, parseError);
        return [];
      }
      
    } catch (error) {
      console.error(`${this.agentName}: Error generating guardrails:`, error);
      return [];
    }
  }
  
  /**
   * Extract insights from assessment data
   */
  protected abstract extractInsights(assessmentData: any): string[];
  
  /**
   * Identify concerns based on assessment
   */
  protected abstract identifyConcerns(assessmentData: any): string[];
  
  /**
   * Generate recommendations
   */
  protected abstract generateRecommendations(assessmentData: any): string[];
  
  /**
   * Main method to analyze and propose guardrails
   */
  abstract analyzeAndPropose(context: any): Promise<AgentResponse>;
}