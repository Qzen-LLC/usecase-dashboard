import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return simplified mock data for now to test the page
    const riskMetrics = {
      portfolio: {
        totalUseCases: 5,
        portfolioValue: 250000,
        activeProjects: 3,
        overallRiskScore: 6.4
      },
      riskDistribution: { Low: 1, Medium: 2, High: 1, Critical: 1 },
      riskCategories: {
        technical: { Low: 1, Medium: 1, High: 0, Critical: 0 },
        business: { Low: 0, Medium: 1, High: 1, Critical: 0 },
        data: { Low: 0, Medium: 0, High: 0, Critical: 1 },
        ethical: { Low: 0, Medium: 0, High: 0, Critical: 0 },
        operational: { Low: 0, Medium: 0, High: 0, Critical: 0 },
        regulatory: { Low: 0, Medium: 0, High: 0, Critical: 0 }
      },
      approvalStatus: {
        totalWithApprovals: 3,
        governance: { approved: 2, pending: 1, rejected: 0 },
        risk: { approved: 1, pending: 1, rejected: 1 },
        legal: { approved: 1, pending: 2, rejected: 0 },
        business: { approved: 2, pending: 0, rejected: 1 }
      },
      complianceMetrics: {
        overallScore: 65,
        criticalRisks: 1,
        highRisks: 1,
        mediumRisks: 2,
        lowRisks: 1
      },
      useCaseRiskDetails: [
        {
          id: '1',
          title: 'Credit Card Fraud Detection',
          stage: 'pilot',
          businessFunction: 'finance',
          priority: 'high',
          overallRiskScore: 12.5,
          overallRiskLevel: 'High',
          riskCategories: {},
          portfolioValue: 100000,
          hasApproval: true,
          approvalStatuses: {
            governance: 'approved',
            risk: 'pending',
            legal: 'approved',
            business: 'approved'
          }
        },
        {
          id: '2',
          title: 'Customer Churn Prediction',
          stage: 'backlog',
          businessFunction: 'marketing',
          priority: 'medium',
          overallRiskScore: 7.2,
          overallRiskLevel: 'Medium',
          riskCategories: {},
          portfolioValue: 75000,
          hasApproval: true,
          approvalStatuses: {
            governance: 'approved',
            risk: 'approved',
            legal: 'pending',
            business: 'approved'
          }
        }
      ]
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