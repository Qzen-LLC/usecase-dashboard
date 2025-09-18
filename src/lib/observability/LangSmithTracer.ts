/**
 * LangSmith Tracer for comprehensive LLM observability
 */

import { Client } from 'langsmith';
import { RunTree } from 'langsmith/run_trees';
import OpenAI from 'openai';
import { 
  TraceMetadata, 
  LLMCallMetrics, 
  MODEL_PRICING, 
  ObservabilityConfig 
} from './types';

export class LangSmithTracer {
  private static instance: LangSmithTracer;
  private client: Client | null = null;
  private config: ObservabilityConfig;
  private currentRun: RunTree | null = null;
  private runStack: RunTree[] = [];

  private constructor() {
    this.config = {
      enabled: process.env.ENABLE_OBSERVABILITY === 'true',
      level: (process.env.OBSERVABILITY_LEVEL as any) || 'detailed',
      langsmithApiKey: process.env.LANGSMITH_API_KEY,
      langsmithProject: process.env.LANGSMITH_PROJECT || 'default',
      capturePrompts: true,
      captureResponses: true,
      sanitizeSensitiveData: true,
      enableCostTracking: true,
      enableLatencyTracking: true,
    };

    console.log('🔍 LangSmith Config:', {
      enabled: this.config.enabled,
      hasApiKey: !!this.config.langsmithApiKey,
      project: this.config.langsmithProject,
      level: this.config.level
    });

    if (this.config.enabled && this.config.langsmithApiKey) {
      this.initializeClient();
    } else {
      console.warn('⚠️ LangSmith not initialized:', {
        enabled: this.config.enabled,
        hasApiKey: !!this.config.langsmithApiKey
      });
    }
  }

  static getInstance(): LangSmithTracer {
    if (!LangSmithTracer.instance) {
      LangSmithTracer.instance = new LangSmithTracer();
    }
    return LangSmithTracer.instance;
  }

  private initializeClient() {
    try {
      // LangSmith client also checks process.env directly
      process.env.LANGSMITH_API_KEY = this.config.langsmithApiKey;
      process.env.LANGSMITH_PROJECT = this.config.langsmithProject;

      this.client = new Client({
        apiKey: this.config.langsmithApiKey,
        apiUrl: 'https://api.smith.langchain.com',
      });
      console.log('✅ LangSmith client initialized successfully');
      console.log('📊 LangSmith project:', this.config.langsmithProject);
    } catch (error) {
      console.error('❌ Failed to initialize LangSmith client:', error);
      this.config.enabled = false;
    }
  }

  /**
   * Start a new trace session
   */
  async startSession(metadata: TraceMetadata): Promise<RunTree | null> {
    console.log('📌 LangSmith startSession called:', {
      enabled: this.config.enabled,
      hasClient: !!this.client,
      metadata
    });

    if (!this.config.enabled || !this.client) {
      console.warn('⚠️ LangSmith session not started - disabled or no client');
      return null;
    }

    try {
      const run = new RunTree({
        name: metadata.agentName || 'LLM Session',
        run_type: 'chain',
        inputs: {
          useCaseId: metadata.useCaseId,
          useCaseTitle: metadata.useCaseTitle,
          phase: metadata.phase,
          sessionId: metadata.sessionId || `session-${Date.now()}`,
        },
        tags: metadata.tags || [],
        project_name: this.config.langsmithProject,
      });

      await run.postRun();
      this.currentRun = run;
      this.runStack = [run];

      console.log(`🎯 Started LangSmith session: ${run.id}`);
      console.log(`📊 View at: https://smith.langchain.com/public/${this.config.langsmithProject}/r/${run.id}`);
      return run;
    } catch (error) {
      console.error('Failed to start LangSmith session:', error);
      return null;
    }
  }

  /**
   * Trace an LLM call with full metrics
   */
  async traceLLMCall<T>(
    operation: () => Promise<T>,
    metadata: TraceMetadata & {
      prompt: string;
      systemPrompt?: string;
      model: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<T> {
    const startTime = Date.now();
    const parentRun = this.runStack[this.runStack.length - 1] || this.currentRun;

    // Create child run for this LLM call
    let childRun: RunTree | null = null;
    
    if (this.config.enabled && parentRun) {
      childRun = parentRun.createChild({
        name: `LLM Call: ${metadata.agentName || 'Direct'}`,
        run_type: 'llm',
        inputs: this.config.capturePrompts ? {
          prompt: this.sanitize(metadata.prompt),
          systemPrompt: metadata.systemPrompt ? this.sanitize(metadata.systemPrompt) : undefined,
          model: metadata.model,
          temperature: metadata.temperature,
          maxTokens: metadata.maxTokens,
        } : { model: metadata.model },
        tags: [...(metadata.tags || []), metadata.model, 'llm-call'],
      });

      await childRun.postRun();
      this.runStack.push(childRun);
    }

    try {
      // Execute the actual LLM call
      const result = await operation();
      const endTime = Date.now();
      const latencyMs = endTime - startTime;

      // Calculate metrics if result is from OpenAI
      let metrics: LLMCallMetrics | undefined;
      if (result && typeof result === 'object' && 'usage' in result) {
        const usage = (result as any).usage;
        metrics = {
          promptTokens: usage?.prompt_tokens || 0,
          completionTokens: usage?.completion_tokens || 0,
          totalTokens: usage?.total_tokens || 0,
          estimatedCost: this.calculateCost(
            metadata.model,
            usage?.prompt_tokens || 0,
            usage?.completion_tokens || 0
          ),
          latencyMs,
          model: metadata.model,
          temperature: metadata.temperature,
          maxTokens: metadata.maxTokens,
        };
      }

      // Update run with outputs and metrics
      if (childRun) {
        await childRun.end({
          outputs: this.config.captureResponses ? {
            response: this.sanitize(this.extractResponse(result)),
            metrics,
          } : { metrics },
        });
        
        this.runStack.pop();

        // Log to console if in detailed mode
        if (this.config.level === 'detailed' || this.config.level === 'debug') {
          console.log(`📊 LLM Call Metrics [${metadata.agentName}]:`);
          if (metrics) {
            console.log(`   • Tokens: ${metrics.totalTokens} (prompt: ${metrics.promptTokens}, completion: ${metrics.completionTokens})`);
            console.log(`   • Cost: $${metrics.estimatedCost.toFixed(4)}`);
            console.log(`   • Latency: ${metrics.latencyMs}ms`);
          }
        }
      }

      return result;
    } catch (error) {
      // Log error to run
      if (childRun) {
        await childRun.end({
          error: String(error),
          outputs: { error: String(error) },
        });
        this.runStack.pop();
      }
      
      console.error(`❌ LLM call failed [${metadata.agentName}]:`, error);
      throw error;
    }
  }

  /**
   * Create a child trace for agent execution
   */
  async startAgentTrace(
    agentName: string,
    agentType: TraceMetadata['agentType'],
    inputs?: any
  ): Promise<RunTree | null> {
    if (!this.config.enabled) return null;

    const parentRun = this.runStack[this.runStack.length - 1] || this.currentRun;
    if (!parentRun) return null;

    try {
      const childRun = parentRun.createChild({
        name: `Agent: ${agentName}`,
        run_type: 'chain',
        inputs: this.config.capturePrompts ? this.sanitize(inputs) : { agentName },
        tags: [agentType || 'agent', agentName],
      });

      await childRun.postRun();
      this.runStack.push(childRun);
      
      console.log(`🤖 Started agent trace: ${agentName}`);
      return childRun;
    } catch (error) {
      console.error(`Failed to start agent trace for ${agentName}:`, error);
      return null;
    }
  }

  /**
   * End an agent trace with outputs
   */
  async endAgentTrace(outputs?: any, error?: any) {
    if (!this.config.enabled || this.runStack.length === 0) return;

    const run = this.runStack.pop();
    if (!run) return;

    try {
      await run.end({
        outputs: this.config.captureResponses ? this.sanitize(outputs) : undefined,
        error: error ? String(error) : undefined,
      });
      
      console.log(`✅ Ended agent trace: ${run.name}`);
    } catch (err) {
      console.error('Failed to end agent trace:', err);
    }
  }

  /**
   * End the current session
   */
  async endSession(outputs?: any, error?: any) {
    if (!this.config.enabled || !this.currentRun) return;

    try {
      // End all remaining runs in stack
      while (this.runStack.length > 1) {
        const run = this.runStack.pop();
        if (run) {
          await run.end({ outputs: { status: 'parent-ended' } });
        }
      }

      // End the main session
      await this.currentRun.end({
        outputs: this.config.captureResponses ? this.sanitize(outputs) : undefined,
        error: error ? String(error) : undefined,
      });

      console.log(`🏁 Ended LangSmith session: ${this.currentRun.id}`);
      console.log(`📊 View trace at: https://smith.langchain.com/o/e6c3c073-5d24-5088-8a86-3c0ee5065e4d/projects/p/${this.config.langsmithProject}/r/${this.currentRun.id}`);
      
      this.currentRun = null;
      this.runStack = [];
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  }

  /**
   * Calculate cost based on model and token usage
   */
  private calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING];
    if (!pricing) return 0;

    const promptCost = (promptTokens / 1000) * pricing.input;
    const completionCost = (completionTokens / 1000) * pricing.output;
    
    return promptCost + completionCost;
  }

  /**
   * Extract response content from various result formats
   */
  private extractResponse(result: any): string {
    if (!result) return '';
    
    // OpenAI chat completion
    if (result.choices && result.choices[0]?.message?.content) {
      return result.choices[0].message.content;
    }
    
    // Direct string response
    if (typeof result === 'string') {
      return result;
    }
    
    // JSON response
    if (typeof result === 'object') {
      return JSON.stringify(result, null, 2);
    }
    
    return String(result);
  }

  /**
   * Sanitize sensitive data from inputs/outputs
   */
  private sanitize(data: any): any {
    if (!this.config.sanitizeSensitiveData) return data;
    
    const dataStr = JSON.stringify(data);
    
    // Remove API keys
    let sanitized = dataStr.replace(/sk-[a-zA-Z0-9]{48}/g, 'sk-***');
    sanitized = sanitized.replace(/Bearer [a-zA-Z0-9\-._~+\/]+=*/g, 'Bearer ***');
    
    // Remove emails
    sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***@***.com');
    
    // Remove phone numbers
    sanitized = sanitized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '***-***-****');
    
    try {
      return JSON.parse(sanitized);
    } catch {
      return sanitized;
    }
  }

  /**
   * Get trace URL for current session
   */
  getTraceUrl(): string | null {
    if (!this.currentRun) return null;
    return `https://smith.langchain.com/public/${this.config.langsmithProject}/r/${this.currentRun.id}`;
  }

  /**
   * Get current run ID
   */
  getCurrentRunId(): string | null {
    return this.currentRun?.id || null;
  }

  /**
   * Check if tracing is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
}

// Export singleton instance
export const langsmithTracer = LangSmithTracer.getInstance();