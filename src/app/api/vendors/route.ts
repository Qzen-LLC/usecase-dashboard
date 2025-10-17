import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-gateway';
import { vendorServiceServer } from '@/lib/vendorServiceServer';

import { prismaClient } from '@/utils/db';

export const GET = withAuth(async (request, { auth }) => {
  try {
    // auth context is provided by withAuth wrapper
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: auth.userId! },
    });
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Use the new role-based filtering
    const result = await vendorServiceServer.getVendors({
      role: userRecord.role,
      userId: userRecord.id,
      organizationId: userRecord.organizationId || undefined
    });
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    const response = NextResponse.json(result.data);
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    return response;
  } catch (error: any) {
    console.error('Vendors API error:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}, { requireUser: true });

export const POST = withAuth(async (
  request: Request,
  { auth }: { auth: any }
) => {
  try {
    // auth context is provided by withAuth wrapper
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: auth.userId! },
    });
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const vendorData = await request.json();
    let createArgs: any = { ...vendorData };
    if (userRecord.organizationId) {
      createArgs.organizationId = userRecord.organizationId;
      createArgs.userId = null;
    } else {
      createArgs.userId = userRecord.id;
      createArgs.organizationId = null;
    }
    const result = await vendorServiceServer.createVendor(createArgs);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result.data, { status: 201 });
  } catch (error: any) {
    console.error('Vendors POST API error:', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}, { requireUser: true });