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
import { ScrollArea } from '@/components/ui/scroll-area';
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
  X,
  Brain,
  Zap,
  Settings2,
  Hash,
  FileText,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface PromptExecutionPanelProps {
  prompt: any;
  onClose: () => void;
  onExecutionComplete?: (result: any) => void;
}

interface ExecutionResult {
  id: string;
  promptId: string;
  promptName: string;
  versionId: string;
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
  settings: {
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  variables: Record<string, string>;
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

export default function PromptExecutionPanel({ prompt, onClose, onExecutionComplete }: PromptExecutionPanelProps) {
  const [activeTab, setActiveTab] = useState('configure');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [provider, setProvider] = useState('OPENAI');
  const [model, setModel] = useState('gpt-4-turbo-preview');
  const [settings, setSettings] = useState({
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    stream: false,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);

  // Initialize variables from prompt
  React.useEffect(() => {
    if (prompt?.variables) {
      const initialVars: Record<string, string> = {};
      prompt.variables.forEach((v: string) => {
        initialVars[v] = '';
      });
      setVariables(initialVars);
    }
    // Load execution history
    fetchExecutionHistory();
  }, [prompt]);

  const fetchExecutionHistory = async () => {
    try {
      const response = await fetch(`/api/prompts/${prompt.id}/executions`);
      if (response.ok) {
        const data = await response.json();
        setExecutionHistory(data.executions || []);
      }
    } catch (error) {
      console.error('Error fetching execution history:', error);
    }
  };

  const handleVariableChange = (varName: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [varName]: value
    }));
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

  const executePrompt = async () => {
    setIsRunning(true);
    setActiveTab('result');

    const interpolatedContent = interpolateContent(prompt.content, variables);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/prompts/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId: prompt.id,
          content: interpolatedContent,
          settings: {
            model,
            ...settings
          },
          service: provider,
          type: prompt.type,
          variables,
        }),
      });

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      if (response.ok && data.response) {
        // Calculate tokens (estimate if not provided)
        const inputTokens = data.inputTokens || Math.ceil(JSON.stringify(interpolatedContent).length / 4);
        const outputTokens = data.outputTokens || Math.ceil(data.response.length / 4);
        const totalTokens = data.tokensUsed || (inputTokens + outputTokens);

        // Calculate cost based on model pricing
        const modelInfo = PROVIDER_MODELS[provider as keyof typeof PROVIDER_MODELS]
          ?.find(m => m.value === model);
        
        const cost = modelInfo 
          ? (inputTokens / 1000 * modelInfo.costPer1k.input) + 
            (outputTokens / 1000 * modelInfo.costPer1k.output)
          : data.cost || 0;

        const executionResult: ExecutionResult = {
          id: data.executionId || `exec-${Date.now()}`,
          promptId: prompt.id,
          promptName: prompt.name,
          versionId: data.versionId || prompt.versionId || 'latest',
          provider,
          model,
          response: data.response,
          inputTokens,
          outputTokens,
          totalTokens,
          cost,
          latencyMs: data.latencyMs || latencyMs,
          status: 'success',
          timestamp: new Date().toISOString(),
          settings: {
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            topP: settings.topP,
            frequencyPenalty: settings.frequencyPenalty,
            presencePenalty: settings.presencePenalty,
          },
          variables
        };

        setResult(executionResult);
        setExecutionHistory(prev => [executionResult, ...prev]);

        if (onExecutionComplete) {
          onExecutionComplete(executionResult);
        }
      } else {
        throw new Error(data.error || 'Execution failed');
      }
    } catch (error: any) {
      const errorResult: ExecutionResult = {
        id: `exec-${Date.now()}`,
        promptId: prompt.id,
        promptName: prompt.name,
        versionId: prompt.versionId || 'latest',
        provider,
        model,
        response: '',
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0,
        latencyMs: Date.now() - startTime,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
        settings: {
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          topP: settings.topP,
          frequencyPenalty: settings.frequencyPenalty,
          presencePenalty: settings.presencePenalty,
        },
        variables
      };
      setResult(errorResult);
      setExecutionHistory(prev => [errorResult, ...prev]);
    }

    setIsRunning(false);
  };

  const copyResult = () => {
    if (result?.response) {
      navigator.clipboard.writeText(result.response);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b p-6 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-blue-600" />
              Execute Prompt
            </h2>
            <p className="text-gray-600 mt-1">{prompt.name}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Configuration */}
          <div className="w-1/2 border-r overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start px-4 pt-4">
                <TabsTrigger value="configure">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Configure
                </TabsTrigger>
                <TabsTrigger value="history">
                  <Clock className="w-4 h-4 mr-2" />
                  History ({executionHistory.length})
                </TabsTrigger>
              </TabsList>

              <div className="p-4">
                <TabsContent value="configure" className="space-y-4">
                  {/* Variables Input */}
                  {prompt.variables && prompt.variables.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Variable className="w-4 h-4" />
                          Input Variables
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {prompt.variables.map((varName: string) => (
                          <div key={varName}>
                            <Label htmlFor={varName} className="text-sm">{varName}</Label>
                            <Textarea
                              id={varName}
                              placeholder={`Enter value for {${varName}}`}
                              value={variables[varName] || ''}
                              onChange={(e) => handleVariableChange(varName, e.target.value)}
                              rows={2}
                              className="mt-1 text-sm"
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Model Configuration */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Model Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Provider</Label>
                          <Select
                            value={provider}
                            onValueChange={(value) => {
                              setProvider(value);
                              setModel(PROVIDER_MODELS[value as keyof typeof PROVIDER_MODELS]?.[0]?.value || '');
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(PROVIDER_MODELS).map(p => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm">Model</Label>
                          <Select value={model} onValueChange={setModel}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PROVIDER_MODELS[provider as keyof typeof PROVIDER_MODELS]?.map(m => (
                                <SelectItem key={m.value} value={m.value}>
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Hyperparameters */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <Label className="text-sm">Temperature</Label>
                            <span className="text-sm text-gray-600">{settings.temperature}</span>
                          </div>
                          <Slider
                            value={[settings.temperature]}
                            onValueChange={([value]) => setSettings({...settings, temperature: value})}
                            min={0}
                            max={2}
                            step={0.1}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <Label className="text-sm">Max Tokens</Label>
                            <span className="text-sm text-gray-600">{settings.maxTokens}</span>
                          </div>
                          <Slider
                            value={[settings.maxTokens]}
                            onValueChange={([value]) => setSettings({...settings, maxTokens: value})}
                            min={100}
                            max={4000}
                            step={100}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <Label className="text-sm">Top P</Label>
                            <span className="text-sm text-gray-600">{settings.topP}</span>
                          </div>
                          <Slider
                            value={[settings.topP]}
                            onValueChange={([value]) => setSettings({...settings, topP: value})}
                            min={0}
                            max={1}
                            step={0.05}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="stream" className="text-sm">Stream responses</Label>
                          <Switch
                            id="stream"
                            checked={settings.stream}
                            onCheckedChange={(checked) => setSettings({...settings, stream: checked})}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Execute Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={executePrompt}
                    disabled={isRunning}
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-5 h-5 mr-2" />
                        Execute Prompt
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="history" className="space-y-2">
                  {executionHistory.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-gray-500 text-sm">No execution history yet</p>
                    </Card>
                  ) : (
                    <ScrollArea className="h-[500px]">
                      {executionHistory.map((exec) => (
                        <Card key={exec.id} className="mb-2 cursor-pointer hover:bg-gray-50" onClick={() => setResult(exec)}>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  {exec.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                                  {exec.status === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                                  <span className="font-medium text-sm">{exec.provider} - {exec.model}</span>
                                </div>
                                <div className="flex gap-3 mt-1 text-xs text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Activity className="w-3 h-3" />
                                    {exec.totalTokens} tokens
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Coins className="w-3 h-3" />
                                    ${exec.cost.toFixed(4)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    {exec.latencyMs}ms
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(exec.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </ScrollArea>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Right Panel - Result */}
          <div className="w-1/2 overflow-y-auto p-4">
            {result ? (
              <div className="space-y-4">
                {/* Result Header */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base flex items-center gap-2">
                        {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {result.status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                        Execution Result
                      </CardTitle>
                      {result.status === 'success' && (
                        <Button variant="outline" size="sm" onClick={copyResult}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Model:</span>
                        <p className="font-medium">{result.provider} - {result.model}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Execution ID:</span>
                        <p className="font-mono text-xs">{result.id}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tokens:</span>
                        <p className="font-medium">
                          {result.inputTokens} in / {result.outputTokens} out ({result.totalTokens} total)
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Cost:</span>
                        <p className="font-medium">${result.cost.toFixed(4)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Latency:</span>
                        <p className="font-medium">{result.latencyMs}ms</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Timestamp:</span>
                        <p className="font-medium">{new Date(result.timestamp).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Hyperparameters */}
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600 mb-2">Hyperparameters:</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Temp: {result.settings.temperature}</Badge>
                        <Badge variant="secondary">Max Tokens: {result.settings.maxTokens}</Badge>
                        <Badge variant="secondary">Top P: {result.settings.topP}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Response Content */}
                {result.status === 'success' && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <pre className="text-sm whitespace-pre-wrap font-mono">
                          {result.response}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {/* Error Message */}
                {result.status === 'error' && (
                  <Card className="border-red-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-red-600">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-red-600">{result.error}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Configure and execute the prompt to see results</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}