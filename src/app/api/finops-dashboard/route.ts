import { NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
    });
    
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Redis cache check with role-based key
    const cacheKey = `finops-dashboard:${userRecord.role}:${userRecord.id}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return new NextResponse(cached, { headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
    }

    // Build where clause based on user role
    let whereClause: any = {
      stage: {
        in: [
          'backlog',
          'in-progress',
          'solution-validation',
          'pilot',
          'deployment',
          'operational',
        ],
      },
    };

    // Apply role-based filtering
    if (userRecord.role === 'QZEN_ADMIN') {
      // QZEN_ADMIN can see all use cases
    } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
      // ORG_ADMIN and ORG_USER can only see use cases in their organization
      whereClause.organizationId = userRecord.organizationId;
    } else if (userRecord.role === 'USER') {
      // USER can only see their own use cases
      whereClause.userId = userRecord.id;
    }

    // Fetch all use cases with their FinOps data and relevant fields
    const useCases = await prismaClient.useCase.findMany({
      where: whereClause,
      select: {
        id: true,
        aiucId: true,
        title: true,
        stage: true,
        primaryStakeholders: true,
        organization: { select: { name: true } },
        finopsData: {
          select: {
            ROI: true,
            netValue: true,
            apiCostBase: true,
            cumOpCost: true,
            cumValue: true,
            devCostBase: true,
            infraCostBase: true,
            opCostBase: true,
            totalInvestment: true,
            valueBase: true,
            valueGrowthRate: true,
            budgetRange: true,
          },
        },
      },
    });

    // Map to FinOpsData[]
    const finops = useCases.map(uc => ({
      useCaseId: uc.id,
      ROI: uc.finopsData?.ROI ?? 0,
      netValue: uc.finopsData?.netValue ?? 0,
      apiCostBase: uc.finopsData?.apiCostBase ?? 0,
      cumOpCost: uc.finopsData?.cumOpCost ?? 0,
      cumValue: uc.finopsData?.cumValue ?? 0,
      devCostBase: uc.finopsData?.devCostBase ?? 0,
      infraCostBase: uc.finopsData?.infraCostBase ?? 0,
      opCostBase: uc.finopsData?.opCostBase ?? 0,
      totalInvestment: uc.finopsData?.totalInvestment ?? 0,
      valueBase: uc.finopsData?.valueBase ?? 0,
      valueGrowthRate: uc.finopsData?.valueGrowthRate ?? 0,
      budgetRange: uc.finopsData?.budgetRange ?? '',
      useCase: {
        title: uc.title,
        owner: uc.primaryStakeholders?.[0] || '',
        stage: uc.stage,
        aiucId: uc.aiucId,
      },
      organizationName: uc.organization?.name || '',
    }));

    // After computing finops
    await redis.set(cacheKey, JSON.stringify({ finops }), 'EX', 300);
    return NextResponse.json({ finops });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch FinOps dashboard data', details: String(err) }, { status: 500 });
  }
} 