import { withAuth } from '@/lib/auth-gateway';
import { prismaClient } from '@/utils/db';


export const GET = withAuth(async (request: Request, { auth }) => {
  try {
    // auth context is provided by withAuth wrapper

    const { searchParams } = new URL(request.url);
    const useCaseId = searchParams.get('useCaseId');

    if (!useCaseId) {
      return new Response(JSON.stringify({ error: 'Missing useCaseId parameter' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
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
      return new Response(JSON.stringify({
        success: true,
        guardrails: null,
        rules: [],
        id: null,
        status: null,
        confidence: null,
        metadata: null
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Merge the database rules with the configuration
    const baseConfig = ((): any => {
      const cfg = guardrail.configuration as any;
      if (cfg && typeof cfg === 'object' && !Array.isArray(cfg)) return cfg;
      try {
        return JSON.parse(JSON.stringify(cfg ?? {}));
      } catch {
        return {};
      }
    })();
    const configWithDbIds = { ...(baseConfig as Record<string, any>) };
    
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
    return new Response(JSON.stringify({
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
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error fetching guardrails:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch guardrails', details: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}, { requireUser: true });