"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import GuardrailsGenerator from '@/components/guardrails/GuardrailsGenerator';
import EvaluationGenerator from '@/components/evaluations/EvaluationGenerator';
import GoldenDatasetDashboard from '@/components/golden/GoldenDatasetDashboard';
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
import { mapUIToTypeDefinition, mapTypeDefinitionToUI, ensureCompatibility } from '@/lib/assessment/field-mapper';
import { QuestionType, Stage } from '@/generated/prisma';


interface UseCase {
  title: string;
  department: string;
  owner: string;
  aiucId: number;
  stage: string; // Added stage to the interface
  organizationId?: string; // Add organizationId to determine which API to use
  problemStatement?: string; // Problem statement for approvals page
  proposedAISolution?: string; // Proposed AI solution for approvals page
}

// Add interfaces for the question data
interface QnAProps {
  id: string,
  text: string,
  type: QuestionType,
  stage: Stage,
  options: OptionProps[],
  answers: AnswerProps[], // This will now contain all answers for the question
}

interface OptionProps {
  id: string,
  text: string,
  questionId: string,
}

// Update the AnswerProps interface to match the new structure
interface AnswerProps {
  id: string;        
  value: string;     
  questionId: string;
  optionId?: string;  // Make optionId optional since TEXT and SLIDER don't have options
}

export default function AssessmentPage() {

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const useCaseId = params.useCaseId as string;
  // Get step and readonly from URL parameters
  const stepParam = searchParams.get('step');
  const readonlyParam = searchParams.get('readonly');
  
  const [currentStep, setCurrentStep] = useState(stepParam ? parseInt(stepParam) : 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const budgetPlanningRef = useRef<any>(null);
  const approvalsPageRef = useRef<any>(null);
  const pageTopRef = useRef<HTMLDivElement>(null);
  const [questions, setQuestions] = useState<QnAProps[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, AnswerProps[]>>({});
  const navigationRef = useRef<HTMLDivElement>(null);

  // Add readonly styles to the document when in readonly mode
  useEffect(() => {
    if (readonlyParam === 'true') {
      const style = document.createElement('style');
      style.id = 'readonly-styles';
      style.textContent = `
        .readonly-mode input, .readonly-mode select, .readonly-mode textarea, .readonly-mode button:not(.cancel-btn) {
          pointer-events: none !important;
          opacity: 0.6 !important;
          cursor: not-allowed !important;
        }
        .readonly-mode .editable-content {
          background-color: #f5f5f5 !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        const existingStyle = document.getElementById('readonly-styles');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [readonlyParam]);

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
  // Use the same logic as edit use case - rely on lockInfo.canEdit from API
  const canEdit = useMemo(() => lockInfo?.canEdit === true && readonlyParam !== 'true', [lockInfo?.canEdit, readonlyParam]);
  const isReadOnly = useMemo(() => !canEdit, [canEdit]);

  // Debug logging for lock status
  useEffect(() => {
    console.log('🔒 [ASSESSMENT] Lock status debug:', {
      lockInfo,
      isExclusiveLocked,
      canEdit,
      isReadOnly,
      readonlyParam
    });
  }, [lockInfo, isExclusiveLocked, canEdit, isReadOnly, readonlyParam]);

  // On unmount / unload, attempt lock release similar to edit use case
  useEffect(() => {
    console.log('🔒 [ASSESSMENT] Lock release effect - isExclusiveLocked:', isExclusiveLocked, 'useCaseId:', useCaseId);
    
    const beforeUnload = async () => {
      if (isExclusiveLocked) {
        console.log('🔒 [ASSESSMENT] Beforeunload triggered, releasing lock...');
        try {
          await fetch('/api/locks/release', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ useCaseId, lockType: 'EXCLUSIVE', scope: 'ASSESS' }),
            keepalive: true,
          });
          console.log('🔒 [ASSESSMENT] Lock release request sent via fetch');
        } catch (error) {
          console.error('🔒 [ASSESSMENT] Error releasing lock via fetch:', error);
        }
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      if (isExclusiveLocked) {
        console.log('🔒 [ASSESSMENT] Component cleanup, sending beacon for lock release...');
        const data = new FormData();
        data.append('useCaseId', useCaseId);
        data.append('lockType', 'EXCLUSIVE');
        data.append('scope', 'ASSESS');
        try { 
          navigator.sendBeacon('/api/locks/release', data);
          console.log('🔒 [ASSESSMENT] Beacon sent successfully');
        } catch (error) {
          console.error('🔒 [ASSESSMENT] Failed to send beacon for lock release:', error);
        }
      }
    };
  }, [isExclusiveLocked, useCaseId]);

  // Attempt to acquire exclusive lock when page mounts (only once)
  const [hasAttemptedLockAcquisition, setHasAttemptedLockAcquisition] = useState(false);
  
  useEffect(() => {
    if (!useCaseId || hasAttemptedLockAcquisition) return;
    console.log('🔒 [ASSESSMENT] Attempting to acquire exclusive lock on page mount...');
    setHasAttemptedLockAcquisition(true);
    acquireExclusiveLock().then(success => {
      console.log('🔒 [ASSESSMENT] Lock acquisition result:', success);
    }).catch(error => {
      console.error('🔒 [ASSESSMENT] Error acquiring lock:', error);
    });
  }, [useCaseId, hasAttemptedLockAcquisition, acquireExclusiveLock]); // Only run once per useCaseId

  // Memoized function to scroll to current step in navigation
  const scrollToCurrentStep = useMemo(() => {
    return () => {
      // Scroll page to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Scroll navigation header to show current step
      if (navigationRef.current) {
        const currentStepElement = navigationRef.current.querySelector(`[data-step="${currentStep}"]`);
        if (currentStepElement) {
          // Use scrollIntoView for the step button
          currentStepElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
          
          // Additional fallback: manually scroll the navigation container
          const navContainer = navigationRef.current;
          const stepButton = currentStepElement.querySelector('button');
          if (stepButton && navContainer) {
            const containerRect = navContainer.getBoundingClientRect();
            const buttonRect = stepButton.getBoundingClientRect();
            const scrollLeft = buttonRect.left - containerRect.left + navContainer.scrollLeft - (containerRect.width / 2) + (buttonRect.width / 2);
            navContainer.scrollTo({
              left: scrollLeft,
              behavior: 'smooth'
            });
          }
        }
      }
    };
  }, [currentStep]);

  // Update current step when URL parameters change
  useEffect(() => {
    if (stepParam) {
      const step = parseInt(stepParam);
      if (step >= 1 && step <= 12) {
        setCurrentStep(step);
        // Scroll to the step after a short delay to ensure DOM is ready
        setTimeout(() => {
          scrollToCurrentStep();
        }, 200);
      }
    }
  }, [stepParam, scrollToCurrentStep]);

  // Auto-scroll navigation header when current step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToCurrentStep();
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep, scrollToCurrentStep]);

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
    { id: 10, title: "AI Guardrails" },
    { id: 11, title: "AI Evaluations" },
    { id: 12, title: "Golden Dataset" },
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
      // Gen AI specific fields
      modelProvider: '',
      contextWindowSize: 0,
      tokenUsage: {
        estimatedDaily: 0,
        estimatedMonthly: 0,
        peakHourly: 0
      },
      ragArchitecture: {
        vectorDatabase: '',
        embeddingModel: '',
        chunkSize: 0,
        overlapSize: 0,
        retrievalTopK: 0
      },
      agentArchitecture: '',
      agentCapabilities: [],
      orchestrationPattern: '',
      memoryManagement: '',
      toolIntegrations: [],
      functionCalling: false,
      streamingEnabled: false,
      batchProcessing: false,
      cacheStrategy: '',
      fallbackModels: [],
      monitoringTools: []
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
      // Gen AI specific fields
      genAIUseCase: '',
      interactionPattern: '',
      userInteractionModes: [],
      successMetrics: [],
      minAcceptableAccuracy: 0,
      maxHallucinationRate: 0,
      minResponseRelevance: 0,
      maxLatency: 0,
      contentQualityThreshold: 0,
      userSatisfactionTarget: 0
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
      // Gen AI specific fields
      contentGeneration: {
        risks: [],
        hallucinationTolerance: '',
        attributionRequirements: [],
        promptSafety: [],
        contentFiltering: [],
        outputMonitoring: []
      },
      agentBehavior: {
        boundaries: [],
        overrideCapability: false,
        auditTrail: false,
        decisionExplanation: false
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
      // Gen AI specific fields
      modelRisks: {
        hallucinationRisk: 5,
        biasAmplification: 5,
        promptInjection: 5,
        dataLeakage: 5,
        modelInversion: 5
      },
      agentRisks: {
        unexpectedBehavior: 5,
        goalMisalignment: 5,
        excessiveAutonomy: 5,
        cascadingFailures: 5
      },
      dependencyRisks: [],
      vendorLockIn: '',
      apiStability: '',
      costOverrun: ''
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
      // Gen AI specific fields
      trainingDataTypes: [],
      instructionClarityScore: 5,
      responseQualityScore: 5,
      diversityScore: 5,
      biasScore: 5,
      trainingDataSize: '',
      finetuningRequired: false,
      syntheticDataUsage: 0,
      promptEngineering: [],
      knowledgeSources: [],
      knowledgeUpdateFrequency: '',
      contextSources: []
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
      // Gen AI specific fields
      currentAIMaturity: '',
      targetAIMaturity: '',
      evolutionPath: [],
      milestoneCriteria: [],
      successIndicators: []
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
      // Gen AI specific fields
      inputTokenPrice: 0,
      outputTokenPrice: 0,
      embeddingTokenPrice: 0,
      finetuningTokenPrice: 0,
      monthlyTokenVolume: 0,
      peakTokenVolume: 0,
      tokenOptimizationTarget: 0,
      optimizationStrategies: [],
      vectorDbCost: 0,
      gpuInferenceCost: 0,
      monitoringToolsCost: 0,
      safetyApiCost: 0,
      backupModelCost: 0
    },
  }), []);

  const [assessmentData, setAssessmentData] = useState<any>(defaultAssessmentData);

const validateAssessmentData = useMemo(() => (data: any) => {
  if (!data) return { isValid: false, missingFields: ['all'] };
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

  const missingFields: string[] = [];

  requiredSections.forEach(section => {
    const val = data[section];
    if (!val) {
      missingFields.push(section);
      return;
    }
    if (typeof val === 'object') {
      const hasAnyValue = Object.values(val).some(v => v !== '' && v !== null && v !== undefined && (!Array.isArray(v) || v.length > 0));
      if (!hasAnyValue) missingFields.push(section);
      return;
    }
    if (val === '' || val === null || val === undefined) missingFields.push(section);
  });

  return { isValid: missingFields.length === 0, missingFields };
}, []);

  const handleAssessmentChange = useMemo(() => (section: string, data: any) => {
    // Don't allow changes if user cannot edit
    if (!canEdit) {
      console.log('🔒 [ASSESSMENT] Blocking change - user cannot edit');
      return;
    }
    
    setAssessmentData((prevData: any) => {
      return {
        ...prevData,
        [section]: data,
      };
    });
  }, [canEdit]);

  // Handler for answer changes
  const handleAnswerChange = (questionId: string, answers: AnswerProps[]) => {
    setQuestionAnswers(prev => ({
      ...prev,
      [questionId]: answers
    }));
  };

  useEffect(() => {
    if (!useCaseId || !isReady) return;
    setLoading(true);
    
    // Fetch use case details and guardrails in parallel
    Promise.all([
      fetch(`/api/get-usecase-details?useCaseId=${useCaseId}`).then((res) => res.json()),
      fetch(`/api/guardrails/get?useCaseId=${useCaseId}`).then((res) => {
        if (res.ok) return res.json();
        return null;
      })
    ])
      .then(([useCaseData, guardrailsData]) => {
        setUseCase(useCaseData);

        // Load saved assessment data if it exists
        if (useCaseData.assessData?.stepsData) {
          setAssessmentData((prev: any) => {
            // Ensure backward compatibility by converting if needed
            const savedData = ensureCompatibility(useCaseData.assessData.stepsData);
            
            // Deep merge saved data with defaults, ensuring all fields are preserved
            const mergedData = { ...defaultAssessmentData };
            
            // Merge each section individually to ensure deep merging
            Object.keys(defaultAssessmentData).forEach(key => {
              if (savedData[key]) {
                (mergedData as any)[key] = {
                  ...(defaultAssessmentData as any)[key],
                  ...savedData[key]
                };
              }
            });

            console.log('🔄 [ASSESSMENT] Loading saved data:', {
              savedDataKeys: Object.keys(savedData),
              technicalData: savedData.technicalFeasibility,
              businessData: savedData.businessFeasibility,
              ethicalData: savedData.ethicalImpact,
              riskData: savedData.riskAssessment,
              dataReadinessData: savedData.dataReadiness,
              roadmapData: savedData.roadmapPosition,
              budgetData: savedData.budgetPlanning,
              mergedDataKeys: Object.keys(mergedData)
            });

            return mergedData;
          });
        }
        
        // Load guardrails config if it exists
        if (guardrailsData && guardrailsData.success && guardrailsData.guardrails) {
          setAssessmentData((prev: any) => ({
            ...prev,
            guardrailsConfig: guardrailsData.guardrails
          }));
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



  // Update the useEffect to fetch questions with answers
  // Fetch based on whether the USE CASE has an organizationId, not the user
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setQuestionsLoading(true);
        
        // Use different API based on whether the USE CASE belongs to an organization
        // This allows QZEN_ADMIN to access both org and non-org use cases appropriately
        const useCaseHasOrg = !!useCase?.organizationId;
        const apiEndpoint = useCaseHasOrg 
          ? `/api/get-assess-questions?useCaseId=${useCaseId}`
          : `/api/get-assess-question-templates?useCaseId=${useCaseId}`;
        
        console.log('[Assess] Fetching from:', apiEndpoint, { 
          useCaseHasOrg, 
          organizationId: useCase?.organizationId 
        });
        
        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const qnAData = await response.json();
        
        console.log('Fetched questions data:', qnAData); // Debug log
        
        const formattedQuestions = qnAData.map((q: QnAProps) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          stage: q.stage,
          options: q.options.map((o) => ({
            id: o.id,            
            text: o.text,
            questionId: q.id,    
          })),
          answers: q.answers || [], // Initialize with empty array if no answers
        }));
        
        setQuestions(formattedQuestions);
        
        // Initialize questionAnswers with fetched answers
        const initialAnswers: Record<string, AnswerProps[]> = {};
        formattedQuestions.forEach((q: QnAProps) => {
          if (q.answers && q.answers.length > 0) {
            initialAnswers[q.id] = q.answers;
            // console.log(`Initialized answers for question ${q.id}:`, q.answers); // Debug log
          }
        });
        setQuestionAnswers(initialAnswers);
        
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setQuestionsLoading(false);
      }
    };

    // Only fetch questions once we have loaded the use case
    if (useCaseId && useCase) {
      fetchQuestions();
    }
  }, [useCaseId, useCase]);

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

      // Validate assessment data before saving
      const validationResult = validateAssessmentData(assessmentData);
      if (!validationResult.isValid) {
        setError(`Please complete required fields: ${validationResult.missingFields.join(', ')}`);
        setTimeout(() => setError(""), 5000);
        return;
      }

      // Transform UI data to type definition format before saving
      const transformedData = mapUIToTypeDefinition(assessmentData);
      
      const response = await fetch("/api/post-stepdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCaseId, assessData: transformedData }),
      });

      // Save question answers using appropriate API endpoint
      // Use the same logic as fetching - based on whether the USE CASE has an organizationId
      if (Object.keys(questionAnswers).length > 0) {
        const useCaseHasOrg = !!useCase?.organizationId;
        const saveEndpoint = useCaseHasOrg 
        ? "/api/save-question-answers"
        : "/api/save-template-answers";
      
      console.log('[Assess] Saving answers to:', saveEndpoint, { 
        useCaseHasOrg, 
        organizationId: useCase?.organizationId 
      });
      
      await fetch(saveEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            useCaseId, 
            answers: questionAnswers 
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save assessment data');
      }

      const result = await response.json();
      console.log('Assessment data saved successfully:', result);
      
      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3 seconds

    } catch (err) {
      console.error("Error saving assessment:", err);
      setError(err instanceof Error ? err.message : "Failed to save assessment data");
      setTimeout(() => setError(""), 5000);
    } finally {
      setSaving(false);
    }
  }, [useCaseId, assessmentData, questionAnswers]);

  const handleNext = useMemo(() => async () => {
    if (currentStep === 7 && budgetPlanningRef.current) {
      await budgetPlanningRef.current.saveFinops();
    }
    if (currentStep < assessmentSteps.length) {
      setCurrentStep((prev) => prev + 1);
      // Scroll to current step after state update
      setTimeout(() => {
        scrollToCurrentStep();
      }, 100);
    }
  }, [currentStep, assessmentSteps.length, scrollToCurrentStep]);

  const handlePrev = useMemo(() => () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
      // Scroll to current step after state update
      setTimeout(() => {
        scrollToCurrentStep();
      }, 100);
    }
  }, [isFirstStep, scrollToCurrentStep]);

  // Handle cancel button click
  const handleCancel = async () => {
    console.log('🔒 [ASSESSMENT] Cancel button clicked - releasing lock and navigating back');
    try {
      if (isExclusiveLocked) {
        console.log('🔒 [ASSESSMENT] Releasing EXCLUSIVE lock...');
        await releaseLock('EXCLUSIVE');
        console.log('🔒 [ASSESSMENT] Lock released successfully');
      } else {
        console.log('🔒 [ASSESSMENT] No exclusive lock to release');
      }
    } catch (error) {
      console.error('🔒 [ASSESSMENT] Error releasing lock:', error);
    }
    console.log('🔒 [ASSESSMENT] Navigating back...');
    router.back();
  };

  // Handle complete assessment
  const handleCompleteAssessment = async () => {
    console.log('🔒 [ASSESSMENT] Complete Assessment button clicked');
    
    try {
      // Save filled fields before completing
      console.log('🔒 [ASSESSMENT] Saving assessment data...');
      // Transform UI data to type definition format before saving
      const transformedData = mapUIToTypeDefinition(assessmentData);
      
      await fetch("/api/post-stepdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCaseId, assessData: transformedData }),
      });
      
      if (approvalsPageRef.current && approvalsPageRef.current.handleComplete) {
        console.log('🔒 [ASSESSMENT] Calling approvals page handleComplete...');
        await approvalsPageRef.current.handleComplete();
      }
      
      // Release lock before redirecting
      try {
        if (isExclusiveLocked) {
          await releaseLock('EXCLUSIVE');
        }
      } catch (error) {
        console.error('🔒 [ASSESSMENT] Error releasing lock after completion:', error);
      }
      
      // Use router.push instead of window.location.href for proper cleanup
      console.log('🔒 [ASSESSMENT] Navigating to dashboard...');
      router.push('/dashboard');
    } catch (error) {
      console.error('🔒 [ASSESSMENT] Error completing assessment:', error);
      // Try to release lock even if completion fails
      if (isExclusiveLocked) {
        try {
          await releaseLock('EXCLUSIVE');
        } catch (lockError) {
          console.error('🔒 [ASSESSMENT] Error releasing lock after completion failure:', lockError);
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
      <div ref={navigationRef} className="px-8 py-4 border-b border-border bg-muted overflow-x-auto scroll-smooth">
        <div className="flex items-center space-x-4">
          {assessmentSteps.map((step, idx) => (
            <div key={step.id} className="flex items-center" data-step={step.id}>
              <button
                type="button"
                className={`flex items-center justify-center px-4 py-2 rounded-full focus:outline-none transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${
                  currentStep === step.id 
                    ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-2 ring-primary/20 ring-offset-2 ring-offset-background" 
                    : "bg-muted text-muted-foreground hover:bg-accent hover:scale-105"
                } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ cursor: isReadOnly ? 'not-allowed' : 'pointer' }}
                onClick={() => !isReadOnly && setCurrentStep(step.id)}
                disabled={isReadOnly}
                aria-current={currentStep === step.id ? 'step' : undefined}
              >
                {step.title}
              </button>
              {idx < assessmentSteps.length - 1 && (
                <ChevronRight 
                  className={`w-5 h-5 mx-2 transition-colors duration-300 ${
                    currentStep === step.id 
                      ? "text-primary" 
                      : "text-muted-foreground"
                  }`} 
                />
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
        ) : currentStep === 10 ? (
          <CardHeader>
            <CardTitle>AI Guardrails Configuration</CardTitle>
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
                questions={questions}
                questionsLoading={questionsLoading}
                questionAnswers={questionAnswers}
                onAnswerChange={handleAnswerChange}
              />
            )
          ) : currentStep === 2 ? (
            isReadOnly ? (
              <ReadOnlyBusinessFeasibility data={assessmentData.businessFeasibility} />
            ) : (
              <BusinessFeasibility
                value={assessmentData.businessFeasibility}
                onChange={data => handleAssessmentChange('businessFeasibility', data)}
                questions={questions}
                questionsLoading={questionsLoading}
                questionAnswers={questionAnswers}
                onAnswerChange={handleAnswerChange}
              />
            )
          ) : currentStep === 3 ? (
            isReadOnly ? (
              <ReadOnlyEthicalImpact data={assessmentData.ethicalImpact} />
            ) : (
              <EthicalImpact
                value={assessmentData.businessFeasibility}
                onChange={data => handleAssessmentChange('ethicalImpact', data)}
                questions={questions}
                questionsLoading={questionsLoading}
                questionAnswers={questionAnswers}
                onAnswerChange={handleAnswerChange}
              />
            )
          ) : currentStep === 4 ? (
            isReadOnly ? (
              <ReadOnlyRiskAssessment data={assessmentData.riskAssessment} />
            ) : (
              <RiskAssessment
                value={assessmentData.riskAssessment}
                onChange={data => handleAssessmentChange('riskAssessment', data)}
                questions={questions}
                questionsLoading={questionsLoading}
                questionAnswers={questionAnswers}
                onAnswerChange={handleAnswerChange}
              />
            )
          ) : currentStep === 5 ? (
            isReadOnly ? (
              <ReadOnlyDataReadiness data={assessmentData.dataReadiness} />
            ) : (
              <DataReadiness
                value={assessmentData.dataReadiness}
                onChange={data => handleAssessmentChange('dataReadiness', data)}
                questions={questions}
                questionsLoading={questionsLoading}
                questionAnswers={questionAnswers}
                onAnswerChange={handleAnswerChange}
              />
            )
          ) : currentStep === 6 ? (
            isReadOnly ? (
              <ReadOnlyRoadmapPosition data={assessmentData.roadmapPosition} />
            ) : (
              <RoadmapPosition
                value={assessmentData.roadmapPosition}
                onChange={data => handleAssessmentChange('roadmapPosition', data)}
                questions={questions}
                questionsLoading={questionsLoading}
                questionAnswers={questionAnswers}
                onAnswerChange={handleAnswerChange}
              />
            )
          ) : currentStep === 7 ? (
            isReadOnly ? (
              <ReadOnlyBudgetPlanning data={assessmentData.budgetPlanning} />
            ) : (
              <BudgetPlanning
                // ref={budgetPlanningRef}
                value={assessmentData.budgetPlanning}
                onChange={data => handleAssessmentChange('budgetPlanning', data)}
                questions={questions}
                questionsLoading={questionsLoading}
                questionAnswers={questionAnswers}
                onAnswerChange={handleAnswerChange}
              />
            )
          ) : currentStep === 8 ? (
            <div className={isReadOnly ? 'readonly-mode' : ''}>
              <FinancialDashboard />
            </div>
          ) : currentStep === 9 ? (
            <div className={isReadOnly ? 'readonly-mode' : ''}>
              <ApprovalsPage ref={approvalsPageRef} useCase={useCase} />
            </div>
          ) : currentStep === 10 ? (
            <div className={isReadOnly ? 'readonly-mode' : ''}>
              <GuardrailsGenerator 
                useCaseId={useCaseId}
                assessmentData={assessmentData}
                useCase={useCase}  // Pass complete use case object
                onGuardrailsGenerated={(guardrailsConfig) => {
                  // Store guardrails in assessment data
                  setAssessmentData((prev: any) => ({
                    ...prev,
                    guardrailsConfig
                  }));
                }}
                onComplete={() => {
                  // Move to evaluations step
                  handleNext();
                }}
              />
            </div>
          ) : currentStep === 11 ? (
            <div className={isReadOnly ? 'readonly-mode' : ''}>
              <EvaluationGenerator 
                useCaseId={useCaseId}
                guardrailsConfig={assessmentData.guardrailsConfig}
                assessmentData={assessmentData}
              />
            </div>
          ) : currentStep === 12 ? (
            <div className={isReadOnly ? 'readonly-mode' : ''}>
              <GoldenDatasetDashboard 
                useCaseId={useCaseId}
              />
            </div>
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
        {currentStep < 12 ? (
          <button
            className={`flex items-center px-4 py-2 rounded-md bg-gray-600 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleNext}
            disabled={isReadOnly}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        ) : currentStep === 10 ? (
          <button
            className={`px-4 py-2 w-64 rounded-xl shadow-lg font-semibold text-lg transition ${isReadOnly ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] text-white hover:shadow-xl'}`}
            onClick={handleCompleteAssessment}
            disabled={isReadOnly}
          >
            Complete Assessment
          </button>
        ) : (
          <div />
        )}
      </div>
      

    </div>
  );
}