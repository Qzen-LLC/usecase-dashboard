'use client';
import React, { useEffect, useState } from 'react';
import { Plus, Search, TrendingUp, Zap, DollarSign, Clock, User, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
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

  // Fetch use cases from Supabase
  useEffect(() => {
    const fetchUseCases = async () => {
      const { data, error } = await supabase.from('UseCase').select('*');
      if (error) {
        console.error('Error fetching use cases:', error);
        return;
      }
      // Add default frontend fields
      const mapped = (data || []).map((uc: any) => ({
        ...uc,
        stage: 'discovery', // All start in discovery
        priority: 'medium', // You can adjust this logic
        owner: uc.primaryStakeholders?.[0] || 'Unknown',
        lastUpdated: uc.updatedAt ? new Date(uc.updatedAt).toLocaleDateString() : '',
        description: uc.problemStatement || '',
        scores: {
          operational: uc.operationalImpactScore,
          productivity: uc.productivityImpactScore,
          revenue: uc.revenueImpactScore
        },
        complexity: uc.implementationComplexity,
        roi: uc.initialROI,
        timeline: uc.estimatedTimeline,
        stakeholders: uc.primaryStakeholders,
        risks: uc.keyAssumptions
      }));
      setUseCases(mapped);
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

  // Modal for use case details
  const UseCaseDetailModal = ({ useCase, onClose }: { useCase: UseCase, onClose: () => void }) => {
    if (!useCase) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full p-8 relative shadow-2xl">
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
            <Button className="bg-green-600 hover:bg-green-700 text-white">Move to Next Stage</Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Use Case Pipeline</h1>
            <p className="text-gray-600 mt-1">Track and manage AI initiatives across your organization</p>
          </div>
          <Button className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800">
            <Plus className="w-5 h-5 mr-2" />
            New Use Case
          </Button>
        </div>
        {/* Filters */}
        <div className="flex items-center space-x-4 mt-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search use cases..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300"
            />
          </div>
          <select
            value={filterBy}
            onChange={e => setFilterBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
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
        </div>
      </div>

      {/* Stage Stats */}
      <div className="bg-white border-b p-6">
        <div className="grid grid-cols-6 gap-4 text-center">
          {stages.map(stage => {
            const count = getUseCasesByStage(stage.id).length;
            return (
              <div key={stage.id} className={`p-3 rounded-lg ${stage.color}`}>
                <div className={`text-2xl font-bold ${stage.textColor}`}>{count}</div>
                <div className={`text-sm ${stage.textColor}`}>{stage.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 p-6 overflow-x-auto">
        <div className="flex space-x-6 h-full min-w-max">
          {stages.map(stage => (
            <div key={stage.id} className="w-96 bg-gray-100 rounded-2xl p-4 flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-800">{stage.title}</h3>
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {getUseCasesByStage(stage.id).length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4">
                {getUseCasesByStage(stage.id).map(useCase => (
                  <Card
                    key={useCase.id}
                    className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow cursor-pointer p-5"
                    onClick={() => setSelectedUseCase(useCase)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-base">{useCase.title}</h4>
                        <p className="text-xs text-gray-500">{useCase.owner}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorities[useCase.priority ?? 'medium'].color}`}>
                        {priorities[useCase.priority ?? 'medium'].label}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2 text-xs">
                      <div className="flex items-center"><TrendingUp className="w-3 h-3 text-orange-500 mr-1" />{useCase.scores?.operational}</div>
                      <div className="flex items-center"><Zap className="w-3 h-3 text-pink-500 mr-1" />{useCase.scores?.productivity}</div>
                      <div className="flex items-center"><DollarSign className="w-3 h-3 text-blue-500 mr-1" />{useCase.scores?.revenue}</div>
                      <div className="font-semibold text-gray-700">{getOverallScore(useCase.scores || { operational: 0, productivity: 0, revenue: 0 })}</div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div className="flex items-center"><User className="w-3 h-3 mr-1" />{useCase.owner}</div>
                      <div className="flex items-center"><Clock className="w-3 h-3 mr-1" />{useCase.timeline}</div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">Updated {useCase.lastUpdated}</div>
                  </Card>
                ))}
                {getUseCasesByStage(stage.id).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
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
  );
};

export default Dashboard;