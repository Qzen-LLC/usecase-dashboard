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

  useEffect(() => {
    fetchData();
  }, [selectedOrgId]);

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
                          router.push(`/dashboard/${useCase.id}/risks`);
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
