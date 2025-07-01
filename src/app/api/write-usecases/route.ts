import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
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
            useCase = await prismaClient.useCase.update({
                where: { id },
                data,
            });
        } else {
            useCase = await prismaClient.useCase.create({
                data: {
                    ...data,
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