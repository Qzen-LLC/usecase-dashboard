import React from 'react';
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
    <div className="space-y-10">
      {/* Assessment Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 border-l-4 border-primary p-4 mb-8 rounded-2xl flex items-center gap-3 shadow-md">
        <div className="font-semibold text-foreground text-lg mb-1">Technical Feasibility Assessment</div>
        <div className="text-muted-foreground">Evaluate the technical requirements and constraints for implementing this AI solution.</div>
      </div>

      {/* Technical Complexity Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Technical Complexity</h3>
              <p className="text-sm text-muted-foreground">Assess the overall technical complexity of the AI solution</p>
            </div>
          </div>
        </div>
        
        <div>
          <Label className="block font-medium mb-4 text-foreground">Technical Complexity Level</Label>
          <div className="flex items-center w-full">
            <span className="text-muted-foreground text-sm mr-4">Simple</span>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[value.technicalComplexity]}
              onValueChange={([val]) => onChange({ ...value, technicalComplexity: val })}
              className="w-full"
            />
            <span className="text-muted-foreground text-sm ml-4">Complex</span>
            <span className="ml-6 px-4 py-2 bg-primary/10 text-primary rounded-full font-semibold text-sm">{value.technicalComplexity}</span>
          </div>
        </div>
      </div>

      {/* AI/ML Model Specifications Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">AI/ML Model Specifications</h3>
              <p className="text-sm text-muted-foreground">Define the type and characteristics of the AI/ML models to be used</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <Label className="block font-medium mb-4 text-foreground">Model Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {MODEL_TYPES.map((type) => (
                <Label key={type} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <Checkbox checked={value.modelTypes.includes(type)} onCheckedChange={() => handleMultiSelectChange('modelTypes', type)} />
                  <span className="text-sm text-foreground">{type}</span>
                </Label>
              ))}
            </div>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Model Size/Complexity</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {MODEL_SIZES.map((size) => (
                <Label key={size} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <Checkbox checked={value.modelSizes.includes(size)} onCheckedChange={() => handleMultiSelectChange('modelSizes', size)} />
                  <span className="text-sm text-foreground">{size}</span>
                </Label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Infrastructure & Deployment Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6 text-success" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Infrastructure & Deployment</h3>
              <p className="text-sm text-muted-foreground">Define deployment models, cloud providers, and compute requirements</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <Label className="block font-medium mb-4 text-foreground">Deployment Model</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {DEPLOYMENT_MODELS.map((model) => (
                <Label key={model} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <Checkbox checked={value.deploymentModels.includes(model)} onCheckedChange={() => handleMultiSelectChange('deploymentModels', model)} />
                  <span className="text-sm text-foreground">{model}</span>
                </Label>
              ))}
            </div>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Cloud Providers</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {CLOUD_PROVIDERS.map((provider) => (
                <Label key={provider} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <Checkbox checked={value.cloudProviders.includes(provider)} onCheckedChange={() => handleMultiSelectChange('cloudProviders', provider)} />
                  <span className="text-sm text-foreground">{provider}</span>
                </Label>
              ))}
            </div>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Compute Requirements</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {COMPUTE_REQUIREMENTS.map((req) => (
                <Label key={req} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <Checkbox checked={value.computeRequirements.includes(req)} onCheckedChange={() => handleMultiSelectChange('computeRequirements', req)} />
                  <span className="text-sm text-foreground">{req}</span>
                </Label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Integration Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Plug className="w-6 h-6 text-warning" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">System Integration</h3>
              <p className="text-sm text-muted-foreground">Define integration points and API specifications for system connectivity</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <Label className="block font-medium mb-4 text-foreground">Integration Points</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {INTEGRATION_POINTS.map((point) => (
                <Label key={point} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <Checkbox checked={value.integrationPoints.includes(point)} onCheckedChange={() => handleMultiSelectChange('integrationPoints', point)} />
                  <span className="text-sm text-foreground">{point}</span>
                </Label>
              ))}
            </div>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">API Specifications</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {API_SPECS.map((api) => (
                <Label key={api} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <Checkbox checked={value.apiSpecs.includes(api)} onCheckedChange={() => handleMultiSelectChange('apiSpecs', api)} />
                  <span className="text-sm text-foreground">{api}</span>
                </Label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security Architecture Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <ShieldIcon className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Security Architecture</h3>
              <p className="text-sm text-muted-foreground">Define authentication methods and encryption standards for security</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <Label className="block font-medium mb-4 text-foreground">Authentication Methods</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {AUTH_METHODS.map((auth) => (
                <Label key={auth} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <Checkbox checked={value.authMethods.includes(auth)} onCheckedChange={() => handleMultiSelectChange('authMethods', auth)} />
                  <span className="text-sm text-foreground">{auth}</span>
                </Label>
              ))}
            </div>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Encryption Standards</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ENCRYPTION_STANDARDS.map((enc) => (
                <Label key={enc} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <Checkbox checked={value.encryptionStandards.includes(enc)} onCheckedChange={() => handleMultiSelectChange('encryptionStandards', enc)} />
                  <span className="text-sm text-foreground">{enc}</span>
                </Label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Output Characteristics Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">AI Output Characteristics</h3>
              <p className="text-sm text-muted-foreground">Define output types, confidence scores, and model update frequency</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <Label className="block font-medium mb-4 text-foreground">Output Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {OUTPUT_TYPES.map((type) => (
                <Label key={type} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <Checkbox checked={value.outputTypes.includes(type)} onCheckedChange={() => handleMultiSelectChange('outputTypes', type)} />
                  <span className="text-sm text-foreground">{type}</span>
                </Label>
              ))}
            </div>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Confidence Scores</Label>
            <RadioGroup value={value.confidenceScore} onValueChange={(newValue) => onChange({ ...value, confidenceScore: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {CONFIDENCE_SCORES.map((score) => (
                <Label key={score} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <RadioGroupItem value={score} />
                  <span className="text-sm text-foreground">{score}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="block font-medium mb-4 text-foreground">Model Update Frequency</Label>
            <RadioGroup value={value.modelUpdateFrequency} onValueChange={(newValue) => onChange({ ...value, modelUpdateFrequency: newValue })} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {MODEL_UPDATE_FREQUENCY.map((freq) => (
                <Label key={freq} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                  <RadioGroupItem value={freq} />
                  <span className="text-sm text-foreground">{freq}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
} 