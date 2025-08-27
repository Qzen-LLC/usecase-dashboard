import { NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(
  request: Request,
  { params }: { params: { useCaseId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { useCaseId } = params;

    // Check if use case exists and user has access
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
      include: { organization: true }
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify use case exists and user has access
    const useCase = await prismaClient.useCase.findUnique({
      where: { id: useCaseId },
    });

    if (!useCase) {
      return NextResponse.json({ 
        status: 'not_available',
        message: 'Use case not found',
        error: 'USE_CASE_NOT_FOUND'
      }, { status: 404 });
    }

    // Check permission
    const hasPermission = userRecord.role === 'QZEN_ADMIN' || 
                         (userRecord.role === 'ORG_ADMIN' && useCase.organizationId === userRecord.organizationId) ||
                         (userRecord.role === 'ORG_USER' && useCase.organizationId === userRecord.organizationId) ||
                         useCase.userId === userRecord.id;

    if (!hasPermission) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Find or create EU AI Act assessment
    let assessment = await prismaClient.euAiActAssessment.findUnique({
      where: { useCaseId },
      include: {
        answers: {
          include: {
            question: true
          }
        },
        controls: {
          include: {
            controlStruct: {
              include: {
                category: true
              }
            },
            subcontrols: {
              include: {
                subcontrolStruct: true
              }
            }
          }
        }
      }
    });

    if (!assessment) {
      // Create new assessment
      assessment = await prismaClient.euAiActAssessment.create({
        data: {
          useCaseId,
          status: 'in_progress',
          progress: 0
        },
        include: {
          answers: {
            include: {
              question: true
            }
          },
          controls: {
            include: {
              controlStruct: {
                include: {
                  category: true
                }
              },
              subcontrols: {
                include: {
                  subcontrolStruct: true
                }
              }
            }
          }
        }
      });
      console.log('[CRUD_LOG] EU AI Act Assessment created:', { id: assessment.id, useCaseId, status: assessment.status, progress: assessment.progress });
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error fetching EU AI Act assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}