"use client";
import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import { ChartRadarDots } from "@/components/ui/radar-chart";
import { ApprovalsRiskSummary } from "@/components/ui/approvals-risk-summary"

const statusOptions = ["Approved", "Rejected", "Pending"];
const businessFunctions = ["Function A", "Function B", "Function C"];
const finalQualifications = [
  "Operational Enhancer",
  "Productivity Driver",
  "Revenue Acceleration",
];
const calculateDataPrivacyRisk = (stepsData : any) => {
  let score = 1; // Base score
  const factors = [];
  const weights = {
    sensitiveData: 3,
    largeVolume: 1.5,
    crossBorder: 2,
    realTime: 0.5,
    minorsData: 1,
    retention: 0.5,
    multiJurisdiction: 0.8
  };
  const sensitiveTypes = ['Health/Medical Records', 'Financial Records', 'Biometric Data', "Children's Data (under 16)"];
  let hasSensitiveData = false;
  // let dataTypes = stepsData.dataReadiness.dataTypes;
  if (stepsData?.dataReadiness?.dataTypes?.includes(sensitiveTypes)) {
    hasSensitiveData = true;
    score += weights.sensitiveData;
    factors.push(`Processing sensitive PII (+${weights.sensitiveData})`);
  }

  //TODO
  if (['large', 'vlarge', 'massive'].includes(stepsData?.dataReadiness?.dataVolume)) {
    score += weights.largeVolume;
    factors.push(`Large data volume >1TB (+${weights.largeVolume})`);
  }

  if (stepsData?.dataReadiness?.crossBorderTransfer == true) {
    score += weights.crossBorder;
    factors.push(`Cross-border transfers (+${weights.crossBorder})`);
  }

  // Real-time processing
  if (stepsData?.technicalFeasibility?.modelUpdateFrequency === 'Real-time/Continuous') {
    score += weights.realTime;
    factors.push(`Real-time processing (+${weights.realTime})`);
  }

  // Children's data special consideration
  if (stepsData?.dataReadiness?.dataTypes?.includes("Children's Data (under 16)")) {
    score += weights.minorsData;
    factors.push(`Processing minors data (+${weights.minorsData})`);
  }

  // Multi-jurisdiction handling
  if (stepsData?.dataReadiness?.multiJurisdictionHandling === true) {
    score += weights.multiJurisdiction;
    factors.push(`Multi-jurisdiction handling (+${weights.multiJurisdiction})`);
  }

  // Long retention periods
  if (['3-7years', '7+years'].includes(stepsData?.dataReadiness?.dataRetention)) {
    score += weights.retention;
    factors.push(`Extended data retention (+${weights.retention})`);
  }

  return {
    score: Math.min(score, 10), // Cap at 10
    factors,
    formula: `Base(1) + ${factors.map(f => f.match(/\+(\d+\.?\d*)/)?.[1]).join(' + ')} = ${Math.min(score, 10)}`
  };
}

const calculateSecurityRisk = (stepsData : any) => {
  let score = 1; // Base score
  const factors = [];
  const weights = {
    publicAPI: 2,
    partnerAPI: 1.5,
    internalAPI: 0.5,
    cloudDeployment: 1,
    hybridDeployment: 0.8,
    integrationComplexity: 0.2, // per integration
    authComplexity: 0.5,
    edgeDeployment: 1.2
  };

  switch (stepsData?.technicalFeasibility?.apiSpecs) {
    case 'Public API':
      score += weights.publicAPI;
      factors.push(`Public API exposure (+${weights.publicAPI})`);
      break;
    case 'Partner API':
      score += weights.partnerAPI;
      factors.push(`Partner API exposure (+${weights.partnerAPI})`);
      break;
    case 'Internal API only':
      score += weights.internalAPI;
      factors.push(`Internal API exposure (+${weights.internalAPI})`);
      break;
  }

  // Deployment model risks
  switch (stepsData?.technicalFeasibility?.deploymentModels) {
    case 'Public Cloud':
      score += weights.cloudDeployment;
      factors.push(`Cloud deployment (+${weights.cloudDeployment})`);
      break;
    case 'Hybrid Cloud':
      score += weights.hybridDeployment;
      factors.push(`Hybrid deployment (+${weights.hybridDeployment})`);
      break;
    case 'Edge Computing':
      score += weights.edgeDeployment;
      factors.push(`Edge deployment (+${weights.edgeDeployment})`);
      break;
  }

  // Integration complexity
  const integrationScore = stepsData?.technicalFeasibility?.integrationPoints?.length * stepsData?.technicalFeasibility?.technicalComplexity;
  if (integrationScore > 0) {
    score += integrationScore;
    factors.push(`Multiple integrations (+${integrationScore.toFixed(1)})`);
  }

  // Authentication complexity (derived from user categories and API exposure)
  if (stepsData?.businessFeasibility?.userCategories?.includes('General Public') && 
      stepsData?.technicalFeasibility?.apiSpecs !== 'No API') {
    score += weights.authComplexity;
    factors.push(`Authentication complexity (+${weights.authComplexity})`);
  }
  
  return {
    score: Math.min(score, 10),
    factors,
    formula: `Base(1) + ${factors.map(f => f.match(/\+(\d+\.?\d*)/)?.[1]).join(' + ')} = ${Math.min(score, 10)}`
  };
}

const calculateRegulatoryRisk = (stepsData : any) => {
  let score = 1; // Base score
  const factors = [];
  const weights = {
    GDPR: 3,
    HIPAA: 3,
    PCI: 2.5,
    SOX: 2,
    financialRegs: 2.5,
    aiRegulations: 1.8,
    multiJurisdiction: 1,
    sectorSpecific: 2
  };

  // Check for major regulations
  if (stepsData?.riskAssessment?.dataProtection?.jurisdictions?.includes('GDPR (EU)')) {
    score += weights.GDPR;
    factors.push(`GDPR compliance required (+${weights.GDPR})`);
  } 

  if (stepsData?.riskAssessment?.sectorSpecific === 'HIPAA (Healthcare)') {
    score += weights.HIPAA;
    factors.push(`HIPAA compliance required (+${weights.HIPAA})`);
  }

  if (stepsData?.dataReadiness?.dataTypes?.includes('Financial Records') || 
      stepsData?.riskAssessment?.sectorSpecific?.['PCI-PCI-DSS (Payment Cards)'] === true) {
    score += weights.PCI;
    factors.push(`PCI-DSS compliance required (+${weights.PCI})`);
  }

  // Financial sector specific
  if (stepsData?.riskAssessment?.sectorSpecific === 'SOX (Financial Services)') {
    score += weights.financialRegs;
    factors.push(`Financial sector regulations (+${weights.financialRegs})`);
  }

   // AI-specific regulations
   if (stepsData?.riskAssessment?.dataProtection?.jurisdictions?.includes('GDPR (EU)') && 
   stepsData?.ethicalImpact?.modelCharacteristics?.explainabilityLevel === 'black-box') {
 score += weights.aiRegulations;
 factors.push(`AI Act compliance (+${weights.aiRegulations})`);
  } 

  if (stepsData?.riskAssessment?.dataProtection?.jurisdictions?.length > 2) {
    score += weights.multiJurisdiction;
    factors.push(`Multi-jurisdiction (+${weights.multiJurisdiction})`);
  }

  return {
    score: Math.min(score, 10),
    factors,
    formula: `Base(1) + ${factors.map(f => f.match(/\+(\d+\.?\d*)/)?.[1]).join(' + ')} = ${Math.min(score, 10)}`
  };
}

const calculateEthicalRisk = (stepsData : any) => {
  let score = 1; // Base score
  const factors = [];
  const weights = {
    automatedDecisions: 2,
    biasRisk: 1.3,
    transparencyGap: 0.5,
    vulnerableGroups: 1,
    noHumanOversight: 1.5,
    discriminationPotential: 1.2
  };

  // Automated decision-making
  if (['Fully Automated', 'Autonomous'].includes(stepsData?.ethicalImpact?.decisionMaking?.automationLevel)) {
    score += weights.automatedDecisions;
    factors.push(`Automated decision-making (+${weights.automatedDecisions})`);
  }

  // Bias risk assessment
  if (stepsData?.ethicalImpact?.modelCharacteristics?.biasTesting === 'No Testing Planned' || 
      stepsData?.ethicalImpact?.modelCharacteristics?.biasTesting === 'basic-statistical') {
    score += weights.biasRisk;
    factors.push(`Potential bias in outcomes (+${weights.biasRisk})`);
  }

  // Transparency issues
  if (stepsData?.ethicalImpact?.modelCharacteristics?.explainabilityLevel === 'black-box') {
    score += weights.transparencyGap;
    factors.push(`Limited explainability (+${weights.transparencyGap})`);
  }

  // Vulnerable groups
  if (stepsData?.businessFeasibility?.userCategories?.includes('Minors/Children') ||
      stepsData?.dataReadiness?.dataTypes?.includes("Children's Data (under 16)")) {
    score += weights.vulnerableGroups;
    factors.push(`Affects vulnerable groups (+${weights.vulnerableGroups})`);
  }

  // Lack of human oversight
  if (stepsData?.ethicalImpact?.aiGovernance?.humanOversightLevel === 'fully-autonomous') {
    score += weights.noHumanOversight;
    factors.push(`No human oversight (+${weights.noHumanOversight})`);
  }

  return {
    score: Math.min(score, 10),
    factors,
    formula: `Base(1) + ${factors.map(f => f.match(/\+(\d+\.?\d*)/)?.[1]).join(' + ')} = ${Math.min(score, 10)}`
  };
}

const calculateOperationalRisk = (stepsData : any) => {
  let score = 1; // Base score
  const factors = [];
  const weights = {
    missionCritical: 3,
    highCritical: 2,
    complexityHigh: 1.9,
    complexityMedium: 1,
    severeDowntime: 1,
    catastrophicFailure: 1.5,
    limitedRedundancy: 0.5,
    continuousUpdates: 0.8
  };

  // System criticality
  switch (stepsData?.businessFeasibility?.systemCriticality) {
    case 'Mission Critical':
      score += weights.missionCritical;
      factors.push(`Business critical system (+${weights.missionCritical})`);
      break;
    case 'High (Business Critical)':
      score += weights.highCritical;
      factors.push(`High criticality system (+${weights.highCritical})`);
      break;
  }

  // Complexity assessment (based on integrations and model types)
  const complexityIndicators = 
    stepsData?.technicalFeasibility?.integrationPoints?.length + 
    stepsData?.technicalFeasibility?.modelTypes?.length;
  
  if (complexityIndicators > 5) {
    score += weights.complexityHigh;
    factors.push(`High complexity (+${weights.complexityHigh})`);
  } else if (complexityIndicators > 3) {
    score += weights.complexityMedium;
    factors.push(`Medium complexity (+${weights.complexityMedium})`);
  }

  // Downtime impact
  if (['Severe Business Impact', 'Catastrophic/Life Safety'].includes(stepsData?.businessFeasibility?.failureImpact)) {
    score += weights.severeDowntime;
    factors.push(`Downtime impact severe (+${weights.severeDowntime})`);
  }

  // Catastrophic failure risk
  if (stepsData?.businessFeasibility?.failureImpact === 'Catastrophic/Life Safety') {
    score += weights.catastrophicFailure;
    factors.push(`Catastrophic failure risk (+${weights.catastrophicFailure})`);
  }

  // Redundancy assessment (inferred from deployment model)
  if (stepsData?.technicalFeasibility?.deploymentModels?.includes('On-Premise')) {
    score += weights.limitedRedundancy;
    factors.push(`Limited redundancy (+${weights.limitedRedundancy})`);
  }

  return {
    score: Math.min(score, 10),
    factors,
    formula: `Base(1) + ${factors.map(f => f.match(/\+(\d+\.?\d*)/)?.[1]).join(' + ')} = ${Math.min(score, 10)}`
  };
}

const calculateReputationRisk = (stepsData : any) => {
  let score = 1; // Base score
  const factors = [];
  const weights = {
    publicFacing: 2,
    socialMedia: 1.5,
    trustCritical: 1,
    brandImpact: 0.5,
    minorsInvolved: 1.2,
    financialTrust: 1.3,
    healthcareTrust: 1.4
  };
  
  // Public-facing system
  if (stepsData?.businessFeasibility?.userCategories?.includes('General Public') ||
      stepsData?.technicalFeasibility?.apiSpecs === 'Public API') {
    score += weights.publicFacing;
    factors.push(`Public-facing system (+${weights.publicFacing})`);
  }

  // Social media amplification risk
  if (stepsData?.businessFeasibility?.userCategories?.includes('Customers') &&
      stepsData?.businessFeasibility?.systemCriticality !== 'Non-Critical') {
    score += weights.socialMedia;
    factors.push(`Social media amplification (+${weights.socialMedia})`);
  }

  // Trust-critical decisions
  if (['SOX (Financial Reporting)', 'HIPAA (Healthcar'].includes(stepsData?.riskAssessment?.sectorSpecific)) {
    score += weights.trustCritical;
    factors.push(`Trust-critical decisions (+${weights.trustCritical})`);
    
    // Industry-specific trust factors
    if (stepsData?.riskAssessment?.sectorSpecific === 'SOX (Financial Services)') {
      score += weights.financialTrust;
      factors.push(`Financial trust critical (+${weights.financialTrust})`);
    } else if (stepsData?.riskAssessment?.sectorSpecific === 'HIPAA (Healthcare)') {
      score += weights.healthcareTrust;
      factors.push(`Healthcare trust critical (+${weights.healthcareTrust})`);
    }
  }

  // Brand impact potential
  if (stepsData?.businessFeasibility?.failureImpact !== 'Minimal/No Impact') {
    score += weights.brandImpact;
    factors.push(`Brand impact potential (+${weights.brandImpact})`);
  }

  return {
    score: Math.min(score, 10),
    factors,
    formula: `Base(1) + ${factors.map(f => f.match(/\+(\d+\.?\d*)/)?.[1]).join(' + ')} = ${Math.min(score, 10)}`
  };
}

const RiskCalculation = (stepsData : any) => {
  // Weights for each dimension
  const weights = {
    dataPrivacy: 0.25,
    security: 0.20,
    regulatory: 0.25,
    ethical: 0.10,
    operational: 0.15,
    reputational: 0.05
  };
  const dataPrivacyRisk = calculateDataPrivacyRisk(stepsData);
  const securityRisk = calculateSecurityRisk(stepsData);
  const regulatoryRisk = calculateRegulatoryRisk(stepsData);
  const ethicalRisk = calculateEthicalRisk(stepsData);
  const operationalRisk = calculateOperationalRisk(stepsData);
  const reputationRisk = calculateReputationRisk(stepsData);

  const chartData = [
    {month: "Data Privacy", desktop: dataPrivacyRisk.score},
    {month: "Security", desktop: securityRisk.score},
    {month: "Regulatory", desktop: regulatoryRisk.score},
    {month: "Ethical", desktop: ethicalRisk.score},
    {month: "Operational", desktop: operationalRisk.score},
    {month: "Reputational", desktop: reputationRisk.score}
  ]
  // Calculate weighted average
  const weightedScore = dataPrivacyRisk.score * weights.dataPrivacy + securityRisk.score * weights.security + regulatoryRisk.score * weights.regulatory + ethicalRisk.score * weights.ethical + operationalRisk.score * weights.operational + reputationRisk.score * weights.reputational;

  // Determine risk tier
  let riskTier: string;
  if (weightedScore >= 8) {
    riskTier = 'critical';
  } else if (weightedScore >= 6) {
    riskTier = 'high';
  } else if (weightedScore >= 4) {
    riskTier = 'medium';
  } else {
    riskTier = 'low';
  }

  console.log("chartData type:", typeof chartData, chartData);

  return {
    chartData,
    score: parseFloat(weightedScore.toFixed(1)),
    riskTier,
    formula: `(0.25×${dataPrivacyRisk.score} + 0.20×${securityRisk.score} + 0.ui25×${regulatoryRisk.score} + 0.10×${ethicalRisk.score} + 0.15×${operationalRisk.score} + 0.05×${reputationRisk.score})`,
    calculation: `(0.25×Privacy + 0.20×Security + 0.25×Regulatory + 0.10×Ethical + 0.15×Operational + 0.05×Reputational)`
  };
}

const ApprovalsPage = forwardRef((props, ref) => {
  const params = useParams();
  const useCaseId = params.useCaseId as string;
  const router = useRouter();
  const [form, setForm] = useState({
    governanceName: "",
    governanceStatus: "",
    governanceComment: "",
    riskName: "",
    riskStatus: "",
    riskComment: "",
    legalName: "",
    legalStatus: "",
    legalComment: "",
    businessFunction: "",
    businessName: "",
    businessStatus: "",
    businessComment: "",
    finalQualification: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // New: Use case summary state
  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [stepsData, setStepsData] = useState<any>(null);
  const [chartData, setChartData] = useState<{ month: string; desktop: number }[]>([]);


  useEffect(() => {
    if (!useCaseId) return;
    setSummaryLoading(true);
    fetch(`/api/get-usecase-details?useCaseId=${useCaseId}`)
      .then((res) => res.json())
      .then((data) => {
        setStepsData(data.assessData.stepsData);
        // console.log(data.assessData.stepsData);
        setSummary(data);
        setSummaryLoading(false);
      })
      .catch(() => {
        setSummaryError("Failed to load use case details");
        setSummaryLoading(false);
      });
  }, [useCaseId]);

  useEffect(() => {
    if (!stepsData) return; // ✅ prevents early/invalid call
  
    const result = RiskCalculation(stepsData);
    setChartData(Array.isArray(result.chartData) ? result.chartData : []);
  
    console.log("Updated stepsData:", stepsData);
    console.log("chartData type:", typeof result.chartData, result.chartData);
  }, [stepsData]);
  

  useEffect(() => {
    if (!useCaseId) return;
    setLoading(true);
    fetch(`/api/read-approvals?useCaseId=${useCaseId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) setForm(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [useCaseId]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await fetch("/api/write-approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCaseId, ...form }),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to save");
      setTimeout(() => setError("") , 3000);
    }
    setSaving(false);
  };

  const handleComplete = async () => {
    await handleSave();
    router.push(`/dashboard/${useCaseId}`);
  };

  useImperativeHandle(ref, () => ({ handleComplete }));

  // Helper for formatting
  const formatCurrency = (val: number | string) => {
    if (typeof val === 'string') val = parseFloat(val);
    return val ? val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : "$0";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
        {/* Problem Statement */}
        {summaryLoading ? (
          <div className="mb-6 text-gray-500">Loading use case summary...</div>
        ) : summaryError ? (
          <div className="mb-6 text-red-500">{summaryError}</div>
        ) : summary ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2 text-gray-900">Problem Statement</h2>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{summary.problemStatement || <span className="text-gray-400">Not specified</span>}</p>
              <h2 className="text-xl font-bold mb-2 text-gray-900">Proposed Solution</h2>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{summary.proposedAISolution || <span className="text-gray-400">Not specified</span>}</p>
            </div>
            {/* Radar Chart */}
            {Array.isArray(chartData) && chartData.length > 0 && (
              <ChartRadarDots chartData={chartData} />
            )}
            {/* Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalInvestment || 0)}</div>
                <div className="text-gray-600 mt-1">Total Investment</div>
              </Card>
              <Card className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalValueGenerated || 0)}</div>
                <div className="text-gray-600 mt-1">Total Value Generated</div>
              </Card>
              <Card className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-blue-600">{summary.netROI ? `${summary.netROI}%` : '0%'}</div>
                <div className="text-gray-600 mt-1">Net ROI</div>
              </Card>
              <Card className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-green-600">{summary.paybackPeriod ? `${summary.paybackPeriod} months` : 'N/A'}</div>
                <div className="text-gray-600 mt-1">Payback Period</div>
              </Card>
            </div>
            {/* Risk Summary Card */}
            {stepsData && chartData && chartData.length > 0 && (() => {
              const riskResult = RiskCalculation(stepsData);
              const riskScores = riskResult.chartData.map((d: any) => d.desktop);
              const criticalCount = riskScores.filter((v: number) => v >= 8).length;
              const highCount = riskScores.filter((v: number) => v >= 6 && v < 8).length;
              const mediumCount = riskScores.filter((v: number) => v >= 4 && v < 6).length;
              return (
                <div className="mb-8">
                  <ApprovalsRiskSummary
                    score={riskResult.score}
                    riskTier={riskResult.riskTier as any}
                    trend="increasing"
                    criticalCount={criticalCount}
                    highCount={highCount}
                    mediumCount={mediumCount}
                  />
                </div>
              );
            })()}
          </>
        ) : null}
        <h2 className="text-2xl font-bold mb-8 text-[#9461fd]">Approvals</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">Data saved/updated successfully!</div>}
        {/* Final Usecase Qualification */}
        <Card className="mb-6 p-6">
          <h3 className="font-semibold text-lg mb-4">Final Usecase Qualification</h3>
          <select value={form.finalQualification} onChange={e => setForm(f => ({ ...f, finalQualification: e.target.value }))} className="mb-2 border rounded px-3 py-2">
            <option value="">Select Qualification</option>
            {finalQualifications.map(opt => <option key={opt}>{opt}</option>)}
          </select>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Governance */}
          <Card className="mb-6 p-6">
            <h3 className="font-semibold text-lg mb-4">Governance</h3>
            <Input placeholder="Approver Name" value={form.governanceName} onChange={e => setForm(f => ({ ...f, governanceName: e.target.value }))} className="mb-2" />
            <select value={form.governanceStatus} onChange={e => setForm(f => ({ ...f, governanceStatus: e.target.value }))} className="mb-2 border rounded px-3 py-2">
              <option value="">Select Status</option>
              {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
            </select>
            <Input placeholder="Comments" value={form.governanceComment} onChange={e => setForm(f => ({ ...f, governanceComment: e.target.value }))} />
          </Card>
          {/* Risk Management */}
          <Card className="mb-6 p-6">
            <h3 className="font-semibold text-lg mb-4">Risk Management</h3>
            <Input placeholder="Approver Name" value={form.riskName} onChange={e => setForm(f => ({ ...f, riskName: e.target.value }))} className="mb-2" />
            <select value={form.riskStatus} onChange={e => setForm(f => ({ ...f, riskStatus: e.target.value }))} className="mb-2 border rounded px-3 py-2">
              <option value="">Select Status</option>
              {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
            </select>
            <Input placeholder="Comments" value={form.riskComment} onChange={e => setForm(f => ({ ...f, riskComment: e.target.value }))} />
          </Card>
          {/* Legal */}
          <Card className="mb-6 p-6">
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <Input placeholder="Approver Name" value={form.legalName} onChange={e => setForm(f => ({ ...f, legalName: e.target.value }))} className="mb-2" />
            <select value={form.legalStatus} onChange={e => setForm(f => ({ ...f, legalStatus: e.target.value }))} className="mb-2 border rounded px-3 py-2">
              <option value="">Select Status</option>
              {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
            </select>
            <Input placeholder="Comments" value={form.legalComment} onChange={e => setForm(f => ({ ...f, legalComment: e.target.value }))} />
          </Card>
          {/* Business Function */}
          <Card className="mb-6 p-6">
            <h3 className="font-semibold text-lg mb-4">Business Function</h3>
            <select value={form.businessFunction} onChange={e => setForm(f => ({ ...f, businessFunction: e.target.value }))} className="mb-2 border rounded px-3 py-2">
              <option value="">Select Function</option>
              {businessFunctions.map(opt => <option key={opt}>{opt}</option>)}
            </select>
            <Input placeholder="Approver Name" value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} className="mb-2" />
            <select value={form.businessStatus} onChange={e => setForm(f => ({ ...f, businessStatus: e.target.value }))} className="mb-2 border rounded px-3 py-2">
              <option value="">Select Status</option>
              {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
            </select>
            <Input placeholder="Comments" value={form.businessComment} onChange={e => setForm(f => ({ ...f, businessComment: e.target.value }))} />
          </Card>
        </div>
      </div>
    </div>
  );
});

export default ApprovalsPage; 