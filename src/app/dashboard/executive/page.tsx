'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useExecutiveMetrics } from '@/hooks/useExecutiveMetrics';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { TrendingUp, DollarSign, Shield, Target, AlertTriangle, CheckCircle, Clock, Zap, Users, Building2, PieChart, Activity, ArrowUpRight, ArrowDownRight, Minus, RefreshCw, Download, Eye, Filter } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

interface UseCase {
  id: string;
  title: string;
  implementationComplexity: number;
  confidenceLevel: number;
}

const ExecutiveDashboard = () => {
  const { data: metrics, isLoading: loading, error, refetch } = useExecutiveMetrics();
  const [animatedValues, setAnimatedValues] = useState<{[key: string]: number}>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark') ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Plugin to ensure Chart.js uses correct text colors
  const forceTextColorPlugin = useMemo(() => ({
    id: 'forceTextColor',
    beforeLayout: (chart: any) => {
      const textColor = isDarkMode ? '#ffffff' : '#000000';
      
      // Force update scale options before layout
      if (chart.scales.y) {
        chart.scales.y.options.ticks.color = textColor;
      }
      if (chart.scales.x) {
        chart.scales.x.options.ticks.color = textColor;
      }
    },
    beforeUpdate: (chart: any) => {
      const textColor = isDarkMode ? '#ffffff' : '#000000';
      
      // Force update scale options before chart updates
      if (chart.scales.y) {
        chart.scales.y.options.ticks.color = textColor;
      }
      if (chart.scales.x) {
        chart.scales.x.options.ticks.color = textColor;
      }
    }
  }), [isDarkMode]);

  const [useCasesByRisk, setUseCasesByRisk] = useState<{
    High: UseCase[];
    Medium: UseCase[];
    Low: UseCase[];
  }>({ High: [], Medium: [], Low: [] });

  // Detect dark mode and update Chart.js defaults
  useEffect(() => {
    const checkDarkMode = () => {
      if (typeof window !== 'undefined') {
        const isDark = document.documentElement.classList.contains('dark') ||
          document.body.classList.contains('dark') ||
          (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setIsDarkMode(isDark);
        // Update Chart.js global defaults comprehensively
        const textColor = isDark ? '#ffffff' : '#000000';
        ChartJS.defaults.color = textColor;
        ChartJS.defaults.scales.linear.ticks.color = textColor;
        ChartJS.defaults.scales.category.ticks.color = textColor;
      }
    };
    
    // Set initial state immediately
    if (typeof window !== 'undefined') {
      const initialDark = document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark') ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDarkMode(initialDark);
      // Set initial Chart.js defaults comprehensively
      const initialTextColor = initialDark ? '#ffffff' : '#000000';
      ChartJS.defaults.color = initialTextColor;
      ChartJS.defaults.scales.linear.ticks.color = initialTextColor;
      ChartJS.defaults.scales.category.ticks.color = initialTextColor;
    }
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    if (typeof window !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
      });
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', checkDarkMode);
      } else {
        mediaQuery.addListener(checkDarkMode);
      }
      
      return () => {
        observer.disconnect();
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', checkDarkMode);
        } else {
          mediaQuery.removeListener(checkDarkMode);
        }
      };
    }
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Animated counter effect
  const animateValue = (key: string, endValue: number, duration: number = 2000) => {
    const startValue = animatedValues[key] || 0;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = startValue + (endValue - startValue) * progress;
      
      setAnimatedValues(prev => ({ ...prev, [key]: currentValue }));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  // Fetch use cases and group by risk
  useEffect(() => {
    const fetchUseCases = async () => {
      try {
        const response = await fetch('/api/read-usecases');
        if (!response.ok) return;
        
        const data = await response.json();
        const useCases = Array.isArray(data.useCases) ? data.useCases : [];
        
        const grouped: { High: UseCase[]; Medium: UseCase[]; Low: UseCase[] } = {
          High: [],
          Medium: [],
          Low: []
        };
        
        useCases.forEach((uc: any) => {
          const complexity = uc.implementationComplexity || 0;
          const confidence = uc.confidenceLevel || 0;
          
          let riskLevel: 'High' | 'Medium' | 'Low';
          if (complexity >= 7 && confidence <= 40) {
            riskLevel = 'High';
          } else if (complexity >= 4 || confidence <= 60) {
            riskLevel = 'Medium';
          } else {
            riskLevel = 'Low';
          }
          
          grouped[riskLevel].push({
            id: uc.id,
            title: uc.title || 'Untitled Use Case',
            implementationComplexity: complexity,
            confidenceLevel: confidence
          });
        });
        
        setUseCasesByRisk(grouped);
      } catch (err) {
        console.error('Error fetching use cases for tooltips:', err);
      }
    };
    
    fetchUseCases();
  }, []);

  // Animate values when metrics load
  useEffect(() => {
    if (metrics) {
      animateValue('totalUseCases', metrics.portfolio.totalUseCases);
      animateValue('portfolioScore', metrics.portfolio.overallScore || 0);
      animateValue('complexity', metrics.portfolio.complexityAnalysis?.average || 0);
      animateValue('confidence', metrics.portfolio.confidenceAnalysis?.average || 0);
    }
  }, [metrics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExport = () => {
    if (!metrics) return;

    // Create CSV content
    const csvContent = generateCSVContent(metrics);
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `executive-dashboard-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSVContent = (metrics: any) => {
    const rows = [];
    
    rows.push(['Executive Dashboard Report', new Date().toLocaleDateString()]);
    rows.push([]);
    
    rows.push(['PORTFOLIO METRICS']);
    rows.push(['Metric', 'Value']);
    rows.push(['Total Use Cases', metrics.portfolio?.totalUseCases || 0]);
    rows.push(['Portfolio Score', `${(metrics.portfolio?.overallScore || 0).toFixed(1)}/10`]);
    rows.push(['Average Complexity', `${(metrics.portfolio?.complexityAnalysis?.average || 0).toFixed(1)}/10`]);
    rows.push(['Average Confidence', `${Math.round(metrics.portfolio?.confidenceAnalysis?.average || 0)}%`]);
    rows.push([]);
    
    if (metrics.portfolio?.stageDistribution) {
      rows.push(['STAGE DISTRIBUTION']);
      rows.push(['Stage', 'Count']);
      Object.entries(metrics.portfolio.stageDistribution).forEach(([stage, count]) => {
        rows.push([stage.replace('-', ' '), count]);
      });
      rows.push([]);
    }
    
    if (metrics.portfolio?.priorityDistribution) {
      rows.push(['PRIORITY DISTRIBUTION']);
      rows.push(['Priority', 'Count']);
      Object.entries(metrics.portfolio.priorityDistribution).forEach(([priority, count]) => {
        rows.push([priority, count]);
      });
      rows.push([]);
    }
    
    if (metrics.financial) {
      rows.push(['FINANCIAL METRICS']);
      rows.push(['Metric', 'Value']);
      rows.push(['Total Investment', formatCurrency(metrics.financial.totalInvestment ?? 0)]);
      rows.push(['Total ROI', formatCurrency(metrics.financial.totalROI ?? 0)]);
      rows.push(['Average ROI', `${(metrics.financial.averageROI ?? 0).toFixed(1)}%`]);
      rows.push(['Avg Cost per Use Case', formatCurrency((metrics.financial.totalInvestment ?? 0) / (metrics.portfolio?.totalUseCases || 1))]);
      rows.push([]);
    }
    
    if (metrics.risk) {
      rows.push(['RISK ASSESSMENT']);
      rows.push(['Risk Level', 'Count']);
      if (metrics.risk.riskDistribution) {
        Object.entries(metrics.risk.riskDistribution).forEach(([risk, count]) => {
          rows.push([risk, count]);
        });
      }
      rows.push(['Total Assessed', metrics.risk.totalAssessed ?? 0]);
      rows.push([]);
    }
    
    if (metrics.strategic) {
      rows.push(['STRATEGIC INSIGHTS']);
      
      if (metrics.strategic.businessFunctionPerformance) {
        rows.push(['BUSINESS FUNCTION PERFORMANCE']);
        rows.push(['Function', 'Count', 'Average ROI']);
        metrics.strategic.businessFunctionPerformance.forEach((func: any) => {
          rows.push([func.function, func.count, `${func.averageROI.toFixed(1)}%`]);
        });
        rows.push([]);
      }
      
      if (metrics.strategic.portfolioBalance) {
        rows.push(['PORTFOLIO BALANCE']);
        rows.push(['Category', 'Count']);
        rows.push(['Quick Wins', metrics.strategic.portfolioBalance.quickWins ?? 0]);
        rows.push(['High Impact Low Complexity', metrics.strategic.portfolioBalance.highImpactLowComplexity ?? 0]);
      }
    }
    
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">Loading Executive Dashboard</h3>
            <p className="text-xs text-muted-foreground">Gathering portfolio insights and metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Unable to Load Dashboard</h2>
              <p className="text-xs text-muted-foreground">{error?.message}</p>
            </div>
            <button 
              onClick={handleRefresh}
              className="w-full bg-primary text-primary-foreground font-medium py-2 px-4 text-sm rounded-md hover:bg-primary/90 transition-colors duration-150"
            >
              <RefreshCw className={`w-4 h-4 inline mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Try Again
            </button>
          </Card>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 text-center space-y-3">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">No Data Available</h2>
            <p className="text-xs text-muted-foreground">No metrics data available for this organization.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Action Buttons */}
        <div className="mb-6 flex justify-end">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-card border border-border rounded-md hover:bg-muted transition-colors duration-150"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-150"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* Clean KPI Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          {/* Total Use Cases */}
          <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
            <div className="p-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Total Use Cases</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(animatedValues.totalUseCases || 0)}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Active</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Portfolio Score */}
          <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
            <div className="p-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Portfolio Score</p>
                <p className="text-2xl font-bold text-foreground">
                  {(animatedValues.portfolioScore || 0).toFixed(1)}/10
                </p>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(animatedValues.portfolioScore || 0) * 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Complexity */}
          <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
            <div className="p-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Avg Complexity</p>
                <p className="text-2xl font-bold text-foreground">
                  {(animatedValues.complexity || 0).toFixed(1)}/10
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-warning rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Moderate</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Confidence */}
          <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
            <div className="p-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(animatedValues.confidence || 0)}%
                </p>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${animatedValues.confidence || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

        </section>

        {/* Portfolio Health Section */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Portfolio Health</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Stage Distribution */}
            {(() => {
              const hasStageData = Object.keys(metrics.portfolio.stageDistribution ?? {}).length > 0;
              if (!hasStageData) {
                return (
                  <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                    <div className="p-4">
                      <div className="mb-4">
                        <h3 className="text-base font-semibold text-foreground">Stage Distribution</h3>
                        <p className="text-xs text-muted-foreground mt-1">Use cases by development stage</p>
                      </div>
                      <div className="h-72 flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">No stage data available</p>
                      </div>
                    </div>
                  </Card>
                );
              }
              
              const stageData = Object.entries(metrics.portfolio.stageDistribution || {}).sort((a, b) => (b[1] as number) - (a[1] as number));
              
              // Color palette that works with both light and dark themes
              const getComputedColor = (index: number) => {
                if (isDarkMode) {
                  // Brighter colors for dark mode
                  const darkPalette = [
                    'rgb(96, 165, 250)',   // Light Blue
                    'rgb(74, 222, 128)',   // Light Green
                    'rgb(251, 146, 60)',  // Orange
                    'rgb(196, 181, 253)',  // Light Purple
                    'rgb(244, 114, 182)',  // Light Pink
                    'rgb(125, 211, 252)',  // Light Sky Blue
                    'rgb(250, 204, 21)',  // Bright Yellow
                    'rgb(248, 113, 113)',  // Light Red
                  ];
                  return darkPalette[index % darkPalette.length];
                } else {
                  // Standard colors for light mode
                  const lightPalette = [
                    'rgb(59, 130, 246)',   // Blue
                    'rgb(34, 197, 94)',   // Green
                    'rgb(251, 146, 60)',  // Orange
                    'rgb(168, 85, 247)',  // Purple
                    'rgb(236, 72, 153)',  // Pink
                    'rgb(14, 165, 233)',  // Sky Blue
                    'rgb(234, 179, 8)',   // Yellow
                    'rgb(239, 68, 68)',   // Red
                  ];
                  return lightPalette[index % lightPalette.length];
                }
              };
              
              const chartData = {
                labels: stageData.map(([stage]) => {
                  return stage
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
                }),
                datasets: [{
                  label: 'Use Cases',
                  data: stageData.map(([, count]) => count as number),
                  backgroundColor: stageData.map((_, index) => getComputedColor(index)),
                  borderRadius: 6,
                  borderSkipped: false,
                  maxBarThickness: 50,
                }]
              };

              const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                  duration: 0
                },
                plugins: {
                  legend: {
                    display: false,
                    labels: {
                      color: isDarkMode ? '#fff' : '#000'
                    }
                  },
                  tooltip: {
                    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: isDarkMode ? '#fff' : '#000',
                    bodyColor: isDarkMode ? '#fff' : '#000',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    cornerRadius: 6,
                    callbacks: {
                      label: function(context: any) {
                        return `${context.parsed.y} use case${context.parsed.y !== 1 ? 's' : ''}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: isDarkMode ? '#ffffff' : '#000000',
                      font: {
                        size: 12,
                        weight: 'bold' as const,
                        family: 'system-ui, -apple-system, sans-serif'
                      },
                      stepSize: 1,
                      precision: 0,
                      padding: 8,
                      callback: function(value: any) {
                        return value;
                      }
                    },
                    grid: {
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                      drawBorder: false,
                    }
                  },
                  x: {
                    ticks: {
                      color: isDarkMode ? '#ffffff' : '#000000',
                      font: {
                        size: 11,
                        weight: 'bold' as const,
                        family: 'system-ui, -apple-system, sans-serif'
                      },
                      maxRotation: 45,
                      minRotation: 0,
                      padding: 6
                    },
                    grid: {
                      display: false,
                      drawBorder: false,
                    }
                  }
                }
              };

              return (
                <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="text-base font-semibold text-foreground">Stage Distribution</h3>
                      <p className="text-xs text-muted-foreground mt-1">Use cases by development stage</p>
                    </div>
                    <div className="h-72 chart-container" style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                      <Bar 
                        key={`stage-${isDarkMode}`} 
                        data={chartData} 
                        options={chartOptions}
                        plugins={[forceTextColorPlugin]}
                        redraw={true}
                      />
                    </div>
                  </div>
                </Card>
              );
            })()}

            {/* Priority Distribution */}
            {(() => {
              const priorityDist = metrics.portfolio.priorityDistribution ?? {};
              const hasPriorityData = Object.keys(priorityDist).length > 0 && 
                Object.values(priorityDist).some((count: any) => count > 0);
              if (!hasPriorityData) {
                return (
                  <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                    <div className="p-4">
                      <div className="mb-4">
                        <h3 className="text-base font-semibold text-foreground">Priority Distribution</h3>
                        <p className="text-xs text-muted-foreground mt-1">Use cases by priority level</p>
                      </div>
                      <div className="h-72 flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">No priority data available</p>
                      </div>
                    </div>
                  </Card>
                );
              }
              
              const priorityData = Object.entries(priorityDist).filter(([, count]) => (count as number) > 0).sort((a, b) => {
                const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
                const aPriority = priorityOrder[a[0].toLowerCase()] || 0;
                const bPriority = priorityOrder[b[0].toLowerCase()] || 0;
                return bPriority - aPriority;
              });

              // Priority-specific colors
              const getPriorityColor = (priority: string) => {
                const priorityLower = priority.toLowerCase();
                if (isDarkMode) {
                  if (priorityLower === 'high') return 'rgb(248, 113, 113)'; // Light Red
                  if (priorityLower === 'medium') return 'rgb(250, 204, 21)'; // Bright Yellow
                  if (priorityLower === 'low') return 'rgb(74, 222, 128)'; // Light Green
                  return 'rgb(156, 163, 175)'; // Gray
                } else {
                  if (priorityLower === 'high') return 'rgb(239, 68, 68)'; // Red
                  if (priorityLower === 'medium') return 'rgb(234, 179, 8)'; // Yellow
                  if (priorityLower === 'low') return 'rgb(34, 197, 94)'; // Green
                  return 'rgb(107, 114, 128)'; // Gray
                }
              };
              
              const chartData = {
                labels: priorityData.map(([priority]) => priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()),
                datasets: [{
                  label: 'Use Cases',
                  data: priorityData.map(([, count]) => count as number),
                  backgroundColor: priorityData.map(([priority]) => getPriorityColor(priority)),
                  borderRadius: 6,
                  borderSkipped: false,
                  maxBarThickness: 50,
                }]
              };

              const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                  duration: 0
                },
                plugins: {
                  legend: {
                    display: false,
                    labels: {
                      color: isDarkMode ? '#fff' : '#000'
                    }
                  },
                  tooltip: {
                    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: isDarkMode ? '#fff' : '#000',
                    bodyColor: isDarkMode ? '#fff' : '#000',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    cornerRadius: 6,
                    callbacks: {
                      label: function(context: any) {
                        return `${context.parsed.y} use case${context.parsed.y !== 1 ? 's' : ''}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: isDarkMode ? '#ffffff' : '#000000',
                      font: {
                        size: 12,
                        weight: 'bold' as const,
                        family: 'system-ui, -apple-system, sans-serif'
                      },
                      stepSize: 1,
                      precision: 0,
                      padding: 8,
                      callback: function(value: any) {
                        return value;
                      }
                    },
                    grid: {
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                      drawBorder: false,
                    }
                  },
                  x: {
                    ticks: {
                      color: isDarkMode ? '#ffffff' : '#000000',
                      font: {
                        size: 11,
                        weight: 'bold' as const,
                        family: 'system-ui, -apple-system, sans-serif'
                      },
                      padding: 6
                    },
                    grid: {
                      display: false,
                      drawBorder: false,
                    }
                  }
                }
              };

              return (
                <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="text-base font-semibold text-foreground">Priority Distribution</h3>
                      <p className="text-xs text-muted-foreground mt-1">Use cases by priority level</p>
                    </div>
                    <div className="h-72 chart-container" style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                      <Bar 
                        key={`priority-${isDarkMode}`} 
                        data={chartData} 
                        options={chartOptions}
                        plugins={[forceTextColorPlugin]}
                        redraw={true}
                      />
                    </div>
                  </div>
                </Card>
              );
            })()}
          </div>
        </section>

        {/* Financial Metrics Section */}
        {metrics.financial && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Financial Metrics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Investment */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Total Investment</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(metrics.financial.totalInvestment ?? 0)}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-success" />
                      <span className="text-xs text-muted-foreground">Growing</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Total ROI */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Total ROI</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(metrics.financial.totalROI ?? 0)}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                      <span className="text-xs text-muted-foreground">Positive</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Average ROI */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Average ROI</p>
                    <p className="text-xl font-bold text-foreground">
                      {(metrics.financial.averageROI ?? 0).toFixed(1)}%
                    </p>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min((metrics.financial.averageROI ?? 0) * 2, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Average Cost per Use Case */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Avg Cost per Use Case</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency((metrics.financial.totalInvestment ?? 0) / (metrics.portfolio.totalUseCases || 1))}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Per Case</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Risk Assessment Section */}
        {metrics.risk && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Risk Assessment</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* High Risk */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150 cursor-pointer">
                    <div className="p-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">High Risk Use Cases</p>
                        <p className="text-2xl font-bold text-foreground">
                          {metrics.risk.riskDistribution?.High ?? 0}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-destructive rounded-full"></div>
                          <span className="text-xs text-muted-foreground">Critical</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  hideArrow
                  className="max-w-xs bg-card text-foreground border border-border shadow-lg p-3"
                >
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">High Risk Use Cases:</p>
                    {useCasesByRisk.High.length > 0 ? (
                      <ul className="space-y-1.5 max-h-60 overflow-y-auto pr-2">
                        {useCasesByRisk.High.map((uc) => (
                          <li key={uc.id} className="text-xs text-foreground">• {uc.title}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">No high risk use cases</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>

              {/* Medium Risk */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150 cursor-pointer">
                    <div className="p-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Medium Risk Use Cases</p>
                        <p className="text-2xl font-bold text-foreground">
                          {metrics.risk.riskDistribution?.Medium ?? 0}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-warning rounded-full"></div>
                          <span className="text-xs text-muted-foreground">Monitor</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  hideArrow
                  className="max-w-xs bg-card text-foreground border border-border shadow-lg p-3"
                >
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Medium Risk Use Cases:</p>
                    {useCasesByRisk.Medium.length > 0 ? (
                      <ul className="space-y-1.5 max-h-60 overflow-y-auto pr-2">
                        {useCasesByRisk.Medium.map((uc) => (
                          <li key={uc.id} className="text-xs text-foreground">• {uc.title}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">No medium risk use cases</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>

              {/* Low Risk */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150 cursor-pointer">
                    <div className="p-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Low Risk Use Cases</p>
                        <p className="text-2xl font-bold text-foreground">
                          {metrics.risk.riskDistribution?.Low ?? 0}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                          <span className="text-xs text-muted-foreground">Safe</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  hideArrow
                  className="max-w-xs bg-card text-foreground border border-border shadow-lg p-3"
                >
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Low Risk Use Cases:</p>
                    {useCasesByRisk.Low.length > 0 ? (
                      <ul className="space-y-1.5 max-h-60 overflow-y-auto pr-2">
                        {useCasesByRisk.Low.map((uc) => (
                          <li key={uc.id} className="text-xs text-foreground">• {uc.title}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">No low risk use cases</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>

              {/* Total Assessed */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Total Assessed</p>
                    <p className="text-2xl font-bold text-foreground">
                      {metrics.risk.totalAssessed ?? 0}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground">Complete</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Strategic Insights Section */}
        {metrics.strategic && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Strategic Insights</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Business Function Performance */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-foreground">Business Function Performance</h3>
                  </div>
                  <div className="space-y-2">
                    {metrics.strategic.businessFunctionPerformance?.map((func: any, index: number) => (
                      <div key={func.function} className="flex items-center justify-between p-2 bg-muted/50 rounded-md hover:bg-muted transition-colors duration-150">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            index === 0 ? 'bg-primary' :
                            index === 1 ? 'bg-success' :
                            index === 2 ? 'bg-warning' :
                            index === 3 ? 'bg-secondary' : 'bg-muted-foreground'
                          }`}></div>
                          <span className="text-xs font-medium text-foreground">
                            {func.function}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded">
                          {func.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              
              {/* Portfolio Balance */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-foreground">Portfolio Balance</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-success rounded-full"></div>
                        <span className="text-xs font-medium text-foreground">Quick Wins</span>
                      </div>
                      <span className="px-3 py-1.5 bg-success text-success-foreground text-base font-bold rounded">
                        {metrics.strategic.portfolioBalance?.quickWins ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                        <span className="text-xs font-medium text-foreground">High Impact Low Complexity</span>
                      </div>
                      <span className="px-3 py-1.5 bg-primary text-primary-foreground text-base font-bold rounded">
                        {metrics.strategic.portfolioBalance?.highImpactLowComplexity ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Average ROI by Function */}
              <Card className="bg-card border border-border hover:shadow-md transition-shadow duration-150">
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-foreground">Average ROI by Function</h3>
                  </div>
                  <div className="space-y-2">
                    {metrics.strategic.businessFunctionPerformance?.slice(0, 5).map((func: any, index: number) => (
                      <div key={func.function} className="flex items-center justify-between p-2 bg-muted/50 rounded-md hover:bg-muted transition-colors duration-150">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            index === 0 ? 'bg-primary' :
                            index === 1 ? 'bg-success' :
                            index === 2 ? 'bg-warning' :
                            index === 3 ? 'bg-secondary' : 'bg-muted-foreground'
                          }`}></div>
                          <span className="text-xs font-medium text-foreground">
                            {func.function}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded">
                          {func.averageROI.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
