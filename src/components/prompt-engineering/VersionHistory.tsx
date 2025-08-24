'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GitBranch,
  Clock,
  User,
  ChevronRight,
  FileText,
  Hash,
  ArrowUpRight
} from 'lucide-react';

interface Version {
  id: string;
  versionSha: string;
  versionNumber: number;
  content: any;
  settings: any;
  variables: string[];
  commitMessage: string;
  createdAt: string;
  createdBy: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

interface VersionHistoryProps {
  promptId: string;
}

export default function VersionHistory({ promptId }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  useEffect(() => {
    fetchVersions();
  }, [promptId]);

  const fetchVersions = async () => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/versions`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data);
        if (data.length > 0) {
          setSelectedVersion(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateSha = (sha: string) => {
    return sha.substring(0, 8);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <GitBranch className="w-16 h-16 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-600">
            No version history available
          </h3>
          <p className="text-gray-500 max-w-md">
            Version history will appear here as you make changes to the prompt.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Version List */}
      <div className="lg:col-span-1 space-y-3">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Version History</h3>
        {versions.map((version) => (
          <Card 
            key={version.id}
            className={`cursor-pointer transition-all ${
              selectedVersion?.id === version.id 
                ? 'ring-2 ring-blue-500 shadow-md' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedVersion(version)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    v{version.versionNumber}
                  </Badge>
                  <code className="text-xs text-gray-500">
                    {truncateSha(version.versionSha)}
                  </code>
                </div>
                {selectedVersion?.id === version.id && (
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                )}
              </div>
              
              <p className="text-sm font-medium mb-1">{version.commitMessage}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>
                    {version.createdBy?.firstName 
                      ? `${version.createdBy.firstName} ${version.createdBy.lastName || ''}`
                      : version.createdBy?.email}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(version.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Version Details */}
      {selectedVersion && (
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Version {selectedVersion.versionNumber}</CardTitle>
                  <CardDescription>{selectedVersion.commitMessage}</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Deploy This Version
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Version Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">SHA-256 Hash</p>
                  <code className="text-sm font-mono">{selectedVersion.versionSha}</code>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Created</p>
                  <p className="text-sm">{formatDate(selectedVersion.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Author</p>
                  <p className="text-sm">
                    {selectedVersion.createdBy?.firstName 
                      ? `${selectedVersion.createdBy.firstName} ${selectedVersion.createdBy.lastName || ''}`
                      : selectedVersion.createdBy?.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Variables</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedVersion.variables.length > 0 ? (
                      selectedVersion.variables.map((variable) => (
                        <Badge key={variable} variant="secondary" className="text-xs">
                          {variable}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">None</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Content</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {typeof selectedVersion.content === 'string' 
                      ? selectedVersion.content
                      : JSON.stringify(selectedVersion.content, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Settings */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Model Settings</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <pre className="text-sm font-mono">
                    {JSON.stringify(selectedVersion.settings, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}