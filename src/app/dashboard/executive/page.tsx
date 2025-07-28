'use client';
import React from 'react';
import { useExecutiveMetrics } from '@/hooks/useExecutiveMetrics';

const ExecutiveDashboard = () => {
  const { data: metrics, isLoading: loading, error, refetch } = useExecutiveMetrics();

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading executive metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-500">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-4">{error?.message}</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-500">!</span>
          </div>
          <p className="text-gray-600">No metrics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-16">
      {/* Page Header */}
      <header className="w-full max-w-7xl mx-auto px-4 pt-10 pb-6 flex flex-col items-start">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Executive Dashboard</h1>
        <p className="text-lg text-gray-600 font-medium">Portfolio, financial, risk, and strategic insights at a glance</p>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4">
        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/80 rounded-2xl shadow-lg p-7 flex flex-col items-start hover:shadow-2xl transition-all border border-gray-100">
            <span className="text-base font-medium text-gray-500 mb-1">Total Use Cases</span>
            <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{metrics.portfolio.totalUseCases}</span>
          </div>
          <div className="bg-white/80 rounded-2xl shadow-lg p-7 flex flex-col items-start hover:shadow-2xl transition-all border border-gray-100">
            <span className="text-base font-medium text-gray-500 mb-1">Portfolio Score</span>
            <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{(metrics.portfolio.overallScore ?? 0).toFixed(1)}/10</span>
          </div>
          <div className="bg-white/80 rounded-2xl shadow-lg p-7 flex flex-col items-start hover:shadow-2xl transition-all border border-gray-100">
            <span className="text-base font-medium text-gray-500 mb-1">Avg Complexity</span>
            <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{(metrics.portfolio.complexityAnalysis?.average ?? 0).toFixed(1)}/10</span>
          </div>
          <div className="bg-white/80 rounded-2xl shadow-lg p-7 flex flex-col items-start hover:shadow-2xl transition-all border border-gray-100">
            <span className="text-base font-medium text-gray-500 mb-1">Avg Confidence</span>
            <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{(metrics.portfolio.confidenceAnalysis?.average ?? 0).toFixed(0)}%</span>
          </div>
        </section>

        {/* Portfolio Health Section */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-2 h-8 bg-blue-500 rounded-full mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Portfolio Health</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Stage Distribution */}
            {Object.keys(metrics.portfolio.stageDistribution ?? {}).length > 0 && (
              <div className="bg-white/80 rounded-2xl shadow p-7 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {Object.entries(metrics.portfolio.stageDistribution ?? {}).map(([stage, count]) => (
                    <div key={stage} className="text-center p-5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                      <div className="text-2xl font-extrabold text-blue-700">{count}</div>
                      <div className="text-base text-gray-700 mt-2 capitalize">{stage.replace('-', ' ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Impact Scores */}
            <div className="bg-white/80 rounded-2xl shadow p-7 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Scores Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Operational</p>
                  <p className="font-extrabold text-blue-700 text-2xl md:text-3xl lg:text-4xl">{(metrics.portfolio.impactScores?.operational?.average ?? 0).toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Productivity</p>
                  <p className="font-extrabold text-green-600 text-2xl md:text-3xl lg:text-4xl">{(metrics.portfolio.impactScores?.productivity?.average ?? 0).toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Revenue</p>
                  <p className="font-extrabold text-yellow-600 text-2xl md:text-3xl lg:text-4xl">{(metrics.portfolio.impactScores?.revenue?.average ?? 0).toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Financial Performance Section */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-2 h-8 bg-green-500 rounded-full mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Financial Performance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 rounded-2xl shadow p-7 border border-gray-100 flex flex-col items-start">
              <span className="text-base font-medium text-gray-500 mb-1">Total Investment</span>
              <span className="font-extrabold text-gray-900 text-2xl md:text-3xl lg:text-4xl">{formatCurrency(metrics.financial?.totalInvestment ?? 0)}</span>
            </div>
            <div className="bg-white/80 rounded-2xl shadow p-7 border border-gray-100 flex flex-col items-start">
              <span className="text-base font-medium text-gray-500 mb-1">Average ROI</span>
              <span className="font-extrabold text-gray-900 text-2xl md:text-3xl lg:text-4xl">{(metrics.financial?.averageROI ?? 0).toFixed(1)}%</span>
            </div>
            <div className="bg-white/80 rounded-2xl shadow p-7 border border-gray-100 flex flex-col items-start">
              <span className="text-base font-medium text-gray-500 mb-1">Projected Value</span>
              <span className="font-extrabold text-gray-900 text-2xl md:text-3xl lg:text-4xl">{formatCurrency(metrics.financial?.projectedValue ?? 0)}</span>
            </div>
            <div className="bg-white/80 rounded-2xl shadow p-7 border border-gray-100 flex flex-col items-start">
              <span className="text-base font-medium text-gray-500 mb-1">Net Value</span>
              <span className="font-extrabold text-gray-900 text-2xl md:text-3xl lg:text-4xl">{formatCurrency(metrics.financial?.netValue ?? 0)}</span>
            </div>
          </div>
          {/* Cost Breakdown */}
          <div className="bg-white/80 rounded-2xl shadow p-7 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div className="text-center p-5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                <div className="text-xl font-extrabold text-blue-700">{formatCurrency(metrics.financial?.costBreakdown?.development ?? 0)}</div>
                <div className="text-base text-gray-700 mt-2">Development</div>
              </div>
              <div className="text-center p-5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                <div className="text-xl font-extrabold text-blue-700">{formatCurrency(metrics.financial?.costBreakdown?.infrastructure ?? 0)}</div>
                <div className="text-base text-gray-700 mt-2">Infrastructure</div>
              </div>
              <div className="text-center p-5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                <div className="text-xl font-extrabold text-blue-700">{formatCurrency(metrics.financial?.costBreakdown?.operations ?? 0)}</div>
                <div className="text-base text-gray-700 mt-2">Operations</div>
              </div>
              <div className="text-center p-5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                <div className="text-xl font-extrabold text-blue-700">{formatCurrency(metrics.financial?.costBreakdown?.api ?? 0)}</div>
                <div className="text-base text-gray-700 mt-2">API</div>
              </div>
            </div>
          </div>
        </section>

        {/* Risk Management Section */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-2 h-8 bg-red-500 rounded-full mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Risk Management</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 rounded-2xl shadow p-7 border border-gray-100 flex flex-col items-start">
              <span className="text-base font-medium text-gray-500 mb-1">Total Assessed</span>
              <span className="font-extrabold text-gray-900 text-2xl md:text-3xl lg:text-4xl">{metrics.risk?.totalAssessed ?? 0}</span>
            </div>
            <div className="bg-white/80 rounded-2xl shadow p-7 border border-gray-100 flex flex-col items-start">
              <span className="text-base font-medium text-gray-500 mb-1">Low Risk</span>
              <span className="font-extrabold text-green-600 text-2xl md:text-3xl lg:text-4xl">{metrics.risk?.riskDistribution?.Low ?? 0}</span>
            </div>
            <div className="bg-white/80 rounded-2xl shadow p-7 border border-gray-100 flex flex-col items-start">
              <span className="text-base font-medium text-gray-500 mb-1">Medium Risk</span>
              <span className="font-extrabold text-yellow-600 text-2xl md:text-3xl lg:text-4xl">{metrics.risk?.riskDistribution?.Medium ?? 0}</span>
            </div>
            <div className="bg-white/80 rounded-2xl shadow p-7 border border-gray-100 flex flex-col items-start">
              <span className="text-base font-medium text-gray-500 mb-1">High Risk</span>
              <span className="font-extrabold text-red-600 text-2xl md:text-3xl lg:text-4xl">{metrics.risk?.riskDistribution?.High ?? 0}</span>
            </div>
          </div>
          {/* Approval Status */}
          <div className="bg-white/80 rounded-2xl shadow p-7 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Status Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-gray-500">Governance</span>
                  <div className="flex space-x-2">
                    <span className="px-3 py-2 text-sm bg-green-100 text-green-800 rounded-lg">
                      ✓ {metrics.risk?.approvalStatus?.governance?.approved ?? 0}
                    </span>
                    <span className="px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg">
                      ⏳ {metrics.risk?.approvalStatus?.governance?.pending ?? 0}
                    </span>
                    <span className="px-3 py-2 text-sm bg-red-100 text-red-800 rounded-lg">
                      ✗ {metrics.risk?.approvalStatus?.governance?.rejected ?? 0}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-gray-500">Risk</span>
                  <div className="flex space-x-2">
                    <span className="px-3 py-2 text-sm bg-green-100 text-green-800 rounded-lg">
                      ✓ {metrics.risk?.approvalStatus?.risk?.approved ?? 0}
                    </span>
                    <span className="px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg">
                      ⏳ {metrics.risk?.approvalStatus?.risk?.pending ?? 0}
                    </span>
                    <span className="px-3 py-2 text-sm bg-red-100 text-red-800 rounded-lg">
                      ✗ {metrics.risk?.approvalStatus?.risk?.rejected ?? 0}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-gray-500">Legal</span>
                  <div className="flex space-x-2">
                    <span className="px-3 py-2 text-sm bg-green-100 text-green-800 rounded-lg">
                      ✓ {metrics.risk?.approvalStatus?.legal?.approved ?? 0}
                    </span>
                    <span className="px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg">
                      ⏳ {metrics.risk?.approvalStatus?.legal?.pending ?? 0}
                    </span>
                    <span className="px-3 py-2 text-sm bg-red-100 text-red-800 rounded-lg">
                      ✗ {metrics.risk?.approvalStatus?.legal?.rejected ?? 0}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-gray-500">Business</span>
                  <div className="flex space-x-2">
                    <span className="px-3 py-2 text-sm bg-green-100 text-green-800 rounded-lg">
                      ✓ {metrics.risk?.approvalStatus?.business?.approved ?? 0}
                    </span>
                    <span className="px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg">
                      ⏳ {metrics.risk?.approvalStatus?.business?.pending ?? 0}
                    </span>
                    <span className="px-3 py-2 text-sm bg-red-100 text-red-800 rounded-lg">
                      ✗ {metrics.risk?.approvalStatus?.business?.rejected ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Strategic Alignment Section */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-2 h-8 bg-blue-400 rounded-full mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Strategic Alignment</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 rounded-2xl shadow p-7 border border-gray-100 flex flex-col items-start">
              <span className="text-base font-medium text-gray-500 mb-1">Quick Wins</span>
              <span className="font-extrabold text-gray-900 text-2xl md:text-3xl lg:text-4xl">{metrics.strategic?.portfolioBalance?.quickWins ?? 0}</span>
            </div>
            <div className="bg-white/80 rounded-2xl shadow p-7 border border-gray-100 flex flex-col items-start">
              <span className="text-base font-medium text-gray-500 mb-1">High Impact Low Complexity</span>
              <span className="font-extrabold text-gray-900 text-2xl md:text-3xl lg:text-4xl">{metrics.strategic?.portfolioBalance?.highImpactLowComplexity ?? 0}</span>
            </div>
            <div className="bg-white/80 rounded-2xl shadow p-7 border border-gray-100 flex flex-col items-start">
              <span className="text-base font-medium text-gray-500 mb-1">Business Functions</span>
              <span className="font-extrabold text-gray-900 text-2xl md:text-3xl lg:text-4xl">{metrics.strategic?.businessFunctionPerformance?.length ?? 0}</span>
            </div>
            <div className="bg-white/80 rounded-2xl shadow p-7 border border-gray-100 flex flex-col items-start">
              <span className="text-base font-medium text-gray-500 mb-1">Avg Function ROI</span>
              <span className="font-extrabold text-gray-900 text-2xl md:text-3xl lg:text-4xl">
                {metrics.strategic?.businessFunctionPerformance?.length > 0 
                  ? (metrics.strategic.businessFunctionPerformance.reduce((sum, func) => sum + func.averageROI, 0) / 
                     metrics.strategic.businessFunctionPerformance.length).toFixed(1)
                  : '0.0'}%
              </span>
            </div>
          </div>
          {/* Business Function Performance Table */}
          {metrics.strategic?.businessFunctionPerformance?.length > 0 && (
            <div className="bg-white/80 rounded-2xl shadow p-7 border border-gray-100">
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
                    {metrics.strategic?.businessFunctionPerformance?.map((func, index) => (
                      <tr key={index} className="hover:bg-blue-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{func.function.charAt(0).toUpperCase() + func.function.slice(1)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{func.count}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">{func.avgOperationalScore.toFixed(1)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{func.avgProductivityScore.toFixed(1)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{func.avgRevenueScore.toFixed(1)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(func.totalInvestment)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{func.averageROI.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ExecutiveDashboard;