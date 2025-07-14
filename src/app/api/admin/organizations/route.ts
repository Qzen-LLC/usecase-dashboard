import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';
import { Clerk } from '@clerk/clerk-sdk-node';

const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// Get all organizations (QZen Admin only)
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
    });
    if (!currentUserRecord || currentUserRecord.role !== 'QZEN_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Fetch organizations from DB
    const organizations = await prismaClient.organization.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
        useCases: {
          select: {
            id: true,
            title: true,
            stage: true,
            priority: true,
          },
        },
      },
    });

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create new organization (QZen Admin only)
export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
    });
    if (!currentUserRecord || currentUserRecord.role !== 'QZEN_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { name, domain, adminEmail, adminFirstName, adminLastName } = await req.json();

    if (!name || !adminEmail) {
      return NextResponse.json({ error: 'Organization name and admin email are required' }, { status: 400 });
    }

    // Check if organization already exists
    const existingOrg = await prismaClient.organization.findFirst({
      where: {
        OR: [
          { name },
          { domain: domain || null }
        ]
      }
    });

    if (existingOrg) {
      return NextResponse.json({ error: 'Organization with this name or domain already exists' }, { status: 400 });
    }

    // Create organization
    const organization = await prismaClient.organization.create({
      data: {
        name,
        domain,
        isActive: true,
      },
    });

    // Create organization admin user in Clerk
    let clerkUser;
    try {
      clerkUser = await clerk.users.createUser({
        emailAddress: [adminEmail],
        firstName: adminFirstName || 'Admin',
        lastName: adminLastName || 'User',
        publicMetadata: {
          role: 'ORG_ADMIN',
          organizationId: organization.id,
        },
      });
    } catch (error: any) {
      // If user already exists in Clerk, update their metadata
      if (error?.errors?.[0]?.code === 'user_exists') {
        const existingUsers = await clerk.users.getUserList({
          emailAddress: [adminEmail],
        });
        if (existingUsers.length > 0) {
          clerkUser = existingUsers[0];
          await clerk.users.updateUser(clerkUser.id, {
            publicMetadata: {
              role: 'ORG_ADMIN',
              organizationId: organization.id,
            },
          });
        }
      } else {
        throw error;
      }
    }

    // Create user record in database
    if (clerkUser) {
      await prismaClient.user.create({
        data: {
          clerkId: clerkUser.id,
          email: adminEmail,
          firstName: adminFirstName || 'Admin',
          lastName: adminLastName || 'User',
          role: 'ORG_ADMIN',
          organizationId: organization.id,
          isActive: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      organization,
      message: 'Organization created successfully',
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 