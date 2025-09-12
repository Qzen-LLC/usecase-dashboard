import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';
import { createClerkClient } from '@clerk/backend';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Get users in organization (Org Admin only)
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
      include: { organization: true }
    });

    if (!currentUserRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentUserRecord.role !== 'ORG_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get users in the same organization
    const users = await prismaClient.user.findMany({
      where: {
        organizationId: currentUserRecord.organizationId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching organization users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add user to organization (Org Admin only)
export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
      include: { organization: true }
    });

    if (!currentUserRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentUserRecord.role !== 'ORG_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { email, firstName, lastName, role = 'ORG_USER' } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user already exists in the organization
    const existingUser = await prismaClient.user.findFirst({
      where: {
        email,
        organizationId: currentUserRecord.organizationId,
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists in this organization' }, { status: 400 });
    }

    // Create user in Clerk
    let clerkUser;
    try {
      clerkUser = await clerk.users.createUser({
        emailAddress: [email],
        firstName: firstName || 'User',
        lastName: lastName || 'User',
        publicMetadata: {
          role,
          organizationId: currentUserRecord.organizationId,
        },
      });
    } catch (error: any) {
      // If user already exists in Clerk, update their metadata
      if (error?.errors?.[0]?.code === 'user_exists') {
        const existingUsers = await clerk.users.getUserList({
          emailAddress: [email],
        });
        if (existingUsers.length > 0) {
          clerkUser = existingUsers[0];
          await clerk.users.updateUser(clerkUser.id, {
            publicMetadata: {
              role,
              organizationId: currentUserRecord.organizationId,
            },
          });
        }
      } else {
        throw error;
      }
    }

    // Create user record in database
    if (clerkUser) {
      const newUser = await prismaClient.user.create({
        data: {
          clerkId: clerkUser.id,
          email,
          firstName: firstName || 'User',
          lastName: lastName || 'User',
          role,
          organizationId: currentUserRecord.organizationId,
          isActive: true,
        },
      });
      console.log('[CRUD_LOG] User created:', { id: newUser.id, email: newUser.email, role: newUser.role, organizationId: newUser.organizationId, authoredBy: currentUserRecord.id });

      return NextResponse.json({
        success: true,
        user: newUser,
        message: 'User added to organization successfully',
      });
    }

    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  } catch (error) {
    console.error('Error adding user to organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 