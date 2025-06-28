"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import TechnicalFeasibility from '@/components/TechnicalFeasibility';
import EthicalImpact from '@/components/EthicalImpact';
import RiskAssessment from '@/components/RiskAssessment';
import BusinessFeasibility from "@/components/BusinessFeasibility";
import BudgetPlanning from "@/components/BudgetPlanning";
import {
  TrendingUp,
  Shield,
  AlertTriangle,
  Brain,
  DollarSign,
  Calendar,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import RoadmapPosition from "@/components/RoadmapPosition";
import DataReadiness from "@/components/DataReadiness";
import FinancialDashboard from './financial-dashboard/page';
import ApprovalsPage from '@/components/ApprovalsPage';

const assessmentSteps = [
  { id: 1, title: "Technical Feasibility" },
  { id: 2, title: "Business Feasibility" },
  { id: 3, title: "Ethical Impact" },
  { id: 4, title: "Risk Assessment" },
  { id: 5, title: "Data Readiness" },
  { id: 6, title: "Roadmap Position" },
  { id: 7, title: "Budget Planning" },
  { id: 8, title: "Financial Dashboard" },
  { id: 9, title: "Approvals" },
];

interface UseCase {
  title: string;
  department: string;
  owner: string;
}

const defaultAssessmentData = {
  technicalFeasibility: {
    modelTypes: [],
    modelSizes: [],
    deploymentModels: [],
    cloudProviders: [],
    computeRequirements: [],
    integrationPoints: [],
    apiSpecs: [],
    authMethods: [],
    encryptionStandards: [],
    technicalComplexity: 0,
    outputTypes: [],
    confidenceScore: '',
  },
  businessFeasibility: {
    strategicAlignment: 8,
    marketOpportunity: 'large',
    stakeholder: { exec: true, endUser: false, it: true },
    annualSavings: '2.4M',
    efficiencyGain: 35,
    paybackPeriod: 8,
    availabilityRequirement: '',
    responseTimeRequirement: '',
    concurrentUsers: '',
    revenueImpactType: '',
    estimatedFinancialImpact: '',
    userCategories: [],
    systemCriticality: '',
    failureImpact: '',
    executiveSponsorLevel: '',
    stakeholderGroups: [],
  },
  ethicalImpact: {
    biasFairness: {
      historicalBias: false,
      demographicGaps: false,
      geographicBias: false,
      selectionBias: false,
      confirmationBias: false,
      temporalBias: false,
    },
    privacySecurity: {
      dataMinimization: false,
      consentManagement: false,
      dataAnonymization: false,
    },
  },
  riskAssessment: {
    technicalRisks: [
      { risk: 'Model accuracy degradation', probability: 'None', impact: 'None' },
      { risk: 'Data quality issues', probability: 'None', impact: 'None' },
      { risk: 'Integration failures', probability: 'None', impact: 'None' },
    ],
    businessRisks: [
      { risk: 'User adoption resistance', probability: 'None', impact: 'None' },
      { risk: 'Regulatory changes', probability: 'None', impact: 'None' },
      { risk: 'Competitive response', probability: 'None', impact: 'None' },
    ],
  },
  dataReadiness: {
    trainingDataVolume: 'Sufficient (100K+ records)',
    historicalDataDepth: '3+ years',
    qualityScores: {
      completeness: 85,
      accuracy: 92,
      consistency: 78,
      timeliness: 95,
    },
    sources: {
      internal: true,
      logs: true,
      external: false,
      thirdParty: false,
    },
    pipeline: {
      'Data Extraction': false,
      'Data Transformation': false,
      'Data Loading/Storage': false,
      'Real-time Processing': false,
    },
    governance: {
      'Data Catalog': true,
      'Lineage Tracking': true,
      'Quality Monitoring': false,
      'Privacy Controls': true,
    },
    featureEngineeringReqs: '',
    criticalDataGaps: '',
    dataCollectionStrategy: '',
    dataReadinessTimeline: '',
  },
  roadmapPosition: {
    priority: 'high',
    projectStage: '',
    timelineConstraints: [],
    timeline: 'q2',
    dependencies: {
      dataPlatform: false,
      security: false,
      hiring: false,
    },
    metrics: '',
  },
  budgetPlanning: {
    initialDevCost: 150000,
    baseApiCost: 8000,
    baseInfraCost: 2000,
    baseOpCost: 5000,
    baseMonthlyValue: 25000,
    valueGrowthRate: 0.15,
    budgetRange: '',
    error: '',
    loading: false,
  },
};

export default function AssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const useCaseId = params.useCaseId as string;
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentData, setAssessmentData] = useState<{ [key: string]: any }>(defaultAssessmentData);
  const budgetPlanningRef = useRef<{ saveFinops: () => Promise<void> }>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const approvalsPageRef = useRef<{ handleComplete: () => Promise<void> }>(null);

  const handleAssessmentChange = (section: string, data: any) => {
    setAssessmentData((prevData: any) => {
      // @ts-ignore
      return {
        ...prevData,
        [section]: data,
      };
    });
  };

  useEffect(() => {
    if (!useCaseId) return;
    setLoading(true);
    fetch(`/api/get-usecase?id=${useCaseId}`)
      .then((res) => res.json())
      .then((data) => {
        setUseCase(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load use case");
        setLoading(false);
      });
  }, [useCaseId]);

  useEffect(() => {
    setAssessmentData((prev: any) => {
      const next = { ...defaultAssessmentData, ...prev };
      for (const key in defaultAssessmentData) {
        if (!next[key]) next[key] = (defaultAssessmentData as any)[key];
      }
      return next;
    });
  }, []);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === assessmentSteps.length;
  
  const handleSave = async () => {
    console.log("Saving data:", assessmentData);
    const res = await fetch("/api/post-stepdata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ useCaseId, assessData: assessmentData }),
    });
    if (res.ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleNext = async () => {
    if (currentStep === 7 && budgetPlanningRef.current) {
      await budgetPlanningRef.current.saveFinops();
    }
    if (currentStep < assessmentSteps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">Loading...</div>;
  }
  if (error || !useCase) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-red-500">{error || "Use case not found"}</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation */}
      <div className="flex items-center border-b px-6 py-3 bg-white">
        <div className="flex space-x-8">
          <button className="text-gray-600 font-medium hover:text-blue-700 flex items-center">
            <span className="mr-2">📊</span> Pipeline
          </button>
          <button className="text-blue-700 font-semibold border-b-2 border-blue-700 flex items-center">
            <span className="mr-2">🛡️</span> Assessment
          </button>
          <button className="text-gray-600 font-medium hover:text-blue-700 flex items-center">
            <span className="mr-2">📁</span> Portfolio
          </button>
        </div>
        <div className="ml-auto text-xl font-bold text-gray-900">AI Strategic Enablement</div>
      </div>

      {/* Use Case Title Section */}
      <div className="px-8 py-6 border-b bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-2xl font-semibold text-gray-900 mb-1">{useCase.title}</div>
          <div className="text-gray-600">{useCase.department} • {useCase.owner}</div>
        </div>
        <button className="text-blue-700 hover:underline mt-4 sm:mt-0">&larr; Back to Pipeline</button>
      </div>

      {/* Assessment Steps Navigation */}
      <div className="px-8 py-4 border-b bg-gray-50 overflow-x-auto">
        <div className="flex items-center space-x-4">
          {assessmentSteps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep === step.id ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}>
                {/* You can add icons here if desired */}
                {step.title[0]}
              </div>
              <div className="ml-2 whitespace-nowrap">
                <div className={`text-sm font-medium ${currentStep === step.id ? "text-blue-600" : "text-gray-500"}`}>
                  {step.title}
                </div>
              </div>
              {idx < assessmentSteps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-400 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
         <div className="flex-1 px-8 py-10 bg-white">
        {currentStep === 1 ? (
          <TechnicalFeasibility
            value={assessmentData.technicalFeasibility}
            onChange={data => handleAssessmentChange('technicalFeasibility', data)}
          />
        ) : currentStep === 2 ? (
          <BusinessFeasibility
            value={assessmentData.businessFeasibility}
            onChange={data => handleAssessmentChange('businessFeasibility', data)}
          />
        ) : currentStep === 3 ? (
          <EthicalImpact
            value={assessmentData.ethicalImpact}
            onChange={data => handleAssessmentChange('ethicalImpact', data)}
          />
        ) : currentStep === 4 ? (
          <RiskAssessment
            value={assessmentData.riskAssessment}
            onChange={data => handleAssessmentChange('riskAssessment', data)}
          />
        ) : currentStep === 5 ? (
          <DataReadiness
            value={assessmentData.dataReadiness}
            onChange={data => handleAssessmentChange('dataReadiness', data)}
          />
        ) : currentStep === 6 ? (
          <RoadmapPosition
            value={assessmentData.roadmapPosition}
            onChange={data => handleAssessmentChange('roadmapPosition', data)}
          />
        ) : currentStep === 7 ? (
          <BudgetPlanning
            value={assessmentData.budgetPlanning}
            onChange={data => handleAssessmentChange('budgetPlanning', data)}
          />
        ) : currentStep === 8 ? (
          <FinancialDashboard />
        ) : currentStep === 9 ? (
          <ApprovalsPage ref={approvalsPageRef} />
        ) :
         (
          <div className="text-gray-600 text-lg font-medium">
            You are on <strong>{assessmentSteps[currentStep - 1].title}</strong> step.
          </div>
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="px-8 py-6 border-t bg-white flex justify-between items-center">
        <button
          className={`flex items-center px-4 py-2 rounded-md ${isFirstStep ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
          disabled={isFirstStep}
          onClick={handlePrev}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </button>
        {currentStep < 8 && (
          <>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
                    onClick={handleSave}
            >
              Save Progress
            </button>
            {saveSuccess && (
              <div className="ml-4 text-green-600 font-semibold">Progress saved!</div>
            )}
          </>
        )}
        {currentStep < 9 ? (
          <button
            className={`flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700`}
            onClick={handleNext}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        ) : (
          <button
            className="px-4 py-2 w-64 bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] text-white rounded-xl shadow-lg font-semibold text-lg transition"
            onClick={async () => {
              if (approvalsPageRef.current && approvalsPageRef.current.handleComplete) {
                await approvalsPageRef.current.handleComplete();
              }
              // Move use case to backlog
              await fetch('/api/update-stage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ useCaseId, newStage: 'backlog' }),
              });
              router.push('/dashboard');
            }}
          >
            Complete Assessment
          </button>
        )}
      </div>
    </div>
  );
} 