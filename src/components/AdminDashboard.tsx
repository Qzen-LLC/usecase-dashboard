"use client";

import { useState, useEffect } from "react";
import { useStableRender } from "@/hooks/useStableRender";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
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
  Globe,
  HelpCircle,
  ChevronDown,
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
  organizationId: string; // Added for global use case list
}

export default function AdminDashboard() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
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
  const [allUseCases, setAllUseCases] = useState<UseCase[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null); // null = All Organizations
  const [useCasesLoading, setUseCasesLoading] = useState(true);
  const [useCasesError, setUseCasesError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  
  // Use global stable render hook
  const { isReady } = useStableRender();

  useEffect(() => {
    if (isReady) {
      fetchOrganizations();
    }
  }, [isReady]);

  // Fetch all use cases on mount
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

  // Helper: orgId -> orgName
  const orgIdToName = (id: string) => {
    const org = organizations.find((o) => o.id === id);
    return org ? org.name : "Unknown Org";
  };

  // Filtered use cases
  const filteredUseCases = selectedOrgId
    ? allUseCases.filter((uc) => uc.organizationId === selectedOrgId)
    : allUseCases;

  // Don't render until mounted and theme is ready to prevent hydration mismatch
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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

  // Navigation handlers
  const handleNavigateToQuestionTemplates = () => {
    router.push('/admin/configure-questions');
  };

  const handleNavigateToOrgQuestions = (orgId: string) => {
    router.push(`/dashboard/configure-questions?orgId=${orgId}`);
  };

  // Create Organization
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
        // Reset form
        setNewOrgName("");
        setNewOrgDomain("");
        setAdminEmail("");
        setAdminFirstName("");
        setAdminLastName("");
        setShowCreateOrg(false);
        
        // Set success message
        setOrgSuccess("Organization created successfully! Redirecting to configure questions...");
        
        // Refresh organizations list
        await fetchOrganizations();
        
        // Redirect to question configuration page after a short delay
        console.log('Redirecting to:', `/admin/configure-questions?orgId=${data.organization.id}`);
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

  // Invite User/Admin
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
        setInviteSuccess("Invitation sent successfully!");
        setInviteEmail("");
        setInviteRole("ORG_USER");
        fetchOrganizations();
      } else {
        setInviteError(data.error || "Failed to send invitation");
      }
    } catch (error) {
      setInviteError("Failed to send invitation");
    } finally {
      setInviteLoading(false);
    }
  };

  // Delete Organization
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

  // Simple analytics: count orgs, users
  const totalOrgs = organizations.length;
  const totalUsers = organizations.reduce(
    (sum, org) => sum + org.users.length,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground font-medium">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
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
                onClick={fetchOrganizations}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Modern Header */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent leading-tight">
                QUBE Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-3 text-lg">
                Manage organizations and platform-wide settings
              </p>
            </div>
            <Button
              className="flex items-center gap-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-primary-foreground px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0"
              onClick={() => setShowCreateOrg(true)}
            >
              <Plus className="w-6 h-6" />
              Create Organization
            </Button>
          </div>
        </div>

        {/* Question Management Section */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-primary" />
                Question Management
              </h2>
              <p className="text-muted-foreground mt-2">
                Configure global question templates and organization-specific questions
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Question Templates Button */}
              <Button
                onClick={handleNavigateToQuestionTemplates}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Settings className="w-5 h-5" />
                Question Templates
              </Button>
              
              {/* Organization Questions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-3 border-border text-foreground hover:bg-muted px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Building2 className="w-5 h-5" />
                    Organization Questions
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
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
        </div>

        {/* Success/Error Messages */}
        {orgSuccess && (
          <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-success font-medium">{orgSuccess}</span>
          </div>
        )}
        {deleteError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-destructive rounded-full"></div>
            <span className="text-destructive font-medium">{deleteError}</span>
          </div>
        )}

        {/* Create Organization Modal */}
        {showCreateOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="bg-card rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Create New Organization
                  </h2>
                  <p className="text-muted-foreground">
                    Set up a new organization with admin access
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="orgName"
                    className="text-sm font-medium text-foreground mb-2 block"
                  >
                    Organization Name *
                  </Label>
                  <Input
                    id="orgName"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Enter organization name"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="orgDomain"
                    className="text-sm font-medium text-foreground mb-2 block"
                  >
                    Organization Domain (Optional)
                  </Label>
                  <Input
                    id="orgDomain"
                    value={newOrgDomain}
                    onChange={(e) => setNewOrgDomain(e.target.value)}
                    placeholder="example.com"
                    className="w-full"
                  />
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Admin User Details
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label
                        htmlFor="adminFirstName"
                        className="text-sm font-medium text-foreground mb-2 block"
                      >
                        First Name
                      </Label>
                      <Input
                        id="adminFirstName"
                        value={adminFirstName}
                        onChange={(e) => setAdminFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="adminLastName"
                        className="text-sm font-medium text-foreground mb-2 block"
                      >
                        Last Name
                      </Label>
                      <Input
                        id="adminLastName"
                        value={adminLastName}
                        onChange={(e) => setAdminLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="adminEmail"
                      className="text-sm font-medium text-foreground mb-2 block"
                    >
                      Admin Email *
                    </Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
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
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isCreatingOrg ? "Creating..." : "Create Organization"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Organizations
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {totalOrgs}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {totalUsers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Use Cases
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {allUseCases.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organizations List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Building2 className="w-6 h-6 text-primary" />
              Organizations
            </h2>
            <Badge variant="secondary" className="px-3 py-1 rounded-full">
              {organizations.length}{" "}
              {organizations.length === 1 ? "Organization" : "Organizations"}
            </Badge>
          </div>

          {organizations.length === 0 ? (
            <Card className="bg-card border border-border shadow-sm rounded-2xl">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Organizations Yet
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your first organization to get started with the
                  platform
                </p>
                <Button
                  onClick={() => setShowCreateOrg(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl"
                >
                  Create Organization
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {organizations.map((org) => (
                <Card
                  key={org.id}
                  className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-foreground">
                            {org.name}
                          </h3>
                          {org.domain && (
                            <Badge variant="outline" className="px-3 py-1 rounded-full">
                              {org.domain}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">
                              {org.users.length} user{org.users.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <BarChart3 className="w-4 h-4" />
                            <span className="text-sm">
                              {org.useCases.length} use case{org.useCases.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {org.users.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Users:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {org.users.map((user) => (
                                <Badge
                                  key={user.id}
                                  variant="outline"
                                  className="px-2 py-1 text-xs"
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
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setInviteModalOrgId(org.id);
                            setInviteEmail("");
                            setInviteRole("ORG_USER");
                          }}
                          className="border-border text-foreground hover:bg-muted"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Invite User
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteOrganization(org.id, org.name)}
                          disabled={deleteLoading === org.id}
                          className="border-destructive text-destructive hover:bg-destructive/10"
                        >
                          {deleteLoading === org.id ? (
                            <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin mr-2" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Invite User Modal */}
        {inviteModalOrgId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="bg-card rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Invite User
                  </h2>
                  <p className="text-muted-foreground">
                    Send an invitation to join the organization
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="inviteEmail"
                    className="text-sm font-medium text-foreground mb-2 block"
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="inviteRole"
                    className="text-sm font-medium text-foreground mb-2 block"
                  >
                    Role *
                  </Label>
                  <select
                    id="inviteRole"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="ORG_USER">Organization User</option>
                    <option value="ORG_ADMIN">Organization Admin</option>
                  </select>
                </div>
              </div>

              {inviteError && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-destructive text-sm">{inviteError}</p>
                </div>
              )}

              {inviteSuccess && (
                <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-md">
                  <p className="text-success text-sm">{inviteSuccess}</p>
                </div>
              )}

              <div className="flex gap-3 mt-8">
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
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {inviteLoading ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
