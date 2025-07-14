import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from database
    const userRecord = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { 
        organization: true,
        useCases: {
          select: {
            id: true,
            title: true,
            stage: true,
            priority: true,
          }
        }
      }
    });

    if (!userRecord) {
      return NextResponse.json({ 
        error: 'User not found in database',
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        firstName: userRecord.firstName,
        lastName: userRecord.lastName,
        role: userRecord.role,
        organizationId: userRecord.organizationId,
        organization: userRecord.organization ? {
          id: userRecord.organization.id,
          name: userRecord.organization.name,
          domain: userRecord.organization.domain,
        } : null,
        useCases: userRecord.useCases,
      },
      permissions: {
        canManageUsers: userRecord.role === 'QZEN_ADMIN' || userRecord.role === 'ORG_ADMIN',
        canManageOrganizations: userRecord.role === 'QZEN_ADMIN',
        canAccessAdminDashboard: userRecord.role === 'QZEN_ADMIN',
        canCreateUseCases: true, // All authenticated users can create use cases
        canDeleteUseCases: userRecord.role === 'QZEN_ADMIN' || userRecord.role === 'ORG_ADMIN',
      }
    });

  } catch (error) {
    console.error('Error in test auth:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 