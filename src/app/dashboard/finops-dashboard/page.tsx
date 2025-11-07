'use client';
import { useEffect, useState, useMemo } from "react";
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useStableRender } from '@/hooks/useStableRender';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { DollarSign, TrendingUp, Target, Activity, ArrowUpRight, ArrowDownRight, PieChart, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function formatCurrency(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

type FilterColumn = 'breakEvenMonth' | 'totalInvestment' | 'ROI' | 'none';
type SortDirection = 'asc' | 'desc';

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
  breakEvenMonth?: number;
  useCase?: UseCase;
  organizationName?: string;
}

const FinOpsDashboardPage = () => {
  const router = useRouter();
  const [finops, setFinops] = useState<FinOpsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterColumn, setFilterColumn] = useState<FilterColumn>('none');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Use global stable render hook
  const { isReady } = useStableRender();

  // Filter and sort data - MUST be called before any conditional returns
  const filteredFinops = useMemo(() => {
    let result = finops.filter(f =>
      f.useCase?.title.toLowerCase().includes(search.toLowerCase()) ||
      (f.useCase?.owner || '').toLowerCase().includes(search.toLowerCase())
    );

    // Apply sorting if a filter column is selected
    if (filterColumn !== 'none') {
      result = [...result].sort((a, b) => {
        const aValue = a[filterColumn];
        const bValue = b[filterColumn];
        
        if (sortDirection === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        } 
      });
    }

    return result;
  }, [finops, search, filterColumn, sortDirection]);

  // Paginate filtered data
  const paginatedFinops = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredFinops.slice(start, end);
  }, [filteredFinops, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredFinops.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterColumn, sortDirection]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (filteredFinops.length === 0) {
      return {
        totalInvestment: 0,
        totalNetValue: 0,
        totalROI: 0,
        averageROI: 0,
        totalUseCases: 0,
        positiveROI: 0,
        negativeROI: 0,
      };
    }

    const totalInvestment = filteredFinops.reduce((sum, item) => sum + item.totalInvestment, 0);
    const totalNetValue = filteredFinops.reduce((sum, item) => sum + item.netValue, 0);
    const totalROI = filteredFinops.reduce((sum, item) => sum + (item.ROI * item.totalInvestment / 100), 0);
    const averageROI = filteredFinops.reduce((sum, item) => sum + item.ROI, 0) / filteredFinops.length;
    const positiveROI = filteredFinops.filter(item => item.ROI > 0).length;
    const negativeROI = filteredFinops.filter(item => item.ROI <= 0).length;

    return {
      totalInvestment,
      totalNetValue,
      totalROI,
      averageROI,
      totalUseCases: filteredFinops.length,
      positiveROI,
      negativeROI,
    };
  }, [filteredFinops]);

  // Prepare chart data
  const roiDistributionData = useMemo(() => {
    const ranges = [
      { label: '< 0%', min: -Infinity, max: 0 },
      { label: '0-50%', min: 0, max: 50 },
      { label: '50-100%', min: 50, max: 100 },
      { label: '100-200%', min: 100, max: 200 },
      { label: '> 200%', min: 200, max: Infinity },
    ];

    const counts = ranges.map(range => 
      filteredFinops.filter(item => item.ROI > range.min && item.ROI <= range.max).length
    );

    return {
      labels: ranges.map(r => r.label),
      datasets: [{
        label: 'Number of Use Cases',
        data: counts,
        backgroundColor: [
          'rgba(239, 68, 68, 0.6)',
          'rgba(251, 191, 36, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(139, 92, 246, 0.6)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 1,
      }]
    };
  }, [filteredFinops]);

  const investmentBreakdownData = useMemo(() => {
    const topUseCases = [...filteredFinops]
      .sort((a, b) => b.totalInvestment - a.totalInvestment)
      .slice(0, 10);

    return {
      labels: topUseCases.map(item => {
        const orgOrUser = item.organizationName || item.useCase?.owner || 'N/A';
        return `AIUC-${item.useCase?.aiucId} (${orgOrUser})`;
      }),
      datasets: [{
        label: 'Total Investment',
        data: topUseCases.map(item => item.totalInvestment),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      }]
    };
  }, [filteredFinops]);

  const roiComparisonData = useMemo(() => {
    const topUseCases = [...filteredFinops]
      .sort((a, b) => b.ROI - a.ROI)
      .slice(0, 10);

    return {
      labels: topUseCases.map(item => {
        const orgOrUser = item.organizationName || item.useCase?.owner || 'N/A';
        return `AIUC-${item.useCase?.aiucId} (${orgOrUser})`;
      }),
      datasets: [{
        label: 'ROI (%)',
        data: topUseCases.map(item => item.ROI),
        backgroundColor: topUseCases.map(item => item.ROI > 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'),
        borderColor: topUseCases.map(item => item.ROI > 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'),
        borderWidth: 1,
      }]
    };
  }, [filteredFinops]);

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground font-medium">Loading FinOps Dashboard...</p>
        </div>
      </div>
    );
  }

  const handleRowClick = (useCaseId: string) => {
    router.push(`/dashboard/finops-dashboard/${useCaseId}`);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: false,
        }
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">FinOps Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-1">Financial operations overview and analytics</p>
          </div>
        </div>

        {/* Summary Cards */}
        {!loading && !error && filteredFinops.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Investment</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(summaryMetrics.totalInvestment)}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-md">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Net Value</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(summaryMetrics.totalNetValue)}</p>
                </div>
                <div className="p-2 bg-success/10 rounded-md">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
              </div>
            </Card>

            <Card className="p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Average ROI</p>
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-bold text-foreground">{summaryMetrics.averageROI.toFixed(1)}%</p>
                    {summaryMetrics.averageROI > 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-success" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>
                <div className="p-2 bg-accent/10 rounded-md">
                  <Target className="w-5 h-5 text-accent-foreground" />
                </div>
              </div>
            </Card>

            <Card className="p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Use Cases</p>
                  <p className="text-lg font-bold text-foreground">{summaryMetrics.totalUseCases}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summaryMetrics.positiveROI} positive, {summaryMetrics.negativeROI} negative ROI
                  </p>
                </div>
                <div className="p-2 bg-muted rounded-md">
                  <Activity className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Charts Section */}
        {!loading && !error && filteredFinops.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card className="p-4 rounded-md">
              <h3 className="text-sm font-semibold text-foreground mb-3">ROI Distribution</h3>
              <div className="h-64">
                <Bar data={roiDistributionData} options={chartOptions} />
              </div>
            </Card>

            <Card className="p-4 rounded-md">
              <h3 className="text-sm font-semibold text-foreground mb-3">Top 10 Investments</h3>
              <div className="h-64">
                <Bar data={investmentBreakdownData} options={chartOptions} />
              </div>
            </Card>

            <Card className="p-4 rounded-md lg:col-span-2">
              <h3 className="text-sm font-semibold text-foreground mb-3">Top 10 ROI Comparison</h3>
              <div className="h-64">
                <Bar data={roiComparisonData} options={chartOptions} />
              </div>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="p-4 rounded-md">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search by use case or owner..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Select
                value={filterColumn}
                onValueChange={(value) => setFilterColumn(value as FilterColumn)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sort By..</SelectItem>
                  <SelectItem value="totalInvestment">Total Investment</SelectItem>
                  <SelectItem value="ROI">Return on Investment</SelectItem>
                  <SelectItem value="breakEvenMonth">Break Even Month</SelectItem>
                </SelectContent>
              </Select>
              {filterColumn !== 'none' && (
                <Select
                  value={sortDirection}
                  onValueChange={(value) => setSortDirection(value as SortDirection)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">
                {filteredFinops.length} of {finops.length} use cases
              </div>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filterColumn !== 'none' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterColumn('none');
                  setSortDirection('desc');
                  setSearch('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Card>

        {/* Table Section */}
        {loading ? (
          <Card className="p-12 rounded-md">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground font-medium">Loading FinOps data...</p>
            </div>
          </Card>
        ) : error ? (
          <Card className="p-6 rounded-md bg-destructive/10 border-destructive/20">
            <div className="text-destructive font-medium">{error}</div>
          </Card>
        ) : filteredFinops.length === 0 ? (
          <Card className="p-12 rounded-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No FinOps data found</h3>
              <p className="text-muted-foreground">No financial operations data matches your search criteria.</p>
            </div>
          </Card>
        ) : (
          <Card className="rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="px-4 py-3 text-xs font-semibold text-foreground text-left">Use Case</th>
                    <th className="px-4 py-3 text-xs font-semibold text-foreground text-left">Owner</th>
                    <th className="px-4 py-3 text-xs font-semibold text-foreground text-left">Stage</th>
                    <th className="px-4 py-3 text-xs font-semibold text-foreground text-right">Investment</th>
                    <th className="px-4 py-3 text-xs font-semibold text-foreground text-right">Net Value</th>
                    <th className="px-4 py-3 text-xs font-semibold text-foreground text-right">ROI (%)</th>
                    <th className="px-4 py-3 text-xs font-semibold text-foreground text-right">Growth Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedFinops.map((item, index) => (
                    <tr 
                      key={index} 
                      className="bg-card hover:bg-muted/50 transition-colors duration-150 cursor-pointer"
                      onClick={() => handleRowClick(item.useCaseId)}
                    >
                      <td className="px-4 py-3 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <div className="font-mono text-xs text-muted-foreground">AIUC-{item.useCase?.aiucId}</div>
                          <div className="font-medium text-foreground leading-tight">{item.useCase?.title}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{item.useCase?.owner || '-'}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                          {item.useCase?.stage || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-right font-medium text-foreground">{formatCurrency(item.totalInvestment)}</td>
                      <td className={`px-4 py-3 text-xs text-right font-medium ${item.netValue >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(item.netValue)}
                      </td>
                      <td className={`px-4 py-3 text-xs text-right font-medium ${item.ROI >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {item.ROI >= 0 ? '+' : ''}{item.ROI.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-xs text-right text-foreground">{(item.valueGrowthRate * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                <div className="text-xs text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredFinops.length)} of {filteredFinops.length} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="min-w-[2rem] h-8"
                          >
                            {page}
                          </Button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-2 text-xs text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default FinOpsDashboardPage;
