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
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

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
  aiucId: number;
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
    decisionMaking: {
      automationLevel: '',
      decisionTypes: [],
    },
    modelCharacteristics: {
      explainabilityLevel: '',
      biasTesting: '',
    },
    aiGovernance: {
      humanOversightLevel: '',
      performanceMonitoring: [],
    },
    ethicalConsiderations: {
      potentialHarmAreas: [],
      vulnerablePopulations: [],
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
    dataTypes: [],
    dataVolume: '',
    growthRate: '',
    numRecords: '',
    primarySources: [],
    dataQualityScore: 5,
    dataCompleteness: 0,
    dataAccuracyConfidence: 0,
    dataFreshness: '',
    dataSubjectLocations: '',
    dataStorageLocations: '',
    dataProcessingLocations: '',
    crossBorderTransfer: false,
    dataLocalization: '',
    dataRetention: '',
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

const validateAssessmentData = (data: any) => {
  if (!data) return false;
  
  // Check if at least one section has data
  const hasData = Object.values(data).some(section => {
    if (!section) return false;
    if (typeof section === 'object') {
      return Object.keys(section).length > 0;
    }
    return true;
  });

  return hasData;
};

export default function AssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const useCaseId = params.useCaseId as string;
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    try {
      if (!validateAssessmentData(assessmentData)) {
        setError("No assessment data to save");
        setTimeout(() => setError(""), 3000);
        return;
      }

      setSaving(true);
      console.log("Saving data:", assessmentData);
      const res = await fetch("/api/post-stepdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCaseId, assessData: assessmentData }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else {
        setError(data.error || "Failed to save assessment data");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Error saving assessment:", err);
      setError("Failed to save assessment data");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSaving(false);
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

      {/* Use Case Title Section */}
      <div className="px-8 py-6 border-b bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-mono text-gray-500 mb-1">AIUC - {useCase.aiucId}</div>
          <div className="text-2xl font-semibold text-gray-900">{useCase.title}</div>
          <div className="text-gray-600">{useCase.department} {useCase.owner}</div>
        </div>
        <button className="text-blue-700 hover:underline mt-4 sm:mt-0">&larr; Back to Pipeline</button>
      </div>

      {/* Assessment Steps Navigation */}
      <div className="px-8 py-4 border-b bg-gray-50 overflow-x-auto">
        <div className="flex items-center space-x-4">
          {assessmentSteps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                className={`flex items-center justify-center w-10 h-10 rounded-full focus:outline-none transition-colors duration-150 ${currentStep === step.id ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600 hover:bg-blue-100"}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setCurrentStep(step.id)}
                aria-current={currentStep === step.id ? 'step' : undefined}
              >
                {step.title[0]}
              </button>
              <button
                type="button"
                className={`ml-2 whitespace-nowrap text-sm font-medium bg-transparent border-none p-0 m-0 focus:outline-none transition-colors duration-150 ${currentStep === step.id ? "text-blue-600" : "text-gray-500 hover:text-blue-600"}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setCurrentStep(step.id)}
                aria-current={currentStep === step.id ? 'step' : undefined}
              >
                {step.title}
              </button>
              {idx < assessmentSteps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-400 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="flex-1 px-8 py-10 bg-white">
        {currentStep === 1 ? (
          <CardHeader>
            <CardTitle>Technical Feasibility</CardTitle>
          </CardHeader>
        ) : currentStep === 2 ? (
          <CardHeader>
            <CardTitle>Business Feasibility</CardTitle>
          </CardHeader>
        ) : currentStep === 3 ? (
          <CardHeader>
            <CardTitle>Ethical Impact</CardTitle>
          </CardHeader>
        ) : currentStep === 4 ? (
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>
        ) : currentStep === 5 ? (
          <CardHeader>
            <CardTitle>Data Readiness</CardTitle>
          </CardHeader>
        ) : currentStep === 6 ? (
          <CardHeader>
            <CardTitle>Roadmap Position</CardTitle>
          </CardHeader>
        ) : currentStep === 7 ? (
          <CardHeader>
            <CardTitle>Budget Planning</CardTitle>
          </CardHeader>
        ) : currentStep === 8 ? (
          <CardHeader>
            <CardTitle>Financial Dashboard</CardTitle>
          </CardHeader>
        ) : currentStep === 9 ? (
          <CardHeader>
            <CardTitle>Approvals</CardTitle>
          </CardHeader>
        ) :
         (
          <div className="text-gray-600 text-lg font-medium">
            You are on <strong>{assessmentSteps[currentStep - 1].title}</strong> step.
          </div>
        )}
        <CardContent>
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
              ref={budgetPlanningRef}
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
        </CardContent>
      </Card>

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
            <button 
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold flex items-center gap-2 ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save Progress'
              )}
            </button>
            {saveSuccess && (
              <div className="ml-4 text-green-600 font-semibold">Progress saved!</div>
            )}
            {error && (
              <div className="ml-4 text-red-600 font-semibold">{error}</div>
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