'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Clock, Upload, Save, ChevronRight, ChevronDown, HelpCircle, Shield, ListChecks } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  questionId: string;
  question: string;
  priority: string;
  answerType: string;
  orderIndex: number;
  answer?: {
    id: string;
    answer: string;
    evidenceFiles: string[];
    status: string;
  };
}

interface Subtopic {
  id: string;
  subtopicId: string;
  title: string;
  description: string;
  orderIndex: number;
  questions: Question[];
}

interface Topic {
  id: string;
  topicId: string;
  title: string;
  description: string;
  orderIndex: number;
  subtopics: Subtopic[];
}

interface Control {
  id: string;
  status: string;
  notes: string;
  evidenceFiles: string[];
  controlStruct: {
    controlId: string;
    title: string;
    description: string;
    category: {
      title: string;
    };
  };
  subcontrols: Subcontrol[];
}

interface Subcontrol {
  id: string;
  status: string;
  notes: string;
  evidenceFiles: string[];
  subcontrolStruct: {
    subcontrolId: string;
    title: string;
    description: string;
  };
}

interface ControlCategory {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  orderIndex: number;
  controls: {
    id: string;
    controlId: string;
    title: string;
    description: string;
    orderIndex: number;
    subcontrols: {
      id: string;
      subcontrolId: string;
      title: string;
      description: string;
      orderIndex: number;
    }[];
  }[];
}

interface Assessment {
  id: string;
  useCaseId: string;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  controls?: Control[];
}

export default function EuAiActAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const useCaseId = params.useCaseId as string;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [controlCategories, setControlCategories] = useState<ControlCategory[]>([]);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'assessment' | 'controls'>('assessment');
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAssessmentData();
  }, [useCaseId]);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      const [topicsResponse, controlCategoriesResponse, assessmentResponse] = await Promise.all([
        fetch('/api/eu-ai-act/topics'),
        fetch('/api/eu-ai-act/control-categories'),
        fetch(`/api/eu-ai-act/assessment/by-usecase/${useCaseId}`)
      ]);

      if (!topicsResponse.ok || !controlCategoriesResponse.ok || !assessmentResponse.ok) {
        throw new Error('Failed to fetch assessment data');
      }

      const topicsData = await topicsResponse.json();
      const controlCategoriesData = await controlCategoriesResponse.json();
      const assessmentData = await assessmentResponse.json();

      // Check if framework tables are available
      if (topicsData.length === 0) {
        setError('EU AI ACT framework tables need to be set up. Please run the database setup scripts to enable full functionality.');
        setLoading(false);
        return;
      }
      
      // If assessment is not available, it means the use case doesn't exist
      if (assessmentData.status === 'not_available') {
        setError('Use case not found. Please ensure you are accessing a valid use case from the dashboard.');
        setLoading(false);
        return;
      }

      setTopics(topicsData);
      setControlCategories(controlCategoriesData);
      setAssessment(assessmentData);

      // Expand first topic by default
      if (topicsData.length > 0) {
        setExpandedTopics(new Set([topicsData[0].topicId]));
        if (topicsData[0].subtopics.length > 0) {
          setExpandedSubtopics(new Set([topicsData[0].subtopics[0].subtopicId]));
        }
      }

      // Expand first control category by default
      if (controlCategoriesData.length > 0) {
        setExpandedCategories(new Set([controlCategoriesData[0].categoryId]));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setTopics(prevTopics => 
      prevTopics.map(topic => ({
        ...topic,
        subtopics: topic.subtopics.map(subtopic => ({
          ...subtopic,
          questions: subtopic.questions.map(question => 
            question.questionId === questionId 
              ? { 
                  ...question, 
                  answer: { 
                    ...question.answer,
                    id: question.answer?.id || '',
                    answer,
                    evidenceFiles: question.answer?.evidenceFiles || [],
                    status: answer.trim() ? 'completed' : 'pending'
                  }
                }
              : question
          )
        }))
      }))
    );
  };

  const handleSaveAnswer = async (questionId: string) => {
    const question = findQuestionById(questionId);
    if (!question || !assessment) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/eu-ai-act/answer/${assessment.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          answer: question.answer?.answer || '',
          evidenceFiles: question.answer?.evidenceFiles || []
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save answer');
      }

      const savedAnswer = await response.json();
      setTopics(prevTopics => 
        prevTopics.map(topic => ({
          ...topic,
          subtopics: topic.subtopics.map(subtopic => ({
            ...subtopic,
            questions: subtopic.questions.map(q => 
              q.questionId === questionId 
                ? { ...q, answer: savedAnswer }
                : q
            )
          }))
        }))
      );

      await updateAssessmentProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save answer');
    } finally {
      setSaving(false);
    }
  };

  const updateAssessmentProgress = async () => {
    const totalQuestions = topics.reduce((total, topic) => 
      total + topic.subtopics.reduce((subTotal, subtopic) => 
        subTotal + subtopic.questions.length, 0), 0);
    
    const answeredQuestions = topics.reduce((total, topic) => 
      total + topic.subtopics.reduce((subTotal, subtopic) => 
        subTotal + subtopic.questions.filter(q => q.answer?.answer?.trim()).length, 0), 0);

    const totalControls = controlCategories.reduce((total, category) => 
      total + category.controls.reduce((controlTotal, control) => 
        controlTotal + 1 + control.subcontrols.length, 0), 0);
    
    const implementedControls = assessment?.controls?.reduce((total, control) => {
      let count = 0;
      if (control.status === 'implemented' || control.status === 'reviewed') count++;
      count += control.subcontrols?.filter(sc => sc.status === 'implemented' || sc.status === 'reviewed').length || 0;
      return total + count;
    }, 0) || 0;

    const totalItems = totalQuestions + totalControls;
    const completedItems = answeredQuestions + implementedControls;
    
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    try {
      await fetch(`/api/eu-ai-act/assessment/${assessment?.id}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress })
      });

      if (assessment) {
        setAssessment({ ...assessment, progress });
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const findQuestionById = (questionId: string): Question | null => {
    for (const topic of topics) {
      for (const subtopic of topic.subtopics) {
        const question = subtopic.questions.find(q => q.questionId === questionId);
        if (question) return question;
      }
    }
    return null;
  };

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const toggleSubtopic = (subtopicId: string) => {
    const newExpanded = new Set(expandedSubtopics);
    if (newExpanded.has(subtopicId)) {
      newExpanded.delete(subtopicId);
    } else {
      newExpanded.add(subtopicId);
    }
    setExpandedSubtopics(newExpanded);
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

  const handleControlStatusChange = (controlId: string, status: string, notes: string) => {
    if (!assessment) return;

    const updatedControls = assessment.controls ? assessment.controls.map(control => 
      control.controlStruct.controlId === controlId 
        ? { ...control, status, notes }
        : control
    ) : [];

    setAssessment({ ...assessment, controls: updatedControls });
  };

  const handleSubcontrolStatusChange = (controlId: string, subcontrolId: string, status: string, notes: string) => {
    if (!assessment) return;

    const updatedControls = assessment.controls ? assessment.controls.map(control => 
      control.controlStruct.controlId === controlId 
        ? { 
            ...control, 
            subcontrols: control.subcontrols.map(subcontrol => 
              subcontrol.subcontrolStruct.subcontrolId === subcontrolId
                ? { ...subcontrol, status, notes }
                : subcontrol
            )
          }
        : control
    ) : [];

    setAssessment({ ...assessment, controls: updatedControls });
  };

  const handleSaveControl = async (controlId: string) => {
    const control = assessment?.controls?.find(c => c.controlStruct.controlId === controlId);
    if (!control || !assessment) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/eu-ai-act/control/${assessment.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          controlId,
          status: control.status,
          notes: control.notes,
          evidenceFiles: control.evidenceFiles
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save control');
      }

      await updateAssessmentProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save control');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSubcontrol = async (controlId: string, subcontrolId: string) => {
    const control = assessment?.controls?.find(c => c.controlStruct.controlId === controlId);
    const subcontrol = control?.subcontrols?.find(sc => sc.subcontrolStruct.subcontrolId === subcontrolId);
    if (!subcontrol || !assessment) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/eu-ai-act/subcontrol/${assessment.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          controlId,
          subcontrolId,
          status: subcontrol.status,
          notes: subcontrol.notes,
          evidenceFiles: subcontrol.evidenceFiles
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save subcontrol');
      }

      await updateAssessmentProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save subcontrol');
    } finally {
      setSaving(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'implemented': return 'bg-green-100 text-green-800 border-green-300';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (question: Question) => {
    if (question.answer?.answer?.trim()) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (question.priority.toLowerCase() === 'high') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const getControlStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'implemented': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'reviewed': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading EU AI ACT Assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-full flex items-center justify-center">
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
                    <p className="text-sm text-gray-600">Complete all required questions and controls to ensure compliance</p>
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

          {/* Enhanced Tabs */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('assessment')}
                    className={`${
                      activeTab === 'assessment'
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                    } px-4 py-2 rounded-lg border font-medium text-sm transition-colors flex items-center gap-2`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    Assessment Questions
                    <span className="text-xs bg-white px-2 py-1 rounded-full">
                      {topics.reduce((total, topic) => total + topic.subtopics.reduce((subTotal, subtopic) => subTotal + subtopic.questions.length, 0), 0)}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('controls')}
                    className={`${
                      activeTab === 'controls'
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                    } px-4 py-2 rounded-lg border font-medium text-sm transition-colors flex items-center gap-2`}
                  >
                    <Shield className="w-4 h-4" />
                    Compliance Controls
                    <span className="text-xs bg-white px-2 py-1 rounded-full">
                      {controlCategories.reduce((total, category) => total + category.controls.length, 0)}
                    </span>
                  </button>
                </nav>
              </div>
              
              {/* Tab Content Header */}
              <div className="px-6 py-4 bg-gray-50">
                {activeTab === 'assessment' ? (
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <HelpCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Assessment Questions</h3>
                      <p className="text-sm text-gray-600">Answer all questions to demonstrate compliance with EU AI ACT requirements</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Compliance Controls</h3>
                      <p className="text-sm text-gray-600">Implement and document required controls for AI system governance</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assessment Content */}
          <div className="space-y-6">
            {activeTab === 'assessment' && topics.map((topic) => (
              <Card key={topic.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardHeader 
                  className="cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                  onClick={() => toggleTopic(topic.topicId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl w-12 h-12 flex items-center justify-center text-sm font-bold shadow-lg">
                        {topic.orderIndex}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">{topic.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-600">{topic.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedTopics.has(topic.topicId) ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandedTopics.has(topic.topicId) && (
                  <CardContent className="p-0">
                    {topic.subtopics.map((subtopic) => (
                      <div key={subtopic.id} className="border-t border-gray-100">
                        <div 
                          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleSubtopic(subtopic.subtopicId)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-gray-100 rounded-lg p-2">
                                <ListChecks className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{subtopic.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{subtopic.description}</p>
                              </div>
                            </div>
                            {expandedSubtopics.has(subtopic.subtopicId) ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        </div>

                        {expandedSubtopics.has(subtopic.subtopicId) && (
                          <div className="px-6 pb-6 space-y-6">
                            {subtopic.questions.map((question) => (
                              <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <div className="space-y-4">
                                  <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                      {getStatusIcon(question)}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-3">
                                        <Badge 
                                          variant="outline" 
                                          className={`${getPriorityColor(question.priority)} text-xs font-medium`}
                                        >
                                          {question.priority} Priority
                                        </Badge>
                                        <span className="text-xs text-gray-500 font-mono">
                                          ID: {question.questionId}
                                        </span>
                                      </div>
                                      <p className="text-gray-900 font-medium text-base leading-relaxed mb-4">
                                        {question.question}
                                      </p>
                                      
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Your Answer
                                        </label>
                                        <textarea
                                          value={question.answer?.answer || ''}
                                          onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                                          placeholder="Provide your detailed answer here..."
                                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                          rows={4}
                                        />
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                                          <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                              <Upload className="w-4 h-4" />
                                              <span>Evidence files: {question.answer?.evidenceFiles?.length || 0}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {question.answer?.answer?.length || 0} characters
                                            </div>
                                          </div>
                                          <Button
                                            onClick={() => handleSaveAnswer(question.questionId)}
                                            disabled={saving}
                                            size="sm"
                                            className="flex items-center gap-2"
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
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            ))}

            {activeTab === 'controls' && controlCategories.map((category) => (
              <Card key={category.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardHeader 
                  className="cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
                  onClick={() => toggleCategory(category.categoryId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-xl w-12 h-12 flex items-center justify-center text-sm font-bold shadow-lg">
                        {category.categoryId}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">{category.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-600">{category.description}</CardDescription>
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
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <p className="text-gray-500">Controls functionality will be available once the database tables are set up.</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}