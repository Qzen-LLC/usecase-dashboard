import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        // Pagination
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '0', 10); // 0 = no limit (backward compatible)
        const skip = limit > 0 ? (page - 1) * limit : undefined;
        // Field selection
        const fieldsParam = searchParams.get('fields');
        let select: any = {
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
        };
        if (fieldsParam) {
            const fields = fieldsParam.split(',').map(f => f.trim()).filter(Boolean);
            select = {};
            for (const field of fields) select[field] = true;
        }
        const usecases = await prismaClient.useCase.findMany({
            select,
            skip,
            take: limit > 0 ? limit : undefined
        });
        const response = NextResponse.json(usecases);
        // Add cache headers (60s cache, 5m stale-while-revalidate)
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return response;
    } catch (error) {
        console.error("Error Reading UseCases", error);
        return NextResponse.json(
            { success: false, error: "Failed to read UseCases"},
            { status: 500},
        );
    }
}   