'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Target, TrendingUp, Zap, DollarSign, Plus, Minus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

type FormData = {
  title: string;
  problemStatement: string;
  proposedAISolution: string;
  keyBenefits: string;
  primaryStakeholders: string[];
  secondaryStakeholders: string[];
  currentState: string;
  desiredState: string;
  successCriteria: string;
  problemValidation: string;
  solutionHypothesis: string;
  keyAssumptions: string;
  initialCost: string;
  initialROI: string;
  confidenceLevel: number;
  operationalImpactScore: number;
  productivityImpactScore: number;
  revenueImpactScore: number;
  implementationComplexity: number;
  plannedStartDate: string;
  estimatedTimelineMonths: string;
  requiredResources: string;
  businessFunction: string;
  priority: string;
};

const initialFormData: FormData = {
  title: "",
  problemStatement: "",
  proposedAISolution: "",
  keyBenefits: "",
  primaryStakeholders: [],
  secondaryStakeholders: [],
  currentState: "",
  desiredState: "",
  successCriteria: "",
  problemValidation: "",
  solutionHypothesis: "",
  keyAssumptions: "",
  initialCost: "",
  initialROI: "",
  confidenceLevel: 5,
  operationalImpactScore: 5,
  productivityImpactScore: 5,
  revenueImpactScore: 5,
  implementationComplexity: 5,
  plannedStartDate: "",
  estimatedTimelineMonths: "",
  requiredResources: "",
  businessFunction: "",
  priority: "MEDIUM",
};

type ArrayField = 'primaryStakeholders' | 'secondaryStakeholders';

const ArrayInput = ({
  label,
  field,
  value,
  onAdd,
  onRemove,
  invalid,
}: {
  label: string;
  field: keyof FormData;
  value: string[];
  onAdd: (field: ArrayField, val: string) => void;
  onRemove: (field: ArrayField, idx: number) => void;
  invalid?: boolean;
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

  const handleChange = (field: keyof FormData, val: string | number | string[]) => {
    console.log(`handleChange called for ${field}:`, val, 'Type:', typeof val, 'IsArray:', Array.isArray(val));
    
    // Special handling for successCriteria and keyAssumptions to ensure they're strings
    if (field === 'successCriteria' || field === 'keyAssumptions') {
      if (Array.isArray(val)) {
        console.warn(`${field} received array, converting to string:`, val);
        val = val.join(' ');
      }
      if (typeof val !== 'string') {
        console.warn(`${field} received non-string, converting to string:`, val);
        val = String(val);
      }
    }
    
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  // Only require title and problemStatement for initial add
  const validateForm = () => {
    const invalid: string[] = [];
    if (!formData.title.trim()) invalid.push('title');
    if (!formData.problemStatement.trim()) invalid.push('problemStatement');
    setInvalidFields(invalid);
    setShowError(invalid.length > 0);
    return invalid.length === 0;
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#f5eaff] via-[#fbeaff] to-[#ffeafd] p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] bg-clip-text text-transparent">Use Case Documentation</h3>
        <p className="text-[#8f4fff]">Define and structure your AI use case with clear problem statements and success criteria.</p>
      </div>
      <div className="grid grid-cols-1">
        <Card className="p-6">
          <Label htmlFor="title">Use Case Title <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className={invalidFields.includes('title') ? 'border-red-500' : ''}
          />
          <Label htmlFor="problemStatement">Problem Statement <span className="text-red-500">*</span></Label>
          <RichTextEditor
            content={formData.problemStatement}
            onChange={(content) => handleChange("problemStatement", content)}
            placeholder="Describe the problem this use case will solve..."
            className={invalidFields.includes('problemStatement') ? 'border-red-500' : ''}
          />
          <Label htmlFor="proposedAISolution">Proposed Solution</Label>
          <RichTextEditor
            content={formData.proposedAISolution}
            onChange={(content) => handleChange("proposedAISolution", content)}
            placeholder="Describe your proposed AI solution..."
            className={invalidFields.includes('proposedAISolution') ? 'border-red-500' : ''}
          />
          <Label htmlFor="keyBenefits">Key Benefits</Label>
          <RichTextEditor
            content={formData.keyBenefits}
            onChange={(content) => handleChange("keyBenefits", content)}
            placeholder="List the key benefits this solution will provide..."
            className={invalidFields.includes('keyBenefits') ? 'border-red-500' : ''}
          />
          <Label htmlFor="successCriteria">Success Criteria</Label>
          <RichTextEditor
            content={formData.successCriteria}
            onChange={(content) => handleChange("successCriteria", content)}
            placeholder="Define what success looks like for this use case..."
            className={invalidFields.includes('successCriteria') ? 'border-red-500' : ''}
          />
          <Label htmlFor="problemValidation">Problem Validation</Label>
          <RichTextEditor
            content={formData.problemValidation}
            onChange={(content) => handleChange("problemValidation", content)}
            placeholder="Describe how you've validated this problem exists..."
            className={invalidFields.includes('problemValidation') ? 'border-red-500' : ''}
          />
          <Label htmlFor="solutionHypothesis">Solution Hypothesis</Label>
          <RichTextEditor
            content={formData.solutionHypothesis}
            onChange={(content) => handleChange("solutionHypothesis", content)}
            placeholder="Describe your hypothesis for how this solution will work..."
            className={invalidFields.includes('solutionHypothesis') ? 'border-red-500' : ''}
          />
          {/* <Label htmlFor="primaryStakeholders">Primary Stakeholder</Label>
          <Input
            id="primaryStakeholders"
            value={formData.primaryStakeholders}
            onChange={(e) => handleChange("primaryStakeholders", e.target.value)}
            className={invalidFields.includes('primaryStakeholders') ? 'border-red-500' : ''}
          /> */}
          <Label htmlFor="businessFunction">Business Function</Label>
          <select
            id="businessFunction"
            value={formData.businessFunction}
            onChange={e => handleChange("businessFunction", e.target.value)}
            className={"mb-4 w-full border border-gray-200 rounded-none px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 " + (invalidFields.includes('businessFunction') ? 'border-red-500' : '')}
          >
            <option value="" disabled>Select a business function</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="Product Development">Product Development</option>
            <option value="Operations">Operations</option>
            <option value="Customer Support">Customer Support</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="IT">IT</option>
            <option value="Legal">Legal</option>
            <option value="Procurement">Procurement</option>
            <option value="Facilities">Facilities</option>
            <option value="Strategy">Strategy</option>
            <option value="Communications">Communications</option>
            <option value="Risk & Audit">Risk & Audit</option>
            <option value="Innovation Office">Innovation Office</option>
            <option value="ESG">ESG</option>
            <option value="Data Office">Data Office</option>
            <option value="PMO">PMO</option>
          </select>
          <ArrayInput
            label="Primary Stakeholders"
            field="primaryStakeholders"
            value={formData.primaryStakeholders}
            onAdd={handleArrayAdd}
            onRemove={handleArrayRemove}
            invalid={invalidFields.includes('primaryStakeholders')}
          />
          <ArrayInput
            label="Secondary Stakeholders"
            field="secondaryStakeholders"
            value={formData.secondaryStakeholders}
            onAdd={handleArrayAdd}
            onRemove={handleArrayRemove}
            invalid={invalidFields.includes('secondaryStakeholders')}
          />
        </Card>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#f5eaff] via-[#fbeaff] to-[#ffeafd] p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] bg-clip-text text-transparent">Lean Business Case</h3>
        <p className="text-[#b84fff]">Build a lightweight business case focusing on problem-solution fit and key assumptions.</p>
      </div>
      <div className="space-y-6">
        <Card className='p-6'>
          <Label htmlFor="keyAssumptions">Key Assumptions</Label>
          <RichTextEditor
            content={formData.keyAssumptions}
            onChange={(content) => handleChange("keyAssumptions", content)}
            placeholder="List your key assumptions for this use case..."
            className={invalidFields.includes('keyAssumptions') ? 'border-red-500' : ''}
          />
          <Label htmlFor="initialCost">Initial Cost</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
            <Input
              id="initialCost"
              value={formData.initialCost}
              onChange={(e) => handleChange("initialCost", e.target.value)}
              className={`pl-7 ${invalidFields.includes('initialCost') ? 'border-red-500' : ''}`}
              placeholder="0"
            />
          </div>
          <Label htmlFor="initialROI">Initial ROI</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
            <Input
              id="initialROI"
              value={formData.initialROI}
              onChange={(e) => handleChange("initialROI", e.target.value)}
              className={`pl-7 ${invalidFields.includes('initialROI') ? 'border-red-500' : ''}`}
              placeholder="0"
            />
          </div>
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
          <Label htmlFor="plannedStartDate">Planned Start Date</Label>
          <Input
            id="plannedStartDate"
            type="date"
            value={formData.plannedStartDate}
            onChange={(e) => handleChange("plannedStartDate", e.target.value)}
            className={invalidFields.includes('plannedStartDate') ? 'border-red-500' : ''}
          />
          <Label htmlFor="estimatedTimelineMonths">Estimated Timeline</Label>
          <select
            id="estimatedTimelineMonths"
            value={formData.estimatedTimelineMonths}
            onChange={e => handleChange("estimatedTimelineMonths", e.target.value)}
            className={"mb-4 w-full border border-gray-200 rounded-none px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 " + (invalidFields.includes('estimatedTimelineMonths') ? 'border-red-500' : '')}
          >
            <option value="" disabled>Select timeline</option>
            <option value="1">1 month</option>
            <option value="2">2 months</option>
            <option value="3">3 months</option>
            <option value="4">4 months</option>
            <option value="5">5 months</option>
            <option value="6">6 months</option>
            <option value="9">9 months</option>
            <option value="12">12 months</option>
            <option value="18">18 months</option>
            <option value="24">24 months</option>
            <option value="36">36 months</option>
          </select>
          <Label htmlFor="requiredResources">Required Resources</Label>
          <RichTextEditor
            content={formData.requiredResources}
            onChange={(content) => handleChange("requiredResources", content)}
            placeholder="List the required resources for this use case..."
            className={invalidFields.includes('requiredResources') ? 'border-red-500' : ''}
          />
        </Card>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#f5eaff] via-[#fbeaff] to-[#ffeafd] p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] bg-clip-text text-transparent">Multi-Dimensional Scoring</h3>
        <p className="text-[#8f4fff]">Quantify your use case across the three strategic dimensions.</p>
      </div>
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg border-2 border-orange-200">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-orange-500 mr-2" />
            <Label htmlFor="operationalImpactScore" className='text-lg font-semibold text-orange-800'>Operational Enhancers</Label>
          </div>
          <div className="space-y-4">
            <Label htmlFor="operationalImpactScore" className='text-sm font-normal text-gray-800 mb-2'>Operational Impact Score</Label>
            <div className="flex justify-between items-center mb-1">
              <span></span>
              <span className="text-blue-600 font-bold">{formData.operationalImpactScore}</span>
            </div>
            <Slider
              min={1}
              max={10}
              value={[formData.operationalImpactScore]}
              onValueChange={([val]) => handleChange("operationalImpactScore", val)}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
            <Label htmlFor="operationalImpactScore" className='text-sm font-normal text-gray-800 mb-4'>How much will this improve operational efficiency, reduce costs, or streamline processes?</Label>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border-2 border-pink-200">
          <div className="flex items-center mb-4">
            <Zap className="w-6 h-6 text-pink-500 mr-2" />
            <Label htmlFor="productivityImpactScore" className='text-lg font-semibold text-pink-800'>Productivity Driver</Label>
          </div>
          <div className="space-y-4">
            <Label htmlFor="productivityImpactScore" className='text-sm font-normal text-gray-800 mb-2'>Productivity Impact Score</Label>
            <div className="flex justify-between items-center mb-1">
              <span></span>
              <span className="text-blue-600 font-bold">{formData.productivityImpactScore}</span>
            </div>
            <Slider
              min={1}
              max={10}
              value={[formData.productivityImpactScore]}
              onValueChange={([val]) => handleChange("productivityImpactScore", val)}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
            <Label htmlFor="productivityImpactScore" className='text-sm font-normal text-gray-800 mb-4'>How significantly will this boost employee productivity or automate manual tasks?</Label>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
          <div className="flex items-center mb-4">
            <DollarSign className="w-6 h-6 text-blue-500 mr-2" />
            <Label htmlFor="revenueImpactScore" className='text-lg font-semibold text-blue-800'>Revenue Accelerators</Label>
          </div>
          <div className="space-y-4">
            <Label htmlFor="revenueImpactScore" className='text-sm font-normal text-gray-800 mb-2'>Revenue Impact Score</Label>
            <div className="flex justify-between items-center mb-1">
              <span></span>
              <span className="text-blue-600 font-bold">{formData.revenueImpactScore}</span>
            </div>
            <Slider
              min={1}
              max={10}
              value={[formData.revenueImpactScore]}
              onValueChange={([val]) => handleChange("revenueImpactScore", val)}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
            <Label htmlFor="revenueImpactScore" className='text-sm font-normal text-gray-800 mb-4'>What is the potential for direct revenue generation or customer value creation?</Label>
          </div>
        </div>
        <div className="bg-gray-75 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Label htmlFor="implementationComplexity" className='text-lg font-semibold text-black-800'>Additional Metrics</Label>
          </div>
          <div className="space-y-4">
            <Label htmlFor="implementationComplexity" className='text-sm font-normal text-gray-800 mb-2'>Implementation Complexity</Label>
            <div className="flex justify-between items-center mb-1">
              <span></span>
              <span className="text-blue-600 font-bold">{formData.implementationComplexity}</span>
            </div>
            <Slider
              min={1}
              max={10}
              value={[formData.implementationComplexity]}
              onValueChange={([val]) => handleChange("implementationComplexity", val)}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
            <Label htmlFor="implementationComplexity" className='text-sm font-normal text-gray-800 mb-4'>How complex will this be to implement? (1 = Very Simple, 10 = Very Complex)</Label>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Use Case Profile</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-orange-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{formData.operationalImpactScore}</div>
              <div className="text-sm text-orange-800">Operational</div>
            </div>
            <div className="bg-pink-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">{formData.productivityImpactScore}</div>
              <div className="text-sm text-pink-800">Productivity</div>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formData.revenueImpactScore}</div>
              <div className="text-sm text-blue-800">Revenue</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-lg font-semibold text-gray-700">
              Overall Score: {((formData.operationalImpactScore + formData.productivityImpactScore + formData.revenueImpactScore) / 3).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              implementationComplexity: {formData.implementationComplexity}/10
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleSave = async () => {
    // Only require title for saving (more lenient than full validation)
    if (!formData.title.trim()) {
      setInvalidFields(['title']);
      setShowError(true);
      alert("Please provide a title before saving.");
      return;
    }
    
    try {
      // Debug: Log the form data to see what's being sent
      console.log('Form data being sent:', {
        successCriteria: formData.successCriteria,
        keyAssumptions: formData.keyAssumptions,
        successCriteriaType: typeof formData.successCriteria,
        keyAssumptionsType: typeof formData.keyAssumptions,
        isSuccessCriteriaArray: Array.isArray(formData.successCriteria),
        isKeyAssumptionsArray: Array.isArray(formData.keyAssumptions)
      });
      
      // Map form data to match API expectations
      const apiData = {
        title: formData.title,
        problemStatement: formData.problemStatement,
        proposedAISolution: formData.proposedAISolution,
        currentState: formData.currentState || '',
        desiredState: formData.desiredState || '',
        primaryStakeholders: formData.primaryStakeholders,
        secondaryStakeholders: formData.secondaryStakeholders,
        successCriteria: formData.successCriteria,
        problemValidation: formData.problemValidation || '',
        solutionHypothesis: formData.solutionHypothesis || '',
        keyAssumptions: formData.keyAssumptions,
        initialROI: formData.initialROI,
        confidenceLevel: formData.confidenceLevel,
        operationalImpactScore: formData.operationalImpactScore,
        productivityImpactScore: formData.productivityImpactScore,
        revenueImpactScore: formData.revenueImpactScore,
        implementationComplexity: formData.implementationComplexity,
        estimatedTimeline: formData.estimatedTimelineMonths ? `${formData.estimatedTimelineMonths} months` : '',
        requiredResources: formData.requiredResources,
        businessFunction: formData.businessFunction || '',
        stage: 'discovery',
        priority: formData.priority,
      };

      console.log('API data being sent:', apiData);

      const res = await fetch("/api/write-usecases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });
      
      if (res.ok) {
        alert("Use case saved successfully!");
        router.push('/dashboard');
      } else {
        const errorData = await res.text();
        console.error("Save failed with status:", res.status);
        console.error("Error response:", errorData);
        alert(`Failed to save use case: ${res.status} - ${errorData}`);
      }
    } catch (error) {
      console.error("Unable to save Use Case:", error);
      alert("Unable to save Use Case. Please try again.");
    }
  };

  const handleGoToPipeline = async () => {
    if (validateForm()) {
      // Check if all fields (except id, createdAt, updatedAt) are filled
      const requiredFields = Object.keys(formData).filter(
        k => !['id','createdAt','updatedAt'].includes(k)
      );
      const allFilled = requiredFields.every(k => {
        const v = formData[k as keyof typeof formData];
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === 'string') return !!v.trim();
        if (typeof v === 'number') return v !== null && v !== undefined;
        return true;
      });
      const stage = allFilled ? 'business-case' : 'discovery';
      try {
        // Map form data to match API expectations
        const apiData = {
          title: formData.title,
          problemStatement: formData.problemStatement,
          proposedAISolution: formData.proposedAISolution,
          currentState: formData.currentState || '',
          desiredState: formData.desiredState || '',
          primaryStakeholders: formData.primaryStakeholders,
          secondaryStakeholders: formData.secondaryStakeholders,
          successCriteria: formData.successCriteria,
          problemValidation: formData.problemValidation || '',
          solutionHypothesis: formData.solutionHypothesis || '',
          keyAssumptions: formData.keyAssumptions,
          initialROI: formData.initialROI,
          confidenceLevel: formData.confidenceLevel,
          operationalImpactScore: formData.operationalImpactScore,
          productivityImpactScore: formData.productivityImpactScore,
          revenueImpactScore: formData.revenueImpactScore,
          implementationComplexity: formData.implementationComplexity,
          estimatedTimeline: formData.estimatedTimelineMonths ? `${formData.estimatedTimelineMonths} months` : '',
          requiredResources: formData.requiredResources,
          businessFunction: formData.businessFunction || '',
          stage,
          priority: formData.priority,
        };

        const res = await fetch("/api/write-usecases", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        alert("Failed to save use case. Please try again.");
      }
      } catch {
        console.error("Unable to submit Use Case")
        alert("Unable to submit Use Case. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-50 p-0 sm:p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden border-0 sm:border sm:mt-6 sm:mb-6 sm:mx-0 mx-0">
        <div className="bg-gray-100 px-2 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center mb-2 sm:mb-0 cursor-pointer group"
                onClick={() => setCurrentStep(step.id)}
                tabIndex={0}
                role="button"
                aria-label={`Go to ${step.title}`}
              >
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-150 ${
                  currentStep === step.id ? 'bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] text-white scale-110 shadow-lg' : currentStep > step.id ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                } group-hover:scale-110`}
                >
                  <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <div className={`text-xs sm:text-sm font-medium ${
                    currentStep === step.id ? 'text-[#8f4fff]' : currentStep > step.id ? 'text-blue-600' : 'text-gray-500'
                  } group-hover:text-[#b84fff]`}
                  >
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
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="flex items-center gap-2 border-gray-500 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="outline"
                className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50"
              >
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
                  className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white"
                >
                  Go to Pipeline
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentStep(prev => prev < steps.length ? prev + 1 : prev)}
                  className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white"
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