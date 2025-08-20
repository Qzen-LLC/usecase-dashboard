'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Trash2, UserCheck, UserX, Mail, Calendar, Shield, UserPlus, AlertCircle } from 'lucide-react';
import { useUserData } from '@/contexts/UserContext';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function OrganizationUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserRole, setNewUserRole] = useState('USER');
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [removeUserLoading, setRemoveUserLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { userData } = useUserData();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Get organization ID from user data
  const orgId = userData?.organizationId;

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/organizations/users');
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail) {
      setError('Email is required');
      return;
    }
    if (!orgId) {
      setError('Organization ID not found. Please refresh and try again.');
      return;
    }
    
    setAddUserLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserEmail,
          role: newUserRole,
          organizationId: orgId
        })
      });
      const data = await response.json();
      if (data.success) {
        setNewUserEmail('');
        setNewUserFirstName('');
        setNewUserLastName('');
        setNewUserRole('USER');
        setShowAddUser(false);
        setSuccess('Invitation sent successfully!');
        fetchUsers();
      } else {
        setError(data.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      setError('Failed to send invitation');
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the organization?')) {
      return;
    }

    setRemoveUserLoading(userId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/organizations/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('User removed successfully!');
        fetchUsers();
      } else {
        setError(data.error || 'Failed to remove user');
      }
    } catch (error) {
      console.error('Error removing user:', error);
      setError('Failed to remove user');
    } finally {
      setRemoveUserLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading user management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Modern Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                User Management
              </h1>
              <p className="text-gray-600 mt-3 text-lg">Manage users within your organization</p>
            </div>
            <Button 
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0" 
              onClick={() => setShowAddUser(true)}
            >
              <UserPlus className="w-6 h-6" />
              Add User
            </Button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-800 font-medium">{success}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
                  <p className="text-gray-600">Send invitation to join your organization</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userFirstName" className="text-sm font-medium text-foreground mb-2 block">First Name</Label>
                    <Input
                      id="userFirstName"
                      value={newUserFirstName}
                      onChange={(e) => setNewUserFirstName(e.target.value)}
                      placeholder="First Name"
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userLastName" className="text-sm font-medium text-foreground mb-2 block">Last Name</Label>
                    <Input
                      id="userLastName"
                      value={newUserLastName}
                      onChange={(e) => setNewUserLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="userEmail" className="text-sm font-medium text-foreground mb-2 block">Email *</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="userRole" className="text-sm font-medium text-foreground mb-2 block">Role</Label>
                  <Select value={newUserRole} onValueChange={setNewUserRole}>
                    <SelectTrigger className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ORG_ADMIN">Organization Admin</SelectItem>
                      <SelectItem value="USER">Organization User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleAddUser} 
                    disabled={!newUserEmail || addUserLoading}
                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-primary-foreground px-6 py-3 rounded-xl"
                  >
                    {addUserLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b border-primary-foreground"></div>
                        Sending Invite...
                      </div>
                    ) : (
                      'Send Invitation'
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddUser(false)}
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
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-foreground">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-foreground">{users.filter(u => u.isActive).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.role === 'ORG_ADMIN').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              Organization Users
            </h2>
            <Badge variant="secondary" className="px-3 py-1 rounded-full">
              {users.length} {users.length === 1 ? 'User' : 'Users'}
            </Badge>
          </div>
          
          {users.length === 0 ? (
            <Card className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Users Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">Add users to your organization to get started with collaboration</p>
                <Button 
                  onClick={() => setShowAddUser(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl"
                >
                  Add User
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {users.map((user) => (
                <Card key={user.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-medium text-gray-700">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {user.firstName} {user.lastName}
                            </h3>
                            <Badge 
                              variant={user.role === 'ORG_ADMIN' ? 'default' : 'secondary'}
                              className="px-3 py-1 rounded-full flex-shrink-0"
                            >
                              {user.role === 'ORG_ADMIN' ? 'Admin' : 'User'}
                            </Badge>
                            <Badge 
                              variant={user.isActive ? 'default' : 'secondary'}
                              className="px-3 py-1 rounded-full flex-shrink-0"
                            >
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.role !== 'ORG_ADMIN' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveUser(user.id)}
                            disabled={removeUserLoading === user.id}
                            className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl px-3 py-2"
                          >
                            {removeUserLoading === user.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b border-red-600"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 