'use client';
import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, Clock, RefreshCw, TrendingUp, FileText, Users, Globe, Building } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface GovernanceData {
  id: string;
  useCaseId: string;
  useCaseTitle: string;
  aiucId: string;
  framework: string;
  complianceScore: number;
  status: 'completed' | 'in-progress' | 'not-started';
  lastUpdated: string;
  requirements: {
    total: number;
    completed: number;
    pending: number;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  businessFunction: string;
  owner: string;
}

export default function GovernancePage() {
  const [governanceData, setGovernanceData] = useState<GovernanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGovernanceData();
  }, []);

  const fetchGovernanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/governance-data');
      if (!response.ok) {
        throw new Error('Failed to fetch governance data');
      }
      const data = await response.json();
      setGovernanceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGovernanceData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="text-center">
          <div className="loading-spinner" />
          <p className="loading-text">Loading governance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <AlertTriangle className="error-icon" />
          <h2 className="error-title">Unable to Load Governance Data</h2>
          <p className="error-message">{error}</p>
          <button 
            onClick={fetchGovernanceData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrameworkIcon = (framework: string) => {
    switch (framework.toLowerCase()) {
      case 'eu ai act':
        return <Globe className="w-4 h-4" />;
      case 'iso 42001':
        return <FileText className="w-4 h-4" />;
      case 'gdpr':
        return <Shield className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  return (
    <div className="page-layout">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Governance</h1>
              <p className="page-subtitle">Regulatory frameworks and industry standards for AI systems</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm" 
                disabled={refreshing}
                className="btn-outline flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              {refreshing && (
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Updating progress...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <section className="grid-standard">
          <div className="card-standard p-7 flex flex-col items-start">
            <span className="text-base font-medium text-gray-500 mb-1">Total Assessments</span>
            <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{governanceData.length}</span>
          </div>
          <div className="card-standard p-7 flex flex-col items-start">
            <span className="text-base font-medium text-gray-500 mb-1">Completed</span>
            <span className="font-extrabold text-green-600 text-3xl md:text-4xl lg:text-5xl">
              {governanceData.filter(item => item.status === 'completed').length}
            </span>
          </div>
          <div className="card-standard p-7 flex flex-col items-start">
            <span className="text-base font-medium text-gray-500 mb-1">In Progress</span>
            <span className="font-extrabold text-yellow-600 text-3xl md:text-4xl lg:text-5xl">
              {governanceData.filter(item => item.status === 'in-progress').length}
            </span>
          </div>
          <div className="card-standard p-7 flex flex-col items-start">
            <span className="text-base font-medium text-gray-500 mb-1">Avg Compliance</span>
            <span className="font-extrabold text-blue-600 text-3xl md:text-4xl lg:text-5xl">
              {governanceData.length > 0 
                ? Math.round(governanceData.reduce((sum, item) => sum + item.complianceScore, 0) / governanceData.length)
                : 0}%
            </span>
          </div>
        </section>

        {/* Use Case Cards */}
        <section className="section-spacing">
          <div className="section-header">
            <div className="section-accent" />
            <h2 className="section-title">Governance Assessments</h2>
          </div>
          <div className="space-y-4">
            {governanceData.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Applied Governance Found</h2>
                <p className="text-gray-500 mb-6">
                  Governance assessments will appear here once use cases are evaluated against regulatory frameworks.
                </p>
                <Button className="btn-primary">
                  Start Assessment
                </Button>
              </div>
            ) : (
              governanceData.map((item) => (
                <Card key={item.id} className="card-interactive p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {getFrameworkIcon(item.framework)}
                          <span className="text-sm font-medium text-gray-600">{item.framework}</span>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {item.status === 'in-progress' && <Clock className="w-3 h-3 mr-1" />}
                          {item.status === 'not-started' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {item.status.replace('-', ' ')}
                        </Badge>
                        <Badge className={getRiskLevelColor(item.riskLevel)}>
                          {item.riskLevel} risk
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <div className="font-mono text-sm text-gray-500 mb-1">AIUC-{item.aiucId}</div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.useCaseTitle}</h3>
                        <p className="text-sm text-gray-600">{item.businessFunction} • {item.owner}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{item.complianceScore}%</div>
                      <div className="text-sm text-gray-500">Compliance</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Requirements Progress</span>
                      <span className="font-medium text-gray-900">
                        {item.requirements.completed}/{item.requirements.total}
                      </span>
                    </div>
                    <Progress 
                      value={(item.requirements.completed / item.requirements.total) * 100} 
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Last updated: {item.lastUpdated}</span>
                      <span>{item.requirements.pending} pending</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Framework Distribution */}
        {governanceData.length > 0 && (
          <section className="section-spacing">
            <div className="section-header">
              <div className="section-accent" />
              <h2 className="section-title">Framework Distribution</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card-standard p-7">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Framework Coverage</h3>
                <div className="space-y-4">
                  {Array.from(new Set(governanceData.map(item => item.framework))).map((framework) => {
                    const count = governanceData.filter(item => item.framework === framework).length;
                    const completed = governanceData.filter(item => item.framework === framework && item.status === 'completed').length;
                    return (
                      <div key={framework} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getFrameworkIcon(framework)}
                          <span className="text-sm font-medium text-gray-700">{framework}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">{count} assessments</div>
                          <div className="text-xs text-gray-500">{completed} completed</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="card-standard p-7">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h3>
                <div className="space-y-4">
                  {['critical', 'high', 'medium', 'low'].map((level) => {
                    const count = governanceData.filter(item => item.riskLevel === level).length;
                    return (
                      <div key={level} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            level === 'critical' ? 'bg-red-500' :
                            level === 'high' ? 'bg-orange-500' :
                            level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <span className="text-sm font-medium text-gray-700 capitalize">{level} Risk</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}