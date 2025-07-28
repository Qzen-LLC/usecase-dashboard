// Risk calculation utilities shared across the application

export interface StepsData {
  dataReadiness?: {
    dataTypes?: string[];
    dataVolume?: string;
    crossBorderTransfer?: boolean;
    dataUpdate?: string;
    dataRetention?: string;
  };
  riskAssessment?: {
    dataProtection?: {
      jurisdictions?: string[];
    };
    operatingJurisdictions?: any;
    complianceReporting?: string;
    riskTolerance?: string;
  };
  technicalFeasibility?: {
    authentication?: string;
    encryption?: string;
    accessControl?: string;
    apiSecurity?: string;
    incidentResponse?: string;
  };
  businessFeasibility?: {
    businessCriticality?: string;
    sla?: string;
    disasterRecovery?: string;
    changeManagement?: string;
  };
  ethicalImpact?: {
    biasDetection?: string;
    humanOversight?: string;
    transparencyLevel?: string;
    appealProcess?: string;
  };
  vendorAssessment?: {
    thirdPartyDependencies?: string;
    vendorCount?: number;
    vendorCompliance?: string;
  };
}

export interface RiskScore {
  score: number;
  factors: string[];
  infoMessages: string[];
  regulatoryWarnings?: string[];
}

export interface RiskCalculationResult {
  chartData: Array<{ month: string; desktop: number }>;
  score: number;
  riskTier: 'low' | 'medium' | 'high' | 'critical';
  formula: string;
  calculation: string;
  regulatoryWarnings: string[];
  dataPrivacyInfo: string[];
  securityInfo: string[];
  operationalInfo: string[];
  ethicalInfo: string[];
  dataPrivacyFactors: string[];
  securityFactors: string[];
  regulatoryFactors: string[];
  ethicalFactors: string[];
  operationalFactors: string[];
  reputationalFactors: string[];
}

const calculateDataPrivacyRisk = (stepsData: StepsData): RiskScore => {
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
  const hasSensitiveData = Array.isArray(stepsData?.dataReadiness?.dataTypes) && 
    stepsData.dataReadiness.dataTypes.some(type => sensitiveTypes.includes(type || ''));
  
  if (hasSensitiveData) {
    score += weights.sensitiveData;
    factors.push(`Processing sensitive PII (+${weights.sensitiveData})`);
  }
  
  if (stepsData?.dataReadiness?.dataTypes?.includes("Children's Data (under 16)")) {
    infoMessages.push("Children's Data (under 16) detected. Data privacy risk has been flagged as sensitive.");
  }
  
  if (stepsData?.dataReadiness?.dataTypes?.includes("Biometric Data")) {
    infoMessages.push("Biometric Data detected. Data privacy risk has been flagged as sensitive.");
  }
  
  if (stepsData?.dataReadiness?.crossBorderTransfer && 
      (!stepsData?.riskAssessment?.dataProtection?.jurisdictions || 
       stepsData?.riskAssessment?.dataProtection?.jurisdictions.length === 0)) {
    infoMessages.push("Cross-border data transfer is required, but no jurisdictions are specified. Please review data protection requirements.");
  }
  
  if (stepsData?.dataReadiness?.dataVolume === '>1M records') {
    score += weights.largeVolume;
    factors.push(`Large data volume (+${weights.largeVolume})`);
  }
  
  if (stepsData?.dataReadiness?.crossBorderTransfer) {
    score += weights.crossBorder;
    factors.push(`Cross-border transfer (+${weights.crossBorder})`);
  }
  
  if (stepsData?.dataReadiness?.dataUpdate === 'Real-time') {
    score += weights.realTime;
    factors.push(`Real-time processing (+${weights.realTime})`);
  }
  
  if (stepsData?.dataReadiness?.dataRetention === '>5 years') {
    score += weights.retention;
    factors.push(`Long retention period (+${weights.retention})`);
  }
  
  const jurisdictionCount = stepsData?.riskAssessment?.operatingJurisdictions ? 
    Object.keys(stepsData.riskAssessment.operatingJurisdictions).length : 0;
  
  if (jurisdictionCount > 3) {
    score += weights.multiJurisdiction;
    factors.push(`Multiple jurisdictions (+${weights.multiJurisdiction})`);
  }
  
  return { score: Math.min(10, Math.round(score)), factors, infoMessages };
};

const calculateSecurityRisk = (stepsData: StepsData): RiskScore => {
  let score = 1;
  const factors = [];
  const infoMessages: string[] = [];
  const weights = {
    weakAuth: 2,
    noEncryption: 3,
    publicAccess: 2,
    noIncidentResponse: 1.5,
    vendorRisk: 1
  };
  
  if (stepsData?.technicalFeasibility?.authentication === 'Basic' || 
      stepsData?.technicalFeasibility?.authentication === 'None') {
    score += weights.weakAuth;
    factors.push(`Weak authentication (+${weights.weakAuth})`);
  }
  
  if (stepsData?.technicalFeasibility?.encryption === 'None') {
    score += weights.noEncryption;
    factors.push(`No encryption (+${weights.noEncryption})`);
    infoMessages.push("No encryption detected. This significantly increases security risk.");
  }
  
  if (stepsData?.technicalFeasibility?.accessControl === 'Public') {
    score += weights.publicAccess;
    factors.push(`Public access (+${weights.publicAccess})`);
  }
  
  if (stepsData?.technicalFeasibility?.incidentResponse === 'None') {
    score += weights.noIncidentResponse;
    factors.push(`No incident response (+${weights.noIncidentResponse})`);
  }
  
  if (stepsData?.vendorAssessment?.vendorCount && stepsData.vendorAssessment.vendorCount > 5) {
    score += weights.vendorRisk;
    factors.push(`Multiple vendors (+${weights.vendorRisk})`);
  }
  
  return { score: Math.min(10, Math.round(score)), factors, infoMessages };
};

const calculateRegulatoryRisk = (stepsData: StepsData): RiskScore => {
  let score = 1;
  const factors = [];
  const regulatoryWarnings: string[] = [];
  const weights = {
    multiJurisdiction: 2,
    lowCompliance: 3,
    highRiskTolerance: 1.5,
    gdpr: 2,
    hipaa: 2.5,
    finra: 2
  };
  
  const jurisdictionCount = stepsData?.riskAssessment?.operatingJurisdictions ? 
    Object.values(stepsData.riskAssessment.operatingJurisdictions)
      .flat()
      .filter(Boolean).length : 0;
  
  if (jurisdictionCount > 5) {
    score += weights.multiJurisdiction;
    factors.push(`Complex multi-jurisdiction (+${weights.multiJurisdiction})`);
  }
  
  if (stepsData?.riskAssessment?.complianceReporting === 'Minimal') {
    score += weights.lowCompliance;
    factors.push(`Minimal compliance reporting (+${weights.lowCompliance})`);
  }
  
  if (stepsData?.riskAssessment?.riskTolerance === 'High') {
    score += weights.highRiskTolerance;
    factors.push(`High risk tolerance (+${weights.highRiskTolerance})`);
  }
  
  // Check for specific regulations
  const hasEU = stepsData?.riskAssessment?.operatingJurisdictions?.Europe?.['European Union'];
  const hasHealthData = stepsData?.dataReadiness?.dataTypes?.includes('Health/Medical Records');
  const hasFinancialData = stepsData?.dataReadiness?.dataTypes?.includes('Financial Records');
  
  if (hasEU) {
    score += weights.gdpr;
    factors.push(`GDPR compliance required (+${weights.gdpr})`);
    regulatoryWarnings.push("EU operations require GDPR compliance");
  }
  
  if (hasHealthData) {
    score += weights.hipaa;
    factors.push(`HIPAA compliance required (+${weights.hipaa})`);
    regulatoryWarnings.push("Health data requires HIPAA compliance");
  }
  
  if (hasFinancialData) {
    score += weights.finra;
    factors.push(`Financial regulations apply (+${weights.finra})`);
    regulatoryWarnings.push("Financial data subject to additional regulations");
  }
  
  return { 
    score: Math.min(10, Math.round(score)), 
    factors, 
    infoMessages: [],
    regulatoryWarnings 
  };
};

const calculateEthicalRisk = (stepsData: StepsData): RiskScore => {
  let score = 1;
  const factors = [];
  const infoMessages: string[] = [];
  const weights = {
    noBiasDetection: 2,
    noHumanOversight: 2.5,
    lowTransparency: 1.5,
    noAppealProcess: 1
  };
  
  if (stepsData?.ethicalImpact?.biasDetection === 'None') {
    score += weights.noBiasDetection;
    factors.push(`No bias detection (+${weights.noBiasDetection})`);
    infoMessages.push("No bias detection mechanism in place. Consider implementing fairness measures.");
  }
  
  if (stepsData?.ethicalImpact?.humanOversight === 'None') {
    score += weights.noHumanOversight;
    factors.push(`No human oversight (+${weights.noHumanOversight})`);
  }
  
  if (stepsData?.ethicalImpact?.transparencyLevel === 'Low') {
    score += weights.lowTransparency;
    factors.push(`Low transparency (+${weights.lowTransparency})`);
  }
  
  if (stepsData?.ethicalImpact?.appealProcess === 'None') {
    score += weights.noAppealProcess;
    factors.push(`No appeal process (+${weights.noAppealProcess})`);
  }
  
  return { score: Math.min(10, Math.round(score)), factors, infoMessages };
};

const calculateOperationalRisk = (stepsData: StepsData): RiskScore => {
  let score = 1;
  const factors = [];
  const infoMessages: string[] = [];
  const weights = {
    missionCritical: 3,
    highSLA: 2,
    noDisasterRecovery: 2.5,
    poorChangeManagement: 1.5
  };
  
  if (stepsData?.businessFeasibility?.businessCriticality === 'Mission Critical') {
    score += weights.missionCritical;
    factors.push(`Mission critical system (+${weights.missionCritical})`);
    infoMessages.push("Mission critical system identified. Ensure robust operational controls.");
  }
  
  if (stepsData?.businessFeasibility?.sla === '99.99%') {
    score += weights.highSLA;
    factors.push(`High availability requirement (+${weights.highSLA})`);
  }
  
  if (stepsData?.businessFeasibility?.disasterRecovery === 'None') {
    score += weights.noDisasterRecovery;
    factors.push(`No disaster recovery (+${weights.noDisasterRecovery})`);
  }
  
  if (stepsData?.businessFeasibility?.changeManagement === 'Ad-hoc') {
    score += weights.poorChangeManagement;
    factors.push(`Ad-hoc change management (+${weights.poorChangeManagement})`);
  }
  
  return { score: Math.min(10, Math.round(score)), factors, infoMessages };
};

const calculateReputationRisk = (stepsData: StepsData): RiskScore => {
  let score = 1;
  const factors = [];
  const weights = {
    publicFacing: 1.5,
    sensitiveData: 2,
    lowTransparency: 1,
    multipleVendors: 0.5
  };
  
  if (stepsData?.technicalFeasibility?.accessControl === 'Public') {
    score += weights.publicFacing;
    factors.push(`Public-facing system (+${weights.publicFacing})`);
  }
  
  const sensitiveTypes = ['Health/Medical Records', 'Financial Records', 'Biometric Data', "Children's Data (under 16)"];
  const hasSensitiveData = Array.isArray(stepsData?.dataReadiness?.dataTypes) && 
    stepsData.dataReadiness.dataTypes.some(type => sensitiveTypes.includes(type || ''));
  
  if (hasSensitiveData) {
    score += weights.sensitiveData;
    factors.push(`Sensitive data exposure risk (+${weights.sensitiveData})`);
  }
  
  if (stepsData?.ethicalImpact?.transparencyLevel === 'Low') {
    score += weights.lowTransparency;
    factors.push(`Low transparency (+${weights.lowTransparency})`);
  }
  
  if (stepsData?.vendorAssessment?.vendorCount && stepsData.vendorAssessment.vendorCount > 3) {
    score += weights.multipleVendors;
    factors.push(`Third-party dependency (+${weights.multipleVendors})`);
  }
  
  return { score: Math.min(10, Math.round(score)), factors, infoMessages: [] };
};

export const calculateRiskScores = (stepsData: StepsData): RiskCalculationResult => {
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
    { month: "Data Privacy", desktop: dataPrivacyRisk.score },
    { month: "Security", desktop: securityRisk.score },
    { month: "Regulatory", desktop: regulatoryRisk.score },
    { month: "Ethical", desktop: ethicalRisk.score },
    { month: "Operational", desktop: operationalRisk.score },
    { month: "Reputational", desktop: reputationRisk.score }
  ];
  
  // Calculate weighted average
  const weightedScore = 
    dataPrivacyRisk.score * weights.dataPrivacy + 
    securityRisk.score * weights.security + 
    regulatoryRisk.score * weights.regulatory + 
    ethicalRisk.score * weights.ethical + 
    operationalRisk.score * weights.operational + 
    reputationRisk.score * weights.reputational;

  // Determine risk tier
  let riskTier: 'low' | 'medium' | 'high' | 'critical';
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
    regulatoryWarnings: regulatoryRisk.regulatoryWarnings || [],
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
};

// Helper function to convert risk score to risk level
export const getRiskLevel = (score: number): 'Low' | 'Medium' | 'High' | 'Critical' => {
  if (score >= 8) return 'Critical';
  if (score >= 6) return 'High';
  if (score >= 4) return 'Medium';
  return 'Low';
};

// Helper function to get risk category scores from steps data
export const getRiskCategoryScores = (stepsData: StepsData) => {
  const result = calculateRiskScores(stepsData);
  return {
    technical: result.chartData.find(d => d.month === "Security")?.desktop || 0,
    business: result.chartData.find(d => d.month === "Operational")?.desktop || 0,
    data: result.chartData.find(d => d.month === "Data Privacy")?.desktop || 0,
    ethical: result.chartData.find(d => d.month === "Ethical")?.desktop || 0,
    operational: result.chartData.find(d => d.month === "Operational")?.desktop || 0,
    regulatory: result.chartData.find(d => d.month === "Regulatory")?.desktop || 0,
  };
};