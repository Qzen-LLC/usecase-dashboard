'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Target, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReadOnlyAssessmentDisplay from '@/components/ReadOnlyAssessmentDisplay';

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
          <div className="flex items-center ml-auto gap-1.5">
            <span className="mr-2.5 text-muted-foreground">Use Case Profile</span>
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-xs border-2 border-background shadow-sm">
              {useCase.operationalImpactScore || 'B'}
            </div>
            <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-semibold text-xs border-2 border-background shadow-sm">
              {useCase.productivityImpactScore || 'B'}
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-xs border-2 border-background shadow-sm">
              {useCase.revenueImpactScore || 'B'}
            </div>
            <div className="ml-1.5">
              <div className="text-[10px] text-muted-foreground">Operational</div>
            </div>
            <div className="ml-4">
              <div className="text-[10px] text-muted-foreground">Productivity</div>
            </div>
            <div className="ml-4">
              <div className="text-[10px] text-muted-foreground">Business</div>
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
        <div className="flex flex-col lg:flex-row gap-5 px-5 pb-5">
          {/* Left Panel */}
          <div className="w-full lg:w-1/2 flex flex-col gap-5">
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
          <div className="w-full lg:w-1/2">
            <div className="bg-muted rounded-lg overflow-hidden">
              <div className="bg-muted/70 px-5 py-4 font-semibold text-lg text-center text-foreground">
                Collapsable Box
              </div>
                             <div className="space-y-0">
                 <div 
                   className="px-5 py-4 bg-card border-b border-border text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                   onClick={() => router.push(`/dashboard/${useCaseId}/assess?step=1&readonly=true`)}
                 >
                   Technical Feasibility
                 </div>
                 <div 
                   className="px-5 py-4 bg-card border-b border-border text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                   onClick={() => router.push(`/dashboard/${useCaseId}/assess?step=2&readonly=true`)}
                 >
                   Business Feasibility
                 </div>
                 <div 
                   className="px-5 py-4 bg-card border-b border-border text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                   onClick={() => router.push(`/dashboard/${useCaseId}/assess?step=3&readonly=true`)}
                 >
                   Ethical Impact
                 </div>
                 <div 
                   className="px-5 py-4 bg-card border-b border-border text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                   onClick={() => router.push(`/dashboard/${useCaseId}/assess?step=4&readonly=true`)}
                 >
                   Risk Assessment
                 </div>
                 <div 
                   className="px-5 py-4 bg-card border-b border-border text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                   onClick={() => router.push(`/dashboard/${useCaseId}/assess?step=5&readonly=true`)}
                 >
                   Data Readiness
                 </div>
                 <div 
                   className="px-5 py-4 bg-card border-b border-border text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                   onClick={() => router.push(`/dashboard/${useCaseId}/assess?step=6&readonly=true`)}
                 >
                   Roadmap Position
                 </div>
                 <div 
                   className="px-5 py-4 bg-card border-b border-border text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                   onClick={() => router.push(`/dashboard/${useCaseId}/assess?step=7&readonly=true`)}
                 >
                   Budget Planning
                 </div>
                 <div 
                   className="px-5 py-4 bg-card border-b border-border text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                   onClick={() => router.push(`/dashboard/${useCaseId}/assess?step=8&readonly=true`)}
                 >
                   Financial Dashboard
                 </div>
                 <div 
                   className="px-5 py-4 bg-card text-[15px] text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                   onClick={() => router.push(`/dashboard/${useCaseId}/assess?step=9&readonly=true`)}
                 >
                   Approvals
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUseCasePage; 