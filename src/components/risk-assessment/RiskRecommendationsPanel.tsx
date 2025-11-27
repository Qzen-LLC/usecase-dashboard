'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Building2,
  GraduationCap,
  Shield,
  Target,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
  Download
} from 'lucide-react';
import type { RiskRecommendations, ExternalRisk, OwaspRisk } from '@/lib/integrations/types';
import { RiskRecommendationCard } from './RiskRecommendationCard';
import { useToast } from '@/hooks/use-toast';

interface RiskRecommendationsPanelProps {
  open: boolean;
  onClose: () => void;
  recommendations: RiskRecommendations;
  useCaseId: string;
}

interface SelectedRisk {
  source: 'ibm' | 'mit' | 'owasp';
  sourceId: string;
}

export function RiskRecommendationsPanel({
  open,
  onClose,
  recommendations,
  useCaseId,
}: RiskRecommendationsPanelProps) {
  const [selectedRisks, setSelectedRisks] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const { toast } = useToast();

  // Generate unique key for a risk
  const getRiskKey = (source: string, sourceId: string) => `${source}:${sourceId}`;

  // Toggle risk selection
  const toggleRiskSelection = (source: 'ibm' | 'mit' | 'owasp', sourceId: string) => {
    const key = getRiskKey(source, sourceId);
    const newSelected = new Set(selectedRisks);

    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }

    setSelectedRisks(newSelected);
  };

  // Check if a risk is selected
  const isRiskSelected = (source: string, sourceId: string) => {
    return selectedRisks.has(getRiskKey(source, sourceId));
  };

  // Import selected risks
  const handleImport = async () => {
    if (selectedRisks.size === 0) {
      toast({
        title: 'No risks selected',
        description: 'Please select at least one risk to import',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);

    try {
      // Convert Set to array of { source, sourceId }
      const risksToImport: SelectedRisk[] = Array.from(selectedRisks).map(key => {
        const [source, sourceId] = key.split(':');
        return { source: source as 'ibm' | 'mit' | 'owasp', sourceId };
      });

      const response = await fetch(`/api/risks/${useCaseId}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedRisks: risksToImport }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import risks');
      }

      const result = await response.json();

      setImportSuccess(true);
      toast({
        title: 'Risks imported successfully',
        description: `${result.imported} risk(s) have been added to your use case`,
      });

      // Clear selection after successful import
      setSelectedRisks(new Set());

      // Close panel after short delay
      setTimeout(() => {
        onClose();
        setImportSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error importing risks:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import risks',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Risk Recommendations
              </DialogTitle>
              <DialogDescription className="mt-2">
                {recommendations.totalRecommendations} relevant risks identified based on your assessment
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Analysis Summary */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {recommendations.analysis.isGenAI && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                <Shield className="mr-1 h-3 w-3" />
                Generative AI
              </Badge>
            )}
            {recommendations.analysis.isAgenticAI && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <Target className="mr-1 h-3 w-3" />
                Agentic AI
              </Badge>
            )}
            {recommendations.analysis.primaryUseCase && (
              <Badge variant="outline">
                {recommendations.analysis.primaryUseCase}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Tabs for different sources */}
        <Tabs defaultValue="ibm" className="flex-1 flex flex-col overflow-hidden mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ibm" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              IBM ({recommendations.ibm.length})
            </TabsTrigger>
            <TabsTrigger value="mit" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              MIT ({recommendations.mit.length})
            </TabsTrigger>
            <TabsTrigger value="owasp" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              OWASP ({recommendations.owasp.length})
            </TabsTrigger>
          </TabsList>

          {/* IBM Risks */}
          <TabsContent value="ibm" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[500px] pr-4">
              {recommendations.ibm.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mb-4 opacity-50" />
                  <p>No IBM risks recommended for this use case</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.ibm.map((risk) => (
                    <RiskRecommendationCard
                      key={risk.Id}
                      risk={risk}
                      source="ibm"
                      selected={isRiskSelected('ibm', String(risk.Id))}
                      onToggle={() => toggleRiskSelection('ibm', String(risk.Id))}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* MIT Risks */}
          <TabsContent value="mit" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[500px] pr-4">
              {recommendations.mit.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mb-4 opacity-50" />
                  <p>No MIT risks recommended for this use case</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.mit.map((risk) => (
                    <RiskRecommendationCard
                      key={risk.Id}
                      risk={risk}
                      source="mit"
                      selected={isRiskSelected('mit', String(risk.Id))}
                      onToggle={() => toggleRiskSelection('mit', String(risk.Id))}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* OWASP Risks */}
          <TabsContent value="owasp" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[500px] pr-4">
              {recommendations.owasp.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mb-4 opacity-50" />
                  <p>No OWASP risks recommended for this use case</p>
                  <p className="text-sm mt-2">OWASP risks are only shown for Generative AI systems</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.owasp.map((risk) => (
                    <RiskRecommendationCard
                      key={risk.id}
                      risk={risk}
                      source="owasp"
                      selected={isRiskSelected('owasp', risk.id)}
                      onToggle={() => toggleRiskSelection('owasp', risk.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer with import button */}
        <DialogFooter className="flex items-center justify-between border-t pt-4 mt-4">
          <div className="text-sm text-muted-foreground">
            {selectedRisks.size} risk(s) selected for import
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={importing}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || selectedRisks.size === 0 || importSuccess}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : importSuccess ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Imported!
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Import Selected Risks
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
