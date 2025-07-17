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
    const cacheKey = `iso-42001:assessment:by-usecase:${useCaseId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return new NextResponse(cached, { headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
    }

    // First check if the use case exists
    const useCase = await prismaClient.useCase.findUnique({
      where: { id: useCaseId },
      select: { id: true, title: true, stage: true }
    });

    if (!useCase) {
      // Return more detailed error information
      return NextResponse.json({
        error: 'USE_CASE_NOT_FOUND',
        message: `Use case with ID "${useCaseId}" does not exist. Please check the use case ID and try again.`,
        useCaseId,
        status: 'not_available',
        suggestions: [
          'Verify the use case ID is correct',
          'Check if the use case exists in the dashboard',
          'Create a new use case if needed'
        ]
      }, { status: 404 });
    }

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
      let subclauses, annexItems;
      
      try {
        [subclauses, annexItems] = await Promise.all([
          prismaClient.iso42001Subclause.findMany(),
          prismaClient.iso42001AnnexItem.findMany({
            include: {
              category: true
            }
          })
        ]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error fetching ISO 42001 framework data:', errorMessage);
        
        return NextResponse.json({
          error: 'FRAMEWORK_NOT_SET_UP',
          message: 'ISO 42001 framework tables are missing or not accessible. Please run the database setup scripts.',
          useCaseId,
          status: 'framework_missing',
          suggestions: [
            'Run iso-42001-subclauses-fixed.sql',
            'Run iso-42001-annex-fixed.sql',
            'Check database permissions',
            'Verify Prisma schema is synced with database'
          ],
          details: errorMessage
        }, { status: 503 });
      }
      
      // Check if framework data exists
      if (!subclauses || subclauses.length === 0) {
        return NextResponse.json({
          error: 'FRAMEWORK_DATA_MISSING',
          message: 'ISO 42001 framework data is not populated. Please run the database setup scripts.',
          useCaseId,
          status: 'framework_missing',
          suggestions: [
            'Run iso-42001-subclauses-fixed.sql to populate subclauses',
            'Run iso-42001-annex-fixed.sql to populate annex data',
            'Check if the SQL scripts executed successfully'
          ]
        }, { status: 503 });
      }
      
      if (!annexItems || annexItems.length === 0) {
        return NextResponse.json({
          error: 'ANNEX_DATA_MISSING',
          message: 'ISO 42001 annex data is not populated. Please run the annex setup script.',
          useCaseId,
          status: 'framework_missing',
          suggestions: [
            'Run iso-42001-annex-fixed.sql to populate annex data',
            'Check if the SQL script executed successfully'
          ]
        }, { status: 503 });
      }

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

    await redis.set(cacheKey, JSON.stringify(assessment), 'EX', 300);
    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error fetching ISO 42001 assessment:', error);
    
    // Check if the error is due to missing ISO 42001 framework tables
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      return NextResponse.json({
        error: 'FRAMEWORK_NOT_SET_UP',
        message: 'ISO 42001 framework tables are not set up. Please run the database setup scripts.',
        useCaseId,
        status: 'framework_missing',
        suggestions: [
          'Run the ISO 42001 setup SQL scripts',
          'Contact your system administrator',
          'Check database schema is properly initialized'
        ]
      }, { status: 503 });
    }
    
    // Other database errors
    return NextResponse.json({
      error: 'DATABASE_ERROR',
      message: 'An error occurred while accessing the database.',
      useCaseId,
      status: 'error',
      details: errorMessage
    }, { status: 500 });
  }
}