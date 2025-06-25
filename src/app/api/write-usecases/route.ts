import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
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
        } = body;
        if(id) {
            const useCase = await prismaClient.useCase.upsert({
                where: {
                    id: id,
                },
                update: {
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
                },
                create: {
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
                },
            });
        }
        else {
            const useCase = await prismaClient.useCase.create({
                data: {
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
                },
            });
        }    
        return NextResponse.json({ success: true});
    } catch (error) {
        console.error('Error saving use case:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to save use case' },
            { status: 500 }
        );
    }
}