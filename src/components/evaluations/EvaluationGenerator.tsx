'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Download,
  RefreshCw,
  Activity,
  Shield,
  Zap,
  Users,
  TrendingUp,
  BarChart3,
  Info,
  ChevronDown,
  ChevronRight,
  FlaskConical
} from 'lucide-react';

interface EvaluationGeneratorProps {
  useCaseId: string;
  guardrailsConfig?: any;
  assessmentData?: any;
}

interface TestSuite {
  id: string;
  name: string;
  type: string;
  priority: string;
  scenarios: any[];
  scenarioCount?: number;
  coverage: number;
  status?: 'pending' | 'running' | 'passed' | 'failed';
}

interface EvaluationResult {
  dimension: string;
  score: number;
  grade: string;
  trend: 'improving' | 'stable' | 'degrading';
}

const EvaluationGenerator: React.FC<EvaluationGeneratorProps> = ({
  useCaseId,
  guardrailsConfig,
  assessmentData
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [evaluationConfig, setEvaluationConfig] = useState<any>(null);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());

  // Mock test suite icons
  const suiteIcons: Record<string, React.ReactNode> = {
    safety: <Shield className="h-4 w-4" />,
    performance: <Zap className="h-4 w-4" />,
    compliance: <FileText className="h-4 w-4" />,
    ethical: <Users className="h-4 w-4" />,
    cost_efficiency: <TrendingUp className="h-4 w-4" />,
    drift_detection: <Activity className="h-4 w-4" />
  };

  const generateEvaluations = async () => {
    if (!guardrailsConfig) {
      alert('Please generate guardrails first');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/evaluations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          useCaseId,
          guardrailsConfig,
          assessmentData
        })
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        const data = await response.json();
        setEvaluationConfig(data);
        setTestSuites(data.testSuites.map((suite: any) => ({
          ...suite,
          scenarioCount: suite.scenarios.length,
          scenarios: suite.scenarios,
          coverage: suite.coverage.percentage,
          status: 'pending'
        })));
      }
    } catch (error) {
      console.error('Error generating evaluations:', error);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const runEvaluations = async () => {
    if (!evaluationConfig) {
      alert('Please generate evaluations first');
      return;
    }

    setIsRunning(true);
    setProgress(0);

    try {
      // Update all suites to running status
      setTestSuites(prev => prev.map(s => ({ ...s, status: 'running' })));
      
      // Start progress tracking
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 1000);
      
      // Call the real evaluation runner API
      const response = await fetch('/api/evaluations/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationConfig,
          environment: {
            name: 'synthetic',
            type: 'synthetic',
            configuration: {
              mockResponses: true,
              deterministicMode: true
            }
          }
        })
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Failed to run evaluations');
      }

      const executionResult = await response.json();
      
      // Update test suites based on real results
      const testResultsBySuite = new Map<string, any[]>();
      executionResult.testResults.forEach((result: any) => {
        const suiteId = result.suiteId;
        if (!testResultsBySuite.has(suiteId)) {
          testResultsBySuite.set(suiteId, []);
        }
        testResultsBySuite.get(suiteId)?.push(result);
      });

      // Update suite statuses based on actual test results
      setTestSuites(prev => prev.map(suite => {
        const suiteResults = testResultsBySuite.get(suite.id) || [];
        const failed = suiteResults.some(r => r.status === 'failed');
        const allPassed = suiteResults.length > 0 && suiteResults.every(r => r.status === 'passed');
        
        return {
          ...suite,
          status: failed ? 'failed' : allPassed ? 'passed' : 'pending'
        };
      }));
      
      // Convert scores to evaluation results format
      const dimensionResults: EvaluationResult[] = Object.entries(executionResult.scores)
        .filter(([key]) => key !== 'overallScore')
        .map(([dimension, scoreData]: [string, any]) => ({
          dimension: dimension.charAt(0).toUpperCase() + dimension.slice(1),
          score: Math.round(scoreData.value * 100),
          grade: scoreData.grade || getGradeFromScore(scoreData.value * 100),
          trend: 'stable' // Could be enhanced with historical data
        }));
      
      setResults(dimensionResults);
      setOverallScore(executionResult.scores.overallScore.value * 100);
      
      // Set recommendations from actual evaluation
      if (executionResult.recommendations && executionResult.recommendations.length > 0) {
        setRecommendations(executionResult.recommendations.map((rec: any) => 
          typeof rec === 'string' ? rec : rec.description || rec.text
        ));
      } else {
        // Generate basic recommendations based on scores
        const recs = [];
        if (executionResult.scores.safety?.value < 0.9) {
          recs.push('Strengthen safety measures and content filtering');
        }
        if (executionResult.scores.performance?.value < 0.8) {
          recs.push('Optimize model performance and response times');
        }
        if (executionResult.scores.compliance?.value < 0.95) {
          recs.push('Review and enhance compliance controls');
        }
        if (executionResult.scores.ethics?.value < 0.85) {
          recs.push('Implement additional ethical safeguards');
        }
        if (executionResult.scores.cost?.value < 0.7) {
          recs.push('Optimize resource usage for cost efficiency');
        }
        setRecommendations(recs.length > 0 ? recs : ['System meets all evaluation criteria']);
      }
      
      setProgress(100);
      
    } catch (error) {
      console.error('Error running evaluations:', error);
      alert('Failed to run evaluations. Please check the console for details.');
      // Reset suite statuses on error
      setTestSuites(prev => prev.map(s => ({ ...s, status: 'failed' })));
    } finally {
      setIsRunning(false);
    }
  };

  const getGradeFromScore = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const exportResults = async () => {
    if (!evaluationConfig || results.length === 0) {
      alert('No results to export');
      return;
    }

    try {
      // Call the export API to get properly formatted results
      const response = await fetch('/api/evaluations/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationConfig,
          results: {
            dimensions: results,
            overallScore,
            recommendations,
            testSuites
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to export results');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluation-results-${useCaseId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting results:', error);
      // Fallback to client-side export
      const exportData = {
        useCaseId,
        timestamp: new Date().toISOString(),
        config: evaluationConfig,
        results,
        overallScore,
        recommendations,
        testSuites
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluation-results-${useCaseId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      case 'F': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '↑';
      case 'degrading': return '↓';
      default: return '→';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const toggleSuiteExpansion = (suiteId: string) => {
    setExpandedSuites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(suiteId)) {
        newSet.delete(suiteId);
      } else {
        newSet.add(suiteId);
      }
      return newSet;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            AI System Evaluations
          </span>
          <div className="flex gap-2">
            {!evaluationConfig && (
              <Button
                onClick={generateEvaluations}
                disabled={isGenerating || !guardrailsConfig}
                variant="default"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Generate Evaluations
                  </>
                )}
              </Button>
            )}
            {evaluationConfig && !isRunning && results.length === 0 && (
              <Button
                onClick={runEvaluations}
                variant="default"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Run Evaluations
              </Button>
            )}
            {results.length > 0 && (
              <Button
                onClick={exportResults}
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Results
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {(isGenerating || isRunning) && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {isGenerating ? 'Generating evaluation suite...' : 'Running evaluations...'}
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {evaluationConfig && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="suites">Test Suites</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{testSuites.length}</div>
                    <p className="text-xs text-muted-foreground">Test Suites</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {testSuites.reduce((sum, s) => sum + (s.scenarioCount || s.scenarios.length), 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Test Scenarios</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {Math.round(testSuites.reduce((sum, s) => sum + s.coverage, 0) / testSuites.length)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Average Coverage</p>
                  </CardContent>
                </Card>
              </div>

              {results.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Overall Score</h3>
                      <div className="text-3xl font-bold">{Math.round(overallScore)}</div>
                    </div>
                    <Progress value={overallScore} className="h-3 mb-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Grade: <span className={`font-bold ${getGradeColor(overallScore >= 90 ? 'A' : overallScore >= 80 ? 'B' : 'C')}`}>
                        {overallScore >= 90 ? 'A' : overallScore >= 80 ? 'B' : 'C'}
                      </span></span>
                      <span>Recommendation: <span className="font-semibold text-green-600">Deploy</span></span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="suites" className="space-y-4">
              {testSuites.map((suite) => {
                const isExpanded = expandedSuites.has(suite.id);
                return (
                  <Card key={suite.id}>
                    <CardContent className="pt-6">
                      <Collapsible open={isExpanded} onOpenChange={() => toggleSuiteExpansion(suite.id)}>
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button variant="ghost" size="sm" className="p-0 h-auto">
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </Button>
                              {suiteIcons[suite.type] || <FileText className="h-4 w-4" />}
                              <div className="text-left">
                                <h4 className="font-semibold">{suite.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {suite.scenarioCount || suite.scenarios.length} scenarios • {Math.round(suite.coverage)}% coverage
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getPriorityColor(suite.priority)}>
                                {suite.priority}
                              </Badge>
                              {suite.status && (
                                <div className="flex items-center gap-1">
                                  {suite.status === 'passed' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                  {suite.status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                                  {suite.status === 'running' && <RefreshCw className="h-4 w-4 animate-spin" />}
                                  {suite.status === 'pending' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                                  <span className="text-sm capitalize">{suite.status}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-4">
                          <div className="space-y-3 pl-7">
                            {suite.scenarios && suite.scenarios.map((scenario: any, index: number) => (
                              <Card key={scenario.id || index} className="bg-muted/30">
                                <CardContent className="pt-4 pb-4">
                                  <div className="flex items-start gap-3">
                                    <FlaskConical className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div className="flex-1">
                                      <h5 className="font-medium text-sm">{scenario.name}</h5>
                                      <p className="text-xs text-muted-foreground mt-1">{scenario.description}</p>
                                      {scenario.guardrailId && (
                                        <Badge variant="outline" className="mt-2 text-xs">
                                          Tests Guardrail: {scenario.guardrailId}
                                        </Badge>
                                      )}
                                      {scenario.inputs && scenario.inputs.length > 0 && (
                                        <div className="mt-3">
                                          <p className="text-xs font-medium mb-1">Test Inputs:</p>
                                          <div className="space-y-1">
                                            {scenario.inputs.map((input: any, idx: number) => (
                                              <div key={idx} className="text-xs text-muted-foreground">
                                                • {input.type}: {typeof input.value === 'object' ? JSON.stringify(input.value) : input.value}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {scenario.assertions && scenario.assertions.length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-xs font-medium mb-1">Assertions:</p>
                                          <div className="space-y-1">
                                            {scenario.assertions.map((assertion: any, idx: number) => (
                                              <div key={idx} className="text-xs text-muted-foreground">
                                                • {assertion.type || 'Check'}: {assertion.description || assertion.condition || 'Validation'}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {results.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {results.map((result) => (
                      <Card key={result.dimension}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{result.dimension}</h4>
                            <div className="flex items-center gap-2">
                              <span className={`text-2xl font-bold ${getGradeColor(result.grade)}`}>
                                {result.grade}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {getTrendIcon(result.trend)}
                              </span>
                            </div>
                          </div>
                          <Progress value={result.score} className="h-2 mb-2" />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Score: {result.score}/100</span>
                            <span>Trend: {result.trend}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Run evaluations to see results
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <Alert key={index}>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>{rec}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Run evaluations to see recommendations
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!evaluationConfig && !isGenerating && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Generate evaluation suites from your guardrails to test your AI system comprehensively
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default EvaluationGenerator;