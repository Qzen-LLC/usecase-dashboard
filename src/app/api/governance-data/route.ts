import { NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';

export async function GET() {
  try {
    // First try to get use cases with framework assessments, fallback if tables don't exist
    let useCases;
    try {
      useCases = await prismaClient.useCase.findMany({
        include: {
          assessData: true,
          euAiActAssessments: true,
          iso42001Assessments: true,
        },
      });
    } catch (error) {
      // Fallback if framework tables don't exist yet
      console.log('Framework tables not found, falling back to basic data');
      useCases = await prismaClient.useCase.findMany({
        include: {
          assessData: true,
        },
      });
      
      // Add empty arrays for framework assessments
      useCases = useCases.map(uc => ({
        ...uc,
        euAiActAssessments: [],
        iso42001Assessments: []
      }));
    }

    const governanceData = useCases
      .map((useCase) => {
        const regulatoryFrameworks: string[] = [];
        const industryStandards: string[] = [];

        // Extract regulatory frameworks and standards from risk assessment if available
        if (useCase.assessData?.stepsData) {
          const stepsData = useCase.assessData.stepsData as any;
          const riskAssessment = stepsData.riskAssessment;

          if (riskAssessment) {
            if (riskAssessment.aiSpecific) {
              Object.entries(riskAssessment.aiSpecific).forEach(([key, value]) => {
                if (value === true) {
                  regulatoryFrameworks.push(key);
                }
              });
            }

            if (riskAssessment.certifications) {
              Object.entries(riskAssessment.certifications).forEach(([key, value]) => {
                if (value === true) {
                  industryStandards.push(key);
                }
              });
            }
          }
        }

        // Only show use cases that have regulatory frameworks or industry standards selected
        const hasFrameworks = regulatoryFrameworks.length > 0 || industryStandards.length > 0;
        const hasAssessments = useCase.euAiActAssessments && useCase.euAiActAssessments.length > 0 || 
                              useCase.iso42001Assessments && useCase.iso42001Assessments.length > 0;
        
        // Filter: only show use cases with frameworks selected OR active assessments
        if (!hasFrameworks && !hasAssessments) {
          return null;
        }

        return {
          useCaseId: useCase.id,
          useCaseNumber: useCase.aiucId,
          useCaseName: useCase.title,
          useCaseType: useCase.stage || 'N/A',
          department: useCase.businessFunction,
          regulatoryFrameworks,
          industryStandards,
          lastUpdated: useCase.assessData?.updatedAt?.toISOString() || useCase.updatedAt.toISOString(),
          euAiActAssessment: useCase.euAiActAssessments?.[0] ? {
            id: useCase.euAiActAssessments[0].id,
            status: useCase.euAiActAssessments[0].status,
            progress: useCase.euAiActAssessments[0].progress,
          } : undefined,
          iso42001Assessment: useCase.iso42001Assessments?.[0] ? {
            id: useCase.iso42001Assessments[0].id,
            status: useCase.iso42001Assessments[0].status,
            progress: useCase.iso42001Assessments[0].progress,
          } : undefined,
        };
      })
      .filter((item) => item !== null);

    return NextResponse.json(governanceData);
  } catch (error) {
    console.error('Error fetching governance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch governance data' },
      { status: 500 }
    );
  }
}