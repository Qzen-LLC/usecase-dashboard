import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user data from database
        const userRecord = await prismaClient.user.findUnique({
            where: { clerkId: user.id },
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
            currentState,
            desiredState,
            primaryStakeholders,
            secondaryStakeholders,
            successCriteria,
            problemValidation,
            solutionHypothesis,
            keyAssumptions,
            initialROI,
            confidenceLevel,
            operationalImpactScore,
            productivityImpactScore,
            revenueImpactScore,
            implementationComplexity,
            estimatedTimeline,
            requiredResources,
            businessFunction,
            stage,
            priority,
        } = await req.json();

        const data = {
            title,
            problemStatement,
            proposedAISolution,
            currentState,
            desiredState,
            primaryStakeholders,
            secondaryStakeholders,
            successCriteria,
            problemValidation,
            solutionHypothesis,
            keyAssumptions,
            initialROI,
            confidenceLevel,
            operationalImpactScore,
            productivityImpactScore,
            revenueImpactScore,
            implementationComplexity,
            estimatedTimeline,
            requiredResources,
            businessFunction,
            stage,
            priority,
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
                // QZen admin can update any use case
            } else if (userRecord.role === 'ORG_ADMIN') {
                // Org admin can update use cases in their organization
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
        }

        return NextResponse.json({ success: true, useCase });
    } catch (error) {
        console.error('Error saving use case:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to save use case' },
            { status: 500 }
        );
    }
}