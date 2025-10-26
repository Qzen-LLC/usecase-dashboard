import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-gateway';

function getJwtTemplateName(): string {
  return process.env.CLERK_JWT_TEMPLATE || 'neon';
}

export const GET = withAuth(async (_req, { auth }) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { userId } = auth;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const template = getJwtTemplateName();
    // Note: getToken is Clerk-specific; for development purposes, this endpoint may be deprecated
    // or replaced with a provider-agnostic token minting strategy. For now, return 501.
    const token = null;
    if (!token) {
      return NextResponse.json({ error: 'Failed to mint token' }, { status: 500 });
    }

    return NextResponse.json({ template, token });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}, { requireUser: true });



