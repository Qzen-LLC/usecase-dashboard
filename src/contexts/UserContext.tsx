'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    domain: string;
  } | null;
}

interface UserContextType {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const { sessionClaims } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  const fetchUserData = async () => {
    if (!isSignedIn || !user) {
      setLoading(false);
      setUserData(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const role = (sessionClaims as any)?.appRole as string | undefined;
      const organizationId = (sessionClaims as any)?.organizationId as string | undefined;
      const dbUserId = (sessionClaims as any)?.dbUserId as string | undefined;

      const nextUser: UserData = {
        id: dbUserId || user.id,
        email: user.emailAddresses?.[0]?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: role || 'USER',
        organizationId: organizationId || '',
        organization: null,
      };
      setUserData(nextUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read session claims');
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchUserData();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only fetch data after Clerk has loaded and user is signed in
    if (mounted && isLoaded && isSignedIn) {
      fetchUserData();
    } else if (mounted && isLoaded && !isSignedIn) {
      setLoading(false);
    }
    
    // Wait a bit for data to be loaded
    const timer = setTimeout(() => {
      setDataReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [mounted, isLoaded, isSignedIn, sessionClaims, user]);

  // Don't provide context until mounted and data is ready to prevent hydration mismatch
  if (!mounted || !dataReady) {
    return <>{children}</>;
  }

  return (
    <UserContext.Provider value={{ userData, loading, error, refetch }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserContext);
  if (context === undefined) {
    // Return a default context during SSR or when provider is not available
    return {
      userData: null,
      loading: true,
      error: null,
      refetch: async () => {},
    };
  }
  return context;
} 