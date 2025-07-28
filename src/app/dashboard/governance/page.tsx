'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Users, Building, RefreshCw, AlertTriangle } from "lucide-react";
import Link from 'next/link';
import { calculateRiskScores, getRiskLevel, type StepsData } from '@/lib/risk-calculations';

interface GovernanceData {
  useCaseId: string;
  useCaseNumber: number;
  useCaseName: string;
  useCaseType: string;
  department: string;
  regulatoryFrameworks: string[];
  industryStandards: string[];
  lastUpdated: string;
  euAiActAssessments: {
    id: string;
    status: string;
    progress: number;
  }[];
  iso42001Assessments: {
    id: string;
    status: string;
    progress: number;
  }[];
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

export default function GovernancePage() {
  const [governanceData, setGovernanceData] = useState<GovernanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
    
    // Add focus event listener to refresh data when user returns to the page
    const handleFocus = () => {
      fetchAllData();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchAllData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Add cache-busting parameter to force fresh data
      const timestamp = Date.now();
      
      // Fetch governance data
      const governanceResponse = await fetch(`/api/governance-data?t=${timestamp}`);

      // Check if response is ok
      if (!governanceResponse.ok) {
        const errorData = await governanceResponse.text();
        console.error('Governance API error:', errorData);
        throw new Error(`Failed to fetch governance data: ${governanceResponse.status} - ${errorData}`);
      }

      // Parse response
      const governanceData = await governanceResponse.json();

      // Set state
      setGovernanceData(governanceData);
      
    } catch (err) {
      console.error('Error fetching governance data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAllData(true);
  };

  const getFrameworkColor = (framework: string) => {
    const colors: { [key: string]: string } = {
      'EU AI Act': 'bg-blue-100 text-blue-800 border-blue-300',
      'US AI Bill of Rights': 'bg-red-100 text-red-800 border-red-300',
      'China AI Regulations': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'UK AI Framework': 'bg-green-100 text-green-800 border-green-300',
      'Canada AIDA': 'bg-purple-100 text-purple-800 border-purple-300',
      'Singapore Model AI Governance': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    };
    return colors[framework] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStandardColor = (standard: string) => {
    const colors: { [key: string]: string } = {
      'ISO 27001 (Information Security)': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'ISO 27701 (Privacy)': 'bg-teal-100 text-teal-800 border-teal-300',
      'ISO/IEC 23053 (AI)': 'bg-cyan-100 text-cyan-800 border-cyan-300',
      'ISO/IEC 23894 (AI Risk)': 'bg-sky-100 text-sky-800 border-sky-300',
      'ISO/IEC 42001:2023 – AI Management System (AIMS)': 'bg-blue-100 text-blue-800 border-blue-300',
      'ISO/IEC JTC 1/SC 42 – AI Standardization Committee': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'SOC 2': 'bg-violet-100 text-violet-800 border-violet-300',
      'FedRAMP': 'bg-purple-100 text-purple-800 border-purple-300',
      'NIST AI Standards and Risk Management Framework (RMF)': 'bg-pink-100 text-pink-800 border-pink-300',
      'AICPA AI Auditing': 'bg-rose-100 text-rose-800 border-rose-300',
      'IEEE AI Standards': 'bg-orange-100 text-orange-800 border-orange-300',
    };
    return colors[standard] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg text-gray-600">Loading governance data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => fetchAllData()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }




  return (
    <div className="bg-gray-50 min-h-full">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Governance</h1>
              <p className="text-gray-600">Regulatory frameworks and industry standards for AI systems</p>
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm" 
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Use Case Cards */}
        <div className="space-y-4">
          {governanceData.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Applied Governance Found</h2>
              <p className="text-gray-500">No use cases have regulatory frameworks or industry standards applied yet.</p>
              <p className="text-sm text-gray-400 mt-2">Complete risk assessments on use cases to see them here.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {governanceData.map((item) => (
                <Card key={item.useCaseId} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-3">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                          AIUC-{item.useCaseNumber} - {item.useCaseName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1.5">
                          <Building className="h-3 w-3" />
                          <span className="text-xs">{item.department}</span>
                          <Users className="h-3 w-3 ml-1" />
                          <span className="text-xs">{item.useCaseType}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {item.regulatoryFrameworks.slice(0, 2).map((framework, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5 h-5 bg-blue-50 text-blue-700 border-blue-200">
                              {framework}
                            </Badge>
                          ))}
                          {item.industryStandards.slice(0, 2).map((standard, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5 h-5 bg-purple-50 text-purple-700 border-purple-200">
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
                        <Button variant="outline" size="sm" className="text-xs">View Assessment</Button>
                      </Link>
                    </div>

                    {/* All Sections on Same Line - Less Blocky */}
                    <div className="grid grid-cols-3 gap-3">
                      {/* Risk Management Section */}
                      <div className="border-l-4 border-red-400 bg-gradient-to-r from-red-50 to-red-25 pl-3 pr-2 py-2.5 rounded-r">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                            <span className="text-xs font-medium text-red-900">Risk Management</span>
                          </div>
                          <Link href={`/dashboard/${item.useCaseId}/risks`}>
                            <Button variant="ghost" size="sm" className="text-xs h-6 px-2 text-red-700 hover:bg-red-100">
                              Manage
                            </Button>
                          </Link>
                        </div>
                        <div className="mb-1.5">
                          {(() => {
                            if (item.assessData?.stepsData) {
                              const riskResult = calculateRiskScores(item.assessData.stepsData as StepsData);
                              const riskLevel = getRiskLevel(riskResult.score);
                              const openRisks = (item.risks || []).filter(r => r.status === 'OPEN').length;
                              return (
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  riskLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                                  riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                                  riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {riskLevel} ({openRisks} open)
                                </span>
                              );
                            }
                            return <span className="text-xs text-red-600 font-medium">Not assessed</span>;
                          })()}
                        </div>
                        <div className="text-xs text-red-700">
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
                      <div className="border-l-4 border-blue-400 bg-gradient-to-r from-blue-50 to-blue-25 pl-3 pr-2 py-2.5 rounded-r">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-blue-900">EU AI ACT</span>
                          <span className="text-xs text-blue-700 font-semibold">{item.euAiActAssessments[0] ? `${Math.round(item.euAiActAssessments[0].progress)}%` : '0%'}</span>
                        </div>
                        <div className="w-full bg-blue-200/60 rounded-full h-1.5 mb-2">
                          <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${item.euAiActAssessments[0]?.progress || 0}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className={`text-xs px-1.5 py-0.5 h-5 font-medium ${item.euAiActAssessments[0]?.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}>
                            {item.euAiActAssessments[0]?.status === 'completed' ? 'Completed' : 'In Progress'}
                          </Badge>
                          <Link href={`/dashboard/${item.useCaseId}/eu-ai-act`}>
                            <Button variant="ghost" size="sm" className="text-xs h-6 px-2 text-blue-700 hover:bg-blue-100">Start</Button>
                          </Link>
                        </div>
                      </div>

                      {/* ISO 42001 Section */}
                      <div className="border-l-4 border-purple-400 bg-gradient-to-r from-purple-50 to-purple-25 pl-3 pr-2 py-2.5 rounded-r">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-purple-900">ISO 42001</span>
                          <span className="text-xs text-purple-700 font-semibold">{item.iso42001Assessments[0] ? `${Math.round(item.iso42001Assessments[0].progress)}%` : '0%'}</span>
                        </div>
                        <div className="w-full bg-purple-200/60 rounded-full h-1.5 mb-2">
                          <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${item.iso42001Assessments[0]?.progress || 0}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className={`text-xs px-1.5 py-0.5 h-5 font-medium ${item.iso42001Assessments[0]?.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}>
                            {item.iso42001Assessments[0]?.status === 'completed' ? 'Completed' : 'In Progress'}
                          </Badge>
                          <Link href={`/dashboard/${item.useCaseId}/iso-42001`}>
                            <Button variant="ghost" size="sm" className="text-xs h-6 px-2 text-purple-700 hover:bg-purple-100">Start</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}