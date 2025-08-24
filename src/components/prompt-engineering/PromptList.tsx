'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  GitBranch,
  Rocket,
  Variable,
  Clock,
  User,
  PlayCircle
} from 'lucide-react';

interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  content?: any;
  type: string;
  service: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
  versions?: any[];
  deployments?: any[];
}

interface PromptListProps {
  prompts: PromptTemplate[];
  onEdit: (prompt: PromptTemplate) => void;
  onTest: (prompt: PromptTemplate) => void;
  onRefresh: () => void;
}

export default function PromptList({ prompts, onEdit, onTest, onRefresh }: PromptListProps) {
  const getPromptPreview = (prompt: PromptTemplate) => {
    let contentText = '';
    
    if (prompt.type === 'CHAT' && prompt.content?.messages) {
      // For chat, show the system message or first message
      const systemMsg = prompt.content.messages.find((m: any) => m.role === 'system');
      const firstMsg = prompt.content.messages[0];
      contentText = (systemMsg || firstMsg)?.content || '';
    } else if (prompt.content?.prompt) {
      // For simple prompt
      contentText = prompt.content.prompt;
    }
    
    // Truncate to first 200 characters and get first 2-3 lines
    const lines = contentText.split('\n').slice(0, 3);
    const preview = lines.join('\n');
    
    if (preview.length > 200) {
      return preview.substring(0, 200) + '...';
    }
    
    return preview || 'No content preview available';
  };

  const handleDelete = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }

      onRefresh();
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('Failed to delete prompt. Please try again.');
    }
  };

  const handleDuplicate = async (prompt: PromptTemplate) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${prompt.name} (Copy)`,
          description: prompt.description,
          type: prompt.type,
          service: prompt.service,
          content: (prompt as any).content,
          settings: (prompt as any).settings,
          useCaseId: (prompt as any).useCaseId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate prompt');
      }

      onRefresh();
    } catch (error) {
      console.error('Error duplicating prompt:', error);
      alert('Failed to duplicate prompt. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getServiceBadgeColor = (service: string) => {
    switch (service) {
      case 'OPENAI':
        return 'bg-green-100 text-green-800';
      case 'AZURE':
        return 'bg-blue-100 text-blue-800';
      case 'ANTHROPIC':
        return 'bg-purple-100 text-purple-800';
      case 'GEMINI':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {prompts.map((prompt) => (
        <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg">{prompt.name}</CardTitle>
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {prompt.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onTest(prompt)}>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Test
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(prompt)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDuplicate(prompt)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDelete(prompt.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex gap-2 mt-3">
              <Badge variant="outline">
                {prompt.type === 'CHAT' ? 'Chat' : 'Prompt'}
              </Badge>
              <Badge className={getServiceBadgeColor(prompt.service)}>
                {prompt.service}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Prompt Preview */}
            <div className="bg-gray-50 rounded-lg p-3">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono line-clamp-3">
                {getPromptPreview(prompt)}
              </pre>
            </div>

            {/* Variables */}
            {prompt.variables && prompt.variables.length > 0 && (
              <div className="flex items-start gap-2">
                <Variable className="w-4 h-4 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs text-gray-600 mr-2">Variables:</span>
                  <div className="inline-flex flex-wrap gap-1">
                    {prompt.variables.map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                <span>{prompt.versions?.length || 1} versions</span>
              </div>
              {prompt.deployments && prompt.deployments.length > 0 && (
                <div className="flex items-center gap-1">
                  <Rocket className="w-3 h-3" />
                  <span>{prompt.deployments.length} deployed</span>
                </div>
              )}
            </div>

            {/* Meta info */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>
                  {prompt.createdBy?.firstName && prompt.createdBy?.lastName
                    ? `${prompt.createdBy.firstName} ${prompt.createdBy.lastName}`
                    : prompt.createdBy?.email}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(prompt.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}