'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, FileText, Users, Building } from "lucide-react";
import Link from 'next/link';

interface GovernanceData {
  useCaseId: string;
  useCaseNumber: number;
  useCaseName: string;
  useCaseType: string;
  department: string;
  regulatoryFrameworks: string[];
  industryStandards: string[];
  lastUpdated: string;
  euAiActAssessment?: {
    id: string;
    status: string;
    progress: number;
  };
  iso42001Assessment?: {
    id: string;
    status: string;
    progress: number;
  };
}

export default function GovernancePage() {
  const [governanceData, setGovernanceData] = useState<GovernanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGovernanceData();
  }, []);

  const fetchGovernanceData = async () => {
    try {
      const response = await fetch('/api/governance-data');
      if (!response.ok) {
        throw new Error('Failed to fetch governance data');
      }
      const data = await response.json();
      setGovernanceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
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
          <Button onClick={fetchGovernanceData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="px-6 py-6">
        <div className="mb-6">
          <p className="text-gray-600">Overview of regulatory frameworks and industry standards applied to use cases</p>
        </div>

        {governanceData.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Governance Data Found</h2>
            <p className="text-gray-500">No use cases have regulatory frameworks or industry standards applied yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {governanceData.map((item) => (
              <Card key={item.useCaseId} className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        AIUC-{item.useCaseNumber} - {item.useCaseName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {item.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {item.useCaseType}
                        </span>
                        {/* Applied Frameworks and Standards */}
                        {item.regulatoryFrameworks.map((framework, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className={`${getFrameworkColor(framework)} border font-medium text-xs`}
                          >
                            {framework}
                          </Badge>
                        ))}
                        {item.industryStandards.map((standard, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className={`${getStandardColor(standard)} border font-medium text-xs`}
                          >
                            {standard}
                          </Badge>
                        ))}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/${item.useCaseId}/assess`}>
                        <Button variant="outline" size="sm">
                          View Assessment
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* EU AI ACT */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">EU AI ACT</span>
                        <span className="text-xs text-blue-700">
                          {item.euAiActAssessment ? `${Math.round(item.euAiActAssessment.progress)}%` : '0%'}
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-1.5 mb-2">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${item.euAiActAssessment?.progress || 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            item.euAiActAssessment?.status === 'completed' 
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                          }`}
                        >
                          {item.euAiActAssessment?.status === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                        <Link href={`/dashboard/${item.useCaseId}/eu-ai-act`}>
                          <Button variant="outline" size="sm" className="text-xs h-6">
                            {item.euAiActAssessment ? 'Continue' : 'Start'}
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* ISO 42001 */}
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-900">ISO 42001</span>
                        <span className="text-xs text-purple-700">
                          {item.iso42001Assessment ? `${Math.round(item.iso42001Assessment.progress)}%` : '0%'}
                        </span>
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-1.5 mb-2">
                        <div 
                          className="bg-purple-600 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${item.iso42001Assessment?.progress || 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            item.iso42001Assessment?.status === 'completed' 
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                          }`}
                        >
                          {item.iso42001Assessment?.status === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                        <Link href={`/dashboard/${item.useCaseId}/iso-42001`}>
                          <Button variant="outline" size="sm" className="text-xs h-6">
                            {item.iso42001Assessment ? 'Continue' : 'Start'}
                          </Button>
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
  );
}