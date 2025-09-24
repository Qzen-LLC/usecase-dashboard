"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  Save,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Loader2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { FileUpload } from "@/components/ui/file-upload";
import { useGovernanceLock } from '@/hooks/useGovernanceLock';

interface SubclauseInstance {
  id: string;
  implementation: string;
  evidenceFiles: string[];
  status: string;
  subclause: {
    subclauseId: string;
    title: string;
    summary: string;
    questions: string[];
    evidenceExamples: string[];
  };
}

interface AnnexInstance {
  id: string;
  implementation: string;
  evidenceFiles: string[];
  status: string;
  item: {
    itemId: string;
    title: string;
    description: string;
    guidance: string;
    category: {
      title: string;
    };
  };
}

interface Clause {
  id: string;
  clauseId: string;
  title: string;
  description: string;
  orderIndex: number;
  subclauses: {
    id: string;
    subclauseId: string;
    title: string;
    summary: string;
    questions: string[];
    evidenceExamples: string[];
    orderIndex: number;
  }[];
}

interface AnnexCategory {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  orderIndex: number;
  items: {
    id: string;
    itemId: string;
    title: string;
    description: string;
    guidance: string;
    orderIndex: number;
  }[];
}

interface Assessment {
  id: string;
  useCaseId: string;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  subclauses: SubclauseInstance[];
  annexes: AnnexInstance[];
}

export default function Iso27001AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const useCaseId = params.useCaseId as string;

  const [clauses, setClauses] = useState<Clause[]>([]);
  const [annexCategories, setAnnexCategories] = useState<AnnexCategory[]>([]);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"clauses" | "annex">("clauses");
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(
    new Set()
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [savingFiles, setSavingFiles] = useState<Set<string>>(new Set());
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Lock management system
  const {
    lockInfo,
    isLocked,
    canEdit,
    acquireLock,
    releaseLock,
    refreshLockStatus,
    loading: lockLoading,
    error: lockError
  } = useGovernanceLock(useCaseId, 'GOVERNANCE_ISO_27001');

  // Auto-acquire lock when component mounts (like other frameworks)
  useEffect(() => {
    if (useCaseId && !lockInfo?.hasLock && !lockLoading) {
      console.log('🔒 Auto-acquiring lock for ISO 27001 assessment...');
      acquireLock();
    }
  }, [useCaseId, lockInfo?.hasLock, lockLoading, acquireLock]);

  // Add debounce mechanism to prevent duplicate API calls (only for subclauses now)
  const [pendingEvidenceChanges, setPendingEvidenceChanges] = useState<
    Map<string, NodeJS.Timeout>
  >(new Map());

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchAssessmentData();
  }, [useCaseId]);

  // Cleanup: Release lock when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      // Release lock when component unmounts
      if (lockInfo?.hasLock && canEdit) {
        console.log('🔒 Component unmounting, releasing lock...');
        // Use sendBeacon for reliable delivery during navigation
        const data = new FormData();
        data.append('useCaseId', useCaseId);
        data.append('lockType', 'EXCLUSIVE');
        data.append('scope', 'GOVERNANCE_ISO_27001');
        
        try {
          navigator.sendBeacon('/api/locks/release', data);
          console.log('🔒 Lock release beacon sent');
        } catch (error) {
          console.error('🔒 Failed to send lock release beacon:', error);
        }
      }
    };
  }, [useCaseId, lockInfo?.hasLock, canEdit]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      pendingEvidenceChanges.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, [pendingEvidenceChanges]);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      const [clausesResponse, annexResponse, assessmentResponse] =
        await Promise.all([
          fetch("/api/iso-27001/clauses"),
          fetch("/api/iso-27001/annex"),
          fetch(`/api/iso-27001/assessment/by-usecase/${useCaseId}`),
        ]);

      if (!clausesResponse.ok || !annexResponse.ok) {
        throw new Error(
          `Failed to fetch framework data: ${clausesResponse.status} ${annexResponse.status}`
        );
      }

      // Debug the responses
      console.log('ISO 27001 Debug - API Responses:', {
        clausesResponse: { ok: clausesResponse.ok, status: clausesResponse.status },
        annexResponse: { ok: annexResponse.ok, status: annexResponse.status },
        assessmentResponse: { ok: assessmentResponse.ok, status: assessmentResponse.status }
      });

      // Handle assessment response separately to provide better error messages
      if (!assessmentResponse.ok) {
        console.error('ISO 27001 Debug - Assessment response not ok:', {
          status: assessmentResponse.status,
          statusText: assessmentResponse.statusText
        });
        
        const errorData = await assessmentResponse.json();
        console.error('ISO 27001 Debug - Assessment error data:', errorData);
        
        if (assessmentResponse.status === 404) {
          setError(
            `${errorData.message || "Use case not found"}\n\nSuggestions:\n• ${
              errorData.suggestions?.join("\n• ") || "Check the use case ID"
            }`
          );
          return;
        } else if (assessmentResponse.status === 503) {
          setError(
            `${errorData.message || "Service unavailable"}\n\nSuggestions:\n• ${
              errorData.suggestions?.join("\n• ") || "Contact support"
            }`
          );
          return;
        } else {
          throw new Error(
            `API Error: ${
              errorData.message || "Failed to fetch assessment data"
            }`
          );
        }
      }

      const clausesData = await clausesResponse.json();
      const annexData = await annexResponse.json();
      const assessmentData = await assessmentResponse.json();

      // Debug logging
      console.log("ISO 27001 Debug - Clauses loaded:", {
        clausesCount: clausesData.length,
        firstClause: clausesData[0]?.clauseId,
        firstClauseSubclauses: clausesData[0]?.subclauses?.length || 0,
      });

      // Check if framework tables are available
      if (clausesData.length === 0) {
        setError(
          "ISO 27001 framework tables need to be set up. Please run the database setup scripts to enable full functionality."
        );
        return;
      }

      // Handle different error types from the API
      if (assessmentData.status === "not_available") {
        if (assessmentData.error === "USE_CASE_NOT_FOUND") {
          setError(
            `${
              assessmentData.message
            }\n\nSuggestions:\n• ${assessmentData.suggestions?.join("\n• ")}`
          );
        } else {
          setError(
            "Use case not found. Please ensure you are accessing a valid use case from the dashboard."
          );
        }
        return;
      }

      if (assessmentData.status === "framework_missing") {
        setError(
          `${
            assessmentData.message
          }\n\nSuggestions:\n• ${assessmentData.suggestions?.join("\n• ")}`
        );
        return;
      }

      if (assessmentData.status === "error") {
        setError(
          `Database error: ${assessmentData.message}\n\nDetails: ${assessmentData.details}`
        );
        return;
      }

      setClauses(clausesData);
      setAnnexCategories(annexData);
      setAssessment(assessmentData);

      // Expand first clause by default
      if (clausesData.length > 0) {
        setExpandedClauses(new Set([clausesData[0].clauseId]));
      }

      // Expand first annex category by default
      if (annexData.length > 0) {
        setExpandedCategories(new Set([annexData[0].categoryId]));
      }
    } catch (err) {
      console.error("Error fetching ISO 27001 assessment data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading the assessment"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImplementationChange = async (
    subclauseId: string,
    implementation: string
  ) => {
    if (!assessment || !canEdit) return;

    try {
      setSaving(true);
      const response = await fetch(
        `/api/iso-27001/subclause/${assessment.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subclauseId,
            implementation,
            evidenceFiles: [], // Keep existing files
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('ISO 27001 Subclause API Error:', errorData);
        
        // Handle specific error cases
        if (response.status === 409) {
          throw new Error("This subclause is already being edited. Please refresh the page and try again.");
        } else if (response.status === 403) {
          throw new Error("You don't have permission to edit this assessment.");
        } else if (response.status === 404) {
          throw new Error("Assessment not found. Please refresh the page and try again.");
        } else {
          throw new Error(errorData.error || "Failed to save implementation");
        }
      }

      const updatedInstance = await response.json();

      // Update the assessment state
      setAssessment((prev) => {
        if (!prev) return prev;

        const updatedSubclauses = prev.subclauses.map((sub) =>
          sub.subclause.subclauseId === subclauseId
            ? { ...sub, implementation, status: updatedInstance.status }
            : sub
        );

        return {
          ...prev,
          subclauses: updatedSubclauses,
        };
      });

      // Update progress
      await updateProgress();
    } catch (err) {
      console.error("Error saving implementation:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save implementation"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAnnexImplementationChange = async (
    itemId: string,
    implementation: string
  ) => {
    if (!assessment || !canEdit) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/iso-27001/annex/${assessment.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          implementation,
          evidenceFiles: [], // Keep existing files
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('ISO 27001 Annex API Error:', errorData);
        
        // Handle specific error cases
        if (response.status === 409) {
          throw new Error("This annex item is already being edited. Please refresh the page and try again.");
        } else if (response.status === 403) {
          throw new Error("You don't have permission to edit this assessment.");
        } else if (response.status === 404) {
          throw new Error("Assessment not found. Please refresh the page and try again.");
        } else {
          throw new Error(errorData.error || "Failed to save implementation");
        }
      }

      const updatedInstance = await response.json();

      // Update the assessment state
      setAssessment((prev) => {
        if (!prev) return prev;

        const updatedAnnexes = prev.annexes.map((annex) =>
          annex.item.itemId === itemId
            ? { ...annex, implementation, status: updatedInstance.status }
            : annex
        );

        return {
          ...prev,
          annexes: updatedAnnexes,
        };
      });

      // Update progress
      await updateProgress();
    } catch (err) {
      console.error("Error saving annex implementation:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save implementation"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEvidenceUpload = async (
    subclauseId: string,
    files: File[]
  ) => {
    if (!assessment || !canEdit || files.length === 0) return;

    const fileKey = `subclause-${subclauseId}`;
    setSavingFiles((prev) => new Set(prev).add(fileKey));

    try {
      // Clear any pending changes for this subclause
      const existingTimeout = pendingEvidenceChanges.get(subclauseId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        pendingEvidenceChanges.delete(subclauseId);
      }

      // Get current evidence files
      const currentInstance = assessment.subclauses.find(
        (sub) => sub.subclause.subclauseId === subclauseId
      );
      const currentFiles = currentInstance?.evidenceFiles || [];

      // Upload files and get URLs
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const uploadData = await uploadResponse.json();
        uploadedUrls.push(uploadData.url);
      }

      // Combine with existing files
      const allFiles = [...currentFiles, ...uploadedUrls];

      // Debounce the API call
      const timeoutId = setTimeout(async () => {
        try {
          const response = await fetch(
            `/api/iso-27001/subclause/${assessment.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                subclauseId,
                implementation: currentInstance?.implementation || "",
                evidenceFiles: allFiles,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to save evidence files");
          }

          const updatedInstance = await response.json();

          // Update the assessment state
          setAssessment((prev) => {
            if (!prev) return prev;

            const updatedSubclauses = prev.subclauses.map((sub) =>
              sub.subclause.subclauseId === subclauseId
                ? { ...sub, evidenceFiles: allFiles, status: updatedInstance.status }
                : sub
            );

            return {
              ...prev,
              subclauses: updatedSubclauses,
            };
          });

          // Update progress
          await updateProgress();
        } catch (err) {
          console.error("Error saving evidence files:", err);
          setError(
            err instanceof Error ? err.message : "Failed to save evidence files"
          );
        } finally {
          setSavingFiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(fileKey);
            return newSet;
          });
        }
      }, 1000); // 1 second debounce

      setPendingEvidenceChanges((prev) => {
        const newMap = new Map(prev);
        newMap.set(subclauseId, timeoutId);
        return newMap;
      });
    } catch (err) {
      console.error("Error uploading evidence files:", err);
      setError(
        err instanceof Error ? err.message : "Failed to upload evidence files"
      );
      setSavingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileKey);
        return newSet;
      });
    }
  };

  const handleAnnexEvidenceUpload = async (
    itemId: string,
    files: File[]
  ) => {
    if (!assessment || !canEdit || files.length === 0) return;

    const fileKey = `annex-${itemId}`;
    setSavingFiles((prev) => new Set(prev).add(fileKey));

    try {
      // Get current evidence files
      const currentInstance = assessment.annexes.find(
        (annex) => annex.item.itemId === itemId
      );
      const currentFiles = currentInstance?.evidenceFiles || [];

      // Upload files and get URLs
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const uploadData = await uploadResponse.json();
        uploadedUrls.push(uploadData.url);
      }

      // Combine with existing files
      const allFiles = [...currentFiles, ...uploadedUrls];

      const response = await fetch(`/api/iso-27001/annex/${assessment.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          implementation: currentInstance?.implementation || "",
          evidenceFiles: allFiles,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save evidence files");
      }

      const updatedInstance = await response.json();

      // Update the assessment state
      setAssessment((prev) => {
        if (!prev) return prev;

        const updatedAnnexes = prev.annexes.map((annex) =>
          annex.item.itemId === itemId
            ? { ...annex, evidenceFiles: allFiles, status: updatedInstance.status }
            : annex
        );

        return {
          ...prev,
          annexes: updatedAnnexes,
        };
      });

      // Update progress
      await updateProgress();
    } catch (err) {
      console.error("Error uploading annex evidence files:", err);
      setError(
        err instanceof Error ? err.message : "Failed to upload evidence files"
      );
    } finally {
      setSavingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileKey);
        return newSet;
      });
    }
  };

  const updateProgress = async () => {
    if (!assessment) return;

    try {
      const totalSubclauses = clauses.reduce(
        (total, clause) => total + clause.subclauses.length,
        0
      );
      const totalAnnexItems = annexCategories.reduce(
        (total, category) => total + category.items.length,
        0
      );

      const completedSubclauses = assessment.subclauses.filter(
        (sub) => sub.status === "implemented"
      ).length;
      const completedAnnexItems = assessment.annexes.filter(
        (annex) => annex.status === "implemented"
      ).length;

      const totalItems = totalSubclauses + totalAnnexItems;
      const completedItems = completedSubclauses + completedAnnexItems;
      const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

      const response = await fetch(
        `/api/iso-27001/assessment/${assessment.id}/progress`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ progress }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update progress");
      }

      const updatedAssessment = await response.json();
      setAssessment((prev) =>
        prev ? { ...prev, progress: updatedAssessment.progress } : prev
      );
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

  const toggleClauseExpansion = (clauseId: string) => {
    setExpandedClauses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clauseId)) {
        newSet.delete(clauseId);
      } else {
        newSet.add(clauseId);
      }
      return newSet;
    });
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "implemented":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "implemented":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading ISO 27001 assessment...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span>Error Loading Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {error}
                </p>
                <div className="flex space-x-2">
                  <Button onClick={fetchAssessmentData} variant="outline">
                    Try Again
                  </Button>
                  <Link href="/dashboard/governance">
                    <Button variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Governance
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/governance">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Governance
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">ISO 27001 Assessment</h1>
              <p className="text-muted-foreground">
                Information Security Management System (ISMS) Assessment
              </p>
            </div>
          </div>

          {/* Lock Status */}
          <div className="flex items-center space-x-4">
            {lockInfo?.hasLock && canEdit && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full text-sm">
                <Lock className="h-4 w-4" />
                <span>You have edit access</span>
              </div>
            )}
            {lockInfo?.hasLock && !canEdit && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-full text-sm">
                <Lock className="h-4 w-4" />
                <span>Read-only mode</span>
              </div>
            )}
            {!lockInfo?.hasLock && lockLoading && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Acquiring lock...</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        {assessment && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Assessment Progress</span>
                <Badge
                  variant={assessment.status === "completed" ? "default" : "secondary"}
                  className={assessment.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" : ""}
                >
                  {assessment.status === "completed" ? "Completed" : "In Progress"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Track your progress through the ISO 27001 requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(assessment.progress)}%
                  </span>
                </div>
                <Progress value={assessment.progress} className="h-2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>
                      {assessment.subclauses.filter(
                        (sub) => sub.status === "implemented"
                      ).length}{" "}
                      Subclauses Completed
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>
                      {assessment.annexes.filter(
                        (annex) => annex.status === "implemented"
                      ).length}{" "}
                      Annex Items Completed
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>
                      {assessment.subclauses.reduce(
                        (total, sub) => total + sub.evidenceFiles.length,
                        0
                      ) +
                        assessment.annexes.reduce(
                          (total, annex) => total + annex.evidenceFiles.length,
                          0
                        )}{" "}
                      Evidence Files
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === "clauses" ? "default" : "outline"}
            onClick={() => setActiveTab("clauses")}
            className="flex items-center space-x-2"
          >
            <BookOpen className="h-4 w-4" />
            <span>Clauses ({clauses.length})</span>
          </Button>
          <Button
            variant={activeTab === "annex" ? "default" : "outline"}
            onClick={() => setActiveTab("annex")}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Annex A ({annexCategories.length} categories)</span>
          </Button>
        </div>

        {/* Clauses Tab */}
        {activeTab === "clauses" && (
          <div className="space-y-6">
            {clauses.map((clause) => (
              <Card key={clause.id}>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => toggleClauseExpansion(clause.clauseId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {expandedClauses.has(clause.clauseId) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          {clause.clauseId} - {clause.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {clause.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {clause.subclauses.length} subclauses
                    </Badge>
                  </div>
                </CardHeader>
                {expandedClauses.has(clause.clauseId) && (
                  <CardContent>
                    <div className="space-y-4">
                      {clause.subclauses.map((subclause) => {
                        const instance = assessment?.subclauses.find(
                          (sub) => sub.subclause.subclauseId === subclause.subclauseId
                        );
                        const isSaving = savingFiles.has(`subclause-${subclause.subclauseId}`);

                        return (
                          <div
                            key={subclause.id}
                            className="border rounded-lg p-4 space-y-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm">
                                  {subclause.subclauseId} - {subclause.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {subclause.summary}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                {getStatusIcon(instance?.status || "not_started")}
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(instance?.status || "not_started")}
                                >
                                  {instance?.status || "Not Started"}
                                </Badge>
                              </div>
                            </div>

                            {/* Key Questions */}
                            {subclause.questions.length > 0 && (
                              <div>
                                <h5 className="font-medium text-sm mb-2">Key Questions:</h5>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                  {subclause.questions.map((question, index) => (
                                    <li key={index}>{question}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Evidence Examples */}
                            {subclause.evidenceExamples.length > 0 && (
                              <div>
                                <h5 className="font-medium text-sm mb-2">Evidence Examples:</h5>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                  {subclause.evidenceExamples.map((example, index) => (
                                    <li key={index}>{example}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Implementation */}
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Implementation Details
                              </label>
                              <textarea
                                value={instance?.implementation || ""}
                                onChange={(e) =>
                                  handleImplementationChange(
                                    subclause.subclauseId,
                                    e.target.value
                                  )
                                }
                                placeholder="Describe how this requirement is implemented in your organization..."
                                className="w-full p-3 border rounded-md resize-none"
                                rows={4}
                                disabled={!canEdit}
                              />
                            </div>

                            {/* Evidence Files */}
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Evidence Files
                              </label>
                              <FileUpload
                                onUpload={(files) =>
                                  handleEvidenceUpload(subclause.subclauseId, files)
                                }
                                existingFiles={instance?.evidenceFiles || []}
                                disabled={!canEdit}
                                isUploading={isSaving}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Annex Tab */}
        {activeTab === "annex" && (
          <div className="space-y-6">
            {annexCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => toggleCategoryExpansion(category.categoryId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {expandedCategories.has(category.categoryId) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          {category.categoryId} - {category.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {category.items.length} items
                    </Badge>
                  </div>
                </CardHeader>
                {expandedCategories.has(category.categoryId) && (
                  <CardContent>
                    <div className="space-y-4">
                      {category.items.map((item) => {
                        const instance = assessment?.annexes.find(
                          (annex) => annex.item.itemId === item.itemId
                        );
                        const isSaving = savingFiles.has(`annex-${item.itemId}`);

                        return (
                          <div
                            key={item.id}
                            className="border rounded-lg p-4 space-y-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm">
                                  {item.itemId} - {item.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                                {item.guidance && (
                                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                    <h5 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-1">
                                      Guidance:
                                    </h5>
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                      {item.guidance}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                {getStatusIcon(instance?.status || "NOT_STARTED")}
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(instance?.status || "NOT_STARTED")}
                                >
                                  {instance?.status || "Not Started"}
                                </Badge>
                              </div>
                            </div>

                            {/* Implementation */}
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Implementation Details
                              </label>
                              <textarea
                                value={instance?.implementation || ""}
                                onChange={(e) =>
                                  handleAnnexImplementationChange(
                                    item.itemId,
                                    e.target.value
                                  )
                                }
                                placeholder="Describe how this control is implemented in your organization..."
                                className="w-full p-3 border rounded-md resize-none"
                                rows={4}
                                disabled={!canEdit}
                              />
                            </div>

                            {/* Evidence Files */}
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Evidence Files
                              </label>
                              <FileUpload
                                onUpload={(files) =>
                                  handleAnnexEvidenceUpload(item.itemId, files)
                                }
                                existingFiles={instance?.evidenceFiles || []}
                                disabled={!canEdit}
                                isUploading={isSaving}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}