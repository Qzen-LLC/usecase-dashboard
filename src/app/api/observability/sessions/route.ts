import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return empty sessions array
    // In production, you would fetch from database
    // where you store session summaries
    const sessions = [];

    return NextResponse.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Error fetching observability sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}