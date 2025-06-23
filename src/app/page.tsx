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
      gray: 'bg-gray-400 hover:bg-gray-800 focus:ring-gray-400 text-white',
      disabled: 'bg-gray-400 text-gray-400 cursor-not-allowed',
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
    <>
      <h2 className="text-2xl font-bold mb-4">Use Case Documentation</h2>
      <p className="text-base text-gray-600 mb-8">Define and structure your AI use case with clear problem statements and success criteria.</p>
      <div className="grid grid-cols-1 gap-8">
        <div>
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Use Case Title</Label>
          <Input type="text" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} placeholder="e.g., Automated Customer Support Ticket Classification" className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
        </div>
        <div>
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Problem Statement</Label>
          <Textarea value={formData.problemStatement} onChange={e => handleInputChange('problemStatement', e.target.value)} placeholder="Describe the current business problem or opportunity..." rows={4} className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
        </div>
        <div>
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Proposed AI Solution</Label>
          <Textarea value={formData.proposedSolution} onChange={e => handleInputChange('proposedSolution', e.target.value)} placeholder="Describe how AI will solve this problem..." rows={4} className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Label className="block text-lg font-semibold text-gray-700 mb-3">Current State</Label>
            <Textarea value={formData.currentState} onChange={e => handleInputChange('currentState', e.target.value)} placeholder="How is this handled today?" rows={3} className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
          </div>
          <div>
            <Label className="block text-lg font-semibold text-gray-700 mb-3">Desired State</Label>
            <Textarea value={formData.desiredState} onChange={e => handleInputChange('desiredState', e.target.value)} placeholder="What will the future state look like?" rows={3} className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
          </div>
        </div>
        <div>
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Primary Stakeholder</Label>
          <Input type="text" value={formData.primaryStakeholder} onChange={e => handleInputChange('primaryStakeholder', e.target.value)} placeholder="e.g., Customer Support Manager" className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
        </div>
        <ArrayInput label="Secondary Stakeholders" field="secondaryStakeholders" placeholder="Add stakeholder (press Enter or click +)" />
        <ArrayInput label="Success Criteria" field="successCriteria" placeholder="Add success criterion (press Enter or click +)" />
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <h2 className="text-2xl font-bold mb-4">Lean Business Case</h2>
      <p className="text-base text-gray-600 mb-8">Build a lightweight business case focusing on problem-solution fit and key assumptions.</p>
      <div className="grid grid-cols-1 gap-8">
        <div>
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Problem Validation</Label>
          <Textarea value={formData.problemValidation} onChange={e => handleInputChange('problemValidation', e.target.value)} placeholder="Describe how you validated the problem..." rows={4} className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
        </div>
        <div>
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Solution Hypothesis</Label>
          <Textarea value={formData.solutionHypothesis} onChange={e => handleInputChange('solutionHypothesis', e.target.value)} placeholder="Describe your solution hypothesis..." rows={4} className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
        </div>
        <div>
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Key Assumptions</Label>
          <ArrayInput label="Key Assumptions" field="keyAssumptions" placeholder="Add key assumption (press Enter or click +)" />
        </div>
        <div>
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Initial ROI</Label>
          <Input type="text" value={formData.initialROI} onChange={e => handleInputChange('initialROI', e.target.value)} placeholder="e.g., $100,000" className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
        </div>
        <div>
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Confidence Level</Label>
          <SliderInput label="Confidence Level" field="confidenceLevel" min={1} max={10} description="How confident are you in the business case?" />
        </div>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <h2 className="text-2xl font-bold mb-4">Multi-Dimensional Scoring</h2>
      <p className="text-base text-gray-600 mb-8">Quantify your use case across the three strategic dimensions.</p>
      <div className="grid grid-cols-1 gap-8">
        <div>
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Operational Score</Label>
          <SliderInput label="Operational Score" field="operationalScore" min={1} max={10} description="How operational is the solution?" />
        </div>
        <div>
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Productivity Score</Label>
          <SliderInput label="Productivity Score" field="productivityScore" min={1} max={10} description="How productive is the solution?" />
        </div>
        <div>
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Revenue Score</Label>
          <SliderInput label="Revenue Score" field="revenueScore" min={1} max={10} description="How much revenue does the solution generate?" />
        </div>
        <div>
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Complexity</Label>
          <SliderInput label="Complexity" field="complexity" min={1} max={10} description="How complex is the solution?" />
        </div>
        <div>
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Timeline</Label>
          <Input type="text" value={formData.timeline} onChange={e => handleInputChange('timeline', e.target.value)} placeholder="e.g., 12 months" className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
        </div>
        <div>
          <Label className="block text-lg font-semibold text-gray-700 mb-3">Resources</Label>
          <Input type="text" value={formData.resources} onChange={e => handleInputChange('resources', e.target.value)} placeholder="e.g., $100,000" className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
        </div>
      </div>
    </>
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
      <div className="w-full max-w-3xl mx-auto border border-gray-200 bg-white rounded-2xl shadow-lg px-8 py-10 mt-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl mb-8 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-purple-600 to-fuchsia-500 opacity-95" />
          <div className="relative z-10 p-4 sm:p-6 flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-white drop-shadow-lg mb-2 font-[var(--font-nunito)]">
              AI Use Case Refinement Tool
            </h1>
            <p className="text-lg text-white/80 font-normal drop-shadow-sm font-[var(--font-merriweather)]">
              Transform AI ideas into <span className="font-semibold text-white font-[var(--font-nunito)]">structured</span>, <span className="font-semibold text-white font-[var(--font-nunito)]">quantified</span> business opportunities
            </p>
          </div>
          <div className="absolute inset-0 backdrop-blur-[2px] rounded-3xl" />
        </div>
        {/* Stepper */}
        <div className='relative z-10 mb-8'>
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