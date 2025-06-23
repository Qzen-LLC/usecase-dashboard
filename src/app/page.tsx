'use client'
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Target, Users, TrendingUp, Zap, DollarSign, Save, Download, Plus, Minus } from 'lucide-react';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";
import { Slider as ShadcnSlider } from "../components/ui/slider";

// 1. Define FormData type

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

type ArrayField = 'secondaryStakeholders' | 'successCriteria' | 'keyAssumptions';
type NumberField = 'confidenceLevel' | 'operationalScore' | 'productivityScore' | 'revenueScore' | 'complexity';

type StringField = Exclude<keyof FormData, ArrayField | NumberField>;

// --- Google-like Section Header ---

const AIUseCaseTool = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    // Use Case Documentation
    title: '',
    problemStatement: '',
    proposedSolution: '',
    primaryStakeholder: '',
    secondaryStakeholders: [],
    currentState: '',
    desiredState: '',
    successCriteria: [],
    
    // Lean Business Case
    problemValidation: '',
    solutionHypothesis: '',
    keyAssumptions: [],
    initialROI: '',
    confidenceLevel: 5,
    
    // Three-Dimensional Scoring
    operationalScore: 5,
    productivityScore: 5,
    revenueScore: 5,
    
    // Additional fields
    complexity: 5,
    timeline: '',
    resources: ''
  });

  const steps = [
    { id: 1, title: 'Use Case Documentation', icon: Target },
    { id: 2, title: 'Lean Business Case', icon: TrendingUp },
    { id: 3, title: 'Multi-Dimensional Scoring', icon: Zap }
  ];

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  type ArrayInputProps = {
    label: string;
    field: ArrayField;
    placeholder: string;
  };

  const ArrayInput: React.FC<ArrayInputProps> = ({ label, field, placeholder }) => {
    const [inputValue, setInputValue] = useState<string>('');
    
    return (
      <div className="space-y-2">
        <Label className="block text-sm font-medium text-gray-700">{label}</Label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleArrayAdd(field, inputValue);
                setInputValue('');
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              handleArrayAdd(field, inputValue);
              setInputValue('');
            }}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1">
          {formData[field].map((item: string, index: number) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
              <span className="text-sm">{item}</span>
              <button
                type="button"
                onClick={() => handleArrayRemove(field, index)}
                className="text-red-500 hover:text-red-700"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  type SliderInputProps = {
    label: string;
    field: NumberField;
    min?: number;
    max?: number;
    description?: string;
  };

  const SliderInput: React.FC<SliderInputProps> = ({ label, field, min = 1, max = 10, description }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <Label className="block text-sm font-medium text-gray-700">{label}</Label>
      <span className="text-lg font-semibold text-blue-600">{formData[field]}</span>
    </div>
    <div className="py-2">
      <ShadcnSlider
        min={min}
        max={max}
        step={1}
        value={[formData[field]]}
        onValueChange={([val]) => handleInputChange(field, val)}
        className="w-full"
      />
    </div>
    <div className="flex justify-between text-xs text-gray-500">
      <span>Low ({min})</span>
      <span>High ({max})</span>
    </div>
    {description && <p className="text-sm text-gray-600">{description}</p>}
  </div>
);

  // --- Updated Stepper ---
  const Stepper = () => {
    return (
      <div className="flex items-end justify-center gap-0 sm:gap-8">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center w-32">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 shadow-sm
                ${currentStep === step.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-blue-300 text-blue-500'}`}
              >
                <step.icon className={`w-6 h-6 ${currentStep === step.id ? 'text-white' : 'text-blue-500'}`} />
              </div>
              <span className={`mt-2 text-sm font-semibold text-center min-h-[2.5rem] ${currentStep === step.id ? 'text-blue-700 font-bold' : 'text-blue-500'}`}>{step.title}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className="w-12 h-1 bg-gradient-to-r from-blue-200 to-purple-200 mx-2 rounded-full self-center" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // --- PillButton Component ---
  const PillButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { color?: string; icon?: React.ReactNode }> = ({ color = 'blue', icon, className = '', children, ...props }) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300',
      green: 'bg-green-600 hover:bg-green-700 focus:ring-green-300',
      gray: 'bg-gray-500 hover:bg-gray-300 focus:ring-gray-300 text-gray-700',
      disabled: 'bg-gray-200 text-gray-400 cursor-not-allowed',
    };
    return (
      <button
        className={`inline-flex items-center gap-2 px-6 py-2 rounded-full shadow-md font-semibold text-base focus:outline-none focus:ring-2 transition-all duration-150 ${colorMap[color] || colorMap.blue} ${className} text-white`}
        {...props}
      >
        {icon}
        {children}
      </button>
    );
  };

  const renderStep1 = () => (
    <Card className="mb-8 border border-gray-200 bg-gray-50 shadow-lg rounded-xl px-10 py-8">
      <h2 className="font-heading text-2xl font-bold mb-1 text-gray-900">Use Case Documentation</h2>
      <p className="text-gray-500 text-sm mb-4">Define and structure your AI use case with clear problem statements and success criteria.</p>
      <Separator className='mb-6' />
      <div className="grid grid-cols-1 gap-6 mt-2">
        <div className="mb-6">
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Use Case Title</Label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Automated Customer Support Ticket Classification"
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        <div className="mb-6">
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Problem Statement</Label>
          <Textarea
            value={formData.problemStatement}
            onChange={(e) => handleInputChange('problemStatement', e.target.value)}
            placeholder="Describe the current business problem or opportunity..."
            rows={4}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        <div className="mb-6">
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Proposed AI Solution</Label>
          <Textarea
            value={formData.proposedSolution}
            onChange={(e) => handleInputChange('proposedSolution', e.target.value)}
            placeholder="Describe how AI will solve this problem..."
            rows={4}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="mb-6">
            <Label className="block text-lg font-semibold text-gray-700 mb-3">Current State</Label>
            <Textarea
              value={formData.currentState}
              onChange={(e) => handleInputChange('currentState', e.target.value)}
              placeholder="How is this handled today?"
              rows={3}
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>

          <div className="mb-6">
            <Label className="block text-lg font-semibold text-gray-700 mb-3">Desired State</Label>
            <Textarea
              value={formData.desiredState}
              onChange={(e) => handleInputChange('desiredState', e.target.value)}
              placeholder="What will the future state look like?"
              rows={3}
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>
        </div>

        <div className="mb-6">
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Primary Stakeholder</Label>
          <Input
            type="text"
            value={formData.primaryStakeholder}
            onChange={(e) => handleInputChange('primaryStakeholder', e.target.value)}
            placeholder="e.g., Customer Support Manager"
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        <ArrayInput
          label="Secondary Stakeholders"
          field="secondaryStakeholders"
          placeholder="Add stakeholder (press Enter or click +)"
        />

        <ArrayInput
          label="Success Criteria"
          field="successCriteria"
          placeholder="Add success criterion (press Enter or click +)"
        />
      </div>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="mb-8 border border-gray-200 bg-gray-50 shadow-lg rounded-xl px-10 py-8">
      <h2 className="font-heading text-2xl font-bold mb-1 text-gray-900">Lean Business Case</h2>
      <p className="text-gray-500 text-sm mb-4">Build a lightweight business case focusing on problem-solution fit and key assumptions.</p>
      <Separator className='mb-6' />
      <div className="space-y-6">
        <div className="mb-6">
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Problem Validation</Label>
          <Textarea
            value={formData.problemValidation}
            onChange={(e) => handleInputChange('problemValidation', e.target.value)}
            placeholder="How do you know this problem exists? What evidence supports it?"
            rows={4}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        <div className="mb-6">
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Solution Hypothesis</Label>
          <Textarea
            value={formData.solutionHypothesis}
            onChange={(e) => handleInputChange('solutionHypothesis', e.target.value)}
            placeholder="We believe that [solution] will achieve [outcome] because [reason]..."
            rows={4}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        <ArrayInput
          label="Key Assumptions"
          field="keyAssumptions"
          placeholder="Add key assumption (press Enter or click +)"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="mb-6">
            <Label className="block text-lg font-semibold text-gray-700 mb-3">Initial ROI Estimate</Label>
            <Input
              type="text"
              value={formData.initialROI}
              onChange={(e) => handleInputChange('initialROI', e.target.value)}
              placeholder="e.g., 200% ROI in 12 months"
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>

          <div>
            <SliderInput
              label="Confidence Level"
              field="confidenceLevel"
              min={1}
              max={10}
              description="How confident are you in your estimates?"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="mb-6">
            <Label className="block text-lg font-semibold text-gray-700 mb-3">Estimated Timeline</Label>
            <Input
              type="text"
              value={formData.timeline}
              onChange={(e) => handleInputChange('timeline', e.target.value)}
              placeholder="e.g., 6 months to MVP"
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>

          <div className="mb-6">
            <Label className="block text-lg font-semibold text-gray-700 mb-3">Required Resources</Label>
            <Input
              type="text"
              value={formData.resources}
              onChange={(e) => handleInputChange('resources', e.target.value)}
              placeholder="e.g., 2 data scientists, 1 ML engineer"
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>
        </div>
      </div>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="mb-8 border border-gray-200 bg-gray-50 shadow-lg rounded-xl px-10 py-8">
      <h2 className="font-heading text-2xl font-bold mb-1 text-gray-900">Multi-Dimensional Scoring</h2>
      <p className="text-gray-500 text-sm mb-4">Quantify your use case across the three strategic dimensions.</p>
      <Separator className='mb-6' />
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg border-2 border-orange-200">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-orange-500 mr-2" />
            <h4 className="text-lg font-semibold text-orange-800">Operational Enhancers</h4>
          </div>
          <Separator className='my-6' />
          <SliderInput
            label="Operational Impact Score"
            field="operationalScore"
            description="How much will this improve operational efficiency, reduce costs, or streamline processes?"
          />
        </div>

        <div className="bg-white p-6 rounded-lg border-2 border-pink-200">
          <div className="flex items-center mb-4">
            <Zap className="w-6 h-6 text-pink-500 mr-2" />
            <h4 className="text-lg font-semibold text-pink-800">Productivity Driver</h4>
          </div>
          <Separator className='my-6' />
          <SliderInput
            label="Productivity Impact Score"
            field="productivityScore"
            description="How significantly will this boost employee productivity or automate manual tasks?"
          />
        </div>

        <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
          <div className="flex items-center mb-4">
            <DollarSign className="w-6 h-6 text-blue-500 mr-2" />
            <h4 className="text-lg font-semibold text-blue-800">Revenue Accelerators</h4>
          </div>
          <Separator className='my-6' />
          <SliderInput
            label="Revenue Impact Score"
            field="revenueScore"
            description="What is the potential for direct revenue generation or customer value creation?"
          />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Metrics</h4>
          <Separator className='my-6' />
          <SliderInput
            label="Implementation Complexity"
            field="complexity"
            description="How complex will this be to implement? (1 = Very Simple, 10 = Very Complex)"
          />
        </div>

        {/* Visual Summary */}
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Use Case Profile</h4>
          <Separator className='my-6' />
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
    </Card>
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start">
      <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-t-3xl shadow-lg mb-4">
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight">AI Use Case Refinement Tool</h1>
          <p className="text-lg text-blue-100 opacity-90 pb-6">Transform AI ideas into structured, quantified business opportunities</p>
        </div>
        {/* Stepper */}
        <div className='relative z-10 bg-white rounded-t-2xl shadow-md w-full max-w-3xl mx-auto -mt-12 mb-0 px-8 py-4 border-b border-gray-200'>
          <Stepper />
        </div>
        {/* Content */}
        <div className="p-0 sm:p-2">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-8">
          <PillButton
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            color={currentStep === 1 ? 'disabled' : 'gray'}
            icon={<ChevronLeft className="w-5 h-5" />}
          >
            Previous
          </PillButton>
          <div className="flex flex-row space-x-3 w-full sm:w-auto justify-center">
            <PillButton
              onClick={exportData}
              color="green"
              icon={<Download className="w-5 h-5" />}
            >
              Export
            </PillButton>
            <PillButton
              onClick={() => console.log('Saved:', formData)}
              color="blue"
              icon={<Save className="w-5 h-5" />}
            >
              Save Draft
            </PillButton>
          </div>
          <PillButton
            onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
            disabled={currentStep === 3}
            color={currentStep === 3 ? 'disabled' : 'blue'}
            icon={<ChevronRight className="w-5 h-5" />}
          >
            Next
          </PillButton>
        </div>
      </div>
    </div>
  );
};

export default AIUseCaseTool;