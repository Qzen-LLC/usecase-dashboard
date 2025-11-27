'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, BookOpen, Zap, AlertTriangle } from 'lucide-react';
import type { RiskRecommendations } from '@/lib/integrations/types';
import { SecurityRecommendationsPanel } from './security-assessment/SecurityRecommendationsPanel';
import { ManualMitreBrowser } from './security-assessment/ManualMitreBrowser';

export default function SecurityAssessment() {
  const params = useParams();
  const useCaseId = params?.useCaseId as string;

  // AI Security Recommendations state
  const [showRecommendationsPanel, setShowRecommendationsPanel] = useState(false);
  const [recommendations, setRecommendations] = useState<RiskRecommendations | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);

  // Manual MITRE Browser state
  const [showManualBrowser, setShowManualBrowser] = useState(false);

  // Fetch AI-powered security recommendations
  const fetchSecurityRecommendations = async () => {
    if (!useCaseId) {
      setRecommendationsError('Use case ID not found');
      return;
    }

    setLoadingRecommendations(true);
    setRecommendationsError(null);

    try {
      // Fetch MITRE ATLAS techniques only (Step 11: Security Assessment)
      const response = await fetch(`/api/risks/${useCaseId}/recommendations?source=security`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch security recommendations');
      }

      const data: RiskRecommendations = await response.json();
      setRecommendations(data);
      setShowRecommendationsPanel(true);
    } catch (error) {
      console.error('Error fetching security recommendations:', error);
      setRecommendationsError(
        error instanceof Error ? error.message : 'Failed to fetch security recommendations'
      );
    } finally {
      setLoadingRecommendations(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-amber-950/20 border-l-4 border-red-500 p-6 rounded-2xl shadow-md">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl shadow-lg">
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Security Assessment - MITRE ATLAS
            </h2>
            <p className="text-muted-foreground mt-1">
              Identify adversarial tactics and techniques targeting AI systems with MITRE's comprehensive framework
            </p>
          </div>
        </div>
      </div>

      {/* Two Main Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Option 1: AI-Powered Security Recommendations */}
        <Card className="border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/10 dark:to-orange-950/10">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-foreground mb-1">
                  AI-Powered Security Recommendations
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  AI analyzes your assessment to identify relevant adversarial techniques
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-red-600 font-semibold">•</span>
                <p>Analyzes your AI system characteristics and architecture</p>
              </div>
              <div className="flex gap-2">
                <span className="text-red-600 font-semibold">•</span>
                <p>Maps to MITRE ATLAS tactics and adversarial techniques</p>
              </div>
              <div className="flex gap-2">
                <span className="text-red-600 font-semibold">•</span>
                <p>Provides mitigations and real-world attack case studies</p>
              </div>
            </div>

            {recommendationsError && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-xs text-red-600 dark:text-red-500">{recommendationsError}</p>
              </div>
            )}

            <Button
              onClick={fetchSecurityRecommendations}
              disabled={loadingRecommendations}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
              size="lg"
            >
              {loadingRecommendations ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Analyzing Security Posture...
                </>
              ) : (
                <>
                  <ShieldAlert className="mr-2 h-5 w-5" />
                  Get Security Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Option 2: Manual MITRE ATLAS Browsing */}
        <Card className="border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/10 dark:to-amber-950/10">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-foreground mb-1">
                  Browse MITRE ATLAS Database
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Manually explore all adversarial techniques and tactics
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-orange-600 font-semibold">•</span>
                <p>Browse 140+ adversarial techniques for AI systems</p>
              </div>
              <div className="flex gap-2">
                <span className="text-orange-600 font-semibold">•</span>
                <p>Organized across 14 attack tactics from reconnaissance to impact</p>
              </div>
              <div className="flex gap-2">
                <span className="text-orange-600 font-semibold">•</span>
                <p>Filter by tactic, severity, and real-world case studies</p>
              </div>
            </div>

            <Button
              onClick={() => setShowManualBrowser(true)}
              variant="outline"
              className="w-full border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20"
              size="lg"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Browse MITRE ATLAS Techniques
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* MITRE ATLAS Overview */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            MITRE ATLAS Framework for AI Security
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 space-y-6">
          {/* MITRE ATLAS Info Card */}
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">
                  Adversarial Threat Landscape for AI Systems
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  MITRE ATLAS is a globally accessible knowledge base of adversary tactics and techniques based on
                  real-world attack observations. It complements MITRE ATT&CK specifically for AI/ML systems.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-red-100 dark:border-red-900">
                    <div className="text-2xl font-bold text-red-600">140+</div>
                    <div className="text-xs text-muted-foreground mt-1">Adversarial Techniques</div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-orange-100 dark:border-orange-900">
                    <div className="text-2xl font-bold text-orange-600">14</div>
                    <div className="text-xs text-muted-foreground mt-1">Attack Tactics</div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-amber-100 dark:border-amber-900">
                    <div className="text-2xl font-bold text-amber-600">25+</div>
                    <div className="text-xs text-muted-foreground mt-1">Real-World Case Studies</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Tactics Grid */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Key Adversarial Tactics</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: 'Reconnaissance', description: 'Gathering AI system information' },
                { name: 'Initial Access', description: 'Gaining access to AI systems' },
                { name: 'ML Attack Staging', description: 'Preparing ML-specific attacks' },
                { name: 'Exfiltration', description: 'Stealing model data and outputs' },
                { name: 'Impact', description: 'Manipulating AI system behavior' },
                { name: 'Defense Evasion', description: 'Avoiding detection mechanisms' },
              ].map((tactic) => (
                <div
                  key={tactic.name}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                >
                  <div className="font-semibold text-sm text-foreground mb-1">{tactic.name}</div>
                  <div className="text-xs text-muted-foreground">{tactic.description}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations Panel (Modal) */}
      {showRecommendationsPanel && recommendations && (
        <SecurityRecommendationsPanel
          open={showRecommendationsPanel}
          onClose={() => setShowRecommendationsPanel(false)}
          recommendations={recommendations}
          useCaseId={useCaseId}
        />
      )}

      {/* Manual MITRE Browser (Modal) */}
      {showManualBrowser && (
        <ManualMitreBrowser
          open={showManualBrowser}
          onClose={() => setShowManualBrowser(false)}
          useCaseId={useCaseId}
        />
      )}
    </div>
  );
}
