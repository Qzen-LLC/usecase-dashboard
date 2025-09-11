'use client';

// Governance Dashboard with Full Dark Mode Support and Framework-Specific Lock Management
// Features:
// - Dynamic dark mode detection and theme switching
// - Responsive color schemes for all UI elements
// - Proper contrast and readability in both light and dark themes
// - Framework-specific lock management for exclusive editing

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Users, Building, RefreshCw, AlertTriangle, Lock } from "lucide-react";
import Link from 'next/link';
import { calculateRiskScores, getRiskLevel, type StepsData } from '@/lib/risk-calculations';
import { type GovernanceFramework } from '@/hooks/useGovernanceLock';

interface UseCase {
  useCaseId: string;
  useCaseNumber: number;
  useCaseName: string;
  useCaseType: string;
  department: string;
  regulatoryFrameworks: string[];
  industryStandards: string[];
  lastUpdated: string;
  assessData?: {
    stepsData: any;
  };
  risks?: {
    id: string;
    category: string;
    riskLevel: string;
    status: string;
  }[];
}

interface AssessmentProgress {
  id: string | null;
  status: string;
  progress: number;
  updatedAt: string | null;
  maturityLevel?: string | null;
  weightedScore?: number;
}

export default function GovernancePage() {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [assessmentProgress, setAssessmentProgress] = useState<{ [useCaseId: string]: { euAiAct?: AssessmentProgress; iso42001?: AssessmentProgress; uaeAi?: AssessmentProgress } }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const inFlight = useRef(false);
  
  // Lock management state
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<GovernanceFramework | null>(null);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                    document.body.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchAllData();
    
    // Add focus event listener to refresh data when user returns to the page
    const handleFocus = () => {
      fetchAllData(true);
    };
    
    // Listen for governance refresh events from assessment pages
    const handleGovernanceRefresh = () => {
      fetchAllData(true);
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('governance-refresh', handleGovernanceRefresh);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('governance-refresh', handleGovernanceRefresh);
    };
  }, []);

  const fetchAllData = async (isRefresh = false) => {
    try {
      if (inFlight.current) {
        return;
      }
      inFlight.current = true;
      if (isRefresh) {
        setRefreshing(true);
      }

      const response = await fetch('/api/governance-data');
      if (!response.ok) {
        throw new Error('Failed to fetch governance data');
      }

      const governanceData = await response.json();
      setUseCases(governanceData);

      const progressData: { [useCaseId: string]: { euAiAct?: AssessmentProgress; iso42001?: AssessmentProgress; uaeAi?: AssessmentProgress } } = {};

      for (const useCase of governanceData) {
        const useCaseId = useCase.useCaseId;
        progressData[useCaseId] = {};

        // Check which frameworks are selected for this use case
        const hasEuAiAct = useCase.regulatoryFrameworks.includes('EU AI Act');
        const hasIso42001 = useCase.industryStandards.some((std: string) => std.includes('ISO/IEC 42001'));
        const hasUaeAi = useCase.regulatoryFrameworks.includes('UAE AI/GenAI Controls');

        // Fetch progress for selected frameworks
        const promises = [];

        if (hasEuAiAct) {
          promises.push(
            fetch(`/api/eu-ai-act/progress/${useCaseId}`)
              .then(res => res.json())
              .then(data => { progressData[useCaseId].euAiAct = data; })
              .catch(err => console.error(`Error fetching EU AI Act progress for ${useCaseId}:`, err))
          );
        }

        if (hasIso42001) {
          promises.push(
            fetch(`/api/iso-42001/progress/${useCaseId}`)
              .then(res => res.json())
              .then(data => { progressData[useCaseId].iso42001 = data; })
              .catch(err => console.error(`Error fetching ISO 42001 progress for ${useCaseId}:`, err))
          );
        }

        if (hasUaeAi) {
          promises.push(
            fetch(`/api/uae-ai/progress/${useCaseId}`)
              .then(res => res.json())
              .then(data => { progressData[useCaseId].uaeAi = data; })
              .catch(err => console.error(`Error fetching UAE AI progress for ${useCaseId}:`, err))
          );
        }

        // Wait for all progress requests to complete
        await Promise.all(promises);
      }

      // Set assessment progress
      setAssessmentProgress(progressData);
      
    } catch (err) {
      console.error('Error fetching governance data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
      inFlight.current = false;
    }
  };

  const handleRefresh = () => {
    if (!inFlight.current) fetchAllData(true);
  };

  const handleStartAssessment = async (useCase: UseCase, framework: GovernanceFramework) => {
    setSelectedUseCase(useCase);
    setSelectedFramework(framework);
    
    // Automatically acquire lock without showing modal
    try {
      console.log(`🔒 Automatically acquiring lock for ${framework} on use case ${useCase.useCaseId}`);
      
      const response = await fetch('/api/locks/acquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          useCaseId: useCase.useCaseId,
          lockType: 'EXCLUSIVE',
          scope: framework
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 409) {
          console.log(`❌ Lock already held by another user: ${data.lockDetails?.acquiredBy}`);
          // Show error message for lock conflict
          setError(`This framework is currently being edited by ${data.lockDetails?.acquiredBy}. Please try again later.`);
          return;
        }
        throw new Error(data.error || 'Failed to acquire lock');
      }
      
      console.log(`✅ Lock acquired successfully for ${framework}`);
      
      // Navigate to the appropriate assessment page
      const frameworkRoutes = {
        'GOVERNANCE_EU_AI_ACT': `/dashboard/${useCase.useCaseId}/eu-ai-act`,
        'GOVERNANCE_ISO_42001': `/dashboard/${useCase.useCaseId}/iso-42001`,
        'GOVERNANCE_UAE_AI': `/dashboard/${useCase.useCaseId}/uae-ai`
      };
      
      const route = frameworkRoutes[framework];
      if (route) {
        console.log(`🚀 Navigating to ${route}`);
        window.location.href = route;
      }
      
    } catch (err) {
      console.error('Error acquiring lock:', err);
      setError(err instanceof Error ? err.message : 'Failed to acquire lock');
    } finally {
      // Reset state
      setSelectedUseCase(null);
      setSelectedFramework(null);
    }
  };



  const getFrameworkColor = (framework: string) => {
    const colors: { [key: string]: string } = {
      'EU AI Act': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600',
      'US AI Bill of Rights': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
      'China AI Regulations': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
      'UK AI Framework': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
      'Canada AIDA': 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700',
      'Singapore Model AI Governance': 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700',
    };
    return colors[framework] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700';
  };

  const getStandardColor = (standard: string): string => {
    const colors: { [key: string]: string } = {
      'ISO 27001 (Information Security)': 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
      'ISO 27701 (Privacy)': 'bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-700',
      'ISO/IEC 23053 (AI)': 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-200 border-cyan-300 dark:border-cyan-700',
      'ISO/IEC 23894 (AI Risk)': 'bg-sky-100 dark:bg-sky-900/20 text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-700',
      'ISO/IEC 42001:2023 – AI Management System (AIMS)': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600',
      'ISO/IEC JTC 1/SC 42 – AI Standardization Committee': 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700',
      'SOC 2': 'bg-violet-100 dark:bg-violet-900/20 text-violet-800 dark:text-violet-200 border-violet-300 dark:border-violet-700',
      'FedRAMP': 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700',
      'NIST AI Standards and Risk Management Framework (RMF)': 'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-200 border-pink-300 dark:border-pink-700',
      'AICPA AI Auditing': 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700',
      'IEEE AI Standards': 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700',
    };
    return colors[standard] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg text-foreground">Loading governance data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
          <p className="text-foreground">{error}</p>
          <Button onClick={() => fetchAllData()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-full">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Governance Dashboard</h1>
              <p className="text-muted-foreground">Regulatory frameworks and industry standards for AI systems</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm" 
                disabled={refreshing}
                className="flex items-center gap-2 text-dark"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              {refreshing && (
                <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                  Updating progress...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Use Case Cards */}
        <div className="space-y-4">
          {useCases.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">No Applied Governance Found</h2>
              <p className="text-muted-foreground">No use cases have regulatory frameworks or industry standards applied yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Complete risk assessments on use cases to see them here.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {useCases.map((item: UseCase) => {
                // Determine which sections should be shown based on selected frameworks
                const showEuAiAct = item.regulatoryFrameworks.includes('EU AI Act');
                const showIso42001 = item.industryStandards.some((std: string) => std.includes('ISO/IEC 42001'));
                const showUaeAi = item.regulatoryFrameworks.includes('UAE AI/GenAI Controls');
                
                // Calculate grid columns based on active sections
                const activeSections = [
                  true, // Risk Management always shown
                  showEuAiAct,
                  showIso42001,
                  showUaeAi
                ].filter(Boolean).length;
                
                const gridCols = activeSections === 1 ? 'grid-cols-1' :
                                activeSections === 2 ? 'grid-cols-2' :
                                activeSections === 3 ? 'grid-cols-3' : 'grid-cols-4';

                return (
                <Card key={item.useCaseId} className="border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-3">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-foreground mb-1 truncate">
                          AIUC-{item.useCaseNumber} - {item.useCaseName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1.5">
                          <Building className="h-3 w-3" />
                          <span className="text-xs">{item.department}</span>
                          <Users className="h-3 w-3 ml-1" />
                          <span className="text-xs">{item.useCaseType}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {item.regulatoryFrameworks.slice(0, 2).map((framework: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5 h-5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600">
                              {framework}
                            </Badge>
                          ))}
                          {item.industryStandards.slice(0, 2).map((standard: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5 h-5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                              {standard.includes('FedRAMP') ? 'FedRAMP' : 
                               standard.includes('AICPA') ? 'AICPA AI Auditing' :
                               standard.includes('ISO/IEC 42001') ? 'ISO/IEC 42001:2023' :
                               standard.includes('ISO/IEC JTC') ? 'ISO/IEC JTC 1/SC 42' :
                               standard}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Link href={`/dashboard/${item.useCaseId}/assess`}>
                        <Button variant="outline" size="sm" className="text-xs text-dark">View Assessment</Button>
                      </Link>
                    </div>

                    {/* Dynamic Sections Grid */}
                    <div className={`grid ${gridCols} gap-3`}>
                      {/* Risk Management Section */}
                      <div className="border-l-4 border-red-400 dark:border-red-500 bg-gradient-to-r from-red-50 dark:from-red-900/20 to-red-25 dark:to-red-800/10 pl-3 pr-2 py-2.5 rounded-r">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                            <span className="text-xs font-medium text-red-900 dark:text-red-100">Risk Management</span>
                          </div>
                          <Link href={`/dashboard/${item.useCaseId}/risks`}>
                            <Button variant="ghost" size="sm" className="text-xs h-6 px-2 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20">
                              Manage
                            </Button>
                          </Link>
                        </div>
                        <div className="mb-1.5">
                          {(() => {
                            if (item.assessData?.stepsData) {
                              const riskResult = calculateRiskScores(item.assessData.stepsData as StepsData);
                              const riskLevel = getRiskLevel(riskResult.score);
                              const openRisks = (item.risks || []).filter((r: any) => r.status === 'OPEN').length;
                              return (
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  riskLevel === 'Critical' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200' :
                                  riskLevel === 'High' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200' :
                                  riskLevel === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' :
                                  'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                                }`}>
                                  {riskLevel} ({openRisks} open)
                                </span>
                              );
                            }
                            return <span className="text-xs text-red-600 font-medium">Not assessed</span>;
                          })()}
                        </div>
                        <div className="text-xs text-red-700 dark:text-red-300">
                          {item.assessData?.stepsData ? (
                            (() => {
                              const riskResult = calculateRiskScores(item.assessData.stepsData as StepsData);
                              const criticalCount = riskResult.chartData.filter(d => d.desktop >= 8).length;
                              const highCount = riskResult.chartData.filter(d => d.desktop >= 6 && d.desktop < 8).length;
                              return `${criticalCount} critical, ${highCount} high areas`;
                            })()
                          ) : (
                            'Complete assessment'
                          )}
                        </div>
                      </div>

                      {/* EU AI ACT Section */}
                      {showEuAiAct && (
                      <div className="border-l-4 border-gray-400 dark:border-gray-500 bg-gradient-to-r from-gray-50 dark:from-gray-800 to-gray-25 dark:to-gray-700/10 pl-3 pr-2 py-2.5 rounded-r">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">EU AI ACT</span>
                          <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold">{assessmentProgress[item.useCaseId]?.euAiAct ? `${Math.round(assessmentProgress[item.useCaseId].euAiAct!.progress)}%` : '0%'}</span>
                        </div>
                        <div className="w-full bg-gray-200/60 dark:bg-gray-700/40 rounded-full h-1.5 mb-2">
                          <div className="bg-gray-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${assessmentProgress[item.useCaseId]?.euAiAct?.progress || 0}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className={`text-xs px-1.5 py-0.5 h-5 font-medium ${assessmentProgress[item.useCaseId]?.euAiAct?.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700'}`}>
                            {assessmentProgress[item.useCaseId]?.euAiAct?.status === 'completed' ? 'Completed' : 'In Progress'}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-6 px-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => handleStartAssessment(item, 'GOVERNANCE_EU_AI_ACT')}
                          >
                            Start
                          </Button>
                        </div>
                      </div>
                      )}

                      {/* ISO 42001 Section */}
                      {showIso42001 && (
                      <div className="border-l-4 border-purple-400 dark:border-purple-500 bg-gradient-to-r from-purple-50 dark:from-purple-900/20 to-purple-25 dark:to-purple-800/10 pl-3 pr-2 py-2.5 rounded-r">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-purple-900 dark:text-purple-100">ISO 42001</span>
                          <span className="text-xs text-purple-700 dark:text-purple-300 font-semibold">{assessmentProgress[item.useCaseId]?.iso42001 ? `${Math.round(assessmentProgress[item.useCaseId].iso42001!.progress)}%` : '0%'}</span>
                        </div>
                        <div className="w-full bg-purple-200/60 dark:bg-purple-700/40 rounded-full h-1.5 mb-2">
                          <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${assessmentProgress[item.useCaseId]?.iso42001?.progress || 0}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className={`text-xs px-1.5 py-0.5 h-5 font-medium ${assessmentProgress[item.useCaseId]?.iso42001?.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' : 'bg-yellow-100 dark:text-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700'}`}>
                            {assessmentProgress[item.useCaseId]?.iso42001?.status === 'completed' ? 'Completed' : 'In Progress'}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-6 px-2 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                            onClick={() => handleStartAssessment(item, 'GOVERNANCE_ISO_42001')}
                          >
                            Start
                          </Button>
                        </div>
                      </div>
                      )}

                      {/* UAE AI Controls Section */}
                      {showUaeAi && (
                      <div className="border-l-4 border-emerald-400 dark:border-emerald-500 bg-gradient-to-r from-emerald-50 dark:from-emerald-900/20 to-emerald-25 dark:to-emerald-800/10 pl-3 pr-2 py-2.5 rounded-r">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-emerald-900 dark:text-emerald-100">UAE AI Controls</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">{assessmentProgress[item.useCaseId]?.uaeAi ? `${Math.round(assessmentProgress[item.useCaseId].uaeAi!.progress)}%` : '0%'}</span>
                            {assessmentProgress[item.useCaseId]?.uaeAi && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                assessmentProgress[item.useCaseId].uaeAi!.maturityLevel === 'mature' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                                assessmentProgress[item.useCaseId].uaeAi!.maturityLevel === 'moderate' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
                                'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                              }`}>
                                {assessmentProgress[item.useCaseId].uaeAi!.maturityLevel === 'mature' ? 'Mature' :
                                 assessmentProgress[item.useCaseId].uaeAi!.maturityLevel === 'moderate' ? 'Moderate' : 'High Risk'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-emerald-200/60 dark:bg-emerald-700/40 rounded-full h-1.5 mb-2">
                          <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${assessmentProgress[item.useCaseId]?.uaeAi?.progress || 0}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className={`text-xs px-1.5 py-0.5 h-5 font-medium ${assessmentProgress[item.useCaseId]?.uaeAi?.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700'}`}>
                            {assessmentProgress[item.useCaseId]?.uaeAi?.status === 'completed' ? 'Completed' : 'In Progress'}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-6 px-2 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-100/20"
                            onClick={() => handleStartAssessment(item, 'GOVERNANCE_UAE_AI')}
                          >
                            Start
                          </Button>
                        </div>
                      </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}