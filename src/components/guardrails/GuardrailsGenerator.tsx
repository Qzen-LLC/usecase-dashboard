'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Brain, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Download,
  RefreshCw,
  ChevronRight,
  Info,
  Lock,
  Eye,
  Zap,
  DollarSign,
  Users,
  TrendingUp,
  FileText,
  Settings
} from 'lucide-react';

interface Props {
  useCaseId: string;
  assessmentData: any;
  useCase?: any;  // Complete use case object - NEW!
  onComplete?: () => void;
  onGuardrailsGenerated?: (guardrails: any) => void;
}

export default function GuardrailsGenerator({ useCaseId, assessmentData, useCase, onComplete, onGuardrailsGenerated }: Props) {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [guardrails, setGuardrails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [progress, setProgress] = useState(0);
  const [agentStatus, setAgentStatus] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Load existing guardrails on mount
  useEffect(() => {
    const loadExistingGuardrails = async () => {
      try {
        const response = await fetch(`/api/guardrails/get?useCaseId=${useCaseId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.guardrails) {
            setGuardrails(data.guardrails);
            // Also notify parent component
            if (onGuardrailsGenerated) {
              onGuardrailsGenerated(data.guardrails);
            }
          }
        }
      } catch (error) {
        console.error('Error loading existing guardrails:', error);
      }
    };

    if (useCaseId) {
      loadExistingGuardrails();
    }
  }, [useCaseId]);

  const specialists = [
    { id: 'risk', name: 'Risk Analyst', icon: AlertTriangle, color: 'text-red-500' },
    { id: 'compliance', name: 'Compliance Expert', icon: Shield, color: 'text-blue-500' },
    { id: 'ethics', name: 'Ethics Advisor', icon: Users, color: 'text-purple-500' },
    { id: 'security', name: 'Security Architect', icon: Lock, color: 'text-green-500' },
    { id: 'business', name: 'Business Strategist', icon: TrendingUp, color: 'text-orange-500' },
    { id: 'technical', name: 'Technical Optimizer', icon: Zap, color: 'text-yellow-500' }
  ];

  const handleGenerateGuardrails = async () => {
    setGenerating(true);
    setError(null);
    setProgress(0);

    try {
      // Initialize agent statuses
      specialists.forEach(agent => {
        setAgentStatus(prev => ({ ...prev, [agent.id]: 'analyzing' }));
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Call API to generate guardrails with COMPLETE context
      const response = await fetch('/api/guardrails/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          useCaseId,
          assessmentData,
          useCase  // Pass complete use case object
        })
      });

      clearInterval(progressInterval);

      const result = await response.json();
      
      // Check if LLM configuration is required
      if (!response.ok || result.error === 'LLM_CONFIGURATION_REQUIRED') {
        setGenerating(false);
        setError(result.message || 'Failed to generate guardrails');
        if (result.instructions) {
          setError(`${result.message}\n\n${result.instructions}`);
        }
        return;
      }
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate guardrails');
      }
      
      // Update agent statuses to complete
      specialists.forEach(agent => {
        setAgentStatus(prev => ({ ...prev, [agent.id]: 'complete' }));
      });

      setProgress(100);
      setGuardrails(result);
      
      // Notify parent component about generated guardrails
      if (onGuardrailsGenerated) {
        onGuardrailsGenerated(result);
      }
      
      // Save guardrails
      await fetch('/api/guardrails/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          useCaseId,
          guardrails: result
        })
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      specialists.forEach(agent => {
        setAgentStatus(prev => ({ ...prev, [agent.id]: 'error' }));
      });
    } finally {
      setGenerating(false);
    }
  };

  const exportGuardrails = async (format: 'json' | 'yaml') => {
    try {
      const response = await fetch(`/api/guardrails/export?useCaseId=${useCaseId}&format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guardrails-${useCaseId}.${format}`;
      a.click();
    } catch (err) {
      setError('Failed to export guardrails');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getAgentStatusIcon = (status: string) => {
    switch (status) {
      case 'analyzing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">AI Guardrails Configuration</h2>
            <p className="text-muted-foreground">
              Intelligent, context-aware guardrails generated by our multi-agent reasoning system
            </p>
          </div>
          <Brain className="w-12 h-12 text-purple-500" />
        </div>
      </div>

      {/* Agent Status Panel */}
      {generating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Agent Analysis in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {specialists.map(agent => (
                  <div key={agent.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <agent.icon className={`w-5 h-5 ${agent.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {agentStatus[agent.id] || 'waiting'}
                      </p>
                    </div>
                    {getAgentStatusIcon(agentStatus[agent.id])}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Generate Button */}
      {!guardrails && !generating && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Shield className="w-16 h-16 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">Generate AI Guardrails</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our agentic system will analyze your use case from multiple perspectives to create 
                comprehensive, context-aware guardrails that balance safety with innovation.
              </p>
              <Button 
                onClick={handleGenerateGuardrails} 
                size="lg"
                className="gap-2"
              >
                <Brain className="w-5 h-5" />
                Generate Guardrails
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guardrails Display */}
      {guardrails && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Guardrails</p>
                    <p className="text-2xl font-bold">
                      {guardrails.guardrails?.rules ? 
                        Object.values(guardrails.guardrails.rules).flat().length : 0}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Critical Rules</p>
                    <p className="text-2xl font-bold text-red-500">
                      {guardrails.guardrails?.rules?.critical?.length || 0}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="text-2xl font-bold">
                      {Math.round((guardrails.confidence?.overall || 0) * 100)}%
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Agents Used</p>
                    <p className="text-2xl font-bold">
                      {guardrails.metadata?.agents?.length || 6}
                    </p>
                  </div>
                  <Brain className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guardrails Tabs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Guardrails</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportGuardrails('json')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportGuardrails('yaml')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export YAML
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-6 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="critical">Critical</TabsTrigger>
                  <TabsTrigger value="operational">Operational</TabsTrigger>
                  <TabsTrigger value="ethical">Ethical</TabsTrigger>
                  <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                  <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="prose dark:prose-invert max-w-none">
                    <h3>Guardrails Overview</h3>
                    <p>
                      Based on comprehensive analysis of your use case, we've generated {' '}
                      {Object.values(guardrails.guardrails?.rules || {}).flat().length} guardrails
                      across multiple categories to ensure safe and effective AI deployment.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {Object.entries(guardrails.guardrails?.rules || {}).map(([category, rules]: [string, any]) => (
                        <div key={category} className="border rounded-lg p-4">
                          <h4 className="font-semibold capitalize mb-2">{category} Guardrails</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {Array.isArray(rules) ? rules.length : 0} rules configured
                          </p>
                          <div className="space-y-2">
                            {Array.isArray(rules) && rules.slice(0, 3).map((rule: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Badge className={getSeverityColor(rule.severity)}>
                                  {rule.severity}
                                </Badge>
                                <span className="text-sm truncate">{rule.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="critical" className="space-y-4">
                  <div className="space-y-4">
                    {guardrails.guardrails?.rules?.critical?.map((rule: any, idx: number) => (
                      <Card key={idx}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Shield className="w-5 h-5 text-red-500" />
                              {rule.rule}
                            </CardTitle>
                            <Badge className="bg-red-500">Critical</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4">{rule.description}</p>
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm font-medium mb-1">Rationale:</p>
                            <p className="text-sm text-muted-foreground">{rule.rationale}</p>
                          </div>
                          {rule.implementation?.monitoring && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">Monitoring:</p>
                              <div className="space-y-1">
                                {rule.implementation.monitoring.map((monitor: any, midx: number) => (
                                  <div key={midx} className="flex items-center gap-2 text-sm">
                                    <Eye className="w-4 h-4" />
                                    <span>{monitor.metric}: {monitor.threshold}</span>
                                    <Badge variant="outline">{monitor.frequency}</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="operational" className="space-y-4">
                  <div className="space-y-4">
                    {guardrails.guardrails?.rules?.operational?.map((rule: any, idx: number) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            {rule.rule}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{rule.description}</p>
                          {rule.implementation?.configuration && (
                            <div className="mt-4 p-3 bg-muted rounded-lg">
                              <pre className="text-xs overflow-x-auto">
                                {JSON.stringify(rule.implementation.configuration, null, 2)}
                              </pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="ethical" className="space-y-4">
                  <div className="space-y-4">
                    {guardrails.guardrails?.rules?.ethical?.map((rule: any, idx: number) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-500" />
                            {rule.rule}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{rule.description}</p>
                          <div className="mt-4">
                            <p className="text-sm font-medium">Rationale:</p>
                            <p className="text-sm text-muted-foreground">{rule.rationale}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="monitoring" className="space-y-4">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Monitoring Strategy</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {guardrails.guardrails?.monitoring?.map((monitor: any, idx: number) => (
                            <div key={idx} className="border-l-4 border-blue-500 pl-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{monitor.metric}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Threshold: {monitor.threshold} | Frequency: {monitor.frequency}
                                  </p>
                                </div>
                                <Badge variant="outline">
                                  {monitor.alerting?.channels?.join(', ')}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="reasoning" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Agent Reasoning & Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Agent Contributions */}
                        <div>
                          <h4 className="font-semibold mb-3">Agent Contributions</h4>
                          <div className="space-y-2">
                            {guardrails.reasoning?.agentContributions?.map((contribution: any, idx: number) => (
                              <div key={idx} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                <Brain className="w-5 h-5 text-purple-500 mt-0.5" />
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{contribution.agent}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {contribution.keyInsights?.join(', ')}
                                  </p>
                                </div>
                                <Badge variant="outline">
                                  {contribution.proposedRules} rules
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key Insights */}
                        {guardrails.reasoning?.insights && (
                          <div>
                            <h4 className="font-semibold mb-3">Key Insights</h4>
                            <ul className="space-y-2">
                              {guardrails.reasoning.insights.map((insight: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                                  <span className="text-sm">{insight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Tradeoffs */}
                        {guardrails.reasoning?.tradeoffs && (
                          <div>
                            <h4 className="font-semibold mb-3">Tradeoffs Made</h4>
                            <div className="space-y-2">
                              {guardrails.reasoning.tradeoffs.map((tradeoff: any, idx: number) => (
                                <div key={idx} className="p-3 border rounded-lg">
                                  <p className="text-sm font-medium">{tradeoff.decision}</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {tradeoff.rationale}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Uncertainties */}
                        {guardrails.confidence?.uncertainties && (
                          <div>
                            <h4 className="font-semibold mb-3">Areas of Uncertainty</h4>
                            <ul className="space-y-1">
                              {guardrails.confidence.uncertainties.map((uncertainty: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                                  <span className="text-sm text-muted-foreground">{uncertainty}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleGenerateGuardrails}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
            <Button onClick={onComplete}>
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}