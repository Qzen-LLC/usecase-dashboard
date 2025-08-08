import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

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

    return NextResponse.json({ 
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName
      },
      status: 'authenticated'
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