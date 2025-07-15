'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';
console.log("Admin page loaded");
export default function AdminPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      console.log('User not signed in, redirecting to sign-in');
      router.push('/sign-in');
      return;
    }

    // Check user role
    const checkUserRole = async () => {
      try {
        console.log('Checking user role for:', user?.id);
        const response = await fetch('/api/user/me');
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('User data:', data);
          setDebug(data);
          
          if (data.user && data.user.role === 'QZEN_ADMIN') {
            console.log('User has QZEN_ADMIN role');
            setUserRole(data.user.role);
          } else {
            console.log('User does not have QZEN_ADMIN role, redirecting to dashboard');
            console.log('User role:', data.user?.role);
            setError(`Access denied. User role: ${data.user?.role || 'unknown'}`);
            // Don't redirect immediately, show error message
          }
        } else {
          console.log('Failed to get user data');
          const errorData = await response.json();
          setError(`Failed to get user data: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setError(`Error checking user role: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [isSignedIn, isLoaded, router, user?.id]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect to sign-in
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
        <p className="mb-4 text-gray-700">{error}</p>
        {debug && (
          <div className="bg-gray-100 p-4 rounded mb-4">
            <h2 className="font-semibold mb-2">Debug Info:</h2>
            <pre className="text-sm overflow-auto">{JSON.stringify(debug, null, 2)}</pre>
          </div>
        )}
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (userRole !== 'QZEN_ADMIN') {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You don't have permission to access the admin dashboard.</p>
        <p className="mb-4 text-gray-600">Your role: {userRole || 'Unknown'}</p>
        {debug && (
          <div className="bg-gray-100 p-4 rounded mb-4">
            <h2 className="font-semibold mb-2">Debug Info:</h2>
            <pre className="text-sm overflow-auto">{JSON.stringify(debug, null, 2)}</pre>
          </div>
        )}
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AdminDashboard />
    </div>
  );
} 