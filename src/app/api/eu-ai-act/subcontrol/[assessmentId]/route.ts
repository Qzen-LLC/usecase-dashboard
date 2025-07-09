import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { assessmentId } = params;
    const { controlId, subcontrolId, status, notes, evidenceFiles } = await request.json();

    // Check if framework tables exist
    try {
      await prismaClient.euAiActSubcontrol.findFirst();
    } catch (error) {
      return NextResponse.json(
        { error: 'EU AI ACT framework tables not set up' },
        { status: 404 }
      );
    }

    // Find the control instance first
    const controlInstance = await prismaClient.euAiActControl.findUnique({
      where: {
        controlId_assessmentId: {
          controlId,
          assessmentId
        }
      }
    });

    if (!controlInstance) {
      return NextResponse.json(
        { error: 'Control instance not found' },
        { status: 404 }
      );
    }

    // Upsert the subcontrol instance
    const subcontrol = await prismaClient.euAiActSubcontrol.upsert({
      where: {
        subcontrolId_controlId: {
          subcontrolId,
          controlId: controlInstance.id
        }
      },
      update: {
        status,
        notes,
        evidenceFiles,
        updatedAt: new Date()
      },
      create: {
        subcontrolId,
        controlId: controlInstance.id,
        status,
        notes,
        evidenceFiles
      },
      include: {
        subcontrolStruct: true
      }
    });

    return NextResponse.json(subcontrol);
  } catch (error) {
    console.error('Error saving EU AI ACT subcontrol:', error);
    return NextResponse.json(
      { error: 'Failed to save subcontrol' },
      { status: 500 }
    );
  }
}