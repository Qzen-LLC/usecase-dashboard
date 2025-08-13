'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  Target,
  Lightbulb,
  BarChart3,
  RefreshCw,
  Eye,
  Zap
} from 'lucide-react';
import { FinancialInsight, FinancialAnalysis } from '@/lib/ai-agents/financial-agent';

interface AIInsightsProps {
  useCaseId?: string;
}

export default function AIInsightsPage({ useCaseId }: AIInsightsProps) {
  const [analysis, setAnalysis] = useState<FinancialAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<FinancialInsight | null>(null);
  const [portfolioMode, setPortfolioMode] = useState(!useCaseId);

  useEffect(() => {
    if (useCaseId) {
      fetchUseCaseAnalysis(useCaseId);
    } else {
      fetchPortfolioAnalysis();
    }
  }, [useCaseId]);

  const fetchUseCaseAnalysis = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ai-agents/financial-analysis?useCaseId=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-agents/financial-analysis?portfolio=true');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio analysis');
      }
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (useCaseId) {
      fetchUseCaseAnalysis(useCaseId);
    } else {
      fetchPortfolioAnalysis();
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'cost_optimization':
        return <DollarSign className="h-5 w-5" />;
      case 'roi_improvement':
        return <TrendingUp className="h-5 w-5" />;
      case 'risk_alert':
        return <AlertTriangle className="h-5 w-5" />;
      case 'opportunity':
        return <Target className="h-5 w-5" />;
      case 'trend_analysis':
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'cost_optimization':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'roi_improvement':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'risk_alert':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'opportunity':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'trend_analysis':
        return 'bg-orange-100 text-orange-800 border-orange-200';
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
          <p className="text-gray-600">Analyzing financial data with AI...</p>
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

  if (!analysis) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No analysis data available</p>
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
              <h1 className="text-3xl font-bold text-gray-900">
                {portfolioMode ? 'Portfolio AI Insights' : 'AI Financial Analysis'}
              </h1>
              <p className="text-gray-600 mt-2">
                Intelligent analysis and recommendations powered by AI
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Risk Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{analysis.riskScore.toFixed(0)}%</div>
              <Progress value={analysis.riskScore} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">
                {analysis.riskScore > 70 ? 'High Risk' : analysis.riskScore > 40 ? 'Medium Risk' : 'Low Risk'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Opportunity Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analysis.opportunityScore.toFixed(0)}%</div>
              <Progress value={analysis.opportunityScore} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">
                {analysis.opportunityScore > 70 ? 'High Opportunity' : analysis.opportunityScore > 40 ? 'Medium Opportunity' : 'Low Opportunity'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Cost Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analysis.costOptimizationPotential.toFixed(0)}%</div>
              <Progress value={analysis.costOptimizationPotential} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">Potential Savings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{analysis.insights.length}</div>
              <p className="text-xs text-gray-500 mt-1">AI Generated</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-600" />
              AI Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{analysis.summary}</p>
          </CardContent>
        </Card>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
              AI Insights
            </h2>
            <div className="space-y-4">
              {analysis.insights.map((insight, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedInsight?.id === insight.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedInsight(insight)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                          {getInsightIcon(insight.type)}
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
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Priority: {insight.priority}</span>
                      <span>Type: {insight.type.replace('_', ' ')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-600" />
              Recommendations
            </h2>
            <div className="space-y-4">
              {analysis.recommendations.map((recommendation, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Insight View */}
        {selectedInsight && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  {getInsightIcon(selectedInsight.type)}
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
                  
                  <h4 className="font-semibold mb-2">Recommendations</h4>
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
                  <h4 className="font-semibold mb-2">Metrics</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedInsight.metrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-sm font-semibold">
                          {typeof value === 'number' ? value.toFixed(2) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 space-y-3">
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
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
