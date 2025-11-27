'use client';

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, GraduationCap, Shield, Search, Download, X } from 'lucide-react';
import { getAllRisksFromSource } from '@/lib/integrations/risk-recommender';
import type { ExternalRisk, OwaspRisk } from '@/lib/integrations/types';
import { useToast } from '@/hooks/use-toast';

interface ManualRiskBrowserProps {
  open: boolean;
  onClose: () => void;
  useCaseId: string;
}

export function ManualRiskBrowser({ open, onClose, useCaseId }: ManualRiskBrowserProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisks, setSelectedRisks] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState('ibm');

  // Get all risks from each source
  const ibmRisks = useMemo(() => getAllRisksFromSource('ibm') as ExternalRisk[], []);
  const mitRisks = useMemo(() => getAllRisksFromSource('mit') as ExternalRisk[], []);
  const owaspRisks = useMemo(() => getAllRisksFromSource('owasp') as OwaspRisk[], []);

  // Filter risks based on search query
  const filterRisks = (risks: ExternalRisk[] | OwaspRisk[], query: string) => {
    if (!query.trim()) return risks;

    const lowerQuery = query.toLowerCase();
    return risks.filter(risk => {
      if ('Summary' in risk) {
        // ExternalRisk (IBM/MIT)
        return (
          risk.Summary?.toLowerCase().includes(lowerQuery) ||
          risk.Description?.toLowerCase().includes(lowerQuery) ||
          risk.RiskCategory?.toLowerCase().includes(lowerQuery)
        );
      } else {
        // OwaspRisk
        return (
          risk.title?.toLowerCase().includes(lowerQuery) ||
          risk.description?.toLowerCase().includes(lowerQuery) ||
          risk.id?.toLowerCase().includes(lowerQuery)
        );
      }
    });
  };

  const filteredIBMRisks = useMemo(() => filterRisks(ibmRisks, searchQuery), [ibmRisks, searchQuery]);
  const filteredMITRisks = useMemo(() => filterRisks(mitRisks, searchQuery), [mitRisks, searchQuery]);
  const filteredOWASPRisks = useMemo(() => filterRisks(owaspRisks, searchQuery), [owaspRisks, searchQuery]);

  // Toggle risk selection
  const toggleRiskSelection = (source: string, id: string) => {
    const key = `${source}:${id}`;
    const newSelection = new Set(selectedRisks);
    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }
    setSelectedRisks(newSelection);
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
      // Transform selected risks into API format
      const risksToImport = Array.from(selectedRisks).map(key => {
        const [source, sourceId] = key.split(':');
        return { source, sourceId };
      });

      const response = await fetch(`/api/risks/${useCaseId}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedRisks: risksToImport }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import risks');
      }

      const result = await response.json();

      toast({
        title: 'Risks Imported',
        description: `Successfully imported ${result.imported} risk(s) to your use case`,
      });

      // Clear selection and close
      setSelectedRisks(new Set());
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import risks',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Browse All Risk Databases</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Manually explore and select risks from IBM Risk Atlas (113), MIT AI Risk Repository (611), and OWASP Top 10 for LLMs (10)
          </p>

          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search risks by title, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ibm" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              IBM ({filteredIBMRisks.length})
            </TabsTrigger>
            <TabsTrigger value="mit" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              MIT ({filteredMITRisks.length})
            </TabsTrigger>
            <TabsTrigger value="owasp" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              OWASP ({filteredOWASPRisks.length})
            </TabsTrigger>
          </TabsList>

          {/* IBM Risks */}
          <TabsContent value="ibm" className="flex-1 overflow-y-auto mt-4 space-y-3">
            {filteredIBMRisks.map((risk) => (
              <RiskCard
                key={risk.Id}
                source="ibm"
                risk={risk}
                selected={selectedRisks.has(`ibm:${risk.Id}`)}
                onToggle={() => toggleRiskSelection('ibm', String(risk.Id))}
              />
            ))}
            {filteredIBMRisks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No IBM risks found matching your search
              </div>
            )}
          </TabsContent>

          {/* MIT Risks */}
          <TabsContent value="mit" className="flex-1 overflow-y-auto mt-4 space-y-3">
            {filteredMITRisks.map((risk) => (
              <RiskCard
                key={risk.Id}
                source="mit"
                risk={risk}
                selected={selectedRisks.has(`mit:${risk.Id}`)}
                onToggle={() => toggleRiskSelection('mit', String(risk.Id))}
              />
            ))}
            {filteredMITRisks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No MIT risks found matching your search
              </div>
            )}
          </TabsContent>

          {/* OWASP Risks */}
          <TabsContent value="owasp" className="flex-1 overflow-y-auto mt-4 space-y-3">
            {filteredOWASPRisks.map((risk) => (
              <OwaspRiskCard
                key={risk.id}
                risk={risk}
                selected={selectedRisks.has(`owasp:${risk.id}`)}
                onToggle={() => toggleRiskSelection('owasp', risk.id)}
              />
            ))}
            {filteredOWASPRisks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No OWASP risks found matching your search
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedRisks.size} risk(s) selected for import
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={selectedRisks.size === 0 || importing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Import Selected Risks
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Risk Card for IBM/MIT
function RiskCard({
  source,
  risk,
  selected,
  onToggle,
}: {
  source: string;
  risk: ExternalRisk;
  selected: boolean;
  onToggle: () => void;
}) {
  const sourceColor = source === 'ibm' ? 'blue' : 'purple';
  const bgColor = source === 'ibm'
    ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
    : 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800';

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        selected ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md'
      } ${bgColor}`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggle}
              className="h-4 w-4"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-xs text-muted-foreground">ID: {risk.Id}</span>
            <Badge variant="outline" className={`text-xs bg-${sourceColor}-100 dark:bg-${sourceColor}-900`}>
              {risk.RiskCategory}
            </Badge>
          </div>
          <h4 className="font-semibold text-foreground mb-2">{risk.Summary}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{risk.Description}</p>
          <div className="flex items-center gap-3 mt-3 text-xs">
            <Badge variant="secondary">{risk.RiskSeverity}</Badge>
            <Badge variant="secondary">{risk.Likelihood}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

// OWASP Risk Card
function OwaspRiskCard({
  risk,
  selected,
  onToggle,
}: {
  risk: OwaspRisk;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`border bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 rounded-lg p-4 cursor-pointer transition-all ${
        selected ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggle}
              className="h-4 w-4"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-xs text-muted-foreground">{risk.id}</span>
            <Badge variant="outline" className="text-xs bg-red-100 dark:bg-red-900">
              Rank #{risk.rank}
            </Badge>
          </div>
          <h4 className="font-semibold text-foreground mb-2">{risk.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{risk.description}</p>
          <div className="flex items-center gap-3 mt-3 text-xs">
            <Badge variant="destructive">{risk.severity}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
