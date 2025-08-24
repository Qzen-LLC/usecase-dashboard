'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  X, 
  Variable, 
  MessageSquare, 
  FileText,
  AlertCircle,
  Plus,
  Trash2,
  PlayCircle
} from 'lucide-react';
import PromptExecutionPanel from './PromptExecutionPanel';

interface PromptEditorV2Props {
  prompt?: any;
  useCaseId: string;
  onSave: (promptData: any) => void;
  onCancel: () => void;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}


function PromptEditorV2({ 
  prompt, 
  useCaseId, 
  onSave, 
  onCancel 
}: PromptEditorV2Props) {
  const [name, setName] = useState(prompt?.name || '');
  const [tags, setTags] = useState(
    prompt?.tags ? (Array.isArray(prompt.tags) ? prompt.tags.join(', ') : prompt.tags) : ''
  );
  const [versionNotes, setVersionNotes] = useState('');
  const [type, setType] = useState(prompt?.type || 'PROMPT');
  const [promptContent, setPromptContent] = useState(prompt?.content?.prompt || '');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    prompt?.content?.messages || [
      { role: 'system', content: 'You are a helpful AI assistant.' }
    ]
  );
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);

  // Detect variables in content
  const detectVariables = useCallback((content: string) => {
    // Only match variables that look like placeholders, not JSON content
    const regex = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
    const variables = new Set<string>();
    let match;
    while ((match = regex.exec(content)) !== null) {
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
      service: 'OPENAI', // Default service, will be overridden at runtime
      content,
      settings: {}, // Empty settings, will be configured at runtime
      variables: detectedVariables,
    });
  };


  return (
    <div className="max-w-6xl mx-auto">
      {/* Prompt Configuration Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Prompt Configuration</h3>
          <p className="text-sm text-gray-500 mt-1">Set up your prompt template</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Name Field */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Prompt Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., AI Legal Assistant for Contract Review"
              className={`mt-1.5 ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Tags and Version Notes */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
                Tags (Optional)
              </Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., legal, contracts, NDA, MSA"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated tags for easy searching</p>
            </div>

            <div>
              <Label htmlFor="versionNotes" className="text-sm font-medium text-gray-700">
                Version Notes (Optional)
              </Label>
              <Input
                id="versionNotes"
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                placeholder="e.g., Added risk scoring section"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">What changed in this version</p>
            </div>
          </div>

          {/* Type Only - Service will be selected at runtime */}
          <div>
            <Label htmlFor="type" className="text-sm font-medium text-gray-700">
              Prompt Type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type" className="mt-1.5 max-w-xs">
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
            <p className="text-xs text-gray-500 mt-1">AI Service and Model will be selected when running the prompt</p>
          </div>
        </div>
      </div>

      {/* Prompt Content Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Prompt Content</h3>
          <p className="text-sm text-gray-500 mt-1">Use {'{'}variableName{'}'} syntax to create dynamic variables</p>
        </div>

        <div className="p-6">
          <Tabs value={type} onValueChange={setType}>
            <TabsList className="mb-4 bg-gray-100">
              <TabsTrigger value="PROMPT">Simple Prompt</TabsTrigger>
              <TabsTrigger value="CHAT">Chat Conversation</TabsTrigger>
            </TabsList>

            <TabsContent value="PROMPT">
              <Textarea
                value={promptContent}
                onChange={(e) => setPromptContent(e.target.value)}
                placeholder="Enter your prompt here... Use {variableName} for dynamic content"
                rows={12}
                className={`font-mono text-sm ${errors.content ? 'border-red-500' : ''}`}
              />
              {errors.content && (
                <p className="text-sm text-red-500 mt-1">{errors.content}</p>
              )}
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
        </div>
      </div>


      {/* Actions */}
      <div className="flex justify-between items-center">
        <div>
          {prompt && prompt.id && (
            <Button 
              onClick={() => setShowExecutionPanel(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Run
            </Button>
          )}
          {(!prompt || !prompt.id) && (
            <div className="text-sm text-gray-500">
              Save the prompt first to enable the Run button
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="px-6"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            {prompt ? 'Update' : 'Create'} Prompt
          </Button>
        </div>
      </div>

      {/* Execution Panel */}
      {showExecutionPanel && prompt && (
        <PromptExecutionPanel
          prompt={{
            ...prompt,
            id: prompt.id || 'temp-id',
            name,
            type,
            service: 'OPENAI', // Default, will be overridden in panel
            content: type === 'PROMPT' 
              ? { prompt: promptContent }
              : { messages: chatMessages },
            variables: detectedVariables,
            settings: {} // Empty, will be configured in panel
          }}
          onClose={() => setShowExecutionPanel(false)}
          onExecutionComplete={(result) => {
            console.log('Execution completed:', result);
          }}
        />
      )}
    </div>
  );
}

export default PromptEditorV2;