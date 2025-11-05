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

    // Get the organization ID from the use case
    const useCase = await prisma.useCase.findUnique({
      where: { id: useCaseId },
      select: { organizationId: true }
    });

    if (!useCase) {
      return NextResponse.json(
        { error: 'Use case not found' },
        { status: 404 }
      );
    }

    // Fetch questions with options and answers
    let questions = await prisma.question.findMany({
      where: {
        organizationId: useCase.organizationId || undefined,
        isInactive: false  // Only fetch active questions
      },
      include: {
        options: true,
        answers: {
          where: { useCaseId },  // filter to the current useCase
        },
      },
    });

    // Fallback: if no org-specific questions are configured, use templates
    if (!questions || questions.length === 0) {
      const templates = await prisma.questionTemplate.findMany({
        where: { isInactive: false },
        include: { optionTemplates: true },
      });

      const templateAnswers = await prisma.answer.findMany({
        where: { useCaseId, templateId: { not: null } },
      });

      const answersByTemplateId: Record<string, any[]> = {};
      templateAnswers.forEach(answer => {
        if (answer.templateId) {
          if (!answersByTemplateId[answer.templateId]) {
            answersByTemplateId[answer.templateId] = [];
          }
          answersByTemplateId[answer.templateId].push(answer);
        }
      });

      // Map templates into the same shape as questions
      const formattedTemplates = templates.map((template: any) => {
        const answerList = answersByTemplateId[template.id] || [];
        const answerData = answerList.length > 0 ? answerList[0].value : null;

        let answers: any[] = [];
        if (answerData) {
          if (answerData.optionIds && answerData.labels) {
            if (template.type === 'RISK') {
              const probLabel = answerData.labels.find((label: string) => label.startsWith('pro:'));
              const impactLabel = answerData.labels.find((label: string) => label.startsWith('imp:'));
              const probOptionId = answerData.optionIds[answerData.labels.findIndex((label: string) => label.startsWith('pro:'))];
              const impactOptionId = answerData.optionIds[answerData.labels.findIndex((label: string) => label.startsWith('imp:'))];
              if (probLabel && probOptionId) {
                answers.push({ id: `${template.id}-probability`, value: probLabel, questionId: template.id, optionId: probOptionId });
              }
              if (impactLabel && impactOptionId) {
                answers.push({ id: `${template.id}-impact`, value: impactLabel, questionId: template.id, optionId: impactOptionId });
              }
            } else {
              answers = answerData.optionIds.map((optionId: string, index: number) => ({
                id: `${template.id}-${optionId}`,
                value: answerData.labels[index],
                questionId: template.id,
                optionId,
              }));
            }
          } else if (answerData.text) {
            answers = [{ id: `${template.id}-${template.type.toLowerCase()}`, value: answerData.text, questionId: template.id }];
          }
        }

        return {
          id: template.id,
          text: template.text,
          type: template.type,
          stage: template.stage,
          options: template.optionTemplates.map((opt: any) => ({ id: opt.id, text: opt.text, questionId: template.id })),
          answers,
        };
      });

      return NextResponse.json(formattedTemplates);
    }

    // Group questions by stage and sort by order index
    const questionsByStage = questions.reduce((acc, question) => {
      const stage = question.stage;
      if (!acc[stage]) {
        acc[stage] = [];
      }
      acc[stage].push(question);
      return acc;
    }, {} as Record<string, typeof questions>);

    // Sort questions within each stage by their order index
    Object.keys(questionsByStage).forEach(stage => {
      questionsByStage[stage].sort((a, b) => {
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
    const orderedQuestions = Object.values(questionsByStage).flat();

    // Transform the data to match the expected format
    const formattedQuestions = orderedQuestions.map((q: any) => {
      // Get the answer data for this question
      const answerData = q.answers.length > 0 ? q.answers[0].value : null;
      
      let answers = [];
      if (answerData) {
        if (answerData.optionIds && answerData.labels) {
          // For CHECKBOX, RADIO, and RISK questions
          if (q.type === 'RISK') {
            // For RISK questions, create probability and impact answers
            const probLabel = answerData.labels.find((label: string) => label.startsWith('pro:'));
            const impactLabel = answerData.labels.find((label: string) => label.startsWith('imp:'));
            const probOptionId = answerData.optionIds[answerData.labels.findIndex((label: string) => label.startsWith('pro:'))];
            const impactOptionId = answerData.optionIds[answerData.labels.findIndex((label: string) => label.startsWith('imp:'))];
            
            if (probLabel && probOptionId) {
              answers.push({
                id: `${q.id}-probability`,
                value: probLabel,
                questionId: q.id,
                optionId: probOptionId,
              });
            }
            
            if (impactLabel && impactOptionId) {
              answers.push({
                id: `${q.id}-impact`,
                value: impactLabel,
                questionId: q.id,
                optionId: impactOptionId,
              });
            }
          } else {
            // For CHECKBOX and RADIO questions
            answers = answerData.optionIds.map((optionId: string, index: number) => ({
              id: `${q.id}-${optionId}`,
              value: answerData.labels[index],
              questionId: q.id,
              optionId: optionId,
            }));
          }
        } else if (answerData.text) {
          // For TEXT and SLIDER questions
          answers = [{
            id: `${q.id}-${q.type.toLowerCase()}`,
            value: answerData.text,
            questionId: q.id,
          }];
        }
      }

      return {
        id: q.id,
        text: q.text,
        type: q.type,
        stage: q.stage,
        options: q.options.map((o: any) => ({
          id: o.id,
          text: o.text,
          questionId: q.id,
        })),
        answers: answers,
      };
    });

    return NextResponse.json(formattedQuestions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}