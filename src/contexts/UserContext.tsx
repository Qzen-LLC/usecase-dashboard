'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';

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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const fetchUserData = async () => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/user/me');
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch user data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
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
  }, [mounted, isLoaded, isSignedIn]);

  // Don't provide context until mounted to prevent hydration mismatch
  if (!mounted) {
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