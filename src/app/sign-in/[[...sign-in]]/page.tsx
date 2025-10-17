'use client';

import { SignIn } from "@/components/auth";
import { QubeLandingLayout } from "@/components/QubeLandingLayout";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const { user, isSignedIn } = useUser();
  const invitationToken = searchParams.get('invitation_token');

  useEffect(() => {
    const accept = async () => {
      if (!invitationToken || !isSignedIn || !user) return;
      try {
        await fetch('/api/organizations/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invitationToken }),
        });
        window.location.href = '/dashboard';
      } catch {
        window.location.href = '/dashboard';
      }
    };
    accept();
  }, [invitationToken, isSignedIn, user]);

  return (
    <QubeLandingLayout>
      <div className="-mt-10 md:-mt-16">
      
      <div className="flex justify-center">
      <SignIn 
        appearance={{
          variables: {
            colorBackground: '#ffffff',
            colorText: '#000000',
            colorInputBackground: '#ffffff',
            colorInputText: '#000000',
            colorBorder: 'hsl(var(--border))',
            colorPrimary: '#2563eb',
          },
          elements: {
            card: "bg-white text-dark border border-border shadow-md",
            headerTitle: "text-dark",
            headerSubtitle: "text-gray-600",
            dividerLine: "bg-gray-200",
            dividerText: "text-gray-500",
            formFieldLabel: "text-gray-700",
            formFieldInput: "bg-white text-dark placeholder:text-gray-600 border-border focus:ring-2 focus:ring-ring focus:border-ring",
            socialButtonsBlockButton: "bg-white text-dark border border-gray-300 hover:bg-gray-50",
            socialButtonsBlockButtonText: "text-dark",
             badge__last_used: "hidden",
            footer: "text-gray-600",
            formButtonPrimary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all",
          },
        }}
        fallbackRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
      </div>
      <style jsx global>{`
        [data-localization-key="badge__last_used"] {
          display: none !important;
        }
      `}</style>
      </div>
    </QubeLandingLayout>
  );
} 