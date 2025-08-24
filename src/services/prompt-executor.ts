/**
 * Prompt Executor Service
 * Client-side service for executing prompts in production
 */

interface ExecutePromptOptions {
  promptId?: string;
  promptName?: string;
  variables: Record<string, any>;
  environment?: 'development' | 'staging' | 'production';
  metadata?: Record<string, any>;
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  };
}

interface PromptExecutionResponse {
  success: boolean;
  data?: {
    response: string;
    promptId: string;
    promptName: string;
    versionId: string;
    versionNumber: number;
  };
  metadata?: {
    tokensUsed: number;
    cost: number;
    latencyMs: number;
    model: string;
    service: string;
    environment: string;
    timestamp: string;
  };
  error?: string;
  details?: any;
  requestId: string;
}

class PromptExecutor {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = '/api', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Execute a prompt with given variables
   */
  async execute(options: ExecutePromptOptions): Promise<PromptExecutionResponse> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add API key if provided (for external/automated calls)
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }

      const response = await fetch(`${this.baseUrl}/execute-prompt`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          promptId: options.promptId,
          promptName: options.promptName,
          variables: options.variables,
          environment: options.environment || 'production',
          metadata: options.metadata || {},
          options: options.options || {}
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute prompt');
      }

      return data;
    } catch (error: any) {
      console.error('Prompt execution error:', error);
      return {
        success: false,
        error: error.message,
        requestId: `client_error_${Date.now()}`
      };
    }
  }

  /**
   * Execute a contract review prompt
   */
  async analyzeContract(contractContent: string, options: Partial<ExecutePromptOptions> = {}) {
    return this.execute({
      promptName: 'AI Legal Assistant for Contract Review',
      variables: {
        contract_content: contractContent,
        ...options.variables
      },
      environment: options.environment || 'production',
      metadata: {
        documentType: 'contract',
        ...options.metadata
      },
      options: options.options
    });
  }

  /**
   * Get list of available prompts
   */
  async getAvailablePrompts() {
    try {
      const headers: HeadersInit = {};
      
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }

      const response = await fetch(`${this.baseUrl}/execute-prompt`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error fetching prompts:', error);
      return {
        success: false,
        error: error.message,
        prompts: []
      };
    }
  }

  /**
   * Batch execute multiple prompts
   */
  async executeBatch(executions: ExecutePromptOptions[]) {
    const results = await Promise.allSettled(
      executions.map(exec => this.execute(exec))
    );

    return results.map((result, index) => ({
      index,
      status: result.status,
      result: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }
}

// Export singleton instance for convenience
export const promptExecutor = new PromptExecutor();

// Export class for custom instances
export default PromptExecutor;

// Convenience functions for common use cases
export async function analyzeContract(contractContent: string) {
  return promptExecutor.analyzeContract(contractContent);
}

export async function executePrompt(
  promptIdOrName: string,
  variables: Record<string, any>,
  options: Partial<ExecutePromptOptions> = {}
) {
  const isId = promptIdOrName.includes('-'); // UUID format
  
  return promptExecutor.execute({
    ...(isId ? { promptId: promptIdOrName } : { promptName: promptIdOrName }),
    variables,
    ...options
  });
}