import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { assessmentId } = params;
    const { controlId, status, notes, evidenceFiles } = await request.json();

    // Check if framework tables exist
    try {
      await prismaClient.euAiActControl.findFirst();
    } catch (error) {
      return NextResponse.json(
        { error: 'EU AI ACT framework tables not set up' },
        { status: 404 }
      );
    }

    // Upsert the control instance
    const control = await prismaClient.euAiActControl.upsert({
      where: {
        controlId_assessmentId: {
          controlId,
          assessmentId
        }
      },
      update: {
        status,
        notes,
        evidenceFiles,
        updatedAt: new Date()
      },
      create: {
        controlId,
        assessmentId,
        status,
        notes,
        evidenceFiles
      },
      include: {
        controlStruct: {
          include: {
            category: true,
            subcontrols: true
          }
        }
      }
    });

    return NextResponse.json(control);
  } catch (error) {
    console.error('Error saving EU AI ACT control:', error);
    return NextResponse.json(
      { error: 'Failed to save control' },
      { status: 500 }
    );
  }
}