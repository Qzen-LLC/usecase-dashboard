import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import redis from '@/lib/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ useCaseId: string }> }
) {
  const { useCaseId } = await params;
  
  try {
    // Redis cache check
    const cacheKey = `eu-ai-act:assessment:by-usecase:${useCaseId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return new NextResponse(cached, { headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
    }

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

    await redis.set(cacheKey, JSON.stringify(assessment), 'EX', 300);
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