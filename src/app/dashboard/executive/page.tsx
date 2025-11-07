'use client';
import React, { useState, useEffect } from 'react';
import { useExecutiveMetrics } from '@/hooks/useExecutiveMetrics';
import { Card } from '@/components/ui/card';
import { TrendingUp, DollarSign, Shield, Target, AlertTriangle, CheckCircle, Clock, Zap, Users, Building2, PieChart, Activity, ArrowUpRight, ArrowDownRight, Minus, RefreshCw, Download, Eye, Filter } from 'lucide-react';

const ExecutiveDashboard = () => {
  const { data: metrics, isLoading: loading, error, refetch } = useExecutiveMetrics();
  const [animatedValues, setAnimatedValues] = useState<{[key: string]: number}>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Animated counter effect
  const animateValue = (key: string, endValue: number, duration: number = 2000) => {
    const startValue = animatedValues[key] || 0;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = startValue + (endValue - startValue) * progress;
      
      setAnimatedValues(prev => ({ ...prev, [key]: currentValue }));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  // Animate values when metrics load
  useEffect(() => {
    if (metrics) {
      animateValue('totalUseCases', metrics.portfolio.totalUseCases);
      animateValue('portfolioScore', metrics.portfolio.overallScore || 0);
      animateValue('complexity', metrics.portfolio.complexityAnalysis?.average || 0);
      animateValue('confidence', metrics.portfolio.confidenceAnalysis?.average || 0);
    }
  }, [metrics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExport = () => {
    if (!metrics) return;

    // Create CSV content
    const csvContent = generateCSVContent(metrics);
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `executive-dashboard-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSVContent = (metrics: any) => {
    const rows = [];
    
    // Header
    rows.push(['Executive Dashboard Report', new Date().toLocaleDateString()]);
    rows.push([]);
    
    // Portfolio Metrics
    rows.push(['PORTFOLIO METRICS']);
    rows.push(['Metric', 'Value']);
    rows.push(['Total Use Cases', metrics.portfolio?.totalUseCases || 0]);
    rows.push(['Portfolio Score', `${(metrics.portfolio?.overallScore || 0).toFixed(1)}/10`]);
    rows.push(['Average Complexity', `${(metrics.portfolio?.complexityAnalysis?.average || 0).toFixed(1)}/10`]);
    rows.push(['Average Confidence', `${Math.round(metrics.portfolio?.confidenceAnalysis?.average || 0)}%`]);
    rows.push([]);
    
    // Stage Distribution
    if (metrics.portfolio?.stageDistribution) {
      rows.push(['STAGE DISTRIBUTION']);
      rows.push(['Stage', 'Count']);
      Object.entries(metrics.portfolio.stageDistribution).forEach(([stage, count]) => {
        rows.push([stage.replace('-', ' '), count]);
      });
      rows.push([]);
    }
    
    // Priority Distribution
    if (metrics.portfolio?.priorityDistribution) {
      rows.push(['PRIORITY DISTRIBUTION']);
      rows.push(['Priority', 'Count']);
      Object.entries(metrics.portfolio.priorityDistribution).forEach(([priority, count]) => {
        rows.push([priority, count]);
      });
      rows.push([]);
    }
    
    // Financial Metrics
    if (metrics.financial) {
      rows.push(['FINANCIAL METRICS']);
      rows.push(['Metric', 'Value']);
      rows.push(['Total Investment', formatCurrency(metrics.financial.totalInvestment ?? 0)]);
      rows.push(['Total ROI', formatCurrency(metrics.financial.totalROI ?? 0)]);
      rows.push(['Average ROI', `${(metrics.financial.averageROI ?? 0).toFixed(1)}%`]);
      rows.push(['Avg Cost per Use Case', formatCurrency((metrics.financial.totalInvestment ?? 0) / (metrics.portfolio?.totalUseCases || 1))]);
      rows.push([]);
    }
    
    // Risk Assessment
    if (metrics.risk) {
      rows.push(['RISK ASSESSMENT']);
      rows.push(['Risk Level', 'Count']);
      if (metrics.risk.riskDistribution) {
        Object.entries(metrics.risk.riskDistribution).forEach(([risk, count]) => {
          rows.push([risk, count]);
        });
      }
      rows.push(['Total Assessed', metrics.risk.totalAssessed ?? 0]);
      rows.push([]);
    }
    
    // Strategic Insights
    if (metrics.strategic) {
      rows.push(['STRATEGIC INSIGHTS']);
      
      if (metrics.strategic.businessFunctionPerformance) {
        rows.push(['BUSINESS FUNCTION PERFORMANCE']);
        rows.push(['Function', 'Count', 'Average ROI']);
        metrics.strategic.businessFunctionPerformance.forEach((func: any) => {
          rows.push([func.function, func.count, `${func.averageROI.toFixed(1)}%`]);
        });
        rows.push([]);
      }
      
      if (metrics.strategic.portfolioBalance) {
        rows.push(['PORTFOLIO BALANCE']);
        rows.push(['Category', 'Count']);
        rows.push(['Quick Wins', metrics.strategic.portfolioBalance.quickWins ?? 0]);
        rows.push(['High Impact Low Complexity', metrics.strategic.portfolioBalance.highImpactLowComplexity ?? 0]);
      }
    }
    
    // Convert to CSV string
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">Loading Executive Dashboard</h3>
            <p className="text-xs text-muted-foreground">Gathering portfolio insights and metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Unable to Load Dashboard</h2>
              <p className="text-xs text-muted-foreground">{error?.message}</p>
            </div>
            <button 
              onClick={handleRefresh}
              className="w-full bg-primary text-primary-foreground font-medium py-2 px-4 text-sm rounded-md hover:bg-primary/90 transition-colors duration-150"
            >
              <RefreshCw className={`w-4 h-4 inline mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Try Again
            </button>
          </Card>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 text-center space-y-3">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">No Data Available</h2>
            <p className="text-xs text-muted-foreground">No metrics data available for this organization.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Action Buttons */}
        <div className="mb-6 flex justify-end">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-card border border-border rounded-md hover:bg-muted transition-colors duration-150"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-150"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* Clean KPI Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Use Cases Card */}
          <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
            <div className="p-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Total Use Cases</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(animatedValues.totalUseCases || 0)}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Active</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Portfolio Score Card */}
          <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
            <div className="p-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Portfolio Score</p>
                <p className="text-2xl font-bold text-foreground">
                  {(animatedValues.portfolioScore || 0).toFixed(1)}/10
                </p>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(animatedValues.portfolioScore || 0) * 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Complexity Card */}
          <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
            <div className="p-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Avg Complexity</p>
                <p className="text-2xl font-bold text-foreground">
                  {(animatedValues.complexity || 0).toFixed(1)}/10
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-warning rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Moderate</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Confidence Card */}
          <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
            <div className="p-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(animatedValues.confidence || 0)}%
                </p>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${animatedValues.confidence || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Portfolio Health Section */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Portfolio Health</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Stage Distribution */}
            {Object.keys(metrics.portfolio.stageDistribution ?? {}).length > 0 && (
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-foreground">Stage Distribution</h3>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(metrics.portfolio.stageDistribution || {}).map(([stage, count], index) => (
                      <div key={stage} className="flex items-center justify-between p-2 bg-muted/50 rounded-md hover:bg-muted transition-colors duration-150">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            index === 0 ? 'bg-primary' :
                            index === 1 ? 'bg-success' :
                            index === 2 ? 'bg-warning' :
                            index === 3 ? 'bg-secondary' : 'bg-muted-foreground'
                          }`}></div>
                          <span className="text-xs font-medium text-foreground capitalize">
                            {stage.replace('-', ' ')}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Priority Distribution */}
            {Object.keys(metrics.portfolio.priorityDistribution ?? {}).length > 0 && (
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-foreground">Priority Distribution</h3>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(metrics.portfolio.priorityDistribution || {}).map(([priority, count], index) => (
                      <div key={priority} className="flex items-center justify-between p-2 bg-muted/50 rounded-md hover:bg-muted transition-colors duration-150">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            priority.toLowerCase() === 'high' ? 'bg-destructive' :
                            priority.toLowerCase() === 'medium' ? 'bg-warning' :
                            priority.toLowerCase() === 'low' ? 'bg-success' : 'bg-muted-foreground'
                          }`}></div>
                          <span className="text-xs font-medium text-foreground capitalize">
                            {priority}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          priority.toLowerCase() === 'high' ? 'bg-destructive text-destructive-foreground' :
                          priority.toLowerCase() === 'medium' ? 'bg-warning text-warning-foreground' :
                          priority.toLowerCase() === 'low' ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* Financial Metrics Section */}
        {metrics.financial && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Financial Metrics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Investment */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Total Investment</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(metrics.financial.totalInvestment ?? 0)}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-success" />
                      <span className="text-xs text-muted-foreground">Growing</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Total ROI */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Total ROI</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(metrics.financial.totalROI ?? 0)}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                      <span className="text-xs text-muted-foreground">Positive</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Average ROI */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Average ROI</p>
                    <p className="text-xl font-bold text-foreground">
                      {(metrics.financial.averageROI ?? 0).toFixed(1)}%
                    </p>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min((metrics.financial.averageROI ?? 0) * 2, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Average Cost per Use Case */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Avg Cost per Use Case</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency((metrics.financial.totalInvestment ?? 0) / (metrics.portfolio.totalUseCases || 1))}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Per Case</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Risk Assessment Section */}
        {metrics.risk && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Risk Assessment</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* High Risk */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">High Risk Use Cases</p>
                    <p className="text-2xl font-bold text-foreground">
                      {metrics.risk.riskDistribution?.High ?? 0}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-destructive rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Critical</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Medium Risk */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Medium Risk Use Cases</p>
                    <p className="text-2xl font-bold text-foreground">
                      {metrics.risk.riskDistribution?.Medium ?? 0}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-warning rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Monitor</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Low Risk */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Low Risk Use Cases</p>
                    <p className="text-2xl font-bold text-foreground">
                      {metrics.risk.riskDistribution?.Low ?? 0}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Safe</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Total Assessed */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Total Assessed</p>
                    <p className="text-2xl font-bold text-foreground">
                      {metrics.risk.totalAssessed ?? 0}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground">Complete</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Strategic Insights Section */}
        {metrics.strategic && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Strategic Insights</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Business Function Performance */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-foreground">Business Function Performance</h3>
                  </div>
                  <div className="space-y-2">
                    {metrics.strategic.businessFunctionPerformance?.map((func: any, index: number) => (
                      <div key={func.function} className="flex items-center justify-between p-2 bg-muted/50 rounded-md hover:bg-muted transition-colors duration-150">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            index === 0 ? 'bg-primary' :
                            index === 1 ? 'bg-success' :
                            index === 2 ? 'bg-warning' :
                            index === 3 ? 'bg-secondary' : 'bg-muted-foreground'
                          }`}></div>
                          <span className="text-xs font-medium text-foreground">
                            {func.function}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded">
                          {func.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              
              {/* Portfolio Balance */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-foreground">Portfolio Balance</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-success rounded-full"></div>
                        <span className="text-xs font-medium text-foreground">Quick Wins</span>
                      </div>
                      <span className="px-3 py-1.5 bg-success text-success-foreground text-base font-bold rounded">
                        {metrics.strategic.portfolioBalance?.quickWins ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                        <span className="text-xs font-medium text-foreground">High Impact Low Complexity</span>
                      </div>
                      <span className="px-3 py-1.5 bg-primary text-primary-foreground text-base font-bold rounded">
                        {metrics.strategic.portfolioBalance?.highImpactLowComplexity ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Average ROI by Function */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-foreground">Average ROI by Function</h3>
                  </div>
                  <div className="space-y-2">
                    {metrics.strategic.businessFunctionPerformance?.slice(0, 5).map((func: any, index: number) => (
                      <div key={func.function} className="flex items-center justify-between p-2 bg-muted/50 rounded-md hover:bg-muted transition-colors duration-150">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            index === 0 ? 'bg-primary' :
                            index === 1 ? 'bg-success' :
                            index === 2 ? 'bg-warning' :
                            index === 3 ? 'bg-secondary' : 'bg-muted-foreground'
                          }`}></div>
                          <span className="text-xs font-medium text-foreground">
                            {func.function}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded">
                          {func.averageROI.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
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
