'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useParams } from 'next/navigation';
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
  ROI?: number;
  monthlyProfit?: number;
}

// Utility to format monthYear as 'Jan2025'
function formatMonthYear(month: string) {
  return month.replace(' ', '');
}

// Utility to format currency
function formatCurrency(num: number) {
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

// Utility to format percent
function formatPercent(num: number) {
  return (num * 100).toFixed(1) + '%';
}

// Utility to calculate payback period (months until net value >= 0)
function getPaybackPeriod(rows: FinOpsMonth[]) {
  for (let i = 0; i < rows.length; i++) {
    if ((rows[i].netValue ?? 0) >= 0) return i + 1;
  }
  return '-';
}

const FinancialDashboard = () => {
  const params = useParams();
  const useCaseId = params.useCaseId as string;
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
      // Calculate all required fields for the selected month
      let totalLifetimeValue = 0;
      let cumCost = 0;
      let prevNetValue = 0;
      for (let i = 0; i <= selectedIdx; i++) {
        totalLifetimeValue += Number(finopsData[i]?.valueGenerated || 0);
        cumCost += Number(finopsData[i]?.apiCost || 0) + Number(finopsData[i]?.infraCost || 0) + Number(finopsData[i]?.opCost || 0);
        if (i === selectedIdx - 1) {
          prevNetValue = (totalLifetimeValue - (i === 0 ? initialDevCost : 0) - cumCost);
        }
      }
      const devCost = selectedIdx === 0 ? Number(finopsData[0]?.devCost || initialDevCost) : 0;
      const netValue = totalLifetimeValue - devCost - cumCost;
      const roi = (devCost + cumCost) > 0 ? totalLifetimeValue / (devCost + cumCost) : 0;
      const safeROI = isNaN(roi) || roi === undefined ? 0 : roi;
      const monthlyProfit = netValue - prevNetValue;
      const monthData = {
        ...finopsData[selectedIdx],
        monthYear: formatMonthYear(selectedMonth),
        devCost,
        cumCost,
        totalLifetimeValue,
        netValue,
        ROI: safeROI,
        monthlyProfit,
      };
      const res = await fetch('/api/update-finops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useCaseId, ...monthData })
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
      const safeROI = isNaN(roi) || roi === undefined ? 0 : roi;
      const monthlyProfit = netValue - prevNetValue;
      prevNetValue = netValue;
      return {
        ...row,
        devCost,
        cumCost,
        totalLifetimeValue,
        netValue,
        ROI: safeROI,
        monthlyProfit
      };
    });
  };

  const rows = calcRows();

  const summary = useMemo(() => {
    const last = rows[rows.length - 1] || {};
    const totalInvestment = (rows[0]?.devCost ?? 0) + (last.cumCost ?? 0);
    const totalValue = last.totalLifetimeValue ?? 0;
    const netROI = (last.ROI ?? 0);
    const payback = getPaybackPeriod(rows);
    return {
      totalInvestment,
      totalValue,
      netROI,
      payback,
    };
  }, [rows]);

  // Enhanced chart data for Cumulative Financial View
  const enhancedChartData = useMemo(() => ({
    labels: MONTHS,
    datasets: [
      {
        label: 'Development Cost (One-time)',
        data: rows.map((r, i) => i === 0 ? r.devCost ?? 0 : 0),
        borderColor: '#ff4d4f',
        backgroundColor: 'rgba(255,77,79,0.1)',
        borderDash: [6, 6],
        fill: false,
        pointRadius: 4,
        pointBackgroundColor: '#ff4d4f',
        yAxisID: 'y',
      },
      {
        label: 'Cumulative Running Costs',
        data: rows.map(r => r.cumCost ?? 0),
        borderColor: '#ff9900',
        backgroundColor: 'rgba(255,153,0,0.1)',
        fill: '-1',
        pointRadius: 4,
        pointBackgroundColor: '#ff9900',
        yAxisID: 'y',
      },
      {
        label: 'Total Lifetime Value',
        data: rows.map(r => r.totalLifetimeValue ?? 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: false,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
        yAxisID: 'y',
      },
      {
        label: 'Net Value (Profit/Loss)',
        data: rows.map(r => r.netValue ?? 0),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.1)',
        fill: false,
        pointRadius: 4,
        pointBackgroundColor: '#2563eb',
        yAxisID: 'y',
      },
    ]
  }), [rows]);

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
        data: rows.map(r => r.ROI ?? 0),
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
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-gray-200 mt-6 mb-6 p-0">
        {/* Header */}
        <div className="flex flex-col items-center bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] rounded-t-2xl border-b border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 justify-center py-6">
            <div className="bg-white rounded-2xl shadow-lg flex items-center gap-3 px-6 py-3">
              <span className="text-3xl font-extrabold bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] bg-clip-text text-transparent font-sans tracking-tight">Financial Dashboard</span>
            </div>
          </div>
          <div className="w-full flex justify-center pb-6">
            <p className="text-white text-lg text-center font-medium tracking-wide whitespace-nowrap overflow-x-auto">Track and assess monthly financials for your use case</p>
          </div>
        </div>
        {/* Main Content */}
        <div className="p-8">
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col items-center">
              <div className="text-3xl font-extrabold text-red-500 mb-1">{formatCurrency(summary.totalInvestment)}</div>
              <div className="text-gray-500 font-medium text-base">Total Investment</div>
            </div>
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col items-center">
              <div className="text-3xl font-extrabold text-green-500 mb-1">{formatCurrency(summary.totalValue)}</div>
              <div className="text-gray-500 font-medium text-base">Total Value Generated</div>
            </div>
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col items-center">
              <div className="text-3xl font-extrabold text-blue-600 mb-1">{formatPercent(summary.netROI)}</div>
              <div className="text-gray-500 font-medium text-base">Net ROI</div>
            </div>
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col items-center">
              <div className="text-3xl font-extrabold text-green-500 mb-1">{summary.payback} months</div>
              <div className="text-gray-500 font-medium text-base">Payback Period</div>
            </div>
          </div>
          <Card className="mb-8 p-6 bg-gradient-to-br from-[#f5eaff] via-[#fbeaff] to-[#ffeafd] border border-gray-200 shadow-md rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <span className="font-semibold text-[#23235b] text-base">Select Month:</span>
              <select
                value={selectedMonth}
                onChange={handleMonthChange}
                className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-900 focus:border-[#5b5be6] focus:ring-[#5b5be6] shadow-sm transition text-base"
              >
                {monthOptions.map(opt => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-base">
                <thead>
                  <tr className="bg-gradient-to-r from-[#e9eafc] via-[#f5eaff] to-[#ffeafd]">
                    <th className="px-6 py-3 text-left font-bold text-[#23235b]">API Cost</th>
                    <th className="px-6 py-3 text-left font-bold text-[#23235b]">Infra Cost</th>
                    <th className="px-6 py-3 text-left font-bold text-[#23235b]">Operations Cost</th>
                    <th className="px-6 py-3 text-left font-bold text-[#23235b]">Value Generated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white hover:bg-[#f5eaff] transition">
                    <td className="px-6 py-4">
                      <Input
                        type="number"
                        value={selectedRow.apiCost}
                        min={0}
                        onChange={e => handleFieldChange('apiCost', Number(e.target.value))}
                        disabled={loading || saving}
                        className="w-28 text-base border border-gray-200 rounded-lg focus:border-[#5b5be6] focus:ring-[#5b5be6]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        type="number"
                        value={selectedRow.infraCost}
                        min={0}
                        onChange={e => handleFieldChange('infraCost', Number(e.target.value))}
                        disabled={loading || saving}
                        className="w-28 text-base border border-gray-200 rounded-lg focus:border-[#5b5be6] focus:ring-[#5b5be6]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        type="number"
                        value={selectedRow.opCost}
                        min={0}
                        onChange={e => handleFieldChange('opCost', Number(e.target.value))}
                        disabled={loading || saving}
                        className="w-28 text-base border border-gray-200 rounded-lg focus:border-[#5b5be6] focus:ring-[#5b5be6]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        type="number"
                        value={selectedRow.valueGenerated}
                        min={0}
                        onChange={e => handleFieldChange('valueGenerated', Number(e.target.value))}
                        disabled={loading || saving}
                        className="w-28 text-base border border-gray-200 rounded-lg focus:border-[#5b5be6] focus:ring-[#5b5be6]"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Button className="mt-6 w-full bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] hover:from-[#ff4fa3] hover:to-[#8f4fff] text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition" onClick={handleSave} disabled={loading || saving}>Save</Button>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 bg-gradient-to-br from-[#e9eafc] via-[#f5eaff] to-[#ffeafd] border border-gray-200 shadow-md rounded-xl">
              <h2 className="font-semibold mb-4 text-[#23235b] text-lg">Cumulative Financial View & ROI Trend</h2>
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
            <Card className="p-6 bg-gradient-to-br from-[#e9eafc] via-[#f5eaff] to-[#ffeafd] border border-gray-200 shadow-md rounded-xl">
              <h2 className="font-semibold mb-4 text-[#23235b] text-lg">Monthly Cost Breakdown</h2>
              <Bar data={costBreakdown} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </Card>
          </div>
          <div className="mt-8">
            <Card className="p-6 bg-gradient-to-br from-[#e9eafc] via-[#f5eaff] to-[#ffeafd] border border-gray-200 shadow-md rounded-xl">
              <h2 className="font-semibold mb-4 text-[#23235b] text-lg">Monthly Profit/Loss</h2>
              <Bar data={profitLoss} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </Card>
          </div>
          <Card className="p-6 bg-gradient-to-br from-[#e9eafc] via-[#f5eaff] to-[#ffeafd] border border-gray-200 shadow-md rounded-xl mb-8">
            <h2 className="font-semibold mb-4 text-[#23235b] text-lg">Cumulative Financial View</h2>
            <Line
              data={enhancedChartData}
              options={{
                responsive: true,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                  legend: { position: 'top' },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) {
                          if (label.includes('Value') || label.includes('Cost') || label.includes('Profit')) {
                            label += formatCurrency(context.parsed.y);
                          } else {
                            label += context.parsed.y;
                          }
                        }
                        return label;
                      }
                    }
                  }
                },
                scales: {
                  y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'USD' } },
                }
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard; 