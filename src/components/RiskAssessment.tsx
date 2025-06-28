'use client';
import React, { useState, useEffect, useRef } from 'react';
import isEqual from 'lodash.isequal';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const riskLevels = ['None', 'Low', 'Medium', 'High'];

// Optional: Color classes for each risk level
const riskLevelColors: Record<string, string> = {
  None: 'bg-gray-100 text-gray-700',
  Low: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-red-100 text-red-700',
};

type Risk = {
  risk: string;
  probability: string;
  impact: string;
};

type Props = {
  onChange?: (data: {
    technicalRisks: Risk[];
    businessRisks: Risk[];
  }) => void;
};

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

  useEffect(() => {
    const currentData = {
      technicalRisks,
      businessRisks,
    };
    if (onChange && !isEqual(currentData, lastSent.current)) {
      onChange(currentData);
      lastSent.current = currentData;
    }
  }, [technicalRisks, businessRisks, onChange]);

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
          <SelectTrigger className={`w-24 ${riskLevelColors[item.probability]}`}>
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
          <SelectTrigger className={`w-24 ${riskLevelColors[item.impact]}`}>
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
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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
    </div>
  );
}