import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { useCaseId, evaluationConfig, evaluationResult } = body;

    if (!useCaseId || !evaluationConfig) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify use case exists
    const useCase = await prismaClient.useCase.findUnique({
      where: { id: useCaseId }
    });

    if (!useCase) {
      return NextResponse.json(
        { error: 'Use case not found' },
        { status: 404 }
      );
    }

    // Save or update evaluation
    let evaluation;
    if (evaluationConfig.id) {
      // Try update existing; if not found, create new
      try {
        evaluation = await prismaClient.evaluation.update({
          where: { id: evaluationConfig.id },
          data: {
            name: evaluationConfig.name || 'Evaluation ' + new Date().toLocaleDateString(),
            description: evaluationConfig.description,
            configuration: evaluationConfig,
            status: evaluationResult ? 'completed' : 'pending',
            completedAt: evaluationResult ? new Date() : null
          }
        });
      } catch (_e) {
        evaluation = await prismaClient.evaluation.create({
          data: {
            useCaseId,
            name: evaluationConfig.name || 'Evaluation ' + new Date().toLocaleDateString(),
            description: evaluationConfig.description,
            configuration: evaluationConfig,
            status: evaluationResult ? 'completed' : 'pending',
            completedAt: evaluationResult ? new Date() : null
          }
        });
      }
    } else {
      evaluation = await prismaClient.evaluation.create({
        data: {
          useCaseId,
          name: evaluationConfig.name || 'Evaluation ' + new Date().toLocaleDateString(),
          description: evaluationConfig.description,
          configuration: evaluationConfig,
          status: evaluationResult ? 'completed' : 'pending',
          completedAt: evaluationResult ? new Date() : null
        }
      });
    }

    // If evaluation result is provided, save the results
    if (evaluationResult && evaluationResult.results) {
      // Delete existing results for this evaluation
      await prismaClient.evaluationResult.deleteMany({
        where: { evaluationId: evaluation.id }
      });

      // Save new results
      const results = evaluationResult.results.map((result: any) => ({
        evaluationId: evaluation.id,
        category: result.category || 'general',
        testType: result.testType || 'functional',
        input: result.input || {},
        expectedOutput: result.expectedOutput,
        actualOutput: result.actualOutput,
        metrics: result.metrics || {},
        passed: result.passed || false,
        severity: result.severity,
        details: result.details || {}
      }));

      await prismaClient.evaluationResult.createMany({
        data: results
      });

      // Update evaluation summary
      const passedCount = results.filter((r: any) => r.passed).length;
      const totalCount = results.length;
      
      await prismaClient.evaluation.update({
        where: { id: evaluation.id },
        data: {
          summary: {
            totalTests: totalCount,
            passed: passedCount,
            failed: totalCount - passedCount,
            passRate: totalCount > 0 ? passedCount / totalCount : 0,
            timestamp: new Date().toISOString()
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      evaluationId: evaluation.id,
      message: 'Evaluation saved successfully'
    });
  } catch (error) {
    console.error('Error saving evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to save evaluation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}