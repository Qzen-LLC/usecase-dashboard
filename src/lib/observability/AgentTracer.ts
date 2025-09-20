/**
 * Agent-specific tracing utilities for multi-agent systems
 */

import { langsmithTracer } from './LangSmithTracer';
import { observabilityManager } from './ObservabilityManager';
import OpenAI from 'openai';
import { TraceMetadata, LLMCallMetrics, MODEL_PRICING } from './types';

export class AgentTracer {
  private agentName: string;
  private agentType: TraceMetadata['agentType'];
  private sessionId?: string;
  private llmCallCount: number = 0;
  private totalTokens: number = 0;
  private totalCost: number = 0;

  constructor(
    agentName: string, 
    agentType: TraceMetadata['agentType'] = 'specialist',
    sessionId?: string
  ) {
    this.agentName = agentName;
    this.agentType = agentType;
    this.sessionId = sessionId;
  }

  /**
   * Start agent execution tracking
   */
  async startExecution(inputs: any): Promise<void> {
    await observabilityManager.startAgentExecution(
      this.agentName,
      this.agentType,
      inputs,
      this.sessionId
    );
  }

  /**
   * End agent execution tracking
   */
  async endExecution(outputs: any, error?: any): Promise<void> {
    await observabilityManager.endAgentExecution(
      this.agentName,
      outputs,
      error,
      this.sessionId
    );

    // Log agent summary
    if (this.llmCallCount > 0) {
      console.log(`\n📊 Agent LLM Usage Summary [${this.agentName}]:`);
      console.log(`   • LLM Calls: ${this.llmCallCount}`);
      console.log(`   • Total Tokens: ${this.totalTokens}`);
      console.log(`   • Total Cost: $${this.totalCost.toFixed(4)}`);
    }
  }

  /**
   * Trace an LLM call within this agent's context
   */
  async traceLLMCall<T>(
    operation: () => Promise<T>,
    metadata: {
      prompt: string;
      systemPrompt?: string;
      model: string;
      temperature?: number;
      maxTokens?: number;
      purpose?: string;
    }
  ): Promise<T> {
    this.llmCallCount++;
    
    const result = await langsmithTracer.traceLLMCall(
      operation,
      {
        ...metadata,
        agentName: this.agentName,
        agentType: this.agentType,
        tags: [`agent:${this.agentName}`, metadata.purpose || 'inference'].filter(Boolean),
        sessionId: this.sessionId
      }
    );

    // Track metrics
    if (result && typeof result === 'object' && 'usage' in result) {
      const usage = (result as any).usage;
      if (usage) {
        const promptTokens = usage.prompt_tokens || 0;
        const completionTokens = usage.completion_tokens || 0;
        const totalTokens = usage.total_tokens || promptTokens + completionTokens || 0;

        this.totalTokens += totalTokens;

        // Calculate cost using MODEL_PRICING (per 1K tokens)
        const pricing = MODEL_PRICING[metadata.model as keyof typeof MODEL_PRICING];
        const cost = pricing
          ? (promptTokens / 1000) * pricing.input + (completionTokens / 1000) * pricing.output
          : 0;
        this.totalCost += cost;

        // Update session metrics
        if (this.sessionId) {
          await observabilityManager.trackLLMCall(
            {
              tokens: totalTokens,
              cost,
              latency: 0 // Detailed latency is captured within LangSmith
            },
            this.sessionId
          );
        }
      }
    }

    return result;
  }

  /**
   * Wrap an OpenAI call with tracing
   */
  async traceOpenAICall(
    openai: OpenAI,
    params: OpenAI.ChatCompletionCreateParams,
    purpose?: string
  ): Promise<OpenAI.ChatCompletion> {
    const prompt = params.messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n');
    
    const systemPrompt = params.messages
      .find(m => m.role === 'system')
      ?.content?.toString();

    return this.traceLLMCall(
      () => openai.chat.completions.create(params),
      {
        prompt,
        systemPrompt,
        model: params.model,
        temperature: params.temperature,
        maxTokens: params.max_tokens,
        purpose
      }
    );
  }

  /**
   * Track inter-agent communication
   */
  async trackInterAgentCall(
    targetAgent: string,
    message: any,
    response?: any
  ): Promise<void> {
    console.log(`\n🔄 Inter-Agent Communication:`);
    console.log(`   From: ${this.agentName}`);
    console.log(`   To: ${targetAgent}`);
    console.log(`   Message Size: ${JSON.stringify(message).length} bytes`);
    
    if (response) {
      console.log(`   Response Size: ${JSON.stringify(response).length} bytes`);
    }
  }

  /**
   * Track agent decision
   */
  async trackDecision(
    decision: string,
    reasoning: string,
    confidence?: number
  ): Promise<void> {
    console.log(`\n🎯 Agent Decision [${this.agentName}]:`);
    console.log(`   Decision: ${decision}`);
    console.log(`   Reasoning: ${reasoning.substring(0, 200)}${reasoning.length > 200 ? '...' : ''}`);
    
    if (confidence !== undefined) {
      console.log(`   Confidence: ${(confidence * 100).toFixed(1)}%`);
    }
  }

  /**
   * Track agent insights
   */
  async trackInsights(insights: string[]): Promise<void> {
    if (insights.length === 0) return;
    
    console.log(`\n💡 Agent Insights [${this.agentName}]:`);
    insights.slice(0, 3).forEach(insight => {
      console.log(`   • ${insight.substring(0, 150)}${insight.length > 150 ? '...' : ''}`);
    });
    
    if (insights.length > 3) {
      console.log(`   ... and ${insights.length - 3} more insights`);
    }
  }

  /**
   * Track agent concerns or warnings
   */
  async trackConcerns(concerns: string[]): Promise<void> {
    if (concerns.length === 0) return;
    
    console.log(`\n⚠️ Agent Concerns [${this.agentName}]:`);
    concerns.forEach(concern => {
      console.log(`   • ${concern.substring(0, 150)}${concern.length > 150 ? '...' : ''}`);
    });
  }

  /**
   * Get model cost per token (rough estimate)
   */
  private getModelCostPerToken(model: string): number {
    const costs: Record<string, number> = {
      'gpt-4o': 0.00002, // Average of input/output
      'gpt-4o-mini': 0.000000375, // Average of input/output
      'gpt-4-turbo': 0.00002,
      'gpt-4': 0.000045,
      'gpt-3.5-turbo': 0.000001,
    };
    
    return costs[model] || 0.000001;
  }

  /**
   * Get agent metrics
   */
  getMetrics() {
    return {
      agentName: this.agentName,
      llmCallCount: this.llmCallCount,
      totalTokens: this.totalTokens,
      totalCost: this.totalCost
    };
  }
}

/**
 * Factory function to create a new agent tracer
 */
export function createAgentTracer(
  agentName: string,
  agentType: TraceMetadata['agentType'] = 'specialist',
  sessionId?: string
): AgentTracer {
  return new AgentTracer(agentName, agentType, sessionId);
}
