'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, FileText, Users, Building, BookOpen, Gavel } from "lucide-react";
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

interface EuAiActTopic {
  topicId: string;
  title: string;
  description: string;
  subtopics: {
    subtopicId: string;
    title: string;
    questions: {
      questionId: string;
      text: string;
    }[];
  }[];
}

interface EuAiActControlCategory {
  categoryId: string;
  title: string;
  description: string;
  controls: {
    controlId: string;
    title: string;
    description: string;
    subcontrols: {
      subcontrolId: string;
      title: string;
      description: string;
    }[];
  }[];
}

interface Iso42001Clause {
  clauseId: string;
  clauseNumber: string;
  title: string;
  description: string;
  subclauses: {
    subclauseId: string;
    subclauseNumber: string;
    title: string;
    description: string;
  }[];
}

interface Iso42001AnnexCategory {
  categoryId: string;
  title: string;
  description: string;
  items: {
    itemId: string;
    title: string;
    description: string;
  }[];
}

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState<'applied' | 'eu-ai-act' | 'iso-42001'>('applied');
  const [governanceData, setGovernanceData] = useState<GovernanceData[]>([]);
  const [euAiActTopics, setEuAiActTopics] = useState<EuAiActTopic[]>([]);
  const [euAiActControls, setEuAiActControls] = useState<EuAiActControlCategory[]>([]);
  const [iso42001Clauses, setIso42001Clauses] = useState<Iso42001Clause[]>([]);
  const [iso42001Annex, setIso42001Annex] = useState<Iso42001AnnexCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        governanceResponse,
        euTopicsResponse,
        euControlsResponse,
        isoClausesResponse,
        isoAnnexResponse
      ] = await Promise.all([
        fetch('/api/governance-data'),
        fetch('/api/eu-ai-act/topics'),
        fetch('/api/eu-ai-act/control-categories'),
        fetch('/api/iso-42001/clauses'),
        fetch('/api/iso-42001/annex')
      ]);

      // Check if all responses are ok
      if (!governanceResponse.ok) throw new Error('Failed to fetch governance data');
      if (!euTopicsResponse.ok) throw new Error('Failed to fetch EU AI Act topics');
      if (!euControlsResponse.ok) throw new Error('Failed to fetch EU AI Act controls');
      if (!isoClausesResponse.ok) throw new Error('Failed to fetch ISO clauses');
      if (!isoAnnexResponse.ok) throw new Error('Failed to fetch ISO annex');

      // Parse all responses
      const [
        governanceData,
        euTopicsData,
        euControlsData,
        isoClausesData,
        isoAnnexData
      ] = await Promise.all([
        governanceResponse.json(),
        euTopicsResponse.json(),
        euControlsResponse.json(),
        isoClausesResponse.json(),
        isoAnnexResponse.json()
      ]);

      // Set all state
      setGovernanceData(governanceData);
      setEuAiActTopics(euTopicsData);
      setEuAiActControls(euControlsData);
      setIso42001Clauses(isoClausesData);
      setIso42001Annex(isoAnnexData);
      
    } catch (err) {
      console.error('Error fetching governance data:', err);
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
          <Button onClick={fetchAllData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const renderAppliedGovernanceTab = () => (
    <div className="space-y-6">
      {governanceData.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Applied Governance Found</h2>
          <p className="text-gray-500">No use cases have regulatory frameworks or industry standards applied yet.</p>
          <p className="text-sm text-gray-400 mt-2">Complete risk assessments on use cases to see them here.</p>
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
                      {item.regulatoryFrameworks.map((framework, index) => (
                        <Badge key={index} variant="outline" className={`${getFrameworkColor(framework)} border font-medium text-xs`}>
                          {framework}
                        </Badge>
                      ))}
                      {item.industryStandards.map((standard, index) => (
                        <Badge key={index} variant="outline" className={`${getStandardColor(standard)} border font-medium text-xs`}>
                          {standard}
                        </Badge>
                      ))}
                    </CardDescription>
                  </div>
                  <Link href={`/dashboard/${item.useCaseId}/assess`}>
                    <Button variant="outline" size="sm">View Assessment</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">EU AI ACT</span>
                      <span className="text-xs text-blue-700">{item.euAiActAssessment ? `${Math.round(item.euAiActAssessment.progress)}%` : '0%'}</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-1.5 mb-2">
                      <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${item.euAiActAssessment?.progress || 0}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className={`text-xs ${item.euAiActAssessment?.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}>
                        {item.euAiActAssessment?.status === 'completed' ? 'Completed' : 'In Progress'}
                      </Badge>
                      <Link href={`/dashboard/${item.useCaseId}/eu-ai-act`}>
                        <Button variant="outline" size="sm" className="text-xs h-6">{item.euAiActAssessment ? 'Continue' : 'Start'}</Button>
                      </Link>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-900">ISO 42001</span>
                      <span className="text-xs text-purple-700">{item.iso42001Assessment ? `${Math.round(item.iso42001Assessment.progress)}%` : '0%'}</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-1.5 mb-2">
                      <div className="bg-purple-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${item.iso42001Assessment?.progress || 0}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className={`text-xs ${item.iso42001Assessment?.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}>
                        {item.iso42001Assessment?.status === 'completed' ? 'Completed' : 'In Progress'}
                      </Badge>
                      <Link href={`/dashboard/${item.useCaseId}/iso-42001`}>
                        <Button variant="outline" size="sm" className="text-xs h-6">{item.iso42001Assessment ? 'Continue' : 'Start'}</Button>
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
  );

  const renderEuAiActTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <Gavel className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-blue-900">EU AI Act Framework</h2>
            <p className="text-blue-700">Complete regulatory framework for AI systems compliance</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Topics:</span> {euAiActTopics.length}
          </div>
          <div>
            <span className="font-medium text-blue-800">Control Categories:</span> {euAiActControls.length}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Assessment Topics
          </h3>
          <div className="grid gap-4">
            {euAiActTopics.map((topic) => (
              <Card key={topic.topicId} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-900">{topic.title}</CardTitle>
                  {topic.description && <CardDescription className="text-sm text-gray-600">{topic.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  {topic.subtopics.map((subtopic) => (
                    <div key={subtopic.subtopicId} className="mb-4 last:mb-0">
                      <h5 className="font-medium text-sm text-gray-800 mb-2">{subtopic.title}</h5>
                      <div className="ml-4 space-y-1">
                        {subtopic.questions.map((question) => (
                          <p key={question.questionId} className="text-xs text-gray-600 pl-2 border-l-2 border-gray-200">
                            {question.text}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Control Framework
          </h3>
          <div className="grid gap-4">
            {euAiActControls.map((category) => (
              <Card key={category.categoryId} className="border-l-4 border-l-indigo-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-900">{category.title}</CardTitle>
                  {category.description && <CardDescription className="text-sm text-gray-600">{category.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  {category.controls.map((control) => (
                    <div key={control.controlId} className="mb-4 last:mb-0">
                      <h5 className="font-medium text-sm text-gray-800 mb-2">{control.title}</h5>
                      {control.description && <p className="text-xs text-gray-600 mb-2 ml-4">{control.description}</p>}
                      <div className="ml-8 space-y-1">
                        {control.subcontrols.map((subcontrol) => (
                          <div key={subcontrol.subcontrolId} className="text-xs text-gray-600 pl-2 border-l-2 border-gray-200">
                            <span className="font-medium">{subcontrol.title}:</span> {subcontrol.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderIso42001Tab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-purple-900">ISO/IEC 42001:2023 Framework</h2>
            <p className="text-purple-700">AI Management System standard for organizations</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-purple-800">Clauses:</span> {iso42001Clauses.length}
          </div>
          <div>
            <span className="font-medium text-purple-800">Annex Categories:</span> {iso42001Annex.length}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Standard Clauses
          </h3>
          <div className="grid gap-4">
            {iso42001Clauses.map((clause) => (
              <Card key={clause.clauseId} className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    {clause.clauseNumber} - {clause.title}
                  </CardTitle>
                  {clause.description && <CardDescription className="text-sm text-gray-600">{clause.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  {clause.subclauses.map((subclause) => (
                    <div key={subclause.subclauseId} className="mb-3 last:mb-0">
                      <h5 className="font-medium text-sm text-gray-800 mb-1">
                        {subclause.subclauseNumber} - {subclause.title}
                      </h5>
                      {subclause.description && (
                        <p className="text-xs text-gray-600 ml-4 pl-2 border-l-2 border-gray-200">
                          {subclause.description}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Annex Requirements
          </h3>
          <div className="grid gap-4">
            {iso42001Annex.map((category) => (
              <Card key={category.categoryId} className="border-l-4 border-l-pink-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-900">{category.title}</CardTitle>
                  {category.description && <CardDescription className="text-sm text-gray-600">{category.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.items.map((item) => (
                      <div key={item.itemId} className="text-xs text-gray-600 pl-2 border-l-2 border-gray-200">
                        <span className="font-medium">{item.title}:</span> {item.description}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Governance</h1>
          <p className="text-gray-600">Regulatory frameworks and industry standards for AI systems</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('applied')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'applied'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Applied Governance
              </div>
            </button>
            <button
              onClick={() => setActiveTab('eu-ai-act')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'eu-ai-act'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Gavel className="h-4 w-4" />
                EU AI Act Framework
              </div>
            </button>
            <button
              onClick={() => setActiveTab('iso-42001')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'iso-42001'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                ISO 42001 Framework
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'applied' && renderAppliedGovernanceTab()}
          {activeTab === 'eu-ai-act' && renderEuAiActTab()}
          {activeTab === 'iso-42001' && renderIso42001Tab()}
        </div>
      </div>
    </div>
  );
}