
import { prismaClient } from '@/utils/db';
import { NextResponse } from "next/server";
import { withAuth } from '@/lib/auth-gateway';

export const POST = withAuth(async (
    req: Request,
    { auth }: { auth: any }
) => {
    try {
        // auth context is provided by withAuth wrapper

        // Get user data from database
        const userRecord = await prismaClient.user.findUnique({
            where: { clerkId: auth.userId! },
            include: { organization: true }
        });

        if (!userRecord) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const {
            id,
            title,
            problemStatement,
            proposedAISolution,
            keyBenefits,
            primaryStakeholders,
            secondaryStakeholders,
            currentState,
            desiredState,
            successCriteria,
            problemValidation,
            solutionHypothesis,
            keyAssumptions,
            initialCost,
            initialROI,
            confidenceLevel,
            operationalImpactScore,
            productivityImpactScore,
            revenueImpactScore,
            implementationComplexity,
            estimatedTimeline,
            plannedStartDate,
            estimatedTimelineMonths,
            requiredResources,
            businessFunction,
            stage,
            priority,
        } = await req.json();

        // Validate mandatory fields
        if (!title || !problemStatement) {
            return NextResponse.json({ 
                error: 'Title and Problem Statement are required fields' 
            }, { status: 400 });
        }

        const data = {
            title,
            problemStatement,
            proposedAISolution: proposedAISolution || '',
            currentState: currentState || '',
            desiredState: desiredState || '',
            keyBenefits: keyBenefits || '',
            primaryStakeholders: primaryStakeholders || [],
            secondaryStakeholders: secondaryStakeholders || [],
            successCriteria: successCriteria || '',
            problemValidation: problemValidation || '',
            solutionHypothesis: solutionHypothesis || '',
            keyAssumptions: keyAssumptions || '',
            initialCost: initialCost || '',
            initialROI: initialROI || '',
            confidenceLevel: confidenceLevel || 5,
            operationalImpactScore: operationalImpactScore || 5,
            productivityImpactScore: productivityImpactScore || 5,
            revenueImpactScore: revenueImpactScore || 5,
            implementationComplexity: implementationComplexity || 5,
            estimatedTimeline: estimatedTimeline || '',
            plannedStartDate: plannedStartDate || '',
            estimatedTimelineMonths: estimatedTimelineMonths || '',
            requiredResources: requiredResources || '',
            businessFunction: Array.isArray(businessFunction) ? businessFunction[0] || '' : (businessFunction || ''),
            stage: stage || 'discovery',
            priority: priority || 'MEDIUM',
            updatedAt: new Date(),
        };

        let useCase;
        if (id) {
            // For updates, check if user has permission to update this use case
            const existingUseCase = await prismaClient.useCase.findUnique({
                where: { id },
                include: { organization: true, user: true }
            });

            if (!existingUseCase) {
                return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
            }

            // Check permissions based on role
            if (userRecord.role === 'QZEN_ADMIN') {
                // QZEN_ADMIN cannot edit use cases - they can only view and manage
                return NextResponse.json({ error: 'QZEN_ADMIN users cannot edit use cases' }, { status: 403 });
            } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
                // Org admin and org user can update use cases in their organization
                if (existingUseCase.organizationId !== userRecord.organizationId) {
                    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
                }
            } else {
                // Regular users can only update their own use cases
                if (existingUseCase.userId !== userRecord.id) {
                    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
                }
            }

            useCase = await prismaClient.useCase.update({
                where: { id },
                data,
            });
            console.log('[CRUD_LOG] UseCase updated:', { id: useCase.id, title: useCase.title, updatedAt: useCase.updatedAt, authoredBy: userRecord.id });
        } else {
            // For new use cases, calculate the next aiucId for this user/organization
            let nextAiucId = 1;
            
            if (userRecord.organizationId) {
                // For organization users, get the next aiucId for the organization
                const maxOrgAiucId = await prismaClient.useCase.aggregate({
                    where: { organizationId: userRecord.organizationId },
                    _max: { aiucId: true }
                });
                nextAiucId = (maxOrgAiucId._max.aiucId || 0) + 1;
            } else {
                // For individual users, get the next aiucId for the user
                const maxUserAiucId = await prismaClient.useCase.aggregate({
                    where: { userId: userRecord.id },
                    _max: { aiucId: true }
                });
                nextAiucId = (maxUserAiucId._max.aiucId || 0) + 1;
            }
            
            useCase = await prismaClient.useCase.create({
                data: {
                    ...data,
                    organizationId: userRecord.organizationId,
                    userId: userRecord.id,
                    aiucId: nextAiucId,
                    createdAt: new Date(),
                },
            });
            console.log('[CRUD_LOG] UseCase created:', { id: useCase.id, title: useCase.title, aiucId: useCase.aiucId, createdAt: useCase.createdAt, authoredBy: userRecord.id });
        }

        return NextResponse.json({ success: true, useCase });
    } catch (error) {
        console.error('Error saving use case:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to save use case' },
            { status: 500 }
        );
    }
}, { requireUser: true });