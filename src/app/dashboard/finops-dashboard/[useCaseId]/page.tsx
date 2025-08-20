'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { Line, Bar } from 'react-chartjs-2';
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
  Filler,
  Scale,
  CoreScaleOptions
} from 'chart.js';
import { ArrowLeft } from 'lucide-react';

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

const FORECAST_MONTHS = 36;
const MONTHS = Array.from({ length: FORECAST_MONTHS }, (_, i) => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + i);
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
});

function formatCurrency(num: number) {
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function formatPercent(num: number) {
  return num.toFixed(1) + '%';
}

function formatK(num: number) {
  if (Math.abs(num) >= 1000) return `$${(num/1000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}

export default function FinancialDashboard() {
  const params = useParams();
  const router = useRouter();
  const useCaseId = params.useCaseId as string;
  
  const [initialDevCost, setInitialDevCost] = useState<number>(0);
  const [baseApiCost, setBaseApiCost] = useState<number>(0);
  const [baseInfraCost, setBaseInfraCost] = useState<number>(0);
  const [baseOpCost, setBaseOpCost] = useState<number>(0);
  const [baseMonthlyValue, setBaseMonthlyValue] = useState<number>(0);
  const [valueGrowthRate, setValueGrowthRate] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showFormulae, setShowFormulae] = useState(false);
  const [useCaseDetails, setUseCaseDetails] = useState<{ title: string; aiucId: number } | null>(null);

  useEffect(() => {
    if (!useCaseId) return;
    setLoading(true);
    
    // Fetch use case details
    fetch(`/api/get-usecase?id=${useCaseId}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setUseCaseDetails({ title: data.title, aiucId: data.aiucId });
        }
      })
      .catch(console.error);

    // Fetch finops data
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

      // Refresh data from database after saving to ensure consistency
      try {
        const refreshRes = await fetch(`/api/get-finops?id=${useCaseId}`);
        const data = await refreshRes.json();
        if (Array.isArray(data) && data.length > 0) {
          const d = data[0];
          if (d) {
            setInitialDevCost(d.devCostBase ?? initialDevCost);
            setBaseApiCost(d.apiCostBase ?? baseApiCost);
            setBaseInfraCost(d.infraCostBase ?? baseInfraCost);
            setBaseOpCost(d.opCostBase ?? baseOpCost);
            setBaseMonthlyValue(d.valueBase ?? baseMonthlyValue);
            setValueGrowthRate(d.valueGrowthRate ?? valueGrowthRate);
          }
        }
      } catch (refreshError) {
        console.error('Failed to refresh data after save:', refreshError);
      }
    } catch {
      setError('Failed to save');
    }
    setSaving(false);
  };

  // Chart configurations
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

  const roiChart = {
    labels: MONTHS.map((_, i) => i + 1),
    datasets: [{
      label: 'ROI %',
      data: rows.map(r => r.ROI),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.1)',
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#10b981',
      borderWidth: 2,
      tension: 0.1,
    }]
  };

  const roiOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `ROI: ${formatPercent(ctx.parsed.y)}`,
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        ticks: {
          callback: function(this: Scale<CoreScaleOptions>, tickValue: string | number) {
            return formatPercent(Number(tickValue));
          }
        }
      }
    }
  } as const;

  const costBreakdownChart = {
    labels: MONTHS.map((_, i) => i + 1),
    datasets: [
      {
        label: 'API Costs',
        data: rows.map(r => r.apiCost),
        borderColor: '#ff4d4f',
        backgroundColor: 'rgba(255,77,79,0.1)',
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#ff4d4f',
        borderWidth: 2,
        tension: 0.1,
      },
      {
        label: 'Infrastructure',
        data: rows.map(r => r.infraCost),
        borderColor: '#ff9900',
        backgroundColor: 'rgba(255,153,0,0.1)',
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#ff9900',
        borderWidth: 2,
        tension: 0.1,
      },
      {
        label: 'Operations',
        data: rows.map(r => r.opCost),
        borderColor: '#faad14',
        backgroundColor: 'rgba(250,173,20,0.1)',
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#faad14',
        borderWidth: 2,
        tension: 0.1,
      }
    ]
  };

  const costBreakdownOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        ticks: {
          callback: function(this: Scale<CoreScaleOptions>, tickValue: string | number) {
            return formatK(Number(tickValue));
          }
        }
      }
    }
  } as const;

  const profitLossChart = {
    labels: MONTHS.map((_, i) => i + 1),
    datasets: [{
      label: 'Monthly Profit/Loss',
      data: rows.map(r => r.monthlyProfit),
      backgroundColor: rows.map(r => r.monthlyProfit >= 0 ? 'rgba(16,185,129,0.6)' : 'rgba(255,77,79,0.6)'),
      borderColor: rows.map(r => r.monthlyProfit >= 0 ? '#10b981' : '#ff4d4f'),
      borderWidth: 1,
    }]
  };

  const profitLossOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        ticks: {
          callback: function(this: Scale<CoreScaleOptions>, tickValue: string | number) {
            return formatK(Number(tickValue));
          }
        }
      }
    }
  } as const;

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
            let _color = ctx.dataset.borderColor;
            if (label.includes('Development')) _color = '#ff4d4f';
            if (label.includes('Cumulative')) _color = '#ff9900';
            if (label.includes('Lifetime')) _color = '#10b981';
            if (label.includes('Net')) _color = '#2563eb';
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
        type: 'linear' as const,
        ticks: {
          callback: function(this: Scale<CoreScaleOptions>, tickValue: string | number) {
            return formatK(Number(tickValue));
          },
          color: '#222',
          font: { weight: 'bold' as const },
        },
        title: { display: false },
        grid: { color: '#e5e7eb' },
      },
      x: {
        type: 'linear' as const,
        grid: { color: '#e5e7eb' },
      },
    },
  } as const;

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 flex flex-col items-center py-8">
      <div className="w-full max-w-7xl bg-card dark:bg-gray-800 rounded-2xl shadow-2xl border border-border dark:border-gray-700 mt-6 mb-6 p-0 relative">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 px-4 py-2 text-sm bg-card dark:bg-gray-800 text-primary dark:text-primary-foreground border border-border dark:border-gray-600 rounded-lg shadow hover:bg-muted dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 font-medium z-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Edit Button */}
        <button
          onClick={() => setShowFormulae(!showFormulae)}
          className="absolute top-4 right-4 px-3 py-1 text-xs bg-card dark:bg-gray-800 text-primary dark:text-primary-foreground border border-border dark:border-gray-600 rounded-lg shadow hover:bg-muted dark:hover:bg-gray-700 transition-all duration-200 z-10 font-medium"
        >
          {showFormulae ? 'Hide' : 'Edit'} Formulae
        </button>

        {/* Form */}
        {showFormulae && (
          <div className="bg-card dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-lg w-full relative">
            <h2 className="text-2xl font-bold mb-6 text-foreground dark:text-white">Edit Financial Parameters</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-white mb-2">Initial Development Cost</label>
                <Input
                  type="number"
                  value={initialDevCost}
                  onChange={(e) => setInitialDevCost(Number(e.target.value))}
                  className="bg-background dark:bg-gray-700 border-border dark:border-gray-600 text-foreground dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-white mb-2">Base API Cost</label>
                <Input
                  type="number"
                  value={baseApiCost}
                  onChange={(e) => setBaseApiCost(Number(e.target.value))}
                  className="bg-background dark:bg-gray-700 border-border dark:border-gray-600 text-foreground dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-white mb-2">Base Infrastructure Cost</label>
                <Input
                  type="number"
                  value={baseInfraCost}
                  onChange={(e) => setBaseInfraCost(Number(e.target.value))}
                  className="bg-background dark:bg-gray-700 border-border dark:border-gray-600 text-foreground dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-white mb-2">Base Operational Cost</label>
                <Input
                  type="number"
                  value={baseOpCost}
                  onChange={(e) => setBaseOpCost(Number(e.target.value))}
                  className="bg-background dark:bg-gray-700 border-border dark:border-gray-600 text-foreground dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-white mb-2">Base Monthly Value</label>
                <Input
                  type="number"
                  value={baseMonthlyValue}
                  onChange={(e) => setBaseMonthlyValue(Number(e.target.value))}
                  className="bg-background dark:bg-gray-700 border-border dark:border-gray-600 text-foreground dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-white mb-2">Value Growth Rate</label>
                <Input
                  type="number"
                  step="0.01"
                  value={valueGrowthRate}
                  onChange={(e) => setValueGrowthRate(Number(e.target.value))}
                  className="bg-background dark:bg-gray-700 border-border dark:border-gray-600 text-foreground dark:text-white"
                />
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>
        )}

        {/* Dashboard */}
        {!showFormulae && (
          <>
            {/* Header */}
            <div className="bg-card dark:bg-gray-800 rounded-2xl shadow-lg flex items-center gap-3 px-6 py-3">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground dark:text-white">{useCaseDetails?.title || 'Financial Dashboard'}</h1>
                <span className="font-mono text-muted-foreground dark:text-gray-400 mr-3">AIUC-{useCaseDetails?.aiucId}</span>
              </div>
            </div>

            {/* Charts */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Cost vs Value Chart */}
                <div className="bg-card dark:bg-gray-800 rounded-xl shadow border border-border dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-foreground dark:text-white">Cost vs Value Over Time</h3>
                  <Line data={cumulativeChartData} options={cumulativeChartOptions} />
                </div>

                {/* ROI Chart */}
                <div className="bg-card dark:bg-gray-800 rounded-xl shadow border border-border dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-foreground dark:text-white">ROI Over Time</h3>
                  <Line data={roiChart} options={roiOptions} />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {metrics.map((item, idx) => (
                  <div key={idx} className="bg-card dark:bg-gray-800 rounded-xl shadow border border-border dark:border-gray-700 p-6 flex flex-col items-center">
                    <div className="text-2xl font-bold text-primary dark:text-primary-foreground mb-2">{item.value}</div>
                    <div className="font-medium text-base text-muted-foreground dark:text-gray-400">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Detailed Analysis */}
              <Card className="p-8 bg-card dark:bg-gray-800 border border-border dark:border-gray-700 shadow-md rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-foreground dark:text-white">Financial Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-foreground dark:text-white">Cost Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-400">Development:</span>
                        <span className="font-medium text-foreground dark:text-white">{formatCurrency(initialDevCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-400">API:</span>
                        <span className="font-medium text-foreground dark:text-white">{formatCurrency(baseApiCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-400">Infrastructure:</span>
                        <span className="font-medium text-foreground dark:text-white">{formatCurrency(baseInfraCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-400">Operations:</span>
                        <span className="font-medium text-foreground dark:text-white">{formatCurrency(baseOpCost)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-foreground dark:text-white">Value Projections</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-400">Base Monthly Value:</span>
                        <span className="font-medium text-foreground dark:text-white">{formatCurrency(baseMonthlyValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-400">Growth Rate:</span>
                        <span className="font-medium text-foreground dark:text-white">{formatPercent(valueGrowthRate * 100)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-400">3-Year Projection:</span>
                        <span className="font-medium text-success dark:text-green-400">{formatCurrency(projectedValue)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 