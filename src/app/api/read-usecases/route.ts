import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const usecases = await prismaClient.useCase.findMany({
            select: {
                id: true,
                title: true,
                stage: true,
                priority: true,
                primaryStakeholders: true,
                aiucId: true,
                problemStatement: true,
                proposedAISolution: true,
                currentState: true,
                desiredState: true,
                secondaryStakeholders: true,
                successCriteria: true,
                problemValidation: true,
                solutionHypothesis: true,
                keyAssumptions: true,
                initialROI: true,
                confidenceLevel: true,
                operationalImpactScore: true,
                productivityImpactScore: true,
                revenueImpactScore: true,
                implementationComplexity: true,
                estimatedTimeline: true,
                requiredResources: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return NextResponse.json(usecases);
    } catch (error) {
        console.error("Error Reading UseCases", error);
        return NextResponse.json(
            { success: false, error: "Failed to read UseCases"},
            { status: 500},
        );
    }
}   