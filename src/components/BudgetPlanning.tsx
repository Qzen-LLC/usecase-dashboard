'use client';
import React, { useState, useEffect, useRef } from 'react';
import isEqual from 'lodash.isequal';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Props = {
  onChange?: (data: {
    personnelCost: number;
    infraCost: number;
    servicesCost: number;
    roi: number;
    paybackPeriod: number;
  }) => void;
};

export default function BudgetPlanning({ onChange }: Props) {
  const lastSent = useRef<any>(null);
  const [personnelCost, setPersonnelCost] = useState(120000);
  const [infraCost, setInfraCost] = useState(20000);
  const [servicesCost, setServicesCost] = useState(10000);
  const [roi, setRoi] = useState(200);
  const [paybackPeriod, setPaybackPeriod] = useState(8);

  const totalBudget = personnelCost + infraCost + servicesCost;

  useEffect(() => {
    const currentData = {
      personnelCost,
      infraCost,
      servicesCost,
      roi,
      paybackPeriod,
    };
    if (onChange && !isEqual(currentData, lastSent.current)) {
      onChange(currentData);
      lastSent.current = currentData;
    }
  }, [personnelCost, infraCost, servicesCost, roi, paybackPeriod, onChange]);

  return (
    <div className="space-y-8">
      {/* Assessment Banner */}
      <Card className="bg-yellow-50 border-yellow-400 border-l-4 shadow-none">
        <CardHeader>
          <div className="font-semibold text-yellow-800 text-lg mb-1">Budget Planning</div>
          <div className="text-yellow-700">Define resource requirements and financial projections for the project.</div>
        </CardHeader>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <Label className="font-medium">Cost Breakdown</Label>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            <div className="flex justify-between items-center px-6 py-3">
              <span>Personnel (12 months)</span>
              <Input type="number" value={personnelCost} onChange={(e) => setPersonnelCost(Number(e.target.value))} className="w-32" />
            </div>
            <div className="flex justify-between items-center px-6 py-3">
              <span>Infrastructure & Tools</span>
              <Input type="number" value={infraCost} onChange={(e) => setInfraCost(Number(e.target.value))} className="w-32" />
            </div>
            <div className="flex justify-between items-center px-6 py-3">
              <span>External Services</span>
              <Input type="number" value={servicesCost} onChange={(e) => setServicesCost(Number(e.target.value))} className="w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Budget */}
      <Card>
        <CardContent className="flex justify-between items-center px-6 py-3 font-semibold text-lg">
          <span>Total Budget</span>
          <span>${totalBudget.toLocaleString()}</span>
        </CardContent>
      </Card>

      {/* ROI Projection */}
      <div className="space-y-4">
        <Card className="bg-green-50 shadow-none">
          <CardContent className="py-6 text-center">
            <div className="flex items-center justify-center">
              <Input type="number" value={roi} onChange={(e) => setRoi(Number(e.target.value))} className="w-24 text-2xl font-bold text-green-600 bg-transparent border-none text-center" />
              <span className="text-green-600 text-2xl font-bold">%</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Expected ROI</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 shadow-none">
          <CardContent className="py-6 text-center">
            <div className="flex items-center justify-center">
                <Input type="number" value={paybackPeriod} onChange={(e) => setPaybackPeriod(Number(e.target.value))} className="w-24 text-2xl font-bold text-blue-600 bg-transparent border-none text-center" />
                <span className="text-blue-600 text-2xl font-bold">months</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Payback Period</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
