'use client';

import { useState, useEffect } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users, Building2, Mail, UserPlus } from 'lucide-react';

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

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Fetch all use cases on mount
  useEffect(() => {
    const fetchUseCases = async () => {
      setUseCasesLoading(true);
      try {
        const res = await fetch('/api/read-usecases');
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

  // Simple analytics: count orgs, users
  const totalOrgs = organizations.length;
  const totalUsers = organizations.reduce((sum, org) => sum + org.users.length, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error Loading Admin Dashboard</h1>
        <p className="mb-4 text-gray-700">{error}</p>
        <Button onClick={fetchOrganizations} className="bg-blue-500 text-white">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Admin Dashboard Header and Analytics */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">QZen Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage organizations and platform-wide settings</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowCreateOrg(true)}>
          <Plus className="w-4 h-4" />
          Create Organization
        </Button>
      </div>

      {orgSuccess && <div className="text-green-600 font-semibold">{orgSuccess}</div>}

      {/* Create Organization Modal */}
      {showCreateOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Organization</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name *</Label>
                <Input id="orgName" value={newOrgName} onChange={e => setNewOrgName(e.target.value)} placeholder="Enter organization name" />
              </div>
              <div>
                <Label htmlFor="orgDomain">Domain (Optional)</Label>
                <Input id="orgDomain" value={newOrgDomain} onChange={e => setNewOrgDomain(e.target.value)} placeholder="example.com" />
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Organization Admin Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="adminFirstName">First Name</Label>
                    <Input id="adminFirstName" value={adminFirstName} onChange={e => setAdminFirstName(e.target.value)} placeholder="Admin" />
                  </div>
                  <div>
                    <Label htmlFor="adminLastName">Last Name</Label>
                    <Input id="adminLastName" value={adminLastName} onChange={e => setAdminLastName(e.target.value)} placeholder="User" />
                  </div>
                  <div>
                    <Label htmlFor="adminEmail">Email *</Label>
                    <Input id="adminEmail" type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="admin@example.com" />
                  </div>
                </div>
              </div>
              {error && <div className="text-red-600 font-semibold">{error}</div>}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateOrganization} disabled={!newOrgName || !adminEmail}>Create Organization</Button>
                <Button variant="outline" onClick={() => setShowCreateOrg(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Platform Summary</CardTitle>
          <CardDescription>Organizations and user management</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-8 flex-wrap">
          <div>
            <div className="text-2xl font-bold">{totalOrgs}</div>
            <div className="text-gray-600">Organizations</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <div className="text-gray-600">Users</div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations List */}
      <div className="grid gap-6">
        <h2 className="text-2xl font-semibold">Organizations</h2>
        {organizations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Organizations Yet</h3>
              <p className="text-gray-500 mb-4">Create your first organization to get started</p>
              <Button onClick={() => setShowCreateOrg(true)}>
                Create Organization
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {organizations.map((org) => (
              <Card key={org.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {org.name}
                      </CardTitle>
                      {org.domain && (
                        <CardDescription>Domain: {org.domain}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {org.users.length} users
                      </Badge>
                      <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={() => {
                        setInviteModalOrgId(org.id);
                        setInviteEmail('');
                        setInviteRole('ORG_USER');
                        setInviteError(null);
                        setInviteSuccess(null);
                      }}>
                        <UserPlus className="w-4 h-4" /> Invite User
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Users</h4>
                      <div className="grid gap-2">
                        {org.users.map((user) => (
                          <div key={user.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">
                                {user.firstName} {user.lastName}
                              </span>
                              <span className="text-gray-500 ml-2">({user.email})</span>
                            </div>
                            <Badge variant={user.role === 'ORG_ADMIN' ? 'default' : 'secondary'}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Invite User</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="inviteEmail">Email *</Label>
                <Input id="inviteEmail" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="user@example.com" />
              </div>
              <div>
                <Label htmlFor="inviteRole">Role *</Label>
                <select id="inviteRole" value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="ORG_USER">ORG_USER</option>
                  <option value="ORG_ADMIN">ORG_ADMIN</option>
                </select>
              </div>
              {inviteError && <div className="text-red-600 font-semibold">{inviteError}</div>}
              {inviteSuccess && <div className="text-green-600 font-semibold">{inviteSuccess}</div>}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleInviteUser} disabled={inviteLoading || !inviteEmail}>Send Invite</Button>
                <Button variant="outline" onClick={() => setInviteModalOrgId(null)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 