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
    // Try to fetch control categories from database
    let controlCategories;
    try {
      controlCategories = await prismaClient.euAiActControlCategory.findMany({
        include: {
          controls: {
            include: {
              subcontrols: true
            },
            orderBy: {
              orderIndex: 'asc'
            }
          }
        },
        orderBy: {
          orderIndex: 'asc'
        }
      });
    } catch (error) {
      console.log('EU AI ACT control categories table not found, returning empty array');
      return NextResponse.json([]);
    }

    // Transform the data to match the expected structure
    const transformedCategories = controlCategories.map(category => ({
      id: category.id,
      categoryId: category.categoryId,
      title: category.title,
      description: category.description,
      orderIndex: category.orderIndex,
      controls: category.controls.map(control => ({
        id: control.id,
        controlId: control.controlId,
        title: control.title,
        description: control.description,
        orderIndex: control.orderIndex,
        subcontrols: control.subcontrols.map(subcontrol => ({
          id: subcontrol.id,
          subcontrolId: subcontrol.subcontrolId,
          title: subcontrol.title,
          description: subcontrol.description,
          orderIndex: subcontrol.orderIndex
        }))
      }))
    }));

    await redis.set(cacheKey, JSON.stringify(transformedCategories), 'EX', 300);
    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching EU AI ACT control categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch control categories' },
      { status: 500 }
    );
  }
}