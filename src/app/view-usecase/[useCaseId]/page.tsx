'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Target, TrendingUp, Zap, AlertTriangle, ChevronRight, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReadOnlyAssessmentDisplay from '@/components/ReadOnlyAssessmentDisplay';
import ReadOnlyFinancialDashboard from '@/components/ReadOnlyFinancialDashboard';
import ReadOnlyApprovalsDashboard from '@/components/ReadOnlyApprovalsDashboard';

interface UseCaseDetails {
  id: string;
  title: string;
  aiucId: number;
  problemStatement: string;
  proposedAISolution: string;
  keyBenefits: string;
  primaryStakeholders: string[];
  secondaryStakeholders: string[];
  successCriteria: string;
  problemValidation: string;
  solutionHypothesis: string;
  keyAssumptions: string;
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
  user?: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
  assessData?: {
    stepsData: {
      technicalFeasibility?: Record<string, unknown>;
      businessFeasibility?: Record<string, unknown>;
      ethicalImpact?: Record<string, unknown>;
      riskAssessment?: Record<string, unknown>;
      dataReadiness?: Record<string, unknown>;
      roadmapPosition?: Record<string, unknown>;
      budgetPlanning?: Record<string, unknown>;
    };
  };
}

const ViewUseCasePage = () => {
  const params = useParams();
  const router = useRouter();
  const useCaseId = params.useCaseId as string;
  const [useCase, setUseCase] = useState<UseCaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  // External sections data
  const [guardrailsConfig, setGuardrailsConfig] = useState<any | null>(null);
  const [evaluationData, setEvaluationData] = useState<any | null>(null);
  const [goldenDatasets, setGoldenDatasets] = useState<any[] | null>(null);
  const [guardrailsInfo, setGuardrailsInfo] = useState<any | null>(null);
  const [autoEvalRunning, setAutoEvalRunning] = useState(false);
  const [autoEvalAttempted, setAutoEvalAttempted] = useState(false);
  const [approvalsData, setApprovalsData] = useState<any | null>(null);
  const [finopsData, setFinopsData] = useState<any | null>(null);

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

  // Load external sections: guardrails, evaluations, golden datasets
  useEffect(() => {
    if (!useCaseId) return;
    // Guardrails
    fetch(`/api/guardrails/get?useCaseId=${useCaseId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.success) {
          setGuardrailsInfo(data);
          if (data.guardrails) setGuardrailsConfig(data.guardrails);
        }
      })
      .catch(() => {});
    // Evaluations (latest)
    fetch(`/api/evaluations/get?useCaseId=${useCaseId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.success && (data.evaluationConfig || (Array.isArray(data.results) && data.results.length > 0))) {
          setEvaluationData(data);
        }
      })
      .catch(() => {});
    // Golden datasets (list)
    fetch(`/api/golden/datasets?useCaseId=${useCaseId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data)) setGoldenDatasets(data);
      })
      .catch(() => {});
    // Approvals data
    fetch(`/api/read-approvals?useCaseId=${useCaseId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setApprovalsData(data);
      })
      .catch(() => {});
    // Financial data
    fetch(`/api/get-finops?id=${useCaseId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        console.log('🔍 [DEBUG] Finops API Response:', data);
        if (Array.isArray(data) && data.length > 0) {
          console.log('🔍 [DEBUG] Setting finopsData to:', data[0]);
          setFinopsData(data[0]);
        } else {
          console.log('🔍 [DEBUG] No finops data found or empty array');
        }
      })
      .catch((error) => {
        console.error('🔍 [DEBUG] Error fetching finops data:', error);
      });
  }, [useCaseId]);

  // Note: Auto-evaluation runs have been disabled in view mode
  // Evaluations should only be run explicitly by users, not automatically
  // This prevents unwanted evaluation runs when viewing use cases

  const getOverallScore = () => {
    if (!useCase) return 0;
    return ((useCase.operationalImpactScore + useCase.productivityImpactScore + useCase.revenueImpactScore) / 3).toFixed(1);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Helper function to filter out empty/false/0 values from technical feasibility data
  const filterTechnicalFeasibilityData = (data: Record<string, unknown> | undefined) => {
    if (!data) return {};
    
    const filtered: Record<string, unknown> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      // Skip if value is falsy, empty array, or 0
      if (value === false || value === null || value === undefined || 
          value === '' || value === 0 || 
          (Array.isArray(value) && value.length === 0)) {
        return;
      }
      
      // Handle nested objects - recursively filter them
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const nestedFiltered = filterTechnicalFeasibilityData(value as Record<string, unknown>);
        // Only include the nested object if it has meaningful content
        if (Object.keys(nestedFiltered).length > 0) {
          const readableKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
          filtered[readableKey] = nestedFiltered;
        }
        return;
      }
      
      // Convert key to readable format
      const readableKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
      
      filtered[readableKey] = value;
    });
    
    return filtered;
  };

  // Helper function to format field values for display
  const formatFieldValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      // Check if array contains objects
      if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
        // Handle array of objects - format each object as key-value pairs
        return value.map((item, index) => {
          if (typeof item === 'object' && item !== null) {
            const obj = item as Record<string, unknown>;
            const formattedPairs = Object.entries(obj)
              .filter(([_, val]) => val !== null && val !== undefined && val !== '' && val !== 0)
              .map(([key, val]) => {
                const readableKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
                return `${readableKey}: ${val}`;
              });
            return formattedPairs.join(', ');
          }
          return String(item);
        }).join('; ');
      }
      // Handle simple arrays
      return value.join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'object' && value !== null) {
      // Handle nested objects by formatting them as key-value pairs
      const obj = value as Record<string, unknown>;
      const formattedPairs = Object.entries(obj)
        .filter(([_, val]) => val !== null && val !== undefined && val !== '' && val !== 0)
        .map(([key, val]) => {
          const readableKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
          if (Array.isArray(val)) {
            return `${readableKey}: ${formatFieldValue(val)}`;
          }
          if (typeof val === 'object' && val !== null) {
            return `${readableKey}: ${formatFieldValue(val)}`;
          }
          return `${readableKey}: ${val}`;
        });
      return formattedPairs.join('; ');
    }
    if (typeof value === 'string') {
      return value;
    }
    return String(value);
  };

  // Toggle dropdown section - collapse one section when another is opened
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const isCurrentlyOpen = prev[sectionId];
      
      if (isCurrentlyOpen) {
        // If clicking on an open section, close it
        return {
          ...prev,
          [sectionId]: false
        };
      } else {
        // If clicking on a closed section, close all others and open this one
        // Scroll to the section after state update
        setTimeout(() => {
          const element = document.getElementById(`section-${sectionId}`);
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 100); // Small delay to ensure DOM is updated
        
        return {
          [sectionId]: true
        };
      }
    });
  };

  // Helper function to get assessment data from multiple possible locations
  const getAssessmentData = (sectionName: string): Record<string, unknown> | undefined => {
    if (!useCase?.assessData) return undefined;
    
    // Try the expected location first: assessData.stepsData.sectionName
    if (useCase.assessData.stepsData && typeof useCase.assessData.stepsData === 'object') {
      const stepsData = useCase.assessData.stepsData as Record<string, unknown>;
      if (stepsData[sectionName]) {
        return stepsData[sectionName] as Record<string, unknown>;
      }
    }
    
    // Fallback: check if data is directly in assessData
    if (useCase.assessData && typeof useCase.assessData === 'object') {
      const assessData = useCase.assessData as Record<string, unknown>;
      if (assessData[sectionName]) {
        return assessData[sectionName] as Record<string, unknown>;
      }
    }
    
    return undefined;
  };

  const renderSection = (title: string, icon: React.ReactNode, children: React.ReactNode) => (
    <Card className="p-6 mb-6 bg-card border-border">
      <div className="flex items-center mb-4">
        {icon}
        <h2 className="text-xl font-semibold text-foreground ml-2">{title}</h2>
      </div>
      {children}
    </Card>
  );

  const _renderField = (label: string, value: string | number | string[] | undefined, type: 'text' | 'array' | 'score' = 'text') => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      {type === 'array' && Array.isArray(value) ? (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span key={index} className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-sm">
              {item}
            </span>
          ))}
        </div>
      ) : type === 'score' ? (
        <div className="flex items-center">
          <span className="text-2xl font-bold text-primary">{value}</span>
          <span className="text-muted-foreground ml-2">/ 10</span>
        </div>
      ) : (
        <p className="text-foreground bg-muted p-3 rounded-lg">
          {value !== undefined && value !== null && value !== "" ? value : "Not specified"}
        </p>
      )}
    </div>
  );

  // Helper for array rendering
  const renderArray = (items: string[] | undefined, label: string) => {
    if (!items || items.length === 0) return <span className="text-muted-foreground italic">No {label.toLowerCase()} recorded.</span>;
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span key={index} className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-sm">
            {item}
          </span>
        ))}
      </div>
    );
  };

  // Helper for risk rendering
  const _renderRiskList = (risks: Record<string, unknown>[] | string | undefined, label: string) => {
    if (Array.isArray(risks)) {
      if (risks.length === 0) return <p className="text-muted-foreground italic">No {label.toLowerCase()} recorded.</p>;
      return (
        <div className="space-y-2">
          {risks.map((riskObj, idx) => (
            <div key={idx} className="bg-destructive/10 dark:bg-destructive/20 p-3 rounded-md">
              {typeof riskObj.risk === 'string' || typeof riskObj.risk === 'number' ? (
                <div><strong>Risk:</strong> {riskObj.risk}</div>
              ) : null}
              {typeof riskObj.impact === 'string' || typeof riskObj.impact === 'number' ? (
                <div><strong>Impact:</strong> {riskObj.impact}</div>
              ) : null}
              {typeof riskObj.probability === 'string' || typeof riskObj.probability === 'number' ? (
                <div><strong>Probability:</strong> {riskObj.probability}</div>
              ) : null}
            </div>
          ))}
        </div>
      );
    } else if (typeof risks === 'string') {
      return <p className="text-foreground bg-muted p-3 rounded-lg">{risks}</p>;
    } else {
      return <p className="text-muted-foreground italic">No {label.toLowerCase()} recorded.</p>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground">Loading use case details...</p>
        </div>
      </div>
    );
  }

  if (error || !useCase) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">{error || 'Use case not found'}</p>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto bg-card rounded-xl shadow-lg overflow-hidden border border-border">
        {/* Header */}
        <div className="px-8 py-5 bg-card border-b border-border flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5 flex-1">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mr-2 p-2 hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="bg-muted px-3 py-1.5 rounded-md font-semibold text-muted-foreground text-sm">
              AIUC-{useCase.aiucId}
            </span>
            <h1 className="text-lg font-semibold text-foreground">
              {useCase.title}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3.5 py-1.5 rounded-full text-sm font-medium border ${
              useCase.priority === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' :
              useCase.priority === 'medium' ? 'bg-success/10 text-success border-success/20' :
              'bg-warning/10 text-warning border-warning/20'
            }`}>
              {useCase.priority?.toUpperCase() || 'MEDIUM'} Priority
            </span>
            <span className="px-3.5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium">
              {useCase.stage || 'proof-of-value'}
            </span>
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="flex items-center gap-2.5 px-8 py-2 bg-muted/50 border-b border-border text-sm text-muted-foreground">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-medium">Created:</span>
              <span>{formatDate(useCase.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Updated:</span>
              <span>{formatDate(useCase.updatedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">By:</span>
              <span>
                {useCase.user ? 
                  (() => {
                    const fullName = `${useCase.user.firstName || ''} ${useCase.user.lastName || ''}`.trim();
                    return fullName || useCase.user.email || 'Not specified';
                  })() 
                  : 'Not specified'
                }
              </span>
            </div>
          </div>
          <div className="flex items-center ml-auto gap-4">
            <span className="text-sm font-medium text-muted-foreground">Use Case Profile</span>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-xs border-2 border-background shadow-sm">
                  {useCase.operationalImpactScore || 'B'}
                </div>
                <div className="text-xs text-muted-foreground font-medium">Operational</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-semibold text-xs border-2 border-background shadow-sm">
                  {useCase.productivityImpactScore || 'B'}
                </div>
                <div className="text-xs text-muted-foreground font-medium">Productivity</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-xs border-2 border-background shadow-sm">
                  {useCase.revenueImpactScore || 'B'}
                </div>
                <div className="text-xs text-muted-foreground font-medium">Business</div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Table */}
        <div className="mx-5 my-5 bg-muted rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-muted/70 px-5 py-3 text-left font-medium text-sm text-foreground border-r border-border">
                  Business Function
                </th>
                <th className="bg-muted/70 px-5 py-3 text-left font-medium text-sm text-foreground border-r border-border">
                  Primary Stakeholders
                </th>
                <th className="bg-muted/70 px-5 py-3 text-left font-medium text-sm text-foreground border-r border-border">
                  Secondary Stakeholders
                </th>
                <th className="bg-muted/70 px-5 py-3 text-left font-medium text-sm text-foreground border-r border-border">
                  Planned Start Date
                </th>
                <th className="bg-muted/70 px-5 py-3 text-left font-medium text-sm text-foreground border-r border-border">
                  Estimated Timelines
                </th>
                <th className="bg-muted/70 px-5 py-3 text-left font-medium text-sm text-foreground">
                  Risk
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-5 py-3 text-sm text-foreground bg-card border-r border-border">
                  {useCase.businessFunction || 'Legal'}
                </td>
                <td className="px-5 py-3 text-sm text-foreground bg-card border-r border-border">
                  {useCase.primaryStakeholders?.join(', ') || 'General Counsel, Legal Operations Manager'}
                </td>
                <td className="px-5 py-3 text-sm text-foreground bg-card border-r border-border">
                  {useCase.secondaryStakeholders?.join(', ') || 'Procurement, Finance, Compliance'}
                </td>
                <td className="px-5 py-3 text-sm text-foreground bg-card border-r border-border">
                  Q2 2024
                </td>
                <td className="px-5 py-3 text-sm text-foreground bg-card border-r border-border">
                  {useCase.estimatedTimeline || '3-4 months'}
                </td>
                <td className="px-5 py-3 text-sm text-foreground bg-card">
                  {useCase.priority === 'high' ? 'High' : useCase.priority === 'medium' ? 'Medium' : 'Low'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Main Content */}
        <div className={`flex flex-col gap-5 px-5 pb-5 ${
          expandedSections.financial || expandedSections.approvals
            ? 'lg:flex-col'
            : 'lg:flex-row'
        }`}>
          {/* Left Panel */}
          <div className={`flex flex-col gap-5 ${
            expandedSections.financial || expandedSections.approvals
              ? 'w-full'
              : 'w-full lg:w-1/2'
          }`}>
                         {/* Problem Statement */}
             <div className="bg-muted/30 rounded-lg p-5 border border-border">
               <h2 className="text-[15px] font-semibold mb-3 text-foreground">Problem Statement:</h2>
               <div 
                 className="text-sm leading-relaxed text-foreground"
                 dangerouslySetInnerHTML={{ __html: useCase.problemStatement || 'Legal teams are overwhelmed with reviewing large volumes of contracts—NDAs, MSAs, SLAs, procurement documents—each containing clauses that may pose risks, require negotiation, or violate internal policy.' }}
               />
             </div>

             {/* Proposed Solution */}
             <div className="bg-muted/30 rounded-lg p-5 border border-border">
               <h2 className="text-[15px] font-semibold mb-3 text-foreground">Proposed Solution:</h2>
               <div 
                 className="text-sm leading-relaxed text-foreground"
                 dangerouslySetInnerHTML={{ __html: useCase.proposedAISolution || 'Legal teams are overwhelmed with reviewing large volumes of contracts—NDAs, MSAs, SLAs, procurement documents—each containing clauses that may pose risks, require negotiation, or violate internal policy.' }}
               />
             </div>

             {/* Key Benefits */}
             <div className="bg-muted/30 rounded-lg p-5 border border-border">
               <h2 className="text-[15px] font-semibold mb-3 text-foreground">Key Benefits</h2>
               <div 
                 className="text-sm leading-relaxed text-foreground"
                 dangerouslySetInnerHTML={{ __html: useCase.keyBenefits || 'Legal teams are overwhelmed with reviewing large volumes of contracts—NDAs, MSAs, SLAs, procurement documents—each containing clauses that may pose risks, require negotiation, or violate internal policy.' }}
               />
             </div>

             {/* Success Criteria */}
             <div className="bg-muted/30 rounded-lg p-5 border border-border">
               <h2 className="text-[15px] font-semibold mb-3 text-foreground">Success Criteria</h2>
               <div 
                 className="text-sm leading-relaxed text-foreground"
                 dangerouslySetInnerHTML={{ __html: useCase.successCriteria || 'Legal teams are overwhelmed with reviewing large volumes of contracts—NDAs, MSAs, SLAs, procurement documents—each containing clauses that may pose risks, require negotiation, or violate internal policy.' }}
               />
             </div>

             {/* Key Assumption */}
             <div className="bg-muted/30 rounded-lg p-5 border border-border">
               <h2 className="text-[15px] font-semibold mb-3 text-foreground">Key Assumption</h2>
               <div 
                 className="text-sm leading-relaxed text-foreground"
                 dangerouslySetInnerHTML={{ __html: useCase.keyAssumptions || 'Legal teams are overwhelmed with reviewing large volumes of contracts—NDAs, MSAs, SLAs, procurement documents—each containing clauses that may pose risks, require negotiation, or violate internal policy.' }}
               />
             </div>
          </div>

          {/* Right Panel */}
          <div className={`${
            expandedSections.financial || expandedSections.approvals
              ? 'w-full'
              : 'w-full lg:w-1/2'
          }`}>
            <div className="bg-muted rounded-lg overflow-hidden">
              <div className="space-y-0">
                 {/* Technical Feasibility Dropdown */}
                 <div className="border-b border-border">
                   <div 
                     id="section-technicalFeasibility"
                     className="px-5 py-4 bg-card text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                     onClick={() => toggleSection('technicalFeasibility')}
                   >
                     <span>Technical Feasibility</span>
                     {expandedSections.technicalFeasibility ? (
                       <ChevronDown className="h-4 w-4 text-muted-foreground" />
                     ) : (
                       <ChevronRight className="h-4 w-4 text-muted-foreground" />
                     )}
                   </div>
                   {expandedSections.technicalFeasibility && (
                     <div className="px-5 py-4 bg-muted/30 border-t border-border">
                       {(() => {
                         // Debug logging to understand data structure
                         console.log('🔍 [DEBUG] Technical Feasibility Data Structure:', {
                           useCase: !!useCase,
                           assessData: !!useCase?.assessData,
                           stepsData: !!useCase?.assessData?.stepsData,
                           technicalFeasibility: !!useCase?.assessData?.stepsData?.technicalFeasibility,
                           rawTechnicalData: useCase?.assessData?.stepsData?.technicalFeasibility,
                           assessDataStructure: useCase?.assessData,
                           fullUseCase: useCase
                         });
                         
                         // Use the helper function to get technical feasibility data
                         const technicalFeasibilityData = getAssessmentData('technicalFeasibility');
                         console.log('🔍 [DEBUG] Retrieved technical feasibility data:', technicalFeasibilityData);
                         
                         // Additional debug: show the raw data structure
                         if (useCase?.assessData) {
                           console.log('🔍 [DEBUG] Raw assessData structure:', JSON.stringify(useCase.assessData, null, 2));
                         }
                         
                         const technicalData = filterTechnicalFeasibilityData(technicalFeasibilityData);
                         const entries = Object.entries(technicalData);
                         
                         console.log('🔍 [DEBUG] Filtered Technical Data:', {
                           technicalData,
                           entries,
                           entriesLength: entries.length
                         });
                         
                         if (entries.length === 0) {
                           return (
                             <p className="text-sm text-muted-foreground italic">
                               No technical feasibility data available.
                             </p>
                           );
                         }
                         
                         return (
                           <div className="space-y-3">
                             {entries.map(([key, value]) => (
                               <div key={key} className="flex flex-col gap-1">
                                 <span className="text-sm font-medium text-foreground">{key}:</span>
                                 <div className="text-sm text-muted-foreground bg-card p-2 rounded border">
                                   {typeof value === 'object' && value !== null && !Array.isArray(value) ? (
                                     // Render nested objects as structured content
                                     <div className="space-y-1">
                                       {Object.entries(value as Record<string, unknown>).map(([nestedKey, nestedValue]) => (
                                         <div key={nestedKey} className="flex justify-between">
                                           <span className="font-medium">{nestedKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}:</span>
                                           <span>{formatFieldValue(nestedValue)}</span>
                                         </div>
                                       ))}
                                     </div>
                                   ) : (
                                     formatFieldValue(value)
                                   )}
                                 </div>
                               </div>
                             ))}
                           </div>
                         );
                       })()}
                     </div>
                   )}
                 </div>
                 {/* Business Feasibility Dropdown */}
                 <div className="border-b border-border">
                   <div 
                     id="section-businessFeasibility"
                     className="px-5 py-4 bg-card text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                     onClick={() => toggleSection('businessFeasibility')}
                   >
                     <span>Business Feasibility</span>
                     {expandedSections.businessFeasibility ? (
                       <ChevronDown className="h-4 w-4 text-muted-foreground" />
                     ) : (
                       <ChevronRight className="h-4 w-4 text-muted-foreground" />
                     )}
                   </div>
                   {expandedSections.businessFeasibility && (
                     <div className="px-5 py-4 bg-muted/30 border-t border-border">
                       {(() => {
                         const businessFeasibilityData = getAssessmentData('businessFeasibility');
                         console.log('🔍 [DEBUG] Business Feasibility Data:', businessFeasibilityData);
                         const businessData = filterTechnicalFeasibilityData(businessFeasibilityData);
                         const entries = Object.entries(businessData);
                         console.log('🔍 [DEBUG] Filtered Business Data:', { businessData, entries });
                         
                         if (entries.length === 0) {
                           return (
                             <p className="text-sm text-muted-foreground italic">
                               No business feasibility data available.
                             </p>
                           );
                         }
                         
                         return (
                           <div className="space-y-3">
                             {entries.map(([key, value]) => (
                               <div key={key} className="flex flex-col gap-1">
                                 <span className="text-sm font-medium text-foreground">{key}:</span>
                                 <div className="text-sm text-muted-foreground bg-card p-2 rounded border">
                                   {typeof value === 'object' && value !== null && !Array.isArray(value) ? (
                                     // Render nested objects as structured content
                                     <div className="space-y-1">
                                       {Object.entries(value as Record<string, unknown>).map(([nestedKey, nestedValue]) => (
                                         <div key={nestedKey} className="flex justify-between">
                                           <span className="font-medium">{nestedKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}:</span>
                                           <span>{formatFieldValue(nestedValue)}</span>
                                         </div>
                                       ))}
                                     </div>
                                   ) : (
                                     formatFieldValue(value)
                                   )}
                                 </div>
                               </div>
                             ))}
                           </div>
                         );
                       })()}
                     </div>
                   )}
                 </div>
                 {/* Ethical Impact Dropdown */}
                 <div className="border-b border-border">
                   <div 
                     id="section-ethicalImpact"
                     className="px-5 py-4 bg-card text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                     onClick={() => toggleSection('ethicalImpact')}
                   >
                     <span>Ethical Impact</span>
                     {expandedSections.ethicalImpact ? (
                       <ChevronDown className="h-4 w-4 text-muted-foreground" />
                     ) : (
                       <ChevronRight className="h-4 w-4 text-muted-foreground" />
                     )}
                   </div>
                   {expandedSections.ethicalImpact && (
                     <div className="px-5 py-4 bg-muted/30 border-t border-border">
                       {(() => {
                         const ethicalImpactData = getAssessmentData('ethicalImpact');
                         const ethicalData = filterTechnicalFeasibilityData(ethicalImpactData);
                         const entries = Object.entries(ethicalData);
                         
                         if (entries.length === 0) {
                           return (
                             <p className="text-sm text-muted-foreground italic">
                               No ethical impact data available.
                             </p>
                           );
                         }
                         
                         return (
                           <div className="space-y-3">
                             {entries.map(([key, value]) => (
                               <div key={key} className="flex flex-col gap-1">
                                 <span className="text-sm font-medium text-foreground">{key}:</span>
                                 <div className="text-sm text-muted-foreground bg-card p-2 rounded border">
                                   {typeof value === 'object' && value !== null && !Array.isArray(value) ? (
                                     // Render nested objects as structured content
                                     <div className="space-y-1">
                                       {Object.entries(value as Record<string, unknown>).map(([nestedKey, nestedValue]) => (
                                         <div key={nestedKey} className="flex justify-between">
                                           <span className="font-medium">{nestedKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}:</span>
                                           <span>{formatFieldValue(nestedValue)}</span>
                                         </div>
                                       ))}
                                     </div>
                                   ) : (
                                     formatFieldValue(value)
                                   )}
                                 </div>
                               </div>
                             ))}
                           </div>
                         );
                       })()}
                     </div>
                   )}
                 </div>
                 {/* Risk Assessment Dropdown */}
                 <div className="border-b border-border">
                   <div 
                     id="section-riskAssessment"
                     className="px-5 py-4 bg-card text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                     onClick={() => toggleSection('riskAssessment')}
                   >
                     <span>Risk Assessment</span>
                     {expandedSections.riskAssessment ? (
                       <ChevronDown className="h-4 w-4 text-muted-foreground" />
                     ) : (
                       <ChevronRight className="h-4 w-4 text-muted-foreground" />
                     )}
                   </div>
                   {expandedSections.riskAssessment && (
                     <div className="px-5 py-4 bg-muted/30 border-t border-border">
                       {(() => {
                         const riskAssessmentData = getAssessmentData('riskAssessment');
                         console.log('🔍 [DEBUG] Risk Assessment Data:', riskAssessmentData);
                         
                         // Special filtering for risk assessment data
                         const filterRiskAssessmentData = (data: Record<string, unknown> | undefined) => {
                           if (!data) return {};
                           
                           const filtered: Record<string, unknown> = {};
                           
                           Object.entries(data).forEach(([key, value]) => {
                             // Handle array of risk objects
                             if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
                               const filteredRisks = value.filter((riskItem: any) => {
                                 // Only include risks that have meaningful impact and probability (not "None")
                                 const impact = riskItem.impact || riskItem.Impact;
                                 const probability = riskItem.probability || riskItem.Probability;
                                 return impact && impact !== 'None' && impact !== 'none' && 
                                        probability && probability !== 'None' && probability !== 'none';
                               });
                               
                               if (filteredRisks.length > 0) {
                                 const readableKey = key
                                   .replace(/([A-Z])/g, ' $1')
                                   .replace(/^./, str => str.toUpperCase())
                                   .trim();
                                 filtered[readableKey] = filteredRisks;
                               }
                               return;
                             }
                             
                             // Handle other data types with standard filtering
                             if (value === false || value === null || value === undefined || 
                                 value === '' || value === 0 || 
                                 (Array.isArray(value) && value.length === 0)) {
                               return;
                             }
                             
                             if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                               const nestedFiltered = filterRiskAssessmentData(value as Record<string, unknown>);
                               if (Object.keys(nestedFiltered).length > 0) {
                                 const readableKey = key
                                   .replace(/([A-Z])/g, ' $1')
                                   .replace(/^./, str => str.toUpperCase())
                                   .trim();
                                 filtered[readableKey] = nestedFiltered;
                               }
                               return;
                             }
                             
                             const readableKey = key
                               .replace(/([A-Z])/g, ' $1')
                               .replace(/^./, str => str.toUpperCase())
                               .trim();
                             
                             filtered[readableKey] = value;
                           });
                           
                           return filtered;
                         };
                         
                         const riskData = filterRiskAssessmentData(riskAssessmentData);
                         const entries = Object.entries(riskData);
                         console.log('🔍 [DEBUG] Filtered Risk Data:', { riskData, entries });
                         
                         if (entries.length === 0) {
                           return (
                             <p className="text-sm text-muted-foreground italic">
                               No risk assessment data available.
                             </p>
                           );
                         }
                         
                         return (
                           <div className="space-y-3">
                             {entries.map(([key, value]) => (
                               <div key={key} className="flex flex-col gap-1">
                                 <span className="text-sm font-medium text-foreground">{key}:</span>
                                 <div className="text-sm text-muted-foreground bg-card p-2 rounded border">
                                   {Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null ? (
                                     // Render array of risk objects as structured list
                                     <div className="space-y-2">
                                       {value.map((item, index) => (
                                         <div key={index} className="border-l-2 border-primary/30 pl-3 py-1">
                                           {typeof item === 'object' && item !== null ? (
                                             <div className="space-y-1">
                                               {Object.entries(item as Record<string, unknown>).map(([itemKey, itemValue]) => (
                                                 <div key={itemKey} className="flex items-start gap-2">
                                                   <span className="font-medium text-primary min-w-0 flex-shrink-0">
                                                     {itemKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}:
                                                   </span>
                                                   <span className="text-foreground">{String(itemValue)}</span>
                                                 </div>
                                               ))}
                                             </div>
                                           ) : (
                                             <span>{String(item)}</span>
                                           )}
                                         </div>
                                       ))}
                                     </div>
                                   ) : typeof value === 'object' && value !== null && !Array.isArray(value) ? (
                                     // Render nested objects as structured content
                                     <div className="space-y-1">
                                       {Object.entries(value as Record<string, unknown>).map(([nestedKey, nestedValue]) => (
                                         <div key={nestedKey} className="flex justify-between">
                                           <span className="font-medium">{nestedKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}:</span>
                                           <span>{formatFieldValue(nestedValue)}</span>
                                         </div>
                                       ))}
                                     </div>
                                   ) : (
                                     formatFieldValue(value)
                                   )}
                                 </div>
                               </div>
                             ))}
                           </div>
                         );
                       })()}
                     </div>
                   )}
                 </div>

                 {/* Data Readiness Dropdown */}
                 <div className="border-b border-border">
                   <div 
                     id="section-dataReadiness"
                     className="px-5 py-4 bg-card text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                     onClick={() => toggleSection('dataReadiness')}
                   >
                     <span>Data Readiness</span>
                     {expandedSections.dataReadiness ? (
                       <ChevronDown className="h-4 w-4 text-muted-foreground" />
                     ) : (
                       <ChevronRight className="h-4 w-4 text-muted-foreground" />
                     )}
                   </div>
                   {expandedSections.dataReadiness && (
                     <div className="px-5 py-4 bg-muted/30 border-t border-border">
                       {(() => {
                         const dataReadinessAssessmentData = getAssessmentData('dataReadiness');
                         const dataReadinessData = filterTechnicalFeasibilityData(dataReadinessAssessmentData);
                         const entries = Object.entries(dataReadinessData);
                         
                         if (entries.length === 0) {
                           return (
                             <p className="text-sm text-muted-foreground italic">
                               No data readiness information available.
                             </p>
                           );
                         }
                         
                         return (
                           <div className="space-y-3">
                             {entries.map(([key, value]) => (
                               <div key={key} className="flex flex-col gap-1">
                                 <span className="text-sm font-medium text-foreground">{key}:</span>
                                 <div className="text-sm text-muted-foreground bg-card p-2 rounded border">
                                   {typeof value === 'object' && value !== null && !Array.isArray(value) ? (
                                     // Render nested objects as structured content
                                     <div className="space-y-1">
                                       {Object.entries(value as Record<string, unknown>).map(([nestedKey, nestedValue]) => (
                                         <div key={nestedKey} className="flex justify-between">
                                           <span className="font-medium">{nestedKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}:</span>
                                           <span>{formatFieldValue(nestedValue)}</span>
                                         </div>
                                       ))}
                                     </div>
                                   ) : (
                                     formatFieldValue(value)
                                   )}
                                 </div>
                               </div>
                             ))}
                           </div>
                         );
                       })()}
                     </div>
                   )}
                 </div>

                 {/* Roadmap Position Dropdown */}
                 <div className="border-b border-border">
                   <div 
                     id="section-roadmapPosition"
                     className="px-5 py-4 bg-card text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                     onClick={() => toggleSection('roadmapPosition')}
                   >
                     <span>Roadmap Position</span>
                     {expandedSections.roadmapPosition ? (
                       <ChevronDown className="h-4 w-4 text-muted-foreground" />
                     ) : (
                       <ChevronRight className="h-4 w-4 text-muted-foreground" />
                     )}
                   </div>
                   {expandedSections.roadmapPosition && (
                     <div className="px-5 py-4 bg-muted/30 border-t border-border">
                       {(() => {
                         const roadmapPositionData = getAssessmentData('roadmapPosition');
                         const roadmapData = filterTechnicalFeasibilityData(roadmapPositionData);
                         const entries = Object.entries(roadmapData);
                         
                         if (entries.length === 0) {
                           return (
                             <p className="text-sm text-muted-foreground italic">
                               No roadmap position data available.
                             </p>
                           );
                         }
                         
                         return (
                           <div className="space-y-3">
                             {entries.map(([key, value]) => (
                               <div key={key} className="flex flex-col gap-1">
                                 <span className="text-sm font-medium text-foreground">{key}:</span>
                                 <div className="text-sm text-muted-foreground bg-card p-2 rounded border">
                                   {typeof value === 'object' && value !== null && !Array.isArray(value) ? (
                                     // Render nested objects as structured content
                                     <div className="space-y-1">
                                       {Object.entries(value as Record<string, unknown>).map(([nestedKey, nestedValue]) => (
                                         <div key={nestedKey} className="flex justify-between">
                                           <span className="font-medium">{nestedKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}:</span>
                                           <span>{formatFieldValue(nestedValue)}</span>
                                         </div>
                                       ))}
                                     </div>
                                   ) : (
                                     formatFieldValue(value)
                                   )}
                                 </div>
                               </div>
                             ))}
                           </div>
                         );
                       })()}
                     </div>
                   )}
                 </div>

                 {/* Budget Planning Dropdown */}
                 <div className="border-b border-border">
                   <div 
                     id="section-budgetPlanning"
                     className="px-5 py-4 bg-card text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                     onClick={() => toggleSection('budgetPlanning')}
                   >
                     <span>Budget Planning</span>
                     {expandedSections.budgetPlanning ? (
                       <ChevronDown className="h-4 w-4 text-muted-foreground" />
                     ) : (
                       <ChevronRight className="h-4 w-4 text-muted-foreground" />
                     )}
                   </div>
                   {expandedSections.budgetPlanning && (
                     <div className="px-5 py-4 bg-muted/30 border-t border-border">
                       {(() => {
                         const budgetPlanningData = getAssessmentData('budgetPlanning');
                         const budgetData = filterTechnicalFeasibilityData(budgetPlanningData);
                         const entries = Object.entries(budgetData);
                         
                         if (entries.length === 0) {
                           return (
                             <p className="text-sm text-muted-foreground italic">
                               No budget planning data available.
                             </p>
                           );
                         }
                         
                         return (
                           <div className="space-y-3">
                             {entries.map(([key, value]) => (
                               <div key={key} className="flex flex-col gap-1">
                                 <span className="text-sm font-medium text-foreground">{key}:</span>
                                 <div className="text-sm text-muted-foreground bg-card p-2 rounded border">
                                   {typeof value === 'object' && value !== null && !Array.isArray(value) ? (
                                     // Render nested objects as structured content
                                     <div className="space-y-1">
                                       {Object.entries(value as Record<string, unknown>).map(([nestedKey, nestedValue]) => (
                                         <div key={nestedKey} className="flex justify-between">
                                           <span className="font-medium">{nestedKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}:</span>
                                           <span>{formatFieldValue(nestedValue)}</span>
                                         </div>
                                       ))}
                                     </div>
                                   ) : (
                                     formatFieldValue(value)
                                   )}
                                 </div>
                               </div>
                             ))}
                           </div>
                         );
                       })()}
                     </div>
                   )}
                 </div>
                 {/* Financial Dashboard Button */}
                 <div className="border-b border-border">
                   <div 
                     className="px-5 py-4 bg-card text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                     onClick={() => toggleSection('financial')}
                   >
                     <span>Financial Dashboard</span>
                     <ChevronRight className="h-4 w-4 text-muted-foreground" />
                   </div>
                 </div>

                 {/* Approvals Button */}
                 <div className="border-b border-border">
                   <div 
                     className="px-5 py-4 bg-card text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                     onClick={() => toggleSection('approvals')}
                   >
                     <span>Approvals</span>
                     <ChevronRight className="h-4 w-4 text-muted-foreground" />
                   </div>
                 </div>

                 {/* AI Guardrails Dropdown */}
                 <div className="border-b border-border">
                   <div 
                     id="section-aiGuardrails"
                     className="px-5 py-4 bg-card text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                     onClick={() => toggleSection('aiGuardrails')}
                   >
                     <span>AI Guardrails</span>
                     {expandedSections.aiGuardrails ? (
                       <ChevronDown className="h-4 w-4 text-muted-foreground" />
                     ) : (
                       <ChevronRight className="h-4 w-4 text-muted-foreground" />
                     )}
                   </div>
                   {expandedSections.aiGuardrails && (
                    <div className="px-5 py-4 bg-muted/30 border-t border-border">
                      {(() => {
                        // Prefer structured API data for friendly rendering
                        if (guardrailsInfo && (guardrailsConfig || guardrailsInfo.rules)) {
                          const cfg = guardrailsConfig || guardrailsInfo.guardrails || {};
                          const meta = guardrailsInfo.metadata || {};
                          const status = guardrailsInfo.status || cfg.status || '—';
                          const confidence = (guardrailsInfo.confidence ?? cfg.confidence) ?? '—';
                          const version = cfg.version || cfg.guardrails?.version || cfg?.version;
                          const agents = cfg.agents || cfg.guardrails?.agents;
                          const generatedAt = meta.updatedAt || meta.createdAt;
                          const rulesByCategory = cfg.guardrails?.rules || cfg.rules || {};

                          // Build a normalized rules array grouped by category
                          const categories = Object.keys(rulesByCategory);

                          return (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-card border rounded p-3">
                                  <div className="text-xs text-muted-foreground">Version</div>
                                  <div className="text-sm font-medium">{version || '—'}</div>
                                </div>
                                <div className="bg-card border rounded p-3">
                                  <div className="text-xs text-muted-foreground">Generated</div>
                                  <div className="text-sm font-medium">{generatedAt ? formatFieldValue(generatedAt) : '—'}</div>
                                </div>
                                <div className="bg-card border rounded p-3">
                                  <div className="text-xs text-muted-foreground">Status</div>
                                  <div className="text-sm font-medium">{status || '—'}</div>
                                </div>
                                <div className="bg-card border rounded p-3">
                                  <div className="text-xs text-muted-foreground">Confidence</div>
                                  <div className="text-sm font-medium">{confidence ?? '—'}</div>
                                </div>
                              </div>

                              {Array.isArray(agents) && agents.length > 0 && (
                                <div className="bg-card border rounded p-3">
                                  <div className="text-xs text-muted-foreground mb-1">Agents</div>
                                  <div className="flex flex-wrap gap-2">
                                    {agents.map((a: any, idx: number) => (
                                      <span key={idx} className="px-2 py-0.5 text-xs bg-muted rounded">
                                        {String(a)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Rules grouped by category */}
                              {categories.length > 0 ? (
                                <div className="space-y-5">
                                  {categories.map(category => {
                                    const rules = Array.isArray(rulesByCategory[category]) ? rulesByCategory[category] : [];
                                    if (rules.length === 0) return null;
                                    return (
                                      <div key={category}>
                                        <div className="text-sm font-semibold mb-2 capitalize">{category}</div>
                                        <div className="space-y-2">
                                          {rules.map((rule: any, idx: number) => (
                                            <div key={rule.id || idx} className="bg-card border rounded p-3">
                                              <div className="flex items-center justify-between gap-3">
                                                <div className="font-medium text-sm truncate">{rule.rule || rule.name || 'Rule'}</div>
                                                {rule.severity && (
                                                  <span className="text-xs px-2 py-0.5 rounded bg-muted">{String(rule.severity)}</span>
                                                )}
                                              </div>
                                              {rule.description && (
                                                <div className="text-sm text-muted-foreground mt-1">{rule.description}</div>
                                              )}
                                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                {rule.type && <span className="px-2 py-0.5 bg-muted rounded">{String(rule.type)}</span>}
                                                {rule.status && <span className="px-2 py-0.5 bg-muted rounded">{String(rule.status)}</span>}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">No guardrail rules available.</p>
                              )}
                            </div>
                          );
                        }

                        // Fallback to generic renderer using assessData key if API data not present
                        const guardrailsSource = guardrailsConfig || getAssessmentData('aiGuardrails');
                        const guardrailsData = filterTechnicalFeasibilityData(guardrailsSource);
                        const entries = Object.entries(guardrailsData);
                        if (entries.length === 0) {
                          return (
                            <p className="text-sm text-muted-foreground italic">
                              No AI guardrails configured.
                            </p>
                          );
                        }
                        return (
                          <div className="space-y-3">
                            {entries.map(([key, value]) => (
                              <div key={key} className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-foreground">{key}:</span>
                                <div className="text-sm text-muted-foreground bg-card p-2 rounded border">
                                  {typeof value === 'object' && value !== null && !Array.isArray(value) ? (
                                    <div className="space-y-1">
                                      {Object.entries(value as Record<string, unknown>).map(([nestedKey, nestedValue]) => (
                                        <div key={nestedKey} className="flex justify-between">
                                          <span className="font-medium">{nestedKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}:</span>
                                          <span>{formatFieldValue(nestedValue)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    formatFieldValue(value)
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                 </div>

                 {/* AI Evaluations Dropdown */}
                 <div className="border-b border-border">
                   <div 
                     id="section-aiEvaluations"
                     className="px-5 py-4 bg-card text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                     onClick={() => toggleSection('aiEvaluations')}
                   >
                     <span>AI Evaluations</span>
                     {expandedSections.aiEvaluations ? (
                       <ChevronDown className="h-4 w-4 text-muted-foreground" />
                     ) : (
                       <ChevronRight className="h-4 w-4 text-muted-foreground" />
                     )}
                   </div>
                   {expandedSections.aiEvaluations && (
                     <div className="px-5 py-4 bg-muted/30 border-t border-border">
                       {(() => {
                         if (!evaluationData) {
                           return (
                             <div className="space-y-3">
                               <p className="text-sm text-muted-foreground italic">
                                 No AI evaluations have been run for this use case.
                               </p>
                               <p className="text-xs text-muted-foreground">
                                 Evaluations must be run explicitly from the evaluation dashboard, not automatically in view mode.
                               </p>
                             </div>
                           );
                         }

                         const summary = evaluationData.summary || {} as any;
                         const dimensionScores = summary.dimensionScores || {} as Record<string, any>;
                         const recommendations = Array.isArray(summary.recommendations) ? summary.recommendations : [];

                         return (
                           <div className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                               <div className="bg-card border rounded p-3">
                                 <div className="text-xs text-muted-foreground">Status</div>
                                 <div className="text-sm font-medium">{evaluationData.status || '—'}</div>
                               </div>
                               <div className="bg-card border rounded p-3">
                                 <div className="text-xs text-muted-foreground">Completed At</div>
                                 <div className="text-sm font-medium">{evaluationData.completedAt ? formatDate(evaluationData.completedAt as any) : '—'}</div>
                               </div>
                             </div>

                             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                               <div className="bg-card border rounded p-3">
                                 <div className="text-xs text-muted-foreground">Total Tests</div>
                                 <div className="text-lg font-semibold">{summary.totalTests ?? (evaluationData.results?.length || 0)}</div>
                               </div>
                               <div className="bg-card border rounded p-3">
                                 <div className="text-xs text-muted-foreground">Passed</div>
                                 <div className="text-lg font-semibold">{summary.passed ?? '-'}</div>
                               </div>
                               <div className="bg-card border rounded p-3">
                                 <div className="text-xs text-muted-foreground">Pass Rate</div>
                                 <div className="text-lg font-semibold">{summary.passRate != null ? Math.round(summary.passRate * 100) + '%' : '-'}</div>
                               </div>
                               <div className="bg-card border rounded p-3">
                                 <div className="text-xs text-muted-foreground">Overall Score</div>
                                 <div className="text-lg font-semibold">{summary.overallScore != null ? Math.round(summary.overallScore) : (summary.overallScore?.value ?? '—')}</div>
                               </div>
                             </div>

                             <div className="bg-card border rounded p-3">
                               <div className="text-xs text-muted-foreground mb-1">Dimension Scores</div>
                               {Object.keys(dimensionScores).length === 0 ? (
                                 <div className="text-sm text-muted-foreground">—</div>
                               ) : (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                   {Object.entries(dimensionScores).map(([name, data]) => {
                                     const ds: any = data as any;
                                     const label = String(name);
                                     const norm = Math.round(ds.normalizedScore ?? ds.value ?? 0);
                                     const weight = ds.weight != null ? ds.weight : undefined;
                                     const contrib = ds.contributionToOverall != null ? Math.round(ds.contributionToOverall) : undefined;
                                     return (
                                       <div key={label} className="flex items-center justify-between text-sm bg-muted/40 rounded px-3 py-2">
                                         <span className="font-medium">{label}</span>
                                         <span className="text-muted-foreground">
                                           {norm}
                                           {weight != null && (
                                             <>
                                               {' · '}w:{weight}
                                             </>
                                           )}
                                           {contrib != null && (
                                             <>
                                               {' · '}c:{contrib}
                                             </>
                                           )}
                                         </span>
                                       </div>
                                     );
                                   })}
                                 </div>
                               )}
                             </div>

                             <div className="bg-card border rounded p-3">
                               <div className="text-xs text-muted-foreground mb-1">Recommendations</div>
                               {recommendations.length === 0 ? (
                                 <div className="text-sm text-muted-foreground">—</div>
                               ) : (
                                 <ul className="list-disc pl-5 text-sm space-y-1">
                                   {recommendations.map((rec: any, idx: number) => (
                                     <li key={idx} className="text-foreground">
                                       {typeof rec === 'string' ? rec : (rec.description || rec.text || JSON.stringify(rec))}
                                     </li>
                                   ))}
                                 </ul>
                               )}
                             </div>

                             {summary.timestamp && (
                               <div className="text-xs text-muted-foreground">Timestamp: {formatFieldValue(summary.timestamp)}</div>
                             )}
                           </div>
                         );
                       })()}
                     </div>
                   )}
                 </div>


                 {/* Golden Dataset Dropdown */}
                 <div className="border-b border-border">
                   <div 
                     id="section-goldenDataset"
                     className="px-5 py-4 bg-card text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                     onClick={() => toggleSection('goldenDataset')}
                   >
                     <span>Golden Dataset</span>
                     {expandedSections.goldenDataset ? (
                       <ChevronDown className="h-4 w-4 text-muted-foreground" />
                     ) : (
                       <ChevronRight className="h-4 w-4 text-muted-foreground" />
                     )}
                   </div>
                   {expandedSections.goldenDataset && (
                     <div className="px-5 py-4 bg-muted/30 border-t border-border">
                       {(() => {
                         const goldenSource = Array.isArray(goldenDatasets) ? {
                           datasets: goldenDatasets.map((ds: any) => ({
                             name: ds.name,
                             version: ds.version,
                             entryCount: ds.entryCount,
                             createdAt: ds.createdAt
                           }))
                         } : getAssessmentData('goldenDataset');
                         const goldenDatasetData = filterTechnicalFeasibilityData(goldenSource);
                         const entries = Object.entries(goldenDatasetData);
                         if (entries.length === 0) {
                           return (
                             <p className="text-sm text-muted-foreground italic">
                               No golden dataset information available.
                             </p>
                           );
                         }
                         return (
                           <div className="space-y-3">
                             {entries.map(([key, value]) => (
                               <div key={key} className="flex flex-col gap-1">
                                 <span className="text-sm font-medium text-foreground">{key}:</span>
                                 <div className="text-sm text-muted-foreground bg-card p-2 rounded border">
                                   {typeof value === 'object' && value !== null && !Array.isArray(value) ? (
                                     <div className="space-y-1">
                                       {Object.entries(value as Record<string, unknown>).map(([nestedKey, nestedValue]) => (
                                         <div key={nestedKey} className="flex justify-between">
                                           <span className="font-medium">{nestedKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}:</span>
                                           <span>{formatFieldValue(nestedValue)}</span>
                                         </div>
                                       ))}
                                     </div>
                                   ) : (
                                     formatFieldValue(value)
                                   )}
                                 </div>
                               </div>
                             ))}
                           </div>
                         );
                       })()}
                     </div>
                   )}
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Financial Dashboard - Full Width Section */}
        {expandedSections.financial && (
          <div className="px-5 pb-5">
            <div className="bg-muted rounded-lg overflow-hidden">
              <div 
                id="section-financial"
                className="px-5 py-4 bg-card text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between border-b border-border"
                onClick={() => toggleSection('financial')}
              >
                <span>Financial Dashboard</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="bg-muted/30">
                <ReadOnlyFinancialDashboard 
                  data={finopsData ? {
                    initialDevCost: finopsData.devCostBase || 0,
                    baseApiCost: finopsData.apiCostBase || 0,
                    baseInfraCost: finopsData.infraCostBase || 0,
                    baseOpCost: finopsData.opCostBase || 0,
                    baseMonthlyValue: finopsData.valueBase || 0,
                    valueGrowthRate: finopsData.valueGrowthRate || 0,
                    budgetRange: finopsData.budgetRange || '',
                    inputTokenPrice: finopsData.inputTokenPrice || 0,
                    outputTokenPrice: finopsData.outputTokenPrice || 0,
                    embeddingTokenPrice: finopsData.embeddingTokenPrice || 0,
                    finetuningTokenPrice: finopsData.finetuningTokenPrice || 0,
                    monthlyTokenBudget: finopsData.monthlyTokenBudget || 0,
                    avgTokensPerUser: finopsData.avgTokensPerUser || 0,
                    peakTokenUsage: finopsData.peakTokenUsage || 0,
                    optimizationStrategies: finopsData.optimizationStrategies || [],
                    vectorDbCost: finopsData.vectorDbCost || 0,
                    gpuInferenceCost: finopsData.gpuInferenceCost || 0,
                    monitoringToolsCost: finopsData.monitoringToolsCost || 0,
                    safetyApiCost: finopsData.safetyApiCost || 0,
                    backupModelCost: finopsData.backupModelCost || 0
                  } : undefined} 
                  finopsData={finopsData}
                />
              </div>
            </div>
          </div>
        )}

        {/* Approvals Dashboard - Full Width Section */}
        {expandedSections.approvals && (
          <div className="px-5 pb-5">
            <div className="bg-muted rounded-lg overflow-hidden">
              <div 
                id="section-approvals"
                className="px-5 py-4 bg-card text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between border-b border-border"
                onClick={() => toggleSection('approvals')}
              >
                <span>Approvals Dashboard</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="bg-muted/30">
                <ReadOnlyApprovalsDashboard 
                  useCaseData={useCase} 
                  finopsData={finopsData}
                  approvalsData={approvalsData}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewUseCasePage; 