import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

function getJwtTemplateName(): string {
  return process.env.CLERK_JWT_TEMPLATE || 'neon';
}

export async function GET() {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { getToken, userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const template = getJwtTemplateName();
    const token = await getToken({ template });
    if (!token) {
      return NextResponse.json({ error: 'Failed to mint token' }, { status: 500 });
    }

    return NextResponse.json({ template, token });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}



