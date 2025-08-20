// This file will be replaced by a dynamic [useCaseId] route for individual financial assessment pages.
'use client';
import { useEffect, useState } from "react";
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useStableRender } from '@/hooks/useStableRender';

function formatCurrency(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

interface UseCase {
  title: string;
  owner: string;
  stage: string;
  aiucId: number;
}

interface FinOpsData {
  useCaseId: string;
  ROI: number;
  netValue: number;
  apiCostBase: number;
  cumOpCost: number;
  cumValue: number;
  devCostBase: number;
  infraCostBase: number;
  opCostBase: number;
  totalInvestment: number;
  valueBase: number;
  valueGrowthRate: number;
  budgetRange?: string;
  useCase?: UseCase;
}

const FinOpsDashboardPage = () => {
  const router = useRouter();
  const [finops, setFinops] = useState<FinOpsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  // Use global stable render hook
  const { isReady } = useStableRender();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/finops-dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch FinOps data');
        }
        const data = await response.json();
        setFinops(data.finops || []);
      } catch (err) {
        setError('Failed to load FinOps data');
      }
      setLoading(false);
    }
    
    if (isReady) {
      fetchData();
    }
  }, [isReady]);

  // Don't render until stable to prevent hydration mismatch
  if (!isReady) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground font-medium">Loading FinOps Dashboard...</p>
        </div>
      </div>
    );
  }

  const filteredFinops = finops.filter(f =>
    f.useCase?.title.toLowerCase().includes(search.toLowerCase()) ||
    (f.useCase?.owner || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleRowClick = (useCaseId: string) => {
    router.push(`/dashboard/finops-dashboard/${useCaseId}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Page Header */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent leading-tight">
                FinOps Dashboard
              </h1>
              <p className="text-muted-foreground mt-3 text-lg">Financial operations and cost management for AI use cases</p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search by use case or owner..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary rounded-xl"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredFinops.length} of {finops.length} use cases
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground font-medium">Loading FinOps data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6">
            <div className="text-destructive font-medium">{error}</div>
          </div>
        ) : filteredFinops.length === 0 ? (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No FinOps data found</h3>
              <p className="text-muted-foreground">No financial operations data matches your search criteria.</p>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                {/* Header */}
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="px-8 py-4 text-sm font-semibold text-foreground text-left">Use Case</th>
                    <th className="px-8 py-4 text-sm font-semibold text-foreground text-left">Owner</th>
                    <th className="px-8 py-4 text-sm font-semibold text-foreground text-left">Stage</th>
                    <th className="px-8 py-4 text-sm font-semibold text-foreground text-left">Budget Range</th>
                    <th className="px-8 py-4 text-sm font-semibold text-foreground text-right">Dev Cost</th>
                    <th className="px-8 py-4 text-sm font-semibold text-foreground text-right">API Cost</th>
                    <th className="px-8 py-4 text-sm font-semibold text-foreground text-right">Infra Cost</th>
                    <th className="px-8 py-4 text-sm font-semibold text-foreground text-right">Op Cost</th>
                    <th className="px-8 py-4 text-sm font-semibold text-foreground text-right">Total Investment</th>
                    <th className="px-8 py-4 text-sm font-semibold text-foreground text-right">Value Base</th>
                    <th className="px-8 py-4 text-sm font-semibold text-foreground text-right">Value Growth Rate</th>
                    <th className="px-8 py-4 text-sm font-semibold text-foreground text-right">Cumulative Value</th>
                    <th className="px-8 py-4 text-sm font-semibold text-foreground text-right">Cumulative Op Cost</th>
                    <th className="px-8 py-4 text-sm font-semibold text-foreground text-right">Net Value</th>
                    <th className="px-8 py-4 text-sm font-semibold text-foreground text-right">ROI (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredFinops.map((item, index) => (
                    <tr 
                      key={index} 
                      className="bg-card hover:bg-muted/50 transition-colors duration-150 cursor-pointer"
                      onClick={() => handleRowClick(item.useCaseId)}
                    >
                      <td className="px-8 py-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <div className="font-mono text-xs text-muted-foreground">AIUC-{item.useCase?.aiucId}</div>
                          <div className="font-medium text-foreground leading-tight">{item.useCase?.title}</div>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-sm text-muted-foreground">{item.useCase?.owner}</td>
                      <td className="px-8 py-4 text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                          {item.useCase?.stage}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm text-muted-foreground">{item.budgetRange || '-'}</td>
                      <td className="px-8 py-4 text-sm text-right font-medium text-foreground">{formatCurrency(item.devCostBase)}</td>
                      <td className="px-8 py-4 text-sm text-right font-medium text-foreground">{formatCurrency(item.apiCostBase)}</td>
                      <td className="px-8 py-4 text-sm text-right font-medium text-foreground">{formatCurrency(item.infraCostBase)}</td>
                      <td className="px-8 py-4 text-sm text-right font-medium text-foreground">{formatCurrency(item.opCostBase)}</td>
                      <td className="px-8 py-4 text-sm text-right font-medium text-primary">{formatCurrency(item.totalInvestment)}</td>
                      <td className="px-8 py-4 text-sm text-right font-medium text-foreground">{formatCurrency(item.valueBase)}</td>
                      <td className="px-8 py-4 text-sm text-right text-foreground">{(item.valueGrowthRate * 100).toFixed(1)}%</td>
                      <td className="px-8 py-4 text-sm text-right font-medium text-success">{formatCurrency(item.cumValue)}</td>
                      <td className="px-8 py-4 text-sm text-right font-medium text-destructive">{formatCurrency(item.cumOpCost)}</td>
                      <td className="px-8 py-4 text-sm text-right font-medium text-success">{formatCurrency(item.netValue)}</td>
                      <td className="px-8 py-4 text-sm text-right font-medium text-success">{item.ROI.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinOpsDashboardPage; 