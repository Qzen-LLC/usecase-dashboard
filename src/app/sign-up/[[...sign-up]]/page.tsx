'use client';

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
  const invitationToken = searchParams.get('invitation_token');
  const { user, isSignedIn } = useUser();

  // Debug logging
  console.log('[SignUpPage] URL parameters:', {
    redirect_url: searchParams.get('redirect_url'),
    invitation_token: invitationToken,
    allParams: Object.fromEntries(searchParams.entries())
  });

  // Handle invitation acceptance after signup
  useEffect(() => {
    if (isSignedIn && user && invitationToken) {
      console.log('[SignUpPage] User signed in, processing invitation:', invitationToken);
      handleInvitationAcceptance();
    } else {
      console.log('[SignUpPage] Not processing invitation:', {
        isSignedIn,
        hasUser: !!user,
        invitationToken
      });
    }
  }, [isSignedIn, user, invitationToken]);

  const handleInvitationAcceptance = async () => {
    if (!invitationToken) return;

    try {
      console.log('[SignUp] Processing invitation after signup:', invitationToken);
      
      const response = await fetch('/api/organizations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationToken: invitationToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('[SignUp] Invitation accepted successfully, redirecting to dashboard');
        // Redirect to dashboard after successful organization assignment
        window.location.href = '/dashboard';
      } else {
        console.error('[SignUp] Failed to accept invitation:', data.error);
        // Redirect to dashboard anyway, user can try again later
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('[SignUp] Error accepting invitation:', error);
      // Redirect to dashboard on error
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md">
        <SignUp 
          appearance={{
            variables: {
              colorBackground: '#ffffff',
              colorText: '#000000',
              colorInputBackground: '#ffffff',
              colorInputText: '#000000',
              colorInputBorder: 'hsl(var(--border))',
              colorPrimary: '#2563eb',
            },
            elements: {
              card: "bg-white text-black border border-border shadow-lg",
              headerTitle: "text-black",
              headerSubtitle: "text-gray-600",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-500",
              formFieldLabel: "text-gray-700",
              formFieldInput: "bg-white text-black placeholder:text-gray-600 border-border focus:ring-2 focus:ring-ring focus:border-ring",
              socialButtonsBlockButton: "bg-white text-black border border-gray-300 hover:bg-gray-50",
              socialButtonsBlockButtonText: "text-black",
              footer: "text-gray-600",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
            },
          }}
          fallbackRedirectUrl={redirectUrl}
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
} 