import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize OpenAI client (will be configured with API key from env or database)
const getOpenAIClient = (apiKey?: string) => {
  return new OpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY || '',
  });
};

// Initialize Anthropic client
const getAnthropicClient = (apiKey?: string) => {
  return new Anthropic({
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY || '',
  });
};

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
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
      type,
      variables,
    } = body;

    // Get API configuration for the organization
    let apiKey: string | undefined;
    if (userRecord.organizationId) {
      const apiConfig = await prismaClient.lLMApiConfiguration.findFirst({
        where: {
          organizationId: userRecord.organizationId,
          service: service,
          isActive: true,
        },
      });
      
      if (apiConfig) {
        // In production, decrypt the API key
        // For now, we'll use it directly (you should implement proper encryption)
        apiKey = apiConfig.apiKeyEncrypted;
      }
    }

    // Use environment variables as fallback
    if (!apiKey) {
      if (service === 'OPENAI') {
        apiKey = process.env.OPENAI_API_KEY;
      } else if (service === 'ANTHROPIC') {
        apiKey = process.env.ANTHROPIC_API_KEY;
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: `No API key configured for ${service}. Please configure an API key in your environment variables or organization settings.` },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    let response: any;
    let tokensUsed = 0;
    let cost = 0;

    try {
      if (service === 'OPENAI' || service === 'AZURE') {
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
          tokensUsed = completion.usage?.total_tokens || 0;
          
          // Log for debugging
          console.log('OpenAI Response received:', {
            model: settings.model,
            tokensUsed,
            responseLength: response?.length,
            messageCount: messages.length
          });
          
          // Rough cost estimation for GPT-4
          if (settings.model?.includes('gpt-4')) {
            cost = (completion.usage?.prompt_tokens || 0) * 0.00003 + 
                   (completion.usage?.completion_tokens || 0) * 0.00006;
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
          tokensUsed = completion.usage?.total_tokens || 0;
          cost = tokensUsed * 0.000002;
        }
      } else if (service === 'ANTHROPIC') {
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
        
        // Anthropic doesn't provide token counts in the same way
        tokensUsed = Math.ceil(response.length / 4); // Rough estimate
        
        // Rough cost estimation for Claude
        if (settings.model?.includes('opus')) {
          cost = tokensUsed * 0.000015;
        } else if (settings.model?.includes('sonnet')) {
          cost = tokensUsed * 0.000003;
        } else {
          cost = tokensUsed * 0.0000008; // Haiku pricing
        }
      } else {
        return NextResponse.json(
          { error: `Service ${service} is not yet implemented` },
          { status: 400 }
        );
      }

      const latencyMs = Date.now() - startTime;

      // Save test run to database
      if (promptId) {
        const promptTemplate = await prismaClient.promptTemplate.findUnique({
          where: { id: promptId },
          include: {
            versions: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            }
          }
        });

        if (promptTemplate && promptTemplate.versions[0]) {
          await prismaClient.promptTestRun.create({
            data: {
              versionId: promptTemplate.versions[0].id,
              variables: variables || {},
              requestContent: {
                content,
                settings,
              },
              responseContent: response || '',
              tokensUsed,
              cost,
              latencyMs,
              status: 'SUCCESS',
              userId: userRecord.id,
              service: service,
              model: settings.model || 'unknown',
              promptTemplateId: promptId,
              settings: settings || {},
            },
          });
        }
      }

      return NextResponse.json({
        response,
        tokensUsed,
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
            versions: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            }
          }
        });

        if (promptTemplate && promptTemplate.versions[0]) {
          await prismaClient.promptTestRun.create({
            data: {
              versionId: promptTemplate.versions[0].id,
              variables: variables || {},
              requestContent: {
                content,
                settings,
              },
              responseContent: '',
              tokensUsed: 0,
              cost: 0,
              latencyMs: Date.now() - startTime,
              status: 'ERROR',
              error: error.message,
              userId: userRecord.id,
              service: service,
              model: settings?.model || 'unknown',
              promptTemplateId: promptId,
              settings: settings || {},
            },
          });
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
}