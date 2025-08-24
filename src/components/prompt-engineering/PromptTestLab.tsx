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

const PROVIDER_MODELS = {
  OPENAI: [
    { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo', costPer1k: { input: 0.01, output: 0.03 } },
    { value: 'gpt-4', label: 'GPT-4', costPer1k: { input: 0.03, output: 0.06 } },
    { value: 'gpt-4-32k', label: 'GPT-4 32K', costPer1k: { input: 0.06, output: 0.12 } },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', costPer1k: { input: 0.0005, output: 0.0015 } },
    { value: 'gpt-3.5-turbo-16k', label: 'GPT-3.5 Turbo 16K', costPer1k: { input: 0.001, output: 0.002 } },
  ],
  ANTHROPIC: [
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus', costPer1k: { input: 0.015, output: 0.075 } },
    { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet', costPer1k: { input: 0.003, output: 0.015 } },
    { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku', costPer1k: { input: 0.00025, output: 0.00125 } },
    { value: 'claude-2.1', label: 'Claude 2.1', costPer1k: { input: 0.008, output: 0.024 } },
  ],
  AZURE: [
    { value: 'gpt-4-turbo', label: 'Azure GPT-4 Turbo', costPer1k: { input: 0.01, output: 0.03 } },
    { value: 'gpt-35-turbo', label: 'Azure GPT-3.5 Turbo', costPer1k: { input: 0.0005, output: 0.0015 } },
  ],
  GEMINI: [
    { value: 'gemini-pro', label: 'Gemini Pro', costPer1k: { input: 0.00025, output: 0.0005 } },
    { value: 'gemini-pro-vision', label: 'Gemini Pro Vision', costPer1k: { input: 0.00025, output: 0.0005 } },
  ]
};

const DEFAULT_CONFIGS: TestConfiguration[] = [
  {
    id: 'config-1',
    provider: 'OPENAI',
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    enabled: true
  },
  {
    id: 'config-2',
    provider: 'OPENAI',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    enabled: true
  },
  {
    id: 'config-3',
    provider: 'ANTHROPIC',
    model: 'claude-3-sonnet-20240229',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    enabled: false
  }
];

export default function PromptTestLab({ prompt, onClose, onSaveResults }: PromptTestLabProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [configurations, setConfigurations] = useState<TestConfiguration[]>(DEFAULT_CONFIGS);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');

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
    const newConfig: TestConfiguration = {
      id: `config-${Date.now()}`,
      provider: 'OPENAI',
      model: 'gpt-3.5-turbo',
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
            service: config.provider,
            type: prompt.type,
            variables: variables,
          }),
        });

        const data = await response.json();
        const latencyMs = Date.now() - startTime;

        if (response.ok && data.response) {
          // Calculate tokens (estimate if not provided)
          const inputTokens = Math.ceil(JSON.stringify(interpolatedContent).length / 4);
          const outputTokens = Math.ceil(data.response.length / 4);
          const totalTokens = data.tokensUsed || (inputTokens + outputTokens);

          // Calculate cost based on model pricing
          const modelInfo = PROVIDER_MODELS[config.provider as keyof typeof PROVIDER_MODELS]
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
          throw new Error(data.error || 'Test failed');
        }
      } catch (error: any) {
        setResults(prev => prev.map((r, i) => 
          i === index ? { 
            ...r, 
            status: 'error' as const, 
            error: error.message 
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
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6" />
              Prompt Test Lab
            </h2>
            <p className="text-gray-600 mt-1">{prompt.name}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start px-6 pt-4">
              <TabsTrigger value="setup">
                <Settings2 className="w-4 h-4 mr-2" />
                Setup
              </TabsTrigger>
              <TabsTrigger value="results">
                <BarChart3 className="w-4 h-4 mr-2" />
                Results ({results.length})
              </TabsTrigger>
              <TabsTrigger value="comparison">
                <TrendingUp className="w-4 h-4 mr-2" />
                Comparison
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="setup" className="space-y-6">
                {/* Variables Input */}
                {prompt.variables && prompt.variables.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Variable className="w-5 h-5" />
                        Input Variables
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {prompt.variables.map((varName: string) => (
                        <div key={varName}>
                          <Label htmlFor={varName}>{varName}</Label>
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
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Test Configurations</CardTitle>
                      <Button size="sm" onClick={addConfiguration}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Configuration
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {configurations.map((config) => (
                      <Card key={config.id} className={!config.enabled ? 'opacity-50' : ''}>
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
                              <Label>Provider</Label>
                              <Select
                                value={config.provider}
                                onValueChange={(provider) => {
                                  updateConfiguration(config.id, { 
                                    provider,
                                    model: PROVIDER_MODELS[provider as keyof typeof PROVIDER_MODELS]?.[0]?.value || ''
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(PROVIDER_MODELS).map(provider => (
                                    <SelectItem key={provider} value={provider}>
                                      {provider}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Model</Label>
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
                                  {PROVIDER_MODELS[config.provider as keyof typeof PROVIDER_MODELS]?.map(model => (
                                    <SelectItem key={model.value} value={model.value}>
                                      {model.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Temperature: {config.temperature}</Label>
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
                              <Label>Max Tokens: {config.maxTokens}</Label>
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
                              <Label>Top P: {config.topP}</Label>
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
                              <Label>Frequency Penalty: {config.frequencyPenalty}</Label>
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
                    ))}
                  </CardContent>
                </Card>

                {/* Run Button */}
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={runTests}
                    disabled={isRunning || configurations.filter(c => c.enabled).length === 0}
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
                  <Card className="p-12 text-center">
                    <p className="text-gray-500">No test results yet. Configure and run tests to see results.</p>
                  </Card>
                ) : (
                  results.map((result) => (
                    <Card key={result.configId}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                              {result.status === 'running' && <Loader2 className="w-5 h-5 animate-spin" />}
                              {result.status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                              {result.provider} - {result.model}
                            </CardTitle>
                            <div className="flex gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Activity className="w-4 h-4" />
                                {result.totalTokens} tokens
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
                          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                            <pre className="text-sm whitespace-pre-wrap">
                              {result.response}
                            </pre>
                          </div>
                        )}
                        {result.status === 'error' && (
                          <div className="text-red-600 text-sm">
                            Error: {result.error}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="comparison">
                {results.filter(r => r.status === 'success').length < 2 ? (
                  <Card className="p-12 text-center">
                    <p className="text-gray-500">Run at least 2 successful tests to see comparison.</p>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Performance Comparison */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Comparison</CardTitle>
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
                                        {result.totalTokens} tokens
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-500"
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
                    <Card>
                      <CardHeader>
                        <CardTitle>Cost Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {results
                            .filter(r => r.status === 'success')
                            .map((result) => (
                              <div key={result.configId} className="text-center">
                                <div className="text-sm text-gray-600">{result.model}</div>
                                <div className="text-2xl font-bold">${result.cost.toFixed(4)}</div>
                                <div className="text-xs text-gray-500">
                                  ${((result.cost / result.totalTokens) * 1000).toFixed(4)}/1k tokens
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Best Result */}
                    {getBestResult() && (
                      <Card className="border-green-500">
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
                            <p className="text-sm text-gray-600">
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