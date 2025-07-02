'use client';

import React, { useState } from 'react';
import { BookOpen, Shield, Users, Globe, CheckCircle, AlertTriangle, Info, ExternalLink } from 'lucide-react';

export default function PolicyCenterPage() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 'responsible-ai', label: 'Responsible & Ethical AI', icon: Shield },
    { id: 'responsible-use', label: 'Responsible Use Policy', icon: Users }
  ];

  const responsibleAIContent = {
    principles: [
      {
        title: 'Trustworthy AI',
        description: 'Promoting the development and use of AI systems that are reliable, safe, and secure.',
        details: 'AI systems must undergo rigorous testing and validation to ensure they operate safely in production environments. This includes implementing robust error handling, monitoring systems, and maintaining system reliability standards.',
        icon: Shield
      },
      {
        title: 'Transparency and Explainability',
        description: 'Ensuring that the decision-making processes of AI systems are understandable and can be explained.',
        details: 'AI systems should provide clear explanations for their decisions, especially in critical applications. Users must understand how and why specific outcomes are reached.',
        icon: Info
      },
      {
        title: 'Accountability',
        description: 'Establishing clear responsibility for the actions and outcomes of AI systems.',
        details: 'Clear ownership and responsibility chains must be established for AI system decisions and outcomes. This includes defining roles for AI system operators, developers, and decision-makers.',
        icon: CheckCircle
      },
      {
        title: 'Bias and Fairness',
        description: 'Identifying and mitigating biases in AI algorithms and data to ensure equitable outcomes.',
        details: 'Regular bias audits must be conducted on AI systems, with particular attention to protected characteristics and demographic groups. Mitigation strategies must be implemented when biases are identified.',
        icon: Users
      },
      {
        title: 'Data Privacy and Security',
        description: 'Protecting personal data used by AI systems and implementing strong cybersecurity measures.',
        details: 'All AI systems must comply with applicable data protection regulations and implement strong encryption, access controls, and data minimization principles.',
        icon: Shield
      }
    ],
    frameworks: [
      {
        name: 'EU AI Act',
        description: 'A comprehensive legislation that regulates AI systems based on their potential risk, categorizing them into unacceptable, high, limited, and minimal risk.',
        category: 'Regulatory Framework',
        region: 'European Union',
        link: '#'
      },
      {
        name: 'NIST AI Risk Management Framework (USA)',
        description: 'Provides voluntary guidelines for organizations to build trustworthy AI systems, outlining four core functions: Govern, Map, Measure, and Manage.',
        category: 'Risk Management',
        region: 'United States',
        link: '#'
      },
      {
        name: 'OECD AI Principles',
        description: 'The first intergovernmental standard on AI, promoting innovative and trustworthy AI that respects human rights and democratic values.',
        category: 'International Standard',
        region: 'Global',
        link: '#'
      },
      {
        name: 'Blueprint for an AI Bill of Rights (USA)',
        description: 'Outlines principles to guide the design, use, and deployment of automated systems to protect public rights, including algorithmic discrimination protections and data privacy.',
        category: 'Civil Rights',
        region: 'United States',
        link: '#'
      },
      {
        name: 'UNESCO Recommendation on the Ethics of Artificial Intelligence',
        description: 'The first global standard on AI ethics, focusing on human rights, dignity, transparency, and fairness.',
        category: 'Ethics Framework',
        region: 'Global',
        link: '#'
      }
    ]
  };

  const responsibleUseContent = {
    policies: [
      {
        title: 'Acceptable Use of AI Tools',
        description: 'Defining how employees can and cannot use AI in their work.',
        guidelines: [
          'AI tools may be used to enhance productivity and decision-making within approved business contexts',
          'AI-generated content must be reviewed and verified by qualified personnel before use',
          'AI tools should not be used as a substitute for human judgment in critical decisions',
          'Users must disclose when AI tools have been used in the creation of work products'
        ]
      },
      {
        title: 'Data Privacy and Security',
        description: 'Guidelines for handling data with AI tools, including restrictions on sharing confidential or personal information.',
        guidelines: [
          'No confidential, proprietary, or personally identifiable information should be input into public AI systems',
          'All data used with AI tools must comply with applicable privacy regulations',
          'Data retention and deletion policies must be followed for all AI-processed information',
          'Regular security assessments must be conducted on AI tools and their data handling practices'
        ]
      },
      {
        title: 'Addressing Bias and Fairness',
        description: 'Policies to identify and mitigate biases in AI used for decision-making (e.g., hiring).',
        guidelines: [
          'AI systems used in hiring, promotion, or performance evaluation must undergo bias testing',
          'Regular audits must be conducted to ensure fair treatment across all demographic groups',
          'Alternative decision-making processes must be available when AI bias is suspected',
          'Training must be provided to help employees recognize and address AI bias'
        ]
      },
      {
        title: 'Transparency and Attribution',
        description: 'Ensuring that AI-generated content is clearly labeled and that employees do not present AI output as their own work.',
        guidelines: [
          'All AI-generated or AI-assisted content must be clearly marked as such',
          'Original sources and AI tools used must be properly attributed',
          'AI-generated content should not be presented as human-authored work',
          'Documentation of AI tool usage must be maintained for audit purposes'
        ]
      }
    ],
    training: {
      title: 'Training and Education',
      description: 'Providing employees with training on the responsible and ethical use of AI tools.',
      modules: [
        'Introduction to AI Ethics and Responsible Use',
        'Data Privacy and Security in AI Applications',
        'Recognizing and Mitigating AI Bias',
        'Transparency and Attribution Requirements',
        'AI Tool Security and Risk Management'
      ]
    },
    reporting: {
      title: 'Reporting Misuse or Concerns',
      description: 'Establishing channels for employees to report concerns about AI misuse or unexpected outcomes.',
      channels: [
        'Anonymous reporting system for AI-related concerns',
        'Direct escalation to AI governance committee',
        'Regular review meetings with department heads',
        'External audit and compliance review processes'
      ]
    }
  };

  const renderResponsibleAI = () => (
    <div className="space-y-8">
      {/* AI Policy Principles */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">General AI Policy Topics & Principles</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {responsibleAIContent.principles.map((principle, index) => {
            const IconComponent = principle.icon;
            return (
              <div key={index} className="card-modern p-6 interactive-soft fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{principle.title}</h3>
                    <p className="text-gray-600 mb-3">{principle.description}</p>
                    <p className="text-sm text-gray-500">{principle.details}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Additional Principles */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Human Oversight</h3>
                <p className="text-gray-600 mb-3">Ensuring that humans remain in control of AI systems, particularly in critical decision-making processes.</p>
                <p className="text-sm text-gray-500">Critical decisions must always include meaningful human review and the ability to override AI recommendations when necessary.</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">International Cooperation</h3>
                <p className="text-gray-600 mb-3">Developing global standards and frameworks for the responsible development and use of AI.</p>
                <p className="text-sm text-gray-500">Participation in international AI governance initiatives and alignment with global best practices and standards.</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Management</h3>
                <p className="text-gray-600 mb-3">Developing frameworks and processes to identify, assess, and mitigate risks associated with AI systems.</p>
                <p className="text-sm text-gray-500">Comprehensive risk assessment processes covering technical, ethical, legal, and operational risks throughout the AI lifecycle.</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Intellectual Property</h3>
                <p className="text-gray-600 mb-3">Addressing issues related to copyright, patents, and other intellectual property rights in the context of AI.</p>
                <p className="text-sm text-gray-500">Clear policies on AI-generated content ownership, training data rights, and protection of proprietary algorithms and models.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global AI Frameworks */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Examples of Specific AI Policies/Frameworks</h2>
        <div className="space-y-4">
          {responsibleAIContent.frameworks.map((framework, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{framework.name}</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {framework.category}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {framework.region}
                    </span>
                  </div>
                  <p className="text-gray-600">{framework.description}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderResponsibleUse = () => (
    <div className="space-y-8">
      {/* Organizational AI Policies */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Policy within Organizations</h2>
        <div className="space-y-6">
          {responsibleUseContent.policies.map((policy, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{policy.title}</h3>
              <p className="text-gray-600 mb-4">{policy.description}</p>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Guidelines:</h4>
                <ul className="space-y-2">
                  {policy.guidelines.map((guideline, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{guideline}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Training and Education */}
      <section>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{responsibleUseContent.training.title}</h3>
          <p className="text-gray-600 mb-4">{responsibleUseContent.training.description}</p>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Training Modules:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {responsibleUseContent.training.modules.map((module, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>{module}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reporting Mechanisms */}
      <section>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{responsibleUseContent.reporting.title}</h3>
          <p className="text-gray-600 mb-4">{responsibleUseContent.reporting.description}</p>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Reporting Channels:</h4>
            <ul className="space-y-2">
              {responsibleUseContent.reporting.channels.map((channel, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>{channel}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Policy Center</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-4xl">
            Our AI Policy Center serves as the central hub for understanding and implementing responsible artificial intelligence practices within our organization. 
            This comprehensive resource provides guidance on ethical AI development, responsible use policies, and compliance with global AI governance frameworks.
          </p>
          <p className="mt-3 text-gray-600 max-w-4xl">
            As AI technologies continue to evolve, it's crucial to establish clear policies that promote transparency, accountability, and fairness while ensuring 
            the protection of privacy and human rights. Our policies align with international standards and best practices to create a trustworthy AI ecosystem.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab, index) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(index)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === index
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="card-elevated p-8 slide-in-bottom">
          {activeTab === 0 && renderResponsibleAI()}
          {activeTab === 1 && renderResponsibleUse()}
        </div>
      </div>
    </div>
  );
}