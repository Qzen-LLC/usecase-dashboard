"use client";

import { useState, useEffect } from "react";
import { useStableRender } from "@/hooks/useStableRender";
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

  // Create Organization
  const handleCreateOrganization = async () => {
    if (!newOrgName || !adminEmail) {
      setOrgSuccess(null);
      setError("Organization name and admin email are required");
      return;
    }
    setError(null);
    setOrgSuccess(null);
    try {
      const response = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newOrgName,
          domain: newOrgDomain || undefined,
          adminEmail,
          adminFirstName: adminFirstName || "Admin",
          adminLastName: adminLastName || "User",
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
        setOrgSuccess("Organization created successfully!");
        fetchOrganizations();
      } else {
        setError(data.error || "Failed to create organization");
      }
    } catch (error) {
      setError("Failed to create organization");
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
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="orgDomain"
                    className="text-sm font-medium text-foreground mb-2 block"
                  >
                    Domain (Optional)
                  </Label>
                  <Input
                    id="orgDomain"
                    value={newOrgDomain}
                    onChange={(e) => setNewOrgDomain(e.target.value)}
                    placeholder="example.com"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Organization Admin Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label
                        id="adminFirstName"
                        className="text-sm font-medium text-foreground mb-2 block"
                      >
                        First Name
                      </Label>
                      <Input
                        id="adminFirstName"
                        value={adminFirstName}
                        onChange={(e) => setAdminFirstName(e.target.value)}
                        placeholder="First Name"
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <Label
                        id="adminLastName"
                        className="text-sm font-medium text-foreground mb-2 block"
                      >
                        Last Name
                      </Label>
                      <Input
                        id="adminLastName"
                        value={adminLastName}
                        onChange={(e) => setAdminLastName(e.target.value)}
                        placeholder="Last Name"
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="adminEmail"
                        className="text-sm font-medium text-foreground mb-2 block"
                      >
                        Email *
                      </Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@example.com"
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCreateOrganization}
                    disabled={!newOrgName || !adminEmail}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl"
                  >
                    Create Organization
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateOrg(false)}
                    className="flex-1 border-border text-foreground hover:bg-muted px-6 py-3 rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
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
                  className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl overflow-hidden"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl text-foreground truncate">
                            {org.name}
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className="px-3 py-1 rounded-full flex-shrink-0"
                          >
                            {org.users.length}{" "}
                            {org.users.length === 1 ? "User" : "Users"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="px-3 py-1 rounded-full flex-shrink-0"
                          >
                            {org.useCases.length}{" "}
                            {org.useCases.length === 1
                              ? "Use Case"
                              : "Use Cases"}
                          </Badge>
                        </div>
                        {org.domain && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Globe className="w-4 h-4" />
                            <span>{org.domain}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setInviteModalOrgId(org.id);
                            setInviteEmail("");
                            setInviteRole("ORG_USER");
                            setInviteError(null);
                            setInviteSuccess(null);
                          }}
                          className="border-border text-black text-blackhover:bg-muted whitespace-nowrap"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Invite User
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrgId(
                              selectedOrgId === org.id ? null : org.id
                            );
                          }}
                          className="border-border text-black hover:bg-muted whitespace-nowrap"
                        >
                          <BarChart3 className="w-4 h-4" />
                          {selectedOrgId === org.id ? "Hide" : "Show"} Use Cases
                        </Button>
                        
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteOrganization(org.id, org.name)
                          }
                          disabled={deleteLoading === org.id}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded border-2 border-red-700 min-w-[100px]"
                          title="Delete Organization"
                          style={{
                            display: "inline-block",
                            visibility: "visible",
                            opacity: 1,
                            position: "relative",
                            zIndex: 9999,
                            minWidth: "100px",
                            backgroundColor: "#ef4444",
                            borderColor: "#b91c1c",
                            color: "white",
                            fontWeight: "bold"
                          }}
                        >
                          {deleteLoading === org.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b border-white mx-auto"></div>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-1 inline" />
                              DELETE
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Users List */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Organization Users
                      </h4>
                      <div className="grid gap-3">
                        {org.users.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {user.firstName?.[0]}
                                  {user.lastName?.[0]}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={
                                user.role === "ORG_ADMIN"
                                  ? "default"
                                  : "secondary"
                              }
                              className="px-3 py-1 rounded-full"
                            >
                              {user.role === "ORG_ADMIN" ? "Admin" : "User"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Use Cases List (Conditional) */}
                    {selectedOrgId === org.id && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Use Cases
                        </h4>
                        {useCasesLoading ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">
                              Loading use cases...
                            </p>
                          </div>
                        ) : useCasesError ? (
                          <div className="text-center py-4">
                            <p className="text-sm text-destructive">
                              {useCasesError}
                            </p>
                          </div>
                        ) : filteredUseCases.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">
                              No use cases found for this organization.
                            </p>
                          </div>
                        ) : (
                          <div className="grid gap-2">
                            {filteredUseCases.map((useCase) => (
                              <div
                                key={useCase.id}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-foreground truncate">
                                    {useCase.title}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Stage: {useCase.stage} • Priority:{" "}
                                    {useCase.priority}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Invite User Modal */}
        {inviteModalOrgId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="bg-card rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Invite User
                  </h2>
                  <p className="text-muted-foreground">
                    Send invitation to join{" "}
                    {organizations.find((o) => o.id === inviteModalOrgId)?.name}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
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
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="inviteRole"
                    className="text-sm font-medium text-foreground mb-2 block"
                  >
                    Role
                  </Label>
                  <select
                    id="inviteRole"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    <option value="ORG_USER">Organization User</option>
                    <option value="ORG_ADMIN">Organization Admin</option>
                  </select>
                </div>

                {/* Success/Error Messages */}
                {inviteSuccess && (
                  <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-success font-medium">
                      {inviteSuccess}
                    </span>
                  </div>
                )}
                {inviteError && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    <span className="text-destructive font-medium">
                      {inviteError}
                    </span>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleInviteUser}
                    disabled={!inviteEmail || inviteLoading}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl"
                  >
                    {inviteLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b border-primary-foreground"></div>
                        Sending Invite...
                      </div>
                    ) : (
                      "Send Invitation"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setInviteModalOrgId(null);
                      setInviteEmail("");
                      setInviteRole("ORG_USER");
                      setInviteError(null);
                      setInviteSuccess(null);
                    }}
                    className="flex-1 border-border text-black hover:bg-muted px-6 py-3 rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
