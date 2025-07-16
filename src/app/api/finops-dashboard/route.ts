import { NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';

export async function GET() {
  try {
    // Fetch all use cases with their FinOps data and relevant fields
    const useCases = await prismaClient.useCase.findMany({
      where: {
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
      },
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

    return NextResponse.json({ finops });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch FinOps dashboard data', details: String(err) }, { status: 500 });
  }
} 