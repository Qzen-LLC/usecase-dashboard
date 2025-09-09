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
    const { ruleId, approved, reason } = body;

    if (!ruleId || approved === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // If rejecting, reason is required
    if (!approved && !reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Verify the rule exists
    const existingRule = await prismaClient.guardrailRule.findUnique({
      where: { id: ruleId },
      include: {
        guardrail: true
      }
    });

    if (!existingRule) {
      return NextResponse.json(
        { error: 'Guardrail rule not found' },
        { status: 404 }
      );
    }

    // Check if the user who edited cannot approve their own changes
    if (existingRule.editedBy === user.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json(
        { error: 'You cannot approve your own changes' },
        { status: 403 }
      );
    }

    // Update the rule with approval/rejection
    const updatedRule = await prismaClient.guardrailRule.update({
      where: { id: ruleId },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        ...(approved ? {
          approvedBy: user.emailAddresses?.[0]?.emailAddress || user.id,
          approvedAt: new Date()
        } : {
          rejectedBy: user.emailAddresses?.[0]?.emailAddress || user.id,
          rejectedAt: new Date(),
          rejectionReason: reason
        }),
        updatedAt: new Date()
      }
    });

    // Create audit log
    await prismaClient.guardrailAudit.create({
      data: {
        guardrailId: existingRule.guardrailId,
        ruleId: ruleId,
        action: approved ? 'approve' : 'reject',
        userId: user.id,
        userName: user.emailAddresses?.[0]?.emailAddress || user.id,
        changes: approved ? null : { reason }
      }
    });

    // Check if all rules in the guardrail are approved/rejected and update guardrail status
    const allRules = await prismaClient.guardrailRule.findMany({
      where: { guardrailId: existingRule.guardrailId }
    });

    const allApproved = allRules.every(rule => rule.status === 'APPROVED');
    const hasRejected = allRules.some(rule => rule.status === 'REJECTED');
    const hasPending = allRules.some(rule => rule.status === 'PENDING' || rule.status === 'EDITED');

    let guardrailStatus = 'pending_approval';
    if (allApproved) {
      guardrailStatus = 'approved';
    } else if (hasRejected && !hasPending) {
      guardrailStatus = 'rejected';
    }

    await prismaClient.guardrail.update({
      where: { id: existingRule.guardrailId },
      data: {
        status: guardrailStatus,
        ...(guardrailStatus === 'approved' ? {
          approvedBy: user.emailAddresses?.[0]?.emailAddress || user.id,
          approvedAt: new Date()
        } : guardrailStatus === 'rejected' ? {
          rejectedBy: user.emailAddresses?.[0]?.emailAddress || user.id,
          rejectedAt: new Date()
        } : {})
      }
    });

    return NextResponse.json({
      success: true,
      rule: updatedRule,
      guardrailStatus,
      message: `Guardrail rule ${approved ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Error approving/rejecting guardrail rule:', error);
    return NextResponse.json(
      { error: 'Failed to process approval', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Bulk approve/reject endpoint
export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { updates } = body; // Array of { ruleId, status, reason? }

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { ruleId, status, reason } = update;
        
        if (status === 'REJECTED' && !reason) {
          errors.push({ ruleId, error: 'Rejection reason required' });
          continue;
        }

        const rule = await prismaClient.guardrailRule.findUnique({
          where: { id: ruleId }
        });

        if (!rule) {
          errors.push({ ruleId, error: 'Rule not found' });
          continue;
        }

        // Check self-approval
        if (rule.editedBy === user.emailAddresses?.[0]?.emailAddress) {
          errors.push({ ruleId, error: 'Cannot approve own changes' });
          continue;
        }

        const updatedRule = await prismaClient.guardrailRule.update({
          where: { id: ruleId },
          data: {
            status: status,
            ...(status === 'APPROVED' ? {
              approvedBy: user.emailAddresses?.[0]?.emailAddress || user.id,
              approvedAt: new Date()
            } : status === 'REJECTED' ? {
              rejectedBy: user.emailAddresses?.[0]?.emailAddress || user.id,
              rejectedAt: new Date(),
              rejectionReason: reason
            } : {})
          }
        });

        // Create audit log
        await prismaClient.guardrailAudit.create({
          data: {
            guardrailId: rule.guardrailId,
            ruleId: ruleId,
            action: status === 'APPROVED' ? 'approve' : 'reject',
            userId: user.id,
            userName: user.emailAddresses?.[0]?.emailAddress || user.id,
            changes: status === 'REJECTED' ? { reason } : null
          }
        });

        results.push({ ruleId, status: 'success' });
      } catch (err) {
        errors.push({ 
          ruleId: update.ruleId, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      message: `Processed ${results.length} rules successfully, ${errors.length} errors`
    });
  } catch (error) {
    console.error('Error in bulk approval:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk approval', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}