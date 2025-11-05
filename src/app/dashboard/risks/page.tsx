'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, 
  Shield, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Search,
  Building
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserData } from '@/contexts/UserContext';
import { calculateRiskScores } from '@/lib/risk-calculations';
import { buildStepsDataFromQnA } from '@/lib/steps-from-qna';
import { ChartRadarDots } from '@/components/ui/radar-chart';

interface Risk {
  id: string;
  category: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  riskScore: number;
  description: string;
  mitigationStrategy?: string;
  createdAt: string;
  updatedAt: string;
}

interface UseCase {
  id: string;
  aiucId?: string | number;
  title: string;
  description: string;
  stage: string;
  answers?: any[];
  organization?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  risks: Risk[];
}

interface UseCasesWithRisksResponse {
  useCases: UseCase[];
  organizations: Array<{ id: string; name: string }>;
  userRole: string;
  userOrganizationId: string | null;
}

const getRiskLevelColor = (level: string) => {
  switch (level) {
    case 'Critical':
      return 'bg-red-500 text-white';
    case 'High':
      return 'bg-orange-500 text-white';
    case 'Medium':
      return 'bg-yellow-500 text-white';
    case 'Low':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'CLOSED':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

const formatAiucId = (aiucId: string | number | undefined, id: string): string => {
  if (aiucId) {
    const aiucIdStr = String(aiucId);
    if (aiucIdStr.startsWith('AIUC-')) {
      return aiucIdStr;
    }
    return `AIUC-${aiucIdStr}`;
  }
  return `AIUC-${id.substring(0, 8)}`;
};

export default function RiskManagementPage() {
  const router = useRouter();
  const { userData } = useUserData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUseCase, setExpandedUseCase] = useState<string | null>(null);
  const [riskCalcs, setRiskCalcs] = useState<Record<string, any>>({});

  // Build minimal StepsData from template/question answers to mirror Assess radar
  const buildStepsDataFromAnswers = (answers: any[]): any => {
    const steps: any = {
      dataReadiness: {},
      riskAssessment: { dataProtection: {}, operatingJurisdictions: {} },
      technicalFeasibility: {},
      businessFeasibility: {},
      ethicalImpact: {},
      vendorAssessment: {}
    };

    const setIfMatch = (src: any, key: string, value: string, patterns: string[]) => {
      if (patterns.some(p => value.toLowerCase().includes(p))) src[key] = value;
    };

    const norm = (s: any) => String(s || '').trim();

    (answers || []).forEach((ans: any) => {
      const q = ans.question || ans.questionTemplate;
      if (!q) return;
      const stage = String(q.stage || '').toUpperCase();
      const type = q.type;
      const qText = norm(q.text).toLowerCase();
      const val = ans.value || {};
      const labels: string[] = Array.isArray(val.labels) ? val.labels : (val.text ? [val.text] : []);

      if (stage === 'DATA_READINESS') {
        labels.forEach(raw => {
          const label = norm(raw);
          // data types
          if (!steps.dataReadiness.dataTypes) steps.dataReadiness.dataTypes = [];
          if (/record|biometric|child|financial|health|pii|personal/i.test(label)) steps.dataReadiness.dataTypes.push(label);
          // cross-border
          if (/cross\s*-?border|cross border|international transfer/i.test(label) || qText.includes('cross-border')) {
            steps.dataReadiness.crossBorderTransfer = true;
          }
          // volume
          setIfMatch(steps.dataReadiness, 'dataVolume', label, ['record', 'volume', 'gb', 'tb', 'mb']);
          // update frequency
          setIfMatch(steps.dataReadiness, 'dataUpdate', label, ['real-time', 'realtime', 'batch', 'daily', 'weekly', 'hourly']);
          // retention
          setIfMatch(steps.dataReadiness, 'dataRetention', label, ['year', 'month', 'retention']);
        });
      }

      if (stage === 'RISK_ASSESSMENT') {
        labels.forEach(raw => {
          const label = norm(raw);
          // jurisdictions
          if (/eu\b|europe|us\b|usa|uae|gcc|apac|emea|apj|gdpr|uk|india|singapore|canada/i.test(label) || qText.includes('jurisdiction')) {
            const region = 'General';
            if (!steps.riskAssessment.operatingJurisdictions[region]) steps.riskAssessment.operatingJurisdictions[region] = [];
            steps.riskAssessment.operatingJurisdictions[region].push(label);
          }
          // reporting and tolerance
          setIfMatch(steps.riskAssessment, 'complianceReporting', label, ['minimal', 'basic', 'enhanced', 'comprehensive', 'reporting']);
          setIfMatch(steps.riskAssessment, 'riskTolerance', label, ['low', 'medium', 'high']);
          // specific regulations
          if (/gdpr|hipaa|finra|pci/i.test(label)) {
            if (!steps.riskAssessment.dataProtection) steps.riskAssessment.dataProtection = {};
            steps.riskAssessment.dataProtection.jurisdictions = steps.riskAssessment.dataProtection.jurisdictions || [];
            (steps.riskAssessment.dataProtection.jurisdictions as any[]).push(label);
          }
        });
      }

      if (stage === 'TECHNICAL_FEASIBILITY') {
        labels.forEach(raw => {
          const label = norm(raw);
          setIfMatch(steps.technicalFeasibility, 'authentication', label, ['basic', 'oauth', 'none', 'mfa', 'sso']);
          setIfMatch(steps.technicalFeasibility, 'encryption', label, ['encryption', 'none', 'aes', 'tls', 'at rest', 'in transit']);
          setIfMatch(steps.technicalFeasibility, 'accessControl', label, ['public', 'private', 'role', 'rbac']);
          setIfMatch(steps.technicalFeasibility, 'incidentResponse', label, ['incident', 'ir plan', 'none']);
          setIfMatch(steps.technicalFeasibility, 'apiSecurity', label, ['api']);
        });
      }

      if (stage === 'BUSINESS_FEASIBILITY') {
        labels.forEach(raw => {
          const label = norm(raw);
          setIfMatch(steps.businessFeasibility, 'businessCriticality', label, ['mission critical', 'business critical', 'critical']);
          setIfMatch(steps.businessFeasibility, 'sla', label, ['99.999', '99.99', '99.9', 'sla']);
          setIfMatch(steps.businessFeasibility, 'disasterRecovery', label, ['dr', 'disaster', 'none', 'rpo', 'rto']);
          setIfMatch(steps.businessFeasibility, 'changeManagement', label, ['change', 'ad-hoc', 'structured', 'itil']);
        });
      }

      if (stage === 'ETHICAL_IMPACT') {
        labels.forEach(raw => {
          const label = norm(raw);
          setIfMatch(steps.ethicalImpact, 'biasDetection', label, ['bias', 'none']);
          setIfMatch(steps.ethicalImpact, 'humanOversight', label, ['oversight', 'none', 'human-in-the-loop']);
          setIfMatch(steps.ethicalImpact, 'transparencyLevel', label, ['transparency', 'low', 'medium', 'high']);
          setIfMatch(steps.ethicalImpact, 'appealProcess', label, ['appeal', 'none']);
        });
      }

      // Vendor assessment
      if (/vendor|third[-\s]?party/i.test(qText)) {
        const count = labels.map(l => parseInt(l, 10)).find(n => !isNaN(n));
        if (typeof count === 'number') steps.vendorAssessment.vendorCount = count;
      }
    });

    return steps;
  };

  useEffect(() => {
    fetchData();
  }, [selectedOrgId]);

  // After loading use cases, fetch QnA exactly like Approvals and compute risk
  useEffect(() => {
    const computeRiskForUseCases = async () => {
      if (!useCases || useCases.length === 0) return;

      const entries = await Promise.all(useCases.map(async (uc) => {
        try {
          const res = await fetch(`/api/risk-score/${uc.id}`, { headers: { 'Content-Type': 'application/json' } });
          if (!res.ok) return [uc.id, null] as const;
          const calc = await res.json();
          return [uc.id, calc] as const;
        } catch {
          return [uc.id, null] as const;
        }
      }));

      const map: Record<string, any> = {};
      for (const [id, calc] of entries) map[id] = calc;
      setRiskCalcs(map);
    };

    computeRiskForUseCases();
  }, [useCases]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = selectedOrgId 
        ? `/api/use-cases-with-risks?organizationId=${selectedOrgId}`
        : '/api/use-cases-with-risks';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: UseCasesWithRisksResponse = await response.json();
      setUseCases(data.useCases);
      setOrganizations(data.organizations || []);
      
      // Set initial organization filter for QZEN_ADMIN
      if (data.userRole === 'QZEN_ADMIN' && !selectedOrgId && data.organizations.length > 0) {
        // Don't auto-select, let user choose
      }
    } catch (err) {
      console.error('[Risk Management] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const toggleUseCaseExpansion = (useCaseId: string) => {
    setExpandedUseCase(expandedUseCase === useCaseId ? null : useCaseId);
  };

  // Filter use cases based on search term
  const filteredUseCases = useCases.filter(uc => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      uc.title.toLowerCase().includes(searchLower) ||
      formatAiucId(uc.aiucId, uc.id).toLowerCase().includes(searchLower) ||
      uc.organization?.name.toLowerCase().includes(searchLower) ||
      `${uc.user?.firstName} ${uc.user?.lastName}`.toLowerCase().includes(searchLower)
    );
  });

  // Calculate summary statistics
  const totalRisks = useCases.reduce((sum, uc) => sum + uc.risks.length, 0);
  const openRisks = useCases.reduce((sum, uc) => 
    sum + uc.risks.filter(r => r.status === 'OPEN').length, 0
  );
  const highRiskCount = useCases.reduce((sum, uc) => 
    sum + uc.risks.filter(r => r.riskLevel === 'High' || r.riskLevel === 'Critical').length, 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-muted-foreground">Loading risk data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Unable to Load Risk Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Risk Management</h1>
        <p className="text-muted-foreground">
          Comprehensive risk assessment and monitoring organized by use case
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Use Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{filteredUseCases.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalRisks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Priority Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{highRiskCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Organization Filter (for QZEN_ADMIN) */}
            {userData?.role === 'QZEN_ADMIN' && organizations.length > 0 && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Filter by Organization
                </label>
                <Select
                  value={selectedOrgId === '' ? 'ALL' : selectedOrgId}
                  onValueChange={(v) => setSelectedOrgId(v === 'ALL' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Organizations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Organizations</SelectItem>
                    {organizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          {org.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                Search Use Cases
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, ID, organization, or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <Button onClick={fetchData} variant="outline" className="h-10">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Use Cases with Risks */}
      <div className="space-y-4">
        {filteredUseCases.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No use cases found matching your search.' : 'No use cases with risks found.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredUseCases.map((useCase) => {
            const riskCount = useCase.risks.length;
            const openRiskCount = useCase.risks.filter(r => r.status === 'OPEN').length;
            const highRiskCount = useCase.risks.filter(r => 
              r.riskLevel === 'High' || r.riskLevel === 'Critical'
            ).length;
            const isExpanded = expandedUseCase === useCase.id;

            // Use the same QnA-driven calculation as Approvals
            const riskCalc = riskCalcs[useCase.id] || null;

            return (
              <Card key={useCase.id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleUseCaseExpansion(useCase.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">
                          {formatAiucId(useCase.aiucId, useCase.id)} - {useCase.title}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {useCase.stage}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        {useCase.organization?.name && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {useCase.organization.name}
                          </span>
                        )}
                        {useCase.user && (
                          <span className="ml-3">
                            Owner: {useCase.user.firstName} {useCase.user.lastName}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-2 min-w-[150px]">
                        <div className="text-sm text-muted-foreground">Overall Risk</div>
                        {riskCalc ? (
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <span className="text-2xl font-bold text-foreground">{riskCalc.score}</span>
                            <Badge className={getRiskLevelColor((riskCalc.riskTier || '').charAt(0).toUpperCase() + (riskCalc.riskTier || '').slice(1))}>
                              {((riskCalc.riskTier || '') as string).charAt(0).toUpperCase() + ((riskCalc.riskTier || '') as string).slice(1)}
                            </Badge>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground mt-1">Insufficient assessment data</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Risks</div>
                        <div className="text-2xl font-bold text-foreground">{riskCount}</div>
                        {openRiskCount > 0 && (
                          <div className="text-xs text-destructive mt-1">
                            {openRiskCount} open
                          </div>
                        )}
                        {highRiskCount > 0 && (
                          <div className="text-xs text-orange-500 mt-1">
                            {highRiskCount} high priority
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/${useCase.id}/risks?from=risks`);
                        }}
                        className="mr-2"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Manage Risks
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    {riskCalc && riskCalc.chartData && riskCalc.chartData.length > 0 && (
                      <div className="mb-4 p-4 rounded border border-border bg-card">
                        <div className="mb-2 text-sm font-semibold text-foreground">Risk Radar</div>
                        <ChartRadarDots chartData={riskCalc.chartData} />
                      </div>
                    )}
                    {riskCalc && (
                      <div className="mb-4 p-4 rounded border border-border bg-muted/30">
                        <div className="mb-2 text-sm font-semibold text-foreground">Risk Feedback</div>
                        {riskCalc.regulatoryWarnings && riskCalc.regulatoryWarnings.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-muted-foreground mb-1">Regulatory Warnings</div>
                            <ul className="list-disc pl-5 text-sm text-foreground">
                              {riskCalc.regulatoryWarnings.map((w: string, idx: number) => (
                                <li key={idx}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {riskCalc.dataPrivacyInfo && riskCalc.dataPrivacyInfo.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-muted-foreground mb-1">Data Privacy</div>
                            <ul className="list-disc pl-5 text-sm text-foreground">
                              {riskCalc.dataPrivacyInfo.map((m: string, idx: number) => (
                                <li key={idx}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {riskCalc.securityInfo && riskCalc.securityInfo.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-muted-foreground mb-1">Security</div>
                            <ul className="list-disc pl-5 text-sm text-foreground">
                              {riskCalc.securityInfo.map((m: string, idx: number) => (
                                <li key={idx}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {riskCalc.operationalInfo && riskCalc.operationalInfo.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-muted-foreground mb-1">Operational</div>
                            <ul className="list-disc pl-5 text-sm text-foreground">
                              {riskCalc.operationalInfo.map((m: string, idx: number) => (
                                <li key={idx}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {riskCalc.ethicalInfo && riskCalc.ethicalInfo.length > 0 && (
                          <div className="mb-1">
                            <div className="text-xs font-medium text-muted-foreground mb-1">Ethical</div>
                            <ul className="list-disc pl-5 text-sm text-foreground">
                              {riskCalc.ethicalInfo.map((m: string, idx: number) => (
                                <li key={idx}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    {riskCount === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No risks identified for this use case.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {useCase.risks.map((risk) => (
                          <Card key={risk.id} className="border-l-4" style={{
                            borderLeftColor: risk.riskLevel === 'Critical' ? '#ef4444' :
                              risk.riskLevel === 'High' ? '#f97316' :
                              risk.riskLevel === 'Medium' ? '#eab308' : '#22c55e'
                          }}>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={getRiskLevelColor(risk.riskLevel)}>
                                      {risk.riskLevel}
                                    </Badge>
                                    <Badge className={getStatusColor(risk.status)}>
                                      {risk.status.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-sm font-medium text-muted-foreground">
                                      Score: {risk.riskScore}/10
                                    </span>
                                  </div>
                                  <h4 className="font-semibold text-foreground mb-1">
                                    {risk.category}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {risk.description}
                                  </p>
                                  {risk.mitigationStrategy && (
                                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                                      <strong>Mitigation:</strong> {risk.mitigationStrategy}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
