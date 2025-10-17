"use client";
import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import { ChartRadarDots } from "@/components/ui/radar-chart";
import { ApprovalsRiskSummary } from "@/components/ui/approvals-risk-summary"
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface QnAProps {
  id: any;
  text: any;
  stage: any;
  type: any;
  options: OptionProps[];
  answers: AnswerProps[];
}

interface OptionProps {
  id: string;
  text: string;
  questionId: string;
}

interface AnswerProps {
  id: string;
  value: any;
  questionId: string;
}

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

const getAnswer = (qnAData: QnAProps[], stage: string, text: string) => {
  const q = qnAData.find(q => q.stage === stage && q.text === text);
  if (!q) return null;
  if (!q.answers || q.answers.length === 0) return null;
  const val = q.answers.map(a => a.value).filter(Boolean);
  return q.type === 'TEXT' || q.type === 'TEXT_MINI' ? val : val[0];
};

const calculateDataPrivacyRisk = (qnAData: any) => {
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
  
  const dataTypes = getAnswer(qnAData, 'DATA_READINESS', "Data Types");
  console.log("Data Types:", dataTypes);
  console.log("Cross-Border Data Transfer:", getAnswer(qnAData, 'DATA_READINESS', "Cross-Border Data Transfer"));
  const _hasSensitiveData = dataTypes.some((type: string) => sensitiveTypes.includes(type || ''));
  if (_hasSensitiveData) {
    score += weights.sensitiveData;
    factors.push(`Processing sensitive PII (+${weights.sensitiveData})`);
  }
  // Dynamic info: If Children's Data or Biometric Data is present, always flag as sensitive
  if (dataTypes.includes("Children's Data (under 16)")) {
    infoMessages.push("Children's Data (under 16) detected. Data privacy risk has been flagged as sensitive.");
  }
  if (dataTypes.includes("Biometric Data")) {
    infoMessages.push("Biometric Data detected. Data privacy risk has been flagged as sensitive.");
  }
  // Cross-border transfer without jurisdictions
  if (getAnswer(qnAData, 'DATA_READINESS', "Cross-Border Data Transfer") && (!getAnswer(qnAData, 'RISK_ASSESSMENT', "Data Protection") || getAnswer(qnAData, 'RISK_ASSESSMENT', "Data Protection").length === 0)) {
    infoMessages.push("Cross-border data transfer is required, but no jurisdictions are specified. Please review data protection requirements.");
  }

  //TODO
  if (['large', 'vlarge', 'massive'].includes(getAnswer(qnAData, 'DATA_READINESS', "Data Volume") ?? '')) {
    score += weights.largeVolume;
    factors.push(`Large data volume >1TB (+${weights.largeVolume})`);
  }

  if (getAnswer(qnAData, 'DATA_READINESS', "Cross-Border Data Transfer") == true) {
    score += weights.crossBorder;
    factors.push(`Cross-border transfers (+${weights.crossBorder})`);
  }

  // Real-time processing
  if ((getAnswer(qnAData,'TECHNICAL_FEASIBILITY', "Model Update Frequency") || '') === 'Real-time/Continuous') {
    score += weights.realTime;
    factors.push(`Real-time processing (+${weights.realTime})`);
  }

  // Children's data special consideration
  if (dataTypes.includes("Children's Data (under 16)")) {
    score += weights.minorsData;
    factors.push(`Processing minors data (+${weights.minorsData})`);
  }

  // Multi-jurisdiction handling
  if (getAnswer(qnAData, 'DATA_READINESS', "Multi-Jurisdiction Handling") === 'Yes') {
    score += weights.multiJurisdiction;
    factors.push(`Multi-jurisdiction handling (+${weights.multiJurisdiction})`);
  }

  // Long retention periods
  if (['3-7 years', '7+ years'].includes(getAnswer(qnAData, 'DATA_READINESS', "Data Retention Period"))) {
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

const calculateSecurityRisk = (qnAData: QnAProps[]) => {
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

  switch (getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', "API Specifications") || '') {
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

  console.log("Deployment Model:", getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', "Deployment Model"));
  console.log("API Specifications:", getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', "API Specifications"));
  // Deployment model risks
  switch (getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', "Deployment Model") || '') {
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
  const integrationPoints = getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', 'Integration Points') || [];
  const technicalComplexity = getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', 'Technical Complexity') || 0;
  const integrationScore = (Array.isArray(integrationPoints) ? integrationPoints.length : 0) * (typeof technicalComplexity === 'number' ? technicalComplexity : 0);
  if (integrationScore > 0) {
    score += integrationScore;
    factors.push(`Multiple integrations (+${integrationScore.toFixed(1)})`);
  }

  // Authentication complexity (derived from user categories and API exposure)
  const userCategories = getAnswer(qnAData, 'BUSINESS_FEASIBILITY', 'User Categories') || [];
  if (Array.isArray(userCategories) && userCategories.includes('General Public')) {
    score += weights.authComplexity;
    factors.push(`Authentication complexity (+${weights.authComplexity})`);
  }
  
  // Dynamic info: Public/Partner API without security controls
  const apiSpecs = getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', 'API Specifications');
  if (["Public API", "Partner API"].includes(apiSpecs || '')) {
    if (!integrationPoints || integrationPoints.length === 0) {
      infoMessages.push("Public or Partner API selected, but no integration points specified. Please ensure security controls are in place.");
    }
  }
  // Cloud/Hybrid deployment without security controls
  const deploymentModel = getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', 'Deployment Model');
  if (["Public Cloud", "Hybrid Cloud"].includes(deploymentModel || '')) {
    if (!integrationPoints || integrationPoints.length === 0) {
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

const calculateRegulatoryRisk = (qnAData: QnAProps[]) => {
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
  let operatingJurisdictions: any = getAnswer(qnAData, 'RISK_ASSESSMENT', 'Operating Jurisdictions') || 
                                     getAnswer(qnAData, 'DATA_READINESS', 'Operating Jurisdictions');

  // Helper: get sectorSpecific as string or object
  let sectorSpecific = getAnswer(qnAData, 'RISK_ASSESSMENT', 'Sector-Specific Regulations');
  let sectorSpecificStr = typeof sectorSpecific === 'string' ? sectorSpecific : '';
  if (!sectorSpecificStr && typeof sectorSpecific === 'object') {
    sectorSpecificStr = Object.keys(sectorSpecific).find(k => sectorSpecific[k]) || '';
  }
  // Helper: get data types
  const dataTypes = getAnswer(qnAData, 'DATA_READINESS', 'Data Types') || [];

  // Helper: get dataProtection.jurisdictions
  const dataProtectionJurisdictions = getAnswer(qnAData, 'RISK_ASSESSMENT', 'Data Protection') || [];

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
  const explainabilityLevel = getAnswer(qnAData, 'ETHICAL_IMPACT', 'Explainability Level');
  if ((hasGDPR || euJurisdictionSelected) && explainabilityLevel === 'black-box') {
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

const calculateEthicalRisk = (qnAData: QnAProps[]) => {
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
  const automationLevel = getAnswer(qnAData, 'ETHICAL_IMPACT', 'Automation Level') || '';
  if (['Fully Automated', 'Autonomous'].includes(automationLevel)) {
    score += weights.automatedDecisions;
    factors.push(`Automated decision-making (+${weights.automatedDecisions})`);
  }

  // Bias risk assessment
  const biasTesting = getAnswer(qnAData, 'ETHICAL_IMPACT', 'Bias Testing') || '';
  if (biasTesting === 'No Testing Planned' || biasTesting === 'basic-statistical') {
    score += weights.biasRisk;
    factors.push(`Potential bias in outcomes (+${weights.biasRisk})`);
  }

  // Transparency issues
  const ethicalExplainabilityLevel = getAnswer(qnAData, 'ETHICAL_IMPACT', 'Explainability Level') || '';
  if (ethicalExplainabilityLevel === 'black-box') {
    score += weights.transparencyGap;
    factors.push(`Limited explainability (+${weights.transparencyGap})`);
  }

  // Vulnerable groups
  const ethicalUserCategories = getAnswer(qnAData, 'BUSINESS_FEASIBILITY', 'User Categories') || [];
  if (Array.isArray(ethicalUserCategories) && ethicalUserCategories.includes('Minors/Children')) {
    score += weights.vulnerableGroups;
    factors.push(`Affects vulnerable groups (+${weights.vulnerableGroups})`);
  }

  // Lack of human oversight
  const humanOversightLevel = getAnswer(qnAData, 'ETHICAL_IMPACT', 'Human Oversight Level') || '';
  if (humanOversightLevel === 'fully-autonomous') {
    score += weights.noHumanOversight;
    factors.push(`No human oversight (+${weights.noHumanOversight})`);
  }

  // Dynamic info: Minors/Children as users but no bias testing
  if (Array.isArray(ethicalUserCategories) && ethicalUserCategories.includes('Minors/Children')) {
    if (!biasTesting || biasTesting === 'No Testing Planned') {
      infoMessages.push("Minors/Children are users, but no bias testing is planned. Please review ethical risk.");
    }
  }
  // Fully Automated without human oversight
  if (automationLevel === 'Fully Automated' && (!humanOversightLevel || humanOversightLevel === 'fully-autonomous')) {
    infoMessages.push("Fully Automated decision-making selected with no human oversight. Please review ethical risk.");
  }
  return {
    score: Math.min(score, 10),
    factors,
    formula: `Base(1) + ${factors.map(f => f.match(/\+(\d+\.?\d*)/)?.[1]).join(' + ')} = ${Math.min(score, 10)}`,
    infoMessages
  };
}

const calculateOperationalRisk = (qnAData: QnAProps[]) => {
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
  const systemCriticality = getAnswer(qnAData, 'BUSINESS_FEASIBILITY', 'System Criticality') || '';
  if (systemCriticality === 'Mission Critical') {
    score += weights.missionCritical;
    factors.push(`Business critical system (+${weights.missionCritical})`);
  }

  // Complexity assessment (based on integrations and model types)
  const opIntegrationPoints = getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', 'Integration Points') || [];
  const opModelTypes = getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', 'Model Types') || [];
  const complexityIndicators = (Array.isArray(opIntegrationPoints) ? opIntegrationPoints.length : 0) + (Array.isArray(opModelTypes) ? opModelTypes.length : 0);
  
  if (complexityIndicators > 5) {
    score += weights.complexityHigh;
    factors.push(`High complexity (+${weights.complexityHigh})`);
  } else if (complexityIndicators > 3) {
    score += weights.complexityMedium;
    factors.push(`Medium complexity (+${weights.complexityMedium})`);
  }

  // Downtime impact
  const failureImpact = getAnswer(qnAData, 'BUSINESS_FEASIBILITY', 'Failure Impact') || '';
  if (failureImpact === 'Catastrophic/Life Safety') {
    score += weights.severeDowntime;
    factors.push(`Downtime impact severe (+${weights.severeDowntime})`);
  }

  // Catastrophic failure risk
  if (failureImpact === 'Catastrophic/Life Safety') {
    score += weights.catastrophicFailure;
    factors.push(`Catastrophic failure risk (+${weights.catastrophicFailure})`);
  }

  // Redundancy assessment (inferred from deployment model)
  const opDeploymentModel = getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', 'Deployment Model') || '';
  if (opDeploymentModel === 'On-Premise') {
    score += weights.limitedRedundancy;
    factors.push(`Limited redundancy (+${weights.limitedRedundancy})`);
  }

  // Dynamic info: Mission Critical without redundancy
  if (systemCriticality === 'Mission Critical') {
    if (!opDeploymentModel || opDeploymentModel !== 'On-Premise') {
      infoMessages.push("Mission Critical system selected, but no redundancy or failover specified. Please review operational risk mitigation.");
    }
  }
  // Catastrophic/Life Safety without mitigation
  if (failureImpact === 'Catastrophic/Life Safety') {
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

const calculateGenAIRisk = (qnAData: QnAProps[]) => {
  let score = 1; // Base score
  const factors = [];
  const infoMessages: string[] = [];
  const weights = {
    hallucination: 2.5,
    agentAutonomy: 2,
    promptInjection: 1.8,
    dataLeakage: 2.2,
    modelDrift: 1.5,
    tokenCosts: 1,
    contentModeration: 1.7
  };

  // Check if Gen AI is being used
  const genAIModelTypes = getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', 'Model Types') || [];
  const isGenAI = Array.isArray(genAIModelTypes) && (
    genAIModelTypes.includes("Generative AI") ||
    genAIModelTypes.includes("Large Language Model (LLM)") ||
    genAIModelTypes.includes("Multi-modal Models")
  );

  if (!isGenAI) {
    return {
      score: 0,
      factors: [],
      formula: "N/A - Not a Gen AI use case",
      infoMessages: []
    };
  }

  // Hallucination risk
  const maxHallucinationRate = getAnswer(qnAData, 'BUSINESS_FEASIBILITY', 'Max Hallucination Rate');
  if (!maxHallucinationRate || (typeof maxHallucinationRate === 'number' && maxHallucinationRate > 5)) {
    score += weights.hallucination;
    factors.push(`Hallucination risk (+${weights.hallucination})`);
    if (!maxHallucinationRate) {
      infoMessages.push("No hallucination rate threshold specified. Please define acceptable hallucination limits.");
    }
  }

  // Agent autonomy risk
  const agentArchitecture = getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', 'Agent Architecture');
  if (agentArchitecture && 
      ["Multi-agent System", "Hierarchical Agents", "Swarm Intelligence"].includes(agentArchitecture)) {
    score += weights.agentAutonomy;
    factors.push(`Complex agent autonomy (+${weights.agentAutonomy})`);
  }

  // Prompt injection vulnerability
  const genAIUserCategories = getAnswer(qnAData, 'BUSINESS_FEASIBILITY', 'User Categories') || [];
  if (Array.isArray(genAIUserCategories) && genAIUserCategories.includes("General Public")) {
    score += weights.promptInjection;
    factors.push(`Prompt injection risk (+${weights.promptInjection})`);
    infoMessages.push("Public-facing Gen AI system. Ensure prompt injection safeguards are in place.");
  }

  // Data leakage through model
  const genAIDataTypes = getAnswer(qnAData, 'DATA_READINESS', 'Data Types') || [];
  if (Array.isArray(genAIDataTypes) && (genAIDataTypes.includes("Confidential Business Data") ||
      genAIDataTypes.includes("Trade Secrets"))) {
    score += weights.dataLeakage;
    factors.push(`Data leakage risk (+${weights.dataLeakage})`);
  }

  // Model drift for continuous learning
  const genAIModelUpdateFrequency = getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', 'Model Update Frequency');
  if (genAIModelUpdateFrequency === "Real-time/Continuous") {
    score += weights.modelDrift;
    factors.push(`Model drift risk (+${weights.modelDrift})`);
  }

  // Token cost overrun
  const tokenUsage = getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', 'Estimated Monthly Token Usage');
  if (tokenUsage && typeof tokenUsage === 'number' && tokenUsage > 10000000) {
    score += weights.tokenCosts;
    factors.push(`High token costs (+${weights.tokenCosts})`);
  }

  // Content moderation needs
  const contentGenerationRisks = getAnswer(qnAData, 'ETHICAL_IMPACT', 'Content Generation Risks') || [];
  if (Array.isArray(contentGenerationRisks) && contentGenerationRisks.length > 2) {
    score += weights.contentModeration;
    factors.push(`Content moderation complexity (+${weights.contentModeration})`);
  }

  return {
    score: Math.min(score, 10),
    factors,
    formula: `Base(1) + ${factors.map(f => f.match(/\+(\d+\.?\d*)/)?.[1]).join(' + ')} = ${Math.min(score, 10)}`,
    infoMessages
  };
};

const calculateReputationRisk = (qnAData: QnAProps[]) => {
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
  const repUserCategories = getAnswer(qnAData, 'BUSINESS_FEASIBILITY', 'User Categories') || [];
  if (Array.isArray(repUserCategories) && repUserCategories.includes('General Public')) {
    score += weights.publicFacing;
    factors.push(`Public-facing system (+${weights.publicFacing})`);
  }

  // Social media amplification risk
  const repSystemCriticality = getAnswer(qnAData, 'BUSINESS_FEASIBILITY', 'System Criticality');
  if (Array.isArray(repUserCategories) && repUserCategories.includes('Customers') &&
      repSystemCriticality !== 'Non-Critical') {
    score += weights.socialMedia;
    factors.push(`Social media amplification (+${weights.socialMedia})`);
  }

  // Trust-critical decisions
  const repSectorSpecific = getAnswer(qnAData, 'RISK_ASSESSMENT', 'Sector-Specific Regulations');
  if (typeof repSectorSpecific === 'string' && repSectorSpecific === 'SOX (Financial Reporting)') {
    score += weights.trustCritical;
    factors.push(`Trust-critical decisions (+${weights.trustCritical})`);
    
    // Industry-specific trust factors
    // Removed problematic string comparisons
  }

  // Brand impact potential
  const repFailureImpact = getAnswer(qnAData, 'BUSINESS_FEASIBILITY', 'Failure Impact') || '';
  if (repFailureImpact !== 'Minimal/No Impact') {
    score += weights.brandImpact;
    factors.push(`Brand impact potential (+${weights.brandImpact})`);
  }

  return {
    score: Math.min(score, 10),
    factors,
    formula: `Base(1) + ${factors.map(f => f.match(/\+(\d+\.?\d*)/)?.[1]).join(' + ')} = ${Math.min(score, 10)}`
  };
}

const RiskCalculation = (qnAData: QnAProps[]) => {
  // Check if Gen AI use case
  const modelTypes = getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', 'Model Types') || [];
  const isGenAI = Array.isArray(modelTypes) && (
    modelTypes.includes("Generative AI") ||
    modelTypes.includes("Large Language Model (LLM)") ||
    modelTypes.includes("Multi-modal Models")
  );

  // Regulatory and data-focused weights (adjusted for Gen AI if applicable)
  const weights = isGenAI ? {
    dataPrivacy: 0.20,
    security: 0.15,
    regulatory: 0.25,
    ethical: 0.10,
    operational: 0.10,
    reputational: 0.05,
    genAI: 0.15
  } : {
    dataPrivacy: 0.25,
    security: 0.20,
    regulatory: 0.30,
    ethical: 0.10,
    operational: 0.10,
    reputational: 0.05
  };

  const dataPrivacyRisk = calculateDataPrivacyRisk(qnAData);
  const securityRisk = calculateSecurityRisk(qnAData);
  const regulatoryRisk = calculateRegulatoryRisk(qnAData);
  const ethicalRisk = calculateEthicalRisk(qnAData);
  const operationalRisk = calculateOperationalRisk(qnAData);
  const reputationRisk = calculateReputationRisk(qnAData);
  const genAIRisk = isGenAI ? calculateGenAIRisk(qnAData) : null;

  const chartData = [
    {month: "Data Privacy", desktop: dataPrivacyRisk.score},
    {month: "Security", desktop: securityRisk.score},
    {month: "Regulatory", desktop: regulatoryRisk.score},
    {month: "Ethical", desktop: ethicalRisk.score},
    {month: "Operational", desktop: operationalRisk.score},
    {month: "Reputational", desktop: reputationRisk.score}
  ];

  if (isGenAI && genAIRisk) {
    chartData.push({month: "Gen AI", desktop: genAIRisk.score});
  }

  // Calculate weighted average
  const weightedScore = isGenAI && genAIRisk ? 
    dataPrivacyRisk.score * weights.dataPrivacy + 
    securityRisk.score * weights.security + 
    regulatoryRisk.score * weights.regulatory + 
    ethicalRisk.score * weights.ethical + 
    operationalRisk.score * weights.operational + 
    reputationRisk.score * weights.reputational + 
    genAIRisk.score * (weights.genAI || 0) :
    dataPrivacyRisk.score * weights.dataPrivacy + 
    securityRisk.score * weights.security + 
    regulatoryRisk.score * weights.regulatory + 
    ethicalRisk.score * weights.ethical + 
    operationalRisk.score * weights.operational + 
    reputationRisk.score * weights.reputational;

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
    formula: isGenAI && genAIRisk ? 
      `(0.20×${dataPrivacyRisk.score} + 0.15×${securityRisk.score} + 0.25×${regulatoryRisk.score} + 0.10×${ethicalRisk.score} + 0.10×${operationalRisk.score} + 0.05×${reputationRisk.score} + 0.15×${genAIRisk.score})` :
      `(0.25×${dataPrivacyRisk.score} + 0.20×${securityRisk.score} + 0.30×${regulatoryRisk.score} + 0.10×${ethicalRisk.score} + 0.10×${operationalRisk.score} + 0.05×${reputationRisk.score})`,
    calculation: isGenAI ? 
      `(0.20×Privacy + 0.15×Security + 0.25×Regulatory + 0.10×Ethical + 0.10×Operational + 0.05×Reputational + 0.15×GenAI)` :
      `(0.25×Privacy + 0.20×Security + 0.30×Regulatory + 0.10×Ethical + 0.10×Operational + 0.05×Reputational)`,
    regulatoryWarnings: regulatoryRisk.regulatoryWarnings,
    dataPrivacyInfo: dataPrivacyRisk.infoMessages,
    securityInfo: securityRisk.infoMessages,
    operationalInfo: operationalRisk.infoMessages,
    ethicalInfo: ethicalRisk.infoMessages,
    genAIInfo: genAIRisk?.infoMessages || [],
    dataPrivacyFactors: dataPrivacyRisk.factors,
    securityFactors: securityRisk.factors,
    regulatoryFactors: regulatoryRisk.factors,
    ethicalFactors: ethicalRisk.factors,
    operationalFactors: operationalRisk.factors,
    reputationalFactors: reputationRisk.factors,
    genAIFactors: genAIRisk?.factors || []
  };
}

function getMissingAssessmentFields(qnAData: QnAProps[]) {
  if (!qnAData || qnAData.length === 0) return ['All assessment sections'];
  const missing = [];
  const dataTypes = getAnswer(qnAData, 'DATA_READINESS', 'Data Types');
  if (!dataTypes || !Array.isArray(dataTypes) || dataTypes.length === 0) missing.push('Data Readiness > Data Types');
  
  const modelTypes = getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', 'Model Types');
  if (!modelTypes || !Array.isArray(modelTypes) || modelTypes.length === 0) missing.push('Technical Feasibility > Model Types');
  
  const userCategories = getAnswer(qnAData, 'BUSINESS_FEASIBILITY', 'User Categories');
  if (!userCategories || !Array.isArray(userCategories) || userCategories.length === 0) missing.push('Business Feasibility > User Categories');
  
  const dataProtection = getAnswer(qnAData, 'RISK_ASSESSMENT', 'Data Protection');
  if (!dataProtection || !Array.isArray(dataProtection) || dataProtection.length === 0) missing.push('Risk Assessment > Jurisdictions');
  
  const explainabilityLevel = getAnswer(qnAData, 'ETHICAL_IMPACT', 'Explainability Level');
  if (!explainabilityLevel) missing.push('Ethical Impact > Explainability Level');
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
    // AI-specific approval fields
    aiGovernanceName: "",
    aiGovernanceStatus: "",
    aiGovernanceComment: "",
    modelValidationName: "",
    modelValidationStatus: "",
    modelValidationComment: "",
    aiEthicsName: "",
    aiEthicsStatus: "",
    aiEthicsComment: "",
  });
  const [_loading, setLoading] = useState(false);
  const [_saving, setSaving] = useState(false);
  const [_error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // New: Use case summary state
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [chartData, setChartData] = useState<{ month: string; desktop: number }[]>([]);
  const [finops, setFinops] = useState<any>(null);
  const [qnAData, setQnAData] = useState<any>(null);
  // Fetch financial data
  useEffect(() => {
    if (!useCaseId) 
      return;
    fetch(`/api/get-finops?id=${useCaseId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setFinops(data[0]);
      });
  }, [useCaseId]);

  useEffect(() => {
    if (!useCaseId) 
      return;
    fetch(`/api/get-assess-questions?useCaseId=${useCaseId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setQnAData(data);
        console.log("QnA Data:", data);
      });
  }, [useCaseId]);

  useEffect(() => {
    if (!useCaseId) return;
    setSummaryLoading(true);
    fetch(`/api/get-usecase-details?useCaseId=${useCaseId}`)
      .then((res) => res.json())
      .then((data) => {
        // console.log("[ApprovalsPage] API response from /api/get-usecase-details:", data);
        setSummary(data);
        setSummaryLoading(false);
      })
      .catch(() => {
        setSummaryError("Failed to load use case details");
        setSummaryLoading(false);
      });
  }, [useCaseId]);

  useEffect(() => {
    if (!qnAData) return; // prevents early/invalid call

    // console.log("[ApprovalsPage] qnAData set in state:", qnAData);
    const result = RiskCalculation(qnAData);
    setChartData(Array.isArray(result.chartData) ? result.chartData : []);
    // console.log("[ApprovalsPage] RiskCalculation result:", result);
  }, [qnAData]);
  

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
    const missingFields = getMissingAssessmentFields(qnAData ?? []);
    if (missingFields.length > 0) {
      // The original code had an alert here, but the edit hint implies removing it.
      // Since the edit hint is to remove the alert, and the alert is directly related to the missingFields,
      // we should remove the alert.
      // The original code had `alert('Please complete the following fields before completing assessment:\n' + missingFields.join('\n'));`
      // This line is removed as per the edit hint.
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
            metadata: {
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
    <div className="min-h-screen bg-background flex flex-col items-center py-8">
      <div className="w-full max-w-4xl bg-card rounded-2xl shadow-2xl border border-border p-8">
        {/* Problem Statement */}
        {summaryLoading ? (
          <div className="mb-6 text-muted-foreground">Loading use case summary...</div>
        ) : summaryError ? (
          <div className="mb-6 text-destructive">{summaryError}</div>
        ) : summary ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2 text-foreground">Problem Statement</h2>
              <div 
                className="text-foreground bg-muted rounded-lg p-4"
                dangerouslySetInnerHTML={{ 
                  __html: summary.problemStatement && typeof summary.problemStatement === 'string' && summary.problemStatement.trim() 
                    ? summary.problemStatement 
                    : '<span class="text-muted-foreground">Not specified</span>'
                }}
              />
              <h2 className="text-xl font-bold mb-2 text-foreground">Proposed Solution</h2>
              <div 
                className="text-foreground bg-muted rounded-lg p-4"
                dangerouslySetInnerHTML={{ 
                  __html: summary.proposedAISolution && typeof summary.proposedAISolution === 'string' && summary.proposedAISolution.trim() 
                    ? summary.proposedAISolution 
                    : '<span class="text-muted-foreground">Not specified</span>'
                }}
              />
            </div>
            {/* Radar Chart */}
            {Array.isArray(chartData) && chartData.length > 0 && (
              <ChartRadarDots chartData={chartData} />
            )}
            {/* Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-destructive">{formatCurrency(finops?.totalInvestment ?? 0)}</div>
                <div className="text-muted-foreground mt-1">Total Investment</div>
              </Card>
              <Card className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(finops?.cumValue ?? 0)}</div>
                <div className="text-muted-foreground mt-1">Total Value Generated</div>
              </Card>
              <Card className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-blue-600">{typeof finops?.ROI === 'number' ? `${finops.ROI.toFixed(1)}%` : '0%'}</div>
                <div className="text-muted-foreground mt-1">Net ROI</div>
              </Card>
              <Card className="flex flex-col items-center justify-center p-6">
                <div className="text-2xl font-bold text-green-600">{typeof finops?.breakEvenMonth === 'number' ? `${finops.breakEvenMonth} months` : 'N/A'}</div>
                <div className="text-muted-foreground mt-1">Payback Period</div>
              </Card>
            </div>
            {/* Risk Summary Card */}
            {qnAData && chartData && chartData.length > 0 && (() => {
              const riskResult = RiskCalculation(qnAData);
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
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded flex items-start gap-2 border border-gray-200 dark:border-gray-600">
                      <InformationCircleIcon className="w-5 h-5 mt-0.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="font-semibold mb-1">Regulatory frameworks have been automatically inferred:</div>
                        {riskResult.regulatoryWarnings.map((w, i) => <div key={i}>{w}</div>)}
                      </div>
                    </div>
                  )}
                  {riskResult.dataPrivacyInfo && riskResult.dataPrivacyInfo.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded flex items-start gap-2 border border-gray-200 dark:border-gray-600">
                      <InformationCircleIcon className="w-5 h-5 mt-0.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="font-semibold mb-1">Data Privacy:</div>
                        {riskResult.dataPrivacyInfo.map((w, i) => <div key={i}>{w}</div>)}
                      </div>
                    </div>
                  )}
                  {riskResult.securityInfo && riskResult.securityInfo.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded flex items-start gap-2 border border-gray-200 dark:border-gray-600">
                      <InformationCircleIcon className="w-5 h-5 mt-0.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="font-semibold mb-1">Security:</div>
                        {riskResult.securityInfo.map((w, i) => <div key={i}>{w}</div>)}
                      </div>
                    </div>
                  )}
                  {riskResult.operationalInfo && riskResult.operationalInfo.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded flex items-start gap-2 border border-gray-200 dark:border-gray-600">
                      <InformationCircleIcon className="w-5 h-5 mt-0.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="font-semibold mb-1">Operational:</div>
                        {riskResult.operationalInfo.map((w, i) => <div key={i}>{w}</div>)}
                      </div>
                    </div>
                  )}
                  {riskResult.ethicalInfo && riskResult.ethicalInfo.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded flex items-start gap-2 border border-gray-200 dark:border-gray-600">
                      <InformationCircleIcon className="w-5 h-5 mt-0.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="font-semibold mb-1">Ethical:</div>
                        {riskResult.ethicalInfo.map((w, i) => <div key={i}>{w}</div>)}
                      </div>
                    </div>
                  )}
                  {riskResult.genAIInfo && riskResult.genAIInfo.length > 0 && (
                    <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 rounded flex items-start gap-2 border border-purple-200 dark:border-purple-600">
                      <InformationCircleIcon className="w-5 h-5 mt-0.5 text-purple-400 flex-shrink-0" />
                      <div>
                        <div className="font-semibold mb-1">Gen AI Specific:</div>
                        {riskResult.genAIInfo.map((w, i) => <div key={i}>{w}</div>)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
            {/* After info messages, add a Risk Action Summary */}
            {(() => {
              if (!qnAData) return null;
              const riskResult = RiskCalculation(qnAData);
              // Gather risk scores, info, and factors
              const riskScores = [
                { label: 'Data Privacy', score: riskResult.chartData[0]?.desktop || 0, info: riskResult.dataPrivacyInfo, factors: riskResult.dataPrivacyFactors },
                { label: 'Security', score: riskResult.chartData[1]?.desktop || 0, info: riskResult.securityInfo, factors: riskResult.securityFactors },
                { label: 'Regulatory', score: riskResult.chartData[2]?.desktop || 0, info: riskResult.regulatoryWarnings, factors: riskResult.regulatoryFactors },
                { label: 'Ethical', score: riskResult.chartData[3]?.desktop || 0, info: riskResult.ethicalInfo, factors: riskResult.ethicalFactors },
                { label: 'Operational', score: riskResult.chartData[4]?.desktop || 0, info: riskResult.operationalInfo, factors: riskResult.operationalFactors },
                { label: 'Reputational', score: riskResult.chartData[5]?.desktop || 0, info: [], factors: riskResult.reputationalFactors },
              ];
              
              // Add Gen AI risk if applicable
              if (riskResult.chartData[6]) {
                riskScores.push({ 
                  label: 'Gen AI', 
                  score: riskResult.chartData[6]?.desktop || 0, 
                  info: riskResult.genAIInfo || [], 
                  factors: riskResult.genAIFactors || [] 
                });
              }
              // Sort by score descending
              const topRisks = riskScores.sort((a, b) => b.score - a.score).slice(0, 3);
              return (
                <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                    <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">Risk Action Summary</span>
                  </div>
                  <ul className="list-disc pl-6 space-y-2">
                    {topRisks.map((risk, idx) => (
                      <li key={idx}>
                        <span className="font-semibold">{risk.label} Risk ({risk.score}/10):</span>
                        {risk.score >= 8 ? (
                          <ul className="list-disc pl-6">
                            {(risk.info && risk.info.length > 0 ? risk.info : risk.factors).map((msg, i) => <li key={i} className="text-gray-900 dark:text-gray-100">Action: {msg}</li>)}
                          </ul>
                        ) : risk.score >= 4 ? (
                          <span className="text-gray-900 dark:text-gray-100 ml-2">Monitor this area. {risk.factors && risk.factors.length > 0 ? `Factors: ${risk.factors.join('; ')}` : ''}</span>
                        ) : (
                          <span className="text-gray-900 dark:text-gray-100 ml-2">No immediate action required.</span>
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

        {/* AI-Specific Approvals Section */}
        {(() => {
          const aiModelTypes = getAnswer(qnAData, 'TECHNICAL_FEASIBILITY', 'Model Types') || [];
          return Array.isArray(aiModelTypes) && (
            aiModelTypes.includes("Generative AI") || 
            aiModelTypes.includes("Large Language Model (LLM)") ||
            aiModelTypes.includes("Multi-modal Models")
          );
        })() && (
          <>
            <h3 className="text-xl font-bold mb-4 text-purple-600 dark:text-purple-400">AI-Specific Approvals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* AI Governance */}
              <Card className="mb-6 p-6">
                <h3 className="font-semibold text-lg mb-4">AI Governance</h3>
                <Input placeholder="Approver Name" value={form.aiGovernanceName} onChange={e => setForm(f => ({ ...f, aiGovernanceName: e.target.value }))} className="mb-2" />
                <select value={form.aiGovernanceStatus} onChange={e => setForm(f => ({ ...f, aiGovernanceStatus: e.target.value }))} className="mb-2 border rounded px-3 py-2">
                  <option value="">Select Status</option>
                  {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
                </select>
                <Input placeholder="Comments" value={form.aiGovernanceComment} onChange={e => setForm(f => ({ ...f, aiGovernanceComment: e.target.value }))} />
              </Card>
              
              {/* Model Validation */}
              <Card className="mb-6 p-6">
                <h3 className="font-semibold text-lg mb-4">Model Validation</h3>
                <Input placeholder="Approver Name" value={form.modelValidationName} onChange={e => setForm(f => ({ ...f, modelValidationName: e.target.value }))} className="mb-2" />
                <select value={form.modelValidationStatus} onChange={e => setForm(f => ({ ...f, modelValidationStatus: e.target.value }))} className="mb-2 border rounded px-3 py-2">
                  <option value="">Select Status</option>
                  {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
                </select>
                <Input placeholder="Comments" value={form.modelValidationComment} onChange={e => setForm(f => ({ ...f, modelValidationComment: e.target.value }))} />
              </Card>
              
              {/* AI Ethics Review */}
              <Card className="mb-6 p-6 md:col-span-2">
                <h3 className="font-semibold text-lg mb-4">AI Ethics Review</h3>
                <Input placeholder="Approver Name" value={form.aiEthicsName} onChange={e => setForm(f => ({ ...f, aiEthicsName: e.target.value }))} className="mb-2" />
                <select value={form.aiEthicsStatus} onChange={e => setForm(f => ({ ...f, aiEthicsStatus: e.target.value }))} className="mb-2 border rounded px-3 py-2">
                  <option value="">Select Status</option>
                  {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
                </select>
                <Input placeholder="Comments" value={form.aiEthicsComment} onChange={e => setForm(f => ({ ...f, aiEthicsComment: e.target.value }))} />
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

ApprovalsPage.displayName = 'ApprovalsPage';

export default ApprovalsPage; 