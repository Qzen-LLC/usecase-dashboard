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
    const { guardrailId, rule } = body;

    if (!guardrailId || !rule) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate required fields in rule
    if (!rule.rule || !rule.description || !rule.type || !rule.severity) {
      return NextResponse.json(
        { error: 'Rule must have name, description, type, and severity' },
        { status: 400 }
      );
    }

    // Verify the guardrail exists
    const guardrail = await prismaClient.guardrail.findUnique({
      where: { id: guardrailId },
      include: {
        useCase: true
      }
    });

    if (!guardrail) {
      return NextResponse.json(
        { error: 'Guardrail not found' },
        { status: 404 }
      );
    }

    // Check for duplicate rule names
    const existingRule = await prismaClient.guardrailRule.findFirst({
      where: {
        guardrailId: guardrailId,
        rule: rule.rule
      }
    });

    if (existingRule) {
      return NextResponse.json(
        { error: 'A rule with this name already exists in this guardrail' },
        { status: 409 }
      );
    }

    // Create the new rule
    const newRule = await prismaClient.guardrailRule.create({
      data: {
        guardrailId: guardrailId,
        type: rule.type,
        severity: rule.severity,
        rule: rule.rule,
        description: rule.description,
        rationale: rule.rationale || '',
        implementation: rule.implementation || {
          platform: ['all'],
          configuration: {},
          monitoring: []
        },
        conditions: rule.conditions || null,
        exceptions: rule.exceptions || null,
        status: 'PENDING',
        isCustom: true,
        isEdited: false,
        editedBy: user.emailAddresses?.[0]?.emailAddress || user.id,
        editedAt: new Date()
      }
    });

    // Create audit log
    await prismaClient.guardrailAudit.create({
      data: {
        guardrailId: guardrailId,
        ruleId: newRule.id,
        action: 'add_rule',
        userId: user.id,
        userName: user.emailAddresses?.[0]?.emailAddress || user.id,
        changes: {
          added: rule
        }
      }
    });

    // Update guardrail to reflect changes
    await prismaClient.guardrail.update({
      where: { id: guardrailId },
      data: {
        isEdited: true,
        editedBy: user.emailAddresses?.[0]?.emailAddress || user.id,
        editedAt: new Date(),
        status: 'pending_approval',
        version: {
          increment: 1
        }
      }
    });

    // Update the guardrail configuration to include the new rule
    const allRules = await prismaClient.guardrailRule.findMany({
      where: { guardrailId: guardrailId },
      orderBy: { createdAt: 'asc' }
    });

    // Group rules by category
    const categorizedRules: any = {
      critical: [],
      operational: [],
      ethical: [],
      economic: []
    };

    allRules.forEach(r => {
      const category = r.severity === 'critical' ? 'critical' :
                      ['performance', 'rate_limit', 'token_limit'].includes(r.type) ? 'operational' :
                      ['bias_mitigation', 'content_safety', 'human_oversight', 'ethical'].includes(r.type) ? 'ethical' :
                      ['cost_control'].includes(r.type) ? 'economic' :
                      'operational'; // default

      categorizedRules[category].push({
        id: r.id,
        type: r.type,
        severity: r.severity,
        rule: r.rule,
        description: r.description,
        rationale: r.rationale,
        implementation: r.implementation,
        conditions: r.conditions,
        exceptions: r.exceptions,
        status: r.status,
        isCustom: r.isCustom,
        isEdited: r.isEdited
      });
    });

    // Update guardrail configuration
    const updatedConfig = {
      ...guardrail.configuration,
      guardrails: {
        ...((guardrail.configuration as any)?.guardrails || {}),
        rules: categorizedRules
      }
    };

    await prismaClient.guardrail.update({
      where: { id: guardrailId },
      data: {
        configuration: updatedConfig
      }
    });

    return NextResponse.json({
      success: true,
      rule: newRule,
      message: 'Custom guardrail rule added successfully'
    });
  } catch (error) {
    console.error('Error adding guardrail rule:', error);
    return NextResponse.json(
      { error: 'Failed to add guardrail rule', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Delete a rule
export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('ruleId');

    if (!ruleId) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      );
    }

    // Verify the rule exists
    const rule = await prismaClient.guardrailRule.findUnique({
      where: { id: ruleId },
      include: {
        guardrail: true
      }
    });

    if (!rule) {
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      );
    }

    // Check if rule is approved - approved rules cannot be deleted
    if (rule.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'Cannot delete approved guardrails' },
        { status: 403 }
      );
    }

    // Create audit log before deletion
    await prismaClient.guardrailAudit.create({
      data: {
        guardrailId: rule.guardrailId,
        ruleId: ruleId,
        action: 'remove_rule',
        userId: user.id,
        userName: user.emailAddresses?.[0]?.emailAddress || user.id,
        changes: {
          removed: rule
        }
      }
    });

    // Delete the rule
    await prismaClient.guardrailRule.delete({
      where: { id: ruleId }
    });

    // Update guardrail status
    await prismaClient.guardrail.update({
      where: { id: rule.guardrailId },
      data: {
        isEdited: true,
        editedBy: user.emailAddresses?.[0]?.emailAddress || user.id,
        editedAt: new Date(),
        status: 'pending_approval'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Guardrail rule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting guardrail rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete guardrail rule', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}