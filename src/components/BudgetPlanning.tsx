'use client';
import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useParams } from 'next/navigation';

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

const BudgetPlanning = forwardRef<{ saveFinops: () => Promise<void> }, BudgetPlanningProps>(({ value, onChange }, ref) => {
  const params = useParams();
  const useCaseId = params.useCaseId as string;

  useEffect(() => {
    if (!useCaseId) return;
    onChange({ ...value, loading: true });
    fetch(`/api/get-finops?id=${useCaseId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const d = data[0];
          onChange({
            ...value,
            initialDevCost: d.devCostBase ?? value.initialDevCost,
            baseApiCost: d.apiCostBase ?? value.baseApiCost,
            baseInfraCost: d.infraCostBase ?? value.baseInfraCost,
            baseOpCost: d.opCostBase ?? value.baseOpCost,
            baseMonthlyValue: d.valueBase ?? value.baseMonthlyValue,
            valueGrowthRate: d.valueGrowthRate ?? value.valueGrowthRate,
            budgetRange: d.budgetRange ?? value.budgetRange,
            loading: false,
            error: '',
          });
        } else {
          onChange({ ...value, loading: false });
        }
      })
      .catch(() => {
        onChange({ ...value, loading: false, error: 'Failed to load budget data' });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useCaseId]);

  useImperativeHandle(ref, () => ({
    async saveFinops() {
      if (!useCaseId) return;
      // --- Calculations for 36 months (same as FinancialDashboard) ---
      const FORECAST_MONTHS = 36;
      let cumulativeValue = 0;
      let cumulativeOpCosts = 0;
      let breakEvenMonth = null;
      let last = {};
      for (let month = 1; month <= FORECAST_MONTHS; month++) {
        const apiCost = value.baseApiCost * Math.pow(1.12, month / 12);
        const infraCost = value.baseInfraCost * Math.pow(1.05, month / 12);
        const opCost = value.baseOpCost * Math.pow(1.08, month / 12);
        const totalMonthlyCost = apiCost + infraCost + opCost;
        const monthlyValue = value.baseMonthlyValue * Math.pow(1 + value.valueGrowthRate, month / 12);
        cumulativeValue += monthlyValue;
        cumulativeOpCosts += totalMonthlyCost;
        const totalInvestment = value.initialDevCost + cumulativeOpCosts;
        const _monthlyProfit = monthlyValue - totalMonthlyCost;
        const netValue = cumulativeValue - totalInvestment;
        const ROI = totalInvestment > 0 ? (netValue / totalInvestment) * 100 : 0;
        if (breakEvenMonth === null && netValue >= 0) breakEvenMonth = month;
        if (month === FORECAST_MONTHS) {
          last = {
            ROI,
            netValue,
            apiCostBase: value.baseApiCost,
            cumOpCost: cumulativeOpCosts,
            cumValue: cumulativeValue,
            devCostBase: value.initialDevCost,
            infraCostBase: value.baseInfraCost,
            opCostBase: value.baseOpCost,
            totalInvestment,
            valueBase: value.baseMonthlyValue,
            valueGrowthRate: value.valueGrowthRate,
            budgetRange: value.budgetRange,
          };
        }
      }
      await fetch('/api/update-finops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          useCaseId,
          ...last,
        }),
      });

      // Refresh data from database after saving to ensure consistency
      try {
        const response = await fetch(`/api/get-finops?id=${useCaseId}`);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const d = data[0];
          onChange({
            ...value,
            initialDevCost: d.devCostBase ?? value.initialDevCost,
            baseApiCost: d.apiCostBase ?? value.baseApiCost,
            baseInfraCost: d.infraCostBase ?? value.baseInfraCost,
            baseOpCost: d.opCostBase ?? value.baseOpCost,
            baseMonthlyValue: d.valueBase ?? value.baseMonthlyValue,
            valueGrowthRate: d.valueGrowthRate ?? value.valueGrowthRate,
            budgetRange: d.budgetRange ?? value.budgetRange,
            error: '',
          });
        }
      } catch (error) {
        console.error('Failed to refresh data after save:', error);
      }
    }
  }), [useCaseId, value]);

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

BudgetPlanning.displayName = 'BudgetPlanning';

export default BudgetPlanning;
