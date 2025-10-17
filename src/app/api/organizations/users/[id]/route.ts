import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-gateway';

import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Remove user from organization (Org Admin only)
export const DELETE = withAuth(async (
  req: Request,
  { params, auth }: { params: Promise<{ id: string }>, auth: any }
) => {
  try {
    // auth context is provided by withAuth wrapper

    const currentUserRecord = await prisma.user.findUnique({
      where: { clerkId: auth.userId! },
      include: { organization: true }
    });

    if (!currentUserRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentUserRecord.role !== 'ORG_ADMIN' && currentUserRecord.role !== 'QZEN_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id: userId } = await params;

    // Get the user to be removed
    const userToRemove = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    if (!userToRemove) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user belongs to the same organization (only for ORG_ADMIN)
    if (currentUserRecord.role === 'ORG_ADMIN' && userToRemove.organizationId !== currentUserRecord.organizationId) {
      return NextResponse.json({ error: 'User does not belong to this organization' }, { status: 403 });
    }

    // Prevent removing the last org admin
    if (userToRemove.role === 'ORG_ADMIN') {
      const adminCount = await prisma.user.count({
        where: {
          organizationId: currentUserRecord.organizationId,
          role: 'ORG_ADMIN',
          isActive: true,
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last organization admin' }, { status: 400 });
      }
    }

    // Remove the user from the organization by setting organizationId to null
    // This keeps the user record for audit purposes but removes them from the org
    await prisma.user.update({
      where: { id: userId },
      data: { 
        organizationId: null,
        isActive: false, // Also mark as inactive
      },
    });

    console.log(`[User Removal] User ${userId} removed from organization ${currentUserRecord.organizationId}`);

    return NextResponse.json({
      success: true,
      message: 'User removed from organization successfully',
    });
  } catch (error) {
    console.error('Error removing user from organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requireUser: true });