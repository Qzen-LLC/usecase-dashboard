import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import redis from '@/lib/redis';

export async function GET(req: NextRequest, { params }: { params: { useCaseId: string } }) {
  const { useCaseId } = params;
  try {
    // Redis cache check
    const cacheKey = `eu-ai-act:assessment:full:${useCaseId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return new NextResponse(cached, { headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
    }
    const [topics, controlCategories, assessment] = await Promise.all([
      prismaClient.euAiActTopic.findMany({ orderBy: { orderIndex: 'asc' }, include: { subtopics: { include: { questions: true } } } }),
      prismaClient.euAiActControlCategory.findMany({ orderBy: { orderIndex: 'asc' }, include: { controls: true } }),
      prismaClient.euAiActAssessment.findUnique({
        where: { useCaseId },
        include: {
          answers: true,
          controls: { include: { controlStruct: true, subcontrols: { include: { subcontrolStruct: true } } } },
        },
      }),
    ]);
    await redis.set(cacheKey, JSON.stringify({ topics, controlCategories, assessment }), 'EX', 300);
    return NextResponse.json({ topics, controlCategories, assessment });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch EU AI Act assessment data', details: String(err) }, { status: 500 });
  }
} 