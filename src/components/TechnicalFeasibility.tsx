import React, { useEffect } from 'react';
import isEqual from 'lodash.isequal';
import {
  Checkbox
} from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Brain, Server, Plug, Shield as ShieldIcon } from 'lucide-react';

// --- New options for technical complexity fields ---
const MODEL_TYPES = [
  "Large Language Model (LLM)",
  "Computer Vision",
  "Natural Language Processing",
  "Time Series Forecasting",
  "Recommendation System",
  "Classification",
  "Regression",
  "Clustering",
  "Anomaly Detection",
  "Reinforcement Learning",
  "Generative AI",
  "Multi-modal Models",
  "Custom/Proprietary",
];
const MODEL_SIZES = [
  "< 1M parameters",
  "1M - 100M parameters",
  "100M - 1B parameters",
  "1B - 10B parameters",
  "10B - 100B parameters",
  "> 100B parameters",
];
const DEPLOYMENT_MODELS = [
  "Public Cloud",
  "Private Cloud",
  "Hybrid Cloud",
  "On-premise",
  "Edge Computing",
  "Distributed/Federated",
  "Multi-cloud",
];
const CLOUD_PROVIDERS = [
  "AWS",
  "Azure",
  "Google Cloud",
  "IBM Cloud",
  "Oracle Cloud",
  "Alibaba Cloud",
  "Other Regional Providers",
];
const COMPUTE_REQUIREMENTS = [
  "CPU only",
  "GPU required",
  "TPU required",
  "Specialized hardware",
  "Quantum computing",
];
const INTEGRATION_POINTS = [
  "ERP Systems (SAP, Oracle, etc.)",
  "CRM Systems (Salesforce, etc.)",
  "Payment Systems",
  "Banking/Financial Systems",
  "Healthcare Systems (EHR/EMR)",
  "Supply Chain Systems",
  "HR Systems",
  "Marketing Platforms",
  "Communication Systems",
  "IoT Platforms",
  "Data Warehouses",
  "Business Intelligence Tools",
  "Custom Applications",
  "Legacy Systems",
];
const API_SPECS = [
  "No API",
  "Internal API only",
  "Partner API",
  "Public API",
  "GraphQL",
  "REST",
  "gRPC",
  "WebSocket",
  "Message Queue",
];
const AUTH_METHODS = [
  "Username/Password",
  "Multi-factor Authentication",
  "SSO/SAML",
  "OAuth",
  "API Keys",
  "Certificate-based",
  "Biometric",
  "Token-based",
  "Zero Trust",
];
const ENCRYPTION_STANDARDS = [
  "TLS 1.3",
  "AES-256",
  "End-to-end Encryption",
  "Homomorphic Encryption",
  "At-rest Encryption",
  "In-transit Encryption",
  "Key Management System",
];
const OUTPUT_TYPES = [
  "Predictions/Scores",
  "Classifications",
  "Recommendations",
  "Generated Content",
  "Automated Actions",
  "Insights/Analytics",
];
const CONFIDENCE_SCORES = [
  "Not Provided",
  "Binary (Yes/No)",
  "Percentage/Probability",
  "Multi-level Categories",
  "Detailed Explanations",
];

const MODEL_UPDATE_FREQUENCY = [
  "Annual",
  "Quarterly",
  "Monthly",
  "Weekly",
  "Daily",
  "Real-time/Continuous",
];

type Props = {
  value: {
    modelTypes: string[];
    modelSizes: string[];
    deploymentModels: string[];
    cloudProviders: string[];
    computeRequirements: string[];
    integrationPoints: string[];
    apiSpecs: string[];
    authMethods: string[];
    encryptionStandards: string[];
    technicalComplexity: number;
    outputTypes: string[];
    confidenceScore: string;
    modelUpdateFrequency: string;
  };
  onChange: (data: Props['value']) => void;
};

export default function TechnicalFeasibility({ value, onChange }: Props) {
  // Helper for multi-select checkboxes
  function handleMultiSelectChange(field: keyof Props['value'], v: string) {
    const arr = value[field] as string[];
    if (arr.includes(v)) {
      onChange({ ...value, [field]: arr.filter((x) => x !== v) });
    } else {
      onChange({ ...value, [field]: [...arr, v] });
    }
  }

  return (
    <div className="space-y-8">
      {/* Assessment Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-lg">
        <div className="font-semibold text-blue-800 text-lg mb-1">Technical Feasibility Assessment</div>
        <div className="text-blue-700">Evaluate the technical requirements and constraints for implementing this AI solution.</div>
      </div>

      {/* Technical Complexity Slider */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 mb-2">
          <Brain className="w-6 h-6 text-blue-500" />
          <CardTitle>Technical Complexity</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="block font-medium mb-1">Technical Complexity</Label>
          <div className="flex items-center w-full">
            <span className="text-gray-500 text-sm mr-2">Simple</span>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[value.technicalComplexity]}
              onValueChange={([val]) => onChange({ ...value, technicalComplexity: val })}
              className="w-full"
            />
            <span className="text-gray-500 text-sm ml-2">Complex</span>
            <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">{value.technicalComplexity}</span>
          </div>
        </CardContent>
      </Card>

      {/* AI/ML Model Specifications */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 mb-2">
          <Brain className="w-6 h-6 text-blue-500" />
          <CardTitle>AI/ML Model Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="block font-medium mb-1">Model Type</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {MODEL_TYPES.map((type) => (
              <Label key={type} className="flex items-center gap-1 hover:bg-blue-50 rounded px-1 py-0.5 cursor-pointer transition">
                <Checkbox checked={value.modelTypes.includes(type)} onCheckedChange={() => handleMultiSelectChange('modelTypes', type)} />
                <span className="text-sm">{type}</span>
              </Label>
            ))}
          </div>
          <Label className="block font-medium mb-1">Model Size/Complexity</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {MODEL_SIZES.map((size) => (
              <Label key={size} className="flex items-center gap-1 hover:bg-blue-50 rounded px-1 py-0.5 cursor-pointer transition">
                <Checkbox checked={value.modelSizes.includes(size)} onCheckedChange={() => handleMultiSelectChange('modelSizes', size)} />
                <span className="text-sm">{size}</span>
              </Label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Infrastructure & Deployment */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 mb-2">
          <Server className="w-6 h-6 text-green-500" />
          <CardTitle>Infrastructure & Deployment</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="block font-medium mb-1">Deployment Model</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {DEPLOYMENT_MODELS.map((model) => (
              <Label key={model} className="flex items-center gap-1 hover:bg-green-50 rounded px-1 py-0.5 cursor-pointer transition">
                <Checkbox checked={value.deploymentModels.includes(model)} onCheckedChange={() => handleMultiSelectChange('deploymentModels', model)} />
                <span className="text-sm">{model}</span>
              </Label>
            ))}
          </div>
          <Label className="block font-medium mb-1">Cloud Providers</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {CLOUD_PROVIDERS.map((provider) => (
              <Label key={provider} className="flex items-center gap-1 hover:bg-green-50 rounded px-1 py-0.5 cursor-pointer transition">
                <Checkbox checked={value.cloudProviders.includes(provider)} onCheckedChange={() => handleMultiSelectChange('cloudProviders', provider)} />
                <span className="text-sm">{provider}</span>
              </Label>
            ))}
          </div>
          <Label className="block font-medium mb-1">Compute Requirements</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {COMPUTE_REQUIREMENTS.map((req) => (
              <Label key={req} className="flex items-center gap-1 hover:bg-green-50 rounded px-1 py-0.5 cursor-pointer transition">
                <Checkbox checked={value.computeRequirements.includes(req)} onCheckedChange={() => handleMultiSelectChange('computeRequirements', req)} />
                <span className="text-sm">{req}</span>
              </Label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Integration */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 mb-2">
          <Plug className="w-6 h-6 text-orange-500" />
          <CardTitle>System Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="block font-medium mb-1">Integration Points</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {INTEGRATION_POINTS.map((point) => (
              <Label key={point} className="flex items-center gap-1 hover:bg-orange-50 rounded px-1 py-0.5 cursor-pointer transition">
                <Checkbox checked={value.integrationPoints.includes(point)} onCheckedChange={() => handleMultiSelectChange('integrationPoints', point)} />
                <span className="text-sm">{point}</span>
              </Label>
            ))}
          </div>
          <Label className="block font-medium mb-1">API Specifications</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {API_SPECS.map((api) => (
              <Label key={api} className="flex items-center gap-1 hover:bg-orange-50 rounded px-1 py-0.5 cursor-pointer transition">
                <Checkbox checked={value.apiSpecs.includes(api)} onCheckedChange={() => handleMultiSelectChange('apiSpecs', api)} />
                <span className="text-sm">{api}</span>
              </Label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Architecture */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 mb-2">
          <ShieldIcon className="w-6 h-6 text-purple-500" />
          <CardTitle>Security Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="block font-medium mb-1">Authentication Methods</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {AUTH_METHODS.map((auth) => (
              <Label key={auth} className="flex items-center gap-1 hover:bg-purple-50 rounded px-1 py-0.5 cursor-pointer transition">
                <Checkbox checked={value.authMethods.includes(auth)} onCheckedChange={() => handleMultiSelectChange('authMethods', auth)} />
                <span className="text-sm">{auth}</span>
              </Label>
            ))}
          </div>
          <Label className="block font-medium mb-1">Encryption Standards</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {ENCRYPTION_STANDARDS.map((enc) => (
              <Label key={enc} className="flex items-center gap-1 hover:bg-purple-50 rounded px-1 py-0.5 cursor-pointer transition">
                <Checkbox checked={value.encryptionStandards.includes(enc)} onCheckedChange={() => handleMultiSelectChange('encryptionStandards', enc)} />
                <span className="text-sm">{enc}</span>
              </Label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Output Characteristics */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 mb-2">
          <Brain className="w-6 h-6 text-cyan-500" />
          <CardTitle>AI Output Characteristics</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="block font-medium mb-1">Output Type</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {OUTPUT_TYPES.map((type) => (
              <Label key={type} className="flex items-center gap-1 hover:bg-cyan-50 rounded px-1 py-0.5 cursor-pointer transition">
                <Checkbox checked={value.outputTypes.includes(type)} onCheckedChange={() => handleMultiSelectChange('outputTypes', type)} />
                <span className="text-sm">{type}</span>
              </Label>
            ))}
          </div>
          <Label className="block font-medium mb-1">Confidence Scores</Label>
          <div className="mb-4">
          <RadioGroup value={value.confidenceScore} onValueChange={(newValue) => onChange({ ...value, confidenceScore: newValue })} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {CONFIDENCE_SCORES.map((score) => (
              <Label key={score} className="flex items-center gap-2 cursor-pointer ">
                <RadioGroupItem value={score} />
                <span className="text-sm">{score}</span>
              </Label>
            ))}
          </RadioGroup>
          </div>
          <Label className="block font-medium mb-1">Model Update Frequency</Label>
          <RadioGroup value={value.modelUpdateFrequency} onValueChange={(newValue) => onChange({ ...value, modelUpdateFrequency: newValue })} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {MODEL_UPDATE_FREQUENCY.map((freq) => (
              <Label key={freq} className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value={freq} />
                <span className="text-sm">{freq}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
} 