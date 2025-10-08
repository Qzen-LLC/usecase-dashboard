import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-gateway';

import { EvaluationContextAggregator } from '@/lib/evals/evaluation-context-aggregator';
import { EvaluationGenerationEngine, GenerationStrategy } from '@/lib/evals/evaluation-generation-engine';
import { EvaluationGenerationOrchestrator } from '@/lib/evals/evaluation-generation-orchestrator';
import { prismaClient } from '@/utils/db';

export const POST = withAuth(async (request: Request, { auth }) => {
  try {
    // Check authentication
    // auth context is provided by withAuth wrapper

    const body = await request.json();
    const { 
      useCaseId, 
      guardrailsId,
      generationStrategy = 'comprehensive',
      testIntensity = 'standard',
      focusAreas,
      useOrchestrator = false // Flag to choose between engine and orchestrator
    } = body;

    if (!useCaseId) {
      return NextResponse.json(
        { error: 'Missing use case ID' },
        { status: 400 }
      );
    }

    // Check if LLM is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'LLM_CONFIGURATION_REQUIRED',
        message: 'LLM-powered evaluation generation requires OpenAI API key configuration',
        requiresConfiguration: true
      }, { status: 503 });
    }

    console.log('🚀 Starting LLM-powered evaluation generation...');
    console.log(`   Use Case: ${useCaseId}`);
    console.log(`   Guardrails ID received: ${guardrailsId}`);
    console.log(`   Strategy: ${generationStrategy}, Intensity: ${testIntensity}`);
    console.log(`   Mode: ${useOrchestrator ? 'Multi-Agent Orchestrator' : 'Direct LLM Engine'}`);

    // Step 1: Build comprehensive context
    const contextAggregator = new EvaluationContextAggregator();
    const context = await contextAggregator.buildEvaluationContext(useCaseId, guardrailsId);
    
    console.log(`📊 Context built: ${context.guardrails.totalRules} guardrails, ${context.risks.identified.length} risks`);

    // Step 2: Generate evaluations using selected approach
    let evaluationConfig;
    
    if (useOrchestrator) {
      // Use multi-agent orchestrator for comprehensive generation
      console.log('🤖 Using multi-agent orchestrator...');
      const orchestrator = new EvaluationGenerationOrchestrator();
      const orchestrationResult = await orchestrator.orchestrateTestGeneration(context);
      evaluationConfig = orchestrator.createEvaluationConfig(orchestrationResult, context);
      
      console.log(`✅ Orchestration complete: ${orchestrationResult.totalScenarios} scenarios from ${orchestrationResult.metadata.agents.length} agents`);
    } else {
      // Use direct LLM engine for faster generation
      console.log('🧠 Using direct LLM engine...');
      const engine = new EvaluationGenerationEngine();
      const strategy: GenerationStrategy = {
        type: generationStrategy as any,
        intensity: testIntensity as any,
        focusAreas,
        maxTestsPerSuite: testIntensity === 'light' ? 5 : testIntensity === 'thorough' ? 20 : 10,
        timeLimit: 60 // 60 seconds timeout
      };
      
      evaluationConfig = await engine.generateEvaluations(context, strategy);
      const totalScenarios = Array.isArray(evaluationConfig?.testSuites)
        ? evaluationConfig.testSuites.reduce((sum: number, suite: any) => sum + (suite?.scenarios?.length || 0), 0)
        : 0;
      console.log(`✅ LLM generation complete: ${totalScenarios} scenarios`);
    }

    // Step 3: Save the generated evaluation configuration
    try {
      // Create evaluation record in database
      const evaluation = await prismaClient.evaluation.create({
        data: {
          useCaseId,
          name: `AI-Generated Evaluation ${new Date().toLocaleDateString()}`,
          description: `LLM-powered evaluation with ${evaluationConfig.testSuites.length} test suites`,
          configuration: evaluationConfig as any,
          status: 'pending',
          createdAt: new Date()
        }
      });

      console.log(`💾 Saved evaluation: ${evaluation.id}`);
      
      // Add database ID to config
      evaluationConfig.id = evaluation.id;
    } catch (saveError) {
      console.error('Failed to save evaluation:', saveError);
      // Continue without saving - evaluation can still be used
    }

    // Step 4: Return the evaluation configuration
    const totalScenarios = Array.isArray(evaluationConfig?.testSuites)
      ? evaluationConfig.testSuites.reduce((sum: number, suite: any) => sum + (suite?.scenarios?.length || 0), 0)
      : 0;
    return NextResponse.json({
      success: true,
      evaluationConfig,
      summary: {
        totalSuites: evaluationConfig.testSuites.length,
        totalScenarios: totalScenarios,
        coverage: (evaluationConfig as any).metadata?.coverage || 'Not calculated',
        confidence: evaluationConfig.scoringFramework?.confidence?.overall || 0.85,
        generationMethod: useOrchestrator ? 'multi-agent' : 'direct-llm',
        estimatedDuration: (evaluationConfig as any).metadata?.estimatedDuration ||
                          evaluationConfig.testSuites.length * 5000 // Rough estimate
      },
      message: 'Evaluation configuration generated successfully using AI'
    });

  } catch (error) {
    console.error('Error generating LLM-powered evaluations:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('OPENAI_API_KEY')) {
        return NextResponse.json({
          success: false,
          error: 'LLM_CONFIGURATION_ERROR',
          message: 'OpenAI API key is not configured correctly',
          details: error.message,
          requiresConfiguration: true
        }, { status: 503 });
      }
      
      if (error.message.includes('timeout')) {
        return NextResponse.json({
          success: false,
          error: 'GENERATION_TIMEOUT',
          message: 'Evaluation generation timed out. Try using a lighter intensity setting.',
          details: error.message
        }, { status: 504 });
      }
      
      if (error.message.includes('guardrails')) {
        return NextResponse.json({
          success: false,
          error: 'GUARDRAILS_REQUIRED',
          message: 'Guardrails must be generated first before creating evaluations',
          details: error.message
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'GENERATION_FAILED',
      message: 'Failed to generate evaluation configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}, { requireUser: true });

// GET endpoint to check generation status or retrieve existing evaluation
export const GET = withAuth(async (request: Request, { auth }) => {
  try {
    // auth context is provided by withAuth wrapper

    const searchParams = new URL(request.url).searchParams;
    const useCaseId = searchParams.get('useCaseId');
    const evaluationId = searchParams.get('evaluationId');

    if (!useCaseId && !evaluationId) {
      return NextResponse.json(
        { error: 'Missing useCaseId or evaluationId parameter' },
        { status: 400 }
      );
    }

    let evaluation;
    if (evaluationId) {
      evaluation = await prismaClient.evaluation.findUnique({
        where: { id: evaluationId }
      });
    } else {
      // Get the latest AI-generated evaluation for the use case
      evaluation = await prismaClient.evaluation.findFirst({
        where: { 
          useCaseId: useCaseId as string,
          description: { contains: 'LLM-powered' }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!evaluation) {
      return NextResponse.json({
        success: false,
        message: 'No AI-generated evaluation found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      evaluation: {
        id: evaluation.id,
        status: evaluation.status,
        configuration: evaluation.configuration,
        createdAt: evaluation.createdAt,
        completedAt: evaluation.completedAt
      }
    });

  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch evaluation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}, { requireUser: true });