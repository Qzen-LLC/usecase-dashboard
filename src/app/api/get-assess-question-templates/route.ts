import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const useCaseId = searchParams.get('useCaseId');

    if (!useCaseId) {
      return NextResponse.json(
        { error: 'useCaseId is required' },
        { status: 400 }
      );
    }

    // Fetch question templates with options and answers
    const templates = await prisma.questionTemplate.findMany({
      where: {
        isInactive: false  // Only fetch active templates
      },
      include: {
        optionTemplates: true,
        // questions: {
        //   include: {
        //     answers: {
        //       where: { useCaseId },  // Get answers for this use case
        //     }
        //   }
        // }
      },
    });

    // Also fetch answers directly connected to templates for this use case
    const templateAnswers = await prisma.answer.findMany({
      where: {
        useCaseId,
        templateId: { not: null }
      }
    });

    // Group answers by templateId
    const answersByTemplateId: Record<string, any[]> = {};
    templateAnswers.forEach(answer => {
      if (answer.templateId) {
        if (!answersByTemplateId[answer.templateId]) {
          answersByTemplateId[answer.templateId] = [];
        }
        answersByTemplateId[answer.templateId].push(answer);
      }
    });

    // Group templates by stage and sort by order index
    const templatesByStage = templates.reduce((acc, template) => {
      const stage = template.stage;
      if (!acc[stage]) {
        acc[stage] = [];
      }
      acc[stage].push(template);
      return acc;
    }, {} as Record<string, typeof templates>);

    // Sort templates within each stage by their order index
    Object.keys(templatesByStage).forEach(stage => {
      templatesByStage[stage].sort((a, b) => {
        const getOrderIndex = (q: any, s: string) => {
          switch (s) {
            case 'TECHNICAL_FEASIBILITY': return q.technicalOrderIndex || 0;
            case 'BUSINESS_FEASIBILITY': return q.businessOrderIndex || 0;
            case 'ETHICAL_IMPACT': return q.ethicalOrderIndex || 0;
            case 'RISK_ASSESSMENT': return q.riskOrderIndex || 0;
            case 'DATA_READINESS': return q.dataOrderIndex || 0;
            case 'ROADMAP_POSITION': return q.roadmapOrderIndex || 0;
            case 'BUDGET_PLANNING': return q.budgetOrderIndex || 0;
            default: return 0;
          }
        };
        return getOrderIndex(a, stage) - getOrderIndex(b, stage);
      });
    });

    // Flatten back to a single array
    const orderedTemplates = Object.values(templatesByStage).flat();

    // Transform the data to match the expected format
    const formattedTemplates = orderedTemplates.map((template: any) => {
      // Get the answer data for this template
      const templateAnswerList = answersByTemplateId[template.id] || [];
      const answerData = templateAnswerList.length > 0 ? templateAnswerList[0].value : null;
      
      let answers = [];
      if (answerData) {
        if (answerData.optionIds && answerData.labels) {
          // For CHECKBOX, RADIO, and RISK questions
          if (template.type === 'RISK') {
            // For RISK questions, create probability and impact answers
            const probLabel = answerData.labels.find((label: string) => label.startsWith('pro:'));
            const impactLabel = answerData.labels.find((label: string) => label.startsWith('imp:'));
            const probOptionId = answerData.optionIds[answerData.labels.findIndex((label: string) => label.startsWith('pro:'))];
            const impactOptionId = answerData.optionIds[answerData.labels.findIndex((label: string) => label.startsWith('imp:'))];
            
            if (probLabel && probOptionId) {
              answers.push({
                id: `${template.id}-probability`,
                value: probLabel,
                questionId: template.id,
                optionId: probOptionId,
              });
            }
            
            if (impactLabel && impactOptionId) {
              answers.push({
                id: `${template.id}-impact`,
                value: impactLabel,
                questionId: template.id,
                optionId: impactOptionId,
              });
            }
          } else {
            // For CHECKBOX and RADIO questions
            answers = answerData.optionIds.map((optionId: string, index: number) => ({
              id: `${template.id}-${optionId}`,
              value: answerData.labels[index],
              questionId: template.id,
              optionId: optionId,
            }));
          }
        } else if (answerData.text) {
          // For TEXT, TEXT_MINI and SLIDER questions
          answers = [{
            id: `${template.id}-${template.type.toLowerCase()}`,
            value: answerData.text,
            questionId: template.id,
          }];
        }
      }

      return {
        id: template.id,
        text: template.text,
        type: template.type,
        stage: template.stage,
        options: template.optionTemplates.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          questionId: template.id,
        })),
        answers: answers,
      };
    });

    return NextResponse.json(formattedTemplates);
  } catch (error) {
    console.error('Error fetching question templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question templates' },
      { status: 500 }
    );
  }
}
