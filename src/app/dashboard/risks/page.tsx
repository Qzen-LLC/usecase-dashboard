'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  const [useCaseRisks, setUseCaseRisks] = useState<Record<string, any>>({});

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
      // Fetch risk metrics (score + radar) for each use case using Q/A answers
      const riskPairs = await Promise.all(
        (data.useCases || []).map(async (uc) => {
          try {
            const r = await fetch(`/api/risk-metrics/${uc.id}`).then(res => res.ok ? res.json() : null);
            return [uc.id, r?.risk || null] as const;
          } catch {
            return [uc.id, null] as const;
          }
        })
      );
      const riskMap: Record<string, any> = {};
      for (const [id, risk] of riskPairs) riskMap[id] = risk;
      setUseCaseRisks(riskMap);
      
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

  // Log risk calculation details when a use case is expanded
  useEffect(() => {
    if (!expandedUseCase || !useCaseRisks[expandedUseCase]) return;
    
    const riskCalc = useCaseRisks[expandedUseCase];
    const useCase = useCases.find(uc => uc.id === expandedUseCase);
    
    if (!riskCalc || !riskCalc.chartData) return;
    
    console.group(`🔍 Risk Calculation Breakdown - ${useCase?.title || expandedUseCase}`);
    
    // Radar Chart Values (Category Scores)
    console.log('\n📊 RADAR CHART VALUES (Category Scores 0-10):');
    const weights = {
      dataPrivacy: 0.25,
      security: 0.20,
      regulatory: 0.30,
      ethical: 0.10,
      operational: 0.10,
      reputational: 0.05
    };
    
    const categoryMap: Record<string, { score: number; weight: number }> = {};
    
    riskCalc.chartData.forEach((item: { month: string; desktop: number }) => {
      const category = item.month;
      const score = item.desktop;
      let weight = 0;
      
      if (category === 'Data Privacy') {
        weight = weights.dataPrivacy;
        categoryMap.dataPrivacy = { score, weight };
      } else if (category === 'Security') {
        weight = weights.security;
        categoryMap.security = { score, weight };
      } else if (category === 'Regulatory') {
        weight = weights.regulatory;
        categoryMap.regulatory = { score, weight };
      } else if (category === 'Ethical') {
        weight = weights.ethical;
        categoryMap.ethical = { score, weight };
      } else if (category === 'Operational') {
        weight = weights.operational;
        categoryMap.operational = { score, weight };
      } else if (category === 'Reputational') {
        weight = weights.reputational;
        categoryMap.reputational = { score, weight };
      }
      
      console.log(`  ${category}: ${score}/10`);
    });
    
    // Overall Score Calculation
    console.log('\n🧮 OVERALL RISK SCORE CALCULATION:');
    console.log('Formula: Weighted Average of Category Scores');
    console.log('\nWeights:');
    console.log(`  Data Privacy: ${weights.dataPrivacy} (25%)`);
    console.log(`  Security: ${weights.security} (20%)`);
    console.log(`  Regulatory: ${weights.regulatory} (30%)`);
    console.log(`  Ethical: ${weights.ethical} (10%)`);
    console.log(`  Operational: ${weights.operational} (10%)`);
    console.log(`  Reputational: ${weights.reputational} (5%)`);
    
    console.log('\nStep-by-step calculation:');
    let weightedSum = 0;
    let calculationSteps: string[] = [];
    
    if (categoryMap.dataPrivacy) {
      const contribution = categoryMap.dataPrivacy.score * categoryMap.dataPrivacy.weight;
      weightedSum += contribution;
      calculationSteps.push(`  Data Privacy: ${categoryMap.dataPrivacy.score} × ${categoryMap.dataPrivacy.weight} = ${contribution.toFixed(2)}`);
    }
    if (categoryMap.security) {
      const contribution = categoryMap.security.score * categoryMap.security.weight;
      weightedSum += contribution;
      calculationSteps.push(`  Security: ${categoryMap.security.score} × ${categoryMap.security.weight} = ${contribution.toFixed(2)}`);
    }
    if (categoryMap.regulatory) {
      const contribution = categoryMap.regulatory.score * categoryMap.regulatory.weight;
      weightedSum += contribution;
      calculationSteps.push(`  Regulatory: ${categoryMap.regulatory.score} × ${categoryMap.regulatory.weight} = ${contribution.toFixed(2)}`);
    }
    if (categoryMap.ethical) {
      const contribution = categoryMap.ethical.score * categoryMap.ethical.weight;
      weightedSum += contribution;
      calculationSteps.push(`  Ethical: ${categoryMap.ethical.score} × ${categoryMap.ethical.weight} = ${contribution.toFixed(2)}`);
    }
    if (categoryMap.operational) {
      const contribution = categoryMap.operational.score * categoryMap.operational.weight;
      weightedSum += contribution;
      calculationSteps.push(`  Operational: ${categoryMap.operational.score} × ${categoryMap.operational.weight} = ${contribution.toFixed(2)}`);
    }
    if (categoryMap.reputational) {
      const contribution = categoryMap.reputational.score * categoryMap.reputational.weight;
      weightedSum += contribution;
      calculationSteps.push(`  Reputational: ${categoryMap.reputational.score} × ${categoryMap.reputational.weight} = ${contribution.toFixed(2)}`);
    }
    
    calculationSteps.forEach(step => console.log(step));
    
    const finalScore = parseFloat(weightedSum.toFixed(1));
    console.log(`\n  Sum: ${weightedSum.toFixed(4)}`);
    console.log(`  Final Score (rounded to 1 decimal): ${finalScore}`);
    
    // Risk Tier Determination
    console.log('\n🎯 RISK TIER DETERMINATION:');
    console.log('Thresholds:');
    console.log('  Critical: ≥ 8.0');
    console.log('  High: ≥ 6.0 and < 8.0');
    console.log('  Medium: ≥ 4.0 and < 6.0');
    console.log('  Low: < 4.0');
    
    let tier = '';
    if (finalScore >= 8) {
      tier = 'Critical';
    } else if (finalScore >= 6) {
      tier = 'High';
    } else if (finalScore >= 4) {
      tier = 'Medium';
    } else {
      tier = 'Low';
    }
    
    console.log(`\n  Score: ${finalScore}`);
    console.log(`  Tier: ${tier}`);
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log(`  Overall Risk Score: ${finalScore}/10`);
    console.log(`  Risk Tier: ${tier}`);
    console.log(`  Radar Chart Points: ${riskCalc.chartData.length} categories`);
    
    console.groupEnd();
  }, [expandedUseCase, useCaseRisks, useCases]);

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

      {/* Executive Dashboard - Heat Map & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Risk Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Risk Heatmap
            </CardTitle>
            <CardDescription>Severity vs. Likelihood Matrix</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              // Calculate risk distribution for heatmap
              const allRisks = useCases.flatMap(uc => uc.risks);
              const heatmapData = [
                { severity: 'Critical', likelihood: 'High', risks: [] as Risk[] },
                { severity: 'Critical', likelihood: 'Medium', risks: [] as Risk[] },
                { severity: 'Critical', likelihood: 'Low', risks: [] as Risk[] },
                { severity: 'High', likelihood: 'High', risks: [] as Risk[] },
                { severity: 'High', likelihood: 'Medium', risks: [] as Risk[] },
                { severity: 'High', likelihood: 'Low', risks: [] as Risk[] },
                { severity: 'Medium', likelihood: 'High', risks: [] as Risk[] },
                { severity: 'Medium', likelihood: 'Medium', risks: [] as Risk[] },
                { severity: 'Medium', likelihood: 'Low', risks: [] as Risk[] },
                { severity: 'Low', likelihood: 'High', risks: [] as Risk[] },
                { severity: 'Low', likelihood: 'Medium', risks: [] as Risk[] },
                { severity: 'Low', likelihood: 'Low', risks: [] as Risk[] },
              ];

              allRisks.forEach(risk => {
                const cell = heatmapData.find(
                  d => d.severity === risk.riskLevel && d.likelihood === risk.likelihood
                );
                if (cell) cell.risks.push(risk);
              });

              const getCellColor = (count: number, severity: string) => {
                if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
                if (severity === 'Critical') return count > 2 ? 'bg-red-600' : count > 1 ? 'bg-red-500' : 'bg-red-400';
                if (severity === 'High') return count > 2 ? 'bg-orange-600' : count > 1 ? 'bg-orange-500' : 'bg-orange-400';
                if (severity === 'Medium') return count > 2 ? 'bg-yellow-600' : count > 1 ? 'bg-yellow-500' : 'bg-yellow-400';
                return count > 2 ? 'bg-green-600' : count > 1 ? 'bg-green-500' : 'bg-green-400';
              };

              return (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium text-center">
                    <div></div>
                    <div className="text-muted-foreground">Low</div>
                    <div className="text-muted-foreground">Medium</div>
                    <div className="text-muted-foreground">High</div>
                  </div>
                  {['Critical', 'High', 'Medium', 'Low'].map(severity => (
                    <div key={severity} className="grid grid-cols-4 gap-2">
                      <div className="flex items-center text-xs font-medium text-muted-foreground">{severity}</div>
                      {['Low', 'Medium', 'High'].map(likelihood => {
                        const cell = heatmapData.find(d => d.severity === severity && d.likelihood === likelihood);
                        const count = cell?.risks.length || 0;
                        return (
                          <div
                            key={likelihood}
                            className={`${getCellColor(count, severity)} rounded-md h-16 flex items-center justify-center text-white font-bold text-lg transition-all hover:scale-105 cursor-pointer`}
                            title={`${severity} Severity / ${likelihood} Likelihood: ${count} risks`}
                          >
                            {count}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex justify-center gap-4">
                      <span>Darker = More Risks</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Risk Status & Category Breakdown */}
        <div className="space-y-6">
          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Status</CardTitle>
              <CardDescription>Distribution by workflow status</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const allRisks = useCases.flatMap(uc => uc.risks);
                const openCount = allRisks.filter(r => r.status === 'OPEN').length;
                const inProgressCount = allRisks.filter(r => r.status === 'IN_PROGRESS').length;
                const mitigatedCount = allRisks.filter(r => r.status === 'MITIGATED').length;
                const closedCount = allRisks.filter(r => r.status === 'CLOSED').length;
                const total = allRisks.length || 1;

                return (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="text-sm">Open</span>
                        </div>
                        <span className="text-sm font-bold">{openCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all"
                          style={{ width: `${(openCount / total) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="text-sm">In Progress</span>
                        </div>
                        <span className="text-sm font-bold">{inProgressCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all"
                          style={{ width: `${(inProgressCount / total) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm">Mitigated</span>
                        </div>
                        <span className="text-sm font-bold">{mitigatedCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${(mitigatedCount / total) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                          <span className="text-sm">Closed</span>
                        </div>
                        <span className="text-sm font-bold">{closedCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gray-500 h-2 rounded-full transition-all"
                          style={{ width: `${(closedCount / total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Categories</CardTitle>
              <CardDescription>Distribution by risk type</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const allRisks = useCases.flatMap(uc => uc.risks);
                const categories = ['technical', 'data', 'operational', 'regulatory', 'ethical', 'business'];
                const categoryLabels: Record<string, string> = {
                  'technical': 'Technical',
                  'data': 'Data Privacy',
                  'operational': 'Operational',
                  'regulatory': 'Regulatory',
                  'ethical': 'Ethical',
                  'business': 'Business'
                };
                const categoryCounts = categories.map(cat => ({
                  category: cat,
                  label: categoryLabels[cat],
                  count: allRisks.filter(r => r.category === cat).length
                })).filter(c => c.count > 0);

                const total = allRisks.length || 1;

                return (
                  <div className="space-y-3">
                    {categoryCounts.map(({ category, label, count }) => (
                      <div key={category} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${(count / total) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-bold w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                    {categoryCounts.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No risks found</p>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
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

            const riskCalc = useCaseRisks[useCase.id] || null;

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
                      {riskCount === 0 && useCase.assessData?.stepsData && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const response = await fetch(`/api/risks/${useCase.id}/auto-create`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ stepsData: useCase.assessData.stepsData })
                              });
                              if (response.ok) {
                                alert('✅ Risks created successfully! Click "Manage Risks" to view them.');
                                fetchData(); // Refresh the data
                              } else {
                                const error = await response.text();
                                alert(`❌ Failed to create risks: ${error}`);
                              }
                            } catch (error) {
                              alert(`❌ Error: ${error}`);
                            }
                          }}
                          className="mr-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Generate Risks
                        </Button>
                      )}
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
