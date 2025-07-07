import { useQuery } from '@tanstack/react-query';

export interface ExecutiveMetrics {
  portfolio: {
    totalUseCases: number;
    stageDistribution: Record<string, number>;
    businessFunctionDistribution: Record<string, number>;
    priorityDistribution: Record<string, number>;
    impactScores: {
      operational: { average: number; total: number };
      productivity: { average: number; total: number };
      revenue: { average: number; total: number };
    };
    overallScore: number;
    complexityAnalysis: {
      average: number;
      distribution: Record<string, number>;
    };
    confidenceAnalysis: {
      average: number;
      distribution: Record<string, number>;
    };
  };
  financial: {
    totalInvestment: number;
    totalROI: number;
    averageROI: number;
    projectedValue: number;
    netValue: number;
    costBreakdown: {
      development: number;
      infrastructure: number;
      operations: number;
      api: number;
    };
    investmentByFunction: Record<string, number>;
  };
  risk: {
    totalAssessed: number;
    riskDistribution: Record<string, number>;
    riskCategories: Record<string, Record<string, number>>;
    approvalStatus: {
      totalWithApprovals: number;
      governance: Record<string, number>;
      risk: Record<string, number>;
      legal: Record<string, number>;
      business: Record<string, number>;
    };
  };
  strategic: {
    businessFunctionPerformance: Array<{
      function: string;
      count: number;
      avgOperationalScore: number;
      avgProductivityScore: number;
      avgRevenueScore: number;
      totalInvestment: number;
      averageROI: number;
    }>;
    portfolioBalance: {
      highImpactLowComplexity: number;
      quickWins: number;
    };
  };
}

const fetchExecutiveMetrics = async (): Promise<ExecutiveMetrics> => {
  const response = await fetch('/api/executive-metrics');
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.details || 'Failed to fetch executive metrics');
  }
  return response.json();
};

export const useExecutiveMetrics = () => {
  return useQuery({
    queryKey: ['executive-metrics'],
    queryFn: fetchExecutiveMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes - metrics don't change as frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}; 