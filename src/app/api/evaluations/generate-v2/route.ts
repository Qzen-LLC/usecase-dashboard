import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { EvaluationContextAggregator } from '@/lib/evals/evaluation-context-aggregator';
import { EvaluationGenerationEngine, GenerationStrategy } from '@/lib/evals/evaluation-generation-engine';
import { EvaluationGenerationOrchestrator } from '@/lib/evals/evaluation-generation-orchestrator';
import { prismaClient } from '@/utils/db';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      
      const metaForLog = (evaluationConfig as any)?.metadata || {};
      console.log(`✅ LLM generation complete: ${metaForLog.totalScenarios ?? evaluationConfig.testSuites?.reduce((sum: number, s: any) => sum + (s.scenarios?.length || 0), 0) ?? 0} scenarios`);
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
    const meta = (evaluationConfig as any)?.metadata || {};
    return NextResponse.json({
      success: true,
      evaluationConfig,
      summary: {
        totalSuites: evaluationConfig.testSuites.length,
        totalScenarios: meta.totalScenarios ?? 
                       evaluationConfig.testSuites.reduce((sum: number, suite: any) => sum + (suite.scenarios?.length || 0), 0),
        coverage: meta.coverage ?? 'Not calculated',
        confidence: evaluationConfig.scoringFramework?.confidence?.overall || 0.85,
        generationMethod: useOrchestrator ? 'multi-agent' : 'direct-llm',
        estimatedDuration: meta.estimatedDuration ?? 
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
}

// GET endpoint to check generation status or retrieve existing evaluation
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
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
      const whereClause: any = {
        description: { contains: 'LLM-powered' }
      };
      if (useCaseId) whereClause.useCaseId = useCaseId;
      evaluation = await prismaClient.evaluation.findFirst({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!evaluation) {
      // Return 200 with empty payload to avoid frontend 404s in production
      return NextResponse.json({
        success: true,
        evaluation: null,
        message: 'No AI-generated evaluation found yet'
      });
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
}