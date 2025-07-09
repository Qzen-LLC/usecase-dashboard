import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ useCaseId: string }> }
) {
  const { useCaseId } = await params;
  
  try {
    // First check if the use case exists
    const useCase = await prismaClient.useCase.findUnique({
      where: { id: useCaseId }
    });

    if (!useCase) {
      return NextResponse.json({
        id: 'temp-' + useCaseId,
        useCaseId,
        status: 'not_available',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        answers: [],
        controls: []
      });
    }

    // Check if assessment exists, create if not
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
                category: true,
                subcontrols: true
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
                  category: true,
                  subcontrols: true
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
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error fetching EU AI ACT assessment:', error);
    
    // Return a default assessment structure if tables don't exist yet
    return NextResponse.json({
      id: 'temp-' + useCaseId,
      useCaseId,
      status: 'not_available',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      answers: [],
      controls: []
    });
  }
}