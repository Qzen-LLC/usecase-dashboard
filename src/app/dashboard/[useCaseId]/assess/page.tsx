'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  Database,
  TrendingUp,
  Shield,
  AlertTriangle,
  Brain,
  DollarSign,
  Calendar,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const assessmentSteps = [
  { id: 1, title: 'Technical Feasibility', icon: Database },
  { id: 2, title: 'Business Feasibility', icon: TrendingUp },
  { id: 3, title: 'Ethical Impact', icon: Shield },
  { id: 4, title: 'Risk Assessment', icon: AlertTriangle },
  { id: 5, title: 'Data Readiness', icon: Brain },
  { id: 6, title: 'Budget Planning', icon: DollarSign },
  { id: 7, title: 'Roadmap Position', icon: Calendar },
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
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [dataAvailability, setDataAvailability] = useState("excellent");
  const [technicalComplexity, setTechnicalComplexity] = useState(2);
  const [infraReadiness, setInfraReadiness] = useState({
    cloud: true,
    mlPlatform: false,
    dataPipeline: false,
  });
  const [teamExpertise, setTeamExpertise] = useState({
    dataScience: true,
    mlEngineering: true,
  });
  const [integrationReqs, setIntegrationReqs] = useState("");

  useEffect(() => {
    if (!useCaseId) return;
    setLoading(true);
    fetch(`/api/get-usecase?id=${useCaseId}`)
      .then(res => res.json())
      .then(data => {
        setUseCase(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load use case');
        setLoading(false);
      });
  }, [useCaseId]);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === assessmentSteps.length;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
    else {
      router.push(`/dashboard/${useCaseId}/assess/financial-dashboard`);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">Loading...</div>;
  }
  if (error || !useCase) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-red-500">{error || 'Use case not found'}</div>;
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
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep === step.id ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                <step.icon className="w-5 h-5" />
              </div>
              <div className="ml-2 whitespace-nowrap">
                <div className={`text-sm font-medium ${currentStep === step.id ? 'text-blue-600' : 'text-gray-500'}`}>
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
          <div className="space-y-8">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="font-semibold text-blue-800 text-lg mb-1">Technical Feasibility Assessment</div>
              <div className="text-blue-700">Evaluate the technical requirements and constraints for implementing this AI solution.</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Data Availability</label>
                <Select value={dataAvailability} onValueChange={setDataAvailability}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select data availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent - Rich, clean datasets available</SelectItem>
                    <SelectItem value="good">Good - Some cleaning required</SelectItem>
                    <SelectItem value="limited">Limited - Data gaps exist</SelectItem>
                    <SelectItem value="poor">Poor - Data not available</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block font-medium mb-1">Technical Complexity</label>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-500 text-sm">Simple</span>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[technicalComplexity]}
                    onValueChange={([val]) => setTechnicalComplexity(val)}
                    className="w-full"
                  />
                  <span className="text-gray-500 text-sm">Complex</span>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Infrastructure Readiness</label>
                <div className="flex flex-col space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={infraReadiness.cloud} onCheckedChange={val => setInfraReadiness(r => ({ ...r, cloud: !!val }))} />
                    <span>Cloud infrastructure available</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={infraReadiness.mlPlatform} onCheckedChange={val => setInfraReadiness(r => ({ ...r, mlPlatform: !!val }))} />
                    <span>ML/AI platform in place</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={infraReadiness.dataPipeline} onCheckedChange={val => setInfraReadiness(r => ({ ...r, dataPipeline: !!val }))} />
                    <span>Data pipeline capabilities</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Team Expertise</label>
                <div className="flex items-center space-x-8">
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={teamExpertise.dataScience} onCheckedChange={val => setTeamExpertise(r => ({ ...r, dataScience: !!val }))} />
                    <span>Data Science</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={teamExpertise.mlEngineering} onCheckedChange={val => setTeamExpertise(r => ({ ...r, mlEngineering: !!val }))} />
                    <span>ML Engineering</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Integration Requirements</label>
                <Textarea
                  value={integrationReqs}
                  onChange={e => setIntegrationReqs(e.target.value)}
                  placeholder="Describe integration requirements with existing systems..."
                  className="w-full"
                />
              </div>

              {/* AI-Powered Recommendations */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6 w-full">
                <div className="font-semibold text-gray-800 mb-2">AI-Powered Recommendations</div>
                <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                  <li>Consider using pre-trained models to reduce complexity</li>
                  <li>Implement incremental data collection strategy</li>
                  <li>Plan for 3-month technical proof-of-concept phase</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-600 text-lg font-medium">
            You are on <strong>{assessmentSteps[currentStep - 1].title}</strong> step.
          </div>
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="px-8 py-6 border-t bg-white flex justify-between items-center">
        <button
          className={`flex items-center px-4 py-2 rounded-md ${isFirstStep ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
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
          // disabled={isLastStep}
          onClick={handleNext}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}