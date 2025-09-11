import React, { useEffect, useState } from 'react';
import {
  Checkbox
} from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Brain, Server, Plug, Shield as ShieldIcon, Check } from 'lucide-react';
import { PrismaClient, QuestionType } from '@/generated/prisma';
import { CheckboxGroup } from './questionComps/checkboxQuestion';
import { RadioGroupQuestion } from './questionComps/radioQuestion';

// --- New options for technical complexity fields ---
// const MODEL_TYPES = [
//   "Large Language Model (LLM)",
//   "Computer Vision",
//   "Natural Language Processing",
//   "Time Series Forecasting",
//   "Recommendation System",
//   "Classification",
//   "Regression",
//   "Clustering",
//   "Anomaly Detection",
//   "Reinforcement Learning",
//   "Generative AI",
//   "Multi-modal Models",
//   "Custom/Proprietary",
// ];
// const MODEL_SIZES = [
//   "< 1M parameters",
//   "1M - 100M parameters",
//   "100M - 1B parameters",
//   "1B - 10B parameters",
//   "10B - 100B parameters",
//   "> 100B parameters",
// ];
// const DEPLOYMENT_MODELS = [
//   "Public Cloud",
//   "Private Cloud",
//   "Hybrid Cloud",
//   "On-premise",
//   "Edge Computing",
//   "Distributed/Federated",
//   "Multi-cloud",
// ];
// const CLOUD_PROVIDERS = [
//   "AWS",
//   "Azure",
//   "Google Cloud",
//   "IBM Cloud",
//   "Oracle Cloud",
//   "Alibaba Cloud",
//   "Other Regional Providers",
// ];
// const COMPUTE_REQUIREMENTS = [
//   "CPU only",
//   "GPU required",
//   "TPU required",
//   "Specialized hardware",
//   "Quantum computing",
// ];
// const INTEGRATION_POINTS = [
//   "ERP Systems (SAP, Oracle, etc.)",
//   "CRM Systems (Salesforce, etc.)",
//   "Payment Systems",
//   "Banking/Financial Systems",
//   "Healthcare Systems (EHR/EMR)",
//   "Supply Chain Systems",
//   "HR Systems",
//   "Marketing Platforms",
//   "Communication Systems",
//   "IoT Platforms",
//   "Data Warehouses",
//   "Business Intelligence Tools",
//   "Custom Applications",
//   "Legacy Systems",
// ];
// const API_SPECS = [
//   "No API",
//   "Internal API only",
//   "Partner API",
//   "Public API",
//   "GraphQL",
//   "REST",
//   "gRPC",
//   "WebSocket",
//   "Message Queue",
// ];
// const AUTH_METHODS = [
//   "Username/Password",
//   "Multi-factor Authentication",
//   "SSO/SAML",
//   "OAuth",
//   "API Keys",
//   "Certificate-based",
//   "Biometric",
//   "Token-based",
//   "Zero Trust",
// ];
// const ENCRYPTION_STANDARDS = [
//   "TLS 1.3",
//   "AES-256",
//   "End-to-end Encryption",
//   "Homomorphic Encryption",
//   "At-rest Encryption",
//   "In-transit Encryption",
//   "Key Management System",
// ];
// const OUTPUT_TYPES = [
//   "Predictions/Scores",
//   "Classifications",
//   "Recommendations",
//   "Generated Content",
//   "Automated Actions",
//   "Insights/Analytics",
// ];
// const CONFIDENCE_SCORES = [
//   "Not Provided",
//   "Binary (Yes/No)",
//   "Percentage/Probability",
//   "Multi-level Categories",
//   "Detailed Explanations",
// ];

// const MODEL_UPDATE_FREQUENCY = [
//   "Annual",
//   "Quarterly",
//   "Monthly",
//   "Weekly",
//   "Daily",
//   "Real-time/Continuous",
// ];

interface QnAProps {
  id: string,
  text: string,
  type: QuestionType,
  options: OptionProps[],
  answers: AnswerProps[], // This will now contain all answers for the question
}

interface OptionProps {
  id: string,
  text: string,
  questionId: string,
}

interface AnswerProps {
  id: string;        
  value: string;     
  questionId: string;
}

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
  questions: QnAProps[];
  questionsLoading: boolean;
  questionAnswers: Record<string, AnswerProps[]>;
  onAnswerChange: (questionId: string, answers: AnswerProps[]) => void;
};

export default function TechnicalFeasibility({ value, onChange, questions, questionsLoading, questionAnswers, onAnswerChange }: Props) {
  // Handler for checkbox changes
  const handleCheckboxChange = (questionId: string, newAnswers: AnswerProps[]) => {
    console.log('Checkbox changed for question:', questionId, newAnswers);
    
    // Call the parent's answer change handler
    onAnswerChange(questionId, newAnswers);
  };

  // Handler for radio changes
  const handleRadioChange = (questionId: string, newAnswer: AnswerProps | null) => {
    console.log('Radio changed for question:', questionId, newAnswer);
    
    // Convert single answer to array format for consistency
    const answers = newAnswer ? [newAnswer] : [];
    onAnswerChange(questionId, answers);
  };

  return (
    <div className="space-y-10">
      {/* Assessment Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 border-l-4 border-primary p-4 mb-8 rounded-2xl flex items-center gap-3 shadow-md">
        <div className="font-semibold text-foreground text-lg mb-1">Technical Feasibility Assessment</div>
        <div className="text-muted-foreground">Evaluate the technical requirements and constraints for implementing this AI solution.</div>
      </div>
      
      {questionsLoading || !questions ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading questions...</span>
        </div>
      ) : (
        questions.map((q) => {
          // Get current answers from questionAnswers state, fallback to original answers
          const currentAnswers = questionAnswers[q.id] || q.answers || [];
          
          console.log(`Question ${q.id} answers:`, currentAnswers); // Debug log
          
          if (q.type === QuestionType.CHECKBOX) {
            return (
              <CheckboxGroup
                key={q.id}
                label={q.text}
                options={q.options}
                checkedOptions={currentAnswers}
                onChange={(newAnswers) => handleCheckboxChange(q.id, newAnswers)}
              />
            );
          } else if (q.type === QuestionType.RADIO) {
            // For radio questions, we expect only one answer
            const checkedOption = currentAnswers.length > 0 ? currentAnswers[0] : null;
            
            return (
              <RadioGroupQuestion
                key={q.id}
                label={q.text}
                options={q.options}
                checkedOption={checkedOption}
                onChange={(newAnswer) => handleRadioChange(q.id, newAnswer)}
              />
            );
          }
          
          return null;
        })
      )}
    </div>
  );
} 