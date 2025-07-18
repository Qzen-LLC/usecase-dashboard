'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useUserData } from '@/contexts/UserContext';

export default function HomePage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const { userData, loading } = useUserData();
  const [isCheckingRole, setIsCheckingRole] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && userData && !loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] flex items-center justify-center px-2">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center flex flex-col items-center">
          {/* Logo placeholder - replace src with your logo if available */}
          <div className="mb-4">
            <Image 
              src="https://blfsawovozyywndoiicu.supabase.co/storage/v1/object/sign/company/sharpened_logo_transparent.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MjUwODc5My03NTY4LTQ5ZWYtOTJlMS1lYmU4MmM1YTUwYzQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb21wYW55L3NoYXJwZW5lZF9sb2dvX3RyYW5zcGFyZW50LnBuZyIsImlhdCI6MTc1MjMxMDA0OCwiZXhwIjoxNzYwOTUwMDQ4fQ.OMnrUpd7vPASUkhCrepStmfEq9dbcdbrgrspJaXkpVk" 
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

        {!isSignedIn && (
          <div className="space-y-4">
            <div className="bg-white/90 p-8 rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">Get Started</h2>
              <div className="space-y-4 w-full">
                <Link href="/sign-in" className="block">
                  <Button className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] text-white shadow-md rounded-full hover:from-[#b84fff] hover:to-[#8f4fff] transition-all">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up" className="block">
                  <Button variant="outline" className="w-full py-3 text-lg font-semibold border-2 border-[#b84fff] text-[#8f4fff] bg-white rounded-full hover:bg-[#f5f7fa] transition-all">
                    Sign Up
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