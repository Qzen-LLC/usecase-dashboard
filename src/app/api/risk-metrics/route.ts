import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-gateway';

import { prismaClient } from '@/utils/db';

import { getRiskLevel } from '@/lib/risk-calculations';

export const GET = withAuth(async (request, { auth }) => {
  try {
    console.log('[Risk Metrics] Starting request...');
    
    // auth context is provided by withAuth wrapper
    console.log('[Risk Metrics] Auth user:', { id: auth.userId! });
    
    // Get user data from database
    console.log('[Risk Metrics] Looking up user in database...');
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: auth.userId! },
    });
    
    console.log('[Risk Metrics] Database user record:', userRecord ? { id: userRecord.id, email: userRecord.email, role: userRecord.role } : 'null');
    
    if (!userRecord) {
      console.log('[Risk Metrics] User not found in database - returning 404');
      return NextResponse.json({ 
        error: 'User not found in database',
        clerkId: auth.userId!,
        message: 'User exists in Clerk but not in database'
      }, { status: 404 });
    }

    // Fetch use cases based on role
    let useCases = [];
    if (userRecord.role === 'QZEN_ADMIN') {
      useCases = await prismaClient.useCase.findMany({
        include: {
          Approval: true,
          finopsData: true,
          answers: true,
        },
        orderBy: { updatedAt: 'desc' }
      });
    } else {
      useCases = await prismaClient.useCase.findMany({
        where: { userId: userRecord.id },
        include: {
          Approval: true,
          finopsData: true,
          answers: true,
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
    
    // Helper from probability/impact labels to numeric
    const levelToScore = (level: string) => {
      const val = String(level || '').toLowerCase();
      if (val.includes('high')) return 8;
      if (val.includes('medium')) return 5;
      if (val.includes('low')) return 2;
      return 0;
    };

    // Calculate risk scores per use case from template/question answers (RISK type encodes labels with pro:/imp:)
    useCases.forEach((uc: any) => {
      const answers = Array.isArray(uc.answers) ? uc.answers : [];
      let probLabel: string | null = null;
      let impLabel: string | null = null;

      for (const ans of answers) {
        const val = ans?.value as any;
        if (!val) continue;
        if (val.labels && Array.isArray(val.labels)) {
          const p = val.labels.find((l: string) => typeof l === 'string' && l.startsWith('pro:'));
          const i = val.labels.find((l: string) => typeof l === 'string' && l.startsWith('imp:'));
          if (p) probLabel = p.replace(/^pro:/, '');
          if (i) impLabel = i.replace(/^imp:/, '');
        }
      }

      if (probLabel || impLabel) {
        const pScore = levelToScore(probLabel || '');
        const iScore = levelToScore(impLabel || '');
        const riskScore = Math.round(((pScore + iScore) || 0) / (probLabel && impLabel ? 2 : 1));
        const riskLevel = getRiskLevel(riskScore);

        assessedUseCases++;
        totalRiskScore += riskScore;
        riskDistribution[riskLevel]++;

        // Approximate category distributions: map probability/impact into operational bucket
        const level = getRiskLevel(riskScore);
        riskCategories.operational[level]++;
      }
    });
    
    // Calculate average risk score
    const averageRiskScore = assessedUseCases > 0 ? totalRiskScore / assessedUseCases : 0;
    
    // Calculate compliance score (mock data for now)
    const complianceScore = Math.floor(Math.random() * 40) + 60; // 60-100%
    
    // Generate top risk categories (mock data for now)
    const topRiskCategories = ['Operational Risk'];
    
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
}, { requireUser: true });