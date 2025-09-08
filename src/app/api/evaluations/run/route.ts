import { NextRequest, NextResponse } from 'next/server';
import { EvaluationRunner } from '@/lib/evals/evaluation-runner';
import { EvaluationConfig, ExecutionEnvironment } from '@/lib/evals/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { evaluationConfig, environment } = body;

    if (!evaluationConfig) {
      return NextResponse.json(
        { error: 'Missing evaluation configuration' },
        { status: 400 }
      );
    }

    // Set default environment if not provided
    const executionEnvironment: ExecutionEnvironment = environment || {
      name: 'synthetic',
      type: 'synthetic',
      configuration: {
        mockResponses: true,
        deterministicMode: true
      }
    };

    // Initialize the evaluation runner
    const runner = new EvaluationRunner();

    // Run the evaluation
    console.log(`🚀 Running evaluation: ${evaluationConfig.id}`);
    const result = await runner.runEvaluation(
      evaluationConfig as EvaluationConfig,
      executionEnvironment
    );

    // Log execution summary
    console.log(`✅ Evaluation completed: ${result.executionId}`);
    console.log(`   - Status: ${result.status}`);
    console.log(`   - Duration: ${result.duration}ms`);
    console.log(`   - Tests run: ${result.testResults.length}`);
    console.log(`   - Passed: ${result.testResults.filter(r => r.status === 'passed').length}`);
    console.log(`   - Failed: ${result.testResults.filter(r => r.status === 'failed').length}`);
    console.log(`   - Overall score: ${result.scores.overallScore.value.toFixed(1)}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error running evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to run evaluation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}