'use client';
import React, { useState } from 'react';
import { Shield, Users, FileText, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PolicyCenterPage() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 'responsible-ai', label: 'Responsible & Ethical AI', icon: Shield },
    { id: 'responsible-use', label: 'Responsible Use Policy', icon: Users }
  ];

  const renderResponsibleAI = () => (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="card-standard p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-primary/20 p-3 rounded-xl">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Responsible & Ethical AI Framework</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our comprehensive framework ensures that all AI systems developed and deployed within our organization 
              adhere to the highest standards of responsibility, ethics, and transparency. This framework is designed 
              to guide decision-making processes and ensure compliance with both internal policies and external regulations.
            </p>
          </div>
        </div>
      </div>

      {/* Core Principles */}
      <div className="grid-cards">
        <div className="card-standard p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-success/20 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Transparency</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            All AI systems must provide clear explanations of their decision-making processes and be open about 
            their capabilities and limitations. Users should understand how and why decisions are made.
          </p>
        </div>

        <div className="card-standard p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Accountability</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Clear lines of responsibility must be established for AI system outcomes. Human oversight and 
            intervention capabilities must be maintained for critical decision-making processes.
          </p>
        </div>

        <div className="card-standard p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-accent/20 p-2 rounded-lg">
              <Users className="w-5 h-5 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Fairness</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            AI systems must be designed and tested to avoid bias and discrimination. Regular audits should 
            be conducted to ensure equitable treatment across all user groups and demographics.
          </p>
        </div>
      </div>

      {/* Implementation Guidelines */}
      <div className="card-standard p-8">
        <h3 className="text-xl font-bold text-foreground mb-6">Implementation Guidelines</h3>
        <div className="space-y-6">
          <div className="border-l-4 border-primary pl-6">
            <h4 className="font-semibold text-foreground mb-2">1. Pre-Development Assessment</h4>
            <ul className="text-muted-foreground text-sm space-y-2">
              <li>• Conduct thorough risk assessments before AI system development</li>
              <li>• Evaluate potential impacts on stakeholders and society</li>
              <li>• Define clear success metrics and failure modes</li>
            </ul>
          </div>

          <div className="border-l-4 border-success pl-6">
            <h4 className="font-semibold text-foreground mb-2">2. Development Phase</h4>
            <ul className="text-muted-foreground text-sm space-y-2">
              <li>• Implement bias detection and mitigation strategies</li>
              <li>• Ensure data quality and representativeness</li>
              <li>• Build explainability and interpretability features</li>
            </ul>
          </div>

          <div className="border-l-4 border-accent pl-6">
            <h4 className="font-semibold text-foreground mb-2">3. Deployment & Monitoring</h4>
            <ul className="text-muted-foreground text-sm space-y-2">
              <li>• Establish continuous monitoring and evaluation systems</li>
              <li>• Implement feedback mechanisms for users and stakeholders</li>
              <li>• Maintain human oversight for critical decisions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Compliance Requirements */}
      <div className="card-standard p-8">
        <h3 className="text-xl font-bold text-foreground mb-6">Compliance Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-medium text-foreground">GDPR Compliance</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-medium text-foreground">EU AI Act Alignment</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-medium text-foreground">ISO 42001 Standards</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-medium text-foreground">Industry Best Practices</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-medium text-foreground">Internal Audit Requirements</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-medium text-foreground">Stakeholder Reporting</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResponsibleUse = () => (
    <div className="space-y-8">
      {/* Policy Overview */}
      <div className="card-standard p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-success/20 p-3 rounded-xl">
            <FileText className="w-8 h-8 text-success" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Responsible Use Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              This policy establishes guidelines for the responsible use of AI technologies within our organization. 
              It ensures that AI systems are used ethically, safely, and in compliance with all applicable laws 
              and regulations while maximizing their potential benefits.
            </p>
          </div>
        </div>
      </div>

      {/* Key Principles */}
      <div className="grid-cards">
        <div className="card-standard p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Human-Centric Design</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            AI systems should augment human capabilities rather than replace them. Human oversight and 
            decision-making authority must be maintained for critical functions.
          </p>
        </div>

        <div className="card-standard p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-warning/20 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Risk Management</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Comprehensive risk assessments must be conducted for all AI applications. Mitigation strategies 
            should be developed and regularly reviewed to address identified risks.
          </p>
        </div>

        <div className="card-standard p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-accent/20 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Privacy Protection</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            All AI systems must comply with data protection regulations and implement appropriate security 
            measures to protect user privacy and sensitive information.
          </p>
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className="card-standard p-8">
        <h3 className="text-xl font-bold text-foreground mb-6">Usage Guidelines</h3>
        <div className="space-y-6">
          <div className="border-l-4 border-primary pl-6">
            <h4 className="font-semibold text-foreground mb-2">Approved Use Cases</h4>
            <ul className="text-muted-foreground text-sm space-y-2">
              <li>• Process automation and optimization</li>
              <li>• Data analysis and insights generation</li>
              <li>• Customer service and support enhancement</li>
              <li>• Predictive analytics for business planning</li>
            </ul>
          </div>

          <div className="border-l-4 border-destructive pl-6">
            <h4 className="font-semibold text-foreground mb-2">Prohibited Use Cases</h4>
            <ul className="text-muted-foreground text-sm space-y-2">
              <li>• Automated decision-making without human oversight</li>
              <li>• Biometric identification without consent</li>
              <li>• Social scoring or behavioral manipulation</li>
              <li>• Surveillance without proper authorization</li>
            </ul>
          </div>

          <div className="border-l-4 border-success pl-6">
            <h4 className="font-semibold text-foreground mb-2">Required Safeguards</h4>
            <ul className="text-muted-foreground text-sm space-y-2">
              <li>• Regular performance monitoring and evaluation</li>
              <li>• Bias detection and mitigation procedures</li>
              <li>• Incident response and reporting protocols</li>
              <li>• User feedback and complaint mechanisms</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Training Requirements */}
      <div className="card-standard p-8">
        <h3 className="text-xl font-bold text-foreground mb-6">Training & Awareness</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-foreground mb-3">Required Training</h4>
            <ul className="text-muted-foreground text-sm space-y-2">
              <li>• AI ethics and responsible use principles</li>
              <li>• Data privacy and security best practices</li>
              <li>• Bias detection and mitigation techniques</li>
              <li>• Incident reporting and response procedures</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Ongoing Education</h4>
            <ul className="text-muted-foreground text-sm space-y-2">
              <li>• Regular policy updates and refresher courses</li>
              <li>• Industry best practices and emerging trends</li>
              <li>• Case studies and lessons learned</li>
              <li>• Compliance monitoring and reporting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-layout">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          
          <p className="page-description">
            Our AI Policy Center serves as the central hub for understanding and implementing responsible artificial intelligence practices within our organization. 
            This comprehensive resource provides guidance on ethical AI development, responsible use policies, and compliance with global AI governance frameworks.
          </p>
          <p className="page-description mt-3">
            As AI technologies continue to evolve, it's crucial to establish clear policies that promote transparency, accountability, and fairness while ensuring 
            the protection of privacy and human rights. Our policies align with international standards and best practices to create a trustworthy AI ecosystem.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(index)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === index
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="content-spacing">
          {activeTab === 0 ? renderResponsibleAI() : renderResponsibleUse()}
        </div>
      </div>
    </div>
  );
}