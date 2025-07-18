'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Trash2, UserCheck, UserX } from 'lucide-react';
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
  const [newUserRole, setNewUserRole] = useState('ORG_USER');
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
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail) {
      alert('Email is required');
      return;
    }
    if (!orgId) {
      alert('Organization ID not found. Please refresh and try again.');
      return;
    }
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
        setNewUserRole('ORG_USER');
        setShowAddUser(false);
        fetchUsers();
        alert('Invitation sent successfully!');
      } else {
        alert(data.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the organization?')) {
      return;
    }

    try {
      const response = await fetch(`/api/organizations/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
        alert('User removed successfully!');
      } else {
        alert(data.error || 'Failed to remove user');
      }
    } catch (error) {
      console.error('Error removing user:', error);
      alert('Failed to remove user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600 mt-2">Manage users within your organization</p>
        </div>
        <Button onClick={() => setShowAddUser(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
            <CardDescription>
              Add a new user to your organization. They will receive an invitation to join.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userFirstName">First Name</Label>
                <Input
                  id="userFirstName"
                  value={newUserFirstName}
                  onChange={(e) => setNewUserFirstName(e.target.value)}
                  placeholder="First Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userLastName">Last Name</Label>
                <Input
                  id="userLastName"
                  value={newUserLastName}
                  onChange={(e) => setNewUserLastName(e.target.value)}
                  placeholder="Last Name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userEmail">Email *</Label>
              <Input
                id="userEmail"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userRole">Role</Label>
              <Select value={newUserRole} onValueChange={setNewUserRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORG_ADMIN">Organization Admin</SelectItem>
                  <SelectItem value="ORG_USER">Organization User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={handleAddUser} disabled={!newUserEmail}>
                Add User
              </Button>
              <Button variant="outline" onClick={() => setShowAddUser(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <div className="grid gap-6">
        <h2 className="text-2xl font-semibold">Organization Users</h2>
        {users.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Users Yet</h3>
              <p className="text-gray-500 mb-4">Add users to your organization to get started</p>
              <Button onClick={() => setShowAddUser(true)}>
                Add User
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={user.role === 'ORG_ADMIN' ? 'default' : 'secondary'}>
                        {user.role === 'ORG_ADMIN' ? 'Admin' : 'User'}
                      </Badge>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {user.role !== 'ORG_ADMIN' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
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
  );
} 