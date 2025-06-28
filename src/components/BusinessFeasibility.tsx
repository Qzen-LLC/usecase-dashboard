'use client';
import React, { useState, useEffect, useRef } from 'react';
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

type Props = {
  onChange?: (data: {
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
    // Updated fields
    availabilityRequirement: string;
    responseTimeRequirement: string;
    concurrentUsers: string;
    revenueImpactType: string;
    estimatedFinancialImpact: string;
    userCategories: string[];
    systemCriticality: string;
    failureImpact: string;
  }) => void;
};

export default function BusinessFeasibility({ onChange }: Props) {
  const lastSent = useRef<any>(null);
  const [strategicAlignment, setStrategicAlignment] = useState(8);
  const [marketOpportunity, setMarketOpportunity] = useState('large');
  const [stakeholder, setStakeholder] = useState({
    exec: true,
    endUser: false,
    it: true,
  });
  const [annualSavings, setAnnualSavings] = useState('2.4M');
  const [efficiencyGain, setEfficiencyGain] = useState(35);
  const [paybackPeriod, setPaybackPeriod] = useState(8);
  // Updated state for business feasibility fields
  const [availabilityRequirement, setAvailabilityRequirement] = useState('');
  const [responseTimeRequirement, setResponseTimeRequirement] = useState('');
  const [concurrentUsers, setConcurrentUsers] = useState('');
  const [revenueImpactType, setRevenueImpactType] = useState('');
  const [estimatedFinancialImpact, setEstimatedFinancialImpact] = useState('');
  const [userCategories, setUserCategories] = useState<string[]>([]);
  const [systemCriticality, setSystemCriticality] = useState('');
  const [failureImpact, setFailureImpact] = useState('');

  useEffect(() => {
    const currentData = {
      strategicAlignment,
      marketOpportunity,
      stakeholder,
      annualSavings,
      efficiencyGain,
      paybackPeriod,
      availabilityRequirement,
      responseTimeRequirement,
      concurrentUsers,
      revenueImpactType,
      estimatedFinancialImpact,
      userCategories,
      systemCriticality,
      failureImpact,
    };
    if (onChange && !isEqual(currentData, lastSent.current)) {
      onChange(currentData);
      lastSent.current = currentData;
    }
  }, [strategicAlignment, marketOpportunity, stakeholder, annualSavings, efficiencyGain, paybackPeriod, availabilityRequirement, responseTimeRequirement, concurrentUsers, revenueImpactType, estimatedFinancialImpact, userCategories, systemCriticality, failureImpact, onChange]);

  // Helper for multi-select checkboxes
  function handleMultiSelectChange(value: string, selected: string[], setSelected: (v: string[]) => void) {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  }

  return (
    <div className="space-y-8">
      {/* Assessment Banner */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
        <div className="font-semibold text-green-800 text-lg mb-1">Business Feasibility Assessment</div>
        <div className="text-green-700">Evaluate the business case, ROI potential, and organizational readiness.</div>
      </div>

      {/* Strategic Alignment */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <CardTitle>Strategic Alignment</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="block font-medium mb-1">Strategic Alignment</Label>
          <div className="flex items-center w-full">
            <span className="text-gray-500 text-sm mr-2">Low</span>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[strategicAlignment]}
              onValueChange={([val]) => setStrategicAlignment(val)}
              className="w-full"
            />
            <span className="text-gray-500 text-sm ml-2">High</span>
          </div>
        </CardContent>
      </Card>

      {/* Market Opportunity */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-green-500" />
          <CardTitle>Market Opportunity</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="block font-medium mb-1">Market Opportunity</Label>
          <Select value={marketOpportunity} onValueChange={setMarketOpportunity}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select market opportunity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="large">Large and growing market</SelectItem>
              <SelectItem value="niche">Niche market</SelectItem>
              <SelectItem value="limited">Limited opportunity</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Stakeholder Readiness */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-purple-500" />
          <CardTitle>Stakeholder Readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="block font-medium mb-1">Stakeholder Readiness</Label>
          <div className="flex flex-col gap-2 mt-2">
            <label className="flex items-center gap-2">
              <Checkbox checked={stakeholder.exec} onCheckedChange={val => setStakeholder(s => ({ ...s, exec: !!val }))} />
              <span>Executive Sponsorship</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={stakeholder.endUser} onCheckedChange={val => setStakeholder(s => ({ ...s, endUser: !!val }))} />
              <span>End User Buy-in</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={stakeholder.it} onCheckedChange={val => setStakeholder(s => ({ ...s, it: !!val }))} />
              <span>IT Support</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Performance & Reliability */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 mb-2">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <CardTitle>Performance & Reliability</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="block font-medium mb-1">Availability Requirements</Label>
          <RadioGroup value={availabilityRequirement} onValueChange={setAvailabilityRequirement} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {AVAILABILITY_REQS.map((item) => (
              <Label key={item} className="flex items-center gap-2 hover:bg-blue-50 rounded px-1 py-0.5 cursor-pointer transition">
                <RadioGroupItem value={item} id={`availability-${item}`} />
                <span className="text-sm">{item}</span>
              </Label>
            ))}
          </RadioGroup>
          <Label className="block font-medium mb-1">Response Time Requirements</Label>
          <RadioGroup value={responseTimeRequirement} onValueChange={setResponseTimeRequirement} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {RESPONSE_TIME_REQS.map((item) => (
              <Label key={item} className="flex items-center gap-2 hover:bg-blue-50 rounded px-1 py-0.5 cursor-pointer transition">
                <RadioGroupItem value={item} id={`response-${item}`} />
                <span className="text-sm">{item}</span>
              </Label>
            ))}
          </RadioGroup>
          <Label className="block font-medium mb-1">Concurrent Users</Label>
          <RadioGroup value={concurrentUsers} onValueChange={setConcurrentUsers} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {CONCURRENT_USERS.map((item) => (
              <Label key={item} className="flex items-center gap-2 hover:bg-blue-50 rounded px-1 py-0.5 cursor-pointer transition">
                <RadioGroupItem value={item} id={`users-${item}`} />
                <span className="text-sm">{item}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Business Impact */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 mb-2">
          <DollarSign className="w-6 h-6 text-green-500" />
          <CardTitle>Business Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="block font-medium mb-1">Revenue Impact Type</Label>
          <RadioGroup value={revenueImpactType} onValueChange={setRevenueImpactType} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {REVENUE_IMPACT_TYPE.map((item) => (
              <Label key={item} className="flex items-center gap-2 hover:bg-green-50 rounded px-1 py-0.5 cursor-pointer transition">
                <RadioGroupItem value={item} id={`revenue-${item}`} />
                <span className="text-sm">{item}</span>
              </Label>
            ))}
          </RadioGroup>
          <Label className="block font-medium mb-1">Estimated Financial Impact</Label>
          <RadioGroup value={estimatedFinancialImpact} onValueChange={setEstimatedFinancialImpact} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {ESTIMATED_FINANCIAL_IMPACT.map((item) => (
              <Label key={item} className="flex items-center gap-2 hover:bg-green-50 rounded px-1 py-0.5 cursor-pointer transition">
                <RadioGroupItem value={item} id={`finimpact-${item}`} />
                <span className="text-sm">{item}</span>
              </Label>
            ))}
          </RadioGroup>
          <Label className="block font-medium mb-1">User Categories</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {USER_CATEGORIES.map((item) => (
              <Label key={item} className="flex items-center gap-1 hover:bg-green-50 rounded px-1 py-0.5 cursor-pointer transition">
                <Checkbox checked={userCategories.includes(item)} onCheckedChange={() => handleMultiSelectChange(item, userCategories, setUserCategories)} />
                <span className="text-sm">{item}</span>
              </Label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Business Criticality */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 mb-2">
          <AlertTriangle className="w-6 h-6 text-orange-500" />
          <CardTitle>Business Criticality</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="block font-medium mb-1">System Criticality</Label>
          <RadioGroup value={systemCriticality} onValueChange={setSystemCriticality} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {SYSTEM_CRITICALITY.map((item) => (
              <Label key={item} className="flex items-center gap-2 hover:bg-orange-50 rounded px-1 py-0.5 cursor-pointer transition">
                <RadioGroupItem value={item} id={`syscrit-${item}`} />
                <span className="text-sm">{item}</span>
              </Label>
            ))}
          </RadioGroup>
          <Label className="block font-medium mb-1">Failure Impact</Label>
          <RadioGroup value={failureImpact} onValueChange={setFailureImpact} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {FAILURE_IMPACT.map((item) => (
              <Label key={item} className="flex items-center gap-2 hover:bg-orange-50 rounded px-1 py-0.5 cursor-pointer transition">
                <RadioGroupItem value={item} id={`failimpact-${item}`} />
                <span className="text-sm">{item}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
