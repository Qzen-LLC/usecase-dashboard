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

const priorities = {
  high: { color: 'bg-white text-foreground border border-red-200', label: 'High' },
  medium: { color: 'bg-white text-foreground border border-yellow-200', label: 'Medium' },
  low: { color: 'bg-white text-foreground border border-green-200', label: 'Low' }
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
  priority?: keyof typeof priorities;
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
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-white rounded-2xl max-w-md w-full p-5 relative shadow-2xl border border-gray-100">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-[#5b5be6] transition"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-extrabold mb-1 text-[#23235b] tracking-tight">{useCase.title}</h2>
          <p className="text-gray-500 mb-3 text-base font-medium">{useCase.owner}</p>
          {/* Scores */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] p-2 rounded-xl text-center border border-gray-100 shadow">
              <TrendingUp className="w-5 h-5 text-[#5b5be6] mx-auto mb-0.5" />
              <div className="text-base font-bold text-[#23235b]">{useCase.scores?.operational}</div>
              <div className="text-[10px] text-gray-500">Operational</div>
            </div>
            <div className="bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] p-2 rounded-xl text-center border border-gray-100 shadow">
              <Zap className="w-5 h-5 text-[#5b5be6] mx-auto mb-0.5" />
              <div className="text-base font-bold text-[#23235b]">{useCase.scores?.productivity}</div>
              <div className="text-[10px] text-gray-500">Productivity</div>
            </div>
            <div className="bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] p-2 rounded-xl text-center border border-gray-100 shadow">
              <DollarSign className="w-5 h-5 text-[#5b5be6] mx-auto mb-0.5" />
              <div className="text-base font-bold text-[#23235b]">{useCase.scores?.revenue}</div>
              <div className="text-[10px] text-gray-500">Revenue</div>
            </div>
            <div className="bg-gradient-to-br from-[#e9eafc] to-[#f5f6fa] p-2 rounded-xl text-center border border-gray-100 shadow">
              <span className="inline-block w-5 h-5 text-[#5b5be6] mx-auto mb-0.5">🎯</span>
              <div className="text-base font-bold text-[#23235b]">{getOverallScore(useCase.scores || { operational: 0, productivity: 0, revenue: 0 })}</div>
              <div className="text-[10px] text-gray-500">Overall</div>
            </div>
          </div>
          {/* Description */}
          <div className="mb-3">
            <h3 className="font-semibold text-[#23235b] mb-1 text-base">Description</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{useCase.description}</p>
          </div>
          {/* Owner, Timeline, ROI, Complexity */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <h3 className="font-semibold text-[#23235b] mb-0.5 text-sm">Owner</h3>
              <p className="text-gray-700 text-xs">{useCase.owner}</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#23235b] mb-0.5 text-sm">Timeline</h3>
              <p className="text-gray-700 text-xs">{useCase.timeline}</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#23235b] mb-0.5 text-sm">Expected ROI</h3>
              <p className="text-gray-700 text-xs">{useCase.roi}</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#23235b] mb-0.5 text-sm">Complexity</h3>
              <p className="text-gray-700 text-xs">{useCase.complexity}/10</p>
            </div>
          </div>
          {/* Stakeholders */}
          {useCase.stakeholders && (
            <div className="mb-2">
              <h3 className="font-semibold text-[#23235b] mb-0.5 text-sm">Key Stakeholders</h3>
              <div className="flex flex-wrap gap-1">
                {useCase.stakeholders.map((stakeholder, idx) => (
                  <span key={idx} className="bg-[#e9eafc] text-[#5b5be6] px-2 py-0.5 rounded-full text-xs font-medium">
                    {stakeholder}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Risks */}
          {useCase.risks && (
            <div className="mb-2">
              <h3 className="font-semibold text-[#23235b] mb-0.5 text-sm">Key Risks</h3>
              <div className="flex flex-wrap gap-1">
                {useCase.risks.map((risk, idx) => (
                  <span key={idx} className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {risk}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button 
              className="bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] hover:from-[#ff4fa3] hover:to-[#8f4fff] text-white px-3 py-1.5 rounded-lg shadow font-semibold text-xs transition" 
              onClick={() => {handleEdit(useCase.id as string)}}
            >
              Edit Use Case
            </Button>
            <Button 
              className="bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] hover:from-[#ff4fa3] hover:to-[#8f4fff] text-white px-3 py-1.5 rounded-lg shadow font-semibold text-xs transition flex items-center gap-1" 
              onClick={() => {handleView(useCase.id as string)}}
            >
              <Eye className="w-3 h-3" />
              View Use Case
            </Button>
            {useCase.stage === 'proof-of-value' && (
              <Button 
                className="bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] hover:from-[#ff4fa3] hover:to-[#8f4fff] text-white px-3 py-1.5 rounded-lg shadow font-semibold text-xs transition" 
                onClick={() => {handleAssess(useCase.id as string)}}
              >
                Assess
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                className="bg-gray-100 text-[#23235b] px-3 py-1.5 rounded-lg font-semibold shadow hover:bg-gray-200 transition border border-gray-200 text-xs"
                disabled={stages.findIndex(s => s.id === useCase.stage) === 0}
                onClick={async () => {
                  const currentStageIdx = stages.findIndex(s => s.id === useCase.stage);
                  if (currentStageIdx <= 0) return;
                  const prevStage = stages[currentStageIdx - 1].id;
                  await handleMoveToStage(useCase.id, prevStage);
                }}
              >
                Move to Previous Stage
              </Button>
              <Button
                className="bg-gray-100 text-[#23235b] px-3 py-1.5 rounded-lg font-semibold shadow hover:bg-gray-200 transition border border-gray-200 text-xs"
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
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5b5be6]" />
                <Input
                  type="text"
                  placeholder="Search use cases..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-[#5b5be6] focus:ring-[#5b5be6] shadow-sm transition text-sm"
                />
              </div>
              <select
                value={filterBy}
                onChange={e => setFilterBy(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:border-[#5b5be6] focus:ring-[#5b5be6] shadow-sm transition text-sm"
              >
                <option value="all">All Departments</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
                <option value="customer service">Customer Service</option>
                <option value="sales">Sales</option>
                <option value="finance">Finance</option>
                <option value="manufacturing">Manufacturing</option>
              </select>
              <Button
                className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-2 rounded-lg shadow-lg font-semibold text-base transition"
                onClick={() => router.push('/new-usecase')}
              >
                <Plus className="w-5 h-5 mr-2" />
                New Use Case
              </Button>
            </div>
            {/* Stage Stats */}
            <div className="bg-gradient-to-r from-[#f5eaff] via-[#fbeaff] to-[#ffeafd] border border-gray-200 p-4 rounded-xl mb-8 shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
                {stages.map(stage => {
                  const count = getUseCasesByStage(stage.id).length;
                  const icon = stage.id === 'discovery' ? <Search className="w-6 h-6 mx-auto mb-1 text-[#5b5be6]" /> :
                    stage.id === 'business-case' ? <DollarSign className="w-6 h-6 mx-auto mb-1 text-[#5b5be6]" /> :
                    stage.id === 'proof-of-value' ? <TrendingUp className="w-6 h-6 mx-auto mb-1 text-[#5b5be6]" /> :
                    stage.id === 'backlog' ? <Clock className="w-6 h-6 mx-auto mb-1 text-[#5b5be6]" /> :
                    stage.id === 'in-progress' ? <Zap className="w-6 h-6 mx-auto mb-1 text-[#5b5be6]" /> :
                    stage.id === 'solution-validation' ? <User className="w-6 h-6 mx-auto mb-1 text-[#5b5be6]" /> :
                    stage.id === 'pilot' ? <User className="w-6 h-6 mx-auto mb-1 text-[#5b5be6]" /> :
                    <Clock className="w-6 h-6 mx-auto mb-1 text-[#5b5be6]" />;
                  return (
                    <div key={stage.id} className="p-2 rounded-xl bg-gradient-to-br from-[#f5eaff] via-[#fbeaff] to-[#ffeafd] border border-gray-100 shadow flex flex-col items-center transition hover:shadow-md min-w-24">
                      {React.cloneElement(icon, { className: 'w-5 h-5 mx-auto mb-0.5 text-[#5b5be6]' })}
                      <div className="text-lg font-bold text-[#23235b]">{count}</div>
                      <div className="text-xs text-gray-600 font-medium mt-0.5">{stage.title}</div>
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
                    className="w-96 min-h-[350px] bg-gradient-to-b from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] bg-opacity-10 rounded-2xl p-5 flex flex-col shadow-lg flex-grow max-w-full sm:w-96 border border-gray-100 transition hover:shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-semibold text-base text-white tracking-tight">{stage.title}</h3>
                      <span className="bg-white text-[#5b5be6] px-3 py-1 rounded-full text-sm border border-[#e9eafc] font-medium shadow-sm">
                        {getUseCasesByStage(stage.id).length}
                      </span>
                    </div>
                    <div className="flex-1 space-y-5">
                      {getUseCasesByStage(stage.id).map(useCase => (
                        <Card
                          key={useCase.id}
                          className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-shadow cursor-pointer p-4 border border-gray-100 w-full group"
                          onClick={() => setSelectedUseCase(useCase)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-[#23235b] text-base group-hover:text-[#5b5be6] transition-colors">{useCase.title}</h4>
                              <p className="text-xs text-gray-500">{useCase.owner}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorities[useCase.priority ?? 'medium'].color} shadow-sm`}>
                              {priorities[useCase.priority ?? 'medium'].label}
                            </span>
                          </div>
                          <div className="flex justify-between mb-2 text-xs">
                            <div className="flex items-center"><TrendingUp className="w-3 h-3 text-[#5b5be6] mr-1" />{useCase.scores?.operational}</div>
                            <div className="flex items-center"><Zap className="w-3 h-3 text-[#5b5be6] mr-1" />{useCase.scores?.productivity}</div>
                            <div className="flex items-center"><DollarSign className="w-3 h-3 text-[#5b5be6] mr-1" />{useCase.scores?.revenue}</div>
                            <div className="font-semibold text-[#5b5be6]">{getOverallScore(useCase.scores || { operational: 0, productivity: 0, revenue: 0 })}</div>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <div className="flex items-center"><User className="w-3 h-3 mr-1" />{useCase.owner}</div>
                            <div className="flex items-center"><Clock className="w-3 h-3 mr-1" />{useCase.timeline}</div>
                          </div>
                          <div className="mt-2 text-xs text-gray-400">Updated {useCase.lastUpdated}</div>
                        </Card>
                      ))}
                      {getUseCasesByStage(stage.id).length === 0 && (
                        <div className="text-center text-gray-400 py-10">
                          <div className="text-4xl mb-2">📋</div>
                          <p className="text-xs text-white">No use cases in this stage</p>
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