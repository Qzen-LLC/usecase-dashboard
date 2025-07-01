'use client';
import React, { useState, useEffect, useRef } from 'react';
import isEqual from 'lodash.isequal';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


const riskLevels = ['None', 'Low', 'Medium', 'High'];


// Optional: Color classes for each risk level
const riskLevelColors: Record<string, string> = {
  None: 'bg-gradient-to-r from-[#b3d8fa] via-[#d1b3fa] to-[#f7b3e3] text-gray-700 rounded-full px-3 py-1 font-semibold',
  Low: 'bg-gradient-to-r from-[#b3d8fa] via-[#d1b3fa] to-[#f7b3e3] text-green-700 rounded-full px-3 py-1 font-semibold',
  Medium: 'bg-gradient-to-r from-[#b3d8fa] via-[#d1b3fa] to-[#f7b3e3] text-yellow-700 rounded-full px-3 py-1 font-semibold',
  High: 'bg-gradient-to-r from-[#b3d8fa] via-[#d1b3fa] to-[#f7b3e3] text-red-700 rounded-full px-3 py-1 font-semibold',
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
  };
  onChange?: (data: any) => void;
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
  'SOC 2',
  'FedRAMP',
  'NIST Frameworks',
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


export default function RiskAssessment({ onChange }: Props) {
  const lastSent = useRef<any>(null);
  const [technicalRisks, setTechnicalRisks] = useState<Risk[]>([
    { risk: 'Model accuracy degradation', probability: 'None', impact: 'None' },
    { risk: 'Data quality issues', probability: 'None', impact: 'None' },
    { risk: 'Integration failures', probability: 'None', impact: 'None' },
  ]);


  const [businessRisks, setBusinessRisks] = useState<Risk[]>([
    { risk: 'User adoption resistance', probability: 'None', impact: 'None' },
    { risk: 'Regulatory changes', probability: 'None', impact: 'None' },
    { risk: 'Competitive response', probability: 'None', impact: 'None'},
  ]);


  // New state for Operating Jurisdictions
  const [operatingJurisdictions, setOperatingJurisdictions] = useState<{ [region: string]: { [country: string]: boolean } }>(() => {
    const initial: any = {};
    Object.entries(OPERATING_JURISDICTIONS).forEach(([region, countries]) => {
      initial[region] = {};
      countries.forEach((country) => {
        initial[region][country] = false;
      });
    });
    return initial;
  });


  // Data Protection
  const [dataProtection, setDataProtection] = useState<{ [key: string]: boolean }>(() => Object.fromEntries(DATA_PROTECTION_OPTIONS.map(opt => [opt, false])));
  // Sector-Specific
  const [sectorSpecific, setSectorSpecific] = useState<{ [key: string]: boolean }>(() => Object.fromEntries(SECTOR_SPECIFIC_OPTIONS.map(opt => [opt, false])));
  // AI-Specific Regulations (now as checkboxes for multiple selection)
  const [aiSpecific, setAiSpecific] = useState<{ [key: string]: boolean }>(() => Object.fromEntries(AI_SPECIFIC_OPTIONS.map(opt => [opt, false])));
  // Certifications/Standards
  const [certifications, setCertifications] = useState<{ [key: string]: boolean }>(() => Object.fromEntries(CERTIFICATIONS_OPTIONS.map(opt => [opt, false])));
  // Audit Requirements
  const [auditRequirements, setAuditRequirements] = useState('No Audit Required');
  // Compliance Reporting
  const [complianceReporting, setComplianceReporting] = useState('None Required');


  // Organization Risk Tolerance
  const [riskTolerance, setRiskTolerance] = useState('Risk Averse');
  // Previous AI Experience
  const [aiExperience, setAiExperience] = useState('First AI Project');


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
    if (onChange && JSON.stringify(currentData) !== JSON.stringify(lastSent.current)) {
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
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#b3d8fa] via-[#d1b3fa] to-[#f7b3e3] border-l-4 border-red-400 p-4 mb-6 rounded-2xl flex items-center gap-3 shadow-md">
        <div className="font-semibold text-red-800 text-lg mb-1">Risk Assessment</div>
        <div className="text-red-700">Identify, evaluate, and plan mitigation strategies for potential risks.</div>
      </div>


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


      {/* Jurisdictional Requirements heading */}
      <div>
        <h5 className="text-sm font-semibold text-gray-500 mb-1">Jurisdictional Requirements</h5>
        <h4 className="font-semibold text-gray-800 mb-2">Operating Jurisdictions</h4>
        <ul className="ml-4 list-disc">
          {Object.entries(OPERATING_JURISDICTIONS).map(([region, countries]) => (
            <li key={region} className="mb-2">
              <div className="font-semibold text-gray-700 mb-1">{region}</div>
              <div className="ml-4 flex flex-col gap-1">
                {countries.map((country) => (
                  <label key={country} className="flex items-center gap-2">
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
            </li>
          ))}
        </ul>
      </div>


      {/* Regulatory Frameworks */}
      <div>
        <h5 className="text-sm font-semibold text-gray-500 mb-1">Regulatory Frameworks</h5>
        {/* Data Protection */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Data Protection </h4>
          <div className="flex flex-col gap-2">
            {DATA_PROTECTION_OPTIONS.map(option => (
              <label key={option} className="flex items-center gap-2">
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
        <div className="mt-4">
          <h4 className="font-semibold text-gray-800 mb-2">Sector-Specific </h4>
          <div className="flex flex-col gap-2">
            {SECTOR_SPECIFIC_OPTIONS.map(option => (
              <label key={option} className="flex items-center gap-2">
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
        <div className="mt-4">
          <h4 className="font-semibold text-gray-800 mb-2">AI-Specific Regulations</h4>
          <div className="flex flex-col gap-2">
            {AI_SPECIFIC_OPTIONS.map(option => (
              <label key={option} className="flex items-center gap-2">
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


      {/* Industry Standards */}
      <div>
        <h5 className="text-sm font-semibold text-gray-500 mb-1">Industry Standards</h5>
        <h4 className="font-semibold text-gray-800 mb-2">Certifications/Standards </h4>
        <div className="flex flex-col gap-2">
          {CERTIFICATIONS_OPTIONS.map(option => (
            <label key={option} className="flex items-center gap-2">
              <Checkbox
                checked={certifications[option]}
                onCheckedChange={checked => setCertifications(prev => ({ ...prev, [option]: !!checked }))}
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>


      {/* Audit & Compliance */}
      <div>
        <h5 className="text-sm font-semibold text-gray-500 mb-1">Audit & Compliance</h5>
        {/* Audit Requirements */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Audit Requirements</h4>
          <RadioGroup value={auditRequirements} onValueChange={setAuditRequirements} className="flex flex-col gap-2">
            {AUDIT_REQUIREMENTS_OPTIONS.map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value={option} id={option} className="mr-2" />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
        {/* Compliance Reporting */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Compliance Reporting</h4>
          <RadioGroup value={complianceReporting} onValueChange={setComplianceReporting} className="flex flex-col gap-2">
            {COMPLIANCE_REPORTING_OPTIONS.map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value={option} id={option} className="mr-2" />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
      </div>


      {/* Risk Appetite */}
      <div>
        <h5 className="text-sm font-semibold text-gray-500 mb-1">Risk Appetite</h5>
        {/* Organization Risk Tolerance */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Organization Risk Tolerance</h4>
          <RadioGroup value={riskTolerance} onValueChange={setRiskTolerance} className="flex flex-col gap-2">
            {RISK_TOLERANCE_OPTIONS.map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value={option} id={option} className="mr-2" />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
        {/* Previous AI Experience */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Previous AI Experience</h4>
          <RadioGroup value={aiExperience} onValueChange={setAiExperience} className="flex flex-col gap-2">
            {AI_EXPERIENCE_OPTIONS.map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value={option} id={option} className="mr-2" />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
