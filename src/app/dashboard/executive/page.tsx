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
      <div className="loading-container">
        <div className="text-center">
          <div className="loading-spinner" />
          <p className="loading-text">Loading executive metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <div className="error-icon">
            <span className="text-2xl text-red-500">!</span>
          </div>
          <h2 className="error-title">Unable to Load Dashboard</h2>
          <p className="error-message">{error?.message}</p>
          <button 
            onClick={() => refetch()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="error-container">
        <div className="error-card">
          <div className="error-icon">
            <span className="text-2xl text-red-500">!</span>
          </div>
          <p className="error-message">No metrics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <div className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Portfolio, financial, risk, and strategic insights at a glance</p>
        </div>

        {/* KPI Cards */}
        <section className="grid-standard section-spacing">
          <div className="card-standard p-7 flex flex-col items-start">
            <span className="text-base font-medium text-gray-500 mb-1">Total Use Cases</span>
            <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{metrics.portfolio.totalUseCases}</span>
          </div>
          <div className="card-standard p-7 flex flex-col items-start">
            <span className="text-base font-medium text-gray-500 mb-1">Portfolio Score</span>
            <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{(metrics.portfolio.overallScore ?? 0).toFixed(1)}/10</span>
          </div>
          <div className="card-standard p-7 flex flex-col items-start">
            <span className="text-base font-medium text-gray-500 mb-1">Avg Complexity</span>
            <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{(metrics.portfolio.complexityAnalysis?.average ?? 0).toFixed(1)}/10</span>
          </div>
          <div className="card-standard p-7 flex flex-col items-start">
            <span className="text-base font-medium text-gray-500 mb-1">Avg Confidence</span>
            <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{(metrics.portfolio.confidenceAnalysis?.average ?? 0).toFixed(0)}%</span>
          </div>
        </section>

        {/* Portfolio Health Section */}
        <section className="section-spacing">
          <div className="section-header">
            <div className="section-accent" />
            <h2 className="section-title">Portfolio Health</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Stage Distribution */}
            {Object.keys(metrics.portfolio.stageDistribution ?? {}).length > 0 && (
              <div className="card-standard p-7">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(metrics.portfolio.stageDistribution || {}).map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">{stage.replace('-', ' ')}</span>
                      <span className="text-sm font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Priority Distribution */}
            {Object.keys(metrics.portfolio.priorityDistribution ?? {}).length > 0 && (
              <div className="card-standard p-7">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(metrics.portfolio.priorityDistribution || {}).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">{priority}</span>
                      <span className="text-sm font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Financial Metrics Section */}
        {metrics.financial && (
          <section className="section-spacing">
            <div className="section-header">
              <div className="section-accent" />
              <h2 className="section-title">Financial Metrics</h2>
            </div>
            <div className="grid-standard">
              <div className="card-standard p-7 flex flex-col items-start">
                <span className="text-base font-medium text-gray-500 mb-1">Total Investment</span>
                <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{formatCurrency(metrics.financial.totalInvestment ?? 0)}</span>
              </div>
              <div className="card-standard p-7 flex flex-col items-start">
                <span className="text-base font-medium text-gray-500 mb-1">Total ROI</span>
                <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{formatCurrency(metrics.financial.totalROI ?? 0)}</span>
              </div>
              <div className="card-standard p-7 flex flex-col items-start">
                <span className="text-base font-medium text-gray-500 mb-1">Average ROI</span>
                <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{(metrics.financial.averageROI ?? 0).toFixed(1)}%</span>
              </div>
              <div className="card-standard p-7 flex flex-col items-start">
                <span className="text-base font-medium text-gray-500 mb-1">Avg Cost per Use Case</span>
                <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{formatCurrency((metrics.financial.totalInvestment ?? 0) / (metrics.portfolio.totalUseCases || 1))}</span>
              </div>
            </div>
          </section>
        )}

        {/* Risk Metrics Section */}
        {metrics.risk && (
          <section className="section-spacing">
            <div className="section-header">
              <div className="section-accent" />
              <h2 className="section-title">Risk Assessment</h2>
            </div>
            <div className="grid-standard">
              <div className="card-standard p-7 flex flex-col items-start">
                <span className="text-base font-medium text-gray-500 mb-1">High Risk Use Cases</span>
                <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{metrics.risk.riskDistribution?.High ?? 0}</span>
              </div>
              <div className="card-standard p-7 flex flex-col items-start">
                <span className="text-base font-medium text-gray-500 mb-1">Medium Risk Use Cases</span>
                <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{metrics.risk.riskDistribution?.Medium ?? 0}</span>
              </div>
              <div className="card-standard p-7 flex flex-col items-start">
                <span className="text-base font-medium text-gray-500 mb-1">Low Risk Use Cases</span>
                <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{metrics.risk.riskDistribution?.Low ?? 0}</span>
              </div>
              <div className="card-standard p-7 flex flex-col items-start">
                <span className="text-base font-medium text-gray-500 mb-1">Total Assessed</span>
                <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{metrics.risk.totalAssessed ?? 0}</span>
              </div>
            </div>
          </section>
        )}

        {/* Strategic Insights Section */}
        {metrics.strategic && (
          <section className="section-spacing">
            <div className="section-header">
              <div className="section-accent" />
              <h2 className="section-title">Strategic Insights</h2>
            </div>
            <div className="grid-cards">
              <div className="card-standard p-7">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Function Performance</h3>
                <div className="space-y-3">
                  {metrics.strategic.businessFunctionPerformance?.map((func: any, index: number) => (
                    <div key={func.function} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{func.function}</span>
                      <span className="text-sm font-semibold text-gray-900">{func.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-standard p-7">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Balance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Quick Wins</span>
                    <span className="text-sm font-semibold text-gray-900">{metrics.strategic.portfolioBalance?.quickWins ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">High Impact Low Complexity</span>
                    <span className="text-sm font-semibold text-gray-900">{metrics.strategic.portfolioBalance?.highImpactLowComplexity ?? 0}</span>
                  </div>
                </div>
              </div>
              <div className="card-standard p-7">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Average ROI by Function</h3>
                <div className="space-y-3">
                  {metrics.strategic.businessFunctionPerformance?.slice(0, 5).map((func: any) => (
                    <div key={func.function} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{func.function}</span>
                      <span className="text-sm font-semibold text-gray-900">{func.averageROI.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ExecutiveDashboard;