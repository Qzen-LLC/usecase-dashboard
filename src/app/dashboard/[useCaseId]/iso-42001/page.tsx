'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Clock, Upload, Save, ChevronRight, ChevronDown, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface SubclauseInstance {
  id: string;
  implementation: string;
  evidenceFiles: string[];
  status: string;
  subclause: {
    subclauseId: string;
    title: string;
    summary: string;
    questions: string[];
    evidenceExamples: string[];
  };
}

interface AnnexInstance {
  id: string;
  implementation: string;
  evidenceFiles: string[];
  status: string;
  item: {
    itemId: string;
    title: string;
    description: string;
    guidance: string;
    category: {
      title: string;
    };
  };
}

interface Clause {
  id: string;
  clauseId: string;
  title: string;
  description: string;
  orderIndex: number;
  subclauses: {
    id: string;
    subclauseId: string;
    title: string;
    summary: string;
    questions: string[];
    evidenceExamples: string[];
    orderIndex: number;
  }[];
}

interface AnnexCategory {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  orderIndex: number;
  items: {
    id: string;
    itemId: string;
    title: string;
    description: string;
    guidance: string;
    orderIndex: number;
  }[];
}

interface Assessment {
  id: string;
  useCaseId: string;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  subclauses: SubclauseInstance[];
  annexes: AnnexInstance[];
}

export default function Iso42001AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const useCaseId = params.useCaseId as string;

  const [clauses, setClauses] = useState<Clause[]>([]);
  const [annexCategories, setAnnexCategories] = useState<AnnexCategory[]>([]);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'clauses' | 'annex'>('clauses');
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAssessmentData();
  }, [useCaseId]);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      const [clausesResponse, annexResponse, assessmentResponse] = await Promise.all([
        fetch('/api/iso-42001/clauses'),
        fetch('/api/iso-42001/annex'),
        fetch(`/api/iso-42001/assessment/by-usecase/${useCaseId}`)
      ]);

      if (!clausesResponse.ok || !annexResponse.ok || !assessmentResponse.ok) {
        throw new Error('Failed to fetch assessment data');
      }

      const clausesData = await clausesResponse.json();
      const annexData = await annexResponse.json();
      const assessmentData = await assessmentResponse.json();

      // Check if framework tables are available
      if (clausesData.length === 0) {
        setError('ISO 42001 framework tables need to be set up. Please run the database setup scripts to enable full functionality.');
        return;
      }
      
      // If assessment is not available, it means the use case doesn't exist
      if (assessmentData.status === 'not_available') {
        setError('Use case not found. Please ensure you are accessing a valid use case from the dashboard.');
        return;
      }

      setClauses(clausesData);
      setAnnexCategories(annexData);
      setAssessment(assessmentData);

      // Expand first clause by default
      if (clausesData.length > 0) {
        setExpandedClauses(new Set([clausesData[0].clauseId]));
      }

      // Expand first annex category by default
      if (annexData.length > 0) {
        setExpandedCategories(new Set([annexData[0].categoryId]));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubclauseImplementationChange = (subclauseId: string, implementation: string) => {
    if (!assessment) return;

    const updatedSubclauses = assessment.subclauses.map(sc => 
      sc.subclause.subclauseId === subclauseId 
        ? { ...sc, implementation, status: implementation.trim() ? 'implemented' : 'pending' }
        : sc
    );

    setAssessment({ ...assessment, subclauses: updatedSubclauses });
  };

  const handleAnnexImplementationChange = (itemId: string, implementation: string) => {
    if (!assessment) return;

    const updatedAnnexes = assessment.annexes.map(ann => 
      ann.item.itemId === itemId 
        ? { ...ann, implementation, status: implementation.trim() ? 'implemented' : 'pending' }
        : ann
    );

    setAssessment({ ...assessment, annexes: updatedAnnexes });
  };

  const handleSaveSubclause = async (subclauseId: string) => {
    const subclauseInstance = assessment?.subclauses.find(sc => sc.subclause.subclauseId === subclauseId);
    if (!subclauseInstance || !assessment) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/iso-42001/subclause/${assessment.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subclauseId,
          implementation: subclauseInstance.implementation,
          evidenceFiles: subclauseInstance.evidenceFiles
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save implementation');
      }

      await updateAssessmentProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save implementation');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAnnex = async (itemId: string) => {
    const annexInstance = assessment?.annexes.find(ann => ann.item.itemId === itemId);
    if (!annexInstance || !assessment) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/iso-42001/annex/${assessment.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          implementation: annexInstance.implementation,
          evidenceFiles: annexInstance.evidenceFiles
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save implementation');
      }

      await updateAssessmentProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save implementation');
    } finally {
      setSaving(false);
    }
  };

  const updateAssessmentProgress = async () => {
    if (!assessment) return;

    const totalItems = assessment.subclauses.length + assessment.annexes.length;
    const implementedItems = assessment.subclauses.filter(sc => sc.implementation?.trim()).length + 
                            assessment.annexes.filter(ann => ann.implementation?.trim()).length;

    const progress = totalItems > 0 ? (implementedItems / totalItems) * 100 : 0;

    try {
      await fetch(`/api/iso-42001/assessment/${assessment.id}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress })
      });

      setAssessment({ ...assessment, progress });
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const toggleClause = (clauseId: string) => {
    const newExpanded = new Set(expandedClauses);
    if (newExpanded.has(clauseId)) {
      newExpanded.delete(clauseId);
    } else {
      newExpanded.add(clauseId);
    }
    setExpandedClauses(newExpanded);
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getStatusIcon = (status: string, hasImplementation: boolean) => {
    if (hasImplementation) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const findSubclauseInstance = (subclauseId: string) => {
    return assessment?.subclauses.find(sc => sc.subclause.subclauseId === subclauseId);
  };

  const findAnnexInstance = (itemId: string) => {
    return assessment?.annexes.find(ann => ann.item.itemId === itemId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ISO 42001 Assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchAssessmentData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard/governance">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Governance
                </Button>
              </Link>
            </div>
          
          {assessment && (
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Assessment Progress</h2>
                  <p className="text-sm text-gray-600">Implement AI Management System requirements</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={assessment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                >
                  {assessment.status === 'completed' ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{Math.round(assessment.progress)}% Complete</span>
                </div>
                <Progress value={assessment.progress} className="h-2" />
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('clauses')}
                  className={`${
                    activeTab === 'clauses'
                      ? 'bg-purple-100 text-purple-700 border-purple-300'
                      : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                  } px-4 py-2 rounded-lg border font-medium text-sm transition-colors flex items-center gap-2`}
                >
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {clauses.length}
                  </div>
                  Main Clauses
                  <span className="text-xs opacity-75">({clauses.reduce((total, clause) => total + clause.subclauses.length, 0)} requirements)</span>
                </button>
                <button
                  onClick={() => setActiveTab('annex')}
                  className={`${
                    activeTab === 'annex'
                      ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                      : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                  } px-4 py-2 rounded-lg border font-medium text-sm transition-colors flex items-center gap-2`}
                >
                  <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {annexCategories.length}
                  </div>
                  Annex A Controls
                  <span className="text-xs opacity-75">({annexCategories.reduce((total, category) => total + category.items.length, 0)} controls)</span>
                </button>
              </nav>
            </div>
            
            {/* Tab Content Header */}
            <div className="px-6 py-4 bg-gray-50">
              {activeTab === 'clauses' ? (
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">ISO 42001 Main Clauses</h3>
                    <p className="text-sm text-gray-600">Implement the core requirements of the AI Management System standard</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Annex A Control Objectives</h3>
                    <p className="text-sm text-gray-600">Additional controls to support the AI Management System implementation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assessment Content */}
        <div className="space-y-6">
          {activeTab === 'clauses' && clauses.map((clause) => {
            const completedSubclauses = clause.subclauses.filter(sc => {
              const instance = findSubclauseInstance(sc.subclauseId);
              return instance?.implementation?.trim();
            }).length;
            
            return (
              <Card key={clause.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardHeader 
                  className="cursor-pointer bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-200"
                  onClick={() => toggleClause(clause.clauseId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl w-12 h-12 flex items-center justify-center text-sm font-bold shadow-lg">
                        {clause.clauseId}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <CardTitle className="text-lg text-gray-900">{clause.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                              {clause.subclauses.length} requirements
                            </span>
                            {completedSubclauses > 0 && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                {completedSubclauses} completed
                              </span>
                            )}
                          </div>
                        </div>
                        <CardDescription className="text-sm text-gray-600">{clause.description}</CardDescription>
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-32 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-purple-600 h-1.5 rounded-full transition-all duration-300" 
                                style={{ width: `${(completedSubclauses / clause.subclauses.length) * 100}%` }}
                              ></div>
                            </div>
                            <span>{Math.round((completedSubclauses / clause.subclauses.length) * 100)}% complete</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedClauses.has(clause.clauseId) ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandedClauses.has(clause.clauseId) && (
                  <CardContent className="p-0">
                    {clause.subclauses.map((subclause, index) => {
                      const instance = findSubclauseInstance(subclause.subclauseId);
                      const isCompleted = !!instance?.implementation?.trim();
                      
                      return (
                        <div key={subclause.id} className="border-t border-gray-100 last:border-b">
                          <div className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="space-y-4">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                    isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    {subclause.subclauseId}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    {getStatusIcon(instance?.status || 'pending', isCompleted)}
                                    <h4 className="font-semibold text-gray-900 text-base">{subclause.title}</h4>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {isCompleted ? 'Completed' : 'Pending'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{subclause.summary}</p>
                                
                                  {subclause.questions.length > 0 && (
                                    <div className="mb-4">
                                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">?</span>
                                          </div>
                                          Key Questions to Consider:
                                        </h5>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                          {subclause.questions.map((question, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                              <span className="text-blue-600 mt-1">•</span>
                                              <span>{question}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}

                                  {subclause.evidenceExamples.length > 0 && (
                                    <div className="mb-4">
                                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <h5 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                                          <FileText className="w-4 h-4 text-amber-600" />
                                          Evidence Examples:
                                        </h5>
                                        <ul className="text-sm text-amber-800 space-y-1">
                                          {subclause.evidenceExamples.map((example, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                              <span className="text-amber-600 mt-1">•</span>
                                              <span>{example}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}

                                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                                    <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        📝 Implementation Details
                                      </label>
                                      <textarea
                                        value={instance?.implementation || ''}
                                        onChange={(e) => handleSubclauseImplementationChange(subclause.subclauseId, e.target.value)}
                                        placeholder="Describe how this requirement is implemented in your organization...

• What processes are in place?
• Who is responsible?
• What documentation exists?
• How is compliance monitored?"
                                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                        rows={5}
                                      />
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                      <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <Upload className="w-4 h-4" />
                                          <span>Evidence files: {instance?.evidenceFiles?.length || 0}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {instance?.implementation?.length || 0} characters
                                        </div>
                                      </div>
                                      <Button
                                        onClick={() => handleSaveSubclause(subclause.subclauseId)}
                                        disabled={saving}
                                        size="sm"
                                        className={`flex items-center gap-2 transition-colors ${
                                          isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'
                                        }`}
                                      >
                                        <Save className="w-4 h-4" />
                                        {saving ? 'Saving...' : 'Save'}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            );
          })}

          {activeTab === 'annex' && annexCategories.map((category) => {
            const completedItems = category.items.filter(item => {
              const instance = findAnnexInstance(item.itemId);
              return instance?.implementation?.trim();
            }).length;
            
            return (
              <Card key={category.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardHeader 
                  className="cursor-pointer bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200"
                  onClick={() => toggleCategory(category.categoryId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-xl w-12 h-12 flex items-center justify-center text-sm font-bold shadow-lg">
                        {category.categoryId.replace('A.', '')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <CardTitle className="text-lg text-gray-900">{category.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                              {category.items.length} controls
                            </span>
                            {completedItems > 0 && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                {completedItems} completed
                              </span>
                            )}
                          </div>
                        </div>
                        <CardDescription className="text-sm text-gray-600">{category.description}</CardDescription>
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-32 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" 
                                style={{ width: `${(completedItems / category.items.length) * 100}%` }}
                              ></div>
                            </div>
                            <span>{Math.round((completedItems / category.items.length) * 100)}% complete</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedCategories.has(category.categoryId) ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandedCategories.has(category.categoryId) && (
                  <CardContent className="p-0">
                    {category.items.map((item, index) => {
                      const instance = findAnnexInstance(item.itemId);
                      const isCompleted = !!instance?.implementation?.trim();
                      
                      return (
                        <div key={item.id} className="border-t border-gray-100 last:border-b">
                          <div className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="space-y-4">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${
                                    isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    {item.itemId.split('.').pop()}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    {getStatusIcon(instance?.status || 'pending', isCompleted)}
                                    <h4 className="font-semibold text-gray-900 text-base">{item.title}</h4>
                                    <Badge variant="outline" className="text-xs bg-gray-100">
                                      {item.itemId}
                                    </Badge>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {isCompleted ? 'Completed' : 'Pending'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{item.description}</p>
                                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                      <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">💡</span>
                                      </div>
                                      Implementation Guidance:
                                    </h5>
                                    <p className="text-sm text-blue-800 leading-relaxed">{item.guidance}</p>
                                  </div>

                                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                                    <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        📝 Implementation Details
                                      </label>
                                      <textarea
                                        value={instance?.implementation || ''}
                                        onChange={(e) => handleAnnexImplementationChange(item.itemId, e.target.value)}
                                        placeholder="Describe how this control is implemented in your organization...

• What specific measures are in place?
• Who is responsible for this control?
• What processes and procedures exist?
• How is effectiveness monitored?"
                                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        rows={5}
                                      />
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                      <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <Upload className="w-4 h-4" />
                                          <span>Evidence files: {instance?.evidenceFiles?.length || 0}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {instance?.implementation?.length || 0} characters
                                        </div>
                                      </div>
                                      <Button
                                        onClick={() => handleSaveAnnex(item.itemId)}
                                        disabled={saving}
                                        size="sm"
                                        className={`flex items-center gap-2 transition-colors ${
                                          isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
                                        }`}
                                      >
                                        <Save className="w-4 h-4" />
                                        {saving ? 'Saving...' : 'Save'}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}