import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('[Test Auth] Starting authentication check...');
    
    const user = await currentUser();
    console.log('[Test Auth] Clerk user:', user ? { id: user.id, email: user.emailAddresses[0]?.emailAddress } : 'null');
    
    if (!user) {
      console.log('[Test Auth] No user found - returning 401');
      return NextResponse.json({ 
        error: 'Unauthorized - No user session found',
        message: 'Please sign in through the browser first',
        status: 'unauthenticated'
      }, { status: 401 });
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

    console.log('[Test Auth] Database user record:', userRecord ? { id: userRecord.id, email: userRecord.email, role: userRecord.role } : 'null');

    if (!userRecord) {
      return NextResponse.json({ 
        error: 'User not found in database',
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        message: 'User exists in Clerk but not in database',
        status: 'user_not_found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: 'authenticated',
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
        canCreateUseCases: true,
        canDeleteUseCases: userRecord.role === 'QZEN_ADMIN' || userRecord.role === 'ORG_ADMIN',
      },
      session: {
        clerkId: user.id,
        lastSignInAt: user.lastSignInAt,
      }
    });

  } catch (error) {
    console.error('[Test Auth] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    }, { status: 500 });
  }
} 