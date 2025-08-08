'use client';
import React, { useState, useEffect } from 'react';
import { Eye, Grid, RefreshCw, AlertTriangle, TrendingUp, Shield, BarChart3, PieChart, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RiskMetrics {
  totalRisks: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  averageRiskScore: number;
  riskDistribution: {
    technical: number;
    business: number;
    data: number;
    ethical: number;
  };
  topRiskCategories: string[];
  recentIncidents: number;
  complianceScore: number;
}

interface ExecutiveViewProps {
  riskData: RiskMetrics;
}

const HybridRiskDashboard: React.FC = () => {
  const [view, setView] = useState<'executive' | 'detailed'>('executive');
  const [riskData, setRiskData] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[Risk Dashboard] Fetching risk metrics...');
      const response = await fetch('/api/risk-metrics');
      
      console.log('[Risk Dashboard] Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[Risk Dashboard] API Error:', errorData);
        
        if (response.status === 401) {
          throw new Error('Authentication required. Please sign in again.');
        } else if (response.status === 404) {
          throw new Error('User not found in database. Please contact support.');
        } else {
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
      }
      
      const data = await response.json();
      console.log('[Risk Dashboard] Received data:', data);
      setRiskData(data);
    } catch (err) {
      console.error('[Risk Dashboard] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    try {
      console.log('[Risk Dashboard] Testing authentication...');
      const response = await fetch('/api/test-auth');
      const data = await response.json();
      console.log('[Risk Dashboard] Auth test result:', data);
      
      if (response.ok) {
        alert('Authentication is working! User: ' + data.user.email);
      } else {
        alert('Authentication failed: ' + data.error);
      }
    } catch (err) {
      console.error('[Risk Dashboard] Auth test error:', err);
      alert('Auth test failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="text-center">
          <div className="loading-spinner" />
          <p className="loading-text">Loading risk metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <AlertTriangle className="error-icon" />
          <h2 className="error-title">Unable to Load Risk Dashboard</h2>
          <p className="error-message">{error}</p>
          <button 
            onClick={fetchRiskData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!riskData) {
    return (
      <div className="error-container">
        <div className="error-card">
          <AlertTriangle className="error-icon" />
          <p className="error-message">No risk data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <div className="page-container">
        {/* Controls */}
        <div className="flex justify-end items-center gap-3 mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('executive')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                view === 'executive' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Executive View
            </button>
            <button
              onClick={() => setView('detailed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                view === 'detailed' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4 inline mr-2" />
              Detailed Analysis
            </button>
          </div>
          <button 
            onClick={fetchRiskData}
            className="btn-outline flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button 
            onClick={testAuth}
            className="btn-outline flex items-center gap-2"
          >
            Test Auth
          </button>
        </div>

        {/* Main Content */}
        {view === 'executive' ? (
          <ExecutiveView riskData={riskData} />
        ) : (
          <DetailedView riskData={riskData} />
        )}
      </div>
    </div>
  );
};

// Executive View Component
const ExecutiveView: React.FC<ExecutiveViewProps> = ({ riskData }) => (
  <div className="space-y-8">
    {/* Header */}
    <div className="page-header">
      <h1 className="page-title">Risk Management Dashboard</h1>
      <p className="page-subtitle">Comprehensive risk assessment and monitoring across all AI use cases</p>
    </div>

    {/* KPI Cards */}
    <section className="grid-standard">
      <div className="card-standard p-7 flex flex-col items-start">
        <span className="text-base font-medium text-gray-500 mb-1">Total Risks</span>
        <span className="font-extrabold text-gray-900 text-3xl md:text-4xl lg:text-5xl">{riskData.totalRisks}</span>
      </div>
      <div className="card-standard p-7 flex flex-col items-start">
        <span className="text-base font-medium text-gray-500 mb-1">High Risk</span>
        <span className="font-extrabold text-red-600 text-3xl md:text-4xl lg:text-5xl">{riskData.highRiskCount}</span>
      </div>
      <div className="card-standard p-7 flex flex-col items-start">
        <span className="text-base font-medium text-gray-500 mb-1">Medium Risk</span>
        <span className="font-extrabold text-yellow-600 text-3xl md:text-4xl lg:text-5xl">{riskData.mediumRiskCount}</span>
      </div>
      <div className="card-standard p-7 flex flex-col items-start">
        <span className="text-base font-medium text-gray-500 mb-1">Low Risk</span>
        <span className="font-extrabold text-green-600 text-3xl md:text-4xl lg:text-5xl">{riskData.lowRiskCount}</span>
      </div>
    </section>

    {/* Risk Distribution */}
    <section className="section-spacing">
      <div className="section-header">
        <div className="section-accent" />
        <h2 className="section-title">Risk Distribution</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-standard p-7">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Categories</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Technical Risks</span>
              <span className="text-sm font-semibold text-gray-900">{riskData.riskDistribution.technical}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Business Risks</span>
              <span className="text-sm font-semibold text-gray-900">{riskData.riskDistribution.business}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Data Risks</span>
              <span className="text-sm font-semibold text-gray-900">{riskData.riskDistribution.data}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Ethical Risks</span>
              <span className="text-sm font-semibold text-gray-900">{riskData.riskDistribution.ethical}</span>
            </div>
          </div>
        </div>
        <div className="card-standard p-7">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Average Risk Score</span>
              <span className="text-sm font-semibold text-gray-900">{(riskData.averageRiskScore || 0).toFixed(1)}/10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Compliance Score</span>
              <span className="text-sm font-semibold text-gray-900">{riskData.complianceScore}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Recent Incidents</span>
              <span className="text-sm font-semibold text-gray-900">{riskData.recentIncidents}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Top Risk Categories */}
    <section className="section-spacing">
      <div className="section-header">
        <div className="section-accent" />
        <h2 className="section-title">Top Risk Categories</h2>
      </div>
      <div className="card-standard p-7">
        <div className="space-y-3">
          {riskData.topRiskCategories.map((category, index) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{category}</span>
              <span className="text-sm font-semibold text-gray-900">#{index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

// Detailed View Component
const DetailedView: React.FC<ExecutiveViewProps> = ({ riskData }) => (
  <div className="space-y-8">
    {/* Header */}
    <div className="page-header">
      <h1 className="page-title">Detailed Risk Analysis</h1>
      <p className="page-subtitle">Comprehensive risk assessment with detailed metrics and trends</p>
    </div>

    {/* Detailed Metrics */}
    <section className="grid-standard">
      <div className="card-standard p-7">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 p-2 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">High Priority Risks</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">Critical risks requiring immediate attention</p>
        <div className="text-2xl font-bold text-red-600">{riskData.highRiskCount}</div>
      </div>

      <div className="card-standard p-7">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Medium Priority Risks</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">Risks requiring monitoring and mitigation</p>
        <div className="text-2xl font-bold text-yellow-600">{riskData.mediumRiskCount}</div>
      </div>

      <div className="card-standard p-7">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-2 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Low Priority Risks</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">Risks under control and monitoring</p>
        <div className="text-2xl font-bold text-green-600">{riskData.lowRiskCount}</div>
      </div>

      <div className="card-standard p-7">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Average Risk Score</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">Overall risk assessment score</p>
        <div className="text-2xl font-bold text-blue-600">{(riskData.averageRiskScore || 0).toFixed(1)}/10</div>
      </div>
    </section>

    {/* Risk Distribution Charts */}
    <section className="section-spacing">
      <div className="section-header">
        <div className="section-accent" />
        <h2 className="section-title">Risk Distribution Analysis</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-standard p-7">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Categories Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-red-700">Technical Risks</span>
              <span className="text-sm font-semibold text-red-800">{riskData.riskDistribution.technical}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-yellow-700">Business Risks</span>
              <span className="text-sm font-semibold text-yellow-800">{riskData.riskDistribution.business}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-700">Data Risks</span>
              <span className="text-sm font-semibold text-blue-800">{riskData.riskDistribution.data}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-purple-700">Ethical Risks</span>
              <span className="text-sm font-semibold text-purple-800">{riskData.riskDistribution.ethical}</span>
            </div>
          </div>
        </div>
        <div className="card-standard p-7">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Compliance Score</span>
              <span className="text-sm font-semibold text-gray-900">{riskData.complianceScore}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Recent Incidents</span>
              <span className="text-sm font-semibold text-gray-900">{riskData.recentIncidents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total Risks</span>
              <span className="text-sm font-semibold text-gray-900">{riskData.totalRisks}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default HybridRiskDashboard;