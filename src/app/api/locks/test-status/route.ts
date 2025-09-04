import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    console.log('[TEST STATUS] Starting test...');
    
    // Test 1: Check if user can be retrieved
    const user = await currentUser();
    console.log('[TEST STATUS] User:', user ? user.id : 'null');
    
    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 401 });
    }

    // Test 2: Check if user record exists
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
    });
    console.log('[TEST STATUS] User record:', userRecord ? userRecord.id : 'null');
    
    if (!userRecord) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    // Test 3: Check database connection
    const lockCount = await prismaClient.lock.count();
    console.log('[TEST STATUS] Total locks in database:', lockCount);

    // Test 4: Check if we can query locks
    const testLocks = await prismaClient.lock.findMany({
      take: 5,
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    console.log('[TEST STATUS] Sample locks:', testLocks.length);

    return NextResponse.json({
      success: true,
      user: {
        clerkId: user.id,
        userId: userRecord.id,
        firstName: userRecord.firstName,
        lastName: userRecord.lastName
      },
      database: {
        totalLocks: lockCount,
        sampleLocks: testLocks.length
      }
    });

  } catch (error) {
    console.error('[TEST STATUS] Error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
}
