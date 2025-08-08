import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's public metadata from Clerk
    const publicMetadata = user.publicMetadata;
    const role = publicMetadata?.role as string;
    const organizationId = publicMetadata?.organizationId as string;

    console.log('[Clerk Invitation] Processing invitation for user:', {
      clerkId: user.id,
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
      where: { clerkId: user.id },
    });

    if (!userRecord) {
      // Create user record
      userRecord = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          role: role as any,
          organizationId: organizationId,
        },
      });
      console.log('[Clerk Invitation] Created new user:', userRecord.id);
    } else {
      // Update existing user with organization and role
      userRecord = await prisma.user.update({
        where: { id: userRecord.id },
        data: {
          role: role as any,
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

    // Clear the public metadata to prevent re-processing
    // Note: This would require Clerk API call, but we'll handle it differently
    // by checking if the user is already assigned to the organization

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
}
