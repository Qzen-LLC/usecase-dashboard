'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Clock, Upload, Save, ChevronRight, ChevronDown, HelpCircle, Shield, ListChecks, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { FileUpload } from '@/components/ui/file-upload';

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
  answers?: {
    id: string;
    questionId: string;
    answer: string;
    evidenceFiles: string[];
    status: string;
  }[];
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
  const [savingFiles, setSavingFiles] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'assessment' | 'controls'>('assessment');
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAssessmentData();
  }, [useCaseId]);

  // Monitor assessment state changes for debugging
  useEffect(() => {
    if (assessment) {
      console.log('📊 ASSESSMENT STATE CHANGED:', {
        totalControls: assessment.controls?.length || 0,
        controlsWithFiles: assessment.controls?.filter(c => c.evidenceFiles?.length > 0).length || 0,
        controlIds: assessment.controls?.map(c => c.controlStruct?.controlId) || [],
        detailedControls: assessment.controls?.map(c => ({
          id: c.id,
          controlId: c.controlStruct?.controlId,
          evidenceFilesCount: c.evidenceFiles?.length || 0,
          evidenceFiles: c.evidenceFiles || []
        })) || []
      });
    }
  }, [assessment]);

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
      if (topicsData.length === 0 && controlCategoriesData.length === 0) {
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

      // Merge saved answers from assessment into topics structure
      const topicsWithAnswers = topicsData.map((topic: Topic) => ({
        ...topic,
        subtopics: topic.subtopics.map((subtopic: Subtopic) => ({
          ...subtopic,
          questions: subtopic.questions.map((question: Question) => {
            // Find corresponding saved answer in assessment
            const savedAnswer = assessmentData.answers?.find(
              (answer: any) => answer.questionId === question.questionId
            );
            
            return {
              ...question,
              answer: savedAnswer ? {
                id: savedAnswer.id,
                answer: savedAnswer.answer || '',
                evidenceFiles: savedAnswer.evidenceFiles || [],
                status: savedAnswer.status || 'pending'
              } : undefined
            };
          })
        }))
      }));

      setTopics(topicsWithAnswers);
      setControlCategories(controlCategoriesData);
      
      console.log('🚀 INITIAL DATA LOAD - Assessment controls:', {
        totalControls: assessmentData.controls?.length || 0,
        controlsWithFiles: assessmentData.controls?.filter(c => c.evidenceFiles?.length > 0).length || 0,
        sampleControl: assessmentData.controls?.[0] ? {
          id: assessmentData.controls[0].id,
          controlId: assessmentData.controls[0].controlStruct?.controlId,
          evidenceFiles: assessmentData.controls[0].evidenceFiles
        } : null
      });
      
      setAssessment(assessmentData);

      // Expand first topic by default
      if (topicsWithAnswers.length > 0) {
        setExpandedTopics(new Set([topicsWithAnswers[0].topicId]));
        if (topicsWithAnswers[0].subtopics.length > 0) {
          setExpandedSubtopics(new Set([topicsWithAnswers[0].subtopics[0].subtopicId]));
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

  const handleEvidenceChange = async (questionId: string, evidenceFiles: string[]) => {
    // Find the current question to detect removed files
    const currentQuestion = findQuestionById(questionId);
    const currentFiles = currentQuestion?.answer?.evidenceFiles || [];
    const removedFiles = currentFiles.filter(file => !evidenceFiles.includes(file));
    
    // Update local state immediately
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
                    answer: question.answer?.answer || '',
                    evidenceFiles,
                    status: (question.answer?.answer?.trim() || evidenceFiles.length > 0) ? 'completed' : 'pending'
                  }
                }
              : question
          )
        }))
      }))
    );

    // Auto-save the evidence files
    if (assessment) {
      // Add to saving set
      setSavingFiles(prev => new Set(prev).add(`question-${questionId}`));
      
      try {
        const question = findQuestionById(questionId);
        const response = await fetch(`/api/eu-ai-act/answer/${assessment.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId,
            answer: question?.answer?.answer || '',
            evidenceFiles
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save evidence files');
        }

        await updateAssessmentProgress();
        
        // Delete removed files from server
        for (const removedFile of removedFiles) {
          try {
            await fetch('/api/upload/delete', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileUrl: removedFile })
            });
          } catch (fileDeleteErr) {
            console.error('Failed to delete file from server:', removedFile, fileDeleteErr);
            // Don't fail the whole operation if file deletion fails
          }
        }
        
        // Clear any existing errors on successful save
        if (error) {
          setError(null);
        }
      } catch (err) {
        console.error('Failed to auto-save evidence files:', err);
        setError('Failed to save evidence files. Please try saving manually.');
      } finally {
        // Remove from saving set
        setSavingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(`question-${questionId}`);
          return newSet;
        });
      }
    }
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

      setAssessment(currentAssessment => {
        if (!currentAssessment) return currentAssessment;
        return { ...currentAssessment, progress };
      });
      
      // Force refresh governance dashboard if it's open
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('governance-refresh'));
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

    // Find existing control or create a new one in state
    const existingControl = assessment.controls?.find(c => c.controlStruct.controlId === controlId);
    
    if (existingControl) {
      // Update existing control
      const updatedControls = assessment.controls?.map(control => 
        control.controlStruct.controlId === controlId 
          ? { ...control, status, notes }
          : control
      ) || [];
      setAssessment({ ...assessment, controls: updatedControls });
    } else {
      // Create new control in state (will be saved to DB when user clicks save)
      const newControl = {
        id: `temp-${controlId}`,
        status,
        notes,
        evidenceFiles: [],
        controlStruct: {
          controlId,
          title: '',
          description: '',
          category: {
            title: ''
          }
        },
        subcontrols: []
      };
      setAssessment({ 
        ...assessment, 
        controls: [...(assessment.controls || []), newControl] 
      });
    }
  };

  const handleSubcontrolStatusChange = (controlId: string, subcontrolId: string, status: string, notes: string) => {
    if (!assessment) return;

    // Find existing control
    const existingControl = assessment.controls?.find(c => c.controlStruct.controlId === controlId);
    
    if (existingControl) {
      // Find existing subcontrol or create a new one
      const existingSubcontrol = existingControl.subcontrols?.find(sc => sc.subcontrolStruct.subcontrolId === subcontrolId);
      
      if (existingSubcontrol) {
        // Update existing subcontrol
        const updatedControls = assessment.controls?.map(control => 
          control.controlStruct.controlId === controlId 
            ? { 
                ...control, 
                subcontrols: control.subcontrols?.map(subcontrol => 
                  subcontrol.subcontrolStruct.subcontrolId === subcontrolId
                    ? { ...subcontrol, status, notes }
                    : subcontrol
                ) || []
              }
            : control
        ) || [];
        setAssessment({ ...assessment, controls: updatedControls });
      } else {
        // Create new subcontrol in state
        const newSubcontrol = {
          id: `temp-${subcontrolId}`,
          status,
          notes,
          evidenceFiles: [],
          subcontrolStruct: {
            subcontrolId,
            title: '',
            description: ''
          }
        };
        const updatedControls = assessment.controls?.map(control => 
          control.controlStruct.controlId === controlId 
            ? { 
                ...control, 
                subcontrols: [...(control.subcontrols || []), newSubcontrol] 
              }
            : control
        ) || [];
        setAssessment({ ...assessment, controls: updatedControls });
      }
    }
  };

  const handleControlEvidenceChange = async (controlId: string, evidenceFiles: string[]) => {
    console.log('🔄 handleControlEvidenceChange START:', { controlId, evidenceFiles });
    if (!assessment) return;

    const existingControl = assessment.controls?.find(c => c.controlStruct.controlId === controlId);
    const currentFiles = existingControl?.evidenceFiles || [];
    const removedFiles = currentFiles.filter(file => !evidenceFiles.includes(file));
    
    console.log('📊 Control state before update:', {
      existingControl: existingControl ? {
        id: existingControl.id,
        controlId: existingControl.controlStruct?.controlId,
        evidenceFiles: existingControl.evidenceFiles
      } : null,
      currentFiles,
      newFiles: evidenceFiles,
      removedFiles
    });
    
    // Update local state immediately for better UX with forced re-render
    setAssessment(prevAssessment => {
      if (!prevAssessment) return prevAssessment;
      
      const existingControlIndex = prevAssessment.controls?.findIndex(c => c.controlStruct?.controlId === controlId) ?? -1;
      
      if (existingControlIndex >= 0) {
        // Update existing control
        const updatedControls = [...(prevAssessment.controls || [])];
        updatedControls[existingControlIndex] = {
          ...updatedControls[existingControlIndex],
          evidenceFiles: [...evidenceFiles] // Ensure new array reference
        };
        
        console.log('🔧 State Update - existing control:', {
          controlId,
          controlIndex: existingControlIndex,
          newFiles: evidenceFiles,
          updatedControl: updatedControls[existingControlIndex]
        });
        
        return {
          ...prevAssessment,
          controls: updatedControls,
          // Add timestamp to force re-render
          lastUpdated: Date.now()
        };
      } else {
        // Create new control
        const newControl = {
          id: `temp-${controlId}`,
          status: 'pending',
          notes: '',
          evidenceFiles: [...evidenceFiles], // Ensure new array reference
          controlStruct: {
            controlId,
            title: '',
            description: '',
            category: { title: '' }
          },
          subcontrols: []
        };
        
        console.log('🔧 State Update - new control:', {
          controlId,
          newControl,
          evidenceFiles
        });
        
        return {
          ...prevAssessment,
          controls: [...(prevAssessment.controls || []), newControl],
          // Add timestamp to force re-render
          lastUpdated: Date.now()
        };
      }
    });

    // Auto-save the evidence files
    setSavingFiles(prev => new Set(prev).add(`control-${controlId}`));
    
    try {
      const response = await fetch(`/api/eu-ai-act/control/${assessment.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          controlId,
          status: existingControl?.status || 'pending',
          notes: existingControl?.notes || '',
          evidenceFiles
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save control evidence files');
      }

      const savedControl = await response.json();
      console.log('💾 API Response - savedControl:', {
        id: savedControl.id,
        controlId: savedControl.controlStruct?.controlId,
        evidenceFiles: savedControl.evidenceFiles,
        subcontrols: savedControl.subcontrols?.length || 0
      });
      
      // Update the local state with the saved control using functional update to avoid stale closure
      setAssessment(currentAssessment => {
        if (!currentAssessment) return currentAssessment;
        
        const controlExists = currentAssessment.controls?.some(c => c.controlStruct?.controlId === controlId);
        let updatedControls: typeof currentAssessment.controls;
        
        if (controlExists) {
          // Update existing control - merge with existing data to preserve any fields not in API response
          updatedControls = currentAssessment.controls?.map(control => 
            control.controlStruct?.controlId === controlId 
              ? {
                  ...control, // Preserve existing control data
                  ...savedControl, // Overlay API response
                  controlStruct: control.controlStruct // Preserve the original controlStruct
                }
              : control
          ) || [];
        } else {
          // Add new control
          updatedControls = [...(currentAssessment.controls || []), savedControl];
        }
        
        console.log('✅ API State update - merging with current state:', {
          controlId,
          savedControlFiles: savedControl.evidenceFiles,
          currentControlsCount: currentAssessment.controls?.length || 0,
          updatedControlsCount: updatedControls.length,
          finalControlFiles: updatedControls.find(c => c.controlStruct?.controlId === controlId)?.evidenceFiles
        });
        
        return {
          ...currentAssessment,
          controls: updatedControls,
          lastUpdated: Date.now()
        };
      });
      
      await updateAssessmentProgress();
      
      // Delete removed files from server
      for (const removedFile of removedFiles) {
        try {
          await fetch('/api/upload/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileUrl: removedFile })
          });
        } catch (fileDeleteErr) {
          console.error('Failed to delete file from server:', removedFile, fileDeleteErr);
          // Don't fail the whole operation if file deletion fails
        }
      }
      
      
      // Clear any existing errors on successful save
      if (error) {
        setError(null);
      }
    } catch (err) {
      console.error('Failed to auto-save control evidence:', err);
      setError('Failed to save evidence files. Please try saving manually.');
      
      // Revert local state on API failure
      setAssessment(prevAssessment => {
        if (!prevAssessment) return prevAssessment;
        
        if (existingControl) {
          const revertedControls = prevAssessment.controls?.map(control => 
            control.controlStruct.controlId === controlId 
              ? { ...control, evidenceFiles: [...currentFiles] }
              : control
          ) || [];
          return { ...prevAssessment, controls: revertedControls, lastUpdated: Date.now() };
        } else {
          // Remove the temporary control we added
          const revertedControls = prevAssessment.controls?.filter(c => 
            !(c.id === `temp-${controlId}` && c.controlStruct.controlId === controlId)
          ) || [];
          return { ...prevAssessment, controls: revertedControls, lastUpdated: Date.now() };
        }
      });
    } finally {
      setSavingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(`control-${controlId}`);
        return newSet;
      });
    }
  };

  const handleSubcontrolEvidenceChange = async (controlId: string, subcontrolId: string, evidenceFiles: string[]) => {
    if (!assessment) return;

    const existingControl = assessment.controls?.find(c => c.controlStruct.controlId === controlId);
    const existingSubcontrol = existingControl?.subcontrols?.find(sc => sc.subcontrolStruct.subcontrolId === subcontrolId);
    const currentFiles = existingSubcontrol?.evidenceFiles || [];
    const removedFiles = currentFiles.filter(file => !evidenceFiles.includes(file));
    
    if (existingControl) {
      // Update local state immediately with forced re-render
      setAssessment(prevAssessment => {
        if (!prevAssessment) return prevAssessment;
        
        const controlIndex = prevAssessment.controls?.findIndex(c => c.controlStruct?.controlId === controlId) ?? -1;
        if (controlIndex < 0) return prevAssessment;
        
        const updatedControls = [...(prevAssessment.controls || [])];
        const targetControl = updatedControls[controlIndex];
        
        if (existingSubcontrol) {
          // Update existing subcontrol
          const subcontrolIndex = targetControl.subcontrols?.findIndex(sc => sc.subcontrolStruct?.subcontrolId === subcontrolId) ?? -1;
          if (subcontrolIndex >= 0) {
            const updatedSubcontrols = [...(targetControl.subcontrols || [])];
            updatedSubcontrols[subcontrolIndex] = {
              ...updatedSubcontrols[subcontrolIndex],
              evidenceFiles: [...evidenceFiles] // Ensure new array reference
            };
            
            updatedControls[controlIndex] = {
              ...targetControl,
              subcontrols: updatedSubcontrols
            };
            
            console.log('🔧 State Update - existing subcontrol:', {
              controlId,
              subcontrolId,
              subcontrolIndex,
              newFiles: evidenceFiles
            });
          }
        } else {
          // Create new subcontrol with evidence files
          const newSubcontrol = {
            id: `temp-${subcontrolId}`,
            status: 'pending',
            notes: '',
            evidenceFiles: [...evidenceFiles], // Ensure new array reference
            subcontrolStruct: {
              subcontrolId,
              title: '',
              description: ''
            }
          };
          
          updatedControls[controlIndex] = {
            ...targetControl,
            subcontrols: [...(targetControl.subcontrols || []), newSubcontrol]
          };
          
          console.log('🔧 State Update - new subcontrol:', {
            controlId,
            subcontrolId,
            newSubcontrol,
            evidenceFiles
          });
        }
        
        return {
          ...prevAssessment,
          controls: updatedControls,
          // Add timestamp to force re-render
          lastUpdated: Date.now()
        };
      });

      // Auto-save the subcontrol evidence files
      setSavingFiles(prev => new Set(prev).add(`subcontrol-${subcontrolId}`));
      
      try {
        // First ensure the parent control exists and is saved
        if (!existingControl.id.startsWith('temp-')) {
          const response = await fetch(`/api/eu-ai-act/subcontrol/${assessment.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              controlId: existingControl.controlStruct.controlId, // Use structural controlId, not DB ID
              subcontrolId,
              status: existingSubcontrol?.status || 'pending',
              notes: existingSubcontrol?.notes || '',
              evidenceFiles
            })
          });

          if (!response.ok) {
            throw new Error('Failed to save subcontrol evidence files');
          }

          const savedSubcontrol = await response.json();

          // Update the control with the saved subcontrol using functional update
          setAssessment(currentAssessment => {
            if (!currentAssessment) return currentAssessment;
            
            const updatedControls = currentAssessment.controls?.map(control => 
              control.controlStruct?.controlId === existingControl.controlStruct.controlId 
                ? {
                    ...control,
                    subcontrols: [
                      ...(control.subcontrols?.filter(sc => sc.subcontrolStruct?.subcontrolId !== subcontrolId) || []),
                      savedSubcontrol
                    ]
                  }
                : control
            ) || [];
            
            console.log('✅ API Subcontrol update - merging with current state:', {
              controlId,
              subcontrolId,
              savedSubcontrolFiles: savedSubcontrol.evidenceFiles
            });
            
            return {
              ...currentAssessment,
              controls: updatedControls,
              lastUpdated: Date.now()
            };
          });

          await updateAssessmentProgress();
          
          // Delete removed files from server
          for (const removedFile of removedFiles) {
            try {
              await fetch('/api/upload/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileUrl: removedFile })
              });
            } catch (fileDeleteErr) {
              console.error('Failed to delete file from server:', removedFile, fileDeleteErr);
              // Don't fail the whole operation if file deletion fails
            }
          }
          
          // Clear any existing errors on successful save
          if (error) {
            setError(null);
          }
        } else {
          // If parent control is not saved yet, save it first
          const controlResponse = await fetch(`/api/eu-ai-act/control/${assessment.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              controlId: existingControl.controlStruct.controlId,
              status: existingControl.status || 'pending',
              notes: existingControl.notes || '',
              evidenceFiles: existingControl.evidenceFiles || []
            })
          });

          if (!controlResponse.ok) {
            throw new Error('Failed to save parent control');
          }

          const savedControl = await controlResponse.json();
          
          // Now save the subcontrol
          const subcontrolResponse = await fetch(`/api/eu-ai-act/subcontrol/${assessment.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              controlId: existingControl.controlStruct.controlId,
              subcontrolId,
              status: existingSubcontrol?.status || 'pending',
              notes: existingSubcontrol?.notes || '',
              evidenceFiles
            })
          });

          if (!subcontrolResponse.ok) {
            throw new Error('Failed to save subcontrol evidence files');
          }

          const savedSubcontrol = await subcontrolResponse.json();

          // Update the assessment with the saved control that includes the subcontrol using functional update
          setAssessment(currentAssessment => {
            if (!currentAssessment) return currentAssessment;
            
            const controlWithSubcontrol = {
              ...savedControl,
              subcontrols: [
                ...(savedControl.subcontrols || []).filter((sc: any) => sc.subcontrolStruct?.subcontrolId !== subcontrolId),
                savedSubcontrol
              ]
            };
            
            const updatedControls = currentAssessment.controls?.filter(c => c.controlStruct?.controlId !== existingControl.controlStruct.controlId) || [];
            updatedControls.push(controlWithSubcontrol);
            
            console.log('✅ API New Subcontrol update - merging with current state:', {
              controlId,
              subcontrolId,
              savedSubcontrolFiles: savedSubcontrol.evidenceFiles
            });
            
            return {
              ...currentAssessment,
              controls: updatedControls,
              lastUpdated: Date.now()
            };
          });

          await updateAssessmentProgress();
          
          // Delete removed files from server
          for (const removedFile of removedFiles) {
            try {
              await fetch('/api/upload/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileUrl: removedFile })
              });
            } catch (fileDeleteErr) {
              console.error('Failed to delete file from server:', removedFile, fileDeleteErr);
              // Don't fail the whole operation if file deletion fails
            }
          }
          
          // Clear any existing errors on successful save
          if (error) {
            setError(null);
          }
        }
      } catch (err) {
        console.error('Failed to auto-save subcontrol evidence:', err);
        setError('Failed to save evidence files. Please try saving manually.');
        
        // Revert local state on API failure
        setAssessment(prevAssessment => {
          if (!prevAssessment) return prevAssessment;
          
          if (existingSubcontrol) {
            const revertedControls = prevAssessment.controls?.map(control => 
              control.controlStruct.controlId === controlId 
                ? { 
                    ...control, 
                    subcontrols: control.subcontrols?.map(subcontrol => 
                      subcontrol.subcontrolStruct.subcontrolId === subcontrolId
                        ? { ...subcontrol, evidenceFiles: [...currentFiles] }
                        : subcontrol
                    ) || []
                  }
                : control
            ) || [];
            return { ...prevAssessment, controls: revertedControls, lastUpdated: Date.now() };
          } else {
            // Remove the temporary subcontrol we added
            const revertedControls = prevAssessment.controls?.map(control => 
              control.controlStruct.controlId === controlId 
                ? { 
                    ...control, 
                    subcontrols: control.subcontrols?.filter(sc => 
                      !(sc.id === `temp-${subcontrolId}` && sc.subcontrolStruct.subcontrolId === subcontrolId)
                    ) || []
                  }
                : control
            ) || [];
            return { ...prevAssessment, controls: revertedControls, lastUpdated: Date.now() };
          }
        });
      } finally {
        setSavingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(`subcontrol-${subcontrolId}`);
          return newSet;
        });
      }
    }
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

      const savedControl = await response.json();

      // Update the local state with the saved control
      const updatedControls = assessment.controls?.map(control => 
        control.controlStruct?.controlId === controlId 
          ? savedControl
          : control
      ) || [];
      
      // If this is a new control, add it
      if (!assessment.controls?.some(c => c.controlStruct?.controlId === controlId)) {
        updatedControls.push(savedControl);
      }
      
      setAssessment({ ...assessment, controls: updatedControls });

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
    if (!subcontrol || !assessment || !control) return;

    setSaving(true);
    try {
      // First ensure the parent control is saved if it's temporary
      if (control.id.startsWith('temp-')) {
        const controlResponse = await fetch(`/api/eu-ai-act/control/${assessment.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            controlId: control.controlStruct.controlId,
            status: control.status || 'pending',
            notes: control.notes || '',
            evidenceFiles: control.evidenceFiles || []
          })
        });

        if (!controlResponse.ok) {
          throw new Error('Failed to save parent control');
        }

        const savedControl = await controlResponse.json();
        
        // Update the assessment with the saved control
        const updatedControls = assessment.controls?.filter(c => c.controlStruct.controlId !== controlId) || [];
        updatedControls.push(savedControl);
        setAssessment({ ...assessment, controls: updatedControls });
      }

      const response = await fetch(`/api/eu-ai-act/subcontrol/${assessment.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          controlId: controlId, // Use structural controlId
          subcontrolId,
          status: subcontrol.status,
          notes: subcontrol.notes,
          evidenceFiles: subcontrol.evidenceFiles
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save subcontrol');
      }

      const savedSubcontrol = await response.json();

      // Update the control with the saved subcontrol using functional update
      setAssessment(currentAssessment => {
        if (!currentAssessment) return currentAssessment;
        
        const updatedControls = currentAssessment.controls?.map(control => 
          control.controlStruct?.controlId === controlId 
            ? {
                ...control,
                subcontrols: [
                  ...(control.subcontrols?.filter(sc => sc.subcontrolStruct?.subcontrolId !== subcontrolId) || []),
                  savedSubcontrol
                ]
              }
            : control
        ) || [];
        
        console.log('✅ API Save Subcontrol update - merging with current state:', {
          controlId,
          subcontrolId,
          savedSubcontrolFiles: savedSubcontrol.evidenceFiles
        });
        
        return {
          ...currentAssessment,
          controls: updatedControls,
          lastUpdated: Date.now()
        };
      });

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
                                        
                                        <div className="mt-4">
                                          <div className="relative">
                                            <FileUpload
                                              label="Evidence Files"
                                              value={question.answer?.evidenceFiles || []}
                                              onChange={(files) => handleEvidenceChange(question.questionId, files)}
                                              maxFiles={5}
                                              maxSize={10}
                                              disabled={savingFiles.has(`question-${question.questionId}`)}
                                            />
                                            {savingFiles.has(`question-${question.questionId}`) && (
                                              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Saving...
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                                          <div className="flex items-center gap-4">
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

            {activeTab === 'controls' && controlCategories.length === 0 && (
              <Card className="shadow-sm">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Control Categories Not Available</h3>
                      <p className="text-gray-600 mt-2">
                        The EU AI Act control categories have not been set up yet. 
                        Please run the framework setup script to populate the control data.
                      </p>
                      <p className="text-sm text-gray-500 mt-4">
                        Run: <code className="bg-gray-100 px-2 py-1 rounded">npx tsx scripts/setup-frameworks.ts</code>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                  <CardContent className="p-0">
                    {category.controls.map((control) => {
                      const assessmentControl = assessment?.controls?.find(
                        c => c.controlStruct?.controlId === control.controlId
                      );
                      
                      console.log(`🎨 UI RENDER - Control ${control.controlId}:`, {
                        hasAssessmentControl: !!assessmentControl,
                        evidenceFiles: assessmentControl?.evidenceFiles || [],
                        evidenceFilesLength: (assessmentControl?.evidenceFiles || []).length
                      });
                      
                      return (
                        <div key={control.id} className="border-t border-gray-100">
                          <div className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                  {getControlStatusIcon(assessmentControl?.status || 'pending')}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-medium text-gray-900">{control.controlId}: {control.title}</h4>
                                    <Badge 
                                      variant="outline" 
                                      className={getStatusColor(assessmentControl?.status || 'pending')}
                                    >
                                      {assessmentControl?.status || 'Pending'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-4">{control.description}</p>
                                  
                                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Implementation Status
                                      </label>
                                      <select
                                        value={assessmentControl?.status || 'pending'}
                                        onChange={(e) => handleControlStatusChange(control.controlId, e.target.value, assessmentControl?.notes || '')}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="reviewed">Reviewed</option>
                                        <option value="implemented">Implemented</option>
                                      </select>
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Implementation Notes
                                      </label>
                                      <textarea
                                        value={assessmentControl?.notes || ''}
                                        onChange={(e) => handleControlStatusChange(control.controlId, assessmentControl?.status || 'pending', e.target.value)}
                                        placeholder="Document how this control is implemented..."
                                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        rows={3}
                                      />
                                    </div>
                                    
                                    <div className="mt-4">
                                      <div className="relative">
                                        <FileUpload
                                          label="Evidence Files"
                                          value={assessmentControl?.evidenceFiles || []}
                                          onChange={(files) => handleControlEvidenceChange(control.controlId, files)}
                                          maxFiles={5}
                                          maxSize={10}
                                          disabled={savingFiles.has(`control-${control.controlId}`)}
                                        />
                                        {savingFiles.has(`control-${control.controlId}`) && (
                                          <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Saving...
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-end pt-3 border-t border-gray-200">
                                      <Button
                                        onClick={() => handleSaveControl(control.controlId)}
                                        disabled={saving}
                                        size="sm"
                                        className="flex items-center gap-2"
                                      >
                                        <Save className="w-4 h-4" />
                                        {saving ? 'Saving...' : 'Save'}
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {/* Subcontrols */}
                                  {control.subcontrols.length > 0 && (
                                    <div className="mt-6 space-y-4">
                                      <h5 className="text-sm font-medium text-gray-700">Subcontrols</h5>
                                      {control.subcontrols.map((subcontrol) => {
                                        const assessmentSubcontrol = assessmentControl?.subcontrols?.find(
                                          sc => sc.subcontrolStruct.subcontrolId === subcontrol.subcontrolId
                                        );
                                        
                                        return (
                                          <div key={subcontrol.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                              <div className="flex-shrink-0 mt-1">
                                                {getControlStatusIcon(assessmentSubcontrol?.status || 'pending')}
                                              </div>
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                  <h6 className="font-medium text-gray-800">{subcontrol.subcontrolId}: {subcontrol.title}</h6>
                                                  <Badge 
                                                    variant="outline" 
                                                    className={`text-xs ${getStatusColor(assessmentSubcontrol?.status || 'pending')}`}
                                                  >
                                                    {assessmentSubcontrol?.status || 'Pending'}
                                                  </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">{subcontrol.description}</p>
                                                
                                                <div className="space-y-3">
                                                  <div>
                                                    <select
                                                      value={assessmentSubcontrol?.status || 'pending'}
                                                      onChange={(e) => handleSubcontrolStatusChange(control.controlId, subcontrol.subcontrolId, e.target.value, assessmentSubcontrol?.notes || '')}
                                                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                    >
                                                      <option value="pending">Pending</option>
                                                      <option value="reviewed">Reviewed</option>
                                                      <option value="implemented">Implemented</option>
                                                    </select>
                                                  </div>
                                                  
                                                  <div>
                                                    <textarea
                                                      value={assessmentSubcontrol?.notes || ''}
                                                      onChange={(e) => handleSubcontrolStatusChange(control.controlId, subcontrol.subcontrolId, assessmentSubcontrol?.status || 'pending', e.target.value)}
                                                      placeholder="Implementation notes..."
                                                      className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                      rows={2}
                                                    />
                                                  </div>
                                                  
                                                  <div>
                                                    <div className="relative">
                                                      <FileUpload
                                                        label="Evidence Files"
                                                        value={assessmentSubcontrol?.evidenceFiles || []}
                                                        onChange={(files) => handleSubcontrolEvidenceChange(control.controlId, subcontrol.subcontrolId, files)}
                                                        maxFiles={5}
                                                        maxSize={10}
                                                        disabled={savingFiles.has(`subcontrol-${subcontrol.subcontrolId}`)}
                                                      />
                                                      {savingFiles.has(`subcontrol-${subcontrol.subcontrolId}`) && (
                                                        <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                                          <Loader2 className="w-3 h-3 animate-spin" />
                                                          Saving...
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                  
                                                  <div className="flex justify-end">
                                                    <Button
                                                      onClick={() => handleSaveSubcontrol(control.controlId, subcontrol.subcontrolId)}
                                                      disabled={saving}
                                                      size="sm"
                                                      variant="outline"
                                                    >
                                                      <Save className="w-3 h-3 mr-1" />
                                                      Save
                                                    </Button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}