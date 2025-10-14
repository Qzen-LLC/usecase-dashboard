'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useUserData } from '@/contexts/UserContext';
import { QubeLandingLayout } from '@/components/QubeLandingLayout';

export default function HomePage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const { userData, loading } = useUserData();
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoaded || loading) return;

    if (isSignedIn && userData) {
      setIsCheckingRole(true);
      // Check user role and redirect accordingly
      if (userData.role === 'QZEN_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      setIsCheckingRole(false);
    }
  }, [isSignedIn, isLoaded, userData, loading, router]);

  // Show loading state while checking role
  if (isSignedIn && isCheckingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <QubeLandingLayout subtitleOverride="For AI leaders Managing Risk, Compliance, and ROI at Scale.">
      <div className="-mt-12 md:-mt-20 text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to QUBE™</h2>
      </div>
      
      {!isSignedIn && mounted && (
        <div className="space-y-4">
          <div className="bg-white/90 p-8 rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center">
            <h3 className="text-xl font-bold mb-6 text-gray-900 tracking-tight">Get Started</h3>
            <div className="space-y-4 w-full">
              <Link href="/sign-in" className="block">
                <Button className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md rounded-lg transition-all">
                  Sign In
                </Button>
              </Link>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/90 text-gray-500">or</span>
                </div>
              </div>
              <Link href="/sign-up" className="block">
                <Button variant="outline" className="w-full py-3 text-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all">
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