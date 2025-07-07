import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type UseCase = {
  id: string;
  title: string;
  problemStatement: string;
  proposedAISolution: string;
  currentState: string;
  desiredState: string;
  primaryStakeholders: string[];
  secondaryStakeholders: string[];
  successCriteria: string[];
  problemValidation: string;
  solutionHypothesis: string;
  keyAssumptions: string[];
  initialROI: string;
  confidenceLevel: number;
  operationalImpactScore: number;
  productivityImpactScore: number;
  revenueImpactScore: number;
  implementationComplexity: number;
  estimatedTimeline: string;
  requiredResources: string;
  createdAt: string;
  updatedAt: string;
  priority?: string;
  stage?: string;
  businessFunction: string;
  aiucId: number;
};

export type MappedUseCase = UseCase & {
  owner?: string;
  lastUpdated?: string;
  scores?: {
    operational: number;
    productivity: number;
    revenue: number;
  };
  description?: string;
  complexity?: number;
  roi?: string;
  timeline?: string;
  stakeholders?: string[];
  risks?: string[];
};

// API functions
const fetchUseCases = async (): Promise<UseCase[]> => {
  const response = await fetch('/api/read-usecases');
  if (!response.ok) {
    throw new Error('Failed to fetch use cases');
  }
  return response.json();
};

const updateUseCaseStage = async ({ useCaseId, newStage }: { useCaseId: string; newStage: string }) => {
  const response = await fetch('/api/update-stage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ useCaseId, newStage }),
  });
  if (!response.ok) {
    throw new Error('Failed to update stage');
  }
  return response.json();
};

const updateUseCasePriority = async ({ useCaseId, newPriority }: { useCaseId: string; newPriority: string }) => {
  const response = await fetch('/api/update-priority', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ useCaseId, newPriority }),
  });
  if (!response.ok) {
    throw new Error('Failed to update priority');
  }
  return response.json();
};

const deleteUseCase = async (useCaseId: string) => {
  const response = await fetch(`/api/delete-usecase?id=${useCaseId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete use case');
  }
  return response.json();
};

// Transform raw use case data to mapped format
const transformUseCase = (uc: UseCase): MappedUseCase => ({
  ...uc,
  owner: uc.primaryStakeholders?.[0] || 'Unknown',
  lastUpdated: uc.updatedAt ? new Date(uc.updatedAt).toLocaleDateString() : '',
  description: uc.problemStatement || '',
  scores: {
    operational: uc.operationalImpactScore,
    productivity: uc.productivityImpactScore,
    revenue: uc.revenueImpactScore,
  },
  complexity: uc.implementationComplexity,
  roi: uc.initialROI,
  timeline: uc.estimatedTimeline,
  stakeholders: uc.primaryStakeholders,
  risks: uc.keyAssumptions,
});

// Custom hooks
export const useUseCases = () => {
  return useQuery({
    queryKey: ['usecases'],
    queryFn: fetchUseCases,
    select: (data: UseCase[]) => data.map(transformUseCase),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateUseCaseStage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUseCaseStage,
    onMutate: async ({ useCaseId, newStage }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['usecases'] });
      
      // Snapshot the previous value
      const previousUseCases = queryClient.getQueryData<MappedUseCase[]>(['usecases']);
      
      // Optimistically update the cache
      if (previousUseCases) {
        queryClient.setQueryData<MappedUseCase[]>(['usecases'], old => 
          old?.map(uc => uc.id === useCaseId ? { ...uc, stage: newStage } : uc) || []
        );
      }
      
      return { previousUseCases };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousUseCases) {
        queryClient.setQueryData(['usecases'], context.previousUseCases);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['usecases'] });
    },
  });
};

export const useUpdateUseCasePriority = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUseCasePriority,
    onMutate: async ({ useCaseId, newPriority }) => {
      await queryClient.cancelQueries({ queryKey: ['usecases'] });
      const previousUseCases = queryClient.getQueryData<MappedUseCase[]>(['usecases']);
      
      if (previousUseCases) {
        queryClient.setQueryData<MappedUseCase[]>(['usecases'], old => 
          old?.map(uc => uc.id === useCaseId ? { ...uc, priority: newPriority } : uc) || []
        );
      }
      
      return { previousUseCases };
    },
    onError: (err, variables, context) => {
      if (context?.previousUseCases) {
        queryClient.setQueryData(['usecases'], context.previousUseCases);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['usecases'] });
    },
  });
};

export const useDeleteUseCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUseCase,
    onMutate: async (useCaseId) => {
      await queryClient.cancelQueries({ queryKey: ['usecases'] });
      const previousUseCases = queryClient.getQueryData<MappedUseCase[]>(['usecases']);
      
      if (previousUseCases) {
        queryClient.setQueryData<MappedUseCase[]>(['usecases'], old => 
          old?.filter(uc => uc.id !== useCaseId) || []
        );
      }
      
      return { previousUseCases };
    },
    onError: (err, variables, context) => {
      if (context?.previousUseCases) {
        queryClient.setQueryData(['usecases'], context.previousUseCases);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['usecases'] });
    },
  });
}; 