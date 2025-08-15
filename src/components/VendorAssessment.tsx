'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Save, X, Eye, Trash2, Search, BarChart3, Users } from 'lucide-react';
import { vendorService, type Vendor } from '@/lib/vendorService';

// Types
interface User {
  id: string;
  name: string;
}

interface VendorAssessmentProps {
  user: User;
}

type ViewMode = 'list' | 'form' | 'dashboard';

const VendorAssessment: React.FC<VendorAssessmentProps> = ({ user: _user }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const categories = [
    'LLM/Foundation Models',
    'LLM Orchestration',
    'Agentic Frameworks',
    'Conversational AI',
    'Document Intelligence',
    'Code Generation',
    'Content Generation',
    'Analytics & Insights',
    'MLOps Platform',
    'Speech & Audio AI',
    'Robotic Process Automation',
    'Edge AI & IoT',
    'AI Hardware & Infrastructure',
    'Data Labeling & Annotation',
    'AI Testing & Validation',
    'AI Governance & Risk',
    'Other'
  ];

  const assessmentCriteria = {
    'Strategic Alignment': {
      'Use Case Fit': 'Does the vendor\'s solution align with your specific business goals and domain requirements?',
      'Value Proposition': 'Is there demonstrable ROI or competitive advantage?',
      'Customization Ability': 'Can the solution be tailored to your data, workflows, or enterprise architecture?'
    },
    'Model and Technology Evaluation': {
      'Model Transparency': 'Do they use open-source, proprietary, or third-party models? Can they disclose architecture?',
      'Model Performance': 'Accuracy, latency, scalability, and reliability. Support for fine-tuning?',
      'Multimodal Capabilities': 'Support for text, vision, audio as needed for your business'
    },
    'Data Governance & Security': {
      'Data Handling': 'Is customer data used for model training? Is your data isolated or pooled?',
      'Compliance': 'GDPR, HIPAA, SOC 2, ISO 27001, and internal data residency requirements',
      'Security Controls': 'Encryption at rest & transit, API security, access control, incident response'
    },
    'Responsible AI & Ethics': {
      'Bias & Fairness Checks': 'Does the provider audit models for demographic or institutional bias?',
      'Explainability': 'Do they provide tools for interpreting model decisions?',
      'Content Moderation': 'Are guardrails in place for harmful, toxic, or hallucinated outputs?',
      'AI Governance': 'Do they have internal ethical boards or review processes?'
    },
    'Integration & Interoperability': {
      'APIs and SDKs': 'Is it easy to integrate with your tech stack (REST, Python, Java)?',
      'Workflow Compatibility': 'Support for CI/CD pipelines, MLOps tools?',
      'Vendor Lock-in Risk': 'How easy is it to migrate your data/models if needed?'
    },
    'Licensing, Pricing & SLAs': {
      'Licensing Terms': 'Clarity around usage rights, model ownership, and retraining',
      'Pricing Model': 'Pay-per-use, seat-based, or flat pricing? Limits on API calls?',
      'Service Level Agreements': 'Uptime guarantees, support responsiveness, penalty clauses'
    },
    'Maturity & Track Record': {
      'Company Stability': 'Funding, customer base, partnerships, and longevity',
      'Case Studies & References': 'Success stories from companies in your domain?',
      'Innovation Roadmap': 'Are they actively evolving and responsive to latest AI advancements?'
    },
    'Regulatory & Legal Considerations': {
      'Model Licensing Restrictions': 'Risk in using open-source models in commercial settings?',
      'IP & Copyright Risks': 'Can they demonstrate outputs don\'t violate copyright/IP?',
      'Liability Clauses': 'Who is responsible for AI misbehavior?'
    },
    'Operational Excellence & Support': {
      'Documentation Quality': 'How thorough are technical docs, API references, implementation guides?',
      'Developer Experience': 'Quality of SDKs, code examples, onboarding process',
      'Support Tiers': 'Response times, escalation paths, technical account management',
      'Training & Enablement': 'Do they provide training for your team or certification programs?'
    },
    'Performance Monitoring & Observability': {
      'Model Drift Detection': 'Can you monitor for degradation in model performance over time?',
      'Usage Analytics': 'Detailed metrics on API calls, latency, error rates, cost attribution',
      'A/B Testing Support': 'Ability to test different models or configurations',
      'Alerting & Notifications': 'Real-time alerts for performance issues or anomalies'
    },
    'Business Continuity & Risk Management': {
      'Disaster Recovery': 'What are their backup and recovery procedures?',
      'Geographic Redundancy': 'Multi-region deployment options for resilience',
      'Dependency Risks': 'What happens if they lose access to underlying models?',
      'Exit Strategy': 'Data portability, transition assistance, contract termination procedures'
    },
    'Future-Proofing & Scalability': {
      'Model Versioning': 'How do they handle model updates and backwards compatibility?',
      'Scaling Limits': 'Maximum throughput, concurrent users, or data volume limits',
      'Edge Deployment': 'Options for on-premises or edge computing deployment',
      'Multi-tenant Architecture': 'How well does their infrastructure scale with your growth?'
    }
  };


  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await vendorService.getVendors();
    if (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
    setVendors(data || []);
    setLoading(false);
  };

  const createEmptyVendor = (): Vendor => ({
    id: Date.now().toString(),
    name: '',
    category: categories[0],
    website: '',
    contactPerson: '',
    contactEmail: '',
    assessmentDate: new Date().toISOString().split('T')[0],
    overallScore: 0,
    status: 'In Assessment',
    notes: '',
    scores: {},
    comments: {},
    approvals: {
      'Procurement': { status: 'Pending', approvedBy: null, approvedDate: null, comments: '' },
      'Legal': { status: 'Pending', approvedBy: null, approvedDate: null, comments: '' },
      'Governance': { status: 'Pending', approvedBy: null, approvedDate: null, comments: '' },
      'Compliance': { status: 'Pending', approvedBy: null, approvedDate: null, comments: '' }
    }
  });

  const addVendor = () => {
    const newVendor = createEmptyVendor();
    setCurrentVendor(newVendor);
    setIsEditing(true);
    setViewMode('form');
    setActiveTab(0);
  };

  const saveVendor = async () => {
    if (!currentVendor?.name.trim()) {
      alert('Please enter a vendor name');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      let result: { data: Vendor | null; error: string | null };
      if (currentVendor.id && typeof currentVendor.id === 'string' && currentVendor.id.includes('-')) {
        result = await vendorService.updateVendor(currentVendor.id, currentVendor);
      } else {
        result = await vendorService.createVendor(currentVendor);
        if (result.data) {
          setCurrentVendor(prev => prev ? ({ ...prev, id: result.data!.id }) : null);
        }
      }

      if (result.error) {
        throw new Error(result.error);
      }

      await saveAssessmentScores();
      await saveApprovalAreas();
      await loadVendors();
      setIsEditing(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else if (error) {
        setError(String(error));
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveAssessmentScores = async () => {
    if (!currentVendor?.id) return;

    const scores = currentVendor.scores || {};
    const comments = currentVendor.comments || {};

    for (const [key, score] of Object.entries(scores)) {
      if (typeof score === 'number' && score > 0) {
        const [category, subcategory] = key.split('-');
        const comment = comments[key] || '';
        await vendorService.updateAssessmentScore(
          currentVendor.id.toString(),
          category,
          subcategory,
          score,
          comment
        );
      }
    }

    await vendorService.calculateOverallScore(currentVendor.id.toString());
  };

  const saveApprovalAreas = async () => {
    if (!currentVendor?.id) return;

    const approvals = currentVendor.approvals || {};

    for (const [area, approval] of Object.entries(approvals)) {
      await vendorService.updateApprovalArea(
        currentVendor.id.toString(),
        area,
        approval.status,
        approval.approvedBy || undefined,
        approval.comments || undefined
      );
    }
  };

  const updateScore = (category: string, subcategory: string, score: string) => {
    const key = `${category}-${subcategory}`;
    setCurrentVendor(prev => {
      if (!prev) return null;
      
      const updatedVendor = {
        ...prev,
        scores: { ...prev.scores, [key]: parseInt(score) }
      };
      
      const scores = Object.values(updatedVendor.scores || {});
      const validScores = scores.filter((score): score is number => typeof score === 'number' && score > 0);
      const average = validScores.length > 0 ? 
        validScores.reduce((sum, score) => sum + score, 0) / validScores.length : 0;
      
      return { ...updatedVendor, overallScore: Math.round(average * 10) / 10 };
    });
  };

  const updateComment = (category: string, subcategory: string, comment: string) => {
    const key = `${category}-${subcategory}`;
    setCurrentVendor(prev => prev ? ({
      ...prev,
      comments: { ...prev.comments, [key]: comment }
    }) : null);
  };

  const updateApprovalStatus = (area: string, status: string) => {
    setCurrentVendor(prev => {
      if (!prev) return null;
      
      const updatedApprovals = {
        ...prev.approvals,
        [area]: {
          ...prev.approvals[area as keyof typeof prev.approvals],
          status: status as 'Pending' | 'Approved' | 'Rejected',
          approvedBy: status === 'Approved' ? (prev.approvals[area as keyof typeof prev.approvals].approvedBy || '') : null,
          approvedDate: status === 'Approved' ? (prev.approvals[area as keyof typeof prev.approvals].approvedDate || new Date().toISOString()) : null
        }
      };
      
      // Calculate new vendor status based on approval areas
      const approvalValues = Object.values(updatedApprovals);
      const allApproved = approvalValues.every(approval => approval.status === 'Approved');
      const anyRejected = approvalValues.some(approval => approval.status === 'Rejected');
      
      let newStatus: 'In Assessment' | 'Approved' | 'Rejected' | 'On Hold' = 'In Assessment';
      if (allApproved) {
        newStatus = 'Approved';
      } else if (anyRejected) {
        newStatus = 'Rejected';
      }
      
      return {
        ...prev,
        approvals: updatedApprovals,
        status: newStatus
      };
    });
  };

  const updateApprovalField = (area: string, field: string, value: string) => {
    setCurrentVendor(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        approvals: {
          ...prev.approvals,
          [area]: {
            ...prev.approvals[area as keyof typeof prev.approvals],
            [field]: value
          }
        }
      };
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-green-600 bg-green-50';
      case 'Rejected': return 'text-red-600 bg-red-50';
      case 'On Hold': return 'text-orange-600 bg-orange-50';
      case 'In Assessment': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-400 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 bg-green-50';
    if (score >= 3) return 'text-yellow-600 bg-yellow-50';
    if (score >= 2) return 'text-orange-600 bg-orange-50';
    if (score >= 1) return 'text-red-600 bg-red-50';
    return 'text-gray-400 bg-gray-50';
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesCategory = filterCategory === 'all' || vendor.category === filterCategory;
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/delete-vendor?id=${vendorId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete vendor');
      setVendors(prev => prev.filter(v => v.id !== vendorId));
    } catch {
      setError('Failed to delete vendor. Please try again.');
      alert('Failed to delete vendor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderVendorForm = () => {
    if (!currentVendor) return null;

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Vendor' : 'Vendor Details'}
          </h2>
          <div className="flex gap-2">
            {isEditing && (
              <button
                onClick={saveVendor}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Save size={16} />
                Save
              </button>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Edit2 size={16} />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              <X size={16} />
              Close
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name</label>
            <input
              type="text"
              value={currentVendor.name}
              onChange={(e) => setCurrentVendor(prev => prev ? { ...prev, name: e.target.value } : null)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={currentVendor.category}
              onChange={(e) => setCurrentVendor(prev => prev ? { ...prev, category: e.target.value } : null)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={currentVendor.website}
              onChange={(e) => setCurrentVendor(prev => prev ? { ...prev, website: e.target.value } : null)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Date</label>
            <input
              type="date"
              value={currentVendor.assessmentDate}
              onChange={(e) => setCurrentVendor(prev => prev ? { ...prev, assessmentDate: e.target.value } : null)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Assessment Criteria Tabs */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Assessment Criteria</h3>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap">
              {Object.keys(assessmentCriteria).map((category, index) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(index)}
                  className={`mr-2 mb-2 py-2 px-4 text-sm font-medium rounded-t-lg whitespace-nowrap ${
                    activeTab === index
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-gray-50 rounded-lg p-6">
            {Object.entries(assessmentCriteria).map(([category, subcriteria], index) => (
              <div key={category} className={activeTab === index ? 'block' : 'hidden'}>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">{category}</h4>
                <div className="space-y-4">
                  {Object.entries(subcriteria).map(([subcategory, description]) => {
                    const key = `${category}-${subcategory}`;
                    const score = currentVendor.scores[key] || 0;
                    const comment = currentVendor.comments[key] || '';
                    
                    return (
                      <div key={subcategory} className="bg-white rounded-lg p-4 border">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{subcategory}</h5>
                            <p className="text-sm text-gray-600 mt-1">{description}</p>
                          </div>
                          <div className="ml-4 flex items-center gap-2">
                            <span className="text-sm text-gray-500 whitespace-nowrap">Score:</span>
                            <select
                              value={score}
                              onChange={(e) => updateScore(category, subcategory, e.target.value)}
                              disabled={!isEditing}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            >
                              <option value="0">0</option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                              <option value="4">4</option>
                              <option value="5">5</option>
                            </select>
                          </div>
                        </div>
                        <textarea
                          value={comment}
                          onChange={(e) => updateComment(category, subcategory, e.target.value)}
                          disabled={!isEditing}
                          placeholder="Add your assessment notes..."
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          rows={2}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Approval Areas */}
        <div className="mt-8 space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Approval Workflow</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(currentVendor.approvals).map(([area, approval]) => (
              <div key={area} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{area}</h4>
                  <select
                    value={approval.status}
                    onChange={(e) => updateApprovalStatus(area, e.target.value)}
                    disabled={!isEditing}
                    className={`px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-blue-500 disabled:opacity-75 ${
                      approval.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      approval.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                
                {approval.status === 'Approved' && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Approved By</label>
                      <input
                        type="text"
                        value={approval.approvedBy || ''}
                        onChange={(e) => updateApprovalField(area, 'approvedBy', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter approver name"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Approval Date</label>
                      <input
                        type="date"
                        value={approval.approvedDate ? approval.approvedDate.split('T')[0] : ''}
                        onChange={(e) => updateApprovalField(area, 'approvedDate', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                )}
                
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Comments</label>
                  <textarea
                    value={approval.comments}
                    onChange={(e) => updateApprovalField(area, 'comments', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Add approval comments..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Approval Status Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Overall Approval Status</h4>
                <p className="text-sm text-gray-600">
                  {Object.values(currentVendor.approvals).filter(a => a.status === 'Approved').length} of 4 areas approved
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(currentVendor.status)}`}>
                {currentVendor.status}
              </div>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Overall Assessment Score</h3>
            <div className={`px-6 py-3 rounded-full text-2xl font-bold ${getScoreColor(currentVendor.overallScore)}`}>
              {currentVendor.overallScore.toFixed(1)}/5.0
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVendorList = () => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Vendor Assessment List</h2>
          <div className="flex gap-2">
            <button
              onClick={addVendor}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-200 font-medium"
            >
              <Plus size={16} />
              Add Vendor
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className="flex items-center gap-2 bg-gray-600 text-white px-6 py-2.5 rounded-lg hover:bg-gray-700 hover:shadow-lg transition-all duration-200 font-medium"
            >
              <BarChart3 size={16} />
              Dashboard
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                    <div className="text-sm text-gray-500">{vendor.contactEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendor.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vendor.status)}`}>
                    {vendor.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getScoreColor(vendor.overallScore)}`}>
                    {vendor.overallScore.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendor.assessmentDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCurrentVendor(vendor);
                        setViewMode('form');
                        setIsEditing(false);
                        setActiveTab(0);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentVendor(vendor);
                        setViewMode('form');
                        setIsEditing(true);
                        setActiveTab(0);
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteVendor(vendor.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Vendor"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new vendor to assess.</p>
          <div className="mt-6">
            <button
              onClick={addVendor}
              className="flex items-center gap-2 mx-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              Add your first vendor
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Assessment Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={addVendor}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Vendor
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <Users size={16} />
            View All Vendors
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vendors</p>
              <p className="text-2xl font-bold text-gray-900">{vendors.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {vendors.filter(v => v.status === 'Approved').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Assessment</p>
              <p className="text-2xl font-bold text-blue-600">
                {vendors.filter(v => v.status === 'In Assessment').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-purple-600">
                {vendors.length > 0 ? 
                  (vendors.reduce((sum, v) => sum + v.overallScore, 0) / vendors.length).toFixed(1) : 
                  '0.0'
                }
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Vendors by Category Section - always visible */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendors by Category</h3>
        <div className="space-y-4">
          {categories.map(category => {
            const approvedVendors = vendors.filter(v => v.category === category && v.status === 'Approved');
            if (approvedVendors.length === 0) return null;
            return (
              <div key={category} className="mb-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{category}</span>
                  <span className="text-sm text-green-600 font-semibold">{approvedVendors.length} approved</span>
                </div>
                <ul className="ml-6 mt-2 space-y-1">
                  {approvedVendors.map(vendor => (
                    <li key={vendor.id} className="flex justify-between items-center">
                      <span className="text-gray-800">{vendor.name}</span>
                      <span className="text-blue-600 font-medium">Score: {vendor.overallScore.toFixed(1)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {/* If no approved vendors in any category, show a message */}
          {categories.every(category => vendors.filter(v => v.category === category && v.status === 'Approved').length === 0) && (
            <div className="text-center text-gray-500 py-8">No approved vendors by category yet.</div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    console.error('VendorAssessment error:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">
          Error: {error && error !== "null" && error !== "undefined" ? error : "An unexpected error occurred. Please try again."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {viewMode === 'list' && renderVendorList()}
      {viewMode === 'form' && renderVendorForm()}
      {viewMode === 'dashboard' && renderDashboard()}
    </div>
  );
};

export default React.memo(VendorAssessment);