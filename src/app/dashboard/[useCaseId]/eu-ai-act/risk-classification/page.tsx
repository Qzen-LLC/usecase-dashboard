'use client';

import React, { use, useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Info, Lock as LockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RISK_CLASSIFICATION_QUESTIONS, calculateRiskLevel, RiskLevel } from '@/lib/framework-data/eu-ai-act-risk-classification';
import { useGovernanceLock } from '@/hooks/useGovernanceLock';
import { GovernanceLockModal } from '@/components/GovernanceLockModal';

interface RiskClassificationPageProps {
  params: Promise<{
    useCaseId: string;
  }>;
}

export default function RiskClassificationPage({ params }: RiskClassificationPageProps) {
  const router = useRouter();
  const { useCaseId } = use(params);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [classification, setClassification] = useState<any>(null);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  const {
    lockInfo,
    canEdit,
    acquireLock,
    releaseLock,
    markLockForNavigation,
    loading: lockLoading,
    error: lockError
  } = useGovernanceLock(useCaseId, 'GOVERNANCE_EU_AI_ACT');

  const navigateWithLockRetention = useCallback((path: string, retain = true) => {
    if (retain) {
      markLockForNavigation();
    }
    router.push(path);
  }, [markLockForNavigation, router]);

  const totalSteps = 4;
  const currentStepQuestions = RISK_CLASSIFICATION_QUESTIONS.filter(q => q.step === currentStep);
  const isReadOnly = !canEdit;
  const readOnlyBannerText = useMemo(() => {
    if (!isReadOnly || lockLoading) return null;
    if (lockInfo?.lockDetails?.isOwnedByCurrentUser) return null;
    if (lockInfo?.lockDetails?.acquiredBy) {
      return `${lockInfo.lockDetails.acquiredBy} is currently working on this EU AI Act assessment.\nYou can review answers in read-only mode until they release the lock.`;
    }
    return 'Another team member is currently working on this EU AI Act assessment. You can review answers in read-only mode until the lock is released.';
  }, [isReadOnly, lockInfo, lockLoading]);
  const useCaseName = assessment?.useCase?.title ?? 'Selected Use Case';
  const lockModal = (
    <GovernanceLockModal
      isOpen={isLockModalOpen}
      onClose={() => setIsLockModalOpen(false)}
      lockInfo={lockInfo}
      framework="GOVERNANCE_EU_AI_ACT"
      useCaseId={useCaseId}
      useCaseName={useCaseName}
      onAcquireLock={acquireLock}
      onReleaseLock={releaseLock}
      loading={lockLoading}
    />
  );


  // Load assessment and existing answers
  useEffect(() => {
    fetchAssessment();
  }, [useCaseId]);

  useEffect(() => {
    if (lockLoading) {
      return;
    }

    if (lockInfo?.canEdit) {
      if (!lockInfo.hasLock) {
        acquireLock();
      } else {
        setIsLockModalOpen(false);
      }
    } else if (lockInfo) {
      setIsLockModalOpen(true);
    }
  }, [lockInfo, lockLoading, acquireLock]);

  const fetchAssessment = async () => {
    try {
      const response = await fetch(`/api/eu-ai-act/risk-classification/by-usecase/${useCaseId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Risk Classification Data:', {
          id: data.id,
          riskClassificationCompleted: data.riskClassificationCompleted,
          riskLevel: data.riskLevel,
          answersCount: data.riskClassificationAnswers?.length || 0
        });
        setAssessment(data);

        // Load existing answers
        const existingAnswers: Record<string, any> = {};
        if (data.riskClassificationAnswers && data.riskClassificationAnswers.length > 0) {
          data.riskClassificationAnswers.forEach((ans: any) => {
            try {
              existingAnswers[ans.questionId] = JSON.parse(ans.answer);
            } catch (e) {
              existingAnswers[ans.questionId] = ans.answer;
            }
          });
          setAnswers(existingAnswers);
          console.log('📝 Loaded existing answers:', Object.keys(existingAnswers));
        }

        // If already completed, show result
        if (data.riskClassificationCompleted) {
          console.log('✅ Classification completed, showing result page');
          const result = calculateRiskLevel(existingAnswers);
          console.log('🎯 Calculated result:', result);
          setClassification(result);
          setShowResult(true);
        } else {
          console.log('⏳ Classification not completed, showing wizard');
        }
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = async (questionId: string, answer: any) => {
    if (!assessment || isReadOnly) return;

    try {
      await fetch(`/api/eu-ai-act/risk-classification/${assessment.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, answer })
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleAnswerChange = async (questionId: string, answer: any) => {
    if (isReadOnly) {
      setIsLockModalOpen(true);
      return;
    }

    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    await saveAnswer(questionId, answer);
  };

  const handleNext = () => {
    if (isReadOnly) {
      setIsLockModalOpen(true);
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      completeClassification();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeClassification = async () => {
    if (!assessment || isReadOnly) {
      if (isReadOnly) {
        setIsLockModalOpen(true);
      }
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/eu-ai-act/risk-classification/${assessment.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setClassification(data.classification);
        setShowResult(true);
      }
    } catch (error) {
      console.error('Error completing classification:', error);
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (isReadOnly) {
      return false;
    }

    // Check if all questions in current step are answered
    return currentStepQuestions.every(q => {
      const answer = answers[q.id];
      return answer !== undefined && answer !== null && answer !== '';
    });
  };

  const getRiskLevelColor = (level: RiskLevel) => {
    switch (level) {
      case 'prohibited': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'limited': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'minimal': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskLevelIcon = (level: RiskLevel) => {
    switch (level) {
      case 'prohibited': return <AlertCircle className="h-8 w-8 text-red-600" />;
      case 'high': return <AlertCircle className="h-8 w-8 text-orange-600" />;
      case 'limited': return <Info className="h-8 w-8 text-yellow-600" />;
      case 'minimal': return <CheckCircle2 className="h-8 w-8 text-green-600" />;
      default: return <Info className="h-8 w-8 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <>
        {lockModal}
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading risk classification...</p>
          </div>
        </div>
      </>
    );
  }

  // Show result page if classification is complete
  if (showResult && classification) {
    return (
      <>
        {lockModal}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {getRiskLevelIcon(classification.riskLevel)}
            </div>
            <h1 className="text-3xl font-bold mb-4">Risk Classification Complete</h1>
            <div className={`inline-block px-6 py-3 rounded-lg border-2 text-xl font-semibold ${getRiskLevelColor(classification.riskLevel)}`}>
              {classification.riskLevel.toUpperCase()} RISK
            </div>
          </div>

          <div className="border-t pt-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">Classification Summary</h2>
            <p className="text-gray-700 leading-relaxed">{classification.rationale}</p>
          </div>

          {classification.prohibitedPractices.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">⚠️ Prohibited Practices Detected</h3>
              <ul className="list-disc list-inside text-red-700">
                {classification.prohibitedPractices.map((practice: string) => (
                  <li key={practice}>{practice}</li>
                ))}
              </ul>
              <p className="mt-2 text-red-800 font-medium">This system cannot be deployed in the EU.</p>
            </div>
          )}

          {classification.applicableCategories.length > 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
              <h3 className="font-semibold text-orange-800 mb-2">📋 Applicable High-Risk Categories</h3>
              <ul className="list-disc list-inside text-orange-700">
                {classification.applicableCategories.map((cat: string) => (
                  <li key={cat}>{cat}</li>
                ))}
              </ul>
            </div>
          )}

          {classification.transparencyObligations.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">ℹ️ Transparency Obligations</h3>
              <ul className="list-disc list-inside text-yellow-700">
                {classification.transparencyObligations.map((obl: string) => (
                  <li key={obl}>{obl}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Next Steps</h3>
            {classification.riskLevel === 'prohibited' && (
              <div className="text-red-800">
                <p className="mb-2">Your AI system involves prohibited practices and cannot be deployed in the EU.</p>
                <p>Consider redesigning the system to remove prohibited practices.</p>
              </div>
            )}

            {classification.riskLevel === 'high' && (
              <div className="text-orange-800">
                <p className="mb-4">Your AI system is classified as high-risk. You must complete:</p>
                <ul className="list-decimal list-inside space-y-2 mb-4">
                  <li>Full Assessment (70 questions)</li>
                  <li>Compliance Controls Implementation (170 controls)</li>
                  <li>Conformity Assessment (Article 43)</li>
                  <li>CE Marking (Article 48)</li>
                  <li>EU Database Registration (Article 71)</li>
                  <li>Post-Market Monitoring (Article 72)</li>
                </ul>
                <Button
                  onClick={() => navigateWithLockRetention(`/dashboard/${useCaseId}/eu-ai-act`)}
                  className="w-full"
                >
                  Start Full Assessment
                </Button>
              </div>
            )}

            {classification.riskLevel === 'limited' && (
              <div className="text-yellow-800">
                <p className="mb-2">Your AI system requires transparency obligations only.</p>
                <p className="mb-4">Ensure users are informed about AI interaction, content generation, or biometric processing.</p>
                <Button
                  onClick={() => navigateWithLockRetention(`/dashboard/${useCaseId}/eu-ai-act`)}
                  variant="outline"
                  className="w-full"
                >
                  View Transparency Requirements
                </Button>
              </div>
            )}

            {classification.riskLevel === 'minimal' && (
              <div className="text-green-800">
                <p className="mb-2">Your AI system is classified as minimal risk.</p>
                <p className="mb-4">No specific EU AI Act obligations apply, but voluntary codes of conduct are encouraged.</p>
                <Button
                  onClick={() => navigateWithLockRetention(`/dashboard/${useCaseId}`, false)}
                  variant="outline"
                  className="w-full"
                >
                  Return to Dashboard
                </Button>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <Button
              onClick={() => {
                setShowResult(false);
                setCurrentStep(1);
              }}
              variant="ghost"
            >
              ← Revise Classification
            </Button>
          </div>
        </Card>
      </div>
      </>
    );
  }

  // Show wizard
  return (
    <>
      {lockModal}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <Button
            onClick={() => navigateWithLockRetention(`/dashboard/${useCaseId}/eu-ai-act`)}
            variant="ghost"
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to EU AI Act
          </Button>
          <Button
            onClick={() => setIsLockModalOpen(true)}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <LockIcon className="h-4 w-4 mr-2" />
            Lock Status
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-2">EU AI Act Risk Classification</h1>
        <p className="text-gray-600">
          Complete this assessment to determine your AI system's risk level and compliance requirements (5-10 minutes)
        </p>
      </div>

      {lockError && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          Failed to check lock status. Refresh the page or try again later.
        </div>
      )}

      {readOnlyBannerText && (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900 whitespace-pre-line">
          {readOnlyBannerText}
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((step) => {
            // Check if step is completed (has answers for all questions in that step)
            const stepQuestions = RISK_CLASSIFICATION_QUESTIONS.filter(q => q.step === step);
            const isStepComplete = stepQuestions.every(q => {
              const answer = answers[q.id];
              return answer !== undefined && answer !== null && answer !== '' &&
                     (Array.isArray(answer) ? answer.length > 0 : true);
            });

            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold ${
                      step < currentStep || (step === currentStep && isStepComplete)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : step === currentStep
                        ? 'bg-white text-blue-600 border-blue-600'
                        : 'bg-white text-gray-400 border-gray-300'
                    }`}
                  >
                    {step < currentStep || (step === currentStep && isStepComplete) ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      step
                    )}
                  </div>
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-sm mt-3">
          <span className={`text-center ${currentStep === 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Verification</span>
          <span className={`text-center ${currentStep === 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Prohibited</span>
          <span className={`text-center ${currentStep === 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>High-Risk</span>
          <span className={`text-center ${currentStep === 4 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Limited-Risk</span>
        </div>
      </div>

      {/* Questions Card */}
      <Card className="p-8 mb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            Step {currentStep} of {totalSteps}: {currentStepQuestions[0]?.stepTitle}
          </h2>
        </div>

        {currentStepQuestions.map((question) => (
          <div key={question.id} className="mb-8">
            <label className="block text-lg font-medium mb-2">{question.question}</label>
            {question.description && (
              <p className="text-sm text-gray-600 mb-4">{question.description}</p>
            )}

            {question.answerType === 'multiple-choice' && question.options && (
              <div className="space-y-3">
                {question.options.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start p-4 border-2 rounded-lg transition-all ${
                      answers[question.id] === option.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    } ${isReadOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={answers[question.id] === option.value}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="mt-1 mr-3"
                      disabled={isReadOnly || saving}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {question.answerType === 'checkbox-list' && question.options && (
              <div className="space-y-3">
                {question.options.map((option) => {
                  const currentAnswers = answers[question.id] || [];
                  const isChecked = currentAnswers.includes(option.value);

                  return (
                    <label
                      key={option.value}
                      className={`flex items-start p-4 border-2 rounded-lg transition-all ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      } ${isReadOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isReadOnly || saving}
                        onChange={(e) => {
                          let newAnswers = [...currentAnswers];
                          if (e.target.checked) {
                            // Handle "none" option - clear all others
                            if (option.value === 'none') {
                              newAnswers = ['none'];
                            } else {
                              // Remove "none" if it was selected
                              newAnswers = newAnswers.filter(a => a !== 'none');
                              newAnswers.push(option.value);
                            }
                          } else {
                            newAnswers = newAnswers.filter(a => a !== option.value);
                          }
                          handleAnswerChange(question.id, newAnswers);
                        }}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        {option.description && (
                          <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={handleBack}
          variant="outline"
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={isReadOnly || !canProceed() || saving || lockLoading}
        >
          {currentStep === totalSteps ? (
            saving ? 'Completing...' : 'Complete Classification'
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
    </>
  );
}
