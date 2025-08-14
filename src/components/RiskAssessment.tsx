'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import isEqual from 'lodash.isequal';


const riskLevels = ['None', 'Low', 'Medium', 'High'];


// Optional: Color classes for each risk level
const riskLevelColors: Record<string, string> = {
  None: 'bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full px-3 py-1 font-medium border border-gray-100',
  Low: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-500 rounded-full px-3 py-1 font-medium border border-emerald-100',
  Medium: 'bg-amber-50 hover:bg-amber-100 text-amber-500 rounded-full px-3 py-1 font-medium border border-amber-100',
  High: 'bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-full px-3 py-1 font-medium border border-rose-100',
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


export default function RiskAssessment({ value, onChange }: Props) {
  const lastSent = useRef<any>(null);
  
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
    };
    if (onChange && !isEqual(currentData, lastSent.current)) {
      onChange(currentData);
      lastSent.current = currentData;
    }
  }, [technicalRisks, businessRisks, operatingJurisdictions, dataProtection, sectorSpecific, aiSpecific, certifications, auditRequirements, complianceReporting, riskTolerance, aiExperience, onChange]);


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
          <SelectTrigger className={riskLevelColors[item.probability]}>
            <SelectValue placeholder="Probability" />
          </SelectTrigger>
          <SelectContent>
            {riskLevels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={item.impact}
          onValueChange={(val) => handleSelectChange(type, index, 'impact', val)}
        >
          <SelectTrigger className={riskLevelColors[item.impact]}>
            <SelectValue placeholder="Impact" />
          </SelectTrigger>
          <SelectContent>
            {riskLevels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );


  return (
    <div className="space-y-10">
      <div className="bg-gradient-to-r from-[#b3d8fa] via-[#d1b3fa] to-[#f7b3e3] border-l-4 border-red-400 p-4 mb-8 rounded-2xl flex items-center gap-3 shadow-md">
        <div className="font-semibold text-red-800 text-lg mb-1">Risk Assessment</div>
        <div className="text-red-700">Identify, evaluate, and plan mitigation strategies for potential risks.</div>
      </div>

      {/* Risk Identification Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Risk Identification</h3>
          <p className="text-sm text-gray-600">Assess technical and business risks with probability and impact ratings</p>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 mb-2">Technical Risks</h4>
            {/* Header Row */}
            <div className="flex items-center justify-between px-4">
              <div className="flex-1"></div>
              <div className="flex gap-2 w-52 justify-end">
                <span className="text-xs text-gray-500 w-24 text-center">Probability</span>
                <span className="text-xs text-gray-500 w-24 text-center">Impact</span>
              </div>
            </div>
            {technicalRisks.map((item, index) => renderRiskRow(item, index, 'technical'))}
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 mb-2">Business Risks</h4>
            {/* Header Row */}
            <div className="flex items-center justify-between px-4">
              <div className="flex-1"></div>
              <div className="flex gap-2 w-52 justify-end">
                <span className="text-xs text-gray-500 w-24 text-center">Probability</span>
                <span className="text-xs text-gray-500 w-24 text-center">Impact</span>
              </div>
            </div>
            {businessRisks.map((item, index) => renderRiskRow(item, index, 'business'))}
          </div>
        </div>
      </div>


      {/* Jurisdictional Requirements Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Jurisdictional Requirements</h3>
          <p className="text-sm text-gray-600">Select operating jurisdictions to identify applicable legal requirements</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Operating Jurisdictions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(OPERATING_JURISDICTIONS).map(([region, countries]) => (
              <div key={region} className="border border-gray-200 rounded-lg p-4">
                <div className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">{region}</div>
                <div className="flex flex-col gap-2">
                  {countries.map((country) => (
                    <label key={country} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
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
                      <span className="text-sm">{country}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Regulatory Frameworks Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Regulatory Frameworks</h3>
          <p className="text-sm text-gray-600">Identify applicable regulatory requirements for your AI system</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Data Protection */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Data Protection</h4>
            <div className="flex flex-col gap-2">
              {DATA_PROTECTION_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
                  <Checkbox
                    checked={dataProtection[option]}
                    onCheckedChange={checked => setDataProtection(prev => ({ ...prev, [option]: !!checked }))}
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Sector-Specific */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Sector-Specific</h4>
            <div className="flex flex-col gap-2">
              {SECTOR_SPECIFIC_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
                  <Checkbox
                    checked={sectorSpecific[option]}
                    onCheckedChange={checked => setSectorSpecific(prev => ({ ...prev, [option]: !!checked }))}
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* AI-Specific Regulations */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">AI-Specific Regulations</h4>
            <div className="flex flex-col gap-2">
              {AI_SPECIFIC_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
                  <Checkbox
                    checked={aiSpecific[option]}
                    onCheckedChange={checked => setAiSpecific(prev => ({ ...prev, [option]: !!checked }))}
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Industry Standards Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Industry Standards</h3>
          <p className="text-sm text-gray-600">Select applicable certifications and standards for your AI system</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Certifications/Standards</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CERTIFICATIONS_OPTIONS.map(option => (
              <label key={option} className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded border border-gray-100">
                <Checkbox
                  checked={certifications[option]}
                  onCheckedChange={checked => setCertifications(prev => ({ ...prev, [option]: !!checked }))}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>


      {/* Audit & Compliance Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Audit & Compliance</h3>
          <p className="text-sm text-gray-600">Define audit requirements and compliance reporting needs</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Audit Requirements */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Audit Requirements</h4>
            <RadioGroup value={auditRequirements} onValueChange={setAuditRequirements} className="flex flex-col gap-2">
              {AUDIT_REQUIREMENTS_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <RadioGroupItem value={option} id={option} className="mr-2" />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
          
          {/* Compliance Reporting */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Compliance Reporting</h4>
            <RadioGroup value={complianceReporting} onValueChange={setComplianceReporting} className="flex flex-col gap-2">
              {COMPLIANCE_REPORTING_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <RadioGroupItem value={option} id={option} className="mr-2" />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>


      {/* Risk Appetite Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Risk Appetite</h3>
          <p className="text-sm text-gray-600">Define your organization's risk tolerance and AI experience level</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Organization Risk Tolerance */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Organization Risk Tolerance</h4>
            <RadioGroup value={riskTolerance} onValueChange={setRiskTolerance} className="flex flex-col gap-2">
              {RISK_TOLERANCE_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <RadioGroupItem value={option} id={option} className="mr-2" />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
          
          {/* Previous AI Experience */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Previous AI Experience</h4>
            <RadioGroup value={aiExperience} onValueChange={setAiExperience} className="flex flex-col gap-2">
              {AI_EXPERIENCE_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <RadioGroupItem value={option} id={option} className="mr-2" />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
