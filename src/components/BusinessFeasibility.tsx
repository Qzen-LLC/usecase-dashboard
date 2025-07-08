'use client';
import React, { useEffect, useRef } from 'react';
import isEqual from 'lodash.isequal';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { BarChart3, Users, AlertTriangle, DollarSign } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// New options for business feasibility fields
const AVAILABILITY_REQS = [
  '99% (3.65 days downtime/year)',
  '99.9% (8.76 hours downtime/year)',
  '99.99% (52.56 minutes downtime/year)',
  '99.999% (5.26 minutes downtime/year)',
];
const RESPONSE_TIME_REQS = [
  '< 100ms',
  '100ms - 1s',
  '1s - 5s',
  '5s - 30s',
  '> 30s',
];
const CONCURRENT_USERS = [
  '< 100',
  '100 - 1,000',
  '1,000 - 10,000',
  '10,000 - 100,000',
  '100,000 - 1 million',
  '> 1 million',
];
const REVENUE_IMPACT_TYPE = [
  'Direct Revenue Generation',
  'Cost Reduction',
  'Risk Mitigation',
  'Compliance/Regulatory',
  'Customer Experience',
  'Operational Efficiency',
  'No Direct Impact',
];
const ESTIMATED_FINANCIAL_IMPACT = [
  '< $100K annually',
  '$100K - $1M',
  '$1M - $10M',
  '$10M - $100M',
  '> $100M',
];
const USER_CATEGORIES = [
  'Internal Employees',
  'Customers',
  'Partners/Vendors',
  'General Public',
  'Regulators',
  'Executives',
  'Developers/IT',
  'Analysts',
  'Minors/Children',
];
const SYSTEM_CRITICALITY = [
  'Non-critical (Experimental)',
  'Low (Convenience)',
  'Medium (Important)',
  'High (Business Critical)',
  'Mission Critical',
];
const FAILURE_IMPACT = [
  'Minimal/No Impact',
  'Minor Inconvenience',
  'Moderate Business Impact',
  'Severe Business Impact',
  'Catastrophic/Life Safety',
];
const EXEC_SPONSOR_LEVELS = [
  "C-Suite",
  "VP/Director",
  "Manager",
  "Team Lead",
];
const STAKEHOLDER_GROUPS = [
  "Board of Directors",
  "Executive Team",
  "Legal/Compliance",
  "IT/Security",
  "Business Users",
  "Customers",
  "Regulators",
  "Partners",
  "Public/Media",
];

type Props = {
  value: {
    strategicAlignment: number;
    marketOpportunity: string;
    stakeholder: {
      exec: boolean;
      endUser: boolean;
      it: boolean;
    };
    annualSavings: string;
    efficiencyGain: number;
    paybackPeriod: number;
    availabilityRequirement: string;
    responseTimeRequirement: string;
    concurrentUsers: string;
    revenueImpactType: string;
    estimatedFinancialImpact: string;
    userCategories: string[];
    systemCriticality: string;
    failureImpact: string;
    executiveSponsorLevel: string;
    stakeholderGroups: string[];
  };
  onChange: (data: Props['value']) => void;
};

export default function BusinessFeasibility({ value, onChange }: Props) {
  const lastSent = useRef<any>(null);

  useEffect(() => {
    const currentData = {
      strategicAlignment: value.strategicAlignment,
      marketOpportunity: value.marketOpportunity,
      stakeholder: value.stakeholder,
      annualSavings: value.annualSavings,
      efficiencyGain: value.efficiencyGain,
      paybackPeriod: value.paybackPeriod,
      availabilityRequirement: value.availabilityRequirement,
      responseTimeRequirement: value.responseTimeRequirement,
      concurrentUsers: value.concurrentUsers,
      revenueImpactType: value.revenueImpactType,
      estimatedFinancialImpact: value.estimatedFinancialImpact,
      userCategories: value.userCategories,
      systemCriticality: value.systemCriticality,
      failureImpact: value.failureImpact,
      executiveSponsorLevel: value.executiveSponsorLevel,
      stakeholderGroups: value.stakeholderGroups,
    };
    if (onChange && !isEqual(currentData, lastSent.current)) {
      onChange(currentData);
      lastSent.current = currentData;
    }
  }, [value.strategicAlignment, value.marketOpportunity, value.stakeholder, value.annualSavings, value.efficiencyGain, value.paybackPeriod, value.availabilityRequirement, value.responseTimeRequirement, value.concurrentUsers, value.revenueImpactType, value.estimatedFinancialImpact, value.userCategories, value.systemCriticality, value.failureImpact, value.executiveSponsorLevel, value.stakeholderGroups, onChange]);

  // Helper for multi-select checkboxes
  function handleMultiSelectChange(field: keyof Props['value'], v: string) {
    const arr = value[field] as string[];
    if (arr.includes(v)) {
      onChange({ ...value, [field]: arr.filter((x) => x !== v) });
    } else {
      onChange({ ...value, [field]: [...arr, v] });
    }
  }

  return (
    <div className="space-y-10">
      {/* Assessment Banner */}
      <div className="bg-gradient-to-r from-[#b3d8fa] via-[#d1b3fa] to-[#f7b3e3] border-l-4 border-green-400 p-4 mb-8 rounded-2xl flex items-center gap-3 shadow-md">
        <div className="font-semibold text-green-800 text-lg mb-1">Business Feasibility Assessment</div>
        <div className="text-green-700">Evaluate the business case, ROI potential, and organizational readiness.</div>
      </div>

      {/* Strategic Assessment Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Strategic Assessment</h3>
          <p className="text-sm text-gray-600">Evaluate strategic alignment, market opportunity, and stakeholder readiness</p>
        </div>
        
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <Label className="font-medium">Strategic Alignment</Label>
            </div>
            <div className="flex items-center w-full">
              <span className="text-gray-500 text-sm mr-4">Low</span>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[value.strategicAlignment]}
                onValueChange={([val]) => onChange({ ...value, strategicAlignment: val })}
                className="w-full"
              />
              <span className="text-gray-500 text-sm ml-4">High</span>
              <span className="ml-6 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">{value.strategicAlignment}</span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-green-500" />
              <Label className="font-medium">Market Opportunity</Label>
            </div>
            <Select value={value.marketOpportunity} onValueChange={(v) => onChange({ ...value, marketOpportunity: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select market opportunity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="large">Large and growing market</SelectItem>
                <SelectItem value="niche">Niche market</SelectItem>
                <SelectItem value="limited">Limited opportunity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-purple-500" />
              <Label className="font-medium">Stakeholder Readiness</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 hover:bg-purple-50 p-2 rounded border border-gray-100 cursor-pointer">
                <Checkbox checked={value.stakeholder.exec} onCheckedChange={(val) => onChange({ ...value, stakeholder: { ...value.stakeholder, exec: !!val } })} />
                <span className="text-sm">Executive Sponsorship</span>
              </label>
              <label className="flex items-center gap-2 hover:bg-purple-50 p-2 rounded border border-gray-100 cursor-pointer">
                <Checkbox checked={value.stakeholder.endUser} onCheckedChange={(val) => onChange({ ...value, stakeholder: { ...value.stakeholder, endUser: !!val } })} />
                <span className="text-sm">End User Buy-in</span>
              </label>
              <label className="flex items-center gap-2 hover:bg-purple-50 p-2 rounded border border-gray-100 cursor-pointer">
                <Checkbox checked={value.stakeholder.it} onCheckedChange={(val) => onChange({ ...value, stakeholder: { ...value.stakeholder, it: !!val } })} />
                <span className="text-sm">IT Support</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Performance & Reliability Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Performance & Reliability</h3>
              <p className="text-sm text-gray-600">Define availability, response time, and user capacity requirements</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <Label className="block font-medium mb-4">Availability Requirements</Label>
            <RadioGroup value={value.availabilityRequirement} onValueChange={(v) => onChange({ ...value, availabilityRequirement: v })} className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {AVAILABILITY_REQS.map((item) => (
                <Label key={item} className="flex items-center gap-2 hover:bg-blue-50 rounded p-2 border border-gray-100 cursor-pointer transition">
                  <RadioGroupItem value={item} id={`availability-${item}`} />
                  <span className="text-sm">{item}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4">Response Time Requirements</Label>
            <RadioGroup value={value.responseTimeRequirement} onValueChange={(v) => onChange({ ...value, responseTimeRequirement: v })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {RESPONSE_TIME_REQS.map((item) => (
                <Label key={item} className="flex items-center gap-2 hover:bg-blue-50 rounded p-2 border border-gray-100 cursor-pointer transition">
                  <RadioGroupItem value={item} id={`response-${item}`} />
                  <span className="text-sm">{item}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4">Concurrent Users</Label>
            <RadioGroup value={value.concurrentUsers} onValueChange={(v) => onChange({ ...value, concurrentUsers: v })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {CONCURRENT_USERS.map((item) => (
                <Label key={item} className="flex items-center gap-2 hover:bg-blue-50 rounded p-2 border border-gray-100 cursor-pointer transition">
                  <RadioGroupItem value={item} id={`users-${item}`} />
                  <span className="text-sm">{item}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Business Impact Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Business Impact</h3>
              <p className="text-sm text-gray-600">Assess revenue impact, financial benefits, and target user categories</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <Label className="block font-medium mb-4">Revenue Impact Type</Label>
            <RadioGroup value={value.revenueImpactType} onValueChange={(v) => onChange({ ...value, revenueImpactType: v })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {REVENUE_IMPACT_TYPE.map((item) => (
                <Label key={item} className="flex items-center gap-2 hover:bg-green-50 rounded p-2 border border-gray-100 cursor-pointer transition">
                  <RadioGroupItem value={item} id={`revenue-${item}`} />
                  <span className="text-sm">{item}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4">Estimated Financial Impact</Label>
            <RadioGroup value={value.estimatedFinancialImpact} onValueChange={(v) => onChange({ ...value, estimatedFinancialImpact: v })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {ESTIMATED_FINANCIAL_IMPACT.map((item) => (
                <Label key={item} className="flex items-center gap-2 hover:bg-green-50 rounded p-2 border border-gray-100 cursor-pointer transition">
                  <RadioGroupItem value={item} id={`finimpact-${item}`} />
                  <span className="text-sm">{item}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4">User Categories</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {USER_CATEGORIES.map((item) => (
                <Label key={item} className="flex items-center gap-2 hover:bg-green-50 rounded p-2 border border-gray-100 cursor-pointer transition">
                  <Checkbox checked={value.userCategories.includes(item)} onCheckedChange={() => handleMultiSelectChange('userCategories', item)} />
                  <span className="text-sm">{item}</span>
                </Label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk & Stakeholder Management Section */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Risk & Stakeholder Management</h3>
          <p className="text-sm text-gray-600">Evaluate system criticality, failure impact, and stakeholder engagement</p>
        </div>
        
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <Label className="font-medium">System Criticality</Label>
            </div>
            <RadioGroup value={value.systemCriticality} onValueChange={(v) => onChange({ ...value, systemCriticality: v })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {SYSTEM_CRITICALITY.map((item) => (
                <Label key={item} className="flex items-center gap-2 hover:bg-orange-50 rounded p-2 border border-gray-100 cursor-pointer transition">
                  <RadioGroupItem value={item} id={`syscrit-${item}`} />
                  <span className="text-sm">{item}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4">Failure Impact</Label>
            <RadioGroup value={value.failureImpact} onValueChange={(v) => onChange({ ...value, failureImpact: v })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {FAILURE_IMPACT.map((item) => (
                <Label key={item} className="flex items-center gap-2 hover:bg-orange-50 rounded p-2 border border-gray-100 cursor-pointer transition">
                  <RadioGroupItem value={item} id={`failimpact-${item}`} />
                  <span className="text-sm">{item}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-500" />
              <Label className="font-medium">Executive Sponsor Level</Label>
            </div>
            <RadioGroup value={value.executiveSponsorLevel} onValueChange={(v) => onChange({ ...value, executiveSponsorLevel: v })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {EXEC_SPONSOR_LEVELS.map((level) => (
                <Label key={level} className="flex items-center gap-2 hover:bg-blue-50 p-2 rounded border border-gray-100 cursor-pointer">
                  <RadioGroupItem value={level} />
                  <span className="text-sm">{level}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4">Stakeholder Groups</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {STAKEHOLDER_GROUPS.map((group) => (
                <Label key={group} className="flex items-center gap-2 hover:bg-blue-50 rounded p-2 border border-gray-100 cursor-pointer transition">
                  <Checkbox checked={value.stakeholderGroups.includes(group)} onCheckedChange={() => handleMultiSelectChange('stakeholderGroups', group)} />
                  <span className="text-sm">{group}</span>
                </Label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
