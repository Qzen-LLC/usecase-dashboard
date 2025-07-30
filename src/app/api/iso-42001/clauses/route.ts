import { NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import redis from '@/lib/redis';

export async function GET() {
  try {
    // Redis cache check (gracefully handle failures)
    const cacheKey = 'iso-42001:clauses';
    let cached = null;
    try {
      cached = await redis.get(cacheKey);
      if (cached) {
        return new NextResponse(cached, { headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
      }
    } catch (error) {
      console.warn('Redis cache read failed, continuing without cache:', error.message);
    }

    const clauses = await prismaClient.iso42001Clause.findMany({
      include: {
        subclauses: {
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { orderIndex: 'asc' }
    });

    try {
      await redis.set(cacheKey, JSON.stringify(clauses), 'EX', 300);
    } catch (error) {
      console.warn('Redis cache write failed, continuing without cache:', error.message);
    }
    return NextResponse.json(clauses);
  } catch (error) {
    console.error('Error fetching ISO 42001 clauses:', error);
    
    // Return empty array if tables don't exist yet
    return NextResponse.json([]);
  }
}