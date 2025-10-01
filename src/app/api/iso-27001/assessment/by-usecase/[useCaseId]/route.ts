import { NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ useCaseId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { useCaseId } = await params;

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

    // Find or create ISO 27001 assessment
    let assessment = await prismaClient.iso27001Assessment.findUnique({
      where: { useCaseId },
      include: {
        subclauses: {
          include: {
            subclause: true
          }
        },
        annexes: {
          include: {
            item: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    if (!assessment) {
      // Create new assessment
      assessment = await prismaClient.iso27001Assessment.create({
        data: {
          useCaseId,
          status: 'in_progress',
          progress: 0
        },
        include: {
          subclauses: {
            include: {
              subclause: true
            }
          },
          annexes: {
            include: {
              item: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      });
      console.log('[CRUD_LOG] ISO 27001 Assessment created:', { id: assessment.id, useCaseId, status: assessment.status, progress: assessment.progress, authoredBy: userRecord.id });
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error fetching ISO 27001 assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}
