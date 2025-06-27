"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import TechnicalFeasibility from '@/components/TechnicalFeasibility';
import EthicalImpact from '@/components/EthicalImpact';
import RiskAssessment from '@/components/RiskAssessment';
import BusinessFeasibility from "@/components/BusinessFeasibility";
import BudgetPlanning from "@/components/BudgetPlanning";
import {
  TrendingUp,
  Shield,
  AlertTriangle,
  Brain,
  DollarSign,
  Calendar,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import RoadmapPosition from "@/components/RoadmapPosition";
import DataReadiness from "@/components/DataReadiness";

const assessmentSteps = [
  { id: 1, title: "Technical Feasibility" },
  { id: 2, title: "Business Feasibility" },
  { id: 3, title: "Ethical Impact" },
  { id: 4, title: "Risk Assessment" },
  { id: 5, title: "Data Readiness" },
  { id: 6, title: "Roadmap Position" },
  { id: 7, title: "Budget Planning" },
];

interface UseCase {
  title: string;
  department: string;
  owner: string;
}

export default function AssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const useCaseId = params.useCaseId as string;
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!useCaseId) return;
    setLoading(true);
    fetch(`/api/get-usecase?id=${useCaseId}`)
      .then((res) => res.json())
      .then((data) => {
        setUseCase(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load use case");
        setLoading(false);
      });
  }, [useCaseId]);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === assessmentSteps.length;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else {
      router.push(`/dashboard/${useCaseId}/assess/financial-dashboard`);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">Loading...</div>;
  }
  if (error || !useCase) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-red-500">{error || "Use case not found"}</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation */}
      <div className="flex items-center border-b px-6 py-3 bg-white">
        <div className="flex space-x-8">
          <button className="text-gray-600 font-medium hover:text-blue-700 flex items-center">
            <span className="mr-2">📊</span> Pipeline
          </button>
          <button className="text-blue-700 font-semibold border-b-2 border-blue-700 flex items-center">
            <span className="mr-2">🛡️</span> Assessment
          </button>
          <button className="text-gray-600 font-medium hover:text-blue-700 flex items-center">
            <span className="mr-2">📁</span> Portfolio
          </button>
        </div>
        <div className="ml-auto text-xl font-bold text-gray-900">AI Strategic Enablement</div>
      </div>

      {/* Use Case Title Section */}
      <div className="px-8 py-6 border-b bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-2xl font-semibold text-gray-900 mb-1">{useCase.title}</div>
          <div className="text-gray-600">{useCase.department} • {useCase.owner}</div>
        </div>
        <button className="text-blue-700 hover:underline mt-4 sm:mt-0">&larr; Back to Pipeline</button>
      </div>

      {/* Assessment Steps Navigation */}
      <div className="px-8 py-4 border-b bg-gray-50 overflow-x-auto">
        <div className="flex items-center space-x-4">
          {assessmentSteps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep === step.id ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}>
                {/* You can add icons here if desired */}
                {step.title[0]}
              </div>
              <div className="ml-2 whitespace-nowrap">
                <div className={`text-sm font-medium ${currentStep === step.id ? "text-blue-600" : "text-gray-500"}`}>
                  {step.title}
                </div>
              </div>
              {idx < assessmentSteps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-400 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-8 py-10 bg-white">
        {currentStep === 1 ? (
          <TechnicalFeasibility />
        ) : currentStep === 2 ? (
          <BusinessFeasibility />
        ) : currentStep === 3 ? (
          <EthicalImpact />
        ) : currentStep === 4 ? (
          <RiskAssessment /> 
        ): currentStep === 5 ? (
          <DataReadiness />  
        ): currentStep === 6 ? (
          <RoadmapPosition />
        ) : currentStep === 7 ? (
          <BudgetPlanning />
        ) :
         (
          <div className="text-gray-600 text-lg font-medium">
            You are on <strong>{assessmentSteps[currentStep - 1].title}</strong> step.
          </div>
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="px-8 py-6 border-t bg-white flex justify-between items-center">
        <button
          className={`flex items-center px-4 py-2 rounded-md ${isFirstStep ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
          disabled={isFirstStep}
          onClick={handlePrev}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </button>

        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">
          Save Progress
        </button>

        <button
          className={`flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700`}
          onClick={handleNext}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
} 