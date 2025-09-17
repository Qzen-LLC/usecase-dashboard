import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';
import { QuestionType, Stage } from '@/generated/prisma';

// PUT /api/question-templates/[questionTemplateId] - Update a question template
export async function PUT(
  request: NextRequest,
  { params }: { params: { questionTemplateId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
    });
    
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { questionTemplateId } = params;

    // Check permissions
    if (userRecord.role !== 'QZEN_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { text, type, stage, optionTemplates } = await request.json();

    if (!text || !type || !stage) {
      return NextResponse.json(
        { error: 'Question text, type, and stage are required' },
        { status: 400 }
      );
    }

    // Validate question type
    if (!Object.values(QuestionType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid question type' },
        { status: 400 }
      );
    }

    // Validate stage
    if (!Object.values(Stage).includes(stage)) {
      return NextResponse.json(
        { error: 'Invalid stage' },
        { status: 400 }
      );
    }

    // Check if question template exists
    const existingQuestionTemplate = await prismaClient.questionTemplate.findUnique({
      where: { 
        id: questionTemplateId,
      }
    });

    if (!existingQuestionTemplate) {
      return NextResponse.json(
        { error: 'Question template not found' },
        { status: 404 }
      );
    }

    // For CHECKBOX and RADIO questions, options are required
    if ((type === QuestionType.CHECKBOX || type === QuestionType.RADIO) && (!optionTemplates || optionTemplates.length === 0)) {
      return NextResponse.json(
        { error: 'Options are required for checkbox and radio questions' },
        { status: 400 }
      );
    }

    // Update the question template and its options
    const questionTemplate = await prismaClient.$transaction(async (tx) => {
      // Delete existing options
      await tx.optionTemplate.deleteMany({
        where: { questionTemplateId }
      });

      // Update the question template
      const updatedQuestionTemplate = await tx.questionTemplate.update({
        where: { id: questionTemplateId },
        data: {
          text,
          type,
          stage,
        }
      });

      // Create new options if needed
      if (type === QuestionType.CHECKBOX || type === QuestionType.RADIO) {
        await tx.optionTemplate.createMany({
          data: optionTemplates
            .filter((opt: string) => opt.trim())
            .map((opt: string) => ({
              text: opt.trim(),
              questionTemplateId
            }))
        });
      }

      // Return the updated question template with options
      return await tx.questionTemplate.findUnique({
        where: { id: questionTemplateId },
        include: {
          optionTemplates: true
        }
      });
    });

    return NextResponse.json({ 
      success: true, 
      questionTemplate,
      message: 'Question template updated successfully' 
    });
  } catch (error) {
    console.error('Error updating question template:', error);
    return NextResponse.json(
      { error: 'Failed to update question template' },
      { status: 500 }
    );
  }
}

// DELETE /api/question-templates/[questionTemplateId] - Delete a question template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { questionTemplateId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
    });
    
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { questionTemplateId } = params;

    // Check permissions
    if (userRecord.role !== 'QZEN_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if question template exists
    const existingQuestionTemplate = await prismaClient.questionTemplate.findUnique({
      where: { 
        id: questionTemplateId,
      }
    });

    if (!existingQuestionTemplate) {
      return NextResponse.json(
        { error: 'Question template not found' },
        { status: 404 }
      );
    }

    // Delete the question template (options will be deleted due to cascade)
    await prismaClient.questionTemplate.delete({
      where: { id: questionTemplateId }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Question template deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting question template:', error);
    return NextResponse.json(
      { error: 'Failed to delete question template' },
      { status: 500 }
    );
  }
}
