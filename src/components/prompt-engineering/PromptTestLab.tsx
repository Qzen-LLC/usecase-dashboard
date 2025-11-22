'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserData } from '@/contexts/UserContext';
import { 
  PlayCircle,
  Loader2,
  AlertCircle,
  Copy,
  CheckCircle,
  Variable,
  Clock,
  Coins,
  Activity,
  Plus,
  X,
  BarChart3,
  Brain,
  Zap,
  TrendingUp,
  Settings2
} from 'lucide-react';

interface PromptTestLabProps {
  prompt: any;
  onClose: () => void;
  onSaveResults?: (results: any) => void;
}

interface TestConfiguration {
  id: string;
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  enabled: boolean;
}

interface TestResult {
  configId: string;
  provider: string;
  model: string;
  response: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  latencyMs: number;
  status: 'pending' | 'running' | 'success' | 'error';
  error?: string;
  timestamp: string;
}

interface ProviderModel {
  value: string;
  label: string;
  costPer1k: { input: number; output: number };
}

type ProviderModels = Record<string, ProviderModel[]>;

export default function PromptTestLab({ prompt, onClose, onSaveResults }: PromptTestLabProps) {
  const { userData } = useUserData();
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [providerModels, setProviderModels] = useState<ProviderModels>({});
  const [configurations, setConfigurations] = useState<TestConfiguration[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');
  const [modelsLoading, setModelsLoading] = useState(true);

  // Fetch AI models from API
  React.useEffect(() => {
    const fetchModels = async () => {
      try {
        setModelsLoading(true);
        const organizationId = userData?.organizationId || prompt?.organizationId;
        
        if (!organizationId) {
          console.log('[PromptTestLab] No organizationId available');
          setProviderModels({});
          setModelsLoading(false);
          return;
        }

        const res = await fetch(`/api/models?organizationId=${encodeURIComponent(organizationId)}`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!res.ok) {
          console.error('[PromptTestLab] Failed to fetch models:', res.status);
          setProviderModels({});
          setModelsLoading(false);
          return;
        }

        const data = await res.json();
        const models = data.models || [];

        // Transform models into PROVIDER_MODELS format
        const grouped: ProviderModels = {};
        models.forEach((model: { providerName: string; modelName: string }) => {
          const provider = model.providerName.toUpperCase();
          if (!grouped[provider]) {
            grouped[provider] = [];
          }
          // Default cost estimates (can be enhanced later with actual pricing data)
          const defaultCosts: Record<string, { input: number; output: number }> = {
            'OPENAI': { input: 0.01, output: 0.03 },
            'ANTHROPIC': { input: 0.003, output: 0.015 },
            'AZURE': { input: 0.01, output: 0.03 },
            'GEMINI': { input: 0.00025, output: 0.0005 },
          };
          const costPer1k = defaultCosts[provider] || { input: 0.01, output: 0.03 };
          
          grouped[provider].push({
            value: model.modelName,
            label: model.modelName,
            costPer1k
          });
        });

        setProviderModels(grouped);

        // Initialize configurations with first available models
        const initialConfigs: TestConfiguration[] = [];
        const providers = Object.keys(grouped);
        providers.slice(0, 3).forEach((provider, index) => {
          const models = grouped[provider];
          if (models.length > 0) {
            initialConfigs.push({
              id: `config-${index + 1}`,
              provider: provider,
              model: models[0].value,
              temperature: 0.7,
              maxTokens: 2000,
              topP: 1.0,
              frequencyPenalty: 0,
              presencePenalty: 0,
              enabled: index < 2
            });
          }
        });
        setConfigurations(initialConfigs.length > 0 ? initialConfigs : []);
      } catch (error) {
        console.error('[PromptTestLab] Error fetching models:', error);
        setProviderModels({});
      } finally {
        setModelsLoading(false);
      }
    };

    fetchModels();
  }, [userData?.organizationId, prompt?.organizationId]);

  // Load previously saved executions for this prompt
  React.useEffect(() => {
    const loadExistingRuns = async () => {
      try {
        if (!prompt?.id) {
          console.log('[PromptTestLab] No prompt ID, skipping load');
          return;
        }
        
        console.log('[PromptTestLab] Loading existing executions for prompt:', prompt.id);
        const res = await fetch(`/api/prompts/${prompt.id}/executions`, { 
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include' // Ensure cookies are sent
        });
        
        console.log('[PromptTestLab] GET response status:', res.status);
        
        if (!res.ok) {
          console.error('[PromptTestLab] GET request failed:', res.status, res.statusText);
          const errorText = await res.text();
          console.error('[PromptTestLab] Error response:', errorText);
          return;
        }
        
        const data = await res.json();
        console.log('[PromptTestLab] GET response data:', data);
        
        if (Array.isArray(data.executions)) {
          const mapped: TestResult[] = data.executions.map((e: any) => ({
            configId: `${e.provider}:${e.model}:${e.id}`,
            provider: e.provider,
            model: e.model,
            response: e.response || '',
            inputTokens: e.inputTokens ?? Math.ceil(JSON.stringify(e.requestContent || '').length / 4),
            outputTokens: e.outputTokens ?? Math.ceil(String(e.response || '').length / 4),
            totalTokens: e.totalTokens ?? (e.inputTokens ?? 0) + (e.outputTokens ?? 0),
            cost: e.cost ?? 0,
            latencyMs: e.latencyMs ?? 0,
            status: (e.status === 'success' || e.status === 'SUCCESS') ? 'success' : (e.status === 'error' ? 'error' : 'pending'),
            timestamp: e.timestamp || new Date().toISOString(),
          }));
          console.log('[PromptTestLab] Mapped results:', mapped);
          setResults(mapped);
        } else {
          console.log('[PromptTestLab] No executions array in response');
        }
      } catch (error) {                    
        console.error('[PromptTestLab] Error loading existing runs:', error);
      }
    };
    loadExistingRuns();
  }, [prompt?.id]);

  // Initialize variables from prompt
  React.useEffect(() => {
    if (prompt?.variables) {
      const initialVars: Record<string, string> = {};
      prompt.variables.forEach((v: string) => {
        initialVars[v] = '';
      });
      setVariables(initialVars);
    }
  }, [prompt]);

  const handleVariableChange = (varName: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [varName]: value
    }));
  };

  const addConfiguration = () => {
    // Get first available provider and model
    const providers = Object.keys(providerModels);
    const firstProvider = providers[0] || 'OPENAI';
    const firstModel = providerModels[firstProvider]?.[0]?.value || 'gpt-3.5-turbo';
    
    const newConfig: TestConfiguration = {
      id: `config-${Date.now()}`,
      provider: firstProvider,
      model: firstModel,
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1.0,
      frequencyPenalty: 0,
      presencePenalty: 0,
      enabled: true
    };
    setConfigurations([...configurations, newConfig]);
  };

  const updateConfiguration = (id: string, updates: Partial<TestConfiguration>) => {
    setConfigurations(configs => 
      configs.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  };

  const removeConfiguration = (id: string) => {
    setConfigurations(configs => configs.filter(c => c.id !== id));
  };

  const interpolateContent = (content: any, vars: Record<string, string>) => {
    let result = content;
    
    if (typeof content === 'string') {
      result = content;
      Object.entries(vars).forEach(([key, value]) => {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        result = result.replace(regex, value);
      });
    } else if (content?.prompt) {
      result = { ...content };
      result.prompt = interpolateContent(content.prompt, vars);
    } else if (content?.messages) {
      result = { ...content };
      result.messages = content.messages.map((msg: any) => ({
        ...msg,
        content: interpolateContent(msg.content, vars)
      }));
    }
    
    return result;
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setActiveTab('results');

    const enabledConfigs = configurations.filter(c => c.enabled);
    const interpolatedContent = interpolateContent(prompt.content, variables);

    // Initialize results with pending status
    const initialResults: TestResult[] = enabledConfigs.map(config => ({
      configId: config.id,
      provider: config.provider,
      model: config.model,
      response: '',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cost: 0,
      latencyMs: 0,
      status: 'pending' as const,
      timestamp: new Date().toISOString()
    }));
    setResults(initialResults);

    // Run tests in parallel
    const promises = enabledConfigs.map(async (config, index) => {
      // Update status to running
      setResults(prev => prev.map((r, i) => 
        i === index ? { ...r, status: 'running' as const } : r
      ));

      try {
        const startTime = Date.now();
        
        const response = await fetch('/api/prompts/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Ensure cookies are sent
          body: JSON.stringify({
            promptId: prompt.id,
            content: interpolatedContent,
            settings: {
              model: config.model,
              temperature: config.temperature,
              maxTokens: config.maxTokens,
              topP: config.topP,
              frequencyPenalty: config.frequencyPenalty,
              presencePenalty: config.presencePenalty,
            },
            providerName: config.provider,
            modelName: config.model,
            type: prompt.type,
            variables: variables,
          }),
        });

        const data = await response.json();
        const latencyMs = Date.now() - startTime;

        if (response.ok && data.response) {
          // Use API-provided token values, fallback to estimation if not available
          const inputTokens = data.inputTokens ?? Math.ceil(JSON.stringify(interpolatedContent).length / 4);
          const outputTokens = data.outputTokens ?? Math.ceil(data.response.length / 4);
          const totalTokens = data.tokensUsed ?? (inputTokens + outputTokens);

          // Calculate cost based on model pricing
          const modelInfo = providerModels[config.provider]
            ?.find(m => m.value === config.model);
          
          const cost = modelInfo 
            ? (inputTokens / 1000 * modelInfo.costPer1k.input) + 
              (outputTokens / 1000 * modelInfo.costPer1k.output)
            : data.cost || 0;

          const result: TestResult = {
            configId: config.id,
            provider: config.provider,
            model: config.model,
            response: data.response,
            inputTokens,
            outputTokens,
            totalTokens,
            cost,
            latencyMs: data.latencyMs || latencyMs,
            status: 'success',
            timestamp: new Date().toISOString()
          };

          setResults(prev => prev.map((r, i) => 
            i === index ? result : r
          ));
        } else {
          // Extract detailed error message from API response
          const errorMessage = data.error || 'Test failed';
          const errorDetails = data.details;
          let fullErrorMessage = errorMessage;
          
          if (errorDetails) {
            if (errorDetails.suggestion) {
              fullErrorMessage = `${errorMessage}\n\n${errorDetails.suggestion}`;
            }
            if (errorDetails.model && errorDetails.provider) {
              fullErrorMessage = `${fullErrorMessage}\n\nModel: ${errorDetails.model}, Provider: ${errorDetails.provider}`;
            }
          }
          
          throw new Error(fullErrorMessage);
        }
      } catch (error: any) {
        // Extract error message, handling both Error objects and strings
        const errorMessage = error.message || error.toString() || 'Unknown error occurred';
        
        setResults(prev => prev.map((r, i) => 
          i === index ? { 
            ...r, 
            status: 'error' as const, 
            error: errorMessage
          } : r
        ));
      }
    });

    await Promise.allSettled(promises);
    setIsRunning(false);

    // Save results if callback provided
    if (onSaveResults) {
      onSaveResults(results);
    }
  };

  const getBestResult = () => {
    const successResults = results.filter(r => r.status === 'success');
    if (successResults.length === 0) return null;

    // Find best by cost/performance ratio
    return successResults.reduce((best, current) => {
      const currentScore = current.cost / current.latencyMs;
      const bestScore = best.cost / best.latencyMs;
      return currentScore < bestScore ? current : best;
    });
  };

  const copyResult = (result: TestResult) => {
    navigator.clipboard.writeText(result.response);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-border">
        {/* Header */}
        <div className="border-b border-border p-6 flex justify-between items-center bg-card">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <Brain className="w-6 h-6" />
              Prompt Test Lab
            </h2>
            <p className="text-muted-foreground mt-1">{prompt.name}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-card">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start gap-2 px-6 py-3 bg-muted border-b border-border">
              <TabsTrigger value="setup" className="rounded-md px-4 py-2">
                <Settings2 className="w-4 h-4 mr-2" />
                Setup
              </TabsTrigger>
              <TabsTrigger value="results" className="rounded-md px-4 py-2">
                <BarChart3 className="w-4 h-4 mr-2" />
                Results ({results.length})
              </TabsTrigger>
              <TabsTrigger value="comparison" className="rounded-md px-4 py-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                Comparison
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="setup" className="space-y-6">
                {/* Variables Input */}
                {prompt.variables && prompt.variables.length > 0 && (
                  <Card className="bg-card border border-border">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                        <Variable className="w-5 h-5" />
                        Input Variables
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {prompt.variables.map((varName: string) => (
                        <div key={varName}>
                          <Label htmlFor={varName} className="text-foreground">{varName}</Label>
                          <Textarea
                            id={varName}
                            placeholder={`Enter value for {${varName}}`}
                            value={variables[varName] || ''}
                            onChange={(e) => handleVariableChange(varName, e.target.value)}
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Test Configurations */}
                <Card className="bg-card border border-border">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg text-foreground">Test Configurations</CardTitle>
                      <Button size="sm" onClick={addConfiguration} disabled={modelsLoading || Object.keys(providerModels).length === 0}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Configuration
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {modelsLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p>Loading available models...</p>
                      </div>
                    ) : Object.keys(providerModels).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                        <p>No AI models configured for your organization.</p>
                        <p className="text-sm mt-2">Please configure models in the Admin Dashboard.</p>
                      </div>
                    ) : (
                      configurations.map((config) => (
                      <Card key={config.id} className={`bg-card border border-border ${!config.enabled ? 'opacity-50' : ''}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <Switch
                                checked={config.enabled}
                                onCheckedChange={(enabled) => 
                                  updateConfiguration(config.id, { enabled })
                                }
                              />
                              <Badge>{config.provider}</Badge>
                              <Badge variant="outline">{config.model}</Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeConfiguration(config.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-foreground">Provider</Label>
                              <Select
                                value={config.provider}
                                onValueChange={(provider) => {
                                  updateConfiguration(config.id, { 
                                    provider,
                                    model: providerModels[provider]?.[0]?.value || ''
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(providerModels).map(provider => (
                                    <SelectItem key={provider} value={provider}>
                                      {provider}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-foreground">Model</Label>
                              <Select
                                value={config.model}
                                onValueChange={(model) => 
                                  updateConfiguration(config.id, { model })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {providerModels[config.provider]?.map(model => (
                                    <SelectItem key={model.value} value={model.value}>
                                      {model.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-foreground">Temperature: {config.temperature}</Label>
                              <Slider
                                value={[config.temperature]}
                                onValueChange={([temp]) => 
                                  updateConfiguration(config.id, { temperature: temp })
                                }
                                min={0}
                                max={2}
                                step={0.1}
                                className="mt-2"
                              />
                            </div>

                            <div>
                              <Label className="text-foreground">Max Tokens: {config.maxTokens}</Label>
                              <Slider
                                value={[config.maxTokens]}
                                onValueChange={([tokens]) => 
                                  updateConfiguration(config.id, { maxTokens: tokens })
                                }
                                min={100}
                                max={4000}
                                step={100}
                                className="mt-2"
                              />
                            </div>

                            <div>
                              <Label className="text-foreground">Top P: {config.topP}</Label>
                              <Slider
                                value={[config.topP]}
                                onValueChange={([topP]) => 
                                  updateConfiguration(config.id, { topP })
                                }
                                min={0}
                                max={1}
                                step={0.05}
                                className="mt-2"
                              />
                            </div>

                            <div>
                              <Label className="text-foreground">Frequency Penalty: {config.frequencyPenalty}</Label>
                              <Slider
                                value={[config.frequencyPenalty]}
                                onValueChange={([penalty]) => 
                                  updateConfiguration(config.id, { frequencyPenalty: penalty })
                                }
                                min={-2}
                                max={2}
                                step={0.1}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Run Button */}
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={runTests}
                    disabled={isRunning || modelsLoading || configurations.filter(c => c.enabled).length === 0 || Object.keys(providerModels).length === 0}
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Running {configurations.filter(c => c.enabled).length} Tests...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-5 h-5 mr-2" />
                        Run {configurations.filter(c => c.enabled).length} Tests
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                {results.length === 0 ? (
                  <Card className="p-12 text-center bg-card border border-border">
                    <p className="text-muted-foreground">No test results yet. Configure and run tests to see results.</p>
                  </Card>
                ) : (
                  results.map((result) => (
                    <Card key={result.configId} className="bg-card border border-border">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                              {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                              {result.status === 'running' && <Loader2 className="w-5 h-5 animate-spin" />}
                              {result.status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                              {result.provider} - {result.model}
                            </CardTitle>
                            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Activity className="w-4 h-4" />
                                {result.inputTokens} in / {result.outputTokens} out ({result.totalTokens} total)
                              </span>
                              <span className="flex items-center gap-1">
                                <Coins className="w-4 h-4" />
                                ${result.cost.toFixed(4)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {result.latencyMs}ms
                              </span>
                            </div>
                          </div>
                          {result.status === 'success' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyResult(result)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {result.status === 'success' && (
                          <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto">
                            <pre className="text-sm whitespace-pre-wrap">
                              {result.response}
                            </pre>
                          </div>
                        )}
                        {result.status === 'error' && (
                          <div className="text-red-600 text-sm space-y-1">
                            <div className="font-semibold">Error:</div>
                            <div className="whitespace-pre-wrap bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                              {result.error}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="comparison">
                {results.filter(r => r.status === 'success').length < 2 ? (
                  <Card className="p-12 text-center bg-card border border-border">
                    <p className="text-muted-foreground">Run at least 2 successful tests to see comparison.</p>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Performance Comparison */}
                    <Card className="bg-card border border-border">
                      <CardHeader>
                        <CardTitle className="text-foreground">Performance Comparison</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {results
                            .filter(r => r.status === 'success')
                            .sort((a, b) => a.latencyMs - b.latencyMs)
                            .map((result, index) => (
                              <div key={result.configId} className="flex items-center gap-4">
                                <div className="w-8 text-center font-bold">
                                  {index === 0 && <Badge className="bg-gold">🥇</Badge>}
                                  {index === 1 && <Badge className="bg-silver">🥈</Badge>}
                                  {index === 2 && <Badge className="bg-bronze">🥉</Badge>}
                                  {index > 2 && <span className="text-gray-500">{index + 1}</span>}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">
                                      {result.provider} - {result.model}
                                    </span>
                                    <div className="flex gap-6 text-sm">
                                      <span className="flex items-center gap-1">
                                        <Zap className="w-4 h-4 text-yellow-600" />
                                        {result.latencyMs}ms
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Coins className="w-4 h-4 text-green-600" />
                                        ${result.cost.toFixed(4)}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Activity className="w-4 h-4 text-blue-600" />
                                        {result.inputTokens} in / {result.outputTokens} out ({result.totalTokens} total)
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary"
                                      style={{ 
                                        width: `${(results.filter(r => r.status === 'success')[0].latencyMs / result.latencyMs) * 100}%` 
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Cost Analysis */}
                    <Card className="bg-card border border-border">
                      <CardHeader>
                        <CardTitle className="text-foreground">Cost Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {results
                            .filter(r => r.status === 'success')
                            .map((result) => (
                              <div key={result.configId} className="text-center">
                                <div className="text-sm text-muted-foreground">{result.model}</div>
                                <div className="text-2xl font-bold">${result.cost.toFixed(4)}</div>
                                <div className="text-xs text-muted-foreground">
                                  ${((result.cost / result.totalTokens) * 1000).toFixed(4)}/1k tokens
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Best Result */}
                    {getBestResult() && (
                      <Card className="border-green-500 bg-card border border-border">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Recommended Configuration
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p><strong>Model:</strong> {getBestResult()?.provider} - {getBestResult()?.model}</p>
                            <p><strong>Cost:</strong> ${getBestResult()?.cost.toFixed(4)}</p>
                            <p><strong>Speed:</strong> {getBestResult()?.latencyMs}ms</p>
                            <p className="text-sm text-muted-foreground">
                              Best cost/performance ratio based on your tests
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}