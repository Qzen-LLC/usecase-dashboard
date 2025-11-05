'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Code2, 
  Plus, 
  Search, 
  ChevronRight,
  FileText,
  GitBranch,
  Rocket,
  Clock
} from 'lucide-react';
import { useUserClient } from '@/hooks/useAuthClient';

interface UseCase {
  id: string;
  title: string;
  stage: string;
  businessFunction: string;
  createdAt: string;
  updatedAt: string;
  promptTemplates?: any[];
}

// Eligible stages for Use Case Development (Business Case and beyond)
const ELIGIBLE_STAGES = ['business-case', 'proof-of-value', 'backlog', 'in-progress', 'solution-validation', 'pilot', 'deployment'];

const stageBadgeColors: Record<string, string> = {
  'business-case': 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  'proof-of-value': 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  'backlog': 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  'in-progress': 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  'solution-validation': 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  'pilot': 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  'deployment': 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
};

export default function UseCaseDevelopmentDashboard() {
  const router = useRouter();
  const { user } = useUserClient<any>();
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [filteredUseCases, setFilteredUseCases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  useEffect(() => {
    fetchUseCases();
  }, []);

  useEffect(() => {
    filterUseCases();
  }, [useCases, searchTerm, selectedStage]);

  const fetchUseCases = async () => {
    try {
      const response = await fetch('/api/read-usecases');
      if (!response.ok) throw new Error('Failed to fetch use cases');
      
      const data = await response.json();
      // The API returns { useCases: [...] }
      const allUseCases = data.useCases || [];
      
      // Filter for eligible stages only
      const eligibleUseCases = allUseCases.filter((uc: UseCase) => 
        ELIGIBLE_STAGES.includes(uc.stage?.toLowerCase() || '')
      );
      
      setUseCases(eligibleUseCases);
      setFilteredUseCases(eligibleUseCases);
    } catch (error) {
      console.error('Error fetching use cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUseCases = () => {
    let filtered = [...useCases];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(uc => 
        uc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uc.businessFunction?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by stage
    if (selectedStage !== 'all') {
      filtered = filtered.filter(uc => uc.stage === selectedStage);
    }

    setFilteredUseCases(filtered);
  };

  const handleUseCaseClick = (useCaseId: string) => {
    router.push(`/dashboard/use-case-development/${useCaseId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
      <div className="mb-4 bg-muted/50 rounded-md p-4">
        <div className="flex items-center gap-2 mb-1">
          <Code2 className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-semibold text-foreground">Use Case Development</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Create and manage prompt templates for your AI use cases
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <Card className="bg-muted/50 rounded-md shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Total Use Cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{useCases.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50 rounded-md shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>In Development</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {useCases.filter(uc => uc.stage === 'in-progress').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50 rounded-md shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Ready for Pilot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {useCases.filter(uc => uc.stage === 'pilot').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50 rounded-md shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Total Prompts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search use cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedStage === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedStage('all')}
            size="sm"
            className={selectedStage === 'all' ? 'bg-neutral-700 text-white hover:bg-neutral-800 dark:bg-neutral-600 dark:hover:bg-neutral-700' : 'bg-white text-foreground border border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-white dark:border-neutral-600 dark:hover:bg-neutral-700'}
          >
            All Stages
          </Button>
          {ELIGIBLE_STAGES.map(stage => (
            <Button
              key={stage}
              variant={selectedStage === stage ? 'default' : 'outline'}
              onClick={() => setSelectedStage(stage)}
              size="sm"
              className={selectedStage === stage ? 'bg-neutral-700 text-white hover:bg-neutral-800 dark:bg-neutral-600 dark:hover:bg-neutral-700' : 'bg-white text-foreground border border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-white dark:border-neutral-600 dark:hover:bg-neutral-700'}
            >
              {stage.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Use Cases Grid */}
      {filteredUseCases.length === 0 ? (
        <Card className="p-12 text-center bg-muted/50 rounded-md shadow-none">
          <div className="flex flex-col items-center gap-4">
            <FileText className="w-16 h-16 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-600">
              No use cases in development stages
            </h3>
            <p className="text-gray-500 max-w-md">
              Use cases will appear here once they reach the Backlog stage or beyond.
              Move your use cases through the pipeline to start developing prompts.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUseCases.map((useCase) => (
            <Card 
              key={useCase.id} 
              className="bg-muted/50 rounded-md hover:shadow-none transition-shadow cursor-pointer group"
              onClick={() => handleUseCaseClick(useCase.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge className={stageBadgeColors[useCase.stage] || 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'}>
                    {useCase.stage?.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </Badge>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <CardTitle className="text-lg line-clamp-2 text-foreground">
                  {useCase.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {useCase.businessFunction}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Prompt Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>{useCase.promptTemplates?.length || 0} Prompts</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <GitBranch className="w-4 h-4" />
                      <span>0 Versions</span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Created {formatDate(useCase.createdAt)}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full mt-4 !bg-muted !text-foreground !border !border-border hover:!bg-muted/90"
                    variant="outline"
                    size="sm"
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Manage Prompts
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="rounded-full shadow-lg !bg-muted !text-foreground !border !border-border hover:!bg-muted/90"
          onClick={() => router.push('/new-usecase')}
        >
          <Plus className="w-5 h-5 mr-2" />
          New Use Case
        </Button>
      </div>
    </div>
  );
}