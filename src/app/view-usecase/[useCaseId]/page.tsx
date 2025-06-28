'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Target, TrendingUp, Zap, DollarSign, Clock, User, CheckCircle, AlertTriangle, Brain, Shield, Calendar, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

// Recursive object renderer
const renderObject = (obj: any, parentKey = ""): React.ReactNode => {
  if (obj === null || obj === undefined) return <span className="text-gray-400">Not specified</span>;
  if (typeof obj === "string" || typeof obj === "number") return <span>{obj}</span>;
  if (typeof obj === "boolean") return <span>{obj ? "Yes" : "No"}</span>;
  if (Array.isArray(obj)) {
    return (
      <ul className="list-disc ml-6">
        {obj.map((item, idx) => (
          <li key={idx}>{renderObject(item, parentKey)}</li>
        ))}
      </ul>
    );
  }
  if (typeof obj === "object") {
    return (
      <div className="space-y-2">
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <span className="font-medium text-gray-700">{parentKey ? `${parentKey} > ${key}` : key}:</span>
            <div className="ml-4">{renderObject(value, key)}</div>
          </div>
        ))}
      </div>
    );
  }
  return <span>{String(obj)}</span>;
};

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
        if (!response.ok) {
          throw new Error('Failed to fetch use case details');
        }
        const data = await response.json();
        setUseCase(data);
      } catch (err) {
        setError('Failed to load use case details');
        console.error('Error fetching use case details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (useCaseId) {
      fetchUseCaseDetails();
    }
  }, [useCaseId]);

  const getOverallScore = () => {
    if (!useCase) return 0;
    return ((useCase.operationalImpactScore + useCase.productivityImpactScore + useCase.revenueImpactScore) / 3).toFixed(1);
  };

  const renderSection = (title: string, icon: React.ReactNode, children: React.ReactNode) => (
    <Card className="p-6 mb-6">
      <div className="flex items-center mb-4">
        {icon}
        <h2 className="text-xl font-semibold text-gray-800 ml-2">{title}</h2>
      </div>
      {children}
    </Card>
  );

  const renderField = (label: string, value: string | number | string[] | undefined, type: 'text' | 'array' | 'score' = 'text') => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {type === 'array' && Array.isArray(value) ? (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {item}
            </span>
          ))}
        </div>
      ) : type === 'score' ? (
        <div className="flex items-center">
          <span className="text-2xl font-bold text-blue-600">{value}</span>
          <span className="text-gray-500 ml-2">/ 10</span>
        </div>
      ) : (
        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
          {value !== undefined && value !== null && value !== "" ? value : "Not specified"}
        </p>
      )}
    </div>
  );

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
          <Button 
            onClick={() => router.back()} 
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{useCase.title}</h1>
                <p className="text-gray-600">Use Case Details</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                useCase.priority === 'high' ? 'bg-red-100 text-red-800' :
                useCase.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
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
            {renderSection(
              'Use Case Documentation',
              <Target className="h-6 w-6 text-blue-600" />,
              <div className="space-y-4">
                <div><span className="font-medium text-gray-700">Problem Statement:</span> <span>{useCase.problemStatement}</span></div>
                <div><span className="font-medium text-gray-700">Proposed AI Solution:</span> <span>{useCase.proposedAISolution}</span></div>
                <div><span className="font-medium text-gray-700">Current State:</span> <span>{useCase.currentState}</span></div>
                <div><span className="font-medium text-gray-700">Desired State:</span> <span>{useCase.desiredState}</span></div>
                <div><span className="font-medium text-gray-700">Primary Stakeholders:</span> {renderObject(useCase.primaryStakeholders)}</div>
                <div><span className="font-medium text-gray-700">Secondary Stakeholders:</span> {renderObject(useCase.secondaryStakeholders)}</div>
                <div><span className="font-medium text-gray-700">Success Criteria:</span> {renderObject(useCase.successCriteria)}</div>
              </div>
            )}

            {/* Lean Business Case */}
            {renderSection(
              'Lean Business Case',
              <TrendingUp className="h-6 w-6 text-green-600" />,
              <div className="space-y-4">
                <div><span className="font-medium text-gray-700">Problem Validation:</span> <span>{useCase.problemValidation}</span></div>
                <div><span className="font-medium text-gray-700">Solution Hypothesis:</span> <span>{useCase.solutionHypothesis}</span></div>
                <div><span className="font-medium text-gray-700">Key Assumptions:</span> {renderObject(useCase.keyAssumptions)}</div>
                <div><span className="font-medium text-gray-700">Initial ROI:</span> <span>{useCase.initialROI}</span></div>
                <div><span className="font-medium text-gray-700">Confidence Level:</span> <span>{useCase.confidenceLevel}</span></div>
              </div>
            )}

            {/* Multi-Dimensional Scoring */}
            {renderSection(
              'Multi-Dimensional Scoring',
              <Zap className="h-6 w-6 text-purple-600" />,
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
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
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-800">Overall Score: {getOverallScore()}</div>
                  <div className="text-sm text-gray-600">Implementation Complexity: {useCase.implementationComplexity}/10</div>
                </div>
                <div><span className="font-medium text-gray-700">Estimated Timeline:</span> <span>{useCase.estimatedTimeline}</span></div>
                <div><span className="font-medium text-gray-700">Required Resources:</span> <span>{useCase.requiredResources}</span></div>
              </div>
            )}

            {/* Assessment Data - Render all fields for each step */}
            {useCase.assessData?.stepsData && (
              <>
                {useCase.assessData.stepsData.technicalFeasibility &&
                  renderSection(
                    'Technical Feasibility',
                    <Brain className="h-6 w-6 text-blue-600" />,
                    <div>{renderObject(useCase.assessData.stepsData.technicalFeasibility)}</div>
                  )}
                {useCase.assessData.stepsData.businessFeasibility &&
                  renderSection(
                    'Business Feasibility',
                    <DollarSign className="h-6 w-6 text-green-600" />,
                    <div>{renderObject(useCase.assessData.stepsData.businessFeasibility)}</div>
                  )}
                {useCase.assessData.stepsData.ethicalImpact &&
                  renderSection(
                    'Ethical Impact',
                    <Shield className="h-6 w-6 text-purple-600" />,
                    <div>{renderObject(useCase.assessData.stepsData.ethicalImpact)}</div>
                  )}
                {useCase.assessData.stepsData.riskAssessment &&
                  renderSection(
                    'Risk Assessment',
                    <AlertTriangle className="h-6 w-6 text-red-600" />,
                    <div>{renderObject(useCase.assessData.stepsData.riskAssessment)}</div>
                  )}
                {useCase.assessData.stepsData.dataReadiness &&
                  renderSection(
                    'Data Readiness',
                    <FileText className="h-6 w-6 text-cyan-600" />,
                    <div>{renderObject(useCase.assessData.stepsData.dataReadiness)}</div>
                  )}
                {useCase.assessData.stepsData.roadmapPosition &&
                  renderSection(
                    'Roadmap Position',
                    <Calendar className="h-6 w-6 text-indigo-600" />,
                    <div>{renderObject(useCase.assessData.stepsData.roadmapPosition)}</div>
                  )}
                {useCase.assessData.stepsData.budgetPlanning &&
                  renderSection(
                    'Budget Planning',
                    <DollarSign className="h-6 w-6 text-yellow-600" />,
                    <div>{renderObject(useCase.assessData.stepsData.budgetPlanning)}</div>
                  )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
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