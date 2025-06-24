'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  onAdd: (field: ArrayField, val: string) => void;
  onRemove: (field: ArrayField, idx: number) => void;
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
  const router = useRouter();


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

  const handleChange = (field: keyof FormData, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

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
            value={formData.operationalScore}
            onChange={handleChange}
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
            value={formData.productivityScore}
            onChange={handleChange}
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
            value={formData.revenueScore}
            onChange={handleChange}
          />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
        <Label htmlFor="initialROI" className='text-lg font-semibold text-gray-800'>Additional Metrics</Label>
          <SliderInput
            label="Implementation Complexity"
            field="complexity"
            value={formData.complexity}
            onChange={handleChange}
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
        <div className="bg-white border-t border-gray-200">
          <div className="p-6">
            <main>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </main>
          </div>
          {/* Navigation */}
          <div className="flex justify-between items-center p-6 border-t">
            {/* Left Group */}
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

            {/* Right Group */}
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-500">
                Step {currentStep} of {steps.length}
              </div>
              {currentStep === steps.length ? (
                <Button
                  onClick={() => router.push('/dashboard-test')}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                >
                  Go to Pipeline
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