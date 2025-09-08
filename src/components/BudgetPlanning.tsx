'use client';
import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useParams } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign, Coins } from 'lucide-react';

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
    // Gen AI specific fields
    inputTokenPrice?: number;
    outputTokenPrice?: number;
    embeddingTokenPrice?: number;
    finetuningTokenPrice?: number;
    monthlyTokenBudget?: number;
    avgTokensPerUser?: number;
    peakTokenUsage?: number;
    optimizationStrategies?: string[];
    vectorDbCost?: number;
    gpuInferenceCost?: number;
    monitoringToolsCost?: number;
    safetyApiCost?: number;
    backupModelCost?: number;
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

const OPTIMIZATION_STRATEGIES = [
  'Prompt Compression',
  'Response Caching',
  'Model Routing',
  'Batch Processing',
  'Context Window Management',
  'Semantic Caching',
  'Token Budgeting',
  'Fallback Models',
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
    <Card className="mb-8 p-6 bg-card border border-border shadow-md rounded-xl">
      <CardHeader>
        {value.error && <div className="text-red-500 mb-2">{value.error}</div>}
        {value.loading && <div className="text-muted-foreground mb-4">Loading saved data...</div>}
      </CardHeader>
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
                          <label className="font-semibold text-[#23235b] dark:text-blue-200">Initial Dev Cost</label>
          <Input type="number" value={value.initialDevCost} min={0} onChange={e => onChange({ ...value, initialDevCost: Number(e.target.value) })} className="w-full" />
        </div>
        <div>
                          <label className="font-semibold text-[#23235b] dark:text-blue-200">Monthly API Cost</label>
          <Input type="number" value={value.baseApiCost} min={0} onChange={e => onChange({ ...value, baseApiCost: Number(e.target.value) })} className="w-full" />
        </div>
        <div>
                          <label className="font-semibold text-[#23235b] dark:text-blue-200">Monthly Infrastructure</label>
          <Input type="number" value={value.baseInfraCost} min={0} onChange={e => onChange({ ...value, baseInfraCost: Number(e.target.value) })} className="w-full" />
        </div>
        <div>
                          <label className="font-semibold text-[#23235b] dark:text-blue-200">Monthly Operations</label>
          <Input type="number" value={value.baseOpCost} min={0} onChange={e => onChange({ ...value, baseOpCost: Number(e.target.value) })} className="w-full" />
        </div>
        <div>
                          <label className="font-semibold text-[#23235b] dark:text-blue-200">Monthly Value Generated</label>
          <Input type="number" value={value.baseMonthlyValue} min={0} onChange={e => onChange({ ...value, baseMonthlyValue: Number(e.target.value) })} className="w-full" />
        </div>
        <div>
                          <label className="font-semibold text-[#23235b] dark:text-blue-200">Value Growth Rate (%)</label>
          <Input type="number" value={value.valueGrowthRate * 100} min={0} max={100} onChange={e => onChange({ ...value, valueGrowthRate: Number(e.target.value) / 100 })} className="w-full" />
        </div>
      </div>

      {/* Token Economics Section */}
      <div className="mt-8 border-t pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-foreground">Token Economics</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="font-semibold text-[#23235b] dark:text-blue-200">Input Token Price ($/1K tokens)</label>
            <Input 
              type="number" 
              value={value.inputTokenPrice || ''} 
              min={0} 
              step={0.001}
              onChange={e => onChange({ ...value, inputTokenPrice: Number(e.target.value) })} 
              className="w-full" 
              placeholder="e.g., 0.01"
            />
          </div>
          <div>
            <label className="font-semibold text-[#23235b] dark:text-blue-200">Output Token Price ($/1K tokens)</label>
            <Input 
              type="number" 
              value={value.outputTokenPrice || ''} 
              min={0} 
              step={0.001}
              onChange={e => onChange({ ...value, outputTokenPrice: Number(e.target.value) })} 
              className="w-full" 
              placeholder="e.g., 0.03"
            />
          </div>
          <div>
            <label className="font-semibold text-[#23235b] dark:text-blue-200">Embedding Token Price ($/1K tokens)</label>
            <Input 
              type="number" 
              value={value.embeddingTokenPrice || ''} 
              min={0} 
              step={0.001}
              onChange={e => onChange({ ...value, embeddingTokenPrice: Number(e.target.value) })} 
              className="w-full" 
              placeholder="e.g., 0.0001"
            />
          </div>
          <div>
            <label className="font-semibold text-[#23235b] dark:text-blue-200">Fine-tuning Token Price ($/1K tokens)</label>
            <Input 
              type="number" 
              value={value.finetuningTokenPrice || ''} 
              min={0} 
              step={0.001}
              onChange={e => onChange({ ...value, finetuningTokenPrice: Number(e.target.value) })} 
              className="w-full" 
              placeholder="e.g., 0.08"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="font-semibold text-[#23235b] dark:text-blue-200">Monthly Token Budget ($)</label>
            <Input 
              type="number" 
              value={value.monthlyTokenBudget || ''} 
              min={0} 
              onChange={e => onChange({ ...value, monthlyTokenBudget: Number(e.target.value) })} 
              className="w-full" 
              placeholder="e.g., 10000"
            />
          </div>
          <div>
            <label className="font-semibold text-[#23235b] dark:text-blue-200">Avg Tokens per User/Month</label>
            <Input 
              type="number" 
              value={value.avgTokensPerUser || ''} 
              min={0} 
              onChange={e => onChange({ ...value, avgTokensPerUser: Number(e.target.value) })} 
              className="w-full" 
              placeholder="e.g., 50000"
            />
          </div>
          <div>
            <label className="font-semibold text-[#23235b] dark:text-blue-200">Peak Token Usage (tokens/min)</label>
            <Input 
              type="number" 
              value={value.peakTokenUsage || ''} 
              min={0} 
              onChange={e => onChange({ ...value, peakTokenUsage: Number(e.target.value) })} 
              className="w-full" 
              placeholder="e.g., 100000"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="font-semibold text-[#23235b] dark:text-blue-200 block mb-3">Optimization Strategies</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {OPTIMIZATION_STRATEGIES.map((strategy) => (
              <label key={strategy} className="flex items-center gap-2 hover:bg-accent p-2 rounded border border-border cursor-pointer">
                <Checkbox
                  checked={value.optimizationStrategies?.includes(strategy) || false}
                  onCheckedChange={(checked) => {
                    const currentStrategies = value.optimizationStrategies || [];
                    const newStrategies = checked 
                      ? [...currentStrategies, strategy]
                      : currentStrategies.filter(s => s !== strategy);
                    onChange({ ...value, optimizationStrategies: newStrategies });
                  }}
                />
                <span className="text-sm text-foreground">{strategy}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Gen AI Infrastructure Costs Section */}
      <div className="mt-8 border-t pt-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold text-foreground">Gen AI Infrastructure Costs</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-semibold text-[#23235b] dark:text-blue-200">Vector Database Cost ($/month)</label>
            <Input 
              type="number" 
              value={value.vectorDbCost || ''} 
              min={0} 
              onChange={e => onChange({ ...value, vectorDbCost: Number(e.target.value) })} 
              className="w-full" 
              placeholder="e.g., 500"
            />
          </div>
          <div>
            <label className="font-semibold text-[#23235b] dark:text-blue-200">GPU/Inference Cost ($/month)</label>
            <Input 
              type="number" 
              value={value.gpuInferenceCost || ''} 
              min={0} 
              onChange={e => onChange({ ...value, gpuInferenceCost: Number(e.target.value) })} 
              className="w-full" 
              placeholder="e.g., 2000"
            />
          </div>
          <div>
            <label className="font-semibold text-[#23235b] dark:text-blue-200">Monitoring Tools ($/month)</label>
            <Input 
              type="number" 
              value={value.monitoringToolsCost || ''} 
              min={0} 
              onChange={e => onChange({ ...value, monitoringToolsCost: Number(e.target.value) })} 
              className="w-full" 
              placeholder="e.g., 300"
            />
          </div>
          <div>
            <label className="font-semibold text-[#23235b] dark:text-blue-200">Safety/Moderation APIs ($/month)</label>
            <Input 
              type="number" 
              value={value.safetyApiCost || ''} 
              min={0} 
              onChange={e => onChange({ ...value, safetyApiCost: Number(e.target.value) })} 
              className="w-full" 
              placeholder="e.g., 150"
            />
          </div>
          <div>
            <label className="font-semibold text-[#23235b] dark:text-blue-200">Backup Model Cost ($/month)</label>
            <Input 
              type="number" 
              value={value.backupModelCost || ''} 
              min={0} 
              onChange={e => onChange({ ...value, backupModelCost: Number(e.target.value) })} 
              className="w-full" 
              placeholder="e.g., 1000"
            />
          </div>
        </div>
      </div>
    </Card>
  );
});

BudgetPlanning.displayName = 'BudgetPlanning';

export default BudgetPlanning;
