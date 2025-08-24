'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Save, 
  X, 
  Variable, 
  MessageSquare, 
  FileText,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';

interface PromptEditorProps {
  prompt?: any;
  useCaseId: string;
  onSave: (promptData: any) => void;
  onCancel: () => void;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const AI_SERVICES = [
  { value: 'OPENAI', label: 'OpenAI' },
  { value: 'AZURE', label: 'Azure OpenAI' },
  { value: 'ANTHROPIC', label: 'Anthropic Claude' },
  { value: 'GEMINI', label: 'Google Gemini' },
];

const OPENAI_MODELS = [
  { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
];

const ANTHROPIC_MODELS = [
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
];

export default function PromptEditor({ 
  prompt, 
  useCaseId, 
  onSave, 
  onCancel 
}: PromptEditorProps) {
  const [name, setName] = useState(prompt?.name || '');
  const [tags, setTags] = useState(
    prompt?.tags ? (Array.isArray(prompt.tags) ? prompt.tags.join(', ') : prompt.tags) : ''
  );
  const [versionNotes, setVersionNotes] = useState('');
  const [type, setType] = useState(prompt?.type || 'PROMPT');
  const [service, setService] = useState(prompt?.service || 'OPENAI');
  const [promptContent, setPromptContent] = useState(prompt?.content?.prompt || '');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    prompt?.content?.messages || [
      { role: 'system', content: 'You are a helpful AI assistant.' }
    ]
  );
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);
  const [settings, setSettings] = useState({
    model: prompt?.settings?.model || 'gpt-4-turbo-preview',
    temperature: prompt?.settings?.temperature || 0.7,
    maxTokens: prompt?.settings?.maxTokens || 2000,
    topP: prompt?.settings?.topP || 1.0,
    frequencyPenalty: prompt?.settings?.frequencyPenalty || 0,
    presencePenalty: prompt?.settings?.presencePenalty || 0,
    stream: prompt?.settings?.stream || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Detect variables in content
  const detectVariables = useCallback((content: string) => {
    // Only match variables that look like placeholders, not JSON content
    // Variables should be single words or simple phrases with underscores
    const regex = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
    const variables = new Set<string>();
    let match;
    while ((match = regex.exec(content)) !== null) {
      // Filter out common JSON keys that shouldn't be variables
      const varName = match[1];
      if (!varName.includes('"') && !varName.includes(':') && !varName.includes('\n')) {
        variables.add(varName);
      }
    }
    return Array.from(variables);
  }, []);

  // Update detected variables when content changes
  useEffect(() => {
    if (type === 'PROMPT') {
      setDetectedVariables(detectVariables(promptContent));
    } else {
      const allVariables = new Set<string>();
      chatMessages.forEach(msg => {
        detectVariables(msg.content).forEach(v => allVariables.add(v));
      });
      setDetectedVariables(Array.from(allVariables));
    }
  }, [type, promptContent, chatMessages, detectVariables]);

  const handleAddMessage = () => {
    setChatMessages([...chatMessages, { role: 'user', content: '' }]);
  };

  const handleRemoveMessage = (index: number) => {
    if (chatMessages.length > 1) {
      setChatMessages(chatMessages.filter((_, i) => i !== index));
    }
  };

  const handleUpdateMessage = (index: number, field: 'role' | 'content', value: string) => {
    const updated = [...chatMessages];
    updated[index] = { ...updated[index], [field]: value };
    setChatMessages(updated);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (type === 'PROMPT' && !promptContent.trim()) {
      newErrors.content = 'Prompt content is required';
    }

    if (type === 'CHAT' && chatMessages.every(msg => !msg.content.trim())) {
      newErrors.content = 'At least one message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const content = type === 'PROMPT' 
      ? { prompt: promptContent }
      : { messages: chatMessages };

    onSave({
      name,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      versionNotes,
      type,
      service,
      content,
      settings,
      variables: detectedVariables,
    });
  };

  const getAvailableModels = () => {
    switch (service) {
      case 'OPENAI':
      case 'AZURE':
        return OPENAI_MODELS;
      case 'ANTHROPIC':
        return ANTHROPIC_MODELS;
      default:
        return OPENAI_MODELS;
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Prompt Configuration</CardTitle>
          <CardDescription>Set up your prompt template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Prompt Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., AI Legal Assistant for Contract Review"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., legal, contracts, NDA, MSA"
                className="text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated tags for easy searching</p>
            </div>

            <div>
              <Label htmlFor="versionNotes">Version Notes (Optional)</Label>
              <Input
                id="versionNotes"
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                placeholder="e.g., Added risk scoring section"
                className="text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">What changed in this version</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROMPT">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Simple Prompt
                    </div>
                  </SelectItem>
                  <SelectItem value="CHAT">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Chat Conversation
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="service">AI Service</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger id="service">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_SERVICES.map(svc => (
                    <SelectItem key={svc.value} value={svc.value}>
                      {svc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Content */}
      <Card>
        <CardHeader>
          <CardTitle>Prompt Content</CardTitle>
          <CardDescription>
            Use {'{'}variableName{'}'} syntax to create dynamic variables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={type} onValueChange={setType}>
            <TabsList className="mb-4">
              <TabsTrigger value="PROMPT">Simple Prompt</TabsTrigger>
              <TabsTrigger value="CHAT">Chat Conversation</TabsTrigger>
            </TabsList>

            <TabsContent value="PROMPT">
              <div className="space-y-4">
                <Textarea
                  value={promptContent}
                  onChange={(e) => setPromptContent(e.target.value)}
                  placeholder="Enter your prompt here... Use {variableName} for dynamic content"
                  rows={10}
                  className={`font-mono text-sm ${errors.content ? 'border-red-500' : ''}`}
                />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="CHAT">
              <div className="space-y-4">
                {chatMessages.map((message, index) => (
                  <div key={index} className="flex gap-2">
                    <Select 
                      value={message.role} 
                      onValueChange={(value) => handleUpdateMessage(index, 'role', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="assistant">Assistant</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      value={message.content}
                      onChange={(e) => handleUpdateMessage(index, 'content', e.target.value)}
                      placeholder={`${message.role} message...`}
                      rows={3}
                      className="flex-1 font-mono text-sm"
                    />
                    {chatMessages.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMessage(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={handleAddMessage}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Message
                </Button>
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content}</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Detected Variables */}
          {detectedVariables.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Variable className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-900">Detected Variables</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {detectedVariables.map((variable) => (
                  <Badge key={variable} variant="secondary">
                    {variable}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Model Settings</CardTitle>
          <CardDescription>Configure AI model parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="model">Model</Label>
            <Select 
              value={settings.model} 
              onValueChange={(value) => setSettings({...settings, model: value})}
            >
              <SelectTrigger id="model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAvailableModels().map(model => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="temperature">
                Temperature: {settings.temperature}
              </Label>
              <Slider
                id="temperature"
                min={0}
                max={2}
                step={0.1}
                value={[settings.temperature]}
                onValueChange={([value]) => setSettings({...settings, temperature: value})}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Controls randomness (0 = focused, 2 = creative)
              </p>
            </div>

            <div>
              <Label htmlFor="maxTokens">
                Max Tokens: {settings.maxTokens}
              </Label>
              <Slider
                id="maxTokens"
                min={100}
                max={4000}
                step={100}
                value={[settings.maxTokens]}
                onValueChange={([value]) => setSettings({...settings, maxTokens: value})}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum response length
              </p>
            </div>

            <div>
              <Label htmlFor="topP">
                Top P: {settings.topP}
              </Label>
              <Slider
                id="topP"
                min={0}
                max={1}
                step={0.05}
                value={[settings.topP]}
                onValueChange={([value]) => setSettings({...settings, topP: value})}
                className="mt-2"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="stream"
                checked={settings.stream}
                onCheckedChange={(checked) => setSettings({...settings, stream: checked})}
              />
              <Label htmlFor="stream">Stream responses</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          {prompt ? 'Update' : 'Create'} Prompt
        </Button>
      </div>
    </div>
  );
}