import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-gateway';

import { PrismaClient } from '@/generated/prisma';
import { createClerkClient } from '@clerk/backend';
import { validateUserRole } from '@/utils/role-validation';

const prisma = new PrismaClient();
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export const POST = withAuth(async (req: Request, { auth }: { auth: any }) => {
  try {
    // Get user's public metadata from Clerk
    const user = await clerk.users.getUser(auth.userId!);
    const publicMetadata = user.publicMetadata;
    const role = publicMetadata?.role as string;
    const organizationId = publicMetadata?.organizationId as string;

    console.log('[Clerk Invitation] Processing invitation for user:', {
      clerkId: auth.userId!,
      email: user.emailAddresses[0]?.emailAddress,
      role,
      organizationId
    });

    if (!role || !organizationId) {
      console.log('[Clerk Invitation] No role or organizationId in metadata');
      return NextResponse.json({ 
        error: 'Invalid invitation metadata',
        message: 'Invitation metadata is missing or invalid'
      }, { status: 400 });
    }

    // Check if user already exists
    let userRecord = await prisma.user.findUnique({
      where: { clerkId: auth.userId! },
    });

    // Validate and correct role if needed
    const validatedRole = validateUserRole(role, organizationId);
    
    if (!userRecord) {
      // Create user record
      userRecord = await prisma.user.create({
        data: {
          clerkId: auth.userId!,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          role: validatedRole,
          organizationId: organizationId,
        },
      });
      console.log('[Clerk Invitation] Created new user:', userRecord.id);
    } else {
      // Update existing user with organization and role
      userRecord = await prisma.user.update({
        where: { id: userRecord.id },
        data: {
          role: validatedRole,
          organizationId: organizationId,
        },
      });
      console.log('[Clerk Invitation] Updated existing user:', userRecord.id);
    }

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      console.error('[Clerk Invitation] Organization not found:', organizationId);
      return NextResponse.json({ 
        error: 'Organization not found',
        message: 'The organization you were invited to no longer exists'
      }, { status: 404 });
    }

    // Clear the Clerk public metadata to prevent re-processing
    try {
      console.log('[Clerk Invitation] Clearing public metadata for user:', auth.userId!);
      await clerk.users.updateUser(auth.userId!, {
        publicMetadata: {
          // Remove the invitation metadata
          role: undefined,
          organizationId: undefined,
        },
      });
      console.log('[Clerk Invitation] Successfully cleared public metadata');
    } catch (metadataError) {
      console.error('[Clerk Invitation] Error clearing public metadata:', metadataError);
      // Don't fail the whole process if metadata clearing fails
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        role: userRecord.role,
        organizationId: userRecord.organizationId,
      },
      organization: {
        id: organization.id,
        name: organization.name,
      },
      message: 'Successfully joined organization',
    });

  } catch (error) {
    console.error('[Clerk Invitation] Error processing invitation:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Failed to process invitation'
    }, { status: 500 });
  }
}, { requireUser: true });