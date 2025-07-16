"use client";
import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import { ChartRadarDots } from "@/components/ui/radar-chart";
import { ApprovalsRiskSummary } from "@/components/ui/approvals-risk-summary"
import { InformationCircleIcon } from '@heroicons/react/24/outline';

type StepsData = {
  dataReadiness?: {
    dataTypes?: string[];
    dataVolume?: string;
    crossBorderTransfer?: boolean;
    multiJurisdictionHandling?: boolean;
    dataRetention?: string;
  };
  technicalFeasibility?: {
    modelUpdateFrequency?: string;
    apiSpecs?: string;
    deploymentModels?: string;
    integrationPoints?: string[];
    technicalComplexity?: number;
    modelTypes?: string[];
  };
  businessFeasibility?: {
    userCategories?: string[];
    systemCriticality?: string;
    failureImpact?: string;
  };
  riskAssessment?: {
    dataProtection?: {
      jurisdictions?: string[];
    };
    sectorSpecific?: string | { [key: string]: boolean };
  };
  ethicalImpact?: {
    modelCharacteristics?: {
      explainabilityLevel?: string;
      biasTesting?: string;
    };
    decisionMaking?: {
      automationLevel?: string;
    };
    aiGovernance?: {
      humanOversightLevel?: string;
    };
  };
  metadata?: Record<string, unknown>;
};

const statusOptions = ["Approved", "Rejected", "Pending"];
const businessFunctions = [
  'Sales',
  'Marketing',
  'Product Development',
  'Operations',
  'Customer Support',
  'HR',
  'Finance',
  'IT',
  'Legal',
  'Procurement',
  'Facilities',
  'Strategy',
  'Communications',
  'Risk & Audit',
  'Innovation Office',
  'ESG',
  'Data Office',
  'PMO'
];
const finalQualifications = [
  "Operational Enhancer",
  "Productivity Driver",
  "Revenue Acceleration",
];
const calculateDataPrivacyRisk = (stepsData: StepsData) => {
  let score = 1; // Base score
  const factors = [];
  const infoMessages: string[] = [];
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
  const _hasSensitiveData = Array.isArray(stepsData?.dataReadiness?.dataTypes) && stepsData.dataReadiness.dataTypes.some(type => sensitiveTypes.includes(type || ''));
  if (_hasSensitiveData) {
    score += weights.sensitiveData;
    factors.push(`Processing sensitive PII (+${weights.sensitiveData})`);
  }
  // Dynamic info: If Children's Data or Biometric Data is present, always flag as sensitive
  if (stepsData?.dataReadiness?.dataTypes?.includes("Children's Data (under 16)")) {
    infoMessages.push("Children's Data (under 16) detected. Data privacy risk has been flagged as sensitive.");
  }
  if (stepsData?.dataReadiness?.dataTypes?.includes("Biometric Data")) {
    infoMessages.push("Biometric Data detected. Data privacy risk has been flagged as sensitive.");
  }
  // Cross-border transfer without jurisdictions
  if (stepsData?.dataReadiness?.crossBorderTransfer && (!stepsData?.riskAssessment?.dataProtection?.jurisdictions || stepsData?.riskAssessment?.dataProtection?.jurisdictions.length === 0)) {
    infoMessages.push("Cross-border data transfer is required, but no jurisdictions are specified. Please review data protection requirements.");
  }

  //TODO
  if (['large', 'vlarge', 'massive'].includes(stepsData?.dataReadiness?.dataVolume ?? '')) {
    score += weights.largeVolume;
    factors.push(`Large data volume >1TB (+${weights.largeVolume})`);
  }

  if (stepsData?.dataReadiness?.crossBorderTransfer == true) {
    score += weights.crossBorder;
    factors.push(`Cross-border transfers (+${weights.crossBorder})`);
  }

  // Real-time processing
  if ((stepsData?.technicalFeasibility?.modelUpdateFrequency || '') === 'Real-time/Continuous') {
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
  if (['3-7years', '7+years'].includes(stepsData?.dataReadiness?.dataRetention ?? '')) {
    score += weights.retention;
    factors.push(`Extended data retention (+${weights.retention})`);
  }

  return {
    score: Math.min(score, 10), // Cap at 10
    factors,
    formula: `Base(1) + ${factors.map(f => f.match(/\+(\d+\.?\d*)/)?.[1]).join(' + ')} = ${Math.min(score, 10)}`,
    infoMessages
  };
}

const calculateSecurityRisk = (stepsData: StepsData) => {
  let score = 1; // Base score
  const factors = [];
  const infoMessages: string[] = [];
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

  switch (stepsData?.technicalFeasibility?.apiSpecs || '') {
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
  switch (stepsData?.technicalFeasibility?.deploymentModels || '') {
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
  const integrationScore = (stepsData?.technicalFeasibility?.integrationPoints?.length || 0) * (stepsData?.technicalFeasibility?.technicalComplexity || 0);
  if (integrationScore > 0) {
    score += integrationScore;
    factors.push(`Multiple integrations (+${integrationScore.toFixed(1)})`);
  }

  // Authentication complexity (derived from user categories and API exposure)
  if ((stepsData?.businessFeasibility?.userCategories || []).includes('General Public')) {
    score += weights.authComplexity;
    factors.push(`Authentication complexity (+${weights.authComplexity})`);
  }
  
  // Dynamic info: Public/Partner API without security controls
  if (["Public API", "Partner API"].includes(stepsData?.technicalFeasibility?.apiSpecs || '')) {
    if (!stepsData?.technicalFeasibility?.integrationPoints || stepsData.technicalFeasibility.integrationPoints.length === 0) {
      infoMessages.push("Public or Partner API selected, but no integration points specified. Please ensure security controls are in place.");
    }
  }
  // Cloud/Hybrid deployment without security controls
  if (["Public Cloud", "Hybrid Cloud"].includes(stepsData?.technicalFeasibility?.deploymentModels || '')) {
    if (!stepsData?.technicalFeasibility?.integrationPoints || stepsData.technicalFeasibility.integrationPoints.length === 0) {
      infoMessages.push("Cloud or Hybrid deployment selected, but no integration points specified. Please ensure security controls are in place.");
    }
  }
  return {
    score: Math.min(score, 10),
    factors,
    formula: `Base(1) + ${factors.map(f => f.match(/\+(\d+\.?\d*)/)?.[1]).join(' + ')} = ${Math.min(score, 10)}`,
    infoMessages
  };
}

const calculateRegulatoryRisk = (stepsData: StepsData) => {
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
    sectorSpecific: 2,
    LGPD: 2.5,
    PIPEDA: 2.5,
    POPI: 2.5,
    APPI: 2.5,
    PrivacyActAU: 2.5,
    PDPA: 2.5
  };

  let regulatoryWarnings: string[] = [];

  // Helper: get operating jurisdictions
  let operatingJurisdictions: any = undefined;
  if (stepsData?.riskAssessment && 'operatingJurisdictions' in stepsData.riskAssessment) {
    operatingJurisdictions = (stepsData.riskAssessment as any).operatingJurisdictions;
  } else if (stepsData?.dataReadiness && 'operatingJurisdictions' in stepsData.dataReadiness) {
    operatingJurisdictions = (stepsData.dataReadiness as any).operatingJurisdictions;
  }
  // Helper: get sectorSpecific as string or object
  let sectorSpecific = stepsData?.riskAssessment?.sectorSpecific;
  let sectorSpecificStr = typeof sectorSpecific === 'string' ? sectorSpecific : '';
  if (!sectorSpecificStr && typeof sectorSpecific === 'object') {
    sectorSpecificStr = Object.keys(sectorSpecific).find(k => sectorSpecific[k]) || '';
  }
  // Helper: get data types
  const dataTypes = stepsData?.dataReadiness?.dataTypes || [];

  // Helper: get dataProtection.jurisdictions
  const dataProtectionJurisdictions = stepsData?.riskAssessment?.dataProtection?.jurisdictions || [];

  // --- Dynamic Inference for all major frameworks ---
  // GDPR
  let hasGDPR = dataProtectionJurisdictions.includes('GDPR (EU)');
  let euJurisdictionSelected = operatingJurisdictions && operatingJurisdictions['Europe'] && operatingJurisdictions['Europe']['European Union'];
  if (hasGDPR || euJurisdictionSelected) {
    score += weights.GDPR;
    factors.push(`GDPR compliance required (+${weights.GDPR})`);
    if (euJurisdictionSelected && !hasGDPR) {
      regulatoryWarnings.push('European Union is selected as an operating jurisdiction, but GDPR (EU) is not checked in Data Protection. GDPR risk has been inferred.');
    }
  }
  // HIPAA
  let hasHIPAA = dataProtectionJurisdictions.includes('HIPAA (Healthcare)') || sectorSpecificStr === 'HIPAA (Healthcare)';
  let usJurisdictionSelected = operatingJurisdictions && operatingJurisdictions['Americas'] && operatingJurisdictions['Americas']['United States (Federal)'];
  let healthcareSector = sectorSpecificStr === 'HIPAA (Healthcare)' || (typeof sectorSpecific === 'object' && sectorSpecific['HIPAA (Healthcare)']);
  if (hasHIPAA || (usJurisdictionSelected && healthcareSector)) {
    score += weights.HIPAA;
    factors.push(`HIPAA compliance required (+${weights.HIPAA})`);
    if (usJurisdictionSelected && healthcareSector && !hasHIPAA) {
      regulatoryWarnings.push('United States (Federal) and Healthcare sector are selected, but HIPAA is not checked. HIPAA risk has been inferred.');
    }
  }
  // PCI-DSS
  let hasPCI = dataProtectionJurisdictions.includes('PCI-DSS (Payment Cards)') || sectorSpecificStr === 'PCI-DSS (Payment Cards)';
  let hasFinancialRecords = dataTypes.includes('Financial Records');
  if (hasPCI || hasFinancialRecords) {
    score += weights.PCI;
    factors.push(`PCI-DSS compliance required (+${weights.PCI})`);
    if (hasFinancialRecords && !hasPCI) {
      regulatoryWarnings.push('Financial Records data type is selected, but PCI-DSS is not checked. PCI-DSS risk has been inferred.');
    }
  }
  // SOX
  let hasSOX = dataProtectionJurisdictions.includes('SOX (Financial Reporting)') || sectorSpecificStr === 'SOX (Financial Reporting)' || sectorSpecificStr === 'SOX (Financial Services)';
  let financialSector = sectorSpecificStr === 'SOX (Financial Services)' || sectorSpecificStr === 'SOX (Financial Reporting)';
  if (hasSOX || (usJurisdictionSelected && financialSector)) {
    score += weights.SOX;
    factors.push(`SOX compliance required (+${weights.SOX})`);
    if (usJurisdictionSelected && financialSector && !hasSOX) {
      regulatoryWarnings.push('United States (Federal) and Financial sector are selected, but SOX is not checked. SOX risk has been inferred.');
    }
  }
  // LGPD (Brazil)
  let hasLGPD = dataProtectionJurisdictions.includes('LGPD (Brazil)');
  let brazilJurisdiction = operatingJurisdictions && operatingJurisdictions['Americas'] && operatingJurisdictions['Americas']['Brazil'];
  if (hasLGPD || brazilJurisdiction) {
    score += weights.LGPD;
    factors.push(`LGPD compliance required (+${weights.LGPD})`);
    if (brazilJurisdiction && !hasLGPD) {
      regulatoryWarnings.push('Brazil is selected as an operating jurisdiction, but LGPD is not checked. LGPD risk has been inferred.');
    }
  }
  // PIPEDA (Canada)
  let hasPIPEDA = dataProtectionJurisdictions.includes('PIPEDA (Canada)');
  let canadaJurisdiction = operatingJurisdictions && operatingJurisdictions['Americas'] && operatingJurisdictions['Americas']['Canada'];
  if (hasPIPEDA || canadaJurisdiction) {
    score += weights.PIPEDA;
    factors.push(`PIPEDA compliance required (+${weights.PIPEDA})`);
    if (canadaJurisdiction && !hasPIPEDA) {
      regulatoryWarnings.push('Canada is selected as an operating jurisdiction, but PIPEDA is not checked. PIPEDA risk has been inferred.');
    }
  }
  // POPI (South Africa)
  let hasPOPI = dataProtectionJurisdictions.includes('POPI (South Africa)');
  let saJurisdiction = operatingJurisdictions && operatingJurisdictions['Middle East & Africa'] && operatingJurisdictions['Middle East & Africa']['South Africa'];
  if (hasPOPI || saJurisdiction) {
    score += weights.POPI;
    factors.push(`POPI compliance required (+${weights.POPI})`);
    if (saJurisdiction && !hasPOPI) {
      regulatoryWarnings.push('South Africa is selected as an operating jurisdiction, but POPI is not checked. POPI risk has been inferred.');
    }
  }
  // APPI (Japan)
  let hasAPPI = dataProtectionJurisdictions.includes('APPI (Japan)');
  let japanJurisdiction = operatingJurisdictions && operatingJurisdictions['Asia-Pacific'] && operatingJurisdictions['Asia-Pacific']['Japan'];
  if (hasAPPI || japanJurisdiction) {
    score += weights.APPI;
    factors.push(`APPI compliance required (+${weights.APPI})`);
    if (japanJurisdiction && !hasAPPI) {
      regulatoryWarnings.push('Japan is selected as an operating jurisdiction, but APPI is not checked. APPI risk has been inferred.');
    }
  }
  // Privacy Act (Australia)
  let hasPrivacyActAU = dataProtectionJurisdictions.includes('Privacy Act (Australia)');
  let australiaJurisdiction = operatingJurisdictions && operatingJurisdictions['Asia-Pacific'] && operatingJurisdictions['Asia-Pacific']['Australia'];
  if (hasPrivacyActAU || australiaJurisdiction) {
    score += weights.PrivacyActAU;
    factors.push(`Privacy Act (Australia) compliance required (+${weights.PrivacyActAU})`);
    if (australiaJurisdiction && !hasPrivacyActAU) {
      regulatoryWarnings.push('Australia is selected as an operating jurisdiction, but Privacy Act (Australia) is not checked. Privacy Act risk has been inferred.');
    }
  }
  // PDPA (Singapore)
  let hasPDPA = dataProtectionJurisdictions.includes('PDPA (Singapore)');
  let singaporeJurisdiction = operatingJurisdictions && operatingJurisdictions['Asia-Pacific'] && operatingJurisdictions['Asia-Pacific']['Singapore'];
  if (hasPDPA || singaporeJurisdiction) {
    score += weights.PDPA;
    factors.push(`PDPA (Singapore) compliance required (+${weights.PDPA})`);
    if (singaporeJurisdiction && !hasPDPA) {
      regulatoryWarnings.push('Singapore is selected as an operating jurisdiction, but PDPA (Singapore) is not checked. PDPA risk has been inferred.');
    }
  }

  // AI-specific regulations (keep GDPR/EU logic for AI Act)
  if ((hasGDPR || euJurisdictionSelected) && stepsData?.ethicalImpact?.modelCharacteristics?.explainabilityLevel === 'black-box') {
    score += weights.aiRegulations;
    factors.push(`AI Act compliance (+${weights.aiRegulations})`);
  }

  if (dataProtectionJurisdictions.length > 2) {
    score += weights.multiJurisdiction;
    factors.push(`Multi-jurisdiction (+${weights.multiJurisdiction})`);
  }

  return {
    score: Math.min(score, 10),
    factors,
    formula: `Base(1) + ${factors.map(f => f.match(/\+(\d+\.?\d*)/)?.[1]).join(' + ')} = ${Math.min(score, 10)}`,
    regulatoryWarnings
  };
}

const calculateEthicalRisk = (stepsData: StepsData) => {
  let score = 1; // Base score
  const factors = [];
  const infoMessages: string[] = [];
  const weights = {
    automatedDecisions: 2,
    biasRisk: 1.3,
    transparencyGap: 0.5,
    vulnerableGroups: 1,
    noHumanOversight: 1.5,
    discriminationPotential: 1.2
  };

  // Automated decision-making
  if (['Fully Automated', 'Autonomous'].includes(stepsData?.ethicalImpact?.decisionMaking?.automationLevel ?? '')) {
    score += weights.automatedDecisions;
    factors.push(`Automated decision-making (+${weights.automatedDecisions})`);
  }

  // Bias risk assessment
  if ((stepsData?.ethicalImpact?.modelCharacteristics?.biasTesting || '') === 'No Testing Planned' || 
      (stepsData?.ethicalImpact?.modelCharacteristics?.biasTesting || '') === 'basic-statistical') {
    score += weights.biasRisk;
    factors.push(`Potential bias in outcomes (+${weights.biasRisk})`);
  }

  // Transparency issues
  if ((stepsData?.ethicalImpact?.modelCharacteristics?.explainabilityLevel || '') === 'black-box') {
    score += weights.transparencyGap;
    factors.push(`Limited explainability (+${weights.transparencyGap})`);
  }

  // Vulnerable groups
  if ((stepsData?.businessFeasibility?.userCategories || []).includes('Minors/Children')) {
    score += weights.vulnerableGroups;
    factors.push(`Affects vulnerable groups (+${weights.vulnerableGroups})`);
  }

  // Lack of human oversight
  if ((stepsData?.ethicalImpact?.aiGovernance?.humanOversightLevel || '') === 'fully-autonomous') {
    score += weights.noHumanOversight;
    factors.push(`No human oversight (+${weights.noHumanOversight})`);
  }

  // Dynamic info: Minors/Children as users but no bias testing
  if ((stepsData?.businessFeasibility?.userCategories || []).includes('Minors/Children')) {
    if (!stepsData?.ethicalImpact?.modelCharacteristics?.biasTesting || stepsData.ethicalImpact.modelCharacteristics.biasTesting === 'No Testing Planned') {
      infoMessages.push("Minors/Children are users, but no bias testing is planned. Please review ethical risk.");
    }
  }
  // Fully Automated without human oversight
  if ((stepsData?.ethicalImpact?.decisionMaking?.automationLevel || '') === 'Fully Automated' && (!stepsData?.ethicalImpact?.aiGovernance?.humanOversightLevel || stepsData.ethicalImpact.aiGovernance.humanOversightLevel === 'fully-autonomous')) {
    infoMessages.push("Fully Automated decision-making selected with no human oversight. Please review ethical risk.");
  }
  return {
    score: Math.min(score, 10),
    factors,
    formula: `Base(1) + ${factors.map(f => f.match(/\+(\d+\.?\d*)/)?.[1]).join(' + ')} = ${Math.min(score, 10)}`,
    infoMessages
  };
}

const calculateOperationalRisk = (stepsData: StepsData) => {
  let score = 1; // Base score
  const factors = [];
  const infoMessages: string[] = [];
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
  if ((stepsData?.businessFeasibility?.systemCriticality || '') === 'Mission Critical') {
    score += weights.missionCritical;
    factors.push(`Business critical system (+${weights.missionCritical})`);
  }

  // Complexity assessment (based on integrations and model types)
  const complexityIndicators = (stepsData?.technicalFeasibility?.integrationPoints?.length || 0) + (stepsData?.technicalFeasibility?.modelTypes?.length || 0);
  
  if (complexityIndicators > 5) {
    score += weights.complexityHigh;
    factors.push(`High complexity (+${weights.complexityHigh})`);
  } else if (complexityIndicators > 3) {
    score += weights.complexityMedium;
    factors.push(`Medium complexity (+${weights.complexityMedium})`);
  }

  // Downtime impact
  if ((stepsData?.businessFeasibility?.failureImpact || '') === 'Catastrophic/Life Safety') {
    score += weights.severeDowntime;
    factors.push(`Downtime impact severe (+${weights.severeDowntime})`);
  }

  // Catastrophic failure risk
  if ((stepsData?.businessFeasibility?.failureImpact || '') === 'Catastrophic/Life Safety') {
    score += weights.catastrophicFailure;
    factors.push(`Catastrophic failure risk (+${weights.catastrophicFailure})`);
  }

  // Redundancy assessment (inferred from deployment model)
  if (stepsData?.technicalFeasibility?.deploymentModels?.includes('On-Premise')) {
    score += weights.limitedRedundancy;
    factors.push(`Limited redundancy (+${weights.limitedRedundancy})`);
  }

  // Dynamic info: Mission Critical without redundancy
  if ((stepsData?.businessFeasibility?.systemCriticality || '') === 'Mission Critical') {
    if (!stepsData?.technicalFeasibility?.deploymentModels || !stepsData.technicalFeasibility.deploymentModels.includes('On-Premise')) {
      infoMessages.push("Mission Critical system selected, but no redundancy or failover specified. Please review operational risk mitigation.");
    }
  }
  // Catastrophic/Life Safety without mitigation
  if ((stepsData?.businessFeasibility?.failureImpact || '') === 'Catastrophic/Life Safety') {
    // Could check for a mitigation field if present
    infoMessages.push("Catastrophic/Life Safety failure impact selected. Please ensure mitigation strategies are documented.");
  }
  return {
    score: Math.min(score, 10),
    factors,
    formula: `Base(1) + ${factors.map(f => f.match(/\+(\d+\.?\d*)/)?.[1]).join(' + ')} = ${Math.min(score, 10)}`,
    infoMessages
  };
}

const calculateReputationRisk = (stepsData: StepsData) => {
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
  if ((stepsData?.businessFeasibility?.userCategories || []).includes('General Public')) {
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
  if (typeof stepsData?.riskAssessment?.sectorSpecific === 'string' && stepsData.riskAssessment.sectorSpecific === 'SOX (Financial Reporting)') {
    score += weights.trustCritical;
    factors.push(`Trust-critical decisions (+${weights.trustCritical})`);
    
    // Industry-specific trust factors
    // Removed problematic string comparisons
  }

  // Brand impact potential
  if ((stepsData?.businessFeasibility?.failureImpact || '') !== 'Minimal/No Impact') {
    score += weights.brandImpact;
    factors.push(`Brand impact potential (+${weights.brandImpact})`);
  }

  return {
    score: Math.min(score, 10),
    factors,
    formula: `Base(1) + ${factors.map(f => f.match(/\+(\d+\.?\d*)/)?.[1]).join(' + ')} = ${Math.min(score, 10)}`
  };
}

const RiskCalculation = (stepsData: StepsData) => {
  // Regulatory and data-focused weights
  const weights = {
    dataPrivacy: 0.25,
    security: 0.20,
    regulatory: 0.30,
    ethical: 0.10,
    operational: 0.10,
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

  return {
    chartData,
    score: parseFloat(weightedScore.toFixed(1)),
    riskTier,
    formula: `(0.25×${dataPrivacyRisk.score} + 0.20×${securityRisk.score} + 0.30×${regulatoryRisk.score} + 0.10×${ethicalRisk.score} + 0.10×${operationalRisk.score} + 0.05×${reputationRisk.score})`,
    calculation: `(0.25×Privacy + 0.20×Security + 0.30×Regulatory + 0.10×Ethical + 0.10×Operational + 0.05×Reputational)`,
    regulatoryWarnings: regulatoryRisk.regulatoryWarnings,
    dataPrivacyInfo: dataPrivacyRisk.infoMessages,
    securityInfo: securityRisk.infoMessages,
    operationalInfo: operationalRisk.infoMessages,
    ethicalInfo: ethicalRisk.infoMessages,
    dataPrivacyFactors: dataPrivacyRisk.factors,
    securityFactors: securityRisk.factors,
    regulatoryFactors: regulatoryRisk.factors,
    ethicalFactors: ethicalRisk.factors,
    operationalFactors: operationalRisk.factors,
    reputationalFactors: reputationRisk.factors
  };
}

function getMissingAssessmentFields(stepsData: StepsData) {
  if (!stepsData) return ['All assessment sections'];
  const missing = [];
  if (!stepsData.dataReadiness || !Array.isArray(stepsData.dataReadiness.dataTypes) || stepsData.dataReadiness.dataTypes.length === 0) missing.push('Data Readiness > Data Types');
  if (!stepsData.technicalFeasibility || !stepsData.technicalFeasibility.modelTypes || stepsData.technicalFeasibility.modelTypes.length === 0) missing.push('Technical Feasibility > Model Types');
  if (!stepsData.businessFeasibility || !stepsData.businessFeasibility.userCategories || stepsData.businessFeasibility.userCategories.length === 0) missing.push('Business Feasibility > User Categories');
  if (!stepsData.riskAssessment || !stepsData.riskAssessment.dataProtection || !Array.isArray(stepsData.riskAssessment.dataProtection.jurisdictions) || stepsData.riskAssessment.dataProtection.jurisdictions.length === 0) missing.push('Risk Assessment > Jurisdictions');
  if (!stepsData.ethicalImpact || !stepsData.ethicalImpact.modelCharacteristics || !stepsData.ethicalImpact.modelCharacteristics.explainabilityLevel) missing.push('Ethical Impact > Explainability Level');
  // Add more checks as needed for your required fields
  return missing;
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
  const [_loading, setLoading] = useState(false);
  const [_saving, setSaving] = useState(false);
  const [_error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // New: Use case summary state
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [stepsData, setStepsData] = useState<StepsData | null>(null);
  const [chartData, setChartData] = useState<{ month: string; desktop: number }[]>([]);
  const [finops, setFinops] = useState<any>(null);

  // Fetch financial data
  useEffect(() => {
    if (!useCaseId) return;
    fetch(`/api/get-finops?id=${useCaseId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setFinops(data[0]);
      });
  }, [useCaseId]);

  useEffect(() => {
    if (!useCaseId) return;
    setSummaryLoading(true);
    fetch(`/api/get-usecase-details?useCaseId=${useCaseId}`)
      .then((res) => res.json())
      .then((data) => {
        // console.log("[ApprovalsPage] API response from /api/get-usecase-details:", data);
        setStepsData(data.assessData.stepsData);
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

    // console.log("[ApprovalsPage] stepsData set in state:", stepsData);
    const result = RiskCalculation(stepsData);
    setChartData(Array.isArray(result.chartData) ? result.chartData : []);
    // console.log("[ApprovalsPage] RiskCalculation result:", result);
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
    // Check for missing assessment fields
    const missingFields = getMissingAssessmentFields(stepsData ?? {});
    if (missingFields.length > 0) {
      alert('Please complete the following fields before completing assessment:\n' + missingFields.join('\n'));
      return;
    }
    try {
      await handleSave();
      
      // Update the assessment status
      const response = await fetch(`/api/post-stepdata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          useCaseId,
          assessData: {
            ...stepsData,
            metadata: {
              ...stepsData?.metadata,
              status: "completed",
              completedAt: new Date().toISOString(),
              approvals: form
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update assessment status");
      }

      router.push(`/dashboard/${useCaseId}`);
    } catch {
      setError("Failed to complete assessment");
      setTimeout(() => setError(""), 3000);
    }
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
              <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{summary.problemStatement && typeof summary.problemStatement === 'string' && summary.problemStatement.trim() ? summary.problemStatement : <span className="text-gray-400">Not specified</span>}</p>
              <h2 className="text-xl font-bold mb-2 text-gray-900">Proposed Solution</h2>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{summary.proposedAISolution && typeof summary.proposedAISolution === 'string' && summary.proposedAISolution.trim() ? summary.proposedAISolution : <span className="text-gray-400">Not specified</span>}</p>
            </div>
            {/* Radar Chart */}
            {Array.isArray(chartData) && chartData.length > 0 && (
              <ChartRadarDots chartData={chartData} />
            )}
            {/* Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-red-600">{formatCurrency(finops?.totalInvestment ?? 0)}</div>
                <div className="text-gray-600 mt-1">Total Investment</div>
              </Card>
              <Card className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(finops?.cumValue ?? 0)}</div>
                <div className="text-gray-600 mt-1">Total Value Generated</div>
              </Card>
              <Card className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-blue-600">{typeof finops?.ROI === 'number' ? `${finops.ROI.toFixed(1)}%` : '0%'}</div>
                <div className="text-gray-600 mt-1">Net ROI</div>
              </Card>
              <Card className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-green-600">{typeof finops?.breakEvenMonth === 'number' ? `${finops.breakEvenMonth} months` : 'N/A'}</div>
                <div className="text-gray-600 mt-1">Payback Period</div>
              </Card>
            </div>
            {/* Risk Summary Card */}
            {stepsData && chartData && chartData.length > 0 && (() => {
              const riskResult = RiskCalculation(stepsData);
              const riskScores = riskResult.chartData.map((d: { month: string; desktop: number }) => d.desktop);
              const criticalCount = riskScores.filter((v: number) => v >= 8).length;
              const highCount = riskScores.filter((v: number) => v >= 6 && v < 8).length;
              const mediumCount = riskScores.filter((v: number) => v >= 4 && v < 6).length;
              return (
                <div className="mb-8">
                  <ApprovalsRiskSummary
                    score={riskResult.score}
                    riskTier={riskResult.riskTier as 'critical' | 'high' | 'medium' | 'low'}
                    trend="increasing"
                    criticalCount={criticalCount}
                    highCount={highCount}
                    mediumCount={mediumCount}
                  />
                  {riskResult.regulatoryWarnings && riskResult.regulatoryWarnings.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 text-blue-900 rounded flex items-start gap-2 border border-blue-200">
                      <InformationCircleIcon className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                      <div>
                        <div className="font-semibold mb-1">Regulatory frameworks have been automatically inferred:</div>
                        {riskResult.regulatoryWarnings.map((w, i) => <div key={i}>{w}</div>)}
                      </div>
                    </div>
                  )}
                  {riskResult.dataPrivacyInfo && riskResult.dataPrivacyInfo.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 text-blue-900 rounded flex items-start gap-2 border border-blue-200">
                      <InformationCircleIcon className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                      <div>
                        <div className="font-semibold mb-1">Data Privacy:</div>
                        {riskResult.dataPrivacyInfo.map((w, i) => <div key={i}>{w}</div>)}
                      </div>
                    </div>
                  )}
                  {riskResult.securityInfo && riskResult.securityInfo.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 text-blue-900 rounded flex items-start gap-2 border border-blue-200">
                      <InformationCircleIcon className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                      <div>
                        <div className="font-semibold mb-1">Security:</div>
                        {riskResult.securityInfo.map((w, i) => <div key={i}>{w}</div>)}
                      </div>
                    </div>
                  )}
                  {riskResult.operationalInfo && riskResult.operationalInfo.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 text-blue-900 rounded flex items-start gap-2 border border-blue-200">
                      <InformationCircleIcon className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                      <div>
                        <div className="font-semibold mb-1">Operational:</div>
                        {riskResult.operationalInfo.map((w, i) => <div key={i}>{w}</div>)}
                      </div>
                    </div>
                  )}
                  {riskResult.ethicalInfo && riskResult.ethicalInfo.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 text-blue-900 rounded flex items-start gap-2 border border-blue-200">
                      <InformationCircleIcon className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                      <div>
                        <div className="font-semibold mb-1">Ethical:</div>
                        {riskResult.ethicalInfo.map((w, i) => <div key={i}>{w}</div>)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
            {/* After info messages, add a Risk Action Summary */}
            {(() => {
              if (!stepsData) return null;
              const riskResult = RiskCalculation(stepsData);
              // Gather risk scores, info, and factors
              const riskScores = [
                { label: 'Data Privacy', score: riskResult.chartData[0]?.desktop || 0, info: riskResult.dataPrivacyInfo, factors: riskResult.dataPrivacyFactors },
                { label: 'Security', score: riskResult.chartData[1]?.desktop || 0, info: riskResult.securityInfo, factors: riskResult.securityFactors },
                { label: 'Regulatory', score: riskResult.chartData[2]?.desktop || 0, info: riskResult.regulatoryWarnings, factors: riskResult.regulatoryFactors },
                { label: 'Ethical', score: riskResult.chartData[3]?.desktop || 0, info: riskResult.ethicalInfo, factors: riskResult.ethicalFactors },
                { label: 'Operational', score: riskResult.chartData[4]?.desktop || 0, info: riskResult.operationalInfo, factors: riskResult.operationalFactors },
                { label: 'Reputational', score: riskResult.chartData[5]?.desktop || 0, info: [], factors: riskResult.reputationalFactors },
              ];
              // Sort by score descending
              const topRisks = riskScores.sort((a, b) => b.score - a.score).slice(0, 3);
              return (
                <div className="mt-8 p-6 bg-blue-100 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <InformationCircleIcon className="w-5 h-5 text-blue-400" />
                    <span className="font-bold text-blue-900 text-lg">Risk Action Summary</span>
                  </div>
                  <ul className="list-disc pl-6 space-y-2">
                    {topRisks.map((risk, idx) => (
                      <li key={idx}>
                        <span className="font-semibold">{risk.label} Risk ({risk.score}/10):</span>
                        {risk.score >= 8 ? (
                          <ul className="list-disc pl-6">
                            {(risk.info && risk.info.length > 0 ? risk.info : risk.factors).map((msg, i) => <li key={i} className="text-blue-900">Action: {msg}</li>)}
                          </ul>
                        ) : risk.score >= 4 ? (
                          <span className="text-blue-900 ml-2">Monitor this area. {risk.factors && risk.factors.length > 0 ? `Factors: ${risk.factors.join('; ')}` : ''}</span>
                        ) : (
                          <span className="text-blue-900 ml-2">No immediate action required.</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
          </>
        ) : null}
        <h2 className="text-2xl font-bold mb-8 text-[#9461fd]">Approvals</h2>
        {_error && <div className="text-red-500 mb-2">{_error}</div>}
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

ApprovalsPage.displayName = 'ApprovalsPage';

export default ApprovalsPage; 