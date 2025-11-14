"use client";

import { useState, useEffect } from "react";
import { useStableRender } from "@/hooks/useStableRender";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Users,
  Building2,
  Mail,
  UserPlus,
  Trash2,
  Settings,
  BarChart3,
  Shield,
  HelpCircle,
  ChevronDown,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  domain?: string;
  users: User[];
  useCases: UseCase[];
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
}

interface UseCase {
  id: string;
  title: string;
  stage: string;
  priority: string;
  organizationId: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [activeSection, setActiveSection] = useState<"organizations" | "questions" | "models">("organizations");
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDomain, setNewOrgDomain] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [inviteModalOrgId, setInviteModalOrgId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("ORG_USER");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [orgSuccess, setOrgSuccess] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [allUseCases, setAllUseCases] = useState<UseCase[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [useCasesLoading, setUseCasesLoading] = useState(true);
  const [useCasesError, setUseCasesError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  
  const { isReady } = useStableRender();

  useEffect(() => {
    if (isReady) {
      fetchOrganizations();
    }
  }, [isReady]);

  const searchParams = useSearchParams();
  useEffect(() => {
    if (!searchParams) return;
    const invited = searchParams.get('invited');
    const email = searchParams.get('email');
    if (invited === '1') {
      setGlobalSuccess(email ? `Invitation sent to ${email}` : 'Invitation sent successfully!');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isReady) {
      const fetchUseCases = async () => {
        setUseCasesLoading(true);
        try {
          const res = await fetch(`/api/read-usecases`);
          const data = await res.json();
          if (!res.ok)
            throw new Error(data.error || "Failed to fetch use cases");
          setAllUseCases(data.useCases || []);
        } catch (err: any) {
          setUseCasesError(err.message || "Unknown error");
        } finally {
          setUseCasesLoading(false);
        }
      };
      fetchUseCases();
    }
  }, [isReady]);

  const orgIdToName = (id: string) => {
    const org = organizations.find((o) => o.id === id);
    return org ? org.name : "Unknown Org";
  };

  const filteredUseCases = selectedOrgId
    ? allUseCases.filter((uc) => uc.organizationId === selectedOrgId)
    : allUseCases;

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const orgRes = await fetch("/api/admin/organizations");
      const orgData = await orgRes.json();
      if (!orgRes.ok)
        throw new Error(orgData.error || "Failed to fetch organizations");
      setOrganizations(orgData.organizations || []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToQuestionTemplates = () => {
    router.push('/admin/configure-questions');
  };

  const handleNavigateToOrgQuestions = (orgId: string) => {
    router.push(`/dashboard/configure-questions?orgId=${orgId}`);
  };

  const handleNavigateToOrgModels = (orgId: string) => {
    router.push(`/dashboard/configure-models?orgId=${orgId}`);
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim() || !adminEmail.trim()) {
      setError("Organization name and admin email are required");
      return;
    }

    setIsCreatingOrg(true);
    setError(null);
    setOrgSuccess(null);

    try {
      const response = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newOrgName.trim(),
          domain: newOrgDomain.trim() || undefined,
          adminEmail: adminEmail.trim(),
          adminFirstName: adminFirstName.trim() || undefined,
          adminLastName: adminLastName.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewOrgName("");
        setNewOrgDomain("");
        setAdminEmail("");
        setAdminFirstName("");
        setAdminLastName("");
        setShowCreateOrg(false);
        setOrgSuccess("Organization created successfully! Redirecting to configure questions...");
        await fetchOrganizations();
        setTimeout(() => {
          router.push(`/admin/configure-questions?orgId=${data.organization.id}`);
        }, 2000);
      } else {
        setError(data.error || "Failed to create organization");
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      setError("Failed to create organization");
    } finally {
      setIsCreatingOrg(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteRole || !inviteModalOrgId) {
      setInviteError("Email and role are required");
      return;
    }
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      const response = await fetch("/api/invitations/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          organizationId: inviteModalOrgId,
        }),
      });
      const data = await response.json();
      if (data.success) {
        const emailParam = encodeURIComponent(inviteEmail);
        setInviteModalOrgId(null);
        setInviteEmail("");
        setInviteRole("ORG_USER");
        fetchOrganizations();
        router.push(`/admin?invited=1&email=${emailParam}`);
      } else {
        setInviteError(data.error || "Failed to send invitation");
      }
    } catch (error) {
      setInviteError("Failed to send invitation");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeleteOrganization = async (orgId: string, orgName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${orgName}"? This action cannot be undone and will delete all associated data including users, use cases, and vendors.`
      )
    ) {
      return;
    }

    setDeleteLoading(orgId);
    setDeleteError(null);
    try {
      const response = await fetch(`/api/admin/organizations?id=${orgId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchOrganizations();
      } else {
        setDeleteError(data.error || "Failed to delete organization");
      }
    } catch (error) {
      setDeleteError("Failed to delete organization");
    } finally {
      setDeleteLoading(null);
    }
  };

  const totalOrgs = organizations.length;
  const totalUsers = organizations.reduce(
    (sum, org) => sum + org.users.length,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !showCreateOrg) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <Card className="border-destructive bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Error Loading Admin Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive mb-4">{error}</p>
              <Button
                onClick={() => {
                  setError(null);
                  fetchOrganizations();
                }}
                className="w-full"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              QUBE Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Manage organizations and platform-wide settings
            </p>
          </div>
        </div>

        {/* Statistics Cards - Smaller size */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <Card className="hover:shadow-md transition-shadow rounded border-l-4 border-l-blue-500">
            <CardContent className="p-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Organizations
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalOrgs}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow rounded border-l-4 border-l-green-500">
            <CardContent className="p-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Users
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalUsers}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow rounded border-l-4 border-l-purple-500">
            <CardContent className="p-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Use Cases
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {allUseCases.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success/Error Messages */}
        {orgSuccess && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <p className="text-green-800 dark:text-green-200 text-sm font-medium">{orgSuccess}</p>
          </div>
        )}
        {deleteError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-800 dark:text-red-200 text-sm font-medium">{deleteError}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex items-center gap-8 border-b border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setActiveSection("organizations")}
              className={`pb-3 px-1 font-medium text-sm transition-colors ${
                activeSection === "organizations"
                  ? "text-green-800 dark:text-green-600 border-b-2 border-green-800 dark:border-green-600 -mb-[1px]"
                  : "text-gray-600 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-400"
              }`}
            >
              Organizations
            </button>
            <button
              onClick={() => setActiveSection("questions")}
              className={`pb-3 px-1 font-medium text-sm transition-colors ${
                activeSection === "questions"
                  ? "text-green-800 dark:text-green-600 border-b-2 border-green-800 dark:border-green-600 -mb-[1px]"
                  : "text-gray-600 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-400"
              }`}
            >
              Question Management
            </button>
            <button
              onClick={() => setActiveSection("models")}
              className={`pb-3 px-1 font-medium text-sm transition-colors ${
                activeSection === "models"
                  ? "text-green-800 dark:text-green-600 border-b-2 border-green-800 dark:border-green-600 -mb-[1px]"
                  : "text-gray-600 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-400"
              }`}
            >
              Model Management
            </button>
          </div>
        </div>

        {/* Organizations Section */}
        {activeSection === "organizations" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Organizations
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage and configure organization settings
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="px-3 py-1.5 shrink-0">
                  {organizations.length} {organizations.length === 1 ? "Organization" : "Organizations"}
                </Badge>
                <Button
                  onClick={() => setShowCreateOrg(true)}
                  className="shrink-0"
                  size="default"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Organization
                </Button>
              </div>
            </div>

            {organizations.length === 0 ? (
            <Card className="rounded">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Organizations Yet
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your first organization to get started with the platform
                </p>
                <Button onClick={() => setShowCreateOrg(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Organization
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {organizations.map((org) => (
                <Card key={org.id} className="hover:shadow-lg transition-all rounded">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-1.5">{org.name}</CardTitle>
                        {org.domain && (
                          <Badge variant="outline" className="text-xs">
                            {org.domain}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-4 h-4 shrink-0" />
                        <span className="font-medium">{org.users.length}</span>
                        <span className="text-xs">user{org.users.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <BarChart3 className="w-4 h-4 shrink-0" />
                        <span className="font-medium">{org.useCases.length}</span>
                        <span className="text-xs">use case{org.useCases.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {org.users.length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Users
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {org.users.map((user) => (
                            <Badge
                              key={user.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.email}
                              {user.role === 'ORG_ADMIN' && (
                                <span className="ml-1 text-primary">(Admin)</span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInviteModalOrgId(org.id);
                          setInviteEmail("");
                          setInviteRole("ORG_USER");
                        }}
                        className="flex-1"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite User
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteOrganization(org.id, org.name)}
                        disabled={deleteLoading === org.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                      >
                        {deleteLoading === org.id ? (
                          <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          </div>
        )}

        {/* Question Management Section */}
        {activeSection === "questions" && (
          <div>
            <Card className="mb-6 rounded">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 mb-1">
                      <HelpCircle className="w-5 h-5 text-primary" />
                      Question Management
                    </CardTitle>
                    <CardDescription>
                      Configure global question templates and organization-specific questions
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={handleNavigateToQuestionTemplates}
                      variant="outline"
                      className="justify-start sm:justify-center"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Question Templates
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="justify-start sm:justify-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Organization Questions
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        {organizations.length === 0 ? (
                          <DropdownMenuItem disabled>
                            <span className="text-muted-foreground">No organizations available</span>
                          </DropdownMenuItem>
                        ) : (
                          organizations.map((org) => (
                            <DropdownMenuItem
                              key={org.id}
                              onClick={() => handleNavigateToOrgQuestions(org.id)}
                              className="cursor-pointer"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{org.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {org.users.length} user{org.users.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </DropdownMenuItem>
                          ))
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Question Management Section */}
        {activeSection === "models" && (
          <div>
            <Card className="mb-6 rounded">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 mb-1">
                      <HelpCircle className="w-5 h-5 text-primary" />
                      Model Management
                    </CardTitle>
                    <CardDescription>
                      Configure organization-specific AI models
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="justify-start sm:justify-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Organization Models
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        {organizations.length === 0 ? (
                          <DropdownMenuItem disabled>
                            <span className="text-muted-foreground">No organizations available</span>
                          </DropdownMenuItem>
                        ) : (
                          organizations.map((org) => (
                            <DropdownMenuItem
                              key={org.id}
                              onClick={() => handleNavigateToOrgModels(org.id)}
                              className="cursor-pointer"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{org.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {org.users.length} user{org.users.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </DropdownMenuItem>
                          ))
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Create Organization Modal */}
        {showCreateOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg shadow-2xl rounded">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Create New Organization</CardTitle>
                      <CardDescription>Set up a new organization with admin access</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCreateOrg(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="orgName" className="mb-2">
                    Organization Name *
                  </Label>
                  <Input
                    id="orgName"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Enter organization name"
                  />
                </div>

                <div>
                  <Label htmlFor="orgDomain" className="mb-2">
                    Organization Domain (Optional)
                  </Label>
                  <Input
                    id="orgDomain"
                    value={newOrgDomain}
                    onChange={(e) => setNewOrgDomain(e.target.value)}
                    placeholder="example.com"
                  />
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Admin User Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="adminFirstName" className="mb-2">
                        First Name
                      </Label>
                      <Input
                        id="adminFirstName"
                        value={adminFirstName}
                        onChange={(e) => setAdminFirstName(e.target.value)}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="adminLastName" className="mb-2">
                        Last Name
                      </Label>
                      <Input
                        id="adminLastName"
                        value={adminLastName}
                        onChange={(e) => setAdminLastName(e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="adminEmail" className="mb-2">
                      Admin Email *
                    </Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateOrg(false)}
                    className="flex-1"
                    disabled={isCreatingOrg}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateOrganization}
                    disabled={isCreatingOrg || !newOrgName.trim() || !adminEmail.trim()}
                    className="flex-1"
                  >
                    {isCreatingOrg ? "Creating..." : "Create Organization"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Invite User Modal */}
        {inviteModalOrgId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md shadow-2xl rounded">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Invite User</CardTitle>
                      <CardDescription>Send an invitation to join the organization</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setInviteModalOrgId(null);
                      setInviteEmail("");
                      setInviteRole("ORG_USER");
                      setInviteError(null);
                      setInviteSuccess(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="inviteEmail" className="mb-2">
                    Email Address *
                  </Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="inviteRole" className="mb-2">
                    Role *
                  </Label>
                  <select
                    id="inviteRole"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="ORG_USER">Organization User</option>
                    <option value="ORG_ADMIN">Organization Admin</option>
                  </select>
                </div>

                {inviteError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                    <p className="text-red-800 dark:text-red-200 text-sm">{inviteError}</p>
                  </div>
                )}

                {inviteSuccess && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                    <p className="text-green-800 dark:text-green-200 text-sm">{inviteSuccess}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setInviteModalOrgId(null);
                      setInviteEmail("");
                      setInviteRole("ORG_USER");
                      setInviteError(null);
                      setInviteSuccess(null);
                    }}
                    className="flex-1"
                    disabled={inviteLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInviteUser}
                    disabled={inviteLoading || !inviteEmail.trim()}
                    className="flex-1"
                  >
                    {inviteLoading ? "Sending..." : "Send Invitation"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Invitation Success Modal */}
        {globalSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md shadow-2xl rounded">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle>Invitation Sent</CardTitle>
                    <CardDescription>The user has been invited successfully</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded mb-4">
                  <p className="text-green-800 dark:text-green-200 font-medium">{globalSuccess}</p>
                </div>
                <Button onClick={() => setGlobalSuccess(null)} className="w-full">
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
