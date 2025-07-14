'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminTestPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/me');
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">User Information:</h3>
            <div className="bg-gray-100 p-4 rounded">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Clerk User:</h3>
            <div className="bg-gray-100 p-4 rounded">
              <pre className="text-sm overflow-auto">
                {JSON.stringify({
                  id: user?.id,
                  email: user?.emailAddresses[0]?.emailAddress,
                  firstName: user?.firstName,
                  lastName: user?.lastName,
                }, null, 2)}
              </pre>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => window.location.href = '/admin'}>
              Go to Admin Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
              Go to Main Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 