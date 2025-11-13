import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-gateway';

import { prismaClient } from '@/utils/db';

import { calculateRiskScores, getRiskLevel, getRiskCategoryScores, type StepsData } from '@/lib/risk-calculations';
import { buildStepsDataFromAnswers } from '@/lib/mappers/answers-to-steps';

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
          answers: {
            include: {
              question: true,
              questionTemplate: true,
            }
          },
        },
        orderBy: { updatedAt: 'desc' }
      });
    } else {
      useCases = await prismaClient.useCase.findMany({
        where: { userId: userRecord.id },
        include: {
          Approval: true,
          finopsData: true,
          answers: {
            include: {
              question: true,
              questionTemplate: true,
            }
          },
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
    
    // Calculate risk scores for each use case using Q/A Answer records
    for (const uc of useCases) {
      let riskScore = 0;
      let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
      let categoryScores = {} as Record<string, number>;

      // Build StepsData from Answer rows
      const stepsData = await buildStepsDataFromAnswers(uc.id) as StepsData;
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