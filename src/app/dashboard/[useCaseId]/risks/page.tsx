"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, AlertTriangle, AlertCircle, CheckCircle, 
  TrendingUp, TrendingDown, Activity, BarChart3,
  Calendar, Clock, Users, FileText, ChevronRight,
  Download, Filter, RefreshCw, Info, Sparkles,
  Calculator, Eye, Grid, LineChart
} from 'lucide-react';

// --- Types ---
interface RiskDimension {
  score: number;
  trend: 'improving' | 'worsening' | 'stable';
  impact: 'critical' | 'high' | 'medium' | 'low';
}

interface RiskData {
  projectName: string;
  overallScore: number;
  riskTier: string;
  trend: string;
  dimensions: Record<string, RiskDimension>;
  impactIndex: number;
  feasibility: number;
  portfolioValue: string;
  activeProjects: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  complianceScore: number;
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
  riskData: RiskData;
}

interface DetailedViewProps {
  riskData: RiskData;
}

interface RiskTrendChartProps {
  dimensions: Record<string, RiskDimension>;
}

interface EnhancedRiskRadarProps {
  dimensions: Record<string, RiskDimension>;
}

interface RiskBreakdownTableProps {
  dimensions: Record<string, RiskDimension>;
}

interface RiskFactorsAnalysisProps {
  dimensions: Record<string, RiskDimension>;
}

interface RiskCalculatorModalProps {
  onClose: () => void;
}

// Main Hybrid Dashboard Component
const HybridRiskDashboard: React.FC = () => {
  const [view, setView] = useState<'executive' | 'detailed'>('executive');
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    // Simulate data fetch
    setTimeout(() => {
      setRiskData({
        projectName: 'Credit Card Fraud Detection System',
        overallScore: 6.4,
        riskTier: 'high',
        trend: 'improving',
        dimensions: {
          dataPrivacy: { score: 7.5, trend: 'stable', impact: 'high' },
          security: { score: 5.2, trend: 'improving', impact: 'medium' },
          regulatory: { score: 8.3, trend: 'worsening', impact: 'critical' },
          ethical: { score: 4.8, trend: 'stable', impact: 'medium' },
          operational: { score: 6.9, trend: 'improving', impact: 'high' },
          reputational: { score: 5.5, trend: 'stable', impact: 'medium' }
        },
        impactIndex: 3.2,
        feasibility: 7.1,
        portfolioValue: '$24.5M',
        activeProjects: 12,
        criticalRisks: 2,
        highRisks: 5,
        mediumRisks: 8,
        complianceScore: 68
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading || !riskData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Analyzing risk data...</p>
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
              <p className="text-sm text-gray-600 mt-1">{riskData.projectName}</p>
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
                onClick={() => setShowCalculator(!showCalculator)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Risk Calculator
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
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

      {/* Risk Calculator Modal */}
      {showCalculator && (
        <RiskCalculatorModal onClose={() => setShowCalculator(false)} />
      )}
    </div>
  );
};

// Executive View Component
const ExecutiveView: React.FC<ExecutiveViewProps> = ({ riskData }) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Portfolio Value"
          value={riskData.portfolioValue}
          trend="+12%"
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
        />
        <KPICard
          title="Risk Score"
          value={`${riskData.overallScore}/10`}
          trend={riskData.trend}
          icon={<Shield className="w-5 h-5" />}
          color="orange"
        />
        <KPICard
          title="Compliance"
          value={`${riskData.complianceScore}%`}
          trend="+5%"
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <KPICard
          title="Critical Risks"
          value={riskData.criticalRisks}
          subtitle={`${riskData.highRisks} high, ${riskData.mediumRisks} medium`}
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Main Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioBubbleChart />
        <RiskTrendChart dimensions={riskData.dimensions} />
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ExecutiveSummaryCard riskData={riskData} />
        <TopRisksCard />
        <ActionItemsCard />
      </div>
    </div>
  );
};

// Detailed View Component
const DetailedView: React.FC<DetailedViewProps> = ({ riskData }) => {
  return (
    <div className="space-y-6">
      {/* Detailed Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnhancedRiskRadar dimensions={riskData.dimensions} />
        <RiskBreakdownTable dimensions={riskData.dimensions} />
      </div>

      {/* Compliance and Mitigation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetailedComplianceMatrix />
        <MitigationRoadmap />
      </div>

      {/* Risk Factors Analysis */}
      <RiskFactorsAnalysis dimensions={riskData.dimensions} />
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

// Portfolio Bubble Chart Component
const PortfolioBubbleChart: React.FC = () => {
  const projects = [
    { name: 'Fraud Detection', x: 70, y: 80, size: 60, risk: 'high', value: '$3.2M' },
    { name: 'Customer Churn', x: 80, y: 60, size: 40, risk: 'medium', value: '$2.1M' },
    { name: 'Price Optimization', x: 50, y: 90, size: 80, risk: 'high', value: '$4.5M' },
    { name: 'Chatbot Support', x: 90, y: 40, size: 30, risk: 'low', value: '$1.8M' },
    { name: 'Inventory AI', x: 60, y: 70, size: 50, risk: 'medium', value: '$2.8M' },
    { name: 'Risk Scoring', x: 40, y: 85, size: 70, risk: 'critical', value: '$3.9M' }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'rgba(239, 68, 68, 0.7)';
      case 'high': return 'rgba(251, 146, 60, 0.7)';
      case 'medium': return 'rgba(250, 204, 21, 0.7)';
      case 'low': return 'rgba(34, 197, 94, 0.7)';
      default: return 'rgba(107, 114, 128, 0.7)';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Portfolio Risk vs Value Analysis</h3>
      <div className="relative h-96 bg-gray-50 rounded-lg">
        <div className="absolute inset-0 p-4">
          {/* Axis labels */}
          <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm text-gray-600">
            Feasibility →
          </span>
          <span className="absolute left-2 top-1/2 transform -rotate-90 text-sm text-gray-600">
            Business Value →
          </span>
          
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <pattern id="grid" width="10%" height="10%" patternUnits="userSpaceOnUse">
                <path d="M 0 0 L 0 100 L 100 100" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          {/* Bubbles */}
          {projects.map((project, index) => (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{
                left: `${project.x}%`,
                top: `${100 - project.y}%`,
                width: `${project.size}px`,
                height: `${project.size}px`
              }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center text-white font-semibold text-xs transition-all group-hover:scale-110"
                style={{ backgroundColor: getRiskColor(project.risk) }}
              >
                {project.name.split(' ')[0]}
              </div>
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {project.name}: {project.value}
              </div>
            </div>
          ))}
          
          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-sm p-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getRiskColor('critical') }}></div>
                <span>Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getRiskColor('high') }}></div>
                <span>High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getRiskColor('medium') }}></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getRiskColor('low') }}></div>
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Risk Trend Chart
const RiskTrendChart: React.FC<RiskTrendChartProps> = ({ dimensions }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Risk Trend Analysis</h3>
      <div className="h-96">
        <div className="relative h-full">
          {/* Simple line chart representation */}
          <div className="absolute inset-0 flex items-end justify-between px-4">
            {months.map((month, index) => (
              <div key={month} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                  style={{ height: `${50 + Math.random() * 40}%` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{month}</span>
              </div>
            ))}
          </div>
          
          {/* Overlay metrics */}
          <div className="absolute top-4 right-4 bg-white/90 rounded-lg shadow-sm p-3">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Risk decreasing</span>
              </div>
              <div className="font-semibold">-15% over 6 months</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Executive Summary Card
const ExecutiveSummaryCard: React.FC<{ riskData: RiskData }> = ({ riskData }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-600" />
        Executive Summary
      </h3>
      <div className="space-y-3 text-sm">
        <p className="text-gray-700">
          The <strong>{riskData.projectName}</strong> shows a{' '}
          <span className="text-orange-600 font-semibold">HIGH</span> overall risk score of{' '}
          <strong>{riskData.overallScore}/10</strong>.
        </p>
        <p className="text-gray-700">
          Primary concerns center on <strong>regulatory compliance</strong> (8.3/10) and{' '}
          <strong>data privacy</strong> (7.5/10). The project demonstrates strong feasibility
          but requires immediate attention to compliance gaps.
        </p>
        <div className="pt-3 border-t">
          <p className="font-semibold text-gray-900">Recommendation:</p>
          <p className="text-gray-700">Proceed with enhanced compliance measures and expedited privacy assessment.</p>
        </div>
      </div>
    </div>
  );
};

// Top Risks Card
const TopRisksCard: React.FC = () => {
  const risks = [
    { title: 'GDPR Non-compliance', severity: 'critical', impact: 'Up to 4% global revenue' },
    { title: 'API Security Gaps', severity: 'high', impact: 'Data breach risk' },
    { title: 'Model Explainability', severity: 'high', impact: 'Regulatory scrutiny' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        Top Risks
      </h3>
      <div className="space-y-3">
        {risks.map((risk, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
              risk.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'
            }`}></div>
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900">{risk.title}</p>
              <p className="text-xs text-gray-600 mt-1">{risk.impact}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Action Items Card
const ActionItemsCard: React.FC = () => {
  const actions = [
    { task: 'Complete Privacy Impact Assessment', due: '2 weeks', owner: 'Legal Team' },
    { task: 'Implement API Authentication', due: '1 week', owner: 'Security Team' },
    { task: 'Deploy Encryption Layer', due: '3 days', owner: 'DevOps' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        Immediate Actions
      </h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900">{action.task}</p>
              <p className="text-xs text-gray-600 mt-1">{action.owner}</p>
            </div>
            <span className="text-xs text-blue-600 font-medium">{action.due}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Risk Radar for Detailed View
const EnhancedRiskRadar: React.FC<EnhancedRiskRadarProps> = ({ dimensions }) => {
  const center = 150;
  const radius = 100;
  const angleStep = (2 * Math.PI) / 6;
  
  const dimensionNames = Object.keys(dimensions);
  const points = dimensionNames.map((_, index) => {
    const angle = index * angleStep - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  });

  const dataPoints = dimensionNames.map((dim, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const value = dimensions[dim].score / 10;
    return {
      x: center + (radius * value) * Math.cos(angle),
      y: center + (radius * value) * Math.sin(angle),
      score: dimensions[dim].score,
      trend: dimensions[dim].trend
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Risk Dimension Radar</h3>
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Grid circles */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius * scale}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* Axes */}
        {points.map((point, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={point.x}
            y2={point.y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* Data area */}
        <polygon
          points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
        />
        
        {/* Data points with scores */}
        {dataPoints.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="8"
              fill="rgb(59, 130, 246)"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={point.x}
              y={point.y - 15}
              textAnchor="middle"
              className="text-xs font-bold fill-gray-900"
            >
              {point.score}
            </text>
          </g>
        ))}
        
        {/* Labels */}
        {dimensionNames.map((name, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = radius + 40;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-medium fill-gray-700"
            >
              {name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

// Risk Calculator Modal
const RiskCalculatorModal: React.FC<RiskCalculatorModalProps> = ({ onClose }) => {
  const [values, setValues] = useState({
    ops: 5,
    prod: 6,
    rev: 8,
    ss: 8,
    confidence: 7
  });

  const calculations = useMemo(() => {
    const povRaw = 0.35 * values.ops + 0.30 * values.prod + 0.35 * values.rev;
    const confBoost = 0.2 * (values.ss - 5);
    const learningPrem = Math.exp(-0.15 * values.ss);
    const povFinal = povRaw * ((values.confidence + confBoost) / 10) * learningPrem;
    
    return { povRaw, confBoost, learningPrem, povFinal };
  }, [values]);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Risk Score Calculator</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-4">Input Values</h3>
            {Object.entries(values).map(([key, value]) => (
              <div key={key} className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  {key.toUpperCase()} Score: {value}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={value}
                  onChange={(e) => setValues(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Calculated Results</h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">PoV Raw</p>
                <p className="text-xl font-bold">{calculations.povRaw.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Confidence Boost</p>
                <p className="text-xl font-bold">{calculations.confBoost.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Learning Premium</p>
                <p className="text-xl font-bold">{calculations.learningPrem.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Final PoV Score</p>
                <p className="text-2xl font-bold text-blue-700">{calculations.povFinal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Formula:</strong> PoV_final = PoV_raw × (Confidence + Boost) / 10 × Learning Premium
          </p>
        </div>
      </div>
    </div>
  );
};

// Risk Breakdown Table Component
const RiskBreakdownTable: React.FC<RiskBreakdownTableProps> = ({ dimensions }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Risk Dimension Breakdown</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Dimension</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Score</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Impact</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Trend</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Key Factors</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(dimensions).map(([name, data]: [string, RiskDimension]) => (
              <tr key={name} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium capitalize">
                  {name.replace(/([A-Z])/g, ' $1').trim()}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-white font-bold ${
                    data.score >= 8 ? 'bg-red-500' :
                    data.score >= 6 ? 'bg-orange-500' :
                    data.score >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                    {data.score}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    data.impact === 'critical' ? 'bg-red-100 text-red-700' :
                    data.impact === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {data.impact}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  {data.trend === 'improving' && <TrendingDown className="w-5 h-5 text-green-600 mx-auto" />}
                  {data.trend === 'worsening' && <TrendingUp className="w-5 h-5 text-red-600 mx-auto" />}
                  {data.trend === 'stable' && <Activity className="w-5 h-5 text-gray-400 mx-auto" />}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {name === 'dataPrivacy' && 'PII processing, cross-border transfers'}
                  {name === 'security' && 'Public API, cloud deployment'}
                  {name === 'regulatory' && 'GDPR, HIPAA compliance gaps'}
                  {name === 'ethical' && 'Automated decisions, bias risks'}
                  {name === 'operational' && 'System criticality, complexity'}
                  {name === 'reputational' && 'Public-facing, trust impact'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Detailed Compliance Matrix
const DetailedComplianceMatrix: React.FC = () => {
  const regulations = [
    { 
      name: 'GDPR', 
      status: 'required', 
      completion: 65, 
      modules: [
        { name: 'Data Protection by Design', status: 'in-progress', deadline: '2024-05-15' },
        { name: 'DPIA Assessment', status: 'pending', deadline: '2024-06-01' },
        { name: 'Right to Erasure', status: 'completed', deadline: '2024-04-01' },
        { name: 'Cross-border Transfers', status: 'blocked', deadline: '2024-05-30' }
      ]
    },
    { 
      name: 'HIPAA', 
      status: 'required', 
      completion: 40,
      modules: [
        { name: 'Security Rule', status: 'in-progress', deadline: '2024-07-01' },
        { name: 'Privacy Rule', status: 'pending', deadline: '2024-08-15' },
        { name: 'Breach Notification', status: 'pending', deadline: '2024-08-01' }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Compliance Status Matrix</h3>
      <div className="space-y-4">
        {regulations.map(reg => (
          <div key={reg.name} className="border rounded-lg">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold">{reg.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    reg.status === 'required' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {reg.status}
                  </span>
                </div>
                <span className="text-sm font-medium">{reg.completion}%</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${reg.completion}%` }}
                />
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {reg.modules.map((module, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {module.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {module.status === 'in-progress' && <Clock className="w-4 h-4 text-blue-600" />}
                      {module.status === 'pending' && <AlertCircle className="w-4 h-4 text-gray-400" />}
                      {module.status === 'blocked' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                      <span className={module.status === 'completed' ? 'line-through text-gray-400' : ''}>
                        {module.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(module.deadline).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mitigation Roadmap Component
const MitigationRoadmap: React.FC = () => {
  const phases = [
    {
      name: 'Immediate (0-2 weeks)',
      color: 'red',
      tasks: [
        { title: 'API Authentication Implementation', effort: '40 hours', impact: 'Critical' },
        { title: 'Data Encryption Deployment', effort: '20 hours', impact: 'High' }
      ]
    },
    {
      name: 'Short-term (2-8 weeks)',
      color: 'orange',
      tasks: [
        { title: 'Privacy Impact Assessment', effort: '80 hours', impact: 'High' },
        { title: 'GDPR Compliance Audit', effort: '120 hours', impact: 'Critical' }
      ]
    },
    {
      name: 'Long-term (2-6 months)',
      color: 'blue',
      tasks: [
        { title: 'ML Model Explainability Framework', effort: '200 hours', impact: 'Medium' },
        { title: 'Continuous Compliance Monitoring', effort: 'Ongoing', impact: 'High' }
      ]
    }
  ];

  const getPhaseColor = (color: string) => {
    switch (color) {
      case 'red': return 'border-red-500 bg-red-50';
      case 'orange': return 'border-orange-500 bg-orange-50';
      case 'blue': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Mitigation Roadmap</h3>
      <div className="space-y-4">
        {phases.map((phase, idx) => (
          <div key={idx} className={`border-l-4 rounded-lg p-4 ${getPhaseColor(phase.color)}`}>
            <h4 className="font-semibold mb-3">{phase.name}</h4>
            <div className="space-y-2">
              {phase.tasks.map((task, taskIdx) => (
                <div key={taskIdx} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-gray-600">Effort: {task.effort}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.impact === 'Critical' ? 'bg-red-100 text-red-700' :
                    task.impact === 'High' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {task.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Total Estimated Effort</p>
            <p className="text-2xl font-bold">460+ hours</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            Export to Project Plan
          </button>
        </div>
      </div>
    </div>
  );
};

// Risk Factors Analysis
const RiskFactorsAnalysis: React.FC<RiskFactorsAnalysisProps> = ({ dimensions }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Detailed Risk Factor Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(dimensions).map(([name, data]) => (
          <div key={name} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</h4>
              <span className={`text-lg font-bold ${
                data.score >= 8 ? 'text-red-600' :
                data.score >= 6 ? 'text-orange-600' :
                data.score >= 4 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {data.score}/10
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm">
                <p className="font-medium text-gray-700 mb-1">Contributing Factors:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {name === 'dataPrivacy' && (
                    <>
                      <li>• Processing sensitive PII</li>
                      <li>• Cross-border transfers</li>
                      <li>• Large data volume</li>
                    </>
                  )}
                  {name === 'security' && (
                    <>
                      <li>• Public API exposure</li>
                      <li>• Cloud deployment</li>
                      <li>• Multiple integrations</li>
                    </>
                  )}
                  {name === 'regulatory' && (
                    <>
                      <li>• GDPR compliance gaps</li>
                      <li>• Multi-jurisdiction</li>
                      <li>• AI Act requirements</li>
                    </>
                  )}
                  {name === 'ethical' && (
                    <>
                      <li>• Automated decisions</li>
                      <li>• Potential bias</li>
                      <li>• Limited explainability</li>
                    </>
                  )}
                  {name === 'operational' && (
                    <>
                      <li>• Mission critical system</li>
                      <li>• High complexity</li>
                      <li>• Limited redundancy</li>
                    </>
                  )}
                  {name === 'reputational' && (
                    <>
                      <li>• Public-facing system</li>
                      <li>• Trust-critical decisions</li>
                      <li>• Brand impact potential</li>
                    </>
                  )}
                </ul>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-gray-700">Mitigation Priority:</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className={`h-2 flex-1 rounded-full ${
                    data.score >= 8 ? 'bg-red-200' :
                    data.score >= 6 ? 'bg-orange-200' :
                    data.score >= 4 ? 'bg-yellow-200' : 'bg-green-200'
                  }`}>
                    <div className={`h-2 rounded-full transition-all duration-500 ${
                      data.score >= 8 ? 'bg-red-600' :
                      data.score >= 6 ? 'bg-orange-600' :
                      data.score >= 4 ? 'bg-yellow-600' : 'bg-green-600'
                    }`} style={{ width: `${data.score * 10}%` }}></div>
                  </div>
                  <span className="text-xs font-medium">
                    {data.score >= 8 ? 'Immediate' :
                     data.score >= 6 ? 'High' :
                     data.score >= 4 ? 'Medium' : 'Low'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HybridRiskDashboard;