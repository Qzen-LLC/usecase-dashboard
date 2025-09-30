'use client';

import { useAuthClient } from '@/hooks/useAuthClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useUserData } from '@/contexts/UserContext';

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuthClient();
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
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e5e7eb] flex items-center justify-center px-2">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center flex flex-col items-center">
          {/* Logo placeholder - replace src with your logo if available */}
          <div className="mb-4">
            <Image 
              src="https://vgwacd4qotpurdv6.public.blob.vercel-storage.com/logo/logo.png" 
              alt="QZen QUBE Logo"  
              width={64} 
              height={64} 
              className="mx-auto"
              priority={true}
            />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
            QZen QUBE
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            AI Use Case Management Platform
          </p>
        </div>

        {!isSignedIn && mounted && (
          <div className="space-y-4">
            <div className="bg-white/90 p-8 rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">Get Started</h2>
              <div className="space-y-4 w-full">
                <Link href="/sign-in" className="block">
                  <Button className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] text-white shadow-md rounded-full hover:from-[#b84fff] hover:to-[#8f4fff] transition-all">
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
                  <Button variant="outline" className="w-full py-3 text-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full transition-all">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}