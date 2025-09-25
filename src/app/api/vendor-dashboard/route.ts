import { NextResponse } from 'next/server';
import { vendorServiceServer } from '@/lib/vendorServiceServer';
import { requireAuthContext } from '@/utils/authz';


export async function GET() {
  try {
    const authCtx = requireAuthContext();
    if (!authCtx.dbUserId) {
      return NextResponse.json({ error: 'Missing dbUserId claim. Configure Clerk JWT with dbUserId.' }, { status: 400 });
    }

    const result = await vendorServiceServer.getVendors({
      role: authCtx.role || undefined,
      userId: authCtx.dbUserId,
      organizationId: authCtx.organizationId || undefined
    });
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error('Vendor dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}