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
    const { ruleId, updates } = body;

    if (!ruleId || !updates) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify the rule exists
    const existingRule = await prismaClient.guardrailRule.findUnique({
      where: { id: ruleId },
      include: {
        guardrail: {
          include: {
            useCase: true
          }
        }
      }
    });

    if (!existingRule) {
      return NextResponse.json(
        { error: 'Guardrail rule not found' },
        { status: 404 }
      );
    }

    // Check if rule is approved - approved rules cannot be edited
    if (existingRule.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'Cannot edit approved guardrails. Please create a new version.' },
        { status: 403 }
      );
    }

    // Store original value if this is the first edit
    const originalValue = existingRule.isEdited ? existingRule.originalValue : {
      rule: existingRule.rule,
      description: existingRule.description,
      severity: existingRule.severity,
      rationale: existingRule.rationale,
      implementation: existingRule.implementation,
      conditions: existingRule.conditions,
      exceptions: existingRule.exceptions
    };

    // Update the rule
    const updatedRule = await prismaClient.guardrailRule.update({
      where: { id: ruleId },
      data: {
        ...updates,
        status: 'EDITED',
        isEdited: true,
        originalValue: originalValue,
        editedBy: user.emailAddresses?.[0]?.emailAddress || user.id,
        editedAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create audit log
    await prismaClient.guardrailAudit.create({
      data: {
        guardrailId: existingRule.guardrailId,
        ruleId: ruleId,
        action: 'edit',
        userId: user.id,
        userName: user.emailAddresses?.[0]?.emailAddress || user.id,
        changes: {
          before: existingRule,
          after: updates
        }
      }
    });

    // Update guardrail status to indicate it has been edited
    await prismaClient.guardrail.update({
      where: { id: existingRule.guardrailId },
      data: {
        isEdited: true,
        editedBy: user.emailAddresses?.[0]?.emailAddress || user.id,
        editedAt: new Date(),
        status: 'pending_approval'
      }
    });

    return NextResponse.json({
      success: true,
      rule: updatedRule,
      message: 'Guardrail rule updated successfully'
    });
  } catch (error) {
    console.error('Error updating guardrail rule:', error);
    return NextResponse.json(
      { error: 'Failed to update guardrail rule', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}