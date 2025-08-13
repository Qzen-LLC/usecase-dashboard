import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ 
        error: 'No authenticated user found',
        authenticated: false 
      }, { status: 401 });
    }

    // Check if user exists in database
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
      },
    });

    return NextResponse.json({
      authenticated: true,
      clerkUser: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      databaseUser: userRecord,
      existsInDatabase: !!userRecord,
    });

  } catch (error) {
    console.error('Error in test-user route:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

