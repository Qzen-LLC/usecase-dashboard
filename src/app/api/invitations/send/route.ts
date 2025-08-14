import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@/generated/prisma';
import { Clerk } from '@clerk/clerk-sdk-node';

const prisma = new PrismaClient();
const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only QZen admins can send invitations (add your own role check here)
    const currentUserRecord = await prisma.user.findUnique({
      where: { clerkId: user.id },
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
      // Automatically detect current environment's URL for invitations
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const host = process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000';
      const baseUrl = `${protocol}://${host}`;
      
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
} 