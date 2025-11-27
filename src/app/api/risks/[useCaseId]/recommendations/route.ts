import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-gateway';
import { prismaClient } from '@/utils/db';
import { recommendRisksFromExternalSources, getExternalRisk } from '@/lib/integrations/risk-recommender';
import type { ExternalRisk, OwaspRisk, MitreTechniqueData } from '@/lib/integrations/types';
import { buildStepsDataFromAnswers } from '@/lib/mappers/answers-to-steps';

/**
 * GET /api/risks/[useCaseId]/recommendations
 * Get AI-powered risk recommendations based on use case assessment
 * Query params:
 *   - source=risks (default): IBM, MIT, OWASP for Step 12 (AI Risk Intelligence)
 *   - source=security: MITRE ATLAS for Step 11 (Security Assessment)
 *   - source=incidents: AIID for Step 15 (Incident Learning)
 */
export const GET = withAuth(
  async (request: Request, { params, auth }: { params: Promise<{ useCaseId: string }>; auth: any }) => {
    try {
      const { useCaseId } = await params;

      // Determine which source to use
      const url = new URL(request.url);
      const source = url.searchParams.get('source') || 'risks'; // Default to risks (IBM, MIT, OWASP)

      // Validate source parameter
      if (!['risks', 'security', 'incidents'].includes(source)) {
        return NextResponse.json(
          { error: 'Invalid source parameter. Must be: risks, security, or incidents' },
          { status: 400 }
        );
      }

      // Fetch use case to verify it exists
      const useCase = await prismaClient.useCase.findUnique({
        where: { id: useCaseId },
      });

      if (!useCase) {
        return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
      }

      // Build stepsData from Answer records (same approach as /api/get-usecase-details)
      const stepsData = await buildStepsDataFromAnswers(useCaseId);

      // Validate that we have assessment data
      if (!stepsData || Object.keys(stepsData).length === 0) {
        return NextResponse.json(
          {
            error: 'No assessment data found. Please complete the assessment first.',
          },
          { status: 400 }
        );
      }

      console.log('[Recommendations API] Generating recommendations for use case:', useCaseId, {
        source,
      });

      // Get recommendations from external sources using the constructed stepsData
      const recommendations = await recommendRisksFromExternalSources(
        {
          useCaseId,
          assessmentData: stepsData,
        },
        source
      );

      console.log('[Recommendations API] Generated:', {
        ibmCount: recommendations.ibm.length,
        mitCount: recommendations.mit.length,
        owaspCount: recommendations.owasp.length,
        mitreCount: recommendations.mitre.length,
        aiidCount: recommendations.aiid.length,
        total: recommendations.totalRecommendations,
      });

      return NextResponse.json(recommendations);
    } catch (error) {
      console.error('[Recommendations API] Error:', error);
      return NextResponse.json(
        { error: 'Failed to generate risk recommendations' },
        { status: 500 }
      );
    }
  },
  { requireUser: true }
);

/**
 * POST /api/risks/[useCaseId]/recommendations
 * Import selected risks from external sources to the use case
 */
export const POST = withAuth(
  async (request: Request, { params, auth }: { params: Promise<{ useCaseId: string }>; auth: any }) => {
    try {
      const { useCaseId } = await params;
      const { selectedRisks } = await request.json();

      if (!selectedRisks || !Array.isArray(selectedRisks) || selectedRisks.length === 0) {
        return NextResponse.json({ error: 'No risks selected for import' }, { status: 400 });
      }

      // Get user record
      const userRecord = await prismaClient.user.findUnique({
        where: { clerkId: auth.userId! },
      });

      if (!userRecord) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Verify use case exists
      const useCase = await prismaClient.useCase.findUnique({
        where: { id: useCaseId },
      });

      if (!useCase) {
        return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
      }

      console.log('[Recommendations API] Importing risks:', {
        useCaseId,
        count: selectedRisks.length,
        sources: selectedRisks.map((r: any) => r.source),
      });

      // Import each selected risk
      const createdRisks = [];

      for (const riskData of selectedRisks) {
        const { source, sourceId } = riskData;

        // Get full risk details from the appropriate service
        const riskDetails = getExternalRisk(source, sourceId);

        if (!riskDetails) {
          console.warn(`[Recommendations API] Risk not found: ${source}:${sourceId}`);
          continue;
        }

        // Map external risk to internal risk model
        let mappedRisk;

        if (source === 'owasp') {
          const owaspRisk = riskDetails as OwaspRisk;
          mappedRisk = {
            useCaseId,
            title: `${owaspRisk.id}: ${owaspRisk.title}`,
            description: owaspRisk.description,
            category: mapOwaspToCategory(owaspRisk.id),
            riskLevel: owaspRisk.severity === 'Critical' ? 'Critical' : owaspRisk.severity,
            riskScore: owaspRisk.severity === 'Critical' ? 9 : owaspRisk.severity === 'High' ? 7 : 5,
            likelihood: 'Possible',
            impact: 'High impact for LLM applications',
            mitigationPlan: owaspRisk.mitigation.join('\n\n'),
            sourceType: source,
            sourceId: owaspRisk.id,
            sourceMetadata: {
              rank: owaspRisk.rank,
              examples: owaspRisk.examples,
              realWorldIncidents: owaspRisk.realWorldIncidents,
            },
            createdBy: userRecord.id,
            createdByName: `${userRecord.firstName || ''} ${userRecord.lastName || ''}`.trim() || 'Unknown',
            createdByEmail: userRecord.email,
          };
        } else if (source === 'mitre') {
          // MITRE ATLAS technique
          const mitreTechnique = riskDetails as MitreTechniqueData;
          mappedRisk = {
            useCaseId,
            title: `${mitreTechnique.techniqueId}: ${mitreTechnique.technique}`,
            description: mitreTechnique.description,
            category: 'technical', // All MITRE techniques are security/technical
            riskLevel: mitreTechnique.severity || 'Medium',
            riskScore: mitreTechnique.severity === 'Critical' ? 9 : mitreTechnique.severity === 'High' ? 7 : mitreTechnique.severity === 'Medium' ? 5 : 3,
            likelihood: 'Possible',
            impact: `Adversarial technique targeting AI systems - Tactic: ${mitreTechnique.tactic}`,
            mitigationPlan: mitreTechnique.mitigation || 'Refer to MITRE ATLAS guidance for mitigation strategies',
            sourceType: source,
            sourceId: mitreTechnique.techniqueId,
            sourceMetadata: {
              tactic: mitreTechnique.tactic,
              tacticId: mitreTechnique.tacticId,
              detection: mitreTechnique.detection,
              caseStudies: mitreTechnique.caseStudies,
              platforms: mitreTechnique.metadata?.platforms,
            },
            createdBy: userRecord.id,
            createdByName: `${userRecord.firstName || ''} ${userRecord.lastName || ''}`.trim() || 'Unknown',
            createdByEmail: userRecord.email,
          };
        } else {
          // IBM or MIT risk
          const externalRisk = riskDetails as ExternalRisk;
          mappedRisk = {
            useCaseId,
            title: externalRisk.Summary,
            description: externalRisk.Description,
            category: mapCategoryToInternal(externalRisk.RiskCategory),
            riskLevel: mapSeverity(externalRisk.RiskSeverity),
            riskScore: calculateRiskScore(externalRisk.RiskSeverity, externalRisk.Likelihood),
            likelihood: mapLikelihood(externalRisk.Likelihood),
            impact: `Risk severity: ${externalRisk.RiskSeverity}`,
            mitigationPlan: 'To be assessed based on use case specifics',
            sourceType: source,
            sourceId: String(externalRisk.Id),
            sourceMetadata: {
              originalCategory: externalRisk.RiskCategory,
              source: externalRisk.source,
            },
            createdBy: userRecord.id,
            createdByName: `${userRecord.firstName || ''} ${userRecord.lastName || ''}`.trim() || 'Unknown',
            createdByEmail: userRecord.email,
          };
        }

        // Create the risk in database
        const risk = await prismaClient.risk.create({
          data: mappedRisk,
        });

        createdRisks.push(risk);
      }

      console.log('[Recommendations API] Successfully imported:', {
        imported: createdRisks.length,
        requested: selectedRisks.length,
        riskIds: createdRisks.map((r) => r.id),
      });

      return NextResponse.json({
        imported: createdRisks.length,
        risks: createdRisks,
        message: `Successfully imported ${createdRisks.length} risk(s) from external sources`,
      });
    } catch (error) {
      console.error('[Recommendations API] Import error:', error);
      return NextResponse.json({ error: 'Failed to import risks' }, { status: 500 });
    }
  },
  { requireUser: true }
);

// Helper functions

function mapOwaspToCategory(owaspId: string): string {
  const mapping: Record<string, string> = {
    LLM01: 'technical', // Prompt Injection
    LLM02: 'data', // Sensitive Info Disclosure
    LLM03: 'technical', // Supply Chain
    LLM04: 'technical', // Data Poisoning
    LLM05: 'technical', // Improper Output Handling
    LLM06: 'operational', // Excessive Agency
    LLM07: 'technical', // System Prompt Leakage
    LLM08: 'technical', // Vector Weaknesses
    LLM09: 'ethical', // Misinformation
    LLM10: 'operational', // Unbounded Consumption
  };
  return mapping[owaspId] || 'technical';
}

function mapCategoryToInternal(externalCategory: string): string {
  const categoryLower = externalCategory.toLowerCase();

  if (categoryLower.includes('data') || categoryLower.includes('privacy')) return 'data';
  if (categoryLower.includes('technical') || categoryLower.includes('security')) return 'technical';
  if (categoryLower.includes('regulatory') || categoryLower.includes('compliance')) return 'regulatory';
  if (categoryLower.includes('ethical') || categoryLower.includes('bias') || categoryLower.includes('fairness'))
    return 'ethical';
  if (categoryLower.includes('operational')) return 'operational';
  if (categoryLower.includes('business') || categoryLower.includes('reputational')) return 'business';

  return 'technical'; // default
}

function mapSeverity(severity: string): string {
  const severityLower = severity.toLowerCase();

  if (severityLower === 'catastrophic' || severityLower === 'major') return 'Critical';
  if (severityLower === 'moderate') return 'High';
  if (severityLower === 'minor') return 'Medium';
  if (severityLower === 'negligible') return 'Low';

  return 'Medium'; // default
}

function mapLikelihood(likelihood: string): string {
  const likelihoodLower = likelihood.toLowerCase();

  if (likelihoodLower.includes('almost certain') || likelihoodLower === 'likely') return 'High';
  if (likelihoodLower === 'possible') return 'Medium';
  if (likelihoodLower === 'unlikely' || likelihoodLower === 'rare') return 'Low';

  return 'Medium'; // default
}

function calculateRiskScore(severity: string, likelihood: string): number {
  const severityScores: Record<string, number> = {
    Catastrophic: 5,
    Major: 4,
    Moderate: 3,
    Minor: 2,
    Negligible: 1,
  };

  const likelihoodScores: Record<string, number> = {
    'Almost certain': 5,
    Likely: 4,
    Possible: 3,
    Unlikely: 2,
    Rare: 1,
  };

  const severityScore = severityScores[severity] || 3;
  const likelihoodScore = likelihoodScores[likelihood] || 3;

  // Calculate average and scale to 0-10
  return Math.min(10, Math.round(((severityScore + likelihoodScore) / 2) * 2));
}
