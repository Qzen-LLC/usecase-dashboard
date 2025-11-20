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
          const res = await fetch(`/api/risk-score/${uc.id}`, { 
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          });
          if (!res.ok) {
            console.error(`Failed to fetch risk score for ${uc.id}:`, res.status, res.statusText);
            return [uc.id, null] as const;
          }
          const calc = await res.json();
          return [uc.id, calc] as const;
        } catch (error) {
          console.error(`Error fetching risk score for ${uc.id}:`, error);
          return [uc.id, null] as const;
        }
      }));

      const map: Record<string, any> = {};
      for (const [id, calc] of entries) map[id] = calc;
      setUseCaseRisks(map);
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
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
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
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
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
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      {/* Header */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground">
          Comprehensive risk assessment and monitoring organized by use case
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <Card className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-700 rounded-md">
          <CardHeader className="pb-1.5 px-4 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Use Cases</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-foreground">{filteredUseCases.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-700 rounded-md">
          <CardHeader className="pb-1.5 px-4 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Risks</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-foreground">{totalRisks}</div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-700 rounded-md">
          <CardHeader className="pb-1.5 px-4 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">High Priority Risks</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-destructive">{highRiskCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Executive Dashboard - Heat Map & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Risk Heatmap */}
        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 rounded-md">
          <CardHeader className="px-4 pt-4 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" />
              Risk Heatmap
            </CardTitle>
            <CardDescription className="text-xs">Severity vs. Likelihood Matrix</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
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
                <div className="space-y-1.5">
                  <div className="grid grid-cols-4 gap-1.5 text-[10px] font-medium text-center">
                    <div></div>
                    <div className="text-muted-foreground">Low</div>
                    <div className="text-muted-foreground">Medium</div>
                    <div className="text-muted-foreground">High</div>
                  </div>
                  {['Critical', 'High', 'Medium', 'Low'].map(severity => (
                    <div key={severity} className="grid grid-cols-4 gap-1.5">
                      <div className="flex items-center text-[10px] font-medium text-muted-foreground">{severity}</div>
                      {['Low', 'Medium', 'High'].map(likelihood => {
                        const cell = heatmapData.find(d => d.severity === severity && d.likelihood === likelihood);
                        const count = cell?.risks.length || 0;
                        return (
                          <div
                            key={likelihood}
                            className={`${getCellColor(count, severity)} rounded h-12 flex items-center justify-center text-white font-bold text-sm transition-all hover:scale-105 cursor-pointer`}
                            title={`${severity} Severity / ${likelihood} Likelihood: ${count} risks`}
                          >
                            {count}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div className="text-[10px] text-muted-foreground pt-1.5 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex justify-center">
                      <span>Darker = More Risks</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Risk Status & Category Breakdown */}
        <div className="space-y-4">
          {/* Status Breakdown */}
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 rounded-md">
            <CardHeader className="px-4 pt-4 pb-3">
              <CardTitle className="text-sm font-semibold">Risk Status</CardTitle>
              <CardDescription className="text-xs">Distribution by workflow status</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {(() => {
                const allRisks = useCases.flatMap(uc => uc.risks);
                const openCount = allRisks.filter(r => r.status === 'OPEN').length;
                const inProgressCount = allRisks.filter(r => r.status === 'IN_PROGRESS').length;
                const mitigatedCount = allRisks.filter(r => r.status === 'MITIGATED').length;
                const closedCount = allRisks.filter(r => r.status === 'CLOSED').length;
                const total = allRisks.length || 1;

                return (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                          <span className="text-xs">Open</span>
                        </div>
                        <span className="text-xs font-semibold">{openCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-red-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${(openCount / total) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                          <span className="text-xs">In Progress</span>
                        </div>
                        <span className="text-xs font-semibold">{inProgressCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-yellow-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${(inProgressCount / total) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                          <span className="text-xs">Mitigated</span>
                        </div>
                        <span className="text-xs font-semibold">{mitigatedCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${(mitigatedCount / total) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-500"></div>
                          <span className="text-xs">Closed</span>
                        </div>
                        <span className="text-xs font-semibold">{closedCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-gray-500 h-1.5 rounded-full transition-all"
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
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 rounded-md">
            <CardHeader className="px-4 pt-4 pb-3">
              <CardTitle className="text-sm font-semibold">Risk Categories</CardTitle>
              <CardDescription className="text-xs">Distribution by risk type</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
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
                  <div className="space-y-2.5">
                    {categoryCounts.map(({ category, label, count }) => (
                      <div key={category} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${(count / total) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold w-6 text-right text-xs">{count}</span>
                        </div>
                      </div>
                    ))}
                    {categoryCounts.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-3">No risks found</p>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-neutral-50/50 dark:bg-neutral-900/30 rounded-md p-3 mb-4 border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Organization Filter (for QZEN_ADMIN) */}
          {userData?.role === 'QZEN_ADMIN' && organizations.length > 0 && (
            <div className="flex-1">
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Filter by Organization
              </label>
              <Select
                value={selectedOrgId === '' ? 'ALL' : selectedOrgId}
                onValueChange={(v) => setSelectedOrgId(v === 'ALL' ? '' : v)}
              >
                <SelectTrigger className="bg-white dark:bg-neutral-900 h-9 text-sm">
                  <SelectValue placeholder="All Organizations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Organizations</SelectItem>
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={org.id}>
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5" />
                        <span className="text-sm">{org.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Search */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Search Use Cases
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by title, ID, organization, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
              />
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex items-end">
            <Button onClick={fetchData} variant="outline" className="h-9 text-xs">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Use Cases with Risks */}
      <div className="space-y-4">
        {filteredUseCases.length === 0 ? (
          <Card className="bg-neutral-50/50 dark:bg-neutral-900/30 border-neutral-200 dark:border-neutral-700 rounded-md">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Shield className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-xs text-muted-foreground">
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
              <Card key={useCase.id} className="overflow-hidden bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow rounded-md">
                <CardHeader 
                  className="cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors px-4 pt-4 pb-3"
                  onClick={() => toggleUseCaseExpansion(useCase.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <CardTitle className="text-sm font-semibold leading-tight">
                          {formatAiucId(useCase.aiucId, useCase.id)} - {useCase.title}
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {useCase.stage}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs mt-0.5">
                        {useCase.organization?.name && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {useCase.organization.name}
                          </span>
                        )}
                        {useCase.user && (
                          <span className={useCase.organization?.name ? "ml-2" : ""}>
                            Owner: {useCase.user.firstName} {useCase.user.lastName}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right min-w-[100px]">
                        <div className="text-[10px] text-muted-foreground">Overall Risk</div>
                        {riskCalc ? (
                          <div className="flex items-center justify-end gap-1.5 mt-0.5">
                            <span className="text-lg font-bold text-foreground">{riskCalc.score}</span>
                            <Badge className={`text-[10px] px-1.5 py-0 ${getRiskLevelColor((riskCalc.riskTier || '').charAt(0).toUpperCase() + (riskCalc.riskTier || '').slice(1))}`}>
                              {((riskCalc.riskTier || '') as string).charAt(0).toUpperCase() + ((riskCalc.riskTier || '') as string).slice(1)}
                            </Badge>
                          </div>
                        ) : (
                          <div className="text-[10px] text-muted-foreground mt-0.5">Insufficient data</div>
                        )}
                      </div>
                      <div className="text-right min-w-[70px]">
                        <div className="text-[10px] text-muted-foreground">Risks</div>
                        <div className="text-lg font-bold text-foreground">{riskCount}</div>
                        {openRiskCount > 0 && (
                          <div className="text-[10px] text-destructive mt-0.5">
                            {openRiskCount} open
                          </div>
                        )}
                        {highRiskCount > 0 && (
                          <div className="text-[10px] text-orange-500 mt-0.5">
                            {highRiskCount} high
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
                          className="mr-1 bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-2"
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Generate
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/${useCase.id}/risks?from=risks`);
                        }}
                        className="mr-1 text-xs h-7 px-2"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Manage
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 px-4 pb-4">
                    {riskCalc && riskCalc.chartData && riskCalc.chartData.length > 0 && (
                      <div className="mb-3 p-3 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
                        <div className="mb-2 text-xs font-semibold text-foreground">Risk Radar</div>
                        <ChartRadarDots chartData={riskCalc.chartData} />
                      </div>
                    )}
                    {riskCalc && (
                      <div className="mb-3 p-3 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30">
                        <div className="mb-2 text-xs font-semibold text-foreground">Risk Feedback</div>
                        {riskCalc.regulatoryWarnings && riskCalc.regulatoryWarnings.length > 0 && (
                          <div className="mb-2">
                            <div className="text-[10px] font-medium text-muted-foreground mb-1">Regulatory Warnings</div>
                            <ul className="list-disc pl-4 text-xs text-foreground space-y-0.5">
                              {riskCalc.regulatoryWarnings.map((w: string, idx: number) => (
                                <li key={idx}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {riskCalc.dataPrivacyInfo && riskCalc.dataPrivacyInfo.length > 0 && (
                          <div className="mb-2">
                            <div className="text-[10px] font-medium text-muted-foreground mb-1">Data Privacy</div>
                            <ul className="list-disc pl-4 text-xs text-foreground space-y-0.5">
                              {riskCalc.dataPrivacyInfo.map((m: string, idx: number) => (
                                <li key={idx}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {riskCalc.securityInfo && riskCalc.securityInfo.length > 0 && (
                          <div className="mb-2">
                            <div className="text-[10px] font-medium text-muted-foreground mb-1">Security</div>
                            <ul className="list-disc pl-4 text-xs text-foreground space-y-0.5">
                              {riskCalc.securityInfo.map((m: string, idx: number) => (
                                <li key={idx}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {riskCalc.operationalInfo && riskCalc.operationalInfo.length > 0 && (
                          <div className="mb-2">
                            <div className="text-[10px] font-medium text-muted-foreground mb-1">Operational</div>
                            <ul className="list-disc pl-4 text-xs text-foreground space-y-0.5">
                              {riskCalc.operationalInfo.map((m: string, idx: number) => (
                                <li key={idx}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {riskCalc.ethicalInfo && riskCalc.ethicalInfo.length > 0 && (
                          <div className="mb-0">
                            <div className="text-[10px] font-medium text-muted-foreground mb-1">Ethical</div>
                            <ul className="list-disc pl-4 text-xs text-foreground space-y-0.5">
                              {riskCalc.ethicalInfo.map((m: string, idx: number) => (
                                <li key={idx}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    {riskCount === 0 ? (
                      <div className="text-center py-6 text-xs text-muted-foreground">
                        No risks identified for this use case.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {useCase.risks.map((risk) => (
                          <Card 
                            key={risk.id} 
                            className="border-l-4 bg-neutral-50/50 dark:bg-neutral-800/30 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors rounded-md" 
                            style={{
                              borderLeftColor: risk.riskLevel === 'Critical' ? '#ef4444' :
                                risk.riskLevel === 'High' ? '#f97316' :
                                risk.riskLevel === 'Medium' ? '#eab308' : '#22c55e'
                            }}
                          >
                            <CardContent className="pt-3 px-3 pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                    <Badge className={`${getRiskLevelColor(risk.riskLevel)} text-[10px] px-1.5 py-0`}>
                                      {risk.riskLevel}
                                    </Badge>
                                    <Badge className={`${getStatusColor(risk.status)} text-[10px] px-1.5 py-0`}>
                                      {risk.status.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-[10px] font-medium text-muted-foreground bg-neutral-100 dark:bg-neutral-700 px-1.5 py-0.5 rounded">
                                      Score: {risk.riskScore}/10
                                    </span>
                                  </div>
                                  <h4 className="font-semibold text-xs text-foreground mb-1">
                                    {risk.category}
                                  </h4>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {risk.description}
                                  </p>
                                  {risk.mitigationStrategy && (
                                    <div className="mt-1.5 pt-1.5 border-t border-neutral-200 dark:border-neutral-700">
                                      <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Mitigation Strategy:</p>
                                      <p className="text-xs text-foreground">{risk.mitigationStrategy}</p>
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
