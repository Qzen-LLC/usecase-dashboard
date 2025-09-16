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
  FlaskConical,
  Sparkles,
  Settings2,
  Bot
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
  const [progress, setProgress] = useState(0);
  const [evaluationConfig, setEvaluationConfig] = useState<any>(null);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());
  const [useAIGeneration, setUseAIGeneration] = useState(true); // Default to AI generation
  const [generationStrategy, setGenerationStrategy] = useState<'comprehensive' | 'targeted' | 'rapid'>('comprehensive');
  const [testIntensity, setTestIntensity] = useState<'light' | 'standard' | 'thorough'>('standard');
  const [useOrchestrator, setUseOrchestrator] = useState(false); // Use multi-agent orchestrator
  // Always use real AI - no mock mode
  // No longer check for existing evaluations - always start fresh with AI generation
  // The old evaluation system has been deprecated in favor of LLM-powered generation
  // Old evaluation loading removed - always generate fresh with AI

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
    console.log('🎯 Starting generateEvaluations...');
    console.log('🎯 guardrailsConfig present?', !!guardrailsConfig);
    console.log('🎯 guardrailsConfig value:', guardrailsConfig);
    
    // Temporarily bypass the guardrails check - we'll fetch them on the backend
    // if (!guardrailsConfig) {
    //   alert('⚠️ Guardrails Required\n\nPlease generate guardrails first before running evaluations.\n\nEvaluations require guardrails to define what should be tested.');
    //   return;
    // }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Choose API endpoint based on generation mode
      const apiEndpoint = useAIGeneration ? '/api/evaluations/generate-v2' : '/api/evaluations/generate';
      
      console.log('🔍 Use Case ID:', useCaseId);
      console.log('🔍 Guardrails config:', guardrailsConfig);
      console.log('🔍 Guardrails ID:', guardrailsConfig?.id);
      
      const requestBody = useAIGeneration ? {
        useCaseId,
        guardrailsId: guardrailsConfig?.id || null,
        generationStrategy,
        testIntensity,
        useOrchestrator
      } : {
        useCaseId,
        guardrailsConfig,
        assessmentData
      };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('API Error:', errorData);
        console.error('Response status:', response.status);
        console.error('Response statusText:', response.statusText);
        
        // Show specific error message based on error type
        if (errorData.error === 'GUARDRAILS_REQUIRED') {
          alert('⚠️ Guardrails Required\n\nPlease generate guardrails first on the AI Guardrails tab before creating evaluations.');
        } else if (errorData.error === 'LLM_CONFIGURATION_ERROR') {
          alert('⚠️ LLM Configuration Required\n\nOpenAI API key is not configured. Please check your environment configuration.');
        } else {
          alert(`⚠️ Generation Failed\n\n${errorData.message || errorData.details || 'Failed to generate evaluations. Please try again.'}`);
        }
        throw new Error(errorData.message || errorData.details || 'Failed to generate evaluations');
      }
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle response based on API version
        const evalConfig = useAIGeneration ? data.evaluationConfig : data;
        
        setEvaluationConfig(evalConfig);
        setTestSuites(evalConfig.testSuites.map((suite: any) => ({
          ...suite,
          scenarioCount: suite.scenarios.length,
          scenarios: suite.scenarios,
          coverage: suite.coverage?.percentage || 0,
          status: 'pending'
        })));
        
        // Show summary for AI generation
        if (useAIGeneration && data.summary) {
          console.log('✨ AI Generation Summary:', data.summary);
        }
        // Persist generated evaluation (pending status) and capture evaluationId
        try {
          const saveResp = await fetch('/api/evaluations/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ useCaseId, evaluationConfig: evalConfig })
          });
          if (saveResp.ok) {
            const saveData = await saveResp.json();
            if (saveData?.evaluationId) {
              setEvaluationConfig((prev: any) => ({ ...(prev || evalConfig), id: saveData.evaluationId }));
            }
          }
        } catch (err) {
          console.error('Failed to persist generated evaluation config:', err);
        }
      }
    } catch (error) {
      console.error('Error generating evaluations:', error);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  // Removed runEvaluations function - we only generate test scenarios, not execute them
  /*
  const runEvaluations = async () => {
    if (!evaluationConfig) {
      alert('⚠️ Evaluation Config Required\n\nPlease generate evaluations first before running them.\n\nThis will create test suites based on your guardrails.');
      return;
    }

    // Alert user about evaluation run
    const confirmed = confirm('🚀 Run Evaluations?\n\nThis will execute all test suites against your AI system.\n\nThis process may take several minutes and will consume API credits.\n\nDo you want to continue?');
    if (!confirmed) {
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
            name: 'production',
            type: 'production',
            configuration: {
              mockResponses: false,
              deterministicMode: false,
              realData: true,
              aiAgentsEnabled: true
            }
          }
        })
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Failed to run evaluations');
      }

      const executionResult = await response.json();
      
      console.log('🔍 Evaluation execution result:', executionResult);
      console.log('   Test results:', executionResult.testResults);
      console.log('   Scores:', executionResult.scores);
      console.log('   Dimension scores:', executionResult.scores?.dimensionScores);
      console.log('   Overall score:', executionResult.scores?.overallScore);
      console.log('   Recommendations:', executionResult.recommendations);
      
      // Update test suites based on real results
      const testResultsBySuite = new Map<string, any[]>();
      executionResult.testResults.forEach((result: any) => {
        const suiteId = result.testId || result.suiteId; // Handle both testId and suiteId
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
      const dimensionResults: EvaluationResult[] = Object.entries(executionResult.scores.dimensionScores || {})
        .map(([dimension, scoreData]: [string, any]) => ({
          dimension: dimension.charAt(0).toUpperCase() + dimension.slice(1),
          score: Math.round(scoreData.normalizedScore || scoreData.value || 0),
          grade: scoreData.grade || getGradeFromScore(scoreData.normalizedScore || scoreData.value || 0),
          trend: 'stable' // Could be enhanced with historical data
        }));
      
      console.log('📊 Processed dimension results:', dimensionResults);
      console.log('📊 Overall score:', executionResult.scores.overallScore?.value || 0);
      
      setResults(dimensionResults);
      setOverallScore(executionResult.scores.overallScore?.value || 0);
      
      // Set recommendations from actual evaluation
      if (executionResult.recommendations && executionResult.recommendations.length > 0) {
        setRecommendations(executionResult.recommendations.map((rec: any) => 
          typeof rec === 'string' ? rec : rec.description || rec.text
        ));
      } else {
        // Generate basic recommendations based on scores
        const recs = [];
        const dimensionScores = executionResult.scores.dimensionScores || {};
        
        if (dimensionScores.Safety?.normalizedScore < 90) {
          recs.push('Strengthen safety measures and content filtering');
        }
        if (dimensionScores.Performance?.normalizedScore < 80) {
          recs.push('Optimize model performance and response times');
        }
        if (dimensionScores.Compliance?.normalizedScore < 95) {
          recs.push('Review and enhance compliance controls');
        }
        if (dimensionScores.Ethics?.normalizedScore < 85) {
          recs.push('Implement additional ethical safeguards');
        }
        if (dimensionScores['Cost Efficiency']?.normalizedScore < 70) {
          recs.push('Optimize resource usage for cost efficiency');
        }
        setRecommendations(recs.length > 0 ? recs : ['System meets all evaluation criteria']);
      }
      
      setProgress(100);

      // Persist completed evaluation results
      try {
        console.log('💾 Saving evaluation results to database...');
        console.log('   Overall score:', executionResult.scores?.overallScore?.value);
        console.log('   Dimension scores:', executionResult.scores?.dimensionScores);
        console.log('   Recommendations:', executionResult.recommendations);
        
        await fetch('/api/evaluations/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            useCaseId,
            evaluationConfig: { ...(evaluationConfig || {}), id: (evaluationConfig && evaluationConfig.id) || executionResult.evaluationId },
            evaluationResult: {
              results: executionResult.testResults,
              scores: executionResult.scores,
              recommendations: executionResult.recommendations
            }
          })
        });
        console.log('✅ Evaluation results saved successfully');
      } catch (err) {
        console.error('❌ Failed to save evaluation results:', err);
      }
      
    } catch (error) {
      console.error('Error running evaluations:', error);
      alert('Failed to run evaluations. Please check the console for details.');
      // Reset suite statuses on error
      setTestSuites(prev => prev.map(s => ({ ...s, status: 'failed' })));
    } finally {
      setIsRunning(false);
    }
  };
  */

  const getGradeFromScore = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const exportResults = async () => {
    if (!evaluationConfig) {
      alert('No test scenarios to export. Please generate evaluations first.');
      return;
    }

    try {
      // Export test scenarios configuration
      const exportData = {
        useCaseId,
        generatedAt: evaluationConfig.createdAt || new Date().toISOString(),
        generationMethod: useAIGeneration ? 'AI-Powered (LLM)' : 'Template-Based',
        strategy: useAIGeneration ? generationStrategy : 'static',
        intensity: useAIGeneration ? testIntensity : 'standard',
        testSuites: testSuites.map(suite => ({
          id: suite.id,
          name: suite.name,
          type: suite.type,
          priority: suite.priority,
          scenarioCount: suite.scenarioCount,
          coverage: suite.coverage,
          scenarios: suite.scenarios
        })),
        totalScenarios: testSuites.reduce((sum, suite) => sum + (suite.scenarioCount || 0), 0),
        metadata: evaluationConfig.metadata || {},
        evaluationCriteria: evaluationConfig.evaluationCriteria || {},
        scoringFramework: evaluationConfig.scoringFramework || {}
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluation-scenarios-${useCaseId}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      console.log('✅ Exported test scenarios successfully');
    } catch (error) {
      console.error('Error exporting test scenarios:', error);
      alert('Failed to export test scenarios');
    }
  };

  // Old export function - commented out
  /*
  const exportResultsOld = async () => {
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
  */

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
                    {useAIGeneration ? (
                      <Sparkles className="mr-2 h-4 w-4" />
                    ) : (
                      <PlayCircle className="mr-2 h-4 w-4" />
                    )}
                    {useAIGeneration ? 'Generate with AI' : 'Generate Evaluations'}
                  </>
                )}
              </Button>
            )}
            {evaluationConfig && (
              <Button
                onClick={exportResults}
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Test Scenarios
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Banner removed - no longer showing old evaluation data */}
        
        {/* Old evaluation system removed - always use new AI generation */}
        
        {/* AI Generation Settings */}
        {!evaluationConfig && (
          <div className="mb-6 p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold">AI-Powered Test Generation</h3>
                <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <Bot className="h-3 w-3 mr-1" />
                  LLM Enhanced
                </Badge>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAIGeneration}
                  onChange={(e) => setUseAIGeneration(e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative w-11 h-6 rounded-full transition-colors ${
                  useAIGeneration ? 'bg-purple-600' : 'bg-gray-300'
                }`}>
                  <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    useAIGeneration ? 'translate-x-5' : ''
                  }`} />
                </div>
                <span className="ml-2 text-sm font-medium">
                  {useAIGeneration ? 'AI Mode' : 'Static Mode'}
                </span>
              </label>
            </div>
            
            {useAIGeneration && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Generation Strategy</label>
                    <select
                      value={generationStrategy}
                      onChange={(e) => setGenerationStrategy(e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="comprehensive">Comprehensive</option>
                      <option value="targeted">Targeted</option>
                      <option value="rapid">Rapid</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Test Intensity</label>
                    <select
                      value={testIntensity}
                      onChange={(e) => setTestIntensity(e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="light">Light (5-10 tests)</option>
                      <option value="standard">Standard (10-15 tests)</option>
                      <option value="thorough">Thorough (15-20 tests)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Engine Mode</label>
                    <select
                      value={useOrchestrator ? 'orchestrator' : 'engine'}
                      onChange={(e) => setUseOrchestrator(e.target.value === 'orchestrator')}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="engine">Direct LLM</option>
                      <option value="orchestrator">Multi-Agent</option>
                    </select>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <Info className="h-3 w-3 inline mr-1" />
                  AI generation creates dynamic, context-aware test scenarios using GPT-4o. 
                  {useOrchestrator ? ' Multi-agent mode uses specialized agents for comprehensive coverage.' : ' Direct mode is faster but less comprehensive.'}
                </div>
              </div>
            )}
          </div>
        )}
        
        {isGenerating && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Generating evaluation suite...
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {evaluationConfig && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="suites">Test Suites</TabsTrigger>
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

              {/* Evaluation results will be shown after external execution */}
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
                              <div className="inline-flex items-center justify-center p-0 h-auto">
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </div>
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

            {/* Results tab removed - tests should be executed externally */}
            {false && (
              <TabsContent value="results" className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Tests should be executed externally using the generated test scenarios
                  </AlertDescription>
                </Alert>
              </TabsContent>
            )}

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
                    Generate evaluation suites to see AI-powered test recommendations
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