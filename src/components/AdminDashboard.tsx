'use client';

import { useState, useEffect } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users, Building2, Mail, UserPlus, Trash2, Settings, BarChart3, Shield, Globe } from 'lucide-react';

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
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDomain, setNewOrgDomain] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [inviteModalOrgId, setInviteModalOrgId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('ORG_USER');
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

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Fetch all use cases on mount
  useEffect(() => {
    const fetchUseCases = async () => {
      setUseCasesLoading(true);
      try {
        const res = await fetch(`/api/read-usecases?t=${Date.now()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch use cases');
        setAllUseCases(data.useCases || []);
      } catch (err: any) {
        setUseCasesError(err.message || 'Unknown error');
      } finally {
        setUseCasesLoading(false);
      }
    };
    fetchUseCases();
  }, []);

  // Helper: orgId -> orgName
  const orgIdToName = (id: string) => {
    const org = organizations.find(o => o.id === id);
    return org ? org.name : 'Unknown Org';
  };

  // Filtered use cases
  const filteredUseCases = selectedOrgId
    ? allUseCases.filter(uc => uc.organizationId === selectedOrgId)
    : allUseCases;

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const orgRes = await fetch('/api/admin/organizations');
      const orgData = await orgRes.json();
      if (!orgRes.ok) throw new Error(orgData.error || 'Failed to fetch organizations');
      setOrganizations(orgData.organizations || []);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Create Organization
  const handleCreateOrganization = async () => {
    if (!newOrgName || !adminEmail) {
      setOrgSuccess(null);
      setError('Organization name and admin email are required');
      return;
    }
    setError(null);
    setOrgSuccess(null);
    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOrgName,
          domain: newOrgDomain || undefined,
          adminEmail,
          adminFirstName: adminFirstName || 'Admin',
          adminLastName: adminLastName || 'User',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setNewOrgName('');
        setNewOrgDomain('');
        setAdminEmail('');
        setAdminFirstName('');
        setAdminLastName('');
        setShowCreateOrg(false);
        setOrgSuccess('Organization created successfully!');
        fetchOrganizations();
      } else {
        setError(data.error || 'Failed to create organization');
      }
    } catch (error) {
      setError('Failed to create organization');
    }
  };

  // Invite User/Admin
  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteRole || !inviteModalOrgId) {
      setInviteError('Email and role are required');
      return;
    }
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          organizationId: inviteModalOrgId,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setInviteSuccess('Invitation sent successfully!');
        setInviteEmail('');
        setInviteRole('ORG_USER');
        fetchOrganizations();
      } else {
        setInviteError(data.error || 'Failed to send invitation');
      }
    } catch (error) {
      setInviteError('Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  // Delete Organization
  const handleDeleteOrganization = async (orgId: string, orgName: string) => {
    if (!confirm(`Are you sure you want to delete "${orgName}"? This action cannot be undone and will delete all associated data including users, use cases, and vendors.`)) {
      return;
    }
    
    setDeleteLoading(orgId);
    setDeleteError(null);
    try {
      const response = await fetch(`/api/admin/organizations?id=${orgId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchOrganizations();
      } else {
        setDeleteError(data.error || 'Failed to delete organization');
      }
    } catch (error) {
      setDeleteError('Failed to delete organization');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Simple analytics: count orgs, users
  const totalOrgs = organizations.length;
  const totalUsers = organizations.reduce((sum, org) => sum + org.users.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Error Loading Admin Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={fetchOrganizations} className="w-full bg-blue-600 hover:bg-blue-700">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Modern Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QUBE Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage organizations and platform-wide settings</p>
            </div>
            <Button 
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
              onClick={() => setShowCreateOrg(true)}
            >
              <Plus className="w-5 h-5" />
              Create Organization
            </Button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {orgSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-800 font-medium">{orgSuccess}</span>
          </div>
        )}
        {deleteError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-800 font-medium">{deleteError}</span>
          </div>
        )}

        {/* Create Organization Modal */}
        {showCreateOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create New Organization</h2>
                  <p className="text-gray-600">Set up a new organization with admin access</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="orgName" className="text-sm font-medium text-gray-700 mb-2 block">Organization Name *</Label>
                  <Input 
                    id="orgName" 
                    value={newOrgName} 
                    onChange={e => setNewOrgName(e.target.value)} 
                    placeholder="Enter organization name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <Label htmlFor="orgDomain" className="text-sm font-medium text-gray-700 mb-2 block">Domain (Optional)</Label>
                  <Input 
                    id="orgDomain" 
                    value={newOrgDomain} 
                    onChange={e => setNewOrgDomain(e.target.value)} 
                    placeholder="example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Organization Admin Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="adminFirstName" className="text-sm font-medium text-gray-700 mb-2 block">First Name</Label>
                      <Input 
                        id="adminFirstName" 
                        value={adminFirstName} 
                        onChange={e => setAdminFirstName(e.target.value)} 
                        placeholder="Admin"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <Label htmlFor="adminLastName" className="text-sm font-medium text-gray-700 mb-2 block">Last Name</Label>
                      <Input 
                        id="adminLastName" 
                        value={adminLastName} 
                        onChange={e => setAdminLastName(e.target.value)} 
                        placeholder="User"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <Label htmlFor="adminEmail" className="text-sm font-medium text-gray-700 mb-2 block">Email *</Label>
                      <Input 
                        id="adminEmail" 
                        type="email" 
                        value={adminEmail} 
                        onChange={e => setAdminEmail(e.target.value)} 
                        placeholder="admin@example.com"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-800 font-medium">{error}</span>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleCreateOrganization} 
                    disabled={!newOrgName || !adminEmail}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl"
                  >
                    Create Organization
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateOrg(false)}
                    className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Organizations</p>
                  <p className="text-3xl font-bold text-gray-900">{totalOrgs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Use Cases</p>
                  <p className="text-3xl font-bold text-gray-900">{allUseCases.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-3xl font-bold text-gray-900">{organizations.filter(org => org.users.length > 0).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organizations List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-6 h-6 text-blue-600" />
              Organizations
            </h2>
            <Badge variant="secondary" className="px-3 py-1 rounded-full">
              {organizations.length} {organizations.length === 1 ? 'Organization' : 'Organizations'}
            </Badge>
          </div>
          
          {organizations.length === 0 ? (
            <Card className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Organizations Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">Create your first organization to get started with managing users and use cases</p>
                <Button 
                  onClick={() => setShowCreateOrg(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl"
                >
                  Create Organization
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {organizations.map((org) => (
                <Card key={org.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          {org.name}
                        </CardTitle>
                        {org.domain && (
                          <CardDescription className="mt-2 flex items-center gap-2 text-gray-600">
                            <Globe className="w-4 h-4" />
                            {org.domain}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 rounded-full">
                          <Users className="w-3 h-3" />
                          {org.users.length} users
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1 border-gray-200 hover:bg-gray-50 rounded-xl px-3 py-1" 
                          onClick={() => {
                            setInviteModalOrgId(org.id);
                            setInviteEmail('');
                            setInviteRole('ORG_USER');
                            setInviteError(null);
                            setInviteSuccess(null);
                          }}
                        >
                          <UserPlus className="w-4 h-4" /> 
                          Invite User
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white border-red-600 px-3 py-1 rounded-xl"
                          onClick={() => handleDeleteOrganization(org.id, org.name)}
                          disabled={deleteLoading === org.id}
                        >
                          {deleteLoading === org.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          {deleteLoading === org.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-600" />
                          Users
                        </h4>
                        <div className="grid gap-3">
                          {org.users.map((user) => (
                            <div key={user.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </span>
                                  <span className="text-gray-500 ml-2">({user.email})</span>
                                </div>
                              </div>
                              <Badge 
                                variant={user.role === 'ORG_ADMIN' ? 'default' : 'secondary'}
                                className="px-3 py-1 rounded-full"
                              >
                                {user.role}
                              </Badge>
                            </div>
                          ))}
                        </div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Invite User</h2>
                  <p className="text-gray-600">Send invitation to join the organization</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="inviteEmail" className="text-sm font-medium text-gray-700 mb-2 block">Email *</Label>
                  <Input 
                    id="inviteEmail" 
                    type="email" 
                    value={inviteEmail} 
                    onChange={e => setInviteEmail(e.target.value)} 
                    placeholder="user@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <Label htmlFor="inviteRole" className="text-sm font-medium text-gray-700 mb-2 block">Role *</Label>
                  <select 
                    id="inviteRole" 
                    value={inviteRole} 
                    onChange={e => setInviteRole(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ORG_USER">ORG_USER</option>
                    <option value="ORG_ADMIN">ORG_ADMIN</option>
                  </select>
                </div>
                
                {inviteError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-800 font-medium">{inviteError}</span>
                  </div>
                )}
                {inviteSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-800 font-medium">{inviteSuccess}</span>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleInviteUser} 
                    disabled={inviteLoading || !inviteEmail}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl"
                  >
                    Send Invite
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setInviteModalOrgId(null)}
                    className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl"
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