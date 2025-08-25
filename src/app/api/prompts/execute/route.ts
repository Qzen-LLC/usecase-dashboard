import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/generated/prisma';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      promptId, 
      content, 
      settings, 
      service, 
      type, 
      variables 
    } = body;

    // Get prompt template
    const promptTemplate = await prisma.promptTemplate.findUnique({
      where: { id: promptId },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!promptTemplate) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Get API configuration
    const apiConfig = await prisma.lLMApiConfiguration.findFirst({
      where: {
        userId,
        service,
        isActive: true
      }
    });

    if (!apiConfig) {
      return NextResponse.json({ 
        error: `No active ${service} API configuration found. Please add your API key in settings.` 
      }, { status: 400 });
    }

    const startTime = Date.now();
    let response = '';
    let inputTokens = 0;
    let outputTokens = 0;
    let tokensUsed = 0;
    let cost = 0;

    try {
      if (service === 'OPENAI') {
        const openai = new OpenAI({
          apiKey: apiConfig.apiKey,
        });

        if (type === 'PROMPT') {
          const completion = await openai.chat.completions.create({
            model: settings.model,
            messages: [
              { role: 'user', content: content.prompt }
            ],
            temperature: settings.temperature,
            max_tokens: settings.maxTokens,
            top_p: settings.topP,
            frequency_penalty: settings.frequencyPenalty || 0,
            presence_penalty: settings.presencePenalty || 0,
          });

          response = completion.choices[0]?.message?.content || '';
          inputTokens = completion.usage?.prompt_tokens || 0;
          outputTokens = completion.usage?.completion_tokens || 0;
          tokensUsed = completion.usage?.total_tokens || 0;
        } else if (type === 'CHAT') {
          const completion = await openai.chat.completions.create({
            model: settings.model,
            messages: content.messages,
            temperature: settings.temperature,
            max_tokens: settings.maxTokens,
            top_p: settings.topP,
            frequency_penalty: settings.frequencyPenalty || 0,
            presence_penalty: settings.presencePenalty || 0,
          });

          response = completion.choices[0]?.message?.content || '';
          inputTokens = completion.usage?.prompt_tokens || 0;
          outputTokens = completion.usage?.completion_tokens || 0;
          tokensUsed = completion.usage?.total_tokens || 0;
        }

        // Calculate cost based on model
        const modelCosts: Record<string, { input: number; output: number }> = {
          'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
          'gpt-4': { input: 0.03, output: 0.06 },
          'gpt-4-32k': { input: 0.06, output: 0.12 },
          'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
          'gpt-3.5-turbo-16k': { input: 0.001, output: 0.002 },
        };

        const modelCost = modelCosts[settings.model] || { input: 0, output: 0 };
        cost = (inputTokens / 1000 * modelCost.input) + (outputTokens / 1000 * modelCost.output);

      } else if (service === 'ANTHROPIC') {
        const anthropic = new Anthropic({
          apiKey: apiConfig.apiKey,
        });

        const anthropicMessages = type === 'PROMPT' 
          ? [{ role: 'user' as const, content: content.prompt }]
          : content.messages.filter((m: any) => m.role !== 'system').map((m: any) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content
            }));

        const systemMessage = type === 'CHAT' 
          ? content.messages.find((m: any) => m.role === 'system')?.content
          : undefined;

        const message = await anthropic.messages.create({
          model: settings.model,
          max_tokens: settings.maxTokens,
          temperature: settings.temperature,
          top_p: settings.topP,
          system: systemMessage,
          messages: anthropicMessages,
        });

        response = message.content[0].type === 'text' ? message.content[0].text : '';
        inputTokens = message.usage?.input_tokens || 0;
        outputTokens = message.usage?.output_tokens || 0;
        tokensUsed = inputTokens + outputTokens;

        // Calculate cost based on model
        const modelCosts: Record<string, { input: number; output: number }> = {
          'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
          'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
          'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
          'claude-2.1': { input: 0.008, output: 0.024 },
        };

        const modelCost = modelCosts[settings.model] || { input: 0, output: 0 };
        cost = (inputTokens / 1000 * modelCost.input) + (outputTokens / 1000 * modelCost.output);
      }

      const latencyMs = Date.now() - startTime;

      // Save test run to database
      const testRun = await prisma.promptTestRun.create({
        data: {
          promptTemplateId: promptId,
          versionId: promptTemplate.versions[0]?.id || promptTemplate.id,
          service,
          model: settings.model,
          variables: variables || {},
          requestContent: content,
          responseContent: response,
          settings: settings || {},
          tokensUsed,
          latencyMs,
          cost,
          status: 'SUCCESS',
          userId,
        },
      });

      return NextResponse.json({
        success: true,
        response,
        executionId: testRun.id,
        versionId: promptTemplate.versions[0]?.id || promptTemplate.id,
        inputTokens,
        outputTokens,
        tokensUsed,
        cost,
        latencyMs,
      });

    } catch (apiError: any) {
      console.error('API Error:', apiError);

      // Save failed test run
      await prisma.promptTestRun.create({
        data: {
          promptTemplateId: promptId,
          versionId: promptTemplate.versions[0]?.id || promptTemplate.id,
          service,
          model: settings.model,
          variables: variables || {},
          requestContent: content,
          responseContent: '',
          settings: settings || {},
          tokensUsed: 0,
          latencyMs: Date.now() - startTime,
          cost: 0,
          status: 'ERROR',
          error: apiError.message,
          userId,
        },
      });

      return NextResponse.json({ 
        error: apiError.message || 'Failed to execute prompt'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error executing prompt:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// Get execution history for a prompt
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('promptId');

    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID required' }, { status: 400 });
    }

    const executions = await prisma.promptTestRun.findMany({
      where: {
        promptTemplateId: promptId,
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    return NextResponse.json({
      executions: executions.map(exec => ({
        id: exec.id,
        promptId: exec.promptTemplateId,
        versionId: exec.versionId,
        provider: exec.service,
        model: exec.model,
        response: exec.responseContent,
        inputTokens: Math.ceil(JSON.stringify(exec.requestContent).length / 4),
        outputTokens: Math.ceil((exec.responseContent || '').length / 4),
        totalTokens: exec.tokensUsed,
        cost: exec.cost,
        latencyMs: exec.latencyMs,
        status: exec.status.toLowerCase(),
        error: exec.error,
        timestamp: exec.createdAt.toISOString(),
        settings: exec.settings,
        variables: exec.variables
      }))
    });

  } catch (error: any) {
    console.error('Error fetching execution history:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}