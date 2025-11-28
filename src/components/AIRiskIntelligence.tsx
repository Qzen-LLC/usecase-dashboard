'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Lightbulb,
  Building2,
  GraduationCap,
  Shield,
  BookOpen,
  Zap,
  CheckCircle2,
  FileText,
  Target,
  FlaskConical,
  Database,
  AlertTriangle,
  Scale,
  Globe
} from 'lucide-react';
import { RiskRecommendationsPanel } from './risk-assessment/RiskRecommendationsPanel';
import { ManualRiskBrowser } from './risk-assessment/ManualRiskBrowser';
import type { RiskRecommendations } from '@/lib/integrations/types';

// QUBE AI Risk Data Statistics
const QUBE_RISK_STATS = {
  totalRisks: 1206,
  totalMitigations: 254,
  totalControls: 17,
  totalEvaluations: 24,
  taxonomies: [
    { id: 'qube-legacy-mit', name: 'MIT AI Risk Repository', risks: 604, color: 'purple' },
    { id: 'ai-risk-taxonomy', name: 'AIR 2024', risks: 314, color: 'indigo' },
    { id: 'ibm-risk-atlas', name: 'IBM AI Risk Atlas', risks: 99, color: 'blue' },
    { id: 'qube-legacy-ibm', name: 'IBM (Extended)', risks: 89, color: 'sky' },
    { id: 'credo-ucf', name: 'Credo UCF', risks: 49, color: 'violet' },
    { id: 'nist-ai-rmf', name: 'NIST AI RMF', risks: 12, color: 'cyan' },
    { id: 'ailuminate-v1.0', name: 'AILuminate', risks: 12, color: 'amber' },
    { id: 'owasp-llm-2.0', name: 'OWASP Top 10 LLMs', risks: 10, color: 'red' },
    { id: 'ibm-granite-guardian', name: 'Granite Guardian', risks: 13, color: 'emerald' },
    { id: 'shieldgemma-taxonomy', name: 'ShieldGemma', risks: 4, color: 'teal' },
  ],
};

export default function AIRiskIntelligence() {
  const params = useParams();
  const useCaseId = params?.useCaseId as string;

  // AI Recommendations state
  const [showRecommendationsPanel, setShowRecommendationsPanel] = useState(false);
  const [recommendations, setRecommendations] = useState<RiskRecommendations | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);

  // Manual Browser state
  const [showManualBrowser, setShowManualBrowser] = useState(false);

  // Fetch AI-powered recommendations using QUBE AI Risk Data LLM-based identification
  const fetchRecommendations = async () => {
    if (!useCaseId) {
      setRecommendationsError('Use case ID not found');
      return;
    }

    setLoadingRecommendations(true);
    setRecommendationsError(null);

    try {
      // Use QUBE AI Risk Data LLM-based risk identification (default: source=atlas)
      // This uses OpenAI to semantically match risks from 1200+ entries across 10 taxonomies
      // and returns enriched data with mitigations, controls, and evaluations
      const response = await fetch(`/api/risks/${useCaseId}/recommendations?source=atlas`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch recommendations');
      }

      const data: RiskRecommendations = await response.json();
      setRecommendations(data);
      setShowRecommendationsPanel(true);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendationsError(error instanceof Error ? error.message : 'Failed to fetch recommendations');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20 border-l-4 border-purple-500 p-6 rounded-2xl shadow-md">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI-Powered Risk Intelligence
            </h2>
            <p className="text-muted-foreground mt-1">
              Powered by <span className="font-semibold text-purple-600">QUBE AI Risk Data</span> - comprehensive AI governance data from industry-leading sources
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">{QUBE_RISK_STATS.totalRisks}+ Risks</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">{QUBE_RISK_STATS.totalMitigations} Mitigations</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm">
            <Shield className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">{QUBE_RISK_STATS.totalControls} Controls</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm">
            <FlaskConical className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">{QUBE_RISK_STATS.totalEvaluations} Evaluations</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm">
            <Database className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-medium">{QUBE_RISK_STATS.taxonomies.length} Taxonomies</span>
          </div>
        </div>
      </div>

      {/* Two Main Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Option 1: AI-Powered Recommendations */}
        <Card className="border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-foreground mb-1">
                  AI-Powered Recommendations
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Get intelligent risk recommendations with mitigations & evaluations
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-purple-600 font-semibold">•</span>
                <p>Analyzes your assessment across 10 taxonomies</p>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-600 font-semibold">•</span>
                <p>Matches risks from IBM, NIST, MIT, OWASP, Credo & more</p>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-600 font-semibold">•</span>
                <p className="text-green-600 font-medium">NEW: Includes mitigations, controls & evaluations</p>
              </div>
            </div>

            {recommendationsError && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-xs text-red-600 dark:text-red-500">{recommendationsError}</p>
              </div>
            )}

            <Button
              onClick={fetchRecommendations}
              disabled={loadingRecommendations}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              size="lg"
            >
              {loadingRecommendations ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Analyzing Assessment...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get AI Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Option 2: Manual Database Browsing */}
        <Card className="border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/10 dark:to-indigo-950/10">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-foreground mb-1">
                  Browse All Risk Databases
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Manually explore {QUBE_RISK_STATS.totalRisks}+ risks from all sources
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-blue-600 font-semibold">•</span>
                <p>Browse 1200+ risks across 10 AI governance taxonomies</p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-semibold">•</span>
                <p>Search with AI-powered semantic matching</p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-semibold">•</span>
                <p>Filter by source: MIT, IBM, NIST, OWASP, Credo & more</p>
              </div>
            </div>

            <Button
              onClick={() => setShowManualBrowser(true)}
              variant="outline"
              className="w-full border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              size="lg"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Browse Risk Databases
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* What's Included - NEW Section */}
      <Card className="border-emerald-200 dark:border-emerald-800 shadow-md">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/10 dark:to-teal-950/10">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            What's Included with QUBE AI Risk Data
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Risks */}
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-900 dark:text-red-200">Risks</h3>
              </div>
              <p className="text-3xl font-bold text-red-600 mb-1">{QUBE_RISK_STATS.totalRisks}+</p>
              <p className="text-xs text-muted-foreground">From 10 taxonomies including IBM, NIST, MIT, OWASP, Credo, AILuminate</p>
            </div>

            {/* Mitigations */}
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900 dark:text-green-200">Mitigations</h3>
              </div>
              <p className="text-3xl font-bold text-green-600 mb-1">{QUBE_RISK_STATS.totalMitigations}</p>
              <p className="text-xs text-muted-foreground">Actions from NIST AI RMF (212) and Credo UCF (42)</p>
            </div>

            {/* Controls */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-200">Controls</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-1">{QUBE_RISK_STATS.totalControls}</p>
              <p className="text-xs text-muted-foreground">Detection controls from Granite Guardian & ShieldGemma</p>
            </div>

            {/* Evaluations */}
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900 dark:text-purple-200">Evaluations</h3>
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-1">{QUBE_RISK_STATS.totalEvaluations}</p>
              <p className="text-xs text-muted-foreground">Benchmarks: TruthfulQA, BBQ, BOLD, AttaQ & more</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Taxonomies Overview */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-600" />
            Available Risk Taxonomies (10 Sources)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 space-y-6">
          {/* Primary Sources - First Row */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* IBM Risk Atlas */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200">IBM AI Risk Atlas</h3>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">99 risks</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Curated AI risks covering agentic AI, data privacy, generative AI, and security
              </p>
              <div className="flex flex-wrap gap-1 mt-3">
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">Agentic AI</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">GenAI</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">Privacy</span>
              </div>
            </div>

            {/* AIR 2024 */}
            <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-200">AIR 2024 Taxonomy</h3>
                </div>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">314 risks</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Comprehensive taxonomy from government and company AI policies worldwide
              </p>
              <div className="flex flex-wrap gap-1 mt-3">
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">Policy</span>
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">Government</span>
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">Comprehensive</span>
              </div>
            </div>

            {/* NIST AI RMF */}
            <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-cyan-600" />
                  <h3 className="font-semibold text-cyan-900 dark:text-cyan-200">NIST AI RMF</h3>
                </div>
                <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">12 risks + 212 actions</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                U.S. government framework for AI risk management with comprehensive mitigations
              </p>
              <div className="flex flex-wrap gap-1 mt-3">
                <span className="text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded">Governance</span>
                <span className="text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded">Compliance</span>
                <span className="text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded">Actions</span>
              </div>
            </div>
          </div>

          {/* Secondary Sources - Third Row */}
          <div className="grid md:grid-cols-4 gap-4">
            {/* MIT */}
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-4 w-4 text-purple-600" />
                <h3 className="font-semibold text-sm text-purple-900 dark:text-purple-200">MIT AI Risk Repository</h3>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 mb-2">33 risks</Badge>
              <p className="text-xs text-muted-foreground">Domain & causal risk classifications</p>
            </div>

            {/* Credo UCF */}
            <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-violet-600" />
                <h3 className="font-semibold text-sm text-violet-900 dark:text-violet-200">Credo UCF</h3>
              </div>
              <Badge variant="secondary" className="bg-violet-100 text-violet-700 mb-2">49 risks + 42 actions</Badge>
              <p className="text-xs text-muted-foreground">Unified control framework</p>
            </div>

            {/* OWASP */}
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-red-600" />
                <h3 className="font-semibold text-sm text-red-900 dark:text-red-200">OWASP Top 10 LLMs</h3>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-700 mb-2">10 risks</Badge>
              <p className="text-xs text-muted-foreground">Critical LLM security vulnerabilities</p>
            </div>

            {/* AILuminate */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-amber-600" />
                <h3 className="font-semibold text-sm text-amber-900 dark:text-amber-200">AILuminate</h3>
              </div>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 mb-2">12 risks</Badge>
              <p className="text-xs text-muted-foreground">MLCommons safety benchmark</p>
            </div>
          </div>

          {/* Detection Controls - Fourth Row */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Granite Guardian */}
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-semibold text-emerald-900 dark:text-emerald-200">IBM Granite Guardian</h3>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">13 controls</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Detection controls: Harm, Bias, Jailbreak, Groundedness, Relevance, Profanity & more
              </p>
            </div>

            {/* ShieldGemma */}
            <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-teal-600" />
                  <h3 className="font-semibold text-teal-900 dark:text-teal-200">Google ShieldGemma</h3>
                </div>
                <Badge variant="secondary" className="bg-teal-100 text-teal-700">4 controls</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Content safety: Sexually Explicit, Dangerous, Hate Speech, Harassment detection
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evaluations & Benchmarks */}
      <Card className="border-purple-200 dark:border-purple-800 shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/10 dark:to-pink-950/10">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-purple-600" />
            Included Evaluations & Benchmarks ({QUBE_RISK_STATS.totalEvaluations})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { name: 'TruthfulQA', desc: 'Truthfulness', color: 'purple' },
              { name: 'BBQ', desc: 'Bias detection', color: 'blue' },
              { name: 'BOLD', desc: 'Bias in generation', color: 'indigo' },
              { name: 'Discrim_eval', desc: 'Discrimination', color: 'violet' },
              { name: 'AttaQ', desc: 'Harmlessness', color: 'red' },
              { name: 'ProvoQ', desc: 'Stigma sensitivity', color: 'pink' },
              { name: 'CrowS-Pairs', desc: 'Stereotypes', color: 'orange' },
              { name: 'AILuminate', desc: 'Safety benchmark', color: 'amber' },
              { name: 'FM Transparency', desc: 'Model transparency', color: 'cyan' },
              { name: 'ALERT', desc: 'Red-teaming', color: 'emerald' },
              { name: 'SALAD-Bench', desc: 'Safety evaluation', color: 'green' },
              { name: 'ToxiGen', desc: 'Toxicity detection', color: 'rose' },
            ].map((eval_item) => (
              <div key={eval_item.name} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                <p className="font-medium text-sm">{eval_item.name}</p>
                <p className="text-xs text-muted-foreground">{eval_item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Recommendations Panel (Modal) */}
      {showRecommendationsPanel && recommendations && (
        <RiskRecommendationsPanel
          open={showRecommendationsPanel}
          onClose={() => setShowRecommendationsPanel(false)}
          recommendations={recommendations}
          useCaseId={useCaseId}
        />
      )}

      {/* Manual Risk Browser (Modal) */}
      {showManualBrowser && (
        <ManualRiskBrowser
          open={showManualBrowser}
          onClose={() => setShowManualBrowser(false)}
          useCaseId={useCaseId}
        />
      )}
    </div>
  );
}
