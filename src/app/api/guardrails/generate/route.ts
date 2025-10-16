import { NextRequest, NextResponse } from 'next/server';
import { GuardrailsOrchestrator } from '@/lib/agents/guardrails-orchestrator';
import { ComprehensiveAssessment } from '@/lib/agents/types';
import { prismaClient } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';
import { ContextAggregator } from '@/lib/guardrails/context-aggregator';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { useCaseId, assessmentData, useCase: frontendUseCase } = body;

    if (!useCaseId) {
      return NextResponse.json(
        { error: 'Missing use case ID' },
        { status: 400 }
      );
    }

    // Check if LLM is configured FIRST - no point continuing without it
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'LLM_CONFIGURATION_REQUIRED',
        message: 'Guardrail generation requires LLM configuration. Please set up your OpenAI API key.',
        instructions: 'Add OPENAI_API_KEY to your environment variables (.env file)',
        requiresConfiguration: true
      }, { status: 503 });
    }

    // Build complete context using the aggregator
    console.log('📊 Building comprehensive context for guardrail generation...');
    const aggregator = new ContextAggregator();
    const completeContext = await aggregator.buildCompleteContext(
      useCaseId,
      assessmentData,
      user.emailAddresses?.[0]?.emailAddress || 'user'
    );

    // Transform to ComprehensiveAssessment format for the engine
    // Now includes COMPLETE use case data
    const comprehensiveAssessment: ComprehensiveAssessment = {
      useCaseId,
      useCaseTitle: completeContext.useCase.title,
      department: completeContext.useCase.businessFunction || 'Unknown',
      owner: user.emailAddresses?.[0]?.emailAddress || 'Unknown',
      
      // Core use case data - NOW INCLUDED!
      problemStatement: completeContext.useCase.problemStatement,
      proposedSolution: completeContext.useCase.proposedAISolution,
      currentState: completeContext.useCase.currentState,
      desiredState: completeContext.useCase.desiredState,
      successCriteria: completeContext.useCase.successCriteria,
      keyAssumptions: completeContext.useCase.keyAssumptions,
      keyBenefits: completeContext.useCase.keyBenefits || '',
      requiredResources: completeContext.useCase.requiredResources,
      
      // Stakeholders
      primaryStakeholders: completeContext.useCase.primaryStakeholders,
      secondaryStakeholders: completeContext.useCase.secondaryStakeholders,
      
      // Impact scores
      confidenceLevel: completeContext.useCase.confidenceLevel,
      operationalImpact: completeContext.useCase.operationalImpactScore,
      productivityImpact: completeContext.useCase.productivityImpactScore,
      revenueImpact: completeContext.useCase.revenueImpactScore,
      implementationComplexity: completeContext.useCase.implementationComplexity,
      
      // Timeline and costs
      timeline: completeContext.useCase.estimatedTimeline,
      initialCost: completeContext.useCase.initialCost || '',
      initialROI: completeContext.useCase.initialROI,
      
      // All assessments
      technicalFeasibility: completeContext.assessments.technical || {},
      businessFeasibility: completeContext.assessments.business || {},
      ethicalImpact: completeContext.assessments.ethical || {},
      riskAssessment: completeContext.assessments.risk || {},
      dataReadiness: completeContext.assessments.data || {},
      roadmapPosition: completeContext.assessments.roadmap || {},
      budgetPlanning: completeContext.assessments.budget || {},
      
      // Organization policies from actual data
      organizationPolicies: completeContext.organization?.policies || {
        aiEthics: ['Transparency', 'Accountability', 'Fairness', 'Privacy'],
        dataGovernance: ['Data minimization', 'Purpose limitation', 'Accuracy'],
        riskAppetite: 'moderate',
        prohibitedUses: [
          'No automated decisions without human oversight',
          'No biometric identification without consent',
          'No discriminatory profiling'
        ],
        requiredSafeguards: [
          'Bias detection and mitigation',
          'Incident response procedures',
          'Performance monitoring',
          'Human oversight mechanisms'
        ]
      },
      
      // Add governance context
      approvalStatus: completeContext.governance.finalQualification,
      approvalConditions: [
        completeContext.governance.approvals?.governance?.comment,
        completeContext.governance.approvals?.risk?.comment,
        completeContext.governance.approvals?.legal?.comment,
        completeContext.governance.approvals?.business?.comment
      ].filter(Boolean),
      
      // Add risk context
      identifiedRisks: completeContext.risks.identified,
      residualRiskLevel: completeContext.risks.residualRiskLevel,
      
      // Add financial context
      financialConstraints: completeContext.financial ? {
        budget: completeContext.financial.budgetRange,
        roi: completeContext.financial.roi,
        totalInvestment: completeContext.financial.totalInvestment
      } : undefined,
      
      // Add compliance context
      complianceRequirements: {
        euAiAct: completeContext.compliance.euAiAct,
        iso42001: completeContext.compliance.iso42001,
        uaeAi: completeContext.compliance.uaeAi,
        hipaa: completeContext.compliance.hipaa,
        gdpr: completeContext.compliance.gdpr
      }
    };

    // Initialize the multi-agent orchestrator
    const orchestrator = new GuardrailsOrchestrator();

    // Generate guardrails using the 10-agent system with COMPLETE context
    console.log(`🚀 Generating comprehensive guardrails for use case: ${useCaseId}`);
    console.log(`📊 Context includes: ${completeContext.risks.identified.length} risks, ` +
                `${Object.keys(completeContext.compliance).filter(k => completeContext.compliance[k]).length} compliance frameworks, ` +
                `${completeContext.useCase.primaryStakeholders.length + completeContext.useCase.secondaryStakeholders.length} stakeholders`);

    const guardrails = await orchestrator.generateGuardrails(comprehensiveAssessment);

    // Log successful generation
    console.log(`✅ Guardrails generated successfully for use case: ${useCaseId}`);
    console.log(`   - Total rules: ${Object.values(guardrails.guardrails.rules).flat().length}`);
    console.log(`   - Confidence: ${Math.round(guardrails.confidence.overall * 100)}%`);

    // Save guardrails to database
    try {
      // Create or update the guardrail record
      const guardrailRecord = await prismaClient.guardrail.upsert({
        where: {
          id: guardrails.id || `${useCaseId}-${Date.now()}`
        },
        create: {
          useCaseId,
          name: 'AI Guardrails Configuration',
          description: `Generated guardrails for ${completeContext.useCase.title}`,
          approach: 'multi-agent',
          configuration: guardrails,
          reasoning: guardrails.reasoning || {},
          confidence: guardrails.confidence?.overall || 0.8,
          status: 'draft'
        },
        update: {
          configuration: guardrails,
          reasoning: guardrails.reasoning || {},
          confidence: guardrails.confidence?.overall || 0.8,
          status: 'draft',
          updatedAt: new Date()
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

        console.log(`💾 Saved ${allRules.length} guardrail rules to database`);
      }

      // Return guardrails with database ID
      return NextResponse.json({
        ...guardrails,
        id: guardrailRecord.id,
        saved: true,
        message: 'Guardrails generated and saved successfully'
      });

    } catch (saveError) {
      console.error('Error saving guardrails to database:', saveError);
      // Still return the generated guardrails even if save fails
      return NextResponse.json({
        ...guardrails,
        saved: false,
        saveError: 'Failed to save to database but guardrails were generated successfully'
      });
    }
  } catch (error) {
    console.error('Error generating guardrails:', error);
    return NextResponse.json(
      { error: 'Failed to generate guardrails', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}