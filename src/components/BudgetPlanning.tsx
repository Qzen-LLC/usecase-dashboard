'use client';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface BudgetPlanningProps {
  value: {
    initialDevCost: number;
    baseApiCost: number;
    baseInfraCost: number;
    baseOpCost: number;
    baseMonthlyValue: number;
    valueGrowthRate: number;
    budgetRange: string;
    error?: string;
    loading?: boolean;
  };
  onChange: (data: BudgetPlanningProps['value']) => void;
}

const BUDGET_RANGES = [
  '< $100K',
  '$100K - $500K',
  '$500K - $1M',
  '$1M - $5M',
  '> $5M',
];

const BudgetPlanning = React.forwardRef<null, BudgetPlanningProps>(({ value, onChange }, ref) => {
  // Remove all useState for form fields
  // Replace all state usages with value.field and onChange
  // For example, instead of setInitialDevCost, use onChange({ ...value, initialDevCost: newValue })
  // ... existing code ...

  return (
    <Card className="mb-8 p-6 bg-white border border-gray-200 shadow-md rounded-xl">
      {value.error && <div className="text-red-500 mb-2">{value.error}</div>}
      {value.loading && <div className="text-gray-500 mb-4">Loading saved data...</div>}
      <div className="mb-6">
        <Label className="mb-2">Budget Range</Label>
        <RadioGroup value={value.budgetRange} onValueChange={val => { onChange({ ...value, budgetRange: val }); }} className="space-y-2 mt-2">
          {BUDGET_RANGES.map((range) => (
            <div key={range} className="flex items-center">
              <RadioGroupItem value={range} id={`budget-${range}`} className="mr-2" />
              <Label htmlFor={`budget-${range}`} className="text-sm">{range}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="font-semibold text-[#23235b]">Initial Dev Cost</label>
          <Input type="number" value={value.initialDevCost} min={0} onChange={e => onChange({ ...value, initialDevCost: Number(e.target.value) })} className="w-full" />
        </div>
        <div>
          <label className="font-semibold text-[#23235b]">Monthly API Cost</label>
          <Input type="number" value={value.baseApiCost} min={0} onChange={e => onChange({ ...value, baseApiCost: Number(e.target.value) })} className="w-full" />
        </div>
        <div>
          <label className="font-semibold text-[#23235b]">Monthly Infrastructure</label>
          <Input type="number" value={value.baseInfraCost} min={0} onChange={e => onChange({ ...value, baseInfraCost: Number(e.target.value) })} className="w-full" />
        </div>
        <div>
          <label className="font-semibold text-[#23235b]">Monthly Operations</label>
          <Input type="number" value={value.baseOpCost} min={0} onChange={e => onChange({ ...value, baseOpCost: Number(e.target.value) })} className="w-full" />
        </div>
        <div>
          <label className="font-semibold text-[#23235b]">Monthly Value Generated</label>
          <Input type="number" value={value.baseMonthlyValue} min={0} onChange={e => onChange({ ...value, baseMonthlyValue: Number(e.target.value) })} className="w-full" />
        </div>
        <div>
          <label className="font-semibold text-[#23235b]">Value Growth Rate (%)</label>
          <Input type="number" value={value.valueGrowthRate * 100} min={0} max={100} onChange={e => onChange({ ...value, valueGrowthRate: Number(e.target.value) / 100 })} className="w-full" />
        </div>
      </div>
    </Card>
  );
});

export default BudgetPlanning;
