'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  Shield,
  Lightbulb,
  BarChart3,
  RefreshCw,
  Eye,
  Zap,
  Target,
  Clock,
  Brain,
  Crosshair,
  Users,
  Building
} from 'lucide-react';
import { 
  UnifiedAnalysis, 
  CrossDomainInsight, 
  PortfolioInsights 
} from '@/lib/ai-agents/ai-agent-manager';

export default function UnifiedAIInsightsPage() {
  const [portfolioInsights, setPortfolioInsights] = useState<PortfolioInsights | null>(null);
  const [executiveReport, setExecutiveReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<CrossDomainInsight | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPortfolioInsights();
    fetchExecutiveReport();
  }, []);

  const fetchPortfolioInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-agents/unified-analysis?portfolio=true');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio insights');
      }
      const data = await response.json();
      setPortfolioInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutiveReport = async () => {
    try {
      const response = await fetch('/api/ai-agents/unified-analysis?executiveReport=true');
      if (response.ok) {
        const data = await response.json();
        setExecutiveReport(data);
      }
    } catch (err) {
      console.error('Error fetching executive report:', err);
    }
  };

  const handleRefresh = () => {
    fetchPortfolioInsights();
    fetchExecutiveReport();
  };

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'cost_governance':
        return <DollarSign className="h-5 w-5" />;
      case 'risk_financial':
        return <AlertTriangle className="h-5 w-5" />;
      case 'compliance_efficiency':
        return <Shield className="h-5 w-5" />;
      case 'opportunity_optimization':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getInsightColor = (category: string) => {
    switch (category) {
      case 'cost_governance':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'risk_financial':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'compliance_efficiency':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'opportunity_optimization':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Analyzing portfolio with AI...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="max-w-2xl mx-auto mt-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </Alert>
    );
  }

  if (!portfolioInsights) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No portfolio insights available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Brain className="h-8 w-8 mr-3 text-purple-600" />
                Unified AI Insights Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Cross-domain intelligence combining financial and governance analysis
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>
        </div>

        {/* Executive Summary */}
        {executiveReport && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Building className="h-5 w-5 mr-2" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{executiveReport.summary}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(executiveReport.keyMetrics).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{value as number}</div>
                    <div className="text-xs text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center">
              <Crosshair className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="cross-domain" className="flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              Cross-Domain
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Governance
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {portfolioInsights.financialInsights.length + portfolioInsights.governanceInsights.length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">AI Generated</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Cross-Domain Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {portfolioInsights.crossDomainInsights.length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Unified Analysis</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {portfolioInsights.topPerformers.length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">High-ROI Use Cases</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">High Risk Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {portfolioInsights.highRiskUseCases.length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Require Attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Compliance Gaps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {portfolioInsights.complianceGaps.length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Need Remediation</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Cost Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {portfolioInsights.costOptimizationOpportunities.length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Potential Savings</p>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Strategic Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolioInsights.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cross-Domain Tab */}
          <TabsContent value="cross-domain" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  Cross-Domain Insights
                </h2>
                <div className="space-y-4">
                  {portfolioInsights.crossDomainInsights.map((insight, index) => (
                    <Card 
                      key={index} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedInsight?.id === insight.id ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => setSelectedInsight(insight)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`p-2 rounded-lg ${getInsightColor(insight.category)}`}>
                              {getInsightIcon(insight.category)}
                            </div>
                            <div>
                              <CardTitle className="text-sm">{insight.title}</CardTitle>
                              <CardDescription className="text-xs">
                                Confidence: {(insight.confidence * 100).toFixed(0)}%
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-blue-600">Financial Impact:</span>
                            <span>{insight.financialImpact}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-600">Governance Impact:</span>
                            <span>{insight.governanceImpact}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Cross-Domain Actions
                </h2>
                <div className="space-y-4">
                  {portfolioInsights.crossDomainInsights
                    .filter(insight => insight.priority <= 2)
                    .map((insight, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <h4 className="font-semibold text-sm mb-2">{insight.title}</h4>
                          <ul className="space-y-2">
                            {insight.recommendations.slice(0, 3).map((rec, recIndex) => (
                              <li key={recIndex} className="flex items-start space-x-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Financial Insights
                </h2>
                <div className="space-y-4">
                  {portfolioInsights.financialInsights.map((insight, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                              <DollarSign className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-sm">{insight.title}</CardTitle>
                              <CardDescription className="text-xs">
                                Confidence: {(insight.confidence * 100).toFixed(0)}%
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Top Performers
                </h2>
                <div className="space-y-4">
                  {portfolioInsights.topPerformers.map((useCaseId, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-green-600">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">Use Case {useCaseId.slice(0, 8)}...</p>
                            <p className="text-xs text-gray-500">High Performance</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Governance Insights
                </h2>
                <div className="space-y-4">
                  {portfolioInsights.governanceInsights.map((insight, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                              <Shield className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-sm">{insight.title}</CardTitle>
                              <CardDescription className="text-xs">
                                Confidence: {(insight.confidence * 100).toFixed(0)}%
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                  Compliance Gaps
                </h2>
                <div className="space-y-4">
                  {portfolioInsights.complianceGaps.map((gap, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{gap}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Detailed Cross-Domain Insight View */}
        {selectedInsight && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  {getInsightIcon(selectedInsight.category)}
                  <span className="ml-2">{selectedInsight.title}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedInsight(null)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-700 mb-4">{selectedInsight.description}</p>
                  
                  <h4 className="font-semibold mb-2">Impact Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                      <span className="text-sm font-medium text-blue-700">Financial Impact:</span>
                      <span className="text-sm text-blue-900">{selectedInsight.financialImpact}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium text-green-700">Governance Impact:</span>
                      <span className="text-sm text-green-900">{selectedInsight.governanceImpact}</span>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold mb-2 mt-4">Recommendations</h4>
                  <ul className="space-y-2">
                    {selectedInsight.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Insight Details</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Category:</span>
                      <Badge className={getInsightColor(selectedInsight.category)}>
                        {selectedInsight.category.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Impact:</span>
                      <Badge className={getImpactColor(selectedInsight.impact)}>
                        {selectedInsight.impact.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Confidence:</span>
                      <span className="text-sm font-semibold">
                        {(selectedInsight.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Priority:</span>
                      <span className="text-sm font-semibold">{selectedInsight.priority}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-sm mb-2 text-gray-700">Why This Matters</h5>
                    <p className="text-sm text-gray-600">
                      This insight spans both financial and governance domains, requiring coordinated action 
                      across teams to address the underlying issues and capitalize on opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
