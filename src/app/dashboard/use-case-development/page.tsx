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
        <div className="animate-spin rounded-md h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Code2 className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-foreground">Use Case Development</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Create and manage prompt templates for your AI use cases
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <Card className="rounded-md">
          <CardHeader className="pb-1.5 px-4 pt-4">
            <CardDescription className="text-xs">Total Use Cases</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">{useCases.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-md">
          <CardHeader className="pb-1.5 px-4 pt-4">
            <CardDescription className="text-xs">In Development</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">
              {useCases.filter(uc => uc.stage === 'in-progress').length}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-md">
          <CardHeader className="pb-1.5 px-4 pt-4">
            <CardDescription className="text-xs">Ready for Pilot</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">
              {useCases.filter(uc => uc.stage === 'pilot').length}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-md">
          <CardHeader className="pb-1.5 px-4 pt-4">
            <CardDescription className="text-xs">Total Prompts</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <Input
            type="text"
            placeholder="Search use cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm rounded-md"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Button
            variant={selectedStage === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedStage('all')}
            size="sm"
            className={`text-xs h-8 px-3 rounded-md ${selectedStage === 'all' ? 'bg-neutral-700 text-white hover:bg-neutral-800 dark:bg-neutral-600 dark:hover:bg-neutral-700' : 'bg-white text-foreground border border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-white dark:border-neutral-600 dark:hover:bg-neutral-700'}`}
          >
            All Stages
          </Button>
          {ELIGIBLE_STAGES.map(stage => (
            <Button
              key={stage}
              variant={selectedStage === stage ? 'default' : 'outline'}
              onClick={() => setSelectedStage(stage)}
              size="sm"
              className={`text-xs h-8 px-3 rounded-md ${selectedStage === stage ? 'bg-neutral-700 text-white hover:bg-neutral-800 dark:bg-neutral-600 dark:hover:bg-neutral-700' : 'bg-white text-foreground border border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-white dark:border-neutral-600 dark:hover:bg-neutral-700'}`}
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
        <Card className="p-8 text-center rounded-md">
          <div className="flex flex-col items-center gap-3">
            <FileText className="w-12 h-12 text-gray-300" />
            <h3 className="text-base font-semibold text-gray-600">
              No use cases in development stages
            </h3>
            <p className="text-xs text-gray-500 max-w-md">
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
              className="hover:shadow-lg transition-shadow cursor-pointer group rounded-md"
              onClick={() => handleUseCaseClick(useCase.id)}
            >
              <CardHeader className="px-4 pt-4 pb-3">
                <div className="flex justify-between items-start mb-1.5">
                  <Badge className={`text-xs px-2 py-0.5 rounded ${stageBadgeColors[useCase.stage] || 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'}`}>
                    {useCase.stage?.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <CardTitle className="text-base line-clamp-2 text-foreground">
                  {useCase.title}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {useCase.businessFunction}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2.5">
                  {/* Prompt Stats */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{useCase.promptTemplates?.length || 0} Prompts</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <GitBranch className="w-3.5 h-3.5" />
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
                    className="w-full mt-3 bg-white text-foreground border border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-white dark:border-neutral-600 dark:hover:bg-neutral-700 rounded-md text-xs h-8"
                    variant="outline"
                    size="sm"
                  >
                    <Code2 className="w-3.5 h-3.5 mr-1.5" />
                    Manage Prompts
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="fixed bottom-4 right-4">
        <Button
          size="lg"
          className="rounded-md shadow-lg bg-neutral-100 text-foreground border border-neutral-300 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-white dark:border-neutral-600 dark:hover:bg-neutral-800 text-sm h-10 px-4"
          onClick={() => router.push('/new-usecase')}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Use Case
        </Button>
      </div>
    </div>
  );
}