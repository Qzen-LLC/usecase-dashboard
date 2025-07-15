'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Plus, Search, TrendingUp, Zap, DollarSign, Clock, User, X, Eye, Trash2, RefreshCw, Loader2, AlertTriangle, Users, Building2, Edit as EditIcon, ArrowRight as ArrowRightIcon } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';

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

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedUseCase, setSelectedUseCase] = useState<MappedUseCase | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userOrganization, setUserOrganization] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'useCases' | 'users'>('useCases');
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>(''); // '' means All Organizations
  const [modalUseCase, setModalUseCase] = useState<MappedUseCase | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStartX, setScrollStartX] = useState(0);

  // React Query hooks for optimized data fetching
  const { data: useCases = [], isLoading, error, refetch } = useUseCases();
  const updateStageMutation = useUpdateUseCaseStage();
  const deleteUseCaseMutation = useDeleteUseCase();
  const [priorityLoadingId, setPriorityLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      fetchUserData();
    }
  }, [isSignedIn]);

  useEffect(() => {
    // Fetch organizations for the dropdown
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
    fetchOrganizations();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/me');
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.user?.role);
        setUserOrganization(data.user?.organization);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

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
    if (!confirm('Are you sure you want to delete this use case? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteUseCaseMutation.mutateAsync(id);
      setSelectedUseCase(null);
    } catch (error) {
      console.error('Error deleting use case:', error);
      alert('Failed to delete use case. Please try again.');
    }
  };

  // Add organization filtering to use cases
  const orgFilteredUseCases = selectedOrgId
    ? useCases.filter((uc: any) => uc.organizationId === selectedOrgId)
    : useCases;

  const filteredUseCases = orgFilteredUseCases.filter(useCase => {
    const matchesSearch = useCase.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      useCase.owner?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy.toLowerCase() === 'all' ||
      (useCase.priority && useCase.priority.toLowerCase() === filterBy.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  // Helper to check if all required fields are filled
  const isUseCaseComplete = (useCase: MappedUseCase) => {
    // List all required fields except id, createdAt, updatedAt, and frontend-only fields
    const requiredFields = Object.keys(useCase).filter(
      k => !['id','createdAt','updatedAt','stage','priority','owner','lastUpdated','scores','description','complexity','roi','timeline','stakeholders','risks'].includes(k)
    );
    return requiredFields.every(k => {
      const v = (useCase as any)[k];
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === 'string') return !!v.trim();
      if (typeof v === 'number') return v !== null && v !== undefined;
      return true;
    });
  };

  // Modified getUseCasesByStage to enforce visual logic
  const getUseCasesByStage = (stageId: string) => {
    if (stageId === 'business-case') {
      // Show use cases that are complete AND either already in business-case or in discovery
      return filteredUseCases.filter(useCase => 
        isUseCaseComplete(useCase) && 
        (useCase.stage === 'business-case' || useCase.stage === 'discovery')
      );
    }
    if (stageId === 'discovery') {
      // Show ALL incomplete use cases, regardless of their current stage
      return filteredUseCases.filter(useCase => !isUseCaseComplete(useCase));
    }
    // For all other stages, use the actual stage value from database
    return filteredUseCases.filter(useCase => useCase.stage === stageId);
  };

  const getOverallScore = (scores: { operational: number, productivity: number, revenue: number }) =>
    ((scores.operational + scores.productivity + scores.revenue) / 3).toFixed(1);

  // Handler to update the stage of a use case
  const handleMoveToStage = async (useCaseId: string, newStage: string) => {
    try {
      await updateStageMutation.mutateAsync({ useCaseId, newStage });
      setSelectedUseCase((prev: MappedUseCase | null) =>
        prev ? { ...prev, stage: newStage } : prev
      );
      setSelectedUseCase(null);
      refetch(); // Refresh the use case list after stage change
    } catch (error) {
      console.error("Unable to update stage", error);
    }
  };

  // Add a handler to update priority (stub for now)
  const handlePriorityChange = async (useCaseId: string, newPriority: string) => {
    setPriorityLoadingId(useCaseId);
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
      await refetch();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setPriorityLoadingId(null);
    }
  };

  // Drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setScrollStartX(scrollRef.current ? scrollRef.current.scrollLeft : 0);
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    const dx = e.clientX - dragStartX;
    scrollRef.current.scrollLeft = scrollStartX - dx;
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
    setScrollStartX(scrollRef.current ? scrollRef.current.scrollLeft : 0);
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    const dx = e.touches[0].clientX - dragStartX;
    scrollRef.current.scrollLeft = scrollStartX - dx;
  };
  const handleTouchEnd = () => setIsDragging(false);

  // Show user management for org admins
  if (userRole === 'ORG_ADMIN' && activeTab === 'users') {
    return <OrganizationUserManagement />;
  }

  // Loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#5b5be6] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading use cases...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#5b5be6] text-white rounded-lg hover:bg-[#4a4ac7] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e9eafc] py-8 px-2 sm:px-8">
      {/* Header with role-based tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-1">Dashboard</h1>
          {userOrganization && (
            <p className="text-gray-500 text-lg">
              {userOrganization.name} • <span className="font-medium text-[#5b5be6]">{userRole === 'ORG_ADMIN' ? 'Organization Admin' : 'User'}</span>
            </p>
          )}
        </div>
        {userRole === 'ORG_ADMIN' && (
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'useCases' ? 'default' : 'outline'}
              onClick={() => setActiveTab('useCases')}
              className="rounded-full px-6 py-2 text-base shadow-sm"
            >
              Use Cases
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              onClick={() => setActiveTab('users')}
              className="rounded-full px-6 py-2 text-base shadow-sm flex items-center"
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
          </div>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search use cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-[#5b5be6] bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5b5be6] text-base"
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
            className="px-4 py-2 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5b5be6] text-base"
            style={{ minWidth: 180 }}
          >
            <option value="">All Departments</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
          <Button onClick={() => router.push('/new-usecase')} className="flex items-center gap-2 bg-gradient-to-r from-[#5b5be6] to-[#8b5cf6] text-white font-semibold rounded-xl px-6 py-2 shadow-md hover:from-[#4a4ac7] hover:to-[#6d4ad7] transition">
            <Plus className="w-4 h-4" />
            New Use Case
          </Button>
          <Button onClick={refetch} variant="outline" className="flex items-center gap-2 rounded-xl px-6 py-2 shadow-sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Draggable horizontally scrollable summary cards and Kanban board, aligned by column */}
      <div
        ref={scrollRef}
        className="w-full select-none cursor-grab active:cursor-grabbing mb-8 pb-6 overflow-x-hidden"
        style={{ userSelect: isDragging ? 'none' : undefined }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex flex-row gap-4 min-w-[900px] xl:min-w-[1200px] 2xl:min-w-[1600px]">
          {stages.map((stage, idx) => {
            const stageUseCases = getUseCasesByStage(stage.id);
            return (
              <div key={stage.id} className="flex flex-col items-center w-60">
                {/* Summary card */}
                <div className="flex flex-col items-center justify-center w-60 h-20 mb-2 rounded-xl bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] border border-gray-100 shadow hover:shadow-lg transition-all cursor-pointer group">
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
                  <div className="font-semibold text-gray-700 text-sm group-hover:text-[#5b5be6] transition-colors">{stage.title}</div>
                  <div className="text-2xl font-extrabold text-gray-900 group-hover:text-[#5b5be6] transition-colors">{stageUseCases.length}</div>
                </div>
                {/* Use case column */}
                <div className="flex-shrink-0 w-60 space-y-4">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <h3 className="font-semibold text-sm text-gray-800">{stage.title}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded-full">
                      {stageUseCases.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {stageUseCases.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-3 text-center text-gray-400 border border-dashed border-gray-200 text-xs">No use cases in this stage</div>
                    ) : stageUseCases.map((useCase) => (
                      <Card key={useCase.id} className="rounded-xl shadow border bg-white p-3 hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => { setModalUseCase(useCase); setIsSheetOpen(true); }}>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-[10px] text-gray-500">{useCase.aiucId || useCase.id}</div>
                            {useCase.priority && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <span className={`text-[10px] px-1 py-0.5 rounded-full font-semibold cursor-pointer flex items-center gap-1 ${_priorities[useCase.priority as keyof typeof _priorities]?.color || 'bg-gray-100'}`}>
                                    {_priorities[useCase.priority as keyof typeof _priorities]?.label || useCase.priority}
                                    {priorityLoadingId === useCase.id && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                                  </span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => (
                                    <DropdownMenuItem key={priority} onClick={() => handlePriorityChange(useCase.id, priority)}>
                                      {_priorities[priority as keyof typeof _priorities]?.label || priority}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          <div className="font-semibold text-base text-gray-900 line-clamp-1 group-hover:text-[#5b5be6] transition-colors">{useCase.title}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{useCase.description}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-0.5 text-[11px] text-blue-700"><TrendingUp className="w-3 h-3" />{useCase.scores.operational}</div>
                            <div className="flex items-center gap-0.5 text-[11px] text-purple-700"><Zap className="w-3 h-3" />{useCase.scores.productivity}</div>
                            <div className="flex items-center gap-0.5 text-[11px] text-green-700"><DollarSign className="w-3 h-3" />{useCase.scores.revenue}</div>
                            <div className="flex items-center gap-0.5 text-[11px] text-blue-500 font-bold">{getOverallScore(useCase.scores)}</div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                            <span className="flex items-center gap-0.5"><User className="w-3 h-3" />{useCase.owner}</span>
                            <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />4</span>
                          </div>
                          <div className="text-[10px] text-gray-400">Updated {useCase.lastUpdated}</div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sheet Modal for Use Case Actions */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right">
          {modalUseCase && (
            <>
              <SheetHeader>
                <SheetTitle>{modalUseCase.title}</SheetTitle>
                <SheetDescription>{modalUseCase.description}</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-2 p-4">
                <div className="text-xs text-gray-500 mb-2">ID: {modalUseCase.aiucId || modalUseCase.id}</div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1 text-xs text-blue-700"><TrendingUp className="w-4 h-4" />{modalUseCase.scores.operational}</div>
                  <div className="flex items-center gap-1 text-xs text-purple-700"><Zap className="w-4 h-4" />{modalUseCase.scores.productivity}</div>
                  <div className="flex items-center gap-1 text-xs text-green-700"><DollarSign className="w-4 h-4" />{modalUseCase.scores.revenue}</div>
                  <div className="flex items-center gap-1 text-xs text-blue-500 font-bold">{getOverallScore(modalUseCase.scores)}</div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-2"><User className="w-4 h-4" />{modalUseCase.owner}</div>
                <div className="text-xs text-gray-400 mb-2">Updated {modalUseCase.lastUpdated}</div>
              </div>
              <SheetFooter>
                <Button size="sm" variant="outline" onClick={() => { handleView(modalUseCase.id); setIsSheetOpen(false); }}>
                  <Eye className="w-4 h-4 mr-1" /> View
                </Button>
                {(userRole === 'USER' || userRole === 'ORG_ADMIN') && (
                  <Button size="sm" variant="outline" onClick={() => { handleEdit(modalUseCase.id); setIsSheetOpen(false); }}>
                    <EditIcon className="w-4 h-4 mr-1" /> Edit
                  </Button>
                )}
                {(userRole === 'USER' || userRole === 'ORG_ADMIN') && modalUseCase.stage !== 'deployment' && (
                  <Button size="sm" variant="outline" onClick={() => { handleMoveToStage(modalUseCase.id, getNextStage(modalUseCase.stage)); setIsSheetOpen(false); }}>
                    <ArrowRightIcon className="w-4 h-4 mr-1" /> Move to Next Stage
                  </Button>
                )}
                {(userRole === 'USER' || userRole === 'ORG_ADMIN') && modalUseCase.stage !== 'discovery' && (
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
  );
};

export default Dashboard;