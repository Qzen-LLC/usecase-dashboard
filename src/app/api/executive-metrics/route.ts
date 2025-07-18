import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';
import redis from '@/lib/redis';

interface UseCase {
  id: string;
  stage: string;
  priority: string;
  businessFunction: string;
  operationalImpactScore: number;
  productivityImpactScore: number;
  revenueImpactScore: number;
  implementationComplexity: number;
  confidenceLevel: number;
  finopsData?: {
    ROI: number;
    totalInvestment: number;
    cumValue: number;
    netValue: number;
    devCostBase: number;
    infraCostBase: number;
    opCostBase: number;
    apiCostBase: number;
  };
  assessData?: {
    stepsData: any;
  };
  Approval?: {
    governanceStatus: string;
    riskStatus: string;
    legalStatus: string;
    businessStatus: string;
  };
}

export async function GET() {
  const startTime = Date.now(); // For API Round Trip Time & Server-side processing

  try {
    // Get current user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from database
    const dbUserQueryStart = Date.now();
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
    });
    const dbUserQueryEnd = Date.now();
    const dbUserQueryTime = dbUserQueryEnd - dbUserQueryStart;

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Redis cache check
    const cacheKey = `executive-metrics:${userRecord.role}:${userRecord.id}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const endTime = Date.now();
      const apiRoundTripTime = endTime - startTime;
      const serverResponseTime = apiRoundTripTime; // In case of cache hit, server response time is almost RTT

      return new NextResponse(cached, {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'X-API-RTT': apiRoundTripTime.toString(),
          'X-Server-Response-Time': serverResponseTime.toString(),
          'X-DB-Query-Time': 'N/A' // Not applicable for cache hit
        }
      });
    }

    let useCases = [];
    let dbUseCaseQueryTime = 0;

    // Fetch use cases based on role
    const dbUseCaseQueryStart = Date.now();
    if (userRecord.role === 'QZEN_ADMIN') {
      useCases = await prismaClient.useCase.findMany({
        select: {
          id: true,
          stage: true,
          priority: true,
          businessFunction: true,
          operationalImpactScore: true,
          productivityImpactScore: true,
          revenueImpactScore: true,
          implementationComplexity: true,
          confidenceLevel: true,
          finopsData: {
            select: {
              ROI: true,
              totalInvestment: true,
              cumValue: true,
              netValue: true,
              devCostBase: true,
              infraCostBase: true,
              opCostBase: true,
              apiCostBase: true
            }
          },
          assessData: {
            select: {
              stepsData: true
            }
          },
          Approval: {
            select: {
              governanceStatus: true,
              riskStatus: true,
              legalStatus: true,
              businessStatus: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
    } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
      // ORG_ADMIN and ORG_USER can see all use cases in their organization
      useCases = await prismaClient.useCase.findMany({
        where: { organizationId: userRecord.organizationId },
        select: {
          id: true,
          stage: true,
          priority: true,
          businessFunction: true,
          operationalImpactScore: true,
          productivityImpactScore: true,
          revenueImpactScore: true,
          implementationComplexity: true,
          confidenceLevel: true,
          finopsData: {
            select: {
              ROI: true,
              totalInvestment: true,
              cumValue: true,
              netValue: true,
              devCostBase: true,
              infraCostBase: true,
              opCostBase: true,
              apiCostBase: true
            }
          },
          assessData: {
            select: {
              stepsData: true
            }
          },
          Approval: {
            select: {
              governanceStatus: true,
              riskStatus: true,
              legalStatus: true,
              businessStatus: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
    } else {
      // USER can only see their own use cases
      useCases = await prismaClient.useCase.findMany({
        where: { userId: userRecord.id },
        select: {
          id: true,
          stage: true,
          priority: true,
          businessFunction: true,
          operationalImpactScore: true,
          productivityImpactScore: true,
          revenueImpactScore: true,
          implementationComplexity: true,
          confidenceLevel: true,
          finopsData: {
            select: {
              ROI: true,
              totalInvestment: true,
              cumValue: true,
              netValue: true,
              devCostBase: true,
              infraCostBase: true,
              opCostBase: true,
              apiCostBase: true
            }
          },
          assessData: {
            select: {
              stepsData: true
            }
          },
          Approval: {
            select: {
              governanceStatus: true,
              riskStatus: true,
              legalStatus: true,
              businessStatus: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
    }
    const dbUseCaseQueryEnd = Date.now();
    dbUseCaseQueryTime = dbUseCaseQueryEnd - dbUseCaseQueryStart;

    const typedUseCases = useCases as UseCase[];

    // Calculate portfolio metrics
    const totalUseCases = useCases.length;

    // Stage Distribution
    const stageDistribution = useCases.reduce((acc: Record<string, number>, uc: any) => {
      const stage = uc.stage || 'discovery';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});

    // Impact Scores
    const impactScores = {
      operational: {
        average: totalUseCases > 0 ? useCases.reduce((sum: number, uc: any) => sum + (uc.operationalImpactScore || 0), 0) / totalUseCases : 0,
        total: useCases.reduce((sum: number, uc: any) => sum + (uc.operationalImpactScore || 0), 0)
      },
      productivity: {
        average: totalUseCases > 0 ? useCases.reduce((sum: number, uc: any) => sum + (uc.productivityImpactScore || 0), 0) / totalUseCases : 0,
        total: useCases.reduce((sum: number, uc: any) => sum + (uc.productivityImpactScore || 0), 0)
      },
      revenue: {
        average: totalUseCases > 0 ? useCases.reduce((sum: number, uc: any) => sum + (uc.revenueImpactScore || 0), 0) / totalUseCases : 0,
        total: useCases.reduce((sum: number, uc: any) => sum + (uc.revenueImpactScore || 0), 0)
      }
    };

    // Overall Portfolio Score
    const overallScore = (impactScores.operational.average + impactScores.productivity.average + impactScores.revenue.average) / 3;

    // Complexity Analysis
    const complexityAnalysis = {
      average: totalUseCases > 0 ? useCases.reduce((sum: number, uc: any) => sum + (uc.implementationComplexity || 0), 0) / totalUseCases : 0,
      distribution: useCases.reduce((acc: Record<string, number>, uc: any) => {
        const complexity = uc.implementationComplexity || 0;
        if (complexity <= 3) acc['low'] = (acc['low'] || 0) + 1;
        else if (complexity <= 6) acc['medium'] = (acc['medium'] || 0) + 1;
        else acc['high'] = (acc['high'] || 0) + 1;
        return acc;
      }, {})
    };

    // Confidence Analysis
    const confidenceAnalysis = {
      average: totalUseCases > 0 ? useCases.reduce((sum: number, uc: any) => sum + (uc.confidenceLevel || 0), 0) / totalUseCases : 0,
      distribution: useCases.reduce((acc: Record<string, number>, uc: any) => {
        const confidence = uc.confidenceLevel || 0;
        if (confidence <= 30) acc['low'] = (acc['low'] || 0) + 1;
        else if (confidence <= 70) acc['medium'] = (acc['medium'] || 0) + 1;
        else acc['high'] = (acc['high'] || 0) + 1;
        return acc;
      }, {})
    };

    // Financial Metrics (from FinOps data)
    const finopsUseCases = useCases.filter((uc: any) => uc.finopsData);
    const totalInvestment = finopsUseCases.reduce((sum: number, uc: any) => sum + (uc.finopsData?.totalInvestment || 0), 0);
    const projectedValue = finopsUseCases.reduce((sum: number, uc: any) => sum + (uc.finopsData?.cumValue || 0), 0);
    const netValue = projectedValue - totalInvestment;
    const averageROI = finopsUseCases.length > 0 ?
      finopsUseCases.reduce((sum: number, uc: any) => sum + (uc.finopsData?.ROI || 0), 0) / finopsUseCases.length : 0;

    // Cost Breakdown
    const costBreakdown = {
      development: finopsUseCases.reduce((sum: number, uc: any) => sum + (uc.finopsData?.devCostBase || 0), 0),
      infrastructure: finopsUseCases.reduce((sum: number, uc: any) => sum + (uc.finopsData?.infraCostBase || 0), 0),
      operations: finopsUseCases.reduce((sum: number, uc: any) => sum + (uc.finopsData?.opCostBase || 0), 0),
      api: finopsUseCases.reduce((sum: number, uc: any) => sum + (uc.finopsData?.apiCostBase || 0), 0)
    };

    // Risk Management
    const riskDistribution = {
      Low: 0,
      Medium: 0,
      High: 0
    };

    // Calculate risk distribution based on complexity and confidence
    useCases.forEach((uc: any) => {
      const complexity = uc.implementationComplexity || 0;
      const confidence = uc.confidenceLevel || 0;

      // Simple risk calculation: high complexity + low confidence = high risk
      if (complexity >= 7 && confidence <= 40) {
        riskDistribution.High++;
      } else if (complexity >= 4 || confidence <= 60) {
        riskDistribution.Medium++;
      } else {
        riskDistribution.Low++;
      }
    });

    // Approval Status
    const approvalStatus = {
      governance: { approved: 0, pending: 0, rejected: 0 },
      risk: { approved: 0, pending: 0, rejected: 0 },
      legal: { approved: 0, pending: 0, rejected: 0 },
      business: { approved: 0, pending: 0, rejected: 0 }
    };

    useCases.forEach((uc: any) => {
      const approval = uc.Approval;
      if (approval) {
        // Governance
        if (approval.governanceStatus === 'approved') approvalStatus.governance.approved++;
        else if (approval.governanceStatus === 'rejected') approvalStatus.governance.rejected++;
        else approvalStatus.governance.pending++;

        // Risk
        if (approval.riskStatus === 'approved') approvalStatus.risk.approved++;
        else if (approval.riskStatus === 'rejected') approvalStatus.risk.rejected++;
        else approvalStatus.risk.pending++;

        // Legal
        if (approval.legalStatus === 'approved') approvalStatus.legal.approved++;
        else if (approval.legalStatus === 'rejected') approvalStatus.legal.rejected++;
        else approvalStatus.legal.pending++;

        // Business
        if (approval.businessStatus === 'approved') approvalStatus.business.approved++;
        else if (approval.businessStatus === 'rejected') approvalStatus.business.rejected++;
        else approvalStatus.business.pending++;
      } else {
        // If no approval data, mark as pending
        approvalStatus.governance.pending++;
        approvalStatus.risk.pending++;
        approvalStatus.legal.pending++;
        approvalStatus.business.pending++;
      }
    });

    // Strategic Alignment
    const businessFunctionPerformance = Object.entries(
      useCases.reduce((acc: Record<string, any>, uc: any) => {
        const function_ = uc.businessFunction || 'Other';
        if (!acc[function_]) {
          acc[function_] = {
            function: function_,
            count: 0,
            totalOperational: 0,
            totalProductivity: 0,
            totalRevenue: 0,
            totalInvestment: 0,
            totalROI: 0
          };
        }

        acc[function_].count++;
        acc[function_].totalOperational += uc.operationalImpactScore || 0;
        acc[function_].totalProductivity += uc.productivityImpactScore || 0;
        acc[function_].totalRevenue += uc.revenueImpactScore || 0;

        if (uc.finopsData) {
          acc[function_].totalInvestment += uc.finopsData.totalInvestment || 0;
          acc[function_].totalROI += uc.finopsData.ROI || 0;
        }

        return acc;
      }, {})
    ).map(([function_, data]: [string, any]) => ({
      function: data.function,
      count: data.count,
      avgOperationalScore: data.count > 0 ? data.totalOperational / data.count : 0,
      avgProductivityScore: data.count > 0 ? data.totalProductivity / data.count : 0,
      avgRevenueScore: data.count > 0 ? data.totalRevenue / data.count : 0,
      totalInvestment: data.totalInvestment,
      averageROI: data.count > 0 ? data.totalROI / data.count : 0
    }));

    // Portfolio Balance
    const portfolioBalance = {
      quickWins: 0,
      highImpactLowComplexity: 0
    };

    useCases.forEach((uc: any) => {
      const complexity = uc.implementationComplexity || 0;
      const operational = uc.operationalImpactScore || 0;
      const productivity = uc.productivityImpactScore || 0;
      const revenue = uc.revenueImpactScore || 0;
      const avgImpact = (operational + productivity + revenue) / 3;

      if (complexity <= 3 && avgImpact >= 7) {
        portfolioBalance.quickWins++;
      }
      if (complexity <= 5 && avgImpact >= 8) {
        portfolioBalance.highImpactLowComplexity++;
      }
    });

    const responseData = {
      portfolio: {
        totalUseCases,
        stageDistribution,
        impactScores,
        overallScore,
        complexityAnalysis,
        confidenceAnalysis
      },
      financial: {
        totalInvestment,
        averageROI,
        projectedValue,
        netValue,
        costBreakdown
      },
      risk: {
        totalAssessed: totalUseCases,
        riskDistribution,
        approvalStatus
      },
      strategic: {
        businessFunctionPerformance,
        portfolioBalance
      }
    };

    await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 300);

    const endTime = Date.now();
    const apiRoundTripTime = endTime - startTime;
    const serverResponseTime = endTime - startTime; // More accurate as it includes all server-side logic

    return new NextResponse(JSON.stringify(responseData), {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        'X-API-RTT': apiRoundTripTime.toString(),
        'X-Server-Response-Time': serverResponseTime.toString(),
        'X-DB-Query-Time': (dbUserQueryTime + dbUseCaseQueryTime).toString()
      }
    });
  } catch (error) {
    console.error('Error fetching executive metrics:', error);
    const endTime = Date.now();
    const apiRoundTripTime = endTime - startTime;
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-API-RTT': apiRoundTripTime.toString(),
        'X-Server-Response-Time': (endTime - startTime).toString(),
        'X-DB-Query-Time': 'N/A' // Error might occur before DB query
      }
    });
  }
}
