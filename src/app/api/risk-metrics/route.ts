import { NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import { requireAuthContext, isQzenAdmin } from '@/utils/authz';

import { calculateRiskScores, getRiskLevel, getRiskCategoryScores, type StepsData } from '@/lib/risk-calculations';

export async function GET() {
  try {
    console.log('[Risk Metrics] Starting request...');
    
    const authCtx = requireAuthContext();
    if (!authCtx.dbUserId) {
      return NextResponse.json({ error: 'Missing dbUserId claim. Configure Clerk JWT with dbUserId.' }, { status: 400 });
    }

    // Fetch use cases based on role
    let useCases = [];
    if (isQzenAdmin(authCtx)) {
      useCases = await prismaClient.useCase.findMany({
        include: {
          Approval: true,
          finopsData: true,
          assessData: true,
        },
        orderBy: { updatedAt: 'desc' }
      });
    } else {
      useCases = await prismaClient.useCase.findMany({
        where: { userId: authCtx.dbUserId },
        include: {
          Approval: true,
          finopsData: true,
          assessData: true,
        },
        orderBy: { updatedAt: 'desc' }
      });
    }
    
    // Calculate risk metrics from actual assessment data
    const riskDistribution = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0
    };
    
    const riskCategories = {
      technical: { Low: 0, Medium: 0, High: 0, Critical: 0 },
      business: { Low: 0, Medium: 0, High: 0, Critical: 0 },
      data: { Low: 0, Medium: 0, High: 0, Critical: 0 },
      ethical: { Low: 0, Medium: 0, High: 0, Critical: 0 },
      operational: { Low: 0, Medium: 0, High: 0, Critical: 0 },
      regulatory: { Low: 0, Medium: 0, High: 0, Critical: 0 }
    };
    
    let totalRiskScore = 0;
    let assessedUseCases = 0;
    
    // Calculate risk scores for each use case
    useCases.forEach(uc => {
      let riskScore = 0;
      let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
      let categoryScores = {};
      
      // Calculate risk if assessment data exists
      if (uc.assessData?.stepsData) {
        const stepsData = uc.assessData.stepsData as StepsData;
        const riskResult = calculateRiskScores(stepsData);
        riskScore = riskResult.score;
        riskLevel = getRiskLevel(riskScore);
        categoryScores = getRiskCategoryScores(stepsData);
        
        // Update distributions
        assessedUseCases++;
        totalRiskScore += riskScore;
        riskDistribution[riskLevel]++;
        
        // Update category distributions
        Object.entries(categoryScores).forEach(([category, score]) => {
          const level = getRiskLevel(score as number);
          if (riskCategories[category as keyof typeof riskCategories]) {
            riskCategories[category as keyof typeof riskCategories][level]++;
          }
        });
      }
    });
    
    // Calculate average risk score
    const averageRiskScore = assessedUseCases > 0 ? totalRiskScore / assessedUseCases : 0;
    
    // Calculate compliance score (mock data for now)
    const complianceScore = Math.floor(Math.random() * 40) + 60; // 60-100%
    
    // Generate top risk categories (mock data for now)
    const topRiskCategories = ['Data Privacy', 'Cybersecurity', 'Regulatory Compliance', 'Operational Risk', 'Technical Debt'];
    
    // Calculate recent incidents (mock data for now)
    const recentIncidents = Math.floor(Math.random() * 5);
    
    // Return the expected RiskMetrics structure
    const riskMetrics = {
      totalRisks: assessedUseCases,
      highRiskCount: riskDistribution.High,
      mediumRiskCount: riskDistribution.Medium,
      lowRiskCount: riskDistribution.Low,
      averageRiskScore: averageRiskScore,
      riskDistribution: {
        technical: riskCategories.technical.High + riskCategories.technical.Critical,
        business: riskCategories.business.High + riskCategories.business.Critical,
        data: riskCategories.data.High + riskCategories.data.Critical,
        ethical: riskCategories.ethical.High + riskCategories.ethical.Critical,
      },
      topRiskCategories: topRiskCategories,
      recentIncidents: recentIncidents,
      complianceScore: complianceScore,
    };
    

    return NextResponse.json(riskMetrics);
  } catch (error) {
    console.error('Error fetching risk metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}