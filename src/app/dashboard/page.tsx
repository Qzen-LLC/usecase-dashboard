'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, TrendingUp, Zap, DollarSign, Clock, User, X, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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

const STAGE_ORDER = [
  'discovery',
  'business-case',
  'proof-of-value',
  'backlog',
  'in-progress',
  'solution-validation',
  'pilot',
  'deployment',
];

function isAfterOrAtBacklog(stage?: string) {
  if (!stage) return false;
  const idx = STAGE_ORDER.indexOf(stage);
  return idx >= STAGE_ORDER.indexOf('backlog');
}

const priorities = {
  CRITICAL: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Critical' },
  HIGH: { color: 'bg-orange-50 text-orange-700 border-orange-200', label: 'High' },
  MEDIUM: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Medium' },
  LOW: { color: 'bg-green-50 text-green-700 border-green-200', label: 'Low' }
} as const;

type UseCase = {
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
  // Add these for frontend mapping
  stage?: string;
  priority?: string;
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
  aiucId: number;
};

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const router = useRouter();

  const handleEdit = (id: string) => {
    router.push(`/edit-usecase/${id}`);
  }

  const handleView = (id: string) => {
    router.push(`/view-usecase/${id}`);
  }

  const handleAssess = (id: string) => {
    router.push(`/dashboard/${id}/assess`);
  }

  // Fetch use case s from API
  useEffect(() => {
    const fetchUseCases = async () => {
      try {
        const response = await fetch('/api/read-usecases');
        if (!response.ok) {
          throw new Error('Failed to fetch use cases');
        }
        const data = await response.json();

        // Add default frontend fields
        const mapped = (data || []).map((uc: any) => ({
          ...uc,
          stage: uc.stage, // All start in discovery
          priority: uc.priority, // Directly use value from DB, no default
          owner: uc.primaryStakeholders?.[0] || 'Unknown',
          lastUpdated: uc.updatedAt
            ? new Date(uc.updatedAt).toLocaleDateString()
            : '',
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

        }));
        setUseCases(mapped);
      } catch (error) {
        console.error('Error fetching use cases:', error);
      }
    };
    fetchUseCases();
  }, []);

  const filteredUseCases = useCases.filter(useCase => {
    const matchesSearch = useCase.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      useCase.owner?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' ||
      useCase.priority === filterBy;
    return matchesSearch && matchesFilter;
  });

  // Helper to check if all required fields are filled
  const isUseCaseComplete = (useCase: UseCase) => {
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
    setUseCases(prev =>
      prev.map(uc =>
        uc.id === useCaseId ? { ...uc, stage: newStage } : uc
      )
    );
    setSelectedUseCase(prev =>
      prev ? { ...prev, stage: newStage } : prev
    );
    try {
      const res = await fetch('/api/update-stage', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          useCaseId, newStage
        })
      });
    } catch(error) {
      console.error("Unable to update stage");
    }
    setSelectedUseCase(null)
  };

  // Modal for use case details
  const UseCaseDetailModal = ({ useCase, onClose }: { useCase: UseCase, onClose: () => void }) => {
    if (!useCase) return null;
    const availableStages = stages.filter(s => s.id !== useCase.stage);

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-start justify-center z-50 animate-fade-in p-4 pt-24 overflow-y-auto">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl w-full max-w-3xl mx-auto p-8 relative shadow-2xl border border-blue-100 mb-8">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Header Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold mb-1 text-gray-800 tracking-tight">
              <span className="font-mono text-gray-500">AIUC {useCase.aiucId}</span>
              <br />
              {useCase.title}
            </h2>
            <p className="text-gray-500 text-base font-medium">{useCase.owner}</p>
          </div>

          {/* Scores Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-100 shadow-sm">
              <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-800">{useCase.scores?.operational}</div>
              <div className="text-xs text-gray-500">Operational</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-100 shadow-sm">
              <Zap className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-800">{useCase.scores?.productivity}</div>
              <div className="text-xs text-gray-500">Productivity</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-100 shadow-sm">
              <DollarSign className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-800">{useCase.scores?.revenue}</div>
              <div className="text-xs text-gray-500">Revenue</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-100 shadow-sm">
              <span className="inline-block w-5 h-5 text-blue-600 mx-auto mb-1">🎯</span>
              <div className="text-lg font-bold text-gray-800">{getOverallScore(useCase.scores || { operational: 0, productivity: 0, revenue: 0 })}</div>
              <div className="text-xs text-gray-500">Overall</div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2 text-base">Description</h3>
            <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">{useCase.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-1 text-sm">Owner</h3>
              <p className="text-gray-700 text-sm">{useCase.owner}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-1 text-sm">Timeline</h3>
              <p className="text-gray-700 text-sm">{useCase.timeline}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-1 text-sm">Expected ROI</h3>
              <p className="text-gray-700 text-sm">{useCase.roi}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-1 text-sm">Complexity</h3>
              <p className="text-gray-700 text-sm">{useCase.complexity}/10</p>
            </div>
          </div>

          {/* Stakeholders */}
          {useCase.stakeholders && useCase.stakeholders.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">Key Stakeholders</h3>
              <div className="flex flex-wrap gap-2">
                {useCase.stakeholders.map((stakeholder, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                    {stakeholder}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {useCase.risks && useCase.risks.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">Key Risks</h3>
              <div className="flex flex-wrap gap-2">
                {useCase.risks.map((risk, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                    {risk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
            <Button 
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg shadow-sm font-medium text-sm transition" 
              onClick={() => {handleEdit(useCase.id as string)}}
            >
              Edit Use Case
            </Button>
            <Button 
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg shadow-sm font-medium text-sm transition flex items-center gap-2" 
              onClick={() => {handleView(useCase.id as string)}}
            >
              <Eye className="w-4 h-4" />
              View Use Case
            </Button>
            {useCase.stage === 'proof-of-value' && (
              <Button 
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg shadow-sm font-medium text-sm transition" 
                onClick={() => {handleAssess(useCase.id as string)}}
              >
                Assess
              </Button>
            )}
            <Button
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg shadow-sm font-medium text-sm transition"
              onClick={async () => {
                // Only allow moving one step forward
                const currentStageIdx = stages.findIndex(s => s.id === useCase.stage);
                if (currentStageIdx === -1 || currentStageIdx === stages.length - 1) return;
                const nextStage = stages[currentStageIdx + 1].id;
                // If moving from discovery to business-case, validate all fields
                if (useCase.stage === 'discovery' && nextStage === 'business-case') {
                  // Validate all fields except id, createdAt, updatedAt, and frontend-only fields
                  const requiredFields = Object.keys(useCase).filter(
                    k => !['id','createdAt','updatedAt','stage','priority','owner','lastUpdated','scores','description','complexity','roi','timeline','stakeholders','risks'].includes(k)
                  );
                  const missing = requiredFields.filter(k => {
                    const v = (useCase as any)[k];
                    if (Array.isArray(v)) return v.length === 0;
                    if (typeof v === 'string') return !v.trim();
                    if (typeof v === 'number') return v === null || v === undefined;
                    return false;
                  });
                  if (missing.length > 0) {
                    alert('Please complete all required fields in the use case form before moving to Business Case.');
                    return;
                  }
                }
                // If moving from proof-of-value to backlog, show alert
                if (useCase.stage === 'proof-of-value' && nextStage === 'backlog') {
                  alert('Please complete the assessment before moving to Backlog.');
                  return;
                }
                await handleMoveToStage(useCase.id, nextStage);
              }}
            >
              Move to Next Stage
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center m-8">
      <div className="w-full max-w-screen-2xl mx-8 bg-white rounded-2xl shadow-2xl border border-gray-200 mt-6 mb-6 mx-auto relative z-10">
        <div className="px-8 py-8">
          {/* Main Content */}
          <div className="p-4">
            {/* Filters and Add Button */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 mb-5">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
                <Input
                  type="text"
                  placeholder="Search use cases..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-200 focus:ring-1 focus:ring-blue-200 shadow-sm transition text-sm w-full"
                />
              </div>
              <select
                value={filterBy}
                onChange={e => setFilterBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:border-blue-200 focus:ring-1 focus:ring-blue-200 shadow-sm transition text-sm"
              >
                <option value="all">All Departments</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="customer service">Customer Service</option>
                <option value="sales">Sales</option>
                <option value="finance">Finance</option>
                <option value="manufacturing">Manufacturing</option>
              </select>
              <Button
                onClick={() => router.push('/new-usecase')}
                className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-200 text-emerald-700 hover:text-emerald-800 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 font-medium text-sm border border-emerald-100 hover:border-emerald-300"
              >
                <Plus className="w-4 h-4" />
                New Use Case
              </Button>
            </div>
            {/* Stage Stats */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-10 shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
                {stages.map(stage => {
                  const count = getUseCasesByStage(stage.id).length;
                  const icon = stage.id === 'discovery' ? <Search className="w-6 h-6 mx-auto mb-2 text-blue-600" /> :
                    stage.id === 'business-case' ? <DollarSign className="w-6 h-6 mx-auto mb-2 text-blue-600" /> :
                    stage.id === 'proof-of-value' ? <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-600" /> :
                    stage.id === 'backlog' ? <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" /> :
                    stage.id === 'in-progress' ? <Zap className="w-6 h-6 mx-auto mb-2 text-blue-600" /> :
                    stage.id === 'solution-validation' ? <User className="w-6 h-6 mx-auto mb-2 text-blue-600" /> :
                    stage.id === 'pilot' ? <User className="w-6 h-6 mx-auto mb-2 text-blue-600" /> :
                    <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />;
                  return (
                    <div key={stage.id} className="p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition flex flex-col items-center border border-gray-200 hover:border-blue-200">
                      {React.cloneElement(icon, { className: 'w-6 h-6 mx-auto mb-2 text-blue-600' })}
                      <div className="text-2xl font-bold text-gray-800">{count}</div>
                      <div className="text-sm text-gray-600 font-medium mt-1">{stage.title}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Kanban Board with Drag and Drop */}
            <div className="overflow-x-auto">
              <div className="flex space-x-8 min-w-max items-stretch">
                {stages.map(stage => (
                  <div
                    key={stage.id}
                    className="w-96 min-h-[350px] bg-blue-50 rounded-2xl p-5 flex flex-col shadow-lg flex-grow max-w-full sm:w-96 border border-blue-100 transition hover:shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-semibold text-base text-gray-700 tracking-tight">{stage.title}</h3>
                      <span className="bg-white text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-100 font-medium shadow-sm">
                        {getUseCasesByStage(stage.id).length}
                      </span>
                    </div>
                    <div className="flex-1 space-y-5">
                      {getUseCasesByStage(stage.id).map(useCase => (
                        <Card
                          key={useCase.id}
                          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer p-5 border border-gray-200 hover:border-blue-200 w-full group"
                          onClick={() => setSelectedUseCase(useCase)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-800 text-base group-hover:text-blue-600 transition-colors">
                                <span className="font-mono text-gray-500">AIUC {useCase.aiucId}</span>
                                <br />
                                {useCase.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-0.5">{useCase.owner}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button 
                                  onClick={(e) => e.stopPropagation()}
                                  className={`px-4 py-1.5 rounded-full text-xs font-medium ${priorities[useCase.priority as keyof typeof priorities]?.color || priorities.MEDIUM.color} border shadow-sm hover:bg-opacity-80 transition-colors`}
                                >
                                  {priorities[useCase.priority as keyof typeof priorities]?.label || 'Medium'}
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                {Object.entries(priorities).map(([key, value]) => (
                                  <DropdownMenuItem
                                    key={key}
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        const res = await fetch('/api/update-priority', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ useCaseId: useCase.id, priority: key }),
                                        });
                                        if (!res.ok) throw new Error('Failed to update priority');
                                        // Update local state
                                        setUseCases(prev => prev.map(uc => 
                                          uc.id === useCase.id ? { ...uc, priority: key } : uc
                                        ));
                                      } catch (error) {
                                        console.error('Error updating priority:', error);
                                      }
                                    }}
                                    className={`text-xs font-medium ${key === useCase.priority ? 'bg-gray-100' : ''}`}
                                  >
                                    {value.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex justify-between mb-3 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="flex items-center"><TrendingUp className="w-3 h-3 text-blue-600 mr-1.5" />{useCase.scores?.operational}</div>
                            <div className="flex items-center"><Zap className="w-3 h-3 text-blue-600 mr-1.5" />{useCase.scores?.productivity}</div>
                            <div className="flex items-center"><DollarSign className="w-3 h-3 text-blue-600 mr-1.5" />{useCase.scores?.revenue}</div>
                            <div className="font-semibold text-blue-600">{getOverallScore(useCase.scores || { operational: 0, productivity: 0, revenue: 0 })}</div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center"><User className="w-3 h-3 mr-1.5" />{useCase.owner}</div>
                            <div className="flex items-center"><Clock className="w-3 h-3 mr-1.5" />{useCase.timeline}</div>
                          </div>
                          <div className="mt-2 text-xs text-gray-400">Updated {useCase.lastUpdated}</div>
                        </Card>
                      ))}
                      {getUseCasesByStage(stage.id).length === 0 && (
                        <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-sm text-gray-900 font-medium">No use cases in this stage</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Modal */}
            {selectedUseCase && (
              <UseCaseDetailModal
                useCase={selectedUseCase}
                onClose={() => setSelectedUseCase(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;