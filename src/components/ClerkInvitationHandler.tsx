'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, Shield } from 'lucide-react';

interface ClerkInvitationHandlerProps {
  onInvitationAccepted?: () => void;
}

export default function ClerkInvitationHandler({ onInvitationAccepted }: ClerkInvitationHandlerProps) {
  const { user } = useUser();
  const [showInvitation, setShowInvitation] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Check if user has invitation metadata
    const publicMetadata = user.publicMetadata;
    const role = publicMetadata?.role as string;
    const organizationId = publicMetadata?.organizationId as string;

    if (role && organizationId) {
      console.log('[ClerkInvitationHandler] Found invitation metadata:', { role, organizationId });
      setShowInvitation(true);
      setInvitationData({ role, organizationId });
    }
  }, [user]);

  const handleAcceptInvitation = async () => {
    if (!user) return;

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/invitations/accept-clerk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        console.log('[ClerkInvitationHandler] Invitation accepted successfully:', data);
        setShowInvitation(false);
        onInvitationAccepted?.();
        // Refresh the page to update the user's organization context
        window.location.reload();
      } else {
        setError(data.message || 'Failed to accept invitation');
      }
    } catch (err) {
      console.error('[ClerkInvitationHandler] Error accepting invitation:', err);
      setError('Failed to accept invitation');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineInvitation = () => {
    setShowInvitation(false);
    // Optionally redirect to home or show a message
  };

  if (!showInvitation) {
    return null;
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'ORG_ADMIN':
        return { name: 'Organization Admin', icon: Shield, color: 'text-blue-600' };
      case 'ORG_USER':
        return { name: 'Organization User', icon: Users, color: 'text-green-600' };
      default:
        return { name: role, icon: Users, color: 'text-gray-600' };
    }
  };

  const roleInfo = getRoleDisplay(invitationData?.role);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Organization Invitation
          </CardTitle>
          <CardDescription>
            You've been invited to join an organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <roleInfo.icon className={`w-4 h-4 ${roleInfo.color}`} />
              <span className="text-sm font-medium">Role: {roleInfo.name}</span>
            </div>
            <p className="text-sm text-gray-600">
              You'll be able to access organization-specific data and features.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleAcceptInvitation}
              disabled={processing}
              className="flex-1"
            >
              {processing ? 'Accepting...' : 'Accept Invitation'}
            </Button>
            <Button 
              onClick={handleDeclineInvitation}
              variant="outline"
              disabled={processing}
            >
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
