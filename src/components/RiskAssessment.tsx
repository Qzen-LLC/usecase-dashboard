'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import isEqual from 'lodash.isequal';
import { AlertTriangle, Globe, Shield, Award, ClipboardCheck, TrendingUp, Sparkles } from 'lucide-react';
import { Slider } from '@/components/ui/slider';


const RISK_LEVELS = {
  None: 'bg-muted hover:bg-accent text-muted-foreground rounded-full px-3 py-1 font-medium border border-border',
  Low: 'bg-green-100 hover:bg-green-200 text-green-800 rounded-full px-3 py-1 font-medium border border-green-300',
  Medium: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-full px-3 py-1 font-medium border border-yellow-300',
  High: 'bg-red-100 hover:bg-red-200 text-red-800 rounded-full px-3 py-1 font-medium border border-red-300',
  Critical: 'bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-full px-3 py-1 font-medium border border-purple-300',
};


type Risk = {
  risk: string;
  probability: string;
  impact: string;
};


type Props = {
  value: {
    technicalRisks: { risk: string; probability: string; impact: string }[];
    businessRisks: { risk: string; probability: string; impact: string }[];
    operatingJurisdictions?: { [region: string]: { [country: string]: boolean } };
    dataProtection?: { [key: string]: boolean };
    sectorSpecific?: { [key: string]: boolean };
    aiSpecific?: { [key: string]: boolean };
    certifications?: { [key: string]: boolean };
    auditRequirements?: string;
    complianceReporting?: string;
    riskTolerance?: string;
    aiExperience?: string;
    // Gen AI specific fields
    modelRisks?: { [key: string]: number };
    agentRisks?: { [key: string]: number };
    dependencyRisks?: string[];
  };
  onChange?: (data: Props['value']) => void;
};


const OPERATING_JURISDICTIONS = {
  Americas: [
    'United States (Federal)',
    'US State-specific (list states)',
    'Canada',
    'Mexico',
    'Brazil',
    'Argentina',
  ],
  Europe: [
    'European Union',
    'United Kingdom',
    'Switzerland',
    'Norway',
    'Russia',
  ],
  'Asia-Pacific': [
    'China',
    'Japan',
    'Singapore',
    'Australia',
    'India',
    'South Korea',
  ],
  'Middle East & Africa': [
    'UAE',
    'Saudi Arabia',
    'Israel',
    'South Africa',
  ],
};


const DATA_PROTECTION_OPTIONS = [
  'GDPR (EU)',
  'CCPA/CPRA (California)',
  'LGPD (Brazil)',
  'PIPEDA (Canada)',
  'POPI (South Africa)',
  'APPI (Japan)',
  'Privacy Act (Australia)',
  'PDPA (Singapore)',
  'Other State Privacy Laws',
];
const SECTOR_SPECIFIC_OPTIONS = [
  'HIPAA (Healthcare)',
  'PCI-DSS (Payment Cards)',
  'SOX (Financial Reporting)',
  'GLBA (Financial Privacy)',
  'FCRA (Credit Reporting)',
  'FERPA (Education)',
  'COPPA (Children\'s Privacy)',
  'CAN-SPAM (Email)',
  'TCPA (Communications)',
];
const AI_SPECIFIC_OPTIONS = [
  'EU AI Act',
  'UAE AI/GenAI Controls',
  'US AI Bill of Rights',
  'China AI Regulations',
  'UK AI Framework',
  'Canada AIDA',
  'Singapore Model AI Governance',
];
const CERTIFICATIONS_OPTIONS = [
  'ISO 27001 (Information Security)',
  'ISO 27701 (Privacy)',
  'ISO/IEC 23053 (AI)',
  'ISO/IEC 23894 (AI Risk)',
  'ISO/IEC 42001:2023 – AI Management System (AIMS)',
  'ISO/IEC JTC 1/SC 42 – AI Standardization Committee',
  'SOC 2',
  'FedRAMP',
  'NIST AI Standards and Risk Management Framework (RMF)',
  'AICPA AI Auditing',
  'IEEE AI Standards',
];
const AUDIT_REQUIREMENTS_OPTIONS = [
  'No Audit Required',
  'Annual Audit',
  'Quarterly Audit',
  'Continuous Monitoring',
  'Regulatory Examination',
];
const COMPLIANCE_REPORTING_OPTIONS = [
  'None Required',
  'Annual Reports',
  'Quarterly Reports',
  'Monthly Reports',
  'Real-time Dashboards',
  'Incident-based',
];


const RISK_TOLERANCE_OPTIONS = [
  'Risk Averse',
  'Conservative',
  'Moderate',
  'Aggressive',
  'Risk Seeking',
];
const AI_EXPERIENCE_OPTIONS = [
  'First AI Project',
  'Limited Experience',
  'Moderate Experience',
  'Extensive Experience',
  'AI-First Organization',
];

// Gen AI Specific Risk Options
const MODEL_RISKS = [
  'Model Hallucination Impact',
  'Prompt Injection Vulnerability',
  'Data Poisoning Risk',
  'Model Inversion Attacks',
  'Adversarial Inputs',
  'Model Drift/Degradation',
];

const AGENT_RISKS = [
  'Unauthorized Actions',
  'Infinite Loops/Recursion',
  'Resource Exhaustion',
  'Multi-agent Conflicts',
  'Cascading Failures',
  'Goal Misalignment',
];

const DEPENDENCY_RISKS = [
  'Model Provider Outage',
  'API Rate Limiting',
  'Token Cost Overrun',
  'Context Window Overflow',
  'Knowledge Base Corruption',
  'Third-party Service Failure',
];


export default function RiskAssessment({ value, onChange }: Props) {
  const lastSent = useRef<any>(null);

  // Debug logging to see what data is being received
  useEffect(() => {
    console.log('⚠️ [RISK] Component received value:', {
      technicalRisks: value.technicalRisks,
      businessRisks: value.businessRisks,
      modelRisks: value.modelRisks,
      agentRisks: value.agentRisks,
      dependencyRisks: value.dependencyRisks,
      vendorLockIn: value.vendorLockIn,
      apiStability: value.apiStability,
      costOverrun: value.costOverrun,
    });
  }, [value]);
  
  // Initialize state from value prop
  const [technicalRisks, setTechnicalRisks] = useState<Risk[]>(
    value?.technicalRisks || [
      { risk: 'Model accuracy degradation', probability: 'None', impact: 'None' },
      { risk: 'Data quality issues', probability: 'None', impact: 'None' },
      { risk: 'Integration failures', probability: 'None', impact: 'None' },
    ]
  );

  const [businessRisks, setBusinessRisks] = useState<Risk[]>(
    value?.businessRisks || [
      { risk: 'User adoption resistance', probability: 'None', impact: 'None' },
      { risk: 'Regulatory changes', probability: 'None', impact: 'None' },
      { risk: 'Competitive response', probability: 'None', impact: 'None'},
    ]
  );

  // Initialize other state from value prop
  const [operatingJurisdictions, setOperatingJurisdictions] = useState<{ [region: string]: { [country: string]: boolean } }>(() => {
    if (value?.operatingJurisdictions) {
      return value.operatingJurisdictions;
    }
    const initial: any = {};
    Object.entries(OPERATING_JURISDICTIONS).forEach(([region, countries]) => {
      initial[region] = {};
      countries.forEach((country) => {
        initial[region][country] = false;
      });
    });
    return initial;
  });

  const [dataProtection, setDataProtection] = useState<{ [key: string]: boolean }>(() => {
    if (value?.dataProtection) {
      return value.dataProtection;
    }
    return Object.fromEntries(DATA_PROTECTION_OPTIONS.map(opt => [opt, false]));
  });

  const [sectorSpecific, setSectorSpecific] = useState<{ [key: string]: boolean }>(() => {
    if (value?.sectorSpecific) {
      return value.sectorSpecific;
    }
    return Object.fromEntries(SECTOR_SPECIFIC_OPTIONS.map(opt => [opt, false]));
  });

  const [aiSpecific, setAiSpecific] = useState<{ [key: string]: boolean }>(() => {
    if (value?.aiSpecific) {
      return value.aiSpecific;
    }
    return Object.fromEntries(AI_SPECIFIC_OPTIONS.map(opt => [opt, false]));
  });

  const [certifications, setCertifications] = useState<{ [key: string]: boolean }>(() => {
    if (value?.certifications) {
      return value.certifications;
    }
    return Object.fromEntries(CERTIFICATIONS_OPTIONS.map(opt => [opt, false]));
  });

  const [auditRequirements, setAuditRequirements] = useState(value?.auditRequirements || 'No Audit Required');
  const [complianceReporting, setComplianceReporting] = useState(value?.complianceReporting || 'None Required');
  const [riskTolerance, setRiskTolerance] = useState(value?.riskTolerance || 'Risk Averse');
  const [aiExperience, setAiExperience] = useState(value?.aiExperience || 'First AI Project');

  // Update state when value prop changes (for data persistence)
  useEffect(() => {
    if (value?.technicalRisks) {
      setTechnicalRisks(value.technicalRisks);
    }
    if (value?.businessRisks) {
      setBusinessRisks(value.businessRisks);
    }
    if (value?.operatingJurisdictions) {
      setOperatingJurisdictions(value.operatingJurisdictions);
    }
    if (value?.dataProtection) {
      setDataProtection(value.dataProtection);
    }
    if (value?.sectorSpecific) {
      setSectorSpecific(value.sectorSpecific);
    }
    if (value?.aiSpecific) {
      setAiSpecific(value.aiSpecific);
    }
    if (value?.certifications) {
      setCertifications(value.certifications);
    }
    if (value?.auditRequirements) {
      setAuditRequirements(value.auditRequirements);
    }
    if (value?.complianceReporting) {
      setComplianceReporting(value.complianceReporting);
    }
    if (value?.riskTolerance) {
      setRiskTolerance(value.riskTolerance);
    }
    if (value?.aiExperience) {
      setAiExperience(value.aiExperience);
    }
  }, [value]);

  useEffect(() => {
    const currentData = {
      technicalRisks,
      businessRisks,
      operatingJurisdictions,
      dataProtection,
      sectorSpecific,
      aiSpecific,
      certifications,
      auditRequirements,
      complianceReporting,
      riskTolerance,
      aiExperience,
      // Include Gen AI specific fields
      modelRisks: value.modelRisks,
      agentRisks: value.agentRisks,
      dependencyRisks: value.dependencyRisks,
      vendorLockIn: value.vendorLockIn,
      apiStability: value.apiStability,
      costOverrun: value.costOverrun,
    };
    if (onChange && !isEqual(currentData, lastSent.current)) {
      onChange(currentData);
      lastSent.current = currentData;
    }
  }, [technicalRisks, businessRisks, operatingJurisdictions, dataProtection, sectorSpecific, aiSpecific, certifications, auditRequirements, complianceReporting, riskTolerance, aiExperience, value.modelRisks, value.agentRisks, value.dependencyRisks, value.vendorLockIn, value.apiStability, value.costOverrun, onChange]);


  const handleSelectChange = (
    type: 'technical' | 'business',
    index: number,
    field: 'probability' | 'impact',
    value: string
  ) => {
    const updater = type === 'technical' ? setTechnicalRisks : setBusinessRisks;
    updater((prevRisks) => {
      const newRisks = [...prevRisks];
      newRisks[index] = { ...newRisks[index], [field]: value };
      return newRisks;
    });
  };


  const renderRiskRow = (item: Risk, index: number, type: 'technical' | 'business') => (
    <div
      key={index}
      className="flex items-center justify-between border rounded-lg p-4"
    >
      <div className="text-sm font-medium flex-1">{item.risk}</div>
      <div className="flex gap-2">
        <Select
          value={item.probability}
          onValueChange={(val) => handleSelectChange(type, index, 'probability', val)}
        >
          <SelectTrigger className={RISK_LEVELS[item.probability as keyof typeof RISK_LEVELS]}>
            <SelectValue placeholder="Probability" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(RISK_LEVELS).map(([level, className]) => (
              <SelectItem key={level} value={level}>
                <span className={className}>{level}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={item.impact}
          onValueChange={(val) => handleSelectChange(type, index, 'impact', val)}
        >
          <SelectTrigger className={RISK_LEVELS[item.impact as keyof typeof RISK_LEVELS]}>
            <SelectValue placeholder="Impact" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(RISK_LEVELS).map(([level, className]) => (
              <SelectItem key={level} value={level}>
                <span className={className}>{level}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );


  return (
    <div className="space-y-10">
      <div className="bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 dark:from-red-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 border-l-4 border-red-400 dark:border-red-300 p-4 mb-8 rounded-2xl flex items-center gap-3 shadow-md">
        <div className="font-semibold text-red-800 dark:text-red-200 text-lg mb-1">Risk Assessment</div>
        <div className="text-red-700 dark:text-red-300">Identify, evaluate, and plan mitigation strategies for potential risks.</div>
      </div>

      {/* Risk Identification Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-warning" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Risk Identification</h3>
              <p className="text-sm text-muted-foreground">Assess technical and business risks with probability and impact ratings</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Technical Risks</h4>
            <div className="space-y-3">
              {value.technicalRisks.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                  <span className="flex-1 text-sm text-foreground">{item.risk}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24 text-center">Probability</span>
                    <Select
                      value={item.probability}
                      onValueChange={(val) => handleSelectChange('technicalRisks', index, 'probability', val)}
                    >
                      <SelectTrigger className={RISK_LEVELS[item.probability as keyof typeof RISK_LEVELS]}>
                        <SelectValue placeholder="Probability" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(RISK_LEVELS).map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24 text-center">Impact</span>
                    <Select
                      value={item.impact}
                      onValueChange={(val) => handleSelectChange('technicalRisks', index, 'impact', val)}
                    >
                      <SelectTrigger className={RISK_LEVELS[item.impact as keyof typeof RISK_LEVELS]}>
                        <SelectValue placeholder="Impact" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(RISK_LEVELS).map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-2">Business Risks</h4>
            <div className="space-y-3">
              {value.businessRisks.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                  <span className="flex-1 text-sm text-foreground">{item.risk}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24 text-center">Probability</span>
                    <Select
                      value={item.probability}
                      onValueChange={(val) => handleSelectChange('businessRisks', index, 'probability', val)}
                    >
                      <SelectTrigger className={RISK_LEVELS[item.probability as keyof typeof RISK_LEVELS]}>
                        <SelectValue placeholder="Probability" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(RISK_LEVELS).map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24 text-center">Impact</span>
                    <Select
                      value={item.impact}
                      onValueChange={(val) => handleSelectChange('businessRisks', index, 'impact', val)}
                    >
                      <SelectTrigger className={RISK_LEVELS[item.impact as keyof typeof RISK_LEVELS]}>
                        <SelectValue placeholder="Impact" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(RISK_LEVELS).map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Jurisdictional Requirements Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Jurisdictional Requirements</h3>
              <p className="text-sm text-muted-foreground">Select operating jurisdictions to identify applicable legal requirements</p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-foreground mb-4">Operating Jurisdictions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(OPERATING_JURISDICTIONS).map(([region, countries]) => (
              <div key={region} className="border border-border rounded-lg p-4">
                <div className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">{region}</div>
                <div className="space-y-1">
                  {countries.map((country) => (
                    <label key={country} className="flex items-center gap-2 hover:bg-accent p-1 rounded">
                      <Checkbox
                        checked={operatingJurisdictions[region][country]}
                        onCheckedChange={(checked) =>
                          setOperatingJurisdictions((prev) => ({
                            ...prev,
                            [region]: {
                              ...prev[region],
                              [country]: !!checked,
                            },
                          }))
                        }
                      />
                      <span className="text-sm text-foreground">{country}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regulatory Frameworks Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-warning" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Regulatory Frameworks</h3>
              <p className="text-sm text-muted-foreground">Identify applicable regulatory requirements for your AI system</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">Data Protection</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {DATA_PROTECTION_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 hover:bg-accent p-1 rounded">
                  <Checkbox
                    checked={dataProtection[option]}
                    onCheckedChange={checked => setDataProtection(prev => ({ ...prev, [option]: !!checked }))}
                  />
                  <span className="text-sm text-foreground">{option}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">Sector-Specific</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SECTOR_SPECIFIC_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 hover:bg-accent p-1 rounded">
                  <Checkbox
                    checked={sectorSpecific[option]}
                    onCheckedChange={checked => setSectorSpecific(prev => ({ ...prev, [option]: !!checked }))}
                  />
                  <span className="text-sm text-foreground">{option}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">AI-Specific Regulations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {AI_SPECIFIC_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 hover:bg-accent p-1 rounded">
                  <Checkbox
                    checked={aiSpecific[option]}
                    onCheckedChange={checked => setAiSpecific(prev => ({ ...prev, [option]: !!checked }))}
                  />
                  <span className="text-sm text-foreground">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Industry Standards Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-success" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Industry Standards</h3>
              <p className="text-sm text-muted-foreground">Select applicable certifications and standards for your AI system</p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-foreground mb-4">Certifications/Standards</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CERTIFICATIONS_OPTIONS.map(option => (
              <label key={option} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border">
                <Checkbox
                  checked={certifications[option]}
                  onCheckedChange={checked => setCertifications(prev => ({ ...prev, [option]: !!checked }))}
                />
                <span className="text-sm text-foreground">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Audit & Compliance Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Audit & Compliance</h3>
              <p className="text-sm text-muted-foreground">Define audit requirements and compliance reporting needs</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-4">Audit Requirements</h4>
            <RadioGroup value={auditRequirements} onValueChange={setAuditRequirements} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {AUDIT_REQUIREMENTS_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded">
                  <RadioGroupItem value={option} id={option} className="mr-2" />
                  <span className="text-sm text-foreground">{option}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Compliance Reporting</h4>
            <RadioGroup value={complianceReporting} onValueChange={setComplianceReporting} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {COMPLIANCE_REPORTING_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded">
                  <RadioGroupItem value={option} id={option} className="mr-2" />
                  <span className="text-sm text-foreground">{option}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Risk Appetite Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-warning" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Risk Appetite</h3>
              <p className="text-sm text-muted-foreground">Define your organization's risk tolerance and AI experience level</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-4">Organization Risk Tolerance</h4>
            <RadioGroup
              value={riskTolerance}
              onValueChange={setRiskTolerance}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {RISK_TOLERANCE_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded">
                  <RadioGroupItem value={option} id={option} className="mr-2" />
                  <span className="text-sm text-foreground">{option}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Previous AI Experience</h4>
            <RadioGroup
              value={aiExperience}
              onValueChange={setAiExperience}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {AI_EXPERIENCE_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded">
                  <RadioGroupItem value={option} id={option} className="mr-2" />
                  <span className="text-sm text-foreground">{option}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Gen AI Specific Risks Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Gen AI Specific Risks</h3>
              <p className="text-sm text-muted-foreground">Assess risks specific to generative AI and agent systems</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <h4 className="font-semibold text-foreground mb-4">Model Risks (Severity 1-5)</h4>
            <div className="space-y-4">
              {MODEL_RISKS.map((risk) => (
                <div key={risk} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{risk}</span>
                    <span className="text-sm text-muted-foreground">
                      {value.modelRisks?.[risk] || 1}/5
                    </span>
                  </div>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[value.modelRisks?.[risk] || 1]}
                    onValueChange={([val]) => {
                      const newModelRisks = { ...value.modelRisks, [risk]: val };
                      onChange?.({ ...value, modelRisks: newModelRisks });
                    }}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Agent Risks (Severity 1-5)</h4>
            <div className="space-y-4">
              {AGENT_RISKS.map((risk) => (
                <div key={risk} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{risk}</span>
                    <span className="text-sm text-muted-foreground">
                      {value.agentRisks?.[risk] || 1}/5
                    </span>
                  </div>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[value.agentRisks?.[risk] || 1]}
                    onValueChange={([val]) => {
                      const newAgentRisks = { ...value.agentRisks, [risk]: val };
                      onChange?.({ ...value, agentRisks: newAgentRisks });
                    }}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Dependency Risks</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEPENDENCY_RISKS.map((risk) => (
                <label key={risk} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                  <Checkbox
                    checked={value.dependencyRisks?.includes(risk) || false}
                    onCheckedChange={(checked) => {
                      const currentRisks = value.dependencyRisks || [];
                      const newRisks = checked 
                        ? [...currentRisks, risk]
                        : currentRisks.filter(r => r !== risk);
                      onChange?.({ ...value, dependencyRisks: newRisks });
                    }}
                  />
                  <span className="text-sm text-foreground">{risk}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
