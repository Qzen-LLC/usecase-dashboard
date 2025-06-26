'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import {
  Line,
  Bar
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { format, parse } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MONTHS = [
  'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025'
];

const monthOptions = MONTHS.map((m, idx) => ({
  label: m,
  value: m,
  disabled: idx > 5 // Only up to June 2025 editable
}));

const getCurrentMonthIndex = () => 5; // June 2025 is index 5

// Define the type for a single month's financial data
interface FinOpsMonth {
  monthYear: string;
  apiCost: number;
  infraCost: number;
  opCost: number;
  valueGenerated: number;
  devCost: number;
  cumCost?: number;
  totalLifetimeValue?: number;
  netValue?: number;
  roi?: number;
  monthlyProfit?: number;
}

const FinancialDashboard = () => {
  const searchParams = useSearchParams();
  const useCaseId = searchParams.get('id');
  const [finopsData, setFinopsData] = useState<FinOpsMonth[]>([]);
  const [initialDevCost, setInitialDevCost] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[0]);

  useEffect(() => {
    if (!useCaseId) return;
    setLoading(true);
    fetch(`/api/get-finops?id=${useCaseId}`)
      .then(res => res.json())
      .then(data => {
        setFinopsData(data.months || []);
        setInitialDevCost(data.initialDevCost || 0);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load data');
        setLoading(false);
      });
  }, [useCaseId]);

  // Ensure all months are present
  useEffect(() => {
    if (finopsData.length < MONTHS.length) {
      const filled = MONTHS.map((month, idx) =>
        finopsData.find(d => d.monthYear === month) || {
          monthYear: month,
          apiCost: 0,
          infraCost: 0,
          opCost: 0,
          valueGenerated: 0,
          devCost: idx === 0 ? initialDevCost : 0
        }
      );
      setFinopsData(filled);
    }
  }, [finopsData, initialDevCost]);

  // Find the selected month's data
  const selectedIdx = MONTHS.indexOf(selectedMonth);
  const selectedRow = finopsData[selectedIdx] || {
    monthYear: selectedMonth,
    apiCost: 0,
    infraCost: 0,
    opCost: 0,
    valueGenerated: 0,
    devCost: selectedIdx === 0 ? initialDevCost : 0
  };

  // Handler for month change
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  // Handler for editing the selected month's data
  const handleFieldChange = (field: keyof Omit<FinOpsMonth, 'monthYear'>, value: number) => {
    setFinopsData(prev => {
      // If the month doesn't exist, create it
      if (!prev[selectedIdx]) {
        const newRow: FinOpsMonth = {
          monthYear: selectedMonth,
          apiCost: 0,
          infraCost: 0,
          opCost: 0,
          valueGenerated: 0,
          devCost: selectedIdx === 0 ? initialDevCost : 0
        };
        const newArr = [...prev];
        newArr[selectedIdx] = { ...newRow, [field]: value };
        return newArr;
      }
      // Otherwise, update existing
      return prev.map((row, i) =>
        i === selectedIdx ? { ...row, [field]: value } : row
      );
    });
  };

  // Save only the selected month's data (create or update)
  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      // Always send the selectedRow, which is either new or existing
      const res = await fetch('/api/update-finops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useCaseId, month: finopsData[selectedIdx] || selectedRow })
      });
      if (!res.ok) throw new Error('Save failed');
    } catch (e) {
      setError('Failed to save');
    }
    setSaving(false);
  };

  // Calculations
  const calcRows = (): FinOpsMonth[] => {
    let totalLifetimeValue = 0;
    let cumCost = 0;
    let prevNetValue = 0;
    return finopsData.map((row, idx) => {
      totalLifetimeValue += Number(row.valueGenerated || 0);
      cumCost += Number(row.apiCost || 0) + Number(row.infraCost || 0) + Number(row.opCost || 0);
      const devCost = idx === 0 ? Number(row.devCost || 0) : 0;
      const netValue = totalLifetimeValue - devCost - cumCost;
      const roi = (devCost + cumCost) > 0 ? totalLifetimeValue / (devCost + cumCost) : 0;
      const monthlyProfit = netValue - prevNetValue;
      prevNetValue = netValue;
      return {
        ...row,
        devCost,
        cumCost,
        totalLifetimeValue,
        netValue,
        roi,
        monthlyProfit
      };
    });
  };

  const rows = calcRows();

  // Chart data
  const chartData: ChartData<'line'> = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Cumulative Financial View',
        data: rows.map(r => (r.totalLifetimeValue ?? 0) - (r.cumCost ?? 0) - (r.devCost ?? 0)),
        borderColor: '#8f4fff',
        backgroundColor: 'rgba(143,79,255,0.1)',
        yAxisID: 'y',
      },
      {
        label: 'ROI',
        data: rows.map(r => r.roi ?? 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        yAxisID: 'y1',
      }
    ]
  };

  const costBreakdown: ChartData<'bar'> = {
    labels: MONTHS,
    datasets: [
      {
        label: 'API Cost',
        data: rows.map(r => r.apiCost),
        backgroundColor: '#b84fff',
      },
      {
        label: 'Infra Cost',
        data: rows.map(r => r.infraCost),
        backgroundColor: '#8f4fff',
      },
      {
        label: 'Operations Cost',
        data: rows.map(r => r.opCost),
        backgroundColor: '#ff4fa3',
      }
    ]
  };

  const profitLoss: ChartData<'bar'> = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Monthly Profit/Loss',
        data: rows.map(r => r.monthlyProfit ?? 0),
        backgroundColor: '#10b981',
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold mb-4 text-[#23235b]">Financial Dashboard</h1>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <Card className="mb-6 p-4">
          <div className="flex items-center gap-4 mb-4">
            <span className="font-semibold">Select Month:</span>
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="border rounded px-2 py-1"
            >
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th>API Cost</th>
                  <th>Infra Cost</th>
                  <th>Operations Cost</th>
                  <th>Value Generated</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Input
                      type="number"
                      value={selectedRow.apiCost}
                      min={0}
                      onChange={e => handleFieldChange('apiCost', Number(e.target.value))}
                      disabled={loading || saving}
                      className="w-24"
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={selectedRow.infraCost}
                      min={0}
                      onChange={e => handleFieldChange('infraCost', Number(e.target.value))}
                      disabled={loading || saving}
                      className="w-24"
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={selectedRow.opCost}
                      min={0}
                      onChange={e => handleFieldChange('opCost', Number(e.target.value))}
                      disabled={loading || saving}
                      className="w-24"
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={selectedRow.valueGenerated}
                      min={0}
                      onChange={e => handleFieldChange('valueGenerated', Number(e.target.value))}
                      disabled={loading || saving}
                      className="w-24"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Button className="mt-4" onClick={handleSave} disabled={loading || saving}>Save</Button>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-4">
            <h2 className="font-semibold mb-2">Cumulative Financial View & ROI Trend</h2>
            <Line
              data={chartData}
              options={{
                responsive: true,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { position: 'top' } },
                scales: {
                  y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Net Value' } },
                  y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'ROI' } }
                }
              }}
            />
          </Card>
          <Card className="p-4">
            <h2 className="font-semibold mb-2">Monthly Cost Breakdown</h2>
            <Bar data={costBreakdown} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
          </Card>
        </div>
        <div className="mt-8">
          <Card className="p-4">
            <h2 className="font-semibold mb-2">Monthly Profit/Loss</h2>
            <Bar data={profitLoss} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard; 