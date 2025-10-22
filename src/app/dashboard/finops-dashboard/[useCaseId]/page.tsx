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
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFormulae, setShowFormulae] = useState(false);
  const [useCaseDetails, setUseCaseDetails] = useState<{ title: string; aiucId: number } | null>(null);
  const [isDark, setIsDark] = useState(false);

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
            setInitialDevCost(d.devCostBase ?? 0);
            setBaseApiCost(d.apiCostBase ?? 0);
            setBaseInfraCost(d.infraCostBase ?? 0);
            setBaseOpCost(d.opCostBase ?? 0);
            setBaseMonthlyValue(d.valueBase ?? 0);
            setValueGrowthRate(d.valueGrowthRate ?? 0);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [useCaseId]);

  // Track theme to make charts dark-mode aware
  useEffect(() => {
    const getIsDark = () => {
      try {
        const saved = (localStorage.getItem('theme') || 'system') as 'light' | 'dark' | 'system';
        const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return (
          saved === 'dark' ||
          (saved === 'system' && systemDark) ||
          document.documentElement.classList.contains('dark') ||
          document.body.classList.contains('dark')
        );
      } catch {
        return false;
      }
    };

    const update = () => setIsDark(getIsDark());
    update();

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', update);

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme') update();
    };
    window.addEventListener('storage', onStorage);

    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      media.removeEventListener('change', update);
      window.removeEventListener('storage', onStorage);
      mo.disconnect();
    };
  }, []);

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
    setSuccess(false);
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
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
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

  const axisColors = useMemo(() => ({
    tick: isDark ? '#e5e7eb' : '#222',
    grid: isDark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
  }), [isDark]);

  const roiOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: axisColors.tick } },
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
          },
          color: axisColors.tick,
        },
        grid: { color: axisColors.grid },
      },
      x: {
        grid: { color: axisColors.grid },
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
      legend: { position: 'bottom' as const, labels: { color: axisColors.tick } },
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
          },
          color: axisColors.tick,
        },
        grid: { color: axisColors.grid },
      },
      x: {
        grid: { color: axisColors.grid },
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
      legend: { position: 'bottom' as const, labels: { color: axisColors.tick } },
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
          },
          color: axisColors.tick,
        },
        grid: { color: axisColors.grid },
      },
      x: {
        grid: { color: axisColors.grid },
      }
    }
  } as const;

  const cumulativeChartOptions = {
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'bottom' as const, labels: { usePointStyle: true, color: axisColors.tick } },
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
          color: axisColors.tick,
          font: { weight: 'bold' as const },
        },
        title: { display: false },
        grid: { color: axisColors.grid },
      },
      x: {
        type: 'linear' as const,
        grid: { color: axisColors.grid },
      },
    },
  } as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-8">
      <div className="w-full max-w-7xl bg-card rounded-2xl shadow-2xl border border-border mt-6 mb-6 p-0 relative">
        {/* Header with Back Button and Formula Button */}
        <div className="flex flex-col items-center bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 dark:from-blue-950/40 dark:via-blue-900/30 dark:to-blue-950/40 rounded-t-2xl border-b border-blue-100 dark:border-border shadow-lg relative">
          {/* Back Button */}
          <button
            onClick={() => router.push('/dashboard/finops-dashboard')}
            className="absolute top-4 left-4 px-4 py-2 text-sm bg-card text-primary border border-border rounded-lg shadow hover:bg-accent transition-all duration-200 flex items-center gap-2 font-medium z-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          {/* Show Formulae Button */}
          <button
            className="absolute top-4 right-4 px-3 py-1 text-xs bg-card text-primary border border-border rounded-lg shadow hover:bg-accent transition-all duration-200 z-10 font-medium"
            onClick={() => setShowFormulae(true)}
          >
            Formula
          </button>
          
          {/* Formulae Modal */}
          {showFormulae && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-40">
              <div className="bg-card rounded-xl shadow-2xl p-8 max-w-lg w-full relative border border-border">
                <button className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-xl" onClick={() => setShowFormulae(false)}>&times;</button>
                <h2 className="text-xl font-bold mb-4 text-foreground">Financial Formula Used</h2>
                <ul className="text-sm text-muted-foreground space-y-2">
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
          
          {/* Title Content with proper spacing */}
          <div className="flex items-center gap-3 justify-center py-6 mt-8">
            <div className="bg-card rounded-2xl shadow-lg flex items-center gap-3 px-6 py-3 border border-border">
              <span className="text-3xl font-extrabold text-foreground font-sans tracking-tight">
                {useCaseDetails ? (
                  <>
                    <span className="font-mono text-muted-foreground mr-3">AIUC-{useCaseDetails.aiucId}</span>
                    {useCaseDetails.title}
                  </>
                ) : (
                  'FinOps Dashboard'
                )}
              </span>
            </div>
          </div>
          <div className="w-full flex justify-center pb-6">
            <p className="text-muted-foreground text-lg text-center font-medium tracking-wide whitespace-nowrap overflow-x-auto">Enter your base values and growth rate to forecast financials</p>
          </div>
        </div>
        {/* Main Content */}
        <div className="p-8">
          {error && <div className="text-danger-500 mb-2">{error}</div>}
          {success && (
            <div className="w-full text-center py-3 mb-4 rounded-xl bg-green-100 text-green-800 font-semibold border border-green-300 shadow-sm animate-fade-in dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">
              FinOps saved successfully!
            </div>
          )}
          <Card className="mb-8 p-6 bg-card border border-border shadow-md rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-semibold text-foreground">Initial Dev Cost</label>
                <Input 
                  type="number" 
                  value={initialDevCost} 
                  min={0} 
                  onChange={e => setInitialDevCost(Number(e.target.value))} 
                  onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                  className="w-full" 
                />
              </div>
              <div>
                <label className="font-semibold text-foreground">Monthly API Cost</label>
                <Input 
                  type="number" 
                  value={baseApiCost} 
                  min={0} 
                  onChange={e => setBaseApiCost(Number(e.target.value))} 
                  onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                  className="w-full" 
                />
              </div>
              <div>
                <label className="font-semibold text-foreground">Monthly Infrastructure</label>
                <Input 
                  type="number" 
                  value={baseInfraCost} 
                  min={0} 
                  onChange={e => setBaseInfraCost(Number(e.target.value))} 
                  onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                  className="w-full" 
                />
              </div>
              <div>
                <label className="font-semibold text-foreground">Monthly Operations</label>
                <Input 
                  type="number" 
                  value={baseOpCost} 
                  min={0} 
                  onChange={e => setBaseOpCost(Number(e.target.value))} 
                  onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                  className="w-full" 
                />
              </div>
              <div>
                <label className="font-semibold text-foreground">Monthly Value Generated</label>
                <Input 
                  type="number" 
                  value={baseMonthlyValue} 
                  min={0} 
                  onChange={e => setBaseMonthlyValue(Number(e.target.value))} 
                  onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                  className="w-full" 
                />
              </div>
              <div>
                <label className="font-semibold text-foreground">Value Growth Rate (%)</label>
                <Input 
                  type="number" 
                  value={valueGrowthRate * 100} 
                  min={0} 
                  max={100} 
                  onChange={e => setValueGrowthRate(Number(e.target.value) / 100)} 
                  onFocus={e => { if (e.target.value === '0') e.target.select(); }}
                  className="w-full" 
                />
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <Button 
                className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:via-green-600 hover:to-green-700 text-white px-8 py-3 rounded-xl shadow-lg font-semibold text-lg transition-all duration-200 border border-green-500 hover:border-green-600" 
                onClick={handleSave} 
                disabled={saving}
              >
                Save Forecast
              </Button>
            </div>
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
              <div key={idx} className="bg-card rounded-xl shadow border border-border p-6 flex flex-col items-center">
                <div className="text-3xl font-extrabold mb-1 text-foreground">{item.value}</div>
                <div className="font-medium text-base text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
          {/* Graphs */}
          <div className="flex flex-col gap-10 w-full justify-center items-center">
            <Card className="w-full max-w-7xl mx-auto p-10 bg-card border border-border shadow-md rounded-xl">
              <h2 className="font-semibold mb-6 text-foreground text-2xl">Cumulative Financial View</h2>
              <div className="flex justify-center" style={{ height: 420 }}>
                <Line data={cumulativeChartData} options={cumulativeChartOptions} />
              </div>
            </Card>
            <Card className="w-full max-w-7xl mx-auto p-10 bg-card border border-border shadow-md rounded-xl">
              <h2 className="font-semibold mb-6 text-foreground text-2xl">ROI Trend</h2>
              <div className="flex justify-center" style={{ height: 420 }}>
                <Line data={roiChart} options={roiOptions} />
              </div>
            </Card>
            <Card className="w-full max-w-7xl mx-auto p-10 bg-card border border-border shadow-md rounded-xl">
              <h2 className="font-semibold mb-6 text-foreground text-2xl">Monthly Cost Breakdown</h2>
              <div className="flex justify-center" style={{ height: 420 }}>
                <Line data={costBreakdownChart} options={costBreakdownOptions} />
              </div>
            </Card>
            <Card className="w-full max-w-7xl mx-auto p-10 bg-card border border-border shadow-md rounded-xl">
              <h2 className="font-semibold mb-6 text-foreground text-2xl">Monthly Profit/Loss</h2>
              <div className="flex justify-center" style={{ height: 420 }}>
                <Bar data={profitLossChart} options={profitLossOptions} />
              </div>
            </Card>
          </div>
          {/* Cost Structure Verification (Month 12) */}
          <div className="mt-10">
            <Card className="p-8 bg-card border border-border shadow-md rounded-xl">
              <h2 className="font-semibold text-xl text-foreground mb-6">Cost Structure Verification (Month 12)</h2>
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
                      <div className="font-semibold text-foreground mt-1">API Costs</div>
                      <div className="text-sm text-red-400 mt-1">{apiPct.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold text-orange-500">{formatCurrency(m12.infraCost)}</div>
                      <div className="font-semibold text-foreground mt-1">Infrastructure</div>
                      <div className="text-sm text-orange-400 mt-1">{infraPct.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold text-yellow-700">{formatCurrency(m12.opCost)}</div>
                      <div className="font-semibold text-foreground mt-1">Operations</div>
                      <div className="text-sm text-yellow-600 mt-1">{opPct.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold text-foreground">{formatCurrency(total)}</div>
                      <div className="font-semibold text-foreground mt-1">Total Monthly</div>
                      <div className="text-sm text-muted-foreground mt-1">100%</div>
                    </div>
                  </div>
                );
              })()}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 