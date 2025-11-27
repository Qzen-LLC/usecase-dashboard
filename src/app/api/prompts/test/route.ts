import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-gateway';

import { prismaClient } from '@/utils/db';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { decryptApiKey } from '@/lib/security/api-key-encryption';

// Initialize OpenAI client
const getOpenAIClient = (apiKey: string) => {
  return new OpenAI({
    apiKey: apiKey,
  });
};

// Initialize Anthropic client
const getAnthropicClient = (apiKey: string) => {
  return new Anthropic({
    apiKey: apiKey,
  });
};

export const POST = withAuth(async (
  request: Request,
  { auth }: { auth: any }
) => {
  try {
    // auth context is provided by withAuth wrapper

    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: auth.userId! },
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      promptId,
      content,
      settings,
      service,
      providerName, // Accept providerName as alias for service (for backward compatibility)
      type,
      variables,
    } = body;

    // Use service or providerName (providerName takes precedence if both are provided)
    const serviceName = providerName || service;

    // Validate required fields
    if (!serviceName) {
      return NextResponse.json(
        { error: 'Service is required. Please provide a service (OPENAI, ANTHROPIC, etc.) via "service" or "providerName" field.' },
        { status: 400 }
      );
    }

    // Determine organizationId:
    // - For QZEN_ADMIN: Get from prompt template (can test any organization's prompts)
    // - For ORG_ADMIN: Use their organizationId or prompt's organizationId if it matches
    let organizationId: string | null = null;

    if (userRecord.role === 'QZEN_ADMIN') {
      // QZEN_ADMIN can test prompts from any organization
      // Get organizationId from the prompt template if promptId is provided
      if (promptId) {
        const promptTemplate = await prismaClient.promptTemplate.findUnique({
          where: { id: promptId },
          select: { organizationId: true },
        });
        organizationId = promptTemplate?.organizationId || null;
      }
      
      if (!organizationId) {
        return NextResponse.json(
          { error: 'Could not determine organization. Please provide a valid promptId or ensure the prompt has an organizationId.' },
          { status: 400 }
        );
      }
    } else {
      // ORG_ADMIN uses their own organizationId
      organizationId = userRecord.organizationId;
      
      if (!organizationId) {
        return NextResponse.json(
          { error: 'User organization not found. Please ensure you are associated with an organization.' },
          { status: 400 }
        );
      }
    }

    // Get API key from backend (AiModel table) based on organization, provider, and model
    let apiKey: string | undefined;

    // Determine the model name that will be used (with defaults matching the API calls below)
    let modelName: string;
    if (settings.model) {
      modelName = settings.model;
    } else {
      // Use the same defaults as in the API calls
      if (serviceName === 'OPENAI' || serviceName === 'AZURE') {
        modelName = 'gpt-4-turbo-preview';
      } else if (serviceName === 'ANTHROPIC') {
        modelName = 'claude-3-opus-20240229';
      } else {
        modelName = '';
      }
    }

    // Find the model configuration in the database
    const modelConfig = await prismaClient.aiModel.findFirst({
      where: {
        organizationId: organizationId,
        providerName: serviceName,
        modelName: modelName,
      },
    });

    if (modelConfig) {
      try {
        apiKey = decryptApiKey(modelConfig.apiKey);
      } catch (error) {
        console.error('Failed to decrypt API key:', error);
        return NextResponse.json(
          { error: 'Failed to decrypt stored API key. Please verify the encryption key configuration.' },
          { status: 500 }
        );
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: `No API key configured for ${serviceName} model ${modelName} in organization ${organizationId}. Please configure an API key in the Configure Models page.` },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    let response: any;
    let tokensUsed = 0;
    let inputTokens = 0;
    let outputTokens = 0;
    let cost = 0;

    try {
      if (serviceName === 'OPENAI' || serviceName === 'AZURE') {
        const openai = getOpenAIClient(apiKey);
        
        // For GPT-3.5/4 models, always use chat completions endpoint
        // Even for simple prompts, we'll convert them to chat format
        const isChatModel = settings.model?.includes('gpt-3.5-turbo') || 
                           settings.model?.includes('gpt-4') ||
                           type === 'CHAT';
        
        if (isChatModel) {
          // Convert simple prompt to chat format if needed
          const messages = type === 'CHAT' 
            ? content.messages 
            : [{ role: 'user', content: content.prompt }];
            
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
          inputTokens = completion.usage?.prompt_tokens || 0;
          outputTokens = completion.usage?.completion_tokens || 0;
          tokensUsed = completion.usage?.total_tokens || 0;
          
          // Log for debugging
          console.log('OpenAI Response received:', {
            model: settings.model,
            inputTokens,
            outputTokens,
            tokensUsed,
            responseLength: response?.length,
            messageCount: messages.length
          });
          
          // Rough cost estimation for GPT-4
          if (settings.model?.includes('gpt-4')) {
            cost = inputTokens * 0.00003 + outputTokens * 0.00006;
          } else {
            cost = tokensUsed * 0.000002; // GPT-3.5 pricing
          }
        } else {
          // Legacy completion endpoint for older models (text-davinci-003, etc.)
          const completion = await openai.completions.create({
            model: settings.model || 'gpt-3.5-turbo-instruct',
            prompt: content.prompt,
            temperature: settings.temperature || 0.7,
            max_tokens: settings.maxTokens || 2000,
            top_p: settings.topP || 1,
            frequency_penalty: settings.frequencyPenalty || 0,
            presence_penalty: settings.presencePenalty || 0,
          });

          response = completion.choices[0].text;
          inputTokens = completion.usage?.prompt_tokens || 0;
          outputTokens = completion.usage?.completion_tokens || 0;
          tokensUsed = completion.usage?.total_tokens || 0;
          cost = tokensUsed * 0.000002;
        }
      } else if (serviceName === 'ANTHROPIC') {
        const anthropic = getAnthropicClient(apiKey);
        
        const message = await anthropic.messages.create({
          model: settings.model || 'claude-3-opus-20240229',
          max_tokens: settings.maxTokens || 2000,
          temperature: settings.temperature || 0.7,
          messages: type === 'CHAT' 
            ? content.messages 
            : [{ role: 'user', content: content.prompt }],
        });

        response = message.content[0].type === 'text' 
          ? message.content[0].text 
          : JSON.stringify(message.content);
        
        // Extract token counts from Anthropic response
        if (message.usage) {
          inputTokens = message.usage.input_tokens || 0;
          outputTokens = message.usage.output_tokens || 0;
          tokensUsed = inputTokens + outputTokens;
        } else {
          // Fallback estimation if usage not available
          tokensUsed = Math.ceil(response.length / 4);
          inputTokens = Math.floor(tokensUsed * 0.5);
          outputTokens = Math.ceil(tokensUsed * 0.5);
        }
        
        // Rough cost estimation for Claude
        if (settings.model?.includes('opus')) {
          cost = (inputTokens / 1000 * 0.015) + (outputTokens / 1000 * 0.075);
        } else if (settings.model?.includes('sonnet')) {
          cost = (inputTokens / 1000 * 0.003) + (outputTokens / 1000 * 0.015);
        } else {
          cost = (inputTokens / 1000 * 0.00025) + (outputTokens / 1000 * 0.00125); // Haiku pricing
        }
      } else {
        return NextResponse.json(
          { error: `Service ${serviceName} is not yet implemented` },
          { status: 400 }
        );
      }

      const latencyMs = Date.now() - startTime;

      // Save test run to database
      if (promptId) {
        console.log('[CRUD_LOG] Attempting to save test run for prompt:', promptId);
        
        const promptTemplate = await prismaClient.promptTemplate.findUnique({
          where: { id: promptId },
          include: {
            PromptVersion: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            }
          }
        });

        console.log('[CRUD_LOG] Found prompt template:', !!promptTemplate);
        if (promptTemplate) {
          console.log('[CRUD_LOG] Prompt versions:', promptTemplate.PromptVersion?.length || 0);
        }

        if (promptTemplate) {
          // Use the latest version if available, otherwise use the prompt template ID as version ID
          const versionId = promptTemplate.PromptVersion[0]?.id || promptId;
          console.log('[CRUD_LOG] Using version ID:', versionId);
          
          try {
            await prismaClient.promptTestRun.create({
              data: {
                versionId: versionId,
                variables: variables || {},
                requestContent: {
                  content,
                  settings,
                },
                responseContent: response || '',
                tokensUsed,
                inputTokens,
                outputTokens,
                cost,
                latencyMs,
                status: 'SUCCESS',
                userId: userRecord.id,
                service: serviceName,
                model: settings.model || 'unknown',
                promptTemplateId: promptId,
                settings: settings || {},
              },
            });
            console.log('[CRUD_LOG] Prompt Test Run created successfully:', { templateId: promptId, versionId: versionId, model: settings.model || 'unknown', tokensUsed, cost, authoredBy: userRecord.id });
          } catch (dbError) {
            console.error('[CRUD_LOG] Database error saving test run:', dbError);
          }
        } else {
          console.log('[CRUD_LOG] Prompt template not found:', promptId);
        }
      } else {
        console.log('[CRUD_LOG] No promptId provided, skipping save');
      }

      return NextResponse.json({
        response,
        tokensUsed,
        inputTokens,
        outputTokens,
        cost,
        latencyMs,
        status: 'SUCCESS',
      });

    } catch (error: any) {
      console.error('LLM API Error:', error);
      
      // Save failed test run
      if (promptId) {
        const promptTemplate = await prismaClient.promptTemplate.findUnique({
          where: { id: promptId },
          include: {
            PromptVersion: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            }
          }
        });

        if (promptTemplate) {
          const versionId = promptTemplate.PromptVersion[0]?.id || promptId;
          await prismaClient.promptTestRun.create({
            data: {
              versionId: versionId,
              variables: variables || {},
              requestContent: {
                content,
                settings,
              },
              responseContent: '',
              tokensUsed: 0,
              inputTokens: 0,
              outputTokens: 0,
              cost: 0,
              latencyMs: Date.now() - startTime,
              status: 'ERROR',
              error: error.message,
              userId: userRecord.id,
              service: serviceName,
              model: settings?.model || 'unknown',
              promptTemplateId: promptId,
              settings: settings || {},
            },
          });
          console.log('[CRUD_LOG] Prompt Test Run created (error):', { templateId: promptId, versionId: versionId, model: settings?.model || 'unknown', error: error.message, authoredBy: userRecord.id });
        }
      }

      return NextResponse.json(
        { 
          error: error.message || 'Failed to execute prompt',
          details: error.response?.data || error.toString()
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error testing prompt:', error);
    return NextResponse.json(
      { error: 'Failed to test prompt' },
      { status: 500 }
    );
  }
}, { requireUser: true });