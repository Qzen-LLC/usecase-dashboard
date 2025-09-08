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
    const { useCaseId, guardrails } = body;

    if (!useCaseId || !guardrails) {
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

    // Save or update guardrails
    const guardrailRecord = await prismaClient.guardrail.upsert({
      where: {
        id: guardrails.id || 'new-' + Date.now()
      },
      create: {
        useCaseId,
        name: guardrails.name || 'Guardrails Configuration',
        description: guardrails.description || 'Generated guardrails for ' + useCase.title,
        approach: guardrails.approach || 'balanced_practical',
        configuration: guardrails,
        reasoning: guardrails.reasoning || {},
        confidence: guardrails.confidence?.overall || 0.8,
        status: 'draft'
      },
      update: {
        configuration: guardrails,
        reasoning: guardrails.reasoning || {},
        confidence: guardrails.confidence?.overall || 0.8,
        status: guardrails.status || 'draft'
      }
    });

    // Save individual rules if provided
    if (guardrails.guardrails?.rules) {
      // Delete existing rules for this guardrail
      await prismaClient.guardrailRule.deleteMany({
        where: { guardrailId: guardrailRecord.id }
      });

      // Flatten all rules from different categories
      const allRules: any[] = [];
      
      Object.entries(guardrails.guardrails.rules).forEach(([category, rules]: [string, any]) => {
        if (Array.isArray(rules)) {
          rules.forEach((rule: any) => {
            allRules.push({
              guardrailId: guardrailRecord.id,
              type: rule.type || category,
              severity: rule.severity || 'medium',
              rule: rule.rule || rule.name || 'Rule',
              description: rule.description || '',
              rationale: rule.rationale,
              implementation: rule.implementation || {},
              conditions: rule.conditions,
              exceptions: rule.exceptions
            });
          });
        }
      });

      if (allRules.length > 0) {
        await prismaClient.guardrailRule.createMany({
          data: allRules
        });
      }
    }

    return NextResponse.json({
      success: true,
      guardrailId: guardrailRecord.id,
      message: 'Guardrails saved successfully'
    });
  } catch (error) {
    console.error('Error saving guardrails:', error);
    return NextResponse.json(
      { error: 'Failed to save guardrails', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}