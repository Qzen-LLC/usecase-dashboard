'use client';
import React, { useState, useEffect } from 'react';
import { useExecutiveMetrics } from '@/hooks/useExecutiveMetrics';
import { Card } from '@/components/ui/card';
import { TrendingUp, DollarSign, Shield, BarChart3, Target, AlertTriangle, CheckCircle, Clock, Zap, Users, Building2, PieChart, Activity, ArrowUpRight, ArrowDownRight, Minus, RefreshCw, Download, Eye, Filter } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{animationDelay: '0.5s', animationDuration: '1.5s'}}></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Loading Executive Dashboard</h3>
            <p className="text-slate-500 dark:text-slate-400">Gathering portfolio insights and metrics...</p>
          </div>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100 dark:from-red-900 dark:via-red-800 dark:to-red-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="p-8 text-center space-y-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-red-200 dark:border-red-700">
            <div className="relative">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Unable to Load Dashboard</h2>
              <p className="text-slate-600 dark:text-slate-400">{error?.message}</p>
            </div>
            <button 
              onClick={handleRefresh}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <RefreshCw className={`w-5 h-5 inline mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Try Again
            </button>
          </Card>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Page Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-4 rounded-2xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                  Executive Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  Portfolio, financial, risk, and strategic insights at a glance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-md"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:shadow-lg transform hover:scale-105">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced KPI Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Use Cases Card */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border-0">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                  Portfolio
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-blue-100 text-sm font-medium">Total Use Cases</p>
                <p className="text-white text-4xl font-bold">
                  {Math.round(animatedValues.totalUseCases || 0)}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-100 text-xs">Active</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Portfolio Score Card */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 hover:from-emerald-600 hover:via-green-700 hover:to-teal-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border-0">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                  Score
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-green-100 text-sm font-medium">Portfolio Score</p>
                <p className="text-white text-4xl font-bold">
                  {(animatedValues.portfolioScore || 0).toFixed(1)}/10
                </p>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(animatedValues.portfolioScore || 0) * 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Complexity Card */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-red-500 hover:from-amber-600 hover:via-orange-700 hover:to-red-600 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border-0">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                  Complexity
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-orange-100 text-sm font-medium">Avg Complexity</p>
                <p className="text-white text-4xl font-bold">
                  {(animatedValues.complexity || 0).toFixed(1)}/10
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-orange-100 text-xs">Moderate</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Confidence Card */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700 hover:from-purple-600 hover:via-violet-700 hover:to-purple-800 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border-0">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                  Confidence
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-purple-100 text-sm font-medium">Avg Confidence</p>
                <p className="text-white text-4xl font-bold">
                  {Math.round(animatedValues.confidence || 0)}%
                </p>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${animatedValues.confidence || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Enhanced Portfolio Health Section */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Portfolio Health</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Stage Distribution */}
            {Object.keys(metrics.portfolio.stageDistribution ?? {}).length > 0 && (
              <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20"></div>
                <div className="relative p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Stage Distribution</h3>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(metrics.portfolio.stageDistribution || {}).map(([stage, count], index) => (
                      <div key={stage} className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/60 rounded-lg backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-yellow-500' :
                            index === 3 ? 'bg-purple-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                            {stage.replace('-', ' ')}
                          </span>
                        </div>
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full">
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
              <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20"></div>
                <div className="relative p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Priority Distribution</h3>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(metrics.portfolio.priorityDistribution || {}).map(([priority, count], index) => (
                      <div key={priority} className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/60 rounded-lg backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            priority.toLowerCase() === 'high' ? 'bg-red-500' :
                            priority.toLowerCase() === 'medium' ? 'bg-yellow-500' :
                            priority.toLowerCase() === 'low' ? 'bg-green-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                            {priority}
                          </span>
                        </div>
                        <span className={`px-3 py-1 text-white text-sm font-semibold rounded-full ${
                          priority.toLowerCase() === 'high' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                          priority.toLowerCase() === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          priority.toLowerCase() === 'low' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'
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

        {/* Enhanced Financial Metrics Section */}
        {metrics.financial && (
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Financial Metrics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Investment */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 hover:from-emerald-600 hover:via-green-700 hover:to-teal-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                      Investment
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-green-100 text-sm font-medium">Total Investment</p>
                    <p className="text-white text-2xl font-bold">
                      {formatCurrency(metrics.financial.totalInvestment ?? 0)}
                    </p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-300" />
                      <span className="text-green-100 text-xs">Growing</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Total ROI */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                      ROI
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-blue-100 text-sm font-medium">Total ROI</p>
                    <p className="text-white text-2xl font-bold">
                      {formatCurrency(metrics.financial.totalROI ?? 0)}
                    </p>
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-blue-300" />
                      <span className="text-blue-100 text-xs">Positive</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Average ROI */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-red-500 hover:from-amber-600 hover:via-orange-700 hover:to-red-600 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                      Average
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-orange-100 text-sm font-medium">Average ROI</p>
                    <p className="text-white text-2xl font-bold">
                      {(metrics.financial.averageROI ?? 0).toFixed(1)}%
                    </p>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min((metrics.financial.averageROI ?? 0) * 2, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Average Cost per Use Case */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700 hover:from-purple-600 hover:via-violet-700 hover:to-purple-800 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                      Cost
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-purple-100 text-sm font-medium">Avg Cost per Use Case</p>
                    <p className="text-white text-2xl font-bold">
                      {formatCurrency((metrics.financial.totalInvestment ?? 0) / (metrics.portfolio.totalUseCases || 1))}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
                      <span className="text-purple-100 text-xs">Per Case</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Enhanced Risk Assessment Section */}
        {metrics.risk && (
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-orange-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Risk Assessment</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* High Risk */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-pink-600 hover:from-red-600 hover:via-red-700 hover:to-pink-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                      High Risk
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-red-100 text-sm font-medium">High Risk Use Cases</p>
                    <p className="text-white text-3xl font-bold">
                      {metrics.risk.riskDistribution?.High ?? 0}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
                      <span className="text-red-100 text-xs">Critical</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Medium Risk */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-600 hover:from-amber-600 hover:via-orange-700 hover:to-yellow-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                      Medium Risk
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-orange-100 text-sm font-medium">Medium Risk Use Cases</p>
                    <p className="text-white text-3xl font-bold">
                      {metrics.risk.riskDistribution?.Medium ?? 0}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
                      <span className="text-orange-100 text-xs">Monitor</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Low Risk */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 hover:from-emerald-600 hover:via-green-700 hover:to-teal-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                      Low Risk
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-green-100 text-sm font-medium">Low Risk Use Cases</p>
                    <p className="text-white text-3xl font-bold">
                      {metrics.risk.riskDistribution?.Low ?? 0}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                      <span className="text-green-100 text-xs">Safe</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Total Assessed */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                      Assessed
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-blue-100 text-sm font-medium">Total Assessed</p>
                    <p className="text-white text-3xl font-bold">
                      {metrics.risk.totalAssessed ?? 0}
                    </p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-300" />
                      <span className="text-blue-100 text-xs">Complete</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Enhanced Strategic Insights Section */}
        {metrics.strategic && (
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Strategic Insights</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Business Function Performance */}
              <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20"></div>
                <div className="relative p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Business Function Performance</h3>
                  </div>
                  <div className="space-y-4">
                    {metrics.strategic.businessFunctionPerformance?.map((func: any, index: number) => (
                      <div key={func.function} className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/60 rounded-lg backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-yellow-500' :
                            index === 3 ? 'bg-purple-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {func.function}
                          </span>
                        </div>
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-full">
                          {func.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              
              {/* Portfolio Balance */}
              <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20"></div>
                <div className="relative p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Portfolio Balance</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Quick Wins</span>
                      </div>
                      <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold rounded-full">
                        {metrics.strategic.portfolioBalance?.quickWins ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">High Impact Low Complexity</span>
                      </div>
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg font-bold rounded-full">
                        {metrics.strategic.portfolioBalance?.highImpactLowComplexity ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Average ROI by Function */}
              <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20"></div>
                <div className="relative p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Average ROI by Function</h3>
                  </div>
                  <div className="space-y-4">
                    {metrics.strategic.businessFunctionPerformance?.slice(0, 5).map((func: any, index: number) => (
                      <div key={func.function} className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-700/60 rounded-lg backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-purple-500' :
                            index === 1 ? 'bg-pink-500' :
                            index === 2 ? 'bg-indigo-500' :
                            index === 3 ? 'bg-violet-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {func.function}
                          </span>
                        </div>
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-semibold rounded-full">
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
