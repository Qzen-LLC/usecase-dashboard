import { NextResponse } from 'next/server';
import { prismaClient, retryDatabaseOperation } from '@/utils/db';
import { withAuth } from '@/lib/auth-gateway';


export const GET = withAuth(async (request, { auth }) => {
  try {
    // Check for cache-busting parameter
    const { searchParams } = new URL(request.url);
    const cacheBust = searchParams.get('t');
    
    // auth context is provided by withAuth wrapper
    const clerkId = auth.userId!;
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId },
    });
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    

    
    // Only include use cases for this user if USER role
    let useCases;
    
    // Helper function to get include object with or without risks
    const getIncludeObject = async () => {
      try {
        // Test if risks table exists by doing a simple query
        await prismaClient.risk.findFirst();
        return {
          assessData: true,
          euAiActAssessments: true,
          iso42001Assessments: true,
          uaeAiAssessments: true,
          risks: {
            select: {
              id: true,
              category: true,
              riskLevel: true,
              status: true,
            },
          },
        };
      } catch (error) {
        console.log('Risks table not available, using fallback include');
        return {
          assessData: true,
          euAiActAssessments: true,
          iso42001Assessments: true,
          uaeAiAssessments: true,
        };
      }
    };

    const includeObject = await getIncludeObject();
    
    try {
      if (userRecord.role === 'QZEN_ADMIN') {
        useCases = await retryDatabaseOperation(() =>
          prismaClient.useCase.findMany({
            include: includeObject,
          })
        );
      } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
        useCases = await retryDatabaseOperation(() =>
          prismaClient.useCase.findMany({
            where: { organizationId: userRecord.organizationId },
            include: includeObject,
          })
        );
      } else {
        // USER or fallback: only their own use cases
        useCases = await retryDatabaseOperation(() =>
          prismaClient.useCase.findMany({
            where: { userId: userRecord.id },
            include: includeObject,
          })
        );
      }
    } catch (error) {
      // Fallback if framework tables don't exist yet
      console.log('Framework tables not found, falling back to basic data');
      if (userRecord.role === 'QZEN_ADMIN') {
        useCases = await retryDatabaseOperation(() =>
          prismaClient.useCase.findMany({
            include: {
              assessData: true,
            },
          })
        );
      } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
        useCases = await retryDatabaseOperation(() =>
          prismaClient.useCase.findMany({
            where: { organizationId: userRecord.organizationId },
            include: {
              assessData: true,
            },
          })
        );
      } else {
        useCases = await retryDatabaseOperation(() =>
          prismaClient.useCase.findMany({
            where: { userId: userRecord.id },
            include: {
              assessData: true,
            },
          })
        );
      }
      // Add empty arrays for framework assessments
      useCases = useCases.map(uc => ({
        ...uc,
        euAiActAssessments: [],
        iso42001Assessments: [],
        uaeAiAssessments: []
      }));
    }

    const governanceData = (useCases as any[])
      .map((useCase) => {
        const uc = useCase as any;
        const regulatoryFrameworks: string[] = [];
        const industryStandards: string[] = [];

        // Extract regulatory frameworks and standards from risk assessment if available
        if (uc.assessData?.stepsData) {
          const stepsData = uc.assessData.stepsData as any;
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
        const euAiActAssessments = Array.isArray(uc.euAiActAssessments) ? (uc.euAiActAssessments as any[]) : [];
        const iso42001Assessments = Array.isArray(uc.iso42001Assessments) ? (uc.iso42001Assessments as any[]) : [];
        const uaeAiAssessments = Array.isArray(uc.uaeAiAssessments) ? (uc.uaeAiAssessments as any[]) : [];
        const hasAssessments = euAiActAssessments.length > 0 || iso42001Assessments.length > 0 || uaeAiAssessments.length > 0;
        
        // Do not filter out use cases; include even if no frameworks/assessments yet

        // Debug log for progress values
        if (euAiActAssessments.length > 0 || iso42001Assessments.length > 0 || uaeAiAssessments.length > 0) {
          const euFirst: any = euAiActAssessments[0] ?? {};
          const isoFirst: any = iso42001Assessments[0] ?? {};
          const uaeFirst: any = uaeAiAssessments[0] ?? {};
          console.log(`🔍 Governance Data - Use Case ${uc.aiucId}:`, {
            euProgress: euFirst.progress || 0,
            isoProgress: isoFirst.progress || 0,
            uaeProgress: uaeFirst.progress || 0,
            euStatus: euFirst.status || 'N/A',
            isoStatus: isoFirst.status || 'N/A',
            uaeStatus: uaeFirst.status || 'N/A'
          });
        }

        return {
          useCaseId: uc.id,
          useCaseNumber: uc.aiucId,
          useCaseName: uc.title,
          useCaseType: uc.stage || 'N/A',
          department: uc.businessFunction,
          regulatoryFrameworks,
          industryStandards,
          lastUpdated: uc.assessData?.updatedAt?.toISOString() || uc.updatedAt.toISOString(),
          euAiActAssessments,
          iso42001Assessments,
          uaeAiAssessments,
          assessData: uc.assessData,
          risks: (uc as any).risks || [],
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
}, { 
  requireUser: true,
  // Use DB-backed authorization to avoid relying on Clerk  
  customAuthorize: async (ctx) => {
    const record = await prismaClient.user.findUnique({
      where: { clerkId: ctx.userId! },
      select: { role: true },
    });
    return record?.role === 'QZEN_ADMIN';
  }
});