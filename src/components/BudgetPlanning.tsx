'use client';
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface BudgetPlanningProps {
  useCaseId: string;
}

const BudgetPlanning = forwardRef<{ saveFinops: () => Promise<void> }, BudgetPlanningProps>(({ useCaseId }, ref) => {
  // 6 Inputs
  const [initialDevCost, setInitialDevCost] = useState<number>(150000);
  const [baseApiCost, setBaseApiCost] = useState<number>(8000);
  const [baseInfraCost, setBaseInfraCost] = useState<number>(2000);
  const [baseOpCost, setBaseOpCost] = useState<number>(5000);
  const [baseMonthlyValue, setBaseMonthlyValue] = useState<number>(25000);
  const [valueGrowthRate, setValueGrowthRate] = useState<number>(0.15);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!useCaseId) return;
    setLoading(true);
    fetch(`/api/get-finops?id=${useCaseId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const d = data[0];
          if (d) {
            setInitialDevCost(d.devCostBase ?? 150000);
            setBaseApiCost(d.apiCostBase ?? 8000);
            setBaseInfraCost(d.infraCostBase ?? 2000);
            setBaseOpCost(d.opCostBase ?? 5000);
            setBaseMonthlyValue(d.valueBase ?? 25000);
            setValueGrowthRate(d.valueGrowthRate ?? 0.15);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [useCaseId]);

  // Update handler: send values to backend on change
  const updateFinops = async (updatedFields: Partial<any>) => {
    try {
      const payload = {
        useCaseId,
        devCostBase: updatedFields.devCostBase ?? initialDevCost,
        apiCostBase: updatedFields.apiCostBase ?? baseApiCost,
        infraCostBase: updatedFields.infraCostBase ?? baseInfraCost,
        opCostBase: updatedFields.opCostBase ?? baseOpCost,
        valueBase: updatedFields.valueBase ?? baseMonthlyValue,
        valueGrowthRate: updatedFields.valueGrowthRate ?? valueGrowthRate,
        ROI: 0,
        netValue: 0,
        cumOpCost: 0,
        cumValue: 0,
        totalInvestment: 0,
      };
      await fetch('/api/update-finops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      setError('Failed to update');
    }
  };

  // Handlers for each input
  const handleDevCostChange = (v: number) => {
    setInitialDevCost(v);
    updateFinops({ devCostBase: v });
  };
  const handleApiCostChange = (v: number) => {
    setBaseApiCost(v);
    updateFinops({ apiCostBase: v });
  };
  const handleInfraCostChange = (v: number) => {
    setBaseInfraCost(v);
    updateFinops({ infraCostBase: v });
  };
  const handleOpCostChange = (v: number) => {
    setBaseOpCost(v);
    updateFinops({ opCostBase: v });
  };
  const handleValueChange = (v: number) => {
    setBaseMonthlyValue(v);
    updateFinops({ valueBase: v });
  };
  const handleGrowthChange = (v: number) => {
    setValueGrowthRate(v / 100);
    updateFinops({ valueGrowthRate: v / 100 });
  };

  // Save all current values
  const saveFinops = async () => {
    try {
      const payload = {
        useCaseId,
        devCostBase: initialDevCost,
        apiCostBase: baseApiCost,
        infraCostBase: baseInfraCost,
        opCostBase: baseOpCost,
        valueBase: baseMonthlyValue,
        valueGrowthRate: valueGrowthRate,
        ROI: 0,
        netValue: 0,
        cumOpCost: 0,
        cumValue: 0,
        totalInvestment: 0,
      };
      await fetch('/api/update-finops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      setError('Failed to update');
    }
  };

  useImperativeHandle(ref, () => ({ saveFinops }));

  return (
    <Card className="mb-8 p-6 bg-gradient-to-br from-[#f5eaff] via-[#fbeaff] to-[#ffeafd] border border-gray-200 shadow-md rounded-xl">
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading && <div className="text-gray-500 mb-4">Loading saved data...</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="font-semibold text-[#23235b]">Initial Dev Cost</label>
          <Input type="number" value={initialDevCost} min={0} onChange={e => handleDevCostChange(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="font-semibold text-[#23235b]">Monthly API Cost</label>
          <Input type="number" value={baseApiCost} min={0} onChange={e => handleApiCostChange(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="font-semibold text-[#23235b]">Monthly Infrastructure</label>
          <Input type="number" value={baseInfraCost} min={0} onChange={e => handleInfraCostChange(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="font-semibold text-[#23235b]">Monthly Operations</label>
          <Input type="number" value={baseOpCost} min={0} onChange={e => handleOpCostChange(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="font-semibold text-[#23235b]">Monthly Value Generated</label>
          <Input type="number" value={baseMonthlyValue} min={0} onChange={e => handleValueChange(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="font-semibold text-[#23235b]">Value Growth Rate (%)</label>
          <Input type="number" value={valueGrowthRate * 100} min={0} max={100} onChange={e => handleGrowthChange(Number(e.target.value))} className="w-full" />
        </div>
      </div>
    </Card>
  );
});

export default BudgetPlanning;
