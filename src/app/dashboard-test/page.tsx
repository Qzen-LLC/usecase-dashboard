'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, TrendingUp, Zap, DollarSign, Clock, User, X } from 'lucide-react';
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
  { id: 'discovery', title: 'Discovery', color: 'bg-gray-100', textColor: 'text-gray-700' },
  { id: 'business-case', title: 'Business Case', color: 'bg-blue-100', textColor: 'text-blue-700' },
  { id: 'feasibility', title: 'Feasibility', color: 'bg-yellow-100', textColor: 'text-yellow-700' },
  { id: 'proof-of-value', title: 'Proof of Value', color: 'bg-orange-100', textColor: 'text-orange-700' },
  { id: 'pilot', title: 'Pilot', color: 'bg-purple-100', textColor: 'text-purple-700' },
  { id: 'deployment', title: 'Deployment', color: 'bg-green-100', textColor: 'text-green-700' }
] as const;

const priorities = {
  high: { color: 'bg-red-100 text-red-800', label: 'High' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
  low: { color: 'bg-green-100 text-green-800', label: 'Low' }
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

  // Fetch use cases from API
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
          stage: 'discovery', // All start in discovery
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

  const getUseCasesByStage = (stageId: string) =>
    filteredUseCases.filter(useCase => useCase.stage === stageId);

  const getOverallScore = (scores: { operational: number, productivity: number, revenue: number }) =>
    ((scores.operational + scores.productivity + scores.revenue) / 3).toFixed(1);

  // Handler to update the stage of a use case
  const handleMoveToStage = (useCaseId: string, newStage: string) => {
    setUseCases(prev =>
      prev.map(uc =>
        uc.id === useCaseId ? { ...uc, stage: newStage } : uc
      )
    );
    setSelectedUseCase(prev =>
      prev ? { ...prev, stage: newStage } : prev
    );
    // TODO: Optionally call API to persist the change
  };

  // Modal for use case details
  const UseCaseDetailModal = ({ useCase, onClose }: { useCase: UseCase, onClose: () => void }) => {
    if (!useCase) return null;
    const availableStages = stages.filter(s => s.id !== useCase.stage);

    return (
      <div className="fixed inset-0 bg-white/50 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full p-8 relative shadow-2xl">
          {/* Remove dropdown from top right, keep only close button */}
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold mb-1">{useCase.title}</h2>
          <p className="text-gray-500 mb-6">{useCase.owner}</p>
          {/* Scores */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <TrendingUp className="w-6 h-6 text-orange-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-orange-600">{useCase.scores?.operational}</div>
              <div className="text-xs text-orange-800">Operational</div>
            </div>
            <div className="bg-pink-50 p-3 rounded-lg text-center">
              <Zap className="w-6 h-6 text-pink-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-pink-600">{useCase.scores?.productivity}</div>
              <div className="text-xs text-pink-800">Productivity</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <DollarSign className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-600">{useCase.scores?.revenue}</div>
              <div className="text-xs text-blue-800">Revenue</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <span className="inline-block w-6 h-6 text-gray-500 mx-auto mb-1">🎯</span>
              <div className="text-lg font-bold text-gray-700">{getOverallScore(useCase.scores || { operational: 0, productivity: 0, revenue: 0 })}</div>
              <div className="text-xs text-gray-600">Overall</div>
            </div>
          </div>
          {/* Description */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700">{useCase.description}</p>
          </div>
          {/* Owner, Timeline, ROI, Complexity */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Owner</h3>
              <p className="text-gray-700">{useCase.owner}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Timeline</h3>
              <p className="text-gray-700">{useCase.timeline}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Expected ROI</h3>
              <p className="text-gray-700">{useCase.roi}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Complexity</h3>
              <p className="text-gray-700">{useCase.complexity}/10</p>
            </div>
          </div>
          {/* Stakeholders */}
          {useCase.stakeholders && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">Key Stakeholders</h3>
              <div className="flex flex-wrap gap-2">
                {useCase.stakeholders.map((stakeholder, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {stakeholder}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Risks */}
          {useCase.risks && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">Key Risks</h3>
              <div className="flex flex-wrap gap-2">
                {useCase.risks.map((risk, idx) => (
                  <span key={idx} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                    {risk}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Edit Use Case</Button>
            {/* Move dropdown here */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="bg-[#a259e6] text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#5b5be6] transition">
                  Move to Stage
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableStages.map(stage => (
                  <DropdownMenuItem
                    key={stage.id}
                    onSelect={() => handleMoveToStage(useCase.id, stage.id)}
                  >
                    {stage.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#101024] flex flex-col justify-center items-center">
      <div className="w-full max-w-7xl bg-[#23233a] rounded-2xl shadow-2xl border-4 border-[#a259e6] mt-10 mb-10 mx-auto relative z-10">
        {/* QZen AI Branding Header */}
        <div className="flex flex-col items-center bg-[#18182c] rounded-t-2xl">
          <div className="flex items-center gap-4 justify-center py-8">
            <img src="https://blfsawovozyywndoiicu.supabase.co/storage/v1/object/sign/company/sharpened_logo_transparent.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MjUwODc5My03NTY4LTQ5ZWYtOTJlMS1lYmU4MmM1YTUwYzQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb21wYW55L3NoYXJwZW5lZF9sb2dvX3RyYW5zcGFyZW50LnBuZyIsImlhdCI6MTc1MDc4NTQ3NywiZXhwIjoxOTA4NDY1NDc3fQ.v6nh5VRRDin2cGatgU3yHbUweQEulxqEAupCj8Mbgeg" alt="QZen AI Logo" className="h-14 w-14 object-contain" />
            <span className="text-4xl font-extrabold bg-gradient-to-r from-[#5b5be6] via-[#a259e6] to-[#d26be8] bg-clip-text text-transparent font-sans">QZen AI</span>
          </div>
          <div className="w-full flex justify-center pb-4">
            <p className="text-[#e0cfff] text-lg text-center font-medium">Transform AI ideas into structured, quantified business opportunities</p>
          </div>
        </div>
        {/* Main Content */}
        <div className="p-6">
          {/* Filters and Add Button */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#a259e6]" />
              <Input
                type="text"
                placeholder="Search use cases..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-[#bdbdd7] bg-[#23233a] text-white placeholder-[#e0cfff] focus:border-[#a259e6] focus:ring-[#a259e6]"
              />
            </div>
            <select
              value={filterBy}
              onChange={e => setFilterBy(e.target.value)}
              className="px-4 py-2 border border-[#bdbdd7] rounded-lg bg-[#23233a] text-white focus:border-[#a259e6] focus:ring-[#a259e6]"
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
              className="bg-[#5be6b9] hover:bg-[#3ad29f] text-black px-5 py-2 rounded-lg shadow-md"
              onClick={() => router.push('/')}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Use Case
            </Button>
          </div>
          {/* Stage Stats */}
          <div className="bg-[#23233a] border-b border-[#23233a] p-6 rounded-lg mb-6">
            <div className="grid grid-cols-6 gap-4 text-center">
              {stages.map(stage => {
                const count = getUseCasesByStage(stage.id).length;
                return (
                  <div key={stage.id} className="p-3 rounded-lg bg-[#18182c]">
                    <div className="text-2xl font-bold text-[#a259e6]">{count}</div>
                    <div className="text-sm text-[#bdbdd7]">{stage.title}</div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Kanban Board with Drag and Drop */}
          <div className="overflow-x-auto">
            <div className="flex space-x-6 min-w-max items-stretch">
              {stages.map(stage => (
                <div
                  key={stage.id}
                  className="w-96 bg-[#18182c] rounded-2xl p-4 flex flex-col shadow-sm flex-grow max-w-full sm:w-96"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    const useCaseId = e.dataTransfer.getData('useCaseId');
                    setUseCases(prev => prev.map(uc => uc.id === useCaseId ? { ...uc, stage: stage.id } : uc));
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-[#d26be8]">{stage.title}</h3>
                    <span className="bg-[#23233a] text-[#a259e6] px-3 py-1 rounded-full text-sm">
                      {getUseCasesByStage(stage.id).length}
                    </span>
                  </div>
                  <div className="flex-1 space-y-4">
                    {getUseCasesByStage(stage.id).map(useCase => (
                      <Card
                        key={useCase.id}
                        className="bg-[#23233a] rounded-xl shadow hover:shadow-lg transition-shadow cursor-pointer p-3 sm:p-5 border border-[#bdbdd7] text-white w-full"
                        draggable
                        onDragStart={e => e.dataTransfer.setData('useCaseId', useCase.id)}
                        onClick={() => setSelectedUseCase(useCase)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-white text-base">{useCase.title}</h4>
                            <p className="text-xs text-[#e0cfff]">{useCase.owner}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#a259e6] text-white">
                            {priorities[useCase.priority ?? 'medium'].label}
                          </span>
                        </div>
                        <div className="flex justify-between mb-2 text-xs">
                          <div className="flex items-center"><TrendingUp className="w-3 h-3 text-[#e0cfff] mr-1" />{useCase.scores?.operational}</div>
                          <div className="flex items-center"><Zap className="w-3 h-3 text-[#e0cfff] mr-1" />{useCase.scores?.productivity}</div>
                          <div className="flex items-center"><DollarSign className="w-3 h-3 text-[#e0cfff] mr-1" />{useCase.scores?.revenue}</div>
                          <div className="font-semibold text-[#d26be8]">{getOverallScore(useCase.scores || { operational: 0, productivity: 0, revenue: 0 })}</div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-[#e0cfff]">
                          <div className="flex items-center"><User className="w-3 h-3 mr-1" />{useCase.owner}</div>
                          <div className="flex items-center"><Clock className="w-3 h-3 mr-1" />{useCase.timeline}</div>
                        </div>
                        <div className="mt-2 text-xs text-[#a259e6]">Updated {useCase.lastUpdated}</div>
                      </Card>
                    ))}
                    {getUseCasesByStage(stage.id).length === 0 && (
                      <div className="text-center text-[#bdbdd7] py-8">
                        <div className="text-4xl mb-2">📋</div>
                        <p className="text-sm">No use cases in this stage</p>
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
  );
};

export default Dashboard;