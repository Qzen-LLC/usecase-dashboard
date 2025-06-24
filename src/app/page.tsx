'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Target, TrendingUp, Zap, DollarSign, Save, Download, Plus, Minus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

type FormData = {
  title: string;
  problemStatement: string;
  proposedSolution: string;
  primaryStakeholder: string;
  secondaryStakeholders: string[];
  currentState: string;
  desiredState: string;
  successCriteria: string[];
  problemValidation: string;
  solutionHypothesis: string;
  keyAssumptions: string[];
  initialROI: string;
  confidenceLevel: number;
  operationalScore: number;
  productivityScore: number;
  revenueScore: number;
  complexity: number;
  timeline: string;
  resources: string;
};

const initialFormData: FormData = {
  title: "",
  problemStatement: "",
  proposedSolution: "",
  primaryStakeholder: "",
  secondaryStakeholders: [],
  currentState: "",
  desiredState: "",
  successCriteria: [],
  problemValidation: "",
  solutionHypothesis: "",
  keyAssumptions: [],
  initialROI: "",
  confidenceLevel: 5,
  operationalScore: 5,
  productivityScore: 5,
  revenueScore: 5,
  complexity: 5,
  timeline: "",
  resources: "",
};

type ArrayField = 'secondaryStakeholders' | 'successCriteria' | 'keyAssumptions';

const ArrayInput = ({
  label,
  field,
  value,
  onAdd,
  onRemove,
  invalid,
  placeholder,
}: {
  label: string;
  field: keyof FormData;
  value: string[];
  onAdd: (field: ArrayField, val: string) => void;
  onRemove: (field: ArrayField, idx: number) => void;
  invalid?: boolean;
  placeholder?: string;
}) => {
  const [inputVal, setInputVal] = useState("");

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className={invalid ? 'border-red-500' : ''}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onAdd(field as ArrayField, inputVal);
              setInputVal("");
            }
          }}
        />
        <Button
          type="button"
          onClick={() => {
            onAdd(field as ArrayField, inputVal);
            setInputVal("");
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-1">
        {value.map((item, i) => (
          <div
            key={i}
            className="flex justify-between items-center border p-2 rounded"
          >
            <span>{item}</span>
            <Button variant="destructive" size="icon" onClick={() => onRemove(field as ArrayField, i)}>
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AIUseCaseTool = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [showError, setShowError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const steps = [
    { id: 1, title: 'Use Case Documentation', icon: Target },
    { id: 2, title: 'Lean Business Case', icon: TrendingUp },
    { id: 3, title: 'Multi-Dimensional Scoring', icon: Zap }
  ];

  const handleArrayAdd = (field: ArrayField, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const handleArrayRemove = (field: ArrayField, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index)
    }));
  };

  const handleChange = (field: keyof FormData, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  // Validation logic
  const validateForm = () => {
    const invalid: string[] = [];
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length === 0) invalid.push(key);
      } else if (typeof value === 'string') {
        if (!value.trim()) invalid.push(key);
      } else if (typeof value === 'number') {
        if (value === null || value === undefined) invalid.push(key);
      }
    });
    setInvalidFields(invalid);
    setShowError(invalid.length > 0);
    return invalid.length === 0;
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Use Case Documentation</h3>
        <p className="text-blue-700">Define and structure your AI use case with clear problem statements and success criteria.</p>
      </div>
      <div className="grid grid-cols-1">
        <Card className="p-6">
          <Label htmlFor="title">Use Case Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className={invalidFields.includes('title') ? 'border-red-500' : ''}
            placeholder="e.g., Automated Customer Support Ticket Categorization"
          />
          <Label htmlFor="problemStatement">Problem Statement</Label>
          <Textarea
            id="problemStatement"
            value={formData.problemStatement}
            onChange={(e) => handleChange("problemStatement", e.target.value)}
            className={invalidFields.includes('problemStatement') ? 'border-red-500' : ''}
            placeholder="e.g., Customer support agents spend 2 hours daily manually categorizing tickets, leading to delays and misrouting."
          />
          <Label htmlFor="proposedSolution">Proposed Solution</Label>
          <Textarea
            id="proposedSolution"
            value={formData.proposedSolution}
            onChange={(e) => handleChange("proposedSolution", e.target.value)}
            className={invalidFields.includes('proposedSolution') ? 'border-red-500' : ''}
            placeholder="e.g., Implement an AI model that automatically categorizes incoming support tickets based on their content."
          />
          <Label htmlFor="currentState">Current State</Label>
          <Textarea
            id="currentState"
            value={formData.currentState}
            onChange={(e) => handleChange("currentState", e.target.value)}
            className={invalidFields.includes('currentState') ? 'border-red-500' : ''}
            placeholder="e.g., Tickets are manually read and categorized by a team of 5 agents."
          />
          <Label htmlFor="desiredState">Desired State</Label>
          <Textarea
            id="desiredState"
            value={formData.desiredState}
            onChange={(e) => handleChange("desiredState", e.target.value)}
            className={invalidFields.includes('desiredState') ? 'border-red-500' : ''}
            placeholder="e.g., 90% of tickets are automatically and accurately categorized within 1 minute of arrival."
          />
          <Label htmlFor="primaryStakeholder">Primary Stakeholder</Label>
          <Input
            id="primaryStakeholder"
            value={formData.primaryStakeholder}
            onChange={(e) => handleChange("primaryStakeholder", e.target.value)}
            className={invalidFields.includes('primaryStakeholder') ? 'border-red-500' : ''}
            placeholder="e.g., Head of Customer Support"
          />
          <ArrayInput
            label="Secondary Stakeholders"
            field="secondaryStakeholders"
            value={formData.secondaryStakeholders}
            onAdd={handleArrayAdd}
            onRemove={handleArrayRemove}
            invalid={invalidFields.includes('secondaryStakeholders')}
            placeholder="e.g., IT Operations Manager"
          />
          <ArrayInput
            label="Success Criteria"
            field="successCriteria"
            value={formData.successCriteria}
            onAdd={handleArrayAdd}
            onRemove={handleArrayRemove}
            invalid={invalidFields.includes('successCriteria')}
            placeholder="e.g., Reduce average ticket resolution time by 25%"
          />
        </Card>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Lean Business Case</h3>
        <p className="text-green-700">Build a lightweight business case focusing on problem-solution fit and key assumptions.</p>
      </div>
      <div className="space-y-6">
        <Card className='p-6'>
          <Label htmlFor="problemValidation">Problem Validation</Label>
          <Textarea
            id="problemValidation"
            value={formData.problemValidation}
            onChange={(e) => handleChange("problemValidation", e.target.value)}
            className={invalidFields.includes('problemValidation') ? 'border-red-500' : ''}
            placeholder="e.g., Conducted interviews with 5 support agents, 4 confirmed this is a major pain point."
          />
          <Label htmlFor="solutionHypothesis">Solution Hypothesis</Label>
          <Textarea
            id="solutionHypothesis"
            value={formData.solutionHypothesis}
            onChange={(e) => handleChange("solutionHypothesis", e.target.value)}
            className={invalidFields.includes('solutionHypothesis') ? 'border-red-500' : ''}
            placeholder="e.g., If we auto-categorize tickets, we will reduce resolution time by 25%."
          />
          <ArrayInput
            label="Key Assumptions"
            field="keyAssumptions"
            value={formData.keyAssumptions}
            onAdd={handleArrayAdd}
            onRemove={handleArrayRemove}
            invalid={invalidFields.includes('keyAssumptions')}
            placeholder="e.g., The AI model can achieve at least 90% accuracy."
          />
          <Label htmlFor="initialROI">Initial ROI</Label>
          <Input
            id="initialROI"
            value={formData.initialROI}
            onChange={(e) => handleChange("initialROI", e.target.value)}
            className={invalidFields.includes('initialROI') ? 'border-red-500' : ''}
            placeholder="e.g., Estimated $50,000 annual savings from reduced agent hours."
          />
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="confidenceLevel">Confidence Level</Label>
            <span className="text-blue-600 font-bold">{formData.confidenceLevel}</span>
          </div>
          <Slider
            min={1}
            max={10}
            value={[formData.confidenceLevel]}
            onValueChange={([val]) => handleChange("confidenceLevel", val)}
          />
          <div className='space-y-1'>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
            <Label htmlFor="confidenceLevel" className='text-sm font-normal text-gray-800'>How confident are you in your estimates?</Label>
          </div>
          <Label htmlFor="timeline">Estimated Timeline</Label>
          <Input
            id="timeline"
            value={formData.timeline}
            onChange={(e) => handleChange("timeline", e.target.value)}
            className={invalidFields.includes('timeline') ? 'border-red-500' : ''}
            placeholder="e.g., 3 months"
          />
          <Label htmlFor="resources">Required Resources</Label>
          <Input
            id="resources"
            value={formData.resources}
            onChange={(e) => handleChange("resources", e.target.value)}
            className={invalidFields.includes('resources') ? 'border-red-500' : ''}
            placeholder="e.g., 1 AI Engineer, 1 Product Manager, access to historical ticket data."
          />
        </Card>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-800 mb-2">Multi-Dimensional Scoring</h3>
        <p className="text-purple-700">Quantify your use case across the three strategic dimensions.</p>
      </div>
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg border-2 border-orange-200">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-orange-500 mr-2" />
            <Label htmlFor="operationalScore" className='text-lg font-semibold text-orange-800'>Operational Enhancers</Label>
          </div>
          <div className="space-y-4">
            <Label htmlFor="operationalScore" className='text-sm font-normal text-gray-800 mb-2'>Operational Impact Score</Label>
            <div className="flex justify-between items-center mb-1">
              <span></span>
              <span className="text-blue-600 font-bold">{formData.operationalScore}</span>
            </div>
            <Slider
              min={1}
              max={10}
              value={[formData.operationalScore]}
              onValueChange={([val]) => handleChange("operationalScore", val)}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
            <Label htmlFor="operationalScore" className='text-sm font-normal text-gray-800 mb-4'>How much will this improve operational efficiency, reduce costs, or streamline processes?</Label>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border-2 border-pink-200">
          <div className="flex items-center mb-4">
            <Zap className="w-6 h-6 text-pink-500 mr-2" />
            <Label htmlFor="productivityScore" className='text-lg font-semibold text-pink-800'>Productivity Driver</Label>
          </div>
          <div className="space-y-4">
            <Label htmlFor="productivityScore" className='text-sm font-normal text-gray-800 mb-2'>Productivity Impact Score</Label>
            <div className="flex justify-between items-center mb-1">
              <span></span>
              <span className="text-blue-600 font-bold">{formData.productivityScore}</span>
            </div>
            <Slider
              min={1}
              max={10}
              value={[formData.productivityScore]}
              onValueChange={([val]) => handleChange("productivityScore", val)}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
            <Label htmlFor="productivityScore" className='text-sm font-normal text-gray-800 mb-4'>How significantly will this boost employee productivity or automate manual tasks?</Label>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
          <div className="flex items-center mb-4">
            <DollarSign className="w-6 h-6 text-blue-500 mr-2" />
            <Label htmlFor="revenueScore" className='text-lg font-semibold text-blue-800'>Revenue Accelerators</Label>
          </div>
          <div className="space-y-4">
            <Label htmlFor="revenueScore" className='text-sm font-normal text-gray-800 mb-2'>Revenue Impact Score</Label>
            <div className="flex justify-between items-center mb-1">
              <span></span>
              <span className="text-blue-600 font-bold">{formData.revenueScore}</span>
            </div>
            <Slider
              min={1}
              max={10}
              value={[formData.revenueScore]}
              onValueChange={([val]) => handleChange("revenueScore", val)}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
            <Label htmlFor="revenueScore" className='text-sm font-normal text-gray-800 mb-4'>What is the potential for direct revenue generation or customer value creation?</Label>
          </div>
        </div>
        <div className="bg-gray-75 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Label htmlFor="complexity" className='text-lg font-semibold text-black-800'>Additional Metrics</Label>
          </div>
          <div className="space-y-4">
            <Label htmlFor="complexity" className='text-sm font-normal text-gray-800 mb-2'>Implementation Complexity</Label>
            <div className="flex justify-between items-center mb-1">
              <span></span>
              <span className="text-blue-600 font-bold">{formData.complexity}</span>
            </div>
            <Slider
              min={1}
              max={10}
              value={[formData.complexity]}
              onValueChange={([val]) => handleChange("complexity", val)}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
            <Label htmlFor="complexity" className='text-sm font-normal text-gray-800 mb-4'>How complex will this be to implement? (1 = Very Simple, 10 = Very Complex)</Label>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Use Case Profile</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-orange-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{formData.operationalScore}</div>
              <div className="text-sm text-orange-800">Operational</div>
            </div>
            <div className="bg-pink-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">{formData.productivityScore}</div>
              <div className="text-sm text-pink-800">Productivity</div>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formData.revenueScore}</div>
              <div className="text-sm text-blue-800">Revenue</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-lg font-semibold text-gray-700">
              Overall Score: {((formData.operationalScore + formData.productivityScore + formData.revenueScore) / 3).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              Complexity: {formData.complexity}/10
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const exportData = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${formData.title || 'ai-use-case'}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleGoToPipeline = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const { 
          proposedSolution, 
          operationalScore, 
          productivityScore, 
          revenueScore, 
          complexity, 
          timeline, 
          resources,
          primaryStakeholder,
          ...rest 
        } = formData;

        const response = await fetch('/api/write-usecases', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...rest,
            proposedAISolution: proposedSolution,
            operationalImpactScore: operationalScore,
            productivityImpactScore: productivityScore,
            revenueImpactScore: revenueScore,
            implementationComplexity: complexity,
            estimatedTimeline: timeline,
            requiredResources: resources,
            primaryStakeholders: [primaryStakeholder],
          }),
        });

        if (response.ok) {
          router.push('/dashboard-test');
        } else {
          // Handle error, maybe show a notification
          console.error('Failed to save use case');
          setShowError(true); // Or a more specific error message
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        setShowError(true); // Or a more specific error message
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-50 p-0 sm:p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden border-0 sm:border sm:mt-6 sm:mb-6 sm:mx-0 mx-0">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6">
          <h1 className="text-2xl font-bold mb-2">AI Use Case Refinement Tool</h1>
          <p className="text-blue-100">Transform AI ideas into structured, quantified business opportunities</p>
        </div>
        <div className="bg-gray-100 px-2 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center mb-2 sm:mb-0">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${
                  currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <div className={`text-xs sm:text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-2 sm:mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border-t border-gray-200">
          <div className="p-6">
            {showError && (
              <div className="mb-4 text-red-600 font-semibold">
                Please fill all required fields before proceeding.
              </div>
            )}
            <main>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </main>
          </div>
          <div className="flex justify-between items-center p-6 border-t">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentStep(prev => prev > 1 ? prev - 1 : prev)}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white ${currentStep === 1 ? 'invisible' : ''}`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                onClick={exportData}
                variant="outline"
                className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button
                onClick={() => console.log('Saved:', formData)}
                variant="outline"
                className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-500">
                Step {currentStep} of {steps.length}
              </div>
              {currentStep === steps.length ? (
                <Button
                  onClick={handleGoToPipeline}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                >
                  {isSubmitting ? 'Submitting...' : 'Go to Pipeline'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentStep(prev => prev < steps.length ? prev + 1 : prev)}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIUseCaseTool;