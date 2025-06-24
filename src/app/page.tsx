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
      <Label className="text-white">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className={`bg-[#23233a] text-white placeholder-[#e0cfff] focus:border-[#a259e6] focus:ring-[#a259e6] ${invalid ? 'border-red-500' : 'border-[#bdbdd7]'}`}
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
          className="bg-[#a259e6] hover:bg-[#d26be8] text-white"
        >
          <Plus className="w-4 h-4 text-white" />
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
      <div className="bg-[#23233a] p-4 rounded-lg border border-[#bdbdd7]">
        <h3 className="text-lg font-semibold text-[#d26be8] mb-2">Use Case Documentation</h3>
        <p className="text-[#e0cfff]">Define and structure your AI use case with clear problem statements and success criteria.</p>
      </div>
      <div className="grid grid-cols-1">
        <Card className="p-6 bg-[#18182c] border border-[#23233a]">
          <Label className="text-white" htmlFor="title">Use Case Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className={`bg-[#23233a] text-white placeholder-[#e0cfff] focus:border-[#a259e6] focus:ring-[#a259e6] ${invalidFields.includes('title') ? 'border-red-500' : 'border-[#bdbdd7]'}`}
            placeholder="e.g., Automated Customer Support Ticket Categorization"
          />
          <Label className="text-white" htmlFor="problemStatement">Problem Statement</Label>
          <Textarea
            id="problemStatement"
            value={formData.problemStatement}
            onChange={(e) => handleChange("problemStatement", e.target.value)}
            className={`bg-[#23233a] text-white placeholder-[#e0cfff] focus:border-[#a259e6] focus:ring-[#a259e6] ${invalidFields.includes('problemStatement') ? 'border-red-500' : 'border-[#bdbdd7]'}`}
            placeholder="e.g., Customer support agents spend 2 hours daily manually categorizing tickets, leading to delays and misrouting."
          />
          <Label className="text-white" htmlFor="proposedSolution">Proposed Solution</Label>
          <Textarea
            id="proposedSolution"
            value={formData.proposedSolution}
            onChange={(e) => handleChange("proposedSolution", e.target.value)}
            className={`bg-[#23233a] text-white placeholder-[#e0cfff] focus:border-[#a259e6] focus:ring-[#a259e6] ${invalidFields.includes('proposedSolution') ? 'border-red-500' : 'border-[#bdbdd7]'}`}
            placeholder="e.g., Implement an AI model that automatically categorizes incoming support tickets based on their content."
          />
          <Label className="text-white" htmlFor="currentState">Current State</Label>
          <Textarea
            id="currentState"
            value={formData.currentState}
            onChange={(e) => handleChange("currentState", e.target.value)}
            className={`bg-[#23233a] text-white placeholder-[#e0cfff] focus:border-[#a259e6] focus:ring-[#a259e6] ${invalidFields.includes('currentState') ? 'border-red-500' : 'border-[#bdbdd7]'}`}
            placeholder="e.g., Tickets are manually read and categorized by a team of 5 agents."
          />
          <Label className="text-white" htmlFor="desiredState">Desired State</Label>
          <Textarea
            id="desiredState"
            value={formData.desiredState}
            onChange={(e) => handleChange("desiredState", e.target.value)}
            className={`bg-[#23233a] text-white placeholder-[#e0cfff] focus:border-[#a259e6] focus:ring-[#a259e6] ${invalidFields.includes('desiredState') ? 'border-red-500' : 'border-[#bdbdd7]'}`}
            placeholder="e.g., 90% of tickets are automatically and accurately categorized within 1 minute of arrival."
          />
          <Label className="text-white" htmlFor="primaryStakeholder">Primary Stakeholder</Label>
          <Input
            id="primaryStakeholder"
            value={formData.primaryStakeholder}
            onChange={(e) => handleChange("primaryStakeholder", e.target.value)}
            className={`bg-[#23233a] text-white placeholder-[#e0cfff] focus:border-[#a259e6] focus:ring-[#a259e6] ${invalidFields.includes('primaryStakeholder') ? 'border-red-500' : 'border-[#bdbdd7]'}`}
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
      <div className="bg-[#23233a] p-4 rounded-lg border border-[#bdbdd7]">
        <h3 className="text-lg font-semibold text-[#5be6b9] mb-2">Lean Business Case</h3>
        <p className="text-[#e0cfff]">Build a lightweight business case focusing on problem-solution fit and key assumptions.</p>
      </div>
      <div className="space-y-6">
        <Card className='p-6 bg-[#18182c] border border-[#23233a]'>
          <Label className="text-white" htmlFor="problemValidation">Problem Validation</Label>
          <Textarea
            id="problemValidation"
            value={formData.problemValidation}
            onChange={(e) => handleChange("problemValidation", e.target.value)}
            className={`bg-[#23233a] text-white placeholder-[#e0cfff] focus:border-[#a259e6] focus:ring-[#a259e6] ${invalidFields.includes('problemValidation') ? 'border-red-500' : 'border-[#bdbdd7]'}`}
            placeholder="e.g., Conducted interviews with 5 support agents, 4 confirmed this is a major pain point."
          />
          <Label className="text-white" htmlFor="solutionHypothesis">Solution Hypothesis</Label>
          <Textarea
            id="solutionHypothesis"
            value={formData.solutionHypothesis}
            onChange={(e) => handleChange("solutionHypothesis", e.target.value)}
            className={`bg-[#23233a] text-white placeholder-[#e0cfff] focus:border-[#a259e6] focus:ring-[#a259e6] ${invalidFields.includes('solutionHypothesis') ? 'border-red-500' : 'border-[#bdbdd7]'}`}
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
          <Label className="text-white" htmlFor="initialROI">Initial ROI</Label>
          <Input
            id="initialROI"
            value={formData.initialROI}
            onChange={(e) => handleChange("initialROI", e.target.value)}
            className={`bg-[#23233a] text-white placeholder-[#e0cfff] focus:border-[#a259e6] focus:ring-[#a259e6] ${invalidFields.includes('initialROI') ? 'border-red-500' : 'border-[#bdbdd7]'}`}
            placeholder="e.g., Estimated $50,000 annual savings from reduced agent hours."
          />
          <div className="flex justify-between items-center mb-1">
            <Label className="text-white" htmlFor="confidenceLevel">Confidence Level</Label>
            <span className="text-blue-600 font-bold">{formData.confidenceLevel}</span>
          </div>
          <Slider
            min={1}
            max={10}
            value={[formData.confidenceLevel]}
            onValueChange={([val]) => handleChange("confidenceLevel", val)}
          />
          <div className='space-y-1'>
            <div className="flex justify-between text-xs text-[#bdbdd7] mt-1">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
            <Label htmlFor="confidenceLevel" className="text-white text-sm font-normal text-[#e0cfff]">How confident are you in your estimates?</Label>
          </div>
          <Label className="text-white" htmlFor="timeline">Estimated Timeline</Label>
          <Input
            id="timeline"
            value={formData.timeline}
            onChange={(e) => handleChange("timeline", e.target.value)}
            className={`bg-[#23233a] text-white placeholder-[#e0cfff] focus:border-[#a259e6] focus:ring-[#a259e6] ${invalidFields.includes('timeline') ? 'border-red-500' : 'border-[#bdbdd7]'}`}
            placeholder="e.g., 3 months"
          />
          <Label className="text-white" htmlFor="resources">Required Resources</Label>
          <Input
            id="resources"
            value={formData.resources}
            onChange={(e) => handleChange("resources", e.target.value)}
            className={`bg-[#23233a] text-white placeholder-[#e0cfff] focus:border-[#a259e6] focus:ring-[#a259e6] ${invalidFields.includes('resources') ? 'border-red-500' : 'border-[#bdbdd7]'}`}
            placeholder="e.g., 1 AI Engineer, 1 Product Manager, access to historical ticket data."
          />
        </Card>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-[#23233a] p-4 rounded-lg border border-[#bdbdd7]">
        <h3 className="text-lg font-semibold text-[#d26be8] mb-2">Multi-Dimensional Scoring</h3>
        <p className="text-[#e0cfff]">Quantify your use case across the three strategic dimensions.</p>
      </div>
      <div className="space-y-8">
        <div className="bg-[#18182c] p-6 rounded-lg border-2 border-[#d26be8]">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-[#d26be8] mr-2" />
            <Label htmlFor="operationalScore" className="text-white text-lg font-semibold text-[#d26be8]">Operational Enhancers</Label>
          </div>
          <div className="space-y-4">
            <Label htmlFor="operationalScore" className="text-white text-sm font-normal text-[#e0cfff] mb-2">Operational Impact Score</Label>
            <div className="flex justify-between items-center mb-1">
              <span></span>
              <span className="text-[#a259e6] font-bold">{formData.operationalScore}</span>
            </div>
            <Slider
              min={1}
              max={10}
              value={[formData.operationalScore]}
              onValueChange={([val]) => handleChange("operationalScore", val)}
            />
            <div className="flex justify-between text-xs text-[#bdbdd7] mt-1">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
            <Label htmlFor="operationalScore" className="text-white text-sm font-normal text-[#e0cfff] mb-4">How much will this improve operational efficiency, reduce costs, or streamline processes?</Label>
          </div>
        </div>
        <div className="bg-[#18182c] p-6 rounded-lg border-2 border-[#a259e6]">
          <div className="flex items-center mb-4">
            <Zap className="w-6 h-6 text-[#a259e6] mr-2" />
            <Label htmlFor="productivityScore" className="text-white text-lg font-semibold text-[#a259e6]">Productivity Driver</Label>
          </div>
          <div className="space-y-4">
            <Label htmlFor="productivityScore" className="text-white text-sm font-normal text-[#e0cfff] mb-2">Productivity Impact Score</Label>
            <div className="flex justify-between items-center mb-1">
              <span></span>
              <span className="text-[#d26be8] font-bold">{formData.productivityScore}</span>
            </div>
            <Slider
              min={1}
              max={10}
              value={[formData.productivityScore]}
              onValueChange={([val]) => handleChange("productivityScore", val)}
            />
            <div className="flex justify-between text-xs text-[#bdbdd7] mt-1">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
            <Label htmlFor="productivityScore" className="text-white text-sm font-normal text-[#e0cfff] mb-4">How significantly will this boost employee productivity or automate manual tasks?</Label>
          </div>
        </div>
        <div className="bg-[#18182c] p-6 rounded-lg border-2 border-[#5be6b9]">
          <div className="flex items-center mb-4">
            <DollarSign className="w-6 h-6 text-[#5be6b9] mr-2" />
            <Label htmlFor="revenueScore" className="text-white text-lg font-semibold text-[#5be6b9]">Revenue Accelerators</Label>
          </div>
          <div className="space-y-4">
            <Label htmlFor="revenueScore" className="text-white text-sm font-normal text-[#e0cfff] mb-2">Revenue Impact Score</Label>
            <div className="flex justify-between items-center mb-1">
              <span></span>
              <span className="text-[#5be6b9] font-bold">{formData.revenueScore}</span>
            </div>
            <Slider
              min={1}
              max={10}
              value={[formData.revenueScore]}
              onValueChange={([val]) => handleChange("revenueScore", val)}
            />
            <div className="flex justify-between text-xs text-[#bdbdd7] mt-1">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
            <Label htmlFor="revenueScore" className="text-white text-sm font-normal text-[#e0cfff] mb-4">What is the potential for direct revenue generation or customer value creation?</Label>
          </div>
        </div>
        <div className="bg-[#18182c] p-6 rounded-lg border-2 border-[#bdbdd7]">
          <div className="flex items-center mb-4">
            <Label htmlFor="complexity" className="text-white text-lg font-semibold text-[#e0cfff]">Additional Metrics</Label>
          </div>
          <div className="space-y-4">
            <Label htmlFor="complexity" className="text-white text-sm font-normal text-[#e0cfff] mb-2">Implementation Complexity</Label>
            <div className="flex justify-between items-center mb-1">
              <span></span>
              <span className="text-[#a259e6] font-bold">{formData.complexity}</span>
            </div>
            <Slider
              min={1}
              max={10}
              value={[formData.complexity]}
              onValueChange={([val]) => handleChange("complexity", val)}
            />
            <div className="flex justify-between text-xs text-[#bdbdd7] mt-1">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
            <Label htmlFor="complexity" className="text-white text-sm font-normal text-[#e0cfff] mb-4">How complex will this be to implement? (1 = Very Simple, 10 = Very Complex)</Label>
          </div>
        </div>
        <div className="bg-[#23233a] p-6 rounded-lg border-2 border-[#23233a]">
          <h4 className="text-lg font-semibold text-[#d26be8] mb-4">Use Case Profile</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-[#23233a] p-4 rounded-lg border border-[#d26be8]">
              <div className="text-2xl font-bold text-[#d26be8]">{formData.operationalScore}</div>
              <div className="text-sm text-[#e0cfff]">Operational</div>
            </div>
            <div className="bg-[#23233a] p-4 rounded-lg border border-[#a259e6]">
              <div className="text-2xl font-bold text-[#a259e6]">{formData.productivityScore}</div>
              <div className="text-sm text-[#e0cfff]">Productivity</div>
            </div>
            <div className="bg-[#23233a] p-4 rounded-lg border border-[#5be6b9]">
              <div className="text-2xl font-bold text-[#5be6b9]">{formData.revenueScore}</div>
              <div className="text-sm text-[#e0cfff]">Revenue</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-lg font-semibold text-[#e0cfff]">
              Overall Score: {((formData.operationalScore + formData.productivityScore + formData.revenueScore) / 3).toFixed(1)}
            </div>
            <div className="text-sm text-[#bdbdd7]">
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
    <div className="min-h-screen flex justify-center items-start bg-[#101024] p-0 sm:p-4">
      <div className="w-full max-w-4xl bg-[#23233a] rounded-2xl shadow-2xl border-4 border-[#a259e6] sm:mt-10 sm:mb-10 sm:mx-0 mx-0 relative z-10">
        {/* QZen AI Branding Header */}
        <div className="flex items-center gap-4 justify-center py-8 bg-[#18182c] rounded-t-2xl">
          <img src="https://blfsawovozyywndoiicu.supabase.co/storage/v1/object/sign/company/sharpened_logo_transparent.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MjUwODc5My03NTY4LTQ5ZWYtOTJlMS1lYmU4MmM1YTUwYzQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb21wYW55L3NoYXJwZW5lZF9sb2dvX3RyYW5zcGFyZW50LnBuZyIsImlhdCI6MTc1MDc4NTQ3NywiZXhwIjoxOTA4NDY1NDc3fQ.v6nh5VRRDin2cGatgU3yHbUweQEulxqEAupCj8Mbgeg" alt="QZen AI Logo" className="h-14 w-14 object-contain" />
          <span className="text-4xl font-extrabold bg-gradient-to-r from-[#5b5be6] via-[#a259e6] to-[#d26be8] bg-clip-text text-transparent font-sans">QZen AI</span>
        </div>
        <div className="w-full flex justify-center bg-[#18182c] rounded-b-2xl pb-4">
          <p className="text-[#e0cfff] text-lg text-center font-medium">Transform AI ideas into structured, quantified business opportunities</p>
        </div>
        <div className="bg-[#23233a] px-2 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center mb-2 sm:mb-0">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${
                  currentStep >= step.id ? 'bg-[#a259e6] text-white' : 'bg-[#18182c] text-[#bdbdd7] border border-[#bdbdd7]'
                }`}>
                  <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <div className={`text-xs sm:text-sm font-medium ${
                    currentStep >= step.id ? 'text-[#a259e6]' : 'text-[#bdbdd7]'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#bdbdd7] mx-2 sm:mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#18182c] border-t border-[#23233a]">
          <div className="p-6">
            {showError && (
              <div className="mb-4 text-[#ff6b6b] font-semibold">
                Please fill all required fields before proceeding.
              </div>
            )}
            <main>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </main>
          </div>
          <div className="flex justify-between items-center p-6 border-t border-[#23233a]">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentStep(prev => prev > 1 ? prev - 1 : prev)}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 bg-[#a259e6] hover:bg-[#d26be8] text-white ${currentStep === 1 ? 'invisible' : ''}`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                onClick={exportData}
                className="flex items-center gap-2 bg-[#a259e6] hover:bg-[#d26be8] text-black border-none shadow-md px-6 py-2 rounded-lg"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button
                onClick={() => console.log('Saved:', formData)}
                className="flex items-center gap-2 bg-[#5be6b9] hover:bg-[#3ad29f] text-black border-none shadow-md px-6 py-2 rounded-lg"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-[#bdbdd7]">
                Step {currentStep} of {steps.length}
              </div>
              {currentStep === steps.length ? (
                <Button
                  onClick={handleGoToPipeline}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-[#5be6b9] hover:bg-[#3ad29f] text-[#101024]"
                >
                  {isSubmitting ? 'Submitting...' : 'Go to Pipeline'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentStep(prev => prev < steps.length ? prev + 1 : prev)}
                  className="flex items-center gap-2 bg-[#d26be8] hover:bg-[#a259e6] text-white"
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