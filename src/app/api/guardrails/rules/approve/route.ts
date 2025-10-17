import { withAuth } from '@/lib/auth-gateway';
import { prismaClient } from '@/utils/db';


export const POST = withAuth(async (request: Request, { auth }) => {
  try {
    // auth context is provided by withAuth wrapper

    const body = await request.json();
    const { ruleId, approved, reason } = body;

    if (!ruleId || approved === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // If rejecting, reason is required
    if (!approved && !reason) {
      return new Response(JSON.stringify({ error: 'Rejection reason is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Verify the rule exists
    const existingRule = await prismaClient.guardrailRule.findUnique({
      where: { id: ruleId },
      include: {
        guardrail: true
      }
    });

    if (!existingRule) {
      return new Response(JSON.stringify({ error: 'Guardrail rule not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // Load current user email and prevent self-approval
    const currentUser = await prismaClient.user.findUnique({ where: { clerkId: auth.userId! } });
    const currentEmail = currentUser?.email || auth.userId!;
    if (existingRule.editedBy === currentEmail) {
      return new Response(JSON.stringify({ error: 'You cannot approve your own changes' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // Update the rule with approval/rejection
    const updatedRule = await prismaClient.guardrailRule.update({
      where: { id: ruleId },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        ...(approved ? {
          approvedBy: currentEmail,
          approvedAt: new Date()
        } : {
          rejectedBy: currentEmail,
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
        userId: auth.userId!,
        userName: currentEmail,
        changes: approved ? undefined : { reason }
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
          approvedBy: currentEmail,
          approvedAt: new Date()
        } : guardrailStatus === 'rejected' ? {
          rejectedBy: currentEmail,
          rejectedAt: new Date()
        } : {})
      }
    });

    return new Response(JSON.stringify({
      success: true,
      rule: updatedRule,
      guardrailStatus,
      message: `Guardrail rule ${approved ? 'approved' : 'rejected'} successfully`
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error approving/rejecting guardrail rule:', error);
    return new Response(JSON.stringify({ error: 'Failed to process approval', details: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}, { requireUser: true });

// Bulk approve/reject endpoint
export const PUT = withAuth(async (request: Request, { auth }) => {
  try {
    // auth context is provided by withAuth wrapper

    const body = await request.json();
    const { updates } = body; // Array of { ruleId, status, reason? }

    if (!updates || !Array.isArray(updates)) {
      return new Response(JSON.stringify({ error: 'Invalid request format' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
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
        const currentUser = await prismaClient.user.findUnique({ where: { clerkId: auth.userId! } });
        const currentEmail = currentUser?.email || auth.userId!;
        if (rule.editedBy === currentEmail) {
          errors.push({ ruleId, error: 'Cannot approve own changes' });
          continue;
        }

        const updatedRule = await prismaClient.guardrailRule.update({
          where: { id: ruleId },
          data: {
            status: status,
            ...(status === 'APPROVED' ? {
              approvedBy: currentEmail,
              approvedAt: new Date()
            } : status === 'REJECTED' ? {
              rejectedBy: currentEmail,
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
            userId: auth.userId!,
            userName: currentEmail,
            changes: status === 'REJECTED' ? { reason } : undefined
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

    return new Response(JSON.stringify({
      success: true,
      results,
      errors,
      message: `Processed ${results.length} rules successfully, ${errors.length} errors`
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error in bulk approval:', error);
    return new Response(JSON.stringify({ error: 'Failed to process bulk approval', details: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}, { requireUser: true });