'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Database,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  Sparkles,
  BarChart3,
  Info,
  Settings,
  GitBranch
} from 'lucide-react';
import EntryCollector from './EntryCollector';
import { GoldenDataset, GoldenEntry, DatasetStatistics } from '@/lib/golden/types';

interface GoldenDatasetDashboardProps {
  useCaseId: string;
}

const GoldenDatasetDashboard: React.FC<GoldenDatasetDashboardProps> = ({ useCaseId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [datasets, setDatasets] = useState<GoldenDataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<GoldenDataset | null>(null);
  const [entries, setEntries] = useState<GoldenEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCollector, setShowCollector] = useState(false);
  const [statistics, setStatistics] = useState<Partial<DatasetStatistics>>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDatasets();
  }, [useCaseId]);

  useEffect(() => {
    if (selectedDataset) {
      fetchEntries(selectedDataset.id);
      fetchStatistics(selectedDataset.id);
    }
  }, [selectedDataset]);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/golden/datasets?useCaseId=${useCaseId}`);
      if (response.ok) {
        const data = await response.json();
        setDatasets(data);
        if (data.length > 0 && !selectedDataset) {
          setSelectedDataset(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async (datasetId: string) => {
    try {
      const response = await fetch(`/api/golden/entries?datasetId=${datasetId}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const fetchStatistics = async (datasetId: string) => {
    // Mock statistics - would fetch from API
    setStatistics({
      totalEntries: entries.length,
      byCategory: {
        functional: 45,
        edge_case: 20,
        adversarial: 15,
        safety: 10,
        performance: 10
      },
      byDifficulty: {
        easy: 25,
        medium: 40,
        hard: 25,
        expert: 10
      },
      avgQualityScore: 0.82,
      coverage: {
        domainCoverage: 0.75,
        featureCoverage: 0.80,
        edgeCaseCoverage: 0.60
      }
    });
  };

  const createDataset = async () => {
    const name = prompt('Enter dataset name:');
    if (!name) return;

    try {
      const response = await fetch('/api/golden/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          useCaseId,
          name,
          description: `Golden dataset for ${name}`,
          metadata: {
            domain: 'general',
            useCase: name,
            modelType: 'generation',
            createdBy: 'user'
          }
        })
      });

      if (response.ok) {
        await fetchDatasets();
      }
    } catch (error) {
      console.error('Error creating dataset:', error);
    }
  };

  const collectFromProduction = async () => {
    if (!selectedDataset) return;

    setRefreshing(true);
    try {
      const response = await fetch('/api/golden/collect/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetId: selectedDataset.id,
          filters: {},
          limit: 50
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Collected ${result.entriesCreated} entries from production`);
        await fetchEntries(selectedDataset.id);
      }
    } catch (error) {
      console.error('Error collecting from production:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const generateSynthetic = async () => {
    if (!selectedDataset) return;

    setRefreshing(true);
    try {
      const response = await fetch('/api/golden/collect/synthetic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetId: selectedDataset.id,
          count: 20,
          strategy: 'augmentation'
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Generated ${result.entriesCreated} synthetic entries`);
        await fetchEntries(selectedDataset.id);
      }
    } catch (error) {
      console.error('Error generating synthetic entries:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const exportDataset = async () => {
    if (!selectedDataset) return;

    window.open(`/api/golden/datasets/export?id=${selectedDataset.id}&format=json`, '_blank');
  };

  const deleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(`/api/golden/entries?id=${entryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setEntries(entries.filter(e => e.id !== entryId));
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      functional: 'default',
      edge_case: 'secondary',
      adversarial: 'destructive',
      safety: 'destructive',
      performance: 'outline',
      quality: 'outline',
      robustness: 'secondary',
      fairness: 'default',
      compliance: 'secondary',
      user_experience: 'default'
    };
    return colors[category] || 'default';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'outline',
      medium: 'secondary',
      hard: 'default',
      expert: 'destructive'
    };
    return colors[difficulty] || 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Golden Dataset Collection
          </span>
          <div className="flex gap-2">
            {selectedDataset && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCollector(!showCollector)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={collectFromProduction}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  From Production
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateSynthetic}
                  disabled={refreshing}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Synthetic
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportDataset}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </>
            )}
            <Button
              size="sm"
              onClick={createDataset}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Dataset
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Dataset selector */}
        {datasets.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              {datasets.map(dataset => (
                <Button
                  key={dataset.id}
                  variant={selectedDataset?.id === dataset.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDataset(dataset)}
                >
                  {dataset.name}
                  <Badge variant="secondary" className="ml-2">
                    {dataset.statistics?.totalEntries || 0}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Entry collector */}
        {showCollector && selectedDataset && (
          <div className="mb-6">
            <EntryCollector
              datasetId={selectedDataset.id}
              onSave={() => {
                setShowCollector(false);
                fetchEntries(selectedDataset.id);
              }}
              onCancel={() => setShowCollector(false)}
            />
          </div>
        )}

        {/* Main content */}
        {selectedDataset ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="entries">Entries</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Statistics cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{statistics.totalEntries || 0}</div>
                    <p className="text-xs text-muted-foreground">Total Entries</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {((statistics.avgQualityScore || 0) * 100).toFixed(0)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Avg Quality</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {((statistics.coverage?.domainCoverage || 0) * 100).toFixed(0)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Coverage</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {Object.keys(statistics.byCategory || {}).length}
                    </div>
                    <p className="text-xs text-muted-foreground">Categories</p>
                  </CardContent>
                </Card>
              </div>

              {/* Category distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(statistics.byCategory || {}).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getCategoryColor(category) as any}>
                            {category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{count} entries</span>
                        </div>
                        <Progress 
                          value={(count / (statistics.totalEntries || 1)) * 100} 
                          className="w-32 h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Difficulty distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Difficulty Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-around">
                    {Object.entries(statistics.byDifficulty || {}).map(([difficulty, count]) => (
                      <div key={difficulty} className="text-center">
                        <Badge 
                          variant={getDifficultyColor(difficulty) as any}
                          className="mb-2"
                        >
                          {difficulty}
                        </Badge>
                        <div className="text-2xl font-bold">{count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="entries" className="space-y-4">
              {/* Entries list */}
              <div className="space-y-2">
                {entries.map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getCategoryColor(entry.category) as any}>
                              {entry.category}
                            </Badge>
                            <Badge variant={getDifficultyColor(entry.metadata.difficulty || 'medium') as any}>
                              {entry.metadata.difficulty}
                            </Badge>
                            {entry.metadata.isEdgeCase && (
                              <Badge variant="outline">Edge Case</Badge>
                            )}
                            {entry.metadata.isAdversarial && (
                              <Badge variant="destructive">Adversarial</Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium mb-1">
                            {entry.input?.prompt ? (
                              <>
                                {entry.input.prompt.substring(0, 150)}
                                {entry.input.prompt.length > 150 && '...'}
                              </>
                            ) : (
                              <span className="text-muted-foreground">No prompt provided</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.expectedOutputs?.[0]?.content ? (
                              <>
                                {entry.expectedOutputs[0].content.substring(0, 150)}
                                {entry.expectedOutputs[0].content.length > 150 && '...'}
                              </>
                            ) : (
                              'No expected output defined'
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => deleteEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {entries.length === 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No entries in this dataset yet. Add entries manually or collect from production.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="quality" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quality Dimensions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['Completeness', 'Correctness', 'Consistency', 'Clarity', 'Diversity', 'Relevance'].map(dimension => (
                        <div key={dimension} className="flex items-center justify-between">
                          <span className="text-sm">{dimension}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={70 + Math.random() * 30} className="w-24 h-2" />
                            <span className="text-sm font-medium">
                              {(70 + Math.random() * 30).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quality Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          5 duplicate entries detected
                        </AlertDescription>
                      </Alert>
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Low coverage for edge cases (60%)
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Add more diverse edge case examples</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Review and remove duplicate entries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Increase adversarial examples for robustness</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Uses</span>
                        <span className="font-medium">1,234</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Unique Users</span>
                        <span className="font-medium">56</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Uses/Day</span>
                        <span className="font-medium">42</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Success Rate</span>
                        <span className="font-medium">94.2%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Growth Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Entries This Week</span>
                        <span className="font-medium text-green-600">+47</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Quality Trend</span>
                        <span className="font-medium text-green-600">↑ 5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Coverage Improvement</span>
                        <span className="font-medium text-green-600">+12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Active Contributors</span>
                        <span className="font-medium">8</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Dataset quality has improved by 15% over the last 30 days
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {loading ? 'Loading datasets...' : 'Create a dataset to get started with golden data collection'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default GoldenDatasetDashboard;