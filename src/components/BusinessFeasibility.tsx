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

  useEffect(() => {
    const currentData = {
      strategicAlignment,
      marketOpportunity,
      stakeholder,
      annualSavings,
      efficiencyGain,
      paybackPeriod,
    };
    if (onChange && !isEqual(currentData, lastSent.current)) {
      onChange(currentData);
      lastSent.current = currentData;
    }
  }, [strategicAlignment, marketOpportunity, stakeholder, annualSavings, efficiencyGain, paybackPeriod, onChange]);

  return (
    <div className="space-y-8">
      {/* Assessment Banner */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
        <div className="font-semibold text-green-800 text-lg mb-1">Business Feasibility Assessment</div>
        <div className="text-green-700">Evaluate the business case, ROI potential, and organizational readiness.</div>
      </div>

      {/* Strategic Alignment */}
      <div>
        <label className="block font-medium mb-1">Strategic Alignment</label>
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
      </div>

      {/* Market Opportunity */}
      <div>
        <label className="block font-medium mb-1">Market Opportunity</label>
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
      </div>

      {/* Stakeholder Readiness */}
      <div>
        <label className="block font-medium mb-1">Stakeholder Readiness</label>
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
      </div>

      {/* Business Impact Projection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center">
            <span className="text-green-600 text-2xl font-bold">$</span>
            <Input type="text" value={annualSavings} onChange={(e) => setAnnualSavings(e.target.value)} className="w-24 text-2xl font-bold text-green-600 bg-transparent border-none text-center" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Annual Savings</div>
        </div>
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center">
            <Input type="number" value={efficiencyGain} onChange={(e) => setEfficiencyGain(Number(e.target.value))} className="w-20 text-2xl font-bold text-blue-600 bg-transparent border-none text-center" />
            <span className="text-blue-600 text-2xl font-bold">%</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Efficiency Gain</div>
        </div>
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center">
            <Input type="number" value={paybackPeriod} onChange={(e) => setPaybackPeriod(Number(e.target.value))} className="w-20 text-2xl font-bold text-purple-600 bg-transparent border-none text-center" />
            <span className="text-purple-600 text-2xl font-bold">months</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Payback Period</div>
        </div>
      </div>
    </div>
  );
}
