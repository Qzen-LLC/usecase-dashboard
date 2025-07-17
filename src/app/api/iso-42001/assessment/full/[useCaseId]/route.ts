import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import redis from '@/lib/redis';

export async function GET(req: NextRequest, { params }: { params: { useCaseId: string } }) {
  const { useCaseId } = params;
  try {
    // Redis cache check
    const cacheKey = `iso-42001:assessment:full:${useCaseId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return new NextResponse(cached, { headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
    }
    const [clauses, annexCategories, assessment] = await Promise.all([
      prismaClient.iso42001Clause.findMany({ orderBy: { orderIndex: 'asc' } }),
      prismaClient.iso42001AnnexCategory.findMany({ orderBy: { orderIndex: 'asc' }, include: { items: true } }),
      prismaClient.iso42001Assessment.findUnique({
        where: { useCaseId },
        include: {
          subclauses: { include: { subclause: true } },
          annexes: { include: { annexItem: true } },
        },
      }),
    ]);
    await redis.set(cacheKey, JSON.stringify({ clauses, annexCategories, assessment }), 'EX', 300);
    return NextResponse.json({ clauses, annexCategories, assessment });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch ISO 42001 assessment data', details: String(err) }, { status: 500 });
  }
} 