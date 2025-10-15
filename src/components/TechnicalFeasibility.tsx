import React from 'react';
import {
  Checkbox
} from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Brain, Server, Plug, Shield as ShieldIcon, GitBranch, Database, Wrench, Sparkles } from 'lucide-react';

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

// --- Gen AI/LLM Specific Options ---
const MODEL_PROVIDERS = [
  "OpenAI",
  "Anthropic",
  "Google (Vertex AI)",
  "AWS Bedrock",
  "Azure OpenAI",
  "Cohere",
  "Meta (Llama)",
  "Mistral AI",
  "Hugging Face",
  "Self-hosted",
  "Custom/Proprietary",
];

const SPECIFIC_MODELS = [
  "GPT-4",
  "GPT-4 Turbo",
  "GPT-3.5 Turbo",
  "Claude 3 Opus",
  "Claude 3 Sonnet",
  "Claude 3 Haiku",
  "Gemini Pro",
  "Gemini Ultra",
  "Llama 2",
  "Llama 3",
  "Mistral Large",
  "Custom Fine-tuned",
];

const CONTEXT_WINDOWS = [
  "< 4K tokens",
  "4K - 16K tokens",
  "16K - 32K tokens",
  "32K - 128K tokens",
  "> 128K tokens",
];

const MULTIMODAL_CAPABILITIES = [
  "Text only",
  "Text + Vision",
  "Text + Audio",
  "Text + Code",
  "Text + Video",
  "Text + Documents",
  "All modalities",
];

const RESPONSE_FORMATS = [
  "Streaming",
  "Batch",
  "Async/Webhooks",
  "Real-time",
  "Cached responses",
];

// --- Prompt Engineering Options ---
const PROMPT_ENGINEERING_REQS = [
  "Zero-shot prompting",
  "Few-shot examples",
  "Chain of thought",
  "Role-based prompting",
  "Structured output formats",
  "Dynamic prompt templates",
  "Context injection",
  "Prompt chaining",
  "Self-consistency checking",
  "Constitutional AI prompting",
];

// --- Agent Architecture Options ---
const AGENT_PATTERNS = [
  "Single agent",
  "Multi-agent collaborative",
  "Hierarchical agents",
  "Competitive agents",
  "Agent swarm",
];

const AGENT_AUTONOMY = [
  "Reactive (responds only)",
  "Proactive (suggests)",
  "Semi-autonomous (confirms)",
  "Fully autonomous",
];

const MEMORY_TYPES = [
  "Short-term conversation",
  "Long-term user memory",
  "Episodic memory",
  "Semantic memory",
  "Working memory",
  "Vector memory",
];

const ORCHESTRATION_PATTERNS = [
  "Linear/Sequential",
  "Branching/Conditional",
  "Loop-based",
  "Event-driven",
  "Dynamic/Adaptive",
];

// --- RAG & Knowledge System Options ---
const VECTOR_DATABASES = [
  "Pinecone",
  "Weaviate",
  "Qdrant",
  "Chroma",
  "pgvector",
  "Elasticsearch",
  "Milvus",
  "FAISS",
  "Custom",
];

const EMBEDDING_MODELS = [
  "OpenAI Ada",
  "OpenAI Text-3",
  "Cohere Embed",
  "Sentence Transformers",
  "BGE Models",
  "Custom embeddings",
];

const CHUNKING_STRATEGIES = [
  "Fixed size",
  "Semantic chunking",
  "Sentence-based",
  "Paragraph-based",
  "Document-based",
  "Custom strategy",
];

const RETRIEVAL_STRATEGIES = [
  "Similarity search",
  "Hybrid search",
  "Re-ranking",
  "MMR (Max Marginal Relevance)",
  "Semantic + Keyword",
  "Graph-based",
];

// --- Agent Tools & Functions ---
const TOOL_CATEGORIES = [
  "Database access",
  "API calls",
  "File system ops",
  "Code execution",
  "Web browsing",
  "Email/messaging",
  "Calendar/scheduling",
  "Document processing",
  "Data analysis",
  "Image generation",
];

const TOOL_AUTH = [
  "OAuth",
  "API keys",
  "Service accounts",
  "Managed identity",
  "Token-based",
  "Certificate-based",
];

const EXECUTION_ENV = [
  "Sandboxed",
  "Containerized",
  "Serverless",
  "Direct access",
  "Isolated VM",
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
    // Gen AI/LLM fields
    modelProviders?: string[];
    specificModels?: string[];
    contextWindow?: string;
    avgInputTokens?: number;
    avgOutputTokens?: number;
    expectedRequestsPerDay?: number;
    multimodalCapabilities?: string[];
    responseFormats?: string[];
    promptEngineeringReqs?: string[];
    // Agent Architecture fields
    agentPattern?: string;
    agentAutonomy?: string;
    memoryTypes?: string[];
    orchestrationPattern?: string;
    stateManagement?: string;
    // RAG & Knowledge fields
    vectorDatabases?: string[];
    embeddingModel?: string;
    embeddingDimensions?: number;
    chunkingStrategy?: string;
    retrievalStrategies?: string[];
    knowledgeUpdateFreq?: string;
    // Agent Tools fields
    toolCategories?: string[];
    toolAuth?: string[];
    executionEnv?: string;
    toolApprovalProcess?: string;
  };
  onChange: (data: Props['value']) => void;
};

export default function TechnicalFeasibility({ value, onChange }: Props) {
  // Helper for multi-select checkboxes
  function handleMultiSelectChange(field: keyof Props['value'], v: string) {
    const arr = (value[field] as string[]) || [];
    if (arr.includes(v)) {
      onChange({ ...value, [field]: arr.filter((x) => x !== v) });
    } else {
      onChange({ ...value, [field]: [...arr, v] });
    }
  }

  // Check if Gen AI or LLM is selected to show additional sections
  const isGenAISelected = value.modelTypes?.includes("Generative AI") || 
                          value.modelTypes?.includes("Large Language Model (LLM)") ||
                          value.modelTypes?.includes("Multi-modal Models");

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
                  <Checkbox checked={value.modelTypes?.includes(type) || false} onCheckedChange={() => handleMultiSelectChange('modelTypes', type)} />
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
                  <Checkbox checked={value.modelSizes?.includes(size) || false} onCheckedChange={() => handleMultiSelectChange('modelSizes', size)} />
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
                  <Checkbox checked={value.deploymentModels?.includes(model) || false} onCheckedChange={() => handleMultiSelectChange('deploymentModels', model)} />
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
                  <Checkbox checked={value.cloudProviders?.includes(provider) || false} onCheckedChange={() => handleMultiSelectChange('cloudProviders', provider)} />
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
                  <Checkbox checked={value.computeRequirements?.includes(req) || false} onCheckedChange={() => handleMultiSelectChange('computeRequirements', req)} />
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
                  <Checkbox checked={value.integrationPoints?.includes(point) || false} onCheckedChange={() => handleMultiSelectChange('integrationPoints', point)} />
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
                  <Checkbox checked={value.apiSpecs?.includes(api) || false} onCheckedChange={() => handleMultiSelectChange('apiSpecs', api)} />
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
                  <Checkbox checked={value.authMethods?.includes(auth) || false} onCheckedChange={() => handleMultiSelectChange('authMethods', auth)} />
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
                  <Checkbox checked={value.encryptionStandards?.includes(enc) || false} onCheckedChange={() => handleMultiSelectChange('encryptionStandards', enc)} />
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
                  <Checkbox checked={value.outputTypes?.includes(type) || false} onCheckedChange={() => handleMultiSelectChange('outputTypes', type)} />
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

      {/* Conditionally show Gen AI sections when LLM or Generative AI is selected */}
      {isGenAISelected && (
        <>
          {/* LLM/Foundation Model Configuration Section */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="border-b border-border pb-4 mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-500" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">LLM/Foundation Model Configuration</h3>
                  <p className="text-sm text-muted-foreground">Configure large language model providers, models, and token requirements</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <Label className="block font-medium mb-4 text-foreground">Model Providers</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MODEL_PROVIDERS.map((provider) => (
                    <Label key={provider} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <Checkbox 
                        checked={value.modelProviders?.includes(provider) || false} 
                        onCheckedChange={() => handleMultiSelectChange('modelProviders', provider)} 
                      />
                      <span className="text-sm text-foreground">{provider}</span>
                    </Label>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="block font-medium mb-4 text-foreground">Specific Models</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SPECIFIC_MODELS.map((model) => (
                    <Label key={model} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <Checkbox 
                        checked={value.specificModels?.includes(model) || false} 
                        onCheckedChange={() => handleMultiSelectChange('specificModels', model)} 
                      />
                      <span className="text-sm text-foreground">{model}</span>
                    </Label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block font-medium mb-4 text-foreground">Context Window Requirements</Label>
                <RadioGroup 
                  value={value.contextWindow || ''} 
                  onValueChange={(newValue) => onChange({ ...value, contextWindow: newValue })} 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
                >
                  {CONTEXT_WINDOWS.map((window) => (
                    <Label key={window} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <RadioGroupItem value={window} />
                      <span className="text-sm text-foreground">{window}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="block font-medium mb-2 text-foreground">Avg Input Tokens/Request</Label>
                  <Input 
                    type="number" 
                    value={value.avgInputTokens || ''} 
                    min={0}
                    onChange={(e) => onChange({ ...value, avgInputTokens: Math.max(0, parseInt(e.target.value) || 0) })}
                    placeholder="e.g., 500"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="block font-medium mb-2 text-foreground">Avg Output Tokens/Request</Label>
                  <Input 
                    type="number" 
                    value={value.avgOutputTokens || ''} 
                    min={0}
                    onChange={(e) => onChange({ ...value, avgOutputTokens: Math.max(0, parseInt(e.target.value) || 0) })}
                    placeholder="e.g., 1000"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="block font-medium mb-2 text-foreground">Expected Requests/Day</Label>
                  <Input 
                    type="number" 
                    value={value.expectedRequestsPerDay || ''} 
                    min={0}
                    onChange={(e) => onChange({ ...value, expectedRequestsPerDay: Math.max(0, parseInt(e.target.value) || 0) })}
                    placeholder="e.g., 10000"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label className="block font-medium mb-4 text-foreground">Multimodal Capabilities</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MULTIMODAL_CAPABILITIES.map((capability) => (
                    <Label key={capability} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <Checkbox 
                        checked={value.multimodalCapabilities?.includes(capability) || false} 
                        onCheckedChange={() => handleMultiSelectChange('multimodalCapabilities', capability)} 
                      />
                      <span className="text-sm text-foreground">{capability}</span>
                    </Label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block font-medium mb-4 text-foreground">Response Formats</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {RESPONSE_FORMATS.map((format) => (
                    <Label key={format} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <Checkbox 
                        checked={value.responseFormats?.includes(format) || false} 
                        onCheckedChange={() => handleMultiSelectChange('responseFormats', format)} 
                      />
                      <span className="text-sm text-foreground">{format}</span>
                    </Label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block font-medium mb-4 text-foreground">Prompt Engineering Requirements</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PROMPT_ENGINEERING_REQS.map((req) => (
                    <Label key={req} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <Checkbox 
                        checked={value.promptEngineeringReqs?.includes(req) || false} 
                        onCheckedChange={() => handleMultiSelectChange('promptEngineeringReqs', req)} 
                      />
                      <span className="text-sm text-foreground">{req}</span>
                    </Label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Agent Architecture & Orchestration Section */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="border-b border-border pb-4 mb-6">
              <div className="flex items-center gap-3">
                <GitBranch className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Agent Architecture & Orchestration</h3>
                  <p className="text-sm text-muted-foreground">Define agent patterns, autonomy levels, and orchestration strategies</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <Label className="block font-medium mb-4 text-foreground">Agent Pattern</Label>
                <RadioGroup 
                  value={value.agentPattern || ''} 
                  onValueChange={(newValue) => onChange({ ...value, agentPattern: newValue })} 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
                >
                  {AGENT_PATTERNS.map((pattern) => (
                    <Label key={pattern} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <RadioGroupItem value={pattern} />
                      <span className="text-sm text-foreground">{pattern}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="block font-medium mb-4 text-foreground">Agent Autonomy Level</Label>
                <RadioGroup 
                  value={value.agentAutonomy || ''} 
                  onValueChange={(newValue) => onChange({ ...value, agentAutonomy: newValue })} 
                  className="grid grid-cols-1 md:grid-cols-2 gap-2"
                >
                  {AGENT_AUTONOMY.map((level) => (
                    <Label key={level} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <RadioGroupItem value={level} />
                      <span className="text-sm text-foreground">{level}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="block font-medium mb-4 text-foreground">Memory Requirements</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MEMORY_TYPES.map((memory) => (
                    <Label key={memory} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <Checkbox 
                        checked={value.memoryTypes?.includes(memory) || false} 
                        onCheckedChange={() => handleMultiSelectChange('memoryTypes', memory)} 
                      />
                      <span className="text-sm text-foreground">{memory}</span>
                    </Label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block font-medium mb-4 text-foreground">Orchestration Pattern</Label>
                <RadioGroup 
                  value={value.orchestrationPattern || ''} 
                  onValueChange={(newValue) => onChange({ ...value, orchestrationPattern: newValue })} 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
                >
                  {ORCHESTRATION_PATTERNS.map((pattern) => (
                    <Label key={pattern} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <RadioGroupItem value={pattern} />
                      <span className="text-sm text-foreground">{pattern}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="block font-medium mb-4 text-foreground">State Management</Label>
                <RadioGroup 
                  value={value.stateManagement || ''} 
                  onValueChange={(newValue) => onChange({ ...value, stateManagement: newValue })} 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
                >
                  {["Stateless", "Session-based", "Persistent", "Distributed"].map((state) => (
                    <Label key={state} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <RadioGroupItem value={state} />
                      <span className="text-sm text-foreground">{state}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* RAG & Knowledge Systems Section */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="border-b border-border pb-4 mb-6">
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">RAG & Knowledge Systems</h3>
                  <p className="text-sm text-muted-foreground">Configure retrieval-augmented generation and knowledge management</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <Label className="block font-medium mb-4 text-foreground">Vector Databases</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {VECTOR_DATABASES.map((db) => (
                    <Label key={db} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <Checkbox 
                        checked={value.vectorDatabases?.includes(db) || false} 
                        onCheckedChange={() => handleMultiSelectChange('vectorDatabases', db)} 
                      />
                      <span className="text-sm text-foreground">{db}</span>
                    </Label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="block font-medium mb-4 text-foreground">Embedding Model</Label>
                  <RadioGroup 
                    value={value.embeddingModel || ''} 
                    onValueChange={(newValue) => onChange({ ...value, embeddingModel: newValue })} 
                    className="space-y-2"
                  >
                    {EMBEDDING_MODELS.map((model) => (
                      <Label key={model} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                        <RadioGroupItem value={model} />
                        <span className="text-sm text-foreground">{model}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="block font-medium mb-2 text-foreground">Embedding Dimensions</Label>
                  <Input 
                    type="number" 
                    value={value.embeddingDimensions || ''} 
                    onChange={(e) => onChange({ ...value, embeddingDimensions: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 1536"
                    className="w-full mb-4"
                  />

                  <Label className="block font-medium mb-4 text-foreground">Chunking Strategy</Label>
                  <RadioGroup 
                    value={value.chunkingStrategy || ''} 
                    onValueChange={(newValue) => onChange({ ...value, chunkingStrategy: newValue })} 
                    className="space-y-2"
                  >
                    {CHUNKING_STRATEGIES.map((strategy) => (
                      <Label key={strategy} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                        <RadioGroupItem value={strategy} />
                        <span className="text-sm text-foreground">{strategy}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <div>
                <Label className="block font-medium mb-4 text-foreground">Retrieval Strategies</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {RETRIEVAL_STRATEGIES.map((strategy) => (
                    <Label key={strategy} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <Checkbox 
                        checked={value.retrievalStrategies?.includes(strategy) || false} 
                        onCheckedChange={() => handleMultiSelectChange('retrievalStrategies', strategy)} 
                      />
                      <span className="text-sm text-foreground">{strategy}</span>
                    </Label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block font-medium mb-4 text-foreground">Knowledge Update Frequency</Label>
                <RadioGroup 
                  value={value.knowledgeUpdateFreq || ''} 
                  onValueChange={(newValue) => onChange({ ...value, knowledgeUpdateFreq: newValue })} 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
                >
                  {["Real-time", "Daily", "Weekly", "Monthly", "On-demand"].map((freq) => (
                    <Label key={freq} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <RadioGroupItem value={freq} />
                      <span className="text-sm text-foreground">{freq}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Agent Tools & Functions Section */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="border-b border-border pb-4 mb-6">
              <div className="flex items-center gap-3">
                <Wrench className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Agent Tools & Functions</h3>
                  <p className="text-sm text-muted-foreground">Configure tool access, authentication, and execution environment</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <Label className="block font-medium mb-4 text-foreground">Tool Categories</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {TOOL_CATEGORIES.map((category) => (
                    <Label key={category} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <Checkbox 
                        checked={value.toolCategories?.includes(category) || false} 
                        onCheckedChange={() => handleMultiSelectChange('toolCategories', category)} 
                      />
                      <span className="text-sm text-foreground">{category}</span>
                    </Label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block font-medium mb-4 text-foreground">Tool Authentication Methods</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {TOOL_AUTH.map((auth) => (
                    <Label key={auth} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <Checkbox 
                        checked={value.toolAuth?.includes(auth) || false} 
                        onCheckedChange={() => handleMultiSelectChange('toolAuth', auth)} 
                      />
                      <span className="text-sm text-foreground">{auth}</span>
                    </Label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block font-medium mb-4 text-foreground">Execution Environment</Label>
                <RadioGroup 
                  value={value.executionEnv || ''} 
                  onValueChange={(newValue) => onChange({ ...value, executionEnv: newValue })} 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
                >
                  {EXECUTION_ENV.map((env) => (
                    <Label key={env} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <RadioGroupItem value={env} />
                      <span className="text-sm text-foreground">{env}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="block font-medium mb-4 text-foreground">Tool Approval Process</Label>
                <RadioGroup 
                  value={value.toolApprovalProcess || ''} 
                  onValueChange={(newValue) => onChange({ ...value, toolApprovalProcess: newValue })} 
                  className="grid grid-cols-1 md:grid-cols-2 gap-2"
                >
                  {["Pre-approved only", "Runtime approval", "Human confirmation", "Unrestricted"].map((process) => (
                    <Label key={process} className="flex items-center gap-2 hover:bg-accent rounded p-2 border border-border cursor-pointer transition">
                      <RadioGroupItem value={process} />
                      <span className="text-sm text-foreground">{process}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 