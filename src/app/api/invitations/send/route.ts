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
      // Get the base URL from environment or request
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                     process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                     `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('host')}`;
      
      // 1. Create Clerk invitation (Clerk will send the email)
      let invitation;
      try {
        invitation = await clerk.invitations.createInvitation({
          emailAddress: email,
          publicMetadata: { role, organizationId },
          redirectUrl: `${baseUrl}/dashboard`,
        });
      } catch (error: any) {
        console.error('Error sending invitation:', error, error?.errors);
        return NextResponse.json({ error: 'Clerk invitation error', details: error?.errors }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        invitation,
        message: 'Invitation sent via Clerk!',
      });
    } else {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 