'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Activity
} from 'lucide-react';

interface PromptTestRunnerProps {
  prompt: any;
  onClose: () => void;
}

export default function PromptTestRunner({ prompt, onClose }: PromptTestRunnerProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

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

  const handleRunTest = async () => {
    setIsRunning(true);
    setError('');
    setResponse(null);

    try {
      // Interpolate variables into content
      const interpolatedContent = interpolateContent(prompt.content, variables);

      const res = await fetch('/api/prompts/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId: prompt.id,
          content: interpolatedContent,
          settings: prompt.settings,
          service: prompt.service,
          type: prompt.type,
          variables: variables,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to run test');
      }

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while testing the prompt');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyResponse = () => {
    if (response?.response) {
      navigator.clipboard.writeText(
        typeof response.response === 'string' 
          ? response.response 
          : JSON.stringify(response.response, null, 2)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatResponse = (resp: any) => {
    if (typeof resp === 'string') return resp;
    if (resp?.content) return resp.content;
    if (resp?.choices?.[0]?.message?.content) return resp.choices[0].message.content;
    if (resp?.choices?.[0]?.text) return resp.choices[0].text;
    
    // If it's an object/array, stringify it nicely
    try {
      return JSON.stringify(resp, null, 2);
    } catch (e) {
      return String(resp);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Test Prompt</h2>
              <p className="text-gray-600 mt-1">{prompt.name}</p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Variables Input */}
          {prompt.variables && prompt.variables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Variable className="w-5 h-5" />
                  Input Variables
                </CardTitle>
                <CardDescription>
                  Provide values for the variables in your prompt
                </CardDescription>
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
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Interpolated Prompt Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prompt Preview</CardTitle>
              <CardDescription>
                This is how your prompt will look with the variables filled in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {(() => {
                    const interpolated = interpolateContent(prompt.content, variables);
                    if (typeof interpolated === 'string') return interpolated;
                    if (interpolated?.prompt) return interpolated.prompt;
                    if (interpolated?.messages) {
                      return interpolated.messages
                        .map((m: any) => `[${m.role}]: ${m.content}`)
                        .join('\n\n');
                    }
                    return JSON.stringify(interpolated, null, 2);
                  })()}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Run Test Button */}
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={handleRunTest}
              disabled={isRunning || (prompt.variables?.length > 0 && Object.values(variables).some(v => !v))}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Running Test...
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Run Test
                </>
              )}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Response Display */}
          {response && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Test Results
                    </CardTitle>
                    <CardDescription>
                      Successfully executed prompt
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyResponse}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="response">
                  <TabsList>
                    <TabsTrigger value="response">Response</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                    <TabsTrigger value="debug">Debug</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="response">
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {formatResponse(response.response)}
                      </pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="metadata">
                    <div className="space-y-3">
                      {response.tokensUsed && (
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            <strong>Tokens Used:</strong> {response.tokensUsed}
                          </span>
                        </div>
                      )}
                      {response.cost && (
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            <strong>Estimated Cost:</strong> ${response.cost.toFixed(4)}
                          </span>
                        </div>
                      )}
                      {response.latencyMs && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            <strong>Response Time:</strong> {response.latencyMs}ms
                          </span>
                        </div>
                      )}
                      <div className="pt-3 border-t">
                        <span className="text-sm">
                          <strong>Model:</strong> {prompt.settings?.model || 'Default'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm">
                          <strong>Service:</strong> {prompt.service}
                        </span>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="debug">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Request Sent:</h4>
                        <div className="bg-gray-100 rounded p-3 max-h-48 overflow-y-auto">
                          <pre className="text-xs font-mono">
                            {JSON.stringify({
                              service: prompt.service,
                              type: prompt.type,
                              model: prompt.settings?.model,
                              content: interpolateContent(prompt.content, variables),
                              variables: variables
                            }, null, 2)}
                          </pre>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Raw Response:</h4>
                        <div className="bg-gray-100 rounded p-3 max-h-48 overflow-y-auto">
                          <pre className="text-xs font-mono">
                            {JSON.stringify(response, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}