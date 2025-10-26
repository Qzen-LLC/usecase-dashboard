import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-gateway';

import { PrismaClient } from '@/generated/prisma';
import { createClerkClient } from '@clerk/backend';

const prisma = new PrismaClient();
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export const POST = withAuth(async (req: Request, { auth }: { auth: any }) => {
  try {
    // auth context is provided by withAuth wrapper

    // Only QZen admins can send invitations (add your own role check here)
    const currentUserRecord = await prisma.user.findUnique({
      where: { clerkId: auth.userId! },
    });
    if (!currentUserRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { email, role = 'USER', organizationId } = await req.json();
    if (!email || !organizationId) {
      return NextResponse.json({ error: 'Email and organizationId are required' }, { status: 400 });
    }

    // QZEN_ADMIN can invite to any org, ORG_ADMIN can only invite to their own org
    if (
      currentUserRecord.role === 'QZEN_ADMIN' ||
      (currentUserRecord.role === 'ORG_ADMIN' && currentUserRecord.organizationId === organizationId)
    ) {
      // Build a correct base URL without double protocol
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const rawHost = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'localhost:3000';
      let baseUrl: string;
      try {
        const parsed = rawHost.startsWith('http') ? new URL(rawHost) : new URL(`${protocol}://${rawHost}`);
        // Normalize to protocol + host only (strip any paths)
        baseUrl = `${parsed.protocol}//${parsed.host}`;
      } catch {
        // Fallback: strip any existing protocol manually
        baseUrl = `${protocol}://${rawHost.replace(/^https?:\/\//, '')}`;
      }
      
      console.log('[Invitation] Using baseUrl:', baseUrl);
      
      // 1. Create database invitation first
      const dbInvitation = await prisma.invitation.create({
        data: {
          email,
          role,
          organizationId,
          invitedById: currentUserRecord.id,
          token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      });
      
      console.log('[Invitation] Created database invitation:', dbInvitation.id);
      
      // 2. Create Clerk invitation
      let clerkInvitation;
      try {
        clerkInvitation = await clerk.invitations.createInvitation({
          emailAddress: email,
          publicMetadata: { role, organizationId },
          redirectUrl: `${baseUrl}/sign-up?invitation_token=${dbInvitation.token}`,
        });
      } catch (error: any) {
        console.error('Error sending invitation:', error, error?.errors);
        return NextResponse.json({ error: 'Clerk invitation error', details: error?.errors }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        invitation: {
          id: dbInvitation.id,
          token: dbInvitation.token,
          clerkInvitation,
        },
        message: 'Invitation sent successfully!',
      });
    } else {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requireUser: true });