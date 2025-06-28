'use client';
import React, { useState, useMemo, useEffect } from 'react';
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
  Legend,
  Filler
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
  Legend,
  Filler
);

// Number of months to forecast
const FORECAST_MONTHS = 36;

const MONTHS = Array.from({ length: FORECAST_MONTHS }, (_, i) => {
  const date = new Date();
  date.setDate(1); // Always first of month for consistency
  date.setMonth(date.getMonth() + i);
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
});

function formatCurrency(num: number) {
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}
function formatPercent(num: number) {
  return num.toFixed(1) + '%';
}

// Helper for $K formatting
function formatK(num: number) {
  if (Math.abs(num) >= 1000) return `$${(num/1000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}

const FinancialDashboard = () => {
  const params = useParams();
  const useCaseId = params.useCaseId as string;
  // 6 Inputs
  const [initialDevCost, setInitialDevCost] = useState<number>(150000);
  const [baseApiCost, setBaseApiCost] = useState<number>(8000);
  const [baseInfraCost, setBaseInfraCost] = useState<number>(2000);
  const [baseOpCost, setBaseOpCost] = useState<number>(5000);
  const [baseMonthlyValue, setBaseMonthlyValue] = useState<number>(25000);
  const [valueGrowthRate, setValueGrowthRate] = useState<number>(0.15);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showFormulae, setShowFormulae] = useState(false);
  
  useEffect(() => {
    if (!useCaseId) return;
    setLoading(true);
    fetch(`/api/get-finops?id=${useCaseId}`)
      .then(res => res.json())
      .then(data => {
        // If data is an array and has at least one entry, use the first (or latest) entry
        if (Array.isArray(data) && data.length > 0) {
          // Use the latest entry (assuming only one per useCaseId)
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

  // Calculations for 36 months
  const rows = useMemo(() => {
    let cumulativeValue = 0;
    let cumulativeOpCosts = 0;
    let breakEvenMonth = null;
    const result = [];
    for (let month = 1; month <= FORECAST_MONTHS; month++) {
      const apiCost = baseApiCost * Math.pow(1.12, month / 12);
      const infraCost = baseInfraCost * Math.pow(1.05, month / 12);
      const opCost = baseOpCost * Math.pow(1.08, month / 12);
      const totalMonthlyCost = apiCost + infraCost + opCost;
      const monthlyValue = baseMonthlyValue * Math.pow(1 + valueGrowthRate, month / 12);
      cumulativeValue += monthlyValue;
      cumulativeOpCosts += totalMonthlyCost;
      const totalInvestment = initialDevCost + cumulativeOpCosts;
      const monthlyProfit = monthlyValue - totalMonthlyCost;
      const netValue = cumulativeValue - totalInvestment;
      const ROI = totalInvestment > 0 ? (netValue / totalInvestment) * 100 : 0;
      if (breakEvenMonth === null && netValue >= 0) breakEvenMonth = month;
      result.push({
        month,
        apiCost,
        infraCost,
        opCost,
        totalMonthlyCost,
        monthlyValue,
        cumulativeValue,
        cumulativeOpCosts,
        totalInvestment,
        monthlyProfit,
        netValue,
        ROI,
      });
    }
    // Attach break-even month to all rows for summary
    return result.map(r => ({ ...r, breakEvenMonth }));
  }, [initialDevCost, baseApiCost, baseInfraCost, baseOpCost, baseMonthlyValue, valueGrowthRate]);

  const summary = useMemo(() => {
    const last = rows[FORECAST_MONTHS - 1] || {};
    return {
      totalInvestment: last.totalInvestment || 0,
      totalValue: last.cumulativeValue || 0,
      netROI: last.ROI || 0,
      breakEvenMonth: last.breakEvenMonth || '-',
      netValue: last.netValue || 0,
    };
  }, [rows]);

  // Cumulative Financial View Chart
  const cumulativeChartData = {
    labels: MONTHS.map((_, i) => i + 1),
    datasets: [
      {
        label: 'Development Cost (One-time)',
        data: Array(FORECAST_MONTHS).fill(initialDevCost),
        borderColor: '#ff4d4f',
        backgroundColor: 'rgba(255,77,79,0.1)',
        borderDash: [6, 6],
        fill: false,
        pointRadius: 4,
        pointBackgroundColor: '#ff4d4f',
        borderWidth: 2,
        tension: 0.1,
        showLine: true,
        type: 'line' as const,
      },
      {
        label: 'Cumulative Running Costs',
        data: rows.map(r => r.cumulativeOpCosts),
        borderColor: '#ff9900',
        backgroundColor: 'rgba(255,153,0,0.15)',
        fill: '-1',
        pointRadius: 4,
        pointBackgroundColor: '#ff9900',
        borderWidth: 2,
        tension: 0.1,
        type: 'line' as const,
      },
      {
        label: 'Total Lifetime Value',
        data: rows.map(r => r.cumulativeValue),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: false,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
        borderWidth: 2,
        tension: 0.1,
        type: 'line' as const,
      },
      {
        label: 'Net Value (Profit/Loss)',
        data: rows.map(r => r.netValue),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.1)',
        fill: false,
        pointRadius: 4,
        pointBackgroundColor: '#2563eb',
        borderWidth: 2,
        tension: 0.1,
        type: 'line' as const,
      },
      {
        label: 'Break-even Line',
        data: Array(FORECAST_MONTHS).fill(0),
        borderColor: '#888',
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0,
        borderWidth: 1,
        type: 'line' as const,
        order: 0,
      },
    ]
  };
  const cumulativeChartOptions = {
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'bottom' as const, labels: { usePointStyle: true } },
      tooltip: {
        callbacks: {
          title: (ctx: any) => `Month ${ctx[0].label}`,
          label: (ctx: any) => {
            const label = ctx.dataset.label || '';
            let value = ctx.parsed.y;
            if (label.includes('Value') || label.includes('Cost') || label.includes('Profit')) {
              value = formatCurrency(value);
            }
            let color = ctx.dataset.borderColor;
            if (label.includes('Development')) color = '#ff4d4f';
            if (label.includes('Cumulative')) color = '#ff9900';
            if (label.includes('Lifetime')) color = '#10b981';
            if (label.includes('Net')) color = '#2563eb';
            return `${label}: ${value}`;
          },
          labelTextColor: (ctx: any) => ctx.dataset.borderColor,
        },
        displayColors: false,
        bodyFont: { weight: 'bold' as const },
        titleFont: { weight: 'bold' as const },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (tickValue: string | number) => formatK(Number(tickValue)),
          color: '#222',
          font: { weight: 'bold' as const },
        },
        title: { display: false },
        grid: { color: '#e5e7eb' },
      },
      x: {
        grid: { color: '#e5e7eb' },
      },
    },
  };

  // Monthly Cost Breakdown (Stacked Area)
  const costBreakdownChart = {
    labels: MONTHS.map((_, i) => i + 1),
    datasets: [
      {
        label: 'API Costs',
        data: rows.map(r => r.apiCost),
        borderColor: '#ff4d4f',
        backgroundColor: 'rgba(255,77,79,0.15)',
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.1,
        type: 'line' as const,
        stack: 'Stack 0',
      },
      {
        label: 'Infrastructure',
        data: rows.map(r => r.infraCost),
        borderColor: '#ff9900',
        backgroundColor: 'rgba(255,153,0,0.15)',
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.1,
        type: 'line' as const,
        stack: 'Stack 0',
      },
      {
        label: 'Operations',
        data: rows.map(r => r.opCost),
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251,191,36,0.15)',
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.1,
        type: 'line' as const,
        stack: 'Stack 0',
      },
    ]
  };
  const costBreakdownOptions = {
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'bottom' as const, labels: { usePointStyle: true } },
      tooltip: {
        callbacks: {
          title: (ctx: any) => `Month ${ctx[0].label}`,
          label: (ctx: any) => {
            const label = ctx.dataset.label || '';
            let value = ctx.parsed.y;
            value = formatCurrency(value);
            let color = ctx.dataset.borderColor;
            return `${label}: ${value}`;
          },
          labelTextColor: (ctx: any) => ctx.dataset.borderColor,
        },
        displayColors: false,
        bodyFont: { weight: 'bold' as const },
        titleFont: { weight: 'bold' as const },
      },
    },
    scales: {
      y: {
        stacked: true,
        ticks: {
          callback: (tickValue: string | number) => formatK(Number(tickValue)),
          color: '#222',
          font: { weight: 'bold' as const },
        },
        grid: { color: '#e5e7eb' },
      },
      x: {
        grid: { color: '#e5e7eb' },
      },
    },
  };

  // Monthly Profit/Loss (Bar)
  const profitLossChart = {
    labels: MONTHS.map((_, i) => i + 1),
    datasets: [
      {
        label: 'Monthly Profit/Loss',
        data: rows.map(r => r.monthlyProfit),
        backgroundColor: '#111',
        borderColor: '#111',
        borderWidth: 1,
        barPercentage: 0.8,
        categoryPercentage: 0.8,
      },
    ],
  };
  const profitLossOptions = {
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'bottom' as const, labels: { usePointStyle: true } },
      tooltip: {
        callbacks: {
          title: (ctx: any) => `Month ${ctx[0].label}`,
          label: (ctx: any) => {
            let value = ctx.parsed.y;
            value = formatCurrency(value);
            return `Monthly Profit/Loss: ${value}`;
          },
        },
        displayColors: false,
        bodyFont: { weight: 'bold' as const },
        titleFont: { weight: 'bold' as const },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (tickValue: string | number) => formatK(Number(tickValue)),
          color: '#222',
          font: { weight: 'bold' as const },
        },
        grid: { color: '#e5e7eb' },
      },
      x: {
        grid: { color: '#e5e7eb' },
      },
    },
  };

  // ROI Trend
  const roiChart = {
    labels: MONTHS.map((_, i) => i + 1),
    datasets: [
      {
        label: 'Return on Investment (%)',
        data: rows.map(r => r.ROI),
        borderColor: '#9461fd',
        backgroundColor: 'rgba(148,97,253,0.1)',
        fill: false,
        pointRadius: 3,
        pointBackgroundColor: '#9461fd',
        borderWidth: 2,
        tension: 0.1,
        type: 'line' as const,
      },
      {
        label: 'Break-even Line',
        data: Array(FORECAST_MONTHS).fill(0),
        borderColor: '#888',
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0,
        borderWidth: 1,
        type: 'line' as const,
      },
    ],
  };
  const roiOptions = {
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'bottom' as const, labels: { usePointStyle: true } },
      tooltip: {
        callbacks: {
          title: (ctx: any) => `Month ${ctx[0].label}`,
          label: (ctx: any) => {
            const label = ctx.dataset.label || '';
            let value = ctx.parsed.y;
            if (label.includes('Return')) value = `${value.toFixed(1)}%`;
            if (label.includes('Break-even')) value = '0%';
            return `${label}: ${value}`;
          },
        },
        displayColors: false,
        bodyFont: { weight: 'bold' as const },
        titleFont: { weight: 'bold' as const },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (tickValue: string | number) => `${Number(tickValue).toFixed(0)}%`,
          color: '#222',
          font: { weight: 'bold' as const },
        },
        grid: { color: '#e5e7eb' },
      },
      x: {
        grid: { color: '#e5e7eb' },
      },
    },
  };

  // Save handler: send forecast values to backend
  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const last = rows[FORECAST_MONTHS - 1];
      const payload = {
        useCaseId,
        ROI: last.ROI,
        netValue: last.netValue,
        apiCostBase: baseApiCost,
        cumOpCost: last.cumulativeOpCosts,
        cumValue: last.cumulativeValue,
        devCostBase: initialDevCost,
        infraCostBase: baseInfraCost,
        opCostBase: baseOpCost,
        totalInvestment: last.totalInvestment,
        valueBase: baseMonthlyValue,
        valueGrowthRate: valueGrowthRate,
      };
      const res = await fetch('/api/update-finops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
    } catch (e) {
      setError('Failed to save');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-2xl border border-gray-200 mt-6 mb-6 p-0 relative">
        {/* Show Formulae Button */}
        <button
          className="absolute top-4 left-4 px-3 py-1 text-xs bg-white text-[#9461fd] border border-[#9461fd] rounded shadow hover:bg-[#f3e8ff] transition z-10 font-semibold"
          onClick={() => setShowFormulae(true)}
        >
          Formula
        </button>
        {/* Formulae Modal */}
        {showFormulae && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl" onClick={() => setShowFormulae(false)}>&times;</button>
              <h2 className="text-xl font-bold mb-4 text-[#9461fd]">Financial Formula Used</h2>
              <ul className="text-sm text-gray-700 space-y-2">
                <li><b>API Cost Growth:</b> <code>monthlyApiCost(month) = baseApiCost × 1.12<sup>month/12</sup></code></li>
                <li><b>Infrastructure Cost Growth:</b> <code>monthlyInfraCost(month) = baseInfraCost × 1.05<sup>month/12</sup></code></li>
                <li><b>Operations Cost Growth:</b> <code>monthlyOpCost(month) = baseOpCost × 1.08<sup>month/12</sup></code></li>
                <li><b>Total Monthly Operating Cost:</b> <code>totalMonthlyCost(month) = monthlyApiCost + monthlyInfraCost + monthlyOpCost</code></li>
                <li><b>Monthly Value Growth:</b> <code>monthlyValue(month) = baseMonthlyValue × (1 + valueGrowthRate)<sup>month/12</sup></code></li>
                <li><b>Cumulative Value:</b> <code>cumulativeValue(month) = Σ monthlyValue(i) for i = 1 to month</code></li>
                <li><b>Cumulative Operating Costs:</b> <code>cumulativeOpCosts(month) = Σ totalMonthlyCost(i) for i = 1 to month</code></li>
                <li><b>Total Investment:</b> <code>totalInvestment(month) = initialDevCost + cumulativeOpCosts(month)</code></li>
                <li><b>Monthly Profit/Loss:</b> <code>monthlyProfit(month) = monthlyValue(month) - totalMonthlyCost(month)</code></li>
                <li><b>Net Value (Cumulative Profit):</b> <code>netValue(month) = cumulativeValue(month) - totalInvestment(month)</code></li>
                <li><b>Return on Investment:</b> <code>ROI(month) = (netValue(month) / totalInvestment(month)) × 100</code></li>
                <li><b>Break-even Detection:</b> <code>breakEven = first month where netValue(month) ≥ 0</code></li>
              </ul>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col items-center bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] rounded-t-2xl border-b border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 justify-center py-6">
            <div className="bg-white rounded-2xl shadow-lg flex items-center gap-3 px-6 py-3">
              <span className="text-3xl font-extrabold bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] bg-clip-text text-transparent font-sans tracking-tight">Financial Dashboard</span>
            </div>
          </div>
          <div className="w-full flex justify-center pb-6">
            <p className="text-white text-lg text-center font-medium tracking-wide whitespace-nowrap overflow-x-auto">Enter your base values and growth rate to forecast financials</p>
          </div>
        </div>
        {/* Main Content */}
        <div className="p-8">
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {/* 6 Inputs */}
          {loading && <div className="text-gray-500 mb-4">Loading saved data...</div>}
          <Card className="mb-8 p-6 bg-gradient-to-br from-[#f5eaff] via-[#fbeaff] to-[#ffeafd] border border-gray-200 shadow-md rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-semibold text-[#23235b]">Initial Dev Cost</label>
                <Input type="number" value={initialDevCost} min={0} onChange={e => setInitialDevCost(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="font-semibold text-[#23235b]">Monthly API Cost</label>
                <Input type="number" value={baseApiCost} min={0} onChange={e => setBaseApiCost(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="font-semibold text-[#23235b]">Monthly Infrastructure</label>
                <Input type="number" value={baseInfraCost} min={0} onChange={e => setBaseInfraCost(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="font-semibold text-[#23235b]">Monthly Operations</label>
                <Input type="number" value={baseOpCost} min={0} onChange={e => setBaseOpCost(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="font-semibold text-[#23235b]">Monthly Value Generated</label>
                <Input type="number" value={baseMonthlyValue} min={0} onChange={e => setBaseMonthlyValue(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="font-semibold text-[#23235b]">Value Growth Rate (%)</label>
                <Input type="number" value={valueGrowthRate * 100} min={0} max={100} onChange={e => setValueGrowthRate(Number(e.target.value) / 100)} className="w-full" />
              </div>
            </div>
            <Button className="mt-6 w-full bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] hover:from-[#ff4fa3] hover:to-[#8f4fff] text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition" onClick={handleSave} disabled={saving}>Save Forecast</Button>
          </Card>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 justify-center">
            {[{
              value: formatCurrency(summary.totalInvestment),
              label: 'Total Investment'
            }, {
              value: formatCurrency(summary.totalValue),
              label: 'Total Value Generated'
            }, {
              value: formatPercent(summary.netROI),
              label: 'Net ROI'
            }, {
              value: `${summary.breakEvenMonth} months`,
              label: 'Break-even Month'
            }, {
              value: formatCurrency(summary.netValue),
              label: 'Net Value (Forecast)'
            }].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col items-center">
                <div className="text-3xl font-extrabold mb-1" style={{ color: '#9461fd' }}>{item.value}</div>
                <div className="font-medium text-base" style={{ color: '#9461fd' }}>{item.label}</div>
              </div>
            ))}
          </div>
          {/* Graphs */}
          <div className="flex flex-col gap-10 w-full justify-center items-center">
            <Card className="w-full max-w-7xl mx-auto p-10 bg-gradient-to-br from-[#e9eafc] via-[#f5eaff] to-[#ffeafd] border border-gray-200 shadow-md rounded-xl">
              <h2 className="font-semibold mb-6 text-[#23235b] text-2xl">Cumulative Financial View</h2>
              <div className="flex justify-center" style={{ height: 420 }}>
                <Line data={cumulativeChartData} options={cumulativeChartOptions} />
              </div>
            </Card>
            <Card className="w-full max-w-7xl mx-auto p-10 bg-gradient-to-br from-[#e9eafc] via-[#f5eaff] to-[#ffeafd] border border-gray-200 shadow-md rounded-xl">
              <h2 className="font-semibold mb-6 text-[#23235b] text-2xl">ROI Trend</h2>
              <div className="flex justify-center" style={{ height: 420 }}>
                <Line data={roiChart} options={roiOptions} />
              </div>
            </Card>
            <Card className="w-full max-w-7xl mx-auto p-10 bg-gradient-to-br from-[#e9eafc] via-[#f5eaff] to-[#ffeafd] border border-gray-200 shadow-md rounded-xl">
              <h2 className="font-semibold mb-6 text-[#23235b] text-2xl">Monthly Cost Breakdown</h2>
              <div className="flex justify-center" style={{ height: 420 }}>
                <Line data={costBreakdownChart} options={costBreakdownOptions} />
              </div>
            </Card>
            <Card className="w-full max-w-7xl mx-auto p-10 bg-gradient-to-br from-[#e9eafc] via-[#f5eaff] to-[#ffeafd] border border-gray-200 shadow-md rounded-xl">
              <h2 className="font-semibold mb-6 text-[#23235b] text-2xl">Monthly Profit/Loss</h2>
              <div className="flex justify-center" style={{ height: 420 }}>
                <Bar data={profitLossChart} options={profitLossOptions} />
              </div>
            </Card>
          </div>
          {/* Cost Structure Verification (Month 12) */}
          <div className="mt-10">
            <Card className="p-8 bg-white border border-gray-200 shadow-md rounded-xl">
              <h2 className="font-semibold text-xl text-[#23235b] mb-6">Cost Structure Verification (Month 12)</h2>
              {(() => {
                const m12 = rows[11];
                if (!m12) return null;
                const total = m12.totalMonthlyCost;
                const apiPct = total ? (m12.apiCost / total) * 100 : 0;
                const infraPct = total ? (m12.infraCost / total) * 100 : 0;
                const opPct = total ? (m12.opCost / total) * 100 : 0;
                return (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                    <div>
                      <div className="text-3xl font-extrabold text-red-500">{formatCurrency(m12.apiCost)}</div>
                      <div className="font-semibold text-gray-700 mt-1">API Costs</div>
                      <div className="text-sm text-red-400 mt-1">{apiPct.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold text-orange-500">{formatCurrency(m12.infraCost)}</div>
                      <div className="font-semibold text-gray-700 mt-1">Infrastructure</div>
                      <div className="text-sm text-orange-400 mt-1">{infraPct.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold text-yellow-700">{formatCurrency(m12.opCost)}</div>
                      <div className="font-semibold text-gray-700 mt-1">Operations</div>
                      <div className="text-sm text-yellow-600 mt-1">{opPct.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold text-gray-800">{formatCurrency(total)}</div>
                      <div className="font-semibold text-gray-700 mt-1">Total Monthly</div>
                      <div className="text-sm text-gray-500 mt-1">100%</div>
                    </div>
                  </div>
                );
              })()}
            </Card>
          </div>
          <Button
            className="mt-10 w-full bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition"
            onClick={() => window.location.href = `/dashboard/${useCaseId}/assess/approvals`}
          >
            Proceed to Approvals
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard; 