import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const useCaseId = searchParams.get('useCaseId');

    if (!useCaseId) {
      return NextResponse.json(
        { error: 'Missing useCaseId parameter' },
        { status: 400 }
      );
    }

    // Get the latest guardrail for this use case
    const guardrail = await prismaClient.guardrail.findFirst({
      where: { useCaseId },
      orderBy: { createdAt: 'desc' },
      include: {
        rules: true
      }
    });

    if (!guardrail) {
      // Return success with empty payload instead of 404 to avoid noisy errors client-side
      return NextResponse.json({
        success: true,
        guardrails: null,
        rules: [],
        id: null,
        status: null,
        confidence: null,
        metadata: null
      });
    }

    // Merge the database rules with the configuration
    const configWithDbIds = { ...guardrail.configuration };
    
    // If we have rules in the database, update the configuration with their IDs and status
    if (guardrail.rules && guardrail.rules.length > 0) {
      // Create a map of rules by their name for quick lookup
      const rulesMap = new Map();
      guardrail.rules.forEach((dbRule: any) => {
        rulesMap.set(dbRule.rule, dbRule);
      });
      
      // Update configuration rules with database IDs and status
      if (configWithDbIds?.guardrails?.rules) {
        Object.keys(configWithDbIds.guardrails.rules).forEach(category => {
          if (Array.isArray(configWithDbIds.guardrails.rules[category])) {
            configWithDbIds.guardrails.rules[category] = configWithDbIds.guardrails.rules[category].map((rule: any) => {
              const dbRule = rulesMap.get(rule.rule);
              if (dbRule) {
                return {
                  ...rule,
                  id: dbRule.id, // Use the actual database ID
                  status: dbRule.status,
                  isCustom: dbRule.isCustom,
                  isEdited: dbRule.isEdited,
                  approvedBy: dbRule.approvedBy,
                  approvedAt: dbRule.approvedAt,
                  rejectedBy: dbRule.rejectedBy,
                  rejectedAt: dbRule.rejectedAt,
                  rejectionReason: dbRule.rejectionReason
                };
              }
              return rule;
            });
          }
        });
      }
    }
    
    // Return the guardrail configuration with the correct structure
    return NextResponse.json({
      success: true,
      guardrails: configWithDbIds, // Frontend expects 'guardrails' not 'guardrail'
      rules: guardrail.rules,
      id: guardrail.id,
      status: guardrail.status,
      confidence: guardrail.confidence,
      metadata: {
        createdAt: guardrail.createdAt,
        updatedAt: guardrail.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching guardrails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guardrails', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}