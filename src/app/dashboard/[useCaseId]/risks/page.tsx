'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft,
  Loader2, 
  AlertTriangle, 
  Shield, 
  Plus, 
  X, 
  Edit2, 
  CheckCircle,
  Clock,
  User,
  Calendar,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { calculateRiskScores, getRiskLevel, type StepsData } from '@/lib/risk-calculations';
import Link from 'next/link';

// Simple date formatting function to avoid external dependency
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

interface RiskData {
  id: string;
  category: string;
  riskLevel: string;
  riskScore: number;
  title: string;
  description: string;
  impact: string;
  likelihood: string;
  status: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedToEmail?: string;
  mitigationPlan?: string;
  mitigationStatus?: string;
  targetDate?: string;
  actualDate?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  createdByEmail: string;
  updatedAt: string;
  closedAt?: string;
  closureReason?: string;
}

interface UseCaseData {
  id: string;
  title: string;
  aiucId: number;
  // assessData removed from dependency
}

export default function RiskManagementPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const useCaseId = params.useCaseId as string;

  const [loading, setLoading] = useState(true);
  const [useCase, setUseCase] = useState<UseCaseData | null>(null);
  const [risks, setRisks] = useState<RiskData[]>([]);
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);
  const [editingRisk, setEditingRisk] = useState<string | null>(null);
  const [creatingRisk, setCreatingRisk] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<RiskData>>({});

  useEffect(() => {
    fetchData();
  }, [useCaseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch use case data
      const useCaseResponse = await fetch(`/api/get-usecase-details?useCaseId=${useCaseId}`);
      if (!useCaseResponse.ok) throw new Error('Failed to fetch use case');
      const useCaseData = await useCaseResponse.json();
      setUseCase(useCaseData);

      // Fetch risks
      const risksResponse = await fetch(`/api/risks/${useCaseId}`);
      if (!risksResponse.ok) {
        const errorText = await risksResponse.text();
        console.error('Risks API error:', errorText);
        throw new Error(`Failed to fetch risks: ${risksResponse.status} - ${errorText}`);
      }
      const risksData = await risksResponse.json();
      setRisks(risksData);

      // Note: Auto-creation removed - users should manually click "Generate Risks" button
      // if (risksData.length === 0 && useCaseData.assessData?.stepsData) {
      //   await autoCreateRisks(useCaseData.assessData.stepsData);
      // }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoCreateRisks = async (stepsData: StepsData) => {
    try {
      setCreating(true);
      const response = await fetch(`/api/risks/${useCaseId}/auto-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepsData })
      });

      if (response.ok) {
        const newRisks = await response.json();
        setRisks(newRisks);
        console.log(`✅ Successfully created ${newRisks.length} risks with recommendations`);
      } else {
        const errorText = await response.text();
        console.error('❌ Error auto-creating risks:', errorText);
        alert(`Failed to create risks: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error auto-creating risks:', error);
      alert(`Error creating risks: ${error}`);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateRisk = async () => {
    // Validate required fields
    if (!formData.title || !formData.description || !formData.category || !formData.riskLevel || !formData.impact || !formData.likelihood) {
      alert('Please fill in all required fields (Title, Description, Category, Risk Level, Impact, and Likelihood)');
      return;
    }

    try {
      setCreating(true);
      console.log('Creating risk with data:', formData);
      const response = await fetch(`/api/risks/${useCaseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const newRisk = await response.json();
        console.log('Risk created successfully:', newRisk);
        setRisks([...risks, newRisk]);
        setCreatingRisk(false);
        setFormData({});
      } else {
        const errorText = await response.text();
        console.error('API error creating risk:', errorText);
        alert(`Failed to create risk: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error creating risk:', error);
      alert(`Error creating risk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateRisk = async (riskId: string) => {
    try {
      const response = await fetch(`/api/risks/${useCaseId}/${riskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const updatedRisk = await response.json();
        setRisks(risks.map(r => r.id === riskId ? updatedRisk : r));
        setEditingRisk(null);
        setFormData({});
      }
    } catch (error) {
      console.error('Error updating risk:', error);
    }
  };

  const handleCloseRisk = async (riskId: string, closureReason: string) => {
    try {
      const response = await fetch(`/api/risks/${useCaseId}/${riskId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closureReason })
      });
      
      if (response.ok) {
        const updatedRisk = await response.json();
        setRisks(risks.map(r => r.id === riskId ? updatedRisk : r));
      }
    } catch (error) {
      console.error('Error closing risk:', error);
    }
  };

  const getRiskIcon = (category: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      technical: <Shield className="h-4 w-4" />,
      business: <AlertTriangle className="h-4 w-4" />,
      data: <Shield className="h-4 w-4" />,
      ethical: <AlertTriangle className="h-4 w-4" />,
      operational: <Clock className="h-4 w-4" />,
      regulatory: <Shield className="h-4 w-4" />
    };
    return icons[category] || <AlertTriangle className="h-4 w-4" />;
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS': return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
      case 'MITIGATED': return 'bg-green-100 text-green-800';
      case 'ACCEPTED': return 'bg-purple-100 text-purple-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400" />
        <span className="ml-2 text-lg text-gray-600">Loading risk data...</span>
      </div>
    );
  }

  const openRisks = risks.filter(r => r.status === 'OPEN').length;
  const inProgressRisks = risks.filter(r => r.status === 'IN_PROGRESS').length;
  const mitigatedRisks = risks.filter(r => r.status === 'MITIGATED').length;
  const closedRisks = risks.filter(r => r.status === 'CLOSED').length;

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
          <Link href={(searchParams.get('from') === 'risks') ? '/dashboard/risks' : (searchParams.get('from') === 'governance') ? '/dashboard/governance' : '/dashboard'}>
                <Button variant="outline" size="sm" className="text-dark">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {(searchParams.get('from') === 'risks') ? 'Back to Risk Management' : (searchParams.get('from') === 'governance') ? 'Back to Governance' : 'Back to Use Cases'}
                </Button>
              </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2 py-4">Risk Management</h1>
            <p className="text-gray-600">
              AIUC-{useCase?.aiucId} - {useCase?.title}
            </p>
          </div>
          <div className="flex gap-2">
            {useCase?.assessData?.stepsData && risks.length === 0 && (
              <Button
                onClick={() => autoCreateRisks(useCase.assessData.stepsData)}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={creating}
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Risks...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Generate Risks from Assessment
                  </>
                )}
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            
            <Button
              onClick={() => setCreatingRisk(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Manual Risk
            </Button>
          </div>
        </div>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Risks</p>
                <p className="text-2xl font-bold text-red-600">{openRisks}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{inProgressRisks}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-200 dark:text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mitigated</p>
                <p className="text-2xl font-bold text-green-600">{mitigatedRisks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Closed</p>
                <p className="text-2xl font-bold text-gray-600">{closedRisks}</p>
              </div>
              <X className="h-8 w-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk List */}
      <div className="space-y-4">
        {risks.map((risk) => (
          <Card key={risk.id} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer"
              onClick={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getRiskIcon(risk.category)}
                    <CardTitle className="text-lg">{risk.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className={getRiskLevelColor(risk.riskLevel)}>
                      {risk.riskLevel} Risk (Score: {risk.riskScore})
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(risk.status)}>
                      {risk.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-gray-500 capitalize">
                      {risk.category} Risk
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {expandedRisk === risk.id ? 
                    <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  }
                </div>
              </div>
            </CardHeader>
            
            {expandedRisk === risk.id && (
              <CardContent className="border-t">
                {editingRisk === risk.id ? (
                  // Edit Form
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Select
                          value={formData.status || risk.status}
                          onValueChange={(value) => setFormData({...formData, status: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="MITIGATED">Mitigated</SelectItem>
                            <SelectItem value="ACCEPTED">Accepted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Mitigation Status</label>
                        <Select
                          value={formData.mitigationStatus || risk.mitigationStatus || ''}
                          onValueChange={(value) => setFormData({...formData, mitigationStatus: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Mitigation Plan</label>
                      <Textarea
                        value={formData.mitigationPlan || risk.mitigationPlan || ''}
                        onChange={(e) => setFormData({...formData, mitigationPlan: e.target.value})}
                        rows={3}
                        placeholder="Describe the mitigation plan..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Assigned To</label>
                        <Input
                          value={formData.assignedToName || risk.assignedToName || ''}
                          onChange={(e) => setFormData({...formData, assignedToName: e.target.value})}
                          placeholder="Name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Target Date</label>
                        <Input
                          type="date"
                          value={formData.targetDate ? formData.targetDate.split('T')[0] : risk.targetDate ? new Date(risk.targetDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Notes</label>
                      <Textarea
                        value={formData.notes || risk.notes || ''}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        rows={2}
                        placeholder="Additional notes..."
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingRisk(null);
                          setFormData({});
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => handleUpdateRisk(risk.id)}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium mb-1">Description</h4>
                      <p className="text-gray-600">{risk.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-1">Impact</h4>
                        <p className="text-gray-600">{risk.impact}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Likelihood</h4>
                        <p className="text-gray-600">{risk.likelihood}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Created by:</span>{' '}
                        {risk.createdByName} on {formatDate(risk.createdAt)}
                      </div>
                      {risk.assignedToName && (
                        <div>
                          <span className="text-gray-500">Assigned to:</span>{' '}
                          {risk.assignedToName}
                        </div>
                      )}
                      {risk.targetDate && (
                        <div>
                          <span className="text-gray-500">Target date:</span>{' '}
                          {formatDate(risk.targetDate)}
                        </div>
                      )}
                      {risk.closedAt && (
                        <div>
                          <span className="text-gray-500">Closed on:</span>{' '}
                          {formatDate(risk.closedAt)}
                        </div>
                      )}
                    </div>

                    {risk.notes && (
                      <div>
                        <h4 className="font-medium mb-1">Notes</h4>
                        <p className="text-gray-600">{risk.notes}</p>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      {risk.status !== 'CLOSED' && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingRisk(risk.id);
                              setFormData(risk);
                            }}
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const reason = prompt('Please provide a reason for closing this risk:');
                              if (reason) {
                                handleCloseRisk(risk.id, reason);
                              }
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Close Risk
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete "${risk.title}"? This action cannot be undone.`)) {
                                try {
                                  const response = await fetch(`/api/risks/${useCaseId}/${risk.id}`, {
                                    method: 'DELETE'
                                  });
                                  if (response.ok) {
                                    alert('Risk deleted successfully');
                                    fetchData();
                                  } else {
                                    alert('Failed to delete risk');
                                  }
                                } catch (error) {
                                  console.error('Error deleting risk:', error);
                                  alert('Error deleting risk');
                                }
                              }
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Create Risk Modal */}
      {creatingRisk && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Risk</CardTitle>
              <CardDescription>Add a manual risk entry for this use case</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Risk title"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description <span className="text-red-500">*</span></label>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    placeholder="Describe the risk..."
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category <span className="text-red-500">*</span></label>
                    <Select
                      value={formData.category || ''}
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="data">Data Privacy</SelectItem>
                        <SelectItem value="ethical">Ethical</SelectItem>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="regulatory">Regulatory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Risk Level <span className="text-red-500">*</span></label>
                    <Select
                      value={formData.riskLevel || ''}
                      onValueChange={(value) => setFormData({...formData, riskLevel: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Impact <span className="text-red-500">*</span></label>
                    <Input
                      value={formData.impact || ''}
                      onChange={(e) => setFormData({...formData, impact: e.target.value})}
                      placeholder="Describe impact"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Likelihood <span className="text-red-500">*</span></label>
                    <Input
                      value={formData.likelihood || ''}
                      onChange={(e) => setFormData({...formData, likelihood: e.target.value})}
                      placeholder="Describe likelihood"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="text-dark"
                    onClick={() => {
                      setCreatingRisk(false);
                      setFormData({});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRisk} disabled={creating}>
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Risk'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}