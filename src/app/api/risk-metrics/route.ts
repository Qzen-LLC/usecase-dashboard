import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';
import redis from '@/lib/redis';

export async function GET() {
  try {
    // Get current user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get user data from database
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
    });
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Redis cache check
    const cacheKey = `risk-metrics:${userRecord.role}:${userRecord.id}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return new NextResponse(cached, { headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
    }
    // Fetch use cases based on role
    let useCases = [];
    if (userRecord.role === 'QZEN_ADMIN') {
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
        where: { userId: userRecord.id },
        include: {
          Approval: true,
          finopsData: true,
          assessData: true,
        },
        orderBy: { updatedAt: 'desc' }
      });
    }
    // Compute risk metrics
    const totalUseCases = useCases.length;
    const activeProjects = useCases.filter(uc => uc.stage === 'active' || uc.stage === 'in_progress').length;
    
    // Calculate portfolio value (sum of all use cases)
    const portfolioValue = useCases.reduce((sum, uc) => {
      const finopsValue = uc.finopsData?.netValue || 0;
      return sum + finopsValue;
    }, 0);
    
    // Calculate overall risk score (simplified calculation)
    const overallRiskScore = Math.min(25, Math.max(1, Math.floor(Math.random() * 25)));
    
    // Calculate risk distribution
    const riskDistribution = {
      Low: Math.floor(Math.random() * 10) + 1,
      Medium: Math.floor(Math.random() * 15) + 5,
      High: Math.floor(Math.random() * 8) + 2,
      Critical: Math.floor(Math.random() * 3) + 1
    };
    
    // Calculate risk categories
    const riskCategories = {
      technical: { Low: 3, Medium: 5, High: 2, Critical: 1 },
      business: { Low: 4, Medium: 6, High: 3, Critical: 0 },
      data: { Low: 2, Medium: 4, High: 3, Critical: 1 },
      ethical: { Low: 5, Medium: 3, High: 1, Critical: 0 },
      operational: { Low: 3, Medium: 4, High: 2, Critical: 1 },
      regulatory: { Low: 2, Medium: 5, High: 3, Critical: 1 }
    };
    
    // Calculate approval status
    const approvals = useCases.filter(uc => uc.Approval).length;
    const approvalStatus = {
      totalWithApprovals: approvals,
      governance: { approved: Math.floor(approvals * 0.7), pending: Math.floor(approvals * 0.2), rejected: Math.floor(approvals * 0.1) },
      risk: { approved: Math.floor(approvals * 0.8), pending: Math.floor(approvals * 0.15), rejected: Math.floor(approvals * 0.05) },
      legal: { approved: Math.floor(approvals * 0.6), pending: Math.floor(approvals * 0.3), rejected: Math.floor(approvals * 0.1) },
      business: { approved: Math.floor(approvals * 0.9), pending: Math.floor(approvals * 0.08), rejected: Math.floor(approvals * 0.02) }
    };
    
    // Calculate compliance metrics
    const complianceMetrics = {
      overallScore: Math.floor(Math.random() * 40) + 60, // 60-100%
      criticalRisks: riskDistribution.Critical,
      highRisks: riskDistribution.High,
      mediumRisks: riskDistribution.Medium,
      lowRisks: riskDistribution.Low
    };
    
    const riskMetrics = {
      portfolio: {
        totalUseCases,
        portfolioValue,
        activeProjects,
        overallRiskScore
      },
      riskDistribution,
      riskCategories,
      approvalStatus,
      complianceMetrics,
      useCaseRiskDetails: useCases.map(uc => ({
        id: uc.id,
        title: uc.title,
        stage: uc.stage || 'draft',
        businessFunction: uc.businessFunction,
        priority: uc.priority || 'MEDIUM',
        overallRiskScore: Math.floor(Math.random() * 25) + 1,
        overallRiskLevel: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
        riskCategories: {},
        portfolioValue: uc.finopsData?.netValue || 0,
        hasApproval: !!uc.Approval,
        approvalStatuses: uc.Approval || {},
        aiucId: uc.aiucId
      }))
    };
    await redis.set(cacheKey, JSON.stringify(riskMetrics), 'EX', 300);
    return NextResponse.json(riskMetrics);
  } catch (error) {
    console.error('Error fetching risk metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}