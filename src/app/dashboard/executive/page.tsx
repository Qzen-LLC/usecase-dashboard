'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  DollarSign, 
  Shield, 
  Target, 
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  Users,
  Zap,
  Brain,
  Settings,
  Loader2
} from 'lucide-react';

interface ExecutiveMetrics {
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

const ExecutiveDashboard = () => {
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setError(null);
      const response = await fetch('/api/executive-metrics');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch metrics');
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching executive metrics:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#5b5be6] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading executive metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchMetrics}
            className="px-4 py-2 bg-[#5b5be6] text-white rounded-lg hover:bg-[#4a4ac7] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">No metrics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Empty State for No Use Cases */}
        {metrics.portfolio.totalUseCases === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Use Cases Yet</h3>
            <p className="text-gray-600 mb-6">Create your first AI use case to see executive metrics</p>
            <a 
              href="/new-usecase"
              className="inline-flex items-center px-4 py-2 bg-[#5b5be6] text-white rounded-lg hover:bg-[#4a4ac7] transition-colors"
            >
              Create Use Case
            </a>
          </div>
        )}

        {/* All Dashboard Content in Single Page */}
        {metrics.portfolio.totalUseCases > 0 && (
          <div className="space-y-12">
            {/* SECTION 1: PORTFOLIO HEALTH */}
            <section>
              <div className="flex items-center mb-6">
                <Activity className="w-8 h-8 text-[#5b5be6] mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Portfolio Health</h2>
              </div>
              
              {/* Portfolio Overview KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#5b5be6] bg-opacity-10">
                      <Target className="w-6 h-6 text-[#5b5be6]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Use Cases</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.portfolio.totalUseCases}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#10b981] bg-opacity-10">
                      <TrendingUp className="w-6 h-6 text-[#10b981]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Portfolio Score</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.portfolio.overallScore.toFixed(1)}/10</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#f59e0b] bg-opacity-10">
                      <Settings className="w-6 h-6 text-[#f59e0b]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Complexity</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.portfolio.complexityAnalysis.average.toFixed(1)}/10</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#8b5cf6] bg-opacity-10">
                      <CheckCircle className="w-6 h-6 text-[#8b5cf6]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.portfolio.confidenceAnalysis.average.toFixed(0)}%</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Stage Distribution */}
                {Object.keys(metrics.portfolio.stageDistribution).length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Distribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(metrics.portfolio.stageDistribution).map(([stage, count]) => (
                        <div key={stage} className="text-center p-4 bg-gradient-to-br from-[#b3d8fa] to-[#d1b3fa] rounded-lg">
                          <div className="text-2xl font-bold text-[#5b5be6]">{count}</div>
                          <div className="text-sm text-gray-700 mt-1 capitalize">{stage.replace('-', ' ')}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Impact Scores */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Scores Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="p-3 rounded-full bg-[#5b5be6] bg-opacity-10 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-[#5b5be6]" />
                      </div>
                      <p className="text-xs font-medium text-gray-600">Operational</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.portfolio.impactScores.operational.average.toFixed(1)}</p>
                    </div>
                    <div className="text-center">
                      <div className="p-3 rounded-full bg-[#10b981] bg-opacity-10 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <Zap className="w-8 h-8 text-[#10b981]" />
                      </div>
                      <p className="text-xs font-medium text-gray-600">Productivity</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.portfolio.impactScores.productivity.average.toFixed(1)}</p>
                    </div>
                    <div className="text-center">
                      <div className="p-3 rounded-full bg-[#f59e0b] bg-opacity-10 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <DollarSign className="w-8 h-8 text-[#f59e0b]" />
                      </div>
                      <p className="text-xs font-medium text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.portfolio.impactScores.revenue.average.toFixed(1)}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* SECTION 2: FINANCIAL PERFORMANCE */}
            <section>
              <div className="flex items-center mb-6">
                <DollarSign className="w-8 h-8 text-[#10b981] mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Financial Performance</h2>
              </div>
              
              {/* Financial KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#10b981] bg-opacity-10">
                      <DollarSign className="w-6 h-6 text-[#10b981]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Investment</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.financial.totalInvestment)}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#5b5be6] bg-opacity-10">
                      <TrendingUp className="w-6 h-6 text-[#5b5be6]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Average ROI</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.financial.averageROI.toFixed(1)}%</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#8b5cf6] bg-opacity-10">
                      <BarChart3 className="w-6 h-6 text-[#8b5cf6]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Projected Value</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.financial.projectedValue)}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#f59e0b] bg-opacity-10">
                      <Target className="w-6 h-6 text-[#f59e0b]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Net Value</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.financial.netValue)}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Cost Breakdown */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-[#b3d8fa] to-[#d1b3fa] rounded-lg">
                    <div className="text-xl font-bold text-[#5b5be6]">{formatCurrency(metrics.financial.costBreakdown.development)}</div>
                    <div className="text-sm text-gray-700 mt-1">Development</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-[#b3d8fa] to-[#d1b3fa] rounded-lg">
                    <div className="text-xl font-bold text-[#5b5be6]">{formatCurrency(metrics.financial.costBreakdown.infrastructure)}</div>
                    <div className="text-sm text-gray-700 mt-1">Infrastructure</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-[#b3d8fa] to-[#d1b3fa] rounded-lg">
                    <div className="text-xl font-bold text-[#5b5be6]">{formatCurrency(metrics.financial.costBreakdown.operations)}</div>
                    <div className="text-sm text-gray-700 mt-1">Operations</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-[#b3d8fa] to-[#d1b3fa] rounded-lg">
                    <div className="text-xl font-bold text-[#5b5be6]">{formatCurrency(metrics.financial.costBreakdown.api)}</div>
                    <div className="text-sm text-gray-700 mt-1">API</div>
                  </div>
                </div>
              </Card>
            </section>

            {/* SECTION 3: RISK MANAGEMENT */}
            <section>
              <div className="flex items-center mb-6">
                <Shield className="w-8 h-8 text-[#ef4444] mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Risk Management</h2>
              </div>
              
              {/* Risk Overview KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#5b5be6] bg-opacity-10">
                      <Shield className="w-6 h-6 text-[#5b5be6]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Assessed</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.risk.totalAssessed}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#10b981] bg-opacity-10">
                      <CheckCircle className="w-6 h-6 text-[#10b981]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Low Risk</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.risk.riskDistribution.Low || 0}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#f59e0b] bg-opacity-10">
                      <AlertTriangle className="w-6 h-6 text-[#f59e0b]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Medium Risk</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.risk.riskDistribution.Medium || 0}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#ef4444] bg-opacity-10">
                      <AlertTriangle className="w-6 h-6 text-[#ef4444]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">High Risk</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.risk.riskDistribution.High || 0}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Approval Status */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Status Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Governance</span>
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          ✓ {metrics.risk.approvalStatus.governance.approved || 0}
                        </span>
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          ⏳ {metrics.risk.approvalStatus.governance.pending || 0}
                        </span>
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          ✗ {metrics.risk.approvalStatus.governance.rejected || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Risk</span>
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          ✓ {metrics.risk.approvalStatus.risk.approved || 0}
                        </span>
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          ⏳ {metrics.risk.approvalStatus.risk.pending || 0}
                        </span>
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          ✗ {metrics.risk.approvalStatus.risk.rejected || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Legal</span>
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          ✓ {metrics.risk.approvalStatus.legal.approved || 0}
                        </span>
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          ⏳ {metrics.risk.approvalStatus.legal.pending || 0}
                        </span>
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          ✗ {metrics.risk.approvalStatus.legal.rejected || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Business</span>
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          ✓ {metrics.risk.approvalStatus.business.approved || 0}
                        </span>
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          ⏳ {metrics.risk.approvalStatus.business.pending || 0}
                        </span>
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          ✗ {metrics.risk.approvalStatus.business.rejected || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* SECTION 4: STRATEGIC ALIGNMENT */}
            <section>
              <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-[#8b5cf6] mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Strategic Alignment</h2>
              </div>
              
              {/* Strategic KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#10b981] bg-opacity-10">
                      <Target className="w-6 h-6 text-[#10b981]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Quick Wins</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.strategic.portfolioBalance.quickWins}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#5b5be6] bg-opacity-10">
                      <Brain className="w-6 h-6 text-[#5b5be6]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">High Impact Low Complexity</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.strategic.portfolioBalance.highImpactLowComplexity}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#f59e0b] bg-opacity-10">
                      <Users className="w-6 h-6 text-[#f59e0b]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Business Functions</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.strategic.businessFunctionPerformance.length}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-[#8b5cf6] bg-opacity-10">
                      <BarChart3 className="w-6 h-6 text-[#8b5cf6]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Function ROI</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {metrics.strategic.businessFunctionPerformance.length > 0 
                          ? (metrics.strategic.businessFunctionPerformance.reduce((sum, func) => sum + func.averageROI, 0) / 
                             metrics.strategic.businessFunctionPerformance.length).toFixed(1)
                          : '0.0'}%
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Business Function Performance Table */}
              {metrics.strategic.businessFunctionPerformance.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Function Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Function</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Use Cases</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operational</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productivity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {metrics.strategic.businessFunctionPerformance.map((func, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {func.function.charAt(0).toUpperCase() + func.function.slice(1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{func.count}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{func.avgOperationalScore.toFixed(1)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{func.avgProductivityScore.toFixed(1)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{func.avgRevenueScore.toFixed(1)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(func.totalInvestment)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{func.averageROI.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveDashboard;