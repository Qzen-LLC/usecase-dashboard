import { withAuth } from '@/lib/auth-gateway';

import { prismaClient } from '@/utils/db';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Production API endpoint for executing prompts
 * This can be called by your application, external services, or automation workflows
 */

// Initialize LLM clients
const getOpenAIClient = (apiKey?: string) => {
  return new OpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY || '',
  });
};

const getAnthropicClient = (apiKey?: string) => {
  return new Anthropic({
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY || '',
  });
};

// Helper to interpolate variables into prompt content
function interpolateVariables(content: any, variables: Record<string, string>): any {
  if (typeof content === 'string') {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  }
  
  if (content?.prompt) {
    return {
      ...content,
      prompt: interpolateVariables(content.prompt, variables)
    };
  }
  
  if (content?.messages) {
    return {
      ...content,
      messages: content.messages.map((msg: any) => ({
        ...msg,
        content: interpolateVariables(msg.content, variables)
      }))
    };
  }
  
  return content;
}

export const POST = withAuth(async (request: Request, { auth }) => {
  try {
    // Support both authenticated users and API key authentication
    const apiKeyHeader = request.headers.get('x-api-key');
    
    // Get user record
    let userRecord;
    if (auth.userId) {
      userRecord = await prismaClient.user.findUnique({
        where: { clerkId: auth.userId },
      });
    } else if (apiKeyHeader) {
      // In production, you'd validate the API key against your database
      // For now, we'll use a simple check
      if (apiKeyHeader !== process.env.API_SECRET_KEY) {
        return new Response(JSON.stringify({ error: 'Invalid API key' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
      // For API key auth, you might want to track which app/service is calling
      userRecord = await prismaClient.user.findFirst({
        where: { email: 'api@system.internal' },
      });
    } else {
      return new Response(JSON.stringify({ error: 'Authentication required. Provide either a session or X-API-Key header.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    if (!userRecord) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await request.json();
    const {
      promptId,           // ID of the prompt template to use
      promptName,         // Alternative: use prompt name instead of ID
      variables = {},     // Variables to interpolate
      environment = 'production', // Environment context
      metadata = {},      // Additional metadata for tracking
      options = {}        // Override settings like temperature, max_tokens
    } = body;

    // Validate input
    if (!promptId && !promptName) {
      return new Response(JSON.stringify({ error: 'Either promptId or promptName is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Fetch the prompt template
    let promptTemplate;
    if (promptId) {
      promptTemplate = await prismaClient.promptTemplate.findUnique({
        where: { id: promptId },
        include: {
          PromptDeployment: {
            where: {
              environment: environment.toUpperCase(),
              isActive: true,
            },
            include: {
              PromptVersion: true,
            },
          },
          PromptVersion: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        }
      });
    } else {
      promptTemplate = await prismaClient.promptTemplate.findFirst({
        where: { 
          name: promptName,
          organizationId: userRecord.organizationId 
        },
        include: {
          PromptDeployment: {
            where: {
              environment: environment.toUpperCase(),
              isActive: true,
            },
            include: {
              PromptVersion: true,
            },
          },
          PromptVersion: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        }
      });
    }

    if (!promptTemplate) {
      return new Response(JSON.stringify({ error: 'Prompt template not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // Check permissions
    if (userRecord.role === 'USER' && promptTemplate.userId !== userRecord.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    if ((userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') 
        && promptTemplate.organizationId !== userRecord.organizationId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // Use deployed version if available, otherwise use latest version
    const versionToUse = (promptTemplate as any).PromptDeployment?.[0]?.PromptVersion || (promptTemplate as any).PromptVersion?.[0];
    
    if (!versionToUse) {
      return new Response(JSON.stringify({ error: 'No version available for this prompt' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Interpolate variables into content
    const interpolatedContent = interpolateVariables(
      versionToUse.content || promptTemplate.content,
      variables
    );

    // Merge settings with options override
    const settings = {
      ...(versionToUse.settings || promptTemplate.settings),
      ...options
    };

    // Get API configuration
    let apiKey: string | undefined;
    {
      const apiConfig = await prismaClient.lLMApiConfiguration.findFirst({
        where: {
          userId: userRecord.id,
          service: promptTemplate.service,
          isActive: true,
        },
      });
      if (apiConfig) {
        apiKey = (apiConfig as any).apiKey;
      }
    }

    // Use environment variables as fallback
    if (!apiKey) {
      if (promptTemplate.service === 'OPENAI') {
        apiKey = process.env.OPENAI_API_KEY;
      } else if (promptTemplate.service === 'ANTHROPIC') {
        apiKey = process.env.ANTHROPIC_API_KEY;
      }
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: `No API key configured for ${promptTemplate.service}` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Execute the prompt
    const startTime = Date.now();
    let response: any;
    let tokensUsed = 0;
    let cost = 0;

    try {
      if (promptTemplate.service === 'OPENAI' || promptTemplate.service === 'AZURE') {
        const openai = getOpenAIClient(apiKey);
        
        const isChatModel = settings.model?.includes('gpt-3.5-turbo') || 
                           settings.model?.includes('gpt-4') ||
                           promptTemplate.type === 'CHAT';
        
        if (isChatModel) {
          const messages = promptTemplate.type === 'CHAT' 
            ? interpolatedContent.messages 
            : [{ role: 'user', content: interpolatedContent.prompt || interpolatedContent }];
            
          const completion = await openai.chat.completions.create({
            model: settings.model || 'gpt-4-turbo-preview',
            messages: messages,
            temperature: settings.temperature || 0.7,
            max_tokens: settings.maxTokens || 2000,
            top_p: settings.topP || 1,
            frequency_penalty: settings.frequencyPenalty || 0,
            presence_penalty: settings.presencePenalty || 0,
          });

          response = completion.choices[0].message.content;
          tokensUsed = completion.usage?.total_tokens || 0;
          
          // Cost estimation
          if (settings.model?.includes('gpt-4')) {
            cost = (completion.usage?.prompt_tokens || 0) * 0.00003 + 
                   (completion.usage?.completion_tokens || 0) * 0.00006;
          } else {
            cost = tokensUsed * 0.000002;
          }
        } else {
          // Legacy completion endpoint
          const completion = await openai.completions.create({
            model: settings.model || 'gpt-3.5-turbo-instruct',
            prompt: interpolatedContent.prompt || interpolatedContent,
            temperature: settings.temperature || 0.7,
            max_tokens: settings.maxTokens || 2000,
            top_p: settings.topP || 1,
            frequency_penalty: settings.frequencyPenalty || 0,
            presence_penalty: settings.presencePenalty || 0,
          });

          response = completion.choices[0].text;
          tokensUsed = completion.usage?.total_tokens || 0;
          cost = tokensUsed * 0.000002;
        }
      } else if (promptTemplate.service === 'ANTHROPIC') {
        const anthropic = getAnthropicClient(apiKey);
        
        const message = await anthropic.messages.create({
          model: settings.model || 'claude-3-opus-20240229',
          max_tokens: settings.maxTokens || 2000,
          temperature: settings.temperature || 0.7,
          messages: promptTemplate.type === 'CHAT' 
            ? interpolatedContent.messages 
            : [{ role: 'user', content: interpolatedContent.prompt || interpolatedContent }],
        });

        response = message.content[0].type === 'text' 
          ? message.content[0].text 
          : JSON.stringify(message.content);
        
        tokensUsed = Math.ceil(response.length / 4);
        
        // Cost estimation for Claude
        if (settings.model?.includes('opus')) {
          cost = tokensUsed * 0.000015;
        } else if (settings.model?.includes('sonnet')) {
          cost = tokensUsed * 0.000003;
        } else {
          cost = tokensUsed * 0.0000008;
        }
      } else {
        return new Response(JSON.stringify({ error: `Service ${promptTemplate.service} is not yet implemented` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      const latencyMs = Date.now() - startTime;

      // Log execution for analytics and debugging
      await prismaClient.promptTestRun.create({
        data: {
          versionId: versionToUse.id,
          variables: variables,
          requestContent: {
            content: interpolatedContent,
            metadata,
            environment,
          },
          responseContent: String(response ?? ''),
          tokensUsed,
          cost,
          latencyMs,
          status: 'SUCCESS',
          userId: userRecord.id,
          promptTemplateId: (promptTemplate as any).id,
          model: (settings as any).model || '',
          service: (promptTemplate as any).service,
          settings: settings as any,
        },
      });
      console.log('[CRUD_LOG] Prompt Test Run created:', { templateId: promptTemplate.id, versionId: versionToUse.id, model: settings.model, tokensUsed: tokensUsed, cost: cost, authoredBy: userRecord.id });

      // Return structured response
      return new Response(JSON.stringify({
        success: true,
        data: {
          response,
          promptId: (promptTemplate as any).id,
          promptName: (promptTemplate as any).name,
          versionId: versionToUse.id,
          versionNumber: (versionToUse as any).versionNumber,
        },
        metadata: {
          tokensUsed,
          cost,
          latencyMs,
          model: (settings as any).model,
          service: (promptTemplate as any).service,
          environment,
          timestamp: new Date().toISOString(),
        },
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error: any) {
      console.error('LLM Execution Error:', error);
      
      // Log failed execution
      await prismaClient.promptTestRun.create({
        data: {
          versionId: versionToUse.id,
          variables: variables,
          requestContent: {
            content: interpolatedContent,
            metadata,
            environment,
          },
          responseContent: '',
          status: 'FAILED',
          error: error.message,
          userId: userRecord.id,
          promptTemplateId: (promptTemplate as any).id,
          model: (settings as any).model || '',
          service: (promptTemplate as any).service,
          settings: settings as any,
        },
      });
      console.log('[CRUD_LOG] Prompt Test Run created (error):', { templateId: promptTemplate.id, versionId: versionToUse.id, model: settings.model, error: error.message, authoredBy: userRecord.id });

      return new Response(JSON.stringify({
        success: false,
        error: error.message || 'Failed to execute prompt',
        details: (error as any).response?.data || error.toString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error',
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}, { requireUser: false }); // Allow API key auth

// GET endpoint for checking prompt availability
export const GET = withAuth(async (request: Request, { auth }) => {
  try {
    // auth context is provided by withAuth wrapper

    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: (auth as any).userId! },
    });

    if (!userRecord) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // Get available prompts for this user/organization
    const prompts = await prismaClient.promptTemplate.findMany({
      where: {
        OR: [
          { userId: userRecord.id },
          { organizationId: userRecord.organizationId }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        service: true,
        variables: true,
        createdAt: true,
        updatedAt: true,
        PromptDeployment: {
          where: { isActive: true },
          select: {
            environment: true,
            deployedAt: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return new Response(JSON.stringify({
      success: true,
      prompts,
      count: prompts.length
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error fetching prompts:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch prompts' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}, { requireUser: true });