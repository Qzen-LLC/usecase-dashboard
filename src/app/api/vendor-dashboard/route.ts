import { NextResponse } from 'next/server';
import { vendorServiceServer } from '@/lib/vendorServiceServer';
import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';
import redis from '@/lib/redis';

export async function GET() {
  try {
    // Get current user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get user data from database
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
    });
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Redis cache check
    const cacheKey = `vendor-dashboard:${userRecord.role}:${userRecord.id}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return new NextResponse(cached, { headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
    }
    const result = await vendorServiceServer.getVendors({
      role: userRecord.role,
      userId: userRecord.id,
      organizationId: userRecord.organizationId || undefined
    });
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    await redis.set(cacheKey, JSON.stringify(result.data), 'EX', 300);
    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error('Vendor dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}