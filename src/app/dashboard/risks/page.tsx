"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, AlertTriangle, AlertCircle, CheckCircle, 
  TrendingUp, TrendingDown, Activity, BarChart3,
  Calendar, Clock, Users, FileText, ChevronRight,
  Download, Filter, RefreshCw, Info, Sparkles,
  Calculator, Eye, Grid, LineChart, Loader2
} from 'lucide-react';

// --- Types ---
interface RiskMetrics {
  portfolio: {
    totalUseCases: number;
    portfolioValue: number;
    activeProjects: number;
    overallRiskScore: number;
  };
  riskDistribution: {
    Low: number;
    Medium: number;
    High: number;
    Critical: number;
  };
  riskCategories: {
    technical: { Low: number; Medium: number; High: number; Critical: number };
    business: { Low: number; Medium: number; High: number; Critical: number };
    data: { Low: number; Medium: number; High: number; Critical: number };
    ethical: { Low: number; Medium: number; High: number; Critical: number };
    operational: { Low: number; Medium: number; High: number; Critical: number };
    regulatory: { Low: number; Medium: number; High: number; Critical: number };
  };
  approvalStatus: {
    totalWithApprovals: number;
    governance: { approved: number; pending: number; rejected: number };
    risk: { approved: number; pending: number; rejected: number };
    legal: { approved: number; pending: number; rejected: number };
    business: { approved: number; pending: number; rejected: number };
  };
  complianceMetrics: {
    overallScore: number;
    criticalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
  };
  useCaseRiskDetails: Array<{
    id: string;
    title: string;
    stage: string;
    businessFunction: string;
    priority: string;
    overallRiskScore: number;
    overallRiskLevel: string;
    riskCategories: Record<string, any>;
    portfolioValue: number;
    hasApproval: boolean;
    approvalStatuses: any;
  }>;
}

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'orange' | 'green' | 'red';
}

interface ExecutiveViewProps {
  riskData: RiskMetrics;
}

interface DetailedViewProps {
  riskData: RiskMetrics;
}

// Main Risk Dashboard Component
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
      setError(null);
      const response = await fetch('/api/risk-metrics');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch risk metrics');
      }
      
      const data = await response.json();
      setRiskData(data);
    } catch (error) {
      console.error('Error fetching risk metrics:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#5b5be6] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading risk analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Risk Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchRiskData}
            className="px-4 py-2 bg-[#5b5be6] text-white rounded-lg hover:bg-[#4a4ac7] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!riskData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">No risk data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Risk Intelligence Platform</h1>
              <p className="text-sm text-gray-600 mt-1">Portfolio Risk Analysis</p>
            </div>
            <div className="flex items-center gap-3">
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
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
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
const ExecutiveView: React.FC<ExecutiveViewProps> = ({ riskData }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Portfolio Value"
          value={formatCurrency(riskData.portfolio.portfolioValue)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
        />
        <KPICard
          title="Risk Score"
          value={`${riskData.portfolio.overallRiskScore}/25`}
          subtitle={`${riskData.portfolio.totalUseCases} use cases assessed`}
          icon={<Shield className="w-5 h-5" />}
          color="orange"
        />
        <KPICard
          title="Compliance"
          value={`${riskData.complianceMetrics.overallScore}%`}
          subtitle={`${riskData.approvalStatus.totalWithApprovals} cases with approvals`}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <KPICard
          title="Critical Risks"
          value={riskData.complianceMetrics.criticalRisks}
          subtitle={`${riskData.complianceMetrics.highRisks} high, ${riskData.complianceMetrics.mediumRisks} medium`}
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Risk Distribution and Use Case List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskDistributionChart riskData={riskData} />
        <TopRiskUseCases useCases={riskData.useCaseRiskDetails.slice(0, 5)} />
      </div>

      {/* Risk Category Analysis and Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskCategoryChart riskData={riskData} />
        <ApprovalStatusCard riskData={riskData} />
      </div>
    </div>
  );
};

// Detailed View Component
const DetailedView: React.FC<DetailedViewProps> = ({ riskData }) => {
  return (
    <div className="space-y-6">
      {/* Detailed Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskCategoryBreakdown riskData={riskData} />
        <UseCaseRiskTable useCases={riskData.useCaseRiskDetails} />
      </div>

      {/* Approval and Compliance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetailedApprovalMatrix riskData={riskData} />
        <RiskActionItems riskData={riskData} />
      </div>
    </div>
  );
};

// KPI Card Component
const KPICard: React.FC<KPICardProps> = ({ title, value, trend, subtitle, icon, color }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-sm mt-2 ${
              trend === 'improving' || String(trend).includes('+') ? 'text-green-600' : 
              trend === 'worsening' || String(trend).includes('-') ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Risk Distribution Chart
const RiskDistributionChart: React.FC<{ riskData: RiskMetrics }> = ({ riskData }) => {
  const total = Object.values(riskData.riskDistribution).reduce((sum, count) => sum + count, 0);
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
      <div className="space-y-4">
        {Object.entries(riskData.riskDistribution).map(([level, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const color = level === 'Critical' ? 'bg-red-500' :
                       level === 'High' ? 'bg-orange-500' :
                       level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500';
          
          return (
            <div key={level} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${color}`}></div>
                <span className="font-medium">{level} Risk</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-8">{count}</span>
              </div>
            </div>
          );
        })}
      </div>
      {total === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No risk assessments available</p>
        </div>
      )}
    </div>
  );
};

// Top Risk Use Cases
const TopRiskUseCases: React.FC<{ useCases: any[] }> = ({ useCases }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        Highest Risk Use Cases
      </h3>
      <div className="space-y-3">
        {useCases.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No use cases with risk assessments</p>
          </div>
        ) : (
          useCases.map((useCase, index) => (
            <div key={useCase.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                useCase.overallRiskLevel === 'Critical' ? 'bg-red-500' :
                useCase.overallRiskLevel === 'High' ? 'bg-orange-500' :
                useCase.overallRiskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">{useCase.title}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {useCase.businessFunction} • {useCase.stage} • Risk Score: {useCase.overallRiskScore.toFixed(1)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Risk Category Chart
const RiskCategoryChart: React.FC<{ riskData: RiskMetrics }> = ({ riskData }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Risk by Category</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(riskData.riskCategories).map(([category, risks]) => {
          const total = Object.values(risks).reduce((sum, count) => sum + count, 0);
          const highRisk = risks.High + risks.Critical;
          
          return (
            <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 capitalize mb-2">
                {category.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-600">
                {highRisk > 0 ? `${highRisk} high/critical` : 'All low risk'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Approval Status Card
const ApprovalStatusCard: React.FC<{ riskData: RiskMetrics }> = ({ riskData }) => {
  const { approvalStatus } = riskData;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Approval Status Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Governance</span>
            <div className="flex space-x-2">
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                ✓ {approvalStatus.governance.approved}
              </span>
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                ⏳ {approvalStatus.governance.pending}
              </span>
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                ✗ {approvalStatus.governance.rejected}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Risk</span>
            <div className="flex space-x-2">
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                ✓ {approvalStatus.risk.approved}
              </span>
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                ⏳ {approvalStatus.risk.pending}
              </span>
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                ✗ {approvalStatus.risk.rejected}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Legal</span>
            <div className="flex space-x-2">
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                ✓ {approvalStatus.legal.approved}
              </span>
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                ⏳ {approvalStatus.legal.pending}
              </span>
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                ✗ {approvalStatus.legal.rejected}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Business</span>
            <div className="flex space-x-2">
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                ✓ {approvalStatus.business.approved}
              </span>
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                ⏳ {approvalStatus.business.pending}
              </span>
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                ✗ {approvalStatus.business.rejected}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Risk Category Breakdown for Detailed View
const RiskCategoryBreakdown: React.FC<{ riskData: RiskMetrics }> = ({ riskData }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Risk Category Breakdown</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Low</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Medium</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">High</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Critical</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(riskData.riskCategories).map(([category, risks]) => (
              <tr key={category} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                    {risks.Low}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                    {risks.Medium}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-800 text-sm font-medium">
                    {risks.High}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                    {risks.Critical}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Use Case Risk Table
const UseCaseRiskTable: React.FC<{ useCases: any[] }> = ({ useCases }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Use Case Risk Details</h3>
      <div className="overflow-x-auto max-h-96">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Use Case</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Risk Score</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Level</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Stage</th>
            </tr>
          </thead>
          <tbody>
            {useCases.map((useCase) => (
              <tr key={useCase.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-sm">{useCase.title}</p>
                    <p className="text-xs text-gray-500">{useCase.businessFunction}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="font-bold">{useCase.overallRiskScore.toFixed(1)}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    useCase.overallRiskLevel === 'Critical' ? 'bg-red-100 text-red-700' :
                    useCase.overallRiskLevel === 'High' ? 'bg-orange-100 text-orange-700' :
                    useCase.overallRiskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {useCase.overallRiskLevel}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-sm">
                  {useCase.stage?.replace('-', ' ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {useCases.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No use cases with risk assessments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Detailed Approval Matrix
const DetailedApprovalMatrix: React.FC<{ riskData: RiskMetrics }> = ({ riskData }) => {
  const approvalTypes = ['governance', 'risk', 'legal', 'business'] as const;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Approval Status Matrix</h3>
      <div className="space-y-4">
        {approvalTypes.map(type => {
          const data = riskData.approvalStatus[type];
          const total = data.approved + data.pending + data.rejected;
          
          return (
            <div key={type} className="border rounded-lg">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold capitalize">{type}</h4>
                  <span className="text-sm font-medium">{total} total</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="flex h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-600 transition-all duration-500"
                      style={{ width: total > 0 ? `${(data.approved / total) * 100}%` : '0%' }}
                    />
                    <div 
                      className="bg-yellow-500 transition-all duration-500"
                      style={{ width: total > 0 ? `${(data.pending / total) * 100}%` : '0%' }}
                    />
                    <div 
                      className="bg-red-500 transition-all duration-500"
                      style={{ width: total > 0 ? `${(data.rejected / total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">{data.approved}</div>
                    <div className="text-xs text-gray-500">Approved</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-600">{data.pending}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">{data.rejected}</div>
                    <div className="text-xs text-gray-500">Rejected</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Risk Action Items
const RiskActionItems: React.FC<{ riskData: RiskMetrics }> = ({ riskData }) => {
  const criticalUseCases = riskData.useCaseRiskDetails.filter(uc => uc.overallRiskLevel === 'Critical');
  const highRiskUseCases = riskData.useCaseRiskDetails.filter(uc => uc.overallRiskLevel === 'High');
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        Recommended Actions
      </h3>
      <div className="space-y-3">
        {criticalUseCases.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Critical Priority</h4>
            <p className="text-sm text-red-700">
              {criticalUseCases.length} use case(s) require immediate risk mitigation
            </p>
            <ul className="mt-2 space-y-1">
              {criticalUseCases.slice(0, 3).map(uc => (
                <li key={uc.id} className="text-xs text-red-600">• {uc.title}</li>
              ))}
            </ul>
          </div>
        )}
        
        {highRiskUseCases.length > 0 && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-2">High Priority</h4>
            <p className="text-sm text-orange-700">
              {highRiskUseCases.length} use case(s) need risk assessment review
            </p>
          </div>
        )}
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Approval Process</h4>
          <p className="text-sm text-blue-700">
            {riskData.portfolio.totalUseCases - riskData.approvalStatus.totalWithApprovals} use cases pending approval workflow
          </p>
        </div>
      </div>
    </div>
  );
};

export default HybridRiskDashboard;