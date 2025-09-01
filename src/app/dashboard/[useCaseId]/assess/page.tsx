"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import TechnicalFeasibility from '@/components/TechnicalFeasibility';
import EthicalImpact from '@/components/EthicalImpact';
import RiskAssessment from '@/components/RiskAssessment';
import BusinessFeasibility from "@/components/BusinessFeasibility";
import BudgetPlanning from "@/components/BudgetPlanning";
import {
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import RoadmapPosition from "@/components/RoadmapPosition";
import DataReadiness from "@/components/DataReadiness";
import FinancialDashboard from './financial-dashboard/page';
import ApprovalsPage from '@/components/ApprovalsPage';
import ReadOnlyTechnicalFeasibility from '@/components/ReadOnlyTechnicalFeasibility';
import ReadOnlyBusinessFeasibility from '@/components/ReadOnlyBusinessFeasibility';
import ReadOnlyEthicalImpact from '@/components/ReadOnlyEthicalImpact';
import ReadOnlyRiskAssessment from '@/components/ReadOnlyRiskAssessment';
import ReadOnlyDataReadiness from '@/components/ReadOnlyDataReadiness';
import ReadOnlyRoadmapPosition from '@/components/ReadOnlyRoadmapPosition';
import ReadOnlyBudgetPlanning from '@/components/ReadOnlyBudgetPlanning';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { useStableRender } from '@/hooks/useStableRender';
import { useLock } from '@/hooks/useLock';


interface UseCase {
  title: string;
  department: string;
  owner: string;
  aiucId: number;
  stage: string; // Added stage to the interface
}

export default function AssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const useCaseId = params.useCaseId as string;
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const budgetPlanningRef = useRef<any>(null);
  const approvalsPageRef = useRef<any>(null);
  const pageTopRef = useRef<HTMLDivElement>(null);

  // Use global stable render hook
  const { isReady } = useStableRender();
  
  // Use lock hook
  const {
    lockInfo,
    isLocked,
    isExclusiveLocked,
    acquireExclusiveLock,
    releaseLock,
    refreshLockStatus,
    loading: lockLoading,
    error: lockError
  } = useLock(useCaseId);

  // Determine if current user can edit
  // User can edit if: no exclusive lock exists OR current user has the exclusive lock
  const canEdit = !lockInfo?.hasExclusiveLock || isExclusiveLocked;
  const isReadOnly = !canEdit;

  // Cleanup effect to release lock when leaving the page
  useEffect(() => {
    return () => {
      // Release lock when component unmounts (user navigates away)
      if (isExclusiveLocked) {
        releaseLock('EXCLUSIVE').catch(console.error);
      }
    };
  }, [isExclusiveLocked, releaseLock]);

  // Warn user before leaving if they have an exclusive lock
  useEffect(() => {
    if (!isExclusiveLocked) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return 'You have unsaved changes. Are you sure you want to leave?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isExclusiveLocked]);

  // Memoize assessment steps to prevent unnecessary re-renders
  const assessmentSteps = useMemo(() => [
    { id: 1, title: "Technical Feasibility" },
    { id: 2, title: "Business Feasibility" },
    { id: 3, title: "Ethical Impact" },
    { id: 4, title: "Risk Assessment" },
    { id: 5, title: "Data Readiness" },
    { id: 6, title: "Roadmap Position" },
    { id: 7, title: "Budget Planning" },
    { id: 8, title: "Financial Dashboard" },
    { id: 9, title: "Approvals" },
  ], []);

  // Memoize default assessment data to prevent unnecessary re-renders
  const defaultAssessmentData = useMemo(() => ({
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
      modelUpdateFrequency: '',
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
      revenueImpactType: [],
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
      initialDevCost: 0,
      baseApiCost: 0,
      baseInfraCost: 0,
      baseOpCost: 0,
      baseMonthlyValue: 0,
      valueGrowthRate: 0,
      budgetRange: '',
      error: '',
      loading: false,
    },
  }), []);

  const [assessmentData, setAssessmentData] = useState<any>(defaultAssessmentData);

const validateAssessmentData = useMemo(() => (data: any) => {
  if (!data) return false;
  // List all required assessment sections
  const requiredSections = [
    'technicalFeasibility',
    'businessFeasibility',
    'ethicalImpact',
    'riskAssessment',
    'dataReadiness',
    'roadmapPosition',
    'budgetPlanning'
  ];
  // Check each section is present and filled
  return requiredSections.every(section => {
    const val = data[section];
    if (!val) return false;
    if (typeof val === 'object') {
      // For objects, check if any value is empty or falsy
      return !Object.values(val).some(v => v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0));
    }
    return val !== '' && val !== null && val !== undefined;
  });
}, []);

  const handleAssessmentChange = useMemo(() => (section: string, data: any) => {
    // Don't allow changes if there's an exclusive lock
    if (isExclusiveLocked) {
      return;
    }
    
    setAssessmentData((prevData: any) => {
      return {
        ...prevData,
        [section]: data,
      };
    });
  }, [isExclusiveLocked]);

  useEffect(() => {
    if (!useCaseId || !isReady) return;
    setLoading(true);
    fetch(`/api/get-usecase-details?useCaseId=${useCaseId}`)
      .then((res) => res.json())
      .then((data) => {
        setUseCase(data);

        // Load saved assessment data if it exists
        if (data.assessData?.stepsData) {
          setAssessmentData((prev: any) => {
            const savedData = data.assessData.stepsData;
            const mergedData = { ...defaultAssessmentData, ...prev };

            // Merge saved data with defaults
            Object.keys(defaultAssessmentData).forEach(key => {
              if (savedData[key]) {
                mergedData[key] = savedData[key];
              }
            });

            return mergedData;
          });
        }

        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load use case");
        setLoading(false);
      });
  }, [useCaseId, isReady]);

  useEffect(() => {
    if (!isReady) return;
    setAssessmentData((prev: any) => {
      const next = { ...defaultAssessmentData, ...prev };
      for (const key in defaultAssessmentData) {
        if (!next[key]) next[key] = (defaultAssessmentData as any)[key];
      }
      return next;
    });
  }, []);

  // Scroll to top when currentStep changes
  useEffect(() => {
    if (currentStep > 1) { // Don't scroll on initial load
      console.log('Attempting to scroll to top for step:', currentStep);
      
      // Try to scroll the page top element into view
      if (pageTopRef.current) { 
        pageTopRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
      
      // Also try window scrolling as backup
      setTimeout(() => {
        try {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        } catch (error) {
          console.error('Scroll error:', error);
        }
      }, 100);
    }
  }, [currentStep]);

  // Add this useEffect for auto-move to next stage
  useEffect(() => {
    if (!useCaseId || !useCase || !assessmentData) return;
    // Only auto-move if currently in discovery
    if (useCase.stage === 'discovery' && validateAssessmentData(assessmentData)) {
      // Move to business-case
      fetch('/api/update-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useCaseId, newStage: 'business-case' })
      })
      .then(res => res.json())
      .then(() => {
        // Optionally, update local useCase state to reflect the new stage
        setUseCase((prev: any) => prev ? { ...prev, stage: 'business-case' } : prev);
      });
    }
  }, [useCaseId, useCase, assessmentData]);

  const isFirstStep = currentStep === 1;
  // const isLastStep = currentStep === assessmentSteps.length;

  const handleSave = useMemo(() => async () => {
    try {
      setSaving(true);
      setError(""); // Clear previous errors
      setSaveSuccess(false); // Reset success message

      await fetch("/api/post-stepdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCaseId, assessData: assessmentData }),
      });

      // Instead of redirecting, just show a success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3 seconds

    } catch (err) {
      console.error("Error saving assessment:", err);
      setError("Failed to save assessment data");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSaving(false);
    }
  }, [useCaseId, assessmentData]);

  const handleNext = useMemo(() => async () => {
    if (currentStep === 7 && budgetPlanningRef.current) {
      await budgetPlanningRef.current.saveFinops();
    }
    if (currentStep < assessmentSteps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const handlePrev = useMemo(() => () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  // Handle cancel button click
  const handleCancel = async () => {
    console.log('[ASSESSMENT] Cancel button clicked, checking lock status...');
    console.log('[ASSESSMENT] isExclusiveLocked:', isExclusiveLocked);
    console.log('[ASSESSMENT] lockInfo:', lockInfo);
    
    try {
      // Release lock if we have one
      if (isExclusiveLocked) {
        console.log('[ASSESSMENT] Releasing EXCLUSIVE lock before cancel...');
        await releaseLock('EXCLUSIVE');
        console.log('[ASSESSMENT] Lock released successfully');
      } else {
        console.log('[ASSESSMENT] No exclusive lock to release');
      }
      // Go back to previous page
      console.log('[ASSESSMENT] Navigating back...');
      router.back();
    } catch (error) {
      console.error('[ASSESSMENT] Error releasing lock during cancel:', error);
      // Go back anyway even if lock release fails
      router.back();
    }
  };

  // Handle complete assessment
  const handleCompleteAssessment = async () => {
    console.log('[ASSESSMENT] Complete Assessment button clicked, checking lock status...');
    console.log('[ASSESSMENT] isExclusiveLocked:', isExclusiveLocked);
    console.log('[ASSESSMENT] lockInfo:', lockInfo);
    
    try {
      // Save filled fields before completing
      console.log('[ASSESSMENT] Saving assessment data...');
      await fetch("/api/post-stepdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCaseId, assessData: assessmentData }),
      });
      
      if (approvalsPageRef.current && approvalsPageRef.current.handleComplete) {
        console.log('[ASSESSMENT] Calling approvals page handleComplete...');
        await approvalsPageRef.current.handleComplete();
      }
      
      // Release lock before redirecting
      if (isExclusiveLocked) {
        console.log('[ASSESSMENT] Releasing EXCLUSIVE lock before completion...');
        await releaseLock('EXCLUSIVE');
        console.log('[ASSESSMENT] Lock released successfully');
      } else {
        console.log('[ASSESSMENT] No exclusive lock to release');
      }
      
      // Use router.push instead of window.location.href for proper cleanup
      console.log('[ASSESSMENT] Navigating to dashboard...');
      router.push('/dashboard');
    } catch (error) {
      console.error('[ASSESSMENT] Error completing assessment:', error);
      // Try to release lock even if completion fails
      if (isExclusiveLocked) {
        try {
          console.log('[ASSESSMENT] Attempting to release lock after completion failure...');
          await releaseLock('EXCLUSIVE');
          console.log('[ASSESSMENT] Lock released after completion failure');
        } catch (lockError) {
          console.error('[ASSESSMENT] Error releasing lock after completion failure:', lockError);
        }
      }
      router.push('/dashboard');
    }
  };

  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground font-medium">Loading Assessment Dashboard...</p>
        </div>
      </div>
    );
  }
  if (error || !useCase) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-destructive">{error || "Use case not found"}</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-auto">

      {/* Use Case Title Section */}
      <div ref={pageTopRef} className="px-8 py-6 border-b border-border bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-mono text-muted-foreground mb-1">AIUC-{useCase.aiucId}</div>
          <div className="text-2xl font-semibold text-foreground">{useCase.title}</div>
          <div className="text-muted-foreground">{useCase.department} {useCase.owner}</div>
        </div>
        {/* Removed 'Back to Pipeline' button */}
      </div>



      {/* Assessment Steps Navigation */}
      <div className="px-8 py-4 border-b border-border bg-muted overflow-x-auto">
        <div className="flex items-center space-x-4">
          {assessmentSteps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                className={`flex items-center justify-center w-10 h-10 rounded-full focus:outline-none transition-colors duration-150 ${currentStep === step.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"} ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ cursor: isReadOnly ? 'not-allowed' : 'pointer' }}
                onClick={() => !isReadOnly && setCurrentStep(step.id)}
                disabled={isReadOnly}
                aria-current={currentStep === step.id ? 'step' : undefined}
              >
                {step.title[0]}
              </button>
              <button
                type="button"
                className={`ml-2 whitespace-nowrap text-sm font-medium bg-transparent border-none p-0 m-0 focus:outline-none transition-colors duration-150 ${currentStep === step.id ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setCurrentStep(step.id)}
                aria-current={currentStep === step.id ? 'step' : undefined}
              >
                {step.title}
              </button>
              {idx < assessmentSteps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-muted-foreground mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="flex-1 px-8 py-10 bg-card border-border">
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
            <div className="text-muted-foreground text-lg font-medium">
              You are on <strong>{assessmentSteps[currentStep - 1]?.title || 'Unknown'}</strong> step.
            </div>
          )}
        <CardContent>
          {currentStep === 1 ? (
            isReadOnly ? (
              <ReadOnlyTechnicalFeasibility data={assessmentData.technicalFeasibility} />
            ) : (
              <TechnicalFeasibility
                value={assessmentData.technicalFeasibility}
                onChange={data => handleAssessmentChange('technicalFeasibility', data)}
              />
            )
          ) : currentStep === 2 ? (
            isReadOnly ? (
              <ReadOnlyBusinessFeasibility data={assessmentData.businessFeasibility} />
            ) : (
              <BusinessFeasibility
                value={assessmentData.businessFeasibility}
                onChange={data => handleAssessmentChange('businessFeasibility', data)}
              />
            )
          ) : currentStep === 3 ? (
            isReadOnly ? (
              <ReadOnlyEthicalImpact data={assessmentData.ethicalImpact} />
            ) : (
              <EthicalImpact
                value={assessmentData.ethicalImpact}
                onChange={data => handleAssessmentChange('ethicalImpact', data)}
              />
            )
          ) : currentStep === 4 ? (
            isReadOnly ? (
              <ReadOnlyRiskAssessment data={assessmentData.riskAssessment} />
            ) : (
              <RiskAssessment
                value={assessmentData.riskAssessment}
                onChange={data => handleAssessmentChange('riskAssessment', data)}
              />
            )
          ) : currentStep === 5 ? (
            isReadOnly ? (
              <ReadOnlyDataReadiness data={assessmentData.dataReadiness} />
            ) : (
              <DataReadiness
                value={assessmentData.dataReadiness}
                onChange={data => handleAssessmentChange('dataReadiness', data)}
              />
            )
          ) : currentStep === 6 ? (
            isReadOnly ? (
              <ReadOnlyRoadmapPosition data={assessmentData.roadmapPosition} />
            ) : (
              <RoadmapPosition
                value={assessmentData.roadmapPosition}
                onChange={data => handleAssessmentChange('roadmapPosition', data)}
              />
            )
          ) : currentStep === 7 ? (
            isReadOnly ? (
              <ReadOnlyBudgetPlanning data={assessmentData.budgetPlanning} />
            ) : (
              <BudgetPlanning
                ref={budgetPlanningRef}
                value={assessmentData.budgetPlanning}
                onChange={data => handleAssessmentChange('budgetPlanning', data)}
              />
            )
          ) : currentStep === 8 ? (
            <FinancialDashboard />
          ) : currentStep === 9 ? (
            <ApprovalsPage ref={approvalsPageRef} />
          ) :
            (
              <div className="text-muted-foreground text-lg font-medium">
                You are on <strong>{assessmentSteps[currentStep - 1].title}</strong> step.
              </div>
            )}
        </CardContent>
      </Card>

      {/* Bottom Navigation Buttons */}
      <div className="px-8 py-6 border-t border-border bg-card flex justify-between items-center">
        <button
          className={`flex items-center px-4 py-2 rounded-md ${isFirstStep ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-gray-600 dark:bg-gray-500 text-white hover:bg-gray-700 dark:hover:bg-gray-600"} ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isFirstStep || isReadOnly}
          onClick={handlePrev}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </button>
        <button
          onClick={handleCancel}
          className={`flex items-center px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90`}
        >
          Cancel
        </button>
        {currentStep < 8 && (
          <>
            <button
              className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-semibold flex items-center gap-2 ${saving ? 'opacity-75 cursor-not-allowed' : ''} ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleSave}
              disabled={saving || isReadOnly}
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
              <div className="ml-4 text-green-600 dark:text-green-400 font-semibold">Progress saved!</div>
            )}
            {error && (
              <div className="ml-4 text-red-600 dark:text-red-400 font-semibold">{error}</div>
            )}
          </>
        )}
        {currentStep < 9 ? (
          <button
            className={`flex items-center px-4 py-2 rounded-md bg-gray-600 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleNext}
            disabled={isReadOnly}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        ) : (
          <button
            className="px-4 py-2 w-64 bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] text-white rounded-xl shadow-lg font-semibold text-lg transition"
            onClick={handleCompleteAssessment}
          >
            Complete Assessment
          </button>
        )}
      </div>
    </div>
  );
}