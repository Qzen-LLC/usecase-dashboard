import { NextResponse } from 'next/server';
import { prismaClient, retryDatabaseOperation } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';
import redis from '@/lib/redis';

export async function GET(request: Request) {
  try {
    // Check for cache-busting parameter
    const { searchParams } = new URL(request.url);
    const cacheBust = searchParams.get('t');
    
    // TEMPORARY: Auth bypass for testing
    const user = await currentUser();
    let userRecord;
    
    if (!user) {
      // Use bypass user for testing
      console.log('[API] Using bypass user for testing');
      userRecord = await prismaClient.user.findFirst({
        where: { role: 'QZEN_ADMIN' }
      });
      if (!userRecord) {
        return NextResponse.json({ error: 'No admin user found for bypass' }, { status: 500 });
      }
    } else {
      userRecord = await prismaClient.user.findUnique({
        where: { clerkId: user.id },
      });
      if (!userRecord) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }
    
    // Redis cache check (skip cache if cache-busting is requested)
    const cacheKey = `governance-data:${userRecord.role}:${userRecord.id}`;
    if (!cacheBust) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return new NextResponse(cached, { headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
      }
    }
    
    // Only include use cases for this user if USER role
    let useCases;
    try {
      if (userRecord.role === 'QZEN_ADMIN') {
        useCases = await retryDatabaseOperation(() =>
          prismaClient.useCase.findMany({
            include: {
              assessData: true,
              euAiActAssessments: true,
              iso42001Assessments: true,
            },
          })
        );
      } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
        useCases = await retryDatabaseOperation(() =>
          prismaClient.useCase.findMany({
            where: { organizationId: userRecord.organizationId },
            include: {
              assessData: true,
              euAiActAssessments: true,
              iso42001Assessments: true,
            },
          })
        );
      } else {
        // USER or fallback: only their own use cases
        useCases = await retryDatabaseOperation(() =>
          prismaClient.useCase.findMany({
            where: { userId: userRecord.id },
            include: {
              assessData: true,
              euAiActAssessments: true,
              iso42001Assessments: true,
            },
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
        const euAiActAssessments = Array.isArray(useCase.euAiActAssessments) ? useCase.euAiActAssessments : [];
        const iso42001Assessments = Array.isArray(useCase.iso42001Assessments) ? useCase.iso42001Assessments : [];
        const hasAssessments = euAiActAssessments.length > 0 || iso42001Assessments.length > 0;
        
        // Filter: only show use cases with frameworks selected OR active assessments
        if (!hasFrameworks && !hasAssessments) {
          return null;
        }

        // Debug log for progress values
        if (euAiActAssessments.length > 0 || iso42001Assessments.length > 0) {
          console.log(`🔍 Governance Data - Use Case ${useCase.aiucId}:`, {
            euProgress: euAiActAssessments[0]?.progress || 0,
            isoProgress: iso42001Assessments[0]?.progress || 0,
            euStatus: euAiActAssessments[0]?.status || 'N/A',
            isoStatus: iso42001Assessments[0]?.status || 'N/A'
          });
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
          euAiActAssessments,
          iso42001Assessments,
        };
      })
      .filter((item) => item !== null);

    // Only cache if not cache-busting
    if (!cacheBust) {
      await redis.set(cacheKey, JSON.stringify(governanceData), 'EX', 300);
    }
    
    return NextResponse.json(governanceData);
  } catch (error) {
    console.error('Error fetching governance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch governance data' },
      { status: 500 }
    );
  }
}