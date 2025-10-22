'use client';

import { useAuthClient } from '@/hooks/useAuthClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useUserData } from '@/contexts/UserContext';
import { QubeLandingLayout } from '@/components/QubeLandingLayout';

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuthClient();
  const router = useRouter();
  const { userData, loading } = useUserData();
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Kick off a safe redirect for signed-in users once Clerk is loaded.
  // Prefer role from userData, but fall back after a short timeout to avoid indefinite loading.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    // If userData arrived, redirect by role immediately
    if (userData && !loading) {
      setIsCheckingRole(true);
      if (userData.role === 'QZEN_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      setIsCheckingRole(false);
      return;
    }

    // Otherwise set a short fallback timer to avoid hanging
    const t = setTimeout(() => {
      setFallbackTriggered(true);
      setIsCheckingRole(true);
      router.push('/dashboard');
      setIsCheckingRole(false);
    }, 1200);

    return () => clearTimeout(t);
  }, [isSignedIn, isLoaded, userData, loading, router]);

  // Show loading state while checking role
  if (isSignedIn && (isCheckingRole || (!userData && !fallbackTriggered))) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <QubeLandingLayout subtitleOverride="For AI leaders Managing Risk, Compliance, and ROI at Scale.">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">Welcome to QUBE™</h2>
      </div>
      
      {!isSignedIn && mounted && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl shadow-sm p-8">
            <h3 className="text-xl font-semibold mb-6 text-foreground tracking-tight">Get Started</h3>
            <div className="space-y-4">
              <Link href="/sign-in" className="block">
                <Button className="w-full h-10 text-sm font-medium">
                  Sign In
                </Button>
              </Link>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">or</span>
                </div>
              </div>
              <Link href="/sign-up" className="block">
                <Button variant="outline" className="w-full h-10 text-sm font-medium">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </QubeLandingLayout>
  );
}