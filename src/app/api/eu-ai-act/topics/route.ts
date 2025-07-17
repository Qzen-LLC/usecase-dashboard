import { NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import redis from '@/lib/redis';

export async function GET() {
  try {
    // Redis cache check
    const cacheKey = 'eu-ai-act:topics';
    const cached = await redis.get(cacheKey);
    if (cached) {
      return new NextResponse(cached, { headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
    }

    const topics = await prismaClient.euAiActTopic.findMany({
      include: {
        subtopics: {
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' }
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { orderIndex: 'asc' }
    });

    await redis.set(cacheKey, JSON.stringify(topics), 'EX', 300);
    return NextResponse.json(topics);
  } catch (error) {
    console.error('Error fetching EU AI ACT topics:', error);
    
    // Return empty array if tables don't exist yet
    return NextResponse.json([]);
  }
}