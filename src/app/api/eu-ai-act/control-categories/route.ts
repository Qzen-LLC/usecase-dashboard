import { NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import redis from '@/lib/redis';

export async function GET() {
  try {
    // Redis cache check
    const cacheKey = 'eu-ai-act:control-categories';
    const cached = await redis.get(cacheKey);
    if (cached) {
      return new NextResponse(cached, { headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
    }

    const controlCategories = await prismaClient.euAiActControlCategory.findMany({
      include: {
        controls: {
          include: {
            subcontrols: {
              orderBy: { orderIndex: 'asc' }
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { orderIndex: 'asc' }
    });

    await redis.set(cacheKey, JSON.stringify(controlCategories), 'EX', 300);
    return NextResponse.json(controlCategories);
  } catch (error) {
    console.error('Error fetching EU AI ACT control categories:', error);
    
    // Return empty array if tables don't exist yet
    return NextResponse.json([]);
  }
}