import { NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';

type UseCase = {
  id: string;
  stage?: string;
  priority?: string;
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
  } | null;
  assessData?: {
    stepsData: any;
  } | null;
  Approval?: {
    governanceStatus?: string;
    riskStatus?: string;
    legalStatus?: string;
    businessStatus?: string;
  } | null;
};

export async function GET() {
  try {
    // Fetch all use cases with optimized selection and related data
    const useCases = await prismaClient.useCase.findMany({
      select: {
        id: true,
        stage: true,
<<<<<<< Updated upstream
        businessFunction: true,
        priority: true,
=======
        priority: true,
        businessFunction: true,
>>>>>>> Stashed changes
        operationalImpactScore: true,
        productivityImpactScore: true,
        revenueImpactScore: true,
        implementationComplexity: true,
        confidenceLevel: true,
<<<<<<< Updated upstream
        createdAt: true,
        finopsData: {
          select: {
            totalInvestment: true,
            ROI: true,
=======
        finopsData: {
          select: {
            ROI: true,
            totalInvestment: true,
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      }
=======
      },
      orderBy: { updatedAt: 'desc' }
>>>>>>> Stashed changes
    });

    const typedUseCases = useCases as UseCase[];

    // Calculate portfolio metrics
    const totalUseCases = useCases.length;
    
    // Handle case where no use cases exist
    if (totalUseCases === 0) {
      return NextResponse.json({
        portfolio: {
          totalUseCases: 0,
          stageDistribution: {},
          businessFunctionDistribution: {},
          priorityDistribution: {},
          impactScores: { operational: { average: 0, total: 0 }, productivity: { average: 0, total: 0 }, revenue: { average: 0, total: 0 } },
          overallScore: 0,
          complexityAnalysis: { average: 0, distribution: {} },
          confidenceAnalysis: { average: 0, distribution: {} }
        },
        financial: {
          totalInvestment: 0, totalROI: 0, averageROI: 0, projectedValue: 0, netValue: 0,
          costBreakdown: { development: 0, infrastructure: 0, operations: 0, api: 0 },
          investmentByFunction: {}
        },
        risk: {
          totalAssessed: 0, riskDistribution: {}, riskCategories: {},
          approvalStatus: {
            totalWithApprovals: 0,
            governance: { approved: 0, pending: 0, rejected: 0 },
            risk: { approved: 0, pending: 0, rejected: 0 },
            legal: { approved: 0, pending: 0, rejected: 0 },
            business: { approved: 0, pending: 0, rejected: 0 }
          }
        },
        strategic: {
          businessFunctionPerformance: [],
          portfolioBalance: { highImpactLowComplexity: 0, quickWins: 0 }
        }
      });
    }
    
    // Stage Distribution
    const stageDistribution = useCases.reduce((acc: Record<string, number>, uc: any) => {
      const stage = uc.stage || 'discovery';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});

    // Business Function Distribution
    const businessFunctionDistribution = useCases.reduce((acc: Record<string, number>, uc: any) => {
      acc[uc.businessFunction] = (acc[uc.businessFunction] || 0) + 1;
      return acc;
    }, {});

    // Priority Distribution
    const priorityDistribution = useCases.reduce((acc: Record<string, number>, uc: any) => {
      const priority = uc.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    // Impact Scores
    const impactScores = {
      operational: {
        average: totalUseCases > 0 ? useCases.reduce((sum: number, uc: any) => sum + uc.operationalImpactScore, 0) / totalUseCases : 0,
        total: useCases.reduce((sum: number, uc: any) => sum + uc.operationalImpactScore, 0)
      },
      productivity: {
        average: totalUseCases > 0 ? useCases.reduce((sum: number, uc: any) => sum + uc.productivityImpactScore, 0) / totalUseCases : 0,
        total: useCases.reduce((sum: number, uc: any) => sum + uc.productivityImpactScore, 0)
      },
      revenue: {
        average: totalUseCases > 0 ? useCases.reduce((sum: number, uc: any) => sum + uc.revenueImpactScore, 0) / totalUseCases : 0,
        total: useCases.reduce((sum: number, uc: any) => sum + uc.revenueImpactScore, 0)
      }
    };

    // Overall Portfolio Score
    const overallScore = (impactScores.operational.average + impactScores.productivity.average + impactScores.revenue.average) / 3;

    // Financial Metrics (from FinOps data)
    const finopsUseCases = useCases.filter((uc: any) => uc.finopsData);
    const financialMetrics = {
      totalInvestment: finopsUseCases.reduce((sum: number, uc: any) => sum + (uc.finopsData?.totalInvestment || 0), 0),
      totalROI: finopsUseCases.reduce((sum: number, uc: any) => sum + (uc.finopsData?.ROI || 0), 0),
      averageROI: finopsUseCases.length > 0 ? finopsUseCases.reduce((sum: number, uc: any) => sum + (uc.finopsData?.ROI || 0), 0) / finopsUseCases.length : 0,
      projectedValue: finopsUseCases.reduce((sum: number, uc: any) => sum + (uc.finopsData?.cumValue || 0), 0),
      netValue: finopsUseCases.reduce((sum: number, uc: any) => sum + (uc.finopsData?.netValue || 0), 0),
      costBreakdown: {
        development: finopsUseCases.reduce((sum: number, uc: any) => sum + (uc.finopsData?.devCostBase || 0), 0),
        infrastructure: finopsUseCases.reduce((sum: number, uc: any) => sum + (uc.finopsData?.infraCostBase || 0), 0),
        operations: finopsUseCases.reduce((sum: number, uc: any) => sum + (uc.finopsData?.opCostBase || 0), 0),
        api: finopsUseCases.reduce((sum: number, uc: any) => sum + (uc.finopsData?.apiCostBase || 0), 0)
      }
    };

    // Complexity Analysis
    const complexityAnalysis = {
      average: totalUseCases > 0 ? useCases.reduce((sum: number, uc: any) => sum + uc.implementationComplexity, 0) / totalUseCases : 0,
      distribution: useCases.reduce((acc: Record<string, number>, uc: any) => {
        const complexity = uc.implementationComplexity;
        const level = complexity <= 3 ? 'Low' : complexity <= 6 ? 'Medium' : 'High';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {})
    };

    // Confidence Levels
    const confidenceAnalysis = {
      average: totalUseCases > 0 ? useCases.reduce((sum: number, uc: any) => sum + uc.confidenceLevel, 0) / totalUseCases : 0,
      distribution: useCases.reduce((acc: Record<string, number>, uc: any) => {
        const confidence = uc.confidenceLevel;
        const level = confidence <= 30 ? 'Low' : confidence <= 70 ? 'Medium' : 'High';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {})
    };

    // Risk Analysis (from Assessment data)
    const assessedUseCases = useCases.filter((uc: any) => uc.assessData);
    const riskAnalysis = {
      totalAssessed: assessedUseCases.length,
      riskDistribution: { Low: 0, Medium: 0, High: 0 },
      riskCategories: {
        technical: { Low: 0, Medium: 0, High: 0 },
        business: { Low: 0, Medium: 0, High: 0 },
        data: { Low: 0, Medium: 0, High: 0 },
        ethical: { Low: 0, Medium: 0, High: 0 }
      }
    };

    // Process assessment data for risk analysis
    assessedUseCases.forEach((uc: any) => {
      try {
        const stepsData = uc.assessData?.stepsData as any;
        if (stepsData?.riskAssessment) {
          const risks = stepsData.riskAssessment;
          
          // Overall risk calculation (simplified)
          let totalRiskScore = 0;
          let riskCount = 0;
          
          Object.values(risks).forEach((riskCategory: any) => {
            if (typeof riskCategory === 'object' && riskCategory !== null) {
              Object.values(riskCategory).forEach((risk: any) => {
                if (risk && typeof risk === 'object' && risk.probability && risk.impact) {
                  const riskScore = risk.probability * risk.impact;
                  totalRiskScore += riskScore;
                  riskCount++;
                }
              });
            }
          });
          
          if (riskCount > 0) {
            const avgRisk = totalRiskScore / riskCount;
            const level = avgRisk <= 4 ? 'Low' : avgRisk <= 16 ? 'Medium' : 'High';
            riskAnalysis.riskDistribution[level]++;
          }
        }
      } catch (error) {
        console.error('Error processing risk data:', error);
      }
    });

    // Approval Status Analysis
    const approvalsUseCases = useCases.filter((uc: any) => uc.Approval);
    const approvalStatus = {
      totalWithApprovals: approvalsUseCases.length,
      governance: {
        approved: approvalsUseCases.filter((uc: any) => uc.Approval?.governanceStatus === 'approved').length,
        pending: approvalsUseCases.filter((uc: any) => uc.Approval?.governanceStatus === 'pending').length,
        rejected: approvalsUseCases.filter((uc: any) => uc.Approval?.governanceStatus === 'rejected').length
      },
      risk: {
        approved: approvalsUseCases.filter((uc: any) => uc.Approval?.riskStatus === 'approved').length,
        pending: approvalsUseCases.filter((uc: any) => uc.Approval?.riskStatus === 'pending').length,
        rejected: approvalsUseCases.filter((uc: any) => uc.Approval?.riskStatus === 'rejected').length
      },
      legal: {
        approved: approvalsUseCases.filter((uc: any) => uc.Approval?.legalStatus === 'approved').length,
        pending: approvalsUseCases.filter((uc: any) => uc.Approval?.legalStatus === 'pending').length,
        rejected: approvalsUseCases.filter((uc: any) => uc.Approval?.legalStatus === 'rejected').length
      },
      business: {
        approved: approvalsUseCases.filter((uc: any) => uc.Approval?.businessStatus === 'approved').length,
        pending: approvalsUseCases.filter((uc: any) => uc.Approval?.businessStatus === 'pending').length,
        rejected: approvalsUseCases.filter((uc: any) => uc.Approval?.businessStatus === 'rejected').length
      }
    };

    // Business Function Performance
    const businessFunctionPerformance = Object.keys(businessFunctionDistribution).map(func => {
      const funcUseCases = useCases.filter((uc: any) => uc.businessFunction === func);
      const funcCount = funcUseCases.length;
      return {
        function: func,
        count: funcCount,
        avgOperationalScore: funcCount > 0 ? funcUseCases.reduce((sum: any, uc: any) => sum + uc.operationalImpactScore, 0) / funcCount : 0,
        avgProductivityScore: funcCount > 0 ? funcUseCases.reduce((sum: any, uc: any) => sum + uc.productivityImpactScore, 0) / funcCount : 0,
        avgRevenueScore: funcCount > 0 ? funcUseCases.reduce((sum: any, uc: any) => sum + uc.revenueImpactScore, 0) / funcCount : 0,
        totalInvestment: funcUseCases.reduce((sum: any, uc: any) => sum + (uc.finopsData?.totalInvestment || 0), 0),
        averageROI: funcUseCases.filter((uc: any) => uc.finopsData).length > 0 ? 
          funcUseCases.reduce((sum: any, uc: any) => sum + (uc.finopsData?.ROI || 0), 0) / funcUseCases.filter((uc: any) => uc.finopsData).length : 0
      };
    });

    const executiveMetrics = {
      portfolio: {
        totalUseCases,
        stageDistribution,
        businessFunctionDistribution,
        priorityDistribution,
        impactScores,
        overallScore: Math.round(overallScore * 10) / 10,
        complexityAnalysis,
        confidenceAnalysis
      },
      financial: {
        ...financialMetrics,
        investmentByFunction: businessFunctionPerformance.reduce((acc: Record<string, number>, func) => {
          acc[func.function] = func.totalInvestment;
          return acc;
        }, {})
      },
      risk: {
        ...riskAnalysis,
        approvalStatus
      },
      strategic: {
        businessFunctionPerformance,
        portfolioBalance: {
          highImpactLowComplexity: typedUseCases.filter((uc: UseCase) => 
            (uc.operationalImpactScore + uc.productivityImpactScore + uc.revenueImpactScore) / 3 >= 7 && 
            uc.implementationComplexity <= 4
          ).length,
          quickWins: typedUseCases.filter((uc: UseCase) => 
            uc.confidenceLevel >= 70 && 
            uc.implementationComplexity <= 3
          ).length
        }
      }
    };

    const response = NextResponse.json(executiveMetrics);
<<<<<<< Updated upstream
=======
    // Add caching headers for executive metrics (cache for 5 minutes)
>>>>>>> Stashed changes
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return response;

  } catch (error) {
    console.error('Error fetching executive metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executive metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}