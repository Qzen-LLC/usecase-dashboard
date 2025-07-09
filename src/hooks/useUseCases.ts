import { useState, useEffect } from 'react';

// Base UseCase type from the API
interface UseCase {
  id: string;
  title: string;
  stage?: string;
  priority?: string;
  primaryStakeholders?: string[];
  aiucId?: string;
  problemStatement?: string;
  proposedAISolution?: string;
  currentState?: string;
  desiredState?: string;
  secondaryStakeholders?: string[];
  successCriteria?: string[];
  problemValidation?: string;
  solutionHypothesis?: string;
  keyAssumptions?: string[];
  initialROI?: number;
  confidenceLevel?: number;
  operationalImpactScore?: number;
  productivityImpactScore?: number;
  revenueImpactScore?: number;
  implementationComplexity?: number;
  estimatedTimeline?: string;
  requiredResources?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Mapped UseCase type with frontend-specific fields
export interface MappedUseCase extends UseCase {
  stage: string;
  priority: string;
  owner: string;
  lastUpdated: string;
  description: string;
  scores: {
    operational: number;
    productivity: number;
    revenue: number;
  };
  complexity: number;
  roi: number;
  timeline: string;
  stakeholders: string[];
  risks: string[];
}

// Hook return types
interface UseUseCasesReturn {
  data: MappedUseCase[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseUpdateUseCaseStageReturn {
  mutateAsync: (params: { useCaseId: string; newStage: string }) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

interface UseDeleteUseCaseReturn {
  mutateAsync: (useCaseId: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

// Main hook for fetching use cases
export function useUseCases(): UseUseCasesReturn {
  const [data, setData] = useState<MappedUseCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUseCases = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/read-usecases');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const useCases = await response.json();
      
      // Map the data to include frontend-specific fields
      const mappedUseCases: MappedUseCase[] = (useCases.data || useCases || []).map((uc: UseCase) => ({
        ...uc,
        stage: uc.stage || 'discovery',
        priority: uc.priority || 'medium',
        owner: uc.primaryStakeholders?.[0] || 'Unknown',
        lastUpdated: uc.updatedAt
          ? new Date(uc.updatedAt).toLocaleDateString()
          : '',
        description: uc.problemStatement || '',
        scores: {
          operational: uc.operationalImpactScore || 0,
          productivity: uc.productivityImpactScore || 0,
          revenue: uc.revenueImpactScore || 0,
        },
        complexity: uc.implementationComplexity || 0,
        roi: uc.initialROI || 0,
        timeline: uc.estimatedTimeline || '',
        stakeholders: uc.primaryStakeholders || [],
        risks: uc.keyAssumptions || [],
      }));
      
      setData(mappedUseCases);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch use cases'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUseCases();
  }, []);

  const refetch = () => {
    fetchUseCases();
  };

  return {
    data,
    isLoading,
    error,
    refetch
  };
}

// Hook for updating use case stage
export function useUpdateUseCaseStage(): UseUpdateUseCaseStageReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async ({ useCaseId, newStage }: { useCaseId: string; newStage: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/update-stage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ useCaseId, newStage }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await response.json();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update use case stage'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutateAsync,
    isLoading,
    error
  };
}

// Hook for deleting use cases
export function useDeleteUseCase(): UseDeleteUseCaseReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (useCaseId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/delete-usecase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ useCaseId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await response.json();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete use case'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutateAsync,
    isLoading,
    error
  };
} 