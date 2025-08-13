'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Plus, Search, TrendingUp, Zap, DollarSign, Clock, User, X, Eye, Trash2, RefreshCw, AlertTriangle, Users, Building2, Edit as EditIcon, ArrowRight as ArrowRightIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useUseCases, useUpdateUseCaseStage, useDeleteUseCase, type MappedUseCase } from '@/hooks/useUseCases';
import OrganizationUserManagement from '@/components/OrganizationUserManagement';
import { useUserData } from '@/contexts/UserContext';
import ClerkInvitationHandler from '@/components/ClerkInvitationHandler';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  useDroppable,
} from '@dnd-kit/core';

const stages = [
  { id: 'discovery', title: 'Discovery', color: 'bg-white', textColor: 'text-foreground' },
  { id: 'business-case', title: 'Business Case', color: 'bg-white', textColor: 'text-foreground' },
  { id: 'proof-of-value', title: 'Proof of Value', color: 'bg-white', textColor: 'text-foreground' },
  { id: 'backlog', title: 'Backlog', color: 'bg-white', textColor: 'text-foreground' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-white', textColor: 'text-foreground' },
  { id: 'solution-validation', title: 'Solution Validation', color: 'bg-white', textColor: 'text-foreground' },
  { id: 'pilot', title: 'Pilot', color: 'bg-white', textColor: 'text-foreground' },
  { id: 'deployment', title: 'Deployment', color: 'bg-white', textColor: 'text-foreground' }
] as const;

const _STAGE_ORDER = [
  'discovery',
  'business-case',
  'proof-of-value',
  'backlog',
  'in-progress',
  'solution-validation',
  'pilot',
  'deployment',
];

const _priorities = {
  CRITICAL: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Critical' },
  HIGH: { color: 'bg-orange-50 text-orange-700 border-orange-200', label: 'High' },
  MEDIUM: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Medium' },
  LOW: { color: 'bg-green-50 text-green-700 border-green-200', label: 'Low' }
} as const;

const getNextStage = (currentStage: string) => {
  const idx = _STAGE_ORDER.indexOf(currentStage);
  return idx >= 0 && idx < _STAGE_ORDER.length - 1 ? _STAGE_ORDER[idx + 1] : currentStage;
}

// Draggable Use Case Card Component
const DraggableUseCaseCard = ({ useCase, onClick, handlePriorityChange, formatAiucId, stripHtmlTags, _priorities, handleDelete, isDeleting }: {
  useCase: MappedUseCase;
  onClick: () => void;
  handlePriorityChange: (useCaseId: string, newPriority: string) => void;
  formatAiucId: (aiucId: string | number | undefined, id: string) => string;
  stripHtmlTags: (html: string) => string;
  _priorities: any;
  handleDelete: (id: string) => void;
  isDeleting: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: useCase.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`card-interactive p-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'shadow-xl scale-105 z-50' : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
             <div className="flex flex-col gap-1">
         <div className="flex items-center justify-between">
           <div className="font-bold text-[10px] text-gray-500">{formatAiucId(useCase.aiucId, useCase.id)}</div>
           <div className="flex items-center gap-1">
             {useCase.priority && (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <span 
                     className={`text-[10px] px-1 py-0.5 rounded-full font-semibold cursor-pointer flex items-center gap-1 ${_priorities[useCase.priority as keyof typeof _priorities]?.color || 'bg-gray-100'}`}
                     onClick={(e) => e.stopPropagation()}
                   >
                     {_priorities[useCase.priority as keyof typeof _priorities]?.label || useCase.priority}
                   </span>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end">
                   {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => (
                     <DropdownMenuItem 
                       key={priority} 
                       onClick={(e) => {
                         e.stopPropagation();
                         handlePriorityChange(useCase.id, priority);
                       }}
                     >
                       {_priorities[priority as keyof typeof _priorities]?.label || priority}
                     </DropdownMenuItem>
                   ))}
                 </DropdownMenuContent>
               </DropdownMenu>
             )}
                           <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDeleting) {
                    handleDelete(useCase.id);
                  }
                }}
                disabled={isDeleting}
                className={`p-1 rounded-full transition-colors ${
                  isDeleting 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                }`}
                title={isDeleting ? "Deleting..." : "Delete use case"}
              >
                {isDeleting ? (
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
              </button>
           </div>
         </div>
        <div className="font-semibold text-base text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{useCase.title}</div>
        <div className="text-xs text-gray-500 line-clamp-1">{stripHtmlTags(useCase.description)}</div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-0.5 text-[11px] text-blue-700"><TrendingUp className="w-3 h-3" />{useCase.scores.operational}</div>
          <div className="flex items-center gap-0.5 text-[11px] text-purple-700"><Zap className="w-3 h-3" />{useCase.scores.productivity}</div>
          <div className="flex items-center gap-0.5 text-[11px] text-green-700"><DollarSign className="w-3 h-3" />{useCase.scores.revenue}</div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
          <span className="flex items-center gap-0.5">
            {useCase.creator.type === 'user' ? (
              <User className="w-3 h-3" />
            ) : (
              <Building2 className="w-3 h-3" />
            )}
            {useCase.creator.name}
          </span>
        </div>
      </div>
    </Card>
  );
};

// Droppable Stage Column Component
const DroppableStageColumn = ({ stage, stageUseCases, children }: {
  stage: typeof stages[number];
  stageUseCases: MappedUseCase[];
  children: React.ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`space-y-2 min-h-[200px] p-2 rounded-lg border-2 border-dashed transition-colors ${
        isOver 
          ? 'bg-blue-50 border-blue-300 shadow-lg' 
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      {isOver && (
        <div className="text-center text-blue-600 text-xs font-medium mb-2">
          Drop here to move to {stage.title}
        </div>
      )}
      {children}
    </div>
  );
};

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedUseCase, setSelectedUseCase] = useState<MappedUseCase | null>(null);
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>(''); // '' means All Organizations
  const [modalUseCase, setModalUseCase] = useState<MappedUseCase | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [validationError, setValidationError] = useState<{ show: boolean; fields: string[]; useCaseTitle: string }>({ show: false, fields: [], useCaseTitle: '' });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deletingUseCaseId, setDeletingUseCaseId] = useState<string | null>(null);
  const [deletedUseCaseIds, setDeletedUseCaseIds] = useState<Set<string>>(new Set());

  // Get user data from context
  const { userData } = useUserData();

  // React Query hooks for optimized data fetching
  const { data: useCases = [], error, refetch, updateUseCase } = useUseCases();
  const updateStageMutation = useUpdateUseCaseStage();
  const deleteUseCaseMutation = useDeleteUseCase();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    // Fetch organizations for the dropdown - only for QZEN_ADMIN users
    const fetchOrganizations = async () => {
      try {
        const res = await fetch('/api/admin/organizations');
        const data = await res.json();
        if (res.ok && Array.isArray(data.organizations)) {
          setOrganizations(data.organizations);
        }
      } catch (err) {
        // fail silently for now
      }
    };
    
    // Only fetch organizations if user is QZEN_ADMIN
    if (userData?.role === 'QZEN_ADMIN') {
      fetchOrganizations();
    }
  }, [userData?.role]);

  // Sync pending changes on component mount
  useEffect(() => {
    const pendingChanges = JSON.parse(localStorage.getItem('pendingStageChanges') || '[]');
    if (pendingChanges.length > 0) {
      console.log(`Found ${pendingChanges.length} pending changes, syncing...`);
      syncPendingChanges();
    }
  }, []);

  // Add state for pending changes indicator
  const [pendingChangesCount, setPendingChangesCount] = useState(0);

  // Monitor pending changes
  useEffect(() => {
    const checkPendingChanges = () => {
      const pendingChanges = JSON.parse(localStorage.getItem('pendingStageChanges') || '[]');
      setPendingChangesCount(pendingChanges.length);
    };

    checkPendingChanges();
    const interval = setInterval(checkPendingChanges, 1000);
    return () => clearInterval(interval);
  }, []);

  // Clear deleted use case IDs on component mount to ensure fresh data
  useEffect(() => {
    setDeletedUseCaseIds(new Set());
  }, []);

  const handleEdit = (id: string) => {
    router.push(`/edit-usecase/${id}`);
  }

  const handleView = (id: string) => {
    router.push(`/view-usecase/${id}`);
  }

  const handleAssess = (id: string) => {
    router.push(`/dashboard/${id}/assess`);
  }

  const handleDelete = async (id: string) => {
    // First confirmation
    if (!confirm('Are you sure you want to delete this use case? This action cannot be undone.')) {
      return;
    }
    
    // Second confirmation
    if (!confirm('This action is irreversible. Are you absolutely certain you want to delete this use case?')) {
      return;
    }

    try {
      // Show loading state
      setDeletingUseCaseId(id);
      setSelectedUseCase(null);
      
      // Add to deleted set immediately for instant UI feedback
      setDeletedUseCaseIds(prev => new Set([...prev, id]));
      
      await deleteUseCaseMutation.mutateAsync(id);
      
      // Close modal if it's open
      if (modalUseCase?.id === id) {
        setIsSheetOpen(false);
        setModalUseCase(null);
      }
      
      // Refetch data to ensure consistency with backend
      await refetch();
      
    } catch (error) {
      console.error('Error deleting use case:', error);
      // Remove from deleted set on error
      setDeletedUseCaseIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      if (error instanceof Error) {
        alert(`Failed to delete use case: ${error.message}`);
      } else {
        alert('Failed to delete use case. Please try again.');
      }
    } finally {
      // Clear loading state
      setDeletingUseCaseId(null);
    }
  };

  // Add organization filtering to use cases
  const orgFilteredUseCases = selectedOrgId
    ? useCases.filter((uc: any) => uc.organizationId === selectedOrgId)
    : useCases;

  const filteredUseCases = orgFilteredUseCases.filter(useCase => {
    // Skip deleted use cases
    if (deletedUseCaseIds.has(useCase.id)) {
      return false;
    }
    
    const matchesSearch = useCase.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      useCase.owner?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy.toLowerCase() === 'all' ||
      (useCase.priority && useCase.priority.toLowerCase() === filterBy.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  // Helper to check if all required fields are filled
  const getFieldDisplayName = (fieldName: string): string => {
    const fieldMap: { [key: string]: string } = {
      'title': 'Use Case Title',
      'problemStatement': 'Problem Statement',
      'proposedAISolution': 'Proposed AI Solution',
      'keyBenefits': 'Key Benefits',
      'primaryStakeholders': 'Primary Stakeholders',
      'secondaryStakeholders': 'Secondary Stakeholders',
      'successCriteria': 'Success Criteria',
      'keyAssumptions': 'Key Assumptions',
      'initialROI': 'Initial ROI',
      'initialCost': 'Initial Cost',
      'plannedStartDate': 'Planned Start Date',
      'estimatedTimelineMonths': 'Estimated Timeline (Months)',
      'confidenceLevel': 'Confidence Level',
      'operationalImpactScore': 'Operational Impact Score',
      'productivityImpactScore': 'Productivity Impact Score',
      'revenueImpactScore': 'Revenue Impact Score',
      'implementationComplexity': 'Implementation Complexity',
      'requiredResources': 'Required Resources',
      'businessFunction': 'Business Function',
      'aiucId': 'AI Use Case ID'
    };
    return fieldMap[fieldName] || fieldName;
  };

  const getMissingFields = (useCase: MappedUseCase): string[] => {
    // Only check these essential fields for moving from discovery to business-case
    const requiredFields = [
      'title',
      'problemStatement', 
      'proposedAISolution',
      'keyBenefits',
      'primaryStakeholders',
      'successCriteria',
      'initialROI',
      'initialCost',
      'plannedStartDate',
      'estimatedTimelineMonths'
    ];
    
    const missingFields: string[] = [];
    requiredFields.forEach(k => {
      const v = (useCase as any)[k];
      let isEmpty = false;
      
      if (Array.isArray(v)) {
        isEmpty = v.length === 0;
      } else if (typeof v === 'string') {
        isEmpty = !v || !v.trim();
      } else if (typeof v === 'number') {
        isEmpty = v === null || v === undefined;
      } else {
        isEmpty = !v;
      }
      
      if (isEmpty) {
        missingFields.push(getFieldDisplayName(k));
      }
    });
    
    return missingFields;
  };

  const isUseCaseComplete = (useCase: MappedUseCase) => {
    return getMissingFields(useCase).length === 0;
  };

  // Helper function to strip HTML tags and get plain text
  const stripHtmlTags = (html: string): string => {
    if (!html) return '';
    // Remove HTML tags and decode entities
    const stripped = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return stripped;
  };

  // Helper function to format AIUC ID
  const formatAiucId = (aiucId: string | number | undefined, id: string): string => {
    if (aiucId) {
      const aiucIdStr = String(aiucId);
      // If aiucId already has AICU- prefix, return as is
      if (aiucIdStr.startsWith('AICU-')) {
        return aiucIdStr;
      }
      // Otherwise add AICU- prefix
      return `AICU-${aiucIdStr}`;
    }
    // Fallback to using regular id with AICU- prefix
    return `AICU-${id}`;
  };

  // Fix: Only show use cases in the column matching their current stage
  const getUseCasesByStage = (stageId: string) => {
    return filteredUseCases.filter(useCase => useCase.stage === stageId);
  };

  const getOverallScore = (scores: { operational: number, productivity: number, revenue: number }) =>
    ((scores.operational + scores.productivity + scores.revenue) / 3).toFixed(1);

  // Handler to update the stage of a use case
  const handleMoveToStage = async (useCaseId: string, newStage: string) => {
    const useCase = filteredUseCases.find(uc => uc.id === useCaseId);
    if (useCase && useCase.stage === 'discovery' && newStage === 'business-case') {
      const missingFields = getMissingFields(useCase);
      if (missingFields.length > 0) {
        setValidationError({ 
          show: true, 
          fields: missingFields, 
          useCaseTitle: useCase.title 
        });
        return;
      }
    }
    
    // Update frontend immediately for instant feedback
    updateUseCase(useCaseId, { stage: newStage });
    
    // Clear any validation errors
    setValidationError({ show: false, fields: [], useCaseTitle: '' });
    
    // Update local state immediately for better UX
    setSelectedUseCase((prev: MappedUseCase | null) =>
      prev ? { ...prev, stage: newStage } : prev
    );
    setSelectedUseCase(null);
    
    // Store the change in local storage for persistence
    const pendingChanges = JSON.parse(localStorage.getItem('pendingStageChanges') || '[]');
    pendingChanges.push({
      useCaseId,
      oldStage: useCase?.stage,
      newStage,
      timestamp: Date.now()
    });
    localStorage.setItem('pendingStageChanges', JSON.stringify(pendingChanges));
    
    // Update backend in the background (non-blocking)
    updateStageMutation.mutateAsync({ useCaseId, newStage })
      .then(() => {
        console.log(`Successfully moved use case ${useCaseId} to stage ${newStage}`);
        // Remove from pending changes on success
        const updatedPendingChanges = JSON.parse(localStorage.getItem('pendingStageChanges') || '[]')
          .filter((change: any) => !(change.useCaseId === useCaseId && change.newStage === newStage));
        localStorage.setItem('pendingStageChanges', JSON.stringify(updatedPendingChanges));
      })
      .catch((error) => {
        console.error("Unable to update stage", error);
        // Revert the frontend update on error
        if (useCase) {
          updateUseCase(useCaseId, { stage: useCase.stage });
        }
        // Remove from pending changes on error
        const updatedPendingChanges = JSON.parse(localStorage.getItem('pendingStageChanges') || '[]')
          .filter((change: any) => !(change.useCaseId === useCaseId && change.newStage === newStage));
        localStorage.setItem('pendingStageChanges', JSON.stringify(updatedPendingChanges));
      });
  };

  // Add a handler to update priority (stub for now)
  const handlePriorityChange = async (useCaseId: string, newPriority: string) => {
    try {
      const response = await fetch('/api/update-priority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useCaseId, priority: newPriority })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update priority');
      }
      // Fetch fresh data from the backend to ensure consistency
      await refetch();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Function to sync pending changes with backend
  const syncPendingChanges = async () => {
    try {
      const pendingChanges = JSON.parse(localStorage.getItem('pendingStageChanges') || '[]');
      if (pendingChanges.length === 0) return;

      console.log(`Syncing ${pendingChanges.length} pending changes...`);
      
      for (const change of pendingChanges) {
        try {
          await updateStageMutation.mutateAsync({ 
            useCaseId: change.useCaseId, 
            newStage: change.newStage 
          });
          console.log(`Synced change for use case ${change.useCaseId}`);
        } catch (error) {
          console.error(`Failed to sync change for use case ${change.useCaseId}:`, error);
        }
      }
      
      // Clear pending changes after successful sync
      localStorage.removeItem('pendingStageChanges');
      console.log('All pending changes synced successfully');
    } catch (error) {
      console.error('Error syncing pending changes:', error);
    }
  };

  // Function to retry failed changes
  const retryFailedChanges = () => {
    const pendingChanges = JSON.parse(localStorage.getItem('pendingStageChanges') || '[]');
    if (pendingChanges.length > 0) {
      console.log(`Retrying ${pendingChanges.length} failed changes...`);
      syncPendingChanges();
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const useCaseId = active.id as string;
    const targetId = over.id as string;

    // Check if the target is a stage column
    const isTargetStage = stages.some(stage => stage.id === targetId);
    
    if (isTargetStage) {
      const useCase = filteredUseCases.find(uc => uc.id === useCaseId);
      if (useCase && useCase.stage !== targetId) {
        // Validate if moving from discovery to business-case
        if (useCase.stage === 'discovery' && targetId === 'business-case') {
          const missingFields = getMissingFields(useCase);
          if (missingFields.length > 0) {
            setValidationError({ 
              show: true, 
              fields: missingFields, 
              useCaseTitle: useCase.title 
            });
            return;
          }
        }

        // Update frontend immediately for instant feedback
        updateUseCase(useCaseId, { stage: targetId });
        
        // Clear any validation errors
        setValidationError({ show: false, fields: [], useCaseTitle: '' });
        
        // Store the change in local storage for persistence
        const pendingChanges = JSON.parse(localStorage.getItem('pendingStageChanges') || '[]');
        pendingChanges.push({
          useCaseId,
          oldStage: useCase.stage,
          newStage: targetId,
          timestamp: Date.now()
        });
        localStorage.setItem('pendingStageChanges', JSON.stringify(pendingChanges));
        
        // Update backend in the background (non-blocking)
        updateStageMutation.mutateAsync({ useCaseId, newStage: targetId })
          .then(() => {
            console.log(`Successfully moved use case ${useCaseId} to stage ${targetId}`);
            // Remove from pending changes on success
            const updatedPendingChanges = JSON.parse(localStorage.getItem('pendingStageChanges') || '[]')
              .filter((change: any) => !(change.useCaseId === useCaseId && change.newStage === targetId));
            localStorage.setItem('pendingStageChanges', JSON.stringify(updatedPendingChanges));
          })
          .catch((error) => {
            console.error("Unable to update stage", error);
            // Revert the frontend update on error
            updateUseCase(useCaseId, { stage: useCase.stage });
            // Remove from pending changes on error
            const updatedPendingChanges = JSON.parse(localStorage.getItem('pendingStageChanges') || '[]')
              .filter((change: any) => !(change.useCaseId === useCaseId && change.newStage === targetId));
            localStorage.setItem('pendingStageChanges', JSON.stringify(updatedPendingChanges));
          });
      }
    }
  };



  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <AlertTriangle className="error-icon" />
          <h2 className="error-title">Unable to Load Dashboard</h2>
          <p className="error-message">{error.message}</p>
          <button 
            onClick={() => refetch()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <ClerkInvitationHandler />
      <div className="page-container">
        {/* Header with role-based tabs */}
        <div className="page-header">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="page-title">Dashboard</h1>
              {userData?.organization && (
                <p className="page-subtitle">
                  {userData.organization.name} • <span className="text-primary font-medium">{userData.role === 'ORG_ADMIN' ? 'Organization Admin' : 'User'}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search use cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-standard pl-12"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="select-standard"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={selectedOrgId}
              onChange={e => setSelectedOrgId(e.target.value)}
              className="select-standard"
              style={{ minWidth: 180 }}
            >
              <option value="">All Departments</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
            <Button onClick={() => router.push('/new-usecase')} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Use Case
            </Button>
                         <Button onClick={refetch} variant="outline" className="btn-outline flex items-center gap-2">
               <RefreshCw className="w-4 h-4" />
               Refresh
             </Button>
             {pendingChangesCount > 0 && (
               <Button 
                 onClick={retryFailedChanges} 
                 variant="outline" 
                 className="btn-outline flex items-center gap-2 bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
               >
                 <AlertTriangle className="w-4 h-4" />
                 Sync Changes ({pendingChangesCount})
               </Button>
             )}
          </div>
        </div>

        {/* Validation Error Alert */}
        {validationError.show && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Missing Required Fields</AlertTitle>
            <AlertDescription>
              <div className="mt-2">
                <p className="mb-2">
                  Please complete the following required fields for "{validationError.useCaseTitle}" before moving to the Business Case stage:
                </p>
                <ul className="list-disc list-inside space-y-1 mb-3">
                  {validationError.fields.map((field, index) => (
                    <li key={index} className="text-sm">{field}</li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => {
                      const useCase = filteredUseCases.find(uc => uc.title === validationError.useCaseTitle);
                      if (useCase) {
                        router.push(`/edit-usecase/${useCase.id}`);
                      }
                      setValidationError({ show: false, fields: [], useCaseTitle: '' });
                    }}
                  >
                    Edit Use Case
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setValidationError({ show: false, fields: [], useCaseTitle: '' })}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

                 {/* Kanban board with drag and drop */}
         <div className="relative">
           {deletingUseCaseId && (
             <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
               <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-lg shadow-lg border">
                 <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                 <p className="text-sm font-medium text-gray-700">Deleting use case...</p>
               </div>
             </div>
           )}
           <DndContext
             sensors={sensors}
             collisionDetection={closestCorners}
             onDragStart={handleDragStart}
             onDragEnd={handleDragEnd}
           >
          <div className="relative w-full mb-8">
            <div className="w-full pb-6 overflow-x-auto">
              <div className="flex flex-row gap-4 min-w-[2000px]">
                {stages.map((stage, idx) => {
                  const stageUseCases = getUseCasesByStage(stage.id);
                  return (
                    <div key={stage.id} className="flex flex-col items-center w-60">
                      {/* Summary card */}
                      <div className="card-interactive w-60 h-20 mb-2 flex flex-col items-center justify-center group">
                        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                          {idx === 0 && <Search className="text-blue-500 w-5 h-5" />}
                          {idx === 1 && <DollarSign className="text-green-500 w-5 h-5" />}
                          {idx === 2 && <TrendingUp className="text-purple-500 w-5 h-5" />}
                          {idx === 3 && <Clock className="text-orange-500 w-5 h-5" />}
                          {idx === 4 && <Zap className="text-pink-500 w-5 h-5" />}
                          {idx === 5 && <Users className="text-teal-500 w-5 h-5" />}
                          {idx === 6 && <User className="text-indigo-500 w-5 h-5" />}
                          {idx === 7 && <Clock className="text-red-500 w-5 h-5" />}
                        </div>
                        <div className="font-semibold text-gray-700 text-sm group-hover:text-blue-600 transition-colors">{stage.title}</div>
                        <div className="text-2xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">{stageUseCases.length}</div>
                      </div>
                      {/* Use case column */}
                      <div className="flex-shrink-0 w-60 space-y-4">
                        <div className="flex items-center justify-between mb-1 px-1">
                          <h3 className="font-semibold text-sm text-gray-800">{stage.title}</h3>
                          <span className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded-full">
                            {stageUseCases.length}
                          </span>
                        </div>
                                                 <DroppableStageColumn stage={stage} stageUseCases={stageUseCases}>
                           <SortableContext items={stageUseCases.map(uc => uc.id)} strategy={verticalListSortingStrategy}>
                             {stageUseCases.length === 0 ? (
                               <div className="bg-gray-50 rounded-lg p-3 text-center text-gray-400 border border-dashed border-gray-200 text-xs">No use cases in this stage</div>
                             ) : stageUseCases.map((useCase) => (
                                                                                               <DraggableUseCaseCard
                                   key={useCase.id}
                                   useCase={useCase}
                                   onClick={() => { setModalUseCase(useCase); setIsSheetOpen(true); }}
                                   handlePriorityChange={handlePriorityChange}
                                   formatAiucId={formatAiucId}
                                   stripHtmlTags={stripHtmlTags}
                                   _priorities={_priorities}
                                   handleDelete={handleDelete}
                                   isDeleting={deletingUseCaseId === useCase.id}
                                 />
                             ))}
                           </SortableContext>
                         </DroppableStageColumn>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeId ? (
              (() => {
                const useCase = filteredUseCases.find(uc => uc.id === activeId);
                if (!useCase) return null;
                return (
                  <Card className="card-interactive p-3 w-60">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-[10px] text-gray-500">{formatAiucId(useCase.aiucId, useCase.id)}</div>
                        {useCase.priority && (
                          <span className={`text-[10px] px-1 py-0.5 rounded-full font-semibold ${_priorities[useCase.priority as keyof typeof _priorities]?.color || 'bg-gray-100'}`}>
                            {_priorities[useCase.priority as keyof typeof _priorities]?.label || useCase.priority}
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-base text-gray-900 line-clamp-1">{useCase.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{stripHtmlTags(useCase.description)}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5 text-[11px] text-blue-700"><TrendingUp className="w-3 h-3" />{useCase.scores.operational}</div>
                        <div className="flex items-center gap-0.5 text-[11px] text-purple-700"><Zap className="w-3 h-3" />{useCase.scores.productivity}</div>
                        <div className="flex items-center gap-0.5 text-[11px] text-green-700"><DollarSign className="w-3 h-3" />{useCase.scores.revenue}</div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                        <span className="flex items-center gap-0.5">
                          {useCase.creator.type === 'user' ? (
                            <User className="w-3 h-3" />
                          ) : (
                            <Building2 className="w-3 h-3" />
                          )}
                          {useCase.creator.name}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })()
            ) : null}
                     </DragOverlay>
         </DndContext>
         </div>

        {/* Sheet Modal for Use Case Actions */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="right">
            {modalUseCase && (
              <>
                <SheetHeader>
                  <SheetTitle>{modalUseCase.title}</SheetTitle>
                  <SheetDescription>{stripHtmlTags(modalUseCase.description)}</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-2 p-4">
                  <div className="text-xs text-gray-500 mb-2">ID: {formatAiucId(modalUseCase.aiucId, modalUseCase.id)}</div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1 text-xs text-blue-700"><TrendingUp className="w-4 h-4" />{modalUseCase.scores.operational}</div>
                    <div className="flex items-center gap-1 text-xs text-purple-700"><Zap className="w-4 h-4" />{modalUseCase.scores.productivity}</div>
                    <div className="flex items-center gap-1 text-xs text-green-700"><DollarSign className="w-4 h-4" />{modalUseCase.scores.revenue}</div>
                    <div className="flex items-center gap-1 text-xs text-blue-500 font-bold">{getOverallScore(modalUseCase.scores)}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                    {modalUseCase.creator.type === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Building2 className="w-4 h-4" />
                    )}
                    Created by: {modalUseCase.creator.name}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">Updated {modalUseCase.lastUpdated}</div>
                </div>
                <SheetFooter>
                  <Button size="sm" variant="outline" onClick={() => { handleView(modalUseCase.id); setIsSheetOpen(false); }}>
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Button>
                  {(userData?.role === 'USER' || userData?.role === 'ORG_ADMIN' || userData?.role === 'ORG_USER' || userData?.role === 'QZEN_ADMIN') && (
                    <Button size="sm" variant="outline" onClick={() => { handleEdit(modalUseCase.id); setIsSheetOpen(false); }}>
                      <EditIcon className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  )}
                  {(userData?.role === 'USER' || userData?.role === 'ORG_ADMIN' || userData?.role === 'ORG_USER' || userData?.role === 'QZEN_ADMIN') && modalUseCase.stage !== 'deployment' && (
                                         <Button 
                       size="sm" 
                       variant="outline" 
                       onClick={() => { 
                         handleMoveToStage(modalUseCase.id, getNextStage(modalUseCase.stage)); 
                         setIsSheetOpen(false); 
                       }}
                     >
                       <ArrowRightIcon className="w-4 h-4 mr-1" />
                       Move to Next Stage
                     </Button>
                  )}
                  {(userData?.role === 'USER' || userData?.role === 'ORG_ADMIN' || userData?.role === 'ORG_USER' || userData?.role === 'QZEN_ADMIN') && modalUseCase.stage !== 'discovery' && (
                    <Button size="sm" variant="outline" onClick={() => { handleAssess(modalUseCase.id); setIsSheetOpen(false); }}>
                      <Zap className="w-4 h-4 mr-1" /> Assess
                    </Button>
                  )}
                  <SheetClose asChild>
                    <Button size="sm" variant="secondary">Close</Button>
                  </SheetClose>
                </SheetFooter>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Dashboard;