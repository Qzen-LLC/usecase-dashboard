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
    
    // Add answers to include object to fetch framework selections
    const includeWithAnswers = {
      ...includeObject,
      answers: {
        include: {
          question: {
            select: {
              text: true,
              type: true,
            }
          },
          questionTemplate: {
            select: {
              text: true,
              type: true,
            }
          }
        }
      }
    };
    
    try {
      if (userRecord.role === 'QZEN_ADMIN') {
        useCases = await retryDatabaseOperation(() =>
          prismaClient.useCase.findMany({
            include: includeWithAnswers,
          })
        );
      } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
        useCases = await retryDatabaseOperation(() =>
          prismaClient.useCase.findMany({
            where: { organizationId: userRecord.organizationId },
            include: includeWithAnswers,
          })
        );
      } else {
        // USER or fallback: only their own use cases
        useCases = await retryDatabaseOperation(() =>
          prismaClient.useCase.findMany({
            where: { userId: userRecord.id },
            include: includeWithAnswers,
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
              answers: {
                include: {
                  question: {
                    select: {
                      text: true,
                      type: true,
                    }
                  },
                  questionTemplate: {
                    select: {
                      text: true,
                      type: true,
                    }
                  }
                }
              }
            },
          })
        );
      } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
        useCases = await retryDatabaseOperation(() =>
          prismaClient.useCase.findMany({
            where: { organizationId: userRecord.organizationId },
            include: {
              assessData: true,
              answers: {
                include: {
                  question: {
                    select: {
                      text: true,
                      type: true,
                    }
                  },
                  questionTemplate: {
                    select: {
                      text: true,
                      type: true,
                    }
                  }
                }
              }
            },
          })
        );
      } else {
        useCases = await retryDatabaseOperation(() =>
          prismaClient.useCase.findMany({
            where: { userId: userRecord.id },
            include: {
              assessData: true,
              answers: {
                include: {
                  question: {
                    select: {
                      text: true,
                      type: true,
                    }
                  },
                  questionTemplate: {
                    select: {
                      text: true,
                      type: true,
                    }
                  }
                }
              }
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

        // Extract regulatory frameworks and standards from answers (dynamic questions)
        if (useCase.answers && Array.isArray(useCase.answers)) {
          useCase.answers.forEach((answer: any) => {
            // Get question text from either question or questionTemplate
            const questionSource = answer.question || answer.questionTemplate;
            const sourceType = answer.question ? 'Question' : answer.questionTemplate ? 'QuestionTemplate' : 'Unknown';
            
            if (questionSource) {
              const questionText = questionSource.text;
              
              // Check for AI-Specific Regulations question
              if (questionText === 'AI-Specific Regulations' && answer.value) {
                const labels = answer.value.labels || [];
                labels.forEach((label: string) => {
                  if (!regulatoryFrameworks.includes(label)) {
                    regulatoryFrameworks.push(label);
                  }
                });
              }
              
              // Check for Certifications/Standards question
              if (questionText === 'Certifications/Standards' && answer.value) {
                const labels = answer.value.labels || [];
                labels.forEach((label: string) => {
                  if (!industryStandards.includes(label)) {
                    industryStandards.push(label);
                  }
                });
              }
            }
          });
        }
        
        // Fallback: Also check old stepsData structure for backward compatibility
        if (regulatoryFrameworks.length === 0 && industryStandards.length === 0 && useCase.assessData?.stepsData) {
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
        const euAiActAssessments = Array.isArray((useCase as any).euAiActAssessments) ? (useCase as any).euAiActAssessments : [];
        const iso42001Assessments = Array.isArray((useCase as any).iso42001Assessments) ? (useCase as any).iso42001Assessments : [];
        const uaeAiAssessments = Array.isArray((useCase as any).uaeAiAssessments) ? (useCase as any).uaeAiAssessments : [];
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
          lastUpdated: (useCase as any).assessData?.updatedAt?.toISOString() || useCase.updatedAt.toISOString(),
          euAiActAssessments,
          iso42001Assessments,
          uaeAiAssessments,
          assessData: (useCase as any).assessData,
          risks: (useCase as any).risks || [],
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
  // Allow platform and organization roles; scope applied in handler
  customAuthorize: async (ctx) => {
    const record = await prismaClient.user.findUnique({
      where: { clerkId: ctx.userId! },
      select: { role: true },
    });
    const role = record?.role;
    return role === 'QZEN_ADMIN' || role === 'ORG_ADMIN' || role === 'ORG_USER' || role === 'USER';
  }
});