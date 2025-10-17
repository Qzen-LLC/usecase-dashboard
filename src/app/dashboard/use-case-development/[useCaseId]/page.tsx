'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Plus,
  Code2,
  FileText,
  GitBranch,
  Settings,
  Play,
  Save,
  History,
  Variable,
  Rocket
} from 'lucide-react';
import PromptEditorV2 from '@/components/prompt-engineering/PromptEditorV2';
import PromptList from '@/components/prompt-engineering/PromptList';
import PromptTestLab from '@/components/prompt-engineering/PromptTestLab';
import VersionHistory from '@/components/prompt-engineering/VersionHistory';

interface UseCase {
  id: string;
  title: string;
  problemStatement: string;
  proposedAISolution: string;
  stage: string;
  businessFunction: string;
}

interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  content?: any;
  variables: string[];
  type: string;
  service: string;
  createdAt: string;
  updatedAt: string;
  versions?: any[];
  tags?: string[];
  createdBy?: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
  deployments?: any[];
}

export default function UseCasePromptManagement() {
  const params = useParams();
  const router = useRouter();
  const useCaseId = params.useCaseId as string;

  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [testingPrompt, setTestingPrompt] = useState<PromptTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('prompts');
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (showEditor) {
      // eslint-disable-next-line no-console
      console.log('Rendering PromptEditorV2 with prompt:', selectedPrompt);
    }
  }, [showEditor, selectedPrompt]);

  useEffect(() => {
    if (useCaseId) {
      fetchUseCase();
      fetchPrompts();
    }
  }, [useCaseId]);

  const fetchUseCase = async () => {
    try {
      const response = await fetch(`/api/get-usecase?id=${useCaseId}`);
      if (!response.ok) throw new Error('Failed to fetch use case');
      const data = await response.json();
      setUseCase(data);
    } catch (error) {
      console.error('Error fetching use case:', error);
    }
  };

  const fetchPrompts = async () => {
    try {
      const response = await fetch(`/api/prompts?useCaseId=${useCaseId}`);
      if (response.ok) {
        const data = await response.json();
        setPrompts(data);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrompt = () => {
    setSelectedPrompt(null);
    setShowEditor(true);
    setActiveTab('editor');
  };

  const handleEditPrompt = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt);
    setShowEditor(true);
    setActiveTab('editor');
  };

  const handleTestPrompt = (prompt: PromptTemplate) => {
    setTestingPrompt(prompt);
  };

  const handleSavePrompt = async (promptData: any) => {
    try {
      const url = selectedPrompt 
        ? `/api/prompts/${selectedPrompt.id}`
        : '/api/prompts';
      
      const method = selectedPrompt ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...promptData,
          useCaseId
        }),
      });

      if (!response.ok) throw new Error('Failed to save prompt');
      
      await fetchPrompts();
      setShowEditor(false);
      setActiveTab('prompts');
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/use-case-development')}
          className="mb-3 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Use Cases
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground mb-1">
              {useCase?.title}
            </h1>
            <div className="flex items-center gap-3">
              <Badge className="bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 text-xs">
                {useCase?.stage}
              </Badge>
              <span className="text-xs text-muted-foreground">{useCase?.businessFunction}</span>
            </div>
          </div>
          <Button 
            onClick={handleCreatePrompt}
            className="bg-white text-foreground border border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-white dark:border-neutral-600 dark:hover:bg-neutral-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Prompt Template
          </Button>
        </div>
      </div>

      {/* Use Case Info Card */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Use Case Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Problem Statement</h4>
              <div 
                className="text-sm text-foreground" 
                dangerouslySetInnerHTML={{ 
                  __html: useCase?.problemStatement || '' 
                }} 
              />
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Proposed AI Solution</h4>
              <div 
                className="text-sm text-foreground" 
                dangerouslySetInnerHTML={{ 
                  __html: useCase?.proposedAISolution || '' 
                }} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="prompts" className="text-sm">
            <FileText className="w-4 h-4 mr-2" />
            Prompt Templates ({prompts.length})
          </TabsTrigger>
          {showEditor && (
            <TabsTrigger value="editor" className="text-sm">
              <Code2 className="w-4 h-4 mr-2" />
              Editor
            </TabsTrigger>
          )}
          <TabsTrigger value="versions" className="text-sm">
            <GitBranch className="w-4 h-4 mr-2" />
            Version History
          </TabsTrigger>
          <TabsTrigger value="deployments" className="text-sm">
            <Rocket className="w-4 h-4 mr-2" />
            Deployments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompts">
          {prompts.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <Code2 className="w-12 h-12 text-muted-foreground" />
                <h3 className="text-base font-medium text-foreground">
                  No prompt templates yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Create your first prompt template to start developing AI solutions for this use case.
                </p>
                <Button 
                  onClick={handleCreatePrompt}
                  className="bg-white text-foreground border border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-white dark:border-neutral-600 dark:hover:bg-neutral-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Prompt
                </Button>
              </div>
            </Card>
          ) : (
            <PromptList 
              prompts={prompts} 
              onEdit={handleEditPrompt}
              onTest={handleTestPrompt}
              onRefresh={fetchPrompts}
            />
          )}
        </TabsContent>

        {showEditor && (
          <TabsContent value="editor">
            <PromptEditorV2
              prompt={selectedPrompt}
              useCaseId={useCaseId}
              onSave={handleSavePrompt}
              onCancel={() => {
                setShowEditor(false);
                setActiveTab('prompts');
              }}
            />
          </TabsContent>
        )}

        <TabsContent value="versions">
          {selectedPrompt ? (
            <VersionHistory promptId={selectedPrompt.id} />
          ) : (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <History className="w-12 h-12 text-muted-foreground" />
                <h3 className="text-base font-medium text-foreground">
                  Select a prompt to view version history
                </h3>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deployments">
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <Rocket className="w-12 h-12 text-muted-foreground" />
              <h3 className="text-base font-medium text-foreground">
                Deployments coming soon
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Deploy your prompt templates to different environments for testing and production use.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Lab Modal */}
      {testingPrompt && (
        <PromptTestLab
          prompt={testingPrompt}
          onClose={() => setTestingPrompt(null)}
          onSaveResults={(results) => {
            // TODO: Save test results to database
            console.log('Test results:', results);
          }}
        />
      )}
    </div>
  );
}