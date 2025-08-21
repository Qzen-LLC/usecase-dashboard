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
  'Compliance and Regulatory',
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
    revenueImpactType: string[];
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
  const lastSent = useRef<Props['value'] | null>(null);

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
      <div className="bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 border-l-4 border-green-400 dark:border-green-300 p-4 mb-8 rounded-2xl flex items-center gap-3 shadow-md">
        <div className="font-semibold text-green-800 dark:text-green-200 text-lg mb-1">Business Feasibility Assessment</div>
        <div className="text-green-700 dark:text-green-300">Evaluate the business case, ROI potential, and organizational readiness.</div>
      </div>

      {/* Strategic Assessment Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Strategic Assessment</h3>
              <p className="text-sm text-muted-foreground">Evaluate strategic alignment, market opportunity, and stakeholder readiness</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <Label className="block font-medium mb-4 text-foreground">Strategic Alignment Score</Label>
            <div className="flex items-center w-full">
              <span className="text-muted-foreground text-sm mr-4">Low</span>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[value.strategicAlignment]}
                onValueChange={([val]) => onChange({ ...value, strategicAlignment: val })}
                className="w-full"
              />
              <span className="text-muted-foreground text-sm ml-4">High</span>
              <span className="ml-6 px-4 py-2 bg-primary/10 text-primary rounded-full font-semibold text-sm">{value.strategicAlignment}</span>
            </div>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Market Opportunity</Label>
            <RadioGroup value={value.marketOpportunity} onValueChange={(newValue) => onChange({ ...value, marketOpportunity: newValue })} className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {['small', 'medium', 'large'].map((size) => (
                <Label key={size} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                  <RadioGroupItem value={size} />
                  <span className="text-sm text-foreground capitalize">{size}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Stakeholder Support</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(value.stakeholder).map(([key, checked]) => (
                <Label key={key} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                  <Checkbox checked={checked} onCheckedChange={(checked) => onChange({ ...value, stakeholder: { ...value.stakeholder, [key]: checked } })} />
                  <span className="text-sm text-foreground capitalize">{key === 'exec' ? 'Executive' : key === 'endUser' ? 'End User' : 'IT'}</span>
                </Label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance & Reliability Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-warning" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Performance & Reliability</h3>
              <p className="text-sm text-muted-foreground">Define availability, response time, and user capacity requirements</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <Label className="block font-medium mb-4 text-foreground">Availability Requirements</Label>
            <RadioGroup value={value.availabilityRequirement} onValueChange={(newValue) => onChange({ ...value, availabilityRequirement: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {AVAILABILITY_REQS.map((item) => (
                <Label key={item} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <RadioGroupItem value={item} />
                  <span className="text-sm text-foreground">{item}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Response Time Requirements</Label>
            <RadioGroup value={value.responseTimeRequirement} onValueChange={(newValue) => onChange({ ...value, responseTimeRequirement: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {RESPONSE_TIME_REQS.map((item) => (
                <Label key={item} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <RadioGroupItem value={item} />
                  <span className="text-sm text-foreground">{item}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Concurrent Users</Label>
            <RadioGroup value={value.concurrentUsers} onValueChange={(newValue) => onChange({ ...value, concurrentUsers: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {CONCURRENT_USERS.map((item) => (
                <Label key={item} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <RadioGroupItem value={item} />
                  <span className="text-sm text-foreground">{item}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Business Impact Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-success" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Business Impact</h3>
              <p className="text-sm text-muted-foreground">Assess revenue impact, financial benefits, and target user categories</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
          <Label className="block font-medium mb-4 text-foreground">Revenue Impact Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {REVENUE_IMPACT_TYPE.map((item) => (
                <Label key={item} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <Checkbox checked={value.revenueImpactType.includes(item)} onCheckedChange={(checked) => handleMultiSelectChange('revenueImpactType', item)} />
                  <span className="text-sm text-foreground">{item}</span>
                </Label>
              ))}
            </div>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Estimated Financial Impact</Label>
            <RadioGroup value={value.estimatedFinancialImpact} onValueChange={(newValue) => onChange({ ...value, estimatedFinancialImpact: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ESTIMATED_FINANCIAL_IMPACT.map((item) => (
                <Label key={item} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <RadioGroupItem value={item} />
                  <span className="text-sm text-foreground">{item}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Target User Categories</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {USER_CATEGORIES.map((item) => (
                <Label key={item} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <Checkbox checked={value.userCategories.includes(item)} onCheckedChange={(checked) => handleMultiSelectChange('userCategories', item)} />
                  <span className="text-sm text-foreground">{item}</span>
                </Label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk & Stakeholder Management Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Risk & Stakeholder Management</h3>
              <p className="text-sm text-muted-foreground">Evaluate system criticality, failure impact, and stakeholder engagement</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <Label className="block font-medium mb-4 text-foreground">System Criticality</Label>
            <RadioGroup value={value.systemCriticality} onValueChange={(newValue) => onChange({ ...value, systemCriticality: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {SYSTEM_CRITICALITY.map((item) => (
                <Label key={item} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <RadioGroupItem value={item} />
                  <span className="text-sm text-foreground">{item}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Failure Impact Assessment</Label>
            <RadioGroup value={value.failureImpact} onValueChange={(newValue) => onChange({ ...value, failureImpact: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {FAILURE_IMPACT.map((item) => (
                <Label key={item} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <RadioGroupItem value={item} />
                  <span className="text-sm text-foreground">{item}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Executive Sponsor Level</Label>
            <RadioGroup value={value.executiveSponsorLevel} onValueChange={(newValue) => onChange({ ...value, executiveSponsorLevel: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {EXEC_SPONSOR_LEVELS.map((level) => (
                <Label key={level} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                  <RadioGroupItem value={level} />
                  <span className="text-sm text-foreground">{level}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Stakeholder Groups</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {STAKEHOLDER_GROUPS.map((group) => (
                <Label key={group} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <Checkbox checked={value.stakeholderGroups.includes(group)} onCheckedChange={(checked) => handleMultiSelectChange('stakeholderGroups', group)} />
                  <span className="text-sm text-foreground">{group}</span>
                </Label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
