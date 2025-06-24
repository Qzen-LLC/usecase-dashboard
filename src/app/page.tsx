'use client'
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Target, Users, TrendingUp, Zap, DollarSign, Save, Download, Plus, Minus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

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

const ArrayInput = ({
  label,
  field,
  value,
  onAdd,
  onRemove,
}: {
  label: string;
  field: keyof FormData;
  value: string[];
  onAdd: (field: keyof FormData, val: string) => void;
  onRemove: (field: keyof FormData, idx: number) => void;
}) => {
  const [inputVal, setInputVal] = useState("");

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onAdd(field, inputVal);
              setInputVal("");
            }
          }}
        />
        <Button
          type="button"
          onClick={() => {
            onAdd(field, inputVal);
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
            <Button variant="destructive" size="icon" onClick={() => onRemove(field, i)}>
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SliderInput = ({
  label,
  field,
  value,
  onChange,
  min = 1,
  max = 10,
}: {
  label: string;
  field: keyof FormData;
  value: number;
  onChange: (field: keyof FormData, val: number) => void;
  min?: number;
  max?: number;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Slider
      min={min}
      max={max}
      defaultValue={[value]}
      onValueChange={([val]) => onChange(field, val)}
    />
    <div className="text-sm text-muted-foreground">Current: {value}</div>
  </div>
);

type ArrayField = 'secondaryStakeholders' | 'successCriteria' | 'keyAssumptions';
type NumberField = 'confidenceLevel' | 'operationalScore' | 'productivityScore' | 'revenueScore' | 'complexity';

type StringField = Exclude<keyof FormData, ArrayField | NumberField>;

const AIUseCaseTool = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);


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
  const handleChange = (field: keyof FormData, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const ArrayInput: React.FC<ArrayInputProps> = ({ label, field, placeholder }) => {
    const [inputValue, setInputValue] = useState<string>('');
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
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
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <span className="text-lg font-semibold text-blue-600">{formData[field]}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={formData[field]}
        onChange={(e) => handleInputChange(field, parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>Low ({min})</span>
        <span>High ({max})</span>
      </div>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Use Case Documentation</h3>
        <p className="text-blue-700">Define and structure your AI use case with clear problem statements and success criteria.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
      <Card className="p-6 space-y-4">
        <Label htmlFor="title">Use Case Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />

        <Label htmlFor="problemStatement">Problem Statement</Label>
        <Textarea
          id="problemStatement"
          value={formData.problemStatement}
          onChange={(e) => handleChange("problemStatement", e.target.value)}
        />

        <Label htmlFor="proposedSolution">Proposed Solution</Label>
        <Textarea
          id="proposedSolution"
          value={formData.proposedSolution}
          onChange={(e) => handleChange("proposedSolution", e.target.value)}
        />

        <Label htmlFor="currentState">Current State</Label>
        <Textarea
          id="currentState"
          value={formData.currentState}
          onChange={(e) => handleChange("currentState", e.target.value)}
        />

        <Label htmlFor="desiredState">Desired State</Label>
        <Textarea
          id="desiredState"
          value={formData.desiredState}
          onChange={(e) => handleChange("desiredState", e.target.value)}
        />

        <Label htmlFor="primaryStakeholder">Primary Stakeholder</Label>
        <Input
          id="primaryStakeholder"
          value={formData.primaryStakeholder}
          onChange={(e) => handleChange("primaryStakeholder", e.target.value)}
        />

        <ArrayInput
          label="Secondary Stakeholders"
          field="secondaryStakeholders"
          value={formData.secondaryStakeholders}
          onAdd={handleArrayAdd}
          onRemove={handleArrayRemove}
        />

        <ArrayInput
          label="Success Criteria"
          field="successCriteria"
          value={formData.successCriteria}
          onAdd={handleArrayAdd}
          onRemove={handleArrayRemove}
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
        <Card className='p-6 space y-4'>
        <Label htmlFor="problemValidation">Problem Validation</Label>
        <Textarea
          id="problemValidation"
          value={formData.problemValidation}
          onChange={(e) => handleChange("problemValidation", e.target.value)}
        />

        <Label htmlFor="solutionHypothesis">Solution Hypothesis</Label>
        <Textarea
          id="solutionHypothesis"
          value={formData.solutionHypothesis}
          onChange={(e) => handleChange("solutionHypothesis", e.target.value)}
        />

        <ArrayInput
          label="Key Assumptions"
          field="keyAssumptions"
          value={formData.keyAssumptions}
          onAdd={handleArrayAdd}
          onRemove={handleArrayRemove}
        />

        <Label htmlFor="initialROI">Initial ROI</Label>
        <Input
          id="initialROI"
          value={formData.initialROI}
          onChange={(e) => handleChange("initialROI", e.target.value)}
        />

        <SliderInput
          label="Confidence Level"
          field="confidenceLevel"
          value={formData.confidenceLevel}
          onChange={handleChange}
        />
        <Label htmlFor="initialROI">Estimated Timeline</Label>
        <Input
          id="initialROI"
          value={formData.initialROI}
          onChange={(e) => handleChange("initialROI", e.target.value)}
        />
        <Label htmlFor="initialROI">Required Resources</Label>
        <Input
          id="initialROI"
          value={formData.initialROI}
          onChange={(e) => handleChange("initialROI", e.target.value)}
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
            {/* <h4 className="text-lg font-semibold text-orange-800">Operational Enhancers</h4> */}
            <Label htmlFor="initialROI" className='text-lg font-semibold text-orange-800'>Required Resources</Label>
          </div>
          <SliderInput
            label="Operational Impact Score"
            field="operationalScore"
            description="How much will this improve operational efficiency, reduce costs, or streamline processes?"
          />
        </div>

        <div className="bg-white p-6 rounded-lg border-2 border-pink-200">
          <div className="flex items-center mb-4">
            <Zap className="w-6 h-6 text-pink-500 mr-2" />
            <Label htmlFor="initialROI" className='text-lg font-semibold text-pink-800'>Productivity Driver</Label>
          </div>
          <SliderInput
            label="Productivity Impact Score"
            field="productivityScore"
            description="How significantly will this boost employee productivity or automate manual tasks?"
          />
        </div>

        <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
          <div className="flex items-center mb-4">
            <DollarSign className="w-6 h-6 text-blue-500 mr-2" />
            <Label htmlFor="initialROI" className='text-lg font-semibold text-blue-800'>Revenue Accelerators</Label>
          </div>
          <SliderInput
            label="Revenue Impact Score"
            field="revenueScore"
            description="What is the potential for direct revenue generation or customer value creation?"
          />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
        <Label htmlFor="initialROI" className='text-lg font-semibold text-gray-800'>Additional Metrics</Label>
          <SliderInput
            label="Implementation Complexity"
            field="complexity"
            description="How complex will this be to implement? (1 = Very Simple, 10 = Very Complex)"
          />
        </div>

        {/* Visual Summary */}
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

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-50 p-0 sm:p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden border-0 sm:border sm:mt-6 sm:mb-6 sm:mx-0 mx-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6">
          <h1 className="text-2xl font-bold mb-2">AI Use Case Refinement Tool</h1>
          <p className="text-blue-100">Transform AI ideas into structured, quantified business opportunities</p>
        </div>

        {/* Progress Steps */}
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

        {/* Content */}
        <div className="p-2 sm:p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 px-2 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <Button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={`flex items-center px-3 py-2 sm:px-4 rounded-md text-sm sm:text-base ${
              currentStep === 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <div className="flex flex-row space-x-2 w-full sm:w-auto justify-center">
            <Button
            onClick={exportData}
            className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
            </Button>
            <Button
            onClick={() => console.log('Saved:', formData)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          </div>

          <Button
            onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
            disabled={currentStep === 3}
            className={`flex items-center px-3 py-2 sm:px-4 rounded-md text-sm sm:text-base ${
              currentStep === 3 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIUseCaseTool;