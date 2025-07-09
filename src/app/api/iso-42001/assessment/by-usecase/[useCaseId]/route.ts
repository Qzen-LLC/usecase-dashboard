import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { useCaseId: string } }
) {
  try {
    const { useCaseId } = params;

    // Check if assessment exists, create if not
    let assessment = await prismaClient.iso42001Assessment.findUnique({
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
      // Get all subclauses and annex items to create instances
      const [subclauses, annexItems] = await Promise.all([
        prismaClient.iso42001Subclause.findMany(),
        prismaClient.iso42001AnnexItem.findMany({
          include: {
            category: true
          }
        })
      ]);

      // Create new assessment with all subclause and annex instances
      assessment = await prismaClient.iso42001Assessment.create({
        data: {
          useCaseId,
          status: 'in_progress',
          progress: 0,
          subclauses: {
            create: subclauses.map(subclause => ({
              subclauseId: subclause.subclauseId,
              implementation: '',
              evidenceFiles: [],
              status: 'pending'
            }))
          },
          annexes: {
            create: annexItems.map(item => ({
              itemId: item.itemId,
              implementation: '',
              evidenceFiles: [],
              status: 'pending'
            }))
          }
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
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error fetching ISO 42001 assessment:', error);
    
    // Return a default assessment structure if tables don't exist yet
    return NextResponse.json({
      id: 'temp-' + useCaseId,
      useCaseId,
      status: 'not_available',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subclauses: [],
      annexes: []
    });
  }
}