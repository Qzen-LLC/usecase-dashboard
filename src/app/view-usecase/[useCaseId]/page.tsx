'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Target, TrendingUp, Zap, DollarSign, Clock, User, CheckCircle, AlertTriangle, Brain, Shield, Calendar, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReadOnlyAssessmentDisplay from '@/components/ReadOnlyAssessmentDisplay';

interface UseCaseDetails {
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
  businessFunction: string;
  stage?: string;
  priority?: string;
  createdAt: string;
  updatedAt: string;
  assessData?: {
    stepsData: {
      technicalFeasibility?: any;
      businessFeasibility?: any;
      ethicalImpact?: any;
      riskAssessment?: any;
      dataReadiness?: any;
      roadmapPosition?: any;
      budgetPlanning?: any;
    };
  };
}

const badgeColor = (priority?: string) =>
  priority === 'high'
    ? 'bg-red-100 text-red-800'
    : priority === 'medium'
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-green-100 text-green-800';

const renderList = (arr?: string[]) =>
  arr && arr.length > 0 ? (
    <div className="flex flex-wrap gap-2">
      {arr.map((item, idx) => (
        <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{item}</span>
      ))}
    </div>
  ) : (
    <span className="text-gray-400">Not specified</span>
  );

const renderKeyValue = (obj: any) =>
  obj && typeof obj === 'object' ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
      {Object.entries(obj).map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <span className="text-xs text-gray-500">{key}</span>
          <span className="font-medium text-gray-800">{String(value)}</span>
        </div>
      ))}
    </div>
  ) : (
    <span className="text-gray-400">Not specified</span>
  );

const renderAssessmentSection = (title: string, icon: React.ReactNode, data: any) => (
  <Card className="p-5 mb-4">
    <div className="flex items-center mb-3">
      {icon}
      <h3 className="text-lg font-semibold text-gray-800 ml-2">{title}</h3>
    </div>
    {typeof data === 'object' && !Array.isArray(data)
      ? renderKeyValue(data)
      : Array.isArray(data)
      ? renderList(data)
      : <span className="text-gray-700">{String(data)}</span>}
  </Card>
);

const ViewUseCasePage = () => {
  const params = useParams();
  const router = useRouter();
  const useCaseId = params.useCaseId as string;
  const [useCase, setUseCase] = useState<UseCaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUseCaseDetails = async () => {
      try {
        const response = await fetch(`/api/get-usecase-details?useCaseId=${useCaseId}`);
        if (!response.ok) throw new Error('Failed to fetch use case details');
        const data = await response.json();
        setUseCase(data);
      } catch (err) {
        setError('Failed to load use case details');
      } finally {
        setLoading(false);
      }
    };
    if (useCaseId) fetchUseCaseDetails();
  }, [useCaseId]);

  // Helper for array rendering
  const renderArray = (items: string[] | undefined, label: string) => {
    if (!items || items.length === 0) return <span className="text-gray-400 italic">No {label.toLowerCase()} recorded.</span>;
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
            {item}
          </span>
        ))}
      </div>
    );
  };

  // Helper for risk rendering
  const renderRiskList = (risks: any[] | string | undefined, label: string) => {
    if (Array.isArray(risks)) {
      if (risks.length === 0) return <p className="text-gray-500 italic">No {label.toLowerCase()} recorded.</p>;
      return (
        <div className="space-y-2">
          {risks.map((riskObj, idx) => (
            <div key={idx} className="bg-red-50 p-3 rounded-md">
              {riskObj.risk && <div><strong>Risk:</strong> {riskObj.risk}</div>}
              {riskObj.impact !== undefined && <div><strong>Impact:</strong> {riskObj.impact}</div>}
              {riskObj.probability !== undefined && <div><strong>Probability:</strong> {riskObj.probability}</div>}
            </div>
          ))}
        </div>
      );
    } else if (typeof risks === 'string') {
      return <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{risks}</p>;
    } else {
      return <p className="text-gray-500 italic">No {label.toLowerCase()} recorded.</p>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading use case details...</p>
        </div>
      </div>
    );
  }

  if (error || !useCase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error || 'Use case not found'}</p>
          <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const getOverallScore = () =>
    ((useCase.operationalImpactScore + useCase.productivityImpactScore + useCase.revenueImpactScore) / 3).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => router.back()} className="mr-4">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{useCase.title}</h1>
                <p className="text-gray-600">Use Case Details</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColor(useCase.priority)}`}>
                {useCase.priority || 'Medium'} Priority
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {useCase.stage || 'Discovery'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Use Case Documentation */}
            <Card className="p-6 mb-4">
              <div className="flex items-center mb-3">
                <Target className="h-6 w-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800 ml-2">Use Case Documentation</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Problem Statement</div>
                  <div className="font-medium text-gray-900">{useCase.problemStatement}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Proposed AI Solution</div>
                  <div className="font-medium text-gray-900">{useCase.proposedAISolution}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Current State</div>
                  <div className="text-gray-800">{useCase.currentState}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Desired State</div>
                  <div className="text-gray-800">{useCase.desiredState}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Primary Stakeholders</div>
                  {renderList(useCase.primaryStakeholders)}
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Secondary Stakeholders</div>
                  {renderList(useCase.secondaryStakeholders)}
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Success Criteria</div>
                  {renderList(useCase.successCriteria)}
                </div>
            {renderSection(
              'Use Case Documentation',
              <Target className="h-6 w-6 text-blue-600" />,
              <div className="space-y-4">
                <div><span className="font-medium text-gray-700">Problem Statement:</span> <span>{useCase.problemStatement}</span></div>
                <div><span className="font-medium text-gray-700">Proposed AI Solution:</span> <span>{useCase.proposedAISolution}</span></div>
                <div><span className="font-medium text-gray-700">Current State:</span> <span>{useCase.currentState}</span></div>
                <div><span className="font-medium text-gray-700">Desired State:</span> <span>{useCase.desiredState}</span></div>
                <div><span className="font-medium text-gray-700">Primary Stakeholders:</span> {renderArray(useCase.primaryStakeholders, 'stakeholder')}</div>
                <div><span className="font-medium text-gray-700">Secondary Stakeholders:</span> {renderArray(useCase.secondaryStakeholders, 'stakeholder')}</div>
                <div><span className="font-medium text-gray-700">Success Criteria:</span> {renderArray(useCase.successCriteria, 'success criterion')}</div>
              </div>
            </Card>

            {/* Lean Business Case */}
            <Card className="p-6 mb-4">
              <div className="flex items-center mb-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-800 ml-2">Lean Business Case</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Problem Validation</div>
                  <div className="text-gray-800">{useCase.problemValidation}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Solution Hypothesis</div>
                  <div className="text-gray-800">{useCase.solutionHypothesis}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Key Assumptions</div>
                  {renderList(useCase.keyAssumptions)}
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Initial ROI</div>
                  <div className="text-gray-800">{useCase.initialROI}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Confidence Level</div>
                  <div className="text-gray-800">{useCase.confidenceLevel}</div>
                </div>
            {renderSection(
              'Lean Business Case',
              <TrendingUp className="h-6 w-6 text-green-600" />,
              <div className="space-y-4">
                <div><span className="font-medium text-gray-700">Problem Validation:</span> <span>{useCase.problemValidation}</span></div>
                <div><span className="font-medium text-gray-700">Solution Hypothesis:</span> <span>{useCase.solutionHypothesis}</span></div>
                <div><span className="font-medium text-gray-700">Key Assumptions:</span> {renderArray(useCase.keyAssumptions, 'assumption')}</div>
                <div><span className="font-medium text-gray-700">Initial ROI:</span> <span>{useCase.initialROI}</span></div>
                <div><span className="font-medium text-gray-700">Confidence Level:</span> <span>{useCase.confidenceLevel}</span></div>
              </div>
            </Card>

            {/* Multi-Dimensional Scoring */}
            <Card className="p-6 mb-4">
              <div className="flex items-center mb-3">
                <Zap className="h-6 w-6 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800 ml-2">Multi-Dimensional Scoring</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{useCase.operationalImpactScore}</div>
                  <div className="text-sm text-orange-800">Operational Impact</div>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">{useCase.productivityImpactScore}</div>
                  <div className="text-sm text-pink-800">Productivity Impact</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{useCase.revenueImpactScore}</div>
                  <div className="text-sm text-blue-800">Revenue Impact</div>
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg mb-4">
                <div className="text-xl font-bold text-gray-800">Overall Score: {getOverallScore()}</div>
                <div className="text-sm text-gray-600">Implementation Complexity: {useCase.implementationComplexity}/10</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Estimated Timeline</div>
                  <div className="text-gray-800">{useCase.estimatedTimeline}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Required Resources</div>
                  <div className="text-gray-800">{useCase.requiredResources}</div>
                </div>
              </div>
            </Card>

            {/* Assessment Data */}
            {useCase.assessData?.stepsData && (
              <>
                {useCase.assessData.stepsData.technicalFeasibility &&
                  renderAssessmentSection('Technical Feasibility', <Brain className="h-5 w-5 text-blue-600" />, useCase.assessData.stepsData.technicalFeasibility)}
                {useCase.assessData.stepsData.businessFeasibility &&
                  renderAssessmentSection('Business Feasibility', <DollarSign className="h-5 w-5 text-green-600" />, useCase.assessData.stepsData.businessFeasibility)}
                {useCase.assessData.stepsData.ethicalImpact &&
                  renderAssessmentSection('Ethical Impact', <Shield className="h-5 w-5 text-purple-600" />, useCase.assessData.stepsData.ethicalImpact)}
                {useCase.assessData.stepsData.riskAssessment &&
                  renderAssessmentSection('Risk Assessment', <AlertTriangle className="h-5 w-5 text-red-600" />, useCase.assessData.stepsData.riskAssessment)}
                {useCase.assessData.stepsData.dataReadiness &&
                  renderAssessmentSection('Data Readiness', <FileText className="h-5 w-5 text-cyan-600" />, useCase.assessData.stepsData.dataReadiness)}
                {useCase.assessData.stepsData.roadmapPosition &&
                  renderAssessmentSection('Roadmap Position', <Calendar className="h-5 w-5 text-indigo-600" />, useCase.assessData.stepsData.roadmapPosition)}
                {useCase.assessData.stepsData.budgetPlanning &&
                  renderAssessmentSection('Budget Planning', <DollarSign className="h-5 w-5 text-yellow-600" />, useCase.assessData.stepsData.budgetPlanning)}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Business Function</label>
                  <p className="text-gray-900">{useCase.businessFunction}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p className="text-gray-900">{new Date(useCase.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="text-gray-900">{new Date(useCase.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUseCasePage;