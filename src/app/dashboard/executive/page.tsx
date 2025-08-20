'use client';
import React from 'react';
import { useExecutiveMetrics } from '@/hooks/useExecutiveMetrics';
import { Card } from '@/components/ui/card';
import { TrendingUp, DollarSign, Shield, BarChart3, Target, AlertTriangle, CheckCircle, Clock, Zap, Users, Building2, PieChart } from 'lucide-react';

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
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="page-title">Executive Dashboard</h1>
              <p className="page-subtitle">Portfolio, financial, risk, and strategic insights at a glance</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <section className="grid-standard section-spacing">
          <Card className="card-gradient-primary p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="icon-container-primary">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="badge-primary">Portfolio</span>
            </div>
            <span className="text-sm font-medium text-foreground mb-2 block">Total Use Cases</span>
            <span className="font-extrabold text-primary text-3xl md:text-4xl lg:text-5xl leading-none">{metrics.portfolio.totalUseCases}</span>
          </Card>
          
          <Card className="card-gradient-success p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="icon-container-success">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="badge-success">Score</span>
            </div>
            <span className="text-sm font-medium text-foreground mb-2 block">Portfolio Score</span>
            <span className="font-extrabold text-green-500 text-3xl md:text-4xl lg:text-5xl leading-none">{(metrics.portfolio.overallScore ?? 0).toFixed(1)}/10</span>
          </Card>
          
          <Card className="card-gradient-warning p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="icon-container-warning">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="badge-warning">Complexity</span>
            </div>
            <span className="text-sm font-medium text-foreground mb-2 block">Avg Complexity</span>
            <span className="font-extrabold text-orange-500 text-3xl md:text-4xl lg:text-5xl leading-none">{(metrics.portfolio.complexityAnalysis?.average ?? 0).toFixed(1)}/10</span>
          </Card>
          
          <Card className="card-gradient-danger p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="icon-container-danger">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="badge-danger">Confidence</span>
            </div>
            <span className="text-sm font-medium text-foreground mb-2 block">Avg Confidence</span>
            <span className="font-extrabold text-red-500 text-3xl md:text-4xl lg:text-5xl leading-none">{(metrics.portfolio.confidenceAnalysis?.average ?? 0).toFixed(0)}%</span>
          </Card>
        </section>

        {/* Portfolio Health Section */}
        <section className="section-spacing">
          <div className="section-header">
            <div className="section-accent" />
            <h2 className="section-title">Portfolio Health</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stage Distribution */}
            {Object.keys(metrics.portfolio.stageDistribution ?? {}).length > 0 && (
              <Card className="card-standard p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-container-primary">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Stage Distribution</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(metrics.portfolio.stageDistribution || {}).map(([stage, count]) => (
                    <div key={stage} className="list-item-primary">
                      <span className="text-sm font-medium text-foreground capitalize">{stage.replace('-', ' ')}</span>
                      <span className="badge-primary">{count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Priority Distribution */}
            {Object.keys(metrics.portfolio.priorityDistribution ?? {}).length > 0 && (
              <Card className="card-standard p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-container-success">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Priority Distribution</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(metrics.portfolio.priorityDistribution || {}).map(([priority, count]) => (
                    <div key={priority} className="list-item-success">
                      <span className="text-sm font-medium text-foreground capitalize">{priority}</span>
                      <span className="badge-success">{count}</span>
                    </div>
                  ))}
                </div>
              </Card>
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
              <Card className="card-gradient-success p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-container-success">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <span className="badge-success">Investment</span>
                </div>
                <span className="text-sm font-medium text-foreground mb-2 block">Total Investment</span>
                <span className="font-extrabold text-green-500 text-2xl md:text-3xl lg:text-4xl leading-none">{formatCurrency(metrics.financial.totalInvestment ?? 0)}</span>
              </Card>
              
              <Card className="card-gradient-primary p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-container-primary">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="badge-primary">ROI</span>
                </div>
                <span className="text-sm font-medium text-foreground mb-2 block">Total ROI</span>
                <span className="font-extrabold text-primary text-2xl md:text-3xl lg:text-4xl leading-none">{formatCurrency(metrics.financial.totalROI ?? 0)}</span>
              </Card>
              
              <Card className="card-gradient-warning p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-container-warning">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <span className="badge-warning">Average</span>
                </div>
                <span className="text-sm font-medium text-foreground mb-2 block">Average ROI</span>
                <span className="font-extrabold text-orange-500 text-2xl md:text-3xl lg:text-4xl leading-none">{(metrics.financial.averageROI ?? 0).toFixed(1)}%</span>
              </Card>
              
              <Card className="card-gradient-danger p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-container-danger">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="badge-danger">Cost</span>
                </div>
                <span className="text-sm font-medium text-foreground mb-2 block">Avg Cost per Use Case</span>
                <span className="font-extrabold text-red-500 text-2xl md:text-3xl lg:text-4xl leading-none">{formatCurrency((metrics.financial.totalInvestment ?? 0) / (metrics.portfolio.totalUseCases || 1))}</span>
              </Card>
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
              <Card className="card-gradient-danger p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-container-danger">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <span className="badge-danger">High Risk</span>
                </div>
                <span className="text-sm font-medium text-foreground mb-2 block">High Risk Use Cases</span>
                <span className="font-extrabold text-red-500 text-2xl md:text-3xl lg:text-4xl leading-none">{metrics.risk.riskDistribution?.High ?? 0}</span>
              </Card>
              
              <Card className="card-gradient-warning p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-container-warning">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="badge-warning">Medium Risk</span>
                </div>
                <span className="text-sm font-medium text-foreground mb-2 block">Medium Risk Use Cases</span>
                <span className="font-extrabold text-orange-500 text-2xl md:text-3xl lg:text-4xl leading-none">{metrics.risk.riskDistribution?.Medium ?? 0}</span>
              </Card>
              
              <Card className="card-gradient-success p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-container-success">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="badge-success">Low Risk</span>
                </div>
                <span className="text-sm font-medium text-foreground mb-2 block">Low Risk Use Cases</span>
                <span className="font-extrabold text-green-500 text-2xl md:text-3xl lg:text-4xl leading-none">{metrics.risk.riskDistribution?.Low ?? 0}</span>
              </Card>
              
              <Card className="card-gradient-primary p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-container-primary">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="badge-primary">Assessed</span>
                </div>
                <span className="text-sm font-medium text-foreground mb-2 block">Total Assessed</span>
                <span className="font-extrabold text-primary text-2xl md:text-3xl lg:text-4xl leading-none">{metrics.risk.totalAssessed ?? 0}</span>
              </Card>
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
              <Card className="card-standard p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-container-primary">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Business Function Performance</h3>
                </div>
                <div className="space-y-3">
                  {metrics.strategic.businessFunctionPerformance?.map((func: any, index: number) => (
                    <div key={func.function} className="list-item-primary">
                      <span className="text-sm font-medium text-foreground">{func.function}</span>
                      <span className="badge-primary">{func.count}</span>
                    </div>
                  ))}
                </div>
              </Card>
              
              <Card className="card-standard p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-container-success">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Portfolio Balance</h3>
                </div>
                <div className="space-y-3">
                  <div className="list-item-success">
                    <span className="text-sm font-medium text-foreground">Quick Wins</span>
                    <span className="badge-success">{metrics.strategic.portfolioBalance?.quickWins ?? 0}</span>
                  </div>
                  <div className="list-item-success">
                    <span className="text-sm font-medium text-foreground">High Impact Low Complexity</span>
                    <span className="badge-success">{metrics.strategic.portfolioBalance?.highImpactLowComplexity ?? 0}</span>
                  </div>
                </div>
              </Card>
              
              <Card className="card-standard p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-container-warning">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Average ROI by Function</h3>
                </div>
                <div className="space-y-3">
                  {metrics.strategic.businessFunctionPerformance?.slice(0, 5).map((func: any) => (
                    <div key={func.function} className="list-item-warning">
                      <span className="text-sm font-medium text-foreground">{func.function}</span>
                      <span className="badge-warning">{func.averageROI.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
