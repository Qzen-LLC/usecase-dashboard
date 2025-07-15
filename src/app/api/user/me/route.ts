import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Current user from Clerk:', user.id);

    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
      include: {
        organization: true,
      },
    });

    if (!userRecord) {
      return NextResponse.json({ 
        error: 'User not found in database',
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress 
      }, { status: 404 });
    }

    return NextResponse.json({
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
      },
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 