'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUserClient, useAuthClient } from '@/hooks/useAuthClient';
import { Plus, Search, TrendingUp, Zap, DollarSign, Clock, User, X, Eye, Trash2, RefreshCw, AlertTriangle, Users, Building2, Edit as EditIcon, ArrowRight as ArrowRightIcon, GripVertical } from 'lucide-react';
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
import LockModal from '@/components/LockModal';
import { useLock } from '@/hooks/useLock';
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
  closestCenter,
  rectIntersection,
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
  { id: 'discovery', title: 'Discovery', color: 'bg-card', textColor: 'text-foreground' },
  { id: 'business-case', title: 'Business Case', color: 'bg-card', textColor: 'text-foreground' },
  { id: 'proof-of-value', title: 'Proof of Value', color: 'bg-card', textColor: 'text-foreground' },
  { id: 'backlog', title: 'Backlog', color: 'bg-card', textColor: 'text-foreground' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-card', textColor: 'text-foreground' },
  { id: 'solution-validation', title: 'Solution Validation', color: 'bg-card', textColor: 'text-foreground' },
  { id: 'pilot', title: 'Pilot', color: 'bg-card', textColor: 'text-foreground' },
  { id: 'deployment', title: 'Deployment', color: 'bg-card', textColor: 'text-foreground' }
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
  CRITICAL: { color: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Critical' },
  HIGH: { color: 'bg-warning/10 text-warning border-warning/20', label: 'High' },
  MEDIUM: { color: 'bg-warning/10 text-warning border-warning/20', label: 'Medium' },
  LOW: { color: 'bg-success/10 text-success border-success/20', label: 'Low' }
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
      className={`bg-background border transition-all hover:shadow-sm hover:border-muted-foreground/20 ${
        isDragging ? 'shadow-lg scale-105 z-50 border-primary' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="font-bold text-xs text-muted-foreground">{formatAiucId(useCase.aiucId, useCase.id)}</div>
          <div className="flex items-center gap-2">
            {useCase.priority && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <span 
                    className={`text-xs px-2 py-1 rounded-full font-semibold cursor-pointer flex items-center gap-1 ${_priorities[useCase.priority as keyof typeof _priorities]?.color || 'bg-muted'}`}
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
              className={`p-1.5 rounded-full transition-colors ${
                isDeleting 
                  ? 'text-muted-foreground cursor-not-allowed' 
                  : 'text-destructive hover:text-destructive/80 hover:bg-destructive/10'
              }`}
              title={isDeleting ? "Deleting..." : "Delete use case"}
            >
              {isDeleting ? (
                <div className="w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
        <div className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">{useCase.title}</div>
        <div className="text-xs text-foreground line-clamp-2 leading-relaxed">{stripHtmlTags(useCase.description)}</div>
        {/* Removed per request: operational/productivity/revenue numbers */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            {useCase.creator.type === 'user' ? (
              <User className="w-3 h-3 flex-shrink-0" />
            ) : (
              <Building2 className="w-3 h-3 flex-shrink-0" />
            )}
            <span className="truncate">{useCase.creator.name}</span>
          </div>
          <div className="ml-auto text-xs text-muted-foreground/70">
            {useCase.lastUpdated}
          </div>
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
      className={`transition-colors min-h-[300px] ${
        isOver 
          ? 'bg-primary/5 border-2 border-primary/30 border-dashed rounded-lg' 
          : ''
      }`}
    >
      {isOver && (
        <div className="text-center text-primary text-xs font-medium py-4 mb-2 bg-primary/5 border border-primary/20 rounded-lg">
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
  // Compact, professional default layout (removed detailed toggle)
  const router = useRouter();
  const { user, isLoaded } = useUserClient<any>();
  const { isSignedIn } = useAuthClient();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>(''); // '' means All Organizations
  const [selectedBusinessFunction, setSelectedBusinessFunction] = useState<string>(''); // '' means All Business Functions
  const [modalUseCase, setModalUseCase] = useState<MappedUseCase | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [validationError, setValidationError] = useState<{ show: boolean; fields: string[]; useCaseTitle: string }>({ show: false, fields: [], useCaseTitle: '' });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deletingUseCaseId, setDeletingUseCaseId] = useState<string | null>(null);
  const [deletedUseCaseIds, setDeletedUseCaseIds] = useState<Set<string>>(new Set());
  
  // Refs for scroll synchronization
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isSyncingScrollRef = useRef(false);
  
  // Scroll synchronization handlers
  const handleScrollBarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!contentRef.current) return;
    if (isSyncingScrollRef.current) return;
    isSyncingScrollRef.current = true;
    contentRef.current.scrollLeft = e.currentTarget.scrollLeft;
    // allow the browser to process scroll before unlocking
    requestAnimationFrame(() => { isSyncingScrollRef.current = false; });
  };

  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!scrollBarRef.current) return;
    if (isSyncingScrollRef.current) return;
    isSyncingScrollRef.current = true;
    scrollBarRef.current.scrollLeft = e.currentTarget.scrollLeft;
    requestAnimationFrame(() => { isSyncingScrollRef.current = false; });
  };
  
  const businessFunctions = [
    'Sales',
    'Marketing', 
    'Product Development',
    'Operations',
    'Customer Support',
    'HR',
    'Finance',
    'IT',
    'Legal',
    'Procurement',
    'Facilities',
    'Strategy',
    'Communications',
    'Risk & Audit',
    'Innovation Office',
    'ESG',
    'Data Office',
    'PMO'
  ];

  // Lock modal state
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [selectedUseCaseForLock, setSelectedUseCaseForLock] = useState<string | null>(null);

  // Get user data from context
  const { userData, loading: userLoading, error: userError, refetch: refetchUser } = useUserData();

  // React Query hooks for optimized data fetching
  const { data: useCases = [], error, isLoading, refetch, updateUseCase } = useUseCases();
  console.log('useCases', useCases);
  const updateStageMutation = useUpdateUseCaseStage();
  const deleteUseCaseMutation = useDeleteUseCase();
  
  // Lock hook for the selected use case
  const {
    lockInfo,
    isLocked,
    isExclusiveLocked,
    acquireExclusiveLock,
    releaseLock,
    refreshLockStatus,
    loading: lockLoading,
    error: lockError
  } = useLock(selectedUseCaseForLock || '');

  // Check if user is authenticated
  if (!isLoaded) {
    return (
      <div className="loading-container">
        <div className="text-center max-w-md bg-card/90 rounded-2xl shadow-2xl border p-8">
          <div className="loading-spinner" />
          <p className="loading-text">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="loading-container">
        <div className="text-center max-w-md bg-card/90 rounded-2xl shadow-2xl border p-8">
          <p className="text-muted-foreground">Please sign in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // Use closestCenter for more reliable drop detection
  const customCollisionDetection = closestCenter;

  // DnD sensors - more permissive for better drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1, // Very low distance for immediate activation
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

  const handleAssess = async (id: string) => {
    try {
      // Check lock status directly from the API
      const response = await fetch(`/api/get-usecase-details?useCaseId=${id}&acquireSharedLock=true&scope=ASSESS`);
      if (!response.ok) {
        throw new Error('Failed to check lock status');
      }
      
      const data = await response.json();
      const lockStatus = data.lockInfo;
      
      // Check if the assessment is already locked
      if (lockStatus?.hasExclusiveLock) {
        // Assessment is locked, set the use case ID and show the lock modal
        setSelectedUseCaseForLock(id);
        setIsLockModalOpen(true);
      } else {
        // Assessment is free, automatically acquire the lock and proceed
        console.log('🔒 Assessment is free, automatically acquiring lock...');
        
        const lockResponse = await fetch('/api/locks/acquire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            useCaseId: id, 
            lockType: 'EXCLUSIVE', 
            scope: 'ASSESS' 
          })
        });
        
        if (lockResponse.ok) {
          // Lock acquired successfully, proceed to assessment
          router.push(`/dashboard/${id}/assess`);
        } else {
          // Failed to acquire lock, show error or fallback
          console.error('Failed to automatically acquire lock');
          // Fallback: set the use case ID and show the lock modal
          setSelectedUseCaseForLock(id);
          setIsLockModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Error in handleAssess:', error);
      // Fallback: set the use case ID and show the lock modal
      setSelectedUseCaseForLock(id);
      setIsLockModalOpen(true);
    }
  }

  const handleLockModalClose = () => {
    setIsLockModalOpen(false);
    setSelectedUseCaseForLock(null);
  }

  const handleProceedToAssessment = () => {
    if (selectedUseCaseForLock) {
      router.push(`/dashboard/${selectedUseCaseForLock}/assess`);
    }
    handleLockModalClose();
  }

  const handleViewLockedUseCase = () => {
    if (selectedUseCaseForLock) {
      router.push(`/view-usecase/${selectedUseCaseForLock}`);
    }
    handleLockModalClose();
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

  // Add organization and business function filtering to use cases
  const orgFilteredUseCases = selectedOrgId
    ? useCases.filter((uc: any) => uc.organizationId === selectedOrgId)
    : useCases;
    
  const businessFunctionFilteredUseCases = selectedBusinessFunction
    ? useCases.filter((uc: any) => uc.businessFunction === selectedBusinessFunction)
    : useCases;

  // Apply additive filtering - both organization AND business function filters can be active
  let baseFilteredUseCases = useCases;
  
  if (selectedOrgId) {
    baseFilteredUseCases = baseFilteredUseCases.filter((uc: any) => uc.organizationId === selectedOrgId);
  }
  
  if (selectedBusinessFunction) {
    baseFilteredUseCases = baseFilteredUseCases.filter((uc: any) => uc.businessFunction === selectedBusinessFunction);
  }

  const filteredUseCases = baseFilteredUseCases.filter(useCase => {
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
    
    // Update backend
    updateStageMutation.mutateAsync({ useCaseId, newStage })
      .catch((error) => {
        console.error("Unable to update stage", error);
        // Revert the frontend update on error
        if (useCase) {
          updateUseCase(useCaseId, { stage: useCase.stage });
        }
      });
  };

  // Update priority with optimistic UI and rollback on failure
  const handlePriorityChange = async (useCaseId: string, newPriority: string) => {
    const existing = useCases.find((uc: any) => uc.id === useCaseId);
    const prevPriority = existing?.priority;

    // Optimistic UI update
    updateUseCase(useCaseId, { priority: newPriority });
    setModalUseCase((prev) => (prev?.id === useCaseId ? { ...prev, priority: newPriority } : prev));

    try {
      const response = await fetch('/api/update-priority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useCaseId, priority: newPriority })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as any).error || 'Failed to update priority');
      }
      // Optionally refresh in background to sync with backend later
      // void refetch();
    } catch (err) {
      // Rollback on failure
      if (typeof prevPriority !== 'undefined') {
        updateUseCase(useCaseId, { priority: prevPriority });
        setModalUseCase((prev) => (prev?.id === useCaseId ? { ...prev, priority: prevPriority } : prev));
      }
      alert(err instanceof Error ? err.message : 'Failed to update priority');
    }
  };


  // Drag and Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag started:', event.active.id);
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Drag ended:', { active: active.id, over: over?.id });
    setActiveId(null);

    if (!over) {
      console.log('No drop target found');
      return;
    }

    const useCaseId = active.id as string;
    const targetId = over.id as string;

    console.log('Drop target:', { useCaseId, targetId });

    // Check if the target is a stage column
    const isTargetStage = stages.some(stage => stage.id === targetId);
    console.log('Is target stage:', isTargetStage);
    
    if (isTargetStage) {
      const useCase = filteredUseCases.find(uc => uc.id === useCaseId);
      console.log('Found use case:', useCase);
      
      if (useCase && useCase.stage !== targetId) {
        console.log('Moving use case from', useCase.stage, 'to', targetId);
        
        // Validate if moving from discovery to business-case
        if (useCase.stage === 'discovery' && targetId === 'business-case') {
          const missingFields = getMissingFields(useCase);
          if (missingFields.length > 0) {
            console.log('Validation failed:', missingFields);
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
        
        // Update backend
        updateStageMutation.mutateAsync({ useCaseId, newStage: targetId })
          .catch((error) => {
            console.error("Unable to update stage", error);
            // Revert the frontend update on error
            updateUseCase(useCaseId, { stage: useCase.stage });
          });
      } else {
        console.log('Use case not found or already in target stage');
      }
    } else {
      console.log('Target is not a valid stage');
    }
  };



  if (userError) {
    return (
      <div className="error-container">
        <div className="error-card">
          <AlertTriangle className="error-icon" />
          <h2 className="error-title">Unable to Load User Data</h2>
          <p className="error-message">{userError}</p>
          <button 
            onClick={() => refetchUser()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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

  if (isLoading || userLoading) {
    return (
      <div className="loading-container">
        <div className="text-center max-w-md bg-card/90 rounded-2xl shadow-2xl border p-8">
          <div className="loading-spinner" />
          <p className="loading-text">
            {isLoading ? 'Loading use cases...' : 'Loading user data...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ClerkInvitationHandler />
      <div className="h-full p-3 flex flex-col min-h-0 max-w-6xl mx-auto">
        {/* Compact Header */}
        <div className="flex-shrink-0 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4" />
            
            {/* Quick Actions (compact) */}
            <div className="flex items-center gap-2">
              <Button onClick={() => router.push('/new-usecase')} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Use Case
              </Button>
              <Button onClick={refetch} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 flex-shrink-0">
          <div className="relative flex-1">
            <Input
              placeholder="Search use cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-standard"
            />
          </div>
          <div className="flex gap-3 flex-wrap items-center justify-end">
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
            {(userData?.role === 'QZEN_ADMIN') && (
            <select
              value={selectedOrgId}
              onChange={e => setSelectedOrgId(e.target.value)}
              className="select-standard"
              style={{ minWidth: 180 }}
            >
              <option value="">All Organizations</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
            )}
            <select
              value={selectedBusinessFunction}
              onChange={e => setSelectedBusinessFunction(e.target.value)}
              className="select-standard"
              style={{ minWidth: 180 }}
            >
              <option value="">All Business Functions</option>
              {businessFunctions.map(func => (
                <option key={func} value={func}>{func}</option>
              ))}
            </select>
            <Button onClick={() => router.push('/new-usecase')} className="flex items-center gap-2 rounded-full shadow-sm bg-neutral-100 text-foreground border border-neutral-300 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-white dark:border-neutral-600 dark:hover:bg-neutral-800">
              <Plus className="w-4 h-4" />
              New Use Case
            </Button>
            <Button onClick={refetch} variant="outline" className="flex items-center gap-2 bg-muted text-foreground border hover:bg-accent">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Validation Error Alert */}
        {validationError.show && (
          <Alert variant="destructive" className="mb-6 flex-shrink-0">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Missing Required Fields</AlertTitle>
            <AlertDescription>
              <div className="mt-3">
                <p className="mb-3 text-sm">
                  Please complete the following required fields for "{validationError.useCaseTitle}" before moving to the Business Case stage:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  {validationError.fields.map((field, index) => (
                    <li key={index} className="text-sm">{field}</li>
                  ))}
                </ul>
                <div className="flex gap-3">
                  {(userData?.role === 'USER' || userData?.role === 'ORG_ADMIN' || userData?.role === 'ORG_USER') && (
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
                  )}
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
         <div className="relative flex-1 min-h-0 overflow-hidden">
           {deletingUseCaseId && (
             <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
               <div className="flex flex-col items-center gap-3 p-6 bg-card rounded-lg shadow-lg border">
                 <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                 <p className="text-sm font-medium text-foreground">Deleting use case...</p>
               </div>
             </div>
           )}
           <DndContext
             sensors={sensors}
             collisionDetection={customCollisionDetection}
             onDragStart={handleDragStart}
             onDragEnd={handleDragEnd}

           >
          <div className="relative w-full h-full flex flex-col">
            {/* Scroll bar container - fixed at top */}
            <div 
              ref={scrollBarRef}
              className="w-full overflow-x-auto flex-shrink-0"
              onScroll={handleScrollBarScroll}
            >
              <div className="flex flex-row gap-6 px-2 pb-2" style={{ width: `${stages.length * 240 + (stages.length - 1) * 24 + 16}px` }}>
                {/* Invisible spacer to match stage cards exactly */}
                {stages.map((stage, idx) => (
                  <div key={`spacer-${stage.id}`} className="w-60 h-0 flex-shrink-0"></div>
                ))}
              </div>
            </div>
            
            {/* Content container - synchronized with scroll bar */}
            <div 
              ref={contentRef}
              className="w-full flex-1 min-h-0 overflow-x-auto overflow-y-hidden scrollbar-hide"
              onScroll={handleContentScroll}
            >
              <div className="flex flex-col gap-0 px-2 h-full" style={{ width: `${stages.length * 240 + (stages.length - 1) * 24 + 16}px` }}>
                {/* Stage cards row */}
                <div className="flex flex-row gap-6 pb-2 flex-shrink-0">
                  {stages.map((stage, idx) => {
                    const stageUseCases = getUseCasesByStage(stage.id);
                    const columnWidth = 280;
                    
                    return (
                      <div key={`column-${stage.id}`} className="flex-shrink-0" style={{ width: columnWidth }}>
                        <DroppableStageColumn stage={stage} stageUseCases={stageUseCases}>
                          {/* Stage Header */}
                          <div className="mb-2">
                            <div className="border bg-background rounded-md p-2.5 group hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-[13px] text-foreground">{stage.title}</div>
                                  <div className="text-[11px] text-muted-foreground mt-0.5">
                                    {stageUseCases.length} {stageUseCases.length === 1 ? 'item' : 'items'}
                                  </div>
                                </div>
                                <div className="text-base font-bold text-primary">{stageUseCases.length}</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Use Cases */}
                          <div className="space-y-2 min-h-[180px]">
                            <SortableContext id={stage.id} items={stageUseCases.map(uc => uc.id)} strategy={verticalListSortingStrategy}>
                              {stageUseCases.length === 0 ? (
                                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center">
                                  <div className="text-sm text-muted-foreground">No items in this stage</div>
                                </div>
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
                          </div>
                        </DroppableStageColumn>
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
                  <Card className="card-interactive p-3 w-60 shadow-xl">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-muted-foreground">{formatAiucId(useCase.aiucId, useCase.id)}</div>
                        {useCase.priority && (
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${_priorities[useCase.priority as keyof typeof _priorities]?.color || 'bg-muted'}`}>
                            {_priorities[useCase.priority as keyof typeof _priorities]?.label || useCase.priority}
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">{useCase.title}</div>
                      <div className="text-xs text-foreground line-clamp-2 leading-relaxed">{stripHtmlTags(useCase.description)}</div>
                      {/* Removed per request: score numbers in drag overlay */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          {useCase.creator.type === 'user' ? (
                            <User className="w-3 h-3 flex-shrink-0" />
                          ) : (
                            <Building2 className="w-3 h-3 flex-shrink-0" />
                          )}
                          <span className="truncate">{useCase.creator.name}</span>
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
                <div className="flex flex-col gap-3 p-4">
                  <div className="text-xs text-muted-foreground mb-3">ID: {formatAiucId(modalUseCase.aiucId, modalUseCase.id)}</div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1 text-xs text-primary">{modalUseCase.scores.operational}</div>
                    <div className="flex items-center gap-1 text-xs text-primary">{modalUseCase.scores.productivity}</div>
                    <div className="flex items-center gap-1 text-xs text-success">{modalUseCase.scores.revenue}</div>
                    <div className="flex items-center gap-1 text-xs text-primary font-bold">{getOverallScore(modalUseCase.scores)}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    {modalUseCase.creator.type === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Building2 className="w-4 h-4" />
                    )}
                    Created by: {modalUseCase.creator.name}
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">Updated {modalUseCase.lastUpdated}</div>
                </div>
                <SheetFooter className="flex flex-wrap gap-2 justify-start sm:justify-end">
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button size="sm" variant="outline" onClick={() => { handleView(modalUseCase.id); setIsSheetOpen(false); }}>
                      <Eye className="w-4 h-4 mr-2" /> View
                    </Button>
                    {(userData?.role === 'USER' || userData?.role === 'ORG_ADMIN' || userData?.role === 'ORG_USER') && (
                      <Button size="sm" variant="outline" onClick={() => { handleEdit(modalUseCase.id); setIsSheetOpen(false); }}>
                        <EditIcon className="w-4 h-4 mr-2" /> Edit
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
                        className="whitespace-nowrap"
                      >
                        <ArrowRightIcon className="w-4 h-4 mr-2" />
                        Next Stage
                      </Button>
                    )}
                    {(userData?.role === 'USER' || userData?.role === 'ORG_ADMIN' || userData?.role === 'ORG_USER' || userData?.role === 'QZEN_ADMIN') && modalUseCase.stage !== 'discovery' && (
                      <Button size="sm" variant="outline" onClick={() => { handleAssess(modalUseCase.id); setIsSheetOpen(false); }}>
                        Assess
                      </Button>
                    )}
                  </div>
                  <SheetClose asChild>
                    <Button size="sm" variant="secondary">Close</Button>
                  </SheetClose>
                </SheetFooter>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Lock Modal */}
      <LockModal
        isOpen={isLockModalOpen}
        onClose={handleLockModalClose}
        lockInfo={lockInfo}
        onAcquireExclusiveLock={acquireExclusiveLock}
        onProceedToAssessment={handleProceedToAssessment}
        onViewLockedUseCase={handleViewLockedUseCase}
        loading={lockLoading}
        error={lockError}
      />
    </div>
  );
};

export default Dashboard;