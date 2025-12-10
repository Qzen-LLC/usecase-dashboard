'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Code2,
  Search,
  ChevronRight,
  FileText,
  GitBranch,
  Clock,
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
const ELIGIBLE_STAGES = [
  'business-case',
  'proof-of-value',
  'backlog',
  'in-progress',
  'solution-validation',
  'pilot',
  'deployment',
];

const stageBadgeColors: Record<string, string> = {
  'business-case':
    'bg-muted text-foreground/80 border border-border/60 dark:bg-neutral-900 dark:text-neutral-100',
  'proof-of-value':
    'bg-muted text-foreground/80 border border-border/60 dark:bg-neutral-900 dark:text-neutral-100',
  backlog:
    'bg-muted text-foreground/80 border border-border/60 dark:bg-neutral-900 dark:text-neutral-100',
  'in-progress':
    'bg-muted text-foreground/80 border border-border/60 dark:bg-neutral-900 dark:text-neutral-100',
  'solution-validation':
    'bg-muted text-foreground/80 border border-border/60 dark:bg-neutral-900 dark:text-neutral-100',
  pilot:
    'bg-muted text-foreground/80 border border-border/60 dark:bg-neutral-900 dark:text-neutral-100',
  deployment:
    'bg-muted text-foreground/80 border border-border/60 dark:bg-neutral-900 dark:text-neutral-100',
};

const formatStageLabel = (stage: string) =>
  stage
    ?.split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export default function UseCaseDevelopmentDashboard() {
  const router = useRouter();
  const { user } = useUserClient<any>(); // keeping for parity, even if not used directly
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [filteredUseCases, setFilteredUseCases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  useEffect(() => {
    fetchUseCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterUseCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useCases, searchTerm, selectedStage]);

  const fetchUseCases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/read-usecases');
      if (!response.ok) throw new Error('Failed to fetch use cases');

      const data = await response.json();
      const allUseCases = (data.useCases || []) as UseCase[];

      // Filter for eligible stages only
      const eligibleUseCases = allUseCases.filter((uc) =>
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

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (uc) =>
          uc.title.toLowerCase().includes(q) ||
          uc.businessFunction?.toLowerCase().includes(q)
      );
    }

    if (selectedStage !== 'all') {
      filtered = filtered.filter((uc) => uc.stage === selectedStage);
    }

    setFilteredUseCases(filtered);
  };

  const handleUseCaseClick = (useCaseId: string) => {
    router.push(`/dashboard/use-case-development/${useCaseId}`);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const totalUseCases = useCases.length;
  const inDevelopmentCount = useCases.filter(
    (uc) => uc.stage === 'in-progress'
  ).length;
  const readyForPilotCount = useCases.filter(
    (uc) => uc.stage === 'pilot'
  ).length;
  const totalPrompts = useCases.reduce(
    (sum, uc) => sum + (uc.promptTemplates?.length || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            Loading use case development workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* KPI Row (Stats) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <Card className="bg-card border border-border rounded-md hover:shadow-sm transition-shadow">
            <CardContent className="px-3 py-3">
              <p className="text-[11px] font-medium text-muted-foreground mb-1">
                Total Eligible Use Cases
              </p>
              <p className="text-xl font-semibold text-foreground">
                {totalUseCases}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border rounded-md hover:shadow-sm transition-shadow">
            <CardContent className="px-3 py-3">
              <p className="text-[11px] font-medium text-muted-foreground mb-1">
                In Development
              </p>
              <p className="text-xl font-semibold text-foreground">
                {inDevelopmentCount}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border rounded-md hover:shadow-sm transition-shadow">
            <CardContent className="px-3 py-3">
              <p className="text-[11px] font-medium text-muted-foreground mb-1">
                Ready for Pilot
              </p>
              <p className="text-xl font-semibold text-foreground">
                {readyForPilotCount}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border rounded-md hover:shadow-sm transition-shadow">
            <CardContent className="px-3 py-3">
              <p className="text-[11px] font-medium text-muted-foreground mb-1">
                Total Prompts
              </p>
              <p className="text-xl font-semibold text-foreground">
                {totalPrompts}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Filters */}
        <section className="bg-card border border-border rounded-md mb-5">
          <div className="p-3 flex flex-col md:flex-row gap-3 items-start md:items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by use case or business function..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 text-xs bg-background border-border"
              />
            </div>

            {/* Stage Filters (compact, enterprise segmented buttons) */}
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={selectedStage === 'all' ? 'default' : 'outline'}
                size="sm"
                className="h-8 px-3 text-[11px]"
                onClick={() => setSelectedStage('all')}
              >
                All Stages
              </Button>
              {ELIGIBLE_STAGES.map((stage) => (
                <Button
                  key={stage}
                  variant={selectedStage === stage ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 px-3 text-[11px]"
                  onClick={() => setSelectedStage(stage)}
                >
                  {formatStageLabel(stage)}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Grid */}
        {filteredUseCases.length === 0 ? (
          <Card className="bg-card border border-border rounded-md">
            <CardContent className="py-8 px-4">
              <div className="flex flex-col items-center text-center gap-3 max-w-md mx-auto">
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  No use cases in development stages
                </h3>
                <p className="text-xs text-muted-foreground">
                  Use cases will appear here once they move into Backlog or
                  later stages. Advance use cases through the pipeline to begin
                  structured prompt development.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredUseCases.map((useCase) => {
              const stageClass =
                stageBadgeColors[useCase.stage] ||
                'bg-muted text-foreground/80 border border-border/60';
              const promptCount = useCase.promptTemplates?.length || 0;

              return (
                <Card
                  key={useCase.id}
                  className="bg-card border border-border rounded-md hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleUseCaseClick(useCase.id)}
                >
                  <CardHeader className="px-3 pt-3 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-sm ${stageClass}`}
                      >
                        {formatStageLabel(useCase.stage)}
                      </Badge>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <CardTitle className="mt-1 text-sm font-semibold leading-snug line-clamp-2 text-foreground">
                      {useCase.title}
                    </CardTitle>
                    {useCase.businessFunction && (
                      <CardDescription className="mt-0.5 text-[11px] text-muted-foreground">
                        {useCase.businessFunction}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div className="space-y-2.5">
                      {/* Prompt & Version Row */}
                      <div className="flex items-center justify-between text-[11px] bg-muted/60 dark:bg-neutral-900/60 rounded-sm px-2 py-1.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{promptCount} prompts</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <GitBranch className="w-3.5 h-3.5" />
                          <span>0 versions</span>
                        </div>
                      </div>

                      {/* Dates Row (Created) */}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/40 dark:bg-neutral-900/50 rounded-sm px-2 py-1.5">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Created {formatDate(useCase.createdAt)}</span>
                        </div>
                      </div>

                      {/* Primary Action */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 mt-2 text-[11px] justify-center border-border bg-background hover:bg-muted"
                      >
                        <Code2 className="w-3.5 h-3.5 mr-1.5" />
                        Manage prompts
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}