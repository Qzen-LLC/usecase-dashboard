import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Remove user from organization (Org Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserRecord = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { organization: true }
    });

    if (!currentUserRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentUserRecord.role !== 'ORG_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const userId = params.id;

    // Get the user to be removed
    const userToRemove = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    if (!userToRemove) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user belongs to the same organization
    if (userToRemove.organizationId !== currentUserRecord.organizationId) {
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

    // Deactivate the user instead of deleting
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'User removed from organization successfully',
    });
  } catch (error) {
    console.error('Error removing user from organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 